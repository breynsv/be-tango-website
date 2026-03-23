# QA Audit — Design Spec

**Date:** 2026-03-23
**Project:** BE-TANGO website rebuild
**Type:** One-time extensive QA audit

---

## Overview

A single Node.js script (`tests/qa-audit.js`) that uses Playwright (Chromium) to crawl all ~70 HTML pages of the BE-TANGO website across three languages (EN, FR, NL), run a battery of checks, and produce an HTML report and a Markdown report.

The audit targets the local dev server at `http://localhost:8002`.

---

## Pages in Scope

All `index.html` files discovered from the filesystem, covering:

- EN: `/`, `/tango-classes/*`, `/blog/*`, `/contact/`, `/links/`, `/privacy-policy/`, `/terms-and-conditions/`
- FR: `/fr/`, `/fr/cours-de-tango/*`, `/fr/blog/*`, `/fr/contactez-nous/`, `/fr/liens/`, `/fr/politique-de-confidentialite/`, `/fr/termes-et-conditions-generales/`
- NL: `/nl/`, `/nl/tangolessen/*`, `/nl/blog/*`, `/nl/contacteer-ons/`, `/nl/links/`, `/nl/privacy-policy/`, `/nl/algemene-voorwaarden/`

---

## Test Categories

### 🔴 Critical

Issues that are broken for all users and should be fixed immediately.

| Test | Method |
|------|--------|
| Page loads (no 404, no crash) | Playwright `goto()` response status |
| Broken internal links | Collect all `<a href>` pointing to same origin, verify each returns 200 |
| Missing / broken images | Intercept network responses for image requests; flag non-200 |
| JS console errors | Listen to `page.on('console')` for `error` level messages |

### 🟠 Warning

Issues that degrade experience or SEO but don't completely break the page.

| Test | Method |
|------|--------|
| Language switcher links | Detect lang switcher `<a>` elements, verify all three language equivalents (EN/FR/NL) return 200 |
| External links | Collect all `<a href>` pointing off-domain; report URLs (not failed — just recorded) |
| Images missing `alt` text | Query `img:not([alt]), img[alt=""]` on each page |
| Empty / `#`-only links | Query `a[href="#"], a:not([href])` |

### 📱 Mobile (375px viewport)

| Test | Method |
|------|--------|
| Horizontal overflow / x-scroll | `document.documentElement.scrollWidth > window.innerWidth` |
| Screenshot | Full-page screenshot saved to `qa-screenshots/<slug>-mobile.png` |
| Small tap targets | Query interactive elements with `getBoundingClientRect()` < 44×44px (reported, not failed) |

### 📐 Tablet (768px viewport)

| Test | Method |
|------|--------|
| Horizontal overflow / x-scroll | Same scrollWidth check at 768px |
| Screenshot | Full-page screenshot saved to `qa-screenshots/<slug>-tablet.png` |

---

## Architecture

### Phase 1 — Page Discovery (~5 sec)

Walk the filesystem from the project root, collect all `index.html` paths, derive URL paths relative to `http://localhost:8002`.

### Phase 2 — Crawl (~5–10 min)

For each page:
1. Open in Chromium at desktop viewport (1440×900) — run Critical + Warning tests
2. Resize to 375×812 — run Mobile tests + screenshot
3. Resize to 768×1024 — run Tablet tests + screenshot

Pages are crawled sequentially to keep memory usage predictable.

### Phase 3 — Report Generation

Aggregate all results into:
- `qa-report.html` — full HTML report with severity colours, screenshots embedded as `<img>` tags referencing the `qa-screenshots/` folder, sorted by severity
- `qa-report.md` — Markdown version with issue tables, suitable for committing or sharing

---

## Report Structure

Both reports follow this structure:

1. **Executive Summary** — totals: pages crawled, critical issues, warnings, mobile issues, tablet issues
2. **🔴 Broken Links** — table: page URL | link href | status code
3. **🔴 Missing Images** — table: page URL | image src | status code
4. **🔴 JS Console Errors** — table: page URL | error message
5. **🟠 Language Switcher Issues** — table: page URL | missing language | expected URL
6. **🟠 Missing Alt Text** — table: page URL | image src
7. **🟠 External Links** — table: page URL | external href (informational)
8. **📱 Mobile Issues** — table: page URL | issue type
9. **📐 Tablet Issues** — table: page URL | issue type
10. **📸 Screenshots** — gallery grid (mobile + tablet side by side per page)
11. **✅ Clean Pages** — list of pages with zero issues

---

## Output Files

```
tests/
  qa-audit.js           ← the test runner (single script)
qa-report.html          ← rich HTML report
qa-report.md            ← markdown report
qa-screenshots/
  index-mobile.png
  index-tablet.png
  blog-history-of-argentine-tango-mobile.png
  blog-history-of-argentine-tango-tablet.png
  … (~140 screenshots total)
```

---

## Dependencies

- `playwright` (via `npm install playwright`) — Chromium browser automation
- Node.js stdlib only for everything else (no additional packages)

Install command: `npm install playwright && npx playwright install chromium`

---

## Running the Audit

```bash
# Ensure local server is running on port 8002, then:
npm install playwright
npx playwright install chromium
node tests/qa-audit.js
```

Opens `qa-report.html` automatically in the default browser when done.

---

## Success Criteria

- All 70 pages crawled without script crash
- HTML report opens in browser and shows all issues grouped by severity
- Markdown report is readable standalone
- Screenshots saved for all pages at both viewports
