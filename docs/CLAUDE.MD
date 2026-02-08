# BE-TANGO Website Rebuild Manual

## Project Overview

This is a **clean rebuild** of the BE-TANGO WordPress/Elementor website. The goal is to create a modern, fast, semantic HTML5 website without WordPress/Elementor bloat.

**Working Directory:** `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild/`

**Original Site (Reference):** `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/www.be-tango.be/`

---

## Core Principles

### 1. Technology Stack
- **HTML5**: Semantic elements (header, nav, main, section, article, footer)
- **CSS3**: Mobile-first, no frameworks, CSS custom properties
- **JavaScript**: Vanilla JS only, no libraries
- **NO**: Bootstrap, Tailwind, jQuery, React, or any frameworks

### 2. Development Approach
- **Mobile-first**: Start with mobile styles, use `min-width` media queries for desktop
- **Semantic HTML**: Use proper HTML5 elements for structure
- **Clean code**: No Elementor markup, no unnecessary divs
- **Reusable components**: Use partials for header, footer, reviews
- **Extract, don't invent**: Get exact content/images from original site

### 3. File Paths
- **ALWAYS use relative paths** (for local file viewing)
- ✅ CORRECT: `css/styles.css`, `images/photo.jpg`, `pages/contact.html`
- ❌ WRONG: `/css/styles.css`, `/images/photo.jpg` (absolute paths break local viewing)

---

## Brand Identity

### Colors (CSS Custom Properties)
```css
:root {
  --color-primary: #00d084;        /* Green accent */
  --color-secondary: #E2C033;      /* Gold/Yellow */
  --color-dark-navy: #1c244b;      /* Dark navy blue */
  --color-black: #000000;          /* Pure black */
  --color-white: #ffffff;          /* White */
  --color-text: #333333;           /* Body text */
  --color-text-light: #666666;     /* Secondary text */
  --color-bg-light: #f8f9fa;       /* Light background */
}
```

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Base size**: 16px
- **Line height**: 1.6 for body text

### Spacing Scale
```css
--spacing-xs: 0.5rem;    /* 8px */
--spacing-sm: 0.75rem;   /* 12px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

---

## Project Structure

```
be-tango-rebuild/
├── index.html
├── CLAUDE.MD (this file)
├── css/
│   └── styles.css
├── images/
│   ├── logo-be-tango.png
│   ├── Tango-2048x1365-1.jpg (hero background)
│   ├── beginner-tango-classes.webp
│   ├── tango-classes-in-Brussels-2-e1740646913571.webp
│   ├── Private-dance-classes.webp
│   ├── Tango-workshops-e1740647379561.webp
│   ├── tango-classes-fun.webp
│   ├── Tango-in-Brussels-e1740649554215.webp
│   └── (favicons, icons...)
├── partials/
│   ├── header.html
│   ├── footer.html
│   ├── reviews.html
│   └── README.md
└── pages/
    ├── tango-classes.html
    ├── free-trial.html
    └── contact.html
```

---

## Key Design Patterns

### 1. Hero Section
```html
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <p class="hero-label">WELCOME TO BE-TANGO</p>
      <h1>Argentine Tango<br><span class="highlight">in Brussels & Woluwe</span></h1>
      <p class="hero-tagline">Dance classes for everyone!</p>

      <div class="hero-rating">
        <div class="hero-stars">★★★★★</div>
        <p class="hero-reviews">5/5 - 141 Google reviews</p>
      </div>

      <div class="hero-cta">
        <a href="pages/free-trial.html" class="btn btn-primary btn-large">BOOK A FREE TRIAL</a>
        <a href="pages/tango-classes.html" class="btn btn-secondary btn-large">VIEW COURSES</a>
      </div>
    </div>
  </div>
