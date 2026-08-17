// _dev/e2e/tests/schedule-pages.test.js
const { SITE_URL } = require('../config');

// These pages do NOT share one markup shape: /beginners/ renders `.schedule-item`,
// the location pages render `.lsched-class-row`, and /experienced/ renders static
// `.btlc-card` level cards. (The old selectors — .class-card / .schedule-card /
// .course-card / [class*="class-item"] — matched nothing anywhere. The suite never
// ran far enough to reveal that.)
//
// Asserting on any of those class names would be near-worthless anyway: every page
// ships STATIC placeholder markup that is already in the served HTML, so the assertion
// would pass with the API completely down.
//
// `data-product-id` is the honest signal. It appears 0 times in the served HTML of all
// four pages and is emitted only by schedule-loader.js, once per class it rendered from
// the API — so a match proves the dynamic render actually happened.
const CLASS_SELECTOR = '[data-product-id]';

const PAGES = [
  { name: 'beginners',    path: '/en/tango-classes/beginners/',   selector: CLASS_SELECTOR },
  { name: 'experienced',  path: '/en/tango-classes/experienced/', selector: CLASS_SELECTOR },
  { name: 'brussels',     path: '/en/tango-classes/brussels/',    selector: CLASS_SELECTOR },
  { name: 'woluwe',       path: '/en/tango-classes/woluwe/',      selector: CLASS_SELECTOR },
  // The free-trial page has no schedule cards — it offers the dates as <option>s in a
  // <select>. An <option> is never "visible" to Playwright, so this page must wait for
  // the 'attached' state; the default 'visible' can only ever time out.
  { name: 'free-trial',   path: '/en/tango-classes/free-trial/',  selector: '#class-date option:not([value=""])', state: 'attached' },
];

async function run(browser) {
  const results = [];

  for (const { name, path, selector, state } of PAGES) {
    const page = await browser.newPage();
    const apiErrors = [];
    page.on('response', (res) => {
      if (res.url().includes('/api/v1/') && res.status() >= 400) {
        apiErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    try {
      await page.goto(SITE_URL + path, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for the dynamic content to appear (schedule-loader.js populates this)
      await page.waitForSelector(selector, { timeout: 15000, state: state || 'visible' });

      const count = await page.locator(selector).count();
      if (count === 0) throw new Error('No dynamic content rendered (0 elements found)');
      if (apiErrors.length > 0) throw new Error('API errors: ' + apiErrors.join(', '));

      results.push({ name: `schedule:${name}`, passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: `_dev/e2e/screenshots/schedule-${name}.png`, fullPage: true });
      results.push({ name: `schedule:${name}`, passed: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  return results;
}

module.exports = { run };
