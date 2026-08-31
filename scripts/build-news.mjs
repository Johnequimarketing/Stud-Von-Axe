#!/usr/bin/env node
/* Build the news pages from news-data.js: the archive and one page per item.
 *
 * Generated on purpose: five static files that share a shell drift apart the
 * moment someone edits one by hand. This script is the only writer. To change
 * a story, edit news-data.js and run:  node scripts/build-news.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, pageHeroCss, header as headerHero, footer as footerHtml, esc, navScript }
  from './lib/shell.mjs';

/* The data file is plain browser JS (`var NEWS = [...]`); evaluate it. */
const NEWS = new Function(readFileSync(join(root, 'news-data.js'), 'utf-8') + '; return NEWS;')();

/* One italic accent word per title, the house heading rule. Chosen per
   story rather than guessed by position. */
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

const CSS = homeCss + pageHeroCss + `
  /* ── news pages only. Everything above is the homepage stylesheet. ── */

  /* The archive header IS the homepage header: the lifted stylesheet
     already carries its transparent and pinned states, and a script below
     pins it once the hero is behind it. Only the singles need anything of
     their own: no dark hero there, so the header is solid ivory from the
     first pixel, wearing the pinned colours permanently. */
  /* Both heroes start at the very top of the page and the header hangs
     over them, so their type needs to clear the bar. */
  .nhero > .wrap, .ahero__in{ padding-top:clamp(6rem,13vh,8rem); }

  /* The page hero and its two heading parts live in lib/shell.mjs:
     the about page wears the same one. */
  /* ---- the archive grid reuses .nw__card from the homepage sheet ---- */
  .arch{ padding:clamp(2rem,4.5vw,3.2rem) 0 clamp(3rem,7vw,5rem); }
  .arch__grid{ display:grid; gap:var(--card-gap); }
  @media (min-width:680px){ .arch__grid{ grid-template-columns:1fr 1fr; } }
  @media (min-width:1040px){ .arch__grid{ grid-template-columns:repeat(3,minmax(0,1fr)); } }

  /* ---- the single ----
     The photograph is the hero, with the title on it, and the story runs
     underneath in a readable measure. One photograph, one place, and the
     only things to fill in per story are a title, an eyebrow, the text and
     the picture. */
  .ahero{
    position:relative; isolation:isolate; overflow:hidden;
    min-height:clamp(400px, 56vh, 580px);
    display:grid; align-items:end; background:var(--color-navy-deep);
  }
  .ahero__bg{ position:absolute; inset:0; z-index:0; }
  .ahero__bg img{ width:100%; height:100%; object-fit:cover; }
  .ahero__veil{
    position:absolute; inset:0; z-index:1;
    background:linear-gradient(180deg,
      rgba(var(--veil-rgb), .44) 0%, rgba(var(--veil-rgb), .34) 34%, rgba(var(--veil-rgb), .88) 100%);
  }
  .ahero__in{
    position:relative; z-index:2;
    width:min(var(--wrap), 100% - (2 * var(--gutter))); margin-inline:auto;
    padding-bottom:clamp(1.8rem,4vw,2.8rem);
  }
  .ahero h1{
    margin:.5rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(2rem,3.4vw + 1rem,3.4rem); line-height:1.03;
    letter-spacing:-.02em; color:var(--color-white); max-width:18ch; text-wrap:balance;
  }
  .ahero h1 em{ font-style:italic; color:var(--color-gold); }
  .ahero .hz__ph{ top:auto; bottom:12px; right:12px; }
  .ahero__crumb{ margin:0 0 .9rem; font-size:12.5px; color:rgba(255,255,255,.66); }
  .ahero__crumb a{ color:var(--color-white); text-decoration:none;
    border-bottom:1px solid rgba(255,255,255,.35); padding-bottom:1px; }
  .ahero__crumb a:hover{ border-color:var(--color-gold); }
  .ahero__crumb span{ margin:0 .35rem; opacity:.5; }

  /* ---- the story: text one side, the picture the other ---- */
  .art{ padding:clamp(2.4rem,5vw,3.6rem) 0 clamp(3rem,7vw,5rem); }
  .art__grid{ display:grid; gap:clamp(1.8rem,4vw,3.2rem); align-items:start; }
  @media (min-width:900px){ .art__grid{ grid-template-columns:minmax(0,1fr) minmax(0,1fr); } }
  .art__body p{ margin:0 0 1.15em; font-size:17.5px; line-height:1.68; color:var(--color-ink); }
  .art__body p:first-child{ font-size:20px; line-height:1.55; color:var(--color-navy); }
  .art__body p:last-child{ margin-bottom:0; }
  /* The picture keeps its own proportions. No aspect-ratio and no cover
     crop: a landscape photograph stays landscape, an upright one stays
     upright, and the frame takes the shape of whatever is put in it. All
     four of these are landscape today, so the column is not forced into a
     tall crop that never suited them. */
  .art__pic{
    margin:0; position:relative; overflow:hidden;
    border-radius:var(--plate-radius);
    box-shadow:0 26px 60px -40px rgba(var(--veil-rgb), .6);
  }
  .art__pic img{ width:100%; height:auto; display:block; }

  /* ---- prev and next ----
     The same card the archive uses, laid on its side: the photograph on
     one end, the label and the title on the other, mirrored so the pair
     reads outward from the middle of the page. */
  .art__nav{
    display:grid; gap:var(--card-gap); margin-top:clamp(2rem,4vw,3rem);
    padding-top:clamp(1.4rem,3vw,2rem); border-top:1px solid var(--color-line);
  }
  @media (min-width:680px){ .art__nav{ grid-template-columns:1fr 1fr; } }
  .art__navA{
    display:flex; align-items:stretch; gap:0; overflow:hidden;
    text-decoration:none; border-radius:var(--card-radius);
    background:var(--color-white);
    box-shadow:inset 0 0 0 1px var(--color-line), 0 16px 38px -26px rgba(var(--veil-rgb), .45);
    transition:box-shadow .35s var(--ease), transform .35s var(--ease);
  }
  .art__navA:hover, .art__navA:focus-visible{
    transform:translateY(-4px);
    box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 45%, transparent),
               0 26px 52px -24px rgba(var(--veil-rgb), .55);
  }
  .art__navPic{ position:relative; flex:0 0 clamp(84px,11vw,120px); overflow:hidden; }
  .art__navPic img{
    width:100%; height:100%; object-fit:cover;
    transform:scale(1.04); transition:transform 1.1s var(--ease);
  }
  .art__navA:hover .art__navPic img{ transform:scale(1.1); }
  .art__navTxt{
    flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center;
    padding:clamp(.9rem,1.8vw,1.15rem) clamp(1rem,2vw,1.3rem);
  }
  .art__navA--next{ flex-direction:row-reverse; text-align:right; }
  .art__navK{
    display:block; font-family:var(--font-body); font-size:10px; font-weight:700;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold);
  }
  .art__navT{
    display:block; margin-top:.35rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1rem,1.3vw,1.15rem); color:var(--color-navy); line-height:1.2;
  }
  @media (prefers-reduced-motion: reduce){
    .art__navA, .art__navPic img{ transition:none; }
  }
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
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>`;

