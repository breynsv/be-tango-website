// _dev/e2e/helpers/free-trial-state.js
//
// The free-trial page has TWO correct live states, and which one you get is a
// question of the calendar, not of the build.
//
// BE-TANGO runs free trial lessons in January and September, right before each
// 14-week cycle starts. The rest of the year — roughly eight months of it — there
// is nothing to book, `/api/v1/free-trials/available` answers `{"data":[]}`, and
// js/free-trial.js deliberately turns the page into its "keep me informed" form:
// it hides #class-date, drops its `required`, and sets form.dataset.mode="notify".
// That is the designed behaviour, not a fault.
//
// Until this helper existed every free-trial test hard-assumed dates were on
// offer, so the suite went red the moment the September trials finished (run
// 35608169402, 2026-09-21: five failures, all of them this) and would have stayed
// red until January. A suite that is red for two thirds of the year reports
// nothing — nobody can tell the day it goes red for a real reason.
//
// So: ask the PAGE which state it settled into, rather than asking the API and
// hoping the browser saw the same answer, and let each test assert whichever
// state is live. The one thing that must never be mistaken for "no dates" is a
// broken API — that renders .ft-empty--error and is reported as 'error' here so
// callers fail loudly on it.

const STATES = { DATES: 'dates', NOTIFY: 'notify', ERROR: 'error' };

/**
 * Wait until the free-trial page has finished loading its dates and report which
 * state it landed in. Must be called BEFORE ticking the "none of these dates
 * work" checkbox, which also sets form.dataset.mode to "notify".
 *
 * @returns {Promise<'dates'|'notify'|'error'>}
 */
async function freeTrialState(page, timeout = 15000) {
  let handle;
  try {
    handle = await page.waitForFunction(
      () => {
        const form = document.getElementById('free-trial-form');
        if (!form) return null;
        if (document.querySelector('.ft-empty--error')) return 'error';
        const sel = document.getElementById('class-date');
        // More than the placeholder means the API returned bookable dates.
        if (sel && sel.options.length > 1) return 'dates';
        if (form.dataset.mode === 'notify') return 'notify';
        return null;
      },
      null,
      { timeout }
    );
  } catch (err) {
    throw new Error(
      `the free-trial page never settled into a known state within ${timeout}ms — it showed neither ` +
      `bookable dates, nor the "keep me informed" empty state, nor the API-error panel. ` +
      `Something in the load path is broken, which is NOT the same as having no dates on offer.`
    );
  }
  const state = await handle.jsonValue();
  if (state === STATES.ERROR) {
    throw new Error(
      'the free-trial page rendered its API-error panel (.ft-empty--error) — /free-trials/available ' +
      'did not answer usefully. This is a real outage, not an empty calendar.'
    );
  }
  return state;
}

/** A one-line reason for a skip, so the log says WHY and not just that it skipped. */
const NO_DATES_REASON =
  'no free trial dates are on offer right now — the page is in "keep me informed" mode, ' +
  'which this sub-test cannot exercise (booking needs a real date, and none can be invented on production)';

module.exports = { freeTrialState, STATES, NO_DATES_REASON };
