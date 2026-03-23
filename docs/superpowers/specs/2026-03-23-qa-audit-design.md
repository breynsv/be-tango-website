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
| Broken internal links | Collect all `<a href>` on the page, resolve each to an absolute URL using the page's current URL as base (via `new URL(href, pageUrl)`), filter to same-origin, then verify each resolved URL returns 200 via `page.request.fetch()`. Raw `href` attribute values must never be fetched without resolution — relative paths like `../` would produce false positives. |
| Missing / broken images | Use `page.on('response')` (passive listener) to capture all image responses as the page loads; flag any with non-200 status. Prefer `page.on('response')` over `page.route()` to avoid interfering with page rendering. |
| JS console errors | Listen to `page.on('console')` for `error` level messages |

### 🟠 Warning

Issues that degrade experience or SEO but don't completely break the page.

| Test | Method |
|------|--------|
| Language switcher links | Query `.language-dropdown a` — the language switcher markup used on all pages. Resolve each href to absolute URL, verify all return 200. |
| External links | Collect all `<a href>` pointing off-domain; report URLs (not failed — just recorded) |
| Images missing `alt` text | Query `img:not([alt]), img[alt=""]` on each page |
| Empty / `#`-only links | Query `a[href="#"], a:not([href])` |
| Missing `<title>` | `document.title === ""` — flag pages with empty or missing title |
| Missing `<meta description>` | `document.querySelector('meta[name="description"]')` — flag pages where absent or content is empty |
| Incorrect `<html lang>` | Compare `document.documentElement.lang` against expected value for the page's language (EN pages → `en`, FR pages → `fr`, NL pages → `nl`); flag mismatches |

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

**Broken link deduplication:** Broken links are reported per-page (i.e. if `/page-a` and `/page-b` both link to the same broken `/page-c`, it appears in both pages' issue lists). A global deduplicated summary is also included at the top of the report.

### Phase 3 — Report Generation

Aggregate all results into:
- `qa-report.html` — full HTML report with severity colours, screenshots embedded as `<img>` tags referencing the `qa-screenshots/` folder, sorted by severity
- `qa-report.md` — Markdown version with issue tables, suitable for committing or sharing

---

## Report Structure

**Screenshot slug generation:** Derive the slug from the URL path by stripping the leading `/`, replacing all remaining `/` with `-`, and removing the trailing `-` if present. Prefix with the language code to avoid collisions between multilingual root pages:
- `/` → `en-index`
- `/fr/` → `fr-index`
- `/nl/` → `nl-index`
- `/blog/history-of-argentine-tango/` → `en-blog-history-of-argentine-tango`
- `/fr/blog/histoire-du-tango-argentin/` → `fr-blog-histoire-du-tango-argentin`

Language prefix is derived from the URL path: starts with `/fr/` → `fr`, starts with `/nl/` → `nl`, otherwise → `en`.

Filenames: `<slug>-mobile.png` and `<slug>-tablet.png`.

Both reports follow this structure:

1. **Executive Summary** — totals: pages crawled, critical issues, warnings, mobile issues, tablet issues
2. **🔴 Broken Links** — table: page URL | link href | status code
3. **🔴 Missing Images** — table: page URL | image src | status code
4. **🔴 JS Console Errors** — table: page URL | error message
5. **🟠 Language Switcher Issues** — table: page URL | missing language | expected URL
6. **🟠 Missing Alt Text** — table: page URL | image src
7. **🟠 Missing Title / Meta Description** — table: page URL | issue (missing title / missing meta description)
8. **🟠 Incorrect `lang` attribute** — table: page URL | found value | expected value
9. **🟠 External Links** — table: page URL | external href (informational)
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
  en-index-mobile.png
  en-index-tablet.png
  fr-index-mobile.png
  nl-index-mobile.png
  en-blog-history-of-argentine-tango-mobile.png
  en-blog-history-of-argentine-tango-tablet.png
  fr-blog-histoire-du-tango-argentin-mobile.png
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

Print the path to `qa-report.html` to the console when done. The developer opens it manually.

---

## Success Criteria

- All 70 pages crawled without script crash
- HTML report opens in browser and shows all issues grouped by severity
- Markdown report is readable standalone
- Screenshots saved for all pages at both viewports
