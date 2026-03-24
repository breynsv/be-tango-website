# BE-TANGO Rebuild — Todo

Quick modifications to be done on the rebuild website.

> **Rule — execution:** Only execute changes when explicitly asked. Never fix proactively.
> **Rule — tracking:** After completing a change, mark it as done `[x]` in this file so only newly added items get picked up next run.
> **Rule — languages:** Every fix must be applied to **all three language versions** of the affected page (EN / NL / FR), unless otherwise noted.

---

## Pending

- [ ] **Blog overview — not OK on mobile (all languages)**
  - **Where:** Blog index pages in all three languages:
    - `blog/index.html` (EN)
    - `nl/blog/index.html` (NL)
    - `fr/blog/index.html` (FR)
  - **Issue:** Blog overview layout is broken or not rendering correctly on mobile screens.
  - **Applies to:** All three language versions.

- [ ] **Blog post — related post cards should use correct post images**
  - **Where:** All single blog post pages (EN/NL/FR) — the "related posts" cards shown below the article.
  - **Issue:** The images in the related post cards do not match the actual posts they link to. They should use the same images as shown on those posts in the blog overview.
  - **Applies to:** All three language versions of all blog posts.

- [ ] **Blog overview — add newsletter signup form (all languages)**
  - **Where:** Blog index pages in all three languages:
    - `blog/index.html` (EN)
    - `nl/blog/index.html` (NL)
    - `fr/blog/index.html` (FR)
  - **Issue:** The blog overview pages have no newsletter signup form. Use the exact same form as used in the single blog post pages (sidebar or inline newsletter block).
  - **Applies to:** All three language versions.

- [ ] **Top nav — "Blog" link missing on contact page (check other pages too)**
  - **Where:** Contact pages in all three languages:
    - `contact/index.html` (EN)
    - `nl/contact/index.html` (NL)
    - `fr/contact/index.html` (FR)
  - **Issue:** The top nav on all contact pages is missing a link to the Blog section. Other pages should also be checked for the same omission.
  - **Applies to:** All three language versions; verify other pages too.

- [x] **Blog sidebar — newsletter box should appear below contact card**
  - **Where:** All blog post pages, e.g.:
    - `nl/blog/de-geschiedenis-van-de-argentijnse-tango/` → EN/FR equivalents
  - **Issue:** The newsletter subscribe box is currently positioned above the contact card in the sidebar. It should be moved to appear *below* the contact card so it's more visible and the contact card takes priority.
  - **Applies to:** All three language versions of all blog posts (EN / NL / FR).

- [x] **Highlight text — change from underlined to italic**
  - **Where:** Sitewide — the `.highlight` CSS class is used across all pages (homepages, class pages, contact, blog pages).
  - **Issue:** Yellow highlighted text (e.g. "in Brussels & Woluwe" in the hero heading) currently has `text-decoration: underline`. Should be `font-style: italic` with no underline.
  - **Fix:** In `css/styles.css` (and rebuild `.min.css`), change the `.highlight` rule:
    - Remove: `text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px;`
    - Add: `font-style: italic;`
  - **Scope:** Single CSS change — automatically applies to all ~30+ uses of `.highlight` across EN/NL/FR pages.

