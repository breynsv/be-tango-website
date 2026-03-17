# BE-TANGO Website Management Guide

**Complete guide for managing the BE-TANGO website with Claude Code**

---

## Table of Contents

1. [Site Structure Overview](#site-structure-overview)
2. [Adding a New Blog Post](#adding-a-new-blog-post)
3. [Updating Class Schedules](#updating-class-schedules)
4. [Deployment Guide](#deployment-guide)
5. [Common Tasks & Example Prompts](#common-tasks--example-prompts)
6. [Troubleshooting](#troubleshooting)

---

## Site Structure Overview

### Directory Layout

```
be-tango-rebuild/
├── index.html                    # English homepage
├── css/
│   ├── styles.css               # Main stylesheet (unminified)
│   ├── styles.min.css           # Minified production version
│   ├── form-validation.css      # Form validation styles
│   ├── skeleton-loading.css     # Loading placeholders
│   └── cookie-consent.css       # Cookie banner styles
├── js/
│   ├── crm-api.js              # CRM API integration
│   ├── schedule-loader.js       # Dynamic class schedules
│   ├── enrollment-form.js       # Free trial form handler
│   ├── form-validation.js       # Client-side validation
│   └── cookie-consent.js        # Cookie consent banner
├── images/
│   ├── logo-be-tango.png       # Main logo
│   ├── blog/                    # Blog post images
│   └── *.webp                   # Optimized images
├── blog/                        # English blog posts
│   ├── index.html              # Blog index page
│   ├── why-learn-tango/
│   │   └── index.html
│   └── [post-slug]/
│       └── index.html
├── tango-classes/              # English class pages
│   ├── index.html              # Classes overview
│   ├── free-trial/
│   │   └── index.html
│   ├── beginners/
│   ├── experienced/
│   ├── private/
│   ├── online/
│   ├── brussels/
│   └── woluwe/
├── contact/
│   └── index.html
├── links/
│   └── index.html
├── privacy-policy/
│   └── index.html
├── terms-and-conditions/
│   └── index.html
├── fr/                         # French version (same structure)
│   ├── index.html
│   ├── blog/
│   ├── cours-de-tango/
│   ├── contactez-nous/
│   ├── liens/
│   └── ...
└── nl/                         # Dutch version (same structure)
    ├── index.html
    ├── blog/
    ├── tangolessen/
    ├── contacteer-ons/
    ├── links/
    └── ...
```

### Multi-Language Structure

The site supports three languages with parallel structures:

- **English (EN)**: Root level (`/blog/`, `/tango-classes/`)
- **French (FR)**: `/fr/` prefix (`/fr/blog/`, `/fr/cours-de-tango/`)
- **Dutch (NL)**: `/nl/` prefix (`/nl/blog/`, `/nl/tangolessen/`)

### Key Files to Know

| File | Purpose |
|------|---------|
| `css/styles.css` | Main stylesheet - edit this, then minify |
| `css/styles.min.css` | Production version - don't edit directly |
| `js/crm-api.js` | CRM backend integration config |
| `sitemap.xml` | SEO sitemap - update after adding pages |
| `robots.txt` | Search engine crawler instructions |

---

## Adding a New Blog Post

### Overview

Each blog post needs to be created in **all three languages** with matching structure and images.

### Step-by-Step Process

#### 1. Create Directory Structure

```bash
# Create directories for all three languages
blog/[post-slug]/
fr/blog/[post-slug]/
nl/blog/[post-slug]/
```

#### 2. Create Blog Post HTML

Each blog post follows this template structure:

**File locations:**
- English: `blog/[post-slug]/index.html`
- French: `fr/blog/[post-slug]/index.html`
- Dutch: `nl/blog/[post-slug]/index.html`

**Template Structure:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="[Post description - 150-160 characters]">
  <meta name="keywords" content="[relevant, keywords, here]">
  <meta name="author" content="Sonja & Sven">
  <title>[Post Title] | BE-TANGO Blog</title>
  <link rel="canonical" href="https://www.be-tango.be/blog/[post-slug]/">

  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="[Post Title] | BE-TANGO Blog">
  <meta property="og:description" content="[Post description]">
  <meta property="og:url" content="https://www.be-tango.be/blog/[post-slug]/">
  <meta property="og:image" content="https://www.be-tango.be/images/blog/[featured-image].webp">
  <meta property="og:site_name" content="BE-TANGO">
  <meta property="og:locale" content="en_US">

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="[Post Title] | BE-TANGO Blog">
  <meta name="twitter:description" content="[Post description]">
  <meta name="twitter:image" content="https://www.be-tango.be/images/blog/[featured-image].webp">

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="../../images/cropped-favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../images/cropped-favicon-192x192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../../images/cropped-favicon-180x180.png">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <link rel="stylesheet" href="../../css/fontawesome.min.css?v=3.5">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"></noscript>

  <!-- Stylesheet -->
  <link rel="stylesheet" href="../../css/styles.min.css?v=3.5" media="print" onload="this.media='all';this.onload=null">
  <noscript><link rel="stylesheet" href="../../css/styles.min.css?v=3.5"></noscript>

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "[Post Title]",
    "description": "[Post description]",
    "image": "https://www.be-tango.be/images/blog/[featured-image].webp",
    "author": {
      "@type": "Person",
      "name": "Sonja & Sven"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BE-TANGO",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.be-tango.be/images/logo-be-tango.png"
      }
    },
    "datePublished": "2026-02-10",
    "dateModified": "2026-02-10"
  }
  </script>
</head>
<body>

  <!-- Skip to main content link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- HEADER -->
  <header class="site-header">
    <div class="container">
      <div class="header-content">
        <a href="../../" class="logo">
          <img src="../../images/logo-be-tango.png" alt="BE-TANGO" width="200" height="34" loading="lazy">
        </a>

        <button class="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav class="main-nav" aria-label="Main navigation">
          <ul class="nav-list">
            <li><a href="../../">Home</a></li>
            <li class="nav-item-dropdown">
              <a href="../../tango-classes/">Tango Classes</a>
              <ul class="dropdown-menu">
                <li><a href="../../tango-classes/beginners/">Beginners</a></li>
                <li><a href="../../tango-classes/experienced/">Experienced</a></li>
                <li><a href="../../tango-classes/private/">Private Lessons</a></li>
                <li><a href="../../tango-classes/online/">Online Classes</a></li>
                <li><a href="../../tango-classes/brussels/">Brussels</a></li>
                <li><a href="../../tango-classes/woluwe/">Woluwe</a></li>
              </ul>
            </li>
            <li><a href="../../tango-classes/free-trial/" class="btn btn-primary btn-nav">Free Trial</a></li>
            <li><a href="../" class="active" aria-current="page">Blog</a></li>
            <li><a href="../../contact/">Contact</a></li>
            <!-- Language switcher here -->
          </ul>
        </nav>
      </div>
    </div>
  </header>

  <!-- MAIN CONTENT -->
  <main id="main-content">

    <!-- Article Header -->
    <article class="blog-article">
      <header class="article-header">
        <div class="container">
          <nav class="breadcrumb">
            <a href="../../">Home</a> / <a href="../">Blog</a> / <span>[Post Title]</span>
          </nav>

          <h1>[Post Title]</h1>

          <div class="article-meta">
            <span class="article-author">By Sonja & Sven</span>
            <span class="article-date">February 10, 2026</span>
            <span class="article-read-time">5 min read</span>
          </div>
        </div>
      </header>

      <!-- Featured Image -->
      <div class="article-featured-image">
        <img src="../../images/blog/[featured-image].webp" alt="[Image description]" loading="lazy">
      </div>

      <!-- Article Content -->
      <div class="article-content">
        <div class="container container-narrow">

          <p class="article-intro">
            [Introduction paragraph - brief overview of the article]
          </p>

          <h2>[Section Heading]</h2>
          <p>[Content paragraph...]</p>

          <h3>[Subsection Heading]</h3>
          <p>[Content paragraph...]</p>

          <blockquote>
            <p>[Optional quote or callout]</p>
          </blockquote>

          <ul>
            <li>[List item 1]</li>
            <li>[List item 2]</li>
            <li>[List item 3]</li>
          </ul>

          <!-- Call to Action -->
          <div class="article-cta">
            <h3>Ready to start dancing?</h3>
            <p>Experience the magic of Argentine tango with our free trial class.</p>
            <a href="../../tango-classes/free-trial/" class="btn btn-primary btn-large">Book Your Free Trial</a>
          </div>

        </div>
      </div>

      <!-- Related Articles -->
      <aside class="related-articles">
        <div class="container">
          <h2>Related Articles</h2>
          <div class="grid grid-3">
            <!-- Add 3 related article cards here -->
          </div>
        </div>
      </aside>

    </article>

  </main>

  <!-- FOOTER -->
  <footer class="site-footer">
    <!-- Standard footer content -->
  </footer>

  <!-- Scripts -->
  <script src="../../js/enhancements.min.js?v=3.5" defer></script>
  <script>
    // Mobile menu toggle
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (menuToggle && mainNav) {
      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", !isExpanded);

        if (window.innerWidth < 768) {
          mainNav.classList.toggle("mobile-nav-open");
          menuToggle.classList.toggle("active");
        }
      });
    }
  </script>

</body>
</html>
```

#### 3. Add Images

Place blog post images in:
```
images/blog/[descriptive-name].webp
```

**Image requirements:**
- Format: WebP (for best compression)
- Featured image: 1200x630px (optimal for social media)
- In-article images: Max width 1200px
- File size: Keep under 200KB per image
- Alt text: Always include descriptive alt attributes

#### 4. Update Blog Index Pages

After creating a blog post, add it to the blog index pages:

**English:** `blog/index.html`
**French:** `fr/blog/index.html`
**Dutch:** `nl/blog/index.html`

Add a new article card to the blog listing:

```html
<article class="blog-card">
  <a href="[post-slug]/" class="blog-card-link">
    <div class="blog-card-image">
      <img src="../images/blog/[featured-image].webp" alt="[Image description]" loading="lazy">
    </div>
    <div class="blog-card-content">
      <h3>[Post Title]</h3>
      <p class="blog-card-excerpt">[Brief excerpt - 1-2 sentences]</p>
      <span class="blog-card-meta">February 10, 2026 • 5 min read</span>
    </div>
  </a>
</article>
```

#### 5. Update Sitemap

Add the new blog post URLs to `sitemap.xml`:

```xml
<url>
  <loc>https://www.be-tango.be/blog/[post-slug]/</loc>
  <lastmod>2026-02-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://www.be-tango.be/fr/blog/[post-slug]/</loc>
  <lastmod>2026-02-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://www.be-tango.be/nl/blog/[post-slug]/</loc>
  <lastmod>2026-02-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

---

## Updating Class Schedules

### Overview

Class schedules for free trial enrollment are maintained in the free trial form on **three pages** (one per language).

### Files to Update

1. **English:** `tango-classes/free-trial/index.html` (lines ~310-340)
2. **French:** `fr/cours-de-tango/essai-gratuit/index.html` (lines ~310-340)
3. **Dutch:** `nl/tangolessen/gratis-proefles/index.html` (lines ~310-340)

### Schedule Format

Each free trial page has a `<select>` dropdown with two `<optgroup>` sections (Brussels and Woluwe).

**Example structure:**

```html
<div class="form-group">
  <label for="class-date">Select your free class date <span class="required">*</span></label>
  <select id="class-date" name="class-date" required>
    <option value="">-- Select a date --</option>

    <!-- Brussels Classes -->
    <optgroup label="Brussels - Ecole de Gatti de Gamond (Monday 20:00-21:00)">
      <option value="Brussels - Monday 10 February 2026, 20:00-21:00">Monday 10 February 2026, 20:00-21:00</option>
      <option value="Brussels - Monday 17 February 2026, 20:00-21:00">Monday 17 February 2026, 20:00-21:00</option>
      <option value="Brussels - Monday 24 February 2026, 20:00-21:00">Monday 24 February 2026, 20:00-21:00</option>
      <option value="Brussels - Monday 3 March 2026, 20:00-21:00">Monday 3 March 2026, 20:00-21:00</option>
      <option value="Brussels - Monday 10 March 2026, 20:00-21:00">Monday 10 March 2026, 20:00-21:00</option>
      <option value="Brussels - Monday 17 March 2026, 20:00-21:00">Monday 17 March 2026, 20:00-21:00</option>
      <option value="Brussels - Monday 24 March 2026, 20:00-21:00">Monday 24 March 2026, 20:00-21:00</option>
      <option value="Brussels - Monday 31 March 2026, 20:00-21:00">Monday 31 March 2026, 20:00-21:00</option>
    </optgroup>

    <!-- Woluwe Classes -->
    <optgroup label="Woluwe - Le LAB (Thursday 19:30-20:30)">
      <option value="Woluwe - Thursday 12 February 2026, 19:30-20:30">Thursday 12 February 2026, 19:30-20:30</option>
      <option value="Woluwe - Thursday 19 February 2026, 19:30-20:30">Thursday 19 February 2026, 19:30-20:30</option>
      <option value="Woluwe - Thursday 26 February 2026, 19:30-20:30">Thursday 26 February 2026, 19:30-20:30</option>
      <option value="Woluwe - Thursday 5 March 2026, 19:30-20:30">Thursday 5 March 2026, 19:30-20:30</option>
      <option value="Woluwe - Thursday 12 March 2026, 19:30-20:30">Thursday 12 March 2026, 19:30-20:30</option>
      <option value="Woluwe - Thursday 19 March 2026, 19:30-20:30">Thursday 19 March 2026, 19:30-20:30</option>
      <option value="Woluwe - Thursday 26 March 2026, 19:30-20:30">Thursday 26 March 2026, 19:30-20:30</option>
      <option value="Woluwe - Thursday 2 April 2026, 19:30-20:30">Thursday 2 April 2026, 19:30-20:30</option>
    </optgroup>
  </select>
  <small class="form-help">Choose from available dates for the Spring 2026 semester</small>
</div>
```

### Step-by-Step Update Process

#### 1. Determine New Schedule

Decide on:
- Start date of new semester
- Number of weeks
- Which dates to include (skip holidays)

#### 2. Update All Three Language Versions

You **must** update the schedule in all three files:
- English
- French (translate day names and labels)
- Dutch (translate day names and labels)

**Important translation notes:**

| English | French | Dutch |
|---------|--------|-------|
| Monday | Lundi | Maandag |
| Thursday | Jeudi | Donderdag |
| Select a date | Sélectionnez une date | Selecteer een datum |
| Choose from available dates | Choisissez parmi les dates disponibles | Kies uit de beschikbare data |

#### 3. Format Dates Consistently

**English format:**
```
Monday 10 February 2026, 20:00-21:00
```

**French format:**
```
Lundi 10 février 2026, 20:00-21:00
```

**Dutch format:**
```
Maandag 10 februari 2026, 20:00-21:00
```

#### 4. Update Form Help Text

Update the semester reference in the help text:

**English:**
```html
<small class="form-help">Choose from available dates for the Spring 2026 semester</small>
```

**French:**
```html
<small class="form-help">Choisissez parmi les dates disponibles pour le semestre de printemps 2026</small>
```

**Dutch:**
```html
<small class="form-help">Kies uit de beschikbare data voor het voorjaarssemester 2026</small>
```

---

## Deployment Guide

### Development Environment

**Local server:** `http://localhost:3000`

Start local server:
```bash
cd /Users/svenbreynaert/Sites/BE-TANGO\ WEBSITE/be-tango-rebuild/
php -S localhost:3000
```

### Pre-Deployment Checklist

Before deploying to production:

- [ ] **Test all pages load correctly**
  - Homepage
  - All class pages
  - Blog pages
  - Contact form
  - Links page
  - Privacy policy / Terms

- [ ] **Test multi-language navigation**
  - Language switcher works on all pages
  - All internal links point to correct language version
  - No 404 errors

- [ ] **Test responsive design**
  - Mobile (< 768px)
  - Tablet (768px - 1024px)
  - Desktop (> 1024px)
  - Test mobile menu functionality

- [ ] **Test forms**
  - Free trial enrollment form submits correctly
  - Contact form works
  - Form validation displays error messages
  - Success messages appear

- [ ] **Check all images load**
  - No broken image links
  - Images are optimized (WebP format)
  - Alt text is present on all images

- [ ] **Verify CSS/JS files**
  - `styles.min.css` is up to date
  - All JavaScript files load without console errors
  - Cookie consent banner works
  - Form validation works

- [ ] **SEO Verification**
  - All pages have unique `<title>` tags
  - Meta descriptions are present
  - Open Graph tags are correct
  - Structured data (JSON-LD) is valid
  - Sitemap is updated
  - Canonical URLs are correct

- [ ] **Accessibility Check**
  - All images have alt text
  - Links have descriptive text
  - Forms have proper labels
  - Skip-to-content link works
  - Keyboard navigation works

### Deployment Steps

#### Option 1: Manual FTP/SFTP Upload

1. **Connect to hosting server** via FTP/SFTP client
2. **Upload changed files** to web root directory
3. **Clear server cache** (if applicable)
4. **Test live site** thoroughly

#### Option 2: Git Deployment

If using Git with the server:

```bash
# On local machine
git add .
git commit -m "Descriptive commit message"
git push origin main

# On server (via SSH)
cd /var/www/html/be-tango.be
git pull origin main
```

#### Option 3: Automated CI/CD

If using GitHub Actions or similar:

1. **Push to main branch** triggers automatic deployment
2. **Monitor deployment logs** for errors
3. **Test live site** after deployment completes

### Post-Deployment Verification

After deployment, verify:

1. **Homepage loads correctly**
   ```
   https://www.be-tango.be
   ```

2. **Check all language versions**
   ```
   https://www.be-tango.be/
   https://www.be-tango.be/fr/
   https://www.be-tango.be/nl/
   ```

3. **Test critical pages**
   - Free trial enrollment form
   - Contact form
   - Blog index pages
   - Class pages

4. **Verify external integrations**
   - CRM API connection (if applicable)
   - Form submissions reach correct endpoint
   - Google Analytics tracking (if configured)

5. **Check browser console**
   - No JavaScript errors
   - All assets load (CSS, JS, images)
   - No mixed content warnings (HTTP/HTTPS)

6. **Mobile responsiveness**
   - Test on actual mobile device
   - Check mobile menu works
   - Verify touch interactions

### Rollback Plan

If deployment causes issues:

1. **Keep backup of previous version** before deploying
2. **Have FTP/server access ready** for quick fixes
3. **Document what was changed** for easy rollback

**Quick rollback steps:**
```bash
# If using Git
git revert HEAD
git push origin main

# Or restore from backup
# Upload previous version files via FTP
```

---

## Common Tasks & Example Prompts

Use these example prompts with Claude Code to perform common website management tasks.

### Adding Content

#### Add a New Blog Post

```
Add a new blog post about [TOPIC].

Title: "[Blog Post Title]"
Slug: [url-slug]

Create the post in all three languages (English, French, Dutch) with:
- Proper meta tags and SEO optimization
- Featured image: images/blog/[image-name].webp
- Include 3-5 sections with H2 headings
- Add a call-to-action linking to the free trial page
- Update the blog index pages in all languages
- Add to sitemap.xml

Content outline:
1. Introduction paragraph
2. [Section 1 topic]
3. [Section 2 topic]
4. [Section 3 topic]
5. Conclusion with CTA
```

**Example:**
```
Add a new blog post about the benefits of tango for mental health.

Title: "How Argentine Tango Improves Mental Well-being"
Slug: tango-mental-health-benefits

Create the post in all three languages with proper SEO optimization.
Use the featured image: images/blog/tango-mental-health.webp

Content outline:
1. Introduction - connection between dance and mental health
2. Stress reduction through tango
3. Social connections and community
4. Mindfulness and being present
5. Conclusion with free trial CTA
```

#### Update Existing Page Content

```
Update the [PAGE NAME] page to change [SPECIFIC ELEMENT].

File location: [path/to/file]

Changes needed:
- [Change 1]
- [Change 2]
- [Change 3]

Make sure to update all three language versions if applicable.
```

**Example:**
```
Update the "Beginners" class page to change the class description and add a new testimonial.

Files:
- tango-classes/beginners/index.html
- fr/cours-de-tango/debutants/index.html
- nl/tangolessen/beginners/index.html

Changes:
- Update the intro paragraph to emphasize "no partner required"
- Add a new testimonial from Maria S.
- Update the CTA button text to "Start Your Tango Journey"
```

### Updating Schedules

#### Update Class Schedule for New Semester

```
Update the free trial class schedule for the [SEMESTER] semester.

Start date: [DATE]
End date: [DATE]
Skip dates: [HOLIDAYS]

Brussels classes: Monday 20:00-21:00
Woluwe classes: Thursday 19:30-20:30

Generate the schedule and update all three language versions:
- tango-classes/free-trial/index.html
- fr/cours-de-tango/essai-gratuit/index.html
- nl/tangolessen/gratis-proefles/index.html
```

**Example:**
```
Update the free trial class schedule for the Fall 2026 semester.

Start date: September 7, 2026
End date: December 18, 2026
Skip dates: November 1 (holiday), November 11 (holiday)

Brussels classes: Monday 20:00-21:00
Woluwe classes: Thursday 19:30-20:30

Generate the complete schedule with all dates and update all three language versions.
```

### Design Changes

#### Change Color Scheme

```
Update the [COLOR NAME] color throughout the site.

Current color: [HEX CODE]
New color: [HEX CODE]

Update in:
- CSS custom property in css/styles.css
- Any inline styles using this color
- Regenerate styles.min.css after changes
```

**Example:**
```
Update the secondary accent color (gold) to a darker shade.

Current color: #E2C033
New color: #D4A017

Update the CSS custom property --color-secondary and any inline styles.
Then minify the CSS for production.
```

#### Adjust Spacing/Layout

```
Adjust the [ELEMENT] spacing/layout on [PAGE/SECTION].

Current issue: [DESCRIBE PROBLEM]
Desired outcome: [DESCRIBE GOAL]

Make sure changes work on mobile, tablet, and desktop.
```

**Example:**
```
Adjust the journey cards image height on the homepage.

Current issue: Images are too tall on mobile (450px)
Desired outcome: Reduce to 240px on all screen sizes

Update css/styles.css and check all responsive breakpoints.
```

### Fixing Issues

#### Fix Broken CSS Path

```
The CSS is broken on [PAGE URL].

Check and fix the CSS file path in [FILE PATH].
The file is [X] levels deep in the directory structure, so paths should use [X number of ../] to reach the css folder.
```

**Example:**
```
The CSS is broken on http://localhost:3000/fr/cours-de-tango/essai-gratuit/

Check the CSS path in fr/cours-de-tango/essai-gratuit/index.html.
The file is 3 levels deep, so paths should use ../../../ to reach the css folder.
```

#### Fix JavaScript Error

```
The [FEATURE] is not working on [PAGE URL].

Browser console error: [ERROR MESSAGE]

Investigate and fix the JavaScript issue in [FILE PATH].
```

**Example:**
```
The language picker dropdown is not working on http://localhost:3000/nl/tangolessen/

Browser console shows: "Uncaught TypeError: Cannot read property 'addEventListener' of null"

Check the JavaScript in nl/tangolessen/index.html for the language dropdown code.
```

#### Fix Duplicate/Broken Content

```
There is [DUPLICATE/BROKEN] content on [PAGE URL].

Issue: [DESCRIBE PROBLEM]

Files to check:
- [FILE 1]
- [FILE 2]
```

**Example:**
```
There is duplicate navigation menu code on http://localhost:3000/tango-classes/free-trial/

Issue: Mobile menu is not working, and I see duplicate menu toggle event listeners in the code.

Check tango-classes/free-trial/index.html and remove any duplicate JavaScript.
```

### SEO & Performance

#### Update Meta Tags

```
Update SEO meta tags for [PAGE URL].

New title: "[TITLE]"
New description: "[DESCRIPTION]"

Also update Open Graph and Twitter Card tags.
```

#### Optimize Images

```
The images on [PAGE URL] are too large and slow to load.

Images to optimize:
- [IMAGE 1]
- [IMAGE 2]

Convert to WebP format and reduce file size to under 200KB each.
```

### Form Updates

#### Update Form Destination

```
Update the form submission endpoint for [FORM NAME].

Current endpoint: [URL]
New endpoint: [URL]

Files to update:
- [FILE 1]
- [FILE 2 (other languages)]
```

#### Add New Form Field

```
Add a new field to the [FORM NAME] form.

Field details:
- Label: "[LABEL TEXT]"
- Type: [text/email/tel/select/textarea]
- Required: [Yes/No]
- Placeholder: "[PLACEHOLDER TEXT]"

Add to all three language versions and update validation if needed.
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: CSS Not Loading

**Symptoms:** Page displays without styling, plain HTML only

**Causes:**
1. Incorrect CSS file path
2. CSS file doesn't exist
3. Server not serving CSS files

**Solution:**
```
1. Check the file path in <link> tag
   - Count directory levels: ../../../css/styles.min.css
   - Verify the CSS file exists at that location

2. Check browser console for 404 errors

3. Test CSS path by opening it directly in browser
```

**Example prompt:**
```
The CSS is not loading on [PAGE URL].
Check the CSS file path and fix it.
The page is located at [FILE PATH].
```

---

#### Issue: Language Picker Not Working

**Symptoms:** Clicking language toggle button doesn't open dropdown

**Causes:**
1. Duplicate JavaScript event listeners
2. Malformed/incomplete JavaScript code
3. Missing HTML elements (language-toggle, language-dropdown)

**Solution:**
```
1. Check for duplicate event listener code
   - Search for: menuToggle.addEventListener('click'
   - Should only appear once per page

2. Verify complete JavaScript structure
   - Event listener should be inside if (languageToggle && languageDropdown) block
   - Should have proper closing braces

3. Check HTML for required elements:
   <button class="language-toggle">
   <ul class="language-dropdown">
```

**Example prompt:**
```
The language picker dropdown is not working on [PAGE URL].
Check the JavaScript for duplicate or broken event listeners.
Remove any duplicate code and ensure proper closing tags.
```

---

#### Issue: Images Not Displaying

**Symptoms:** Broken image icons, images don't load

**Causes:**
1. Wrong file path
2. Image file doesn't exist
3. Incorrect file extension
4. Case-sensitivity issue

**Solution:**
```
1. Verify image path relative to HTML file
   - Example: ../../images/photo.webp

2. Check image actually exists in images folder
   - Look for file in: images/ or images/blog/

3. Verify file extension matches
   - .webp vs .jpg vs .png

4. Check case sensitivity
   - photo.webp vs Photo.webp vs PHOTO.WEBP
```

**Example prompt:**
```
The featured image is not displaying on [BLOG POST URL].
Check the image path and verify the file exists.
The image should be: images/blog/[name].webp
```

---

#### Issue: Mobile Menu Not Working

**Symptoms:** Mobile hamburger menu doesn't open, or doesn't close

**Causes:**
1. Missing or duplicate JavaScript
2. Incorrect CSS classes
3. Event listener not attached

**Solution:**
```
1. Check for mobile menu toggle JavaScript
   - Should toggle classes: mobile-nav-open, active
   - Should update aria-expanded attribute

2. Verify HTML structure:
   <button class="mobile-menu-toggle">
   <nav class="main-nav">

3. Check CSS for .mobile-nav-open class
```

**Example prompt:**
```
The mobile menu is not working on [PAGE URL].
Check the mobile menu JavaScript and ensure the event listener is properly attached.
```

---

#### Issue: Form Not Submitting

**Symptoms:** Form submit button does nothing, or shows error

**Causes:**
1. Wrong form action URL
2. Missing required fields
3. JavaScript validation error
4. CORS issue with API

**Solution:**
```
1. Check form action attribute
   - Should point to: https://formspree.io/f/[ID] or CRM API

2. Verify all required fields have values
   - Check for: required attribute on inputs

3. Check browser console for JavaScript errors

4. Test with browser network tab to see request/response
```

**Example prompt:**
```
The free trial enrollment form is not submitting on [PAGE URL].
Check the form action URL and verify all validation is working.
Browser console shows: [ERROR MESSAGE]
```

---

#### Issue: CSS Changes Not Appearing

**Symptoms:** Made changes to css/styles.css but nothing changed on site

**Causes:**
1. Browser caching old CSS
2. Editing styles.css but site uses styles.min.css
3. Styles overridden by more specific CSS rules
4. Multiple definitions of same rule in different media queries

**Solution:**
```
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

2. Check which CSS file is linked in HTML
   - If using styles.min.css, you need to minify after editing styles.css

3. Use browser DevTools to inspect element
   - Check which CSS rule is actually applied
   - Look for overrides (crossed-out rules)

4. Search for ALL instances of the CSS rule
   - Use Grep to find: "\.class-name\s*\{[^}]*property:"
   - Update ALL media queries, not just base rule
```

**Example prompt:**
```
I changed the .journey-image height in css/styles.css but nothing changed on the site.

Search for ALL instances of .journey-image height rules across:
- Base CSS
- Mobile media queries
- Tablet media queries
- Desktop media queries

Update ALL of them, then regenerate styles.min.css.
```

---

#### Issue: JavaScript Console Errors

**Symptoms:** Features not working, console shows errors

**Common errors and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'addEventListener' of null` | Element doesn't exist in DOM | Add null check: `if (element) { ... }` |
| `Unexpected end of input` | Missing closing brace `}` | Check all function/if statement closures |
| `Uncaught SyntaxError` | Malformed JavaScript | Check for missing semicolons, quotes, braces |
| `Failed to fetch` | API call failed | Check API URL, CORS settings, network |

**Example prompt:**
```
The page [PAGE URL] shows this JavaScript error in console:
[EXACT ERROR MESSAGE]

Find and fix the JavaScript error.
```

---

### When to Ask Claude Code for Help

Don't struggle alone! Ask Claude Code when you encounter:

- ✅ **Broken layouts or styling** - "The footer is overlapping the content on mobile"
- ✅ **JavaScript errors** - "Console shows error: [paste error message]"
- ✅ **Path issues** - "Images not loading on [page]"
- ✅ **Responsive design problems** - "Navigation menu doesn't work on mobile"
- ✅ **Cross-browser issues** - "Site looks fine in Chrome but broken in Safari"
- ✅ **Form problems** - "Contact form not submitting"
- ✅ **SEO improvements** - "Add structured data for [content type]"
- ✅ **Accessibility issues** - "Screen reader not announcing [element]"
- ✅ **Performance optimization** - "Page loads too slowly"
- ✅ **New feature requests** - "Add a newsletter signup form to the footer"

**Be specific in your questions:**
- ❌ "The site is broken"
- ✅ "The CSS is not loading on http://localhost:3000/fr/cours-de-tango/essai-gratuit/"

- ❌ "Fix the menu"
- ✅ "The mobile menu doesn't open when I click the hamburger icon on the homepage"

- ❌ "Images don't work"
- ✅ "The featured image at blog/why-learn-tango/index.html shows a broken icon"

---

## Useful Commands

### Local Development

```bash
# Start PHP development server
cd /Users/svenbreynaert/Sites/BE-TANGO\ WEBSITE/be-tango-rebuild/
php -S localhost:3000

# Find files
find . -name "*.html" -path "*/blog/*"

# Search for text in files
grep -r "search-term" .

# Count lines in file
wc -l filename.html
```

### Git Commands

```bash
# Check status
git status

# Stage changes
git add .
git add specific-file.html

# Commit changes
git commit -m "Descriptive commit message"

# Push to remote
git push origin main

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename.html
```

### File Operations

```bash
# Copy file
cp source.html destination.html

# Move/rename file
mv old-name.html new-name.html

# Remove file
rm filename.html

# Create directory
mkdir new-folder

# List files with details
ls -la
```

---

## Additional Resources

### Documentation Files

- **[CLAUDE.MD](./CLAUDE.MD)** - Comprehensive development manual
- **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - Quick reference guide
- **[SEO-IMPROVEMENTS.md](./SEO-IMPROVEMENTS.md)** - SEO best practices
- **[ACCESSIBILITY-IMPROVEMENTS.md](./ACCESSIBILITY-IMPROVEMENTS.md)** - Accessibility guide
- **[TESTING-GUIDE.md](./TESTING-GUIDE.md)** - Testing checklist

### External Resources

- **Font Awesome Icons:** https://fontawesome.com/icons
- **Google Fonts:** https://fonts.google.com/
- **Can I Use (Browser Compatibility):** https://caniuse.com/
- **WebP Converter:** https://cloudconvert.com/webp-converter
- **Image Optimizer:** https://squoosh.app/
- **Meta Tags Generator:** https://metatags.io/
- **Structured Data Testing:** https://search.google.com/test/rich-results
- **PageSpeed Insights:** https://pagespeed.web.dev/

---

## Contact & Support

**Website:** https://www.be-tango.be
**Email:** admin@be-tango.com
**Phone:** +32 498 39 29 39
**Locations:** Brussels & Woluwe-Saint-Pierre, Belgium

---

*Last updated: February 10, 2026*
