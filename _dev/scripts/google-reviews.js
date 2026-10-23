#!/usr/bin/env node
/*
 * Refresh the Google reviews on the site: the newest reviews in the home
 * carousels (EN/FR/NL) and the review count on every page that states it.
 *
 * Source: the DataForSEO Google Reviews API, newest 40 reviews. Logged-out
 * Google Maps only shows five hand-picked reviews and cannot sort by newest,
 * which is why this does not scrape Maps.
 *
 *   node _dev/scripts/google-reviews.js            # dry run: prints the plan
 *   node _dev/scripts/google-reviews.js --write    # rewrites the files
 *
 * Needs DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in the environment
 * (~/Sites/seo-audits/.env). Run on a schedule by
 * _dev/scripts/google-reviews-refresh.sh.
 *
 * Rules, all deliberate:
 * - Only 5-star reviews with text, and never one that names an instructor.
 *   The instructors stay anonymous on this site; a review that names them is
 *   skipped whole, not excerpted.
 * - Quotes stay in the language they were written in, as the hand-written
 *   cards do. Dates are "October 2026", never "2 days ago", which would be
 *   false within a week of publishing.
 * - Only the block between the `google-reviews:auto` markers is rewritten.
 *   The hand-picked cards after it are left alone, and a reviewer who already
 *   has a card there is not shown twice.
 * - The last line of stdout is a JSON summary. `safe: false` means a human
 *   should look before this is published (for example: the rating is no
 *   longer 5.0, so "5/5" on every page would be untrue).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const CID = '7397240013699561184'; // Be-Tango, Rue du Marais 68 (Maps 0x66a84699a6de36e0)
const API = 'https://api.dataforseo.com/v3/business_data/google/reviews';
const SHOWN = 6;
const MIN_CHARS = 30;
const MAX_CHARS = 300;
const NAMES = /\b(sven|svenn|sonja|sonya|sonia|breynaert)\b/i;
const START = '<!-- google-reviews:auto:start -->';
const END = '<!-- google-reviews:auto:end -->';

const PAGES = {
  'en/index.html': { locale: 'en-GB', icon: '/images/google-g-icon.svg', more: 'Read full review on Google', q: 'be-tango+brussels', aria: true },
  'fr/index.html': { locale: 'fr-BE', icon: '../images/google-g-icon.svg', more: "Lire l'avis complet sur Google", q: 'be-tango+bruxelles', aria: false },
  'nl/index.html': { locale: 'nl-BE', icon: '../images/google-g-icon.svg', more: 'Lees de volledige review op Google', q: 'be-tango+brussels', aria: false },
};
const COLOURS = ['#4285f4', '#ea4335', '#0f9d58', '#8b6f47', '#7b1fa2', '#f4511e', '#1a73e8', '#188038'];

const write = process.argv.includes('--write');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(method, url, body) {
  const { DATAFORSEO_LOGIN: user, DATAFORSEO_PASSWORD: pass } = process.env;
  if (!user || !pass) throw new Error('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD are not set');
  const res = await fetch(url, {
    method,
    headers: { Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'), 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url}: HTTP ${res.status}`);
  return res.json();
}

// Reviews is a task queue: post, then poll. 40601/40602 mean "still queued".
async function fetchReviews() {
  const post = await api('POST', `${API}/task_post`, [{ cid: CID, location_code: 2056, language_code: 'en', depth: 40, sort_by: 'newest' }]);
  const task = post.tasks?.[0];
  if (task?.status_code !== 20100) throw new Error(`task_post: ${task?.status_code} ${task?.status_message}`);
  for (let i = 0; i < 60; i++) {
    await sleep(15000);
    const got = (await api('GET', `${API}/task_get/${task.id}`)).tasks?.[0];
    if (got?.status_code === 20000) return got.result[0];
    if (![40601, 40602].includes(got?.status_code)) throw new Error(`task_get: ${got?.status_code} ${got?.status_message}`);
  }
  throw new Error('task_get: still queued after 15 minutes');
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Cut at the last sentence end that fits; the card then links to the full review.
function shorten(text) {
  if (text.length <= MAX_CHARS) return { text, cut: false };
  const head = text.slice(0, MAX_CHARS);
  const end = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  return { text: end > MIN_CHARS ? head.slice(0, end + 1) + '..' : head.replace(/\s+\S*$/, '') + '...', cut: true };
}

function eligible(items, alreadyShown) {
  const seen = new Set(alreadyShown);
  const out = [];
  for (const it of items) {
    const original = (it.original_review_text || it.review_text || '').replace(/\s+/g, ' ').trim();
    const translated = (it.review_text || '').replace(/\s+/g, ' ').trim();
    const name = (it.profile_name || '').trim();
    if (it.rating?.value !== 5 || !name || original.length < MIN_CHARS) continue;
    if (NAMES.test(original) || NAMES.test(translated)) continue;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    // DataForSEO sends "2026-10-20 14:03:22 +00:00", which Date cannot parse.
    // Only the month is shown, so the day is enough.
    const when = new Date(`${String(it.timestamp).slice(0, 10)}T12:00:00Z`);
    if (isNaN(when)) throw new Error(`unreadable review date "${it.timestamp}" for ${name}`);
    out.push({ name, when, ...shorten(original) });
  }
  return out;
}

function card(r, page, i) {
  const date = r.when.toLocaleDateString(page.locale, { month: 'long', year: 'numeric' });
  const month = date.charAt(0).toUpperCase() + date.slice(1);
  const aria = page.aria ? ` aria-label="Read more of ${esc(r.name)}'s review"` : '';
  const link = r.cut ? `\n                  <a href="https://www.google.com/search?q=${page.q}" class="read-more" target="_blank" rel="noopener noreferrer"${aria}>${page.more}</a>` : '';
  return `              <div class="review-card">
                <div class="review-header">
                  <div class="review-avatar" style="background-color: ${COLOURS[i % COLOURS.length]};">${esc([...r.name][0].toUpperCase())}</div>
                  <div class="review-meta">
                    <div class="review-name">${esc(r.name)}</div>
                    <div class="review-date">${month}</div>
                  </div>
                  <img src="${page.icon}" alt="Google" class="review-google-icon" width="20" height="20" loading="lazy">
                </div>
                <div class="review-stars">★★★★★ <span class="verified">✓</span></div>
                <div class="review-text">
                  ${esc(r.text)}${link}
                </div>
              </div>
`;
}

// Names on hand-picked cards outside the auto block, so nobody appears twice.
function staticNames(html) {
  const outside = html.slice(0, html.indexOf(START)) + html.slice(html.indexOf(END));
  return [...outside.matchAll(/class="review-name">([^<]+)</g)].map(m => m[1].trim().toLowerCase());
}

const COUNT_FILES = () => execFileSync('git', ['ls-files', '*.html', 'llms.txt', 'llms-full.txt'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(f => f && !f.startsWith('_dev/') && !f.startsWith('blog-backup/'));

async function main() {
  const en = fs.readFileSync(path.join(ROOT, 'en/index.html'), 'utf8');
  const oldCount = Number((en.match(/Based on <strong>(\d+) reviews<\/strong>/) || [])[1]);
  if (!oldCount) throw new Error('could not read the current review count from en/index.html');

  const result = await fetchReviews();
  const rating = result.rating?.value;
  const newCount = result.reviews_count;
  const problems = [];
  if (rating !== 5) problems.push(`Google rating is ${rating}, not 5.0 — every page says 5/5`);
  if (!(newCount > 0)) problems.push(`Google returned no review count (${newCount})`);
  else if (newCount < oldCount) problems.push(`review count went DOWN: ${oldCount} -> ${newCount}`);
  else if (newCount - oldCount > 150) problems.push(`review count jumped by ${newCount - oldCount}: ${oldCount} -> ${newCount}`);

  const changed = new Set();
  const shown = {};
  for (const [file, page] of Object.entries(PAGES)) {
    const abs = path.join(ROOT, file);
    const html = fs.readFileSync(abs, 'utf8');
    if (html.split(START).length !== 2 || html.split(END).length !== 2) throw new Error(`${file}: expected exactly one ${START} … ${END} block`);
    const picks = eligible(result.items || [], staticNames(html)).slice(0, SHOWN);
    if (picks.length < 3) problems.push(`${file}: only ${picks.length} usable reviews`);
    shown[file] = picks.map(r => r.name);
    const block = START + '\n' + picks.map((r, i) => card(r, page, i)).join('\n') + '              ' + END;
    const next = html.slice(0, html.indexOf(START)) + block + html.slice(html.indexOf(END) + END.length);
    if (next !== html) { changed.add(file); if (write) fs.writeFileSync(abs, next); }
  }

  let countMentions = 0;
  if (newCount > 0 && newCount !== oldCount) {
    // Only a number followed, within two words, by a review word. A bare
    // number match would also rewrite any unrelated "189" (a price, a size,
    // a colour like #374151) the day the count happens to equal it.
    const re = new RegExp(`(?<![#\\w.,])${oldCount}(?=\\+?(?:</strong>)?\\s+(?:[^\\s<]+\\s+){0,2}?(?:Google|reviews?|avis|recensies|beoordelingen|vijfsterrenrecensies|five-star|verified|vérifiés|geverifieerde)\\b)`, 'g');
    for (const file of COUNT_FILES()) {
      const abs = path.join(ROOT, file);
      const text = fs.readFileSync(abs, 'utf8');
      const n = (text.match(re) || []).length;
      if (!n) continue;
      countMentions += n;
      changed.add(file);
      if (write) fs.writeFileSync(abs, text.replace(re, String(newCount)));
    }
    if (!countMentions) problems.push(`found no mention of the old count ${oldCount} to update`);
  }

  const summary = { write, oldCount, newCount, rating, countMentions, shown, changedFiles: [...changed].sort(), safe: problems.length === 0, problems };
  for (const [file, names] of Object.entries(shown)) console.log(`${file}: ${names.join(', ')}`);
  console.log(`count ${oldCount} -> ${newCount} (${countMentions} mentions), rating ${rating}, ${changed.size} file(s) ${write ? 'written' : 'would change'}`);
  for (const p of problems) console.log('PROBLEM: ' + p);
  console.log(JSON.stringify(summary));
}

main().catch(err => { console.error(err.message); process.exit(1); });
