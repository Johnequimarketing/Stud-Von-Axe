/* The shared shell, lifted from the homepage.
 *
 * Every generated page — the news archive, the four stories, the about page —
 * wears the homepage's stylesheet, header and footer verbatim. This module is
 * the single place that lifts them, so a second builder cannot quietly grow a
 * second copy of the header and drift away from the first. Nothing shared is
 * ever authored twice; change index.html and rebuild.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const home = readFileSync(join(root, 'index.html'), 'utf-8');

/* Root absolute, never relative.
   A page is served at /news or /about with no trailing slash, and a browser
   resolves a relative href against the DIRECTORY of the current URL. The
   directory of /news is /, so href="contouch-top-price" resolved to
   /contouch-top-price and returned 404. Root absolute paths hold wherever the
   page is served, with or without the slash. */
export const relink = (html) => html
  .replace(/href="#/g, 'href="/#')
  .replace(/href="news\/"/g, 'href="/news"')
  .replace(/href="about\/"/g, 'href="/about"')
  .replace(/href="(breeding-mares|foals|embryos|sport-horses|contact|icsi-semen|privacy|terms)\/"/g, 'href="/$1"')
  .replace(/(src|href)="assets\//g, '$1="/assets/')
  .replace(/href="index.html"/g, 'href="/"');

export const homeCss = home.match(/<style>([\s\S]*?)<\/style>/)[1];

const bareHeader = relink(
  home.slice(home.indexOf('  <header class="hd">'),
             home.indexOf('  </header>') + '  </header>'.length)
)
  .replace('<header class="hd">', '<header class="hd" id="site-header">')
  /* index.html marks its own Home link, because it is the one page that is
     not generated and its Home is an anchor rather than a path. Every other
     page lifts this header, so that marking has to come off first or two
     items end up current at once. */
  .replace(' aria-current="page"', '');

export const header = bareHeader;

/* The header with the page you are on marked in it. Every page has carried the
   rule for [aria-current="page"] since the beginning and not one of them
   carried the attribute, so the menu never showed where you were. Pass the
   path a page is served at: headerFor('/foals'). */
/* Every copy of the destination, not the first one. About us and News are on
   the bar twice since 31 Aug: once in the right hand half and once inside the
   drawer, because a flex row cannot be split across a centred wordmark and
   the drawer is one list. Only one of the two is ever on screen, so marking
   both is marking the one you can see; marking the first would have put it on
   the hidden copy. */
export const headerFor = (path) => {
  if (!path) return bareHeader;
  const at = `href="${path}"`;
  return bareHeader.split(at).join(`${at} aria-current="page"`);
};

export const footer = relink(
  home.slice(home.indexOf('<footer class="site-footer">'),
             home.indexOf('</footer>') + '</footer>'.length)
);

/* A lift that silently returns nothing is worse than a crash: the page would
   build, look wrong, and pass an audit that only reads what is there. */
for (const [piece, name] of [[homeCss, 'stylesheet'], [header, 'header'], [footer, 'footer']]) {
  if (!piece || piece.length < 400) throw new Error(`could not lift the ${name} from index.html`);
}

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* The homepage's own two behaviours, and deliberately its own measurement:
   the hero's bottom edge against the visible bar, not a scroll distance.
   .hd is zero height by design, so its offsetHeight is 0 and the row is what
   has to be measured. Runs only where a hero exists. */
export const navScript = `<script>
(function(){
  var hd = document.querySelector('.hd');
  var row = hd && hd.querySelector('.hd__row');
  var hero = document.querySelector('.nhero, .ahero, .abhero, .eh, .hp--hero, .nf');
  if(hd && row && hero){
    var onScroll = function(){
      hd.classList.toggle('is-pinned', hero.getBoundingClientRect().bottom <= row.offsetHeight + 8);
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
    onScroll();
  }
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.innerHTML = open ? '&#10005;' : '&#9776;';
    });
    nav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '&#9776;';
      });
    });
  }
})();
<\/script>`;

/* The head every generated page shares. What differs per page is passed in:
   the title, the description, the path, the og:image and the JSON-LD type. */
/* What a link to this page looks like when it is pasted into WhatsApp or
   posted on Facebook. The networks want 1200 by 630; the photographs on this
   site are at most 1100 wide and usually taller than they are wide, so fifty
   of the fifty nine pages were handing over a picture too small for a large
   card. Every photograph now has a card of its own, built by
   scripts/make-share-cards.py, and the page points at that rather than at the
   photograph: same name, one folder along. */
const shareCard = (image) => {
  const stem = String(image).split('/').pop().replace(/\.[a-z]+$/i, '');
  return `/assets/img/share/${stem}.jpg`;
};

/* The name of the stud closes every title, but not at the cost of the title
   itself: a search result shows about sixty two characters and cuts the rest.
   The crosses she added on 6 September run to fifty two characters before the
   brand, and two of them carry "frozen" or "carrying" as well because they
   exist twice. Where both will not fit, the horse wins and the brand goes:
   the page is still ours, and a name cut in half helps nobody. */
const BRAND = ' | Stud Von Axe';
const titleTag = (t) => (t.length + BRAND.length <= 62 ? t + BRAND : t);

export const head = ({ title, desc, path, image = 'hero-sport.jpg', ldType = 'WebPage',
                       ogType = 'website', ldExtra = {} }) =>
`<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titleTag(title))}</title>
<meta name="description" content="${esc(desc)}">
<!-- CONCEPT, NOT LIVE. Remove the robots line on the day it goes live. -->
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://www.studvonaxe.it${path}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="https://www.studvonaxe.it${path}">
<meta property="og:locale" content="en_GB">
<meta property="og:site_name" content="Stud Von Axe">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://www.studvonaxe.it${shareCard(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}, Stud Von Axe">
<!-- X reads the og tags when these are missing, but only for a small card:
     without twitter:card it never shows the wide picture. -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="https://www.studvonaxe.it${shareCard(image)}">
<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': ldType, name: title, ...ldExtra })}
<\/script>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;

/* ---- the page hero: a covered photograph, the homepage veil ----
   Written once here because the news archive and the about page wear the
   same one; a second copy would be a second thing to keep in step. ---- */
export const pageHeroCss = `
  /* ---- the archive hero: a covered photograph, the homepage veil ---- */
  .nhero{
    position:relative; isolation:isolate; overflow:hidden;
    min-height:clamp(400px, 52vh, 520px);
    display:grid; align-items:end;
    background:var(--color-navy-deep);
  }
  /* Room at the foot for the filter bar to sit in, on the archives only. The
     words do not move: this is padding under them, so the photograph runs on
     past where the type stops and the bar has picture behind it rather than
     ivory. 4 Sep, Mark, and it is the homepage's old trick: a plate that
     hangs into the band above it, which the horses tray still does. */
  .nhero--cut{ padding-bottom:var(--cut-bar); }
  /* How far the bar reaches up into the photograph. One value, used twice:
       here as the hero's extra foot, and below as the bar's lift. */
  :root{ --cut-bar: clamp(38px, 5vw, 64px); }
  .nhero__bg{ position:absolute; inset:0; z-index:0; }
  .nhero__bg img{ width:100%; height:100%; object-fit:cover; object-position:50% 58%; }
  /* Type crosses the whole width, so the veil is a foot gradient: open at
     the head where the braids read, closing downward under the type. */
  /* A foot gradient, and the stops are measured rather than eyeballed.
     The gold eyebrow sits about 60% down this hero, where the first version
     left the picture bright: it measured 1.7:1 against a house floor of 3
     for gold on a dark ground, on all four archives and on the news page
     that has worn this veil since it was written. Re-measure if a hero
     photograph is ever swapped for a lighter one. */
  .nhero__veil{
    position:absolute; inset:0; z-index:1;
    background:linear-gradient(180deg,
      rgba(var(--veil-rgb), .46) 0%, rgba(var(--veil-rgb), .52) 28%,
      rgba(var(--veil-rgb), .86) 50%, rgba(var(--veil-rgb), .96) 100%);
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

`;

/* ---- the story block: words one side, a photograph the other ----
   Written once here because the about page and every horse page wear it. ---- */
/* ── the archive furniture ────────────────────────────────────────────
   The section rhythm, the filter bar and the closing invitation. Lifted out
   of scripts/build-horses.mjs on 31 Aug when the semen page needed the same
   filter bar: a component used by five pages cannot live inside the script
   that builds four of them. */
export const archiveCss = `
  /* The space between sections is one rule, not six: every section carries
     half of it on each side, so two neighbours add up to the same gap
     wherever they meet, and the first and last still clear the hero and the
     footer. That was the intention here and the line under it broke it: it
     redeclared --sec-half with a different value from the one in :root, so
     the same token meant 56px on the homepage and 57.6 on the eighty eight
     pages this stylesheet is lifted into. Declared once now, in :root, where
     --sec-full and --gap-section are. */
  .ped, .ln, .hvid, .hgal, .hmore, .arch{ padding-block:var(--sec-half); }
  /* The bar climbs into the hero by exactly the room the hero made for it,
     so the two cannot drift apart: one token, both sides of the seam. The
     plate keeps its own rounded corners, which is what makes the cut read
     as a plate laid on the photograph rather than a band across it. */
  .arch{ padding-top:0; }
  /* The grid keeps the page gutter; only the tray is wider than .wrap. */
  .arch > .wrap{ padding-top:clamp(1.6rem,3vw,2.4rem); }
  /* The tray carries the ivory up into the photograph and the bar rides on
     it, so the plate sits in a notch of the page's own ground rather than
     lying on the picture. Same width rule and same padding as the homepage
     tray, and the radius on the two corners that meet the hero. */
  .arch-tray{
    position:relative; z-index:2;
    width:min(calc(var(--wrap) + (2 * var(--tray-pad))), 100% - (2 * var(--gutter)));
    margin:calc(-1 * var(--cut-bar)) auto 0;
    padding:var(--tray-pad);
    background:var(--color-base);
    border-radius:var(--tray-radius) var(--tray-radius) 0 0;
  }
  /* No lift of its own any more: the notch is the separation. */
  .arch .flt{ margin-bottom:0; }
  .abcta{ padding-block:var(--sec-half) var(--sec-full); }
  .arch__count{
    font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.22em;
    text-transform:uppercase; color:var(--color-gold); margin:0 0 1.4rem;
  }
  /* Three across, not four. At four the picture is too small to read a horse
     off and the pedigree line under it wraps to three lines: 30 Aug, "dat
     wordt anders te krap en te klein". The embryo cards were already three. */
  @media (min-width:1100px){ .arch .hz__grid{ grid-template-columns:repeat(3, 1fr); } }

  /* ── the filter bar ────────────────────────────────────────────────────
     A field and three chips over the grid. The chips are the homepage's own
     .hz__chip, so an archive filters the way the homepage section already
     does, and the field beside them is the only control this page adds.
     Sold horses start hidden. They are not an answer to "what do you have",
     but they are the proof of where these lines have gone, so they are one
     chip away and never removed. A group with nothing available opens on
     everything rather than on an empty grid. */
  /* 31 Aug: one plate instead of six controls loose on the page ground. The
     bar is the only thing on an archive that is not a horse, and standing on
     the ivory it read as a row of odds and ends between the hero and the
     grid. On navy it is one object, it matches the plates the rest of the
     site is built from, and the grid below it starts cleanly.
     Everything inside it inverts: the field, the chips and the selects are
     the same shapes they were, in the colours a navy ground needs. */
  .flt{
    display:flex; flex-wrap:wrap; align-items:center; gap:.8rem 1.1rem;
    margin-bottom:clamp(1.6rem,3vw,2.4rem);
    padding:clamp(1rem,1.8vw,1.3rem) clamp(1.1rem,2vw,1.5rem);
    border-radius:var(--plate-radius);
    background:var(--color-navy-deep);
    box-shadow:0 26px 60px -44px rgba(var(--veil-rgb),.5);
  }
  .flt__search{ position:relative; flex:1 1 220px; max-width:290px; min-width:0; }
  .flt__search input{
    width:100%; appearance:none; -webkit-appearance:none;
    padding:.7rem 2.3rem .7rem .95rem;
    border:1px solid var(--color-line-invert); border-radius:100px;
    background:rgba(255,255,255,.06); color:var(--color-white);
    font-family:var(--font-body); font-size:14.5px;
    transition:border-color .3s var(--ease), background .3s var(--ease);
  }
  .flt__search input::placeholder{ color:rgba(255,255,255,.55); }
  .flt__search input:focus{ outline:none; border-color:var(--color-gold);
    background:rgba(255,255,255,.1); }
  .flt__search input:focus-visible{ outline:2px solid var(--color-gold); outline-offset:2px; }
  .flt__ico{
    position:absolute; right:.95rem; top:50%; transform:translateY(-50%);
    width:14px; height:14px; pointer-events:none; color:rgba(255,255,255,.55);
  }
  .flt__chips{ display:flex; flex-wrap:wrap; gap:.5rem; }
  /* The narrowing that is not a yes or no. What is for sale is a chip, because
     it is the first question and it has two answers; a studbook, a sex and a
     year are lists, and a list of five chips beside a list of eight is a wall
     of buttons. Same box as a form field, one size down: this is a control
     bar, not a form. */
  .flt__sels{ display:flex; flex-wrap:wrap; gap:.5rem; }
  .flt__sel select{
    appearance:none; -webkit-appearance:none; cursor:pointer;
    padding:.55rem 2.4em .55rem .9rem; min-height:40px;
    border:1px solid var(--color-line-invert); border-radius:var(--ctl-radius);
    background-color:rgba(255,255,255,.06); color:var(--color-white);
    font-family:var(--font-body); font-size:13px;
    background-image:linear-gradient(45deg, transparent 50%, var(--color-white) 50%),
                     linear-gradient(135deg, var(--color-white) 50%, transparent 50%);
    background-position:calc(100% - 1.05em) 55%, calc(100% - .75em) 55%;
    background-size:6px 6px, 6px 6px; background-repeat:no-repeat;
    transition:border-color .3s var(--ease), background-color .3s var(--ease);
  }
  /* The list itself is drawn by the operating system and takes the page's own
     colours, not the plate's, so its options are set back to ink on ivory. */
  .flt__sel option{ background:var(--color-base); color:var(--color-ink); }
  .flt__sel select:hover{ border-color:var(--color-gold); background-color:rgba(255,255,255,.1); }
  .flt__sel select:focus-visible{ outline:2px solid var(--color-gold); outline-offset:2px; }

  /* The chips, on the plate. Ivory when they are off and gold when they are
     on: navy on navy would have been a hole rather than a pressed button. */
  .flt .hz__chip{
    background:rgba(255,255,255,.06); border-color:var(--color-line-invert);
    color:var(--color-white);
  }
  .flt .hz__chip:hover{ border-color:var(--color-gold); }
  .flt .hz__chip[aria-pressed="true"]{
    background:var(--color-gold); border-color:var(--color-gold); color:var(--color-navy);
  }
  .flt__count{
    margin-left:auto; font-family:var(--font-body); font-weight:700; font-size:11px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); white-space:nowrap;
  }
  .flt__none{ display:none; margin:2.4rem 0 1rem; font-size:16px; color:var(--color-ink-soft); }
  .flt__none.is-on{ display:block; }
  .hz__grid li[hidden]{ display:none; }
  @media (max-width:620px){
    .flt__search{ max-width:none; flex-basis:100%; }
    .flt__count{ margin-left:0; }
  }
`;

export const storyCss = `
  /* ---- the story: the picture on the left, words on the right ----
     Mark's order, and the mirror of the homepage's about section, so the
     two do not read as the same block twice.
     The section carries the watermark the same way that one does, which is
     why it is relative and clipped: .stud__mark comes from the homepage
     sheet above and bleeds off the right edge. */
  .abst{
    position:relative; isolation:isolate; overflow-x:clip;
    padding-block:var(--sec-full);
  }
  .abst__grid{ position:relative; z-index:1; display:grid; gap:clamp(1.8rem,4vw,3.2rem); align-items:center; }
  @media (min-width:900px){ .abst__grid{ grid-template-columns:.95fr 1.05fr; } }
  .abst__col{ min-width:0; }
  .abst__h{
    margin:.7rem 0 1.2rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.8rem,2.6vw + .9rem,2.9rem); line-height:1.04;
    letter-spacing:-.02em; color:var(--color-ink); max-width:15ch; text-wrap:balance;
  }
  .abst__h em{ font-style:italic; color:var(--color-gold); }
  .abst__lead{ margin:0 0 1rem; font-size:17.5px; line-height:1.6; color:var(--color-ink); max-width:52ch; }
  .abst__body{ margin:0 0 1rem; font-size:16px; line-height:1.68; color:var(--color-ink-soft); max-width:52ch; }
  .abst__body b{ font-weight:700; color:var(--color-ink); }
`;

/* The form has nowhere to post to: this site is static files on Vercel with no
   back end and no mail account behind it. Rather than swallow the message the
   way the homepage form does, it hands it to the visitor's own mail app with
   every field already written out, so pressing send actually sends something.
   When a form service or a function is chosen, this is the one block that
   changes and the markup stays exactly as it is. */
export const askScript = `<script>
(function(){
  var form = document.querySelector('.ask__form');
  if (!form) return;
  var note = form.querySelector('.ask__note');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!form.reportValidity()) return;
    var get = function(n){ var el = form.elements[n]; return el ? el.value.trim() : ''; };
    var about = get('about') || form.getAttribute('data-horse');
    var body = [
      'About: ' + about,
      'Name: ' + get('name'),
      'Email: ' + get('email'),
      get('tel') ? 'Telephone: ' + get('tel') : '',
      '',
      get('message')
    /* Escaped twice on purpose: this file is a template literal, so a single
       backslash-n written here becomes a real line break in the page and
       leaves the string open. The closing script tag has the same trap, which
       is why naming it inside this comment closed the script and broke all
       sixty pages: a comment is still text in the output. */
    ].filter(function(l){ return l !== ''; }).join('\\n');
    note.textContent = 'Opening your mail app with the message ready to send. If nothing happens, write to studvonaxe@gmail.com.';
    location.href = 'mailto:studvonaxe@gmail.com'
      + '?subject=' + encodeURIComponent('Enquiry: ' + about)
      + '&body=' + encodeURIComponent(body);
  });
})();
<\/script>`;
