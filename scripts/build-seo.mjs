#!/usr/bin/env node
/* Write sitemap.xml and robots.txt from the pages that actually exist.
 *
 * Neither file existed. They are generated from the same rule the audit uses —
 * every .html on disk, minus the internal documents and the build folders —
 * so a page cannot be live and missing from the sitemap, and the sitemap
 * cannot list a page that is not there.
 *
 * While the site is a draft every page carries noindex, and a sitemap that
 * lists noindexed pages is a contradiction. So robots.txt disallows everything
 * until DRAFT is turned off here, and says why.
 *
 * Run: node scripts/build-seo.mjs
 */
import { writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { root } from './lib/shell.mjs';

const SITE = 'https://stud-von-axe-ten.vercel.app';
/* One switch. On the day this goes live it flips, robots opens up, and the
   noindex comes off in scripts/lib/shell.mjs at the same time. */
const DRAFT = true;

const SKIP_DIR = new Set(['deploy', '_archive', '_to_delete', 'content', 'node_modules',
  'assets', 'scripts', 'logs', '.git', '.vercel']);

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const full = join(dir, name);
  if (statSync(full).isDirectory()) {
    if (SKIP_DIR.has(name) || name.startsWith('v2-') || name.startsWith('.')) return [];
    return walk(full);
  }
  return name.endsWith('.html') ? [full] : [];
});

/* An internal document is one that says so in its own head. That is the same
   test the audit uses, so the two cannot disagree about what is public. */
const isInternal = (file) => /<meta name="internal-doc"/.test(readFileSync(file, 'utf-8'))
  /* A 404 is a real page and a public one, and it still has no place in a
     sitemap: the file lists what a search engine should come and fetch. */
  || /(^|\/)404\.html$/.test(file.replace(/\\/g, '/'));

const urlFor = (file) => {
  const rel = relative(root, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
};

const pages = walk(root)
  .filter((f) => !isInternal(f))
  .map(urlFor)
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

/* A horse page changes when its horse does; the archives change whenever one
   of theirs does. Stated rather than dated, because a lastmod nobody maintains
   is worse than none. */
const priority = (u) =>
  u === '/' ? '1.0'
  : /^\/(breeding-mares|foals|embryos|sport-horses|icsi-semen|contact|about)$/.test(u) ? '0.8'
  : /^\/news$/.test(u) ? '0.6'
  : '0.5';

writeFileSync(join(root, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<!-- Written by scripts/build-seo.mjs from the pages on disk. Do not edit. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((u) => `  <url>
    <loc>${SITE}${u}</loc>
    <priority>${priority(u)}</priority>
  </url>`).join('\n')}
</urlset>
`);

writeFileSync(join(root, 'robots.txt'), DRAFT
? `# The site is still a draft: every page carries noindex, so nothing here
# should be crawled or indexed yet. Flip DRAFT in scripts/build-seo.mjs on the
# day it goes live, and take the noindex out of scripts/lib/shell.mjs in the
# same change.
User-agent: *
Disallow: /

Sitemap: ${SITE}/sitemap.xml
`
: `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

console.log(`wrote sitemap.xml with ${pages.length} pages and robots.txt (${DRAFT ? 'draft: crawling closed' : 'live'})`);
