# BE-TANGO Website Correction Plan

> Generated: 2026-03-20
> Based on: SITE_AUDIT.md
> Status: **Awaiting approval**

---

## 🔴 HIGH PRIORITY

---

### Fix 1 — FR topnav: wrong English slugs on French pages

**Problem:** Several FR pages have English slugs in their topnav dropdown links (e.g. `../online/` instead of `../en-ligne/`).

**Root cause confirmed via Grep:** At least 5 FR pages are affected.

**Files to change:**

| File | Wrong link | Correct link |
|------|-----------|--------------|
| `fr/cours-de-tango/particuliers/index.html` | `href="../online/"` | `href="../en-ligne/"` |
| `fr/cours-de-tango/particuliers/index.html` | `href="../../../tango-classes/private/"` | *(already correct language path — check in context)* |
| `fr/cours-de-tango/bruxelles/index.html` | `href="../online/"` (×2) | `href="../en-ligne/"` |
| `fr/cours-de-tango/en-ligne/index.html` | `href="../../../nl/tangolessen/online/"` | `href="../../../nl/tangolessen/online/"` *(NL slug — check)* |
| `fr/cours-de-tango/debutants/index.html` | `href="../../../nl/tangolessen/beginners/"` | `href="../../../nl/tangolessen/beginners/"` *(NL slug — check)* |
| `fr/cours-de-tango/experimentes/index.html` | `href="../../../tango-classes/experienced/"` | *(EN link in lang switcher — check context)* |
| `fr/cours-de-tango/essai-gratuit/index.html` | `href="../../../tango-classes/free-trial/"` | *(EN link in lang switcher — check context)* |

> **Execution note:** Read each file, identify whether the wrong slug is in the topnav dropdown (should use FR slug) or in the language switcher (should use EN slug). Fix topnav dropdown links only. Language switcher links legitimately point to EN/NL equivalents.

---

### Fix 2 — FR Contact page: broken logo path + nav styling

**Problem:** `fr/contactez-nous/index.html` — logo shows as "?" and topnav appears broken.

**Root cause confirmed:** Logo path is `src="../images/logo-be-tango.png"` which resolves to `fr/images/` (non-existent). File is at depth 2 (`fr/contactez-nous/`), so correct path is `../../images/`.

**Files to change:**
- `fr/contactez-nous/index.html`
  - Line ~100: `src="../images/logo-be-tango.png"` → `src="../../images/logo-be-tango.png"`
  - Also audit all other asset paths (JS, CSS, other `<img>`) — CSS uses `../../` correctly, but logo and potentially other assets may use `../`

---

### Fix 3 — NL Contact page: missing hero + contact cards

**Problem:** `nl/contacteer-ons/index.html` lacks the hero image and the 3 info cards (Call us, Email, WhatsApp).

**Root cause confirmed:** The NL page has no `hero hero-subpage` section and no `info-cards-section` — these entire HTML sections are absent.

**Reference:** `contact/index.html` (EN) has both sections.

**Files to change:**
- `nl/contacteer-ons/index.html` — add translated NL versions of:
  1. `<section class="hero hero-subpage">` with hero background image
  2. `<section class="info-cards-section">` with 3 cards (Bel ons / E-mail / WhatsApp)

> **Execution note:** Copy sections from `contact/index.html`, translate to NL, verify image paths use `../../images/`.

> **Also check:** `fr/contactez-nous/index.html` for the same missing sections.

---

### Fix 4 — Footer links: EN homepage pointing to anchors instead of pages

**Problem:** `index.html` footer "Nos Cours" links use `href="tango-classes/index.html#beginners"` — these anchor fragments don't exist and should be direct page links.

**Root cause confirmed:** Footer links target hash fragments (`#beginners`, `#experienced`, etc.) within the tango-classes index instead of linking to the actual sub-pages.

**Files to change:**
- `index.html` — footer course links:

| Current | Correct |
|---------|---------|
| `tango-classes/index.html#beginners` | `tango-classes/beginners/` |
| `tango-classes/index.html#experienced` | `tango-classes/experienced/` |
| `tango-classes/index.html#private` | `tango-classes/private/` |
| `tango-classes/index.html#online` | `tango-classes/online/` |
| `tango-classes/index.html#brussels` | `tango-classes/brussels/` |
| `tango-classes/index.html#woluwe` | `tango-classes/woluwe/` |

> **Note:** NL and FR footers were confirmed correct in the audit — no changes needed there.

---

### Fix 5 — "View All Levels" button: links to non-existent anchor

**Problem:** `tango-classes/index.html` "View All Levels" button has `href="#class-levels"` which scrolls within the same page. The audit requires it to navigate to `tango-classes/experienced/#choose-your-level`.

**Root cause confirmed:**
- The button href `#class-levels` scrolls on the same page (wrong intent)
- `tango-classes/experienced/index.html` has no `id="choose-your-level"` on any element

**Two-step fix:**

