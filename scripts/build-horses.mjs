#!/usr/bin/env node
/* Build the four horse archives and a page for every horse.
 *
 * Wears the homepage shell through lib/shell.mjs, exactly as the news and
 * about builders do, so the header, footer and stylesheet can never drift.
 * The cards are the homepage's own .hz__card, unchanged: the archive is the
 * same object the visitor already met on the homepage, in a longer row.
 *
 * Data: horses-data.js, harvested from the client's own pages.
 * Run:  node scripts/build-horses.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, pageHeroCss, storyCss, header, footer, head, navScript, esc } from './lib/shell.mjs';

const HORSES = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();

/* One entry per archive. A hero is a wide strip, so the photograph is
   chosen on shape as much as on subject: three of these are 2.25:1 crops
   cut once from the nearly square originals rather than left to object-fit
   to guess at, which showed a band of neck and nothing else. Made by the
   crop step in this repository's history and checked on a render. */
const GROUPS = {
  broodmare: {
    dir: 'breeding-mares',
    label: 'Breeding mares',
    kicker: 'The mares',
    title: 'The families we <em>breed from</em>',
    intro: 'Every mare here was chosen for what her family actually produces in sport. Their foals and embryos carry those lines.',
    img: 'hero-cortina-wide.jpg', pos: '50% 46%', w: 1920, h: 1150,
    one: 'mare', many: 'mares', singular: 'breeding mare',
    ctaH: 'Looking for a mare to <em>breed from</em>?',
    ctaD: 'Tell us the line you are after. If she is not here, we will say so, and we will tell you what is coming out of the same families.',
  },
  foal: {
    dir: 'foals',
    label: 'Foals',
    kicker: 'The foals',
    title: 'Born and raised in <em>Lanaken</em>',
    intro: 'Out of our own damlines, raised at our Belgian base until the day they leave. Sold direct, and the ones that have gone stay here with the country they went to.',
    img: 'arch-foals.jpg', pos: '50% 50%', w: 1920, h: 853,
    one: 'foal', many: 'foals', singular: 'foal',
    ctaH: 'Tell us what you are <em>looking for</em>.',
    ctaD: 'A foal on the ground, or a cross still to be made. Say what you are after and we will tell you plainly what we have.',
  },
  embryo: {
    dir: 'embryos',
    label: 'Embryos',
    kicker: 'The embryos',
    title: 'The same lines, <em>a year earlier</em>',
    intro: 'Frozen from our own damlines or already carrying in Lanaken. Every cross is made on pedigree and on what the mare has produced.',
    img: 'arch-embryos.jpg', pos: '50% 50%', w: 1920, h: 853,
    one: 'cross', many: 'crosses', singular: 'cross',
    ctaH: 'Ask about a <em>cross</em>.',
    ctaD: 'Frozen or already carrying. We will tell you which stage a cross is at and what it takes to bring it home.',
  },
  sport: {
    dir: 'sport-horses',
    label: 'Sport horses',
    kicker: 'The sport horses',
    title: 'Bred here, <em>jumping elsewhere</em>',
    intro: 'Horses out of this programme that have gone on into sport, and mares that can still do both.',
    img: 'arch-sport.jpg', pos: '50% 50%', w: 1920, h: 853,
    one: 'horse', many: 'horses', singular: 'sport horse',
    ctaH: 'Looking for a particular <em>horse</em>?',
    ctaD: 'We also look on a client\'s behalf, across Europe and as far as America. Tell us what you need and we will go and find it.',
  },
};

