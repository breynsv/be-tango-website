// _dev/e2e/tests/portal-account-note.test.js
//
// Covers the note the modal appends UNDER the booking confirmation when the CRM
// reports that this email already has a portal account.
//
// The history is the reason this test exists. For a few hours on 2026-08-19 the
// CRM answered 409 `existing_student` and rolled the booking back, so somebody
// who filled in the whole form got nothing: no booking, just an invitation to go
// and sign in. The CRM now books them and reports the account on the SUCCESS
// payload as `existing_student` + `portal_url`, and the site mentions it as an
// aside beneath the confirmation. Two things must stay true, and both are
// asserted here:
//
//   1. The note NEVER replaces the confirmation — the booking and its payment
//      details are what the visitor came for.
//   2. The copy never asks for a booking that has already happened.
//
// Every /api/v1 call is intercepted, so this module books nothing and needs no
// cleanup. That also lets it assert the "no account" case, which real data
// cannot be relied on to produce.
const { SITE_URL } = require('../config');

const PAGES = [
  { lang: 'en', url: '/en/tango-classes/beginners/',  title: 'You also have a student portal',   btn: 'Go to your portal' },
  { lang: 'fr', url: '/fr/cours-de-tango/debutants/', title: 'Vous avez aussi un portail élève', btn: 'Accéder à votre portail' },
  { lang: 'nl', url: '/nl/tangolessen/beginners/',    title: 'Je hebt ook een studentenportaal', btn: 'Naar je portaal' },
];

// Whatever the CRM sends is what the link uses — the site never rebuilds it.
const PORTAL_URL = 'https://betango.membrero.com/portal/login?next=%2Fportal%2Fbrowse%2F999';

function enrollmentBody(known) {
  const data = {
    enrollment_id: 1, contact_id: 2, product_id: 999, status: 'Pending',
    payment_reference: 'E2E-PORTAL-NOTE', amount: 360,
    bank_account: 'BE00 0000 0000 0000', bank_name: 'BE-TANGO', bank_bic: 'GEBABEBB',
    due_date: '2026-09-01', partner_needed: false, waitlisted: false,
  };
  if (known) {
    data.existing_student = true;
    data.portal_url = PORTAL_URL;
  }
  return JSON.stringify({ success: true, data });
}

async function stubApi(page, known) {
  await page.route('**/api/v1/**', (route) => {
    const url = route.request().url();
    const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body });

    if (url.includes('/enrollments') && !url.includes('payment-qr')) {
      return route.fulfill({ status: 201, contentType: 'application/json', body: enrollmentBody(known) });
    }
    if (url.includes('payment-qr')) return json(JSON.stringify({ success: false }));
    // #em-language is a REQUIRED select the modal fills from this endpoint. An
    // empty list leaves it with no options at all and the form unsubmittable,
    // which is a harness trap worth knowing about, not a site behaviour to test.
    if (url.includes('/languages')) {
      return json(JSON.stringify({ success: true, data: [{ code: 'EN' }, { code: 'FR' }, { code: 'NL' }] }));
    }
    return json(JSON.stringify({ success: true, data: [] }));
  });
}

