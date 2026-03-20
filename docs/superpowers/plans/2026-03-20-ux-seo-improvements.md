# UX & SEO Homepage Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the top UX and SEO issues identified by the design and SEO audits to improve conversion rate and search visibility for the BE-TANGO website.

**Architecture:** All changes are to static HTML files and CSS. No JavaScript changes needed for any task in this plan. The site has three language variants (EN at `/`, FR at `/fr/`, NL at `/nl/`) — most tasks must be applied to all three homepage files. The CSS changes in `css/styles.css` apply globally and must be followed by regenerating `css/styles.min.css` (see minification note below).

**Tech Stack:** Static HTML5, CSS3 (no preprocessor), vanilla JS (not touched in this plan). Minified CSS is generated via the `npm run minify` script (check `package.json` for exact command).

**Minification note:** After any change to `css/styles.css` or `css/cookie-consent.css`, run the minify script and commit both the source and min file together.

---

## File Map

### Files Modified (SEO tasks)
- `index.html` — title, meta description, hreflang, LCP preload, schema additions, "Argentinian" → "Argentine"
- `fr/index.html` — hreflang, LCP preload, "Argentinian" → "Argentine" (check FR equivalent)
- `nl/index.html` — hreflang, LCP preload
- All sub-pages with multilingual equivalents — hreflang only (see Task 4)

### Files Modified (UX tasks)
- `css/cookie-consent.css` + `css/cookie-consent.min.css` — slim mobile cookie banner
- `css/styles.css` + `css/styles.min.css` — hero ghost button, journey grid centering
- `index.html` — accordion pre-expand, "Argentinian" fix (overlaps with SEO task)
- `fr/index.html` — accordion pre-expand
- `nl/index.html` — accordion pre-expand

### Files Created (UX tasks)
- New instructor section HTML added inline to `index.html`, `fr/index.html`, `nl/index.html`

---

## Task 1: Fix Title Tag and Meta Description (EN Homepage)

**Files:**
- Modify: `index.html` lines 6, 8

**Why:** Title is 50 chars with no geo keyword. Meta description is generic. Both are quick wins for local SEO.

- [ ] **Step 1: Update the title tag**

Replace line 8 in `index.html`:
```html
<title>BE-TANGO – Argentine Tango Classes in Brussels & Woluwe</title>
```

- [ ] **Step 2: Update the meta description**

Replace line 6 in `index.html`:
```html
<meta name="description" content="Learn Argentine tango in Brussels & Woluwe with Sonja & Sven. Beginner to advanced classes, private lessons, and a free trial class. Join 150+ happy students!">
```

- [ ] **Step 3: Verify in browser**

Open http://localhost:8002/ → View Page Source → confirm `<title>` and `<meta name="description">` match the new values.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "seo: improve title tag and meta description with Brussels keyword and free trial CTA"
```

---

## Task 2: Add LCP Hero Image Preload Hints

**Files:**
- Modify: `index.html` lines 4–5 (after viewport meta)
- Modify: `fr/index.html` same location
- Modify: `nl/index.html` same location

**Why:** The hero background image is loaded via CSS, invisible to the browser's preload scanner. This is the single biggest Core Web Vitals risk. Preload hints let the browser fetch the image early.

- [ ] **Step 1: Add preload hints to EN homepage**

In `index.html`, after `<meta name="viewport" ...>` (line 5), add:
```html
  <!-- Preload LCP hero images -->
  <link rel="preload" as="image" href="images/Tango-2048x1365-1.webp"
        media="(min-width: 768px)" fetchpriority="high">
  <link rel="preload" as="image" href="images/Tango-mobile.webp"
        media="(max-width: 767px)" fetchpriority="high">
```

- [ ] **Step 2: Add preload hints to FR homepage**

In `fr/index.html`, after `<meta name="viewport" ...>`, add (note `../images/` path):
```html
  <!-- Preload LCP hero images -->
  <link rel="preload" as="image" href="../images/Tango-2048x1365-1.webp"
        media="(min-width: 768px)" fetchpriority="high">
  <link rel="preload" as="image" href="../images/Tango-mobile.webp"
        media="(max-width: 767px)" fetchpriority="high">
