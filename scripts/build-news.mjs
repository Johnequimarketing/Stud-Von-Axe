#!/usr/bin/env node
/* Build the news pages from news-data.js: the archive and one page per item.
 *
 * Generated on purpose: five static files that share a shell drift apart the
 * moment someone edits one by hand. This script is the only writer. To change
 * a story, edit news-data.js and run:  node scripts/build-news.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/* The data file is plain browser JS (`var NEWS = [...]`); evaluate it. */
const NEWS = new Function(readFileSync(join(root, 'news-data.js'), 'utf-8') + '; return NEWS;')();

/* Tokens come from the homepage, which is the source of truth. */
const home = readFileSync(join(root, 'index.html'), 'utf-8');
const rootBlock = home.match(/  :root\{[\s\S]*?\n  \}/)[0];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* One italic accent word per title, the house heading rule. The word is
   chosen per story rather than guessed by position. */
const ACCENT = {
  'contouch-top-price': 'top price',
  'calleryama-wins-barcelona': 'Nations Cup',
  'results-from-lanaken': 'Lanaken',
  'icsi-semen-available': 'ICSI',
};
const accent = (item) => {
  const w = ACCENT[item.slug];
  return w && item.title.includes(w)
    ? esc(item.title).replace(esc(w), `<em>${esc(w)}</em>`)
    : esc(item.title);
};

