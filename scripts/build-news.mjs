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

/* The homepage is the source of truth for everything shared: its full
   stylesheet, its header and its footer are lifted verbatim at build time
   and only the paths are rewritten for the news/ folder. Rebuilding after
   any homepage change keeps the two in step; nothing shared is authored
   here a second time. */
const home = readFileSync(join(root, 'index.html'), 'utf-8');
const homeCss = home.match(/<style>([\s\S]*?)<\/style>/)[1];

/* From news/ every root link needs a hop up. */
const relink = (html) => html
  .replace(/href="#/g, 'href="../#')
  .replace(/href="news\/"/g, 'href="./"')
  .replace(/(src|href)="assets\//g, '$1="../assets/')
  .replace(/href="index.html"/g, 'href="../"');

const headerHtml = relink(home.slice(home.indexOf('  <header class="hd">'),
                                     home.indexOf('  </header>') + '  </header>'.length))
  /* the homepage header lives inside its hero; here it stands alone */
  .replace('<header class="hd">', '<header class="hd" id="site-header">');

const footerHtml = relink(home.slice(home.indexOf('<footer class="site-footer">'),
                                     home.indexOf('</footer>') + '</footer>'.length));

for (const [piece, name] of [[headerHtml, 'header'], [footerHtml, 'footer']]) {
  if (!piece || piece.length < 400) throw new Error(`could not lift the ${name} from index.html`);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

const CSS = homeCss + `
  /* ── news pages only. Everything above is the homepage stylesheet. ── */

  /* The homepage header is height:0 and transparent because it hangs over
     a 100svh hero. Here it sits on its own ground: give it height again,
     and the pinned (ivory) colours from the start on pages with no dark
     hero behind it. */
  .hd{ height:auto; position:sticky; top:0; }
  .hd .hd__row{ background:var(--color-base); box-shadow:0 1px 0 var(--color-line); }
  .hd .brand{ box-shadow:none; }
  .hd .primary-nav a, .hd .nav-toggle, .hd .lang-switch button, .hd .lang-switch .sep,
  .hd .lang-switch .lang-soon{
    color:var(--color-ink);
  }
  .hd .lang-switch .lang-soon{ opacity:.35; }
  .hd .primary-nav a:hover{ color:var(--color-navy); }
  .hd .btn-ghost{ border-color:var(--color-line); color:var(--color-ink); }
  .hd .btn-ghost:hover{ border-color:var(--color-navy); color:var(--color-navy); background:none; }
  .hd .hd__rule{ display:none; }

  /* ---- the archive hero: a covered photograph, the homepage veil ---- */
  .nhero{
    position:relative; isolation:isolate; overflow:hidden;
    min-height:clamp(320px, 44vh, 460px);
    display:grid; align-items:end;
    background:var(--color-navy-deep);
  }
  .nhero__bg{ position:absolute; inset:0; z-index:0; }
  .nhero__bg img{ width:100%; height:100%; object-fit:cover; object-position:50% 42%; }
  /* Type crosses the whole width, so the veil is a foot gradient: open at
     the head where the braids read, closing downward under the type. */
  .nhero__veil{
    position:absolute; inset:0; z-index:1;
    background:linear-gradient(180deg,
      rgba(10,21,38,.42) 0%, rgba(10,21,38,.62) 45%, rgba(6,12,20,.9) 100%);
  }
  .nhero > .wrap{ position:relative; z-index:2; padding-block:clamp(2.2rem,5vw,3.4rem); width:min(var(--wrap),100% - (2*var(--gutter))); margin-inline:auto; }
  /* Title left, intro right, on one baseline: the homepage section head,
     brought onto the photograph. */
  .nhero__grid{ display:grid; gap:clamp(1.2rem,3vw,2.6rem); align-items:end; }
  @media (min-width:820px){ .nhero__grid{ grid-template-columns:1.1fr .9fr; } }
  .arch__h{
    margin:.5rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(2rem,3.4vw + 1rem,3.2rem); line-height:1.04;
    letter-spacing:-.02em; color:var(--color-white); max-width:16ch; text-wrap:balance;
  }
  .arch__h em{ font-style:italic; color:var(--color-gold); }
  .arch__intro{ margin:0; color:rgba(255,255,255,.78); max-width:48ch; font-size:15.5px; }

  /* ---- the archive grid reuses .nw__card from the homepage sheet ---- */
  .arch{ padding:clamp(2rem,4.5vw,3.2rem) 0 clamp(3rem,7vw,5rem); }
  .arch__grid{ display:grid; gap:var(--card-gap); }
  @media (min-width:680px){ .arch__grid{ grid-template-columns:1fr 1fr; } }
  @media (min-width:1040px){ .arch__grid{ grid-template-columns:repeat(3,minmax(0,1fr)); } }

  /* ---- the single ---- */
  .art{ padding:clamp(2.4rem,5vw,3.6rem) 0 clamp(3rem,7vw,5rem); }
  .art__crumb{ font-size:13px; color:var(--color-ink-soft); }
  .art__crumb a{ color:var(--color-navy); text-decoration:none; border-bottom:1px solid var(--color-line); }
  .art__crumb a:hover{ border-color:var(--color-gold); }
  .art__head{ max-width:var(--art-measure, 720px); margin-top:clamp(1.4rem,3vw,2rem); }
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
  .art__body{ max-width:var(--art-measure, 720px); margin-top:clamp(1.6rem,3.5vw,2.4rem); }
  .art__body p{ margin:0 0 1.1em; font-size:17px; color:var(--color-ink); }
  .art__body p:last-child{ margin-bottom:0; }

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

const header = headerHtml;
const footer = footerHtml;

const navScript = `<script>
(function(){
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.innerHTML = open ? '&#10005;' : '&#9776;';
    });
  }
})();
<\/script>`;

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
<section class="nhero">
  <div class="nhero__bg" aria-hidden="true">
    <img src="../assets/img/hero-neck-wide.jpg" alt="" fetchpriority="high">
  </div>
  <div class="nhero__veil" aria-hidden="true"></div>
  <div class="wrap">
    <div class="nhero__grid">
      <div>
        <p class="plaque">News and results</p>
        <h1 class="arch__h">The latest from <em>both yards</em>.</h1>
      </div>
      <p class="arch__intro">Results in the ring, horses sold, and news from Desenzano and Lanaken.
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
${navScript}
</body>
</html>
`);
});

console.log(`built news/index.html and ${NEWS.length} single pages`);