```

- [ ] **Step 3: Add preload hints to NL homepage**

Same as FR (also uses `../images/` relative path).

- [ ] **Step 4: Check image files exist**

```bash
ls -lh "images/Tango-2048x1365-1.webp" "images/Tango-mobile.webp"
```
Expected: both files present and non-zero size.

- [ ] **Step 5: Verify in browser**

Open http://localhost:8002/ → DevTools → Network tab → filter by `Tango-2048` → confirm `Priority: Highest` and that it loads before the CSS finishes parsing.

- [ ] **Step 6: Commit**

```bash
git add index.html fr/index.html nl/index.html
git commit -m "perf: add preload hints for hero LCP images on all three homepages"
```

---

## Task 3: Fix Broken Image + "Argentine" Consistency

**Files:**
- Delete/replace: `images/Tango-mobile-800x800.webp` (0-byte file)
- Modify: `index.html` lines 305, 318 ("Argentinian" → "Argentine")

**Why:** A 0-byte image is a broken asset. "Argentinian" is the non-standard spelling — "Argentine tango" is the universal English convention used everywhere else on the site.

- [ ] **Step 1: Check the broken image**

```bash
ls -lh "images/Tango-mobile-800x800.webp"
```
If it's 0 bytes, check if it's referenced anywhere:
```bash
grep -r "Tango-mobile-800x800" --include="*.html" .
```

- [ ] **Step 2: Remove or replace the broken image**

If unreferenced: `rm "images/Tango-mobile-800x800.webp"`
If referenced: replace with a working copy of `images/Tango-mobile.webp` by duplicating it.

- [ ] **Step 3: Fix "Argentinian" in EN homepage**

In `index.html` line 305, replace:
```html
<p>Discover the basics of Argentinian tango from the comfort of your own home with our free online tango classes.</p>
```
With:
```html
<p>Discover the basics of Argentine tango from the comfort of your own home with our free online tango classes.</p>
```

In `index.html` line 318, replace:
```html
<p class="section-description">Argentinian tango is more than just a dance; it's a passionate journey that enriches your life in multiple ways.</p>
```
With:
```html
<p class="section-description">Argentine tango is more than just a dance; it's a passionate journey that enriches your life in multiple ways.</p>
```

- [ ] **Step 4: Check for "Argentinian" in other HTML files**

```bash
grep -rl "Argentinian" --include="*.html" .
```
Fix any occurrences found in other pages using the same substitution.

- [ ] **Step 5: Commit**

```bash
git add index.html images/
git commit -m "fix: remove broken 0-byte image asset and standardize 'Argentine' spelling"
```

---

## Task 4: Add Schema.org Missing Fields

**Files:**
- Modify: `index.html` lines 59–60 (after `"priceRange": "$$"`)

**Why:** `openingHours` and `email` are key LocalBusiness fields that improve Google Business Profile integration and local pack visibility.

- [ ] **Step 1: Add missing fields to JSON-LD**

In `index.html`, find the JSON-LD block. After `"priceRange": "$$",` add:
```json
    "openingHours": ["Tu-Fr 19:00-22:00", "Sa 10:00-13:00"],
    "email": "admin@be-tango.com",
```

> **Note:** Verify the exact opening hours with Sven before committing — the above is a placeholder based on typical class times.

- [ ] **Step 2: Validate the JSON-LD**

Copy the full `<script type="application/ld+json">` block and paste it into https://validator.schema.org/ — confirm 0 errors.

Alternatively, use the Google Rich Results Test at https://search.google.com/test/rich-results

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "seo: add openingHours and email to DanceSchool JSON-LD schema"
```

---

## Task 5: Add Hreflang Tags — Homepages

**Files:**
- Modify: `index.html`
- Modify: `fr/index.html`
- Modify: `nl/index.html`

**Why:** The site has three language versions with zero cross-referencing. Google may treat them as duplicate content. Hreflang is the most critical structural SEO gap on the site.

**Rule:** The same four `<link rel="alternate" hreflang="...">` tags are placed in the `<head>` of ALL three files — they are identical across all variants.