const CSS = `
${rootBlock}
  *{ box-sizing:border-box; }
  html{ scroll-behavior:smooth; }
  body{
    margin:0; background:var(--color-base); color:var(--color-ink);
    font-family:var(--font-body); font-size:16px; line-height:1.62;
  }
  img{ max-width:100%; display:block; }
  ul,ol{ margin:0; padding:0; list-style:none; }
  a{ color:inherit; }
  :focus-visible{ outline:2px solid var(--color-gold); outline-offset:3px; }
  .wrap{ width:min(var(--wrap),100% - (2*var(--gutter))); margin-inline:auto; }

  /* the eyebrow, the one recipe from the homepage */
  .plaque{
    margin:0; font-family:var(--font-body); font-size:11px; font-weight:700;
    letter-spacing:.22em; text-transform:uppercase; color:var(--color-gold);
  }

  /* ---- header: the homepage's plate, on the page ground ---- */
  .hd{ border-bottom:1px solid var(--color-line); }
  .hd__row{
    display:flex; align-items:center; justify-content:space-between; gap:1.1rem;
    padding:.65rem var(--gutter);
  }
  .brand img{ display:block; width:132px; height:auto; }
  .hd a{ text-decoration:none; }
  .hd__nav{ display:flex; gap:clamp(.9rem,2vw,1.6rem); }
  .hd__nav a{ font-size:14px; font-weight:500; color:var(--color-ink-soft); }
  .hd__nav a:hover{ color:var(--color-navy); }
  .btn-gold{
    display:inline-flex; align-items:center; gap:.5em;
    background:var(--color-gold); color:var(--color-navy-deep);
    border:1px solid var(--color-gold); border-radius:100px;
    padding:.8em 1.5em; font-size:11.5px; font-weight:700;
    letter-spacing:.12em; text-transform:uppercase;
    transition:background .3s var(--ease), border-color .3s var(--ease);
  }
  .btn-gold:hover{ background:var(--color-white); border-color:var(--color-white); }
  @media (max-width:720px){ .hd__nav{ display:none; } }

  /* ---- the archive grid, the homepage's news card ---- */
  .arch{ padding:clamp(2.6rem,6vw,4.4rem) 0 clamp(3rem,7vw,5rem); }
  .arch__h{
    margin:.5rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(2rem,3.4vw + 1rem,3.1rem); line-height:1.05;
    letter-spacing:-.02em; color:var(--color-navy); max-width:16ch;
  }
  .arch__h em{ font-style:italic; color:var(--color-gold); }
  .arch__intro{ margin:.9rem 0 0; color:var(--color-ink-soft); max-width:60ch; }
  .arch__grid{
    display:grid; gap:var(--card-gap); margin-top:clamp(1.8rem,3.5vw,2.6rem);
  }
  @media (min-width:680px){ .arch__grid{ grid-template-columns:1fr 1fr; } }
  @media (min-width:1040px){ .arch__grid{ grid-template-columns:repeat(3,minmax(0,1fr)); } }

  .nw__card{
    display:flex; flex-direction:column; width:100%; text-decoration:none;
    border-radius:var(--card-radius); background:var(--color-white); overflow:hidden;
    box-shadow:inset 0 0 0 1px var(--color-line), 0 16px 38px -22px rgba(10,21,38,.5);
    transition:transform .4s var(--ease), box-shadow .4s var(--ease);
  }
  .nw__card:hover, .nw__card:focus-visible{
    transform:translateY(-6px);
    box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 45%, transparent),
               0 26px 52px -20px rgba(10,21,38,.6);
  }
  .nw__win{ position:relative; display:block; aspect-ratio:16/10; overflow:hidden; }
  .nw__win img{
    width:100%; height:100%; object-fit:cover;
    transform:scale(1.03); transition:transform 1.4s var(--ease);
  }
  .nw__card:hover .nw__win img{ transform:scale(1.08); }
  .nw__body{ display:flex; flex-direction:column; flex:1; padding:clamp(1.05rem,2vw,1.4rem); }
  .nw__v{
    display:block; font-family:var(--font-body); font-size:10px; font-weight:700;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold);
  }
  .nw__t{
    display:block; margin:.6rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.1rem,1.5vw,1.3rem); line-height:1.14; color:var(--color-navy);
  }
  .nw__d{ display:block; margin-top:.5rem; font-size:14px; color:var(--color-ink-soft); }
  .nw__go{
    display:block; margin-top:auto; padding-top:1rem;
    font-size:12.5px; font-weight:700; letter-spacing:.06em; color:var(--color-navy);
  }
  .nw__go .a{ display:inline-block; transition:transform .3s var(--ease); }
  .nw__card:hover .nw__go .a{ transform:translateX(4px); }
  .hz__ph{
    position:absolute; right:10px; top:10px; z-index:2;
    padding:.36em .75em; border-radius:999px;
    background:rgba(10,21,38,.72);
    -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);
    font-family:var(--font-body); font-size:9px; font-weight:700;
    letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.82);
  }

  /* ---- the single ---- */
  .art{ padding:clamp(2.4rem,5vw,3.6rem) 0 clamp(3rem,7vw,5rem); }
  .art__crumb{ font-size:13px; color:var(--color-ink-soft); }
  .art__crumb a{ color:var(--color-navy); text-decoration:none; border-bottom:1px solid var(--color-line); }
  .art__crumb a:hover{ border-color:var(--color-gold); }
  .art__head{ max-width:var(--art-measure); margin-top:clamp(1.4rem,3vw,2rem); }
  .art h1{
    margin:.6rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(2rem,3.4vw + 1rem,3.2rem); line-height:1.04;
    letter-spacing:-.02em; color:var(--color-navy); text-wrap:balance;
  }
  .art h1 em{ font-style:italic; color:var(--color-gold); }
  .art__fig{
    position:relative; overflow:hidden; border-radius:var(--plate-radius);
    margin:clamp(1.6rem,3.5vw,2.4rem) 0 0; background:var(--color-navy-deep);
    box-shadow:0 30px 70px -44px rgba(10,21,38,.6);
  }
  .art__fig img{ width:100%; height:auto; aspect-ratio:16/9; object-fit:cover; }
  .art__body{ max-width:var(--art-measure); margin-top:clamp(1.6rem,3.5vw,2.4rem); }
  .art__body p{ margin:0 0 1.1em; font-size:17px; color:var(--color-ink); }
  .art__body p:last-child{ margin-bottom:0; }

  /* the invitation, the homepage's plate */
  .pcta{
    position:relative; isolation:isolate; overflow:hidden;
    margin-top:clamp(2.4rem,5vw,3.6rem);
    border-radius:var(--plate-radius);
    padding:clamp(1.8rem,4vw,3.2rem);
    background:var(--color-navy-deep); color:var(--color-white);
    display:grid; gap:clamp(1.4rem,3vw,2.6rem); align-items:center;
  }
  @media (min-width:900px){ .pcta{ grid-template-columns:1.3fr .7fr; } }
  .pcta__h{
    margin:0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,2.2vw + .6rem,2.3rem); line-height:1.05;
    letter-spacing:-.02em; color:var(--color-white); max-width:16ch;
  }
  .pcta__h em{ font-style:italic; color:var(--color-gold); }
  .pcta__d{ margin:.8rem 0 0; font-size:15px; color:rgba(255,255,255,.76); max-width:44ch; }
  .btn-ghost{
    display:inline-flex; align-items:center; gap:.5em;
    background:transparent; color:var(--color-white);
    border:1px solid var(--color-line-invert); border-radius:100px;
    padding:.8em 1.5em; font-size:11.5px; font-weight:700;
    letter-spacing:.12em; text-transform:uppercase; text-decoration:none;
    transition:background .3s var(--ease), border-color .3s var(--ease);
  }
  .btn-ghost:hover{ background:rgba(255,255,255,.1); border-color:var(--color-white); }
  .pcta__acts{ display:flex; flex-wrap:wrap; gap:.7rem; }

  /* prev and next between stories */
  .art__nav{
    display:grid; gap:var(--card-gap); margin-top:clamp(2rem,4vw,3rem);
    padding-top:clamp(1.4rem,3vw,2rem); border-top:1px solid var(--color-line);
  }
  @media (min-width:680px){ .art__nav{ grid-template-columns:1fr 1fr; } }
  .art__navA{
    display:block; text-decoration:none; padding:1rem 1.2rem;
    border-radius:var(--card-radius); background:var(--color-white);
    box-shadow:inset 0 0 0 1px var(--color-line);
    transition:box-shadow .3s var(--ease), transform .3s var(--ease);
  }
  .art__navA:hover{
    transform:translateY(-3px);
    box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 45%, transparent);
  }
  .art__navA--next{ text-align:right; }
  .art__navK{ display:block; font-size:10px; font-weight:700; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-gold); }
  .art__navT{ display:block; margin-top:.3rem; font-family:var(--font-display);
    font-size:1.05rem; color:var(--color-navy); line-height:1.2; }

  /* ---- footer, the short form ---- */
  .ft{ margin-top:clamp(2rem,5vw,3rem); background:var(--color-navy); color:var(--color-ink-invert); }
  .ft__row{
    display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between;
    gap:1rem 2rem; padding:1.6rem var(--gutter);
  }
  .ft a{ color:var(--color-ink-invert); text-decoration:none; opacity:.9; }
  .ft a:hover{ opacity:1; }
  .ft__nav{ display:flex; flex-wrap:wrap; gap:1rem 1.6rem; font-size:13.5px; }
  .ft__copy{ font-size:12.5px; opacity:.6; }
`;

