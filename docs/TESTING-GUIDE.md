# Testing Guide - Navigation Enhancements

## Quick Visual Testing Checklist

### 1. Sticky Header Scroll Effect

**Test Steps:**
1. Open any page in browser (e.g., `/index.html`)
2. Scroll down the page slowly
3. After ~50px of scrolling, observe the header

**Expected Results:**
- ✅ Header stays fixed at top while scrolling
- ✅ Header background becomes slightly more opaque
- ✅ Shadow under header becomes more prominent
- ✅ Transition is smooth (no jumping)
- ✅ When scrolling back to top, effect reverses

**Visual Indicators:**
- Scrolled state has stronger shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Background has slight blur effect (modern browsers)

---

### 2. Breadcrumb Navigation

**Test Pages:**
- ✅ `/tango-classes/beginners/index.html` → Should show: Home > Tango Classes > Beginners
- ✅ `/blog/history-of-argentine-tango/index.html` → Should show: Home > Blog > History of Argentine Tango
- ✅ `/contact/index.html` → Should show: Home > Contact
- ❌ `/index.html` → Should NOT show breadcrumbs (homepage)

**Test Steps:**
1. Open a subpage (not homepage)
2. Look for breadcrumbs between header and main content
3. Click breadcrumb links to navigate
4. Check page source for JSON-LD structured data

**Expected Results:**
- ✅ Breadcrumbs appear on light gray background
- ✅ Links are clickable and navigate correctly
- ✅ Current page name is bold/not a link
- ✅ Chevron separators (>) between items
- ✅ Hover effect on links (color changes to gold)
- ✅ JSON-LD script tag in `<head>` with BreadcrumbList

**Structured Data Validation:**
1. Open browser DevTools
2. Go to Elements/Inspector tab
3. Search for `"@type": "BreadcrumbList"`
4. Or use: https://search.google.com/test/rich-results

---

### 3. Page Fade-In Animation

**Test Steps:**
1. Navigate to any page
2. Observe page load
3. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

**Expected Results:**
- ✅ Page content fades in smoothly over 0.5 seconds
- ✅ Animation is subtle and natural
- ✅ No flash of unstyled content
- ✅ Works on all pages consistently

**Troubleshooting:**
- If animation too fast: May be cached, try hard refresh
- If no animation: Check browser console for script errors

---

### 4. Swipe Gesture Support (Mobile/Touch Devices)

**Test Pages with Carousels:**
- `/index.html` (reviews section)
- Any page with `.reviews-carousel` class

**Test Steps (Mobile or Touch Device):**
1. Navigate to homepage on mobile device or tablet
2. Scroll to reviews section
3. Swipe left on the reviews carousel
4. Swipe right on the reviews carousel

**Expected Results:**
- ✅ Swipe left scrolls to next review
- ✅ Swipe right scrolls to previous review
- ✅ Smooth scroll animation
- ✅ Quick swipes trigger navigation
- ✅ Slow swipes are ignored (prevents false triggers)
- ✅ Vertical scrolling still works normally

**Desktop Testing:**
- ✅ Mouse drag still works
- ✅ Navigation arrows still work
- ✅ Auto-scroll still works

**Troubleshooting:**
- Open browser console on mobile
- Look for JavaScript errors
- Check if reviews carousel exists on page

---

## Browser Console Checks

### Check for JavaScript Errors

1. Open browser DevTools (F12 or Right-click > Inspect)
2. Go to Console tab
3. Reload page
4. Look for any red error messages

**Expected Console Output:**
```
✅ Header loaded successfully (if using load-header.js)
```

**No Errors Should Appear:**
- ❌ No "Failed to load script" errors
- ❌ No "undefined is not a function" errors
- ❌ No 404 errors for missing files

---

## Performance Testing

### Page Load Speed

**Test with Browser DevTools:**
1. Open DevTools > Network tab
2. Reload page
3. Check total load time and resource sizes

**Expected Results:**
- ✅ Scripts load in parallel (defer attribute)
- ✅ No blocking scripts
- ✅ Total script size under 30KB combined
- ✅ Page interactive in under 2 seconds (on fast connection)

### Scroll Performance

**Visual Smoothness Test:**
1. Open any page
2. Scroll up and down rapidly
3. Observe smoothness

