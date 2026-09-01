#!/usr/bin/env node
// _dev/e2e/run.js — E2E test suite entry point
// Usage: node _dev/e2e/run.js   OR   npm run test:e2e

// Set a unique run ID so all test emails in this run share the same timestamp prefix
process.env.E2E_RUN_ID = String(Date.now());

const { chromium } = require('playwright');
const fs           = require('fs');
const path         = require('path');

const config = require('./config');
const { cleanupTestData } = require('./helpers/cleanup');

const allModules = [
  ['schedule-pages',  require('./tests/schedule-pages.test')],
  ['contact-form',    require('./tests/contact-form.test')],
  ['newsletter',      require('./tests/newsletter.test')],
  ['private-lessons', require('./tests/private-lessons.test')],
  ['free-trial',      require('./tests/free-trial.test')],
  ['free-trial-notify', require('./tests/free-trial-notify.test')],
  ['enrollment',      require('./tests/enrollment.test')],
  ['portal-account-note', require('./tests/portal-account-note.test')],
  ['form-validation', require('./tests/form-validation.test')],
  ['mobile-success-scroll', require('./tests/mobile-success-scroll.test')],
];

// E2E_ONLY=form-validation,newsletter runs just those modules. Most modules book
// real classes against production, so being able to run one in isolation is the
// difference between iterating on a form and generating cleanup work.
const only = (process.env.E2E_ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);
const testModules = only.length
  ? allModules.filter(([name]) => only.includes(name))
  : allModules;

if (only.length && testModules.length !== only.length) {
  const found = testModules.map(([n]) => n);
  throw new Error('E2E_ONLY names no such module: ' + only.filter((n) => !found.includes(n)).join(', '));
}

async function main() {
  console.log(`\n=== BE-TANGO E2E Test Suite ===`);
  console.log(`Run ID : ${config.RUN_ID}`);
  console.log(`Site   : ${config.SITE_URL}`);
  console.log(`Time   : ${new Date().toISOString()}\n`);

  // Pre-run cleanup: remove any orphaned test data from a previous crashed run
  console.log('→ Pre-run cleanup...');
  try {
    const cleaned = await cleanupTestData(config.CLEANUP_URL, config.CLEANUP_SECRET);
    console.log('  Cleaned:', JSON.stringify(cleaned));
  } catch (err) {
    console.error('  WARNING: Pre-run cleanup failed:', err.message);
  }

  // Launch browser
  // E2E_HEADED=1 opens a real window. Worth having rather than flipping the flag
  // by hand: the layout assertions in mobile-success-scroll are about what a
  // person can SEE, and a number in a log is a poor substitute for watching it.
  const browser = await chromium.launch({
    headless: !process.env.E2E_HEADED,
    slowMo: process.env.E2E_HEADED ? 40 : 0,
  });

  // SAFETY RAIL for local runs. js/api-config.js would point the page at the
  // local API on localhost, but no HTML page actually loads it, so crm-api.js
  // falls back to its hardcoded PRODUCTION baseURL. Without this, serving the
  // site locally and running the suite would fire real bookings at production.
  // Every test creates its page via browser.newPage(), so wrapping it is enough.
  if (process.env.E2E_API_BASE) {
    const origNewPage = browser.newPage.bind(browser);
    browser.newPage = async (...args) => {
      const page = await origNewPage(...args);
      await page.addInitScript((base) => {
        window.API_CONFIG = { baseURL: base };
      }, config.API_BASE);
      return page;
    };
    console.log(`  (local mode: page API pinned to ${config.API_BASE})`);
  }

  const allResults = [];
  let passed = 0;
  let failed = 0;

  for (const [modName, mod] of testModules) {
    try {
      const results = await mod.run(browser, config);
      for (const r of results) {
        allResults.push(r);
        if (r.passed) {
          passed++;
          console.log(`  ✓ ${r.name}`);
        } else {
          failed++;
          console.log(`  ✗ ${r.name}: ${r.error}`);
        }
      }
    } catch (err) {
      failed++;
      const name = modName || 'unknown-module';
      console.error(`  ✗ ${name} threw unexpectedly: ${err.message}`);
      allResults.push({ name, passed: false, error: err.message });
    }
  }

  await browser.close();

  // Post-run cleanup
  console.log('\n→ Post-run cleanup...');
  try {
    const cleaned = await cleanupTestData(config.CLEANUP_URL, config.CLEANUP_SECRET);
    console.log('  Cleaned:', JSON.stringify(cleaned));
  } catch (err) {
    console.error('  WARNING: Post-run cleanup failed:', err.message);
  }

  // Write report
  const report = {
    runId:     config.RUN_ID,
    timestamp: new Date().toISOString(),
    passed,
    failed,
    total:     passed + failed,
    results:   allResults,
  };

  const reportPath = path.join(__dirname, 'last-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n→ Report written to ${reportPath}`);

  // Summary
  console.log(`\n=== Results: ${passed}/${passed + failed} passed ===\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
