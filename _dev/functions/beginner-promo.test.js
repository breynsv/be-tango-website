// _dev/functions/beginner-promo.test.js
//
// Unit test for the Cloudflare Pages Function at functions/api/beginner-promo.js.
// No wrangler, no network: global fetch and caches.default are stubbed, and the
// function's onRequestGet is called directly with a fake context.
//
// Run:  node _dev/functions/beginner-promo.test.js     (or: npm run test:functions)
// PROMO_FN=/path/to/variant.js points it at another copy (used to prove the
// assertions fail when the caching is taken out).

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const SRC = process.env.PROMO_FN || path.resolve(__dirname, '../../functions/api/beginner-promo.js');
const ORIGIN = 'https://www.be-tango.be';
const CRM = 'https://betango.membrero.com/api/v1';

const WEEKEND = {
  id: 493, type: 'Workshop', start_date: '2026-11-14', end_date: '2026-11-15',
  start_time: '14:00', end_time: '16:15', price: '95.00', description: 'long text',
  location: { id: 6, name: 'Gatti de Gamond', address: 'x', city: { en: 'Brussels', fr: 'Bruxelles', nl: 'Brussel' } },
};
const WEEKLY = { id: 480, type: 'Weekly_Course', start_date: '2026-09-14', end_date: '2027-01-25', price: '180.00' };

// The function is an ES module in a CommonJS package: import it via an .mjs copy
// so this runs the same on Node 18, 20 and 24.
async function load() {
  const tmp = path.join(os.tmpdir(), `beginner-promo-fn-${process.pid}-${Date.now()}.mjs`);
  fs.copyFileSync(SRC, tmp);
  try { return await import(pathToFileURL(tmp).href); } finally { fs.unlinkSync(tmp); }
}

function fakeCache() {
  const store = new Map();
  return {
    store,
    puts: 0,
    async match(req) {
      const r = store.get(typeof req === 'string' ? req : req.url);
      return r ? r.clone() : undefined;
    },
    async put(req, res) {
      this.puts++;
      store.set(typeof req === 'string' ? req : req.url, res);
    },
  };
}

// routes: { '/free-trials/available': spec, '/classes/beginner': spec }
// spec: array (success payload) | number (HTTP status) | 'fail' | 'hang'
function stubFetch(routes) {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push(String(url));
    const p = String(url).replace(CRM, '');
    const spec = routes[p];
    if (spec === undefined) throw new Error('unexpected fetch ' + url);
    if (spec === 'hang') {
      return new Promise((_, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    }
    if (typeof spec === 'number') return new Response('{"success":false}', { status: spec });
    if (spec === 'fail') return new Response(JSON.stringify({ success: false, data: [] }), { status: 200 });
    return new Response(JSON.stringify({ success: true, data: spec }), { status: 200 });
  };
  return calls;
}

function ctx(url) {
  const pending = [];
  return {
    pending,
    request: new Request(url || ORIGIN + '/api/beginner-promo'),
    env: {},
    waitUntil: (p) => pending.push(p),
  };
}

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('cache miss: fetches both CRM endpoints, returns the trimmed payload, caches it', async (fn) => {
  const cache = fakeCache();
  global.caches = { default: cache };
  const calls = stubFetch({ '/free-trials/available': [], '/classes/beginner': [WEEKLY, WEEKEND] });
  const c = ctx();
  const res = await fn.onRequestGet(c);
  await Promise.all(c.pending);

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(calls.sort(), [CRM + '/classes/beginner', CRM + '/free-trials/available']);
  assert.strictEqual(res.headers.get('cache-control'), 'public, max-age=60, s-maxage=300');
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.free_trials, 0);
  assert.deepStrictEqual(body.workshops, [{
    id: 493, type: 'Workshop', start_date: '2026-11-14', end_date: '2026-11-15', price: '95.00',
    location: { name: 'Gatti de Gamond', city: { en: 'Brussels', fr: 'Bruxelles', nl: 'Brussel' } },
  }]);
  assert.ok(!Number.isNaN(Date.parse(body.fetched_at)), 'fetched_at is a date');
  assert.strictEqual(cache.puts, 1, 'stored in the edge cache');
  assert.deepStrictEqual([...cache.store.keys()], [ORIGIN + '/api/beginner-promo/__edge-cache-v1']);
});

test('cache hit: returns the cached body and never calls the CRM', async (fn) => {
  const cache = fakeCache();
  global.caches = { default: cache };
  stubFetch({ '/free-trials/available': [], '/classes/beginner': [WEEKEND] });
  const first = ctx();
  await fn.onRequestGet(first);
  await Promise.all(first.pending);
  const cachedBody = await (await cache.match(ORIGIN + '/api/beginner-promo/__edge-cache-v1')).text();

  const calls = stubFetch({}); // any CRM call now throws "unexpected fetch"
  // A query string or another path variant must not dodge the cache.
  const res = await fn.onRequestGet(ctx(ORIGIN + '/api/beginner-promo?utm_source=x'));
  assert.strictEqual(res.status, 200);
  assert.strictEqual(calls.length, 0, 'no CRM call on a cache hit');
  assert.strictEqual(await res.text(), cachedBody);
});

test('trials published: free_trials counts them (the client then keeps the page as is)', async (fn) => {
  global.caches = { default: fakeCache() };
  stubFetch({ '/free-trials/available': [{ id: 1 }, { id: 2 }], '/classes/beginner': [WEEKEND] });
  const res = await fn.onRequestGet(ctx());
  assert.strictEqual((await res.json()).free_trials, 2);
});

const FAILURES = [
  ['trials HTTP 500', { '/free-trials/available': 500, '/classes/beginner': [WEEKEND] }],
  ['classes HTTP 500', { '/free-trials/available': [], '/classes/beginner': 500 }],
  ['classes success:false', { '/free-trials/available': [], '/classes/beginner': 'fail' }],
  ['trials timeout', { '/free-trials/available': 'hang', '/classes/beginner': [WEEKEND] }],
];
for (const [name, routes] of FAILURES) {
  test(`CRM failure (${name}): non-2xx, nothing cached`, async (fn) => {
    const cache = fakeCache();
    global.caches = { default: cache };
    stubFetch(routes);
    const c = ctx();
    const t0 = Date.now();
    const res = await fn.onRequestGet(c);
    await Promise.all(c.pending);
    assert.ok(res.status >= 500, `expected a 5xx, got ${res.status}`);
    assert.strictEqual(res.headers.get('cache-control'), 'no-store');
    assert.strictEqual(cache.puts, 0, 'a failure must not be cached');
    assert.strictEqual(cache.store.size, 0);
    if (routes['/free-trials/available'] === 'hang') {
      assert.ok(Date.now() - t0 < 6000, 'gave up within the timeout');
    }
  });
}

(async () => {
  let fn;
  try {
    fn = await load();
  } catch (e) {
    console.log(`  ✗ load ${SRC}: ${e.message}`);
    process.exit(1);
  }
  let failed = 0;
  for (const t of tests) {
    try {
      await t.fn(fn);
      console.log(`  ✓ ${t.name}`);
    } catch (e) {
      failed++;
      console.log(`  ✗ ${t.name}: ${e.message}`);
    }
  }
  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  process.exit(failed ? 1 : 0);
})();
