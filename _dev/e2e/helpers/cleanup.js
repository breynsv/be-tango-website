// _dev/e2e/helpers/cleanup.js
const https = require('https');
const http  = require('http');

async function cleanupTestData(cleanupUrl, secret) {
  return new Promise((resolve, reject) => {
    // Pick the transport from the URL rather than assuming TLS — a local run
    // (E2E_API_BASE=http://…) would otherwise dial port 443 and ECONNREFUSED,
    // silently skipping cleanup and leaving test rows behind.
    const parsed = new URL(cleanupUrl);
    const isHttps = parsed.protocol === 'https:';
    const transport = isHttps ? https : http;
    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || (isHttps ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method:   'POST',
      headers:  {
        'X-E2E-Secret': secret,
        'Content-Type': 'application/json',
        'Content-Length': '0',
      },
    };

    const req = transport.request(options, (res) => {
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
