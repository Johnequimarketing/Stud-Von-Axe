#!/usr/bin/env node
/* Build semen/index.html — the fifth page on the owners' list of 29 August,
 * and the last one that was missing.
 *
 * It is an archive in the shape of the other four, split three ways as Mark
 * asked on 30 August: fresh, ICSI, frozen, where the embryos split frozen and
 * carrying. What it does not have is a list. There are no stallion names in
 * this project, no availability and no prices, and their own standing
 * instruction is that stallions are named on request rather than published.
 *
 * So the three cards are marked placeholders, the same way the empty galleries
 * and film sections are: the word across the picture and a line underneath
 * saying plainly that this is not a stallion. Nobody can mistake one for a
 * horse that exists, and the team can see the shape the real ones will take.
 * When the list arrives, semen-data.js is replaced and nothing else changes.
 *
 * Run: node scripts/build-semen.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, pageHeroCss, archiveCss, header, footer, head, navScript, esc } from './lib/shell.mjs';

const SEMEN = new Function(readFileSync(join(root, 'semen-data.js'), 'utf-8') + '; return SEMEN;')();
const NEWS = new Function(readFileSync(join(root, 'news-data.js'), 'utf-8') + '; return NEWS;')();
const icsi = NEWS.find((n) => n.slug === 'icsi-semen-available');

/* Their own two sentences about it, from the only thing they have ever
   published on the subject. Not rewritten. */
const THEIRS = icsi ? icsi.body : [];

/* The route, which is the one piece of structure that was drawn for this page
   long ago and never used: it sat in the React copy file with a note saying it
   was being kept for a semen detail page. */
const ROUTE = [
  ['Collected', 'Fresh from the yard, or at Avantea in Cremona for ICSI and frozen.'],
  ['Shipped', 'Across the EU, and for export.'],
  ['To your mare', 'Which stallions are available, we tell you on request.'],
];

const CSS = homeCss + pageHeroCss + archiveCss + `
  /* ── semen page only. Everything above is the homepage stylesheet. ── */
  .nhero > .wrap{ padding-top:clamp(6rem,13vh,8rem); }
  .smhero .nhero__bg img{ object-position:50% 44%; }

  .sm{ padding-block:var(--sec-half); }
  .sm__head{ max-width:60ch; margin-bottom:clamp(1.6rem,3vw,2.4rem); }
  .sm__h{ margin:.5rem 0 .8rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw + .8rem,2rem); line-height:1.06; color:var(--color-ink); }
  .sm__h em{ font-style:italic; color:var(--color-gold); }
  .sm__p{ margin:0 0 .8rem; font-size:17.5px; line-height:1.6; color:var(--color-ink-soft); }

  /* The route, three steps on one plate. */
  .sm__route{ display:grid; gap:clamp(.5rem,1vw,.8rem); margin-bottom:clamp(2rem,4vw,3rem); }
  @media (min-width:760px){ .sm__route{ grid-template-columns:repeat(3,1fr); } }
  .sm__step{
    padding:clamp(1rem,1.8vw,1.35rem) clamp(1.1rem,2vw,1.5rem);
    border-radius:var(--card-radius);
    background:color-mix(in srgb, var(--color-gold) 92%, var(--color-white));
    position:relative; overflow:hidden;
  }
  .sm__step::before{ content:""; position:absolute; left:0; right:0; top:0; height:3px;
    background:color-mix(in srgb, var(--color-navy) 22%, transparent); }
  .sm__sk{
    display:block; font-family:var(--font-body); font-weight:700; font-size:9.5px;
    letter-spacing:.18em; text-transform:uppercase; margin-bottom:.3rem;
    color:color-mix(in srgb, var(--color-navy) 85%, transparent);
  }
  .sm__sv{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.05rem;
    line-height:1.3; color:var(--color-navy); }

  /* The cards, in the embryo card's shape so a stallion will look like the
     rest of the site the day there is one. */
  .sm__grid{ display:grid; gap:clamp(1rem,2vw,1.4rem); grid-template-columns:1fr; margin-top:1.6rem; }
  @media (min-width:700px){ .sm__grid{ grid-template-columns:repeat(2,1fr); } }
  @media (min-width:1100px){ .sm__grid{ grid-template-columns:repeat(3,1fr); } }
  /* A row of cards stands at one height, which is the oldest rule in this
     project. The list item stretches and the card fills it, exactly as
     .hz__grid > li does for the horse cards. */
  .sm__grid > li{ display:flex; }
  .sm__grid li[hidden]{ display:none; }
  .sm__note{ margin:1.4rem 0 0; font-size:14.5px; line-height:1.6; color:var(--color-ink-soft); }
`;

const card = (s) => `        <li data-kind="${esc(s.kind)}">
          <div class="ec__a" aria-hidden="false">
            <span class="ec__win">
              <img src="/assets/img/placeholder/gallery-2.jpg"
                   alt="Placeholder: no stallion is published for ${esc(s.label.toLowerCase())} semen yet" loading="lazy">
              <span class="ec__fade" aria-hidden="true"></span>
            </span>
            <span class="ec__seam"><span class="ec__stage">${esc(s.label)}</span></span>
            <span class="ec__box">
              <span class="ec__name">Placeholder</span>
              <span class="ec__line">${esc(s.note)}</span>
              <span class="ec__say">Stallions are named on request. Ask us for the catalogue.</span>
            </span>
          </div>
        </li>`;

