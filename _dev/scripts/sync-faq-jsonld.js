#!/usr/bin/env node
/*
 * Make every blog post's FAQPage JSON-LD say exactly what its visible FAQ says.
 *
 * Google's structured-data policy: FAQ markup must match content the reader can
 * see. The posts used to carry 6-9 questions in JSON-LD against 5 on the page,
 * often worded differently. The visible <details class="faq-item"> list is the
 * source of truth; this script rebuilds the FAQPage block from it and never
 * touches the visible HTML.
 *
 *   npm run faq:sync           rewrite out-of-sync blocks
 *   npm run faq:sync -- --check  exit 1 if any block is out of sync (no writes)
 *
 * Idempotent: re-run it after any merge that edits a post's FAQ copy.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const LANGS = ['en', 'fr', 'nl'];
const CHECK = process.argv.includes('--check');

const LD_RE = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;
const ITEM_RE = /<details class="faq-item"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g;

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(n);
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}
function toText(html) {
  return decode(html.replace(/<br\s*\/?>/gi, ' ').replace(/<\/(p|li)>/gi, ' ').replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

// Same layout the posts already use: one Question per line.
function render(items) {
  const rows = items.map(({ q, a }) =>
    '    { "@type": "Question", "name": ' + JSON.stringify(q) +
    ', "acceptedAnswer": { "@type": "Answer", "text": ' + JSON.stringify(a) + ' } }');
  return '\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n' +
    rows.join(',\n') + '\n  ]\n}\n';
}

function posts() {
  const out = [];
  for (const lang of LANGS) {
    const dir = path.join(ROOT, lang, 'blog');
    if (!fs.existsSync(dir)) continue;
    for (const slug of fs.readdirSync(dir)) {
      const f = path.join(dir, slug, 'index.html');
      if (fs.existsSync(f)) out.push(f);
    }
  }
  return out.sort();
}

let changed = 0, inSync = 0;
const warnings = [];
for (const file of posts()) {
  const rel = path.relative(ROOT, file);
  const html = fs.readFileSync(file, 'utf8');
  const items = [...html.matchAll(ITEM_RE)].map((m) => ({ q: toText(m[1]), a: toText(m[2]) }));

  let found = false, dirty = false;
  const next = html.replace(LD_RE, (whole, open, body, close) => {
    let data;
    try { data = JSON.parse(body); } catch (e) { warnings.push(`${rel}: unparseable JSON-LD (${e.message})`); return whole; }
    if (!data || data['@type'] !== 'FAQPage') return whole;
    found = true;
    if (!items.length) { warnings.push(`${rel}: FAQPage markup but no visible FAQ, left alone`); return whole; }
    const want = items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }));
    if (JSON.stringify(data.mainEntity) === JSON.stringify(want)) return whole;
    dirty = true;
    return open + render(items) + close;
  });

  if (!found) {
    if (items.length) warnings.push(`${rel}: visible FAQ but no FAQPage markup`);
    continue;
  }
  if (!dirty) { inSync++; continue; }
  changed++;
  if (CHECK) console.log(`out of sync: ${rel}`);
  else fs.writeFileSync(file, next);
}

warnings.forEach((w) => console.warn('warning: ' + w));
console.log(`${CHECK ? 'out of sync' : 'rewritten'}: ${changed}, already in sync: ${inSync}`);
if (CHECK && changed) process.exit(1);
