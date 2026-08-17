// _dev/e2e/helpers/rate-limit.js
//
// Every website form endpoint sits behind the same named limiter:
//
//   RateLimiter::for('api-forms', fn ($r) => Limit::perMinute(5)->by($tenantId.'|'.$r->ip()))
//     — betangocrm-laravel, app/Providers/AppServiceProvider.php
//
// Five submissions per minute, keyed by tenant + IP. This suite makes ten form
// submissions (contact x3, newsletter x3, private-lessons, free-trial x2,
// enrollment) and they all originate from one GitHub runner IP, so without
// pacing everything after the fifth comes back HTTP 429. That is the limiter
// working correctly — it is the suite that was misbehaving.
//
// Pacing here rather than raising the production limit or adding a bypass
// header: the limiter is a real abuse control on public, unauthenticated forms,
// and a weekly suite can afford to wait.

// 5/minute is one every 12s. 14s leaves margin for clock skew and for the fact
// that Laravel's limiter counts within a fixed window rather than a rolling one.
const MIN_INTERVAL_MS = 14000;

let lastSubmitAt = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Wait until it is safe to make another form submission without tripping
 * the api-forms limiter. Call immediately before the click that POSTs.
 */
async function formSubmitSlot(label = '') {
  const waitFor = lastSubmitAt === 0 ? 0 : MIN_INTERVAL_MS - (Date.now() - lastSubmitAt);
  if (waitFor > 0) {
    console.log(`    (pacing ${Math.ceil(waitFor / 1000)}s before ${label || 'submit'} — api-forms allows 5/min)`);
    await sleep(waitFor);
  }
  lastSubmitAt = Date.now();
}

module.exports = { formSubmitSlot, MIN_INTERVAL_MS };
