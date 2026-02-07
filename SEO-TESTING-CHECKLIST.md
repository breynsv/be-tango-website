# SEO Testing Checklist

**Quick Reference for Testing BE-TANGO SEO Improvements**
**Date:** February 6, 2026

---

## Immediate Tests (Do First)

### 1. Social Media Sharing Tests

#### Facebook Sharing Debugger
**Tool:** https://developers.facebook.com/tools/debug/

**Test These URLs:**
- [ ] https://www.be-tango.be/
- [ ] https://www.be-tango.be/contact/
- [ ] https://www.be-tango.be/blog/
- [ ] https://www.be-tango.be/tango-classes/
- [ ] https://www.be-tango.be/tango-classes/beginners/

**What to Check:**
- Image displays correctly (1200x630 recommended)
- Title appears correctly
- Description is compelling and accurate
- No errors or warnings
- Click "Scrape Again" if cached version is old

#### Twitter Card Validator
**Tool:** https://cards-dev.twitter.com/validator

**Test Same 5 URLs Above**

**What to Check:**
- Card type shows "Summary with Large Image"
- Image displays properly
- Title and description correct
- Preview looks professional

#### Manual Social Share Test
**Action:** Create test posts on:
- [ ] Facebook (personal or business page)
- [ ] Twitter/X
- [ ] LinkedIn

**Verify:**
- Rich preview appears with image
- Text is readable and compelling
- Image is eye-catching
- Link works correctly

---

### 2. FAQ Schema Validation

#### Google Rich Results Test
**Tool:** https://search.google.com/test/rich-results

**Test This URL:**
- [ ] https://www.be-tango.be/tango-classes/beginners/

**What to Check:**
- "Page is eligible for rich results" message
- FAQPage type detected
- 8 questions detected
- No errors or warnings
- Preview shows FAQ accordion format

#### Schema.org Validator
**Tool:** https://validator.schema.org/

**Test Same Beginners URL**

**What to Check:**
- No errors in JSON-LD syntax
- FAQPage structure valid
- All 8 Q&A pairs parsed correctly
- mainEntity array properly formatted

---

### 3. HTML Validation

#### W3C HTML Validator
**Tool:** https://validator.w3.org/

**Test These URLs:**
- [ ] https://www.be-tango.be/
- [ ] https://www.be-tango.be/tango-classes/beginners/
- [ ] https://www.be-tango.be/contact/

**What to Check:**
- No errors
- Warnings are acceptable (informational)
- HTML5 doctype recognized
- All tags properly closed

#### WAVE Accessibility Checker
**Tool:** https://wave.webaim.org/

**Test Same 3 URLs**

**What to Check:**
- No critical errors
- Alt text on all images
- Proper heading hierarchy
- Form labels present
- Color contrast sufficient

---

### 4. Mobile-Friendly Test

#### Google Mobile-Friendly Test
**Tool:** https://search.google.com/test/mobile-friendly

**Test All 5 Main URLs**

**What to Check:**
- "Page is mobile friendly" result
- Text is readable without zooming
- Content fits screen width
- Tap targets are appropriately sized
- No horizontal scrolling needed

---

## Post-Launch Monitoring (Week 1)

### 5. Google Search Console

**Action:** Add Property (if not already added)
- [ ] Add https://www.be-tango.be
- [ ] Verify ownership
- [ ] Submit sitemap (when created)

**Monitor:**
- [ ] Coverage issues (should be 0 errors)
- [ ] Rich results status
- [ ] Mobile usability issues
- [ ] Core Web Vitals
- [ ] Manual actions (should be none)

**Request Indexing:**
- [ ] Submit all 5 updated pages for re-indexing
- [ ] Wait 24-48 hours for results

---

### 6. Performance Testing

#### Google PageSpeed Insights
**Tool:** https://pagespeed.web.dev/

**Test All 5 URLs (Mobile & Desktop)**

**Target Scores:**
- Performance: 90+ (green)
- Accessibility: 90+ (green)
- Best Practices: 90+ (green)
- SEO: 90+ (green)

**Key Metrics (Core Web Vitals):**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

#### GTmetrix
**Tool:** https://gtmetrix.com/

**Test Homepage**

**What to Check:**
- Performance score (A or B grade)
- Structure score (A or B grade)
- Page load time (< 3 seconds)
- Total page size (< 2MB)
- Number of requests (< 50)

---

## Ongoing Monitoring (Monthly)

### 7. Search Console Health Check

**Review:**
- [ ] Total impressions (should increase)
- [ ] Average CTR (click-through rate)
- [ ] Average position in search results
- [ ] Pages with errors (should be 0)
- [ ] Valid rich results count

**Check For:**
- FAQ rich results appearing
- Increase in organic traffic
- New search queries driving traffic
- Pages dropping from index

---

### 8. Social Sharing Analytics

