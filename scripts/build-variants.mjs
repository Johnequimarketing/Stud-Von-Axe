#!/usr/bin/env node
/* Build 04-embryo-cards.html: six ways to draw an embryo card, on the real
 * fifteen crosses, in the page's own tokens.
 *
 * Written as a builder rather than by hand so the tokens, the header and the
 * fonts come from index.html and cannot drift while Mark is choosing. It is
 * an internal document: noindex, and marked internal-doc so the audit runs
 * its structural checks and not its copy rules.
 *
 * Run: node scripts/build-variants.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, esc } from './lib/shell.mjs';

const HORSES = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();
const CROSSES = HORSES.filter((h) => h.category === 'embryo');

/* Their capitals are a stylesheet, not a spelling. Same rule as the site. */
const SMALL = new Set(['de', 'van', 'vd', "van't", 'vant', 'het', 'du', 'des', 'la', 'le',
                       'di', 'da', 'il', 'der', 'den', 'vom', 'zum']);
const CAPS = new Set(['z', 'sva', 'jt', 'vdl', 'ht', 'bh', 'ii', 'iii', 'iv', 'vi', 'vii']);
const name = (raw) => {
  if (!raw) return '';
  const s = raw.replace(/\s*[–—]\s*/g, '-');
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().split(' ').map((w, i) => {
    if (CAPS.has(w)) return w.toUpperCase();
    if (w === 'x') return 'x';
    if (i > 0 && SMALL.has(w)) return w;
    return w.replace(/(^|[’'\-])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  }).join(' ');
};
const theirs = (t) => (t || '').replace(/\s+[–—-]\s*/g, ' · ').replace(/\s+·\s*$/, '');

const isFrozen = (h) => /frozen/i.test(h.year || '');
const stage = (h) => (isFrozen(h) ? 'Frozen' : `Due ${h.year}`);
const sireOf = (h) => name(h.name.split(/\s+X\s+/i)[0] || '');
const damOf  = (h) => name(h.name.split(/\s+X\s+/i).slice(1).join(' x ') || '');
/* The damline without the sire: their Genetics row starts with the sire of
   the cross, and on a card that is already the first line. */
const lineOf = (h) => name(theirs((h.genetics || '').split(/\s+X\s+/i).slice(1).join(' x ')));
const photo  = (h) => (h.photos && h.photos[0]) || '';

/* Four crosses per variant, picked to show what each has to survive: one
   frozen, one carrying, one with a long dam name, one without a photograph. */
const SAMPLE = [
  CROSSES.find((h) => h.slug === 'cornet-obolensky-x-agousha-vd-berghoeve-z'),  /* carrying, photograph */
  CROSSES.find((h) => h.slug === 'catoki-x-hypnotic-jt-z'),                     /* frozen, none */
  CROSSES.find((h) => h.slug === 'mosito-van-het-hellenof-x-carma-vd-berghoeve-z'), /* long names */
  CROSSES.find((h) => h.slug === 'big-star-x-cortina-de-jolie-z'),              /* frozen, none */
].filter(Boolean);

/* Seven of the fifteen have no photograph now that their own card designs
   have been taken out of the list, so the empty case is not an edge case
   here: it is half the archive. It gets the typographic frame the site
   already uses for a horse without a picture, which on an embryo is the
   honest answer anyway. */
const pic = (h, cls) => photo(h)
  ? `<img class="${cls}" src="/${photo(h)}" alt="${esc(name(h.name))}" loading="lazy">`
  : `<span class="${cls} v-nopic"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span>`;

/* ── the six ─────────────────────────────────────────────────────────── */
const VARIANTS = [
  {
    id: 'plate',
    title: 'The plate',
    note: 'Photograph on top, everything else in a box under it. Nothing sits on the picture but the stage, so the frame stays a photograph and the words stay words. Closest to the cards on their own site, and the safest across foals and mares.',
    grid: 'v-g4',
    card: (h) => `
      <li class="v1">
        <a class="v1__a" href="/embryos/${h.slug}">
          <span class="v1__win">${pic(h, 'v1__img')}<span class="v1__stage">${esc(stage(h))}</span></span>
          <span class="v1__body">
            <span class="v1__sire">${esc(sireOf(h))}</span>
            <span class="v1__x" aria-hidden="true">&times;</span>
            <span class="v1__dam">${esc(damOf(h))}</span>
            <span class="v1__line">${esc(lineOf(h))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'split',
    title: 'The split',
    note: 'A row rather than a tile: square photograph left, the cross and the damline right, with room for their sentence. Two across on a wide screen, one on a phone. The picture cannot dominate because it is only ever a third of the row.',
    grid: 'v-g2',
    card: (h) => `
      <li class="v2">
        <a class="v2__a" href="/embryos/${h.slug}">
          <span class="v2__win">${pic(h, 'v2__img')}</span>
          <span class="v2__body">
            <span class="v2__stage">${esc(stage(h))}</span>
            <span class="v2__name">${esc(sireOf(h))} <em>&times;</em> ${esc(damOf(h))}</span>
            <span class="v2__line">${esc(lineOf(h))}</span>
            <span class="v2__say">${esc(theirs(h.tagline))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'cross',
    title: 'The cross',
    note: 'The cross itself is the object: sire over dam with the gold multiplication sign between them, set like a plate. The photograph is a band above it, cropped short, because on an embryo the picture is context and the pairing is the product.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v3">
        <a class="v3__a" href="/embryos/${h.slug}">
          <span class="v3__win">${pic(h, 'v3__img')}</span>
          <span class="v3__body">
            <span class="v3__stage">${esc(stage(h))}</span>
            <span class="v3__sire">${esc(sireOf(h))}</span>
            <span class="v3__x" aria-hidden="true">&times;</span>
            <span class="v3__dam">${esc(damOf(h))}</span>
            <span class="v3__rule" aria-hidden="true"></span>
            <span class="v3__line">${esc(lineOf(h))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'medallion',
    title: 'The medallion',
    note: 'Their own answer, in our tokens: a round photograph and the pairing beside it on navy. It is what they drew for the frozen ones, and it solves the honest problem that an embryo has no face of its own, so the picture is deliberately a portrait medallion rather than a claim.',
    grid: 'v-g2',
    card: (h) => `
      <li class="v4">
        <a class="v4__a" href="/embryos/${h.slug}">
          <span class="v4__med">${pic(h, 'v4__img')}</span>
          <span class="v4__body">
            <span class="v4__name">${esc(sireOf(h))}<br><span class="v4__x">&times;</span><br>${esc(damOf(h))}</span>
            <span class="v4__stage">${esc(stage(h))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'record',
    title: 'The record',
    note: 'No photograph at all. A studbook entry: sire, dam, stage and damline in a fixed grid under a gold rule. The quietest of the six and the only one that never crops anything, and it is the one that scales if they add thirty crosses.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v5">
        <a class="v5__a" href="/embryos/${h.slug}">
          <span class="v5__stage">${esc(stage(h))}</span>
          <span class="v5__rule" aria-hidden="true"></span>
          <span class="v5__k">Sire</span><span class="v5__v">${esc(sireOf(h))}</span>
          <span class="v5__k">Dam</span><span class="v5__v">${esc(damOf(h))}</span>
          <span class="v5__k">Damline</span><span class="v5__v v5__v--soft">${esc(lineOf(h))}</span>
          <span class="v5__go">See this cross <span aria-hidden="true">&rarr;</span></span>
        </a>
      </li>`,
  },
  {
    id: 'stack',
    title: 'The stack',
    note: 'Two blocks with air between them: the photograph carries only the name, and the figures sit in their own box below it. The gap is the point, and it is the variant that reads best when the cards are three across.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v6">
        <a class="v6__a" href="/embryos/${h.slug}">
          <span class="v6__win">${pic(h, 'v6__img')}<span class="v6__name">${esc(sireOf(h))} <em>&times;</em> ${esc(damOf(h))}</span></span>
          <span class="v6__box">
            <span class="v6__cell"><span class="v6__k">Stage</span><span class="v6__v">${esc(stage(h))}</span></span>
            <span class="v6__cell"><span class="v6__k">Damline</span><span class="v6__v">${esc(lineOf(h))}</span></span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'welded',
    title: 'The weld',
    note: 'Mark\'s: the photograph fades into navy at its foot and a navy box carries on out of it, so the two are one object and the seam is nowhere. The picture stays large and clean, nothing is printed over it, and every fact sits in the block below. The fade ends on exactly the colour the box is, which is the whole trick: one pixel off and you see the join.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v7">
        <a class="v7__a" href="/embryos/${h.slug}">
          <span class="v7__win">${pic(h, 'v7__img')}<span class="v7__fade" aria-hidden="true"></span></span>
          <span class="v7__box">
            <span class="v7__stage">${esc(stage(h))}</span>
            <span class="v7__name">${esc(sireOf(h))} <em>&times;</em> ${esc(damOf(h))}</span>
            <span class="v7__line">${esc(lineOf(h))}</span>
            <span class="v7__say">${esc(theirs(h.tagline))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'welded-name',
    title: 'The weld, name on the seam',
    note: 'The same weld, with the pairing set across the join: half of it on the last of the photograph, half on the box. It uses the seam instead of hiding it, and it buys the box room for the damline and their sentence without the card growing. The photograph is a step larger here, four to three.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v8">
        <a class="v8__a" href="/embryos/${h.slug}">
          <span class="v8__win">${pic(h, 'v8__img')}<span class="v8__fade" aria-hidden="true"></span>
            <span class="v8__stage">${esc(stage(h))}</span></span>
          <span class="v8__box">
            <span class="v8__name">${esc(sireOf(h))}<span class="v8__x">&times;</span>${esc(damOf(h))}</span>
            <span class="v8__rule" aria-hidden="true"></span>
            <span class="v8__line">${esc(lineOf(h))}</span>
            <span class="v8__say">${esc(theirs(h.tagline))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'tall',
    title: 'The tall weld',
    note: 'The weld in portrait. Two to three, so the photograph is nearly the whole card and the block underneath is one compact strip with the figures side by side instead of stacked. Three of these across a page read like a row of plates rather than a row of tiles, and on a phone they fill the screen.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v9">
        <a class="v9__a" href="/embryos/${h.slug}">
          <span class="v9__win">${pic(h, 'v9__img')}<span class="v9__fade" aria-hidden="true"></span></span>
          <span class="v9__box">
            <span class="v9__name">${esc(sireOf(h))} <em>&times;</em> ${esc(damOf(h))}</span>
            <span class="v9__row">
              <span class="v9__cell"><span class="v9__k">Stage</span><span class="v9__v">${esc(stage(h))}</span></span>
              <span class="v9__cell"><span class="v9__k">Damline</span><span class="v9__v">${esc(lineOf(h))}</span></span>
            </span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'seam',
    title: 'The gold seam',
    note: 'The same weld, and then the join is admitted rather than hidden: a hairline of gold runs across it with the stage sitting on the line. It gives the card a horizon, which is the one thing the plain weld lacks, and it is the site\'s own gold doing a job rather than decorating.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v10">
        <a class="v10__a" href="/embryos/${h.slug}">
          <span class="v10__win">${pic(h, 'v10__img')}<span class="v10__fade" aria-hidden="true"></span></span>
          <span class="v10__seam"><span class="v10__stage">${esc(stage(h))}</span></span>
          <span class="v10__box">
            <span class="v10__name">${esc(sireOf(h))} <em>&times;</em> ${esc(damOf(h))}</span>
            <span class="v10__line">${esc(lineOf(h))}</span>
            <span class="v10__say">${esc(theirs(h.tagline))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'framed',
    title: 'The framed print',
    note: 'The photograph is inset in the navy card with a margin all the way round, the way a print sits in a mount, and the type is under it inside the same card. Nothing fades and nothing is cropped to the edge, which is the most respectful a design gets to a photograph, and it is the only one here where the picture has its own border.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v11">
        <a class="v11__a" href="/embryos/${h.slug}">
          <span class="v11__mount">${pic(h, 'v11__img')}</span>
          <span class="v11__box">
            <span class="v11__stage">${esc(stage(h))}</span>
            <span class="v11__name">${esc(sireOf(h))} <em>&times;</em> ${esc(damOf(h))}</span>
            <span class="v11__line">${esc(lineOf(h))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'promise',
    title: 'The promise',
    note: 'Their own sentence is the headline and the names are the caption under it. Every one of the fifteen has a line like "Closest way to Narcotique II!" or "Out of a sister of Hardrock Z!", and that is what a breeder is actually shopping for. The weld underneath, so the photograph still carries the card.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v12">
        <a class="v12__a" href="/embryos/${h.slug}">
          <span class="v12__win">${pic(h, 'v12__img')}<span class="v12__fade" aria-hidden="true"></span>
            <span class="v12__stage">${esc(stage(h))}</span></span>
          <span class="v12__box">
            <span class="v12__say">${esc(theirs(h.tagline))}</span>
            <span class="v12__rule" aria-hidden="true"></span>
            <span class="v12__name">${esc(sireOf(h))} <em>&times;</em> ${esc(damOf(h))}</span>
            <span class="v12__line">${esc(lineOf(h))}</span>
          </span>
        </a>
      </li>`,
  },
  {
    id: 'seam-rule',
    title: 'Ten, with a rule under the breeding',
    note: 'Variation ten with two changes. Their sentence sits in a gold box with the page\'s rounding, pinned to the foot of the card and reserving two lines, so every box in a row draws the same block. And the stage is a label now rather than loose type, in the shape the site already uses for a tag. Gold carries navy ink in both, which is the house rule here and measures 5.70:1.',
    grid: 'v-g3',
    card: (h) => `
      <li class="v13">
        <a class="v13__a" href="/embryos/${h.slug}">
          <span class="v13__win">${pic(h, 'v13__img')}<span class="v13__fade" aria-hidden="true"></span></span>
          <span class="v13__seam"><span class="v13__stage">${esc(stage(h))}</span></span>
          <span class="v13__box">
            <span class="v13__name">${esc(sireOf(h))} <em>&times;</em> ${esc(damOf(h))}</span>
            <span class="v13__line">${esc(lineOf(h))}</span>
            <span class="v13__say">${esc(theirs(h.tagline))}</span>
          </span>
        </a>
      </li>`,
  },
];

const CSS = `
  /* ── the sheet itself ─────────────────────────────────────────────── */
  body{ background:var(--color-base); }
  .v-head{ width:min(var(--wrap), 100% - (2*var(--gutter))); margin:0 auto; padding:clamp(3rem,7vh,5rem) 0 1rem; }
  .v-head h1{ font-family:var(--font-display); font-weight:400; font-size:clamp(1.9rem,3vw+.8rem,2.8rem);
    line-height:1.05; letter-spacing:-.02em; color:var(--color-ink); margin:.5rem 0 .8rem; }
  .v-head h1 em{ font-style:italic; color:var(--color-gold); }
  .v-head p{ max-width:62ch; color:var(--color-ink-soft); font-size:16px; margin:0; }
  .v-sec{ width:min(var(--wrap), 100% - (2*var(--gutter))); margin:0 auto; padding:clamp(2.4rem,5vw,3.6rem) 0; border-top:1px solid var(--color-line); }
  .v-sec:first-of-type{ border-top:0; }
  .v-num{ font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.22em;
    text-transform:uppercase; color:var(--color-gold); margin:0 0 .4rem; }
  .v-sec h2{ font-family:var(--font-display); font-weight:400; font-size:clamp(1.4rem,1.8vw+.7rem,1.9rem);
    color:var(--color-ink); margin:0 0 .6rem; }
  .v-note{ max-width:70ch; color:var(--color-ink-soft); font-size:15px; line-height:1.6; margin:0 0 1.8rem; }
  .v-grid{ list-style:none; margin:0; padding:0; display:grid; gap:clamp(1rem,1.8vw,1.5rem); }
  @media (min-width:700px){ .v-g4, .v-g3, .v-g2{ grid-template-columns:repeat(2,1fr); } }
  @media (min-width:1000px){
    .v-g4{ grid-template-columns:repeat(4,1fr); }
    .v-g3{ grid-template-columns:repeat(3,1fr); }
    .v-g2{ grid-template-columns:repeat(2,1fr); }
  }
  /* No display here. .v-grid a is a class and an element, which outranks the
     single class on .v2__a, so a display:block set at this level quietly
     flattened the split card into a stack. Each variant sets its own. */
  .v-grid a{ text-decoration:none; color:inherit; }
  .v1__a, .v3__a, .v5__a{ display:block; }
  /* No photograph: the supplied mark on navy, at the same weight the about
     page uses it as a watermark. Not the pairing again, which is printed
     under every one of these cards already. */
  .v-nopic{ display:grid; place-items:center; width:100%; height:100%; padding:1.4rem;
    background:var(--color-navy-deep); }
  .v-nopic img{ width:auto; height:44%; max-height:76px; opacity:.16; }

  /* shared stage pill */
  .v1__stage, .v2__stage, .v3__stage, .v4__stage, .v5__stage{
    font-family:var(--font-body); font-weight:700; font-size:9.5px; letter-spacing:.16em;
    text-transform:uppercase;
  }

  /* ── 1 the plate ─────────────────────────────────────────────────── */
  .v1__a{ display:block; border-radius:var(--card-radius); overflow:hidden; background:var(--color-base);
    box-shadow:0 1px 0 var(--color-line), 0 18px 40px -34px rgba(var(--veil-rgb), .5);
    transition:transform .4s var(--ease), box-shadow .4s var(--ease); }
  .v1__a:hover{ transform:translateY(-4px); box-shadow:0 26px 50px -30px rgba(var(--veil-rgb), .55); }
  .v1__win{ position:relative; display:block; aspect-ratio:4/3; overflow:hidden; background:var(--color-navy-deep); }
  .v1__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .v1__stage{ position:absolute; left:10px; top:10px; padding:.3rem .55rem; border-radius:100px;
    background:var(--color-base); color:var(--color-navy); }
  .v1__body{ display:block; padding:1rem 1.05rem 1.15rem; border-top:1px solid var(--color-line); }
  .v1__sire, .v1__dam{ display:block; font-family:var(--font-display); font-weight:400;
    font-size:1.02rem; line-height:1.15; color:var(--color-ink); }
  .v1__x{ display:block; font-family:var(--font-display); font-style:italic; color:var(--color-gold);
    font-size:.95rem; line-height:1.3; }
  .v1__line{ display:block; margin-top:.5rem; font-size:12.5px; line-height:1.45; color:var(--color-ink-soft); }

  /* ── 2 the split ─────────────────────────────────────────────────── */
  .v2__a{ display:grid; grid-template-columns:34% 1fr; gap:0; border-radius:var(--card-radius);
    overflow:hidden; background:var(--color-base); box-shadow:0 1px 0 var(--color-line);
    transition:box-shadow .4s var(--ease); }
  .v2__a:hover{ box-shadow:0 1px 0 var(--color-navy), 0 22px 44px -34px rgba(var(--veil-rgb), .5); }
  .v2__win{ display:block; aspect-ratio:1/1; overflow:hidden; background:var(--color-navy-deep); }
  .v2__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .v2__body{ display:block; padding:1.1rem 1.2rem; align-self:center; }
  .v2__stage{ display:inline-block; margin-bottom:.5rem; padding:.28rem .55rem; border-radius:100px;
    background:color-mix(in srgb, var(--color-gold) 18%, transparent); color:var(--color-navy); }
  .v2__name{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.12rem;
    line-height:1.2; color:var(--color-ink); }
  .v2__name em{ font-style:italic; color:var(--color-gold); }
  .v2__line{ display:block; margin-top:.35rem; font-size:12.5px; color:var(--color-ink-soft); }
  .v2__say{ display:block; margin-top:.6rem; font-family:var(--font-display); font-style:italic;
    font-size:13.5px; line-height:1.45; color:var(--color-navy); }

  /* ── 3 the cross ─────────────────────────────────────────────────── */
  .v3__a{ display:block; border-radius:var(--card-radius); overflow:hidden; background:var(--color-base);
    box-shadow:0 1px 0 var(--color-line); transition:transform .4s var(--ease); }
  .v3__a:hover{ transform:translateY(-4px); }
  .v3__win{ display:block; height:132px; overflow:hidden; background:var(--color-navy-deep); }
  .v3__img{ width:100%; height:100%; object-fit:cover; object-position:50% 34%; display:block; }
  .v3__body{ display:block; padding:1.2rem 1.2rem 1.35rem; text-align:center; }
  .v3__stage{ display:block; color:var(--color-gold); margin-bottom:.7rem; }
  .v3__sire, .v3__dam{ display:block; font-family:var(--font-display); font-weight:400;
    font-size:1.08rem; line-height:1.2; color:var(--color-ink); }
  .v3__x{ display:block; font-family:var(--font-display); font-style:italic; font-size:1.3rem;
    color:var(--color-gold); line-height:1.5; }
  .v3__rule{ display:block; width:34px; height:1px; margin:.9rem auto .7rem; background:var(--color-line); }
  .v3__line{ display:block; font-size:12px; line-height:1.45; color:var(--color-ink-soft); }

  /* ── 4 the medallion ─────────────────────────────────────────────── */
  .v4__a{ display:grid; grid-template-columns:auto 1fr; align-items:center; gap:1.1rem;
    padding:1.1rem 1.3rem; border-radius:var(--card-radius); background:var(--color-navy-deep);
    transition:transform .4s var(--ease); }
  .v4__a:hover{ transform:translateY(-4px); }
  .v4__med{ display:block; width:104px; height:104px; border-radius:50%; overflow:hidden;
    background:color-mix(in srgb, var(--color-navy) 60%, var(--color-white)); flex:none; }
  .v4__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .v4__body{ display:block; min-width:0; }
  .v4__name{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.02rem;
    line-height:1.32; color:var(--color-white); }
  .v4__x{ font-style:italic; color:var(--color-gold); }
  .v4__stage{ display:inline-block; margin-top:.7rem; padding:.3rem .6rem; border-radius:100px;
    background:var(--color-gold); color:var(--color-navy); }

  /* ── 5 the record ────────────────────────────────────────────────── */
  .v5__a{ display:grid !important; grid-template-columns:auto 1fr; gap:.35rem 1rem; align-items:baseline;
    padding:1.3rem 1.35rem 1.4rem; border-radius:var(--card-radius);
    background:var(--color-base); box-shadow:0 1px 0 var(--color-line);
    transition:box-shadow .4s var(--ease); }
  .v5__a:hover{ box-shadow:0 1px 0 var(--color-navy), 0 20px 40px -34px rgba(var(--veil-rgb), .45); }
  .v5__stage{ grid-column:1 / -1; color:var(--color-gold); }
  .v5__rule{ grid-column:1 / -1; height:1px; background:var(--color-gold); opacity:.5; margin:.55rem 0 .75rem; }
  .v5__k{ font-family:var(--font-body); font-weight:700; font-size:9.5px; letter-spacing:.16em;
    text-transform:uppercase; color:var(--color-ink-soft); padding-top:.28rem; }
  .v5__v{ font-family:var(--font-display); font-weight:400; font-size:1.02rem; line-height:1.25;
    color:var(--color-ink); }
  .v5__v--soft{ font-size:12.5px; font-family:var(--font-body); color:var(--color-ink-soft); line-height:1.45; }
  .v5__go{ grid-column:1 / -1; margin-top:1rem; font-family:var(--font-body); font-weight:700;
    font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-navy); }



  /* One height per row. The photograph stays the same size on every card and
     the box takes the slack, so a long pair of names lengthens the block
     rather than the picture. Mark's rule from the about cards. */
  .v-grid{ align-items:stretch; }
  .v-grid li{ display:flex; }
  .v7__a, .v8__a{ display:flex; flex-direction:column; width:100%; }
  .v7__box, .v8__box{ flex:1 1 auto; }
  /* ── 7 the weld ──────────────────────────────────────────────────────
     The photograph runs out into navy and the box continues in the same
     navy, so the card is one object with no line across it. Two things make
     or break it: the last stop of the gradient is the box's own colour, not
     a colour near it, and the box sits on the frame with no gap, no border
     and no shadow of its own. Anything else and the seam appears. */
  .v7__a{ display:block; border-radius:var(--card-radius); overflow:hidden;
    background:var(--color-navy-deep);
    box-shadow:0 20px 44px -34px rgba(var(--veil-rgb), .55);
    transition:transform .45s var(--ease), box-shadow .45s var(--ease); }
  .v7__a:hover{ transform:translateY(-5px); box-shadow:0 32px 60px -34px rgba(var(--veil-rgb), .6); }
  .v7__win{ position:relative; display:block; aspect-ratio:1/1; overflow:hidden; }
  .v7__img{ width:100%; height:100%; object-fit:cover; display:block;
    transition:transform 1s var(--ease); }
  .v7__a:hover .v7__img{ transform:scale(1.045); }
  .v7__fade{ position:absolute; left:0; right:0; bottom:-1px; height:58%;
    background:linear-gradient(180deg,
      rgba(var(--veil-rgb), 0) 0%, rgba(var(--veil-rgb), .55) 46%,
      rgba(var(--veil-rgb), .92) 82%, var(--color-navy-deep) 100%); }
  .v7__box{ display:block; padding:.2rem 1.15rem 1.25rem; }
  .v7__stage{ display:block; font-family:var(--font-body); font-weight:700; font-size:9.5px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.4rem; }
  .v7__name{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.12rem;
    line-height:1.22; color:var(--color-white); }
  .v7__name em{ font-style:italic; color:var(--color-gold); }
  .v7__line{ display:block; margin-top:.45rem; font-size:12px; line-height:1.45;
    color:rgba(255,255,255,.62); }
  .v7__say{ display:block; margin-top:.7rem; font-family:var(--font-display); font-style:italic;
    font-size:13px; line-height:1.45; color:rgba(255,255,255,.86); }

  /* ── 8 the weld, name across the seam ───────────────────────────────── */
  .v8__a{ display:block; border-radius:var(--card-radius); overflow:hidden;
    background:var(--color-navy-deep);
    box-shadow:0 20px 44px -34px rgba(var(--veil-rgb), .55);
    transition:transform .45s var(--ease); }
  .v8__a:hover{ transform:translateY(-5px); }
  .v8__win{ position:relative; display:block; aspect-ratio:4/3; overflow:hidden; }
  .v8__img{ width:100%; height:100%; object-fit:cover; display:block;
    transition:transform 1s var(--ease); }
  .v8__a:hover .v8__img{ transform:scale(1.045); }
  .v8__fade{ position:absolute; left:0; right:0; bottom:-1px; height:52%;
    background:linear-gradient(180deg,
      rgba(var(--veil-rgb), 0) 0%, rgba(var(--veil-rgb), .5) 44%,
      rgba(var(--veil-rgb), .9) 80%, var(--color-navy-deep) 100%); }
  .v8__stage{ position:absolute; left:1.05rem; top:1.05rem; padding:.3rem .6rem; border-radius:100px;
    background:var(--color-gold); color:var(--color-navy);
    font-family:var(--font-body); font-weight:700; font-size:9.5px; letter-spacing:.16em;
    text-transform:uppercase; }
  /* Pulled up over the last of the photograph: the name sits on the join. */
  .v8__box{ display:block; margin-top:-2.6rem; position:relative; z-index:2;
    padding:0 1.15rem 1.3rem; }
  .v8__name{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.18rem;
    line-height:1.2; color:var(--color-white); }
  .v8__x{ display:inline-block; margin:0 .38rem; font-style:italic; color:var(--color-gold); }
  .v8__rule{ display:block; width:32px; height:1px; margin:.85rem 0 .7rem;
    background:color-mix(in srgb, var(--color-gold) 70%, transparent); }
  .v8__line{ display:block; font-size:12px; line-height:1.45; color:rgba(255,255,255,.62); }
  .v8__say{ display:block; margin-top:.55rem; font-family:var(--font-display); font-style:italic;
    font-size:13px; line-height:1.45; color:rgba(255,255,255,.86); }

  /* ── 9 the tall weld ─────────────────────────────────────────────── */
  .v9__a{ display:flex; flex-direction:column; width:100%; border-radius:var(--card-radius);
    overflow:hidden; background:var(--color-navy-deep);
    box-shadow:0 20px 44px -34px rgba(var(--veil-rgb), .55); transition:transform .45s var(--ease); }
  .v9__a:hover{ transform:translateY(-5px); }
  .v9__win{ position:relative; display:block; aspect-ratio:2/3; overflow:hidden; }
  .v9__img{ width:100%; height:100%; object-fit:cover; display:block; transition:transform 1s var(--ease); }
  .v9__a:hover .v9__img{ transform:scale(1.04); }
  .v9__fade{ position:absolute; left:0; right:0; bottom:-1px; height:42%;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),0) 0%, rgba(var(--veil-rgb),.6) 48%,
      rgba(var(--veil-rgb),.93) 84%, var(--color-navy-deep) 100%); }
  .v9__box{ flex:1 1 auto; display:block; padding:.1rem 1.1rem 1.15rem; }
  .v9__name{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.08rem;
    line-height:1.2; color:var(--color-white); }
  .v9__name em{ font-style:italic; color:var(--color-gold); }
  .v9__row{ display:grid; grid-template-columns:auto 1fr; gap:.2rem 1.2rem; margin-top:.85rem;
    padding-top:.8rem; border-top:1px solid rgba(255,255,255,.14); }
  .v9__cell{ display:block; min-width:0; }
  .v9__k{ display:block; font-family:var(--font-body); font-weight:700; font-size:9px;
    letter-spacing:.16em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.15rem; }
  .v9__v{ display:block; font-size:11.5px; line-height:1.4; color:rgba(255,255,255,.72); }

  /* ── 10 the gold seam ────────────────────────────────────────────── */
  .v10__a{ display:flex; flex-direction:column; width:100%; border-radius:var(--card-radius);
    overflow:hidden; background:var(--color-navy-deep);
    box-shadow:0 20px 44px -34px rgba(var(--veil-rgb), .55); transition:transform .45s var(--ease); }
  .v10__a:hover{ transform:translateY(-5px); }
  .v10__win{ position:relative; display:block; aspect-ratio:4/3; overflow:hidden; }
  .v10__img{ width:100%; height:100%; object-fit:cover; display:block; transition:transform 1s var(--ease); }
  .v10__a:hover .v10__img{ transform:scale(1.04); }
  .v10__fade{ position:absolute; left:0; right:0; bottom:-1px; height:50%;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),0) 0%, rgba(var(--veil-rgb),.55) 46%,
      rgba(var(--veil-rgb),.92) 82%, var(--color-navy-deep) 100%); }
  /* The horizon: a gold hairline across the join with the stage sitting on it. */
  .v10__seam{ position:relative; display:flex; align-items:center; gap:.7rem;
    padding:0 1.1rem; margin-top:-.1rem; }
  .v10__seam::after{ content:""; flex:1 1 auto; height:1px;
    background:color-mix(in srgb, var(--color-gold) 65%, transparent); }
  .v10__stage{ font-family:var(--font-body); font-weight:700; font-size:9.5px; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-gold); flex:none; }
  .v10__box{ flex:1 1 auto; display:block; padding:.75rem 1.1rem 1.2rem; }
  .v10__name{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.12rem;
    line-height:1.2; color:var(--color-white); }
  .v10__name em{ font-style:italic; color:var(--color-gold); }
  .v10__line{ display:block; margin-top:.4rem; font-size:12px; line-height:1.45; color:rgba(255,255,255,.62); }
  .v10__say{ display:block; margin-top:.6rem; font-family:var(--font-display); font-style:italic;
    font-size:13px; line-height:1.45; color:rgba(255,255,255,.86); }

  /* ── 11 the framed print ─────────────────────────────────────────── */
  .v11__a{ display:flex; flex-direction:column; width:100%; border-radius:var(--card-radius);
    background:var(--color-navy-deep); padding:.55rem .55rem 0;
    box-shadow:0 20px 44px -34px rgba(var(--veil-rgb), .55); transition:transform .45s var(--ease); }
  .v11__a:hover{ transform:translateY(-5px); }
  .v11__mount{ display:block; aspect-ratio:4/3; overflow:hidden; border-radius:calc(var(--card-radius) - 6px);
    background:color-mix(in srgb, var(--color-navy) 70%, var(--color-white)); }
  .v11__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .v11__box{ flex:1 1 auto; display:block; padding:.95rem .6rem 1.15rem; }
  .v11__stage{ display:block; font-family:var(--font-body); font-weight:700; font-size:9.5px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.35rem; }
  .v11__name{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.1rem;
    line-height:1.2; color:var(--color-white); }
  .v11__name em{ font-style:italic; color:var(--color-gold); }
  .v11__line{ display:block; margin-top:.4rem; font-size:12px; line-height:1.45; color:rgba(255,255,255,.62); }

  /* ── 12 the promise ──────────────────────────────────────────────── */
  .v12__a{ display:flex; flex-direction:column; width:100%; border-radius:var(--card-radius);
    overflow:hidden; background:var(--color-navy-deep);
    box-shadow:0 20px 44px -34px rgba(var(--veil-rgb), .55); transition:transform .45s var(--ease); }
  .v12__a:hover{ transform:translateY(-5px); }
  .v12__win{ position:relative; display:block; aspect-ratio:4/3; overflow:hidden; }
  .v12__img{ width:100%; height:100%; object-fit:cover; display:block; transition:transform 1s var(--ease); }
  .v12__a:hover .v12__img{ transform:scale(1.04); }
  .v12__fade{ position:absolute; left:0; right:0; bottom:-1px; height:52%;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),0) 0%, rgba(var(--veil-rgb),.5) 44%,
      rgba(var(--veil-rgb),.9) 80%, var(--color-navy-deep) 100%); }
  .v12__stage{ position:absolute; right:1rem; top:1rem; padding:.3rem .6rem; border-radius:100px;
    background:rgba(var(--veil-rgb), .72); color:var(--color-gold);
    font-family:var(--font-body); font-weight:700; font-size:9.5px; letter-spacing:.16em;
    text-transform:uppercase; }
  .v12__box{ flex:1 1 auto; display:block; padding:.1rem 1.15rem 1.25rem; }
  .v12__say{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.16rem;
    line-height:1.24; color:var(--color-white); }
  .v12__rule{ display:block; width:30px; height:1px; margin:.85rem 0 .7rem;
    background:color-mix(in srgb, var(--color-gold) 70%, transparent); }
  .v12__name{ display:block; font-family:var(--font-body); font-weight:700; font-size:11px;
    letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.9); }
  .v12__name em{ font-style:normal; color:var(--color-gold); }
  .v12__line{ display:block; margin-top:.35rem; font-size:12px; line-height:1.45; color:rgba(255,255,255,.6); }

  /* ── 13: ten, with a rule under the breeding ────────────────────────
     Everything else is variation ten, unchanged. */
  .v13__a{ display:flex; flex-direction:column; width:100%; border-radius:var(--card-radius);
    overflow:hidden; background:var(--color-navy-deep);
    box-shadow:0 20px 44px -34px rgba(var(--veil-rgb), .55); transition:transform .45s var(--ease); }
  .v13__a:hover{ transform:translateY(-5px); }
  .v13__win{ position:relative; display:block; aspect-ratio:4/3; overflow:hidden; }
  .v13__img{ width:100%; height:100%; object-fit:cover; display:block;
    transition:transform 1s var(--ease); }
  .v13__a:hover .v13__img{ transform:scale(1.04); }
  .v13__fade{ position:absolute; left:0; right:0; bottom:-1px; height:50%;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),0) 0%, rgba(var(--veil-rgb),.55) 46%,
      rgba(var(--veil-rgb),.92) 82%, var(--color-navy-deep) 100%); }
  .v13__seam{ position:relative; display:flex; align-items:center; gap:.7rem;
    padding:0 1.1rem; margin-top:-.1rem; }
  .v13__seam::after{ content:""; flex:1 1 auto; height:1px;
    background:color-mix(in srgb, var(--color-gold) 65%, transparent); }
  /* The stage as a label rather than as loose type, in the shape the site
     already uses for a tag: gold with navy ink, the same pairing as the box
     at the foot and as every button on the site. */
  .v13__stage{ flex:none; display:inline-flex; align-items:center;
    padding:.34em .8em; border-radius:var(--ctl-radius);
    background:var(--color-gold); color:var(--color-navy);
    font-family:var(--font-body); font-weight:700; font-size:9.5px;
    letter-spacing:.16em; text-transform:uppercase; }
  .v13__box{ flex:1 1 auto; display:block; padding:.75rem 1.1rem 1.2rem; }
  .v13__name{ display:block; font-family:var(--font-display); font-weight:400;
    font-size:1.12rem; line-height:1.2; color:var(--color-white); }
  .v13__name em{ font-style:italic; color:var(--color-gold); }
  .v13__line{ display:block; margin-top:.4rem; margin-bottom:.9rem; font-size:12px;
    line-height:1.45; color:rgba(255,255,255,.62); }
  .v13__say{ display:block; font-family:var(--font-display); font-style:italic;
    font-size:13px; line-height:1.45; }

  /* Their sentence in the accent colour instead of under a second rule.
     Gold carries navy ink everywhere on this site, buttons included, so it
     does here too: 5.70:1, and the seam above stays the only line. */
  /* One height for every box in the row: it is pinned to the foot of the
     card and reserves two lines, so a one line sentence and a two line one
     draw the same block. Their longest sentence, at 109 characters, still
     takes a third line rather than being cut: the words are theirs. */
  .v13__box{ display:flex; flex-direction:column; }
  .v13__say{ margin-top:auto; padding:.62rem .8rem; border-radius:var(--card-radius);
    background:var(--color-gold); color:var(--color-navy);
    min-height:calc(2 * 1.45 * 13px + 1.24rem); display:flex; align-items:center;
    text-wrap:balance; }
  /* ── 6 the stack ─────────────────────────────────────────────────── */
  .v6__a{ display:grid; gap:.55rem; }
  .v6__win{ position:relative; display:block; aspect-ratio:3/2; overflow:hidden;
    border-radius:var(--card-radius); background:var(--color-navy-deep); }
  .v6__img{ width:100%; height:100%; object-fit:cover; display:block; transition:transform .8s var(--ease); }
  .v6__a:hover .v6__img{ transform:scale(1.04); }
  .v6__name{ position:absolute; left:0; right:0; bottom:0; padding:2.4rem .95rem .85rem;
    font-family:var(--font-display); font-weight:400; font-size:1.02rem; line-height:1.2;
    color:var(--color-white);
    background:linear-gradient(180deg, rgba(var(--veil-rgb),0) 0%, rgba(var(--veil-rgb),.72) 46%, rgba(var(--veil-rgb),.92) 100%); }
  .v6__name em{ font-style:italic; color:var(--color-gold); }
  .v6__box{ display:grid; grid-template-columns:1fr 1fr; gap:.9rem; padding:.85rem 1rem .95rem;
    border-radius:var(--card-radius); background:color-mix(in srgb, var(--color-navy) 5%, var(--color-base));
    border:1px solid var(--color-line); }
  .v6__cell{ display:block; min-width:0; }
  .v6__k{ display:block; font-family:var(--font-body); font-weight:700; font-size:9.5px;
    letter-spacing:.16em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.2rem; }
  .v6__v{ display:block; font-size:12.5px; line-height:1.4; color:var(--color-ink); }
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="internal-doc" content="true">
<meta name="robots" content="noindex, nofollow">
<title>Embryo cards, six ways | Stud Von Axe</title>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${homeCss}${CSS}</style>
</head>
<body>

