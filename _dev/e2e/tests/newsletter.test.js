// _dev/e2e/tests/newsletter.test.js
const { SITE_URL, testEmail } = require('../config');
const { formSubmitSlot } = require('../helpers/rate-limit');

const VARIANTS = [
  { lang: 'en', path: '/en/', formId: 'homeNewsletterForm', successId: 'homeNewsletterFormSuccess' },
  { lang: 'fr', path: '/fr/', formId: 'homeNewsletterForm', successId: 'homeNewsletterFormSuccess' },
  { lang: 'nl', path: '/nl/', formId: 'homeNewsletterForm', successId: 'homeNewsletterFormSuccess' },
];

async function run(browser) {
  const results = [];

  for (const { lang, path, formId, successId } of VARIANTS) {
    const page = await browser.newPage();
    const email = testEmail(`newsletter-${lang}`);

    try {
      await page.goto(SITE_URL + path, { waitUntil: 'networkidle', timeout: 20000 });

      // Scroll newsletter form into view (it may be below the fold)
      await page.locator(`#${formId}`).scrollIntoViewIfNeeded();

      await page.fill(`#${formId} [name="email"]`, email);

      await formSubmitSlot('newsletter');
      const [response] = await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes('/newsletter/subscribe') && res.request().method() === 'POST',
          { timeout: 15000 }
        ),
        page.click(`#${formId} button.newsletter-submit`),
      ]);

      if (response.status() !== 200 && response.status() !== 201) {
        const body = await response.text();
        throw new Error(`API returned HTTP ${response.status()}: ${body}`);
      }

      await page.waitForSelector(`#${successId}`, { state: 'visible', timeout: 5000 });

      results.push({ name: `newsletter:${lang}`, passed: true, error: null });
    } catch (err) {
      await page.screenshot({ path: `_dev/e2e/screenshots/newsletter-${lang}.png`, fullPage: true });
      results.push({ name: `newsletter:${lang}`, passed: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  return results;
}

module.exports = { run };