- [x] **Blog language switcher — wrong links on NL and FR posts**
  - **Where:** All NL and FR blog posts. EN posts are all correct.
  - **Issue:** Language switcher in the topnav should link to the translated version of the current post. Most NL posts link to `../../` (homepage) instead of the correct EN/FR blog post. Several FR posts have wrong slugs for NL/EN links.
  - **Translation mapping:**
    - NL `waarom-tango-leren-dansen` = EN `why-learn-tango` = FR `pourquoi-apprendre-le-tango`
    - NL `5-tips-voor-de-beste-tangoschoenen` = EN `5-tips-best-tango-shoes` = FR `conseils-pour-chaussures-de-tango`
    - NL `argentijnse-tango-vs-ballroomtango-de-verschillen-en-gelijkenissen` = EN `argentine-tango-ballroom-tango-differences` = FR `tango-argentin-vs-tango-de-salon`
    - NL `de-verschillende-dansstijlen-van-de-argentijnse-tango` = EN `different-styles-of-argentine-tango` = FR `les-differents-styles-du-tango-argentin`
    - NL `de-geschiedenis-van-de-argentijnse-tango` = EN `history-of-argentine-tango` = FR `histoire-du-tango-argentin`
    - NL `internationale-milongas-en-tango-evenementen` = EN `international-tango-events` = FR `evenements-de-tango-internationaux`
    - NL `tango-evenementen-in-brussel-en-omstreken` = EN `tango-events-brussels` = FR `evenements-de-tango-a-bruxelles`
    - NL `het-verschil-tussen-tango-vals-en-milonga` = *(no EN)* = FR `difference-entre-tango-valse-et-milonga`
    - NL `tango-woordenboek` = *(no EN)* = FR `dictionnaire-de-tango`
  - **Files to fix — NL posts** (EN link → `../../../blog/[slug]/`, FR link → `../../../fr/blog/[slug]/`):
    - `nl/blog/de-verschillende-dansstijlen-van-de-argentijnse-tango/` — EN: `../../` → `../../../blog/different-styles-of-argentine-tango/`; FR: `../../fr/` → `../../../fr/blog/les-differents-styles-du-tango-argentin/`
    - `nl/blog/de-geschiedenis-van-de-argentijnse-tango/` — EN: `../../` → `../../../blog/history-of-argentine-tango/`; FR: `../../fr/` → `../../../fr/blog/histoire-du-tango-argentin/`
    - `nl/blog/internationale-milongas-en-tango-evenementen/` — EN: `../../` → `../../../blog/international-tango-events/`; FR: `../../fr/` → `../../../fr/blog/evenements-de-tango-internationaux/`
    - `nl/blog/tango-evenementen-in-brussel-en-omstreken/` — EN: `../../` → `../../../blog/tango-events-brussels/`; FR: `../../fr/` → `../../../fr/blog/evenements-de-tango-a-bruxelles/`
    - `nl/blog/5-tips-voor-de-beste-tangoschoenen/` — FR: wrong slug → `../../../fr/blog/conseils-pour-chaussures-de-tango/`
    - `nl/blog/argentijnse-tango-vs-ballroomtango-de-verschillen-en-gelijkenissen/` — FR: wrong slug → `../../../fr/blog/tango-argentin-vs-tango-de-salon/`
    - `nl/blog/het-verschil-tussen-tango-vals-en-milonga/` — FR: wrong → `../../../fr/blog/difference-entre-tango-valse-et-milonga/`; EN: hide or link to `/blog/`
    - `nl/blog/tango-woordenboek/` — FR: wrong → `../../../fr/blog/dictionnaire-de-tango/`; EN: hide or link to `/blog/`
  - **Files to fix — FR posts** (NL link → `../../../nl/blog/[slug]/`, EN link → `../../../blog/[slug]/`):
    - `fr/blog/pourquoi-apprendre-le-tango/` — NL: wrong slug → `../../../nl/blog/waarom-tango-leren-dansen/`
    - `fr/blog/conseils-pour-chaussures-de-tango/` — NL: wrong slug → `../../../nl/blog/5-tips-voor-de-beste-tangoschoenen/`
    - `fr/blog/tango-argentin-vs-tango-de-salon/` — EN: wrong slug → `../../../blog/argentine-tango-ballroom-tango-differences/`; NL: wrong slug → `../../../nl/blog/argentijnse-tango-vs-ballroomtango-de-verschillen-en-gelijkenissen/`
    - `fr/blog/les-differents-styles-du-tango-argentin/` — EN: wrong slug → `../../../blog/different-styles-of-argentine-tango/`; NL: wrong slug → `../../../nl/blog/de-verschillende-dansstijlen-van-de-argentijnse-tango/`
    - `fr/blog/histoire-du-tango-argentin/` — NL: wrong slug → `../../../nl/blog/de-geschiedenis-van-de-argentijnse-tango/`
    - `fr/blog/evenements-de-tango-internationaux/` — NL: wrong slug → `../../../nl/blog/internationale-milongas-en-tango-evenementen/`
    - `fr/blog/evenements-de-tango-a-bruxelles/` — NL: wrong slug → `../../../nl/blog/tango-evenementen-in-brussel-en-omstreken/`
    - `fr/blog/dictionnaire-de-tango/` — NL: wrong → `../../../nl/blog/tango-woordenboek/`; EN: hide or link to `/blog/`
    - `fr/blog/difference-entre-tango-valse-et-milonga/` — NL: wrong → `../../../nl/blog/het-verschil-tussen-tango-vals-en-milonga/`; EN: hide or link to `/blog/`
  - **Note on posts without EN equivalent:** `tango-woordenboek`, `het-verschil-tussen-tango-vals-en-milonga`, `dictionnaire-de-tango`, `difference-entre-tango-valse-et-milonga` — decide whether to hide the EN option or link to `/blog/`.

