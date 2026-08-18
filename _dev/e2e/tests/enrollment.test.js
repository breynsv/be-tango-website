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

    const { portalBase, studentHref, newHref } = await page.evaluate(() => ({
      portalBase:  (window.API_CONFIG && window.API_CONFIG.portalURL) || '',
      studentHref: document.getElementById('em-router-student')?.href || '',
      newHref:     document.getElementById('em-router-new')?.href || '',
    }));

    if (!portalBase) {
      throw new Error('window.API_CONFIG.portalURL is not set on this page — router links cannot be correct');
    }

    const expectedNext    = encodeURIComponent('/portal/browse/' + klass.id);
    const expectedStudent = portalBase + '/login?next=' + expectedNext;
    const expectedNew     = portalBase + '/signup?next=' + expectedNext;

    if (studentHref !== expectedStudent) {
      throw new Error(`"I'm already a student" link is wrong.\n  expected: ${expectedStudent}\n  got:      ${studentHref}`);
    }
    if (newHref !== expectedNew) {
      throw new Error(`"I'm new here" link is wrong.\n  expected: ${expectedNew}\n  got:      ${newHref}`);
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
