/* ============================================================
   WHAT THE WHATSAPP BATCH CHANGES

   Third step of three. Reads what the other two produced and writes
   horses-whatsapp.js, which build-horses.mjs lays over the harvested data:

     node scripts/ingest-whatsapp.mjs        -> parsed.json, review.html
     python3 scripts/place-whatsapp-photos.py -> the photographs, placed.json
     node scripts/build-whatsapp-data.mjs    -> horses-whatsapp.js

   Three keys come out of it:

     PATCH  fields to lay over a horse that already exists
     NEW    whole records for horses that do not exist yet
     DROP   slugs to take off the site

   Nothing here is invented. A pedigree is assembled out of the sire's record
   and the dam's record, both already on the site; where a name is not known
   the cell is left empty, and pedigreeSection draws its own "To be filled in"
   rather than a guess.
   ============================================================ */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(root, 'content', 'whatsapp-2026-09-06');
const SOURCE = 'WhatsApp, Stud Von Axe, 6 September 2026';

const ctx = {};
new Function('g', readFileSync(join(root, 'horses-data.js'), 'utf8') + '\ng.H=HORSES;')(ctx);
new Function('g', readFileSync(join(root, 'semen-data.js'), 'utf8') + '\ng.S=SEMEN;')(ctx);
const HORSES = ctx.H, SEMEN = ctx.S;

const parsed = JSON.parse(readFileSync(join(DIR, 'parsed.json'), 'utf8'));
const placed = JSON.parse(readFileSync(join(DIR, 'placed.json'), 'utf8'));

/* ---------- names ---------- */
const fold = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '');
/* Loose, for matching only: drops a trailing Z and collapses a doubled
   letter, so "Zandor Z" finds "Zandor" and her "Hypnnotic" finds Hypnotic.
   What gets written is always the spelling already on the site. */
const loose = s => fold(s).replace(/z$/, '').replace(/(.)\1+/g, '$1');

const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function find(name, pool) {
  const l = loose(name);
  let hit = pool.filter(r => loose(r.name) === l);
  if (hit.length === 1) return hit[0];
  hit = pool.filter(r => { const f = loose(r.name); return f.startsWith(l) || l.startsWith(f); });
  return hit.length === 1 ? hit[0] : null;
}

/* ---------- who is whose parent ----------
   Every record carries eight great-grandparents in a fixed order, so the
   parents of each grandparent are already written down across the data. */
const PARENTS = new Map();
for (const h of [...HORSES, ...SEMEN]) {
  const p = h.pedigree; if (!p || !p.third || p.third.length < 8) continue;
  const pairs = [[p.sireSire, 0], [p.sireDam, 2], [p.damSire, 4], [p.damDam, 6]];
  for (const [who, i] of pairs) {
    if (who && !PARENTS.has(fold(who))) PARENTS.set(fold(who), [p.third[i] || '', p.third[i + 1] || '']);
  }
  if (!PARENTS.has(fold(h.name))) PARENTS.set(fold(h.name), [p.sire || '', p.dam || '']);
}
const parentsOf = n => PARENTS.get(fold(n)) || ['', ''];

/* ---------- 1. photographs, texts, the rename ---------- */
const PATCH = {};
const patch = (slug, fields) => { PATCH[slug] = { ...(PATCH[slug] || {}), ...fields }; };

for (const [slug, v] of Object.entries(placed.horses)) {
  patch(slug, { photos: v.photos, source: SOURCE });
}

/* her nine rewritten mare texts, paragraph per paragraph */
let texts = 0;
for (const t of parsed.texts) {
  if (!t.slug) continue;
  const body = t.body
    .map(s => s.replace(/[–—]/g, ',').replace(/\s+,/g, ',').trim())
    .filter(Boolean);
  if (!body.length) continue;
  patch(t.slug, { body, source: SOURCE + ', her text at ' + t.at });
  texts++;
}

/* the one horse she named on the day */
for (const r of parsed.rows) {
  if (r.state !== 'renamed' || !r.slug) continue;
  patch(r.slug, { name: r.name, renamedFrom: r.renamedFrom, said: r.said });
}

/* ---------- 2. the embryos ----------
   Her list of 11:11 is the current one. A cross she names in both buckets is
   two things: a pregnancy with a date, and straws of the same cross in the
   tank. Mark, 7 Sep: build both, because that is what they hold. */

