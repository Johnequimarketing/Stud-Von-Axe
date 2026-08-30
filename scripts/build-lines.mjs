#!/usr/bin/env node
/* Build 05-embryo-lines.html: six ways to show the two lines behind a cross,
 * the sire's on the left and the dam's on the right, for the section that
 * goes under the pedigree on an embryo page.
 *
 * What there is to work with, honestly:
 *   dam  — her photograph, her breeding and up to five paragraphs of their
 *          own writing on her family. All fifteen dams have this.
 *   sire — the name, and his half of the pedigree table. No photograph and
 *          no text on their site at all, for any of the thirteen.
 * So every variation has to hold a filled column beside an empty one, and
 * the empty one is what to judge them on. The sire's side fills from
 * horses-extra.js, by hand or later from Horsetelex.
 *
 * Run: node scripts/build-lines.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, esc } from './lib/shell.mjs';

const HORSES = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();
const EXTRA = new Function(readFileSync(join(root, 'horses-extra.js'), 'utf-8') + '; return HORSES_EXTRA;')();

const SMALL = new Set(['de','van','vd',"van't",'vant','het','du','des','la','le','di','da','il','der','den']);
const CAPS = new Set(['z','sva','jt','vdl','ht','ii','iii','iv']);
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
const flat = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const CROSS = HORSES.find((h) => h.slug === 'big-star-x-cortina-de-jolie-z');
const sireName = name(CROSS.name.split(/\s+X\s+/i)[0]);
const damRaw = CROSS.name.split(/\s+X\s+/i).slice(1).join(' x ').trim();
const dam = HORSES.find((m) => flat(m.name) === flat(damRaw))
         || HORSES.find((m) => flat(m.name).startsWith(flat(damRaw).slice(0, 12)));
const damName = name(dam ? dam.name : damRaw);
const damPhoto = dam && dam.photos[0] ? `/${dam.photos[0]}` : '';
const damText = dam && dam.body.length ? theirs(dam.body[1] || dam.body[0]) : theirs(CROSS.tagline);
const damLine = dam && dam.genetics ? name(theirs(dam.genetics)) : '';
const sireText = (EXTRA.sires[CROSS.name.split(/\s+X\s+/i)[0].trim()] || {}).line || '';
const sirePed = CROSS.pedigree
  ? [CROSS.pedigree.sireSire, CROSS.pedigree.sireDam].filter(Boolean).map(name).join(' x ')
  : '';

/* The empty column, drawn rather than left blank, because it is the state
   thirteen of the thirteen sires are in today. */
const WAITING = 'Their site carries no text and no photograph for the sire. This fills from horses-extra.js, by hand or from Horsetelex once the link is in.';

const pic = (src, alt, cls) => src
  ? `<img class="${cls}" src="${src}" alt="${esc(alt)}" loading="lazy">`
  : `<span class="${cls} l-none"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span>`;

const COLS = [
  { k: 'Sire line',  n: sireName, ped: sirePed, img: '',        text: sireText, empty: !sireText },
  { k: 'Dam line',   n: damName,  ped: damLine, img: damPhoto,  text: damText,  empty: false },
];