1. Add anchor ID to the "Choose Your Level" section in the experienced page
2. Update button href in all 3 language index pages

**Files to change:**

| File | Change |
|------|--------|
| `tango-classes/experienced/index.html` | Add `id="choose-your-level"` to the section containing the "Choose Your Level" heading |
| `tango-classes/index.html` | Button `href="#class-levels"` → `href="experienced/#choose-your-level"` |
| `nl/tangolessen/index.html` | Equivalent button → `href="ervaring/#choose-your-level"` (verify NL slug and anchor) |
| `fr/cours-de-tango/index.html` | Equivalent button → `href="experimentes/#choose-your-level"` (verify FR slug and anchor) |
| `nl/tangolessen/ervaring/index.html` | Add `id="choose-your-level"` to the equivalent section |
| `fr/cours-de-tango/experimentes/index.html` | Add `id="choose-your-level"` to the equivalent section |

---

### Fix 6 — Private lessons CTA section: missing dark background (FR + NL)

**Problem:** The CTA section above the footer on the private lessons pages has no visible background on FR and NL versions.

**Root cause confirmed:** EN page uses `class="bg-dark"`, FR and NL pages use `class="section-cta"` — the `bg-dark` class is missing.

**Files to change:**

| File | Current | Correct |
|------|---------|---------|
| `fr/cours-de-tango/particuliers/index.html` | `<section class="section-cta">` | `<section class="section-cta bg-dark">` |
| `nl/tangolessen/prive/index.html` | `<section class="section-cta">` | `<section class="section-cta bg-dark">` |

---

### Fix 7 — Mobile responsiveness: full site review

**Problem:** Full site not yet verified/optimised for mobile (375px–768px).

**Scope:** All pages in all 3 languages (EN, NL, FR) + all blog posts.

**Approach:** Use browser DevTools responsive mode to audit systematically. Fix CSS in `css/styles.css` and regenerate `css/styles.min.css` after changes.

> **Note:** This is the broadest and most time-consuming fix. Execute last within 🔴 priority, or break into sub-tasks per page section.

---

## 🟡 MEDIUM PRIORITY

---

### Fix 8 — Review "Read more" links: open Google Reviews in new tab

**Problem:** All 3 homepages have `href="#"` on review "Read more" links — non-functional.

**Files to change:**

| File | Element | Change |
|------|---------|--------|
| `index.html` | 3× `<a href="#" class="read-more">Read more</a>` | `href="https://share.google/gEhPWeNVzTLcQS4Yd" target="_blank" rel="noopener noreferrer"` |
| `nl/index.html` | 3× `<a href="#" class="read-more">Lees meer</a>` | same href + `target="_blank" rel="noopener noreferrer"` |
| `fr/index.html` | 3× `<a href="#" class="read-more">Lire la suite</a>` | same href + `target="_blank" rel="noopener noreferrer"` |

---

### Fix 9 — NL Beginners page: two button label corrections

**Problem:** Two buttons on the NL beginners page use slightly unnatural Dutch labels.

**Files to change:**
- `nl/tangolessen/beginners/index.html`
  - `"bekijk rooster"` → `"lessenrooster"`
  - `"bekijk datums"` → `"bekijk data"`

---

## Execution order

```
Fix 1  → FR topnav slugs (multiple FR pages)
Fix 2  → FR Contact logo path
Fix 3  → NL Contact missing sections
Fix 4  → EN footer links
Fix 5  → "View All Levels" button + anchors
Fix 6  → Private lessons CTA background
Fix 7  → Mobile responsiveness (broad)
Fix 8  → Review links → Google Reviews
Fix 9  → NL Beginners button labels
```

---

## Files touched (summary)

| File | Fixes |
|------|-------|
| `index.html` | Fix 4, Fix 8 |
| `nl/index.html` | Fix 8 |
| `fr/index.html` | Fix 8 |
| `tango-classes/index.html` | Fix 5 |
| `tango-classes/experienced/index.html` | Fix 5 |
| `nl/tangolessen/index.html` | Fix 5 |
| `nl/tangolessen/ervaring/index.html` | Fix 5 |
| `nl/tangolessen/beginners/index.html` | Fix 9 |
| `nl/tangolessen/prive/index.html` | Fix 6 |
| `nl/contacteer-ons/index.html` | Fix 3 |
| `fr/cours-de-tango/index.html` | Fix 5 |
| `fr/cours-de-tango/experimentes/index.html` | Fix 5 |
| `fr/cours-de-tango/particuliers/index.html` | Fix 1, Fix 6 |
| `fr/cours-de-tango/bruxelles/index.html` | Fix 1 |
| `fr/cours-de-tango/en-ligne/index.html` | Fix 1 |
| `fr/cours-de-tango/debutants/index.html` | Fix 1 |
| `fr/cours-de-tango/essai-gratuit/index.html` | Fix 1 |
| `fr/contactez-nous/index.html` | Fix 2, Fix 3 |
| `css/styles.css` + `css/styles.min.css` | Fix 7 (if needed) |
