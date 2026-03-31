/**
 * BE-TANGO Language Page Mapping
 * Maps equivalent pages across EN, NL, and FR versions
 */

const languageMapping = {
  // Homepage
  'index.html': {
    en: '/en/',
    nl: '/nl/',
    fr: '/fr/'
  },
  'nl/index.html': {
    en: '/en/',
    nl: '/nl/',
    fr: '/fr/'
  },
  'fr/index.html': {
    en: '/en/',
    nl: '/nl/',
    fr: '/fr/'
  },

  // Tango Classes
  'tango-classes/index.html': {
    en: '/en/tango-classes/',
    nl: '/nl/tangolessen/',
    fr: '/fr/cours-de-tango/'
  },
  'nl/tangolessen/index.html': {
    en: '/en/tango-classes/',
    nl: '/nl/tangolessen/',
    fr: '/fr/cours-de-tango/'
  },
  'fr/cours-de-tango/index.html': {
    en: '/en/tango-classes/',
    nl: '/nl/tangolessen/',
    fr: '/fr/cours-de-tango/'
  },

  // Blog
  'blog/index.html': {
    en: '/en/blog/',
    nl: '/nl/blog/',
    fr: '/fr/blog/'
  },
  'nl/blog/index.html': {
    en: '/en/blog/',
    nl: '/nl/blog/',
    fr: '/fr/blog/'
  },
  'fr/blog/index.html': {
    en: '/en/blog/',
    nl: '/nl/blog/',
    fr: '/fr/blog/'
  },

  // Contact
  'contact/index.html': {
    en: '/en/contact/',
    nl: '/nl/contacteer-ons/',
    fr: '/fr/contactez-nous/'
  },
  'nl/contacteer-ons/index.html': {
    en: '/en/contact/',
    nl: '/nl/contacteer-ons/',
    fr: '/fr/contactez-nous/'
  },
  'fr/contactez-nous/index.html': {
    en: '/en/contact/',
    nl: '/nl/contacteer-ons/',
    fr: '/fr/contactez-nous/'
  },

  // Free Trial
  'tango-classes/free-trial/index.html': {
    en: '/en/tango-classes/free-trial/',
    nl: '/nl/tangolessen/gratis-proefles/',
    fr: '/fr/cours-de-tango/essai-gratuit/'
  },
  'nl/tangolessen/gratis-proefles/index.html': {
    en: '/en/tango-classes/free-trial/',
    nl: '/nl/tangolessen/gratis-proefles/',
    fr: '/fr/cours-de-tango/essai-gratuit/'
  },
  'fr/cours-de-tango/essai-gratuit/index.html': {
    en: '/en/tango-classes/free-trial/',
    nl: '/nl/tangolessen/gratis-proefles/',
    fr: '/fr/cours-de-tango/essai-gratuit/'
  },

  // Beginners
  'tango-classes/beginners/index.html': {
    en: '/en/tango-classes/beginners/',
    nl: '/nl/tangolessen/beginners/',
    fr: '/fr/cours-de-tango/debutants/'
  },
  'nl/tangolessen/beginners/index.html': {
    en: '/en/tango-classes/beginners/',
    nl: '/nl/tangolessen/beginners/',
    fr: '/fr/cours-de-tango/debutants/'
  },
  'fr/cours-de-tango/debutants/index.html': {
    en: '/en/tango-classes/beginners/',
    nl: '/nl/tangolessen/beginners/',
    fr: '/fr/cours-de-tango/debutants/'
  }
};

/**
 * Get language links for current page
 * @param {string} currentPath - Current page path
 * @returns {object} - Links for EN, NL, FR
 */
function getLanguageLinks(currentPath) {
  // Normalize path
  const normalizedPath = currentPath.replace(/^\//, '').replace(/\/$/, '');

  // Check if we have a mapping
  if (languageMapping[normalizedPath]) {
    return languageMapping[normalizedPath];
  }

  // Default fallback to homepages
  if (normalizedPath.startsWith('nl/')) {
    return {
      en: '/en/',
      nl: '/nl/',
      fr: '/fr/'
    };
  } else if (normalizedPath.startsWith('fr/')) {
    return {
      en: '/en/',
      nl: '/nl/',
      fr: '/fr/'
    };
  } else {
    return {
      en: '/en/',
      nl: '/nl/',
      fr: '/fr/'
    };
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { languageMapping, getLanguageLinks };
}
