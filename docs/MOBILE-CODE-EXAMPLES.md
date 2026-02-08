# Mobile Improvements - Code Examples
## BE-TANGO Website | February 6, 2026

This document shows the actual code implementation for quick reference.

---

## 1. Minimum Tap Target Sizes CSS

```css
/* All buttons minimum 44px height */
@media (max-width: 767px) {
  .btn,
  button,
  a.btn {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Navigation links minimum tap target */
  .main-nav a,
  .nav-list li a {
    min-height: 44px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
  }

  /* Phone number links */
  a[href^="tel:"] {
    min-height: 44px;
    padding: 8px 12px;
    display: inline-block;
  }
}
```

---

## 2. Mobile Image Optimization CSS

```css
@media (max-width: 767px) {
  /* Hero background - better mobile performance */
  .hero {
    background-size: cover;
    background-attachment: scroll; /* Not fixed */
  }

  /* Journey card images - smaller on mobile */
  .journey-image {
    height: 200px;
  }

  /* Review avatars - smaller */
  .review-avatar {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .journey-image img,
  .card img {
    object-fit: cover;
    height: 100%;
    width: 100%;
  }
}
```

---

## 3. Mobile Menu Animation CSS

```css
@media (max-width: 767px) {
  .main-nav {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: top center;
    opacity: 0;
    max-height: 0;
    overflow: hidden;
  }

  /* When menu is visible */
  .main-nav[style*="display: block"] {
    opacity: 1;
    max-height: 100vh;
    animation: slideInFromTop 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* Menu items stagger animation */
  .main-nav .nav-list li {
    opacity: 0;
    transform: translateX(-20px);
    animation: slideInItems 0.3s ease forwards;
  }

  .main-nav .nav-list li:nth-child(1) { animation-delay: 0.05s; }
  .main-nav .nav-list li:nth-child(2) { animation-delay: 0.1s; }
  .main-nav .nav-list li:nth-child(3) { animation-delay: 0.15s; }
  .main-nav .nav-list li:nth-child(4) { animation-delay: 0.2s; }
  .main-nav .nav-list li:nth-child(5) { animation-delay: 0.25s; }
  .main-nav .nav-list li:nth-child(6) { animation-delay: 0.3s; }

  /* Hamburger to X animation */
  .mobile-menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .mobile-menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }

  .mobile-menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -7px);
  }
}

/* Keyframes */
@keyframes slideInFromTop {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInItems {
  0% {
    transform: translateX(-20px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 4. Floating Call Button HTML

```html
<!-- Floating Mobile Call Button -->
<a href="tel:+32498392939" class="mobile-call-button" aria-label="Call BE-TANGO">
  <i class="fas fa-phone"></i>
</a>
```

Place this before the closing `</body>` tag on every page.

---

## 5. Floating Call Button CSS

```css
.mobile-call-button {
  display: none; /* Hidden by default */
}

@media (max-width: 767px) {
  .mobile-call-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--color-secondary) 0%, #d4a929 100%);
    color: var(--color-primary);
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(226, 192, 51, 0.4);
    z-index: 1000;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: pulseButton 2s infinite, bounceIn 0.6s ease-out;
  }

  .mobile-call-button:hover,
  .mobile-call-button:active {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(226, 192, 51, 0.6);
  }

  .mobile-call-button i {
    font-size: 24px;
  }

  /* Pulse animation */
  @keyframes pulseButton {
    0%, 100% {
      box-shadow: 0 4px 16px rgba(226, 192, 51, 0.4);
    }
    50% {
      box-shadow: 0 4px 24px rgba(226, 192, 51, 0.6);
    }
  }

  /* Bounce-in on load */
  @keyframes bounceIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
}

/* Prevent button overlap with content */
@media (max-width: 767px) {
  main {
    padding-bottom: 100px; /* Space for floating button */
  }
}
```

---

## 6. Batch HTML Update Script

Used to add the call button to all pages automatically:

```bash
#!/bin/bash
# add-mobile-button.sh