const mares = HORSES.filter(h => h.category === 'broodmare');
/* A cross is named "SIRE X DAM", so its own record opens with the sire's name
   and a prefix match will happily hand it back: looking up the sire of
   "Aganix du Seigneur x Cortina de Jolie Z" found the cross itself, and the
   dam was written into the name twice. Only a single horse can be a sire. */
const sires = [...SEMEN, ...HORSES].filter(h => !/\s+x\s+/i.test(h.name));
const siteEmbryos = HORSES.filter(h => h.category === 'embryo');

function split(cross) {
  const [a, b] = cross.split(/\s+x\s+/i);
  return { sire: find(a || '', sires), dam: find(b || '', mares), rawSire: a, rawDam: b };
}
const crossKey = c => {
  const { sire, dam, rawSire, rawDam } = split(c);
  return (sire ? sire.slug : '?' + loose(rawSire)) + '|' + (dam ? dam.slug : '?' + loose(rawDam));
};

/* what she sent, one entry per cross per bucket */
const wanted = [];
for (const bucket of ['implanted', 'frozen']) {
  for (const e of parsed.embryos[bucket]) {
    wanted.push({ ...e, bucket, key: crossKey(e.cross) });
  }
}

/* what the site already has, keyed the same way and told apart by its year */
const isFrozen = h => /frozen/i.test(h.year || '');
const siteByKey = new Map();
for (const h of siteEmbryos) {
  const k = crossKey(h.name);
  if (!siteByKey.has(k)) siteByKey.set(k, []);
  siteByKey.get(k).push(h);
}

const NEW = [];
const usedSlugs = new Set([...HORSES, ...SEMEN].map(h => h.slug));
let matched = 0;

for (const w of wanted) {
  const here = siteByKey.get(w.key) || [];
  const same = here.find(h => (w.bucket === 'frozen') === isFrozen(h) && !h.__taken);
  /* Her dates arrive as "22/02/27", and the first one carries the words "due
     date" inside the brackets. Written out to four digits: the page prints
     this field as it stands, and a year with its century missing is a year
     the reader has to guess at. */
  const due = (w.due || '')
    .replace(/^due\s*date\s*/i, '')
    .replace(/^(\d{1,2}\/\d{1,2}\/)(\d{2})$/, (m, a, b) => a + '20' + b)
    .trim();
  const year = w.bucket === 'frozen' ? 'Frozen' : due;

  if (same) {                       /* already there: only the date moves */
    same.__taken = true;
    matched++;
    if (year && year !== same.year) patch(same.slug, { year, source: SOURCE + ', her list at 11:11' });
    continue;
  }

  const { sire, dam } = split(w.cross);
  if (!dam) { console.log('  skipped, dam not on the site: ' + w.cross); continue; }

  /* Her spelling of a stallion is not always the site's: she writes "Zandor"
     and "Aganix du Seigneur" where the records say "ZANDOR Z" and "AGANIX DU
     SEIGNEUR Z". Where the same cross already exists, take the spelling from
     it, so the two cards of one cross do not disagree on the sire's name. */
  const sireName = sire ? sire.name
    : (here[0] && here[0].pedigree && here[0].pedigree.sire)
      ? here[0].pedigree.sire
      : w.cross.split(/\s+x\s+/i)[0].trim();
  const name = (sireName + ' X ' + dam.name).toUpperCase();
  let slug = slugify(name);
  if (usedSlugs.has(slug)) slug = slug + (w.bucket === 'frozen' ? '-frozen' : '-carrying');
  usedSlugs.add(slug);

  const sp = sire ? sire.pedigree : null, dp = dam.pedigree;
  const t = [
    ...parentsOf(sp ? sp.sire : ''), ...parentsOf(sp ? sp.dam : ''),
    ...parentsOf(dp.sire), ...parentsOf(dp.dam)
  ];

  NEW.push({
    slug, category: 'embryo', name, sold: false, tagline: '',
    genetics: [sireName, dam.genetics].filter(Boolean).join(' x '),
    year, studbook: '', sex: '-', height: '',
    horsetelex: dam.horsetelex || '',
    pedigree: {
      sire: sireName.toUpperCase(), dam: dam.name,
      sireSire: sp ? sp.sire : '', sireDam: sp ? sp.dam : '',
      damSire: dp.sire, damDam: dp.dam,
      third: t
    },
    body: [], photos: [], videos: [], country: '',
    /* her instruction at 11:13: for the crosses, use the same photographs
       she sent for the semen page */
    sirePhoto: sire ? sire.slug : '',
    source: SOURCE + ', her list at 11:11'
  });
}

