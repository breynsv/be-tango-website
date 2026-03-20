# BE-TANGO Website Audit

> **Workflow:** Plak de URL van een pagina → dicteer je opmerkingen → ik update dit bestand.
> Na de volledige audit maak ik een CORRECTION_PLAN.md met prioriteiten en betrokken bestanden.

---

## Status overzicht

| Pagina | URL | Status |
|--------|-----|--------|
| Home | http://localhost:8002/ | ✅ Gecorrigeerd |
| Home (NL) | http://localhost:8002/nl/ | ✅ Gecorrigeerd |
| Home (FR) | http://localhost:8002/fr/ | ✅ Gecorrigeerd |
| Tango Classes | http://localhost:8002/tango-classes/ | ✅ Gecorrigeerd |
| Beginners (NL) | http://localhost:8002/nl/tangolessen/beginners/ | ✅ Gecorrigeerd |
| Privélessen (FR) | http://localhost:8002/fr/cours-de-tango/particuliers/ | ✅ Gecorrigeerd |
| Brussel (FR) | http://localhost:8002/fr/cours-de-tango/bruxelles/ | ✅ Gecorrigeerd |
| Contact (FR) | http://localhost:8002/fr/contactez-nous/ | ✅ Gecorrigeerd |
| Contact (NL) | http://localhost:8002/nl/contacteer-ons/ | ✅ Gecorrigeerd |

---

## Pagina's

---

### 🏠 Home — `http://localhost:8002/`

#### Reviews sectie
- [x] **"Read more" links openen Google Reviews BE-TANGO in nieuw tabblad**
  - ✅ Gecorrigeerd 2026-03-20 — alle 3 links verwijzen nu naar `https://share.google/gEhPWeNVzTLcQS4Yd` met `target="_blank" rel="noopener noreferrer"`

#### Footer — navigatielinks
- [x] **Footer links verwijzen naar verkeerde of lege URLs — gecorrigeerd in EN**
  - ✅ Gecorrigeerd 2026-03-20 — `index.html` footer links: `tango-classes/index.html#beginners` etc. → `tango-classes/beginners/` etc. (6 links)
  - NL en FR footer waren al correct

---

### 🇧🇪 Home NL — `http://localhost:8002/nl/`

#### Reviews sectie
- [x] **"Lees meer" links openen Google Reviews BE-TANGO in nieuw tabblad**
  - ✅ Gecorrigeerd 2026-03-20 — alle 3 links verwijzen nu naar `https://share.google/gEhPWeNVzTLcQS4Yd` met `target="_blank" rel="noopener noreferrer"`

#### Footer
- ✅ Footer is correct op deze pagina — geen aanpassingen nodig

---

### 🇫🇷 Home FR — `http://localhost:8002/fr/`

#### Reviews sectie
- [x] **"En savoir plus" links openen Google Reviews BE-TANGO in nieuw tabblad**
  - ✅ Gecorrigeerd 2026-03-20 — alle 3 links verwijzen nu naar `https://share.google/gEhPWeNVzTLcQS4Yd` met `target="_blank" rel="noopener noreferrer"`

#### Footer
- ✅ Footer is correct op deze pagina — geen aanpassingen nodig

---

### 💃 Tango Classes — `http://localhost:8002/tango-classes/`

#### "View All Levels" button
- [x] **Button werkt niet — moet linken naar experienced pagina + anchor naar sectie**
  - ✅ Gecorrigeerd 2026-03-20 — button href: `#class-levels` → `experienced/#choose-your-level`
  - ✅ Anchor `id="choose-your-level"` toegevoegd aan de "Choose Your Level" sectie in `tango-classes/experienced/index.html`
  - ✅ NL variant gecorrigeerd: `nl/tangolessen/index.html` → `ervaring/#choose-your-level` + anchor toegevoegd aan `nl/tangolessen/ervaring/index.html`
  - ✅ FR variant gecorrigeerd: `fr/cours-de-tango/index.html` → `experimentes/#choose-your-level` + anchor toegevoegd aan `fr/cours-de-tango/experimentes/index.html`

---

### 🇧🇪 Beginners NL — `http://localhost:8002/nl/tangolessen/beginners/`

#### Tekstcorrectie
- [x] **Knoptekst "bekijk rooster" gewijzigd naar "lessenrooster"**
  - ✅ Gecorrigeerd 2026-03-20 — 2 instanties (hero + prijskaart)
- [x] **Knoptekst "bekijk datums" gewijzigd naar "bekijk data"**
  - ✅ Gecorrigeerd 2026-03-20

---

### 🇫🇷 Privélessen FR — `http://localhost:8002/fr/cours-de-tango/particuliers/`

