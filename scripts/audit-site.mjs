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

const HARVESTED = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();
/* The stallions are hand kept rather than harvested, but they are built by
   the same script into the same shape, so the audit has to see them or the
   thirteen ICSI pages would go unchecked. That is the fault this project has
   already made twice: a page nobody listed is a page nobody audits. */
const SEMEN = new Function(readFileSync(join(root, 'semen-data.js'), 'utf-8') + '; return SEMEN;')();
const HORSES = [...HARVESTED, ...SEMEN];
const DIRS = { broodmare: 'breeding-mares', foal: 'foals', embryo: 'embryos', sport: 'sport-horses',
               stallion: 'icsi-semen' };

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
  /* Three archives name a card in .hz__name and two in .ec__name, and the
     check only ever looked at the first, so the crosses and the stallions
     were never compared with their own pages. Read either, and read it as
     text, because a cross card carries an em inside the name. */
  const card = archive.match(new RegExp(
    `href="/${DIRS[h.category]}/${h.slug}"[\\s\\S]{0,600}?(?:hz|ec)__name">([\\s\\S]*?)</h[23]>`));
  if (card) spellings.get(h.slug).add(textOf(card[1]).trim());
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

/* ── the head a search engine and a share sheet read ───────────────────
   31 Aug. Every page had a title, a description and a canonical from the
   start, and two things behind them were wrong for months without showing:
   fifty of the fifty nine og:images were smaller than the 1200 by 630 the
   networks want, so a pasted link showed a thumbnail rather than the horse,
   and eighty eight of the eighty nine pages had no twitter:card, which is the
   one tag that decides whether X draws the wide picture at all.
   A share card is invisible from inside the site. It only shows in somebody
   else's chat window, which is exactly why it needs a check. */
{
  const dir = (d) => existsSync(join(root, d)) ? readdirSync(join(root, d), { withFileTypes: true }) : [];
  const walk = (d) => dir(d).flatMap((e) => {
    const rel = d ? `${d}/${e.name}` : e.name;
    if (e.isDirectory()) {
      return /^(deploy|_archive|_to_delete|content|node_modules|assets|scripts|logs|v2-.*|\..*)$/.test(e.name)
        ? [] : walk(rel);
    }
    return e.name.endsWith('.html') && !e.name.startsWith('_') ? [rel] : [];
  });
  const public_ = walk('').filter((f) => !/<meta name="internal-doc"/.test(read(f)));
  const grab = (h, re) => (h.match(re) || [, ''])[1];

  const missing = [], small = [], noCard = [], longTitle = [], badDesc = [];
  const titles = new Map(), descs = new Map();
  for (const f of public_) {
    const h = read(f);
    const title = grab(h, /<title>([\s\S]*?)<\/title>/).trim();
    const desc = grab(h, /<meta name="description" content="([^"]*)"/);
    const img = grab(h, /<meta property="og:image" content="([^"]*)"/).replace(/^https?:\/\/[^/]+\//, '');
    if (!/twitter:card/.test(h)) noCard.push(f);
    if (title.length > 62) longTitle.push(`${f}: ${title.length} characters`);
    if (desc.length < 70 || desc.length > 160) badDesc.push(`${f}: ${desc.length} characters`);
    (titles.get(title) || titles.set(title, []).get(title)).push(f);
    (descs.get(desc) || descs.set(desc, []).get(desc)).push(f);
    if (!img || !existsSync(join(root, img))) { missing.push(`${f}: ${img || 'none'}`); continue; }
    /* The size is read out of the JPEG itself rather than trusted: the tags
       claim 1200 by 630 and a tag cannot resize a picture. */
    const buf = readFileSync(join(root, img));
    let i = 2, w = 0, ht = 0;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        ht = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); break;
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    if (w < 1200 || ht < 630) small.push(`${f}: ${img} is ${w}x${ht}`);
  }
  const dup = (m, what) => [...m].filter(([, v]) => v.length > 1)
    .map(([k, v]) => `${v.length} pages share this ${what}: ${String(k).slice(0, 50)}`);

  missing.length ? fail(`${missing.length} page(s) whose share picture is not on disk`, missing)
    : pass(`every page names a share picture that exists`);
  small.length ? fail(`${small.length} share picture(s) under 1200x630`, small)
    : pass(`every share picture is at least 1200x630`);
  noCard.length ? fail(`${noCard.length} page(s) with no twitter:card`, noCard)
    : pass('every page carries a twitter card');
  longTitle.length ? fail(`${longTitle.length} title(s) over 62 characters`, longTitle)
    : pass('every title fits a search result');
  badDesc.length ? fail(`${badDesc.length} description(s) outside 70 to 160 characters`, badDesc)
    : pass('every description is between 70 and 160 characters');
  const dups = [...dup(titles, 'title'), ...dup(descs, 'description')];
  dups.length ? fail(`${dups.length} title(s) or description(s) used twice`, dups)
    : pass(`all ${public_.length} titles and descriptions are unique`);
}

