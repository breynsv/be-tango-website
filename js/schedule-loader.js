/**
 * BE-TANGO Schedule Loader
 *
 * Dynamically loads and displays class schedules from the CRM API
 * with multilingual support (EN, NL, FR).
 */

(function() {
    'use strict';

    // ===== TRANSLATIONS =====
    const TRANSLATIONS = {
        en: {
            loading: 'Loading schedule...',
            errorHeading: 'Unable to Load Schedule',
            tryAgain: 'Try Again',
            emptyHeading: 'No Classes Available',
            emptyText: 'Check back soon for updated schedules.',
            bookFreeTrial: 'BOOK FREE TRIAL',
            signUp: 'SIGN UP',
            sessions: 'sessions',
            viewSchedule: 'View Schedule',
            weeklySchedule: 'Weekly schedule',
            groupClasses: 'Group classes',
            advancedTechnique: 'Advanced technique',
            levels: {
                '0':  { name: 'START HERE',        badgeClass: 'level-badge-blue',   desc: 'Argentine Tango for Beginners',       nameHtml: 'START HERE',                                          detailIcon: 'fa-users'          },
                '1':  { name: 'First Year',         badgeClass: 'level-badge-blue',   desc: 'Argentine Tango – First Year',        nameHtml: 'First Year',                                          detailIcon: 'fa-users'          },
                '2':  { name: 'Second Year',        badgeClass: 'level-badge-indigo', desc: 'Argentine Tango – Second Year',       nameHtml: 'Second Year',                                         detailIcon: 'fa-users'          },
                '21': { name: 'Second Year PLUS',   badgeClass: 'level-badge-purple', desc: 'Argentine Tango – Second Year Plus',  nameHtml: 'Second Year <span class="highlight">PLUS</span>',     detailIcon: 'fa-users'          },
                '3':  { name: 'Intermediate',       badgeClass: 'level-badge-red',    desc: 'Intermediate Argentine Tango',        nameHtml: 'Intermediate / Advanced',                             detailIcon: 'fa-graduation-cap' },
                '4':  { name: 'Advanced',           badgeClass: 'level-badge-red',    desc: 'Advanced Argentine Tango',            nameHtml: 'Advanced',                                            detailIcon: 'fa-graduation-cap' },
            },
            dayAbbr: {
                'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed',
                'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun',
            },
            dayFull: {
                'Monday': 'Monday', 'Tuesday': 'Tuesday', 'Wednesday': 'Wednesday',
                'Thursday': 'Thursday', 'Friday': 'Friday', 'Saturday': 'Saturday', 'Sunday': 'Sunday',
            },
            cities: {
                'Brussels': 'Brussels',
                'Woluwe-Saint-Pierre': 'Woluwe-Saint-Pierre',
            },
            startsOn: 'Starts',
            viewCalendar: 'Calendar',
            lesson: 'Tango lesson',
            practicaLabel: 'Practice evening',
            downloadPdf: 'Print',
            addToCalendar: 'Add to Calendar (.ics)',
            closeCalendar: 'Close',
            calMonthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
            calWeekDays: ['Mo','Tu','We','Th','Fr','Sa','Su'],
        },
        nl: {
            loading: 'Rooster laden...',
            errorHeading: 'Rooster niet beschikbaar',
            tryAgain: 'Opnieuw proberen',
            emptyHeading: 'Geen Lessen Beschikbaar',
            emptyText: 'Kom binnenkort terug voor bijgewerkte roosters.',
            bookFreeTrial: 'BOEK GRATIS PROEFLES',
            signUp: 'INSCHRIJVEN',
            sessions: 'lessen',
            viewSchedule: 'Bekijk Rooster',
            weeklySchedule: 'Wekelijks rooster',
            groupClasses: 'Groepslessen',
            advancedTechnique: 'Gevorderde techniek',
            levels: {
                '0':  { name: 'START HIER',         badgeClass: 'level-badge-blue',   desc: 'Argentijnse tango voor beginners',    nameHtml: 'START HIER',                                          detailIcon: 'fa-users'          },
                '1':  { name: 'Eerste Jaar',         badgeClass: 'level-badge-blue',   desc: 'Argentijnse tango – Eerste jaar',     nameHtml: 'Eerste Jaar',                                         detailIcon: 'fa-users'          },
                '2':  { name: 'Tweede Jaar',         badgeClass: 'level-badge-indigo', desc: 'Argentijnse tango – Tweede jaar',     nameHtml: 'Tweede Jaar',                                         detailIcon: 'fa-users'          },
                '21': { name: 'Tweede Jaar PLUS',    badgeClass: 'level-badge-purple', desc: 'Argentijnse tango – Tweede jaar Plus',nameHtml: 'Tweede Jaar <span class="highlight">PLUS</span>',     detailIcon: 'fa-users'          },
                '3':  { name: 'Gevorderd',           badgeClass: 'level-badge-red',    desc: 'Argentijnse tango gevorderd',         nameHtml: 'Gemiddeld / Gevorderd',                               detailIcon: 'fa-graduation-cap' },
                '4':  { name: 'Geavanceerd',         badgeClass: 'level-badge-red',    desc: 'Argentijnse tango geavanceerd',       nameHtml: 'Gevorderd',                                           detailIcon: 'fa-graduation-cap' },
            },
            dayAbbr: {
                'Monday': 'Ma', 'Tuesday': 'Di', 'Wednesday': 'Wo',
                'Thursday': 'Do', 'Friday': 'Vr', 'Saturday': 'Za', 'Sunday': 'Zo',
            },
            dayFull: {
                'Monday': 'Maandag', 'Tuesday': 'Dinsdag', 'Wednesday': 'Woensdag',
                'Thursday': 'Donderdag', 'Friday': 'Vrijdag', 'Saturday': 'Zaterdag', 'Sunday': 'Zondag',
            },
            cities: {
                'Brussels': 'Brussel',
                'Woluwe-Saint-Pierre': 'Sint-Pieters-Woluwe',
            },
            startsOn: 'Start op',
            viewCalendar: 'Kalender',
            lesson: 'Tangoles',
            practicaLabel: 'Practica-avond',
            downloadPdf: 'Afdrukken',
            addToCalendar: 'Toevoegen aan kalender (.ics)',
            closeCalendar: 'Sluiten',
            calMonthNames: ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'],
            calWeekDays: ['Ma','Di','Wo','Do','Vr','Za','Zo'],
        },
        fr: {
            loading: 'Chargement du planning...',
            errorHeading: 'Impossible de charger le planning',
            tryAgain: 'Réessayer',
            emptyHeading: 'Aucun Cours Disponible',
            emptyText: 'Revenez bientôt pour les horaires mis à jour.',
            bookFreeTrial: 'RÉSERVER UN ESSAI GRATUIT',
            signUp: 'S\'INSCRIRE',
            sessions: 'séances',
            viewSchedule: 'Voir l\'horaire',
            weeklySchedule: 'Horaire hebdomadaire',
            groupClasses: 'Cours collectifs',
            advancedTechnique: 'Technique avancée',
            levels: {
                '0':  { name: 'COMMENCEZ ICI',      badgeClass: 'level-badge-blue',   desc: 'Tango argentin pour débutants',        nameHtml: 'COMMENCEZ ICI',                                        detailIcon: 'fa-users'          },
                '1':  { name: 'Première Année',      badgeClass: 'level-badge-blue',   desc: 'Tango argentin – Première année',      nameHtml: 'Première Année',                                       detailIcon: 'fa-users'          },
                '2':  { name: 'Deuxième Année',      badgeClass: 'level-badge-indigo', desc: 'Tango argentin – Deuxième année',      nameHtml: 'Deuxième Année',                                       detailIcon: 'fa-users'          },
                '21': { name: 'Deuxième Année PLUS', badgeClass: 'level-badge-purple', desc: 'Tango argentin – Deuxième année Plus', nameHtml: 'Deuxième Année <span class="highlight">PLUS</span>',   detailIcon: 'fa-users'          },
                '3':  { name: 'Intermédiaire',       badgeClass: 'level-badge-red',    desc: 'Tango argentin intermédiaire',         nameHtml: 'Intermédiaire / Avancé',                               detailIcon: 'fa-graduation-cap' },
                '4':  { name: 'Avancé',              badgeClass: 'level-badge-red',    desc: 'Tango argentin avancé',                nameHtml: 'Avancé',                                               detailIcon: 'fa-graduation-cap' },
            },
            dayAbbr: {
                'Monday': 'Lun', 'Tuesday': 'Mar', 'Wednesday': 'Mer',
                'Thursday': 'Jeu', 'Friday': 'Ven', 'Saturday': 'Sam', 'Sunday': 'Dim',
            },
            dayFull: {
                'Monday': 'Lundi', 'Tuesday': 'Mardi', 'Wednesday': 'Mercredi',
                'Thursday': 'Jeudi', 'Friday': 'Vendredi', 'Saturday': 'Samedi', 'Sunday': 'Dimanche',
            },
            cities: {
                'Brussels': 'Bruxelles',
                'Woluwe-Saint-Pierre': 'Woluwe-Saint-Pierre',
            },
            startsOn: 'Début le',
            viewCalendar: 'Calendrier',
            lesson: 'Cours de tango',
            practicaLabel: 'Soirée pratique',
            downloadPdf: 'Imprimer',
            addToCalendar: 'Ajouter au calendrier (.ics)',
            closeCalendar: 'Fermer',
            calMonthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
            calWeekDays: ['Lu','Ma','Me','Je','Ve','Sa','Di'],
        },
    };

    // Day of week order for sorting
    const DAY_ORDER = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
        'Friday': 5, 'Saturday': 6, 'Sunday': 7,
    };

    /**
     * Get current page language from html[lang] attribute
     */
    function getLanguage() {
        const lang = (document.documentElement.lang || 'en').split('-')[0].toLowerCase();
        return TRANSLATIONS[lang] ? lang : 'en';
    }

    /**
     * Detect page type from URL to determine which API endpoint to call
     */
    function detectPageType() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('beginner') || path.includes('debutant') || path.includes('beginners')) {
            return 'beginner';
        } else if (path.includes('experienced') || path.includes('experimentes') || path.includes('ervaring')) {
            return 'experienced';
        } else if (path.includes('brussels') || path.includes('bruxelles') || path.includes('brussel')) {
            return 'brussels';
        } else if (path.includes('woluwe')) {
            return 'woluwe';
        }
        return 'all';
    }

    /**
     * Fetch classes based on page type
     */
    async function fetchClasses(pageType) {
        const api = window.BETangoCRM.api;
        switch (pageType) {
            case 'beginner':    return await api.getBeginnerClasses();
            case 'experienced': return await api.getExperiencedClasses();
            case 'brussels':    return await api.getClassesByLocation('Brussels');
            case 'woluwe':      return await api.getClassesByLocation('Woluwe');
            default:            return await api.getClasses();
        }
    }

    /**
     * Extract a localized string value from an API field that may be a plain string or a {en,fr,nl} object
     */
    function locStr(val, lang) {
        if (val && typeof val === 'object') return val[lang] || val.en || Object.values(val)[0] || '';
        return val || '';
    }

    /**
     * Group classes by location
     */
    function groupByLocation(classes) {
        const grouped = {};
        classes.forEach(classItem => {
            if (!classItem.location) return;
            // Use location.name as the stable grouping key (always a plain string)
            const locationName = classItem.location.name || classItem.location.city || '';
            if (!grouped[locationName]) {
                grouped[locationName] = { location: classItem.location, classes: [] };
            }
            grouped[locationName].classes.push(classItem);
        });
        Object.values(grouped).forEach(group => {
            group.classes.sort((a, b) => {
                const dayCompare = (DAY_ORDER[a.day_of_week] || 99) - (DAY_ORDER[b.day_of_week] || 99);
                if (dayCompare !== 0) return dayCompare;
                return (a.start_time || '').localeCompare(b.start_time || '');
            });
        });
        return grouped;
    }

    /**
     * Derive day of week from start_date when day_of_week is null
     */
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    function resolveDayOfWeek(classData) {
        if (classData.day_of_week) return classData.day_of_week;
        if (classData.start_date) {
            const [y, m, d] = classData.start_date.split('-').map(Number);
            return DAY_NAMES[new Date(y, m - 1, d).getDay()];
        }
        return null;
    }

    /**
     * Build a human-readable class name from level and day of week
     */
    function buildFriendlyName(classData, t, lang) {
        let levelName;
        if (classData.level_name && classData.level_name[lang]) {
            levelName = classData.level_name[lang];
        } else {
            const level = t.levels[classData.level_code];
            levelName = level ? level.name : (classData.level_code || '');
        }
        const dow = resolveDayOfWeek(classData);
        const day = (dow && t.dayFull && t.dayFull[dow]) || dow || '';
        return [levelName, day].filter(Boolean).join(' · ');
    }

    /**
     * Create a single schedule item element (wrapped with a Sign Up button)
     */
    function createScheduleItem(classData, t, lang) {
        const levelFallback = t.levels[classData.level_code] || {
            name: classData.level_code,
            badgeClass: 'level-badge-blue',
        };
        const level = {
            name: (classData.level_name && classData.level_name[lang]) || levelFallback.name,
            badgeClass: levelFallback.badgeClass,
        };
        const dow = resolveDayOfWeek(classData);
        const dayAbbr = (dow && t.dayAbbr[dow]) || (dow ? dow.slice(0, 3) : '');
        const friendlyName = buildFriendlyName(classData, t, lang);

        const totalSessions = (classData.lesson_count || 0) + (classData.practica_date ? 1 : 0);
        const sessionsHtml = totalSessions > 0
            ? `<span class="schedule-sessions">${totalSessions} ${t.sessions || 'sessions'}</span>`
            : '';

        const priceHtml = classData.price
            ? `<span class="schedule-price">€${Math.round(parseFloat(classData.price))} p.p.</span>`
            : '';

        const startDateHtml = classData.start_date
            ? `<span class="schedule-start-date">${t.startsOn}: ${formatDate(classData.start_date, lang)}</span>`
            : '';

        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="schedule-time">
                <span class="schedule-day">${dayAbbr}</span>
                <span class="schedule-hour">${classData.start_time || ''}</span>
            </div>
            <div class="schedule-info">
                ${priceHtml}
                ${sessionsHtml}
                ${startDateHtml}
            </div>
            <span class="schedule-badge ${level.badgeClass}">${level.name}</span>
        `;

        const btn = document.createElement('button');
        btn.className = 'btn btn-sign-up btn-sign-up-inline';
        btn.dataset.productId = classData.id;
        btn.dataset.className = friendlyName;
        btn.dataset.price = classData.price || '';
        btn.dataset.location = (classData.location && locStr(classData.location.city, lang)) || classData.location && classData.location.name || '';
        btn.textContent = t.signUp + ' →';
        item.appendChild(btn);

        const hasCalendarDates = (classData.lesson_dates && classData.lesson_dates.length > 0) ||
                                 (classData.practica_dates && classData.practica_dates.length > 0);
        if (hasCalendarDates) {
            const calBtn = document.createElement('button');
            calBtn.className = 'btn-cal-icon';
            calBtn.title = t.viewCalendar;
            calBtn.innerHTML = '<i class="fas fa-calendar-alt"></i>';
            calBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openCalendarModal(classData, t, lang);
            });
            item.appendChild(calBtn);
        }

        return item;
    }

    /**
     * Format Y-m-d date string to localised short date
     */
    function formatDate(dateStr, lang) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-').map(Number);
        const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
        const months = t.calMonthNames;
        return `${d} ${months[m - 1]} ${y}`;
    }

    /**
     * Open the calendar modal for a class
     */
    function openCalendarModal(classData, t, lang) {
        const existing = document.querySelector('.cal-overlay');
        if (existing) existing.remove();

        const friendlyName = buildFriendlyName(classData, t, lang);
        const calendarHtml = buildCalendarHTML(classData, t, lang);

        // Metadata chips
        const svgCal  = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1.5" width="8" height="7.5" rx="1.2" stroke="#1C244B" stroke-width="1.2"/><path d="M1 4h8" stroke="#1C244B" stroke-width="1.2"/><path d="M3 1v1.5M7 1v1.5" stroke="#1C244B" stroke-width="1.2" stroke-linecap="round"/></svg>`;
        const svgClock = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="3.8" stroke="#1C244B" stroke-width="1.2"/><path d="M5 2.8V5l1.5 1.5" stroke="#1C244B" stroke-width="1.2" stroke-linecap="round"/></svg>`;
        const svgPin  = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1C3.34 1 2 2.34 2 4c0 2.25 3 5.5 3 5.5S8 6.25 8 4c0-1.66-1.34-3-3-3z" stroke="#1C244B" stroke-width="1.2"/><circle cx="5" cy="4" r="1" fill="#1C244B"/></svg>`;

        let chipsHtml = '';
        if (classData.start_date) chipsHtml += `<span class="cal-chip">${svgCal} ${formatDate(classData.start_date, lang)}</span>`;
        if (classData.start_time) {
            const time = classData.end_time ? `${classData.start_time}–${classData.end_time}` : classData.start_time;
            chipsHtml += `<span class="cal-chip">${svgClock} ${time}</span>`;
        }
        if (classData.location && classData.location.city) {
            const cityStr = locStr(classData.location.city, lang);
            chipsHtml += `<span class="cal-chip">${svgPin} ${t.cities[cityStr] || cityStr}</span>`;
        }

        // Level badge
        const BADGE_STYLES = { '0':'background:#DBEAFE;color:#1D4ED8;', '1':'background:#DBEAFE;color:#1D4ED8;', '2':'background:#E0E7FF;color:#4338CA;', '21':'background:#EDE9FE;color:#7C3AED;', '3':'background:#FEE2E2;color:#DC2626;', '4':'background:#FEE2E2;color:#DC2626;' };
        const levelCode = String(classData.level_code || '');
        const levelLabel = (classData.level_name && classData.level_name[lang]) || (t.levels[levelCode] && t.levels[levelCode].name) || '';
        const badgeStyle = BADGE_STYLES[levelCode] || 'background:#F3F4F6;color:#374151;';
        const levelBadge = levelLabel ? `<span class="cal-level-badge" style="${badgeStyle}">${levelLabel}</span>` : '';

        // Season label
        const allDates = [...(classData.lesson_dates || []), ...(classData.practica_dates || [])].sort();
        const years = allDates.length ? [...new Set(allDates.map(d => d.split('-')[0]))] : [];
        const seasonLabel = years.length > 1 ? years[0] + '–' + years[years.length - 1] : (years[0] || '');

        const overlay = document.createElement('div');
        overlay.className = 'cal-overlay';
        overlay.innerHTML = `
            <div class="cal-modal" role="dialog" aria-modal="true">
                <div class="cal-modal-header">
                    <div class="cal-header-wordmark">BE<span>-</span>TANGO</div>
                    <div class="cal-header-meta">
                        <div class="cal-header-schedule">Class Schedule</div>
                        ${seasonLabel ? `<div class="cal-header-season">Season ${seasonLabel}</div>` : ''}
                    </div>
                    <button class="cal-close-btn" aria-label="${t.closeCalendar}">&#x2715;</button>
                </div>
                <div class="cal-title-band">
                    <div class="cal-title-row">
                        <h2 class="cal-class-name">${friendlyName}</h2>
                        ${levelBadge}
                    </div>
                    <div class="cal-chips">${chipsHtml}</div>
                </div>
                <div class="cal-modal-body">
                    <div class="cal-section-label">Class Calendar</div>
                    <div class="cal-months-grid">
                        ${calendarHtml}
                    </div>
                    <div class="cal-legend">
                        <span class="cal-legend-item"><span class="cal-legend-dot cal-legend-lesson"></span> ${t.lesson}</span>
                        <span class="cal-legend-item"><span class="cal-legend-dot cal-legend-practica"></span> ${t.practicaLabel}</span>
                    </div>
                </div>
                <div class="cal-modal-footer">
                    <button class="cal-btn-pdf"><i class="fas fa-print"></i> ${t.downloadPdf}</button>
                    <button class="cal-btn-ics"><i class="fas fa-calendar-plus"></i> ${t.addToCalendar}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeModal = () => overlay.remove();

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        overlay.querySelector('.cal-close-btn').addEventListener('click', closeModal);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        overlay.querySelector('.cal-btn-ics').addEventListener('click', () => generateICS(classData, t, lang));
        overlay.querySelector('.cal-btn-pdf').addEventListener('click', () => {
            printCalendar(classData, t, lang);
        });
    }

    /**
     * Build HTML for month-grid calendar
     */
    function buildCalendarHTML(classData, t, lang) {
        const lessonSet = new Set(classData.lesson_dates || []);
        const practicaSet = new Set(classData.practica_dates || []);
        const allDates = [...lessonSet, ...practicaSet].sort();

        if (allDates.length === 0) {
            return `<p style="color:var(--color-text-light);font-size:0.9rem;">${t.emptyText || 'No dates available.'}</p>`;
        }

        const months = t.calMonthNames;
        const wdHeaders = t.calWeekDays;

        const [fy, fm] = allDates[0].split('-').map(Number);
        const [ly, lm] = allDates[allDates.length - 1].split('-').map(Number);

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        let html = '';
        let cy = fy, cm = fm;

        while (cy < ly || (cy === ly && cm <= lm)) {
            const daysInMonth = new Date(cy, cm, 0).getDate();
            const firstWeekday = new Date(cy, cm - 1, 1).getDay(); // 0=Sun…6=Sat
            const offset = (firstWeekday + 6) % 7; // Monday-first offset

            html += `<div class="cal-month">`;
            html += `<h4 class="cal-month-title" data-year="${cy}">${months[cm - 1]}</h4>`;
            html += `<div class="cal-weekdays">`;
            wdHeaders.forEach(h => { html += `<span>${h}</span>`; });
            html += `</div>`;
            html += `<div class="cal-days">`;

            for (let i = 0; i < offset; i++) {
                html += `<div class="cal-day cal-day-empty"><span class="cal-day-num"></span></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${cy}-${String(cm).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                let cls = 'cal-day';
                if (lessonSet.has(dateStr)) cls += ' cal-lesson';
                if (practicaSet.has(dateStr)) cls += ' cal-practica';
                if (dateStr === todayStr) cls += ' cal-today';
                html += `<div class="${cls}"><span class="cal-day-num">${day}</span></div>`;
            }

            html += `</div></div>`;

            cm++;
            if (cm > 12) { cm = 1; cy++; }
        }

        return html;
    }

    /**
     * Generate and download an ICS calendar file
     */
    function generateICS(classData, t, lang) {
        const lessonDates = classData.lesson_dates || [];
        const practicaDates = classData.practica_dates || [];
        const friendlyName = buildFriendlyName(classData, t, lang);
        const location = (classData.location && locStr(classData.location.full_address, lang)) || '';
        const startTime = classData.start_time || '19:00';
        const endTime = classData.end_time || (() => {
            const [h, m] = startTime.split(':').map(Number);
            const totalMin = h * 60 + m + 90;
            return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
        })();

        const toICSDateTime = (dateStr, timeStr) =>
            dateStr.replace(/-/g, '') + 'T' + timeStr.replace(':', '') + '00';

        const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@be-tango.be`;

        let events = '';

        lessonDates.forEach(date => {
            events += [
                'BEGIN:VEVENT',
                `UID:${uid()}`,
                `DTSTART;TZID=Europe/Brussels:${toICSDateTime(date, startTime)}`,
                `DTEND;TZID=Europe/Brussels:${toICSDateTime(date, endTime)}`,
                `SUMMARY:BE-TANGO - ${friendlyName}`,
                `LOCATION:${location}`,
                'END:VEVENT',
            ].join('\r\n') + '\r\n';
        });

        practicaDates.forEach(date => {
            events += [
                'BEGIN:VEVENT',
                `UID:${uid()}`,
                `DTSTART;TZID=Europe/Brussels:${toICSDateTime(date, startTime)}`,
                `DTEND;TZID=Europe/Brussels:${toICSDateTime(date, endTime)}`,
                `SUMMARY:BE-TANGO - ${friendlyName} - ${t.practicaLabel}`,
                `LOCATION:${location}`,
                'END:VEVENT',
            ].join('\r\n') + '\r\n';
        });

        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//BE-TANGO//Schedule//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            events.trim(),
            'END:VCALENDAR',
        ].join('\r\n');

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `be-tango-${friendlyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Dynamically load a script (returns promise)
     */
    /**
     * Build a full HTML document string (design-5 style) for print/PDF.
     */
    function buildPrintHTML(classData, t, lang) {
        const lessonSet   = new Set(classData.lesson_dates  || []);
        const practicaSet = new Set(classData.practica_dates || []);
        const allDates    = [...lessonSet, ...practicaSet].sort();
        const monthNames  = t.calMonthNames;
        const wdHeaders   = t.calWeekDays;
        const friendlyName = buildFriendlyName(classData, t, lang);

        // Collect month range
        const monthBlocks = [];
        if (allDates.length > 0) {
            const [fy, fm] = allDates[0].split('-').map(Number);
            const [ly, lm] = allDates[allDates.length - 1].split('-').map(Number);
            let cy = fy, cm = fm;
            while (cy < ly || (cy === ly && cm <= lm)) {
                monthBlocks.push({ y: cy, m: cm });
                cm++; if (cm > 12) { cm = 1; cy++; }
            }
        }

        const years = [...new Set(monthBlocks.map(b => b.y))];
        const seasonLabel = years.length > 1 ? years.join('–') : String(years[0] || '');

        // Level badge colours keyed by level_code
        const BADGE_STYLES = {
            '0':  'background:#DBEAFE;color:#1D4ED8;',
            '1':  'background:#DBEAFE;color:#1D4ED8;',
            '2':  'background:#E0E7FF;color:#4338CA;',
            '21': 'background:#EDE9FE;color:#7C3AED;',
            '3':  'background:#FEE2E2;color:#DC2626;',
            '4':  'background:#FEE2E2;color:#DC2626;',
        };
        const levelCode = String(classData.level_code || '');
        const levelLabel = (classData.level_name && classData.level_name[lang])
            || (t.levels[levelCode] && t.levels[levelCode].name) || '';
        const badgeStyle = BADGE_STYLES[levelCode] || 'background:#F3F4F6;color:#374151;';

        // Metadata chips
        const svgCal = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1.5" width="8" height="7.5" rx="1.2" stroke="#1C244B" stroke-width="1.2"/><path d="M1 4h8" stroke="#1C244B" stroke-width="1.2"/><path d="M3 1v1.5M7 1v1.5" stroke="#1C244B" stroke-width="1.2" stroke-linecap="round"/></svg>`;
        const svgClock = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="3.8" stroke="#1C244B" stroke-width="1.2"/><path d="M5 2.8V5l1.5 1.5" stroke="#1C244B" stroke-width="1.2" stroke-linecap="round"/></svg>`;
        const svgPin = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1C3.34 1 2 2.34 2 4c0 2.25 3 5.5 3 5.5S8 6.25 8 4c0-1.66-1.34-3-3-3z" stroke="#1C244B" stroke-width="1.2"/><circle cx="5" cy="4" r="1" fill="#1C244B"/></svg>`;

        const chipStyle = 'display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;background:#fff;border:1px solid #E5E7EB;margin-right:8px;font-size:11px;font-weight:600;color:#1C244B;white-space:nowrap;font-family:Poppins,sans-serif;';

        let chipsHtml = '';
        if (classData.start_date) chipsHtml += `<span style="${chipStyle}">${svgCal} ${formatDate(classData.start_date, lang)}</span>`;
        if (classData.start_time) {
            const time = classData.end_time ? `${classData.start_time}–${classData.end_time}` : classData.start_time;
            chipsHtml += `<span style="${chipStyle}">${svgClock} ${time}</span>`;
        }
        if (classData.location && classData.location.city) {
            chipsHtml += `<span style="${chipStyle}">${svgPin} ${t.cities[classData.location.city] || classData.location.city}</span>`;
        }

        const pad2 = n => String(n).padStart(2, '0');

        // Build month card HTML
        const renderMonth = ({ y, m }) => {
            const name = monthNames[m - 1];
            const daysInMonth = new Date(y, m, 0).getDate();
            const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;

            let lessonCount = 0, practicaCount = 0;
            for (let d = 1; d <= daysInMonth; d++) {
                const key = `${y}-${pad2(m)}-${pad2(d)}`;
                if (lessonSet.has(key)) lessonCount++;
                if (practicaSet.has(key)) practicaCount++;
            }
            const countParts = [];
            if (lessonCount > 0) countParts.push(`${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}`);
            if (practicaCount > 0) countParts.push(`${practicaCount} practica`);

            const wdCells = wdHeaders.map(h =>
                `<div style="background:#1C244B;color:#fff;font-size:8px;font-weight:600;text-align:center;padding:4px 1px;letter-spacing:0.04em;text-transform:uppercase;font-family:Poppins,sans-serif;">${h}</div>`
            ).join('');

            let cells = '';
            for (let i = 0; i < offset; i++) {
                cells += `<div style="background:#F3F5F8;padding:3px 1px;"></div>`;
            }
            for (let d = 1; d <= daysInMonth; d++) {
                const key = `${y}-${pad2(m)}-${pad2(d)}`;
                const isL = lessonSet.has(key);
                const isP = practicaSet.has(key);
                const numStyle = isL
                    ? 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:3px;background:#E2C033;color:#000;font-weight:700;font-size:10px;'
                    : isP
                    ? 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:3px;background:#1C244B;color:#fff;font-weight:700;font-size:10px;'
                    : 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;font-size:10px;color:#111827;';
                cells += `<div style="text-align:center;padding:2px 1px;font-family:Poppins,sans-serif;"><span style="${numStyle}">${d}</span></div>`;
            }
            const total = offset + daysInMonth;
            const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
            for (let i = 0; i < trailing; i++) {
                cells += `<div style="background:#F3F5F8;padding:3px 1px;"></div>`;
            }

            const countBadge = countParts.length
                ? `<span style="margin-left:auto;font-size:9px;font-weight:600;color:#4a4a4a;background:#F3F5F8;border:1px solid #E5E7EB;border-radius:10px;padding:1px 6px;font-family:Poppins,sans-serif;">${countParts.join(' · ')}</span>`
                : '';

            return `
                <div style="background:#fff;border:1px solid #E5E7EB;border-radius:6px;border-top:3px solid #E2C033;box-shadow:0 1px 4px rgba(0,0,0,0.08);overflow:hidden;">
                    <div style="padding:6px 10px 5px;display:flex;align-items:baseline;gap:6px;">
                        <span style="font-size:12px;font-weight:700;color:#111827;font-family:Poppins,sans-serif;">${name}</span>
                        <span style="font-size:10px;font-weight:500;color:#9CA3AF;font-family:Poppins,sans-serif;">${y}</span>
                        ${countBadge}
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(7,1fr);">
                        ${wdCells}
                        ${cells}
                    </div>
                </div>`;
        };

        const monthGrid = monthBlocks.map(renderMonth).join('');

        return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BE-TANGO · ${friendlyName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;}
    body{font-family:'Poppins',sans-serif;background:#e8eaed;display:flex;justify-content:center;padding:24px 16px;}
    .doc{width:760px;background:#F3F5F8;box-shadow:0 8px 32px rgba(0,0,0,0.18);border-radius:4px;overflow:hidden;}
    @page{size:A4 portrait;margin:8mm;}
    @media print{
      body{background:none;padding:0;display:block;}
      .doc{box-shadow:none;width:100%;border-radius:0;max-width:none;}
    }
  </style>
</head>
<body>
<div class="doc">

  <!-- HEADER -->
  <div style="background:#1C244B;padding:12px 24px 0;border-bottom:4px solid #E2C033;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;">
      <div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:0.04em;line-height:1;font-family:Poppins,sans-serif;">
        BE<span style="color:#E2C033;">-</span>TANGO
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;font-weight:600;color:#E2C033;letter-spacing:0.12em;text-transform:uppercase;font-family:Poppins,sans-serif;">Class Schedule</div>
        <div style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.6);letter-spacing:0.06em;font-family:Poppins,sans-serif;">Season ${seasonLabel}</div>
      </div>
    </div>
  </div>

  <!-- TITLE BAND -->
  <div style="background:#F3F5F8;padding:12px 24px 10px;border-bottom:1px solid #E5E7EB;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">
      <div style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.01em;line-height:1.2;font-family:Poppins,sans-serif;">
        ${friendlyName}
      </div>
      ${levelLabel ? `<span style="${badgeStyle}border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;text-transform:uppercase;font-family:Poppins,sans-serif;white-space:nowrap;margin-left:12px;">${levelLabel}</span>` : ''}
    </div>
    <div style="display:flex;flex-wrap:wrap;align-items:center;">${chipsHtml}</div>
  </div>

  <!-- CALENDAR -->
  <div style="padding:12px 20px;">
    <div style="font-size:9px;font-weight:700;color:#6B7280;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;font-family:Poppins,sans-serif;">Class Calendar</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${monthGrid}
    </div>
  </div>

  <!-- FOOTER -->
  <div style="background:#fff;border-top:1px solid #E5E7EB;padding:8px 20px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:20px;">
      <div style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:500;color:#4a4a4a;font-family:Poppins,sans-serif;">
        <div style="width:16px;height:16px;border-radius:4px;background:#E2C033;flex-shrink:0;"></div>
        ${t.lesson}
      </div>
      <div style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:500;color:#4a4a4a;font-family:Poppins,sans-serif;">
        <div style="width:16px;height:16px;border-radius:4px;background:#1C244B;flex-shrink:0;"></div>
        ${t.practicaLabel}
      </div>
    </div>
    <div style="font-size:12px;font-weight:600;color:#1C244B;font-family:Poppins,sans-serif;">be-tango<span style="color:#E2C033;">.be</span></div>
  </div>

</div>
<script>window.onload=function(){window.print();};<\/script>
</body>
</html>`;
    }

    /**
     * Open a print-ready window with the design-5 calendar layout.
     */
    function printCalendar(classData, t, lang) {
        const html = buildPrintHTML(classData, t, lang);
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.open();
        w.document.write(html);
        w.document.close();
    }

    /**
     * Dynamically generate level cards for the experienced pages
     */
    function createLevelCards(classes, container, t, lang) {
        const LEVEL_ORDER = ['1', '2', '21', '3', '4'];
        const seen = new Set();
        const levels = [];

        classes.forEach(cls => {
            const code = String(cls.level_code);
            if (!seen.has(code) && parseInt(code, 10) > 0) {
                seen.add(code);
                levels.push({ code, cls });
            }
        });

        levels.sort((a, b) => {
            const ia = LEVEL_ORDER.indexOf(a.code);
            const ib = LEVEL_ORDER.indexOf(b.code);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });

        container.innerHTML = '';

        levels.forEach(({ code, cls }) => {
            const levelDef = t.levels[code] || { name: code, badgeClass: 'level-badge-blue', nameHtml: code, detailIcon: 'fa-users' };
            const levelName = (cls.level_name && cls.level_name[lang]) || levelDef.name;
            const nameHtml  = levelDef.nameHtml || levelName;
            const description = (cls.level_description && cls.level_description[lang]) || levelDef.desc || '';
            const detailIcon = levelDef.detailIcon || 'fa-users';
            const detailText = (detailIcon === 'fa-graduation-cap') ? t.advancedTechnique : t.groupClasses;

            const article = document.createElement('article');
            article.className = 'card level-card';
            article.innerHTML = `
                <div class="level-badge ${levelDef.badgeClass}">${levelName}</div>
                <div class="card-content">
                    <h3>${nameHtml}</h3>
                    <p class="level-description">${description}</p>
                    <div class="level-details">
                        <div class="level-detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${t.weeklySchedule}</span>
                        </div>
                        <div class="level-detail-item">
                            <i class="fas ${detailIcon}"></i>
                            <span>${detailText}</span>
                        </div>
                    </div>
                    <a href="#class-schedules" class="btn btn-primary">${t.viewSchedule}</a>
                </div>
            `;
            container.appendChild(article);
        });
    }

    /**
     * Create a schedule location section
     */
    function createLocationSection(locationData, t, lang, freeTrialUrl) {
        const section = document.createElement('div');
        section.className = 'schedule-location';

        const city = locStr(locationData.location.city, lang) || locationData.location.name;
        const localizedCity = t.cities[city] || city;
        const address = locStr(locationData.location.address, lang);

        const header = document.createElement('div');
        header.className = 'schedule-location-header';
        header.innerHTML = `
            <h3><i class="fas fa-map-marker-alt"></i> ${localizedCity}</h3>
            <p class="location-address">${address}, ${locationData.location.postal_code} ${localizedCity}</p>
        `;

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'schedule-items';

        locationData.classes.forEach(classItem => {
            itemsContainer.appendChild(createScheduleItem(classItem, t, lang));
        });

        section.appendChild(header);
        section.appendChild(itemsContainer);
        return section;
    }

    /**
     * Show loading state
     */
    function showLoading(container, t) {
        container.innerHTML = `
            <div class="schedule-loading" style="text-align: center; padding: 3rem 1rem;">
                <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: var(--color-text-light);">${t.loading}</p>
            </div>
        `;
        if (!document.getElementById('spinner-keyframes')) {
            const style = document.createElement('style');
            style.id = 'spinner-keyframes';
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
    }

    /**
     * Show error state with retry button
     */
    function showError(container, error, t, retryCallback) {
        console.error('[Schedule Loader] Error:', error);
        container.innerHTML = `
            <div class="schedule-error" style="text-align: center; padding: 3rem 1rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--color-dark-navy); margin-bottom: 0.5rem;">${t.errorHeading}</h3>
                <p style="color: var(--color-text-light); margin-bottom: 1.5rem;">${error.message}</p>
                <button class="btn btn-primary schedule-retry-btn">
                    <i class="fas fa-sync-alt"></i> ${t.tryAgain}
                </button>
            </div>
        `;
        const retryBtn = container.querySelector('.schedule-retry-btn');
        if (retryBtn && retryCallback) {
            retryBtn.addEventListener('click', retryCallback);
        }
    }

    /**
     * Load and display schedule
     */
    async function loadSchedule() {
        const containers = document.querySelectorAll('[data-schedule-container]');
        if (containers.length === 0) {
            console.log('[Schedule Loader] No schedule containers found on this page');
            return;
        }

        const lang = getLanguage();
        const t = TRANSLATIONS[lang];
        const pageType = detectPageType();
        console.log(`[Schedule Loader] Language: ${lang}, Page type: ${pageType}`);

        containers.forEach(async (container) => {
            const freeTrialUrl = container.dataset.freeTrialUrl || null;
            showLoading(container, t);

            const attemptLoad = async () => {
                try {
                    showLoading(container, t);

                    const response = await fetchClasses(pageType);

                    if (!response || !response.success) {
                        throw new Error(response?.message || 'Failed to load schedule');
                    }

                    const classes = response.data || [];

                    if (classes.length === 0) {
                        container.innerHTML = `
                            <div class="schedule-empty" style="text-align: center; padding: 3rem 1rem;">
                                <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--color-text-light); margin-bottom: 1rem;"></i>
                                <h3 style="color: var(--color-dark-navy); margin-bottom: 0.5rem;">${t.emptyHeading}</h3>
                                <p style="color: var(--color-text-light);">${t.emptyText}</p>
                            </div>
                        `;
                        return;
                    }

                    container.innerHTML = '';
                    const grouped = groupByLocation(classes);
                    Object.entries(grouped).forEach(([, locationData]) => {
                        container.appendChild(createLocationSection(locationData, t, lang, freeTrialUrl));
                    });

                    const levelCardsContainer = document.querySelector('[data-level-cards-container]');
                    if (levelCardsContainer && classes.length > 0) {
                        createLevelCards(classes, levelCardsContainer, t, lang);
                    }

                    console.log(`[Schedule Loader] Successfully loaded ${classes.length} classes`);

                } catch (error) {
                    showError(container, error, t, attemptLoad);
                }
            };

            await attemptLoad();
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSchedule);
    } else {
        loadSchedule();
    }

    console.log('[Schedule Loader] Initialized');

})();
