# BE-TANGO Rebuild — Todo

Quick modifications to be done on the rebuild website.

> **Rule — execution:** Only execute changes when explicitly asked. Never fix proactively.
> **Rule — tracking:** After completing a change, mark it as done `[x]` in this file so only newly added items get picked up next run.
> **Rule — languages:** Every fix must be applied to **all three language versions** of the affected page (EN / NL / FR), unless otherwise noted.

---

## Pending

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

---

## In Progress

---

## Done

