# Partials Usage Guide

This directory contains reusable HTML components (partials) that can be included on multiple pages.

## Available Partials

### 1. header.html
The site header with navigation and logo.

### 2. footer.html
The site footer with links, locations, and social media.

### 3. reviews.html
The Google reviews widget with carousel functionality.

## How to Use Partials

### Option 1: Copy & Paste (Static HTML)
Simply copy the content from the partial file and paste it into your HTML page where needed.

### Option 2: Server-Side Includes (SSI)
If using a web server with SSI support (Apache, Nginx), use:

```html
<!--#include virtual="/partials/reviews.html" -->
```

### Option 3: JavaScript Include
Add this script to load partials dynamically:

```javascript
// Load partial into element
async function loadPartial(elementId, partialPath) {
  const response = await fetch(partialPath);
  const html = await response.text();
  document.getElementById(elementId).innerHTML = html;
}

// Usage:
loadPartial('reviews-container', 'partials/reviews.html');
```

### Option 4: PHP Include
If using PHP, use:

```php
<?php include 'partials/reviews.html'; ?>
```

## Reviews Widget

The reviews widget includes:
- Google rating summary (EXCELLENT badge, stars, review count)
- Scrollable carousel with 4 sample reviews
- Auto-scroll functionality (every 5 seconds)
- Pause on hover and manual scroll
- Navigation arrows (previous/next)
- Fully responsive design

**Note:** The JavaScript for the carousel is included in the partial and will work automatically when the HTML is loaded.