/* ── 8. the sitemap lists every public page ────────────────────────────*/
if (existsSync(join(root, 'sitemap.xml'))) {
  const map = read('sitemap.xml');
  const listed = new Set([...map.matchAll(/<loc>[^<]*?([^<]*)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/'));
  const onDisk = [];
  const walk = (dir) => {
    for (const name of readdirSync(join(root, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${name.name}` : name.name;
      if (name.isDirectory()) {
        if (/^(deploy|_archive|_to_delete|content|node_modules|assets|scripts|logs|v2-.*|\..*)$/.test(name.name)) continue;
        walk(rel);
      } else if (name.name.endsWith('.html')) {
        if (/<meta name="internal-doc"/.test(read(rel))) continue;
        /* The 404 is public and audited like any page, and it is the one page
           that must not be in the sitemap: that file says come and fetch this. */
        if (rel === '404.html') continue;
        onDisk.push(rel === 'index.html' ? '/' : '/' + rel.replace(/\/index\.html$/, '').replace(/\.html$/, ''));
      }
    }
  };
  walk('');
  const missing = onDisk.filter((u) => !listed.has(u));
  const extra = [...listed].filter((u) => !onDisk.includes(u));
  missing.length || extra.length
    ? fail(`the sitemap and the pages on disk disagree`,
           [...missing.map((u) => `on disk, not in the sitemap: ${u}`),
            ...extra.map((u) => `in the sitemap, not on disk: ${u}`)])
    : pass(`the sitemap lists all ${onDisk.length} public pages and nothing else`);
} else {
  fail('there is no sitemap.xml');
}

/* ── Belgium is a place, not a place of business ───────────────────────
   Mark, 3 Sep, after the client took Lanaken off the contact map: Belgium
   is where the foals are raised and nothing more. They have no second
   office there, no address a buyer can drive to and nobody to write to.
   The site had drifted the other way in six places at once, calling it
   "our Belgian base", putting Lanaken under Contact as if it were an
   address, and telling a reader on the contact page that there were "two
   places" while one map card stood below it.
   The phrases below are the ones that make it a business. Naming Belgium
   as where a foal is born, carried or raised is right and is not caught
   here: the programme really does run across two countries. */
{
  const dir = (d) => existsSync(join(root, d)) ? readdirSync(join(root, d), { withFileTypes: true }) : [];
  const walk = (d) => dir(d).flatMap((e) => {
    const rel = d ? `${d}/${e.name}` : e.name;
    if (e.isDirectory()) {
      return /^(deploy|_archive|_to_delete|content|node_modules|assets|scripts|logs|v2-.*|\..*)$/.test(e.name)
        ? [] : walk(rel);
    }
    return e.name.endsWith('.html') && !e.name.startsWith('_') ? [rel] : [];
  });
  const BELGIUM = [
    'belgian base', 'belgium base', 'our belgian', 'belgian yard',
    'italian and belgian bases', 'our bases', 'the two places',
  ];
  /* One Italian place, settled by Mark on 3 Sep. The site named two towns two
     hundred kilometres apart for weeks: the register and their own footer say
     Castelnuovo Garfagnana, the briefing said Desenzano del Garda, and both
     stood on the contact page at once. Where a place is an address it is the
     registered one; where it is positioning it is the region and no village
     at all. So no public page names the other town.
     Two lists and two messages rather than one: a check that reports a
     Desenzano hit as "Belgium is a place of business" sends the reader to the
     wrong paragraph, which is its own kind of wrong. */
  const ITALY = ['desenzano'];
  const belgium = [], italy = [];
  for (const f of walk('')) {
    const h = read(f);
    if (/<meta name="internal-doc"/.test(h)) continue;
    /* The visible words and the ones only a search result or a pasted link
       shows. A description is public too, and the first attempt at this
       check read the body alone: the phrase put back into a meta tag to
       prove the check walked straight past it. */
    const metas = (h.match(/<meta [^>]*content="([^"]*)"/g) || []).join(' ');
    const t = (textOf(h) + ' ' + metas).toLowerCase();
    for (const phrase of BELGIUM) if (t.includes(phrase)) belgium.push(`${f}: "${phrase}"`);
    for (const phrase of ITALY) if (t.includes(phrase)) italy.push(`${f}: "${phrase}"`);
  }
  belgium.length
    ? fail('a public page makes Belgium a place of business', belgium)
    : pass('Belgium is named as a place, never as a second base');
  italy.length
    ? fail('a public page names an Italian town that is not the registered one', italy)
    : pass('one Italian place on the site, and it is the registered one');
}

console.log('\n══════════════════════════════════════════════');
console.log(`${failures} failure(s) across ${checks} site-wide check(s)\n`);
process.exit(failures ? 1 : 0);
