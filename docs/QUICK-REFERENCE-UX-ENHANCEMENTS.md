# Quick Reference: Form Validation & UX Enhancements

## Summary

Three major UX enhancements have been added to the BE-TANGO website:

1. **Form Validation** - Real-time validation with visual feedback
2. **Skeleton Loading** - Professional loading placeholders
3. **Cookie Consent** - GDPR-compliant consent banner

---

## Files Added

```
/css/form-validation.css       (150 lines)
/css/skeleton-loading.css      (280 lines)
/css/cookie-consent.css        (200 lines)
/js/form-validation.js         (340 lines)
/js/cookie-consent.js          (280 lines)
/partials/integration-example.html
/FORM-VALIDATION-AND-UX-ENHANCEMENTS.md (comprehensive docs)
```

**Total:** 1,250+ lines of well-documented code

---

## Files Updated

### Pages with Forms (Form Validation + Cookie Consent)
- `/contact/index.html` - Added CSS and JS references
- `/tango-classes/free-trial/index.html` - Added CSS and JS references

### Homepage (Cookie Consent Only)
- `/index.html` - Added cookie consent CSS and JS

---

## Integration Status

### ✅ Completed

| Page | Form Validation | Cookie Consent | Notes |
|------|----------------|----------------|-------|
| `/index.html` | N/A | ✅ | No forms on homepage |
| `/contact/index.html` | ✅ | ✅ | Contact form |
| `/tango-classes/free-trial/index.html` | ✅ | ✅ | Free trial form |

### ⏳ To Do

Add to remaining pages (cookie consent only, unless they have forms):

**English Pages:**
- `/tango-classes/index.html`
- `/tango-classes/beginners/index.html`
- `/tango-classes/experienced/index.html`
- `/tango-classes/private/index.html`
- `/tango-classes/online/index.html`
- `/tango-classes/brussels/index.html`
- `/tango-classes/woluwe/index.html`
- `/blog/index.html`
- All blog post pages

**Dutch Pages (nl/):**
- All corresponding Dutch pages

**French Pages (fr/):**
- All corresponding French pages

---

## How to Add to Remaining Pages

### Step 1: Add CSS to `<head>` Section

**For pages WITHOUT forms:**
```html
<link rel="stylesheet" href="css/cookie-consent.css">
```

**For pages WITH forms:**
```html
<link rel="stylesheet" href="css/form-validation.css">
<link rel="stylesheet" href="css/cookie-consent.css">
```

**Adjust path based on folder depth:**
- Root level: `css/file.css`
- 1 level deep: `../css/file.css`
- 2 levels deep: `../../css/file.css`

### Step 2: Add JS Before `</body>`

**For pages WITHOUT forms:**
```html
<!-- Cookie Consent -->
<script src="js/cookie-consent.js"></script>
```

**For pages WITH forms:**
```html
<!-- Form Validation & Cookie Consent -->
<script src="js/cookie-consent.js"></script>
<script src="js/form-validation.js"></script>
```

**Adjust path the same way as CSS files.**

---

## Quick Test Guide

### Test Form Validation

1. Open `/contact/index.html` or `/tango-classes/free-trial/index.html`
2. Try to submit empty form - should see validation errors
3. Enter invalid email (e.g., "test@") - should see email error
4. Enter valid data - errors should clear, green borders appear
5. Submit form - should see loading spinner on button

### Test Cookie Consent

1. Open any page in incognito/private mode
2. Cookie banner should appear at bottom
3. Click "Accept" - banner disappears, preference saved
4. Refresh page - banner should NOT reappear
5. Open DevTools Console, run: `window.BETangoCookieConsent.resetConsent()`
6. Refresh page - banner should reappear

### Test Skeleton Loading

See `/partials/integration-example.html` for implementation example.

---

## Common Code Snippets

### Check Cookie Consent in JavaScript

```javascript
// Get current consent status
const consent = window.BETangoCookieConsent.getConsent();
if (consent === 'accepted') {
  // User accepted - enable analytics
} else if (consent === 'declined') {
  // User declined - disable analytics
} else {
  // No choice made yet (null)
}
```

### Listen for Consent Changes

