# BE-TANGO Website

Modern, responsive website for BE-TANGO Argentine Tango dance school in Brussels & Woluwe.

## 🌐 Live Website

- **Production:** https://www.be-tango.be
- **Development:** http://localhost:3000

## 🎯 Features

- **Clean HTML5** - Semantic structure, no WordPress/Elementor bloat
- **Mobile-First CSS** - Responsive design, no frameworks
- **Vanilla JavaScript** - No jQuery or React
- **Multi-Language** - English, French, Dutch (EN/FR/NL)
- **CRM API Integration** - Dynamic class schedules from Laravel backend
- **SEO Optimized** - Structured data, meta tags, performance optimized
- **Accessibility** - WCAG 2.1 AA compliant

## 🚀 Quick Start

### Development Server

```bash
# Serve the website locally
php -S localhost:3000

# Open in browser
open http://localhost:3000
```

### CRM API Backend

The website integrates with the BE-TANGO CRM Laravel backend for:
- Dynamic class schedules (filtered by active semester)
- Free trial enrollment form submissions
- Location information

**Backend Repository:** https://github.com/breynsv/betangocrm-laravel

## 📁 Project Structure

```
be-tango-rebuild/
├── index.html              # Homepage
├── css/
│   └── styles.css         # Main stylesheet
├── js/
│   ├── crm-api.js         # CRM API client
│   ├── schedule-loader.js # Dynamic schedule display
│   ├── enrollment-form.js # Form submission handler
│   └── ...
├── images/                # Optimized images (WebP)
├── tango-classes/         # Class pages
│   ├── beginners/
│   ├── experienced/
│   └── free-trial/
├── blog/                  # Blog articles
├── fr/                    # French version
├── nl/                    # Dutch version
└── docs/                  # Documentation

```

## 🔧 Tech Stack

- **HTML5** - Semantic elements
- **CSS3** - Custom properties, Flexbox, Grid
- **JavaScript (ES6+)** - Native fetch API, async/await
- **Google Fonts** - Poppins font family
- **Font Awesome 6.4.0** - Icons

## 📚 Documentation

Complete documentation available in the [`docs/`](./docs) folder:

- **[CLAUDE.MD](./docs/CLAUDE.MD)** - Development guide and manual
- **[QUICK-REFERENCE.md](./docs/QUICK-REFERENCE.md)** - Quick reference guide
- **[SEO-IMPROVEMENTS.md](./docs/SEO-IMPROVEMENTS.md)** - SEO implementation
- **[ACCESSIBILITY-IMPROVEMENTS.md](./docs/ACCESSIBILITY-IMPROVEMENTS.md)** - Accessibility guide
- **[TESTING-GUIDE.md](./docs/TESTING-GUIDE.md)** - Testing checklist

[See all documentation →](./docs/README.md)

## 🎨 Brand Colors

```css
--color-primary: #00d084;      /* Green accent */
--color-secondary: #E2C033;    /* Gold/Yellow */
--color-dark-navy: #1c244b;    /* Dark navy blue */
```

## 🔗 API Integration

### Development Setup

1. **Start Laravel backend:**
   ```bash
   cd /path/to/betangocrm-laravel
   php artisan serve --host=127.0.0.1 --port=8000
   ```

2. **Start website:**
   ```bash
   php -S localhost:3000
   ```

3. **API Endpoints:**
   - Classes: `http://127.0.0.1:8000/api/v1/classes`
   - Locations: `http://127.0.0.1:8000/api/v1/locations`
   - Enrollments: `POST http://127.0.0.1:8000/api/v1/free-trial/register`

### Production

Update API base URL in `js/crm-api.js`:
```javascript
baseURL: 'https://crm.be-tango.be/api/v1'
```

## 📱 Pages

### English (EN)
- Homepage: `/index.html`
- Classes: `/tango-classes/`
- Free Trial: `/tango-classes/free-trial/`
- Blog: `/blog/`
- Contact: `/contact/`

### French (FR)
- Homepage: `/fr/index.html`
- Cours: `/fr/cours-de-tango/`
- Blog: `/fr/blog/`

### Dutch (NL)
- Homepage: `/nl/index.html`
- Lessen: `/nl/tangolessen/`
- Blog: `/nl/blog/`

## 🧪 Testing

```bash
# Test API endpoints
curl http://127.0.0.1:8000/api/v1/classes/experienced

# Check browser console for:
# [CRM API] Client initialized
# [Schedule Loader] Successfully loaded X classes
```

## 📦 Deployment

### Production Checklist

- [ ] Update API URL to production
- [ ] Optimize images (already WebP)
- [ ] Minify CSS/JS (optional)
- [ ] Enable HTTPS
- [ ] Test all forms
- [ ] Verify multi-language pages
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit (target >90)

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear message
5. Push to GitHub

## 📄 License

© 2026 BE-TANGO. All rights reserved.

## 👥 Contact

**BE-TANGO**
- Website: https://www.be-tango.be
- Email: info@be-tango.be
- Phone: +32 498 39 29 39
- Locations: Brussels & Woluwe-Saint-Pierre, Belgium

---

Built with ❤️ for Argentine Tango
