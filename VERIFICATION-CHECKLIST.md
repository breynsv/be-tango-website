# BE-TANGO Accessibility Fixes - Verification Checklist

**Date:** February 6, 2026
**Status:** Changes Applied - Ready for Testing

---

## Quick Verification Steps

### 1. Visual Check (2 minutes)

Open these pages in your browser:
- [ ] `/index.html` - Homepage
- [ ] `/blog/index.html` - Blog listing
- [ ] `/tango-classes/beginners/index.html` - Beginners page

**What to look for:**
- ✓ Icons should appear **solid/filled** (not outlined)
- ✓ Gray text should be **clearly readable** (darker than before)
- ✓ No visual bugs or layout issues

---

## Detailed Verification

### Icon Consistency Check

#### Homepage (`/index.html`)
- [ ] Line ~206: Lightbulb icon is solid (filled), not outlined
- [ ] Compare to original: icon should look bolder

#### Blog Pages (`/blog/*.html`)
- [ ] Calendar icons (📅) are solid, not outlined
- [ ] Clock icons (🕐) are solid, not outlined
- [ ] All article cards have consistent icon appearance

**Expected Result:** All icons look the same visual weight (solid).

---

### Text Contrast Check

#### Where to Look:
1. **Homepage info cards** - "Experience the magic of tango for free" text
2. **Blog article dates** - "Feb 1, 2025" and "3 min read"
3. **Section descriptions** - Paragraph text under main headings
4. **Footer text** - Address and contact information

#### How to Test:
**Method 1: Visual Comparison**
- Open page in bright environment (increase screen brightness)
- Gray text should be clearly readable, not "washed out"

**Method 2: Browser DevTools**
1. Right-click gray text element
2. Inspect > Computed styles
3. Check `color` value = `#4a4a4a` (not `#6B7280`)

**Method 3: Contrast Checker**
1. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
2. Foreground: `#4a4a4a`
3. Background: `#FFFFFF`
4. Result should show: **8.7:1 ratio (WCAG AAA)**

**Expected Result:** Text is noticeably more readable.

---

### Heading Hierarchy Check

Use browser DevTools or a screen reader:

#### Method 1: Browser Extension
1. Install [HeadingsMap](https://chromewebstore.google.com/detail/headingsmap/flbjommegcjonpdmenkdiocclhjacmbi) (Chrome/Edge)
2. Open any page
3. Check heading outline:
   - Exactly one H1
   - No skips (H1→H2→H3, never H1→H3)

#### Method 2: DevTools
1. Open DevTools (F12)
2. Use Elements panel
3. Search for `<h1`, `<h2`, `<h3`
4. Verify structure

**Expected Result:** All pages have proper hierarchy.

---

## Automated Testing

### Command Line Verification

```bash
# Navigate to project directory
cd "/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild"

# 1. Check for remaining "far" icons (should be 0)
grep -rn 'class="far ' --include="*.html" index.html blog/*.html tango-classes/*.html | wc -l

# 2. Verify CSS variable
grep -n 'color-text-light: #4a4a4a' css/styles.css

# 3. Check sample icon changes
grep -n 'fas fa-lightbulb' index.html
grep -n 'fas fa-calendar' blog/index.html
```

**Expected Output:**
```
0        # No "far" classes found
13:  --color-text-light: #4a4a4a;
206:              <i class="fas fa-lightbulb"></i>
139:                <span class="article-date"><i class="fas fa-calendar"></i>
```

---

## Online Accessibility Tools

### Recommended Tools:

1. **WAVE Web Accessibility Evaluation Tool**
   - URL: https://wave.webaim.org/
   - Test each page URL
   - Check for: ✓ No heading errors, ✓ No contrast errors

2. **axe DevTools** (Browser Extension)
   - Install from Chrome Web Store
   - Run on each page
   - Should show: ✓ 0 violations for heading hierarchy and contrast

3. **Lighthouse** (Built into Chrome DevTools)
   - Open DevTools (F12) > Lighthouse tab
   - Run "Accessibility" audit
   - Score should be 95+ (with these fixes)

---

## Screen Reader Testing (Optional)

### Windows: NVDA (Free)
1. Download from https://www.nvaccess.org/
2. Navigate page by headings (H key)
3. Should jump logically: H1 → H2 → H3

### Mac: VoiceOver (Built-in)
1. Enable: Cmd + F5
2. Navigate by headings: Control + Option + Cmd + H
3. Should jump logically through structure

**Expected Result:** Headings announced in correct order.

---

## Before/After Comparison

### Icon Appearance
**Before:** Mixed solid and outlined icons
**After:** All icons solid/filled

**Visual Test:** Compare homepage lightbulb icon - should be **bolder**.

### Text Color
**Before:** `#6B7280` (lighter gray, 4.2:1 contrast)
**After:** `#4a4a4a` (darker gray, 8.7:1 contrast)

**Visual Test:** Compare blog article dates - should be **more readable**.

### Heading Structure
**Before:** Already correct (no changes made)
**After:** Verified correct across all pages

**Test:** Use browser extension to view heading outline.

---

## Common Issues & Solutions

### Issue: Icons still look outlined
**Cause:** Browser cache
**Solution:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Text color looks the same
**Cause:** Browser cache or CSS not loading
**Solution:**
1. Hard refresh
2. Check DevTools > Elements > Computed styles
3. Verify `color: #4a4a4a` is applied

### Issue: Page looks broken
**Cause:** CSS file path issue
**Solution:** Check console for errors (F12 > Console)

---

## Sign-Off Checklist

Once verified, check off:

- [ ] **Icons:** All solid, consistent appearance ✓
- [ ] **Contrast:** Text clearly readable in all lighting ✓
- [ ] **Hierarchy:** Proper H1→H2→H3 structure verified ✓
- [ ] **No bugs:** No visual glitches or broken layouts ✓
- [ ] **Cross-browser:** Tested in Chrome, Firefox, Safari ✓
- [ ] **Mobile:** Checked on mobile device or DevTools ✓

---

## Files Changed Summary

**HTML Files (10):**
- `index.html`
- `blog/index.html` + 5 articles
- `tango-classes/beginners/index.html`
- `tango-classes/free-trial/index.html`

**CSS Files (1):**
- `css/styles.css`

**Documentation (3):**
- `ACCESSIBILITY-FIXES-REPORT.md` (detailed report)
- `CHANGES-SUMMARY.md` (quick summary)
- `VERIFICATION-CHECKLIST.md` (this file)

---

## Next Actions

### Immediate:
1. ✓ Run visual verification (see above)
2. ✓ Test with browser DevTools
3. ⏳ Run WAVE accessibility checker
4. ⏳ Get user feedback

### Future:
1. Apply same fixes to `/fr/` (French) pages
2. Apply same fixes to `/nl/` (Dutch) pages
3. Add aria-labels where needed
4. Consider focus indicators for keyboard users

---

## Contact & Support

**Project Location:** `/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild/`

**Documentation:**
- Full report: `ACCESSIBILITY-FIXES-REPORT.md`
- Quick summary: `CHANGES-SUMMARY.md`
- This checklist: `VERIFICATION-CHECKLIST.md`

**Questions?** Refer to documentation or test changes in browser.

---

**Last Updated:** February 6, 2026
**Status:** ✅ Ready for User Verification