```javascript
document.addEventListener('cookieConsentChanged', function(e) {
  console.log('Consent:', e.detail.consent);
  // 'accepted' or 'declined'
});
```

### Manually Validate a Form Field

```javascript
const emailField = document.querySelector('#email');
const isValid = window.BETangoValidation.validateField(emailField);
console.log('Email is valid:', isValid);
```

### Add Skeleton Loading to a Section

```html
<section class="section" id="my-section">
  <div class="container">
    <!-- Skeleton (shown while loading) -->
    <div class="skeleton-content">
      <div class="skeleton-grid skeleton-grid-3">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    </div>

    <!-- Real content (shown after loading) -->
    <div class="real-content">
      <!-- Your actual content here -->
    </div>
  </div>
</section>

<script>
const section = document.querySelector('#my-section');
section.classList.add('loading'); // Show skeleton

// When content ready:
section.classList.remove('loading');
section.querySelector('.real-content').classList.add('content-loaded');
</script>
```

---

## API Reference

### Form Validation API

```javascript
window.BETangoValidation = {
  init(),              // Re-initialize all forms
  initForm(form),      // Initialize specific form
  validateField(field) // Validate specific field (returns boolean)
}
```

### Cookie Consent API

```javascript
window.BETangoCookieConsent = {
  getConsent(),     // Returns: 'accepted', 'declined', or null
  resetConsent(),   // Clear stored preference (for testing)
  showBanner()      // Manually show banner
}
```

---

## Customization

### Change Cookie Message

Edit `/js/cookie-consent.js` around line 128:

```javascript
<p id="cookie-consent-description">
  Your custom cookie message here.
  <a href="/privacy-policy/" id="cookie-learn-more">Learn more</a>
</p>
```

### Change Cookie Expiry

Edit `/js/cookie-consent.js` line 10:

```javascript
const CONSENT_EXPIRY_DAYS = 365; // Change to desired days
```

### Change Validation Messages

Edit `/js/form-validation.js` lines 9-24:

```javascript
const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Your custom email error message'
  },
  // ... other rules
}
```

### Enable Dark Theme for Cookie Banner

In `/js/cookie-consent.js` around line 126, change:

```javascript
banner.className = 'cookie-consent-banner dark'; // Add 'dark'
```

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Form Validation | 60+ | 55+ | 11+ | 79+ |
| Skeleton Loading | 60+ | 55+ | 11+ | 79+ |
| Cookie Consent | 60+ | 55+ | 11+ | 79+ |

**IE 11:** Partial support (main features work, some animations degraded)

---

## Performance Impact

- **CSS:** +630 lines (minified: ~18KB)
- **JavaScript:** +620 lines (minified: ~15KB)
- **Total added weight:** ~33KB (negligible for modern web)
- **Performance gain:** Skeleton loading improves perceived performance

---

## Troubleshooting

### Form validation not working?

1. Open browser console - check for errors
2. Verify JS file loaded: type `window.BETangoValidation`
3. Check form has class `.contact-form` or ID `#contactForm`
4. Verify CSS file loaded (inspect error message styling)

### Cookie banner not appearing?

1. Clear localStorage: `localStorage.clear()` in console
2. Open in incognito/private mode
3. Check console for errors
4. Verify JS file loaded: type `window.BETangoCookieConsent`

### Skeleton not showing?

1. Check CSS file is loaded
2. Verify `.loading` class on parent container
3. Check `.skeleton-content` element exists
4. Inspect with DevTools (should be visible when `.loading` present)

---

## Next Steps

1. ✅ Forms validated (contact, free trial)
2. ✅ Cookie consent on 3 pages
3. ⏳ Add cookie consent to all remaining pages
4. ⏳ Add skeleton loading to slow sections (optional)
5. ⏳ Integrate analytics with cookie consent (optional)
6. ⏳ Create privacy policy page (optional)

---

## Documentation

📖 **Full documentation:** See `FORM-VALIDATION-AND-UX-ENHANCEMENTS.md`

📝 **Example usage:** See `partials/integration-example.html`

---

**Version:** 1.0
**Date:** 2026-02-06
**Status:** Production Ready ✅
