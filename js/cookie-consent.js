/**
 * BE-TANGO GDPR Cookie Consent
 * Manages cookie consent banner and localStorage preferences
 */

(function() {
  'use strict';

  const COOKIE_CONSENT_KEY = 'be-tango-cookie-consent';
  const CONSENT_EXPIRY_DAYS = 365;

  // ==========================================================================
  // Google Consent Mode v2 (Advanced) + GTM bootstrap.
  // MUST run before GTM loads and before any tag fires. Deny-by-default,
  // applied globally. A returning visitor's stored choice is re-applied here
  // so tags respect it on the very first GTM evaluation.
  // ==========================================================================
  const GTM_ID = 'GTM-XXXXXXX'; // ← replace with the real container ID (prerequisite)

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // Map our two consent categories → Consent Mode v2 signals.
  function consentSignals(cats) {
    return {
      analytics_storage:       cats.analytics ? 'granted' : 'denied',
      ad_storage:              cats.marketing ? 'granted' : 'denied',
      ad_user_data:            cats.marketing ? 'granted' : 'denied',
      ad_personalization:      cats.marketing ? 'granted' : 'denied',
      personalization_storage: cats.marketing ? 'granted' : 'denied'
    };
  }

  // 1. Default everything denied (Advanced mode → tags load cookieless & model).
  gtag('consent', 'default', {
    ad_storage:              'denied',
    ad_user_data:            'denied',
    ad_personalization:      'denied',
    analytics_storage:       'denied',
    personalization_storage: 'denied',
    functionality_storage:   'granted',
    security_storage:        'granted',
    wait_for_update:         500
  });

  // 2. Re-apply a returning visitor's stored choice BEFORE GTM evaluates tags.
  (function applyStoredConsent() {
    try {
      const stored = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) || 'null');
      if (!stored) return;
      if (stored.expiry && Date.now() > stored.expiry) return;
      // Task 3 stores `categories`; until then, map the binary flag.
      const cats = stored.categories || {
        analytics: stored.consent === 'accepted',
        marketing: stored.consent === 'accepted'
      };
      gtag('consent', 'update', consentSignals(cats));
    } catch (e) { /* no stored consent → stay denied */ }
  })();

  // 3. Load GTM (consent state above is already queued in dataLayer).
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s);
    const dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', GTM_ID);

  /**
   * UI translations — keyed by language code from <html lang="...">
   * Brand voice: always plural ("we"/"nous"/"wij"), never first-person singular.
   */
  const TRANSLATIONS = {
    en: {
      title: 'Cookie Consent',
      description: 'We use cookies to improve your experience on our website. By continuing to browse, you agree to our use of cookies.',
      learnMore: 'Learn more',
      accept: 'Accept',
      decline: 'Decline',
      closeAria: 'Close banner',
      moreInfoTitle: 'Cookie Information',
      moreInfoIntro: 'We use cookies to:',
      moreInfoItem1: '- Remember your preferences',
      moreInfoItem2: '- Analyze website traffic',
      moreInfoItem3: '- Improve user experience',
      moreInfoChange: 'You can change your cookie preferences at any time.',
      moreInfoPolicy: 'For more details, please read our Privacy Policy.'
    },
    fr: {
      title: 'Consentement aux cookies',
      description: 'Nous utilisons des cookies pour améliorer votre expérience sur notre site. En poursuivant votre navigation, vous acceptez notre utilisation des cookies.',
      learnMore: 'En savoir plus',
      accept: 'Accepter',
      decline: 'Refuser',
      closeAria: 'Fermer la bannière',
      moreInfoTitle: 'Informations sur les cookies',
      moreInfoIntro: 'Nous utilisons des cookies pour :',
      moreInfoItem1: '- Mémoriser vos préférences',
      moreInfoItem2: '- Analyser le trafic du site',
      moreInfoItem3: '- Améliorer l\'expérience utilisateur',
      moreInfoChange: 'Vous pouvez modifier vos préférences de cookies à tout moment.',
      moreInfoPolicy: 'Pour plus de détails, veuillez consulter notre Politique de confidentialité.'
    },
    nl: {
      title: 'Cookietoestemming',
      description: 'We gebruiken cookies om uw ervaring op onze website te verbeteren. Door verder te bladeren, gaat u akkoord met ons gebruik van cookies.',
      learnMore: 'Meer info',
      accept: 'Accepteren',
      decline: 'Weigeren',
      closeAria: 'Banner sluiten',
      moreInfoTitle: 'Informatie over cookies',
      moreInfoIntro: 'We gebruiken cookies om:',
      moreInfoItem1: '- Uw voorkeuren te onthouden',
      moreInfoItem2: '- Websiteverkeer te analyseren',
      moreInfoItem3: '- De gebruikerservaring te verbeteren',
      moreInfoChange: 'U kunt uw cookievoorkeuren op elk moment wijzigen.',
      moreInfoPolicy: 'Lees voor meer details ons Privacybeleid.'
    }
  };

  /**
   * Detect active language from <html lang="..."> with EN fallback.
   */
  function getLang() {
    const raw = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
    return TRANSLATIONS[raw] ? raw : 'en';
  }

  function t() {
    return TRANSLATIONS[getLang()];
  }

  /**
   * Cookie consent manager
   */
  const CookieConsent = {
    /**
     * Initialize the cookie consent banner
     */
    init: function() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
        return;
      }

      // Check if user has already made a choice
      const consent = this.getConsent();

      if (consent === null) {
        // No consent recorded, show banner
        this.createBanner();
        this.showBanner();
      } else {
        // Consent already recorded
        if (consent === 'accepted') {
          this.enableCookies();
        } else {
          this.disableCookies();
        }
      }
    },

    /**
     * Get stored consent preference
     * @returns {string|null} 'accepted', 'declined', or null
     */
    getConsent: function() {
      try {
        const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);
        const now = new Date().getTime();

        // Check if consent has expired
        if (data.expiry && now > data.expiry) {
          localStorage.removeItem(COOKIE_CONSENT_KEY);
          return null;
        }

        return data.consent;
      } catch (e) {
        console.error('Error reading cookie consent:', e);
        return null;
      }
    },

    /**
     * Store consent preference
     * @param {string} consent - 'accepted' or 'declined'
     */
    setConsent: function(consent) {
      try {
        const now = new Date().getTime();
        const expiry = now + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        const data = {
          consent: consent,
          timestamp: now,
          expiry: expiry
        };

        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data));

        // Trigger custom event for other scripts to listen to
        const event = new CustomEvent('cookieConsentChanged', {
          detail: { consent: consent }
        });
        document.dispatchEvent(event);
      } catch (e) {
        console.error('Error storing cookie consent:', e);
      }
    },

    /**
     * Create the consent banner HTML
     */
    createBanner: function() {
      // Check if banner already exists
      if (document.getElementById('cookie-consent-banner')) {
        return;
      }

      const banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.className = 'cookie-consent-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-labelledby', 'cookie-consent-title');
      banner.setAttribute('aria-describedby', 'cookie-consent-description');

      const i18n = t();
      banner.innerHTML = `
        <div class="cookie-consent-container">
          <div class="cookie-consent-text">
            <h3 id="cookie-consent-title" class="visually-hidden">${i18n.title}</h3>
            <p id="cookie-consent-description">
              ${i18n.description}
              <a href="#" id="cookie-learn-more">${i18n.learnMore}</a>
            </p>
          </div>
          <div class="cookie-consent-buttons">
            <button class="cookie-consent-btn cookie-consent-btn-accept" id="cookie-accept" type="button">
              ${i18n.accept}
            </button>
            <button class="cookie-consent-btn cookie-consent-btn-decline" id="cookie-decline" type="button">
              ${i18n.decline}
            </button>
          </div>
          <button class="cookie-consent-close" id="cookie-close" type="button" aria-label="${i18n.closeAria}">
            &times;
          </button>
        </div>
      `;

      document.body.appendChild(banner);

      // Add event listeners
      this.attachEventListeners(banner);
    },

    /**
     * Attach event listeners to banner buttons
     */
    attachEventListeners: function(banner) {
      const acceptBtn = banner.querySelector('#cookie-accept');
      const declineBtn = banner.querySelector('#cookie-decline');
      const closeBtn = banner.querySelector('#cookie-close');
      const learnMoreLink = banner.querySelector('#cookie-learn-more');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.handleAccept();
        });
      }

      if (declineBtn) {
        declineBtn.addEventListener('click', () => {
          this.handleDecline();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.handleDecline(); // Closing = declining
        });
      }

      if (learnMoreLink) {
        learnMoreLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.showMoreInfo();
        });
      }

      // Handle escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && banner.classList.contains('show')) {
          this.handleDecline();
        }
      });
    },

    /**
     * Show the banner with animation
     */
    showBanner: function() {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        // Use requestAnimationFrame to ensure CSS transition works
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            banner.classList.add('show');

            // Set focus after paint to avoid forced reflow
            requestAnimationFrame(() => {
              const acceptBtn = banner.querySelector('#cookie-accept');
              if (acceptBtn) {
                acceptBtn.focus();
              }
            });
          });
        });
      }
    },

    /**
     * Hide the banner with animation
     */
    hideBanner: function() {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        banner.classList.remove('show');

        // Use transitionend event instead of fixed timeout
        const handleTransitionEnd = () => {
          banner.classList.add('hidden');
          banner.removeEventListener('transitionend', handleTransitionEnd);
        };

        banner.addEventListener('transitionend', handleTransitionEnd, { once: true });

        // Fallback timeout in case transition doesn't fire
        setTimeout(handleTransitionEnd, 400);
      }
    },

    /**
     * Handle accept button click
     */
    handleAccept: function() {
      this.setConsent('accepted');
      this.enableCookies();
      this.hideBanner();
    },

    /**
     * Handle decline button click
     */
    handleDecline: function() {
      this.setConsent('declined');
      this.disableCookies();
      this.hideBanner();
    },

    /**
     * Enable cookies (load analytics, etc.)
     */
    enableCookies: function() {
      gtag('consent', 'update', consentSignals({ analytics: true, marketing: true }));

      // Trigger event for other scripts (backward compat)
      const event = new CustomEvent('cookiesEnabled');
      document.dispatchEvent(event);
    },

    /**
     * Disable cookies (remove/block analytics, etc.)
     */
    disableCookies: function() {
      gtag('consent', 'update', consentSignals({ analytics: false, marketing: false }));

      // Trigger event for other scripts (backward compat)
      const event = new CustomEvent('cookiesDisabled');
      document.dispatchEvent(event);
    },

    /**
     * Show more information about cookies
     */
    showMoreInfo: function() {
      // You can customize this to show a modal or navigate to privacy policy
      const i18n = t();
      alert(
        i18n.moreInfoTitle + '\n\n' +
        i18n.moreInfoIntro + '\n' +
        i18n.moreInfoItem1 + '\n' +
        i18n.moreInfoItem2 + '\n' +
        i18n.moreInfoItem3 + '\n\n' +
        i18n.moreInfoChange + '\n\n' +
        i18n.moreInfoPolicy
      );

      // Better approach: Navigate to privacy policy page
      // window.location.href = '/privacy-policy/';
    },

    /**
     * Programmatically reset consent (for testing or user preference changes)
     */
    resetConsent: function() {
      try {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        console.log('Cookie consent reset');
        return true;
      } catch (e) {
        console.error('Error resetting cookie consent:', e);
        return false;
      }
    }
  };

  // Auto-initialize
  CookieConsent.init();

  // Expose API for manual control
  window.BETangoCookieConsent = {
    getConsent: () => CookieConsent.getConsent(),
    resetConsent: () => CookieConsent.resetConsent(),
    showBanner: () => {
      CookieConsent.createBanner();
      CookieConsent.showBanner();
    }
  };

  // Listen for consent changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === COOKIE_CONSENT_KEY) {
      const consent = CookieConsent.getConsent();
      if (consent === 'accepted') {
        CookieConsent.enableCookies();
      } else if (consent === 'declined') {
        CookieConsent.disableCookies();
      }
    }
  });

})();