/* ---------- the stallion photograph a cross borrows ----------
   Her instruction at 11:13: "You can use as pictures the same we sent you for
   the semen, i will send you the one that are not present in the straws
   part". That last clause is Dominator 2000 Z, Dourkhan Hero Z and Zandor Z:
   three sires of their crosses that are not among the twenty four stallions
   and so have no record of their own. Keyed on the name she wrote, so a
   photograph reaches every cross out of that sire rather than only the one
   whose record happened to begin with his name. */
const SIRE_PHOTO = new Map();
for (const r of parsed.rows) {
  if (r.block !== 'stallion' || !r.slug) continue;
  const p = placed.horses[r.slug];
  if (p && p.photos.length) SIRE_PHOTO.set(fold(r.name), p.photos[0]);
}
const sirePhotoFor = (name) => {
  const f = fold(name), l = loose(name);
  if (!f) return null;
  if (SIRE_PHOTO.has(f)) return SIRE_PHOTO.get(f);
  for (const [k, v] of SIRE_PHOTO) if (loose(k) === l) return v;
  /* She labels a photograph "Cornet" and "Emerald" where the record reads
     CORNET OBOLENSKY and EMERALD VAN'T RUYTERSHOF. Five letters minimum, and
     only when exactly one stallion answers to it. */
  const near = [...SIRE_PHOTO].filter(([k]) => {
    const kk = loose(k);
    return kk.length >= 5 && (l.startsWith(kk) || kk.startsWith(l));
  });
  return near.length === 1 ? near[0][1] : null;
};

for (const rec of NEW) {
  delete rec.sirePhoto;
  const shot = sirePhotoFor(rec.pedigree.sire);
  if (shot) rec.photos = [shot];
}

/* and the crosses already on the site that never had a picture */
let borrowed = 0;
for (const h of siteEmbryos) {
  if (h.photos && h.photos.length) continue;
  if (PATCH[h.slug] && PATCH[h.slug].photos && PATCH[h.slug].photos.length) continue;
  const shot = sirePhotoFor(h.pedigree && h.pedigree.sire);
  if (!shot) continue;
  patch(h.slug, { photos: [shot], source: SOURCE + ', the sire\'s photograph at her word' });
  borrowed++;
}

/* ---------- 3. what comes off ---------- */
const DROP = [{
  slug: 'electra-von-axe-z',
  why: 'She asked for it on 6 September at 14:51: "We can take out from the '
     + 'catalogue for the moment Electra Von Axe because is sold as an embryo '
     + 'and we have no pictures".'
}];

/* ---------- write ---------- */
const out = `/* What the WhatsApp batch of 6 September 2026 changes.
   Written by scripts/build-whatsapp-data.mjs. Do not edit: rebuild.

   PATCH lies over a horse that already exists, NEW adds one that does not,
   DROP takes one off. build-horses.mjs applies all three before it renders,
   so re-running scripts/harvest-horses.mjs cannot undo any of it. */
var WHATSAPP = ${JSON.stringify({ PATCH, NEW, DROP }, null, 1)};
if (typeof module !== 'undefined') module.exports = WHATSAPP;
`;
writeFileSync(join(root, 'horses-whatsapp.js'), out);

console.log('patched   ' + Object.keys(PATCH).length + ' horses'
  + ' (' + Object.values(PATCH).filter(p => p.photos).length + ' with photographs, '
  + texts + ' with her texts)');
console.log('borrowed  ' + borrowed + ' cross(es) already on the site take the sire photograph');
console.log('new       ' + NEW.length + ' embryo record(s)');
console.log('  ' + NEW.map(r => r.name + '  [' + (r.year || 'no date') + ']').join('\n  '));
console.log('embryos   ' + matched + ' of hers matched a record already on the site');
console.log('dropped   ' + DROP.map(d => d.slug).join(', '));
console.log('\nwrote horses-whatsapp.js');
