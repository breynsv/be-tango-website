/**
 * BE-TANGO beginner promo — steer "free trial" traffic to the beginners weekend
 * while there is no free trial to book.
 *
 * Loaded on the three homepages and the three free-trial pages. The shipped HTML
 * is the free-trial version and stays that way unless ALL of these hold:
 *   - GET /free-trials/available and GET /classes/beginner both answer success,
 *   - the free-trial list is empty,
 *   - an upcoming beginners weekend exists (type Workshop, end date today or
 *     later, earliest first — the same rule as upcomingWeekends() in
 *     schedule-loader.js).
 * Any other outcome — trials published, no weekend, an API error, a slow API
 * (TIMEOUT_MS) — leaves the page exactly as shipped. That is what makes the
 * switch back automatic: the day the CRM has free-trial dates again, the
 * first condition fails and nothing is upgraded.
 *
 * Homepage: hero primary button and the header's gold nav button point at the
 * weekend, and a one-line note under the hero buttons links to the free-trial
 * page. Free-trial page: a card between the hero and the booking section.
 *
 * Where the answers come from: first the same-origin edge endpoint
 * /api/beginner-promo (functions/api/beginner-promo.js — both CRM answers,
 * cached at Cloudflare for 5 minutes, so it answers in tens of ms instead of
 * ~0.8s). If that fails for any reason (404 on a plain static server, 5xx,
 * bad JSON, network error), the two CRM endpoints are called directly, as
 * before. One 4s budget (TIMEOUT_MS) covers both attempts; the request starts
 * the moment this script runs.
 *
 * When it has decided, <html data-beginner-promo="weekend|default"> records the
 * outcome (the e2e spec waits on it).
 */
