# Accessibility Quick Reference Card - BE-TANGO

## For Developers: How to Maintain Accessibility

### 1. Adding New Pages

**Always include these elements:**

```html
<!DOCTYPE html>
<html lang="en"> <!-- or lang="nl" or lang="fr" -->
<head>
  <!-- ... -->
</head>
<body>
  <!-- Skip link (FIRST element in body) -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="site-header">...</header>

  <!-- Main content must have ID -->
  <main id="main-content">
    <!-- Your page content -->
  </main>

  <footer>...</footer>
</body>
</html>
```

**Skip link text by language:**
- English: `Skip to main content`
- Dutch: `Spring naar hoofdinhoud`
- French: `Aller au contenu principal`

---

### 2. Interactive Elements Without Text

**Always add aria-label to:**
- Icon-only buttons
- Social media links
- Carousel controls
- Search forms
- Toggle buttons

**Examples:**

```html
<!-- Icon-only button -->
<button aria-label="Open menu">☰</button>

<!-- Social media link -->
<a href="..." aria-label="Visit us on Facebook">
  <svg>...</svg>
</a>

<!-- Carousel controls -->
<button aria-label="Previous slide">‹</button>
<button aria-label="Next slide">›</button>

<!-- Search form -->
<form aria-label="Search">...</form>
```

---

### 3. Forms

**Always associate labels with inputs:**

```html
<!-- GOOD ✅ -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email">

<!-- BAD ❌ -->
<div>Email Address</div>
<input type="email" name="email">
```

**Add aria-label to forms:**

```html
<form aria-label="Contact form">...</form>
```

---

### 4. Images

**Always include descriptive alt text:**

```html
<!-- GOOD ✅ -->
<img src="tango-class.jpg" alt="Beginner tango class in Brussels">

<!-- BAD ❌ -->
<img src="tango-class.jpg" alt="Image">
<img src="tango-class.jpg">
```

**Decorative images (CSS background images are fine):**

```html
<!-- If image is purely decorative -->
<img src="decoration.png" alt="">
```

---

### 5. Navigation

**Use proper ARIA labels:**

```html
<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

<!-- Secondary navigation -->
<nav aria-label="Footer navigation">
  <ul>...</ul>
</nav>
```

---

### 6. Buttons vs Links

**Use the right element:**

```html
<!-- Navigates to another page? Use <a> -->
<a href="/contact" class="btn">Contact Us</a>

<!-- Performs an action? Use <button> -->
<button class="btn" onclick="...">Submit Form</button>

<!-- Never use <div> or <span> as buttons! -->
```

---

### 7. Color Contrast

**Minimum contrast ratios (WCAG AA):**
- Normal text (< 18pt): 4.5:1
- Large text (≥ 18pt or ≥ 14pt bold): 3.0:1

**Approved text colors:**
- `--color-text: #111827` (15.79:1) - Primary text
- `--color-text-light: #4a4a4a` (8.59:1) - Secondary text
- `#666666` (5.74:1) - Light gray text
- `--color-secondary: #E2C033` (4.89:1) - Gold accent

**Don't use these for text:**
- `#999`, `#aaa`, `#ccc` (too light)

---

### 8. Focus Indicators

**Already implemented globally - no action needed!**

All interactive elements automatically get a gold focus outline when navigated via keyboard.

**Don't disable focus:**

```css
/* NEVER do this ❌ */
*:focus { outline: none; }

/* Already handled ✅ */
*:focus-visible { outline: 3px solid #E2C033; }
```

---

### 9. Headings Hierarchy

**Use proper heading order:**

```html
<!-- GOOD ✅ -->
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
  <h2>Another Section</h2>

<!-- BAD ❌ -->
<h1>Page Title</h1>
  <h3>Section Title</h3> <!-- Skipped h2! -->
  <h2>Subsection Title</h2> <!-- Wrong order! -->
```

**Never skip heading levels!**

---

### 10. Language Attributes

**Set language on <html> tag:**

```html
<!-- English pages -->
<html lang="en">

<!-- Dutch pages -->
<html lang="nl">

<!-- French pages -->
<html lang="fr">
```

**Mark foreign language content:**

```html
<p>The term <span lang="es">milonga</span> refers to...</p>
```

---

### 11. Tables

**Always include table headers:**

```html
<table>
  <thead>
    <tr>
      <th scope="col">Class</th>
      <th scope="col">Time</th>
      <th scope="col">Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Beginners</td>
      <td>7:00 PM</td>
      <td>€15</td>
    </tr>
  </tbody>
</table>
```

---

### 12. Videos

**Include captions and transcripts:**

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
</video>
```

---

## Quick Testing Checklist

Before deploying any page:

- [ ] Press Tab - does skip-link appear?
- [ ] Continue tabbing - are focus indicators visible?
- [ ] Check all images have alt text
- [ ] Verify form inputs have labels
- [ ] Test with NVDA/VoiceOver
- [ ] Run Lighthouse audit
- [ ] Check color contrast with DevTools

---

## Common Mistakes to Avoid

1. ❌ Forgetting skip-to-content link
2. ❌ Missing aria-label on icon buttons
3. ❌ No alt text on images
4. ❌ Form inputs without labels
5. ❌ Using divs/spans as buttons
6. ❌ Skipping heading levels
7. ❌ Using light gray text (#999)
8. ❌ Removing focus outlines

---

## Tools & Resources

**Browser Extensions:**
- axe DevTools (Chrome, Firefox)
- WAVE Evaluation Tool
- Lighthouse (built into Chrome)

**Screen Readers:**
- Windows: NVDA (free) - nvaccess.org
- Mac: VoiceOver (built-in, Cmd+F5)
- Mobile: iOS VoiceOver, Android TalkBack

**Contrast Checkers:**
- WebAIM Contrast Checker
- Chrome DevTools (inspect element)

**Documentation:**
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility

---

## Need Help?

**Documentation:**
- Full guide: `ACCESSIBILITY-IMPROVEMENTS.md`
- Demo page: `accessibility-demo.html`

**Contact:**
- Email: admin@btango.com
- Phone: +32 498 39 29 39

---

*Quick Reference Card - Last updated: 2026-02-06*