</section>
```

**CSS Pattern:**
```css
.hero {
  position: relative;
  background-image: url('../images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(28, 36, 75, 0.85) 0%, rgba(0, 0, 0, 0.75) 100%);
  z-index: 0;
}

.hero .container {
  position: relative;
  z-index: 1;
}
```

### 2. Info Cards (Overlapping Hero)
```html
<section class="info-cards-section">
  <div class="container">
    <div class="info-cards-wrapper">
      <div class="info-card">
        <div class="info-icon"><i class="far fa-lightbulb"></i></div>
        <h3>Free Trial Class</h3>
        <p>Experience the magic of tango for free.</p>
      </div>
      <!-- More cards... -->
    </div>
  </div>
</section>
```

**CSS Pattern:**
```css
.info-cards-section {
  position: relative;
  margin-top: -60px;  /* Overlap hero */
  padding: 0 0 var(--spacing-lg);
  z-index: 10;
}

.info-cards-wrapper {
  background-color: var(--color-white);
  border-top: 4px solid var(--color-secondary);  /* Orange border on top only */
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-md) var(--spacing-sm);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
}

@media (min-width: 768px) {
  .info-cards-wrapper {
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
  }
}

.info-icon {
  font-size: 2.5rem;
  color: var(--color-secondary);
}
```

**Font Awesome Icons Used:**
- Free Trial: `<i class="far fa-lightbulb"></i>` (Regular)
- 2 Top Locations: `<i class="fas fa-map-marked-alt"></i>` (Solid)
- 15 years+ experience: `<i class="fas fa-user-graduate"></i>` (Solid)

### 3. Journey Cards (with Photos)
```html
<article class="card journey-card">
  <div class="journey-image">
    <img src="images/photo.webp" alt="Description" loading="lazy">
    <span class="journey-badge">START HERE</span>
  </div>
  <div class="journey-content">
    <h3>Absolute Beginners</h3>
    <p><strong>Start-to-tango</strong> with our classes.</p>
    <a href="#" class="journey-link">More info <i class="fas fa-arrow-right"></i></a>
  </div>
</article>
```

**CSS Pattern:**
```css
.journey-card {
  padding: 0;
}

.journey-image {
  width: 100%;
  height: 240px;
  position: relative;
  overflow: hidden;
}

.journey-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.journey-card:hover .journey-image img {
  transform: scale(1.05);
}

.journey-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background-color: var(--color-secondary);
  color: var(--color-dark-navy);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.journey-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.journey-content p {
  flex: 1;  /* Pushes link to bottom */
}

.journey-link {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.journey-link:hover {
  gap: var(--spacing-sm);  /* Arrow moves on hover */
}
```

### 4. Card Components (General)
```css
.card {
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  padding: 0;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-lg);
}
```

**CRITICAL: Card Button Alignment**
```css
.card p {
  flex: 1;  /* This pushes the button to the bottom */
}

.card .btn {
  margin: auto var(--spacing-lg) var(--spacing-lg);
  width: calc(100% - var(--spacing-lg) * 2);
}
```

### 5. Collapsible Accordion (Q&A)
```html
<details class="accordion-item">
  <summary class="accordion-header">
    <h3>Question title?</h3>
    <span class="accordion-icon">+</span>
  </summary>
  <div class="accordion-content">
    <p>Answer content here.</p>
  </div>
</details>
```

**CSS Pattern:**
```css
.accordion-item {
  border-bottom: 1px solid #e0e0e0;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: var(--spacing-md) 0;
  list-style: none;
}

.accordion-header::-webkit-details-marker {
  display: none;
}

details[open] .accordion-icon {
  transform: rotate(45deg);
}
```

### 6. Reviews Carousel
**Use the partial:** `partials/reviews.html`

Key features:
- Auto-scroll every 5 seconds
- Pause on hover and manual scroll
- Previous/Next navigation arrows
- Responsive grid layout

### 7. Gradient Backgrounds
```css
/* Dark sections (CTA, Footer) */
.bg-dark {
  background: linear-gradient(135deg, rgba(28, 36, 75, 1) 0%, rgba(0, 0, 0, 0.95) 100%);
  color: var(--color-white);
}

/* Hero overlay */
.hero::before {
  background: linear-gradient(135deg, rgba(28, 36, 75, 0.85) 0%, rgba(0, 0, 0, 0.75) 100%);
}
```

---

## Responsive Breakpoints

```css
/* Mobile first - base styles are for mobile */

/* Tablet and up */
@media (min-width: 768px) {
  /* Tablet styles */
}

/* Desktop and up */
@media (min-width: 1024px) {
  /* Desktop styles */
}

/* Large desktop */
@media (min-width: 1440px) {
  /* Large screen styles */
}
```

### Common Responsive Patterns

**Grid Layouts:**
```css
.grid {
  display: grid;
  gap: var(--spacing-lg);
}