(function () {
  'use strict';

  var API_BASE = (window.API_CONFIG && window.API_CONFIG.baseURL)
    ? window.API_CONFIG.baseURL
    : 'https://betango.membrero.com/api/v1';
  var TIMEOUT_MS = 4000;

  var lang = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
  if (['en', 'fr', 'nl'].indexOf(lang) === -1) lang = 'en';

  var S = {
    en: {
      weekendUrl: '/en/tango-classes/beginners/#intensive-bootcamp',
      trialUrl: '/en/tango-classes/free-trial/',
      heroBtn: 'Beginners weekend',
      heroNoteBefore: 'No free trial scheduled right now — ',
      heroNoteLink: 'get notified of the next dates',
      navBtn: 'Beginners weekend',
      eyebrow: 'No free trial right now',
      title: 'Start with our beginners weekend instead',
      hours: '2 × 2 hours',
      perPerson: 'per person',
      cta: 'Sign up for the weekend',
      belowBefore: 'or ',
      belowLink: 'leave your details',
      belowAfter: ' for the next free trials ↓',
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      decimal: '.'
    },
    fr: {
      weekendUrl: '/fr/cours-de-tango/debutants/#intensive-bootcamp',
      trialUrl: '/fr/cours-de-tango/essai-gratuit/',
      heroBtn: 'Week-end débutants',
      heroNoteBefore: 'Pas d’essai gratuit prévu pour le moment — ',
      heroNoteLink: 'soyez prévenu des prochaines dates',
      navBtn: 'Week-end débutants',
      eyebrow: 'Pas d’essai gratuit en ce moment',
      title: 'Commencez plutôt avec notre week-end débutants',
      hours: '2 × 2 heures',
      perPerson: 'par personne',
      cta: 'Je m’inscris au week-end',
      belowBefore: 'ou ',
      belowLink: 'laissez vos coordonnées',
      belowAfter: ' pour les prochains essais gratuits ↓',
      monthsShort: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'],
      months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
      days: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      decimal: ','
    },
    nl: {
      weekendUrl: '/nl/tangolessen/beginners/#weekend-intensief',
      trialUrl: '/nl/tangolessen/gratis-proefles/',
      heroBtn: 'Beginnersweekend',
      heroNoteBefore: 'Momenteel geen gratis proefles gepland — ',
      heroNoteLink: 'laat je verwittigen bij nieuwe data',
      navBtn: 'Beginnersweekend',
      eyebrow: 'Nu geen gratis proefles',
      title: 'Begin dan met ons beginnersweekend',
      hours: '2 × 2 uur',
      perPerson: 'per persoon',
      cta: 'Schrijf je in voor het weekend',
      belowBefore: 'of ',
      belowLink: 'laat je gegevens achter',
      belowAfter: ' voor de volgende gratis proeflessen ↓',
      monthsShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
      months: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
      days: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
      decimal: ','
    }
  };
  var t = S[lang];

  function done(state) {
    document.documentElement.setAttribute('data-beginner-promo', state);
  }

  var EDGE_URL = '/api/beginner-promo';
  var deadline = Date.now() + TIMEOUT_MS;

  // GET a JSON body, giving up at the shared deadline.
  function getJson(url) {
    var left = deadline - Date.now();
    if (left <= 0) return Promise.reject(new Error('timeout'));
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, left);
    var timeout = new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error('timeout')); }, left);
    });
    var req = fetch(url, {
      headers: { Accept: 'application/json' },
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
    return Promise.race([req, timeout]).then(function (d) { clearTimeout(timer); return d; },
      function (e) { clearTimeout(timer); throw e; });
  }

  function getData(path) {
    return getJson(API_BASE + path).then(function (body) {
      if (!body || body.success !== true || !Array.isArray(body.data)) throw new Error('bad payload');
      return body.data;
    });
  }

  // -> { trials: <number of free trials>, classes: <beginner classes> }
  function fromEdge() {
    return getJson(EDGE_URL).then(function (body) {
      if (!body || body.success !== true || typeof body.free_trials !== 'number' ||
          !Array.isArray(body.workshops)) throw new Error('bad payload');
      return { trials: body.free_trials, classes: body.workshops };
    });
  }

  function fromCrm() {
    return Promise.all([getData('/free-trials/available'), getData('/classes/beginner')])
      .then(function (r) { return { trials: r[0].length, classes: r[1] }; });
  }

  function load() {
    return fromEdge().catch(fromCrm);
  }

  function todayYmd() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  var YMD = /^\d{4}-\d{2}-\d{2}$/;

  // Same rule as upcomingWeekends() in schedule-loader.js.
  function nextWeekend(classes) {
    var today = todayYmd();
    var list = classes.filter(function (c) {
      return c && c.type === 'Workshop' && YMD.test(c.start_date || '') &&
        (!c.end_date || YMD.test(c.end_date)) && (c.end_date || c.start_date) >= today;
    }).sort(function (a, b) { return a.start_date.localeCompare(b.start_date); });
    return list[0] || null;
  }

  function parts(ymd) {
    var p = ymd.split('-').map(Number);
    return { y: p[0], m: p[1], d: p[2], wd: new Date(p[0], p[1] - 1, p[2]).getDay() };
  }

  // "14–15 nov" / "31 oct – 1 nov" / "14 nov" (the button upper-cases it).
  function shortRange(w) {
    var a = parts(w.start_date);
    var b = parts(w.end_date || w.start_date);
    var ms = t.monthsShort;
    if (w.start_date === (w.end_date || w.start_date)) return a.d + ' ' + ms[a.m - 1];
    if (a.y === b.y && a.m === b.m) return a.d + '–' + b.d + ' ' + ms[a.m - 1];
    return a.d + ' ' + ms[a.m - 1] + ' – ' + b.d + ' ' + ms[b.m - 1];
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // "Sam. 14 & dim. 15 novembre" / "Sat 14 & Sun 15 November".
  function longRange(w) {
    var a = parts(w.start_date);
    var b = parts(w.end_date || w.start_date);
    var m = t.months;
    var first = t.days[a.wd] + ' ' + a.d;
    if (w.start_date === (w.end_date || w.start_date)) return cap(first + ' ' + m[a.m - 1]);
    var joiner = (b.wd - a.wd + 7) % 7 === 1 ? ' & ' : ' – ';
    var second = t.days[b.wd] + ' ' + b.d + ' ' + m[b.m - 1];
    if (a.m !== b.m || a.y !== b.y) first += ' ' + m[a.m - 1];
    return cap(first + joiner + second);
  }

  // "95.00" -> "€95", "95.50" -> "€95,50" (FR/NL) / "€95.50" (EN).
  function price(w) {
    var n = parseFloat(w.price);
    if (!isFinite(n) || n <= 0) return '';
    var s = Math.round(n * 100) % 100 === 0 ? String(Math.round(n)) : n.toFixed(2).replace('.', t.decimal);
    return '€' + s + ' ' + t.perPerson;
  }

  function city(w) {
    var loc = w.location;
    if (!loc) return '';
    var c = loc.city;
    if (c && typeof c === 'object') c = c[lang] || c.en || '';
    return String(c || loc.name || '');
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function link(href, text, cls) {
    var a = el('a', cls || null, text);
    a.href = href;
    return a;
  }

  function upgradeHomepage(w) {
    var cta = document.querySelector('.hero-cta');
    var primary = cta && cta.querySelector('.btn-primary');
    if (!primary) return false;
    primary.textContent = t.heroBtn + ' · ' + shortRange(w);
    primary.href = t.weekendUrl;

    var note = el('p', 'hero-promo-note', t.heroNoteBefore);
    note.appendChild(link(t.trialUrl, t.heroNoteLink));
    cta.parentNode.insertBefore(note, cta.nextSibling);

    // The header is inline on every homepage (one nav, re-used as the mobile menu).
    var nav = document.querySelector('.site-header a.btn-nav');
    if (nav) {
      nav.textContent = t.navBtn;
      nav.href = t.weekendUrl;
    }
    return true;
  }

  function pill(iconCls, text) {
    var p = el('span', 'weekend-promo__pill');
    if (iconCls) {
      var i = el('i', iconCls);
      i.setAttribute('aria-hidden', 'true');
      p.appendChild(i);
      p.appendChild(document.createTextNode(' '));
    }
    p.appendChild(document.createTextNode(text));
    return p;
  }

  function upgradeTrialPage(w) {
    var hero = document.querySelector('.ft-hero');
    if (!hero || document.querySelector('.weekend-promo')) return false;

    var section = el('section', 'weekend-promo');
    section.setAttribute('aria-labelledby', 'weekend-promo-title');
    var card = el('div', 'weekend-promo__card');
    var text = el('div', 'weekend-promo__text');
    text.appendChild(el('p', 'weekend-promo__eyebrow', t.eyebrow));
    var h2 = el('h2', 'weekend-promo__title', t.title);
    h2.id = 'weekend-promo-title';
    text.appendChild(h2);

    var pills = el('div', 'weekend-promo__pills');
    pills.appendChild(pill('fas fa-calendar-alt', longRange(w)));
    pills.appendChild(pill('fas fa-clock', t.hours));
    var p = price(w);
    if (p) pills.appendChild(pill(null, p));
    var c = city(w);
    if (c) pills.appendChild(pill('fas fa-map-marker-alt', c));
    text.appendChild(pills);

    var action = el('div', 'weekend-promo__action');
    action.appendChild(link(t.weekendUrl, t.cta, 'btn btn-primary weekend-promo__btn'));
    var below = el('p', 'weekend-promo__below', t.belowBefore);
    below.appendChild(link(document.getElementById('book-now-form') ? '#book-now-form' : '#book-now', t.belowLink));
    below.appendChild(document.createTextNode(t.belowAfter));
    action.appendChild(below);

    card.appendChild(text);
    card.appendChild(action);
    section.appendChild(card);
    hero.parentNode.insertBefore(section, hero.nextSibling);
    return true;
  }

  // Start the request now — the script is deferred, so this is as early as it
  // runs; the DOM work below waits for nothing else.
  var data = (typeof fetch === 'function' && typeof Promise === 'function') ? load() : null;
  if (data) data.catch(function () {}); // handled in run(); avoid an unhandled rejection meanwhile

  function run() {
    if (!document.querySelector('.hero-cta') && !document.querySelector('.ft-hero')) return;
    if (!data) { done('default'); return; }

    data.then(function (r) {
      var weekend = r.trials === 0 ? nextWeekend(r.classes) : null;
      if (!weekend) { done('default'); return; }
      var changed = upgradeHomepage(weekend) || upgradeTrialPage(weekend);
      done(changed ? 'weekend' : 'default');
    })
      .catch(function () { done('default'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
