// _dev/e2e/tests/enrollment.test.js
const https = require('https');
const http  = require('http');
const { SITE_URL, API_BASE, testEmail } = require('../config');
const { verifyEmailDelivered } = require('../helpers/email-verify');
const { formSubmitSlot } = require('../helpers/rate-limit');

async function fetchAvailableBeginnerClass() {
  return new Promise((resolve, reject) => {
    // Transport follows the configured API_BASE so local runs work — see cleanup.js.
    (API_BASE.startsWith('https:') ? https : http).get(
      API_BASE + '/classes/beginner',
      { headers: { accept: 'application/json' } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const body = JSON.parse(data);
            const classes = body.data || [];
            // The previous filter — `c.current_enrollment < c.max_students && c.publish_on_website`
            // — could never match anything, for two independent reasons:
            //   1. max_students is null on production classes (null = unlimited), and in JS
            //      `57 < null` coerces to `57 < 0` => false. Every class looked full.
            //   2. publish_on_website is not a field this endpoint returns at all, so it was
            //      always undefined => falsy.
            // The API does expose is_full / spots_remaining / is_visible / is_active; use those.
            const available = classes.find(
              (c) => c.is_full === false && c.is_visible !== false && c.is_active !== false
            );
            resolve(available || null);
          } catch (e) {
            reject(e);
          }
        });
      }
    ).on('error', reject);
  });
}

async function run(browser) {
  const results = [];
  const page = await browser.newPage();
  const leaderEmail  = testEmail('enrollment-leader');
  const followerEmail = testEmail('enrollment-follower');

  try {
    // Find a beginner class with available capacity
    const klass = await fetchAvailableBeginnerClass();
    if (!klass) {
      results.push({
        name: 'enrollment:couple',
        passed: false,
        error: 'No available beginner class found — all full or none published',
      });
      return results;
    }

    await page.goto(SITE_URL + '/en/tango-classes/beginners/', {
      waitUntil: 'networkidle',
      timeout: 25000,
    });

    // Wait for schedule to render, then click sign-up on the target class
    await page.waitForSelector('.btn-sign-up', { timeout: 15000 });

    // Click the sign-up button for our target product (identified by data-product-id if present,
    // otherwise click the first available one)
    const targetBtn = page.locator(`[data-product-id="${klass.id}"] .btn-sign-up, .btn-sign-up`).first();
    await targetBtn.click();

    // Wait for the modal to open
    await page.waitForSelector('#em-overlay:not([aria-hidden="true"])', { timeout: 8000 });

    // Fill leader fields
    await page.fill('#em-first-name', 'E2E');
    await page.fill('#em-last-name', 'Leader');
    await page.fill('#em-email', leaderEmail);
    await page.fill('#em-phone', '+32499000001');
    await page.selectOption('#em-gender', 'Male');

    // Wait for language select to be populated by API, then select first option
    await page.waitForFunction(
      () => document.querySelector('#em-language') && document.querySelector('#em-language').options.length > 1,
      { timeout: 8000 }
    );
    const firstLang = await page.evaluate(() => {
      const sel = document.querySelector('#em-language');
      return Array.from(sel.options).find((o) => o.value !== '')?.value;
    });
    if (firstLang) await page.selectOption('#em-language', firstLang);

    // Select "with partner". #em-with-partner is a visually-hidden radio (opacity:0,
    // 0x0) behind a styled label[for=...].em-partner-card — the same pattern as the
    // free-trial cards — so clicking the input itself only ever times out.
    await page.click('label[for="em-with-partner"]');
    await page.waitForFunction(
      () => document.getElementById('em-with-partner').checked,
      null,
      { timeout: 5000 }
    );
    await page.waitForSelector('#em-partner-section', { state: 'visible', timeout: 5000 });

    // Fill partner fields
    await page.fill('#em-partner-first-name', 'E2E');
    await page.fill('#em-partner-last-name', 'Follower');
    await page.fill('#em-partner-email', followerEmail);
    await page.selectOption('#em-partner-gender', 'Female');

    // Accept the terms (required) and submit. The marketing opt-in beside it is
    // deliberately left unticked — booking must succeed without it, which is the
    // whole point of splitting the old single required checkbox in two.
    await page.check('#em-terms');

    await formSubmitSlot('enrollment');
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/v1/enrollments') &&
          !res.url().includes('payment-qr') &&
          res.request().method() === 'POST',
        { timeout: 15000 }
      ),
      page.click('#em-submit'),
    ]);

    if (response.status() !== 200 && response.status() !== 201) {
      const body = await response.text();
      throw new Error(`API returned HTTP ${response.status()}: ${body}`);
    }

    // Wait for success view to appear
    await page.waitForSelector('#em-success-view', { state: 'visible', timeout: 8000 });

    // Which payment surface renders depends on the school's payment_methods
    // (bank / online / both) — production may be any of the three, so assert
    // whichever is actually shown rather than assuming the bank block. The bank
    // block (#em-bank-block) carries #em-pay-ref; online-only schools hide it
    // entirely and show the Pay-now button instead.
    const bankBlockVisible = await page.locator('#em-bank-block').isVisible();
    let paymentRef = null;
    if (bankBlockVisible) {
      paymentRef = await page.locator('#em-pay-ref').textContent({ timeout: 5000 });
      if (!paymentRef || paymentRef.trim().length === 0) {
        throw new Error('Payment reference not displayed in success view');
      }
      paymentRef = paymentRef.trim();
    } else {
      const payBtnVisible = await page.locator('#em-pay-online-btn').isVisible();
      if (!payBtnVisible) {
        throw new Error('Neither the bank block nor the Pay-now button is displayed in success view');
      }
    }

    await verifyEmailDelivered(leaderEmail, 'tango');

    results.push({ name: 'enrollment:couple', passed: true, error: null, paymentRef });
  } catch (err) {
    await page.screenshot({ path: '_dev/e2e/screenshots/enrollment.png', fullPage: true });
    results.push({ name: 'enrollment:couple', passed: false, error: err.message });
  } finally {
    await page.close();
  }

  return results;
}

module.exports = { run };
