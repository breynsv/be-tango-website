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

const testModules = [
  require('./tests/schedule-pages.test'),
  require('./tests/contact-form.test'),
  require('./tests/newsletter.test'),
  require('./tests/private-lessons.test'),
  require('./tests/free-trial.test'),
  require('./tests/enrollment.test'),
];

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
  const browser = await chromium.launch({ headless: true });

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

  for (const mod of testModules) {
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
      const name = mod.constructor?.name || 'unknown-module';
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
