// tests/qa-audit.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8002';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(PROJECT_ROOT, 'qa-screenshots');
const REPORT_HTML = path.join(PROJECT_ROOT, 'qa-report.html');
const REPORT_MD = path.join(PROJECT_ROOT, 'qa-report.md');

// Phase 1: Discover all pages from filesystem
function discoverPages() {
  const pages = [];

  function walk(dir) {
    const SKIP_DIRS = new Set(['node_modules', 'tests', 'docs', 'design-brainstorm', 'tmp', 'partials', 'pages', 'css', 'js', 'fonts', 'images']);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (dir === PROJECT_ROOT && SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === 'index.html') {
        const rel = path.relative(PROJECT_ROOT, path.dirname(full));
        const urlPath = (rel === '.' || rel === '') ? '/' : '/' + rel.replace(/\\/g, '/') + '/';
        pages.push(urlPath);
      }
    }
  }

  walk(PROJECT_ROOT);
  return pages.sort();
}

// Derive language from URL path
function langFromPath(urlPath) {
  if (urlPath.startsWith('/fr/') || urlPath === '/fr/') return 'fr';
  if (urlPath.startsWith('/nl/') || urlPath === '/nl/') return 'nl';
  return 'en';
}

// Derive screenshot slug from URL path
function slugFromPath(urlPath) {
  const lang = langFromPath(urlPath);
  const stripped = urlPath.replace(/^\//, '').replace(/\/$/, '') || 'index';
  // Remove leading lang prefix (fr/, nl/) since we add it explicitly
  const withoutLang = stripped.replace(/^(fr|nl)(\/|$)/, '') || 'index';
  const slug = withoutLang.replace(/\//g, '-') || 'index';
  return `${lang}-${slug}`;
}

async function checkPage(page, urlPath, issuesBucket) {
  const url = BASE_URL + urlPath;
  const imageFailures = new Set();
  const consoleErrors = [];

  // IMPORTANT: Register listeners BEFORE goto() — events fire during page load
  // and will be missed if registered after goto() returns.
  const onResponse = response => {
    const type = response.request().resourceType();
    if (type === 'image' && response.status() !== 200) {
      imageFailures.add(response.url());
    }
  };
  const onConsole = msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  };
  page.on('response', onResponse);
  page.on('console', onConsole);

  let response;
  try {
    response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (err) {
    page.off('response', onResponse);
    page.off('console', onConsole);
    issuesBucket.critical.push({ type: 'page-load-error', detail: err.message });
    return;
  }

  // Wait briefly for deferred JS errors
  await page.waitForTimeout(500);

  // Remove listeners — all events have fired by networkidle + 500ms
  page.off('response', onResponse);
  page.off('console', onConsole);

  if (!response || response.status() !== 200) {
    issuesBucket.critical.push({ type: 'page-load-error', detail: `HTTP ${response?.status()}` });
    return;
  }

  consoleErrors.forEach(err => {
    issuesBucket.critical.push({ type: 'js-error', detail: err });
  });

  // Broken internal links — resolve to absolute, filter same-origin, fetch
  const hrefs = await page.$$eval('a[href]', els =>
    els.map(el => el.getAttribute('href')).filter(Boolean)
  );

  const baseOrigin = new URL(BASE_URL).origin;
  const checked = new Set();
  for (const href of hrefs) {
    try {
      const resolved = new URL(href, url);
      if (resolved.origin !== baseOrigin) continue;
      if (checked.has(resolved.href)) continue;
      checked.add(resolved.href);

      // Skip anchors-only
      if (resolved.pathname === new URL(url).pathname && resolved.hash) continue;

      const res = await page.request.fetch(resolved.href, { timeout: 10000 }).catch(() => null);
      if (!res || res.status() !== 200) {
        issuesBucket.critical.push({ type: 'broken-link', detail: resolved.href, status: res?.status() ?? 'timeout' });
      }
    } catch (_) {
      // Malformed href, skip
    }
  }

  // Missing/broken images (from response listener above)
  imageFailures.forEach(src => {
    issuesBucket.critical.push({ type: 'missing-image', detail: src });
  });

  // --- WARNING CHECKS ---

  // Language switcher links (.language-dropdown a is the selector used on all pages)
  const langLinks = await page.$$eval('.language-dropdown a', els =>
    els.map(el => ({ href: el.getAttribute('href'), text: el.textContent.trim() }))
  );
  for (const { href, text } of langLinks) {
    if (!href) continue;
    try {
      const resolved = new URL(href, url);
      const res = await page.request.fetch(resolved.href, { timeout: 10000 }).catch(() => null);
      if (!res || res.status() !== 200) {
        issuesBucket.warnings.push({ type: 'lang-switcher-broken', detail: `${text} → ${resolved.href}`, status: res?.status() ?? 'timeout' });
      }
    } catch (_) {}
  }

  // External links (informational — collected but not failed)
  const externalLinks = [];
  for (const href of hrefs) {
    try {
      const resolved = new URL(href, url);
      if (resolved.origin !== baseOrigin && !resolved.href.startsWith('mailto:') && !resolved.href.startsWith('tel:')) {
        externalLinks.push(resolved.href);
      }
    } catch (_) {}
  }
  if (externalLinks.length > 0) {
    issuesBucket.warnings.push({ type: 'external-links', detail: externalLinks });
  }

  // Images missing alt text
  const missingAlt = await page.$$eval('img:not([alt]), img[alt=""]', els =>
    els.map(el => el.getAttribute('src') || '(no src)')
  );
  missingAlt.forEach(src => {
    issuesBucket.warnings.push({ type: 'missing-alt', detail: src });
  });

  // Empty / anchor-only links
  const emptyLinks = await page.$$eval('a[href="#"], a:not([href])', els =>
    els.map(el => el.textContent.trim() || '(no text)')
  );
  emptyLinks.forEach(text => {
    issuesBucket.warnings.push({ type: 'empty-link', detail: text });
  });

  // Missing <title>
  const title = await page.title();
  if (!title || title.trim() === '') {
    issuesBucket.warnings.push({ type: 'missing-title', detail: 'Page has no <title>' });
  }

  // Missing <meta description>
  const metaDesc = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => null);
  if (!metaDesc || metaDesc.trim() === '') {
    issuesBucket.warnings.push({ type: 'missing-meta-description', detail: 'Missing or empty <meta name="description">' });
  }

  // Incorrect <html lang>
  const htmlLang = await page.$eval('html', el => el.getAttribute('lang')).catch(() => null);
  const expectedLang = langFromPath(urlPath);
  if (htmlLang !== expectedLang) {
    issuesBucket.warnings.push({ type: 'wrong-html-lang', detail: `Found lang="${htmlLang}", expected "${expectedLang}"` });
  }
}

async function checkResponsive(page, urlPath, issuesBucket) {
  const url = BASE_URL + urlPath;
  const slug = slugFromPath(urlPath);

  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  // Mobile (375px)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(300);

  const mobileOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  );
  if (mobileOverflow) {
    issuesBucket.mobile.push({ type: 'horizontal-overflow', detail: 'Page overflows horizontally at 375px' });
  }

  // Small tap targets at mobile
  const smallTargets = await page.$$eval(
    'a, button, input, select, textarea',
    els => els.filter(el => {
      const r = el.getBoundingClientRect();
      return (r.width > 0 && r.height > 0) && (r.width < 44 || r.height < 44);
    }).map(el => el.tagName + (el.textContent?.trim().slice(0, 30) || ''))
  );
  if (smallTargets.length > 0) {
    issuesBucket.mobile.push({ type: 'small-tap-targets', detail: `${smallTargets.length} elements below 44×44px`, elements: smallTargets.slice(0, 10) });
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${slug}-mobile.png`), fullPage: true });

  // Tablet (768px)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(300);

  const tabletOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  );
  if (tabletOverflow) {
    issuesBucket.tablet.push({ type: 'horizontal-overflow', detail: 'Page overflows horizontally at 768px' });
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${slug}-tablet.png`), fullPage: true });
}