const CSS = homeCss + pageHeroCss + storyCss + `
  /* ── horse pages only. Everything above is the homepage stylesheet. ── */

  /* The hero starts at the top of the page and the header hangs over it. */
  .nhero > .wrap{ padding-top:clamp(6rem,13vh,8rem); }

  /* The archive grid is the homepage's own .hz__grid, given the room a page
     has and the homepage section does not: four across instead of three. */
  .arch{ padding-block:clamp(2.6rem,5vw,4rem); }
  .abcta{ padding-bottom:clamp(3.2rem,6vw,5rem); }
  .arch__count{
    font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.22em;
    text-transform:uppercase; color:var(--color-gold); margin:0 0 1.4rem;
  }
  @media (min-width:1100px){ .arch .hz__grid{ grid-template-columns:repeat(4, 1fr); } }


  /* ── the filter bar ────────────────────────────────────────────────────
     A field and three chips over the grid. The chips are the homepage's own
     .hz__chip, so an archive filters the way the homepage section already
     does, and the field beside them is the only control this page adds.
     Sold horses start hidden. They are not an answer to "what do you have",
     but they are the proof of where these lines have gone, so they are one
     chip away and never removed. A group with nothing available opens on
     everything rather than on an empty grid. */
  .flt{
    display:flex; flex-wrap:wrap; align-items:center; gap:.8rem 1.1rem;
    margin-bottom:1.7rem; padding-bottom:1.4rem; border-bottom:1px solid var(--color-line);
  }
  .flt__search{ position:relative; flex:1 1 240px; max-width:320px; min-width:0; }
  .flt__search input{
    width:100%; appearance:none; -webkit-appearance:none;
    padding:.7rem 2.3rem .7rem .95rem;
    border:1px solid var(--color-line); border-radius:100px;
    background:var(--color-base); color:var(--color-ink);
    font-family:var(--font-body); font-size:14.5px;
    transition:border-color .3s var(--ease);
  }
  .flt__search input::placeholder{ color:var(--color-ink-soft); }
  .flt__search input:focus{ outline:none; border-color:var(--color-navy); }
  .flt__search input:focus-visible{ outline:2px solid var(--color-gold); outline-offset:2px; }
  .flt__ico{
    position:absolute; right:.95rem; top:50%; transform:translateY(-50%);
    width:14px; height:14px; pointer-events:none; color:var(--color-ink-soft);
  }
  .flt__chips{ display:flex; flex-wrap:wrap; gap:.5rem; }
  .flt__count{
    margin-left:auto; font-family:var(--font-body); font-weight:700; font-size:11px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-ink-soft); white-space:nowrap;
  }
  .flt__none{ display:none; margin:2.4rem 0 1rem; font-size:16px; color:var(--color-ink-soft); }
  .flt__none.is-on{ display:block; }
  .hz__grid li[hidden]{ display:none; }
  @media (max-width:620px){
    .flt__search{ max-width:none; flex-basis:100%; }
    .flt__count{ margin-left:0; }
  }
  /* The breeding line under the name: their Genetics row, which on a
     broodmare is the point of the card. Same italic gold the horse's own
     page opens with, so the card and the page read as one object. */
  .hz__ped{
    display:block; margin-top:.3rem;
    font-family:var(--font-display); font-style:italic; font-size:13px; line-height:1.35;
    color:var(--color-gold);
  }


  /* ── the horse's own page ──────────────────────────────────────────────
     No dark hero here. A horse photograph stands or is square, and a wide
     strip keeps a fifth of it: the rule the about page's hero taught. So
     the picture keeps its own proportions on the left and the horse's name
     and figures stand beside it, which is also how the reference pages Mark
     sent are laid out. The header wears its pinned colours from the first
     pixel because there is no photograph behind it. */
  .hp{ padding-block:clamp(6.5rem,14vh,9rem) clamp(2.4rem,5vw,3.6rem); }
  .hp__grid{ display:grid; gap:clamp(1.8rem,4vw,3.4rem); align-items:start; }
  @media (min-width:900px){ .hp__grid{ grid-template-columns:.92fr 1.08fr; } }
  .hp__col{ min-width:0; }
  .hp__pic{
    border-radius:var(--plate-radius); overflow:hidden;
    box-shadow:0 30px 60px -46px rgba(var(--veil-rgb), .55);
    position:relative;
  }
  .hp__pic img{ display:block; width:100%; height:auto; }
  .hp__pic .hz__tag{ position:absolute; top:14px; left:14px; }
  .hp__back{
    display:inline-flex; align-items:center; gap:.5rem; margin-bottom:1rem;
    font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-ink-soft);
    transition:color .35s var(--ease);
  }
  .hp__back:hover{ color:var(--color-navy); }
  .hp__h{
    margin:.5rem 0 .4rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(2rem,3vw + 1rem,3rem); line-height:1.02; letter-spacing:-.02em;
    color:var(--color-ink);
  }
  .hp__cross{
    margin:0 0 1.2rem; font-family:var(--font-display); font-style:italic;
    font-size:1.05rem; color:var(--color-gold);
  }
  .hp__lead{ margin:0 0 1.6rem; font-size:17px; line-height:1.6; color:var(--color-ink); max-width:46ch; }

  /* The figures. The two places on the about page, widened: a row of
     hairline columns, and a field their site left empty is left out rather
     than shown as a dash. */
  .hp__facts{
    display:grid; gap:1rem 1.6rem; margin:0 0 1.8rem;
    grid-template-columns:repeat(2, minmax(0,1fr));
    padding-top:1.4rem; border-top:1px solid var(--color-line);
  }
  @media (min-width:560px){ .hp__facts{ grid-template-columns:repeat(3, minmax(0,1fr)); } }
  .hp__k{
    display:block; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.3rem;
  }
  .hp__v{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.05rem; color:var(--color-ink); }
  .hp__acts{ display:flex; flex-wrap:wrap; gap:.7rem; }
  /* The ghost button is drawn for a navy plate. On the ivory ground it was
     white on ivory, which is the one thing this project has a hard rule
     about. Same treatment the pinned header gives it. */
  .hp__acts .btn-ghost{ border-color:var(--color-line); color:var(--color-ink); }
  .hp__acts .btn-ghost:hover{ border-color:var(--color-navy); color:var(--color-navy); }

  /* ── the pedigree ──────────────────────────────────────────────────────
     The one component on this site that had to be drawn from scratch, and
     it is drawn as the page's navy plate rather than as a table: four
     columns, each generation half the height of the one before it, which is
     what a pedigree is. Rows span rather than nest, so there is no table
     markup to fight on a phone.
     Below 760px it scrolls sideways in its own box rather than folding,
     because a pedigree folded into one column is no longer a pedigree. */
  .ped{ padding-bottom:clamp(2.6rem,5vw,4rem); }
  .ped__plate{
    border-radius:var(--plate-radius); background:var(--color-navy-deep);
    padding:clamp(1.6rem,3.4vw,2.6rem);
    overflow-x:auto;
  }
  .ped__h{
    margin:0 0 1.4rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw + .8rem,2rem); line-height:1.05;
    color:var(--color-white);
  }
  .ped__h em{ font-style:italic; color:var(--color-gold); }
  .ped__grid{
    display:grid; grid-template-columns:repeat(4, minmax(150px, 1fr));
    gap:.4rem; min-width:640px;
  }
  .ped__cell{
    display:flex; align-items:center; min-width:0;
    padding:.7rem .9rem; border-radius:10px;
    background:rgba(255,255,255,.055);
    font-family:var(--font-display); font-weight:400; font-size:.92rem; line-height:1.2;
    color:var(--color-white);
  }
  .ped__cell--self{ background:var(--color-gold); color:var(--color-navy); font-size:1.05rem; }
  .ped__cell--sire{ background:rgba(255,255,255,.10); }
  .ped__cell--third{ font-size:.82rem; color:rgba(255,255,255,.72); }
  .ped__note{
    margin:1.2rem 0 0; font-size:13px; color:rgba(255,255,255,.6);
  }

  /* The remaining photographs of this horse. Two or more, or the section is
     not drawn: a gallery of one is just a picture. */
  .hgal{ padding-bottom:clamp(2.6rem,5vw,4rem); }
  .hgal__grid{ display:grid; gap:clamp(.8rem,1.4vw,1.1rem); grid-template-columns:repeat(2, 1fr); }
  @media (min-width:900px){ .hgal__grid.is-three{ grid-template-columns:repeat(3, 1fr); } }
  .hgal__f{ border-radius:var(--plate-radius); overflow:hidden; background:var(--color-navy-deep); }
  .hgal__f img{ display:block; width:100%; height:auto; }

  /* More from the same group: the homepage card again, three of them. */
  .hmore{ padding-bottom:clamp(2.6rem,5vw,4rem); }
  .hmore__head{
    display:flex; align-items:baseline; justify-content:space-between; gap:1rem;
    flex-wrap:wrap; margin-bottom:1.4rem;
  }
  .hmore__h{
    margin:0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.4rem,1.6vw + .8rem,1.9rem); color:var(--color-ink);
  }
  .hmore__h em{ font-style:italic; color:var(--color-gold); }
  .hmore__all{
    font-family:var(--font-body); font-weight:700; font-size:11.5px; letter-spacing:.14em;
    text-transform:uppercase; color:var(--color-navy);
    display:inline-flex; align-items:center; gap:.45rem; transition:gap .35s var(--ease);
  }
  .hmore__all:hover{ gap:.8rem; }
  .hmore__all .a{ color:var(--color-gold); }
  @media (min-width:900px){ .hmore .hz__grid{ grid-template-columns:repeat(3, 1fr); } }


`;

