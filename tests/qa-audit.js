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
  const withoutLang = stripped.replace(/^(fr|nl)\//, '') || 'index';
  const slug = withoutLang.replace(/\//g, '-') || 'index';
  return `${lang}-${slug}`;
}

// Test: check that discoverPages finds all index.html files
const pages = discoverPages();
console.log(`Discovered ${pages.length} pages`);
pages.slice(0, 5).forEach(p => console.log(' ', p));
