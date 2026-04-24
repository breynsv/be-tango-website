// _dev/e2e/helpers/cleanup.js
const https = require('https');
const url   = require('url');

async function cleanupTestData(cleanupUrl, secret) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(cleanupUrl);
    const options = {
      hostname: parsed.hostname,
      path:     parsed.path,
      method:   'POST',
      headers:  {
        'X-E2E-Secret': secret,
        'Content-Type': 'application/json',
        'Content-Length': '0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Cleanup endpoint returned HTTP ${res.statusCode}: ${data}`));
        }
        try {
          const body = JSON.parse(data);
          resolve(body.data);
        } catch (e) {
          reject(new Error('Cleanup response was not JSON: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

module.exports = { cleanupTestData };