const page = ({ title, desc, path, image, body, extraCss = '', extraScript = '' }) => `<!DOCTYPE html>
<html lang="en">
<head>
${head({ title, desc, path, image, ldType: 'CollectionPage' })}
<style>${CSS}${extraCss}</style>
</head>
<body>
${header}

<main id="main">
${body}
</main>
${footer}
${navScript}
${extraScript}
</body>
</html>
`;

/* Their sentences, with one typographic change and no others: they separate
   a damline with an en dash, and this site has a hard rule against the long
   dash. The middot is what the rest of the site already uses between horse
   names, so the line reads the same and the punctuation is ours. Nothing
   else about their text is touched, spelling and capitals included. */
const theirWords = (text) => (text || '')
  .replace(/\s+[–—-]\s*/g, ' \u00b7 ')     /* Fuga de Muze - Narcotique II  */
  .replace(/\s+\u00b7\s*$/, '');           /* and one that ends on a dash   */

/* The fifteen countries their listings actually name, and only those. The
   homepage used to carry six, hand written, with a note that the client
   claims more and we could not evidence them. The evidence was on their own
   archive pages all along, in a field their stylesheet hides. */
const COUNTRY = {
  AR: 'Argentina', BE: 'Belgium', BR: 'Brazil', CZ: 'Czechia', DE: 'Germany',
  ES: 'Spain', FR: 'France', GB: 'Great Britain', IE: 'Ireland', IT: 'Italy',
  LT: 'Lithuania', NL: 'the Netherlands', PL: 'Poland', SI: 'Slovenia',
  US: 'the United States',
};