const head = (title, desc, slug) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Stud Von Axe</title>
<meta name="description" content="${esc(desc)}">
<!-- CONCEPT, NOT LIVE. Remove the robots line on the day it goes live. -->
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://www.studvonaxe.it/news/${slug}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Stud Von Axe">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://www.studvonaxe.it/assets/img/hero-sport.jpg">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"NewsArticle","headline":${JSON.stringify(title)},
 "publisher":{"@type":"Organization","name":"Stud Von Axe"}}
<\/script>
<link rel="icon" type="image/png" sizes="32x32" href="../assets/logo/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>`;

const header = `<header class="hd">
  <div class="hd__row">
    <a href="../" class="brand" aria-label="Stud Von Axe home">
      <img src="../assets/logo/logo-horizontal-onlight.png" data-ground="light"
           alt="Von Axe, breeding and horse trading" width="132" height="58">
    </a>
    <nav class="hd__nav" aria-label="Main">
      <a href="../#about">About</a>
      <a href="../#horses">Horses</a>
      <a href="../#programme">Programme</a>
      <a href="./">News</a>
    </nav>
    <a href="../#contact" class="btn-gold">Contact us</a>
  </div>
</header>`;

const footer = `<footer class="ft">
  <div class="ft__row">
    <nav class="ft__nav" aria-label="Footer">
      <a href="../">Home</a>
      <a href="../#horses">Horses</a>
      <a href="./">News</a>
      <a href="../#contact">Contact</a>
    </nav>
    <p class="ft__copy">&#169; 2026 Stud Von Axe &middot; Made by <a href="https://equimarketing.com" target="_blank" rel="noopener">EquiMarketing</a></p>
  </div>
</footer>`;

