// _dev/e2e/helpers/brevo.js
const https = require('https');

/**
 * Poll Brevo for a transactional email sent to `toEmail` whose subject
 * contains `subjectKeyword`. Waits up to `timeoutMs` milliseconds.
 *
 * Returns the matching email object, or throws on timeout.
 */
async function waitForEmail(apiKey, toEmail, subjectKeyword, timeoutMs = 60000) {
  // Initial delay: allow the queue worker to pick up the job
  await sleep(4000);

  const deadline = Date.now() + timeoutMs;
  const poll = 5000;

  while (Date.now() < deadline) {
    const emails = await fetchBrevoEmails(apiKey, toEmail);
    const match = emails.find(
      (e) =>
        e.email === toEmail &&
        e.subject.toLowerCase().includes(subjectKeyword.toLowerCase())
    );
    if (match) return match;
    await sleep(poll);
  }

  throw new Error(
    `No email with subject containing "${subjectKeyword}" arrived for ${toEmail} within ${timeoutMs / 1000}s`
  );
}

async function fetchBrevoEmails(apiKey, email) {
  return new Promise((resolve, reject) => {
    const path = `/v3/smtp/emails?email=${encodeURIComponent(email)}&sort=desc&limit=10`;
    const options = {
      hostname: 'api.brevo.com',
      path,
      method:  'GET',
      headers: { 'api-key': apiKey, accept: 'application/json' },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.transactionalEmails || []);
        } catch (e) {
          reject(new Error('Brevo response parse error: ' + data));
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { waitForEmail };