- [x] **Calendar icon — move to right of end time (not next to sign up button)**
  - **Where:** Location-specific class pages:
    - `tango-classes/brussels/` → `nl/tangolessen/brussel/` (no FR equivalent)
    - `tango-classes/woluwe/` → `nl/tangolessen/woluwe/` → `fr/cours-de-tango/woluwe/`
  - **Issue:** The calendar icon button was placed next to the SIGN UP button in `.lsched-actions`. It should appear immediately after the end time in the time row (e.g. `MON 19:00 – 20:00 [📅]`).
  - **Fix:** Append calendar button to `.lsched-time-row` instead of `.lsched-actions`; changed `align-items:baseline` → `align-items:center` on `.lsched-time-row`.

- [x] **Registration form — "no partner" message missing padding**
  - **Where:** Enrollment modal on paid lesson pages, e.g.:
    - `nl/tangolessen/ervaring/` → EN: `tango-classes/experienced/` → FR: `fr/cours-de-tango/experimentes/`
    - `nl/tangolessen/beginners/` → EN: `tango-classes/beginners/` → FR: `fr/cours-de-tango/debutants/`
  - **Issue:** When registering without a partner, the confirmation message text ("Omdat u op zoek bent naar een danspartner…") touches the left/right edges of the modal — it needs horizontal padding so it doesn't bleed to the modal border.
  - **File to fix:** `js/enrollment-modal.js` (and `.min.js`) — add padding/margin to the no-partner message container.

- [x] **Registration form — field alignment in 2-column grid**
  - **Where:** Registration/enrollment modal on:
    - `nl/tangolessen/beginners/` → EN: `tango-classes/beginners/` → FR: `fr/cours-de-tango/debutants/`
    - `nl/tangolessen/gratis-proefles/` → EN: `tango-classes/free-trial/` → FR: `fr/cours-de-tango/essai-gratuit/`
    - `nl/tangolessen/ervaring/` → EN: `tango-classes/experienced/` → FR: `fr/cours-de-tango/experimentes/`
  - **Issue:** In the 2-column grid layout, the right-column label (e.g. GEBOORTEJAAR, ACHTERNAAM PARTNER) starts lower than the left-column label (e.g. LENGTE, VOORNAAM PARTNER). The label and input of the right column appear vertically offset/shifted down relative to the left column.
  - **File to fix:** `js/enrollment-modal.js` (and `.min.js`) — the grid/field CSS or HTML structure in the modal form.
  - **Applies to:** "Come alone" section (LENGTE + GEBOORTEJAAR row) and "Come with partner" section (VOORNAAM + ACHTERNAAM PARTNER row).

- [ ] **Workshops page — create in three languages, load from backend**
  - **Where:** New page in all three languages:
    - `workshops/` (EN)
    - `nl/workshops/` (NL)
    - `fr/ateliers/` (FR) *(or equivalent FR slug)*
  - **Issue:** No workshops page exists yet. A new page must be created in all three languages that fetches and displays workshops from the BETANGOCRM API backend.
  - **Applies to:** EN / NL / FR.

- [ ] **Beginner page — load "beginner weekend" from backend (keep on existing page)**
  - **Where:** Existing beginner class pages:
    - `tango-classes/beginners/` (EN)
    - `nl/tangolessen/beginners/` (NL)
    - `fr/cours-de-tango/debutants/` (FR)
  - **Decision:** No separate workshop page for beginner weekends — keep the section on the existing beginners page to avoid thin content. A separate page is not warranted given low search volume for that specific query.
  - **Issue:** Fetch upcoming beginner weekends from the BETANGOCRM API and display them dynamically in a dedicated section on the beginners page.
  - **Extra:** Add `schema.org/Event` structured data for each weekend to enable rich results in Google.
  - **Applies to:** All three language versions.

---

> 📋 Full implementation details: see `ACTION-PLAN.md` in the project root.

### SEO — Mobile Speed / Core Web Vitals (Critical)