mkdirSync(join(root, 'news'), { recursive: true });

/* ── the archive ─────────────────────────────────────────────────────── */
const cards = NEWS.map((n) => `      <li><a class="nw__card" href="${n.slug}">
        <span class="nw__win"${n.ph ? ' data-placeholder="true"' : ''}>
          <img src="../${n.img}" alt="${n.ph ? 'Placeholder photograph' : esc(n.title)}" loading="lazy">
          ${n.ph ? '<span class="hz__ph">Photo pending</span>' : ''}
        </span>
        <span class="nw__body">
          <span class="nw__v">${esc(n.eyebrow)}</span>
          <h2 class="nw__t">${esc(n.title)}</h2>
          <span class="nw__d">${esc(n.excerpt)}</span>
          <span class="nw__go">Read it <span class="a" aria-hidden="true">&rarr;</span></span>
        </span>
      </a></li>`).join('\n');

writeFileSync(join(root, 'news', 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
${head('News and results', 'Results in the ring, horses sold, and news from Desenzano and Lanaken.', '')}
</head>
<body>
${header}
<main class="wrap arch">
  <p class="plaque">News and results</p>
  <h1 class="arch__h">The latest from <em>both yards</em>.</h1>
  <p class="arch__intro">Results in the ring, horses sold, and news from Desenzano and Lanaken.
  Every item here is one the stud published itself.</p>
  <ul class="arch__grid">
${cards}
  </ul>
</main>
${footer}
</body>
</html>
`);

/* ── the singles ─────────────────────────────────────────────────────── */
NEWS.forEach((n, i) => {
  const prev = NEWS[(i - 1 + NEWS.length) % NEWS.length];
  const next = NEWS[(i + 1) % NEWS.length];
  const body = n.body.map((p) => `      <p>${esc(p)}</p>`).join('\n');
  writeFileSync(join(root, 'news', `${n.slug}.html`), `<!DOCTYPE html>
<html lang="en">
<head>
${head(n.title, n.excerpt, n.slug)}
</head>
<body>
${header}
<main class="wrap art">
  <p class="art__crumb"><a href="./">News</a> &middot; ${esc(n.eyebrow)}</p>
  <div class="art__head">
    <p class="plaque">${esc(n.eyebrow)}</p>
    <h1>${accent(n)}</h1>
  </div>
  <figure class="art__fig"${n.ph ? ' data-placeholder="true"' : ''}>
    <img src="../${n.img}" alt="${n.ph ? 'Placeholder photograph' : esc(n.title)}"
         ${n.ph ? '' : 'fetchpriority="high"'}>
    ${n.ph ? '<span class="hz__ph">Photo pending</span>' : ''}
  </figure>
  <div class="art__body">
${body}
  </div>

  <div class="pcta">
    <div>
      <h2 class="pcta__h">Tell us the horse you <em>have in mind</em>.</h2>
      <p class="pcta__d">A foal on the ground, a cross still to be made, or a mare to breed from.
      Say what you are after and we will tell you plainly what we have.</p>
    </div>
    <div class="pcta__acts">
      <a href="../#contact" class="btn-gold">Get in touch</a>
      <a href="https://wa.me/393495918565" target="_blank" rel="noopener" class="btn-ghost">Message on WhatsApp</a>
    </div>
  </div>

  <nav class="art__nav" aria-label="More news">
    <a class="art__navA" href="${prev.slug}">
      <span class="art__navK">&larr; Previous</span>
      <span class="art__navT">${esc(prev.title)}</span>
    </a>
    <a class="art__navA art__navA--next" href="${next.slug}">
      <span class="art__navK">Next &rarr;</span>
      <span class="art__navT">${esc(next.title)}</span>
    </a>
  </nav>
</main>
${footer}
</body>
</html>
`);
});

console.log(`built news/index.html and ${NEWS.length} single pages`);
