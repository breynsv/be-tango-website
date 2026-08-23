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

  // Mail clients, matched exactly rather than by domain label. Three of these
  // sit under a search engine's own domain (mail.google.com, mail.yahoo.com,
  // and the Gmail app's package name, which literally contains ".google."), so
  // a label match would file a click from somebody's inbox as an organic
  // search. Two live registrations were recorded that way.
  //
  // com.google.android.gm and com.microsoft.office.outlook are the Android
  // package names the Gmail and Outlook apps send in place of a hostname.
  //
  // This list only ever sees UNTAGGED email — free-trial confirmations,
  // payment reminders. Campaign links carry utm_source/utm_medium themselves
  // and never reach any referrer branch.
  //
  // Apple Mail is deliberately absent: it opens links with no referrer at all,
  // so those visits land in the "direct" branch below. No identifier could be
  // verified, so none is invented here.
  var EMAIL_HOSTS = [
    'com.google.android.gm',
    'mail.google.com',
    'outlook.live.com',
    'outlook.office.com',
    'outlook.office365.com',
    'com.microsoft.office.outlook',
    'mail.yahoo.com'
  ];

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

  // Reverse-DNS application identifiers — com.google.android.gm,
  // com.microsoft.office.outlook, com.facebook.katana — are what mobile apps
  // put in the referrer instead of a hostname. Their middle labels are real
  // domain labels, which is why hostMatches() is right to see ".google." in
  // the Gmail app's id and why tightening hostMatches() is the wrong fix: it
  // would take www.google.co.uk down with it.
  //
  // Catches: any host of three or more labels whose first label is com, org
  // or net. No legitimate referring hostname begins with a bare "com." label,
  // and every real search host we match on (google.com, www.google.co.uk,
  // duckduckgo.com) begins with something else, so the organic branch is
  // unaffected.
  //
  // Does not catch: identifiers rooted elsewhere (de.*, ch.*, io.*) or in-app
  // identifiers that are not reverse-DNS at all. Those still fall through to
  // the normal rules. The enumerated EMAIL_HOSTS list is what actually
  // protects the known mail apps; this is the net underneath it, and its only
  // job is to keep an unrecognised app id out of "organic".
  //
  // Accepted cost: com.google.android.googlequicksearchbox, which genuinely is
  // a Google search, is filed as a referral rather than organic. Understating
  // one app beats inflating organic with every mail and messaging app.
  function isAppIdentifier(host) {
    var labels = host.split('.');
    if (labels.length < 3) return false;
    return labels[0] === 'com' || labels[0] === 'org' || labels[0] === 'net';
  }

  // Our own hosts. Internal navigation must never *overwrite* attribution —
  // otherwise every click from the homepage to the form would rewrite a
  // Facebook ad visit into a "be-tango.be referral". Subdomains are included
  // too: the CRM and the hosted checkout both live under be-tango.be and send
  // visitors back to the site.
  //
  // It may, however, seed a first touch. See the branch in capture().
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

  // Last-resort holding pen for when sessionStorage cannot be written to.
  // It does not survive a navigation, so a visitor who browses on before
  // signing up is still lost — but the common path from an ad, landing on
  // the free-trial page and submitting the form right there, is not. Better
  // than the null attribution every one of these visitors used to send.
  var memoryStore = null;

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
      // Storage full, disabled, or private mode. Fall back to memory for the
      // life of this page so the forms still have something to send.
      memoryStore = data;
    }
  }

  // ==========================================================================
  // Capture
  // ==========================================================================

  function capture() {
    // First touch wins. Everything else in this function is skipped for the
    // rest of the session once anything has been recorded, wherever it was
    // recorded.
    if (readStored() || memoryStore) return;

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
        // A referrer from one of our own hosts on a *first* touch — the CRM,
        // the hosted checkout, or a page whose session storage was cleared
        // mid-visit. It says nothing about where the visitor originally came
        // from, and "direct" is the honest bucket for unknown origin.
        //
        // Storing nothing here is what produced registrations with entirely
        // null attribution: get() would keep returning null for the rest of
        // the session, since capture() only ever runs on a fresh page load.
        // The "never overwrite" half of the own-host rule still holds — the
        // first-touch guard at the top of this function already returned if
        // anything was recorded, so there is nothing to protect here.
        //
        // The host itself is dropped below rather than recorded: writing
        // crm.be-tango.be into referrer_host would surface in reports as a
        // referral that never happened.
        data.utm_source = 'direct';
        data.utm_medium = 'none';
        host = null;
      } else if (EMAIL_HOSTS.indexOf(host) !== -1) {
        // Untagged email: a free-trial confirmation or payment reminder
        // opened from an inbox. This has to sit above the search test —
        // mail.google.com and com.google.android.gm both match the "google"
        // token and were being reported as organic search.
        data.utm_source = host;
        data.utm_medium = 'email';
      } else if (matchesAny(host, SEARCH_HOSTS) && !isAppIdentifier(host)) {
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
  //
  // Precedence is deliberate: a stored record is the real first touch and
  // always wins, so an in-memory value picked up on a later page can never
  // overwrite it.
  function get() {
    return normalise(readStored() || memoryStore);
  }

  try {
    capture();
  } catch (e) {
    // Unsupported URL/URLSearchParams, exotic sandbox — degrade to no
    // attribution rather than throwing on every page of the site.
  }

  window.BETangoAttribution = { get: get };
})();
