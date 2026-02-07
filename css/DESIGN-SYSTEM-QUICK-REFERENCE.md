# BE-TANGO Design System - Quick Reference

## Spacing Scale (8px Baseline Grid)

| Variable | Value | Usage |
|----------|-------|-------|
| `--spacing-xs` | 8px | Tight spacing, icon gaps, small padding |
| `--spacing-sm` | 16px | Standard padding, small margins |
| `--spacing-md` | 24px | Medium spacing, card padding |
| `--spacing-lg` | 32px | Large spacing, section padding |
| `--spacing-xl` | 40px | Extra large spacing, section margins |
| `--spacing-2xl` | 48px | Huge spacing, major section breaks |

### Example Usage
```css
.card {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-sm);
}
```

---

## Typography Scale

| Variable | Value | Size | Usage |
|----------|-------|------|-------|
| `--font-size-xs` | 0.875rem | 14px | Captions, fine print, labels |
| `--font-size-sm` | 1rem | 16px | Body text (base size) |
| `--font-size-md` | 1.25rem | 20px | Large body, small headings |
| `--font-size-lg` | 1.5rem | 24px | h3, medium headings |
| `--font-size-xl` | 2rem | 32px | h2, large headings |
| `--font-size-2xl` | 2.5rem | 40px | h1, page titles |
| `--font-size-3xl` | 3rem | 48px | Hero text, display headings |

### Example Usage
```css
h1 {
  font-size: var(--font-size-2xl);
}

.hero-title {
  font-size: var(--font-size-3xl);
}

.caption {
  font-size: var(--font-size-xs);
}
```

---

## Color Variables

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-primary` | #000000 | Primary brand color (black) |
| `--color-secondary` | #E2C033 | Secondary brand color (gold) |
| `--color-accent` | #00d084 | Accent color (green) |
| `--color-dark-navy` | #1C244B | Dark navy blue |
| `--color-text` | #111827 | Main text color |
| `--color-text-light` | #4a4a4a | Secondary text |
| `--color-white` | #FFFFFF | White |
| `--color-background` | #F3F5F8 | Light background |
| `--color-border` | #E5E7EB | Border color |

---

## Other Design Tokens

```css
--font-primary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--border-radius: 8px;
--box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
--box-shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.15);
--transition: all 0.3s ease;
```

---

## Production Files

- **Development:** Use `styles.css` (103 KB, human-readable)
- **Production:** Use `styles.min.css` (77 KB, 25% smaller)

```html
<!-- Development -->
<link rel="stylesheet" href="css/styles.css">

<!-- Production -->
<link rel="stylesheet" href="css/styles.min.css">
```

---

**Last Updated:** February 6, 2026