const VARIANTS = [
  {
    id: 'pair', title: 'The pair',
    note: 'Two equal plates, photograph over words, label above the name. The plainest reading of what Mark asked for, and the one that survives a sire with nothing in him: the empty column keeps the same shape as the full one instead of collapsing.',
    card: (c) => `
      <div class="l1">
        <span class="l1__win">${pic(c.img, c.n, 'l1__img')}</span>
        <span class="l1__k">${esc(c.k)}</span>
        <h3 class="l1__n">${esc(c.n)}</h3>
        ${c.ped ? `<span class="l1__p">${esc(c.ped)}</span>` : ''}
        <p class="l1__t${c.empty ? ' is-waiting' : ''}">${esc(c.empty ? WAITING : c.text)}</p>
      </div>`,
  },
  {
    id: 'scale', title: 'The weighted pair',
    note: 'The same, at forty against sixty. A buyer of an embryo is buying the dam line: it is where the produce record is, where their own writing is, and where the photograph is. Giving the two columns equal width says they carry equal weight, and they do not.',
    card: (c) => `
      <div class="l2 ${c.k === 'Dam line' ? 'l2--wide' : ''}">
        <span class="l2__win">${pic(c.img, c.n, 'l2__img')}</span>
        <span class="l2__k">${esc(c.k)}</span>
        <h3 class="l2__n">${esc(c.n)}</h3>
        ${c.ped ? `<span class="l2__p">${esc(c.ped)}</span>` : ''}
        <p class="l2__t${c.empty ? ' is-waiting' : ''}">${esc(c.empty ? WAITING : c.text)}</p>
      </div>`,
  },
  {
    id: 'plate', title: 'The one plate',
    note: 'Both lines on a single navy plate with a gold rule between them, which is the cross itself drawn as a divider. It reads as one object rather than two cards, and it sits directly under the pedigree without a second edge in between.',
    card: (c) => `
      <div class="l3">
        <span class="l3__win">${pic(c.img, c.n, 'l3__img')}</span>
        <span class="l3__k">${esc(c.k)}</span>
        <h3 class="l3__n">${esc(c.n)}</h3>
        ${c.ped ? `<span class="l3__p">${esc(c.ped)}</span>` : ''}
        <p class="l3__t${c.empty ? ' is-waiting' : ''}">${esc(c.empty ? WAITING : c.text)}</p>
      </div>`,
  },
  {
    id: 'welded', title: 'Two welded cards',
    note: 'The card the archive already uses, at section size: the photograph fading into navy and the words carrying on out of it. Nothing new is introduced, which is worth something on a page that already has a hero, a picture block, a dam plate and a pedigree.',
    card: (c) => `
      <div class="l4">
        <span class="l4__win">${pic(c.img, c.n, 'l4__img')}<span class="l4__fade" aria-hidden="true"></span></span>
        <span class="l4__box">
          <span class="l4__k">${esc(c.k)}</span>
          <h3 class="l4__n">${esc(c.n)}</h3>
          ${c.ped ? `<span class="l4__p">${esc(c.ped)}</span>` : ''}
          <p class="l4__t${c.empty ? ' is-waiting' : ''}">${esc(c.empty ? WAITING : c.text)}</p>
        </span>
      </div>`,
  },
  {
    id: 'mirror', title: 'The mirror',
    note: 'Photographs to the outside, words to the middle, so the two columns lean into each other the way a pairing does. It is the only one of the six where the layout says something about the subject rather than just holding it.',
    card: (c, i) => `
      <div class="l5 ${i ? 'l5--r' : ''}">
        <span class="l5__win">${pic(c.img, c.n, 'l5__img')}</span>
        <span class="l5__body">
          <span class="l5__k">${esc(c.k)}</span>
          <h3 class="l5__n">${esc(c.n)}</h3>
          ${c.ped ? `<span class="l5__p">${esc(c.ped)}</span>` : ''}
          <p class="l5__t${c.empty ? ' is-waiting' : ''}">${esc(c.empty ? WAITING : c.text)}</p>
        </span>
      </div>`,
  },
  {
    id: 'ledger', title: 'The ledger',
    note: 'No photographs at all: two columns of type under one gold rule, names as headings. It is the only variation that does not have a hole in it today, because there is no photograph of any of the thirteen sires, and it is the one that will still look right when there is.',
    card: (c) => `
      <div class="l6">
        <span class="l6__k">${esc(c.k)}</span>
        <h3 class="l6__n">${esc(c.n)}</h3>
        ${c.ped ? `<span class="l6__p">${esc(c.ped)}</span>` : ''}
        <span class="l6__rule" aria-hidden="true"></span>
        <p class="l6__t${c.empty ? ' is-waiting' : ''}">${esc(c.empty ? WAITING : c.text)}</p>
      </div>`,
  },
];