- [ ] **Step 1: Add hreflang to EN homepage**

In `index.html`, after `<link rel="canonical" href="https://www.be-tango.be/">` (line 9), add:
```html
  <!-- Hreflang: multilingual alternate pages -->
  <link rel="alternate" hreflang="en" href="https://www.be-tango.be/">
  <link rel="alternate" hreflang="fr" href="https://www.be-tango.be/fr/">
  <link rel="alternate" hreflang="nl" href="https://www.be-tango.be/nl/">
  <link rel="alternate" hreflang="x-default" href="https://www.be-tango.be/">
```

- [ ] **Step 2: Add hreflang to FR homepage**

In `fr/index.html`, after `<link rel="canonical" href="https://www.be-tango.be/fr/">`, add the same four tags (identical — this is correct hreflang behavior):
```html
  <!-- Hreflang: multilingual alternate pages -->
  <link rel="alternate" hreflang="en" href="https://www.be-tango.be/">
  <link rel="alternate" hreflang="fr" href="https://www.be-tango.be/fr/">
  <link rel="alternate" hreflang="nl" href="https://www.be-tango.be/nl/">
  <link rel="alternate" hreflang="x-default" href="https://www.be-tango.be/">
```

- [ ] **Step 3: Add hreflang to NL homepage**

Same as Step 2 — in `nl/index.html` after `<link rel="canonical" href="https://www.be-tango.be/nl/">`.

- [ ] **Step 4: Verify**

Open http://localhost:8002/ → View Page Source → search for `hreflang` → confirm all 4 tags present.

- [ ] **Step 5: Commit**

```bash
git add index.html fr/index.html nl/index.html
git commit -m "seo: add hreflang alternate tags to all three homepage language variants"
```

---

## Task 6: Add Hreflang Tags — All Sub-pages

**Files:** All pages below that have multilingual equivalents (~36 HTML files)

**Why:** Hreflang must be on every page, not just the homepage.

**Page mapping (EN → FR → NL):**

| EN | FR | NL |
|----|----|----|
| `tango-classes/index.html` | `fr/cours-de-tango/index.html` | `nl/tangolessen/index.html` |
| `tango-classes/beginners/index.html` | `fr/cours-de-tango/debutants/index.html` | `nl/tangolessen/beginners/index.html` |
| `tango-classes/experienced/index.html` | `fr/cours-de-tango/experimentes/index.html` | `nl/tangolessen/ervaring/index.html` |
| `tango-classes/private/index.html` | `fr/cours-de-tango/particuliers/index.html` | `nl/tangolessen/prive/index.html` |
| `tango-classes/online/index.html` | `fr/cours-de-tango/en-ligne/index.html` | `nl/tangolessen/online/index.html` |
| `tango-classes/workshops/index.html` | `fr/cours-de-tango/ateliers/index.html` | `nl/tangolessen/workshops/index.html` |
| `tango-classes/free-trial/index.html` | `fr/cours-de-tango/essai-gratuit/index.html` | `nl/tangolessen/gratis-proefles/index.html` |
| `tango-classes/brussels/index.html` | `fr/cours-de-tango/bruxelles/index.html` | `nl/tangolessen/brussel/index.html` |
| `tango-classes/woluwe/index.html` | `fr/cours-de-tango/woluwe/index.html` | `nl/tangolessen/woluwe/index.html` |
| `contact/index.html` | `fr/contactez-nous/index.html` | `nl/contacteer-ons/index.html` |
| `links/index.html` | `fr/liens/index.html` | `nl/links/index.html` |
| `blog/index.html` | `fr/blog/index.html` | `nl/blog/index.html` |

**Pattern for each triplet:** Add 4 hreflang tags to all three files. Each file uses the canonical production URL (not localhost).

Example for the `tango-classes/` triplet:
- In `tango-classes/index.html`:
```html
<link rel="alternate" hreflang="en" href="https://www.be-tango.be/tango-classes/">
<link rel="alternate" hreflang="fr" href="https://www.be-tango.be/fr/cours-de-tango/">
<link rel="alternate" hreflang="nl" href="https://www.be-tango.be/nl/tangolessen/">
<link rel="alternate" hreflang="x-default" href="https://www.be-tango.be/tango-classes/">
```
- In `fr/cours-de-tango/index.html`: same 4 tags (identical)
- In `nl/tangolessen/index.html`: same 4 tags (identical)