- [ ] **FontAwesome render-blocking CSS — defer loading on all pages**
  - **Where:** Every HTML template sitewide (~50+ files, EN/NL/FR)
  - **Issue:** `fontawesome.min.css` is loaded as a render-blocking stylesheet, delaying First Contentful Paint on all pages.
  - **Fix:** Replace `<link rel="stylesheet" href="...fontawesome.min.css">` with `<link rel="stylesheet" href="...fontawesome.min.css" media="print" onload="this.media='all';this.onload=null">` plus a `<noscript>` fallback. Note: path depth varies (`css/` / `../css/` / `../../css/`).

- [ ] **`enrollment-modal.css` render-blocking on beginners pages (NEW)**
  - **Where:** `tango-classes/beginners/index.html`, `nl/tangolessen/beginners/index.html`, `fr/cours-de-tango/debutants/index.html`
  - **Issue:** `enrollment-modal.css` introduced as render-blocking; identified in re-audit 2026-03-24.
  - **Fix:** Same `media="print" onload=...` + noscript technique as FontAwesome fix above.

- [ ] **Tango-classes hero PNG → WebP (image already on disk)**
  - **Where:** `tango-classes/index.html` + NL/FR equivalents
  - **Issue:** Hero image uses `.png` instead of available `.webp`, wasting ~159KB per load.
  - **Fix:** Change inline style `Tango-classes-in-Brussels.png` → `Tango-classes-in-Brussels.webp`.

- [ ] **Mobile CSS hero JPG → WebP (image already on disk)**
  - **Where:** `css/styles.css` (lines ~5236 and ~5250); rebuild `.min.css` afterwards
  - **Issue:** Mobile hero background uses `Tango-mobile.jpg`; WebP version already exists on disk.
  - **Fix:** Replace `Tango-mobile.jpg` → `Tango-mobile.webp` in both CSS rules.

- [ ] **Add hero image preloads in `<head>`**
  - **Where:** `index.html`, `tango-classes/index.html` + NL/FR equivalents
  - **Issue:** LCP hero images are not preloaded, causing slower Largest Contentful Paint.
  - **Fix:** Add `<link rel="preload" as="image">` for `Tango-2048x1365-1.webp` (desktop) + `Tango-mobile.webp` (mobile) on homepage; `Tango-classes-in-Brussels.webp` on tango-classes pages (apply after PNG→WebP fix above).

### SEO — Technical SEO (Critical/High)

- [ ] **Hreflang `<link>` tags missing from most pages**
  - **Where:** Homepage, /fr/, /nl/, all class pages, all blog posts, contact — 13+ pages; all 3 language versions of each
  - **Issue:** No hreflang tags present, causing search engines to miss language/region signals. Only free-trial page has correct implementation.
  - **Fix:** Use the free-trial page as the pattern and add `<link rel="alternate" hreflang="...">` tags to all affected pages.

- [ ] **`x-default` hreflang missing from sitemap**
  - **Where:** `sitemap.xml`
  - **Issue:** Each URL cluster in the sitemap lacks an `<xhtml:link rel="alternate" hreflang="x-default" .../>` entry.
  - **Fix:** Add `x-default` alternate link to every URL cluster in the sitemap.

- [ ] **`og:type` wrong on blog post pages (should be `article`)**
  - **Where:** All blog post pages (EN/NL/FR)
  - **Issue:** Open Graph type is set to `website` instead of `article`; missing `article:published_time` and `article:author`.
  - **Fix:** Change `og:type` to `article`; add `article:published_time` and `article:author` meta tags.

- [ ] **Cookie consent missing from blog post pages (GDPR risk)**
  - **Where:** All blog post pages (EN/NL/FR)
  - **Issue:** `cookie-consent.min.js` and `cookie-consent.min.css` are absent from blog post templates.
  - **Fix:** Add cookie consent script + stylesheet following the same pattern used on other pages.

- [ ] **Broken anchor links in footer on tango-classes hub and contact**
  - **Where:** `tango-classes/index.html` footer, `contact/index.html` footer
  - **Issue:** Footer links use `index.html#beginners`, `index.html#experienced` etc. which are broken — those sections now live on separate pages.
  - **Fix:** `index.html#beginners` → `beginners/`, `index.html#experienced` → `experienced/`, etc.

