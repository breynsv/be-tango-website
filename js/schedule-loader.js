/**
 * BE-TANGO Schedule Loader
 *
 * Dynamically loads and displays class schedules from the CRM API
 * while preserving the exact HTML structure and CSS classes.
 */

(function() {
    'use strict';

    // Level code to display name and badge class mapping
    const LEVEL_MAPPING = {
        'BEG': {
            name: 'First Year',
            badgeClass: 'level-badge-blue',
        },
        'INT': {
            name: 'Second Year',
            badgeClass: 'level-badge-indigo',
        },
        'INT+': {
            name: 'Second Year PLUS',
            badgeClass: 'level-badge-purple',
        },
        'ADV': {
            name: 'Intermediate',
            badgeClass: 'level-badge-red',
        },
    };

    // Day of week order for sorting
    const DAY_ORDER = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 7,
    };

    // Day abbreviations
    const DAY_ABBR = {
        'Monday': 'Mon',
        'Tuesday': 'Tue',
        'Wednesday': 'Wed',
        'Thursday': 'Thu',
        'Friday': 'Fri',
        'Saturday': 'Sat',
        'Sunday': 'Sun',
    };

    /**
     * Detect page type from URL to determine which API endpoint to call
     */
    function detectPageType() {
        const path = window.location.pathname.toLowerCase();

        if (path.includes('beginner')) {
            return 'beginner';
        } else if (path.includes('experienced')) {
            return 'experienced';
        } else if (path.includes('brussels')) {
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
            case 'beginner':
                return await api.getBeginnerClasses();
            case 'experienced':
                return await api.getExperiencedClasses();
            case 'brussels':
                return await api.getClassesByLocation('Brussels');
            case 'woluwe':
                return await api.getClassesByLocation('Woluwe');
            default:
                return await api.getClasses();
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
                grouped[locationName] = {
                    location: classItem.location,
                    classes: [],
                };
            }

            grouped[locationName].classes.push(classItem);
        });

        // Sort classes within each location by day and time
        Object.values(grouped).forEach(group => {
            group.classes.sort((a, b) => {
                const dayCompare = (DAY_ORDER[a.day_of_week] || 99) - (DAY_ORDER[b.day_of_week] || 99);
                if (dayCompare !== 0) return dayCompare;

                // Sort by start time if same day
                return (a.start_time || '').localeCompare(b.start_time || '');
            });
        });

        return grouped;
    }

    /**
     * Create schedule item HTML
     */
    function createScheduleItem(classData) {
        const level = LEVEL_MAPPING[classData.level_code] || {
            name: classData.level_code,
            badgeClass: 'level-badge-blue',
        };

        const dayAbbr = DAY_ABBR[classData.day_of_week] || classData.day_of_week;
        const locationName = classData.location ?
            `${classData.location.city} - ${classData.location.building_name}` :
            'Location TBD';

        const item = document.createElement('div');
        item.className = 'schedule-item';

        item.innerHTML = `
            <div class="schedule-time">
                <span class="schedule-day">${dayAbbr}</span>
                <span class="schedule-hour">${classData.start_time || ''}</span>
            </div>
            <div class="schedule-info">
                <h4>${classData.day_of_week} ${classData.start_time} - ${classData.end_time}</h4>
                <p>${locationName}</p>
            </div>
            <span class="schedule-badge ${level.badgeClass}">${level.name}</span>
        `;

        return item;
    }

    /**
     * Create schedule location section HTML
     */
    function createLocationSection(locationName, locationData) {
        const section = document.createElement('div');
        section.className = 'schedule-location';

        const header = document.createElement('div');
        header.className = 'schedule-location-header';
        header.innerHTML = `
            <div>
                <h3><i class="fas fa-map-marker-alt"></i> ${locationData.location.city} - ${locationData.location.building_name}</h3>
                <p class="location-address">${locationData.location.address}, ${locationData.location.postal_code} ${locationData.location.city}</p>
            </div>
        `;

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'schedule-items';

        locationData.classes.forEach(classItem => {
            itemsContainer.appendChild(createScheduleItem(classItem));
        });

        section.appendChild(header);
        section.appendChild(itemsContainer);

        return section;
    }

    /**
     * Show loading state
     */
    function showLoading(container) {
        container.innerHTML = `
            <div class="schedule-loading" style="text-align: center; padding: 3rem 1rem;">
                <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: var(--color-text-light);">Loading schedule...</p>
            </div>
        `;

        // Add spinner animation if not already in styles
        if (!document.getElementById('spinner-keyframes')) {
            const style = document.createElement('style');
            style.id = 'spinner-keyframes';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Show error state with retry button
     */
    function showError(container, error, retryCallback) {
        console.error('[Schedule Loader] Error:', error);

        container.innerHTML = `
            <div class="schedule-error" style="text-align: center; padding: 3rem 1rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--color-dark-navy); margin-bottom: 0.5rem;">Unable to Load Schedule</h3>
                <p style="color: var(--color-text-light); margin-bottom: 1.5rem;">${error.message}</p>
                <button class="btn btn-primary schedule-retry-btn">
                    <i class="fas fa-sync-alt"></i> Try Again
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

        const pageType = detectPageType();
        console.log(`[Schedule Loader] Page type detected: ${pageType}`);

        containers.forEach(async (container) => {
            showLoading(container);

            const attemptLoad = async () => {
                try {
                    showLoading(container);

                    const response = await fetchClasses(pageType);

                    if (!response || !response.success) {
                        throw new Error(response?.message || 'Failed to load schedule');
                    }

                    const classes = response.data || [];

                    if (classes.length === 0) {
                        container.innerHTML = `
                            <div class="schedule-empty" style="text-align: center; padding: 3rem 1rem;">
                                <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--color-text-light); margin-bottom: 1rem;"></i>
                                <h3 style="color: var(--color-dark-navy); margin-bottom: 0.5rem;">No Classes Available</h3>
                                <p style="color: var(--color-text-light);">Check back soon for updated schedules.</p>
                            </div>
                        `;
                        return;
                    }

                    // Clear loading state
                    container.innerHTML = '';

                    // Group classes by location
                    const grouped = groupByLocation(classes);

                    // Create and append location sections
                    Object.entries(grouped).forEach(([locationName, locationData]) => {
                        container.appendChild(createLocationSection(locationName, locationData));
                    });

                    console.log(`[Schedule Loader] Successfully loaded ${classes.length} classes`);

                } catch (error) {
                    showError(container, error, attemptLoad);
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
