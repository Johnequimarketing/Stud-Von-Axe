#!/usr/bin/env node
/* The checks that cannot be made one page at a time.
 *
 * scripts/audit-homepage.mjs holds each page to the rules. This one holds the
 * pages to each other and to the data they were built from: the same horse
 * named the same way everywhere, every figure on a page traceable to
 * horses-data.js, the same component the same size wherever it appears.
 *
 * Asked for on 30 Aug: "of alle layout klopt, consistent is, alle informatie
 * klopt, alle teksten kloppen".
 *
 * Run: node scripts/audit-site.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib/shell.mjs';

const HORSES = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();
const DIRS = { broodmare: 'breeding-mares', foal: 'foals', embryo: 'embryos', sport: 'sport-horses' };

let failures = 0, checks = 0;
const pass = (m) => { checks++; console.log(`  \x1b[32m✓ pass\x1b[0m  ${m}`); };
const fail = (m, lines = []) => {
  checks++; failures++;
  console.log(`  \x1b[31m✗ FAIL\x1b[0m  ${m}`);
  lines.slice(0, 6).forEach((l) => console.log(`           ${l}`));
  if (lines.length > 6) console.log(`           …and ${lines.length - 6} more`);
};
const note = (m) => console.log(`  \x1b[33m! note\x1b[0m  ${m}`);

const read = (p) => readFileSync(join(root, p), 'utf-8');
const textOf = (html) => html
  .replace(/<script>[\s\S]*?<\/script>/g, '')
  .replace(/<style>[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#039;|&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&times;/g, 'x').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

/* Every horse page that exists, with the record it was built from. */
const pages = HORSES
  .map((h) => ({ h, path: `${DIRS[h.category]}/${h.slug}.html` }))
  .filter((p) => existsSync(join(root, p.path)))
  .map((p) => ({ ...p, src: read(p.path), }));
console.log(`\n\x1b[1mAcross ${pages.length} horse pages\x1b[0m\n`);

/* ── 1. every figure on a page comes from the record ───────────────────
   A year, a height or a studbook printed on a page and not in the data is
   either a typo or an invention, and both look exactly like a fact. */
const wrong = [];
for (const { h, path, src } of pages) {
  const t = textOf(src);
  /* On a cross the year field is not a year: five of them read FROZEN EMBRYO,
     which the page states as "Frozen embryo" and "On implantation" rather than
     printing the raw field. A year is checked as a year. */
  const raw = (h.year || '').trim();
  const isYear = /^\d{4}$/.test(raw);
  const isDate = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(raw);
  /* A date is shown written out, so what must appear on the page is its year;
     a year must appear as itself. On a cross the field is a stage, not a
     date. */
  const year = isDate ? (raw.split('/')[2].length === 2 ? '20' + raw.split('/')[2] : raw.split('/')[2]) : raw;
  if ((isYear || isDate) && !t.includes(year)) wrong.push(`${path}: ${year} is in the data, not on the page`);
  if (raw && !isYear && !isDate && h.category !== 'embryo') wrong.push(`${path}: year field is "${raw}", neither a year nor a date`);
  if (h.height && !t.includes(h.height)) wrong.push(`${path}: height ${h.height} missing`);
  if (h.studbook && !t.includes(h.studbook)) wrong.push(`${path}: studbook ${h.studbook} missing`);
}
wrong.length
  ? fail(`${wrong.length} figure(s) in the data that do not appear on the page`, wrong)
  : pass('every year, height and studbook in the data appears on its page');

/* ── 2. no page states a figure the data does not have ─────────────────
   The other direction, and the more dangerous one: a height on a page for a
   horse whose record has none was typed by somebody. */
const invented = [];
for (const { h, path, src } of pages) {
  const t = textOf(src);
  const shown = [...t.matchAll(/\b(\d{3}) cm\b/g)].map((m) => m[0]);
  for (const s of new Set(shown)) {
    if (!h.height || !h.height.includes(s.replace(' cm', ''))) invented.push(`${path}: shows "${s}", record says "${h.height || 'nothing'}"`);
  }
}
invented.length
  ? fail(`${invented.length} height(s) on a page that the record does not have`, invented)
  : pass('no page states a height its record does not have');

/* ── 3. one horse, one spelling ────────────────────────────────────────
   Their site spells Berghoeve two ways and we keep their spelling, but ours
   has to be the same everywhere or the same horse reads as two. */
