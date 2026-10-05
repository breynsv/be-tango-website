/**
 * GET /api/beginner-promo — Cloudflare Pages Function.
 *
 * js/beginner-promo.js decides whether the homepages and free-trial pages show
 * the beginners-weekend variant. It needs two CRM answers (free-trial dates,
 * beginner classes), and each costs ~0.7-0.9s of Laravel boot time, uncached.
 * On a phone that left the old "free trial" button on screen for 1-2s.
 *
 * This function asks the CRM once per Cloudflare location every 5 minutes and
 * serves everybody else from the edge cache, same-origin (no CORS, no extra
 * TLS handshake). The flip side: when free-trial dates are published again,
 * pages switch back within ~5 minutes (+ up to 60s browser cache), not instantly.
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
const OK_CACHE = 'public, max-age=60, s-maxage=300';

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

export async function onRequestGet(context) {
  const request = context.request;
  const env = context.env || {};
  const base = (env.CRM_API_BASE || CRM_BASE).replace(/\/+$/, '');
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request(new URL(CACHE_PATH, request.url).toString(), { method: 'GET' });

  if (cache) {
    try {
      const hit = await cache.match(key);
      if (hit) return hit;
    } catch (e) { /* a cache fault is a miss, not an outage */ }
  }

  let trials;
  let classes;
  try {
    [trials, classes] = await Promise.all([
      crm(base, '/free-trials/available'),
      crm(base, '/classes/beginner'),
    ]);
  } catch (e) {
    return json({ success: false }, 502, 'no-store');
  }

  const res = json({
    success: true,
    free_trials: trials.length,
    workshops: classes.filter((c) => c && c.type === 'Workshop').map(slimWorkshop),
    fetched_at: new Date().toISOString(),
  }, 200, OK_CACHE);

  if (cache) {
    const put = cache.put(key, res.clone()).catch(() => {});
    if (typeof context.waitUntil === 'function') context.waitUntil(put);
    else await put;
  }
  return res;
}
