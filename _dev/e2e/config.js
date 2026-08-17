// _dev/e2e/config.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Defaults target production on purpose — this suite exists to verify the live
// site. Override both when you need to exercise UNPUBLISHED form changes, which
// production cannot see until they deploy:
//
//   E2E_SITE_URL=http://localhost:8002 \
//   E2E_API_BASE=http://betango.membrero.test:8001/api/v1 \
//   npm run test:e2e
const SITE_URL    = process.env.E2E_SITE_URL || 'https://www.be-tango.be';
const API_BASE    = process.env.E2E_API_BASE || 'https://betango.membrero.com/api/v1';
const CLEANUP_URL = API_BASE + '/e2e/cleanup';

const CLEANUP_SECRET = process.env.E2E_CLEANUP_SECRET;

if (!CLEANUP_SECRET) throw new Error('E2E_CLEANUP_SECRET not set in .env');

// BREVO_API_KEY is deliberately gone: Brevo is no longer a Membrero send path, and the key
// never held a real value (it was the literal string 'FILL_IN_MANUALLY'). Email verification
// now lives in helpers/email-verify.js — see that file for the email_logs replacement plan.

// Each test run gets a unique ID so emails never collide between runs
const RUN_ID = process.env.E2E_RUN_ID || String(Date.now());

function testEmail(slug) {
  return `e2e-${RUN_ID}-${slug}@test.be-tango.be`;
}

module.exports = { SITE_URL, API_BASE, CLEANUP_URL, CLEANUP_SECRET, RUN_ID, testEmail };
