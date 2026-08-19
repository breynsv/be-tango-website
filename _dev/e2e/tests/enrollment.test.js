// _dev/e2e/tests/enrollment.test.js
//
// Paid-lesson enrollment moved out of this site entirely: POST /api/v1/enrollments
// now returns 410 Gone, and booking a class happens in the authenticated student
// portal (a server-rendered Laravel view in the CRM repo, not something this
// static-site suite can exercise). The couple-registration-with-payment flow this
// test used to drive — fill contact + partner fields, submit, assert a payment
// reference or Pay-now button in a #em-success-view — is gone along with it and
// cannot be rebuilt here; that coverage now belongs to the CRM's own test suite.
//
// What replaces it: js/enrollment-modal.js no longer collects details or submits
// anything. Clicking a class's sign-up button opens a modal with exactly two
// links — "I'm already a student" and "I'm new here" — built from
// window.API_CONFIG.portalURL and the class's product id. This test asserts that
// router, which is the one thing this repo can still verify end-to-end: that the
// modal opens and the two links point at the right portal URLs.
const https = require('https');
const http  = require('http');
const { SITE_URL, API_BASE } = require('../config');

async function fetchAvailableBeginnerClass() {
  return new Promise((resolve, reject) => {
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
            const available = classes.find(
              (c) => c.is_visible !== false && c.is_active !== false
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

  try {
    // Any beginner class with an id is enough — the router never checks capacity,
    // it only needs a product id to build the two ?next= links from.
    const klass = await fetchAvailableBeginnerClass();
    if (!klass) {
      results.push({
        name: 'enrollment:router',
        passed: false,
        error: 'No beginner class found — cannot render a .btn-sign-up to click',
      });
      return results;
    }

    await page.goto(SITE_URL + '/en/tango-classes/beginners/', {
      waitUntil: 'networkidle',
      timeout: 25000,
    });

    await page.waitForSelector('.btn-sign-up', { timeout: 15000 });
    const targetBtn = page.locator(`[data-product-id="${klass.id}"] .btn-sign-up, .btn-sign-up`).first();
    await targetBtn.click();

    await page.waitForSelector('#em-overlay:not([aria-hidden="true"])', { timeout: 8000 });

    const { portalBase, studentHref, newIsButton, formHiddenBeforeClick, pageLang, studentTarget, studentRel } = await page.evaluate(() => ({
      portalBase:  (window.API_CONFIG && window.API_CONFIG.portalURL) || '',
      studentHref: document.getElementById('em-router-student')?.href || '',
      newIsButton: document.getElementById('em-router-new')?.tagName === 'BUTTON',
      formHiddenBeforeClick: document.getElementById('em-form-view')?.hidden === true,
      pageLang:    (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase(),
      studentTarget: document.getElementById('em-router-student')?.target || '',
      studentRel:    document.getElementById('em-router-student')?.rel || '',
    }));

    if (!portalBase) {
      throw new Error('window.API_CONFIG.portalURL is not set on this page — router links cannot be correct');
    }

    const expectedNext    = encodeURIComponent('/portal/browse/' + klass.id);
    // The portal has nobody signed in yet, so it cannot know which language to
    // render in — this site states it with `&lang=`, taken from its own <html lang>.
    const expectedLang    = /^[a-z]{2}$/.test(pageLang) ? '&lang=' + pageLang : '';
    const expectedStudent = portalBase + '/login?next=' + expectedNext + expectedLang;

    if (!expectedLang) {
      throw new Error(`page has no usable <html lang> ("${pageLang}") — the portal would fall back to the school's locale`);
    }

    if (studentHref !== expectedStudent) {
      throw new Error(`"I'm already a student" link is wrong.\n  expected: ${expectedStudent}\n  got:      ${studentHref}`);
    }
    // "I'm new here" no longer leaves for the portal — it reveals the one-step
    // booking form in place. Making a newcomer sign up, verify an email and set
    // a password before they may pay was friction at the moment they decided to
    // buy, so the form is back for people we do not know yet.
    if (!newIsButton) {
      throw new Error('"I\'m new here" should be a button that opens the form, not a link off to the portal');
    }
    if (!formHiddenBeforeClick) {
      throw new Error('the booking form is visible before "I\'m new here" is clicked — the router is not the first step');
    }

    await page.click('#em-router-new');
    await page.waitForSelector('#em-form-view:not([hidden])', { timeout: 5000 });

    for (const id of ['em-first-name', 'em-last-name', 'em-email']) {
      if (!(await page.locator('#' + id).count())) {
        throw new Error(`the one-step form is missing #${id}`);
      }
    }
    // The partner question is the reason this form exists rather than a bare
    // name/email box: a brand-new couple must be able to book together.
    if (!(await page.locator('input[name="has_partner"], #em-partner-yes, [id*="partner"]').count())) {
      throw new Error('the one-step form has no partner question');
    }

    // Both choices open in a new tab so the visitor keeps the class page they
    // were reading. rel=noopener is required with target=_blank: without it the
    // portal tab can reach back through window.opener.
    for (const [label, target, rel] of [["I'm already a student", studentTarget, studentRel]]) {
      if (target !== '_blank') {
        throw new Error(`"${label}" should open in a new tab (target=_blank), got "${target}"`);
      }
      if (!rel.split(/\s+/).includes('noopener')) {
        throw new Error(`"${label}" opens a new tab without rel=noopener (got "${rel}")`);
      }
    }

    results.push({ name: 'enrollment:router', passed: true, error: null });
  } catch (err) {
    await page.screenshot({ path: '_dev/e2e/screenshots/enrollment.png', fullPage: true });
    results.push({ name: 'enrollment:router', passed: false, error: err.message });
  } finally {
    await page.close();
  }

  return results;
}

module.exports = { run };