**Note:** Blog articles — add hreflang only if all three language equivalents exist. If an article exists in only one or two languages, skip it or use only the available language pairs.

- [ ] **Step 1: Work through each page triplet**

Process one triplet at a time. For each:
1. Open all 3 files
2. Find the `<link rel="canonical">` line in each
3. Add the 4 hreflang tags immediately after the canonical

- [ ] **Step 2: Verify one page per group**

```bash
grep -c "hreflang" tango-classes/index.html
```
Expected: 4

- [ ] **Step 3: Commit in batches**

```bash
git add tango-classes/ fr/cours-de-tango/ nl/tangolessen/
git commit -m "seo: add hreflang tags to all tango class sub-pages"

git add contact/ fr/contactez-nous/ nl/contacteer-ons/ links/ fr/liens/ nl/links/
git commit -m "seo: add hreflang tags to contact and links pages"

git add blog/ fr/blog/ nl/blog/
git commit -m "seo: add hreflang tags to blog index pages"
```

---

## Task 7: Fix Cookie Banner Mobile Height

**Files:**
- Modify: `css/cookie-consent.css`
- Regenerate: `css/cookie-consent.min.css`

**Why:** On mobile (375px), the banner stacks vertically and occupies ~40% of the viewport, hiding the hero CTAs on first load.

**Approach:** On mobile, make the banner a slim single-row with Accept and Decline as compact inline links, not full-width stacked buttons.

- [ ] **Step 1: Update the mobile media query in cookie-consent.css**

Find the `@media (max-width: 767px)` block (line 127). Replace the entire block with:

```css
@media (max-width: 767px) {
  .cookie-consent-banner {
    padding: 0.625rem 0.75rem;
  }

  .cookie-consent-container {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.75rem;
  }

  .cookie-consent-text {
    min-width: 0;
    flex: 1;
    padding-right: 0;
  }

  .cookie-consent-text p {
    font-size: 0.75rem;
    line-height: 1.3;
    /* Truncate to one line on very small screens */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cookie-consent-buttons {
    flex-shrink: 0;
    gap: 0.375rem;
    flex-wrap: nowrap;
  }

  .cookie-consent-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }
}

@media (max-width: 400px) {
  /* Keep buttons side by side even at 400px - do NOT stack */
  .cookie-consent-buttons {
    flex-direction: row;
  }
}
```

- [ ] **Step 2: Regenerate the minified CSS**

```bash
npm run minify
```
Or check `package.json` for the exact command. Verify `css/cookie-consent.min.css` is updated.

- [ ] **Step 3: Verify in browser**

Open http://localhost:8002/ in DevTools → set device to iPhone SE (375×667) → confirm the cookie banner is a single slim row at the bottom (max ~55px tall) and both hero CTA buttons are visible above it.

- [ ] **Step 4: Commit**

```bash
git add css/cookie-consent.css css/cookie-consent.min.css
git commit -m "ux: slim cookie banner to single row on mobile to stop blocking hero CTAs"
```

---

## Task 8: Fix Hero "View Courses" Button — Ghost Style

**Files:**
- Modify: `css/styles.css`
- Regenerate: `css/styles.min.css`

**Why:** Both hero CTAs have the same visual weight (white solid block). The secondary should be a ghost/outline to establish clear hierarchy: gold = act now, ghost = explore.

**Approach:** Create a hero-specific override for `.btn-secondary`. This avoids breaking the white secondary button style used in other contexts (light sections).

- [ ] **Step 1: Find the hero CTA section in styles.css**

Search for `.hero-cta` — the buttons inside it are `.btn.btn-secondary.btn-large`.

- [ ] **Step 2: Add a hero-context override**

Find the existing `.btn-secondary` block (around line 243) and add a new hero-specific rule after it:

```css
/* Ghost secondary button when used inside the hero section */
.hero .btn-secondary {
  background-color: transparent;
  color: var(--color-white);
  border-color: rgba(255, 255, 255, 0.8);
}

.hero .btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  border-color: var(--color-white);
}
```

- [ ] **Step 3: Regenerate the minified CSS**

```bash
npm run minify
```

- [ ] **Step 4: Verify in browser**

Open http://localhost:8002/ → confirm "VIEW COURSES" button is now transparent with a white border, while "BOOK A FREE TRIAL" remains gold. Check hover states on both.

- [ ] **Step 5: Commit**

```bash
git add css/styles.css css/styles.min.css
git commit -m "ux: hero secondary CTA to ghost/outline style to establish CTA hierarchy"
```

---

## Task 9: Fix Journey Cards Orphan Row

**Files:**
- Modify: `css/styles.css`
- Regenerate: `css/styles.min.css`

**Why:** 5 cards in a 3-column grid produces a 2-card orphan bottom row that leaves an empty third column, looking unfinished.

**Approach:** Center the orphan row using CSS Grid `justify-items` on the last two children, or wrap the grid with `justify-content: center`. The cleanest CSS-only solution is to use the `:nth-child` selector to center the 4th and 5th items.

- [ ] **Step 1: Add orphan centering rules to styles.css**

After the existing `.grid-3` desktop rule (around line 937), add:

```css
/* Center orphan cards when grid-3 has 5 items (3+2 layout) */
.journey-grid .journey-card:nth-child(4),
.journey-grid .journey-card:nth-child(5) {
  /* When they wrap to a second row of 2 in a 3-col grid,
     nudge them toward center using grid placement */
}

@media (min-width: 1024px) {
  .journey-grid {
    /* Use auto-fit so cards fill naturally, then justify center */
    justify-content: center;
  }

  .journey-grid .journey-card:nth-child(4) {
    grid-column-start: 1;
    margin-left: calc(50% + var(--spacing-xl) / 2);
  }
}
```

> **Note:** This approach is brittle. The cleanest fix is to switch `.journey-grid` from `grid-3` to `auto-fill`:

```css
@media (min-width: 1024px) {
  .journey-grid {
    grid-template-columns: repeat(3, minmax(0, 340px));
    justify-content: center;
  }
}
```

This makes all 5 cards max 340px wide, centered. The bottom 2 cards center naturally without any `nth-child` hacks.

- [ ] **Step 2: Regenerate minified CSS**

```bash
npm run minify
```

- [ ] **Step 3: Verify**

Open http://localhost:8002/ at 1440px width → confirm the 5 journey cards show 3 on row 1, 2 centered on row 2 with equal space on both sides.

- [ ] **Step 4: Commit**

```bash
git add css/styles.css css/styles.min.css
git commit -m "ux: center orphan journey cards in 3-column grid on desktop"
```

---

## Task 10: Pre-expand First Accordion Item

**Files:**
- Modify: `index.html` line 322
- Modify: `fr/index.html` (same `<details>` tag for the first accordion item)
- Modify: `nl/index.html` (same)

**Why:** All 5 accordion items are collapsed by default. A first-time visitor who doesn't click sees zero content in this section. Pre-expanding the first item immediately demonstrates value.

- [ ] **Step 1: Add `open` attribute to first accordion item in EN homepage**

In `index.html` line 322, replace:
```html
          <details class="accordion-item">
```
With:
```html
          <details class="accordion-item" open>
```
(Only the FIRST `<details>` tag — the others stay closed.)

- [ ] **Step 2: Do the same in FR and NL homepages**

Find the first `<details class="accordion-item">` in each file and add `open`.

- [ ] **Step 3: Verify**

Open http://localhost:8002/ → scroll to "Why Choose BE-TANGO?" section → confirm "A Vibrant Social Dance Community" is pre-expanded and readable. Confirm clicking it collapses it and others can be expanded.

- [ ] **Step 4: Commit**

```bash
git add index.html fr/index.html nl/index.html
git commit -m "ux: pre-expand first accordion item so section has visible content on load"
```

---

## Task 11: Add Instructor Section — EN Homepage