const spellings = new Map();
for (const { h, path, src } of pages) {
  const m = src.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!m) continue;
  const shown = textOf(m[1]).trim();
  if (!spellings.has(h.slug)) spellings.set(h.slug, new Set());
  spellings.get(h.slug).add(shown);
  /* And the same name as it appears in the archive card that links here. */
  const archive = read(`${DIRS[h.category]}/index.html`);
  const card = archive.match(new RegExp(`href="/${DIRS[h.category]}/${h.slug}"[\\s\\S]{0,600}?hz__name">([^<]*)`));
  if (card) spellings.get(h.slug).add(card[1].trim());
}
const split = [...spellings].filter(([, set]) => set.size > 1);
split.length
  ? fail(`${split.length} horse(s) spelled two ways`, split.map(([slug, set]) => `${slug}: ${[...set].join('  |  ')}`))
  : pass('every horse is spelled the same on its page and on its card');

/* ── 4. the same component is the same size everywhere ─────────────────
   The stylesheet is lifted whole from index.html, so a component that differs
   between two pages means somebody redefined it downstream. */
const KEY = ['--card-radius', '--plate-radius', '--ctl-radius', '--wrap', '--gutter'];
const tokensOf = (src) => {
  const root = (src.match(/:root\s*\{[\s\S]*?\n  \}/) || [''])[0];
  return KEY.map((k) => {
    const m = root.match(new RegExp(`${k}:\\s*([^;]+);`));
    return `${k}=${m ? m[1].trim() : 'absent'}`;
  }).join(' ');
};
const shapes = new Map();
for (const { path, src } of pages) {
  const sig = tokensOf(src);
  if (!shapes.has(sig)) shapes.set(sig, []);
  shapes.get(sig).push(path);
}
shapes.size > 1
  ? fail(`${shapes.size} different sets of layout tokens across the pages`,
         [...shapes].map(([sig, list]) => `${list.length} page(s): ${sig}`))
  : pass('all pages carry one set of layout tokens');

/* ── 5. every section that exists is built the same way ────────────────
   A section present on some pages and absent on others is a decision; a
   section present with two different structures is drift. */
const SECTIONS = ['hp', 'ped', 'hvid', 'hgal', 'ask', 'hmore', 'abst', 'eh', 'ln'];
const counts = {};
for (const { h, src } of pages) {
  for (const cls of SECTIONS) {
    const has = new RegExp(`<section class="${cls}[ "]`).test(src);
    counts[cls] = counts[cls] || { yes: 0, no: 0, cats: new Set() };
    counts[cls][has ? 'yes' : 'no']++;
    if (has) counts[cls].cats.add(h.category);
  }
}
note('sections, and which categories carry them:');
for (const [cls, c] of Object.entries(counts)) {
  if (!c.yes) continue;
  console.log(`           .${cls.padEnd(6)} on ${String(c.yes).padStart(2)} of ${pages.length}  (${[...c.cats].join(', ')})`);
}

/* ── 6. every card in an archive reaches a page that exists ────────────*/
const dead = [];
for (const dir of Object.values(DIRS)) {
  const src = read(`${dir}/index.html`);
  for (const m of src.matchAll(new RegExp(`href="/${dir}/([a-z0-9-]+)"`, 'g'))) {
    if (!existsSync(join(root, dir, `${m[1]}.html`))) dead.push(`${dir}/index.html -> /${dir}/${m[1]}`);
  }
}
dead.length
  ? fail(`${dead.length} card(s) linking to a page that does not exist`, dead)
  : pass('every card in every archive reaches a page that exists');

/* ── 7. the count an archive states is the number of cards it has ──────*/
const miscount = [];
for (const [cat, dir] of Object.entries(DIRS)) {
  const src = read(`${dir}/index.html`);
  const cards = [...src.matchAll(new RegExp(`href="/${dir}/[a-z0-9-]+"`, 'g'))].length;
  const inData = HORSES.filter((h) => h.category === cat).length;
  if (cards !== inData) miscount.push(`${dir}: ${cards} card(s), ${inData} in the data`);
}
miscount.length
  ? fail(`${miscount.length} archive(s) whose card count does not match the data`, miscount)
  : pass('every archive shows exactly the horses in its category');

console.log('\n══════════════════════════════════════════════');
console.log(`${failures} failure(s) across ${checks} site-wide check(s)\n`);
process.exit(failures ? 1 : 0);
