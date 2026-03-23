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

  // Phase 3: Generate reports (added in Task 6)
  // generateReports(results);

  console.log(`\nDone! ${results.length} pages crawled.`);
  console.log(`Results in memory — Task 6 will generate the report.`);
})();
