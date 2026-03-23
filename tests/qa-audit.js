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

async function checkPage(page, urlPath, results) {
  const url = BASE_URL + urlPath;
  const issues = { critical: [], warnings: [], mobile: [], tablet: [] };
  const imageFailures = new Set();
  const consoleErrors = [];

  // IMPORTANT: Register listeners BEFORE goto() — events fire during page load
  // and will be missed if registered after goto() returns.
  page.on('response', response => {
    const type = response.request().resourceType();
    if (type === 'image' && response.status() !== 200) {
      imageFailures.add(response.url());
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Navigate and check page load
  let response;
  try {
    response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (err) {
    issues.critical.push({ type: 'page-load-error', detail: err.message });
    results.push({ urlPath, url, issues });
    return;
  }

  if (!response || response.status() !== 200) {
    issues.critical.push({ type: 'page-load-error', detail: `HTTP ${response?.status()}` });
    results.push({ urlPath, url, issues });
    return;
  }

  consoleErrors.forEach(err => {
    issues.critical.push({ type: 'js-error', detail: err });
  });

  // Broken internal links — resolve to absolute, filter same-origin, fetch
  const hrefs = await page.$$eval('a[href]', els =>
    els.map(el => el.getAttribute('href')).filter(Boolean)
  );

  const checked = new Set();
  for (const href of hrefs) {
    try {
      const resolved = new URL(href, url);
      if (resolved.origin !== new URL(BASE_URL).origin) continue;
      if (checked.has(resolved.href)) continue;
      checked.add(resolved.href);

      // Skip anchors-only
      if (resolved.pathname === new URL(url).pathname && resolved.hash) continue;

      const res = await page.request.fetch(resolved.href, { timeout: 10000 }).catch(() => null);
      if (!res || res.status() === 404) {
        issues.critical.push({ type: 'broken-link', detail: resolved.href, status: res?.status() ?? 'timeout' });
      }
    } catch (_) {
      // Malformed href, skip
    }
  }

  // Missing/broken images (from response listener above)
  imageFailures.forEach(src => {
    issues.critical.push({ type: 'missing-image', detail: src });
  });

  results.push({ urlPath, url, issues, checked });
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = [];
  await checkPage(page, '/', results);

  console.log('Issues on /:', JSON.stringify(results[0].issues, null, 2));

  await browser.close();
})();