**Expected Results:**
- ✅ No jank or stuttering
- ✅ Header transition is smooth
- ✅ 60fps scrolling (check Performance monitor)

---

## Accessibility Testing

### Keyboard Navigation

**Test Steps:**
1. Use Tab key to navigate through page
2. Navigate to breadcrumb links
3. Press Enter to follow links

**Expected Results:**
- ✅ Breadcrumb links are focusable
- ✅ Focus indicator is visible
- ✅ Enter key activates links
- ✅ Navigation order is logical

### Screen Reader Testing (Optional)

**Tools:**
- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA (free) or JAWS
- Browser extensions: ChromeVox

**Expected Results:**
- ✅ Breadcrumbs announced as "navigation"
- ✅ Current page indicated with "current page"
- ✅ Separators are hidden (aria-hidden)

---

## Cross-Browser Testing

### Browsers to Test

**Desktop:**
- ✅ Chrome (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)

**Mobile:**
- ✅ Safari iOS (latest)
- ✅ Chrome Android (latest)

### Features to Verify

**All Browsers:**
- ✅ Sticky header works
- ✅ Breadcrumbs appear correctly
- ✅ Fade-in animation plays
- ✅ Links work correctly

**Mobile Browsers:**
- ✅ Swipe gestures work
- ✅ Touch events don't interfere with scrolling
- ✅ Breadcrumbs wrap on small screens

---

## Troubleshooting Common Issues

### Breadcrumbs Not Appearing

**Possible Causes:**
1. Script not loaded: Check Network tab for 404 errors
2. Wrong page: Breadcrumbs don't show on homepage
3. JavaScript error: Check console for errors
4. No `<main>` element: Script needs injection point

**Fix:**
- Verify script tags in HTML `<head>`
- Check file paths are correct (../ for subdirectories)
- Ensure `<main>` element exists

### Sticky Header Not Scrolling

**Possible Causes:**
1. CSS not loaded: Check styles.css loaded
2. JavaScript error: Check console
3. Browser cache: Try hard refresh

**Fix:**
- Clear browser cache
- Verify `.site-header` has `position: sticky`
- Check scroll event listener is attached

### Swipe Not Working on Mobile

**Possible Causes:**
1. No carousel on page
2. JavaScript error
3. Touch events blocked

**Fix:**
- Verify page has `.reviews-carousel` element
- Check console for errors on mobile
- Test with Chrome DevTools mobile emulator first

### Page Fade-In Too Fast/Slow

**Adjustment:**
Edit `css/styles.css`:
```css
body {
  animation: fadeIn 0.8s ease-in; /* Change from 0.5s to 0.8s */
}
```

---

## Testing Checklist Summary

Print this checklist and mark off as you test:

### Sticky Header
- [ ] Header stays at top when scrolling
- [ ] Shadow appears after 50px scroll
- [ ] Transition is smooth
- [ ] Works on all pages

### Breadcrumbs
- [ ] Appear on all subpages (not homepage)
- [ ] Links navigate correctly
- [ ] Current page is bold
- [ ] Structured data in page source
- [ ] Wrap properly on mobile

### Page Transitions
- [ ] Smooth fade-in on page load
- [ ] Works consistently across pages
- [ ] Not too fast or too slow

### Swipe Gestures
- [ ] Swipe left/right works on mobile
- [ ] Doesn't interfere with scrolling
- [ ] Smooth animation
- [ ] Works on all carousels

### Cross-Browser
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Performance
- [ ] No JavaScript errors
- [ ] Scripts load quickly
- [ ] Smooth scrolling
- [ ] No layout shifts

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Screen reader friendly

---

## Reporting Issues

If you find issues:

1. **Document the issue:**
   - Browser and version
   - Page URL
   - Expected vs actual behavior
   - Console errors (if any)

2. **Check documentation:**
   - Review `NAVIGATION-ENHANCEMENTS.md`
   - Check `CLAUDE.MD` for project guidelines

3. **Fix location:**
   - CSS issues: `css/styles.css`
   - JavaScript issues: `js/enhancements.js` or `js/breadcrumbs.js`
   - HTML issues: Individual page files

---

**Last Updated:** 2026-02-06
**Version:** 1.0
