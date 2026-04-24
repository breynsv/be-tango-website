// _dev/e2e/tests/schedule-pages.test.js
const { SITE_URL } = require('../config');

const PAGES = [
  { name: 'beginners',    path: '/en/tango-classes/beginners/',   selector: '.class-card, .schedule-card, .course-card, [class*="class-item"]' },
  { name: 'experienced',  path: '/en/tango-classes/experienced/', selector: '.class-card, .schedule-card, .course-card, [class*="class-item"]' },
  { name: 'brussels',     path: '/en/tango-classes/brussels/',    selector: '.class-card, .schedule-card, .course-card, [class*="class-item"]' },
  { name: 'woluwe',       path: '/en/tango-classes/woluwe/',      selector: '.class-card, .schedule-card, .course-card, [class*="class-item"]' },
  { name: 'free-trial',   path: '/en/tango-classes/free-trial/',  selector: '#free-trial-schedule .class-card, #free-trial-schedule [class*="slot"], #class-date option:not([value=""])' },
];

async function run(browser) {
  const results = [];

  for (const { name, path, selector } of PAGES) {
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
      await page.waitForSelector(selector, { timeout: 15000 });

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