const CSS = `
  body{ background:var(--color-base); }
  .l-head{ width:min(var(--wrap), 100% - (2*var(--gutter))); margin:0 auto; padding:clamp(3rem,7vh,5rem) 0 1rem; }
  .l-head h1{ font-family:var(--font-display); font-weight:400; font-size:clamp(1.9rem,3vw+.8rem,2.8rem);
    line-height:1.05; letter-spacing:-.02em; color:var(--color-ink); margin:.5rem 0 .8rem; }
  .l-head h1 em{ font-style:italic; color:var(--color-gold); }
  .l-head p{ max-width:64ch; color:var(--color-ink-soft); font-size:16px; margin:0 0 .7rem; }
  .l-sec{ width:min(var(--wrap), 100% - (2*var(--gutter))); margin:0 auto;
    padding:clamp(2.4rem,5vw,3.6rem) 0; border-top:1px solid var(--color-line); }
  .l-num{ font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.22em;
    text-transform:uppercase; color:var(--color-gold); margin:0 0 .4rem; }
  .l-sec h2{ font-family:var(--font-display); font-weight:400; font-size:clamp(1.4rem,1.8vw+.7rem,1.9rem);
    color:var(--color-ink); margin:0 0 .6rem; }
  .l-note{ max-width:72ch; color:var(--color-ink-soft); font-size:15px; line-height:1.6; margin:0 0 1.8rem; }
  .l-grid{ display:grid; gap:clamp(1.1rem,2vw,1.6rem); }
  @media (min-width:820px){ .l-grid{ grid-template-columns:1fr 1fr; } }
  .l-none{ display:grid; place-items:center; background:var(--color-navy-deep); }
  .l-none img{ width:auto; height:38%; max-height:70px; opacity:.16; }
  .is-waiting{ font-style:italic; opacity:.62; }

  /* shared type */
  .l1__k,.l2__k,.l3__k,.l4__k,.l5__k,.l6__k{ display:block; font-family:var(--font-body); font-weight:700;
    font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--color-gold); }
  .l1__n,.l2__n,.l3__n,.l4__n,.l5__n,.l6__n{ margin:.35rem 0 .2rem; font-family:var(--font-display);
    font-weight:400; font-size:1.3rem; line-height:1.15; }
  .l1__p,.l2__p,.l3__p,.l4__p,.l5__p,.l6__p{ display:block; font-family:var(--font-display);
    font-style:italic; font-size:13px; color:var(--color-gold); margin-bottom:.7rem; }
  .l1__t,.l2__t,.l3__t,.l4__t,.l5__t,.l6__t{ margin:0; font-size:14.5px; line-height:1.6; }

  /* 1 the pair */
  .l1{ background:var(--color-base); border-radius:var(--plate-radius); overflow:hidden;
    box-shadow:0 1px 0 var(--color-line); }
  .l1__win{ display:block; aspect-ratio:4/3; }
  .l1__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .l1 > :not(.l1__win){ margin-inline:1.2rem; }
  .l1__k{ margin-top:1.1rem; }
  .l1__n{ color:var(--color-ink); }
  .l1__t{ color:var(--color-ink-soft); padding-bottom:1.3rem; }

  /* 2 weighted */
  @media (min-width:820px){ .l-g2{ grid-template-columns:.8fr 1.2fr; } }
  .l2{ background:var(--color-base); border-radius:var(--plate-radius); overflow:hidden;
    box-shadow:0 1px 0 var(--color-line); }
  .l2__win{ display:block; aspect-ratio:4/3; }
  .l2--wide .l2__win{ aspect-ratio:16/9; }
  .l2__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .l2 > :not(.l2__win){ margin-inline:1.2rem; }
  .l2__k{ margin-top:1.1rem; }
  .l2__n{ color:var(--color-ink); }
  .l2__t{ color:var(--color-ink-soft); padding-bottom:1.3rem; }

  /* 3 one plate */
  .l-plate{ background:var(--color-navy-deep); border-radius:var(--plate-radius);
    padding:clamp(1.4rem,3vw,2.2rem); display:grid; gap:clamp(1.4rem,3vw,2.4rem); }
  @media (min-width:820px){ .l-plate{ grid-template-columns:1fr 1px 1fr; } }
  .l-rule{ display:none; background:color-mix(in srgb, var(--color-gold) 55%, transparent); }
  @media (min-width:820px){ .l-rule{ display:block; } }
  .l3__win{ display:block; aspect-ratio:4/3; border-radius:var(--card-radius); overflow:hidden;
    margin-bottom:1rem; }
  .l3__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .l3__n{ color:var(--color-white); }
  .l3__t{ color:rgba(255,255,255,.72); }

  /* 4 welded */
  .l4{ border-radius:var(--plate-radius); overflow:hidden; background:var(--color-navy-deep); }
  .l4__win{ position:relative; display:block; aspect-ratio:16/9; }
  .l4__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .l4__fade{ position:absolute; left:0; right:0; bottom:-1px; height:56%;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),0), rgba(var(--veil-rgb),.9) 84%, var(--color-navy-deep) 100%); }
  .l4__box{ display:block; padding:.2rem 1.2rem 1.3rem; }
  .l4__n{ color:var(--color-white); }
  .l4__t{ color:rgba(255,255,255,.72); }

  /* 5 mirror */
  .l5{ display:grid; gap:1rem; align-items:center; }
  @media (min-width:560px){ .l5{ grid-template-columns:.85fr 1.15fr; } .l5--r{ grid-template-columns:1.15fr .85fr; } }
  .l5__win{ display:block; aspect-ratio:1/1; border-radius:var(--plate-radius); overflow:hidden; }
  .l5--r .l5__win{ order:2; }
  .l5__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .l5__body{ display:block; min-width:0; }
  .l5--r .l5__body{ order:1; text-align:right; }
  .l5__n{ color:var(--color-ink); }
  .l5__t{ color:var(--color-ink-soft); }

  /* 6 ledger */
  .l6{ display:block; }
  .l6__n{ color:var(--color-ink); }
  .l6__rule{ display:block; height:1px; margin:.2rem 0 .9rem;
    background:color-mix(in srgb, var(--color-gold) 65%, transparent); }
  .l6__t{ color:var(--color-ink-soft); }
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="internal-doc" content="true">
<meta name="robots" content="noindex, nofollow">
<title>The two lines, six ways | Stud Von Axe</title>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${homeCss}${CSS}</style>
</head>
<body>

<header class="l-head">
  <p class="l-num">For Mark, to choose from</p>
  <h1>The two lines behind <em>a cross</em></h1>
  <p>Sire on the left, dam on the right, for the section under the pedigree. All six on the real cross
  ${esc(sireName)} &times; ${esc(damName)}.</p>
  <p><b>Read the left column first.</b> Their site carries no photograph and no text for any of the
  thirteen stallions, so every one of these has to hold a full column beside an empty one, and that is
  what separates them. The dam's side is real: her photograph, her breeding and their own paragraph on
  her family, which all fifteen dams have. The sire's side fills from <code>horses-extra.js</code>, by
  hand or from Horsetelex once the link is in.</p>
</header>

<main>
${VARIANTS.map((v, i) => `
<section class="l-sec" id="${v.id}">
  <p class="l-num">Variation ${['one','two','three','four','five','six'][i]}</p>
  <h2>${esc(v.title)}</h2>
  <p class="l-note">${esc(v.note)}</p>
  ${v.id === 'plate'
    ? `<div class="l-plate">${v.card(COLS[0], 0)}<span class="l-rule" aria-hidden="true"></span>${v.card(COLS[1], 1)}</div>`
    : `<div class="l-grid${v.id === 'scale' ? ' l-g2' : ''}">${COLS.map(v.card).join('')}</div>`}
</section>`).join('\n')}
</main>

<footer class="l-head" style="padding-bottom:4rem">
  <p style="font-size:14px">Say a number and it goes under the pedigree on all fifteen embryo pages.</p>
</footer>

</body>
</html>
`;

writeFileSync(join(root, '05-embryo-lines.html'), html);
console.log('built 05-embryo-lines.html with 6 variations');
