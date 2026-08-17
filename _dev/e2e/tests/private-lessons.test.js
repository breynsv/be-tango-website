// _dev/e2e/tests/private-lessons.test.js
const { SITE_URL, testEmail } = require('../config');
const { formSubmitSlot } = require('../helpers/rate-limit');

async function run(browser) {
  const results = [];
  const page = await browser.newPage();
  const email = testEmail('private-lessons');

  try {
    await page.goto(SITE_URL + '/en/tango-classes/private/', {
      waitUntil: 'networkidle',
      timeout: 20000,
    });

    await page.fill('#private-lesson-form [name="first_name"]', 'E2E');
    await page.fill('#private-lesson-form [name="last_name"]', 'Test');
    await page.fill('#private-lesson-form [name="email"]', email);
    await page.fill('#private-lesson-form [name="phone"]', '+32499000000');
    await page.selectOption('#private-lesson-form [name="lesson_type"]', 'private_solo_couple');
    await page.fill(
      '#private-lesson-form [name="message"]',
      'Automated E2E test — please ignore this message.'
    );

    await formSubmitSlot('private-lessons');
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/v1/private-lessons') && res.request().method() === 'POST',
        { timeout: 15000 }
      ),
      page.click('#private-lesson-form button[type="submit"]'),
    ]);

    if (response.status() !== 200 && response.status() !== 201) {
      const body = await response.text();
      throw new Error(`API returned HTTP ${response.status()}: ${body}`);
    }

    await page.waitForSelector('#pl-success', { state: 'visible', timeout: 5000 });

    results.push({ name: 'private-lessons:en', passed: true, error: null });
  } catch (err) {
    await page.screenshot({ path: '_dev/e2e/screenshots/private-lessons.png', fullPage: true });
    results.push({ name: 'private-lessons:en', passed: false, error: err.message });
  } finally {
    await page.close();
  }

  return results;
}

module.exports = { run };