function generateReports(results) {
  // Aggregate global summaries
  const allBrokenLinks = [];
  const allMissingImages = [];
  const allJsErrors = [];
  const allLangIssues = [];
  const allAltIssues = [];
  const allTitleIssues = [];
  const allLangAttrIssues = [];
  const allMobileIssues = [];
  const allTabletIssues = [];
  const allExternalLinks = [];
  const cleanPages = [];

  for (const r of results) {
    const { urlPath, url, issues } = r;
    let pageHasIssues = false;

    for (const i of issues.critical) {
      pageHasIssues = true;
      if (i.type === 'broken-link') allBrokenLinks.push({ urlPath, url, ...i });
      else if (i.type === 'missing-image') allMissingImages.push({ urlPath, url, ...i });
      else if (i.type === 'js-error') allJsErrors.push({ urlPath, url, ...i });
    }
    for (const i of issues.warnings) {
      if (i.type === 'lang-switcher-broken') { pageHasIssues = true; allLangIssues.push({ urlPath, url, ...i }); }
      else if (i.type === 'missing-alt') { pageHasIssues = true; allAltIssues.push({ urlPath, url, ...i }); }
      else if (i.type === 'missing-title' || i.type === 'missing-meta-description') { pageHasIssues = true; allTitleIssues.push({ urlPath, url, ...i }); }
      else if (i.type === 'wrong-html-lang') { pageHasIssues = true; allLangAttrIssues.push({ urlPath, url, ...i }); }
      else if (i.type === 'external-links') {
        // external-links detail is an array; expand to individual rows
        for (const extUrl of (i.detail || [])) {
          allExternalLinks.push({ urlPath, detail: extUrl });
        }
      }
    }
    for (const i of issues.mobile) { pageHasIssues = true; allMobileIssues.push({ urlPath, url, ...i }); }
    for (const i of issues.tablet) { pageHasIssues = true; allTabletIssues.push({ urlPath, url, ...i }); }

    if (!pageHasIssues) cleanPages.push(urlPath);
  }

  // Deduplicated global broken links summary (unique broken href values)
  const uniqueBrokenLinks = [...new Map(allBrokenLinks.map(r => [r.detail, r])).values()];

  const totalCritical = allBrokenLinks.length + allMissingImages.length + allJsErrors.length;
  const totalWarnings = allLangIssues.length + allAltIssues.length + allTitleIssues.length + allLangAttrIssues.length;
  const totalMobile = allMobileIssues.length;
  const totalTablet = allTabletIssues.length;

  // HTML table helper
  function table(rows, cols) {
    if (rows.length === 0) return '<p style="color:#388e3c">None found.</p>';
    const header = `<tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr>`;
    const body = rows.map(r =>
      `<tr>${cols.map(c => `<td>${String(r[c.key] ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`
    ).join('');
    return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
  }

  // Screenshots gallery
  const screenshotGrid = results.map(r => {
    const slug = slugFromPath(r.urlPath);
    const m = `qa-screenshots/${slug}-mobile.png`;
    const t = `qa-screenshots/${slug}-tablet.png`;
    const mExists = fs.existsSync(path.join(PROJECT_ROOT, m));
    const tExists = fs.existsSync(path.join(PROJECT_ROOT, t));
    return `
      <div class="screenshot-row">
        <div class="screenshot-label">${r.urlPath}</div>
        <div class="screenshot-pair">
          ${mExists ? `<div><div class="vp-label">Mobile 375px</div><img src="${m}" loading="lazy"></div>` : '<div><em>no mobile screenshot</em></div>'}
          ${tExists ? `<div><div class="vp-label">Tablet 768px</div><img src="${t}" loading="lazy"></div>` : '<div><em>no tablet screenshot</em></div>'}
        </div>
      </div>`;
  }).join('');

  // HTML report
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>BE-TANGO QA Audit Report</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #fafafa; color: #222; }
  h1 { color: #b71c1c; }
  h2 { border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 40px; }
  h3 { font-size: 0.95em; color: #666; margin-bottom: 8px; }
  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
  .card { background: #fff; border-radius: 8px; padding: 16px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  .card .count { font-size: 2.5em; font-weight: 700; }
  .card.critical .count { color: #c62828; }
  .card.warning .count { color: #e65100; }
  .card.mobile .count { color: #1565c0; }
  .card.tablet .count { color: #6a1b9a; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 24px; }
  th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 8px 12px; border-top: 1px solid #eee; font-size: 0.9em; word-break: break-all; }
  tr:hover td { background: #fafafa; }
  .screenshot-row { margin-bottom: 32px; }
  .screenshot-label { font-family: monospace; font-size: 0.9em; color: #555; margin-bottom: 8px; }
  .screenshot-pair { display: grid; grid-template-columns: 375px 768px; gap: 24px; }
  .screenshot-pair img { width: 100%; border: 1px solid #ddd; border-radius: 4px; }
  .vp-label { font-size: 0.75em; color: #888; margin-bottom: 4px; }
  .clean-list { columns: 3; list-style: none; padding: 0; }
  .clean-list li::before { content: "\\2705 "; }
  section { margin-bottom: 48px; }
</style>
</head>
<body>
<h1>BE-TANGO QA Audit Report</h1>
<p>Generated: ${new Date().toISOString()} &nbsp;|&nbsp; Pages crawled: ${results.length}</p>

<div class="summary">
  <div class="card critical"><div class="count">${totalCritical}</div><div>Critical</div></div>
  <div class="card warning"><div class="count">${totalWarnings}</div><div>Warnings</div></div>
  <div class="card mobile"><div class="count">${totalMobile}</div><div>Mobile Issues</div></div>
  <div class="card tablet"><div class="count">${totalTablet}</div><div>Tablet Issues</div></div>
</div>

<section>
<h2>Broken Links</h2>
<h3>Unique broken URLs (deduplicated)</h3>
${table(uniqueBrokenLinks, [
  { label: 'Broken href', key: 'detail' },
  { label: 'Status', key: 'status' },
  { label: 'First seen on', key: 'urlPath' }
])}
<h3>All occurrences (per page)</h3>
${table(allBrokenLinks, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Broken href', key: 'detail' },
  { label: 'Status', key: 'status' }
])}
</section>

<section>
<h2>Missing Images</h2>
${table(allMissingImages, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Image URL', key: 'detail' }
])}
</section>

<section>
<h2>JS Console Errors</h2>
${table(allJsErrors, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Error', key: 'detail' }
])}
</section>

<section>
<h2>Language Switcher Issues</h2>
${table(allLangIssues, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Link', key: 'detail' },
  { label: 'Status', key: 'status' }
])}
</section>

<section>
<h2>Missing Alt Text</h2>
${table(allAltIssues, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Image src', key: 'detail' }
])}
</section>

<section>
<h2>Missing Title / Meta Description</h2>
${table(allTitleIssues, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Issue', key: 'detail' }
])}
</section>

<section>
<h2>Incorrect html lang Attribute</h2>
${table(allLangAttrIssues, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Detail', key: 'detail' }
])}
</section>

<section>
<h2>External Links (informational)</h2>
${table(allExternalLinks, [
  { label: 'Page', key: 'urlPath' },
  { label: 'External URL', key: 'detail' }
])}
</section>

<section>
<h2>Mobile Issues (375px)</h2>
${table(allMobileIssues, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Issue', key: 'type' },
  { label: 'Detail', key: 'detail' }
])}
</section>

<section>
<h2>Tablet Issues (768px)</h2>
${table(allTabletIssues, [
  { label: 'Page', key: 'urlPath' },
  { label: 'Issue', key: 'type' },
  { label: 'Detail', key: 'detail' }
])}
</section>

<section>
<h2>Screenshots</h2>
${screenshotGrid}
</section>

<section>
<h2>Clean Pages (${cleanPages.length})</h2>
<ul class="clean-list">${cleanPages.map(p => `<li>${p}</li>`).join('')}</ul>
</section>

</body></html>`;

  fs.writeFileSync(REPORT_HTML, html);

  // Markdown report helper
  function mdTable(rows, cols) {
    if (rows.length === 0) return '_None found._\n';
    const header = '| ' + cols.map(c => c.label).join(' | ') + ' |';
    const sep = '| ' + cols.map(() => '---').join(' | ') + ' |';
    const body = rows.map(r => '| ' + cols.map(c => String(r[c.key] ?? '').replace(/\|/g, '\\|')).join(' | ') + ' |').join('\n');
    return `${header}\n${sep}\n${body}\n`;
  }

  const md = `# BE-TANGO QA Audit Report

Generated: ${new Date().toISOString()}
Pages crawled: ${results.length}

## Summary

| Category | Count |
| --- | --- |
| Critical | ${totalCritical} |
| Warnings | ${totalWarnings} |
| Mobile Issues | ${totalMobile} |
| Tablet Issues | ${totalTablet} |
| Clean Pages | ${cleanPages.length} |

## Broken Links

${mdTable(allBrokenLinks, [{ label: 'Page', key: 'urlPath' }, { label: 'Broken href', key: 'detail' }, { label: 'Status', key: 'status' }])}

## Missing Images

${mdTable(allMissingImages, [{ label: 'Page', key: 'urlPath' }, { label: 'Image URL', key: 'detail' }])}

## JS Console Errors

${mdTable(allJsErrors, [{ label: 'Page', key: 'urlPath' }, { label: 'Error', key: 'detail' }])}

## Language Switcher Issues

${mdTable(allLangIssues, [{ label: 'Page', key: 'urlPath' }, { label: 'Link', key: 'detail' }, { label: 'Status', key: 'status' }])}

## Missing Alt Text

${mdTable(allAltIssues, [{ label: 'Page', key: 'urlPath' }, { label: 'Image src', key: 'detail' }])}

## Missing Title / Meta Description

${mdTable(allTitleIssues, [{ label: 'Page', key: 'urlPath' }, { label: 'Issue', key: 'detail' }])}

## Incorrect html lang Attribute

${mdTable(allLangAttrIssues, [{ label: 'Page', key: 'urlPath' }, { label: 'Detail', key: 'detail' }])}

## External Links (informational)

${mdTable(allExternalLinks, [{ label: 'Page', key: 'urlPath' }, { label: 'External URL', key: 'detail' }])}

## Mobile Issues (375px)

${mdTable(allMobileIssues, [{ label: 'Page', key: 'urlPath' }, { label: 'Issue', key: 'type' }, { label: 'Detail', key: 'detail' }])}

## Tablet Issues (768px)

${mdTable(allTabletIssues, [{ label: 'Page', key: 'urlPath' }, { label: 'Issue', key: 'type' }, { label: 'Detail', key: 'detail' }])}

## Clean Pages

${cleanPages.map(p => `- ${p}`).join('\n')}
`;

  fs.writeFileSync(REPORT_MD, md);

  console.log(`\nReports written:`);
  console.log(`  HTML: ${REPORT_HTML}`);
  console.log(`  MD:   ${REPORT_MD}`);
  console.log(`  Screenshots: ${SCREENSHOTS_DIR}`);
}

(async () => {
  console.log('Starting BE-TANGO QA Audit...');
  console.log(`Target: ${BASE_URL}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Quick server check
  try {
    const res = await page.request.fetch(BASE_URL);
    if (res.status() !== 200) throw new Error(`Server returned ${res.status()}`);
  } catch (err) {
    console.error(`ERROR: Cannot reach ${BASE_URL} — is the local server running?`);
    console.error(err.message);
    await browser.close();
    process.exit(1);
  }

  const pages = discoverPages();
  console.log(`\nDiscovered ${pages.length} pages\n`);

  const results = [];
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  for (let i = 0; i < pages.length; i++) {
    const urlPath = pages[i];
    process.stdout.write(`[${i + 1}/${pages.length}] ${urlPath} ... `);

    const issuesBucket = { critical: [], warnings: [], mobile: [], tablet: [] };

    // Reset page state between pages
    await context.clearCookies();

    // Critical + Warning checks at desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    try {
      await checkPage(page, urlPath, issuesBucket);
    } catch (err) {
      issuesBucket.critical.push({ type: 'check-error', detail: err.message });
    }

    // Mobile + Tablet checks
    try {
      await checkResponsive(page, urlPath, issuesBucket);
    } catch (err) {
      issuesBucket.mobile.push({ type: 'check-error', detail: err.message });
    }

    const totalIssues =
      issuesBucket.critical.length +
      issuesBucket.warnings.length +
      issuesBucket.mobile.length +
      issuesBucket.tablet.length;

    console.log(totalIssues === 0 ? 'OK' : `${totalIssues} issue(s)`);
    results.push({ urlPath, url: BASE_URL + urlPath, issues: issuesBucket });
  }

  await browser.close();

  // Phase 3: Generate reports
  generateReports(results);

  console.log(`\nDone! ${results.length} pages crawled.`);
})();
