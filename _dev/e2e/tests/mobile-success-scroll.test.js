// _dev/e2e/tests/mobile-success-scroll.test.js
//
// #826 — on a phone every one of these forms is far taller than the confirmation
// that replaces it. The reader submits from near the bottom of the form; the page
// then shrinks under them and the confirmation lands ABOVE the scroll position
// they are sitting at. Nothing errors, nothing moves, so the page reads as though
// the submit did nothing — people re-submit, or leave believing they are not
// booked. Each sub-test asserts the confirmation heading is inside the viewport.
//
// Unlike every other module here, this one books NOTHING. It stubs every
// /api/v1/ call, because what is under test is where the viewport lands, not what
// the CRM does with the submission — and a layout assertion should not be
// generating cleanup work on every run. It is also why this module is safe to
// point at production: the catch-all abort below is registered first and nothing
// escapes to a real backend.
//
// It builds its own mobile browser context rather than using browser.newPage(),
// so run.js's API-pinning wrapper does not apply to it. The route rail is the
// replacement for that rail, and is stricter.

const { SITE_URL } = require('../config');

const PHONE = {
  viewport: { width: 390, height: 844 }, // iPhone 14 / 15
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
    '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

function json(body) {
  return { status: 200, contentType: 'application/json', body: JSON.stringify(body) };
}

async function newPhonePage(browser) {
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  // Playwright matches the MOST RECENTLY registered handler first, so this
  // catch-all must go on before the per-endpoint stubs, not after.
  await page.route('**/api/v1/**', (route) => route.abort());
  return page;
}

// WHERE the reader submits from decides whether this bug bites, so the scroll
// position here is the test, not setup. Someone filling a long form on a phone
// scrolls until the submit button appears at the BOTTOM of the screen and taps
// it there — which is the deepest scroll position of the run, and the one that
// leaves the confirmation furthest above them.
//
// Do not "tidy" this into page.click() alone or into centring the button.
// Playwright's own auto-scroll parks the button at the top of the viewport,
// which is both unrealistic and much too forgiving: with the button up there
// the free-trial confirmation lands on screen by luck and the sub-test passes
// against the unfixed code. Measured 2026-08-26 — it did exactly that.
async function clickSubmit(page, selector) {
  await page.evaluate((sel) => {
    const btn = document.querySelector(sel);
    const r = btn.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - (window.innerHeight - r.height - 90));
  }, selector);
  await page.waitForTimeout(300);
  await page.click(selector);
}

// The assertion the whole module exists for.
async function assertConfirmationOnScreen(page, headingSelector) {
  await page.waitForTimeout(1200); // let the smooth scroll settle
  const m = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      innerHeight: window.innerHeight,
      text: el.textContent.trim(),
    };
  }, headingSelector);

  if (!m) throw new Error(`no confirmation heading matched ${headingSelector}`);
  if (m.top < 0 || m.bottom > m.innerHeight) {
    const where = m.top < 0 ? `${Math.abs(m.top)}px ABOVE` : `${m.top - m.innerHeight}px BELOW`;
    throw new Error(
      `#826: confirmation "${m.text}" is ${where} the ${m.innerHeight}px viewport ` +
        `(top ${m.top}, bottom ${m.bottom}) — the reader has to scroll to find it`
    );
  }
  return m;
}

const FREE_TRIALS = [
  {
    id: 4242,
    start_date: '2026-09-15',
    start_time: '19:00',
    end_time: '20:00',
    location: { name: 'Brussels', building_name: 'Studio One' },
  },
];