const page = `<!DOCTYPE html>
<html lang="en">
<head>
${head({
  title: 'ICSI semen',
  desc: 'Fresh, ICSI and frozen semen through Avantea in Cremona, shipped across the EU and for export. Stallions are named on request.',
  path: '/semen',
  image: 'hero-semen.jpg',
  ldType: 'CollectionPage',
})}
<style>${CSS}</style>
</head>
<body>
${header}

<main id="main">

  <section class="nhero smhero">
    <div class="nhero__bg" aria-hidden="true">
      <img src="/assets/img/hero-semen.jpg" alt="" fetchpriority="high">
    </div>
    <div class="nhero__veil" aria-hidden="true"></div>
    <div class="wrap">
      <div class="nhero__grid">
        <div>
          <p class="plaque">ICSI semen</p>
          <h1 class="arch__h">The same lines, <em>by the straw</em></h1>
        </div>
        <p class="arch__intro">Fresh, ICSI and frozen, out of the stallions we work with. Which ones
        are available we tell you when you ask.</p>
      </div>
    </div>
  </section>

  <section class="sm">
    <div class="wrap">
      <div class="sm__head">
        <p class="plaque">How it works</p>
        <h2 class="sm__h">Doing OPU and ICSI with <em>your own mares</em></h2>
${THEIRS.map((t) => `        <p class="sm__p">${esc(t)}</p>`).join('\n')}
      </div>

      <div class="sm__route">
${ROUTE.map(([k, v]) => `        <div class="sm__step">
          <span class="sm__sk">${esc(k)}</span>
          <span class="sm__sv">${esc(v)}</span>
        </div>`).join('\n')}
      </div>

      <div class="flt" data-filter data-open="all">
        <div class="flt__chips" role="group" aria-label="Filter by kind">
          <button class="hz__chip" type="button" data-show="all" aria-pressed="true">All <span class="c">${SEMEN.length}</span></button>
${SEMEN.map((s) => `          <button class="hz__chip" type="button" data-show="${esc(s.kind)}"
                  aria-pressed="false">${esc(s.label)} <span class="c">1</span></button>`).join('\n')}
        </div>
        <p class="flt__count" data-count aria-live="polite">${SEMEN.length} kinds</p>
      </div>

      <ul class="sm__grid" data-grid>
${SEMEN.map(card).join('\n')}
      </ul>
      <p class="flt__none" data-none>Nothing matches that.</p>

      <p class="sm__note">Every card here is a placeholder. No stallion is published on this page,
      because the stallions we can offer change with the season and we name them when you ask.
      Write to us with the mare and the cross you have in mind.</p>
    </div>
  </section>

  <section class="abcta">
    <div class="wrap">
      <div class="pcta">
        <div class="pcta__bg" aria-hidden="true">
          <img src="/assets/img/hero-grey-wide.jpg" alt="" loading="lazy">
        </div>
        <div class="pcta__veil" aria-hidden="true"></div>
        <div>
          <p class="pcta__h">Ask for the <em>catalogue</em></p>
          <p class="pcta__d">Tell us the mare and what you are trying to breed, and we will send the
          stallions you can use.</p>
        </div>
        <div class="pcta__acts">
          <a href="/contact" class="btn btn-gold btn-pill">Get in touch</a>
          <a href="https://wa.me/393495918565" target="_blank" rel="noopener"
             class="btn btn-ghost btn-pill">Message on WhatsApp</a>
        </div>
      </div>
    </div>
  </section>

</main>
${footer}
${navScript}
<script>
/* The three kinds, filtered. Same shape as the four horse archives: the chips
   press, the cards hide, the count says what is left. */
(function(){
  var box = document.querySelector('[data-filter]');
  if (!box) return;
  var grid = document.querySelector('[data-grid]');
  var count = box.querySelector('[data-count]');
  var none = document.querySelector('[data-none]');
  var chips = [].slice.call(box.querySelectorAll('.hz__chip'));
  var items = [].slice.call(grid.children);
  function apply(show){
    var n = 0;
    for (var i = 0; i < items.length; i++) {
      var ok = show === 'all' || items[i].getAttribute('data-kind') === show;
      items[i].hidden = !ok;
      if (ok) n++;
    }
    for (var c = 0; c < chips.length; c++)
      chips[c].setAttribute('aria-pressed', chips[c].getAttribute('data-show') === show ? 'true' : 'false');
    count.textContent = n === 1 ? 'One kind' : n + ' kinds';
    none.classList.toggle('is-on', n === 0);
  }
  for (var c = 0; c < chips.length; c++) (function(btn){
    btn.addEventListener('click', function(){ apply(btn.getAttribute('data-show')); });
  })(chips[c]);
})();
<\/script>
</body>
</html>
`;

mkdirSync(join(root, 'semen'), { recursive: true });
writeFileSync(join(root, 'semen', 'index.html'), page);
console.log(`built semen/index.html with ${SEMEN.length} kinds`);
