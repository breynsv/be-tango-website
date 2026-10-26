/**
 * BE-TANGO homepage — "Where do you fit in?" schedule boxes.
 *
 * Every day, time and city on the six journey cards comes from Membrero's public
 * class list (GET {API_BASE}/classes). Nothing is typed into the page: change a
 * class in the CRM and the homepage follows.
 *
 * Markup contract (per card):
 *   <div class="journey-slots is-loading" data-journey="beginners|first|second|advanced|workshops|private">…skeleton…</div>
 *   <p class="journey-note" data-journey-note="beginners" hidden></p>   (beginners card only)
 *
 * On API failure or timeout the boxes and the note are removed; the card and its
 * link still work. Every API string goes in through textContent, never innerHTML.
 */
(function () {
  'use strict';

  var API_BASE = (window.API_CONFIG && window.API_CONFIG.baseURL)
    ? window.API_CONFIG.baseURL
    : 'https://betango.membrero.com/api/v1';
  var TIMEOUT_MS = 8000;

  var boxes = document.querySelectorAll('[data-journey]');
  if (!boxes.length) return;

  var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();

  var T = {
    en: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      locale: 'en-GB',
      byAppointment: 'By appointment',
      or: 'or',
      full: 'Full',
      none: 'New dates coming soon',
      nextCycle: function (d) { return 'Next cycle starts ' + d + '.'; },
      cantWait: function (d) { return 'Can’t wait? Beginners weekend ' + d + '.'; }
    },
    fr: {
      days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      locale: 'fr-BE',
      byAppointment: 'Sur rendez-vous',
      or: 'ou',
      full: 'Complet',
      none: 'Nouvelles dates bientôt',
      nextCycle: function (d) { return 'Prochain cycle à partir du ' + d + '.'; },
      cantWait: function (d) { return 'Trop impatient ? Week-end débutants les ' + d + '.'; }
    },
    nl: {
      days: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
      locale: 'nl-BE',
      byAppointment: 'Op afspraak',
      or: 'of',
      full: 'Volzet',
      none: 'Binnenkort nieuwe data',
      nextCycle: function (d) { return 'Volgende reeks start op ' + d + '.'; },
      cantWait: function (d) { return 'Kan je niet wachten? Beginnersweekend op ' + d + '.'; }
    }
  };
  var t = T[lang] || T.en;
  if (!T[lang]) lang = 'en';

  var DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  var JOURNEY = {
    beginners: function (c) { return c.type === 'Weekly_Course' && c.level_code === '0'; },
    first:     function (c) { return c.type === 'Weekly_Course' && c.level_code === '1'; },
    second:    function (c) { return c.type === 'Weekly_Course' && (c.level_code === '2' || c.level_code === '21'); },
    advanced:  function (c) { return c.type === 'Weekly_Course' && (c.level_code === '3' || c.level_code === '4'); }
  };

  // The school's calendar runs on Brussels time, not the visitor's or UTC.
  function brusselsToday() {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }
  var today = brusselsToday();

  function loc(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.en || '';
  }

  // "Woluwe-Saint-Pierre" / "Sint-Pieters-Woluwe" read as "Woluwe" to every
  // student. When the localised name is hyphenated, take the English name's
  // first part, so NL does not end up with "Sint".
  function cityOf(c) {
    var city = c.location && c.location.city;
    var name = loc(city);
    if (name.indexOf('-') === -1) return name;
    var en = (city && typeof city === 'object' && city.en) || name;
    return en.split('-')[0];
  }

  function hhmm(s) { return String(s || '').slice(0, 5); }

  // fr-BE abbreviates months with a dot ("nov."); a sentence ending on one must not get a second.
  function sentence(s) { return s.replace(/\.\.$/, '.'); }

  function fmtDate(iso, opts) {
    return new Date(iso + 'T12:00:00').toLocaleDateString(t.locale, opts);
  }

  // "14–15 Nov", "31 Oct – 1 Nov", or "Sat 14 Nov" for a single day.
  function dateRange(first, last) {
    if (!last || first === last) return fmtDate(first, { weekday: 'short', day: 'numeric', month: 'short' });
    if (first.slice(0, 7) === last.slice(0, 7)) {
      return fmtDate(first, { day: 'numeric' }) + '–' + fmtDate(last, { day: 'numeric', month: 'short' });
    }
    return fmtDate(first, { day: 'numeric', month: 'short' }) + ' – ' + fmtDate(last, { day: 'numeric', month: 'short' });
  }

  function workshopDates(w) {
    var d = (w.lesson_dates && w.lesson_dates.length) ? w.lesson_dates : [w.start_date, w.end_date];
    return dateRange(d[0], d[d.length - 1]);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function slot(when, where, tags) {
    var row = el('div', 'journey-slot');
    var w = el('span', 'journey-slot-when', when);
    (tags || []).forEach(function (tag) {
      if (tag) w.appendChild(el('span', 'journey-slot-tag', tag));
    });
    row.appendChild(w);
    row.appendChild(el('span', 'journey-slot-where', where || ''));
    return row;
  }

  function byWeekday(a, b) {
    return (DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)) ||
      hhmm(a.start_time).localeCompare(hhmm(b.start_time));
  }

  function byStart(a, b) {
    return String(a.start_date).localeCompare(String(b.start_date)) ||
      hhmm(a.start_time).localeCompare(hhmm(b.start_time));
  }

  function finish(box) {
    box.classList.remove('is-loading');
    box.removeAttribute('aria-busy');
    if (!box.children.length) box.appendChild(slot(t.none, ''));
  }

  function weeklyRows(box, list, key) {
    var levels = {};
    list.forEach(function (c) { levels[c.level_code] = true; });
    var mixed = Object.keys(levels).length > 1;

    // Second Year: the "Second Year" prefix is the card's own title, so only
    // the remainder ("PLUS") earns a tag; plain second-year rows get none.
    var prefix = '';
    if (key === 'second') {
      var base = list.filter(function (c) { return c.level_code === '2'; })[0];
      prefix = base ? loc(base.level_name) : '';
    }

    list.slice().sort(byWeekday).forEach(function (c) {
      var tag = '';
      if (mixed) {
        tag = loc(c.level_name);
        if (prefix && tag.indexOf(prefix) === 0) tag = tag.slice(prefix.length).trim();
      }
      var day = t.days[DAY_ORDER.indexOf(c.day_of_week)] || '';
      box.appendChild(slot(
        (day ? day + ' ' : '') + hhmm(c.start_time) + '–' + hhmm(c.end_time),
        cityOf(c),
        [tag, c.is_full ? t.full : '']
      ));
    });
  }

  function render(classes) {
    var visible = classes.filter(function (c) {
      return c && c.is_active && c.is_visible && c.end_date && c.end_date >= today;
    });
    // A workshop leaves both the Workshops card and the beginners note on its
    // first day: same cut-off in both places.
    var upcomingWorkshops = visible.filter(function (c) {
      return c.type === 'Workshop' && c.start_date > today;
    }).sort(byStart);

    Array.prototype.forEach.call(boxes, function (box) {
      var key = box.getAttribute('data-journey');
      box.replaceChildren();

      if (JOURNEY[key]) {
        weeklyRows(box, visible.filter(JOURNEY[key]), key);
      } else if (key === 'workshops') {
        upcomingWorkshops.slice(0, 2).forEach(function (w) {
          var row = slot(workshopDates(w) + ' · ' + hhmm(w.start_time), cityOf(w));
          var name = String(w.name || '').replace(/\s+\d.*$/, '').trim();
          if (name) row.appendChild(el('span', 'journey-slot-name', name));
          box.appendChild(row);
        });
      } else if (key === 'private') {
        var seen = {};
        var cities = [];
        visible.forEach(function (c) {
          var city = cityOf(c);
          if (city && !seen[city]) { seen[city] = true; cities.push(city); }
        });
        cities.sort(function (a, b) { return a.localeCompare(b, t.locale); });
        var where = cities.length > 1
          ? cities.slice(0, -1).join(', ') + ' ' + t.or + ' ' + cities[cities.length - 1]
          : (cities[0] || '');
        box.appendChild(slot(t.byAppointment, where));
      }
      finish(box);
    });

    var note = document.querySelector('[data-journey-note="beginners"]');
    if (note) {
      note.replaceChildren();
      var nextStart = visible.filter(JOURNEY.beginners)
        .map(function (c) { return c.start_date; })
        .filter(function (d) { return d && d > today; })
        .sort()[0];
      var weekend = upcomingWorkshops.filter(function (c) { return c.level_code === '0'; })[0];
      if (nextStart) {
        note.appendChild(el('strong', '', sentence(t.nextCycle(fmtDate(nextStart, { day: 'numeric', month: 'long' })))));
      }
      if (weekend) {
        if (nextStart) note.appendChild(document.createTextNode(' '));
        note.appendChild(document.createTextNode(sentence(t.cantWait(workshopDates(weekend)))));
      }
      note.hidden = !(nextStart || weekend);
    }
  }

  // No data, no box: never leave a skeleton on screen. The card link still works.
  function fail() {
    Array.prototype.forEach.call(boxes, function (box) { box.remove(); });
    var note = document.querySelector('[data-journey-note="beginners"]');
    if (note) note.remove();
  }

  var controller = typeof AbortController === 'function' ? new AbortController() : null;
  var done = false;
  var timer = setTimeout(function () {
    if (done) return;
    done = true;
    if (controller) controller.abort();
    fail();
  }, TIMEOUT_MS);

  fetch(API_BASE + '/classes', controller ? { signal: controller.signal } : undefined)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (json) {
      if (done) return;
      if (!json || !json.success || !Array.isArray(json.data)) throw new Error('Bad payload');
      clearTimeout(timer);
      done = true;
      render(json.data);
    })
    .catch(function () {
      if (done) return;
      clearTimeout(timer);
      done = true;
      fail();
    });
})();