- [ ] **Duplicate mobile menu event listeners on contact page**
  - **Where:** `contact/index.html` (~line 542)
  - **Issue:** A duplicate `if (menuToggle && mainNav)` block creates redundant event listeners.
  - **Fix:** Remove the duplicate block.

- [ ] **CSS/JS version strings inconsistent (should be v3.7 everywhere)**
  - **Where:** Sub-pages that still reference `v=3.5` or `v=3.6`
  - **Issue:** `fontawesome`, `styles.min`, `enhancements`, and `cookie-consent` have inconsistent cache-bust query strings across pages.
  - **Fix:** Standardise all version strings to `v=3.7` across all pages.

### SEO — Schema (High/Medium)

- [ ] **Free-trial `Event` schema invalid — replace with `Course`**
  - **Where:** `tango-classes/free-trial/index.html` + NL/FR equivalents
  - **Issue:** Current `Event` schema is missing required `startDate`; the page describes a recurring free class, not a one-time event.
  - **Fix:** Replace with `Course` schema. See `ACTION-PLAN.md` item #8 for full JSON-LD.

- [ ] **`BreadcrumbList` schema missing from blog post pages**
  - **Where:** All blog post pages (EN/NL/FR) — user preference: breadcrumbs on blog posts only, not other pages
  - **Issue:** No breadcrumb structured data, missing rich result opportunity.
  - **Fix:** Add `BreadcrumbList` with pattern: Home → Blog → Article title.

- [ ] **`ItemList` schema broken — missing `ListItem` wrapper**
  - **Where:** `tango-classes/index.html`, `tango-classes/experienced/index.html` + NL/FR equivalents
  - **Issue:** `ItemList` items lack `ListItem` wrapper with `position` and `url` properties.
  - **Fix:** Correct the JSON-LD structure. See `ACTION-PLAN.md` item #12 for corrected schema.

- [ ] **`BlogPosting` schema incomplete**
  - **Where:** All blog post pages (EN/NL/FR)
  - **Issue:** Missing `mainEntityOfPage`, `url`/`@id`, and `publisher.logo` from `BlogPosting` schema.
  - **Fix:** Add missing fields. See `ACTION-PLAN.md` item #13 for corrected JSON-LD.

- [ ] **Homepage `DanceSchool` schema improvements**
  - **Where:** `index.html` (EN homepage only)
  - **Issue:** `address` and `geo` are only inside `location[]`, not at top level; `openingHoursSpecification` missing; `reviewCount` is a string instead of integer; `WebSite` + `SearchAction` schema missing.
  - **Fix:** Add top-level `address` + `geo`; add `openingHoursSpecification`; change `"reviewCount": "141"` → `141`; add second JSON-LD block with `WebSite` + `SearchAction`.

- [ ] **Woluwe schema fixes**
  - **Where:** `tango-classes/woluwe/index.html`
  - **Issue:** `priceRange` is `"€195"` (a price, not a range indicator); `geo.longitude` value may be misaligned (4.4243 vs 4.4367).
  - **Fix:** Change `priceRange` to `"€€"`; verify and align the correct longitude value.

### SEO — Content & Images (Medium)

- [ ] **"Why Learn Tango" blog post thin content (~900 words)**
  - **Where:** `blog/why-learn-tango/index.html` + NL/FR equivalents
  - **Issue:** Post is ~900 words, below recommended 1,500+ for competitive ranking.
  - **Fix:** Expand with 10 numbered reasons, personal instructor perspective, and health benefits section.

- [ ] **Card images on `/tango-classes/` missing `width`/`height` (CLS)**
  - **Where:** `tango-classes/index.html`
  - **Issue:** `beginner-tango-classes.webp` and `tango-classes-in-Brussels-2-*.webp` card images have no dimensions, causing Cumulative Layout Shift.
  - **Fix:** Add explicit `width` and `height` attributes to both images.

- [ ] **Blog hero image: no dimensions + PNG format**
  - **Where:** `blog/history-of-argentine-tango/index.html` + NL/FR equivalents
  - **Issue:** `History-of-tango.png` missing `width`/`height` (CLS risk) and uses PNG instead of WebP.
  - **Fix:** Add `width`/`height` attributes; convert image to WebP.

- [ ] **Venue name inconsistency — "Le LAB" vs "GC Kontakt"**
  - **Where:** Tango-classes hub page, beginners page, all relevant JSON-LD structured data
  - **Issue:** The tango-classes hub still refers to "GC Kontakt" while JSON-LD and the beginners page use "Le LAB".
  - **Fix:** Decide on canonical venue name and apply consistently across all affected pages and structured data.

