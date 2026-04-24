// _dev/e2e/tests/contact-form.test.js
const { SITE_URL, testEmail } = require('../config');

const VARIANTS = [
  { lang: 'en', path: '/en/contact/' },
  { lang: 'fr', path: '/fr/contactez-nous/' },
  { lang: 'nl', path: '/nl/contacteer-ons/' },
];

async function run(browser) {
  const results = [];

  for (const { lang, path } of VARIANTS) {
    const page = await browser.newPage();
    const email = testEmail(`contact-${lang}`);

    try {
      await page.goto(SITE_URL + path, { waitUntil: 'networkidle', timeout: 20000 });

      await page.fill('#first_name', 'E2E');
      await page.fill('#last_name', 'Test');
      await page.fill('#email', email);
      await page.fill('#phone', '+32499000000');
      await page.selectOption('#topic', 'general_question');
      await page.fill('#message', 'Automated E2E test — please ignore this message.');

      // Submit and wait for API response + success element
      const [response] = await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes('/api/v1/contact') && res.request().method() === 'POST',
          { timeout: 15000 }
        ),
        page.click('#contactForm button[type="submit"]'),
      ]);

      if (response.status() !== 200 && response.status() !== 201) {
        const body = await response.text();
        throw new Error(`API returned HTTP ${response.status()}: ${body}`);
      }

      // Wait for success UI
      await page.waitForSelector('#contact-success', { state: 'visible', timeout: 5000 });

      results.push({ name: `contact-form:${lang}`, passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: `_dev/e2e/screenshots/contact-form-${lang}.png`, fullPage: true });
      results.push({ name: `contact-form:${lang}`, passed: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  return results;
}

module.exports = { run };
