/**
 * BE-TANGO GDPR Cookie Consent
 * Manages cookie consent banner and localStorage preferences
 */

(function() {
  'use strict';

  const COOKIE_CONSENT_KEY = 'be-tango-cookie-consent';
  const CONSENT_EXPIRY_DAYS = 365;

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

      banner.innerHTML = `
        <div class="cookie-consent-container">
          <div class="cookie-consent-text">
            <p id="cookie-consent-description">
              We use cookies to improve your experience on our website.
              By continuing to browse, you agree to our use of cookies.
              <a href="#" id="cookie-learn-more">Learn more</a>
            </p>
          </div>
          <div class="cookie-consent-buttons">
            <button class="cookie-consent-btn cookie-consent-btn-accept" id="cookie-accept" type="button">
              Accept
            </button>
            <button class="cookie-consent-btn cookie-consent-btn-decline" id="cookie-decline" type="button">
              Decline
            </button>
          </div>
          <button class="cookie-consent-close" id="cookie-close" type="button" aria-label="Close banner">
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
        // Small delay to ensure CSS transition works
        setTimeout(() => {
          banner.classList.add('show');
        }, 100);

        // Set focus to accept button for accessibility
        setTimeout(() => {
          const acceptBtn = banner.querySelector('#cookie-accept');
          if (acceptBtn) {
            acceptBtn.focus();
          }
        }, 400);
      }
    },

    /**
     * Hide the banner with animation
     */
    hideBanner: function() {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        banner.classList.remove('show');

        // Remove from DOM after animation
        setTimeout(() => {
          banner.classList.add('hidden');
        }, 300);
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
      // Placeholder for enabling analytics/tracking scripts
      // Example: Load Google Analytics
      /*
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
      */

      console.log('Cookies enabled');

      // Trigger event for other scripts
      const event = new CustomEvent('cookiesEnabled');
      document.dispatchEvent(event);
    },

    /**
     * Disable cookies (remove/block analytics, etc.)
     */
    disableCookies: function() {
      // Placeholder for disabling analytics/tracking scripts
      /*
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
      */

      console.log('Cookies disabled');

      // Trigger event for other scripts
      const event = new CustomEvent('cookiesDisabled');
      document.dispatchEvent(event);
    },

    /**
     * Show more information about cookies
     */
    showMoreInfo: function() {
      // You can customize this to show a modal or navigate to privacy policy
      alert(
        'Cookie Information\n\n' +
        'We use cookies to:\n' +
        '- Remember your preferences\n' +
        '- Analyze website traffic\n' +
        '- Improve user experience\n\n' +
        'You can change your cookie preferences at any time.\n\n' +
        'For more details, please read our Privacy Policy.'
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
