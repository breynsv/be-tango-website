// _dev/e2e/tests/beginner-promo.test.js
//
// While the CRM has no free-trial dates but does have an upcoming beginners
// weekend, js/beginner-promo.js turns the homepage's "free trial" buttons into
// weekend buttons and adds a weekend card to the free-trial page. In every other
// case — trials published, no upcoming weekend, API error, slow API — the pages
// must stay exactly as shipped. That fail-safe is the point of the feature, so
// most of these sub-tests are about the page NOT changing.
//
// Like mobile-success-scroll, this module books nothing and talks to no backend:
// every request that is not for the local static server is aborted, and the two
// endpoints under test are stubbed. It also serves THIS checkout itself on a
// random port, so it always tests the working tree — E2E_SITE_URL does not apply.
//
// Run alone (needs no .env):  node _dev/e2e/tests/beginner-promo.test.js
// Or as part of the suite:    E2E_ONLY=beginner-promo npm run test:e2e

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    let file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function ymd(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const LOCATION = {
  id: 6, name: 'Gatti de Gamond',
  city: { en: 'Brussels', fr: 'Bruxelles', nl: 'Brussel' },
};
// Product 493 as the live CRM serves it.
const WEEKEND = {
  id: 493, type: 'Workshop', start_date: '2026-11-14', end_date: '2026-11-15',
  start_time: '14:00', end_time: '16:15', price: '95.00', location: LOCATION,
};
const PAST_WEEKEND = { ...WEEKEND, id: 400, start_date: ymd(-30), end_date: ymd(-29) };
const LATER_WEEKEND = { ...WEEKEND, id: 500, start_date: '2027-01-16', end_date: '2027-01-17', price: '110.00' };
const WEEKLY = { id: 480, type: 'Weekly_Course', start_date: '2026-09-14', end_date: '2027-01-25', price: '180.00', location: LOCATION };
const CROSS_MONTH = { ...WEEKEND, id: 501, start_date: '2026-10-31', end_date: '2026-11-01', price: '95.50' };
const TRIAL = { id: 4242, start_date: '2026-11-03', start_time: '19:00', end_time: '20:00', location: LOCATION };

const PAGES = {
  en: {
    home: '/en/', trial: '/en/tango-classes/free-trial/',
    weekendUrl: '/en/tango-classes/beginners/#intensive-bootcamp',
    heroBtn: 'Beginners weekend · 14–15 Nov', nav: 'Beginners weekend',
    date: 'Sat 14 & Sun 15 November', price: '€95 per person', hours: '2 × 2 hours',
    origHero: 'BOOK A FREE TRIAL', origHeroHref: 'tango-classes/free-trial/', origNav: 'Free Trial',
  },
  fr: {
    home: '/fr/', trial: '/fr/cours-de-tango/essai-gratuit/',
    weekendUrl: '/fr/cours-de-tango/debutants/#intensive-bootcamp',
    heroBtn: 'Week-end débutants · 14–15 nov', nav: 'Week-end débutants',
    date: 'Sam. 14 & dim. 15 novembre', price: '€95 par personne', hours: '2 × 2 heures',
    origHero: 'RÉSERVEZ UN ESSAI GRATUIT', origHeroHref: 'cours-de-tango/essai-gratuit/', origNav: 'Essai Gratuit',
  },
  nl: {
    home: '/nl/', trial: '/nl/tangolessen/gratis-proefles/',
    weekendUrl: '/nl/tangolessen/beginners/#weekend-intensief',
    heroBtn: 'Beginnersweekend · 14–15 nov', nav: 'Beginnersweekend',
    date: 'Za 14 & zo 15 november', price: '€95 per persoon', hours: '2 × 2 uur',
    origHero: 'BOEK EEN GRATIS PROEFLES', origHeroHref: 'tangolessen/gratis-proefles/', origNav: 'Gratis Proefles',
  },
};

const DESKTOP = { viewport: { width: 1280, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

function ok(body) { return { status: 200, contentType: 'application/json', body: JSON.stringify(body) }; }

// The same-origin edge endpoint (functions/api/beginner-promo.js) as Cloudflare
// would serve it: both CRM answers, already reduced to what the page needs.
function edgeBody(trials, classes) {
  return {
    success: true,
    free_trials: trials.length,
    workshops: classes.filter((c) => c.type === 'Workshop')
      .map(({ id, type, start_date, end_date, price, location }) => ({ id, type, start_date, end_date, price, location: { name: location.name, city: location.city } })),
    fetched_at: new Date().toISOString(),
  };
}

// api: { trials: <array | 'error' | 'abort' | 'slow'>, beginner: <array | 'error' | 'abort' | 'fail'>,
//        edge: <undefined | edge body | 404 | 'error' | 'bad-json' | 'slow'> }
// edge undefined = not mocked: the request reaches the local static server, which
// has no Functions runtime and answers 404 — exactly what local dev sees.
// page.promoCalls counts requests per endpoint.
async function openPage(browser, origin, url, api, ctxOpts) {
  const context = await browser.newContext(ctxOpts || DESKTOP);
  const page = await context.newPage();
  // Most recently registered handler wins, so the catch-all goes on first.
  await page.route('**/*', (route) => {
    const u = route.request().url();
    return u.startsWith(origin) ? route.continue() : route.abort();
  });
  const respond = (spec) => async (route) => {
    if (spec === 'abort') return route.abort();
    if (spec === 'error') return route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false}' });
    if (spec === 'fail') return route.fulfill(ok({ success: false, message: 'nope', data: [] }));
    if (spec === 'slow') { await new Promise((r) => setTimeout(r, 6000)); return route.fulfill(ok({ success: true, data: [] })).catch(() => {}); }
    return route.fulfill(ok({ success: true, message: null, data: spec }));
  };
  const calls = { edge: 0, trials: 0, beginner: 0 };
  page.promoCalls = calls;
  const counted = (key, handler) => (route) => { calls[key]++; return handler(route); };
  await page.route('**/api/v1/free-trials/available**', counted('trials', respond(api.trials)));
  await page.route('**/api/v1/classes/beginner**', counted('beginner', respond(api.beginner)));
  await page.route((u) => u.pathname === '/api/beginner-promo' && u.origin === origin, counted('edge', async (route) => {
    const spec = api.edge;
    if (spec === undefined) return route.continue();
    if (typeof spec === 'number') return route.fulfill({ status: spec, contentType: 'text/plain', body: 'not found' });
    if (spec === 'error') return route.fulfill({ status: 502, contentType: 'application/json', body: '{"success":false}' });
    if (spec === 'bad-json') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>x</title>' });
    if (spec === 'slow') { await new Promise((r) => setTimeout(r, 6000)); return route.fulfill(ok(edgeBody([], [WEEKEND]))).catch(() => {}); }
    return route.fulfill(ok(spec));
  }));
  await page.goto(origin + url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  return { context, page };
}

async function waitForDecision(page) {
  try {
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-beginner-promo'), null, { timeout: 8000 });
  } catch (e) {
    throw new Error('js/beginner-promo.js never recorded a decision (is it loaded on this page?)');
  }
  return page.evaluate(() => document.documentElement.getAttribute('data-beginner-promo'));
}

function eq(actual, expected, what) {
  if (actual !== expected) throw new Error(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

async function noHorizontalOverflow(page, what) {
  const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (o > 0) throw new Error(`${what}: page scrolls sideways by ${o}px`);
}

async function homeState(page) {
  return page.evaluate(() => {
    const btn = document.querySelector('.hero-cta .btn-primary');
    const sec = document.querySelector('.hero-cta .btn-secondary');
    const nav = document.querySelector('.site-header a.btn-nav');
    const note = document.querySelector('.hero-promo-note');
    const noteLink = note && note.querySelector('a');
    return {
      heroText: btn.textContent.trim(), heroHref: btn.getAttribute('href'),
      secondaryHref: sec.getAttribute('href'),
      navText: nav.textContent.trim(), navHref: nav.getAttribute('href'),
      note: note ? note.textContent.trim() : null,
      noteHref: noteLink ? noteLink.getAttribute('href') : null,
    };
  });
}

async function trialState(page) {
  return page.evaluate(() => {
    const card = document.querySelector('.weekend-promo');
    if (!card) return null;
    const hero = document.querySelector('.ft-hero');
    const bookNow = document.getElementById('book-now');
    const below = card.querySelector('.weekend-promo__below a');
    return {
      afterHero: hero.nextElementSibling === card,
      beforeBookNow: card.nextElementSibling === bookNow,
      pills: [...card.querySelectorAll('.weekend-promo__pill')].map((p) => p.textContent.trim()),
      ctaHref: card.querySelector('.weekend-promo__btn').getAttribute('href'),
      belowHref: below.getAttribute('href'),
      belowTargetExists: !!document.querySelector(below.getAttribute('href')),
      title: card.querySelector('h2').textContent.trim(),
    };
  });
}

async function assertHomeUnchanged(page, L) {
  const s = await homeState(page);
  eq(s.heroText, L.origHero, 'hero button text');
  eq(s.heroHref, L.origHeroHref, 'hero button href');
  eq(s.navText, L.origNav, 'nav button text');
  eq(s.note, null, 'hero note');
}

async function assertTrialUnchanged(page) {
  const s = await trialState(page);
  if (s) throw new Error('weekend card was inserted on the free-trial page');
}

async function run(browser) {
  const results = [];
  const server = await startServer();
  const origin = `http://127.0.0.1:${server.address().port}`;

  async function sub(name, fn) {
    const opened = [];
    const open = async (url, api, ctx) => { const o = await openPage(browser, origin, url, api, ctx); opened.push(o.context); return o.page; };
    try {
      await fn(open);
      results.push({ name: 'beginner-promo:' + name, passed: true, error: null });
    } catch (err) {
      results.push({ name: 'beginner-promo:' + name, passed: false, error: err.message });
    } finally {
      for (const c of opened) await c.close().catch(() => {});
    }
  }

  const WEEKEND_API = { trials: [], beginner: [PAST_WEEKEND, WEEKLY, LATER_WEEKEND, WEEKEND] };

  // 1. No trials + an upcoming weekend → weekend variant, in every language.
  for (const lang of ['fr', 'en', 'nl']) {
    const L = PAGES[lang];
    await sub(`${lang}:homepage-weekend`, async (open) => {
      for (const ctx of [DESKTOP, PHONE]) {
        const page = await open(L.home, WEEKEND_API, ctx);
        eq(await waitForDecision(page), 'weekend', 'decision');
        const s = await homeState(page);
        eq(s.heroText, L.heroBtn, 'hero button text');
        eq(s.heroHref, L.weekendUrl, 'hero button href');
        eq(s.secondaryHref === null, false, 'secondary button still present');
        eq(s.navText, L.nav, 'nav button text');
        eq(s.navHref, L.weekendUrl, 'nav button href');
        eq(s.noteHref, L.trial, 'hero note links to the free-trial page');
        await noHorizontalOverflow(page, `${lang} homepage at ${ctx.viewport.width}px`);
      }
    });
    await sub(`${lang}:free-trial-card`, async (open) => {
      for (const ctx of [DESKTOP, PHONE]) {
        const page = await open(L.trial, WEEKEND_API, ctx);
        eq(await waitForDecision(page), 'weekend', 'decision');
        const s = await trialState(page);
        if (!s) throw new Error('no .weekend-promo card on the free-trial page');
        eq(s.afterHero, true, 'card sits right after .ft-hero');
        eq(s.beforeBookNow, true, 'card sits right before #book-now');
        eq(s.pills[0], L.date, 'date pill');
        eq(s.pills[1], L.hours, 'hours pill');
        eq(s.pills[2], L.price, 'price pill');
        eq(s.ctaHref, L.weekendUrl, 'card button href');
        eq(s.belowHref, '#book-now-form', 'notify link');
        eq(s.belowTargetExists, true, '#book-now-form exists');
        await noHorizontalOverflow(page, `${lang} free-trial page at ${ctx.viewport.width}px`);
      }
    });
  }

  // Dates spanning two months, and a price with cents.
  await sub('en:cross-month-dates', async (open) => {
    const api = { trials: [], beginner: [CROSS_MONTH] };
    let page = await open(PAGES.en.home, api);
    eq(await waitForDecision(page), 'weekend', 'decision');
    eq((await homeState(page)).heroText, 'Beginners weekend · 31 Oct – 1 Nov', 'hero button text');
    page = await open(PAGES.fr.trial, api);
    eq(await waitForDecision(page), 'weekend', 'decision');
    const s = await trialState(page);
    eq(s.pills[0], 'Sam. 31 octobre & dim. 1 novembre', 'date pill');
    eq(s.pills[2], '€95,50 par personne', 'price pill');
  });

  // 2–4. Every other case leaves both pages exactly as shipped.
  const UNCHANGED = [
    ['trials-exist', { trials: [TRIAL], beginner: [WEEKEND] }],
    ['only-past-weekend', { trials: [], beginner: [PAST_WEEKEND, WEEKLY] }],
    ['classes-500', { trials: [], beginner: 'error' }],
    ['trials-500', { trials: 'error', beginner: [WEEKEND] }],
    ['trials-aborted', { trials: 'abort', beginner: [WEEKEND] }],
    ['classes-success-false', { trials: [], beginner: 'fail' }],
  ];
  for (const [name, api] of UNCHANGED) {
    for (const lang of ['fr', 'en']) {
      await sub(`${lang}:${name}:unchanged`, async (open) => {
        let page = await open(PAGES[lang].home, api);
        eq(await waitForDecision(page), 'default', 'decision');
        await assertHomeUnchanged(page, PAGES[lang]);
        page = await open(PAGES[lang].trial, api);
        eq(await waitForDecision(page), 'default', 'decision');
        await assertTrialUnchanged(page);
      });
    }
  }

  // 5. The edge endpoint answers: the page decides from it alone and never calls
  //    the CRM (that is the whole speed-up). "edge requests: 1" also proves the
  //    page's <link rel="preload" href="/api/beginner-promo"> is the request the
  //    script reuses — a credentials-mode mismatch makes it 2 (checked by hand
  //    with crossorigin="use-credentials").
  const CRM_OFF = { trials: 'abort', beginner: 'abort' };
  for (const lang of ['fr', 'en', 'nl']) {
    const L = PAGES[lang];
    await sub(`${lang}:edge-weekend:no-crm-calls`, async (open) => {
      for (const url of [L.home, L.trial]) {
        const page = await open(url, { ...CRM_OFF, edge: edgeBody([], WEEKEND_API.beginner) }, PHONE);
        eq(await waitForDecision(page), 'weekend', `${url} decision`);
        if (url === L.home) eq((await homeState(page)).heroText, L.heroBtn, 'hero button text');
        else eq((await trialState(page)).pills[0], L.date, 'date pill');
        eq(page.promoCalls.edge, 1, 'edge requests');
        // The free-trial page's own booking widget (free-trial.js) still lists
        // trials from the CRM; the promo itself must not call either endpoint.
        if (url === L.home) eq(page.promoCalls.trials + page.promoCalls.beginner, 0, 'CRM requests');
        else eq(page.promoCalls.beginner, 0, 'CRM beginner-class requests');
      }
    });
  }
  await sub('en:edge-trials-exist:unchanged-no-crm-calls', async (open) => {
    const page = await open(PAGES.en.home, { ...CRM_OFF, edge: edgeBody([TRIAL], [WEEKEND]) });
    eq(await waitForDecision(page), 'default', 'decision');
    await assertHomeUnchanged(page, PAGES.en);
    eq(page.promoCalls.trials + page.promoCalls.beginner, 0, 'CRM requests');
  });
  await sub('fr:edge-only-past-weekend:unchanged', async (open) => {
    const page = await open(PAGES.fr.trial, { ...CRM_OFF, edge: edgeBody([], [PAST_WEEKEND, WEEKLY]) });
    eq(await waitForDecision(page), 'default', 'decision');
    await assertTrialUnchanged(page);
  });

  // 6. The edge endpoint fails in any way → the page asks the CRM directly, as before.
  for (const [name, edge] of [['404', 404], ['502', 'error'], ['bad-json', 'bad-json']]) {
    await sub(`en:edge-${name}:falls-back-to-crm`, async (open) => {
      let page = await open(PAGES.en.home, { ...WEEKEND_API, edge });
      eq(await waitForDecision(page), 'weekend', 'decision');
      eq((await homeState(page)).heroText, PAGES.en.heroBtn, 'hero button text');
      eq(page.promoCalls.edge, 1, 'edge requests');
      eq(page.promoCalls.trials, 1, 'CRM free-trials requests');
      eq(page.promoCalls.beginner, 1, 'CRM beginner requests');
      page = await open(PAGES.en.home, { trials: [TRIAL], beginner: [WEEKEND], edge });
      eq(await waitForDecision(page), 'default', 'decision when the CRM has trials');
      await assertHomeUnchanged(page, PAGES.en);
    });
  }
  await sub('nl:edge-404-and-crm-500:unchanged', async (open) => {
    const page = await open(PAGES.nl.trial, { trials: 'error', beginner: [WEEKEND], edge: 404 });
    eq(await waitForDecision(page), 'default', 'decision');
    await assertTrialUnchanged(page);
  });
  // An edge answer that never comes uses up the one 4s budget: default, and
  // no late CRM calls after the budget is gone.
  await sub('fr:edge-slow:unchanged', async (open) => {
    const page = await open(PAGES.fr.home, { ...WEEKEND_API, edge: 'slow' });
    const t0 = Date.now();
    eq(await waitForDecision(page), 'default', 'decision');
    if (Date.now() - t0 > 5500) throw new Error(`decision took ${Date.now() - t0}ms, budget is 4s`);
    await page.waitForTimeout(3000); // past the slow answer
    await assertHomeUnchanged(page, PAGES.fr);
    eq(page.promoCalls.trials + page.promoCalls.beginner, 0, 'CRM requests after the budget ran out');
  });

  // A slow API (answers after 6s; the script gives up at 4s) changes nothing.
  await sub('fr:slow-api:unchanged', async (open) => {
    const page = await open(PAGES.fr.home, { trials: 'slow', beginner: [WEEKEND] });
    eq(await waitForDecision(page), 'default', 'decision');
    await page.waitForTimeout(3000); // past the slow answer
    await assertHomeUnchanged(page, PAGES.fr);
  });

  server.close();
  return results;
}

module.exports = { run };

if (require.main === module) {
  (async () => {
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const results = await run(browser);
    await browser.close();
    let failed = 0;
    for (const r of results) {
      if (r.passed) console.log(`  ✓ ${r.name}`);
      else { failed++; console.log(`  ✗ ${r.name}: ${r.error}`); }
    }
    console.log(`\n${results.length - failed}/${results.length} passed`);
    process.exit(failed ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