#### Ontbrekende achtergrond — CTA sectie boven footer
- [x] **Achtergrond ontbreekt in de CTA-sectie net boven de footer**
  - ✅ Gecorrigeerd 2026-03-20 — `class="section-cta"` → `class="section-cta bg-dark"` op `fr/cours-de-tango/particuliers/index.html`
  - ✅ Zelfde fix toegepast op `nl/tangolessen/prive/index.html`

---

### 🇫🇷 Brussel FR — `http://localhost:8002/fr/cours-de-tango/bruxelles/`

#### Topnav — verkeerde URL voor "Cours en ligne"
- [x] **Topnav link "Cours en ligne" verwijst naar `/online/` in plaats van `/en-ligne/`**
  - ✅ Gecorrigeerd 2026-03-20 — `../online/` → `../en-ligne/` in topnav dropdown op `bruxelles/` en `particuliers/`
  - ✅ Bijkomende fout gecorrigeerd op `essai-gratuit/`: `../cours-prives/` → `../particuliers/` en `../cours-en-ligne/` → `../en-ligne/`
  - Andere FR pagina's (debutants, en-ligne, experimentes) waren al correct

---

### 🇫🇷 Contact FR — `http://localhost:8002/fr/contactez-nous/`

#### Topnav — stijl kapot + logo toont als "?"
- [x] **Logo toont als "?" in plaats van het BE-TANGO logo**
  - ✅ Gecorrigeerd 2026-03-20 — logo pad: `src="../images/logo-be-tango.png"` → `src="../../images/logo-be-tango.png"`
- [x] **Hero en contactkaarten aanwezig**
  - ✅ Bevestigd — hero sectie en info-cards sectie waren al aanwezig en correct vertaald

---

### 🇧🇪 Contact NL — `http://localhost:8002/nl/contacteer-ons/`

#### Design niet consistent met EN versie
- [x] **Hero afbeelding ontbreekt**
  - ✅ Gecorrigeerd 2026-03-20 — `<section class="hero hero-subpage">` toegevoegd bovenaan `<main>` met NL tekst
- [x] **Contactkaarten ontbreken — "Bel ons", "Stuur een e-mail", "WhatsApp"**
  - ✅ Gecorrigeerd 2026-03-20 — `<section class="info-cards-section">` toegevoegd na de hero met 3 kaarten (NL vertalingen, contactgegevens uit EN versie overgenomen)

---

### Mobile responsiveness — volledige site
- [x] **Volledige site getest en gecorrigeerd op 375px viewport**
  - ✅ Gecorrigeerd 2026-03-20 — alle pagina's in alle talen getest via geautomatiseerde browser (375px)
  - Gevonden en opgelost:
    - `tango-classes/experienced/`, `nl/tangolessen/ervaring/`, `fr/cours-de-tango/experimentes/`: horizontale overflow opgelost via `min-width: 0` + `flex-direction: column` op `.feature-item-light` en nieuwe `@media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr } }` breakpoint
    - `fr/cours-de-tango/particuliers/`: review carousel overflow opgelost via `overflow-x: clip` op wrapper + `min-width: 0` op `.feature-list li` en `.reviews-carousel`
    - Alle 3 ervaringsgerichte pagina's (EN/NL/FR): `.bts-sched` inline stijl gecorrigeerd naar `flex: 1 1 auto; min-width: 0`
    - `css/styles.css` en `css/styles.min.css` bijgewerkt
  - Alle overige pagina's (EN, NL, FR) hadden geen horizontale overflow

---

### Registratieformulieren — mobiele layout
- [x] **Layout van registratieformulieren verbeterd op mobiel (375px)**
  - ✅ Gecorrigeerd 2026-03-20
  - Pagina's: `nl/tangolessen/gratis-proefles/`, `tango-classes/free-trial/`, `fr/cours-de-tango/essai-gratuit/` + beginners en ervaring/experienced/expérimentés
  - Wijzigingen in `css/free-trial.css` + `css/free-trial.min.css`:
    - `.ft-input` / `.ft-select`: `min-height: 48px`, `font-size: 16px` (voorkomt iOS auto-zoom), `padding: 12px 14px`
    - `.ft-submit`: `min-height: 52px`, `width: 100%`, goud, vetgedrukt
    - `.ft-partner-card`: `min-height: 88px`, betere padding
    - `.ft-form-row`: altijd `grid-template-columns: 1fr` op ≤600px
    - `.ft-consent`: grotere checkbox (18×18px), ruimer tekstafstand
    - `.ft-form-card`: `border-radius: 14px`, zachte schaduw, betere padding
  - Wijzigingen in `css/styles.css` + `css/styles.min.css`:
    - `.schedule-item` op ≤480px: verticale stapeling — tijd bovenaan, info eronder, CTA-knop full-width onderaan (48px hoog)
    - `.pricing-grid` op ≤600px: `grid-template-columns: 1fr`
    - `.card-grid`, `.level-cards` op ≤600px: `grid-template-columns: 1fr`
    - 601–768px: max 2 kolommen voor pricing/card grids
