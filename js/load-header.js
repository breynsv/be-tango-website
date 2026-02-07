/**
 * BE-TANGO Header Loader
 * Dynamically loads the navigation header from partials/navigation.html
 * and replaces placeholders based on page context
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    headerFile: 'partials/navigation.html',
    rootPath: '../',
    currentLang: 'EN',
    enPath: 'index.html',
    nlPath: 'nl/index.html',
    frPath: 'fr/index.html',
    currentPage: 'home'
  };

  /**
   * Auto-detect configuration based on current page URL
   */
  function autoDetectConfig() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;

    // Calculate root path based on directory depth
    if (path.includes('/blog/')) {
      config.rootPath = depth > 2 ? '../../' : '../';
      config.headerFile = config.rootPath + 'partials/navigation.html';
    } else if (path.includes('/tango-classes/')) {
      config.rootPath = path.match(/\/tango-classes\/[^\/]+\//) ? '../../' : '../';
      config.headerFile = config.rootPath + 'partials/navigation.html';
    } else if (path.includes('/nl/')) {
      config.rootPath = depth > 2 ? '../../' : '../';
      config.currentLang = 'NL';
    } else if (path.includes('/fr/')) {
      config.rootPath = depth > 2 ? '../../' : '../';
      config.currentLang = 'FR';
    } else {
      config.rootPath = path.endsWith('index.html') ? '' : '../';
      config.headerFile = (config.rootPath || './') + 'partials/navigation.html';
    }

    // Detect current page
    if (path.includes('/blog')) config.currentPage = 'blog';
    else if (path.includes('/tango-classes')) config.currentPage = 'tango-classes';
    else if (path.includes('/contact')) config.currentPage = 'contact';
    else if (path.includes('/free-trial')) config.currentPage = 'free-trial';
    else config.currentPage = 'home';

    // Set language paths based on current language
    if (config.currentLang === 'NL') {
      config.enPath = config.rootPath + 'index.html';
      config.nlPath = config.rootPath + 'nl/index.html';
      config.frPath = config.rootPath + 'fr/index.html';
    } else if (config.currentLang === 'FR') {
      config.enPath = config.rootPath + 'index.html';
      config.nlPath = config.rootPath + 'nl/index.html';
      config.frPath = config.rootPath + 'fr/index.html';
    } else {
      config.enPath = 'index.html';
      config.nlPath = 'nl/index.html';
      config.frPath = 'fr/index.html';
    }
  }

  /**
   * Load header HTML and inject into page
   */
  async function loadHeader() {
    try {
      autoDetectConfig();

      const response = await fetch(config.headerFile);
      if (!response.ok) throw new Error('Failed to load header');

      let html = await response.text();

      // Replace placeholders
      html = html.replace(/\{\{ROOT_PATH\}\}/g, config.rootPath);
      html = html.replace(/\{\{CURRENT_LANG\}\}/g, config.currentLang);
      html = html.replace(/\{\{EN_PATH\}\}/g, config.enPath);
      html = html.replace(/\{\{NL_PATH\}\}/g, config.nlPath);
      html = html.replace(/\{\{FR_PATH\}\}/g, config.frPath);
      html = html.replace(/\{\{EN_ACTIVE\}\}/g, config.currentLang === 'EN' ? 'active' : '');
      html = html.replace(/\{\{NL_ACTIVE\}\}/g, config.currentLang === 'NL' ? 'active' : '');
      html = html.replace(/\{\{FR_ACTIVE\}\}/g, config.currentLang === 'FR' ? 'active' : '');

      // Find or create header container
      let headerContainer = document.querySelector('[data-header-container]');
      if (!headerContainer) {
        headerContainer = document.querySelector('body > header');
      }

      if (headerContainer) {
        headerContainer.outerHTML = html;
      } else {
        // Insert at beginning of body
        document.body.insertAdjacentHTML('afterbegin', html);
      }

      // Set data-page attribute on body for active state
      document.body.setAttribute('data-page', config.currentPage);

      console.log('✅ Header loaded successfully');
    } catch (error) {
      console.error('Failed to load header:', error);
    }
  }

  // Load header when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
})();