find . -name "*.html" -not -path "./partials/*" -type f | while read file; do
    if ! grep -q "mobile-call-button" "$file"; then
        sed -i.mobilebak '/^[[:space:]]*<\/body>/i\
  <!-- Floating Mobile Call Button -->\
  <a href="tel:+32498392939" class="mobile-call-button" aria-label="Call BE-TANGO">\
    <i class="fas fa-phone"></i>\
  </a>\
' "$file"
        echo "✓ Added to $file"
    fi
done
```

---

## 7. Testing Code Snippets

### Test Tap Target Sizes (Browser Console)

```javascript
// Check all interactive elements for minimum size
document.querySelectorAll('button, a, .btn').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    console.warn('Too small:', el, rect.width, rect.height);
  }
});
```

### Test Call Button Functionality

```javascript
// Verify call button exists and has correct href
const callBtn = document.querySelector('.mobile-call-button');
console.log('Call button found:', !!callBtn);
console.log('Phone number:', callBtn?.getAttribute('href'));
console.log('ARIA label:', callBtn?.getAttribute('aria-label'));
```

### Monitor Animation Performance

```javascript
// Check animation frame rate
let lastTime = performance.now();
let frameCount = 0;

function checkFPS() {
  const now = performance.now();
  frameCount++;

  if (now >= lastTime + 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = now;
  }

  requestAnimationFrame(checkFPS);
}

requestAnimationFrame(checkFPS);
```

---

## 8. Analytics Tracking (Optional)

### Track Call Button Clicks

```javascript
// Add to your analytics script
document.querySelector('.mobile-call-button')?.addEventListener('click', function() {
  // Google Analytics 4
  gtag('event', 'call_button_click', {
    'event_category': 'engagement',
    'event_label': 'mobile_call_button',
    'phone_number': '+32498392939'
  });

  // Google Tag Manager
  dataLayer.push({
    'event': 'call_button_click',
    'button_location': 'floating_mobile'
  });
});
```

### Track Menu Interactions

```javascript
document.querySelector('.mobile-menu-toggle')?.addEventListener('click', function() {
  gtag('event', 'mobile_menu_open', {
    'event_category': 'navigation',
    'event_label': 'hamburger_menu'
  });
});
```

---

## 9. CSS Variables Used

```css
:root {
  --color-primary: #000000;        /* Black */
  --color-secondary: #E2C033;      /* Gold */
  --color-accent: #00d084;         /* Green */
  --color-dark-navy: #1C244B;      /* Dark navy */

  --spacing-xs: 0.5rem;    /* 8px */
  --spacing-sm: 1rem;      /* 16px */
  --spacing-md: 1.5rem;    /* 24px */
  --spacing-lg: 2rem;      /* 32px */
  --spacing-xl: 3rem;      /* 48px */

  --border-radius: 8px;
  --transition: all 0.3s ease;
}
```

---

## 10. Media Query Breakpoints

```css
/* Mobile (default - mobile first) */
/* Base styles apply to all screen sizes */

/* Tablets and small desktops */
@media (min-width: 768px) {
  /* Tablet/desktop styles */
}

/* Large desktops */
@media (min-width: 1024px) {
  /* Desktop styles */
}

/* Mobile-specific (max-width) */
@media (max-width: 767px) {
  /* Mobile-only styles */
}

/* Extra small screens */
@media (max-width: 480px) {
  /* Small mobile only */
}
```

---

## File Locations

All code can be found in:

- **CSS:** `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild/css/styles.css`
  - Lines 5443-5702: Mobile Improvements section

- **HTML Partial:** `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild/partials/mobile-call-button.html`

- **All HTML Pages:** Updated with call button before `</body>` tag

---

## Quick Copy-Paste Snippets

### Add call button to a new page:

```html
<!-- Before </body> -->
<a href="tel:+32498392939" class="mobile-call-button" aria-label="Call BE-TANGO">
  <i class="fas fa-phone"></i>
</a>
```

### Make any element mobile-friendly (44x44px):

```css
@media (max-width: 767px) {
  .your-element {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
```

---

**Note:** All code examples are production-ready and currently implemented on the BE-TANGO website.

For full documentation, see: `/MOBILE-IMPROVEMENTS-2026-02-06.md`
