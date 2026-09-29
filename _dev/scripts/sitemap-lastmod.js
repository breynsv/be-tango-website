#!/usr/bin/env node
/*
 * Set every <lastmod> in sitemap.xml to the date that page's index.html last
 * changed in git (committer date, YYYY-MM-DD). A file with uncommitted edits
 * gets today's date.
 *
 * Why: all 111 entries used to say 2026-08-11. Identical dates tell Google the
 * field carries no information, so it stops reading it.
 *
 *   npm run sitemap:lastmod
 *
 * Commits that change every page mechanically (markup, meta tags) and not
 * what a reader sees can opt out with a `Lastmod: skip` trailer in the commit
 * message; the date then comes from the newest commit without it. Otherwise
 * one sitewide tweak would reset all 111 dates to the same day again.
 *
 * Idempotent and merge-safe: it only rewrites <lastmod> inside the <url>
 * blocks that exist, so after a merge that adds or removes pages just run it
 * again. Run it after committing page changes (a dirty file reads as "today").
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const ORIGIN = 'https://www.be-tango.be';

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

function fileFor(loc) {
  if (!loc.startsWith(ORIGIN + '/')) return null;
  let p = decodeURIComponent(loc.slice(ORIGIN.length + 1));
  if (p === '' || p.endsWith('/')) p += 'index.html';
  return p;
}

// Newest commit touching the file that is not marked `Lastmod: skip`.
function lastRealChange(rel) {
  const log = git('log', '--format=%cs%x09%(trailers:key=Lastmod,valueonly,separator=%x2C)%x00', '--', rel);
  for (const rec of log.split('\0')) {
    const [date, trailer = ''] = rec.trim().split('\t');
    if (date && !/\bskip\b/i.test(trailer)) return date;
  }
  return '';
}

const today = new Date().toISOString().slice(0, 10);
let xml = fs.readFileSync(SITEMAP, 'utf8');
let updated = 0, same = 0;
const problems = [];

xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (whole, inner) => {
  const loc = (inner.match(/<loc>\s*([^<\s]+)\s*<\/loc>/) || [])[1];
  const rel = loc && fileFor(loc);
  if (!rel || !fs.existsSync(path.join(ROOT, rel))) {
    problems.push(`no file for ${loc || '(missing <loc>)'} - left as is`);
    return whole;
  }
  const dirty = git('status', '--porcelain', '--', rel) !== '';
  const date = dirty ? today : lastRealChange(rel);
  if (!date) { problems.push(`${rel} has no git history - left as is`); return whole; }

  let next;
  if (/<lastmod>[^<]*<\/lastmod>/.test(inner)) {
    next = whole.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${date}</lastmod>`);
  } else {
    const indent = (inner.match(/\n([ \t]*)<loc>/) || [, '    '])[1];
    next = whole.replace(/\n?([ \t]*)<\/url>$/, `\n${indent}<lastmod>${date}</lastmod>\n$1</url>`);
  }
  if (next === whole) same++; else updated++;
  return next;
});

fs.writeFileSync(SITEMAP, xml);
problems.forEach((p) => console.warn('warning: ' + p));
console.log(`sitemap.xml lastmod: ${updated} updated, ${same} unchanged`);
