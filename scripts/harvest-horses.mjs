#!/usr/bin/env node
/* Read every horse off the client's own site and write horses-data.js.
 *
 * Their pages are unusually well marked up for this: each field sits in its
 * own class, so nothing here is guessed from position or from a phrase.
 *
 *   .cavalli-categoria   Breeding, Broodmare | Foal | Embryo | Sport horse
 *   .cavalli-title       the name
 *   .cavalli-slogan      their one line about the horse
 *   .cavalli-info        Genetics, Year of birth, Race, Sex, Height, each in
 *                        its own <span class="*-val">
 *   .cavalli-link        the Horsetelex link
 *   .cavalli-genealogia  the pedigree table, and the story under it
 *   .gallery-wrap        the photographs, linked at full size
 *   div.sold.sold        SOLD. div.sold.no is a horse still with them: the
 *                        word SOLD is in the markup either way and hidden by
 *                        CSS, which is why reading the text says every horse
 *                        is sold and is wrong.
 *
 * Run:  node scripts/harvest-horses.mjs
 * Then: python3 scripts/fetch-horse-photos.py   (downloads and optimises)
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib/shell.mjs';

const SITE = 'https://www.studvonaxe.it';
const INDEXES = [
  ['broodmare', `${SITE}/en/broodmares/`],
  ['foal',      `${SITE}/en/foals/`],
  ['embryo',    `${SITE}/en/embryos/`],
  ['sport',     `${SITE}/en/sport-horses/`],
];

const get = async (url) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (site rebuild for the owner)' } });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 800));
  }
  throw new Error(`could not fetch ${url}`);
};

const strip = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–')
  .replace(/&#8217;/g, '’').replace(/&#8216;/g, '‘')
  .replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

/* A block by its own class, taken to the end of its wrapper. Written as a
   scan rather than a regex with nested groups, because these wrappers nest
   two deep and a lazy regex stops at the first close. */
const block = (html, cls) => {
  const at = html.indexOf(`cavalli-text ${cls}"`) >= 0
    ? html.indexOf(`cavalli-text ${cls}"`)
    : html.indexOf(`${cls}"`);
  if (at < 0) return '';
  const open = html.indexOf('<div class="wpb_wrapper">', at);
  if (open < 0) return '';
  let depth = 0, i = open;
  while (i < html.length) {
    const nextOpen = html.indexOf('<div', i + 1);
    const nextClose = html.indexOf('</div>', i + 1);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) { depth++; i = nextOpen; }
    else { if (depth === 0) return html.slice(open, nextClose); depth--; i = nextClose; }
  }
  return '';
};

const val = (html, key) => {
  const m = html.match(new RegExp(`<span class="${key}-val">([\\s\\S]*?)</span>`));
  return m ? strip(m[1]) : '';
};

/* The story: the paragraphs under the pedigree table, in their words. Their
   own markup wraps each line in two spans with generated class names, so the
   paragraphs are taken and stripped rather than matched on. */