/* An embryo's "year of birth" is not always a year: theirs reads FROZEN
   EMBRYO on the ones in the tank and a year on the ones a mare is already
   carrying. That is the split the owners asked for, implanted against
   frozen, and it is in the data rather than in a label we invented. */
const isFrozen = (horse) => /frozen/i.test(horse.year || '');
const when = (horse) => {
  if (horse.category === 'embryo') return isFrozen(horse) ? 'Frozen embryo' : `Due ${horse.year}`;
  return horse.year ? `Born ${horse.year}` : '';
};

/* ── the fields, in this market's words ────────────────────────────────
   Their pages carry the sex in Italian on most horses and in English on a
   few. These are the equestrian terms for what they wrote, chosen with the
   category, which is how the market names them: a female foal is a filly,
   not a mare. Anything not on this list is left out rather than guessed. */
const SEX = (horse) => {
  const raw = (horse.sex || '').trim().toLowerCase();
  const foal = horse.category === 'foal';
  if (raw === 'femmina' || raw === 'mare')   return foal ? 'Filly' : 'Mare';
  if (raw === 'stallone' || raw === 'stallion') return foal ? 'Colt' : 'Stallion';
  if (raw === 'castrone' || raw === 'gelding')  return 'Gelding';
  return '';
};

/* Their pages set every name in capitals. That is their stylesheet, not
   their spelling, and the rest of this site sets a horse's name the way it
   is written on a passport. Small words stay small, the Zangersheide Z
   stays capital, and a name already written in mixed case is left alone. */
const SMALL = new Set(['de', 'van', 'vd', "van't", 'vant', 'het', 'du', 'des', 'la', 'le',
                      'di', 'da', 'il', 'het', 'der', 'den', 'vom', 'zum']);
/* Kept in capitals: suffixes, initials and Roman numerals, which a title
   case rule turns into Jt, Sva and Ii if it is not told about them. */
