/**
 * BE-TANGO Language Page Mapping
 * Maps equivalent pages across EN, NL, and FR versions
 */

const languageMapping = {
  // Homepage
  'index.html': {
    en: 'index.html',
    nl: 'nl/index.html',
    fr: 'fr/index.html'
  },
  'nl/index.html': {
    en: '../index.html',
    nl: 'index.html',
    fr: '../fr/index.html'
  },
  'fr/index.html': {
    en: '../index.html',
    nl: '../nl/index.html',
    fr: 'index.html'
  },

  // Tango Classes
  'tango-classes/index.html': {
    en: 'index.html',
    nl: '../nl/tangolessen/index.html',
    fr: '../fr/cours-de-tango/index.html'
  },
  'nl/tangolessen/index.html': {
    en: '../../tango-classes/index.html',
    nl: 'index.html',
    fr: '../../fr/cours-de-tango/index.html'
  },
  'fr/cours-de-tango/index.html': {
    en: '../../tango-classes/index.html',
    nl: '../../nl/tangolessen/index.html',
    fr: 'index.html'
  },

  // Blog
  'blog/index.html': {
    en: 'index.html',
    nl: '../nl/blog/index.html',
    fr: '../fr/blog/index.html'
  },
  'nl/blog/index.html': {
    en: '../../blog/index.html',
    nl: 'index.html',
    fr: '../../fr/blog/index.html'
  },
  'fr/blog/index.html': {
    en: '../../blog/index.html',
    nl: '../../nl/blog/index.html',
    fr: 'index.html'
  },

  // Contact
  'contact/index.html': {
    en: 'index.html',
    nl: '../nl/contacteer-ons/index.html',
    fr: '../fr/contactez-nous/index.html'
  },
  'nl/contacteer-ons/index.html': {
    en: '../../contact/index.html',
    nl: 'index.html',
    fr: '../../fr/contactez-nous/index.html'
  },
  'fr/contactez-nous/index.html': {
    en: '../../contact/index.html',
    nl: '../../nl/contacteer-ons/index.html',
    fr: 'index.html'
  },

  // Free Trial
  'tango-classes/free-trial/index.html': {
    en: 'index.html',
    nl: '../../nl/tangolessen/gratis-proefles/index.html',
    fr: '../../fr/cours-de-tango/essai-gratuit/index.html'
  },
  'nl/tangolessen/gratis-proefles/index.html': {
    en: '../../../tango-classes/free-trial/index.html',
    nl: 'index.html',
    fr: '../../../fr/cours-de-tango/essai-gratuit/index.html'
  },
  'fr/cours-de-tango/essai-gratuit/index.html': {
    en: '../../../tango-classes/free-trial/index.html',
    nl: '../../../nl/tangolessen/gratis-proefles/index.html',
    fr: 'index.html'
  },

  // Beginners
  'tango-classes/beginners/index.html': {
    en: 'index.html',
    nl: '../../nl/tangolessen/beginners/index.html',
    fr: '../../fr/cours-de-tango/debutants/index.html'
  },
  'nl/tangolessen/beginners/index.html': {
    en: '../../../tango-classes/beginners/index.html',
    nl: 'index.html',
    fr: '../../../fr/cours-de-tango/debutants/index.html'
  },
  'fr/cours-de-tango/debutants/index.html': {
    en: '../../../tango-classes/beginners/index.html',
    nl: '../../../nl/tangolessen/beginners/index.html',
    fr: 'index.html'
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
      en: '../index.html',
      nl: 'index.html',
      fr: '../fr/index.html'
    };
  } else if (normalizedPath.startsWith('fr/')) {
    return {
      en: '../index.html',
      nl: '../nl/index.html',
      fr: 'index.html'
    };
  } else {
    return {
      en: 'index.html',
      nl: 'nl/index.html',
      fr: 'fr/index.html'
    };
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { languageMapping, getLanguageLinks };
}
