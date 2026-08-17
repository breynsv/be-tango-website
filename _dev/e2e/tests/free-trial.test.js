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

async function fillBaseFields(page, email) {
  await page.fill('#free-trial-form [name="first-name"]', 'E2E');
  await page.fill('#free-trial-form [name="last-name"]', 'Test');
  await page.fill('#free-trial-form [name="email"]', email);
  await page.fill('#free-trial-form [name="phone"]', '+32499000000');
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
  await page.check('[name="consent"]');

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

  // Wait for dynamically-created success message
  await page.waitForSelector('.form-success-message', { timeout: 8000 });

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