**Files:**
- Modify: `index.html` — add new section after the journey cards section (after line 311)
- Modify: `css/styles.css` — add instructor section styles
- Regenerate: `css/styles.min.css`

**Why:** Testimonials praise "Sonja & Sven" by name but there's no instructor introduction on the homepage. This is a major trust gap for a high-personal-relationship purchase like dance classes.

**What's needed:** Two instructor cards with headshots (use existing photos if available, otherwise placeholder), name, short title, and 2–3 sentence bio.

- [ ] **Step 1: Check for existing instructor photos**

```bash
ls images/ | grep -i "sonja\|sven\|instructor\|teacher"
```

If photos exist, use them. If not, use `images/tango-classes-in-Brussels-2-e1740646913571.webp` as a temporary placeholder until real headshots are available.

- [ ] **Step 2: Add CSS for instructor section to styles.css**

Add after the journey-card styles:

```css
/* Instructor Section */
.instructor-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

@media (min-width: 640px) {
  .instructor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.instructor-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: var(--box-shadow);
}

.instructor-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid var(--color-secondary);
}

.instructor-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.instructor-info .instructor-title {
  color: var(--color-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem;
}

.instructor-info p {
  font-size: 0.9rem;
  color: var(--color-text-light);
  margin: 0;
  line-height: 1.6;
}
```

- [ ] **Step 3: Add HTML section to EN homepage**

In `index.html`, after the closing `</section>` of the journey cards (after line 311), insert:

```html
    <!-- Instructor Section -->
    <section>
      <div class="container">
        <div class="section-header">
          <p class="section-label">YOUR TEACHERS</p>
          <h2>Meet Sonja & Sven</h2>
          <p class="section-description">The passionate duo behind BE-TANGO — teaching Argentine tango in Brussels for over 15 years.</p>
        </div>

        <div class="instructor-grid">
          <div class="instructor-card">
            <img class="instructor-photo" src="images/tango-classes-in-Brussels-2-e1740646913571.webp" alt="Sonja - Argentine Tango Instructor at BE-TANGO" width="100" height="100" loading="lazy">
            <div class="instructor-info">
              <h3>Sonja</h3>
              <p class="instructor-title">Lead Instructor</p>
              <p>Sonja brings warmth and precision to every class. Her teaching style focuses on musicality and connection, making tango accessible to complete beginners while challenging experienced dancers to grow.</p>
            </div>
          </div>

          <div class="instructor-card">
            <img class="instructor-photo" src="images/tango-classes-in-Brussels-2-e1740646913571.webp" alt="Sven - Argentine Tango Instructor at BE-TANGO" width="100" height="100" loading="lazy">
            <div class="instructor-info">
              <h3>Sven</h3>
              <p class="instructor-title">Lead Instructor</p>
              <p>Sven's technical expertise and playful energy create a relaxed learning environment. He specialises in lead-follow dynamics, helping couples develop a true conversation on the dance floor.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
```

> **Important:** Replace the placeholder photos with real headshots of Sonja and Sven. Replace the bio text with accurate descriptions once confirmed with them.

- [ ] **Step 4: Regenerate minified CSS**

```bash
npm run minify
```

- [ ] **Step 5: Verify**

