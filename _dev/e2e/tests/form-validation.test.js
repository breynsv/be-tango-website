// _dev/e2e/tests/form-validation.test.js
//
// Empty-submit behaviour on the two booking forms.
//
// These sub-tests never submit anything valid, so they create no CRM records and
// need no cleanup or rate-limit slot. That is deliberate: everything asserted here
// is client-side, which is exactly the layer that was missing.
//
// What was broken before this suite existed (verified on production 2026-08-18):
//   - free-trial: the form carries `novalidate` and the submit handler never called
//     checkValidity(), so no field ever got a message. With no date picked it hit a
//     bare `if (!productId) return;` and did nothing at all — a dead button.
//     With a date picked but the name/email empty it posted anyway and surfaced the
//     raw string "HTTP 422:" in the banner.
//   - enrollment modal: reportValidity() showed a native browser bubble, one field
//     at a time, in the BROWSER's language rather than the page's.
const { SITE_URL } = require('../config');

const TRIAL_URL = SITE_URL + '/nl/tangolessen/gratis-proefles/';

// Every message rendered by the shared helper carries this class.
const ERR = '.fv-error';

async function visibleErrorsFor(page, formSel) {
  return page.evaluate((sel) => {
    const form = document.querySelector(sel);
    if (!form) return { formMissing: true };
    const vis = (e) => e.offsetWidth + e.offsetHeight > 0;
    const errs = [...form.querySelectorAll('.fv-error')].filter(vis);
    return {
      formMissing: false,
      // Which control each visible message is attached to.
      fields: errs.map((e) => e.getAttribute('data-error-for')).filter(Boolean).sort(),
      texts: errs.map((e) => e.textContent.trim()),
      invalidMarked: [...form.querySelectorAll('.fv-invalid')].map((e) => e.id || e.name).sort(),
    };
  }, formSel);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function run(browser) {
  const results = [];

  // --- Sub-test 1: free-trial, submit with every field empty ---
  {
    const page = await browser.newPage();
    try {
      await page.goto(TRIAL_URL, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForSelector('#free-trial-form', { timeout: 10000 });

      await page.click('#free-trial-form button[type="submit"]');
      await page.waitForSelector(`#free-trial-form ${ERR}`, { state: 'visible', timeout: 5000 });

      const r = await visibleErrorsFor(page, '#free-trial-form');
      assert(!r.formMissing, 'free-trial form not found');

      // Every required control must name its own problem, not just the first one.
      for (const f of ['first-name', 'last-name', 'email', 'class-date', 'terms_accepted']) {
        assert(r.fields.includes(f), `no inline error for "${f}" (got: ${r.fields.join(', ') || 'none'})`);
      }
      // Messages must be in the page's language, not the browser's.
      assert(
        r.texts.every((t) => t && !/please fill out|fill in this field/i.test(t)),
        `native English text leaked into a NL page: ${JSON.stringify(r.texts)}`
      );
      assert(r.invalidMarked.length > 0, 'no field was marked .fv-invalid');

      results.push({ name: 'validation:free-trial-empty-submit', passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: '_dev/e2e/screenshots/validation-free-trial-empty.png', fullPage: true });
      results.push({ name: 'validation:free-trial-empty-submit', passed: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  // --- Sub-test 2: free-trial, a filled-in but malformed email ---
  {
    const page = await browser.newPage();
    try {
      await page.goto(TRIAL_URL, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForSelector('#free-trial-form', { timeout: 10000 });

      await page.fill('#free-trial-form [name="first-name"]', 'E2E');
      await page.fill('#free-trial-form [name="last-name"]', 'Test');
      await page.fill('#free-trial-form [name="email"]', 'not-an-email');
      await page.click('#free-trial-form button[type="submit"]');
      await page.waitForSelector(`#free-trial-form ${ERR}`, { state: 'visible', timeout: 5000 });

      const r = await visibleErrorsFor(page, '#free-trial-form');
      assert(r.fields.includes('email'), `malformed email raised no error on the email field (got: ${r.fields.join(', ')})`);
      // The fields that ARE filled must not be flagged.
      assert(!r.fields.includes('first-name'), 'first-name flagged despite being filled');

      // The message must clear once the visitor corrects the field.
      await page.fill('#free-trial-form [name="email"]', 'someone@example.com');
      const stillThere = await page.evaluate(() =>
        !!document.querySelector('#free-trial-form .fv-error[data-error-for="email"]'));
      assert(!stillThere, 'email error stayed visible after the field was corrected');

      results.push({ name: 'validation:free-trial-email-format', passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: '_dev/e2e/screenshots/validation-free-trial-email.png', fullPage: true });
      results.push({ name: 'validation:free-trial-email-format', passed: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  // Sub-test 3 ("paid-lessons modal, submit with every field empty") is gone: the
  // enrollment modal no longer has a form, a submit button, or any fields to leave
  // empty — it renders two portal links (see enrollment.test.js:enrollment:router
  // for the assertion that replaces this coverage). It used to check that
  // #em-first-name/#em-last-name/#em-email/#em-phone/#em-terms each got an inline
  // error on empty submit, in the page's own language rather than the browser's —
  // there is no equivalent behaviour left to assert.

  return results;
}

module.exports = { run };
