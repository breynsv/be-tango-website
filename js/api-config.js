/**
 * BE-TANGO API Configuration
 * Single source of truth for the CRM API base URL.
 * Loaded before all other API-consuming scripts.
 *
 * To change the production URL, edit ONLY this file.
 */
window.API_CONFIG = {
  baseURL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://betango.membrero.test:8001/api/v1'
    : 'https://betango.membrero.com/api/v1'
};
