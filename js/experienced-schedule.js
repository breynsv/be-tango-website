/**
 * BE-TANGO Experienced Schedule Loader
 *
 * Dynamically loads experienced class data from the CRM API and renders
 * the bts-* layout with working sign-up buttons and dynamic filters.
 * Supports EN, FR, NL based on <html lang>.
 */
(function () {
  'use strict';

  var TRANSLATIONS = {
    en: {
      loading: 'Loading schedule...',
      error: 'Unable to load schedule. Please try again.',
      allLocations: 'All locations',
      allLevels: 'All levels',
      locationLabel: 'Location',
      levelLabel: 'Level',
      signUp: 'Sign Up',
      starts: 'Starts',
      sessions: 'sessions',
      showingOf: function (v, total) { return 'Showing <strong>' + v + '</strong> of ' + total + ' classes'; },
      noMatch: 'No classes match your filters',
      noMatchSub: 'Try adjusting your location or level selection.',
      resetFilters: 'Reset filters',
      viewCalendar: 'Calendar',
      lesson: 'Tango lesson',
      practicaLabel: 'Practice evening',
      downloadPdf: 'Print',
      addToCalendar: 'Add to Calendar (.ics)',
      closeCalendar: 'Close',
      calMonthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      calWeekDays: ['Mo','Tu','We','Th','Fr','Sa','Su'],
      cities: { 'Brussels': 'Brussels', 'Woluwe': 'Woluwe' },
      levels: {
        '1':  'First Year',
        '2':  'Second Year',
        '21': 'Second Year PLUS',
        '3':  'Intermediate',
        '4':  'Advanced'
      }
    },
    fr: {
      loading: 'Chargement des horaires...',
      error: 'Impossible de charger les horaires. Veuillez réessayer.',
      allLocations: 'Tous les lieux',
      allLevels: 'Tous les niveaux',
      locationLabel: 'Lieu',
      levelLabel: 'Niveau',
      signUp: "S'inscrire",
      starts: 'Début le',
      sessions: 'séances',
      showingOf: function (v, total) { return '<strong>' + v + '</strong> cours sur ' + total; },
      noMatch: 'Aucun cours ne correspond',
      noMatchSub: "Essayez d'ajuster votre sélection de lieu ou de niveau.",
      resetFilters: 'Réinitialiser',
      viewCalendar: 'Calendrier',
      lesson: 'Cours de tango',
      practicaLabel: 'Soirée pratique',
      downloadPdf: 'Imprimer',
      addToCalendar: 'Ajouter au calendrier (.ics)',
      closeCalendar: 'Fermer',
      calMonthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
      calWeekDays: ['Lu','Ma','Me','Je','Ve','Sa','Di'],
      cities: { 'Brussels': 'Bruxelles', 'Woluwe': 'Woluwe' },
      levels: {
        '1':  'Première Année',
        '2':  'Deuxième Année',
        '21': 'Deuxième Année PLUS',
        '3':  'Intermédiaire',
        '4':  'Avancé'
      }
    },
    nl: {
      loading: 'Rooster laden...',
      error: 'Kan het rooster niet laden. Probeer opnieuw.',
      allLocations: 'Alle locaties',
      allLevels: 'Alle niveaus',
      locationLabel: 'Locatie',
      levelLabel: 'Niveau',
      signUp: 'Inschrijven',
      starts: 'Start op',
      sessions: 'sessies',
      showingOf: function (v, total) { return '<strong>' + v + '</strong> van ' + total + ' lessen'; },
      noMatch: 'Geen lessen gevonden',
      noMatchSub: 'Pas uw locatie of niveau selectie aan.',
      resetFilters: 'Filters wissen',
      viewCalendar: 'Kalender',
      lesson: 'Tangoles',
      practicaLabel: 'Practica-avond',
      downloadPdf: 'Afdrukken',
      addToCalendar: 'Toevoegen aan kalender (.ics)',
      closeCalendar: 'Sluiten',
      calMonthNames: ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'],
      calWeekDays: ['Ma','Di','Wo','Do','Vr','Za','Zo'],
      cities: { 'Brussels': 'Brussel', 'Woluwe': 'Woluwe' },
      levels: {
        '1':  'Eerste Jaar',
        '2':  'Tweede Jaar',
        '21': 'Tweede Jaar PLUS',
        '3':  'Gevorderd',
        '4':  'Gevorderd+'
      }
    }
  };

  var LEVEL_ORDER = ['1', '2', '21', '3', '4'];
  var BADGE_CLASSES = { '1': 'fy', '2': 'sy', '21': 'sp', '3': 'im', '4': 'im' };
  var LOCATION_COLORS = { 'Brussels': '#1C244B', 'Woluwe-Saint-Pierre': '#6366F1' };
  var DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function locStr(field, lang) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field['en'] || Object.values(field)[0] || '';
  }

  function getLang() {
    var l = (document.documentElement.lang || 'en').toLowerCase();
    if (l.startsWith('fr')) return 'fr';
    if (l.startsWith('nl')) return 'nl';
    return 'en';
  }

  function formatDate(dateStr, lang) {
    if (!dateStr) return '';
    try {
      var d = new Date(dateStr + 'T00:00:00');
      var locale = lang === 'fr' ? 'fr-BE' : lang === 'nl' ? 'nl-BE' : 'en-GB';
      return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  function cityKey(city) {
    return city.toLowerCase().replace(/[^a-z]/g, '');
  }

  function init() {
    var listEl      = document.getElementById('btsList');
    var locFilters  = document.getElementById('btsLocFilters');
    var lvlFilters  = document.getElementById('btsLvlFilters');
    var countEl     = document.getElementById('btsCount');
    var emptyEl     = document.getElementById('btsEmpty');
    var resetBtn    = document.getElementById('btsResetBtn');

    if (!listEl) return;

    var lang = getLang();
    var t    = TRANSLATIONS[lang] || TRANSLATIONS.en;

    listEl.innerHTML = '<div style="text-align:center;padding:40px 24px;color:#4a4a4a;">' + t.loading + '</div>';

    var baseURL = 'http://127.0.0.1:8001/api/v1';
    if (window.API_CONFIG && window.API_CONFIG.baseURL) {
      baseURL = window.API_CONFIG.baseURL;
    } else if (window.BETangoCRM && window.BETangoCRM.api && window.BETangoCRM.api.baseURL) {
      baseURL = window.BETangoCRM.api.baseURL;
    }

    fetch(baseURL + '/classes/experienced', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid response');
        render(json.data, listEl, locFilters, lvlFilters, countEl, emptyEl, resetBtn, t, lang);
      })
      .catch(function () {
        listEl.innerHTML = '<div style="text-align:center;padding:40px 24px;color:#e74c3c;">' + t.error + '</div>';
      });
  }

  function render(classes, listEl, locFilters, lvlFilters, countEl, emptyEl, resetBtn, t, lang) {
    // ── Collect unique locations and levels ──────────────────────────────────
    var locationMap     = {}; // cityEn → true
    var locationDisplay = {}; // cityEn → localized display name
    var levelMap        = {}; // code → translated name

    classes.forEach(function (cls) {
      var cityEn  = (cls.location && locStr(cls.location.city, 'en')) || (cls.location && cls.location.name) || '';
      var cityLoc = (cls.location && locStr(cls.location.city, lang)) || cityEn;
      if (cityEn) {
        locationMap[cityEn]     = true;
        locationDisplay[cityEn] = cityLoc;
      }
      var code = String(cls.level_code);
      if (code && parseInt(code, 10) > 0) {
        levelMap[code] = (cls.level_name && cls.level_name[lang]) || t.levels[code] || code;
      }
    });

    // Sort locations: Brussels first
    var locationList = Object.keys(locationMap).sort(function (a, b) {
      if (a === 'Brussels') return -1;
      if (b === 'Brussels') return 1;
      return a.localeCompare(b);
    });

    // Sort levels by LEVEL_ORDER
    var levelList = Object.keys(levelMap).sort(function (a, b) {
      var ia = LEVEL_ORDER.indexOf(a); var ib = LEVEL_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    // ── Build location filter buttons ────────────────────────────────────────
    if (locFilters) {
      locFilters.innerHTML = '';
      var allLocBtn = document.createElement('button');
      allLocBtn.className = 'bts-btn active';
      allLocBtn.dataset.loc = 'all';
      allLocBtn.textContent = t.allLocations;
      locFilters.appendChild(allLocBtn);

      locationList.forEach(function (cityEn) {
        var btn = document.createElement('button');
        btn.className = 'bts-btn';
        btn.dataset.loc = cityKey(cityEn);
        var color = LOCATION_COLORS[cityEn] || '#E2C033';
        var outline = LOCATION_COLORS[cityEn] ? '' : ';outline:1px solid #ccc';
        btn.innerHTML = '<span class="bts-loc-dot" style="background:' + color + outline + ';"></span>' + locationDisplay[cityEn];
        locFilters.appendChild(btn);
      });
    }

    // ── Build level filter buttons ───────────────────────────────────────────
    if (lvlFilters) {
      lvlFilters.innerHTML = '';
      var allLvlBtn = document.createElement('button');
      allLvlBtn.className = 'bts-btn active';
      allLvlBtn.dataset.level = 'all';
      allLvlBtn.textContent = t.allLevels;
      lvlFilters.appendChild(allLvlBtn);

      levelList.forEach(function (code) {
        var btn = document.createElement('button');
        btn.className = 'bts-btn';
        btn.dataset.level = code;
        btn.textContent = levelMap[code];
        lvlFilters.appendChild(btn);
      });
    }

    // ── Sort classes by day then start_time ──────────────────────────────────
    classes.sort(function (a, b) {
      var da = DAY_ORDER.indexOf(a.day_of_week);
      var db = DAY_ORDER.indexOf(b.day_of_week);
      if (da === -1) da = 99;
      if (db === -1) db = 99;
      if (da !== db) return da - db;
      return (a.start_time || '').localeCompare(b.start_time || '');
    });

    // ── Render rows ──────────────────────────────────────────────────────────
    listEl.innerHTML = '';
    var total = classes.length;

    classes.forEach(function (cls) {
      var code        = String(cls.level_code);
      var cityEn      = (cls.location && locStr(cls.location.city, 'en')) || (cls.location && cls.location.name) || '';
      var city        = (cls.location && locStr(cls.location.city, lang)) || (cls.location && cls.location.name) || '';
      var locKey      = cityKey(cityEn);
      var levelName   = (cls.level_name && cls.level_name[lang]) || t.levels[code] || code;
      var badgeCls    = BADGE_CLASSES[code] || 'fy';
      var stripeColor = LOCATION_COLORS[cityEn] || '#E2C033';
      var price       = cls.price ? parseFloat(cls.price).toFixed(0) : '';
      var startDate   = formatDate(cls.start_date, lang);
      var sessions    = (cls.lesson_count || 0) + ((cls.practica_dates && cls.practica_dates.length) || 0) || '';
      var address     = cls.location ? locStr(cls.location.full_address, lang) || locStr(cls.location.address, lang) || city : '';
      var day         = cls.day_of_week || '';
      var time        = (cls.start_time || '') + ' \u2013 ' + (cls.end_time || '');
      var friendlyName = levelName + ' \u00b7 ' + day;

      var row = document.createElement('div');
      row.className = 'bts-row fadein';
      row.dataset.loc   = locKey;
      row.dataset.level = code;

      row.innerHTML =
        '<div class="bts-main">' +
          '<div class="bts-stripe" style="background:' + stripeColor + ';"></div>' +
          '<div class="bts-sched">' +
            '<div class="bts-day">' + day + '</div>' +
            '<div class="bts-time">' + time + '</div>' +
            '<div class="bts-addr">' + address + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="bts-lvl"><span class="bts-badge ' + badgeCls + '">' + levelName + '</span></div>' +
        '<div class="bts-start">' +
          '<span class="bts-start-lbl">' + t.starts + '</span>' +
          '<span class="bts-start-val">' + startDate + '</span>' +
        '</div>' +
        '<div class="bts-price">' +
          '<div class="bts-price-main">&euro;' + price + '</div>' +
          '<span class="bts-price-sub">' + sessions + ' ' + t.sessions + '</span>' +
        '</div>' +
        '<div class="bts-cta"></div>';

      // Sign-up button — has btn-sign-up for enrollment-modal.js delegation
      var btn = document.createElement('button');
      btn.className = 'btn btn-sign-up bts-signup';
      btn.dataset.productId  = cls.id;
      btn.dataset.className  = friendlyName;
      btn.dataset.price      = price;
      btn.dataset.location   = city;
      btn.dataset.time       = cls.start_time ? (cls.end_time ? cls.start_time + '\u2013' + cls.end_time : cls.start_time) : '';
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="3" y="4" width="18" height="18" rx="2"/>' +
          '<line x1="16" y1="2" x2="16" y2="6"/>' +
          '<line x1="8" y1="2" x2="8" y2="6"/>' +
          '<line x1="3" y1="10" x2="21" y2="10"/>' +
        '</svg>' + t.signUp;

      row.querySelector('.bts-cta').appendChild(btn);

      // Calendar button — only if the API returned lesson/practica dates
      var hasCalendarDates = (cls.lesson_dates && cls.lesson_dates.length > 0) ||
                             (cls.practica_dates && cls.practica_dates.length > 0);
      if (hasCalendarDates) {
        (function (clsData) {
          var calBtn = document.createElement('button');
          calBtn.className = 'btn-cal-icon';
          calBtn.title = t.viewCalendar;
          calBtn.innerHTML = '<i class="fas fa-calendar-alt"></i>';
          calBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            openCalendarModal(clsData, t, lang);
          });
          row.querySelector('.bts-main').appendChild(calBtn);
        }(cls));
      }

      listEl.appendChild(row);
    });

    // ── Filter logic ─────────────────────────────────────────────────────────
    var curLoc   = 'all';
    var curLevel = 'all';

    function applyFilters() {
      var rows = listEl.querySelectorAll('.bts-row[data-loc]');
      var visible = 0;
      rows.forEach(function (r) {
        r.classList.remove('fadein');
        var show = (curLoc === 'all' || r.dataset.loc === curLoc) &&
                   (curLevel === 'all' || r.dataset.level === curLevel);
        if (show) {
          r.classList.remove('hidden');
          (function (idx) {
            setTimeout(function () { void r.offsetWidth; r.classList.add('fadein'); }, idx * 40);
          }(visible));
          visible++;
        } else {
          r.classList.add('hidden');
        }
      });
      if (countEl)  countEl.innerHTML = t.showingOf(visible, total);
      if (emptyEl)  emptyEl.classList.toggle('visible', visible === 0);
      if (resetBtn) resetBtn.classList.toggle('visible', curLoc !== 'all' || curLevel !== 'all');
    }

    if (locFilters) {
      locFilters.addEventListener('click', function (e) {
        var b = e.target.closest('[data-loc]');
        if (!b) return;
        locFilters.querySelectorAll('[data-loc]').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        curLoc = b.dataset.loc;
        applyFilters();
      });
    }

    if (lvlFilters) {
      lvlFilters.addEventListener('click', function (e) {
        var b = e.target.closest('[data-level]');
        if (!b) return;
        lvlFilters.querySelectorAll('[data-level]').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        curLevel = b.dataset.level;
        applyFilters();
      });
    }

    if (resetBtn) {
      resetBtn.onclick = function () {
        curLoc = 'all'; curLevel = 'all';
        if (locFilters) locFilters.querySelectorAll('[data-loc]').forEach(function (b) {
          b.classList.toggle('active', b.dataset.loc === 'all');
        });
        if (lvlFilters) lvlFilters.querySelectorAll('[data-level]').forEach(function (b) {
          b.classList.toggle('active', b.dataset.level === 'all');
        });
        applyFilters();
      };
    }

    applyFilters();
  }

  // ── Calendar modal functions ─────────────────────────────────────────────

  function openCalendarModal(classData, t, lang) {
    var existing = document.querySelector('.cal-overlay');
    if (existing) existing.remove();

    var levelCode   = String(classData.level_code || '');
    var levelLabel  = (classData.level_name && classData.level_name[lang]) || t.levels[levelCode] || '';
    var friendlyName = levelLabel + (classData.day_of_week ? ' \u00b7 ' + classData.day_of_week : '');
    var calendarHtml = buildCalendarHTML(classData, t, lang);

    var BADGE_STYLES = {
      '1':  'background:#DBEAFE;color:#1D4ED8;',
      '2':  'background:#E0E7FF;color:#4338CA;',
      '21': 'background:#EDE9FE;color:#7C3AED;',
      '3':  'background:#FEE2E2;color:#DC2626;',
      '4':  'background:#FEE2E2;color:#DC2626;'
    };
    var badgeStyle = BADGE_STYLES[levelCode] || 'background:#F3F4F6;color:#374151;';

    var svgCal  = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1.5" width="8" height="7.5" rx="1.2" stroke="#1C244B" stroke-width="1.2"/><path d="M1 4h8" stroke="#1C244B" stroke-width="1.2"/><path d="M3 1v1.5M7 1v1.5" stroke="#1C244B" stroke-width="1.2" stroke-linecap="round"/></svg>';
    var svgClock = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="3.8" stroke="#1C244B" stroke-width="1.2"/><path d="M5 2.8V5l1.5 1.5" stroke="#1C244B" stroke-width="1.2" stroke-linecap="round"/></svg>';
    var svgPin  = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1C3.34 1 2 2.34 2 4c0 2.25 3 5.5 3 5.5S8 6.25 8 4c0-1.66-1.34-3-3-3z" stroke="#1C244B" stroke-width="1.2"/><circle cx="5" cy="4" r="1" fill="#1C244B"/></svg>';

    var chipsHtml = '';
    if (classData.start_date) chipsHtml += '<span class="cal-chip">' + svgCal + ' ' + formatDate(classData.start_date, lang) + '</span>';
    if (classData.start_time) {
      var timeStr = classData.end_time ? classData.start_time + '\u2013' + classData.end_time : classData.start_time;
      chipsHtml += '<span class="cal-chip">' + svgClock + ' ' + timeStr + '</span>';
    }
    if (classData.location && classData.location.city) {
      chipsHtml += '<span class="cal-chip">' + svgPin + ' ' + locStr(classData.location.city, lang) + '</span>';
    }

    var allDates = [].concat(classData.lesson_dates || [], classData.practica_dates || []).sort();
    var years = allDates.length ? allDates.map(function (d) { return d.split('-')[0]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }) : [];
    var seasonLabel = years.length > 1 ? years[0] + '\u2013' + years[years.length - 1] : (years[0] || '');

    var levelBadge = levelLabel ? '<span class="cal-level-badge" style="' + badgeStyle + '">' + levelLabel + '</span>' : '';

    var overlay = document.createElement('div');
    overlay.className = 'cal-overlay';
    overlay.innerHTML =
      '<div class="cal-modal" role="dialog" aria-modal="true">' +
        '<div class="cal-modal-header">' +
          '<div class="cal-header-wordmark">BE<span>-</span>TANGO</div>' +
          '<div class="cal-header-meta">' +
            '<div class="cal-header-schedule">Class Schedule</div>' +
            (seasonLabel ? '<div class="cal-header-season">Season ' + seasonLabel + '</div>' : '') +
          '</div>' +
          '<button class="cal-close-btn" aria-label="' + t.closeCalendar + '">&#x2715;</button>' +
        '</div>' +
        '<div class="cal-title-band">' +
          '<div class="cal-title-row">' +
            '<h2 class="cal-class-name">' + friendlyName + '</h2>' +
            levelBadge +
          '</div>' +
          '<div class="cal-chips">' + chipsHtml + '</div>' +
        '</div>' +
        '<div class="cal-modal-body">' +
          '<div class="cal-section-label">Class Calendar</div>' +
          '<div class="cal-months-grid">' + calendarHtml + '</div>' +
          '<div class="cal-legend">' +
            '<span class="cal-legend-item"><span class="cal-legend-dot cal-legend-lesson"></span> ' + t.lesson + '</span>' +
            '<span class="cal-legend-item"><span class="cal-legend-dot cal-legend-practica"></span> ' + t.practicaLabel + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="cal-modal-footer">' +
          '<button class="cal-btn-pdf"><i class="fas fa-print"></i> ' + t.downloadPdf + '</button>' +
          '<button class="cal-btn-ics"><i class="fas fa-calendar-plus"></i> ' + t.addToCalendar + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var closeModal = function () { overlay.remove(); };

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector('.cal-close-btn').addEventListener('click', closeModal);

    var escHandler = function (e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    overlay.querySelector('.cal-btn-ics').addEventListener('click', function () {
      generateICS(classData, t, lang);
    });
    overlay.querySelector('.cal-btn-pdf').addEventListener('click', function () {
      printCalendar(classData, t, lang);
    });
  }

  function buildCalendarHTML(classData, t, lang) {
    var lessonSet   = {};
    var practicaSet = {};
    (classData.lesson_dates || []).forEach(function (d) { lessonSet[d] = true; });
    (classData.practica_dates || []).forEach(function (d) { practicaSet[d] = true; });
    var allDates = [].concat(Object.keys(lessonSet), Object.keys(practicaSet)).sort();

    if (allDates.length === 0) {
      return '<p style="color:#9ca3af;font-size:0.9rem;">No dates available.</p>';
    }

    var months    = t.calMonthNames;
    var wdHeaders = t.calWeekDays;

    var firstParts = allDates[0].split('-').map(Number);
    var lastParts  = allDates[allDates.length - 1].split('-').map(Number);
    var fy = firstParts[0], fm = firstParts[1];
    var ly = lastParts[0],  lm = lastParts[1];

    var today = new Date();
    var pad2 = function (n) { return String(n).padStart(2, '0'); };
    var todayStr = today.getFullYear() + '-' + pad2(today.getMonth() + 1) + '-' + pad2(today.getDate());

    var html = '';
    var cy = fy, cm = fm;

    while (cy < ly || (cy === ly && cm <= lm)) {
      var daysInMonth = new Date(cy, cm, 0).getDate();
      var firstWeekday = new Date(cy, cm - 1, 1).getDay();
      var offset = (firstWeekday + 6) % 7;

      html += '<div class="cal-month">';
      html += '<h4 class="cal-month-title" data-year="' + cy + '">' + months[cm - 1] + '</h4>';
      html += '<div class="cal-weekdays">';
      wdHeaders.forEach(function (h) { html += '<span>' + h + '</span>'; });
      html += '</div>';
      html += '<div class="cal-days">';

      for (var i = 0; i < offset; i++) {
        html += '<div class="cal-day cal-day-empty"><span class="cal-day-num"></span></div>';
      }
      for (var day = 1; day <= daysInMonth; day++) {
        var dateStr = cy + '-' + pad2(cm) + '-' + pad2(day);
        var cls = 'cal-day';
        if (lessonSet[dateStr])   cls += ' cal-lesson';
        if (practicaSet[dateStr]) cls += ' cal-practica';
        if (dateStr === todayStr) cls += ' cal-today';
        html += '<div class="' + cls + '"><span class="cal-day-num">' + day + '</span></div>';
      }

      html += '</div></div>';

      cm++;
      if (cm > 12) { cm = 1; cy++; }
    }

    return html;
  }

  function generateICS(classData, t, lang) {
    var lessonDates   = classData.lesson_dates   || [];
    var practicaDates = classData.practica_dates || [];
    var levelCode     = String(classData.level_code || '');
    var levelLabel    = (classData.level_name && classData.level_name[lang]) || t.levels[levelCode] || '';
    var friendlyName  = levelLabel + (classData.day_of_week ? ' \u00b7 ' + classData.day_of_week : '');
    var location      = (classData.location && locStr(classData.location.full_address, lang)) || '';
    var startTime     = classData.start_time || '19:00';
    var endTime       = classData.end_time || (function () {
      var parts = startTime.split(':').map(Number);
      var totalMin = parts[0] * 60 + parts[1] + 90;
      var h = Math.floor(totalMin / 60);
      var m = totalMin % 60;
      return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }());

    var toICSDateTime = function (dateStr, timeStr) {
      return dateStr.replace(/-/g, '') + 'T' + timeStr.replace(':', '') + '00';
    };
    var uid = function () {
      return Date.now() + '-' + Math.random().toString(36).substr(2, 9) + '@be-tango.be';
    };

    var events = '';
    lessonDates.forEach(function (date) {
      events += 'BEGIN:VEVENT\r\n' +
        'UID:' + uid() + '\r\n' +
        'DTSTART;TZID=Europe/Brussels:' + toICSDateTime(date, startTime) + '\r\n' +
        'DTEND;TZID=Europe/Brussels:' + toICSDateTime(date, endTime) + '\r\n' +
        'SUMMARY:BE-TANGO - ' + friendlyName + '\r\n' +
        'LOCATION:' + location + '\r\n' +
        'END:VEVENT\r\n';
    });
    practicaDates.forEach(function (date) {
      events += 'BEGIN:VEVENT\r\n' +
        'UID:' + uid() + '\r\n' +
        'DTSTART;TZID=Europe/Brussels:' + toICSDateTime(date, startTime) + '\r\n' +
        'DTEND;TZID=Europe/Brussels:' + toICSDateTime(date, endTime) + '\r\n' +
        'SUMMARY:BE-TANGO - ' + friendlyName + ' - ' + t.practicaLabel + '\r\n' +
        'LOCATION:' + location + '\r\n' +
        'END:VEVENT\r\n';
    });

    var ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//BE-TANGO//Schedule//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n' +
              events.trim() + '\r\nEND:VCALENDAR';

    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url;
    a.download = 'be-tango-' + friendlyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  function printCalendar(classData, t, lang) {
    var levelCode   = String(classData.level_code || '');
    var levelLabel  = (classData.level_name && classData.level_name[lang]) || t.levels[levelCode] || '';
    var friendlyName = levelLabel + (classData.day_of_week ? ' \u00b7 ' + classData.day_of_week : '');
    var lessonSet   = {};
    var practicaSet = {};
    (classData.lesson_dates || []).forEach(function (d) { lessonSet[d] = true; });
    (classData.practica_dates || []).forEach(function (d) { practicaSet[d] = true; });
    var allDates = [].concat(Object.keys(lessonSet), Object.keys(practicaSet)).sort();
    var monthNames = t.calMonthNames;
    var wdHeaders  = t.calWeekDays;

    var monthBlocks = [];
    if (allDates.length > 0) {
      var fp = allDates[0].split('-').map(Number);
      var lp = allDates[allDates.length - 1].split('-').map(Number);
      var cy = fp[0], cm = fp[1];
      while (cy < lp[0] || (cy === lp[0] && cm <= lp[1])) {
        monthBlocks.push({ y: cy, m: cm });
        cm++; if (cm > 12) { cm = 1; cy++; }
      }
    }

    var pad2 = function (n) { return String(n).padStart(2, '0'); };
    var years = monthBlocks.map(function (b) { return b.y; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    var seasonLabel = years.length > 1 ? years.join('\u2013') : String(years[0] || '');

    var BADGE_STYLES = {
      '1':  'background:#DBEAFE;color:#1D4ED8;',
      '2':  'background:#E0E7FF;color:#4338CA;',
      '21': 'background:#EDE9FE;color:#7C3AED;',
      '3':  'background:#FEE2E2;color:#DC2626;',
      '4':  'background:#FEE2E2;color:#DC2626;'
    };
    var badgeStyle = BADGE_STYLES[levelCode] || 'background:#F3F4F6;color:#374151;';

    var svgCal   = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1.5" width="8" height="7.5" rx="1.2" stroke="#1C244B" stroke-width="1.2"/><path d="M1 4h8" stroke="#1C244B" stroke-width="1.2"/><path d="M3 1v1.5M7 1v1.5" stroke="#1C244B" stroke-width="1.2" stroke-linecap="round"/></svg>';
    var svgClock = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="3.8" stroke="#1C244B" stroke-width="1.2"/><path d="M5 2.8V5l1.5 1.5" stroke="#1C244B" stroke-width="1.2" stroke-linecap="round"/></svg>';
    var svgPin   = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1C3.34 1 2 2.34 2 4c0 2.25 3 5.5 3 5.5S8 6.25 8 4c0-1.66-1.34-3-3-3z" stroke="#1C244B" stroke-width="1.2"/><circle cx="5" cy="4" r="1" fill="#1C244B"/></svg>';
    var chipStyle = 'display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;background:#fff;border:1px solid #E5E7EB;margin-right:8px;font-size:11px;font-weight:600;color:#1C244B;white-space:nowrap;font-family:Poppins,sans-serif;';

    var chipsHtml = '';
    if (classData.start_date) chipsHtml += '<span style="' + chipStyle + '">' + svgCal + ' ' + formatDate(classData.start_date, lang) + '</span>';
    if (classData.start_time) {
      var timeStr = classData.end_time ? classData.start_time + '\u2013' + classData.end_time : classData.start_time;
      chipsHtml += '<span style="' + chipStyle + '">' + svgClock + ' ' + timeStr + '</span>';
    }
    if (classData.location && classData.location.city) {
      chipsHtml += '<span style="' + chipStyle + '">' + svgPin + ' ' + locStr(classData.location.city, lang) + '</span>';
    }

    var renderMonth = function (block) {
      var name = monthNames[block.m - 1];
      var daysInMonth = new Date(block.y, block.m, 0).getDate();
      var offset = (new Date(block.y, block.m - 1, 1).getDay() + 6) % 7;

      var lessonCount = 0, practicaCount = 0;
      for (var d = 1; d <= daysInMonth; d++) {
        var key = block.y + '-' + pad2(block.m) + '-' + pad2(d);
        if (lessonSet[key])   lessonCount++;
        if (practicaSet[key]) practicaCount++;
      }
      var countParts = [];
      if (lessonCount > 0)   countParts.push(lessonCount + ' lesson' + (lessonCount !== 1 ? 's' : ''));
      if (practicaCount > 0) countParts.push(practicaCount + ' practica');

      var wdCells = wdHeaders.map(function (h) {
        return '<div style="background:#1C244B;color:#fff;font-size:8px;font-weight:600;text-align:center;padding:4px 1px;letter-spacing:0.04em;text-transform:uppercase;font-family:Poppins,sans-serif;">' + h + '</div>';
      }).join('');

      var cells = '';
      for (var i = 0; i < offset; i++) {
        cells += '<div style="background:#F3F5F8;padding:3px 1px;"></div>';
      }
      for (var dd = 1; dd <= daysInMonth; dd++) {
        var dkey = block.y + '-' + pad2(block.m) + '-' + pad2(dd);
        var isL = !!lessonSet[dkey], isP = !!practicaSet[dkey];
        var numStyle = isL
          ? 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:3px;background:#E2C033;color:#000;font-weight:700;font-size:10px;'
          : isP
          ? 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:3px;background:#1C244B;color:#fff;font-weight:700;font-size:10px;'
          : 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;font-size:10px;color:#111827;';
        cells += '<div style="text-align:center;padding:2px 1px;font-family:Poppins,sans-serif;"><span style="' + numStyle + '">' + dd + '</span></div>';
      }

      var countBadge = countParts.length
        ? '<span style="margin-left:auto;font-size:9px;font-weight:600;color:#4a4a4a;background:#F3F5F8;border:1px solid #E5E7EB;border-radius:10px;padding:1px 6px;font-family:Poppins,sans-serif;">' + countParts.join(' \u00b7 ') + '</span>'
        : '';

      return '<div style="background:#fff;border:1px solid #E5E7EB;border-radius:6px;border-top:3px solid #E2C033;box-shadow:0 1px 4px rgba(0,0,0,0.08);overflow:hidden;">' +
        '<div style="padding:6px 10px 5px;display:flex;align-items:baseline;gap:6px;">' +
          '<span style="font-size:12px;font-weight:700;color:#111827;font-family:Poppins,sans-serif;">' + name + '</span>' +
          '<span style="font-size:10px;font-weight:500;color:#9CA3AF;font-family:Poppins,sans-serif;">' + block.y + '</span>' +
          countBadge +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(7,1fr);">' +
          wdCells + cells +
        '</div>' +
      '</div>';
    };

    var monthGrid = monthBlocks.map(renderMonth).join('');

    var html = '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="UTF-8">' +
      '<title>BE-TANGO \u00b7 ' + friendlyName + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">' +
      '<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}' +
      'body{font-family:"Poppins",sans-serif;background:#e8eaed;display:flex;justify-content:center;padding:24px 16px;}' +
      '.doc{width:760px;background:#F3F5F8;box-shadow:0 8px 32px rgba(0,0,0,0.18);border-radius:4px;overflow:hidden;}' +
      '@page{size:A4 portrait;margin:8mm;}' +
      '@media print{body{background:none;padding:0;display:block;}.doc{box-shadow:none;width:100%;border-radius:0;max-width:none;}}' +
      '</style></head><body><div class="doc">' +
      '<div style="background:#1C244B;padding:12px 24px 0;border-bottom:4px solid #E2C033;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;">' +
          '<div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:0.04em;line-height:1;font-family:Poppins,sans-serif;">BE<span style="color:#E2C033;">-</span>TANGO</div>' +
          '<div style="text-align:right;">' +
            '<div style="font-size:11px;font-weight:600;color:#E2C033;letter-spacing:0.12em;text-transform:uppercase;font-family:Poppins,sans-serif;">Class Schedule</div>' +
            '<div style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.6);letter-spacing:0.06em;font-family:Poppins,sans-serif;">Season ' + seasonLabel + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:#F3F5F8;padding:12px 24px 10px;border-bottom:1px solid #E5E7EB;">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">' +
          '<div style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.01em;line-height:1.2;font-family:Poppins,sans-serif;">' + friendlyName + '</div>' +
          (levelLabel ? '<span style="' + badgeStyle + 'border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;text-transform:uppercase;font-family:Poppins,sans-serif;white-space:nowrap;margin-left:12px;">' + levelLabel + '</span>' : '') +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;">' + chipsHtml + '</div>' +
      '</div>' +
      '<div style="padding:12px 20px;">' +
        '<div style="font-size:9px;font-weight:700;color:#6B7280;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;font-family:Poppins,sans-serif;">Class Calendar</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' + monthGrid + '</div>' +
      '</div>' +
      '<div style="background:#fff;border-top:1px solid #E5E7EB;padding:8px 20px;display:flex;align-items:center;justify-content:space-between;">' +
        '<div style="display:flex;align-items:center;gap:20px;">' +
          '<div style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:500;color:#4a4a4a;font-family:Poppins,sans-serif;"><div style="width:16px;height:16px;border-radius:4px;background:#E2C033;flex-shrink:0;"></div>' + t.lesson + '</div>' +
          '<div style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:500;color:#4a4a4a;font-family:Poppins,sans-serif;"><div style="width:16px;height:16px;border-radius:4px;background:#1C244B;flex-shrink:0;"></div>' + t.practicaLabel + '</div>' +
        '</div>' +
        '<div style="font-size:12px;font-weight:600;color:#1C244B;font-family:Poppins,sans-serif;">be-tango<span style="color:#E2C033;">.be</span></div>' +
      '</div>' +
      '</div><script>window.onload=function(){window.print();};<\/script></body></html>';

    var w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
