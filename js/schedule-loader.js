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
     * Group classes by location
     */
    function groupByLocation(classes) {
        const grouped = {};
        classes.forEach(classItem => {
            if (!classItem.location) return;
            const locationName = classItem.location.city || classItem.location.name;
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

        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="schedule-time">
                <span class="schedule-day">${dayAbbr}</span>
                <span class="schedule-hour">${classData.start_time || ''}</span>
            </div>
            <div class="schedule-info">
                <span class="schedule-level-name">${level.name}</span>
                ${sessionsHtml}
            </div>
            <span class="schedule-badge ${level.badgeClass}">${level.name}</span>
        `;

        const btn = document.createElement('button');
        btn.className = 'btn btn-sign-up btn-sign-up-inline';
        btn.dataset.productId = classData.id;
        btn.dataset.className = friendlyName;
        btn.dataset.price = classData.price || '';
        btn.dataset.location = (classData.location && classData.location.city) || '';
        btn.textContent = t.signUp + ' →';

        item.appendChild(btn);
        return item;
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

        const city = locationData.location.city || locationData.location.name;
        const localizedCity = t.cities[city] || city;

        const header = document.createElement('div');
        header.className = 'schedule-location-header';
        header.innerHTML = `
            <h3><i class="fas fa-map-marker-alt"></i> ${localizedCity}</h3>
            <p class="location-address">${locationData.location.address}, ${locationData.location.postal_code} ${localizedCity}</p>
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

                    // Populate marketing card for beginner pages
                    if (pageType === 'beginner' && classes.length > 0) {
                        const firstClass = classes[0];
                        const priceEl = document.querySelector('[data-weekly-price]');
                        if (priceEl && firstClass.price) {
                            priceEl.textContent = Math.round(parseFloat(firstClass.price));
                        }
                        const lessonsEl = document.querySelector('[data-weekly-lessons]');
                        if (lessonsEl && firstClass.lesson_count != null) {
                            lessonsEl.textContent = firstClass.lesson_count;
                        }
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