**Track:**
- [ ] Number of social shares (Facebook, Twitter, LinkedIn)
- [ ] Referral traffic from social media
- [ ] Engagement rate on shared posts
- [ ] Click-through rate from social media

**Tools:**
- Google Analytics (Acquisition > Social)
- Facebook Insights
- Twitter Analytics
- LinkedIn Analytics

---

## Quick Command-Line Checks

### Verify Open Graph Tags Present
```bash
curl -s https://www.be-tango.be/ | grep "og:title"
```
Expected output: `<meta property="og:title" content="BE-TANGO – Your dance school for Argentine tango">`

### Verify Twitter Card Tags Present
```bash
curl -s https://www.be-tango.be/ | grep "twitter:card"
```
Expected output: `<meta name="twitter:card" content="summary_large_image">`

### Verify FAQ Schema Present
```bash
curl -s https://www.be-tango.be/tango-classes/beginners/ | grep "FAQPage"
```
Expected output: `"@type": "FAQPage",`

### Check Response Time
```bash
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://www.be-tango.be/
```
Target: < 1 second

---

## Expected Results Summary

### Social Media Sharing
✓ Professional-looking previews with large images
✓ Compelling titles and descriptions
✓ Consistent branding across all platforms
✓ Higher click-through rates from social media

### Search Engine Visibility
✓ FAQ rich results eligible on beginners page
✓ Improved snippet appearance in search results
✓ Better understanding of content by search engines
✓ Potential for featured snippets

### Technical Health
✓ Zero HTML validation errors
✓ 100% mobile-friendly
✓ Fast page load times (< 3 seconds)
✓ Excellent accessibility scores

### User Experience
✓ Clear, compelling meta descriptions
✓ Professional appearance when shared
✓ Fast-loading optimized images
✓ Accessible to all users

---

## Common Issues & Solutions

### Issue: Facebook Shows Old Preview
**Solution:** Use Facebook Sharing Debugger, click "Scrape Again"

### Issue: Twitter Card Not Showing
**Solution:** Verify twitter:card is "summary_large_image", check image URL is accessible

### Issue: FAQ Schema Not Detected
**Solution:** Validate JSON-LD syntax, ensure proper escaping of quotes in answers

### Issue: Image Not Loading in Social Share
**Solution:** Verify image URL is absolute (https://...), check file exists, ensure proper size

### Issue: Mobile-Friendly Test Fails
**Solution:** Check viewport meta tag, verify responsive CSS, test on real device

---

## Success Criteria

### Week 1
- [ ] All 5 pages pass Facebook Sharing Debugger
- [ ] All 5 pages pass Twitter Card Validator
- [ ] Beginners page shows FAQ rich results eligible
- [ ] All pages pass W3C HTML validation
- [ ] All pages pass mobile-friendly test

### Month 1
- [ ] FAQ rich results appearing in Google search
- [ ] Organic impressions increased by 10%+
- [ ] Social shares increased by 20%+
- [ ] Zero errors in Search Console
- [ ] PageSpeed scores all 90+

### Month 3
- [ ] Organic traffic increased by 25%+
- [ ] Average search position improved
- [ ] Conversion rate from organic search up
- [ ] Bounce rate decreased
- [ ] Pages per session increased

---

## Tools Quick Reference

**Social Media Testing:**
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator

**Schema Testing:**
- Google Rich Results: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

**HTML/Accessibility:**
- W3C Validator: https://validator.w3.org/
- WAVE: https://wave.webaim.org/

**Mobile/Performance:**
- Mobile-Friendly: https://search.google.com/test/mobile-friendly
- PageSpeed: https://pagespeed.web.dev/
- GTmetrix: https://gtmetrix.com/

**Monitoring:**
- Google Search Console: https://search.google.com/search-console
- Google Analytics: https://analytics.google.com/

---

## Testing Schedule

### Immediate (Today)
1. Test all social sharing tools
2. Validate FAQ schema
3. Check HTML validation
4. Run mobile-friendly test

### Week 1
1. Monitor Search Console
2. Check for any errors
3. Request re-indexing
4. Track social shares

### Week 2
1. Review analytics data
2. Check for FAQ rich results
3. Monitor page speed
4. Track search impressions

### Week 4
1. Full SEO audit
2. Review all metrics
3. Identify improvements
4. Plan next optimizations

### Monthly (Ongoing)
1. Search Console review
2. Analytics review
3. Performance testing
4. Social media audit

---

## Contact for Issues

**Technical Issues:**
- Check SEO-IMPROVEMENTS.md documentation
- Review SEO-IMPLEMENTATION-SUMMARY.md

**Support:**
- Website: https://www.be-tango.be
- Email: admin@btango.com
- Phone: +32 498 39 29 39

---

**Testing Checklist Version:** 1.0
**Last Updated:** February 6, 2026
**Next Review:** March 6, 2026

---

*Print this checklist and check off items as you complete them. Keep for your records and monthly reviews.*
