/**
 * GET /api/beginner-promo — Cloudflare Pages Function.
 *
 * js/beginner-promo.js decides whether the homepages and free-trial pages show
 * the beginners-weekend variant. It needs two CRM answers (free-trial dates,
 * beginner classes), and each costs ~0.7-0.9s of Laravel boot time, uncached.
 * On a phone that left the old "free trial" button on screen for 1-2s.
 *
 * This function answers from the Cloudflare edge cache, same-origin (no CORS,
 * no extra TLS handshake), and asks the CRM only to fill or refresh it:
 *   - younger than 5 min (FRESH_S): served as is;
 *   - 5 min to 1 hour old (MAX_S): served as is AND refreshed in the
 *     background, so the next visitor gets the new answer (stale-while-
 *     revalidate) — nobody waits for the CRM;
 *   - older than 1 hour, or absent: the visitor waits for the CRM (~1s).
 * Why the hour: the cache is per Cloudflare location (measured 2026-10-05: BRU
 * and AMS each filled their own), and a quiet school site often has no
 * visitor at a given location for 5 minutes. With a plain 5-minute TTL most
 * visits would be cold misses and gain nothing.
 * The flip side: when free-trial dates are published again, pages switch back
 * within ~5 minutes on a busy location; on a quiet one, the first visitor
 * after a lull can still get an answer up to an hour old (and triggers the
 * refresh), plus up to 60s of browser cache.
 *
 * Contract:
 *   200 { success: true, free_trials: <number of bookable free trials>,
 *         workshops: [<type==='Workshop' items, trimmed to what the client uses>],
 *         fetched_at: <ISO time> }
 *   502 { success: false } when either CRM call fails, times out or answers
 *       success:false. Never cached — the client then falls back to calling
 *       the CRM directly.
 *
 * "Is the weekend still upcoming" stays in the browser (visitor's own today);
 * this only narrows the list, it does not date-filter it.
 *
 * Only /api/* runs functions (see /_routes.json); every other path stays
 * static and free.
 */

const CRM_BASE = 'https://betango.membrero.com/api/v1';
const TIMEOUT_MS = 4000;
// Fixed synthetic key on the request's own origin: query strings, cookies and
// headers on the visitor's request can never create extra cache entries.
const CACHE_PATH = '/api/beginner-promo/__edge-cache-v1';
const FRESH_S = 300;
const MAX_S = 3600;
const BROWSER_CACHE = 'public, max-age=60';
const STORED_AT = 'x-promo-stored-at';

function json(body, status, cacheControl) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}

async function crm(base, path) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(base + path, {
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(path + ': HTTP ' + res.status);
    const body = await res.json();
    if (!body || body.success !== true || !Array.isArray(body.data)) throw new Error(path + ': bad payload');
    return body.data;
  } finally {
    clearTimeout(timer);
  }
}

function slimLocation(loc) {
  if (!loc || typeof loc !== 'object') return null;
  return { name: loc.name == null ? null : loc.name, city: loc.city == null ? null : loc.city };
}

function slimWorkshop(c) {
  return {
    id: c.id,
    type: c.type,
    start_date: c.start_date == null ? null : c.start_date,
    end_date: c.end_date == null ? null : c.end_date,
    price: c.price == null ? null : c.price,
    location: slimLocation(c.location),
  };
}

// Ask the CRM for both lists -> the payload object, or throw.
async function build(base) {
  const [trials, classes] = await Promise.all([
    crm(base, '/free-trials/available'),
    crm(base, '/classes/beginner'),
  ]);
  return {
    success: true,
    free_trials: trials.length,
    workshops: classes.filter((c) => c && c.type === 'Workshop').map(slimWorkshop),
    fetched_at: new Date().toISOString(),
  };
}

// The copy kept in the edge cache: the Cache API keeps it for MAX_S, and the
// stored-at header lets us tell fresh from stale without parsing the body.
function store(cache, key, payload) {
  const res = new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=' + MAX_S,
      [STORED_AT]: String(Date.now()),
    },
  });
  return cache.put(key, res).catch(() => {});
}

function later(context, promise) {
  if (typeof context.waitUntil === 'function') context.waitUntil(promise);
  else return promise;
}

export async function onRequestGet(context) {
  const request = context.request;
  const env = context.env || {};
  const base = (env.CRM_API_BASE || CRM_BASE).replace(/\/+$/, '');
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request(new URL(CACHE_PATH, request.url).toString(), { method: 'GET' });

  if (cache) {
    let hit = null;
    try { hit = await cache.match(key); } catch (e) { /* a cache fault is a miss, not an outage */ }
    const storedAt = hit ? Number(hit.headers.get(STORED_AT)) : NaN;
    const age = (Date.now() - storedAt) / 1000;
    if (hit && age >= 0 && age < MAX_S) {
      if (age >= FRESH_S) {
        // Serve now, refresh for the next visitor. A failed refresh keeps the
        // last good answer.
        await later(context, build(base).then((p) => store(cache, key, p), () => {}));
      }
      return new Response(hit.body, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': BROWSER_CACHE },
      });
    }
  }

  let payload;
  try {
    payload = await build(base);
  } catch (e) {
    return json({ success: false }, 502, 'no-store');
  }
  if (cache) await later(context, store(cache, key, payload));
  return json(payload, 200, BROWSER_CACHE);
}
