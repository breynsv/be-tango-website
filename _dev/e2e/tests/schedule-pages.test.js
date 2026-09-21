// _dev/e2e/tests/schedule-pages.test.js
const { SITE_URL } = require('../config');
const { freeTrialState, STATES } = require('../helpers/free-trial-state');

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
];

// The free-trial page has no schedule cards — it offers the dates as <option>s in a
// <select>, and for most of the year it offers none at all, because trials run only in
// January and September. Both are correct renders, so this page cannot be checked with
// one fixed selector the way the four schedule pages can; it gets its own check below.
const FREE_TRIAL_PATH = '/en/tango-classes/free-trial/';

/**
 * Prove the dynamic render happened, whichever of the two states is live.
 *
 * With dates: at least one real <option> in #class-date. (An <option> is never
 * "visible" to Playwright, hence the 'attached' state.)
 *
 * Without dates: the .ft-empty-banner that js/free-trial.js writes into
 * #free-trial-schedule. Like data-product-id on the schedule pages, that element
 * appears nowhere in the served HTML — only the script emits it — so seeing it
 * still proves the API answered and the page acted on the answer. freeTrialState
 * throws on the API-error panel, so an outage cannot pass as an empty calendar.
 */
async function checkFreeTrialPage(page) {
  const state = await freeTrialState(page);

  if (state === STATES.DATES) {
    await page.waitForSelector('#class-date option:not([value=""])', { timeout: 15000, state: 'attached' });
    const count = await page.locator('#class-date option:not([value=""])').count();
    if (count === 0) throw new Error('No dynamic content rendered (0 date options found)');
    return;
  }

  await page.waitForSelector('.ft-empty-banner', { timeout: 15000 });
  const sel = await page.locator('#class-date').count();
  if (sel === 0) return;
  // With nothing to book, the date field must be out of the visitor's way: left
  // enabled it is a dead required control that blocks the notify form.
  const usable = await page.evaluate(() => {
    const el = document.getElementById('class-date');
    return { disabled: el.disabled, required: el.required };
  });
  if (!usable.disabled || usable.required) {
    throw new Error(
      `no dates are on offer, but #class-date is still disabled=${usable.disabled} required=${usable.required} — ` +
      'the "keep me informed" form cannot be submitted past a required, unfillable date field'
    );
  }
}

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

  // --- free-trial, which has two correct shapes depending on the season ---
  {
    const page = await browser.newPage();
    const apiErrors = [];
    page.on('response', (res) => {
      if (res.url().includes('/api/v1/') && res.status() >= 400) {
        apiErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    try {
      await page.goto(SITE_URL + FREE_TRIAL_PATH, { waitUntil: 'networkidle', timeout: 30000 });
      await checkFreeTrialPage(page);
      if (apiErrors.length > 0) throw new Error('API errors: ' + apiErrors.join(', '));

      results.push({ name: 'schedule:free-trial', passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: '_dev/e2e/screenshots/schedule-free-trial.png', fullPage: true });
      results.push({ name: 'schedule:free-trial', passed: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  return results;
}

module.exports = { run };