.grid-2 {
  grid-template-columns: 1fr;
}

.grid-3 {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Navigation:**
```css
/* Mobile: hamburger menu */
.main-nav {
  display: none;
}

.mobile-menu-toggle {
  display: block;
}

/* Desktop: full navigation */
@media (min-width: 768px) {
  .main-nav {
    display: block;
  }

  .mobile-menu-toggle {
    display: none;
  }
}
```

---

## Common Issues & Solutions

### Issue 1: Flex Overflow (Content Going Off-Screen)
**Problem:** Flex container child overflows to the right

**Solution:**
```css
.flex-container {
  max-width: 100%;
  overflow: hidden;
}

.flex-child {
  min-width: 0;  /* CRITICAL: Allows flex item to shrink below content size */
}
```

### Issue 2: Card Buttons Not Aligned
**Problem:** Buttons at different heights in card grid

**Solution:**
```css
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-content {
  flex: 1;  /* This pushes button to bottom */
}
```

### Issue 3: Images Not Displaying
**Problem:** Image paths broken

**Solution:**
- Always use relative paths: `images/photo.jpg` NOT `/images/photo.jpg`
- Check file actually exists in images folder
- Verify file extension matches (case-sensitive on some systems)

### Issue 4: Font Awesome Icons Not Showing
**Problem:** Icons appear as squares or not at all

**Solution:**
```html
<!-- Add to <head> -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Use correct class prefixes -->
<i class="fas fa-icon-name"></i>  <!-- Solid -->
<i class="far fa-icon-name"></i>  <!-- Regular -->
<i class="fab fa-icon-name"></i>  <!-- Brands -->
```

### Issue 5: CSS Changes Not Taking Effect - Media Query Overrides
**Problem:** User reports "nothing changed" after updating CSS. Changes to base CSS rules don't appear on the page.

**Root Cause:** Multiple media query overrides throughout the CSS file that override the base rule at different breakpoints.

**Real Example from BE-TANGO:**
When trying to change `.journey-image` height from 450px to 200px, the base rule was updated but changes didn't appear because there were 6 different places where the rule was defined:

```css
/* Line 787 - Base rule */
.journey-image {
  height: 200px;  /* Updated this */
}

/* Line 3835 - Another base rule */
.journey-image {
  height: 450px;  /* But this was still 450px! */
}

/* Line 3840 - Tablet media query */
@media (min-width: 768px) {
  .journey-image {
    height: 450px;  /* And this! */
  }
}

/* Line 4653 - Mobile media query */
@media (max-width: 767px) {
  .journey-image {
    height: 450px;  /* And this! */
  }
}

/* Line 4672 - Tablet range */
@media (min-width: 768px) and (max-width: 1023px) {
  .journey-image {
    height: 450px;  /* And this! */
  }
}

/* Line 4710 - Desktop */
@media (min-width: 1024px) {
  .journey-image {
    height: 450px;  /* And this! */
  }
}
```

**Solution - ALWAYS do this workflow:**

1. **Search first, change later**
```bash
# Use Grep to find ALL instances before making ANY changes
Grep pattern: "\.journey-image\s*\{[^}]*height:"
Output mode: content with line numbers
```

2. **List all locations**
Document every line number where the rule appears:
- Base rules (usually near top of file)
- Mobile media queries (@media max-width)
- Tablet media queries (@media min-width: 768px)
- Desktop media queries (@media min-width: 1024px)
- Large desktop (@media min-width: 1440px)

3. **Update ALL instances**
Don't update just the base rule. Update EVERY occurrence you found in step 1.

4. **Check for inline styles**
Also search HTML files for inline `style=""` or `height=""` attributes that might override CSS:
```bash
Grep pattern: 'height="' in HTML files
```

5. **Verify with user**
After updating all instances, verify the change actually worked.

**Prevention:**
- Avoid duplicating CSS rules in multiple places
- Use CSS variables for values that might change
- Keep responsive overrides minimal
- Document where rules are defined in comments

**Example of better approach:**
```css
:root {
  --journey-image-height: 250px;
}

.journey-image {
  height: var(--journey-image-height);
}

/* Only override if actually different at this breakpoint */
@media (min-width: 1024px) {
  .journey-image {
    /* Only include if height needs to be different on desktop */
    /* Otherwise, let it inherit from base rule */
  }
}
```

### Issue 6: Inline Attributes vs CSS Classes
**Problem:** Updated CSS but some elements still have wrong values due to inline attributes.

**Example:**
```html
<!-- This iframe ignores CSS height rules -->
<iframe height="240" style="..."></iframe>
```

**Solution:**
- Search HTML files for inline `height=""`, `width=""`, `style=""` attributes
- Update inline attributes separately from CSS
- Be aware of slight variations (e.g., `style="border:0; display: block;"` vs `style="border:0; display: block; pointer-events: none;"`) that prevent batch find/replace

---

## Content Extraction Process

### Step 1: Use Task Tool with Explore Agent
```
Use Task tool to find content in /Users/svenbreynaert/Sites/BE-TANGO WEBSITE/www.be-tango.be/
Ask it to extract:
- Exact text content
- Image file names and paths
- Section structure
```

### Step 2: Copy Images
```bash
cp "/path/to/original/image.webp" "/path/to/rebuild/images/"
```

### Step 3: Match Layout Exactly
- Take screenshots of original site with dev-browser
- Compare side-by-side
- Match colors, spacing, typography
- Use exact same text (don't paraphrase)

---

## Creating New Pages

### 1. Start with Template Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Page description">
  <title>Page Title - BE-TANGO</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="../images/cropped-favicon-32x32.png">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <!-- Stylesheet -->
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <!-- HEADER -->
  <!-- Copy content from partials/header.html -->

  <!-- MAIN CONTENT -->
  <main>
    <!-- Your page sections here -->
  </main>

  <!-- FOOTER -->
  <!-- Copy content from partials/footer.html -->

  <!-- Scripts -->
  <script>
    // Mobile menu toggle, etc.
  </script>
</body>
</html>
```

### 2. Adjust Paths for Subdirectory
Pages in `/pages/` folder need `../` prefix:
- CSS: `../css/styles.css`
- Images: `../images/photo.jpg`
- Root: `../index.html`

### 3. Follow Homepage Patterns
- Use same section structure
- Reuse CSS classes
- Match spacing and typography
- Keep consistent button styles

---

## JavaScript Patterns

### Mobile Menu Toggle
```javascript
const menuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', !isExpanded);

  if (window.innerWidth < 768) {
    mainNav.style.display = isExpanded ? 'none' : 'block';
  }
});
```

### Smooth Scroll for Anchors
```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});
```

### Carousel Auto-Scroll Pattern
See `partials/reviews.html` for complete implementation:
- Auto-scroll every 5 seconds
- Pause on hover
- Pause on manual scroll
- Resume 2 seconds after scroll ends
- Reset timer on arrow click

---

## SEO & Structured Data

### JSON-LD for LocalBusiness
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "DanceSchool",
  "name": "BE-TANGO",
  "description": "Your dance school for Argentine tango",
  "url": "https://www.be-tango.be",
  "logo": "https://www.be-tango.be/images/logo-be-tango.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Street name",
    "addressLocality": "Brussels",
    "addressCountry": "BE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 50.8503,
    "longitude": 4.3517
  },
  "telephone": "+32498392939"
}
</script>
```

