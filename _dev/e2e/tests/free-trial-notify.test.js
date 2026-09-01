// _dev/e2e/tests/free-trial-notify.test.js
//
// "None of these dates work — keep me informed" must reach the CRM as DATA.
//
// Until 2026-08-31 this branch of the free-trial form pasted one of six fixed
// sentences into the free-text `message` and posted the general contact form,
// so the CRM stored the whole intent as prose on a row that said
// `general_contact`. Nothing on that side could count these people or tell them
// apart from somebody typing a real question about free trials. The endpoint
// that files it properly had existed the whole time and had never been called.
//
// So the assertion here is on the OUTGOING REQUEST, not on the response and not
// on "the success card appeared". A handler that runs and a form that says
// thank you are exactly what the old, broken path also did — the only thing
// that changed, and the only thing worth pinning, is where the browser posts
// and what it puts in the body.
//
// Every /api/v1/ POST is intercepted and answered locally, so this module
// creates nothing anywhere and is safe to run against production.
const { SITE_URL } = require('../config');

const PAGE_URL = SITE_URL + '/en/tango-classes/free-trial/';

async function waitForDates(page) {
  await page.waitForFunction(
    () => {
      const sel = document.querySelector('[name="class-date"]');
      return sel && sel.options.length > 1;
    },
    { timeout: 15000 }
  );
}

async function run(browser) {
  const results = [];
  const page = await browser.newPage();

  // Captured rather than asserted inline: a route handler that throws is
  // swallowed by the page, and the test would then fail on a timeout with no
  // sign of what the request actually looked like.
  const posts = [];

  try {
    await page.route('**/api/v1/**', async (route) => {
      const req = route.request();
      if (req.method() !== 'POST') return route.fallback();

      let body = null;
      try { body = JSON.parse(req.postData() || 'null'); } catch (_) { /* not JSON */ }
      posts.push({ url: req.url(), body });

      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'ok', data: { contact_id: 1 } }),
      });
    });

    await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await waitForDates(page);

    // Tick "I can't make any of these dates". The checkbox only exists when
    // dates are on offer, which is the case this ticket is about: dates exist
    // and none of them suit.
    await page.check('input[name="notify-me"]');

    await page.fill('#free-trial-form [name="first-name"]', 'E2E');
    await page.fill('#free-trial-form [name="last-name"]', 'Notify');
    await page.fill('#free-trial-form [name="email"]', 'e2e-notify@test.be-tango.be');
    await page.fill('#free-trial-form [name="phone"]', '+32499000000');
    await page.fill('#free-trial-form [name="message"]', 'Evenings only please.');
    // Pre-existing markup gate: terms_accepted carries `required` and stays
    // visible in notify mode, so the browser blocks the submit without it.
    await page.check('[name="terms_accepted"]');

    await page.click('#free-trial-form [type="submit"]');
    await page.waitForFunction(
      () => {
        const card = document.querySelector('.ft-success');
        return card && card.offsetParent !== null;
      },
      { timeout: 15000 }
    );

    if (posts.length !== 1) {
      throw new Error(`expected exactly one API POST, saw ${posts.length}: ${posts.map((p) => p.url).join(', ')}`);
    }

    const [post] = posts;

    if (!post.url.endsWith('/free-trial/notify-me')) {
      throw new Error(
        `the notify-me branch posted to ${post.url} — the fact reaches the CRM as prose on a contact-form row, not as data`
      );
    }

    const b = post.body || {};
    if (!b.contact || b.contact.email !== 'e2e-notify@test.be-tango.be') {
      throw new Error('the payload does not carry contact.email — the endpoint validates a nested contact object');
    }
    for (const field of ['first_name', 'last_name', 'language']) {
      if (!b.contact[field]) throw new Error(`the payload is missing contact.${field}, which the endpoint requires`);
    }
    if (b.message !== 'Evenings only please.') {
      throw new Error(`message carried ${JSON.stringify(b.message)} — the visitor's own note must travel verbatim`);
    }
    if ('topic' in b) {
      throw new Error('the payload still carries a contact-form `topic` — this is no longer the contact form');
    }
    if (typeof b.message === 'string' && b.message.includes('[')) {
      throw new Error('the message still carries a pasted marker sentence; the fact belongs in the route, not the prose');
    }

    results.push({ name: 'free-trial-notify:posts-to-the-notify-endpoint', passed: true, error: null });
  } catch (err) {
    await page.screenshot({ path: '_dev/e2e/screenshots/free-trial-notify.png', fullPage: true }).catch(() => {});
    results.push({ name: 'free-trial-notify:posts-to-the-notify-endpoint', passed: false, error: err.message });
  } finally {
    await page.close();
  }

  return results;
}

module.exports = { run };
