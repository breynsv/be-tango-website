# French Beginners Page - Build Notes

**File:** `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild/fr/cours-de-tango/debutants/index.html`

## Build Summary

✅ **Completed:** French beginners page built successfully (793 lines, 31KB)

## Implementation Details

### 1. Content Extraction
- Extracted from: `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/www.be-tango.be/fr/cours-de-tango/debutants/index.html`
- All French text preserved exactly as in original
- Content includes: hero, course options, weekly classes, weekend bootcamp, FAQ, reviews, CTA sections

### 2. Structure & Paths
- **Path depth:** Three levels up (../../../)
- **CSS:** `../../../css/styles.css` ✅
- **Images:** `../../../images/` ✅
- **Language:** `lang="fr"` ✅
- **Meta:** All in French ✅

### 3. Key Sections Implemented

#### Hero Section
- Label: "START-TO-TANGO"
- Title: "Tango Argentin pour débutants à Bruxelles & Woluwe"
- Tagline: "Découvrez la magie du tango !"

#### How to Start (3 options)
1. Cours hebdomadaires (Weekly classes)
2. Stage de week-end (Weekend bootcamp)
3. Cours d'essai gratuit (Free trial)

#### Weekly Classes
- Brussels location: École de Gatti de Gamond, Rue du Marais 68
- Woluwe location: Espace Delvaux, Avenue Orban 54
- Duration: 14 leçons
- Schedule: Mardi & Jeudi 20h00-21h30

#### Weekend Bootcamp
- Format: 2 x 2 hours
- Status: No current dates (with contact CTA)

#### Why Learn Tango (3 benefits)
- Connexion sociale
- Expression créative
- Bien-être physique & mental

#### Why Choose Us (4 features)
- Instructeurs expérimentés
- Ambiance conviviale
- Accent sur les bases
- Communauté soudée

#### FAQ (6 questions)
1. Ai-je besoin d'un partenaire de danse ?
2. Quels types de chaussures et de vêtements dois-je porter ?
3. Puis-je d'abord rejoindre un cours d'essai gratuit ?
4. Combien coûte la série de débutants ?
5. Que se passe-t-il si je rate un cours ?
6. Dois-je avoir une expérience de danse ?

#### Reviews Section
- 6 review cards with carousel
- Auto-scroll functionality
- 5-star ratings displayed

### 4. JSON-LD Schema
- Type: Course (schema.org)
- Course name: "Cours de Tango Argentin pour Débutants"
- Provider: BE-TANGO
- Two course instances (Brussels & Woluwe)
- Number of lessons: 14
- Rating: 5/5 (141 reviews)

### 5. Language Switcher
- **EN:** `../../../tango-classes/beginners/`
- **FR:** `../../../fr/cours-de-tango/debutants/` (ACTIVE)
- **NL:** `../../../nl/tangolessen/beginners/`

### 6. Navigation
All links point to French pages:
- Accueil → `../../../fr/`
- Cours de Tango → `../../../fr/cours-de-tango/`
- Essai Gratuit → `../../../fr/essai-gratuit/`
- Contact → `../../../fr/contactez-nous/`

### 7. JavaScript Features
- Mobile menu toggle
- Smooth scroll anchors
- FAQ accordion (auto-close others)
- Reviews carousel with:
  - Auto-scroll every 5 seconds
  - Pause on hover
  - Pause on manual scroll
  - Loop functionality

## Design Patterns Used

### Icons (Font Awesome)
- Calendar week: `fas fa-calendar-week`
- Calendar alt: `fas fa-calendar-alt`
- Lightbulb: `far fa-lightbulb`
- Map marker: `fas fa-map-marker-alt`
- Clock: `far fa-clock`
- Check circle: `fas fa-check-circle`
- Users: `fas fa-users`
- Music: `fas fa-music`
- Heart: `fas fa-heart`
- Graduate: `fas fa-user-graduate`
- Smile: `fas fa-smile`
- Shoe prints: `fas fa-shoe-prints`

### CSS Classes
- Hero: `.hero.hero-short`
- Sections: `.section`, `.section-light`
- Cards: `.card`, `.option-card`, `.location-card`
- Grid: `.grid.grid-2`, `.grid.grid-3`
- CTA: `.cta-section`, `.cta-section-final`
- Accordion: `.accordion-item`, `.accordion-header`
- Reviews: `.reviews-carousel`, `.review-card`

## Verification Checklist

✅ HTML5 semantic structure
✅ French language (lang="fr")
✅ French meta description and keywords
✅ French title: "Cours de tango pour débutants - BE-TANGO"
✅ All paths relative with ../../../
✅ CSS path correct
✅ Images path correct
✅ Course JSON-LD schema in French
✅ Language switcher with FR active
✅ All navigation links to French pages
✅ Mobile-responsive design
✅ Accessibility attributes (aria-label, aria-current)
✅ FAQ accordion functionality
✅ Reviews carousel with auto-scroll
✅ Smooth scroll for anchors
✅ Mobile menu toggle

## File Size & Lines
- Size: 31 KB
- Lines: 793
- Character encoding: UTF-8

## Build Date
- Created: 2026-02-03

## Notes
- Content matches original French page exactly
- Structure follows CLAUDE.MD guidelines
- All French special characters properly encoded
- Ready for production deployment
