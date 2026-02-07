# BE-TANGO Website Rebuild

Clean, modern static website for BE-TANGO Argentine Tango Dance School.

## Project Structure

```
be-tango-rebuild/
├── index.html              # Homepage
├── css/
│   └── styles.css          # Main stylesheet (mobile-first)
├── images/                 # All site images
├── pages/                  # Additional pages (to be created)
├── blog/                   # Blog posts (to be created)
└── partials/               # Reusable HTML components
    ├── header.html         # Site header with navigation
    └── footer.html         # Site footer
```

## Design Features

- **Mobile-First**: Responsive design optimized for all devices
- **Semantic HTML5**: Clean, accessible markup
- **Modern CSS**: CSS custom properties (variables) for easy theming
- **No Framework**: Pure HTML/CSS for maximum performance
- **Brand Colors**:
  - Primary: Black (#000000)
  - Secondary: Gold (#E2C033)
  - Accent: Vivid Green (#00d084)
  - Dark Navy: #1C244B

## How to Use HTML Partials

### Header
Copy the content from `partials/header.html` and paste it after the opening `<body>` tag in each page.

### Footer
Copy the content from `partials/footer.html` and paste it before the closing `</body>` tag in each page.

### Update Active Navigation
When adding header to a new page, update the active class:
```html
<li><a href="/pages/your-page.html" class="active" aria-current="page">Your Page</a></li>
```

## Creating New Pages

1. Copy `index.html` as a template
2. Replace header and footer with partial content
3. Update the `<title>` and meta tags
4. Update the active navigation link
5. Add your page-specific content in the `<main>` section

## Page Hierarchy (from WordPress)

```
Home
Tango Classes (parent)
  ├── Free Trial
  ├── Beginners
  ├── Experienced
  ├── Brussels
  ├── Woluwe
  ├── Online
  └── Private
Contact
Privacy Policy
```

## Languages

The site is multilingual:
- English: `/` (root)
- French: `/fr/`
- Dutch: `/nl/`

Each language follows the same structure.

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 not supported (uses CSS custom properties)

## Next Steps

1. Create additional pages in `/pages/`
2. Add actual testimonial content
3. Implement functional contact form
4. Add real social media links
5. Set up blog structure
6. Add language versions in `/fr/` and `/nl/`

## Performance Tips

- Images are already optimized from the WordPress site
- Consider adding lazy loading for images
- Minify CSS for production
- Enable gzip compression on server

## Development

To view locally, simply open `index.html` in a browser or use a local server:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (npx)
npx serve

# PHP
php -S localhost:8000
```

Then visit: http://localhost:8000