const CAPS = new Set(['z', 'sva', 'jt', 'vdl', 'ht', 'bh', 'ii', 'iii', 'iv', 'vi', 'vii']);
const horseName = (name) => {
  if (!name) return '';
  /* One pedigree name on their site is written with an en dash, IDJAZ – C.
     In a name that dash is a joining hyphen, not the style pause the house
     rule bans, so it becomes one and keeps the name a name. */
  name = name.replace(/\s*[–—]\s*/g, '-');
  if (name !== name.toUpperCase()) return name;
  return name.toLowerCase().split(' ').map((word, i) => {
    if (CAPS.has(word)) return word.toUpperCase();
    if (word === 'x') return 'x';                 /* a cross, the way this market writes it */
    if (i > 0 && SMALL.has(word)) return word;
    return word.replace(/(^|[’'\-])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  }).join(' ');
};

/* The sire is the first name in their Genetics line. The line itself is
   shown in full on the horse's own page; a card has room for one name. */
const sireOf = (horse) => {
  const first = (horse.genetics || '').split(/\s+X\s+/i)[0].trim();
  return first ? horseName(first) : '';
};

const meta = (horse) => [horse.year, SEX(horse), sireOf(horse)].filter(Boolean).join(' \u00b7 ');

/* The homepage card, unchanged, pointed at the horse's own page. A horse
   without a photograph gets the typographic card the homepage already uses
   for one, rather than a stand-in picture of a different horse. */
const card = (horse, group, full) => {
  const href = `/${group.dir}/${horse.slug}`;
  const tag = horse.sold
    ? '<span class="hz__tag hz__tag--sold">Sold</span>'
    : '<span class="hz__tag">Available</span>';
  const win = horse.photos.length
    ? `<span class="hz__win"><img src="/${horse.photos[0]}" alt="${esc(horseName(horse.name))}" loading="lazy">${tag}</span>`
    : `<span class="hz__win typo"><p>${esc(theirWords(horse.genetics || horse.tagline || ''))}</p>${tag}</span>`;

  /* The archive card carries the breeding. On a broodmare the sire line is
     the reason a visitor is on the page at all, and a card that names only
     the sire makes them open twelve pages to compare four crosses. The
     homepage keeps the short card: its run is three across inside a slider. */
  /* Not on a card without a photograph: that card already shows the
     breeding across the frame, and printing it twice reads as a mistake. */
  const breeding = full && horse.genetics && horse.photos.length
    ? `<span class="hz__ped">${esc(horseName(theirWords(horse.genetics)))}</span>` : '';
  const line = full
    ? [when(horse), SEX(horse), horse.studbook,
       horse.sold && horse.country ? `Sold to ${COUNTRY[horse.country] || horse.country}` : '']
        .filter(Boolean).join(' \u00b7 ')
    : meta(horse);

  /* Everything the search reads, lowercased once here rather than on every
     keystroke: name, breeding, studbook, year and their own line. */
  const haystack = [horse.name, horse.genetics, horse.studbook, horse.tagline, horse.year,
                    horse.country && COUNTRY[horse.country], SEX(horse)]
    .filter(Boolean).join(' ').toLowerCase();

  return `<li${full ? ` data-sold="${horse.sold ? 'true' : 'false'}" data-find="${esc(haystack)}"` : ''}>` +
    `<a class="hz__card" href="${href}">${win}` +
    '<span class="hz__body">' +
      `<span class="hz__name">${esc(horseName(horse.name))}</span>` +
      `<span class="hz__meta">${esc(line)}</span>` +
      breeding +
      '<span class="hz__view">View <span class="a" aria-hidden="true">&rarr;</span></span>' +
    '</span></a></li>';
};

/* Counted, never typed: a written number goes stale the first time a horse
   is added or sold and nobody remembers the sentence. */
const WORDS = ['no','one','two','three','four','five','six','seven','eight','nine','ten',
               'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen',
               'eighteen','nineteen','twenty','twenty one'];
const count = (n) => WORDS[n] || String(n);

/* ── section two: the grid ─────────────────────────────────────────────── */
const gridSection = (group, list) => {
  const available = list.filter((h) => !h.sold).length;
  const sold = list.length - available;
  const openOn = available ? 'available' : 'all';
  const noun = (n) => `${count(n)} ${n === 1 ? group.one : group.many}`;
  return `
  <section class="arch">
    <div class="wrap">
      <div class="flt" data-filter data-open="${openOn}">
        <div class="flt__search">
          <label class="visually-hidden" for="flt-q">Search these ${esc(group.many)}</label>
          <input type="search" id="flt-q" data-find autocomplete="off" spellcheck="false"
                 placeholder="Search a name, a sire, a country">
          <svg class="flt__ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M10.8 10.8L15 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="flt__chips" role="group" aria-label="Filter these ${esc(group.many)}">
          <button class="hz__chip" type="button" data-show="available"
                  aria-pressed="${openOn === 'available' ? 'true' : 'false'}">Available <span class="c">${available}</span></button>
          <button class="hz__chip" type="button" data-show="sold" aria-pressed="false">Sold <span class="c">${sold}</span></button>
          <button class="hz__chip" type="button" data-show="all"
                  aria-pressed="${openOn === 'all' ? 'true' : 'false'}">All <span class="c">${list.length}</span></button>
        </div>
        <p class="flt__count" data-count aria-live="polite">${noun(openOn === 'available' ? available : list.length)}</p>
      </div>

      <p class="flt__none" data-none>Nothing matches that. Try a sire, a damline, a year or a country.</p>

      <ul class="hz__grid" data-grid>
${list.map((h) => '        ' + card(h, group, true)).join('\n')}
      </ul>
    </div>
  </section>
`;
};

/* The filter itself. Every card is already in the page: this hides and
   shows, it never fetches, so the whole archive is there for a search
   engine and for a visitor with no JavaScript, who gets all of them and no
   chips. The words are written into each card by the builder, lowercased
   once, so a keystroke is a substring test and nothing else. */
const filterScript = (group) => `<script>
(function(){
  var bar = document.querySelector('[data-filter]');
  var grid = document.querySelector('[data-grid]');
  if(!bar || !grid) return;
  var cards = [].slice.call(grid.children);
  var input = bar.querySelector('[data-find]');
  var count = bar.querySelector('[data-count]');
  var none  = document.querySelector('[data-none]');
  var chips = [].slice.call(bar.querySelectorAll('[data-show]'));
  var WORDS = ${JSON.stringify(WORDS)};
  var ONE = ${JSON.stringify(group.one)}, MANY = ${JSON.stringify(group.many)};
  var show = bar.getAttribute('data-open') || 'all';

  function words(n){ return (WORDS[n] || String(n)) + ' ' + (n === 1 ? ONE : MANY); }

  function apply(){
    var q = (input.value || '').trim().toLowerCase();
    var shown = 0;
    cards.forEach(function(li){
      var isSold = li.getAttribute('data-sold') === 'true';
      var okState = show === 'all' || (show === 'sold') === isSold;
      var okFind = !q || (li.getAttribute('data-find') || '').indexOf(q) >= 0;
      var on = okState && okFind;
      li.hidden = !on;
      if(on) shown++;
    });
    count.textContent = words(shown);
    if(none) none.classList.toggle('is-on', shown === 0);
    chips.forEach(function(c){ c.setAttribute('aria-pressed', c.getAttribute('data-show') === show ? 'true' : 'false'); });
  }

  chips.forEach(function(c){
    c.addEventListener('click', function(){ show = c.getAttribute('data-show'); apply(); });
  });
  input.addEventListener('input', apply);
  /* A search should look through everything, not through the tab you happen
     to be on: typing widens the state filter to all by itself. */
  input.addEventListener('input', function(){ if(input.value.trim() && show !== 'all'){ show = 'all'; apply(); } });
  apply();
})();
<\/script>`;

/* The line a search engine shows under the title. Built from the fields
   rather than from their tagline alone: half the taglines are three words
   ("Just saddle broken!"), which reads as an empty result. Facts first,
   their sentence after, cut on a word boundary at 158. */
const metaDescription = (horse, group) => {
  const name = horseName(horse.name);
  const bits = [
    `${name}, ${group.singular} at Stud Von Axe`,
    horse.genetics ? horseName(horse.genetics) : '',
    [horse.year && `Born ${horse.year}`, horse.studbook, SEX(horse)].filter(Boolean).join(', '),
    theirWords(horse.tagline),
    group.intro.split('.')[0],          /* the group line, so a horse with three
                                           fields still says something useful */
  ].filter(Boolean);
  let out = '';
  for (const bit of bits) {
    const next = out ? `${out}. ${bit}` : bit;
    if (next.length > 158) break;
    out = next;
  }
  return (out || `${name}, ${group.one} at Stud Von Axe`).replace(/[.!]+$/, '') + '.';
};

/* ── the horse page, section one: picture, name, figures ───────────────── */
const factRow = (horse) => {
  const facts = [
    [horse.category === 'embryo' ? 'Stage' : 'Born',
     horse.category === 'embryo' ? when(horse) : horse.year],
    ['Sex', SEX(horse)],
    ['Studbook', horse.studbook],
    ['Height', horse.height],
    ['Status', horse.sold
      ? (horse.country ? `Sold to ${COUNTRY[horse.country] || horse.country}` : 'Sold')
      : 'Available'],
  ].filter(([, v]) => v);
  return facts.map(([k, v]) =>
    `<div><span class="hp__k">${esc(k)}</span><span class="hp__v">${esc(v)}</span></div>`).join('\n          ');
};

const introSection = (horse, group) => {
  const name = horseName(horse.name);
  const tag = horse.sold
    ? '<span class="hz__tag hz__tag--sold">Sold</span>'
    : '<span class="hz__tag">Available</span>';
  const pic = horse.photos.length
    ? `<div class="hp__pic"><img src="/${horse.photos[0]}" alt="${esc(name)}" fetchpriority="high">${tag}</div>`
    : `<div class="hz__win typo hp__pic"><p>${esc(horse.genetics || '')}</p>${tag}</div>`;
  return `
  <section class="hp">
    <div class="wrap hp__grid">
      <div class="hp__col">
        ${pic}
      </div>
      <div class="hp__col">
        <a class="hp__back" href="/${group.dir}"><span aria-hidden="true">&larr;</span> ${esc(group.label)}</a>
        <h1 class="hp__h">${esc(name)}</h1>
        ${horse.genetics ? `<p class="hp__cross">${esc(horseName(horse.genetics))}</p>` : ''}
        ${horse.tagline ? `<p class="hp__lead">${esc(theirWords(horse.tagline))}</p>` : ''}
        <div class="hp__facts">
          ${factRow(horse)}
        </div>
        <div class="hp__acts">
          <a href="/#contact" class="btn btn-gold btn-pill">Ask about this horse</a>
          ${horse.horsetelex ? `<a href="${esc(horse.horsetelex)}" target="_blank" rel="noopener"
             class="btn btn-ghost btn-pill">Pedigree on Horsetelex</a>` : ''}
        </div>
      </div>
    </div>
  </section>
`;
};

/* ── the horse page, section two: the story, in their words ────────────
   Only six of the sixty horses carry one on their site. The section is not
   drawn at all for the other fifty four rather than filled with something
   written here. */
const storySection = (horse) => {
  if (!horse.body.length) return '';
  const pic = horse.photos[1]
    ? `<div class="hp__col abst__pic"><img src="/${horse.photos[1]}" alt="${esc(horseName(horse.name))}" loading="lazy"></div>`
    : '';
  return `
  <section class="abst">
    <div class="wrap abst__grid"${pic ? '' : ' style="grid-template-columns:1fr"'}>
      <div class="abst__col">
        <p class="plaque">About this horse</p>
        <h2 class="abst__h">${esc(horseName(horse.name))}</h2>
        ${horse.body.map((t, i) =>
          `<p class="${i === 0 ? 'abst__lead' : 'abst__body'}">${esc(theirWords(t))}</p>`).join('\n        ')}
      </div>
      ${pic}
    </div>
  </section>
`;
};

/* ── the horse page, section three: the pedigree ────────────────────────
   Three generations, exactly as their own table has them. Drawn only when
   the table was there to read. */
const pedigreeSection = (horse) => {
  const p = horse.pedigree;
  if (!p || !p.sire) return '';
  const cell = (name, cls, span) =>
    name ? `<div class="ped__cell ${cls}" style="grid-row: span ${span}">${esc(horseName(name))}</div>` : '';
  const third = p.third || [];
  const branch = (parent, gsire, gdam, from) =>
    cell(parent, 'ped__cell--sire', 4) +
    cell(gsire, '', 2) + cell(third[from] || '', 'ped__cell--third', 1) +
    cell(third[from + 1] || '', 'ped__cell--third', 1) +
    cell(gdam, '', 2) + cell(third[from + 2] || '', 'ped__cell--third', 1) +
    cell(third[from + 3] || '', 'ped__cell--third', 1);
  return `
  <section class="ped">
    <div class="wrap">
      <div class="ped__plate">
        <h2 class="ped__h">Three generations <em>deep</em></h2>
        <div class="ped__grid">
          ${cell(horseName(horse.name), 'ped__cell--self', 8)}
          ${branch(p.sire, p.sireSire, p.sireDam, 0)}
          ${branch(p.dam, p.damSire, p.damDam, 4)}
        </div>
        ${horse.horsetelex ? `<p class="ped__note">The full pedigree is on
          <a href="${esc(horse.horsetelex)}" target="_blank" rel="noopener" style="color:var(--color-gold)">Horsetelex</a>.</p>` : ''}
      </div>
    </div>
  </section>
`;
};

/* ── the horse page, section four: the rest of the photographs ─────────
   The first is in the intro and the second, when there is one, sits beside
   the story. What is left goes here, and only if two or more are left. */
const gallerySection = (horse) => {
  const used = horse.body.length ? 2 : 1;
  const rest = horse.photos.slice(used);
  if (rest.length < 2) return '';
  return `
  <section class="hgal">
    <div class="wrap">
      <div class="hgal__grid${rest.length === 3 ? ' is-three' : ''}">
${rest.map((src) => `        <div class="hgal__f"><img src="/${src}" alt="${esc(horseName(horse.name))}" loading="lazy"></div>`).join('\n')}
      </div>
    </div>
  </section>
`;
};

/* ── the horse page, section five: more from the same group ────────────
   The homepage card again, three of them, and a way back to the whole set.
   Neighbours in the list rather than a random three, so two visits to two
   horses do not show the same three. */
const moreSection = (horse, group, list) => {
  const i = list.findIndex((h) => h.slug === horse.slug);
  const rest = [...list.slice(i + 1), ...list.slice(0, i)].slice(0, 3);
  if (!rest.length) return '';
  return `
  <section class="hmore">
    <div class="wrap">
      <div class="hmore__head">
        <h2 class="hmore__h">More <em>${esc(group.many)}</em></h2>
        <a class="hmore__all" href="/${group.dir}">All ${esc(group.many)} <span class="a" aria-hidden="true">&rarr;</span></a>
      </div>
      <ul class="hz__grid">
${rest.map((h) => '        ' + card(h, group)).join('\n')}
      </ul>
    </div>
  </section>
`;
};

/* ── the horse page, section six: the invitation ───────────────────────
   The plate the whole site closes on, with this horse named in it. */
const horseCta = (horse) => `
  <section class="abcta">
    <div class="wrap">
      <div class="pcta">
        <div class="pcta__bg" aria-hidden="true">
          <img src="/assets/img/hero-grey-wide.jpg" alt="" loading="lazy">
        </div>
        <div class="pcta__veil" aria-hidden="true"></div>
        <div>
          <p class="pcta__h">Interested in <em>${esc(horseName(horse.name))}</em>?</p>
          <p class="pcta__d">Ask us anything about the family behind this one, what the line has
          produced, or what it takes to bring it home. We answer plainly.</p>
        </div>
        <div class="pcta__acts">
          <a href="/#contact" class="btn btn-gold btn-pill">Get in touch</a>
          <a href="https://wa.me/393495918565" target="_blank" rel="noopener"
             class="btn btn-ghost btn-pill">Message on WhatsApp</a>
        </div>
      </div>
    </div>
  </section>
`;

/* ── section three: the invitation ─────────────────────────────────────
   The homepage plate, unchanged, with a line that fits the group. It is the
   only call to action on an archive: the cards are the page. */
const ctaSection = (group) => `
  <section class="abcta">
    <div class="wrap">
      <div class="pcta">
        <div class="pcta__bg" aria-hidden="true">
          <img src="/assets/img/hero-grey-wide.jpg" alt="" loading="lazy">
        </div>
        <div class="pcta__veil" aria-hidden="true"></div>
        <div>
          <p class="pcta__h">${group.ctaH}</p>
          <p class="pcta__d">${esc(group.ctaD)}</p>
        </div>
        <div class="pcta__acts">
          <a href="/#contact" class="btn btn-gold btn-pill">Get in touch</a>
          <a href="https://wa.me/393495918565" target="_blank" rel="noopener"
             class="btn btn-ghost btn-pill">Message on WhatsApp</a>
        </div>
      </div>
    </div>
  </section>
`;

/* ── section one: the hero ─────────────────────────────────────────────── */
const heroSection = (g) => `
  <section class="nhero">
    <div class="nhero__bg" aria-hidden="true">
      <img src="/assets/img/${g.img}" alt="" fetchpriority="high" width="${g.w}" height="${g.h}"
           style="object-position:${g.pos}">
    </div>
    <div class="nhero__veil" aria-hidden="true"></div>
    <div class="wrap">
      <div class="nhero__grid">
        <div>
          <p class="eyebrow">${esc(g.kicker)}</p>
          <h1 class="arch__h">${g.title}</h1>
        </div>
        <p class="arch__intro">${esc(g.intro)}</p>
      </div>
    </div>
  </section>
`;

/* The horse page: every section above, in the order they are defined, with
   the ones that have nothing to show left out entirely rather than drawn
   empty. */
const horsePage = (horse, group, groupList) => `<!DOCTYPE html>
<html lang="en">
<head>
${head({
  title: horseName(horse.name),
  desc: metaDescription(horse, group),
  path: `/${group.dir}/${horse.slug}`,
  image: horse.photos[0] ? horse.photos[0].replace('assets/img/', '') : 'hero-sport.jpg',
  ldType: 'ItemPage',
})}
<style>${CSS}</style>
</head>
<body>
${header.replace('class="hd"', 'class="hd is-pinned"')}

<main id="main">
${introSection(horse, group)}
${storySection(horse)}
${pedigreeSection(horse)}
${gallerySection(horse)}
${moreSection(horse, group, groupList)}
${horseCta(horse)}
</main>
${footer}
${navScript}
</body>
</html>
`;

/* ── the roll out ──────────────────────────────────────────────────────
   Four archives and a page for every horse on their site. Generated, so a
   horse added to horses-data.js appears in its archive, on its own page and
   in the "more" run of its neighbours in one command. */
const written = { archives: 0, horses: 0 };

for (const key of Object.keys(GROUPS)) {
  const group = GROUPS[key];
  const list = HORSES.filter((h) => h.category === key);
  mkdirSync(join(root, group.dir), { recursive: true });

  writeFileSync(join(root, group.dir, 'index.html'), page({
    title: group.label,
    desc: group.intro,
    path: `/${group.dir}`,
    image: group.img,
    body: heroSection(group) + gridSection(group, list) + ctaSection(group),
    extraScript: filterScript(group),
  }));
  written.archives++;

  for (const horse of list) {
    writeFileSync(join(root, group.dir, `${horse.slug}.html`), horsePage(horse, group, list));
    written.horses++;
  }
  console.log(`  ${group.dir}: archive + ${list.length} ${list.length === 1 ? group.one : group.many}`);
}

console.log(`built ${written.archives} archives and ${written.horses} horse pages`);

/* ── the homepage runs ─────────────────────────────────────────────────
   The homepage carried its own copy of the herd: fourteen horses typed out
   in one script and fifteen crosses in another, both audited by hand in
   August. They had drifted. Their embryo list is six damlines, not the five
   the homepage claimed, and the cards pointed at #contact with stand-in
   photographs while every one of those crosses now has a page and a picture
   of its own.
   So the cards are written here, by the same helpers that build the
   archives, into a file the homepage reads. One source, one recipe, and a
   number in the copy that is counted rather than typed. */
const homeCards = (list, group, limit) => list.slice(0, limit).map((h) => card(h, group)).join('\n');

const damlinesOf = (list) => new Set(
  list.map((h) => (h.name.split(/\s+X\s+/i)[1] || '').trim()).filter(Boolean)
).size;

const mares  = HORSES.filter((h) => h.category === 'broodmare');
const foals  = HORSES.filter((h) => h.category === 'foal');
const crosses = HORSES.filter((h) => h.category === 'embryo');
const sport  = HORSES.filter((h) => h.category === 'sport');

writeFileSync(join(root, 'horses-home.js'),
`/* Cards for the homepage runs, written by scripts/build-horses.mjs from
   horses-data.js. Do not edit: rebuild. The homepage used to hold its own
   copy of this list and the two fell out of step. */
var HOME_HORSES = {
  foals: ${JSON.stringify(homeCards(foals, GROUPS.foal, 8))},
  embryos: ${JSON.stringify(homeCards(crosses, GROUPS.embryo, 8))},
  mares: ${JSON.stringify(homeCards(mares, GROUPS.broodmare, 6))},
  sport: ${JSON.stringify(homeCards(sport, GROUPS.sport, 6))},
  counts: ${JSON.stringify({
    mares: mares.length, foals: foals.length, crosses: crosses.length, sport: sport.length,
    damlines: damlinesOf(crosses),
    foalsAvailable: foals.filter((h) => !h.sold).length,
    crossesAvailable: crosses.filter((h) => !h.sold).length,
    maresAvailable: mares.filter((h) => !h.sold).length,
  })},
  words: ${JSON.stringify(WORDS)}
};
`);
console.log('wrote horses-home.js for the homepage runs');