---

## Image Guidelines

### File Naming
- Use descriptive names: `beginner-tango-classes.webp`
- Lowercase with hyphens: `tango-in-brussels.webp`
- Include dimensions if needed: `photo-768x768.webp`

### Formats
- **Photos**: `.webp` (best compression)
- **Logos/Icons**: `.png` (transparency)
- **Hero backgrounds**: `.jpg` (large photos)

### Optimization
- Keep file sizes under 100KB when possible
- Use responsive images with `srcset` for larger images
- Always include `alt` attributes
- Use `loading="lazy"` for below-fold images

### Image Heights
- Hero background: Full viewport
- Journey cards: `240px`
- Info cards: Icon-based (no images)
- Review avatars: `48px`

---

## Button Styles

### Primary Button (Gold)
```html
<a href="#" class="btn btn-primary">Click Me</a>
```

### Secondary Button (Outlined)
```html
<a href="#" class="btn btn-secondary">Click Me</a>
```

### Large Button
```html
<a href="#" class="btn btn-primary btn-large">Click Me</a>
```

### Text Link with Arrow
```html
<a href="#" class="journey-link">More info <i class="fas fa-arrow-right"></i></a>
```

---

## Testing Checklist

Before completing any page:

### Visual Testing
- [ ] Compare screenshot with original site
- [ ] Check all sections are present
- [ ] Verify colors match brand
- [ ] Test all images load correctly
- [ ] Check button hover states