const header = headerHero;
const footer = footerHtml;

/* header pin and drawer: the shared script, imported above. */

mkdirSync(join(root, 'news'), { recursive: true });

/* ── the archive ─────────────────────────────────────────────────────── */
const cards = NEWS.map((n) => `      <li><a class="nw__card" href="/news/${n.slug}">
        <span class="nw__win"${n.ph ? ' data-placeholder="true"' : ''}>
          <img src="/${n.img}" alt="${n.ph ? 'Placeholder photograph' : esc(n.title)}" loading="lazy">
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
${headerHero}
<section class="nhero">
  <div class="nhero__bg" aria-hidden="true">
    <img src="/assets/img/news-hero.jpg" alt="" fetchpriority="high">
  </div>
  <div class="nhero__veil" aria-hidden="true"></div>
  <div class="wrap">
    <div class="nhero__grid">
      <div>
        <p class="plaque">News and results</p>
        <h1 class="arch__h">The latest from <em>the stud</em>.</h1>
      </div>
      <p class="arch__intro">Results in the ring, horses sold, and news from the programme.
      Every item here is one the stud published itself.</p>
    </div>
  </div>
</section>
<main class="wrap arch">
  <ul class="arch__grid">
${cards}
  </ul>
</main>
${footer}
${navScript}
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
<section class="ahero">
  <div class="ahero__bg" aria-hidden="true">
    <img src="/${n.img}" alt="${n.ph ? 'Placeholder photograph' : esc(n.title)}"
         style="object-position:${n.focus || '50% 42%'}"
         ${n.ph ? '' : 'fetchpriority="high"'}>
  </div>
  <div class="ahero__veil" aria-hidden="true"></div>
  ${n.ph ? '<span class="hz__ph">Photo pending</span>' : ''}
  <div class="ahero__in">
    <p class="ahero__crumb"><a href="/news">News</a> <span aria-hidden="true">&middot;</span> ${esc(n.eyebrow)}</p>
    <p class="plaque">${esc(n.eyebrow)}</p>
    <h1>${accent(n)}</h1>
  </div>
</section>

<main class="wrap art">
  <div class="art__grid">
    <div class="art__body">
${body}
    </div>
    <figure class="art__pic"${n.ph ? ' data-placeholder="true"' : ''}>
      <img src="/${n.img}" alt="${n.ph ? 'Placeholder photograph' : esc(n.title)}"
           width="${n.w || ''}" height="${n.h || ''}" loading="lazy">
      ${n.ph ? '<span class="hz__ph">Photo pending</span>' : ''}
    </figure>
  </div>

  <div class="pcta">
    <div class="pcta__bg" aria-hidden="true">
      <img src="/assets/img/hero-grey-wide.jpg" alt="" loading="lazy">
    </div>
    <div class="pcta__veil" aria-hidden="true"></div>
    <div>
      <p class="pcta__h">Tell us the horse you <em>have in mind</em>.</p>
      <p class="pcta__d">A foal on the ground, a cross still to be made, or a mare to breed from.
      Say what you are after and we will tell you plainly what we have.</p>
    </div>
    <div class="pcta__acts">
      <a href="/contact" class="btn btn-gold btn-pill">Get in touch</a>
      <a href="https://wa.me/393495918565" target="_blank" rel="noopener"
         class="btn btn-ghost btn-pill">Message on WhatsApp</a>
    </div>
  </div>

  <nav class="art__nav" aria-label="More news">
    <a class="art__navA" href="/news/${prev.slug}">
      <span class="art__navPic"><img src="/${prev.img}" alt="" loading="lazy"></span>
      <span class="art__navTxt">
        <span class="art__navK">&larr; Previous</span>
        <span class="art__navT">${esc(prev.title)}</span>
      </span>
    </a>
    <a class="art__navA art__navA--next" href="/news/${next.slug}">
      <span class="art__navPic"><img src="/${next.img}" alt="" loading="lazy"></span>
      <span class="art__navTxt">
        <span class="art__navK">Next &rarr;</span>
        <span class="art__navT">${esc(next.title)}</span>
      </span>
    </a>
  </nav>
</main>
${footer}
${navScript}
</body>
</html>
`);
});

console.log(`built news/index.html and ${NEWS.length} single pages`);