### SEO — Off-Page / Directory Listings

Submit BE-TANGO to directories that rank for relevant tango/dance queries and provide quality backlinks. All free unless noted.

#### Tier 1 — Immediate (Free, high relevance)

- [ ] **milonga.be** — Tango-specific Belgian directory, ranks for every tango query; add classes listing
- [ ] **danspunt.be** — Official Flanders/Brussels dance school directory; add school profile
- [ ] **sport.brussels** — Official Brussels-Capital regional sports platform; add club/activity listing (EN/NL/FR)
- [ ] **goudengids.be** — 4.5M searches/month, NL "dans voor volwassenen Brussel"; add business profile
- [ ] **pagesdor.be** — Sister site to goudengids.be, FR audience; add business profile
- [ ] **eversports.be** — Sports/dance booking platform, ranks FR "cours de danse Bruxelles"; add studio + class listing

#### Tier 2 — High value (expat / tourism)

- [ ] **apprentus.be** — Ranks for private dance lessons BE; add teacher/school profile
- [ ] **topbruxelles.com** — FR "meilleurs cours de danse Bruxelles"; add business listing
- [ ] **insidebrussels.be** — Expat lifestyle blog/guide, NL "danslessen Brussel"; contact for feature/listing
- [ ] **angloinfo.com/brussels** — English expat directory; add to Art, Dance & Music Classes category
- [ ] **visit.brussels** — FR tango beginners event listed; add school + upcoming events (may need partnership)
- [ ] **expat.com/brussels** — Expat business directory; add school profile

#### Tier 3 — Booking / review platforms

- [ ] **eventbrite.be** — List workshops and beginner weekends as bookable events (commission model)
- [ ] **getyourguide.com** — List tango intro workshops for tourists (commission model)
- [ ] **tripadvisor.com** — Create/claim Business Page under Lessons & Workshops
- [ ] **yelp.com** — Claim/optimise existing listing (BE-TANGO may already be listed)
- [ ] **classpass.com** — List classes for fitness-minded audience (requires studio partnership)

#### Tier 4 — Supplementary business directories

- [ ] **goldenpages.be** — Alternative to Goudengids; add business profile
- [ ] **belgiumyp.com** — General Belgian business directory; add listing
- [ ] **whitepages.be** — Traditional Belgian directory; verify/add business entry

### SEO — Low Priority / Backlog

- [ ] **Remove unused `preconnect` to cdnjs on most pages**
  - **Where:** Homepage, tango-classes pages, blog pages (keep on beginners page — it uses cdnjs for QR code library)
  - **Issue:** Unnecessary preconnect hint wastes browser resources on pages that don't use cdnjs.
  - **Fix:** Remove `<link rel="preconnect" href="https://cdnjs.cloudflare.com">` from all pages except beginners.

- [ ] **Logo `loading="lazy"` → `loading="eager"` on all pages**
  - **Where:** All pages sitewide
  - **Issue:** Logo uses `loading="lazy"`, which can cause a flicker as it is always above the fold.
  - **Fix:** Change to `loading="eager"` on all pages.

- [ ] **Add `srcset` to card images for responsive sizing**
  - **Where:** Class pages with card images
  - **Issue:** Card images are not served at responsive sizes despite sized variants being on disk.
  - **Fix:** Add `srcset` attributes pointing to the existing sized variants.

- [ ] **Create `/about/` instructor bio page**
  - **Where:** New page (EN/NL/FR equivalents)
  - **Issue:** Largest E-E-A-T content gap — no dedicated instructor bio page.
  - **Fix:** Create a dedicated about/bio page with instructor credentials, experience, and philosophy.

- [ ] **Create `/llms.txt`**
  - **Where:** Site root
  - **Issue:** No `llms.txt` file; site is not optimised for AI search readiness.
  - **Fix:** Create `/llms.txt` following the emerging standard for AI crawler guidance.

- [ ] **Create `/tango-glossary/` page**
  - **Where:** New page (EN/NL/FR equivalents)
  - **Issue:** High AI citation value opportunity currently untapped.
  - **Fix:** Create a comprehensive tango glossary page with definitions of key terms.

---

## In Progress

---

## Done

