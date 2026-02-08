# BE-TANGO Blog Implementation - Complete Documentation

**Project:** BE-TANGO Website Rebuild
**Component:** Blog System
**Status:** ✅ Complete and Integrated
**Date:** February 5, 2026
**Version:** 1.0

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [File Structure](#3-file-structure)
4. [Blog Features](#4-blog-features)
5. [Technical Implementation](#5-technical-implementation)
6. [Content Management](#6-content-management)
7. [Navigation Integration](#7-navigation-integration)
8. [Multilingual Support](#8-multilingual-support)
9. [Responsive Design](#9-responsive-design)
10. [SEO Implementation](#10-seo-implementation)
11. [Maintenance Guide](#11-maintenance-guide)
12. [Future Enhancements](#12-future-enhancements)

---

## 1. Overview

### 1.1 Purpose

The BE-TANGO blog serves as an educational content hub for Argentine tango enthusiasts, providing:
- Historical information about tango
- Technical guides on styles and techniques
- Practical tips for dancers
- Cultural context and terminology
- Event information

### 1.2 Scope

**Content Coverage:**
- 17 total articles across 3 languages
- 5 core topics in English
- 6 articles in Dutch (including exclusive content)
- 6 articles in French (including exclusive content)

**Integration Points:**
- Main navigation header
- Footer navigation
- Language switcher
- Homepage links
- Internal cross-linking

### 1.3 Key Metrics

```
Total Articles:              17
Languages:                   3 (EN, NL, FR)
Blog Listing Pages:          3
Article Pages:               17
Total Blog Pages:            20
Navigation Links Added:      6
CSS Code for Blog:           ~500 lines
JavaScript Functions:        3 (mobile menu, language toggle, scroll)
```

---

## 2. Architecture

### 2.1 System Design

```
BE-TANGO Website
│
├── English Site (/)
│   ├── index.html
│   └── blog/
│       ├── index.html (listing)
│       ├── articles-en.json (metadata)
│       └── [article-slug]/
│           └── index.html
│
├── Dutch Site (/nl/)
│   ├── index.html
│   └── blog/
│       ├── index.html (listing)
│       ├── articles-nl.json (metadata)
│       └── [article-slug]/
│           └── index.html
│
└── French Site (/fr/)
    ├── index.html
    └── blog/
        ├── index.html (listing)
        ├── articles-fr.json (metadata)
        └── [article-slug]/
            └── index.html
```

### 2.2 Design Philosophy

**Core Principles:**
1. **Static HTML** - No database, CMS, or server-side processing required
2. **Mobile-First** - Responsive design from smallest to largest screens
3. **Semantic HTML5** - Proper use of article, header, nav, footer elements
4. **Vanilla JavaScript** - No external libraries or frameworks
5. **Brand Consistency** - Matches main website design system
6. **SEO-Optimized** - Structured data, meta tags, semantic markup

### 2.3 Technology Stack

```
HTML5           - Semantic markup
CSS3            - Custom properties, grid, flexbox
JavaScript ES6  - Vanilla JS, no libraries
Schema.org      - Structured data (JSON-LD)
Font Awesome 6  - Icons
Google Fonts    - Poppins typography
```

---

## 3. File Structure

### 3.1 Directory Organization

```
be-tango-rebuild/
│
├── blog/                                    # English blog
│   ├── index.html                          # Blog listing page
│   ├── articles-en.json                    # Article metadata
│   ├── README.md                           # Documentation
│   │
│   ├── history-of-argentine-tango/
│   │   └── index.html
│   │
│   ├── different-styles-of-argentine-tango/
│   │   └── index.html
│   │
│   ├── difference-between-tango-milonga-vals/
│   │   └── index.html
│   │
│   ├── argentine-tango-ballroom-tango-differences/
│   │   └── index.html
│   │
│   └── why-learn-tango/
│       └── index.html
│
├── nl/blog/                                 # Dutch blog
│   ├── index.html
│   ├── articles-nl.json
│   ├── generate-articles.py               # Article generation script
│   ├── BLOG-SUMMARY.md
│   │
│   ├── de-geschiedenis-van-de-argentijnse-tango/
│   ├── de-verschillende-dansstijlen-van-de-argentijnse-tango/
│   ├── het-verschil-tussen-tango-vals-en-milonga/
│   ├── argentijnse-tango-vs-ballroomtango-de-verschillen-en-gelijkenissen/
│   ├── tango-woordenboek/
│   └── tango-evenementen-in-brussel-en-omstreken/
│
├── fr/blog/                                 # French blog
│   ├── index.html
│   ├── articles-fr.json
│   ├── BLOG-SUMMARY.md
│   │
│   ├── histoire-du-tango-argentin/
│   ├── les-differents-styles-du-tango-argentin/
│   ├── difference-entre-tango-valse-et-milonga/
│   ├── tango-argentin-vs-tango-de-salon/
│   ├── dictionnaire-de-tango/
│   └── conseils-pour-chaussures-de-tango/
│
├── images/blog/                            # Blog images
│   ├── history-prague-tango-marathon.jpg
│   ├── styles-candombe.jpg
│   └── [other-blog-images]
│
├── css/
│   └── styles.css                          # Blog styles included
│
└── BLOG-COMPLETE.md                        # This file
```

### 3.2 Naming Conventions

**Article Slug Format:**
- Lowercase
- Hyphens for spaces
- Descriptive keywords
- Language-specific translations

**Examples:**
```
EN: history-of-argentine-tango
NL: de-geschiedenis-van-de-argentijnse-tango
FR: histoire-du-tango-argentin
```

---

## 4. Blog Features

### 4.1 Blog Listing Page Features

**Layout:**
- Hero section with gradient background
- Descriptive tagline and introduction
- 3-column responsive grid (mobile: 1 col, tablet: 2-3 cols, desktop: 3 cols)
- Article cards with consistent height

**Article Card Components:**
- Featured image (lazy loaded)
- Article metadata:
  - Author with icon
  - Publication date with calendar icon
  - Reading time with clock icon
- Article title (H3)
- Short excerpt (2-3 sentences)
- "Read More" link with arrow icon
- Hover effects (lift and shadow)

**Navigation:**
- Full site header with active Blog link
- Language switcher for blog listing
- Footer with all site links

**File Location:** `/blog/index.html`, `/nl/blog/index.html`, `/fr/blog/index.html`

### 4.2 Blog Article Page Features

**Article Header:**
- Back to Blog link (top left)
- Article title (H1)
- Article metadata bar (author, date, read time)
- Featured image

**Content Area:**
- Rich text content with proper typography
- Heading hierarchy (H2, H3)
- Paragraphs with optimal line height (1.8)
- Bulleted and numbered lists
- Emphasis (bold, italic)
- Quotes and callouts (optional)

**Navigation:**
- Full site header with Blog link
- Language switcher to article translations
- Footer with site links

**Metadata:**
- SEO title and description
- Keywords
- Author
- Structured data (JSON-LD)

### 4.3 Design Elements

**Colors:**
```css
Primary Gold:     #E2C033  (buttons, accents)
Dark Navy:        #1c244b  (backgrounds, text)
Text Dark:        #333333  (body text)
Text Light:       #666666  (meta info)
Background Light: #f8f9fa  (alternating sections)
White:            #ffffff  (cards, content)
```

**Typography:**
```css
Font Family:      Poppins (Google Fonts)
Weights:          300, 400, 500, 600, 700

Blog Hero H1:     3rem (desktop), 2.5rem (mobile)
Article Title:    2.5rem (desktop), 2rem (mobile)
Article H2:       2rem
Article H3:       1.5rem
Body Text:        1rem (16px base)
Meta Info:        0.875rem
```

**Spacing:**
```css
Section Padding:  var(--spacing-xl) (2rem)
Card Padding:     var(--spacing-lg) (1.5rem)
Grid Gap:         var(--spacing-lg)
Margins:          Consistent rhythm using spacing variables
```

---

## 5. Technical Implementation

### 5.1 HTML Structure

**Blog Listing Page Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Blog description">
  <title>Blog - BE-TANGO</title>

  <!-- Styles -->
  <link rel="stylesheet" href="../css/styles.css">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "BE-TANGO Blog",
    "publisher": {
      "@type": "DanceSchool",
      "name": "BE-TANGO"
    }
  }
  </script>
</head>
<body>
  <!-- HEADER -->
  <header class="site-header">
    <nav>
      <!-- Navigation with Blog link active -->
    </nav>
  </header>

  <!-- MAIN CONTENT -->
  <main>
    <!-- Blog Hero -->
    <section class="blog-hero">
      <div class="container">
        <h1>Latest News & Articles</h1>
        <p class="hero-tagline">Description</p>
      </div>
    </section>

    <!-- Articles Grid -->
    <section>
      <div class="container">
        <div class="grid grid-3">
          <!-- Article cards -->
        </div>
      </div>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="site-footer">
    <!-- Footer content -->
  </footer>
</body>
</html>
```

**Blog Article Page Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags (unique per article) -->
  <meta name="description" content="Article description">
  <meta name="keywords" content="article, keywords">
  <meta name="author" content="Sonja">
  <title>Article Title | BE-TANGO Blog</title>

  <!-- JSON-LD BlogPosting Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Article Title",
    "author": { "@type": "Person", "name": "Sonja" },
    "datePublished": "2025-02-01",
    "publisher": { "@type": "DanceSchool", "name": "BE-TANGO" }
  }
  </script>
</head>
<body>
  <header class="site-header">
    <!-- Full navigation -->
  </header>

  <main>
    <!-- Back to Blog Link -->
    <section>
      <div class="container">
        <a href="../index.html" class="back-to-blog">
          <i class="fas fa-arrow-left"></i> Back to Blog
        </a>
      </div>
    </section>

    <!-- Article Header -->
    <article class="blog-article">
      <header class="article-header">
        <h1>Article Title</h1>
        <div class="article-meta">
          <span class="article-author">
            <i class="fas fa-user"></i> Sonja
          </span>
          <span class="article-date">
            <i class="far fa-calendar"></i> Feb 1, 2025
          </span>
          <span class="article-readtime">
            <i class="far fa-clock"></i> 3 min read
          </span>
        </div>
      </header>

      <!-- Article Content -->
      <div class="article-content">
        <!-- Rich text content -->
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <!-- Footer -->
  </footer>
</body>
</html>
```

### 5.2 CSS Implementation

**Blog-Specific Styles (in styles.css):**

```css
/* ===================================
   BLOG STYLES
   =================================== */

/* Blog Hero Section */
.blog-hero {
  background: linear-gradient(135deg,
    rgba(28, 36, 75, 0.95) 0%,
    rgba(0, 0, 0, 0.85) 100%);
  color: var(--color-white);
  padding: var(--spacing-2xl) 0;
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.blog-hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.blog-hero h1 {
  color: var(--color-white);
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.blog-hero .hero-tagline {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
}

/* Article Meta Information */
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  color: var(--color-text-light);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Back to Blog Link */
.back-to-blog {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
}

.back-to-blog:hover {
  gap: 0.75rem;
  color: var(--color-primary);
}

/* Blog Article Layout */
.blog-article {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.article-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.article-header h1 {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

.article-content {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--color-text);
}

.article-content h2 {
  font-size: 2rem;
  margin-top: var(--spacing-2xl);
  margin-bottom: var(--spacing-md);
  color: var(--color-dark-navy);
}

.article-content h3 {
  font-size: 1.5rem;
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  color: var(--color-dark-navy);
}

.article-content p {
  margin-bottom: var(--spacing-lg);
}

.article-content ul,
.article-content ol {
  margin-bottom: var(--spacing-lg);
  padding-left: var(--spacing-lg);
}

.article-content li {
  margin-bottom: var(--spacing-sm);
}

.article-content strong {
  font-weight: 600;
  color: var(--color-dark-navy);
}

/* Responsive Adjustments */
@media (min-width: 768px) {
  .blog-hero {
    padding: var(--spacing-2xl) 0 3rem;
  }

  .blog-hero h1 {
    font-size: 3rem;
  }

  .article-header h1 {
    font-size: 3rem;
  }
}

@media (max-width: 767px) {
  .blog-hero h1 {
    font-size: 2rem;
  }

  .article-header h1 {
    font-size: 2rem;
  }

  .article-content {
    font-size: 1rem;
  }
}
```

### 5.3 JavaScript Functionality

**Mobile Menu Toggle:**
```javascript
const menuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);

    if (window.innerWidth < 768) {
      mainNav.style.display = isExpanded ? 'none' : 'block';
      menuToggle.classList.toggle('active');
    }
  });
}
```

**Language Switcher:**
```javascript
const languageToggle = document.querySelector('.language-toggle');
const languageDropdown = document.querySelector('.language-dropdown');

if (languageToggle && languageDropdown) {
  languageToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = languageToggle.getAttribute('aria-expanded') === 'true';
    languageToggle.setAttribute('aria-expanded', !isExpanded);
    languageDropdown.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.language-switcher')) {
      languageToggle.setAttribute('aria-expanded', 'false');
      languageDropdown.classList.remove('active');
    }
  });
}
```

---

## 6. Content Management

### 6.1 Article Metadata System

**articles-en.json Structure:**
```json
{
  "articles": [
    {
      "id": "history-of-argentine-tango",
      "title": "History of Argentine Tango",
      "slug": "history-of-argentine-tango",
      "author": "Sonja",
      "date": "2025-02-01",
      "dateModified": "2025-02-04",
      "readTime": "3 min read",
      "excerpt": "Argentine tango emerged in late 19th-century Buenos Aires...",
      "image": "../images/blog/history-prague-tango-marathon.jpg",
      "imageAlt": "Prague Tango Marathon",
      "translations": {
        "nl": "../nl/blog/de-geschiedenis-van-de-argentijnse-tango/index.html",
        "fr": "../fr/blog/histoire-du-tango-argentin/index.html"
      }
    }
  ]
}
```

**Usage:**
- Centralized metadata for all articles
- Used by article generation scripts
- Easy to update and maintain
- Supports translations mapping

### 6.2 Adding a New Article

**Step-by-Step Process:**

1. **Create Article Directory:**
   ```bash
   mkdir blog/new-article-slug
   ```

2. **Create index.html:**
   - Copy template from existing article
   - Update meta tags (title, description, keywords)
   - Update JSON-LD structured data
   - Write article content
   - Update language switcher links

3. **Add Featured Image:**
   - Save image to `images/blog/`
   - Use WebP or JPG format
   - Optimize for web (< 100KB recommended)

4. **Update articles-en.json:**
   ```json
   {
     "id": "new-article-slug",
     "title": "New Article Title",
     "slug": "new-article-slug",
     "author": "Sonja",
     "date": "2026-02-05",
     "dateModified": "2026-02-05",
     "readTime": "4 min read",
     "excerpt": "Brief description...",
     "image": "../images/blog/new-image.jpg",
     "imageAlt": "Image description"
   }
   ```

5. **Update Blog Listing Page:**
   - Add new article card to `blog/index.html`
   - Include image, metadata, excerpt, link

6. **Create Translations (if applicable):**
   - Translate article content
   - Create Dutch version in `/nl/blog/`
   - Create French version in `/fr/blog/`
   - Update language switcher links

7. **Test:**
   - Check article displays correctly
   - Verify all links work
   - Test responsive design
   - Validate HTML and metadata

### 6.3 Content Guidelines

**Writing Style:**
- Clear and accessible language
- Short paragraphs (3-4 sentences)
- Use headings for structure
- Include lists for readability
- Bold key terms on first use
- Friendly, educational tone

**Length:**
- Minimum: 500 words
- Ideal: 800-1,200 words
- Maximum: 2,000 words

**SEO Best Practices:**
- Include target keyword in title
- Use keyword in first paragraph
- Add keyword to headings naturally
- Write descriptive meta description (155 chars)
- Use alt text on images
- Internal link to related articles

---

## 7. Navigation Integration

### 7.1 Header Navigation

**Location:** Top of every page
**Blog Link Position:** After "Contact", before "Language Switcher"

**Navigation Structure:**
```
Home | Tango Classes | Free Trial | Contact | Blog | [Language Switcher]
```

**Active State:**
- Blog link has `.active` class on blog pages
- Visual indicator (gold color or underline)

**Code Implementation:**
```html
<nav class="main-nav">
  <ul class="nav-list">
    <li><a href="../index.html">Home</a></li>
    <li><a href="../tango-classes/index.html">Tango Classes</a></li>
    <li><a href="../tango-classes/free-trial/index.html">Free Trial</a></li>
    <li><a href="../contact/index.html">Contact</a></li>
    <li><a href="../blog/index.html" class="active">Blog</a></li>
    <li class="language-switcher">...</li>
  </ul>
</nav>
```

### 7.2 Footer Navigation

**Location:** Bottom of every page
**Section:** Quick Links column

**Footer Structure:**
```
Quick Links:
- Home
- Tango Classes
- Free Trial
- Blog (NEW)
- Contact
```

**Code Implementation:**
```html
<div class="footer-col">
  <h4>Quick Links</h4>
  <ul>
    <li><a href="index.html">Home</a></li>
    <li><a href="tango-classes/index.html">Tango Classes</a></li>
    <li><a href="tango-classes/free-trial/index.html">Free Trial</a></li>
    <li><a href="blog/index.html">Blog</a></li>
    <li><a href="contact/index.html">Contact</a></li>
  </ul>
</div>
```

### 7.3 Breadcrumb Navigation

**Implementation Status:** Not currently implemented
**Future Enhancement:** Consider adding breadcrumbs for deeper navigation

**Proposed Structure:**
```
Home > Blog > Article Title
```

---

## 8. Multilingual Support

### 8.1 Language Structure

**Supported Languages:**
1. **English (EN)** - Primary language, base path `/blog/`
2. **Dutch (NL)** - Secondary language, path `/nl/blog/`
3. **French (FR)** - Secondary language, path `/fr/blog/`

### 8.2 Translation Mapping

**Cross-Language Article Mapping:**

| English | Dutch | French |
|---------|-------|--------|
| history-of-argentine-tango | de-geschiedenis-van-de-argentijnse-tango | histoire-du-tango-argentin |
| different-styles-of-argentine-tango | de-verschillende-dansstijlen-van-de-argentijnse-tango | les-differents-styles-du-tango-argentin |
| difference-between-tango-milonga-vals | het-verschil-tussen-tango-vals-en-milonga | difference-entre-tango-valse-et-milonga |
| argentine-tango-ballroom-tango-differences | argentijnse-tango-vs-ballroomtango-de-verschillen-en-gelijkenissen | tango-argentin-vs-tango-de-salon |

### 8.3 Language Switcher Implementation

**On Blog Listing Pages:**
```html
<li class="language-switcher">
  <button class="language-toggle">
    <i class="fas fa-globe"></i>
    <span class="current-lang">EN</span>
    <i class="fas fa-chevron-down"></i>
  </button>
  <ul class="language-dropdown">
    <li>
      <a href="../nl/blog/index.html">
        <span class="flag-icon">🇳🇱</span>
        <span>Nederlands</span>
      </a>
    </li>
    <li>
      <a href="index.html" class="active">
        <span class="flag-icon">🇬🇧</span>
        <span>English</span>
      </a>
    </li>
    <li>
      <a href="../fr/blog/index.html">
        <span class="flag-icon">🇫🇷</span>
        <span>Français</span>
      </a>
    </li>
  </ul>
</li>
```

**On Blog Article Pages:**
```html
<!-- Links to same article in different languages -->
<li>
  <a href="../../nl/blog/de-geschiedenis-van-de-argentijnse-tango/index.html">
    <span class="flag-icon">🇳🇱</span>
    <span>Nederlands</span>
  </a>
</li>
```

### 8.4 Translation Guidelines

**Content Translation:**
- Maintain same structure across languages
- Translate article titles naturally (not literal)
- Adapt cultural references when needed
- Keep technical terms in original language if appropriate
- Update examples to be locally relevant

**Metadata Translation:**
- Translate meta descriptions
- Translate keywords
- Keep author name consistent
- Use same publication date
- Update URL slug in target language

---

## 9. Responsive Design

### 9.1 Breakpoints

**Mobile:** `< 768px`
- Single column layout
- Stacked article cards
- Hamburger menu
- Full-width images
- Larger tap targets

**Tablet:** `768px - 1024px`
- 2-column grid (some sections 3-column)
- Horizontal navigation
- Optimal reading width
- Larger typography

**Desktop:** `> 1024px`
- 3-column grid
- Full navigation bar
- Max content width for readability
- Hover effects enabled
- Larger spacing

### 9.2 Responsive Grid System

**CSS Grid Implementation:**
```css
.grid {
  display: grid;
  gap: var(--spacing-lg);
}

.grid-3 {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 9.3 Mobile-Specific Features

**Touch-Friendly:**
- Minimum button size: 44x44px
- Adequate spacing between links
- Swipeable carousels (if implemented)
- No hover-dependent functionality

**Performance:**
- Lazy loading images (`loading="lazy"`)
- Optimized image sizes
- Minimal JavaScript
- CSS-only animations

### 9.4 Typography Scaling

**Fluid Typography:**
```css
/* Mobile */
.blog-hero h1 { font-size: 2rem; }
.article-content { font-size: 1rem; }

/* Tablet */
@media (min-width: 768px) {
  .blog-hero h1 { font-size: 2.5rem; }
  .article-content { font-size: 1.125rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .blog-hero h1 { font-size: 3rem; }
  .article-content { font-size: 1.125rem; }
}
```

---

## 10. SEO Implementation

### 10.1 On-Page SEO

**Every Page Includes:**
- ✅ Unique title tag (< 60 characters)
- ✅ Unique meta description (< 160 characters)
- ✅ Meta keywords
- ✅ Author meta tag
- ✅ Viewport meta tag
- ✅ Charset declaration (UTF-8)
- ✅ Language declaration (`lang` attribute)

**Example Meta Tags:**
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Discover the fascinating history of Argentine tango from its origins in 19th-century Buenos Aires to its global revival.">
<meta name="keywords" content="Argentine tango history, tango origins, Buenos Aires, milonga, tango evolution">
<meta name="author" content="Sonja">
<title>History of Argentine Tango | BE-TANGO Blog</title>
```

### 10.2 Structured Data (Schema.org)

**Blog Listing Page Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "BE-TANGO Blog",
  "description": "Articles about Argentine tango history, styles, techniques, and tips",
  "url": "https://www.be-tango.be/blog/",
  "publisher": {
    "@type": "DanceSchool",
    "name": "BE-TANGO",
    "url": "https://www.be-tango.be"
  }
}
```

**Blog Article Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "History of Argentine Tango",
  "description": "Discover the fascinating history...",
  "author": {
    "@type": "Person",
    "name": "Sonja"
  },
  "datePublished": "2025-02-01",
  "dateModified": "2025-02-04",
  "publisher": {
    "@type": "DanceSchool",
    "name": "BE-TANGO",
    "url": "https://www.be-tango.be"
  },
  "image": "https://www.be-tango.be/images/blog/prague-tango-marathon.jpg"
}
```

### 10.3 Semantic HTML

**Proper Element Usage:**
- `<article>` for blog posts
- `<header>` for page header
- `<nav>` for navigation menus
- `<main>` for main content
- `<section>` for content sections
- `<footer>` for page footer
- Heading hierarchy (H1 → H2 → H3)

### 10.4 Internal Linking

**Cross-Linking Strategy:**
- Homepage links to blog listing
- Blog listing links to all articles
- Articles link back to blog listing
- Articles can link to related articles
- Footer provides blog access from all pages

### 10.5 Image SEO

**Best Practices:**
- Descriptive file names (`history-prague-tango-marathon.jpg`)
- Alt text on all images
- Optimized file sizes (< 100KB when possible)
- Lazy loading for below-fold images
- WebP format for better compression

---

## 11. Maintenance Guide

### 11.1 Regular Maintenance Tasks

**Monthly:**
- Review analytics for popular articles
- Check for broken links
- Update article dates if content modified
- Monitor page load times
- Review and respond to comments (if implemented)

**Quarterly:**
- Audit all articles for accuracy
- Update outdated information
- Refresh images if needed
- Review SEO performance
- Plan new content topics

**Annually:**
- Comprehensive content audit
- Update copyright year in footer
- Review and update brand colors/styles
- Major content expansion planning

### 11.2 Content Updates

**Updating Existing Article:**

1. Open article file: `blog/article-slug/index.html`
2. Make content changes
3. Update `dateModified` in JSON-LD
4. Update `dateModified` in metadata JSON
5. Test changes locally
6. Upload to server

**Archiving Old Content:**
- Move article to `/archive/` subdirectory
- Remove from blog listing
- Add redirect (if using server-side redirects)
- Update sitemap

### 11.3 Backup Procedures

**What to Backup:**
- All HTML files
- Articles metadata JSON files
- Blog images
- Custom CSS/JS
- Documentation files

**Backup Frequency:**
- Before major changes: Always
- Routine backup: Weekly
- Full site backup: Monthly

**Backup Location:**
- Local drive backup
- Cloud storage (Google Drive, Dropbox)
- Version control (Git repository)

### 11.4 Troubleshooting Common Issues

**Issue: Article not displaying on listing**
- Check if article added to blog index.html
- Verify image path is correct
- Ensure metadata is complete

**Issue: Broken links**
- Verify relative paths are correct
- Check for typos in file names
- Ensure all files uploaded to server

**Issue: Images not loading**
- Check file path (relative vs absolute)
- Verify image exists in /images/blog/
- Check file name capitalization
- Ensure image format supported (.jpg, .png, .webp)

**Issue: Language switcher not working**
- Verify translation paths are correct
- Check that corresponding article exists
- Ensure JavaScript is loaded

---

## 12. Future Enhancements

### 12.1 Planned Features

**Short-term (1-3 months):**
- [ ] Add more articles (goal: 10+ per language)
- [ ] Implement article categories/tags
- [ ] Add social sharing buttons
- [ ] Create RSS feed
- [ ] Add print stylesheet

**Medium-term (3-6 months):**
- [ ] Article search functionality
- [ ] Related articles section
- [ ] Newsletter signup integration
- [ ] Comment system (Disqus or native)
- [ ] Reading progress indicator

**Long-term (6-12 months):**
- [ ] Blog post templates for easy creation
- [ ] Automated article generation from JSON
- [ ] Analytics dashboard
- [ ] Content recommendation engine
- [ ] Mobile app integration

### 12.2 Potential Integrations

**Newsletter:**
- Mailchimp or ConvertKit
- Email capture on blog pages
- Weekly/monthly digest

**Social Media:**
- Auto-post to Facebook
- Share to Instagram
- Twitter/X integration

**Analytics:**
- Google Analytics 4
- Plausible (privacy-friendly)
- Custom analytics dashboard

**Comments:**
- Disqus
- Commento
- Native comment system

### 12.3 Performance Optimization

**Future Optimizations:**
- Convert all images to WebP format
- Implement service worker for offline support
- Add critical CSS inline
- Lazy load below-fold content
- Implement static site generator (Hugo, Jekyll)
- Add CDN for image delivery

### 12.4 Content Expansion Ideas

**New Article Topics:**
1. "Top 10 Tango Songs for Beginners"
2. "How to Find Your Tango Community"
3. "Tango Festivals Around the World"
4. "Tango Fashion: What to Wear"
5. "Interview with Professional Tango Dancers"
6. "Tango Music Genres Explained"
7. "Common Mistakes Beginners Make"
8. "Advanced Tango Techniques"
9. "The Art of the Abrazo (Embrace)"
10. "Tango Etiquette: Do's and Don'ts"

### 12.5 Accessibility Improvements

**WCAG 2.1 Compliance:**
- Add skip to main content link
- Improve keyboard navigation
- Increase color contrast ratios
- Add ARIA labels where needed
- Provide text alternatives for all media
- Ensure all interactive elements are keyboard accessible

---

## 13. Conclusion

The BE-TANGO blog system is **fully implemented, tested, and integrated** into the main website. It provides:

✅ **17 high-quality articles** across 3 languages
✅ **Seamless navigation** integration
✅ **Responsive design** for all devices
✅ **SEO optimization** with structured data
✅ **Multilingual support** with language switcher
✅ **Brand consistency** with main website
✅ **Easy content management** for future updates

The blog serves as a valuable educational resource for BE-TANGO students and tango enthusiasts, enhancing the website's content offering and improving SEO performance.

---

## Appendix A: Quick Reference Commands

**Create New Article Directory:**
```bash
mkdir -p blog/new-article-slug
```

**Copy Template:**
```bash
cp blog/template.html blog/new-article-slug/index.html
```

**Test Locally:**
```bash
# Open in browser
open index.html
```

**Check for Broken Links (requires wget):**
```bash
wget --spider -r -nd -nv -o blog-links.log http://localhost/blog/
```

---

## Appendix B: File Checklist for New Articles

- [ ] Create article directory
- [ ] Create index.html with content
- [ ] Add featured image to /images/blog/
- [ ] Update articles-[lang].json
- [ ] Add article card to blog listing page
- [ ] Update JSON-LD structured data
- [ ] Write unique meta description
- [ ] Add meta keywords
- [ ] Create language translations
- [ ] Update language switcher links
- [ ] Test all links
- [ ] Test responsive design
- [ ] Validate HTML
- [ ] Check image alt text
- [ ] Verify reading time estimate
- [ ] Upload to server
- [ ] Test on live site

---

## Appendix C: Contact Information

**Project:** BE-TANGO Website
**Website:** https://www.be-tango.be
**Blog Location:** https://www.be-tango.be/blog/

**For Blog Questions:**
- Content: Sonja (BE-TANGO)
- Technical: Development team

**Last Updated:** February 5, 2026
**Documentation Version:** 1.0
**Status:** Complete ✅

---

*End of Documentation*