### Responsive Testing
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify mobile menu works
- [ ] Check no horizontal scrolling

### Functionality Testing
- [ ] All links work (no 404s)
- [ ] Navigation works on mobile and desktop
- [ ] Forms submit (if applicable)
- [ ] Carousels auto-scroll and respond to clicks
- [ ] Accordions expand/collapse
- [ ] Smooth scroll anchors work

### Code Quality
- [ ] No absolute paths (all relative)
- [ ] Valid HTML5 (semantic elements)
- [ ] No inline styles (use CSS classes)
- [ ] Consistent spacing (use CSS variables)
- [ ] No console errors in browser

---

## Quick Reference: Common Tasks

### Add a new section
1. Use semantic HTML5 element: `<section>`
2. Wrap in `.container` for max-width
3. Add spacing with padding or margin
4. Follow existing patterns for headings, text, buttons

### Add a gradient background
```css
.section-name {
  background: linear-gradient(135deg, rgba(28, 36, 75, 1) 0%, rgba(0, 0, 0, 0.95) 100%);
  color: var(--color-white);
}
```

### Add a card grid
```html
<div class="grid grid-3">
  <article class="card">...</article>
  <article class="card">...</article>
  <article class="card">...</article>
</div>
```

### Embed Google Maps
```html
<iframe
  src="https://www.google.com/maps/embed?pb=..."
  width="100%"
  height="450"
  style="border:0;"
  allowfullscreen=""
  loading="lazy">
</iframe>
```

### Add Font Awesome icon
1. Find icon at fontawesome.com
2. Note the style (solid/regular/brands)
3. Use: `<i class="fas fa-icon-name"></i>`

---

## Important Reminders

### DO:
✅ Use relative paths always
✅ Extract exact content from original site
✅ Match design exactly (colors, spacing, images)
✅ Use semantic HTML5
✅ Mobile-first CSS
✅ Test on multiple screen sizes
✅ Use CSS variables for theming
✅ Keep code clean and simple
✅ Reuse existing patterns
✅ Add descriptive alt text to images

### DON'T:
❌ Use absolute paths
❌ Invent content (always extract from original)
❌ Add frameworks or libraries
❌ Use inline styles
❌ Create unnecessary divs
❌ Over-engineer solutions
❌ Copy Elementor markup
❌ Skip testing on mobile
❌ Forget to add Font Awesome CDN link
❌ Use placeholder images (always use real ones)

---

## Future Development Notes

### Multi-language Support
The site has 3 languages (EN, FR, NL):
- Structure: `/index.html` (EN), `/fr/index.html` (FR), `/nl/index.html` (NL)
- Keep same structure across languages
- Only translate text content, not code
- Update language switcher links

### Additional Pages to Build
- `/pages/tango-classes.html` (with tabs for different class types)
- `/pages/free-trial.html` (with booking form)
- `/pages/contact.html` (with form and map)
- `/pages/about.html` (about Sonja & Sven)

### Performance Optimization
- Consider lazy loading images
- Minify CSS/JS for production
- Add caching headers (when on server)
- Optimize images further if needed

---

## Tools & Resources

### Browser Dev Tools
- Use Chrome DevTools to inspect original site
- Take screenshots for comparison
- Check responsive breakpoints
- Debug layout issues

### Font Awesome
- Icons CDN: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
- Search icons: https://fontawesome.com/icons
- Remember to use correct prefix (fas, far, fab)

### Google Fonts
- Poppins: https://fonts.google.com/specimen/Poppins
- Always preconnect to fonts.googleapis.com and fonts.gstatic.com

---

## Contact & Support

**Website:** BE-TANGO - Argentine Tango Dance School
**Location:** Brussels & Woluwe, Belgium
**Phone:** +32 498 39 29 39
**Instructors:** Sonja & Sven

---

*This manual was created by Claude to document the BE-TANGO website rebuild process. Last updated: 2026-02-03*
