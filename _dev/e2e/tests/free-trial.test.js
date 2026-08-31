// _dev/e2e/tests/free-trial.test.js
const { SITE_URL, testEmail } = require('../config');
const { verifyEmailDelivered } = require('../helpers/email-verify');
const { formSubmitSlot } = require('../helpers/rate-limit');

const PAGE_URL = SITE_URL + '/en/tango-classes/free-trial/';

// #ft-radio-solo / #ft-radio-partner are visually-hidden inputs (opacity:0, position:absolute,
// 0x0), so Playwright correctly refuses to click them — "element is not visible". Each has a
// styled label[for=...] (.ft-partner-card) which is what a real user actually clicks.
async function choosePartnerOption(page, radioId) {
  await page.click(`label[for="${radioId}"]`);
  await page.waitForFunction(
    (id) => document.getElementById(id) && document.getElementById(id).checked,
    radioId,
    { timeout: 5000 }
  );
}

// Gender has been required on every free-trial registration since 2026-08-26, for
// partner matching — see docs/agent-free-form-fields-2026-08-26.md in
// betangocrm-laravel. Its select opens on "-- Select --", which is not a valid
// value, so a test that skips it never submits at all: the browser blocks the form,
// no POST is made, and the wait for /free-trial/register times out 15s later. That
// reads as a dead endpoint and is really an unfilled box. (Preferred Language is
// required too, but ships with English pre-selected, so it does not block. It is
// deliberately left at that default — that is the path a real visitor takes.)
async function fillBaseFields(page, email) {
  await page.fill('#free-trial-form [name="first-name"]', 'E2E');
  await page.fill('#free-trial-form [name="last-name"]', 'Test');
  await page.fill('#free-trial-form [name="email"]', email);
  await page.fill('#free-trial-form [name="phone"]', '+32499000000');
  await page.selectOption('#free-trial-form [name="gender"]', 'Female');
}

/**
 * Birth year and height are asked only of someone coming WITHOUT a partner, so
 * js/free-trial.js adds `required` to them at the moment "Coming alone" is chosen
 * and takes it off again otherwise. They must therefore be filled AFTER the partner
 * choice — filling them alongside the base fields would write into a hidden row and
 * the choice would then clear it.
 *
 * "170 cm" is fed through the same BETangoValidate.parseHeightCm the form uses, so
 * this asserts the accepted format too, not just that the box is non-empty.
 */
async function fillAloneFields(page) {
  await page.waitForSelector('#ft-alone-fields', { state: 'visible', timeout: 5000 });
  await page.fill('#ft-birth-year', '1985');
  await page.fill('#ft-height', '170 cm');
}

async function selectFirstAvailableDate(page) {
  // Wait for API to populate the date select (up to 10s)
  await page.waitForFunction(
    () => {
      const sel = document.querySelector('[name="class-date"]');
      return sel && sel.options.length > 1; // more than just the default placeholder
    },
    { timeout: 10000 }
  );

  // Select the first non-empty option
  const firstValue = await page.evaluate(() => {
    const sel = document.querySelector('[name="class-date"]');
    const opt = Array.from(sel.options).find((o) => o.value !== '');
    return opt ? opt.value : null;
  });

  if (!firstValue) throw new Error('No available free trial dates in production — cannot run test');
  await page.selectOption('[name="class-date"]', firstValue);
}

async function submitAndAwaitResponse(page) {
  // Terms acceptance is required; the marketing opt-in beside it is optional and
  // intentionally left unticked so this exercises the consent-free booking path.
  await page.check('[name="terms_accepted"]');

  await formSubmitSlot('free-trial');

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/free-trial/register') && res.request().method() === 'POST',
      { timeout: 15000 }
    ),
    page.click('#free-trial-form button[type="submit"]'),
  ]);

  if (response.status() !== 200 && response.status() !== 201) {
    const body = await response.text();
    throw new Error(`API returned HTTP ${response.status()}: ${body}`);
  }

  // Wait for the dynamically-created success panel. NOT .form-success-message —
  // that class is emitted by js/enrollment-form.js, which this page does not load.
  // The free-trial page is driven by js/free-trial.js, which renders .ft-success
  // (for both the confirmed and the waitlisted variants).
  await page.waitForSelector('.ft-success', { timeout: 8000 });

  return response;
}

async function run(browser) {
  const results = [];

  // --- Sub-test 1: Solo registration → Waitlisted ---
  {
    const page = await browser.newPage();
    const email = testEmail('free-trial-solo');

    try {
      await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 20000 });
      await fillBaseFields(page, email);
      await selectFirstAvailableDate(page);
      await choosePartnerOption(page, 'ft-radio-solo');
      await fillAloneFields(page);
      await submitAndAwaitResponse(page);

      await verifyEmailDelivered(email, 'tango');

      results.push({ name: 'free-trial:solo-waitlist', passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: '_dev/e2e/screenshots/free-trial-solo.png', fullPage: true });
      results.push({ name: 'free-trial:solo-waitlist', passed: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  // --- Sub-test 2: Couple registration → CONFIRMED ---
  {
    const page = await browser.newPage();
    const email = testEmail('free-trial-leader');

    try {
      await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 20000 });
      await fillBaseFields(page, email);
      await selectFirstAvailableDate(page);
      await choosePartnerOption(page, 'ft-radio-partner');

      // There is no partner panel on this form. #partner is an internal <select>
      // that is display:none at all times, so the old wait for it to become
      // "visible" could only ever time out. Choosing "with a partner" shows a tick
      // on the chosen card and nothing else — that is the real UI feedback.
      // (choosePartnerOption has already asserted the radio is actually checked.)
      await page.waitForSelector('.ft-partner-check', { state: 'visible', timeout: 5000 });

      await submitAndAwaitResponse(page);

      await verifyEmailDelivered(email, 'tango');

      results.push({ name: 'free-trial:couple-confirmed', passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: '_dev/e2e/screenshots/free-trial-couple.png', fullPage: true });
      results.push({ name: 'free-trial:couple-confirmed', passed: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  return results;
}

module.exports = { run };