async function bookAsNewcomer(page, url) {
  await page.goto(SITE_URL + url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForFunction(() => !!document.getElementById('em-overlay'), null, { timeout: 15000 });

  // A trigger of our own rather than a real schedule row: the schedule comes
  // from the API this module has stubbed out, and the modal binds .btn-sign-up
  // through delegation on document, so an injected button is wired identically.
  // It is clicked via evaluate() because it has no size, and Playwright's
  // actionability check would wait on that forever.
  await page.evaluate(() => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sign-up';
    btn.id = 'e2e-signup-trigger';
    btn.dataset.productId = '999';
    btn.dataset.className = 'E2E Class';
    btn.dataset.price = '180';
    btn.dataset.location = 'Brussels';
    document.body.appendChild(btn);
  });
  await page.evaluate(() => document.getElementById('e2e-signup-trigger').click());
  await page.waitForSelector('#em-overlay:not([aria-hidden="true"])', { timeout: 8000 });

  await page.evaluate(() => document.getElementById('em-router-new').click());
  await page.waitForSelector('#em-form-view:not([hidden])', { timeout: 5000 });

  // Values are set natively and the events dispatched by hand: the radios and
  // the terms checkbox are visually-hidden inputs behind styled cards, so
  // Playwright's actionability checks never settle on them.
  await page.evaluate(() => {
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (!el) return;
      const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    set('em-first-name', 'E2E');
    set('em-last-name',  'PortalNote');
    set('em-email',      'e2e-portal-note@test.be-tango.be');
    set('em-phone',      '+32 475 00 00 00');
    for (const id of ['em-gender', 'em-language']) {
      const sel = document.getElementById(id);
      const opt = sel && Array.from(sel.options).find((o) => o.value !== '');
      if (opt) set(id, opt.value);
    }
    const solo = document.getElementById('em-solo');
    if (solo) {
      solo.checked = true;
      solo.dispatchEvent(new Event('change', { bubbles: true }));
      solo.dispatchEvent(new Event('click',  { bubbles: true }));
    }
  });

  // Height and birth year live in #em-alone-section, which only unhides once
  // "dancing alone" is chosen.
  await page.waitForSelector('#em-alone-section:not([hidden])', { timeout: 5000 });
  await page.evaluate(() => {
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (!el) return;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    set('em-height', '175');
    set('em-birth-year', '1990');
    const terms = document.getElementById('em-terms');
    if (terms) {
      terms.checked = true;
      terms.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await page.evaluate(() => document.getElementById('em-submit').click());

  try {
    await page.waitForSelector('#em-success-view:not([hidden])', { timeout: 10000 });
  } catch (e) {
    const diag = await page.evaluate(() => ({
      banner: (document.getElementById('em-error') || {}).textContent || '',
      fieldErrors: Array.from(document.querySelectorAll('.fv-error')).map((n) => (n.textContent || '').trim()).filter(Boolean),
      invalid: Array.from(document.querySelectorAll('#em-form :invalid')).map((n) => n.id || n.name),
    }));
    throw new Error('the booking never reached a confirmation: ' + JSON.stringify(diag));
  }
  await page.waitForTimeout(300);
}

async function run(browser) {
  const results = [];

  for (const p of PAGES) {
    const page = await browser.newPage();
    try {
      await stubApi(page, true);
      await bookAsNewcomer(page, p.url);

      const note = await page.evaluate(() => {
        const n = document.getElementById('em-known-note');
        if (!n) return null;
        const link = n.querySelector('.em-known-note-link');
        return {
          insideSuccess: !!(document.getElementById('em-success-view') || {}).contains?.(n),
          visible: n.offsetParent !== null,
          title: (n.querySelector('.em-known-note-title') || {}).textContent || '',
          msg:   (n.querySelector('.em-known-note-msg') || {}).textContent || '',
          label: (link || {}).textContent || '',
          href:  (link || {}).href || '',
          target: (link || {}).target || '',
          rel:    (link || {}).rel || '',
          confirmationStillThere: !document.getElementById('em-success-view').hidden,
        };
      });

      if (!note) throw new Error('#em-known-note was not rendered although the CRM reported an account');
      if (!note.confirmationStillThere) throw new Error('the confirmation is gone — the note replaced it instead of joining it');
      if (!note.insideSuccess) throw new Error('the note is not inside #em-success-view');
      if (!note.visible) throw new Error('the note is in the DOM but not visible');
      if (note.title !== p.title) throw new Error(`title: expected "${p.title}", got "${note.title}"`);
      if (note.label !== p.btn)   throw new Error(`link label: expected "${p.btn}", got "${note.label}"`);
      if (note.href !== PORTAL_URL) throw new Error(`the link was rebuilt instead of using the CRM's portal_url: "${note.href}"`);
      if (note.target !== '_blank') throw new Error('the portal link should open in a new tab so the confirmation stays put');
      if (!note.rel.split(/\s+/).includes('noopener')) throw new Error('portal link opens a new tab without rel=noopener');
      // The class is already booked by the time this note is read.
      if (/\b(book this class|réserver ce cours|deze les te boeken)\b/i.test(note.msg)) {
        throw new Error(`copy still asks for a booking that already happened: "${note.msg}"`);
      }

      results.push({ name: `portal-account-note:${p.lang}`, passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: `_dev/e2e/screenshots/portal-account-note-${p.lang}.png`, fullPage: true }).catch(() => {});
      results.push({ name: `portal-account-note:${p.lang}`, passed: false, error: err.message });
    }
    await page.close();
  }

  // Most people booking this form have no account. They must see the plain
  // confirmation and nothing else.
  const page = await browser.newPage();
  try {
    await stubApi(page, false);
    await bookAsNewcomer(page, PAGES[0].url);
    const leaked = await page.evaluate(() => !!document.getElementById('em-known-note'));
    if (leaked) throw new Error('the note appeared even though the CRM said nothing about an account');
    results.push({ name: 'portal-account-note:absent-when-unknown', passed: true, error: null });
  } catch (err) {
    results.push({ name: 'portal-account-note:absent-when-unknown', passed: false, error: err.message });
  }
  await page.close();

  return results;
}

module.exports = { run };