const story = (genealogia) => {
  const after = genealogia.slice(genealogia.lastIndexOf('</table>') + 1);
  return [...after.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map(m => strip(m[1]))
    .filter(t => t.length > 40);
};

/* Three generations, read out of their table's rowspans. Column one is the
   parents, column two the grandparents, column three the great grandparents.
   Returned as two branches so the page can show it the way the references
   do, sire above dam. */
const pedigree = (genealogia) => {
  const table = genealogia.match(/<table[\s\S]*?<\/table>/);
  if (!table) return null;
  const rows = [...table[0].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r =>
    [...r[1].matchAll(/<td(?:\s+rowspan="(\d+)")?[^>]*>([\s\S]*?)<\/td>/g)]
      .map(c => ({ span: Number(c[1] || 1), text: strip(c[2]) })));
  const cols = [[], [], []];
  const carry = [0, 0, 0];
  for (const row of rows) {
    let cell = 0;
    for (let c = 0; c < 3; c++) {
      if (carry[c] > 0) { carry[c]--; continue; }
      const td = row[cell++];
      if (!td) continue;
      cols[c].push(td.text);
      carry[c] = td.span - 1;
    }
  }
  if (!cols[0].length) return null;
  return {
    sire: cols[0][0] || '', dam: cols[0][1] || '',
    sireSire: cols[1][0] || '', sireDam: cols[1][1] || '',
    damSire: cols[1][2] || '', damDam: cols[1][3] || '',
    third: cols[2].filter(Boolean),
  };
};

const photos = (html) => {
  const full = [...html.matchAll(/href='(https:\/\/www\.studvonaxe\.it\/wp-content\/uploads\/[^']+?\.(?:jpg|jpeg|png))'/gi)]
    .map(m => m[1]);
  const inline = [...html.matchAll(/src="(https:\/\/www\.studvonaxe\.it\/wp-content\/uploads\/[^"]+?\.(?:jpg|jpeg|png))"/gi)]
    .map(m => m[1]);
  /* -150x150 and friends are WordPress's crops; the original sits at the
     same path without the suffix. */
  const clean = [...full, ...inline]
    .map(u => u.replace(/-\d+x\d+(?=\.(jpg|jpeg|png)$)/i, ''))
    .filter(u => !/logo|favicon|placeholder/i.test(u));
  return [...new Set(clean)];
};

const slugify = (name) => name.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const run = async () => {
  const seen = new Map();

  for (const [category, url] of INDEXES) {
    const index = await get(url);
    const links = [...new Set([...index.matchAll(/href="(https:\/\/www\.studvonaxe\.it\/en\/cavalli\/[^"]+?)"/g)].map(m => m[1]))];
    process.stdout.write(`${category}: ${links.length} pages\n`);

    /* The country a sold horse went to lives only on the listing page, in a
       field their stylesheet hides: <div class="...field-paese paese-si">BE</div>
       right before the empty flag div the visitor sees a flag in. The detail
       page does not carry it at all, which is why the first harvest came back
       with no destinations. Read here, in listing order, and matched to the
       cards by position. */
    const countries = [...index.matchAll(/field-paese[^>]*>([A-Z]{2})?</g)].map(m => m[1] || '');
    /* Each card links three times, from the photograph, the title and the
       button, so the hrefs are reduced to first appearance before they are
       lined up with the country fields. */
    const cards = [...new Set([...index.matchAll(/href="(https:\/\/www\.studvonaxe\.it\/en\/cavalli\/[^"]+?)"/g)].map(m => m[1]))];
    const countryFor = new Map();
    cards.forEach((href, i) => { if (countries[i]) countryFor.set(href, countries[i]); });
    const named = [...countryFor.values()].filter(Boolean).length;
    if (named) process.stdout.write(`  ${named} with a destination country\n`);

    for (const link of links) {
      const html = await get(link);
      if (!html) continue;

      const name = strip(block(html, 'cavalli-title')).replace(/\s+/g, ' ');
      if (!name) { console.warn(`  no name on ${link}`); continue; }

      const gen = block(html, 'cavalli-genealogia');
      const info = block(html, 'cavalli-info');
      const article = html.match(/<article id="post-\d+" class="([^"]+)"/);
      const cats = article ? article[1] : '';
      const soldClass = html.match(/<div class="sold (sold|no)"/);

      const horse = {
        slug: slugify(name),
        category,
        name,
        sold: soldClass ? soldClass[1] === 'sold' : null,
        tagline: strip(block(html, 'cavalli-slogan')),
        genetics: val(info, 'genetica'),
        year: val(info, 'anno'),
        studbook: val(info, 'razza'),
        sex: val(info, 'sesso'),
        height: val(info, 'altezza'),
        horsetelex: (block(html, 'cavalli-link').match(/href="([^"]+)"/) || [])[1] || '',
        pedigree: pedigree(gen),
        body: story(gen),
        photos: photos(html).slice(0, 4),
        country: countryFor.get(link) || '',
        source: link,
        siteCategories: cats.split(' ').filter(c => c.startsWith('category-')).join(' '),
      };

      /* A horse can be listed under two categories on their site. First one
         wins, and the second is recorded rather than dropped. */
      if (seen.has(horse.slug)) {
        const prev = seen.get(horse.slug);
        if (!prev.alsoIn) prev.alsoIn = [];
        prev.alsoIn.push(category);
        continue;
      }
      seen.set(horse.slug, horse);
      await new Promise(r => setTimeout(r, 120));
    }
  }

  const all = [...seen.values()];
  const counts = all.reduce((a, h) => ({ ...a, [h.category]: (a[h.category] || 0) + 1 }), {});
  console.log('\ntotal', all.length, counts);
  console.log('sold:', all.filter(h => h.sold).length, ' available:', all.filter(h => h.sold === false).length);
  console.log('with pedigree:', all.filter(h => h.pedigree).length,
              ' with story:', all.filter(h => h.body.length).length,
              ' with photos:', all.filter(h => h.photos.length).length);

  writeFileSync(join(root, 'horses-data.js'),
`/* Every horse on studvonaxe.it, harvested from their own pages by
   scripts/harvest-horses.mjs. Their words, their spellings, their fields.
   An empty field is empty on their site too and is never filled in here.
   Regenerate rather than edit: node scripts/harvest-horses.mjs
   Harvested ${new Date().toISOString().slice(0, 10)}. */
var HORSES = ${JSON.stringify(all, null, 1)};
if (typeof module !== 'undefined') module.exports = HORSES;
`);
  console.log('wrote horses-data.js');
};

run();
