/**
 * BE-TANGO Visit Attribution
 *
 * Records where a visit came from — a Facebook ad's UTM tags, an organic
 * search, a referring site, or nothing at all — once per browser session, and
 * hands it to the free-trial and enrolment forms at submit time.
 *
 * First touch wins. Somebody clicks an ad onto /fr/.../essai-gratuit/?utm_source=facebook,
 * reads the schedule page, comes back and submits from a clean URL. Capturing
 * at submit time would credit that sign-up to "direct"; capturing on the
 * landing page and never overwriting it credits the ad. That is the whole point
 * of this file, so the "only if not already set" guard below is load-bearing.
 *
 * Nothing is sent anywhere. This is first-party, session-scoped, and only
 * travels once the visitor submits a form themselves, which is why it is not
 * behind the cookie-consent gate.
 *
 * No dependencies. Loaded site-wide, not just on form pages — the ad click
 * frequently lands on the homepage and the form is reached later.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'bt_attr';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  // The exact shape the CRM is given. Keys are always all present; absent
  // values are null rather than missing, so the backend never has to guess
  // whether a field was unknown or simply dropped.
  var KEYS = UTM_KEYS.concat(['referrer_host', 'landing_path']);

  // Truncate, never drop: a campaign name one character over the column width
  // is still far better attribution than no campaign at all.
  var MAX_LENGTHS = {
    utm_source:    100,
    utm_medium:    100,
    utm_campaign:  150,
    utm_content:   150,
    utm_term:      150,
    referrer_host: 255,
    landing_path:  255
  };

  var SEARCH_HOSTS = ['google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'qwant'];
  var SOCIAL_HOSTS = ['facebook', 'instagram', 't.co', 'linkedin', 'youtube'];

  // ==========================================================================
  // Helpers
  // ==========================================================================

  function truncate(value, max) {
    return value.length > max ? value.slice(0, max) : value;
  }

  // Match a token as a whole domain label, so "google" catches google.com,
  // www.google.com and google.co.uk but not "notgoogle.com", and "t.co"
  // matches only itself.
  function hostMatches(host, token) {
    return host === token ||
           host.indexOf(token + '.') === 0 ||
           host.indexOf('.' + token + '.') !== -1 ||
           host.slice(-(token.length + 1)) === '.' + token;
  }

  function matchesAny(host, tokens) {
    for (var i = 0; i < tokens.length; i++) {
      if (hostMatches(host, tokens[i])) return true;
    }
    return false;
  }

  // Our own hosts. Internal navigation must never create or overwrite
  // attribution — otherwise every click from the homepage to the form would
  // rewrite a Facebook ad visit into a "be-tango.be referral". Subdomains are
  // included too: the CRM and the hosted checkout both live under be-tango.be
  // and send visitors back to the site.
  function isOwnHost(host) {
    return host === 'localhost' ||
           host === '127.0.0.1' ||
           host === 'be-tango.be' ||
           host.slice(-12) === '.be-tango.be';
  }

  function referrerHost() {
    var ref = document.referrer || '';
    if (!ref) return '';
    try {
      return new URL(ref).hostname.toLowerCase();
    } catch (e) {
      return '';
    }
  }

  // ==========================================================================
  // Storage — every access guarded. Safari private mode throws on write, and a
  // marketing nicety must never be the reason a registration form dies.
  // ==========================================================================

  function readStored() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Storage full, disabled, or private mode. Nothing to do — the forms
      // fall back to sending no attribution, which the backend accepts.
    }
  }

  // ==========================================================================
  // Capture
  // ==========================================================================

  function capture() {
    // First touch wins. Everything else in this function is skipped for the
    // rest of the session once anything has been recorded.
    if (readStored()) return;

    var params = new URLSearchParams(window.location.search);
    var data = {};

    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) data[key] = value;
    });

    var host = referrerHost();

    if (!data.utm_source) {
      // No UTM tags on the URL. Fall back to the click identifiers the ad
      // platforms append themselves, then to the referrer.
      //
      // Honest limitation: fbclid alone cannot tell a paid ad click apart from
      // a click on an organic Facebook post — both carry it. It is recorded as
      // social rather than invented as paid. Once the UTM tags are live on the
      // Meta creatives the branch above wins anyway and this never runs for ad
      // traffic. The rule stays as a permanent safety net, because clicks from
      // the Facebook and Instagram in-app browsers routinely arrive with an
      // empty referrer and would otherwise be misfiled as "direct".
      if (params.get('fbclid')) {
        data.utm_source = 'facebook';
        data.utm_medium = 'social';
      } else if (params.get('gclid')) {
        data.utm_source = 'google';
        data.utm_medium = 'cpc';
      } else if (!host) {
        data.utm_source = 'direct';
        data.utm_medium = 'none';
      } else if (isOwnHost(host)) {
        // Internal navigation. Store nothing at all, so a later visit that
        // does carry a real source can still be the first touch.
        return;
      } else if (matchesAny(host, SEARCH_HOSTS)) {
        data.utm_source = host;
        data.utm_medium = 'organic';
      } else if (matchesAny(host, SOCIAL_HOSTS)) {
        data.utm_source = host;
        data.utm_medium = 'social';
      } else {
        data.utm_source = host;
        data.utm_medium = 'referral';
      }
    }

    // Hostname only, never the full referring URL — the path of the page
    // somebody came from is none of our business and can carry their query.
    data.referrer_host = host || null;
    data.landing_path = window.location.pathname || null;

    var record = normalise(data);
    if (record) writeStored(record);
  }

  // ==========================================================================
  // Output
  // ==========================================================================

  // Always the same seven keys, always strings or null, always within the
  // column limits.
  function normalise(source) {
    var out = {};
    var hasValue = false;
    KEYS.forEach(function (key) {
      var value = source ? source[key] : null;
      if (typeof value === 'string' && value !== '') {
        out[key] = truncate(value, MAX_LENGTHS[key]);
        hasValue = true;
      } else {
        out[key] = null;
      }
    });
    return hasValue ? out : null;
  }

  // Returns null when nothing was captured. Never guesses.
  function get() {
    return normalise(readStored());
  }

  try {
    capture();
  } catch (e) {
    // Unsupported URL/URLSearchParams, exotic sandbox — degrade to no
    // attribution rather than throwing on every page of the site.
  }

  window.BETangoAttribution = { get: get };
})();
