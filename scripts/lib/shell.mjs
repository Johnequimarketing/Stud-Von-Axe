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
  .replace(/href="(breeding-mares|foals|embryos|sport-horses)\/"/g, 'href="/$1"')
  .replace(/(src|href)="assets\//g, '$1="/assets/')
  .replace(/href="index.html"/g, 'href="/"');

export const homeCss = home.match(/<style>([\s\S]*?)<\/style>/)[1];

export const header = relink(
  home.slice(home.indexOf('  <header class="hd">'),
             home.indexOf('  </header>') + '  </header>'.length)
).replace('<header class="hd">', '<header class="hd" id="site-header">');

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
  var hero = document.querySelector('.nhero, .ahero, .abhero');
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
export const head = ({ title, desc, path, image = 'hero-sport.jpg', ldType = 'WebPage', ldExtra = {} }) =>
`<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Stud Von Axe</title>
<meta name="description" content="${esc(desc)}">
<!-- CONCEPT, NOT LIVE. Remove the robots line on the day it goes live. -->
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://www.studvonaxe.it${path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Stud Von Axe">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://www.studvonaxe.it/assets/img/${image}">
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
export const storyCss = `
  /* ---- the story: the picture on the left, words on the right ----
     Mark's order, and the mirror of the homepage's about section, so the
     two do not read as the same block twice.
     The section carries the watermark the same way that one does, which is
     why it is relative and clipped: .stud__mark comes from the homepage
     sheet above and bleeds off the right edge. */
  .abst{
    position:relative; isolation:isolate; overflow-x:clip;
    padding-block:clamp(3.2rem,6vw,5rem);
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