Open http://localhost:8002/ → scroll below journey cards → confirm instructor section displays with photos, names, and bios. Check on mobile (375px) — cards should stack vertically.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css css/styles.min.css
git commit -m "ux: add instructor introduction section to EN homepage"
```

---

## Task 12: Add Instructor Section — FR and NL Homepages

**Files:**
- Modify: `fr/index.html`
- Modify: `nl/index.html`

**Why:** The instructor section from Task 11 must be translated for FR and NL visitors. CSS changes are already global from Task 11.

- [ ] **Step 1: Add French version to fr/index.html**

Insert the same HTML structure after the journey cards section, with French text:

```html
    <!-- Instructor Section -->
    <section>
      <div class="container">
        <div class="section-header">
          <p class="section-label">VOS PROFESSEURS</p>
          <h2>Rencontrez Sonja & Sven</h2>
          <p class="section-description">Le duo passionné derrière BE-TANGO — enseignant le tango argentin à Bruxelles depuis plus de 15 ans.</p>
        </div>

        <div class="instructor-grid">
          <div class="instructor-card">
            <img class="instructor-photo" src="../images/tango-classes-in-Brussels-2-e1740646913571.webp" alt="Sonja - Professeure de tango argentin chez BE-TANGO" width="100" height="100" loading="lazy">
            <div class="instructor-info">
              <h3>Sonja</h3>
              <p class="instructor-title">Professeure principale</p>
              <p>Sonja apporte chaleur et précision à chaque cours. Sa pédagogie met l'accent sur la musicalité et la connexion, rendant le tango accessible aux débutants tout en challengeant les danseurs expérimentés.</p>
            </div>
          </div>

          <div class="instructor-card">
            <img class="instructor-photo" src="../images/tango-classes-in-Brussels-2-e1740646913571.webp" alt="Sven - Professeur de tango argentin chez BE-TANGO" width="100" height="100" loading="lazy">
            <div class="instructor-info">
              <h3>Sven</h3>
              <p class="instructor-title">Professeur principal</p>
              <p>L'expertise technique et l'énergie enjouée de Sven créent un environnement d'apprentissage détendu. Il se spécialise dans la dynamique meneur-suiveur pour développer un vrai dialogue sur la piste.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Add Dutch version to nl/index.html**

```html
    <!-- Instructor Section -->
    <section>
      <div class="container">
        <div class="section-header">
          <p class="section-label">UW LERAARS</p>
          <h2>Maak kennis met Sonja & Sven</h2>
          <p class="section-description">Het gepassioneerde duo achter BE-TANGO — al meer dan 15 jaar tango lerend in Brussel.</p>
        </div>

        <div class="instructor-grid">
          <div class="instructor-card">
            <img class="instructor-photo" src="../images/tango-classes-in-Brussels-2-e1740646913571.webp" alt="Sonja - Argentijnse tango lerares bij BE-TANGO" width="100" height="100" loading="lazy">
            <div class="instructor-info">
              <h3>Sonja</h3>
              <p class="instructor-title">Hoofdlerares</p>
              <p>Sonja brengt warmte en precisie in elke les. Haar aanpak focust op musicaliteit en verbinding, waardoor tango toegankelijk is voor absolute beginners maar ook gevorderde dansers uitdaagt.</p>
            </div>
          </div>

          <div class="instructor-card">
            <img class="instructor-photo" src="../images/tango-classes-in-Brussels-2-e1740646913571.webp" alt="Sven - Argentijnse tango leraar bij BE-TANGO" width="100" height="100" loading="lazy">
            <div class="instructor-info">
              <h3>Sven</h3>
              <p class="instructor-title">Hoofdleraar</p>
              <p>Svens technische expertise en speelse energie scheppen een ontspannen leeromgeving. Hij specialiseert zich in leider-volger dynamiek om koppels een echte dialoog op de dansvloer te laten ontwikkelen.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Verify both FR and NL pages**

Open http://localhost:8002/fr/ and http://localhost:8002/nl/ — confirm instructor section renders correctly in both languages.

- [ ] **Step 4: Commit**

```bash
git add fr/index.html nl/index.html
git commit -m "ux: add translated instructor sections to FR and NL homepages"
```

---

## Summary — Priority Order

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 5 | Hreflang — homepages | SEO Critical | Low |
| 6 | Hreflang — all sub-pages | SEO Critical | Medium |
| 2 | LCP hero preload | Perf Critical | Trivial |
| 1 | Title tag + meta description | SEO High | Trivial |
| 7 | Cookie banner mobile fix | UX High | Low |
| 10 | Accordion pre-expand | UX Medium | Trivial |
| 8 | Ghost secondary CTA | UX Medium | Low |
| 9 | Journey cards orphan row | UX Medium | Low |
| 3 | Broken image + "Argentine" fix | SEO/Quality | Low |
| 4 | Schema openingHours + email | SEO Medium | Low |
| 11 | Instructor section EN | UX Medium | Medium |
| 12 | Instructor section FR/NL | UX Medium | Low |

> **Prerequisite for Task 11/12:** Real headshot photos of Sonja and Sven, and approved bio text from them.
