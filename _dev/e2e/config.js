// _dev/e2e/config.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const SITE_URL    = 'https://www.be-tango.be';
const API_BASE    = 'https://betango.membrero.com/api/v1';
const CLEANUP_URL = API_BASE + '/e2e/cleanup';

const CLEANUP_SECRET = process.env.E2E_CLEANUP_SECRET;
const BREVO_API_KEY  = process.env.BREVO_API_KEY;

if (!CLEANUP_SECRET) throw new Error('E2E_CLEANUP_SECRET not set in .env');
if (!BREVO_API_KEY || BREVO_API_KEY === 'FILL_IN_MANUALLY') {
  console.warn('WARNING: BREVO_API_KEY not set — Brevo email verification tests will fail');
}

// Each test run gets a unique ID so emails never collide between runs
const RUN_ID = process.env.E2E_RUN_ID || String(Date.now());

function testEmail(slug) {
  return `e2e-${RUN_ID}-${slug}@test.be-tango.be`;
}

module.exports = { SITE_URL, API_BASE, CLEANUP_URL, CLEANUP_SECRET, BREVO_API_KEY, RUN_ID, testEmail };