<header class="v-head">
  <p class="v-num">For Mark, to choose from</p>
  <h1>Six ways to draw <em>a cross</em></h1>
  <p>All six on the real crosses, in the site's own tokens, so what you see is what it will look like.
  Each shows four: one frozen, one carrying, one with a long dam name, and one with no photograph at all,
  which is the case that breaks a design quietly. Every card links to the cross's own page.</p>
  <p style="margin-top:.8rem">On the filters: an embryo is never sold in the way a foal is, so Available
  and Sold do not belong on that archive. What belongs there is the stage, Frozen against Carrying, and
  the damline. That comes next, once a card is chosen.</p>
</header>

<main>
${VARIANTS.map((v, i) => `
<section class="v-sec" id="${v.id}">
  <p class="v-num">Variation ${['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen'][i]}</p>
  <h2>${esc(v.title)}</h2>
  <p class="v-note">${esc(v.note)}</p>
  <ul class="v-grid ${v.grid}">
${SAMPLE.map(v.card).join('\n')}
  </ul>
</section>`).join('\n')}
</main>

<footer class="v-head" style="padding-bottom:4rem">
  <p style="font-size:14px">Say a number and it becomes the embryo archive, and then the same recipe is
  offered for the foals and the mares with the fields each of those needs.</p>
</footer>

</body>
</html>
`;

writeFileSync(join(root, '04-embryo-cards.html'), html);
console.log(`built 04-embryo-cards.html with ${VARIANTS.length} variations on ${SAMPLE.length} real crosses`);
