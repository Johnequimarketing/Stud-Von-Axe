#!/usr/bin/env node
/* Pull every photograph off the client's own live site, and keep a record of
 * which page each one came from.
 *
 * The provenance rule on this project is that a photograph may only name a
 * horse when it came from that horse's own page. That rule is unenforceable
 * unless the source page travels with the file, so this writes a manifest
 * beside the images rather than a folder of anonymous JPEGs.
 *
 * Run: node scripts/harvest-old-site.mjs [--limit N]
 * Writes: assets/source/<file>  and  assets/source/manifest.json
 */
import { writeFileSync, mkdirSync, existsSync, statSync, createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'assets', 'source');
const UA = 'Mozilla/5.0 (compatible; EquiMarketing site audit; +https://equimarketing.com)';
const SITE = 'https://www.studvonaxe.it';
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

/* ── every page the site lists about itself ──────────────────────────── */
const index = await (await get(`${SITE}/sitemap_index.xml`)).text();
const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  .filter(u => /(post|page|cavalli)-sitemap/.test(u));

const pages = new Set();
for (const m of maps) {
  const xml = await (await get(m)).text();
  for (const p of [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1])) pages.add(p);
  await sleep(400);
}
console.log(`${pages.size} pages listed`);

/* ── the images on each of them ──────────────────────────────────────── */
/* WordPress serves resized copies: name-400x300.jpg beside name.jpg. The
   original is the one without the suffix, and it is the only one worth
   keeping. */
const original = (u) => u.replace(/-\d{2,4}x\d{2,4}(?=\.(jpe?g|png|webp)$)/i, '');
const found = new Map();   /* original url -> Set(page urls) */
let n = 0;
for (const page of pages) {
  if (n >= LIMIT) break;
  n++;
  let html;
  try { html = await (await get(page)).text(); }
  catch (e) { console.log(`  skip ${page}: ${e.message}`); continue; }
  const urls = [...html.matchAll(/https:\/\/www\.studvonaxe\.it\/wp-content\/uploads\/[^"'\s)]+?\.(?:jpe?g|png|webp)/gi)]
    .map(m => original(m[0]));
  for (const u of new Set(urls)) {
    if (!found.has(u)) found.set(u, new Set());
    found.get(u).add(page);
  }
  if (n % 20 === 0) console.log(`  read ${n}/${pages.size} pages, ${found.size} images so far`);
  await sleep(350);
}
console.log(`${found.size} distinct original images`);

/* ── download what we do not already have ────────────────────────────── */
mkdirSync(OUT, { recursive: true });
const manifest = [];
let got = 0, skipped = 0, failed = 0;
for (const [url, pageSet] of found) {
  const name = decodeURIComponent(url.split('/').pop());
  const dest = join(OUT, name);
  if (existsSync(dest)) { skipped++; }
  else {
    try {
      const res = await get(url);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(dest, buf);
      got++;
      await sleep(250);
    } catch (e) { console.log(`  fail ${name}: ${e.message}`); failed++; continue; }
  }
  manifest.push({
    file: name,
    url,
    /* The pages this image appears on. One page means the provenance is
       unambiguous; several means it is a general photograph. */
    pages: [...pageSet],
    bytes: existsSync(dest) ? statSync(dest).size : 0,
  });
}
manifest.sort((a, b) => b.bytes - a.bytes);
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`downloaded ${got}, already had ${skipped}, failed ${failed}`);
console.log(`manifest: assets/source/manifest.json`);
