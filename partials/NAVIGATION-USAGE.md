# Navigation Header - Usage Guide

## Overview
The navigation header has been standardized across the site with a dropdown language switcher and consistent structure.

## What's Included
- ✅ Responsive mobile menu
- ✅ Dropdown language switcher (with globe icon and flags)
- ✅ Active page highlighting
- ✅ Blog link in navigation
- ✅ All necessary JavaScript for interactions

## Current Status

### Pages Updated
✅ **tango-classes/index.html** - Has proper dropdown language switcher
✅ **blog/index.html** - Has proper dropdown + clickable cards
✅ **nl/blog/index.html** - Has proper dropdown + clickable cards
✅ **fr/blog/index.html** - Already had proper dropdown + clickable cards

### Blog Cards
✅ **All blog overview pages** now have fully clickable cards (click anywhere on the card, not just the "Read More" link)

## How to Add Proper Navigation to Other Pages

### Method 1: Copy the Updated Header (Recommended)

1. **Copy the header HTML** from `/tango-classes/index.html` (lines 321-361)
2. **Paste** into your page, replacing the existing header
3. **Update paths** based on your page location:
   - If in root: `href="index.html"`
   - If in subdirectory: `href="../index.html"`
   - If two levels deep: `href="../../index.html"`
4. **Update language paths** to match your page location
5. **Copy the JavaScript** from the same file (look for "Language dropdown toggle" section around line 788)

### Method 2: Manual Update

If you just want to fix the language switcher on a page:

**Replace this:**
```html
<li class="language-switcher">
  <a href="index.html" class="active">EN</a>
  <span class="divider">|</span>
  <a href="../fr/index.html">FR</a>
  <span class="divider">|</span>
  <a href="../nl/index.html">NL</a>
</li>
```

**With this:**
```html
<li class="language-switcher">
  <button class="language-toggle" aria-label="Select language" aria-expanded="false">
    <i class="fas fa-globe"></i>
    <span class="current-lang">EN</span>
    <i class="fas fa-chevron-down"></i>
  </button>
  <ul class="language-dropdown">
    <li>
      <a href="../nl/index.html">
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
      <a href="../fr/index.html">
        <span class="flag-icon">🇫🇷</span>
        <span>Français</span>
      </a>
    </li>
  </ul>
</li>
```

Then add this JavaScript before the closing `</script>` tag:

```javascript
// Language dropdown toggle
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

## Navigation Structure

```
Home → Tango Classes → Free Trial → Contact → Blog → Language Switcher (🌐 EN ▼)
```

### Language Dropdown Structure
When clicked, shows:
- 🇳🇱 Nederlands
- 🇬🇧 English (active)
- 🇫🇷 Français

## Path Reference Guide

### Root Level (index.html)
```html
href="index.html"           <!-- Home -->
href="tango-classes/index.html"
href="blog/index.html"
href="nl/index.html"        <!-- Dutch -->
href="fr/index.html"        <!-- French -->
```

### One Level Deep (tango-classes/index.html)
```html
href="../index.html"        <!-- Home -->
href="index.html"           <!-- Current section -->
href="../blog/index.html"
href="../nl/tangolessen/index.html"
href="../fr/cours-de-tango/index.html"
```

### Two Levels Deep (tango-classes/beginners/index.html)
```html
href="../../index.html"     <!-- Home -->
href="../index.html"        <!-- Tango classes -->
href="../../blog/index.html"
href="../../nl/tangolessen/beginners/index.html"
```

## CSS Classes Used

- `.site-header` - Header container
- `.language-switcher` - Language switcher container
- `.language-toggle` - Button that triggers dropdown
- `.language-dropdown` - Dropdown menu
- `.language-dropdown.active` - Visible state
- `.current-lang` - Current language text (EN/NL/FR)
- `.flag-icon` - Flag emoji container
- `.mobile-menu-toggle` - Hamburger menu button
- `.main-nav` - Main navigation container

## Features

### Dropdown Language Switcher
- ✅ Click globe icon to open
- ✅ Click outside to close
- ✅ Shows flag emojis
- ✅ Highlights current language
- ✅ Accessible (ARIA labels)

### Mobile Menu
- ✅ Hamburger icon on mobile
- ✅ Full-screen menu overlay
- ✅ Close on resize
- ✅ Close when clicking outside

### Blog Cards (on overview pages)
- ✅ Entire card is clickable
- ✅ Hover cursor changes
- ✅ Links still work normally
- ✅ Good for UX

## Troubleshooting

### Dropdown doesn't work
- Check Font Awesome is loaded (for icons)
- Check JavaScript is present
- Check console for errors

### Wrong paths
- Count directory depth
- Use `../` for each level up
- Test all links manually

### Active state not showing
- Check `class="active"` on correct link
- Verify CSS is loaded

## Future: Partial System (Optional)

For easier maintenance, consider:
1. **Server-side includes** (if using PHP/Apache)
2. **Build system** (like Gulp or npm scripts)
3. **JavaScript loader** (provided in `/js/load-header.js`)

The JavaScript loader is ready but needs:
- All pages to reference it: `<script src="../js/load-header.js"></script>`
- Navigation partial to be used: `/partials/navigation.html`

This would allow one-time header updates across all pages.

---

**Last Updated:** February 6, 2026
**Status:** ✅ Complete