async function run(browser) {
  const results = [];

  // --- Sub-test 1: free trial registration (the form #826 was filed against) ---
  {
    const name = 'mobile-success-scroll:free-trial';
    const page = await newPhonePage(browser);
    try {
      await page.route('**/api/v1/free-trials/available**', (route) =>
        route.fulfill(json({ success: true, data: FREE_TRIALS })));
      await page.route('**/api/v1/free-trial/register**', (route) =>
        route.fulfill(json({
          success: true,
          data: { enrollment_id: 999, booking_reference: 'E2E826', status: 'Confirmed', partner_needed: false },
        })));

      await page.goto(SITE_URL + '/en/tango-classes/free-trial/', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForFunction(
        () => {
          const s = document.querySelector('[name="class-date"]');
          return s && s.options.length > 1;
        },
        { timeout: 10000 }
      );

      await page.fill('#free-trial-form [name="first-name"]', 'E2E');
      await page.fill('#free-trial-form [name="last-name"]', 'Mobile');
      await page.fill('#free-trial-form [name="email"]', 'e2e-826@test.be-tango.be');
      await page.fill('#free-trial-form [name="phone"]', '+32499000000');
      // Gender, birth year and height are all required since 2026-08-26. Without
      // them the browser refuses the submit, so the success panel this sub-test is
      // actually about never renders and the failure reads as a scroll bug.
      await page.selectOption('#free-trial-form [name="gender"]', 'Female');
      await page.selectOption('[name="class-date"]', '4242');
      await page.click('label[for="ft-radio-solo"]');
      // Birth year and height become required only once "Coming alone" is chosen,
      // so they are filled after that click and never before it.
      await page.waitForSelector('#ft-alone-fields', { state: 'visible', timeout: 5000 });
      await page.fill('#ft-birth-year', '1985');
      await page.fill('#ft-height', '170 cm');
      await page.check('[name="terms_accepted"]');

      await clickSubmit(page, '#free-trial-form button[type="submit"]');
      await page.waitForSelector('.ft-success-title', { timeout: 10000 });
      await assertConfirmationOnScreen(page, '.ft-success-title');

      results.push({ name, passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: '_dev/e2e/screenshots/mobile-success-free-trial.png', fullPage: false });
      results.push({ name, passed: false, error: err.message });
    } finally {
      await page.context().close();
    }
  }

  // --- Sub-test 2: private lessons request ---
  {
    const name = 'mobile-success-scroll:private-lessons';
    const page = await newPhonePage(browser);
    try {
      await page.route('**/api/v1/private-lessons**', (route) =>
        route.fulfill(json({ success: true, data: { id: 1 } })));

      await page.goto(SITE_URL + '/en/tango-classes/private/', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('#private-lesson-form', { timeout: 10000 });
      await page.fill('#private-lesson-form [name="first_name"]', 'E2E');
      await page.fill('#private-lesson-form [name="last_name"]', 'Mobile');
      await page.fill('#private-lesson-form [name="email"]', 'e2e-826-pl@test.be-tango.be');
      await page.fill('#private-lesson-form [name="phone"]', '+32499000000');
      await page.selectOption('#private-lesson-form [name="lesson_type"]', { index: 1 });

      await clickSubmit(page, '#private-lesson-form [type="submit"]');
      await page.waitForFunction(
        () => {
          const el = document.getElementById('pl-success');
          return el && el.style.display === 'block';
        },
        { timeout: 10000 }
      );
      await assertConfirmationOnScreen(page, '#pl-success h3');

      results.push({ name, passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: '_dev/e2e/screenshots/mobile-success-private-lessons.png', fullPage: false });
      results.push({ name, passed: false, error: err.message });
    } finally {
      await page.context().close();
    }
  }

  // --- Sub-test 3: contact form ---
  {
    const name = 'mobile-success-scroll:contact-form';
    const page = await newPhonePage(browser);
    try {
      await page.route('**/api/v1/contact**', (route) =>
        route.fulfill(json({ success: true, data: { id: 1 } })));

      await page.goto(SITE_URL + '/en/contact/', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('#contactForm', { timeout: 10000 });
      await page.fill('#contactForm [name="first_name"]', 'E2E');
      await page.fill('#contactForm [name="last_name"]', 'Mobile');
      await page.fill('#contactForm [name="email"]', 'e2e-826-cf@test.be-tango.be');
      await page.selectOption('#contactForm [name="topic"]', { index: 1 });
      await page.fill('#contactForm [name="message"]', 'E2E #826 — mobile confirmation must be on screen.');

      await clickSubmit(page, '#contactForm .ft-submit');
      await page.waitForFunction(
        () => {
          const el = document.getElementById('contact-success');
          return el && el.style.display === 'block';
        },
        { timeout: 10000 }
      );
      await assertConfirmationOnScreen(page, '#contact-success h3');

      results.push({ name, passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: '_dev/e2e/screenshots/mobile-success-contact-form.png', fullPage: false });
      results.push({ name, passed: false, error: err.message });
    } finally {
      await page.context().close();
    }
  }

  return results;
}

module.exports = { run };
