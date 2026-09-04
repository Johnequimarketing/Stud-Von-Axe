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
import { root, homeCss, pageHeroCss, storyCss, header, footer, head, navScript, esc, askScript, archiveCss, headerFor } from './lib/shell.mjs';
import { orderScript } from './lib/order-form.mjs';

const HARVESTED = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();
/* The thirteen stallions of the ICSI semen line. Their own site has no
   stallion page, so these cannot be harvested: the names and the pedigrees
   are read out of the pedigree tables of their own crosses and kept in
   semen-data.js by hand. Same shape as a horse, so everything below builds
   the archive and the thirteen pages without knowing they arrived
   separately. */
const SEMEN = new Function(readFileSync(join(root, 'semen-data.js'), 'utf-8') + '; return SEMEN;')();

/* ── who a horse's parents are, out of their own tables ─────────────────
   A stallion has no page on their site, so his pedigree is read off the
   crosses he sired, and those tables stop one generation short of his: his
   sire, his dam and his four grandparents, and nothing beyond. That left the
   thirteen stallion pages a column short of every other page on the site.
   But the same sixty tables name a great many of those grandparents again, in
   places where their own parents ARE written down: Clinton stands as a
   grandparent on one cross and as a great grandparent's sire on another. This
   index reads every table once and remembers who each name's parents are, and
   the stallions borrow from it.
   Sixteen of the fifty two pairs are in there. The rest are simply not on
   their site, and a name we do not have is left out rather than typed from
   somewhere else. */
const keyOf = (n) => String(n || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const PARENTS = (() => {
  const m = new Map();
  const add = (name, sire, dam) => {
    const k = keyOf(name);
    if (!k || (!sire && !dam)) return;
    const cur = m.get(k) || { sire: '', dam: '' };
    if (!cur.sire && sire) cur.sire = sire;
    if (!cur.dam && dam) cur.dam = dam;
    m.set(k, cur);
  };
  for (const h of HARVESTED) {
    const p = h.pedigree || {}, t = p.third || [];
    add(p.sire, p.sireSire, p.sireDam);
    add(p.dam, p.damSire, p.damDam);
    add(p.sireSire, t[0], t[1]); add(p.sireDam, t[2], t[3]);
    add(p.damSire, t[4], t[5]); add(p.damDam, t[6], t[7]);
  }
  return m;
})();

/* Every stallion's third generation, as far as their own tables carry it.
   Sixteen of the fifty two pairs are in there; the rest are simply not on
   their site. Mark's call on 31 Aug: draw the table whole either way and let
   the cells we cannot fill say so, rather than a short table or a ragged one.
   All sixty of their own horses have all fourteen, so the words only ever
   appear on these thirteen pages. */
for (const st of SEMEN) {
  const p = st.pedigree;
  if (p.third && p.third.length) continue;
  const of = (n) => PARENTS.get(keyOf(n)) || { sire: '', dam: '' };
  p.third = [p.sireSire, p.sireDam, p.damSire, p.damDam]
    .flatMap((n) => { const r = of(n); return [r.sire, r.dam]; });
}

const HORSES = [...HARVESTED, ...SEMEN];
/* Hand filled fields the harvest must never overwrite: see horses-extra.js. */
const EXTRA = new Function(readFileSync(join(root, 'horses-extra.js'), 'utf-8') + '; return HORSES_EXTRA;')();
/* Title and poster for every film, written by scripts/fetch-videos.py. */
const VIDEOS = new Function(readFileSync(join(root, 'horses-videos.js'), 'utf-8') + '; return HORSE_VIDEOS;')();
/* The country flags, shared with the homepage so there is one drawing of each
   rather than one per file. */
const FLAGS = new Function(readFileSync(join(root, 'flags.js'), 'utf-8') + '; return FLAGS;')();

/* One entry per archive. A hero is a wide strip, so the photograph is
   chosen on shape as much as on subject: three of these are 2.25:1 crops
   cut once from the nearly square originals rather than left to object-fit
   to guess at, which showed a band of neck and nothing else. Made by the
   crop step in this repository's history and checked on a render. */
const GROUPS = {
  broodmare: {
    dir: 'breeding-mares',
    /* No selects. The client took the age and studbook filters off the mares
       on 3 Sep; the search box and the All / Available / Sold chips stay. */
    facets: [],
    find: 'Try a sire, a damline or a studbook.',
    label: 'Breeding mares',
    kicker: 'The mares',
    title: 'The bloodlines behind <em>what we breed</em>',
    intro: 'Strong maternal lines are at the heart of our breeding programme. Each mare brings proven genetics, performance and the potential to produce the horses we want to see in the sport of tomorrow.',
    /* The intro is theirs and runs to 192 characters, which is a paragraph
       and not a search result. desc is the same sentence cut to fit the 70
       to 160 the audit holds every description to. */
    desc: 'Strong maternal lines are at the heart of our breeding programme, each mare chosen for what her family produces in sport.',
    img: 'hero-cortina-wide.jpg', pos: '50% 46%', w: 1920, h: 1150,
    one: 'mare', many: 'mares', singular: 'breeding mare',
    ctaH: 'Looking for a mare to <em>breed from</em>?',
    ctaD: 'Tell us the line you are after. If she is not here, we will say so, and we will tell you what is coming out of the same families.',
  },
  foal: {
    dir: 'foals',
    facets: ['sex', 'born', 'studbook'],
    find: 'Try a sire, a damline, a year or a country.',
    label: 'Foals',
    kicker: 'The foals',
    title: 'Born from great bloodlines. <em>Raised in Belgium.</em>',
    intro: 'Born from proven bloodlines and raised with care, our foals are selected and developed with one goal: to become the sport horses of tomorrow.',
    img: 'arch-foals.jpg', pos: '50% 50%', w: 1920, h: 853,
    one: 'foal', many: 'foals', singular: 'foal',
    card: (h, full) => foalCard(h, GROUPS.foal, full), grid: ' ec__grid',
    ctaH: 'Tell us what you are <em>looking for</em>.',
    ctaD: 'A foal on the ground, or a cross still to be made. Say what you are after and we will tell you plainly what we have.',
  },
  embryo: {
    dir: 'embryos',
    find: 'Try a sire, a dam or a year.',
    label: 'Embryos',
    kicker: 'The embryos',
    title: 'The bloodlines you want. <em>The future you choose.</em>',
    intro: 'Selected from outstanding families and proven sport horse combinations, our embryos give breeders and owners access to bloodlines with real breeding and performance potential.',
    desc: 'Selected from outstanding families and proven sport horse combinations, with real breeding and performance potential.',
    img: 'arch-embryos.jpg', pos: '50% 50%', w: 1920, h: 853,
    one: 'cross', many: 'crosses', singular: 'cross',
    card: (h, full) => embryoCard(h, full), grid: ' ec__grid',
    ctaH: 'Ask about a <em>cross</em>.',
    ctaD: 'Frozen or already carrying. We will tell you which stage a cross is at and what it takes to bring it home.',
  },
  stallion: {
    dir: 'icsi-semen',
    find: 'Try a name or a sire.',
    label: 'ICSI semen',
    kicker: 'ICSI semen',
    title: 'The best stallions. Quality semen. <em>Fair prices.</em>',
    /* Their own card of 4 Sep says it in six words, and the six are theirs:
       fixed prices, no extra costs for embryos produced. It is the only
       thing on that card besides the names and the two telephone numbers,
       so it belongs in the line that opens the page. */
    /* Their sentence, with one word changed and said out loud here: they
       wrote "frozen semen", and on 31 Aug they confirmed ICSI only, no fresh
       and no frozen. An audit check fails any public page that names a kind
       of semen they do not sell, and it exists because the site contradicted
       itself on three pages before. Their semen is of course stored frozen,
       so the word may be description rather than product; it is one word to
       put back if they mean the category. */
    intro: 'We offer ICSI semen from selected stallions, stored at Avantea and available at competitive prices, making proven genetics more accessible to breeders.',
    metaLine: 'ICSI semen from selected stallions, stored at Avantea',
    img: 'arch-semen.jpg', pos: '50% 42%', w: 1920, h: 853,
    one: 'stallion', many: 'stallions', singular: 'stallion',
    /* No chips. Every other archive filters on something the data knows:
       sold against available, frozen against carrying. Here it knows
       nothing to split on, so a chip would be a control that does nothing.
       The search box stays, and twenty four names earn it. */
    chips: false,
    card: (h, full) => stallionCard(h, full), grid: ' ec__grid',
    ctaH: 'Order your ICSI <em>through us</em>.',
    ctaD: 'Open a stallion and the order form asks for everything we need: you, your mare, and when you want the dose.',
  },
  sport: {
    dir: 'sport-horses',
    facets: ['sex', 'studbook', 'born'],
    find: 'Try a sire, a damline or a country.',
    label: 'Sport horses',
    kicker: 'The sport horses',
    title: 'Bred here, <em>jumping elsewhere</em>',
    intro: 'Horses out of this programme that have gone on into sport, and mares that can still do both. Bred here, sold direct, listed with where they went.',
    img: 'arch-sport.jpg', pos: '50% 50%', w: 1920, h: 853,
    one: 'horse', many: 'horses', singular: 'sport horse',
    ctaH: 'Looking for a particular <em>horse</em>?',
    ctaD: 'We also look on a client\'s behalf, across Europe and as far as America. Tell us what you need and we will go and find it.',
  },
};

/* orderCss is out of the bundle: the five step order form came off the
   stallion pages on 4 Sep and nothing draws .ord any more, so its rules were
   riding on all hundred and four pages for nothing. scripts/lib/order-form.mjs
   stays on disk, whole: if the configurator is wanted again it is this import
   and one call, not a rebuild. */
const CSS = homeCss + pageHeroCss + storyCss + archiveCss + `
  /* ── horse pages only. Everything above is the homepage stylesheet. ── */

  /* The hero starts at the top of the page and the header hangs over it. */
  .nhero > .wrap{ padding-top:clamp(6rem,13vh,8rem); }

  /* The archive grid is the homepage's own .hz__grid, given the room a page
     has and the homepage section does not: four across instead of three. */

  /* The line above a row inside a section that holds two of them. Same
     treatment as the plaque eyebrow, one step quieter. */
  .hmore__lab{
    margin:1.8rem 0 .9rem; font-family:var(--font-body); font-weight:700;
    font-size:10px; letter-spacing:.18em; text-transform:uppercase;
    color:var(--color-gold);
  }
  .hmore__lab:first-of-type{ margin-top:0; }

  /* Nothing to enlarge and nothing to play: neither is a button. */
  .hgal__f--stand{ cursor:default; }
  .hgal__f--stand:hover img{ transform:none; }
  .hvid__btn--stand{ cursor:default; }
  .hvid__btn--stand:hover img{ transform:none; }
  .hvid__btn--stand .hvid__play{ opacity:.55; }

  /* ── the embryo head: the tray, nothing on the photograph ──────────────
     Chosen on 30 Aug. The photograph carries only the back link, so it stays
     a photograph, and a plate hangs into it from below with the name, their
     sentence, the figures and the two actions on it. It solves the crowded
     title by removing the cause, and it is the version that still works on
     the seven crosses with no picture of their own.
     The veil is navy across the whole frame rather than a light wash: that
     is how this site tints a photograph, and the header is transparent over
     it, so the top has to hold white 15px links. */
  .eh{ position:relative; }
  .eh__win{ position:relative; height:clamp(360px,48vh,520px); overflow:hidden;
    background:var(--color-navy-deep); }
  .eh__win img{ width:100%; height:100%; object-fit:cover; display:block; }
  .eh__mark{ position:absolute; inset:0; display:grid; place-items:center; }
  .eh__mark img{ width:auto; height:26%; max-height:110px; opacity:.16; }
  .eh__veil{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),.56) 0%, rgba(var(--veil-rgb),.4) 40%,
      rgba(var(--veil-rgb),.5) 100%); }
  .eh__back{ position:absolute; left:0; right:0;
    top:calc(var(--hd-top) + var(--hd-plate) + 1.5rem); z-index:2;
    width:min(var(--wrap), 100% - (2*var(--gutter))); margin-inline:auto;
    display:flex; align-items:center; gap:.5rem;
    font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.18em;
    text-transform:uppercase; color:rgba(255,255,255,.8); transition:color .3s var(--ease); }
  .eh__back:hover{ color:var(--color-white); }
  .eh__cap{ position:absolute; right:var(--gutter); bottom:clamp(3.6rem,5vw,4.6rem); z-index:2;
    margin:0; font-family:var(--font-body); font-size:11px; letter-spacing:.05em;
    color:rgba(255,255,255,.72); }
  .eh__tray{ position:relative; z-index:2; margin-top:clamp(-3rem,-3.4vw,-2rem);
    background:var(--color-base); border-radius:var(--plate-radius);
    border:1px solid var(--color-line);
    padding:clamp(1.4rem,2.8vw,2rem); box-shadow:0 30px 60px -44px rgba(var(--veil-rgb),.5); }
  .eh__stage{ display:inline-flex; align-items:center; padding:.34em .85em;
    border-radius:var(--ctl-radius); background:var(--color-gold); color:var(--color-navy);
    font-family:var(--font-body); font-weight:700; font-size:9.5px; letter-spacing:.16em;
    text-transform:uppercase; }
  .eh__h{ margin:.9rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.7rem,2.4vw + .8rem,2.5rem); line-height:1.06; letter-spacing:-.02em;
    color:var(--color-ink); max-width:22ch; }
  .eh__h em{ font-style:italic; color:var(--color-gold); }
  .eh__say{ margin:.6rem 0 1.2rem; font-family:var(--font-display); font-style:italic;
    font-size:16px; line-height:1.5; color:var(--color-navy); max-width:52ch; }
  .eh__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem 1.4rem;
    padding-top:1.1rem; border-top:1px solid var(--color-line); }
  @media (min-width:760px){ .eh__facts{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
  .eh__k{ display:block; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.28rem; }
  .eh__v{ display:inline-block; font-family:var(--font-display); font-weight:400; font-size:1.05rem;
    line-height:1.25; color:var(--color-ink); }
  /* The Horsetelex link used to sit as a loose row of its own between the
     facts and the buttons, a third kind of link in a small space. It belongs
     to the sire and the dam, so it lives on their names instead: same size
     as the other facts, a small mark to say it leaves the site. */
  .eh__v--telex{ color:var(--color-navy); text-decoration:none;
    border-bottom:1px solid var(--color-line); padding-bottom:1px;
    transition:border-color .3s var(--ease), color .3s var(--ease); }
  .eh__v--telex span[aria-hidden]{ font-size:.72em; color:var(--color-gold); }
  .eh__v--telex:hover{ color:var(--color-gold); border-color:var(--color-gold); }
  .eh__acts{ display:flex; flex-wrap:wrap; gap:.7rem; margin-top:1.4rem; }
  .eh__acts .btn-ghost{ border-color:var(--color-line); color:var(--color-ink); }
  .eh__acts .btn-ghost:hover{ border-color:var(--color-navy); color:var(--color-navy); }


  /* ── the dam ───────────────────────────────────────────────────────────
     The one section a cross earns that a horse does not: whoever is buying
     an embryo is buying her family. Her own page carries the record, so
     this is her photograph, her breeding, her first paragraph and a way
     through to it. */
  .dam{ padding-bottom:clamp(2.6rem,5vw,4rem); }
  .dam__plate{ display:grid; gap:clamp(1.4rem,3vw,2.4rem); align-items:center;
    padding:clamp(1.4rem,3vw,2.2rem); border-radius:var(--plate-radius);
    background:var(--color-navy-deep); }
  @media (min-width:820px){ .dam__plate{ grid-template-columns:.42fr 1fr; } }
  .dam__pic{ border-radius:var(--card-radius); overflow:hidden; aspect-ratio:4/3;
    background:color-mix(in srgb, var(--color-navy) 70%, var(--color-white)); }
  .dam__pic img{ width:100%; height:100%; object-fit:cover; display:block; }
  .dam__body{ min-width:0; }
  .dam__k{ display:block; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.2em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.4rem; }
  .dam__h{ margin:0 0 .3rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.3rem,1.6vw + .7rem,1.75rem); line-height:1.12; color:var(--color-white); }
  .dam__ped{ display:block; font-family:var(--font-display); font-style:italic; font-size:13.5px;
    color:var(--color-gold); margin-bottom:.7rem; }
  .dam__p{ margin:0 0 1rem; font-size:14.5px; line-height:1.6; color:rgba(255,255,255,.78); max-width:56ch; }
  .dam__go{ font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.14em;
    text-transform:uppercase; color:var(--color-white);
    display:inline-flex; align-items:center; gap:.5rem; transition:gap .35s var(--ease); }
  .dam__go:hover{ gap:.85rem; }
  .dam__go .a{ color:var(--color-gold); }


  /* ── the two lines ─────────────────────────────────────────────────── */
  .ln__plate{ display:grid; gap:clamp(1.6rem,3vw,2.4rem);
    padding:clamp(1.5rem,3vw,2.3rem); border-radius:var(--plate-radius);
    background:var(--color-navy-deep); }
  @media (min-width:820px){ .ln__plate{ grid-template-columns:1fr 1px 1fr; } }
  .ln__rule{ display:none; background:color-mix(in srgb, var(--color-gold) 55%, transparent); }
  @media (min-width:820px){ .ln__rule{ display:block; } }
  .ln__col{ min-width:0; }
  .ln__win{ display:block; aspect-ratio:4/3; border-radius:var(--card-radius); overflow:hidden;
    margin-bottom:1.05rem; background:color-mix(in srgb, var(--color-navy) 70%, var(--color-white)); }
  .ln__win img{ width:100%; height:100%; object-fit:cover; display:block; }
  .ln__win--none{ display:grid; place-items:center; background:color-mix(in srgb, var(--color-navy) 82%, var(--color-white)); }
  .ln__win--none img{ width:auto; height:34%; max-height:64px; opacity:.2; }
  .ln__k{ display:block; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.2em; text-transform:uppercase; color:var(--color-gold); }
  .ln__n{ margin:.35rem 0 .2rem; font-family:var(--font-display); font-weight:400; font-size:1.35rem;
    line-height:1.15; color:var(--color-white); }
  .ln__p{ display:block; font-family:var(--font-display); font-style:italic; font-size:13px;
    color:var(--color-gold); margin-bottom:.75rem; }
  .ln__t{ margin:0 0 1rem; font-size:14.5px; line-height:1.6; color:rgba(255,255,255,.76); max-width:52ch; }
  .ln__t--waiting{ font-style:italic; color:rgba(255,255,255,.5); }
  .ln__go{ display:flex; flex-wrap:wrap; gap:.35rem 1.3rem; }
  .ln__go a{ font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.14em;
    text-transform:uppercase; color:var(--color-white);
    display:inline-flex; align-items:center; gap:.45rem; transition:gap .35s var(--ease); }
  .ln__go a:hover{ gap:.8rem; }
  .ln__go .a{ color:var(--color-gold); }
  /* ── the horse's own page ──────────────────────────────────────────────
     No dark hero here. A horse photograph stands or is square, and a wide
     strip keeps a fifth of it: the rule the about page's hero taught. So
     the picture keeps its own proportions on the left and the horse's name
     and figures stand beside it, which is also how the reference pages Mark
     sent are laid out. The header wears its pinned colours from the first
     pixel because there is no photograph behind it. */
  /* The top clears the hero and is measured in vh on purpose; the foot is
     the scale like every other section. */
  .hp{ padding-block:clamp(6.5rem,14vh,9rem) var(--sec-half); }
  /* With a hero the section starts at the top of the page and the two columns
     hang into the photograph from below, the same move the embryo tray makes,
     so a horse page and a cross page open the same way. */
  .hp--hero{ position:relative; padding-top:0; }
  .hp--hero .hp__grid{ position:relative; z-index:2; margin-top:clamp(-3.6rem,-4vw,-2.4rem); }
  /* One photograph, two crops: the band takes the head, the column keeps the
     whole horse, so the same file does not read as the same picture twice. */
  .eh__win--high img{ object-position:center 22%; }
  .hp__grid{ display:grid; gap:clamp(1.8rem,4vw,3.4rem); align-items:start; }
  @media (min-width:900px){ .hp__grid{ grid-template-columns:.92fr 1.08fr; } }
  /* Everything that stood loose beside the picture, gathered onto one plate. */
  /* Ivory on ivory: hanging in the photograph the plate reads by contrast,
     but on a narrow screen it sits below the picture on the page ground and
     the shadow alone is not enough to see an edge. A hairline gives it one. */
  .hp__tray{
    background:var(--color-base); border-radius:var(--plate-radius);
    border:1px solid var(--color-line);
    padding:clamp(1.4rem,2.8vw,2rem);
    box-shadow:0 30px 60px -44px rgba(var(--veil-rgb),.5);
  }
  .hp--hero .hp__pic{ box-shadow:0 30px 60px -44px rgba(var(--veil-rgb),.5); }
  /* Both columns end on the same line, whichever of the two is taller: 30 Aug,
     "beide kolommen altijd minimaal even hoog maken". The plate sets the
     height because it is the one with a length of its own, and the photograph
     fills whatever that comes to by cropping rather than by leaving a gap.
     A floor keeps the picture from flattening into a strip on a horse whose
     plate carries only a name and two buttons.
     Below 900px the two are stacked, and there the picture keeps its own
     proportions: nothing to match. */
  @media (min-width:900px){
    .hp--hero .hp__grid{ align-items:stretch; min-height:clamp(360px, 32vw, 460px); }
    .hp--hero .hp__col{ display:flex; flex-direction:column; gap:clamp(.8rem,1.4vw,1.1rem); }
    /* Only the pictures share out the height. Written as .hp__col > * it also
       caught the plate, which then had a height forced on it and spilled its
       own text across the page: a rule aimed at one column applied to both. */
    .hp--hero .hp__pic{ flex:1 1 0; min-width:0; min-height:0; }
    /* The plate grows into the column when the pictures are taller, and never
       shrinks below its own text. flex:0 0 auto left it at its natural height
       against a 460px picture; flex:1 1 0 forced a height on it and spilled
       the paragraph. This is the pair that does neither. */
    .hp--hero .hp__tray{ flex:1 1 auto; min-width:0; }
    .hp--hero .hp__pic{ position:relative; }
    .hp--hero .hp__pic img{
      position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
      /* Where a long paragraph makes the frame taller than the photograph is
         shaped, the crop has to come off the bottom rather than off both ends:
         centred, Cortina lost her head and kept her legs. These are standing
         profile shots, so the horse lives in the upper two thirds. */
      object-position:center 30%;
    }
  }
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
  .hp__back--dark{ color:rgba(255,255,255,.72); margin-bottom:.2rem; }
  .hp__back--dark:hover{ color:var(--color-white); }
  .hp__h{
    margin:0 0 .4rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(2rem,3vw + 1rem,3rem); line-height:1.02; letter-spacing:-.02em;
    color:var(--color-ink);
  }
  .hp__cross{
    margin:0 0 1.2rem; font-family:var(--font-display); font-style:italic;
    font-size:1.05rem; color:var(--color-gold);
  }
  .hp__lead{ margin:0 0 1.6rem; font-size:17.5px; line-height:1.6; color:var(--color-ink); max-width:46ch; }

  /* Their paragraph, in the tray under the tagline. */
  .hp__story{ margin:0 0 1.6rem; max-width:52ch; }
  .hp__story p{ margin:0 0 .8rem; font-size:15.5px; line-height:1.65; color:var(--color-ink-soft); }
  .hp__story p:last-child{ margin-bottom:0; }
  .hp__storyk{
    font-family:var(--font-body); font-weight:700; font-size:10px; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-gold); margin:0 0 .5rem !important;
  }
  .hp__storyk em{ font-style:normal; color:var(--color-ink-soft); }

  /* ── the figures, as accent blocks ─────────────────────────────────────
     30 Aug: four blocks in the accent colour side by side, rather than four
     columns of loose type under a rule. They are small, so the gold reads as
     an accent rather than a field of it, and the row fills whatever the count:
     a horse may have three of these or five. */
  /* A row of their own, under both columns rather than inside the plate:
     30 Aug, "die blokjes moeten eronder komen, onder de 2 kolommen". Across
     the full width they can breathe, and the plate above holds only what is
     said in words. */
  .hp__facts{
    display:grid; gap:clamp(.5rem,1vw,.8rem); margin:clamp(1.4rem,3vw,2.2rem) 0 0;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    padding-top:0; border-top:0;
  }
  @media (min-width:620px){
    .hp__facts{ grid-template-columns:repeat(var(--cols, 4), minmax(0, 1fr)); }
  }
  /* Gold at eighteen percent read as beige rather than as the accent: 30 Aug,
     "vind die 4 blokjes nu niet helemaal passen". The accent is the accent, so
     the block takes the full gold with navy on it, which is the button pairing
     this site already uses and measures 5.70:1. A gold rule across the top
     lifts it off the page, and the figure is set in the display face at
     reading size so the block is read for its answer, not its label. */
  .hp__fact{
    position:relative; overflow:hidden;
    padding:clamp(.9rem,1.7vw,1.2rem) clamp(1rem,1.8vw,1.3rem);
    border-radius:var(--card-radius);
    background:color-mix(in srgb, var(--color-gold) 92%, var(--color-white));
    box-shadow:0 18px 34px -28px rgba(var(--veil-rgb),.55);
  }
  .hp__fact::before{
    content:""; position:absolute; left:0; right:0; top:0; height:3px;
    background:color-mix(in srgb, var(--color-navy) 85%, transparent);
  }

  /* The figures. The two places on the about page, widened: a row of
     hairline columns, and a field their site left empty is left out rather
     than shown as a dash. */
  /* Replaced above by the accent blocks; the old loose columns are gone. */
  /* Inside an accent block the label cannot stay gold: gold on gold. Navy at
     seventy two percent holds its own against that ground and still sits back
     from the figure itself. Seventy two rather than sixty two because sixty
     two measured 4.42:1, just under the floor. */
  .hp__k{
    display:block; font-family:var(--font-body); font-weight:700; font-size:9.5px;
    letter-spacing:.18em; text-transform:uppercase; margin-bottom:.3rem;
    /* Eighty five percent: on the full gold seventy two measured 3.92:1 and
       eighty scraped 4.58. This sits back from the figure without going under
       the floor. */
    color:color-mix(in srgb, var(--color-navy) 85%, transparent);
  }
  .hp__v{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.15rem;
    line-height:1.25; color:var(--color-navy); }
  /* The same flag the badge wears, so there is one drawing and one rule for
     it. Only what differs on a light ground is stated: the hairline that
     separates it from ivory, and the space before the words. */
  .hp__fact .hz__flag{
    margin-right:.45rem; vertical-align:-1px;
    box-shadow:0 0 0 1px color-mix(in srgb, var(--color-navy) 85%, transparent);
  }

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
  /* No plate under the pedigree any more: it stands on the page ground with
     the supplied mark large behind it, the way the about section carries the
     head as a watermark. The cells keep their shape and take their tint from
     navy instead of from white, so the three generations still read as three
     weights. */
  .ped{ position:relative; isolation:isolate; overflow:clip; }
  .ped__plate{ position:relative; z-index:1; overflow-x:auto; }
  /* The mark is measured against the height of the section rather than the
     width of the page, so it stays the same size relative to the pedigree
     whether that is four rows or eight, and the section clips whatever
     hangs over the edge. */
  /* The same watermark the news and about sections carry on the homepage,
     word for word, rather than a second recipe. It used to be sized off the
     section's height and hung eleven per cent of the page width past the right
     edge: two fifths of the head was cut off by the screen, and on a page
     whose pedigree is short the head shrank with it until there was nothing
     to see. A width, an inset in rem, and it is the same mark everywhere. */
  /* The supplied mark is 420 by 914, more than twice as tall as it is wide.
     Sized on its width it stands 870px tall inside a section half that, and
     the section clipped its ears and its chin. The box is tied to the
     section's height and the mark is contained inside it, so it can never be
     taller than the section and never runs past the right edge. */
  .ped__mark{
    position:absolute; z-index:0; pointer-events:none; user-select:none;
    right:clamp(0px, 1.5vw, 3rem); top:8%; bottom:8%;
    width:clamp(120px, 18vw, 260px); opacity:.05;
  }
  .ped__mark img{ width:100%; height:100%; object-fit:contain;
    object-position:center right; display:block; }
  .ped__mark img{ height:100%; width:auto; display:block; }
  /* On a narrow screen the pedigree scrolls sideways and fills the section
     edge to edge, so there is no quiet ground left for a watermark to sit in
     and it reads as clutter behind the names. It is a desktop grace note. */
  @media (max-width: 900px){ .ped__mark{ display:none; } }
  .ped__h{
    margin:0 0 1.4rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw + .8rem,2rem); line-height:1.05;
    color:var(--color-ink);
  }
  .ped__h em{ font-style:italic; color:var(--color-gold); }
  .ped__grid{
    display:grid; grid-template-columns:repeat(4, minmax(150px, 1fr));
    gap:.4rem; min-width:640px;
  }
  /* Three generations, three weights of the same warm ground: the parents
     carry the full base-alt, the grandparents a little over half of it, the
     great grandparents a trace. Mixing navy into ivory was tried first and
     came out grey against a warm page. */
  .ped__cell{
    display:flex; align-items:center; min-width:0;
    padding:.7rem .9rem; border-radius:var(--ctl-radius);
    background:color-mix(in srgb, var(--color-base-alt) 58%, var(--color-base));
    font-family:var(--font-display); font-weight:400; font-size:.92rem; line-height:1.2;
    color:var(--color-ink);
  }
  /* The horse itself, and on a cross the space where one will be, keep the
     gold: it is the accent of the section and the only cell that is not a
     name already written down. */
  .ped__cell--self, .ped__cell--next{
    background:var(--color-gold); color:var(--color-navy); font-size:1.05rem;
  }
  .ped__cell--sire{ background:var(--color-base-alt); }
  .ped__cell--third{ font-size:.82rem; color:var(--color-ink-soft);
    background:color-mix(in srgb, var(--color-base-alt) 26%, var(--color-base)); }
  /* A name their own pages do not carry. It reads as a gap on purpose: no
     ground of its own, a dashed edge, and the words rather than a blank. */
  .ped__cell--todo{
    background:none; box-shadow:inset 0 0 0 1px var(--color-line);
    color:var(--color-ink-soft); font-style:italic; opacity:.7;
  }

  /* The first cell of a cross's pedigree is not a horse, it is the space
     where one will be, so it is not filled in like the others: no ground of
     its own, the supplied mark behind the words, and the gold kept for the
     type. */
  .ped__cell--next{ justify-content:flex-start; font-family:var(--font-display); }
  .ped__note{
    margin:1.2rem 0 0; font-size:13px; color:var(--color-ink-soft);
  }

  /* The remaining photographs of this horse. Two or more, or the section is
     not drawn: a gallery of one is just a picture. */
  /* ── the pictures ──────────────────────────────────────────────────────
     A heading, then a run of frames of one height so the row reads as a row
     rather than as a ragged edge, and any number of them: some horses have
     one spare picture and one has five. Clicking opens it at full size
     without leaving the page. */
  .hgal__head, .hvid__head{ margin-bottom:clamp(1.2rem,2.4vw,1.8rem); }
  .hgal__h, .hvid__h{
    margin:.5rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw + .8rem,2rem); line-height:1.05; color:var(--color-ink);
  }
  .hgal__h em, .hvid__h em{ font-style:italic; color:var(--color-gold); }
  /* The gallery is a rail like the films, so any number of pictures fits and
     the layout never decides how many are allowed. Three at a time on a wide
     screen, two on a tablet, one on a phone. */
  .hgal__rail{
    display:grid; grid-auto-flow:column; grid-auto-columns:78%;
    gap:clamp(.8rem,1.4vw,1.1rem);
    overflow-x:auto; scroll-snap-type:x mandatory; scroll-behavior:smooth;
    scrollbar-width:none; -ms-overflow-style:none;
  }
  .hgal__rail::-webkit-scrollbar{ display:none; }
  @media (min-width:700px){ .hgal__rail{ grid-auto-columns:calc(50% - (clamp(.8rem,1.4vw,1.1rem) / 2)); } }
  @media (min-width:1100px){ .hgal__rail{ grid-auto-columns:calc(33.333% - (clamp(.8rem,1.4vw,1.1rem) * 2 / 3)); } }
  .hgal__f{
    position:relative; border-radius:var(--plate-radius); overflow:hidden;
    background:var(--color-navy-deep); aspect-ratio:4/3; display:block;
    width:100%; padding:0; border:0; cursor:zoom-in; scroll-snap-align:start;
  }
  .hgal__f img{ display:block; width:100%; height:100%; object-fit:cover;
    transition:transform .7s var(--ease); }
  .hgal__f:hover img{ transform:scale(1.04); }
  .hgal__bar[hidden]{ display:none; }
  .hgal__bar{ display:flex; align-items:center; justify-content:space-between;
    gap:1rem; margin-top:clamp(1rem,2vw,1.4rem); }
  /* The dots keep their size and gain a thumb. A dot is eight pixels because
     that is what a dot looks like, and eight pixels is a quarter of what a
     finger needs, so the button is forty across with the dot drawn in the
     middle of it: padding makes the target, the negative margin gives the row
     its old spacing back, and background-clip keeps the colour on the dot
     rather than filling the whole square. */
  .hgal__dots{ display:flex; gap:.5rem; margin:-16px 0; }
  .hgal__dot{
    width:40px; height:40px; padding:16px; border:0; border-radius:50%;
    cursor:pointer; box-sizing:border-box;
    background:var(--color-line); background-clip:content-box;
    transition:background .3s var(--ease), transform .3s var(--ease);
  }
  .hgal__dot[aria-selected="true"]{ background:var(--color-gold); background-clip:content-box;
    transform:scale(1.3); }
  .hgal__arrows{ display:flex; gap:.5rem; }

  /* ── the films ─────────────────────────────────────────────────────────
     30 Aug: the same navy plate the sire and dam lines stand on, in the same
     place on the page, and a slider once there is more than one. A film is a
     dark thing to look at, so it belongs on the dark plate rather than on the
     ivory ground with the photographs. */
  .hvid__plate{
    padding:clamp(1.5rem,3vw,2.3rem); border-radius:var(--plate-radius);
    background:var(--color-navy-deep);
  }
  .hvid__head{ margin-bottom:clamp(1.1rem,2.2vw,1.6rem); }
  .hvid__k{
    margin:0; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.2em; text-transform:uppercase; color:var(--color-gold);
  }
  .hvid__h{
    margin:.4rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw + .8rem,2rem); line-height:1.05; color:var(--color-white);
  }
  .hvid__h em{ font-style:italic; color:var(--color-gold); }

  /* One rail, scrolled rather than transformed: the browser keeps track of
     where it is, a touch can swipe it, and it still works with the script
     switched off. */
  .hvid__rail{
    display:grid; grid-auto-flow:column; grid-auto-columns:100%;
    gap:clamp(1rem,2vw,1.6rem);
    overflow-x:auto; scroll-snap-type:x mandatory; scroll-behavior:smooth;
    scrollbar-width:none; -ms-overflow-style:none;
  }
  .hvid__rail::-webkit-scrollbar{ display:none; }
  @media (min-width:900px){
    /* Two at a time on a wide screen, one on a narrow one. A single film
       fills the plate either way. */
    .hvid__rail{ grid-auto-columns:calc(50% - (clamp(1rem,2vw,1.6rem) / 2)); }
    .hvid__rail:has(.hvid__slide:only-child){ grid-auto-columns:100%; }
  }
  .hvid__slide{ scroll-snap-align:start; min-width:0; }
  .hvid__btn{
    position:relative; display:block; width:100%; padding:0; border:0; cursor:pointer;
    border-radius:var(--card-radius); overflow:hidden;
    background:color-mix(in srgb, var(--color-navy) 82%, var(--color-white));
    aspect-ratio:16/9;
  }
  .hvid__btn img{ display:block; width:100%; height:100%; object-fit:cover;
    transition:transform .7s var(--ease); }
  .hvid__btn:hover img{ transform:scale(1.03); }
  .hvid__veil{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),.06) 0%, rgba(var(--veil-rgb),.34) 100%); }
  .hvid__play{
    position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
    width:66px; height:66px; border-radius:50%; display:grid; place-items:center;
    background:var(--color-gold); color:var(--color-navy);
    box-shadow:0 12px 34px -12px rgba(var(--veil-rgb),.85);
    transition:transform .35s var(--ease);
  }
  .hvid__btn:hover .hvid__play{ transform:translate(-50%,-50%) scale(1.08); }
  .hvid__slide iframe{ display:block; width:100%; aspect-ratio:16/9; border:0;
    border-radius:var(--card-radius); background:var(--color-navy-deep); }
  .hvid__cap{ margin:.75rem 0 0; font-size:14px; line-height:1.55; color:rgba(255,255,255,.76); }
  /* A film of the sire or the dam, on a page about the foal: said out loud
     rather than left for the visitor to work out from the name. */
  .hvid__whose{
    display:inline-block; margin-right:.4rem; padding:.2em .6em; border-radius:var(--ctl-radius);
    background:var(--color-gold); color:var(--color-navy);
    font-family:var(--font-body); font-weight:700; font-size:9.5px; letter-spacing:.14em;
    text-transform:uppercase; vertical-align:.12em;
  }

  .hvid__bar[hidden]{ display:none; }
  .hvid__bar{ display:flex; align-items:center; justify-content:space-between;
    gap:1rem; margin-top:clamp(1.1rem,2.2vw,1.5rem); }
  /* The same thumb the gallery dots got: the dot stays eight pixels, the
     button is forty, and the colour is clipped to the dot. */
  .hvid__dots{ display:flex; gap:.5rem; margin:-16px 0; }
  .hvid__dot{
    width:40px; height:40px; padding:16px; border:0; border-radius:50%;
    cursor:pointer; box-sizing:border-box;
    background:var(--color-line-invert); background-clip:content-box;
    transition:background .3s var(--ease), transform .3s var(--ease);
  }
  .hvid__dot[aria-selected="true"]{ background:var(--color-gold); background-clip:content-box;
    transform:scale(1.3); }
  .hvid__arrows{ display:flex; gap:.5rem; }
  .hvid__note{ margin:1.1rem 0 0; font-size:13px; color:rgba(255,255,255,.55); }

  /* ── the lightbox ──────────────────────────────────────────────────────
     One dialog for the whole page, opened with the picture that was clicked. */
  .lb{ border:0; padding:0; background:transparent; max-width:none; max-height:none;
    width:100%; height:100%; }
  .lb::backdrop{ background:rgba(var(--veil-rgb),.92); }
  .lb__in{ display:grid; place-items:center; width:100%; height:100%; padding:clamp(1rem,4vw,3rem); }
  .lb img{ max-width:100%; max-height:100%; width:auto; height:auto; display:block;
    border-radius:var(--plate-radius); }
  .lb__x{
    position:absolute; top:clamp(1rem,3vw,2rem); right:clamp(1rem,3vw,2rem);
    width:44px; height:44px; border-radius:50%; border:1px solid var(--color-line-invert);
    background:rgba(var(--veil-rgb),.5); color:var(--color-white); cursor:pointer;
    font-size:20px; line-height:1; display:grid; place-items:center;
  }
  .lb__x:hover{ background:var(--color-gold); color:var(--color-navy); border-color:transparent; }
  .lb__nav{
    position:absolute; top:50%; transform:translateY(-50%);
    width:48px; height:48px; border-radius:50%; border:1px solid var(--color-line-invert);
    background:rgba(var(--veil-rgb),.5); color:var(--color-white); cursor:pointer;
    font-size:20px; line-height:1; display:grid; place-items:center;
  }
  .lb__nav:hover{ background:var(--color-gold); color:var(--color-navy); border-color:transparent; }
  .lb__nav--prev{ left:clamp(.6rem,2vw,1.6rem); }
  .lb__nav--next{ right:clamp(.6rem,2vw,1.6rem); }
  @media (prefers-reduced-motion: reduce){
    .hgal__f img, .hvid__btn img, .hvid__play, .hvid__dot, .hgal__dot{ transition:none; }
    .hgal__f:hover img, .hvid__btn:hover img{ transform:none; }
    .hvid__rail, .hgal__rail{ scroll-behavior:auto; }
  }

  /* More from the same group: the homepage card again, three of them. */
  /* The same rail as the homepage runs: a scroller with snap points, the
     arrows half outside it on a wide screen and on it below 1180. */
  .hmore__wrap{ position:relative; min-width:0; }
  .hmore__run{
    list-style:none; margin:0; padding:10px 2px 62px; display:flex; gap:var(--card-gap);
    overflow-x:auto; scroll-snap-type:x mandatory; overscroll-behavior-x:contain;
    scroll-behavior:smooth; margin-bottom:-46px;
    scrollbar-width:none; -ms-overflow-style:none;
  }
  .hmore__run::-webkit-scrollbar{ display:none; }
  .hmore__run > li{
    flex:0 0 calc((100% - (2 * var(--card-gap))) / 3);
    scroll-snap-align:start; display:flex; min-width:0;
  }
  .hmore__run > li > *{ width:100%; }
  .hmore__wrap .topics-arrow--prev{ left:-22px; }
  .hmore__wrap .topics-arrow--next{ right:-22px; }
  @media (max-width: 1180px){
    .hmore__wrap .topics-arrow--prev{ left:10px; }
    .hmore__wrap .topics-arrow--next{ right:10px; }
  }
  @media (max-width: 899px){ .hmore__run > li{ flex-basis:calc((100% - var(--card-gap)) / 2); } }
  @media (max-width: 560px){ .hmore__run > li{ flex-basis:84%; } }
  @media (prefers-reduced-motion: reduce){ .hmore__run{ scroll-behavior:auto; } }

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
${headerFor(path)}

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

/* Sixteen of the twenty one foals carry a full date of birth in the year
   field rather than a year, and in two shapes: 07/05/25 beside 28/03/2025.
   Printed raw, one card reads "Born 2026" and the next "Born 07/05/25".
   The order is day/month/year, which is not assumed but read off the data:
   eight of the sixteen have a first number above twelve and none has a second
   one above twelve, and every month falls between March and June, which is
   the foaling season. So a card shows the year, where it sits beside other
   cards, and the page shows the whole date written out. */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const bornOn = (raw) => {
  const m = String(raw || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const day = Number(m[1]), month = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return { day, month, year, long: `${day} ${MONTHS[month - 1]} ${year}` };
};
const bornYear = (horse) => {
  const d = bornOn(horse.year);
  return d ? d.year : (horse.year || '');
};
const when = (horse, full) => {
  if (horse.category === 'embryo') return isFrozen(horse) ? 'Frozen embryo' : `Due ${horse.year}`;
  if (!horse.year) return '';
  const d = bornOn(horse.year);
  return `Born ${full && d ? d.long : bornYear(horse)}`;
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
    /* Their site uses both apostrophes, so the lists are matched against one
       of them: van't and van’t are the same word. */
    const plain = word.replace(/’/g, "'");
    if (CAPS.has(plain)) return word.toUpperCase();
    if (word === 'x') return 'x';                 /* a cross, the way this market writes it */
    if (i > 0 && SMALL.has(plain)) return word;
    return word
      .replace(/(^|-)([a-z])/g, (m, p, c) => p + c.toUpperCase())
      /* After an apostrophe only when a word follows it. Capitalising every
         letter after one turned DON’T TOUCH TIJI HERO into Don’T, VAN’T
         ROOSAKKER into Van’T and Z'S SISTER into Z'S, which is fifty eight
         names across the site reading as a mistake. D'Inzeo still gets its
         capital, because a word follows the apostrophe there and a single
         letter does not. */
      .replace(/([’'])([a-z])(?=[a-z])/g, (m, p, c) => p + c.toUpperCase());
  }).join(' ');
};

/* The sire is the first name in their Genetics line. The line itself is
   shown in full on the horse's own page; a card has room for one name. */
const sireOf = (horse) => {
  const first = (horse.genetics || '').split(/\s+X\s+/i)[0].trim();
  return first ? horseName(first) : '';
};

/* Where a sold horse went, in words. The badge on the picture shows a flag
   and the word Sold, and the country was only ever in a title attribute and
   a line for screen readers, so on the homepage it was invisible while the
   archives printed it under the name. Same card, same sentence, everywhere. */
const soldTo = (h) => (h.sold && h.country) ? `Sold to ${COUNTRY[h.country] || h.country}` : '';
/* Born, not the raw field: eleven foals carry a full date in it, so the
   short card read "23/04/26" where its own archive read "Born 2026". */
const meta = (horse) => [when(horse), SEX(horse), sireOf(horse), soldTo(horse)]
  .filter(Boolean).join(' \u00b7 ');

/* The homepage card, unchanged, pointed at the horse's own page. A horse
   without a photograph gets the typographic card the homepage already uses
   for one, rather than a stand-in picture of a different horse. */
/* Sold or available, with the flag and the country, as one piece of markup.
   It was written inside card(); the trial card below needs the same badge,
   and two copies of a status label is exactly how the same horse comes to
   read differently on two pages. */
const statusLabel = (horse) => {
  const flag = horse.sold && horse.country && FLAGS[horse.country]
    ? `<span class="hz__flag">${FLAGS[horse.country]}</span>` : '';
  return horse.sold
    ? `<span class="hz__tag hz__tag--sold"${horse.country ? ` title="Sold to ${esc(COUNTRY[horse.country] || horse.country)}"` : ''}>${flag}Sold${
        horse.country ? `<span class="visually-hidden"> to ${esc(COUNTRY[horse.country] || horse.country)}</span>` : ''}</span>`
    : '<span class="hz__tag">Available</span>';
};

/* Everything the chips, the selects and the search box read off a card.
   Lifted for the same reason as the label: a trial card that carries a
   different set of attributes stands still while the rest of the grid
   filters, and it looks like the filter is broken rather than the card. */
const cardData = (horse) => {
  const haystack = [horse.name, horse.genetics, horse.studbook, horse.tagline, horse.year,
                    horse.country && COUNTRY[horse.country], SEX(horse)]
    .filter(Boolean).join(' ').toLowerCase();
  const f = facetsOf(horse);
  return ` data-sold="${horse.sold ? 'true' : 'false'}" data-find="${esc(haystack)}"` +
    ` data-sex="${esc(f.sex)}" data-studbook="${esc(f.studbook)}" data-born="${esc(f.born)}"`;
};

const card = (horse, group, full) => {
  const href = `/${group.dir}/${horse.slug}`;
  /* A sold horse shows where it went, with the flag: the homepage cards have
     always done this and the generated ones quietly did not, so the same horse
     read differently depending on which page you met it on. No destination
     means no flag rather than an empty box. */
  const label = statusLabel(horse);
  /* The status label the way the embryo cards wear theirs: the accent colour
     behind the word and a hairline running off it to the right. Kept at the
     top of the frame here rather than on the seam under it, because these
     cards have a photograph the whole way down. Trialled on the foals on
     30 Aug and taken to all three archives the same day. */
  const tag = `<span class="hz__seam${horse.sold ? ' hz__seam--sold' : ''}">${label}</span>`;
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
    ? [when(horse), SEX(horse), horse.studbook, soldTo(horse)]
        .filter(Boolean).join(' \u00b7 ')
    : meta(horse);

  return `<li${full ? cardData(horse) : ''}>` +
    `<a class="hz__card" href="${href}">${win}` +
    '<span class="hz__body">' +
      `<${full ? 'h2' : 'h3'} class="hz__name">${esc(horseName(horse.name))}</${full ? 'h2' : 'h3'}>` +
      `<span class="hz__meta">${esc(line)}</span>` +
      breeding +
      '<span class="hz__view">View <span class="a" aria-hidden="true">&rarr;</span></span>' +
    '</span></a></li>';
};

/* Counted, never typed: a written number goes stale the first time a horse
   is added or sold and nobody remembers the sentence. */
/* Numbers are spelled, the way the rest of the copy spells them. The list
   used to stop at twenty one, which was the largest archive; the homepage
   now counts the three groups together and read "Showing six of 45" in the
   middle of a sentence. It runs to sixty, which covers every count on the
   site with room to grow. */
const WORDS = ['no','one','two','three','four','five','six','seven','eight','nine','ten',
               'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen',
               'eighteen','nineteen','twenty',
               ...['twenty','thirty','forty','fifty'].flatMap((tens, i) => [
                 tens,
                 ...['one','two','three','four','five','six','seven','eight','nine']
                   .map((u) => `${tens} ${u}`),
               ]).slice(1)];
const count = (n) => WORDS[n] || String(n);

/* ── what an archive can be narrowed by ────────────────────────────────
   31 Aug, Mark: more than sold and available. These are the fields their own
   pages actually carry, counted rather than assumed:

     sport horses   studbook 12/12, sex 12/12, year 12/12, height 11/12
     breeding mares studbook 12/12, year 12/12, height 3/12
     foals          sex 21/21, year 21/21, studbook 13/21

   So the archives filter on a studbook, a sex and a year of birth, and on
   nothing else. Height is on three of the twelve mares, which is not a filter,
   it is a gap. And a competition level, which was asked for, is not on their
   site at all: there is no field for it on any of the sixty three horses, so
   there is nothing to filter and it is a question for the owners rather than
   a control we can draw.

   A year rather than an age band: an age is a year plus arithmetic that goes
   stale on the first of January, and their own field is the year. */
const slug = (t) => String(t || '').toLowerCase().normalize('NFD')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const facetsOf = (horse) => ({
  sex: slug(SEX(horse)),
  studbook: slug(horse.studbook),
  born: bornYear(horse) || '',
});

/* One select per facet the list actually varies on. A field every horse in the
   group shares is not a filter either: a Sex select on the breeding mares
   would offer Mare and nothing else. */
const facetBar = (group, list) => {
  const wanted = group.facets || [];
  const bars = wanted.map((key) => {
    const seen = new Map();
    for (const h of list) {
      const f = facetsOf(h);
      const v = f[key];
      if (!v) continue;
      /* Their studbook is already written the way a studbook is written: KWPN,
         BWP, Zangersheide. Running it through the title case rule turned the
         acronyms into Kwpn and Bwp. */
      const label = key === 'born' ? String(v)
        : key === 'sex' ? SEX(h) : String(h.studbook).trim();
      if (!seen.has(v)) seen.set(v, label);
    }
    if (seen.size < 2) return '';
    const opts = [...seen].sort((a, b) => (key === 'born'
      ? String(b[0]).localeCompare(String(a[0]))
      : String(a[1]).localeCompare(String(b[1]))));
    const title = key === 'born' ? 'Born' : key === 'sex' ? 'Sex' : 'Studbook';
    return `          <label class="flt__sel">
            <span class="visually-hidden">${esc(title)}</span>
            <select data-facet="${key}">
              <option value="">${esc(title)}: any</option>
${opts.map(([v, l]) => `              <option value="${esc(v)}">${esc(l)}</option>`).join('\n')}
            </select>
          </label>`;
  }).filter(Boolean);
  return bars.length ? `
        <div class="flt__sels">
${bars.join('\n')}
        </div>` : '';
};

/* ── section two: the grid ─────────────────────────────────────────────── */
/* ── the foals' card ───────────────────────────────────────────────────
   The crosses' card, with what a foal needs added. Trialled on the first
   row of the archive on 3 Sep so the client could see the two designs on
   one page; chosen on 4 Sep, so every foal wears it now and the old card
   is no longer built for this group.

   What the format is: the navy card, the photograph fading into it, the
   gold pill on the seam and the horse's own line in gold at the foot. What
   it carries that a cross does not: the sold badge with the flag and the
   country, in the frame rather than under it, and every attribute the
   filters read.

   The pill reads "Born 2026" where a cross reads "Due 2027" and "Frozen":
   the same stamp saying the same kind of thing. */
const foalCard = (horse, group, full) => {
  const win = horse.photos.length
    ? `<span class="ec__win"><img src="/${horse.photos[0]}" alt="${esc(horseName(horse.name))}" loading="lazy">` +
      `<span class="hz__seam${horse.sold ? ' hz__seam--sold' : ''}">${statusLabel(horse)}</span>` +
      '<span class="ec__fade" aria-hidden="true"></span></span>'
    : `<span class="ec__win"><span class="ec__mark"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span>` +
      `<span class="hz__seam${horse.sold ? ' hz__seam--sold' : ''}">${statusLabel(horse)}</span>` +
      '<span class="ec__fade" aria-hidden="true"></span></span>';
  const ped = horse.pedigree || {};
  /* The breeding, in the shape the crosses wear it. Their genetics row is
     the fallback, because eight of the twenty one foals have no dam named. */
  const cross = ped.sire && ped.dam
    ? `${esc(horseName(ped.sire))} &times; ${esc(horseName(ped.dam))}`
    : esc(horseName(theirWords(horse.genetics || '')));
  /* The same facts the card below it carries, so the client is choosing
     between two designs and not between two amounts of information. The
     year is left out: it is on the pill. */
  const facts = [SEX(horse), horse.studbook, soldTo(horse)].filter(Boolean).join(' \u00b7 ');
  const line = cross + (facts ? `<br>${esc(facts)}` : '');
  return `<li class="ec"${cardData(horse)}>` +
    `<a class="ec__a" href="/${group.dir}/${horse.slug}">${win}` +
    `<span class="ec__seam"><span class="ec__stage">${esc(when(horse) || 'Foal')}</span></span>` +
    '<span class="ec__box">' +
      `<${full ? 'h2' : 'h3'} class="ec__name">${esc(horseName(horse.name))}</${full ? 'h2' : 'h3'}>` +
      `<span class="ec__line">${line}</span>` +
      (horse.tagline ? `<span class="ec__say">${esc(theirWords(horse.tagline))}</span>` : '') +
    '</span></a></li>';
};

const gridSection = (group, list) => {
  /* The chips differ per archive because the question differs. On mares,
     foals and sport horses it is what is for sale. On embryos it is the
     stage, frozen against carrying, which is the split the owners asked for
     and the only one that means anything there: thirteen of the fifteen are
     available, so an Available chip would say nothing. On the stallions it
     is nothing at all, so they carry none. */
  const embryos = group.dir === 'embryos';
  /* All is the first chip everywhere, and the one the page opens on. The
     client asked for it on 3 Sep, in these words: the pages look fuller at
     first sight, and a buyer gets an overview of everything they have and
     everything they have had before narrowing. Until then mares, foals and
     sport horses opened on Available, which hid the sold half of the record
     on arrival. The embryos already opened on All, for a reason that still
     holds: the six frozen crosses have no photograph, and an archive that
     opened on Frozen was a wall of navy. */
  const chips = embryos
    ? [['all', 'All', list.length],
       ['carrying', 'Carrying', list.filter((h) => !isFrozen(h)).length],
       ['frozen', 'Frozen', list.filter(isFrozen).length]]
    : [['all', 'All', list.length],
       ['available', 'Available', list.filter((h) => !h.sold).length],
       ['sold', 'Sold', list.filter((h) => h.sold).length]];
  const first = group.chips === false ? ['all', 'All', list.length] : chips[0];
  const openOn = first[2] ? first[0] : 'all';
  const shown = openOn === 'all' ? list.length : first[2];
  const noun = (n) => `${count(n)} ${n === 1 ? group.one : group.many}`;
  return `
  <section class="arch">
    <!-- The tray: the page's own ivory, reaching up into the photograph and
         carrying the bar with it. Rounded at the top, where it meets the
         hero. This is the homepage's trick the other way round: there the
         tray hangs down out of the ivory into the band below, here it climbs
         up out of the ivory into the hero above. Mark, 4 Sep: the bar lying
         straight on the photograph was not it; the ground has to come with
         it. -->
    <div class="arch-tray">
      <div class="flt" data-filter data-open="${openOn}">
        <div class="flt__search">
          <label class="visually-hidden" for="flt-q">Search these ${esc(group.many)}</label>
          <input type="search" id="flt-q" data-find autocomplete="off" spellcheck="false"
                 placeholder="Search a name or a sire">
          <svg class="flt__ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M10.8 10.8L15 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>
${group.chips === false ? '' : `        <div class="flt__chips" role="group" aria-label="Filter these ${esc(group.many)}">
${chips.map(([key, label, n]) => `          <button class="hz__chip" type="button" data-show="${key}"
                  aria-pressed="${openOn === key ? 'true' : 'false'}">${label} <span class="c">${n}</span></button>`).join('\n')}
        </div>`}
${facetBar(group, list)}
        <!-- No count here. The rule is Mark's and it is older than this bar:
             never write a number that can change, because it changes and the
             sentence does not. It was computed rather than typed, which was
             the wrong half of the fix: a computed "twenty one foals" is still
             a number in the copy. The chips keep their numerals, because a
             numeral on a filter is that control saying how much it will
             leave, not a claim in a sentence. -->
      </div>

    </div>

    <div class="wrap">
      <p class="flt__none" data-none>Nothing matches that. ${group.find}</p>

      <ul class="hz__grid${group.grid || ''}" data-grid>
${list.map((h) => '        ' + (group.card ? group.card(h, true) : card(h, group, true))).join('\n')}
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
  var sels  = [].slice.call(bar.querySelectorAll('[data-facet]'));
  var WORDS = ${JSON.stringify(WORDS)};
  var ONE = ${JSON.stringify(group.one)}, MANY = ${JSON.stringify(group.many)};
  var show = bar.getAttribute('data-open') || 'all';

  function words(n){ return (WORDS[n] || String(n)) + ' ' + (n === 1 ? ONE : MANY); }

  function apply(){
    var q = (input.value || '').trim().toLowerCase();
    var shown = 0;
    cards.forEach(function(li){
      /* data-sold carries the state this archive filters on: true/false on
         the horses, frozen/carrying on the crosses. One comparison either
         way, so the two archives share this script. */
      var state = li.getAttribute('data-sold');
      var okState = show === 'all' ||
        (state === 'true' ? show === 'sold' : state === 'false' ? show === 'available' : show === state);
      var okFind = !q || (li.getAttribute('data-find') || '').indexOf(q) >= 0;
      /* Every select has to agree, and an empty one agrees with everything, so
         the chips, the selects and the search box narrow together rather than
         one of them replacing the others. */
      var okFacets = sels.every(function(sel){
        return !sel.value || li.getAttribute('data-' + sel.getAttribute('data-facet')) === sel.value;
      });
      var on = okState && okFind && okFacets;
      li.hidden = !on;
      if(on) shown++;
    });
    if (count) count.textContent = words(shown);
    if(none) none.classList.toggle('is-on', shown === 0);
    chips.forEach(function(c){ c.setAttribute('aria-pressed', c.getAttribute('data-show') === show ? 'true' : 'false'); });
  }

  chips.forEach(function(c){
    c.addEventListener('click', function(){ show = c.getAttribute('data-show'); apply(); });
  });
  sels.forEach(function(sel){ sel.addEventListener('change', apply); });
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
    /* The group's line, so a horse with three fields still says something
       useful. metaLine when a group has one: the ICSI intro is a single
       sentence of 151 characters, and after a name and a pedigree it does
       not fit, so the loop dropped it and eight stallions came out under
       the seventy a search result needs. */
    group.metaLine || group.intro.split('.')[0],
  ].filter(Boolean);
  let out = '';
  for (const bit of bits) {
    const next = out ? `${out}. ${bit}` : bit;
    if (next.length > 158) break;
    out = next;
  }
  return (out || `${name}, ${group.one} at Stud Von Axe`).replace(/[.!]+$/, '') + '.';
};

/* A cross is named SIRE X DAM on their site, which is the only place the
   two are written down separately. */
const crossSire = (h) => horseName(h.name.split(/\s+X\s+/i)[0] || '');
const crossDam  = (h) => horseName(h.name.split(/\s+X\s+/i).slice(1).join(' x ') || '');
/* Their Genetics row opens with the sire of the cross, which the card
   already shows, so the damline is what is left of it. */
const damlineOf = (h) => horseName(theirWords((h.genetics || '').split(/\s+X\s+/i).slice(1).join(' x ')));

/* The embryo card. Every other archive keeps .hz__card; this one is the
   design Mark chose out of thirteen, and it exists because a cross is not a
   horse: it has no face, half of them have no photograph at all, and what a
   breeder reads is the pairing and the damline. */
const embryoCard = (horse, full) => {
  const win = horse.photos.length
    ? `<span class="ec__win"><img src="/${horse.photos[0]}" alt="${esc(horseName(horse.name))}" loading="lazy"><span class="ec__fade" aria-hidden="true"></span></span>`
    : `<span class="ec__win"><span class="ec__mark"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span><span class="ec__fade" aria-hidden="true"></span></span>`;
  const haystack = [horse.name, horse.genetics, horse.tagline, horse.year, stageOf(horse)]
    .filter(Boolean).join(' ').toLowerCase();
  return `<li class="ec" data-sold="${isFrozen(horse) ? 'frozen' : 'carrying'}" data-find="${esc(haystack)}">` +
    `<a class="ec__a" href="/embryos/${horse.slug}">${win}` +
    `<span class="ec__seam"><span class="ec__stage">${esc(stageOf(horse))}</span></span>` +
    '<span class="ec__box">' +
      `<${full ? 'h2' : 'h3'} class="ec__name">${esc(crossSire(horse))} <em>&times;</em> ${esc(crossDam(horse))}</${full ? 'h2' : 'h3'}>` +
      `<span class="ec__line">${esc(damlineOf(horse))}</span>` +
      (horse.tagline ? `<span class="ec__say">${esc(theirWords(horse.tagline))}</span>` : '') +
    '</span></a></li>';
};

/* Frozen or carrying, which is the split the owners asked for in July, read
   out of their own field. Available and Sold do not belong on this archive:
   an embryo is not sold the way a foal is, and thirteen of the fifteen are
   available anyway, so the chip would say nothing. */
const stageOf = (h) => (isFrozen(h) ? 'Frozen' : `Due ${h.year}`);

/* The dam of a cross, matched to her own listing. Their spelling wobbles
   between the two places, Bergheove against Berghoeve, so the match is on
   letters only. Fourteen of the fifteen crosses find her. */
const flat = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const damOfCross = (h) => {
  const dam = h.name.split(/\s+X\s+/i).slice(1).join(' x ').trim();
  if (!dam) return null;
  const mares = HORSES.filter((m) => m.category === 'broodmare' || m.category === 'sport');
  return mares.find((m) => flat(m.name) === flat(dam))
      || mares.find((m) => flat(m.name).startsWith(flat(dam).slice(0, 12))) || null;
};

/* Where a cross points at Horsetelex. The dam's link is read straight out
   of her own listing, which every one of the fifteen has. The sire's is
   typed into horses-extra.js, because their site does not publish it and a
   search URL is not a record. Nothing is drawn for a link that is not
   there, and nothing at all for the cross itself: it is not born. */
/* Their site hangs a Horsetelex link on every horse, but a young horse has no
   entry of its own yet, and eighteen of those links quietly go to that horse's
   own dam instead. The link is worth keeping, the damline is exactly what a
   buyer opens Horsetelex for, but the label has to say where it lands: a link
   reading CABRI VD BERGHOEVE Z that opens HIAMANT VAN'T ROOSAKKER is a lie the
   visitor only finds out about after clicking. A link that goes somewhere we
   cannot name is not shown at all and is asked about in the checklist. */
const telexLetters = (t) => String(t || '').toLowerCase()
  .normalize('NFD').replace(/[^a-z]/g, '');
const telexSame = (slug, name) => {
  const a = telexLetters(slug), b = telexLetters(name);
  if (!a || !b) return false;
  return a.includes(b.slice(0, Math.min(b.length, 10))) || b.includes(a.slice(0, Math.min(a.length, 10)));
};
const telexOf = (horse) => {
  if (!horse.horsetelex) return null;
  const slug = (horse.horsetelex.match(/pedigree\/\d+\/([^/?#]+)/) || [])[1] || '';
  /* An embryo record is this horse before it was born, so it is still itself. */
  if (telexSame(slug, horse.name) || /^embryo-/.test(slug)) return { url: horse.horsetelex, self: true };
  const ped = horse.pedigree || {};
  if (ped.dam && telexSame(slug, ped.dam)) return { url: horse.horsetelex, self: false, of: horseName(ped.dam) };
  if (ped.sire && telexSame(slug, ped.sire)) return { url: horse.horsetelex, self: false, of: horseName(ped.sire) };
  return null;
};

const sireLink = (h) => (EXTRA.sires[h.name.split(/\s+X\s+/i)[0].trim()] || {}).horsetelex || '';
const damLink  = (h) => { const d = damOfCross(h); const t = d && telexOf(d); return (t && t.self && t.url) || ''; };

/* ── the embryo page ───────────────────────────────────────────────────
   Its own template, because a cross needs different things said about it.
   No Horsetelex: it is not born, so it has no entry, and eleven of them
   carry a link on their site that belongs to a parent. No sex, no height,
   no "ask about this horse". */
const embryoPage = (horse, group, list) => {
  const dam = damOfCross(horse);
  const sire = crossSire(horse), damName = crossDam(horse);
  const facts = [
    ['Stage', isFrozen(horse) ? 'Frozen embryo' : 'Carrying'],
    [isFrozen(horse) ? 'Foal expected' : 'Due', isFrozen(horse) ? 'On implantation' : horse.year],
    ['Sire', sire, sireLink(horse)],
    ['Dam', damName, damLink(horse)],
    horse.studbook ? ['Studbook', horse.studbook] : null,
  ].filter(Boolean);

  /* The hero photograph is this cross's own, never a stock shot of another
     horse. Where the cross has none, which is seven of the fifteen, it
     borrows the dam's and says so on the picture; where there is neither, it
     is the supplied mark on navy. The block below takes the second
     photograph when there is one, so nothing is shown twice unnecessarily. */
  const heroShot = horse.photos[0] || (dam && dam.photos[0]) || '';
  const heroBorrowed = !horse.photos.length && dam && dam.photos.length;

  return `
  <section class="eh">
    <div class="eh__win">
      ${heroShot
        ? `<img src="/${heroShot}" alt="${esc(heroBorrowed ? `${damName}, the dam of this cross` : horseName(horse.name))}" fetchpriority="high">`
        : `<span class="eh__mark"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span>`}
      <span class="eh__veil" aria-hidden="true"></span>
      <a class="eh__back" href="/${group.dir}"><span aria-hidden="true">&larr;</span> ${esc(group.label)}</a>
      ${heroBorrowed ? `<p class="eh__cap">Photograph: ${esc(damName)}, the dam of this cross</p>` : ''}
    </div>
    <div class="wrap">
      <div class="eh__tray">
        <span class="eh__stage">${esc(stageOf(horse))}</span>
        <h1 class="eh__h">${esc(sire)} <em>&times;</em> ${esc(damName)}</h1>
        ${horse.tagline ? `<p class="eh__say">${esc(theirWords(horse.tagline))}</p>` : ''}
        <div class="eh__facts">
${facts.map(([k, v, url]) => `          <div><span class="eh__k">${esc(k)}</span>${url
            ? `<a class="eh__v eh__v--telex" href="${esc(url)}" target="_blank" rel="noopener"
                 title="${esc(v)} on Horsetelex">${esc(v)} <span aria-hidden="true">&#8599;</span><span class="visually-hidden"> on Horsetelex</span></a>`
            : `<span class="eh__v">${esc(v)}</span>`}</div>`).join('\n')}
        </div>
        <div class="eh__acts">
          <a href="#ask" class="btn btn-gold btn-pill">Ask about this embryo</a>
          <a href="https://wa.me/393495918565" target="_blank" rel="noopener"
             class="btn btn-ghost btn-pill">Message on WhatsApp</a>
          ${(() => {
            /* The dam's record: from her own page when she has one, else the
               link the cross itself carries, taken only when its slug names
               the dam, so the label is true. Not telexOf: for a cross that
               reads the dam's URL as the cross's own, because her name is the
               back half of its name and the ten letter test matches. Before
               this, three crosses holding her URL drew no button. */
            const own = (String(horse.horsetelex || '').match(/pedigree\/\d+\/([^/?#]+)/) || [])[1] || '';
            const url = damLink(horse) || (own && telexSame(own, damName) ? horse.horsetelex : '');
            return url ? `<a href="${esc(url)}" target="_blank" rel="noopener"
             class="btn btn-ghost btn-pill">The dam on Horsetelex <span aria-hidden="true">&#8599;</span></a>` : '';
          })()}
        </div>
        <!-- 3 Sep, the client asked for a Horsetelex button on the embryos. It
             opens the dam's record and says so: a cross has no entry of its
             own, and eleven of the fifteen carry the dam's link. The small
             link in the facts row above stays, for the reader who is
             looking at the dam's name when they want it. -->
      </div>
    </div>
  </section>

${pedigreeSection(horse)}
${linesSection(horse, dam, sire, damName)}
${contactSection(horse)}
${moreSection(horse, group, list)}
`;
};

/* ── the stallion card and the stallion page ──────────────────────────
   The same two shapes as a cross, for the same reason: a straw has no face
   either. None of the thirteen has a photograph, so every window is the mark
   on navy, which is the fallback the embryo cards already use. Where a cross
   says Frozen or Due 2027, a stallion says what is honestly known about
   getting one, which is that you have to ask. */
const stallionLine = (h) => {
  const p = h.pedigree || {};
  return [p.sire, p.dam].filter(Boolean).map(horseName).join(' x ');
};

const stallionCard = (horse, full) => {
  const line = stallionLine(horse);
  const haystack = [horse.name, horse.genetics, line].filter(Boolean).join(' ').toLowerCase();
  return `<li class="ec" data-sold="stallion" data-find="${esc(haystack)}">` +
    `<a class="ec__a" href="/icsi-semen/${horse.slug}">` +
    '<span class="ec__win"><span class="ec__mark">' +
      '<img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true">' +
    '</span><span class="ec__fade" aria-hidden="true"></span></span>' +
    '<span class="ec__seam"><span class="ec__stage">Availability on request</span></span>' +
    '<span class="ec__box">' +
      `<${full ? 'h2' : 'h3'} class="ec__name">${esc(horseName(horse.name))}</${full ? 'h2' : 'h3'}>` +
      (line ? `<span class="ec__line">${esc(line)}</span>` : '') +
    '</span></a></li>';
};

const stallionPage = (horse, group, list) => {
  const p = horse.pedigree || {};
  const facts = [
    ['Semen', 'ICSI'],
    ['Availability', 'On request'],
    p.sire ? ['Sire', horseName(p.sire)] : null,
    p.dam ? ['Dam', horseName(p.dam)] : null,
  ].filter(Boolean);

  return `
  <section class="eh">
    <div class="eh__win">
      <span class="eh__mark"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span>
      <span class="eh__veil" aria-hidden="true"></span>
      <a class="eh__back" href="/${group.dir}"><span aria-hidden="true">&larr;</span> ${esc(group.label)}</a>
    </div>
    <div class="wrap">
      <div class="eh__tray">
        <span class="eh__stage">ICSI semen</span>
        <h1 class="eh__h">${esc(horseName(horse.name))}</h1>
        ${stallionLine(horse) ? `<p class="eh__say">${esc(stallionLine(horse))}</p>` : ''}
        <div class="eh__facts">
${facts.map(([k, v]) => `          <div><span class="eh__k">${esc(k)}</span><span class="eh__v">${esc(v)}</span></div>`).join('\n')}
        </div>
        <div class="eh__acts">
          <a href="#ask" class="btn btn-gold btn-pill">Ask about this stallion</a>
          <a href="https://wa.me/393495918565" target="_blank" rel="noopener"
             class="btn btn-ghost btn-pill">Message on WhatsApp</a>
        </div>
      </div>
    </div>
  </section>

${pedigreeSection(horse)}
<!-- The same form every other horse on this site carries, not the five step
     configurator. Mark, 4 Sep: a stallion page is a page you write from, and
     the stepped order form asked for a mare, a season, a shipping address and
     a vet before the visitor had said hello. The form knows which stallion it
     is on and says so, which is what the configurator's first step was for. -->
${contactSection(horse)}
${crossesSection(horse)}
${moreSection(horse, group, list)}
`;
};

/* What this stud has actually done with the stallion, which is the one thing
   about him that is ours to say. It began as the crosses only, which was the
   list in semen-data.js; on 31 Aug Mark asked whether the foals and the horses
   by him could stand here too, and they can, because every horse on the site
   carries its sire in its own pedigree table. Matched on letters, the way the
   dams are matched, because their spelling wobbles.
   Foals and horses first, crosses after: a horse on the ground is the stronger
   proof, and it keeps the two card designs in two blocks rather than
   alternating down the row. Each keeps its own card: a cross is not a horse,
   and the same cross showing two designs was a fault worth not repeating. */
const flatName = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const byHim = (stallion) => {
  const k = flatName(stallion.name);
  const kids = HORSES.filter((h) => h.category !== 'stallion'
    && flatName((h.pedigree || {}).sire) === k);
  const order = { sport: 0, foal: 1, broodmare: 2, embryo: 3 };
  return kids.sort((a, b) => (order[a.category] ?? 9) - (order[b.category] ?? 9));
};

const crossesSection = (horse) => {
  const mine = byHim(horse);
  if (!mine.length) return '';
  const born = mine.filter((h) => h.category !== 'embryo');
  const crosses = mine.filter((h) => h.category === 'embryo');
  /* Two rows, never one mixed one. A horse card and a cross card are two
     different objects on purpose, and a row that alternates between them is
     the inconsistency Mark keeps pointing at. So the horses on the ground are
     a row of horse cards and the crosses are a row of cross cards, each under
     its own line, in one section under one heading. */
  const what = born.length && crosses.length ? 'produce'
    : crosses.length ? (crosses.length === 1 ? 'cross' : 'crosses')
    : born.length === 1 ? 'horse' : 'horses';
  const row = (label, list, cross) => list.length ? `
      ${born.length && crosses.length ? `<p class="hmore__lab">${label}</p>` : ''}
      <ul class="hz__grid${cross ? ' ec__grid' : ''}">
${list.map((h) => '        ' + (cross ? embryoCard(h, false) : card(h, GROUPS[h.category]))).join('\n')}
      </ul>` : '';
  return `
  <section class="hmore">
    <div class="wrap">
      <div class="hmore__head">
        <h2 class="hmore__h">Our own <em>${what}</em> by him</h2>
      </div>
${row('On the ground', born, false)}
${row(crosses.length === 1 ? 'A cross still to come' : 'Crosses still to come', crosses, true)}
    </div>
  </section>
`;
};

/* ── the two lines, under the pedigree ─────────────────────────────────
   Sire on the left, dam on the right: the pairing is the product, so both
   halves get a column. Variation three of the six, on one navy plate with a
   gold rule between them, which is the cross drawn as a divider and sits
   under the pedigree without a second edge in between.

   The left column is honest about a real gap: their site carries no
   photograph and no text for any of the thirteen stallions. It fills from
   horses-extra.js, by hand or from Horsetelex once the link is in, and
   until then it says so rather than pretending the space is not there. */
const linesSection = (horse, dam, sireName, damName) => {
  const key = horse.name.split(/\s+X\s+/i)[0].trim();
  const extraSire = EXTRA.sires[key] || {};
  const perCross = (EXTRA.crosses[horse.slug] || {});
  const ped = horse.pedigree || {};

  const sireCol = {
    k: 'Sire line',
    name: sireName,
    ped: [ped.sireSire, ped.sireDam].filter(Boolean).map(horseName).join(' x '),
    img: '',
    text: perCross.sireLine || extraSire.line || '',
    link: extraSire.horsetelex || '',
  };
  const damCol = {
    k: 'Dam line',
    name: damName,
    ped: dam && dam.genetics ? horseName(theirWords(dam.genetics)) : '',
    img: dam && dam.photos[0] ? `/${dam.photos[0]}` : '',
    text: perCross.damLine || (dam && dam.body[1]) || (dam && dam.body[0]) || theirWords(horse.tagline) || '',
    link: (() => { const t = dam && telexOf(dam); return (t && t.self && t.url) || ''; })(),
    href: dam ? `/${dam.category === 'broodmare' ? 'breeding-mares' : 'sport-horses'}/${dam.slug}` : '',
  };

  const col = (c) => `
        <div class="ln__col">
          ${c.img
            ? `<span class="ln__win"><img src="${esc(c.img)}" alt="${esc(c.name)}" loading="lazy"></span>`
            : `<span class="ln__win ln__win--none"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span>`}
          <span class="ln__k">${esc(c.k)}</span>
          <h2 class="ln__n">${esc(c.name)}</h2>
          ${c.ped ? `<span class="ln__p">${esc(c.ped)}</span>` : ''}
          ${c.text
            ? `<p class="ln__t">${esc(theirWords(c.text))}</p>`
            : `<p class="ln__t ln__t--waiting">Nothing published on this line yet. It goes in with the
               Horsetelex link.</p>`}
          <span class="ln__go">
            ${c.href ? `<a href="${esc(c.href)}">See ${esc(c.name)} <span class="a" aria-hidden="true">&rarr;</span></a>` : ''}
            ${c.link ? `<a href="${esc(c.link)}" target="_blank" rel="noopener">On Horsetelex <span aria-hidden="true">&#8599;</span></a>` : ''}
          </span>
        </div>`;

  return `
  <section class="ln">
    <div class="wrap">
      <div class="ln__plate">
${col(sireCol)}
        <span class="ln__rule" aria-hidden="true"></span>
${col(damCol)}
      </div>
    </div>
  </section>
`;
};

/* ── the horse page, section one: picture, name, figures ───────────────── */
const factRow = (horse) => {
  const facts = [
    [horse.category === 'embryo' ? 'Stage' : 'Born',
     horse.category === 'embryo' ? when(horse)
       : (bornOn(horse.year) || {}).long || horse.year],
    ['Sex', SEX(horse)],
    ['Studbook', horse.studbook],
    ['Height', horse.height],
    /* No Status. It is on the photograph, where the archives put it too, and
       carrying it in both places is what made this row five long and broke it
       into two rows of three with a hole in the second. */
  ].filter(([, v]) => v);
  const flag = horse.sold && horse.country && FLAGS[horse.country]
    ? `<span class="hz__flag">${FLAGS[horse.country]}</span>` : '';
  /* 30 Aug: four blocks in the accent colour, side by side, rather than four
     columns of loose type. They wrap to two rows on a narrow screen and the
     row stays full whatever the count, because a horse can have three of these
     or five. */
  return facts.map(([k, v]) =>
    `<div class="hp__fact"><span class="hp__k">${esc(k)}</span><span class="hp__v">${esc(v)}</span></div>`).join('\n            ');
};

/* How many columns the row of figures takes, so it never ends on one block
   sitting alone. Five go three and two rather than four and one, which is the
   same rule the gallery follows. */
/* Four at most, now that the status has moved onto the picture, so the row is
   one row whatever a horse happens to carry. */
const factCols = (horse) => [
  horse.year,
  horse.category === 'embryo' ? null : SEX(horse),
  horse.studbook,
  horse.height,
].filter(Boolean).length || 1;

/* Which photograph goes where, decided once for the whole page. Four sections
   want a picture and they used to count for themselves, which is how the same
   file ended up in two of them. The band takes the first, the column beside
   the name the second, the story the third, and everything left over goes to
   the gallery.
   With a single photograph the column keeps it and the band crops high on the
   same file, so it is used twice on purpose rather than by accident. */
const photoPlan = (horse) => {
  const p = horse.photos;
  if (!p.length) return { hero: '', col: '', story: '', gallery: [] };
  if (p.length === 1) return { hero: p[0], col: p[0], gallery: [], oneOnly: true };
  /* The story used to hold the third picture beside it. It now sits inside the
     tray with no room for one, so that photograph goes back to the gallery
     rather than being left out of the page altogether. */
  /* Three horses carry a paragraph long enough to make the plate roughly twice
     the height the photograph beside it is shaped for. Stretched to match, the
     crop takes fifty four percent off the width, and no fixed position saves
     it: Cortina lost her head, another would lose its quarters. Where a horse
     has the pictures, the column takes two stacked instead, which fills the
     height honestly and shows more of the horse rather than less. */
  const long = horse.body.join(' ').length > 400;
  const second = long && p[2] ? p[2] : '';
  const used = new Set([p[0], p[1], second].filter(Boolean));
  return { hero: p[0], col: p[1], col2: second, gallery: p.filter((x) => !used.has(x)) };
};

const introSection = (horse, group) => {
  const name = horseName(horse.name);
  /* On the photograph, with the flag and the country on it, and nowhere else.
     31 Aug: it said "Sold" here and "Sold to Ireland" again in the row of
     facts underneath. */
  const where = horse.sold && horse.country ? (COUNTRY[horse.country] || horse.country) : '';
  const flagOf = horse.sold && horse.country && FLAGS[horse.country]
    ? `<span class="hz__flag">${FLAGS[horse.country]}</span>` : '';
  const tag = horse.sold
    ? `<span class="hz__tag hz__tag--sold"${where ? ` title="Sold to ${esc(where)}"` : ''}>${
        flagOf}Sold${where ? ` to ${esc(where)}` : ''}</span>`
    : '<span class="hz__tag">Available</span>';

  /* A hero over the whole width, then the picture on the left and everything
     that used to sit loose on the right gathered onto a plate: 30 Aug, "er
     komt een hero boven" and "de tekst rechts gaat ook in een box".
     The hero and the column must not be the same photograph twice. Where the
     horse has two, they are two. Where it has one, which is fourteen of the
     forty five, the hero crops high on the same file so the band shows the
     head and the column shows the whole horse. */
  const { hero: heroShot, col: colShot, col2, oneOnly } = photoPlan(horse);

  const hero = `
    <div class="eh__win${oneOnly ? ' eh__win--high' : ''}">
      ${heroShot
        ? `<img src="/${heroShot}" alt="${esc(name)}" fetchpriority="high">`
        : `<span class="eh__mark"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span>`}
      <span class="eh__veil" aria-hidden="true"></span>
      <a class="eh__back" href="/${group.dir}"><span aria-hidden="true">&larr;</span> ${esc(group.label)}</a>
    </div>`;

  const pic = colShot
    ? `<div class="hp__pic"><img src="/${colShot}" alt="${esc(name)}" loading="lazy">${tag}</div>${
        col2 ? `\n        <div class="hp__pic"><img src="/${col2}" alt="${esc(name)}" loading="lazy"></div>` : ''}`
    : `<div class="hz__win typo hp__pic"><p>${esc(horse.genetics || '')}</p>${tag}</div>`;

  return `
  <section class="hp hp--hero">
    ${hero}
    <div class="wrap hp__grid">
      <div class="hp__col">
        ${pic}
      </div>
      <div class="hp__col">
        <div class="hp__tray">
          <h1 class="hp__h">${esc(name)}</h1>
          ${horse.genetics ? `<p class="hp__cross">${esc(horseName(horse.genetics))}</p>` : ''}
          ${horse.tagline ? `<p class="hp__lead">${esc(theirWords(horse.tagline))}</p>` : ''}
${storyBlock(horse)}
          <div class="hp__acts">
            <a href="#ask" class="btn btn-gold btn-pill">Ask about this horse</a>
            ${(() => { const t = telexOf(horse); return t ? `<a href="${esc(t.url)}" target="_blank" rel="noopener"
               class="btn btn-ghost btn-pill">${t.self ? 'Pedigree on Horsetelex' : 'Damline on Horsetelex'}</a>` : ''; })()}
          </div>
        </div>
      </div>
    </div>
    <div class="wrap">
      <div class="hp__facts" style="--cols:${factCols(horse)}">
        ${factRow(horse)}
      </div>
    </div>
  </section>
`;
};

/* ── the films ─────────────────────────────────────────────────────────
   Twenty two of the sixty horses have film on their own page, thirty three
   in all, and not one cross has any: a cross has nothing to film yet, which
   is why 30 Aug asked for this on the horses and the foals only.

   Nothing of YouTube is loaded until the visitor asks for it. The still and
   the title come from scripts/fetch-videos.py, sit on this server, and the
   player is only written into the page on the click. That keeps the visitor
   out of Google's hands on arrival and saves about a megabyte a film.

   Their YouTube titles are written for YouTube: "SOLD (flag) Name 2018
   (sire x dam)". SOLD is already a badge on this page and the flag is a
   picture of a word, so both come off. What is left is the label.

   Three of the films are not of the horse whose page they are on: a foal has
   nothing filmed yet, so they posted the sire or the dam instead. Same rule
   as the Horsetelex links: the label says whose film it is. The subject is
   read from the part before the bracket, because what is inside the bracket
   is the pedigree and matches every other horse in the family. */
/* The house writes a count as a word, and the audit refuses an eyebrow that
   opens with a digit, so "4 films" is both wrong here and caught. */
const inWords = (n) => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve'][n] || String(n);

const filmTitle = (t) => String(t || '')
  .replace(/\bSOLD\b/gi, '')
  .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '')
  /* Two of them separate the horse from the class with a spaced hyphen, which
     is the one punctuation mark this site does not use as a pause. A comma
     says the same thing. */
  .replace(/\s+-\s+/g, ', ')
  .replace(/\s{2,}/g, ' ').trim();

/* Their spelling of a horse's own name wobbles between the site and YouTube
   (MEDILLÍN on one, Medellín on the other), so the subject is matched with a
   small edit distance rather than character for character. */
const editDistance = (a, b) => {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
};
const namesAgree = (subject, name) => {
  const a = telexLetters(subject), b = telexLetters(name);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  const head = a.slice(0, b.length + 2);
  return editDistance(head, b) <= Math.max(2, Math.round(b.length * 0.15));
};

const filmOf = (id, horse) => {
  const raw = filmTitle((VIDEOS[id] || {}).title);
  const meta = VIDEOS[id] || {};
  const subject = raw.split('(')[0].trim();
  const ped = horse.pedigree || {};
  const self = namesAgree(subject, horse.name);
  let whose = '';
  if (!self) {
    if (ped.sire && namesAgree(subject, ped.sire)) whose = 'The sire';
    else if (ped.dam && namesAgree(subject, ped.dam)) whose = 'The dam';
    else if (subject) whose = 'Not this horse';
  }
  /* On the horse's own page its name is already the heading and its pedigree
     is already at the top, so a caption reading "Hypnotic JT Z 2018 (Halifax
     van het Kluizebos x Carthago)" says nothing four times over. What is left
     after the name, the bracket and the year is what tells one film from
     another: "first show ever". Where nothing is left, nothing is written.
     A film of the sire or the dam keeps its whole title: there the name is
     the point. */
  const own = new Set(horse.name.split(/\s+/).map(telexLetters).filter(Boolean));
  const bare = raw.replace(/\([^)]*\)/g, '');
  /* Some of them write the pedigree without a bracket, so whatever is left
     after the name is the sire and the dam again rather than anything about
     the film. The "x" gives it away. */
  const isPedigree = /\s+x\s+/i.test(bare);
  const left = self
    ? bare.replace(/\b(19|20)\d{2}\b/g, '')     /* the year, already in the figures */
         .split(/\s+/)
         /* Their spelling of the same horse differs between their site and
            YouTube (MEDILLÍN against Medellín), so a word counts as part of
            the name when it is one letter away from one. */
         .filter((w) => {
           const l = telexLetters(w);
           if (!l) return false;
           for (const part of own) if (editDistance(l, part) <= 1) return false;
           return true;
         })
         .join(' ').replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '').trim()
    : raw;
  /* A single word left over is a fragment, not a caption: "6 yo" becomes
     "yo". Nothing is better than a scrap. */
  const title = !self ? raw
    : (isPedigree || left.split(/\s+/).filter(Boolean).length < 2) ? '' : left;
  return { id, title, whose, poster: meta.poster || '' };
};

const videoSection = (horse) => {
  const films = (horse.videos || []).map((id) => filmOf(id, horse)).filter((f) => f.poster);
  const stand = !films.length;
  const name = horseName(horse.name);
  const many = films.length > 1;
  if (stand) return `
  <section class="hvid is-stand">
    <div class="wrap">
      <div class="hvid__plate">
        <div class="hvid__head">
          <p class="hvid__k">Placeholder</p>
          <h2 class="hvid__h">${esc(name)} <em>in motion</em></h2>
        </div>
        <div class="hvid__rail">
          <div class="hvid__slide">
            <span class="hvid__btn hvid__btn--stand">
              <img src="/${PLACEHOLDER_FILM}" alt="Placeholder: film of ${esc(name)} is still to be supplied" loading="lazy">
              <span class="hvid__veil" aria-hidden="true"></span>
              <span class="hvid__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
  return `
  <section class="hvid">
    <div class="wrap">
      <div class="hvid__plate">
        <div class="hvid__head">
          <p class="hvid__k">${films.length === 1 ? 'On film' : `${inWords(films.length)} films`}</p>
          <h2 class="hvid__h">${esc(name)} <em>in motion</em></h2>
        </div>
        <div class="hvid__rail"${many ? ' tabindex="0" aria-label="Films, scroll sideways"' : ''}>
${films.map((f, i) => `          <div class="hvid__slide">
            <button type="button" class="hvid__btn" data-yt="${esc(f.id)}"
                    aria-label="Play film ${i + 1} of ${films.length}${f.title ? `: ${esc(f.title)}` : ''}">
              <img src="/${f.poster}" alt="" loading="lazy">
              <span class="hvid__veil" aria-hidden="true"></span>
              <span class="hvid__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
              </span>
            </button>
            ${f.whose || f.title ? `<p class="hvid__cap">${f.whose
              ? `<span class="hvid__whose">${esc(f.whose)}</span> ` : ''}${esc(f.title)}</p>` : ''}
          </div>`).join('\n')}
        </div>
        ${many ? `<div class="hvid__bar">
          <div class="hvid__dots" role="tablist" aria-label="Films">
${films.map((f, i) => `            <button type="button" class="hvid__dot" role="tab" data-to="${i}"
                    aria-label="Film ${i + 1}"${i === 0 ? ' aria-selected="true"' : ' aria-selected="false"'}></button>`).join('\n')}
          </div>
          <div class="hvid__arrows">
            <button type="button" class="hvid__arrow" data-step="-1" aria-label="Previous film">&#8592;</button>
            <button type="button" class="hvid__arrow" data-step="1" aria-label="Next film">&#8594;</button>
          </div>
        </div>` : ''}
        <p class="hvid__note">The player loads only when you press play.</p>
      </div>
    </div>
  </section>
`;
};

/* ── the horse page, section two: the story, in their words ────────────
   Only six of the sixty horses carry one on their site. The section is not
   drawn at all for the other fifty four rather than filled with something
   written here. */
/* Their paragraph, and the heading that says whose it is.
   Six of the sixty carry one on their own site, and two of those six are not
   about the horse whose page they sit on: Bellavista's is two hundred and
   seventy three words about Balou du Reventon, his sire, down to what his
   riders earned in a season. Read under a heading saying "About this horse"
   that is simply wrong, the same fault as the Horsetelex links and the films,
   so the heading names whatever the first paragraph opens on. Their words are
   never rewritten, only labelled truthfully.
   30 Aug it moved off its own section and into the tray, under the tagline,
   because standing alone under a photograph it read as a second page. */
const storyBlock = (horse) => {
  if (!horse.body.length) return '';
  const ped = horse.pedigree || {};
  const opens = horse.body[0];
  const subject = namesAgree(opens, horse.name) ? null
    : ped.sire && namesAgree(opens, ped.sire) ? ['The sire', horseName(ped.sire)]
    : ped.dam && namesAgree(opens, ped.dam) ? ['The damline', horseName(ped.dam)]
    : null;
  return `
          <div class="hp__story">
            ${subject ? `<p class="hp__storyk">${esc(subject[0])}<em> &middot; ${esc(subject[1])}</em></p>` : ''}
${horse.body.map((t) => `            <p>${esc(theirWords(t))}</p>`).join('\n')}
          </div>`;
};

/* ── the horse page, section three: the pedigree ────────────────────────
   Three generations, exactly as their own table has them. Drawn only when
   the table was there to read. */
const pedigreeSection = (horse) => {
  const p = horse.pedigree;
  if (!p || !p.sire) return '';
  /* Every cell says which column and which row it is in. It used to say only
     how many rows it spanned and let the grid place it, which works while all
     fifteen cells are there and quietly shuffles the table when one is not:
     a stallion has no fourth generation on record, so his own dam ended up in
     the grandparents' column reading as his granddam. A pedigree that puts a
     horse in the wrong generation is worse than one with a gap in it. */
  /* A cell with no name is drawn anyway and says what it is: an empty box
     would read as a fault in the table and a missing box moves the horses
     below it into the wrong generation. Mark, 31 Aug: "maak dan de pedigree
     nog wel gewoon compleet, maar plaats er dan to be filled in". Only the
     thirteen stallions have any, because their own horses' tables are whole. */
  const cell = (name, cls, col, row, span) =>
    `<div class="ped__cell ${cls}${name ? '' : ' ped__cell--todo'}"` +
    ` style="grid-column:${col}; grid-row:${row} / span ${span}">` +
    `${name ? esc(horseName(name)) : 'To be filled in'}</div>`;
  const third = p.third || [];
  const branch = (parent, gsire, gdam, from, top) =>
    cell(parent, 'ped__cell--sire', 2, top, 4) +
    cell(gsire, '', 3, top, 2) +
    cell(third[from] || '', 'ped__cell--third', 4, top, 1) +
    cell(third[from + 1] || '', 'ped__cell--third', 4, top + 1, 1) +
    cell(gdam, '', 3, top + 2, 2) +
    cell(third[from + 2] || '', 'ped__cell--third', 4, top + 2, 1) +
    cell(third[from + 3] || '', 'ped__cell--third', 4, top + 3, 1);
  return `
  <section class="ped">
    <div class="ped__mark" aria-hidden="true">
      <img src="/assets/logo/icon-onlight.png" data-ground="light" alt="">
    </div>
    <div class="wrap">
      <div class="ped__plate">
        <h2 class="ped__h">Three generations <em>deep</em></h2>
        <div class="ped__grid">
          ${horse.category === 'embryo'
            ? `<div class="ped__cell ped__cell--next" style="grid-column:1; grid-row:1 / span 8">Your next embryo</div>`
            : cell(horseName(horse.name), 'ped__cell--self', 1, 1, 8)}
          ${branch(p.sire, p.sireSire, p.sireDam, 0, 1)}
          ${branch(p.dam, p.damSire, p.damDam, 4, 5)}
        </div>
        ${(() => {
          if (horse.category === 'embryo') return '';
          /* Not on a mare. The client asked for Hippomundo under the mares'
             pedigrees and Horsetelex under the embryos', and this note put
             Horsetelex under the mares, which is the swap they flagged on
             3 Sep. Her Horsetelex record is not lost: it is the button in
             the row above, where their own site puts it. */
          if (horse.category === 'broodmare') return '';
          const t = telexOf(horse);
          if (!t) return '';
          const link = (label) => `<a href="${esc(t.url)}" target="_blank" rel="noopener" style="color:var(--color-navy)">${label}</a>`;
          return `<p class="ped__note">${t.self
            ? `The full pedigree is on ${link('Horsetelex')}.`
            : `${esc(horseName(horse.name))} has no Horsetelex entry of its own yet. The dam, ${esc(t.of)}, is on ${link('Horsetelex')}.`}</p>`;
        })()}
        ${horse.category === 'embryo' ? `<p class="ped__note">A cross has no Horsetelex entry of its own:
          it is not born yet. The dam's record is on her page.</p>` : ''}
        ${(() => {
          /* Asked for on 3 Sep: the mares' Hippomundo records under the
             pedigree. Their site does not publish these, so the URL is typed
             into horses-extra.js per mare, and nothing is drawn until it is:
             a search page is not a record. */
          const url = horse.category === 'broodmare' && (EXTRA.hippomundo || {})[horse.slug];
          return url ? `<p class="ped__note">Her record is also on <a href="${esc(url)}" target="_blank" rel="noopener" style="color:var(--color-navy)">Hippomundo</a>.</p>` : '';
          /* Twelve empty keys today. Hippomundo refuses automated access in
             so many words, so these cannot be looked up here: each URL is
             opened by hand and pasted into horses-extra.js, and the line
             appears on that mare's page the moment it is. */
        })()}
      </div>
    </div>
  </section>
`;
};

/* ── the horse page, section four: the rest of the photographs ─────────
   The first is in the intro and the second, when there is one, sits beside
   the story. What is left goes here, and only if two or more are left. */
/* Thirty five of the sixty horses have no spare photograph and thirty eight
   have no film, so on those pages the two sections simply did not exist and
   nobody could see what they are meant to be. 30 Aug: stand them in, and mark
   them so plainly that nobody mistakes one for a picture of that horse. The
   stand-ins are general shots of the yard under a heavy navy veil with
   PLACEHOLDER written across them, the heading says so, and a line underneath
   says what is wanted. Real material always wins; this only fills a hole. */
const PLACEHOLDER_SHOTS = [
  'assets/img/placeholder/gallery-1.jpg',
  'assets/img/placeholder/gallery-2.jpg',
  'assets/img/placeholder/gallery-3.jpg',
];
const PLACEHOLDER_FILM = 'assets/img/placeholder/film.jpg';

const gallerySection = (horse) => {
  const own = photoPlan(horse).gallery;
  const stand = !own.length;
  const rest = stand ? PLACEHOLDER_SHOTS : own;
  const name = horseName(horse.name);
  /* 30 Aug: a carousel rather than a grid, so any number of pictures can be
     added without the layout deciding how many are allowed. It runs on the
     same rail the films use: one slider on this site, not two. The controls
     appear only when the rail is longer than the frame, which on a wide
     screen means from the fourth picture on. */
  return `
  <section class="hgal${stand ? ' is-stand' : ''}">
    <div class="wrap">
      <div class="hgal__head">
        <p class="plaque">${stand ? 'Placeholder' : rest.length === 1 ? 'One more picture' : `${inWords(rest.length)} more pictures`}</p>
        <h2 class="hgal__h">${stand
          ? `More pictures of <em>${esc(name)}</em>`
          : `More of <em>${esc(name)}</em>`}</h2>
      </div>
      <div class="hgal__rail"${rest.length > 1 ? ' tabindex="0" aria-label="Pictures, scroll sideways"' : ''}>
${rest.map((src, i) => {
  const inner = `<img src="/${src}" alt="${stand
    ? `Placeholder: a photograph of ${esc(name)} is still to be supplied`
    : esc(name)}" loading="lazy">`;
  return stand
    ? `        <span class="hgal__f hgal__f--stand">${inner}</span>`
    : `        <button type="button" class="hgal__f" data-full="/${src}"
                aria-label="Open picture ${i + 1} of ${rest.length} at full size">${inner}</button>`;
}).join('\n')}
      </div>
      <div class="hgal__bar">
        <div class="hgal__dots" role="tablist" aria-label="Pictures">
${rest.map((src, i) => `          <button type="button" class="hgal__dot" role="tab" data-to="${i}"
                  aria-label="Picture ${i + 1}"${i === 0 ? ' aria-selected="true"' : ' aria-selected="false"'}></button>`).join('\n')}
        </div>
        <div class="hgal__arrows">
          <button type="button" class="hgal__arrow" data-step="-1" aria-label="Previous picture">&#8592;</button>
          <button type="button" class="hgal__arrow" data-step="1" aria-label="Next picture">&#8594;</button>
        </div>
      </div>
    </div>
  </section>
`;
};

/* The film player, the two sliders and the picture viewer. Each in its own
   closure: they shared one scope once, where the slider's at() and the
   viewer's at counter were the same name, and hoisting turned the function
   into a number. Nothing here needs to see anything there. */
const mediaScript = `<script>
(function(){
  var films = document.querySelectorAll('.hvid__btn');
  for (var i = 0; i < films.length; i++) films[i].addEventListener('click', function(){
    var id = this.getAttribute('data-yt');
    if (!id) return;
    var frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    frame.title = this.getAttribute('aria-label') || 'Film';
    frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    frame.allowFullscreen = true;
    this.parentNode.replaceChild(frame, this);
  });
})();

(function(){
  /* One slider, two rails. The films and the pictures behave the same way, so
     they run the same lines rather than two copies free to drift apart. The
     rail is a scroll container: this only nudges it and reads back where it
     landed, so a swipe and a click cannot disagree about the position. */
  var slide = function(prefix){
    var rail = document.querySelector('.' + prefix + '__rail');
    var bar = document.querySelector('.' + prefix + '__bar');
    if (!rail || !bar) return;
    var slides = [].slice.call(rail.children);
    var dots = [].slice.call(bar.querySelectorAll('.' + prefix + '__dot'));
    var arrows = [].slice.call(bar.querySelectorAll('.' + prefix + '__arrow'));
    var at = function(){
      var best = 0, near = Infinity, left = rail.scrollLeft;
      for (var n = 0; n < slides.length; n++) {
        var d = Math.abs(slides[n].offsetLeft - rail.offsetLeft - left);
        if (d < near) { near = d; best = n; }
      }
      return best;
    };
    /* How far the rail can actually go. With three pictures side by side and
       four in the rail the last reachable position is the second, not the
       fourth: an arrow that stays lit with nowhere to go, and a dot that can
       never light up, are both lies about the same thing. */
    var last = function(){
      var max = rail.scrollWidth - rail.clientWidth, best = 0;
      for (var n = 0; n < slides.length; n++)
        if (slides[n].offsetLeft - rail.offsetLeft <= max + 1) best = n;
      return best;
    };
    /* Painted from the index being moved to rather than from the scroll
       position: a smooth scroll has not arrived when the click is handled, and
       the scroll event that would correct it does not fire everywhere. */
    var paint = function(n){
      var end = last();
      bar.hidden = end === 0;
      if (end === 0) return;
      if (n == null) n = at();
      for (var i = 0; i < dots.length; i++) {
        dots[i].hidden = i > end;
        dots[i].setAttribute('aria-selected', i === n ? 'true' : 'false');
      }
      arrows[0].disabled = n <= 0;
      arrows[1].disabled = n >= end;
    };
    /* The value is set and the stylesheet decides whether that is a glide or a
       jump: scrollTo with smooth behaviour is ignored outright by some
       engines, which left the arrows doing nothing at all. */
    var go = function(n){
      n = Math.max(0, Math.min(last(), n));
      rail.scrollLeft = slides[n].offsetLeft - rail.offsetLeft;
      paint(n);
    };
    for (var a = 0; a < arrows.length; a++) (function(btn){
      btn.addEventListener('click', function(){ go(at() + Number(btn.getAttribute('data-step'))); });
    })(arrows[a]);
    for (var b = 0; b < dots.length; b++) (function(btn){
      btn.addEventListener('click', function(){ go(Number(btn.getAttribute('data-to'))); });
    })(dots[b]);
    rail.addEventListener('scroll', function(){ paint(); }, { passive: true });
    addEventListener('resize', function(){ paint(); });
    paint();
  };
  slide('hvid');
  slide('hgal');
})();

(function(){
  var shots = [].slice.call(document.querySelectorAll('.hgal__f[data-full]'));
  if (!shots.length) return;
  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.innerHTML = '<div class="lb__in"><img alt=""></div>' +
    '<button class="lb__x" type="button" aria-label="Close">&times;</button>' +
    (shots.length > 1
      ? '<button class="lb__nav lb__nav--prev" type="button" aria-label="Previous picture">&#8592;</button>' +
        '<button class="lb__nav lb__nav--next" type="button" aria-label="Next picture">&#8594;</button>'
      : '');
  document.body.appendChild(dlg);
  var img = dlg.querySelector('img'), at = 0;
  function show(n){
    at = (n + shots.length) % shots.length;
    img.src = shots[at].getAttribute('data-full');
    img.alt = shots[at].querySelector('img').alt;
  }
  for (var j = 0; j < shots.length; j++) (function(n){
    shots[n].addEventListener('click', function(){ show(n); dlg.showModal(); });
  })(j);
  dlg.querySelector('.lb__x').addEventListener('click', function(){ dlg.close(); });
  var prev = dlg.querySelector('.lb__nav--prev'), next = dlg.querySelector('.lb__nav--next');
  if (prev) prev.addEventListener('click', function(){ show(at - 1); });
  if (next) next.addEventListener('click', function(){ show(at + 1); });
  dlg.addEventListener('click', function(e){ if (e.target === dlg || e.target.className === 'lb__in') dlg.close(); });
  dlg.addEventListener('keydown', function(e){
    if (e.key === 'ArrowLeft' && prev) show(at - 1);
    if (e.key === 'ArrowRight' && next) show(at + 1);
  });
})();
<\/script>`;

/* ── the horse page, section five: more from the same group ────────────
   The homepage card again, three of them, and a way back to the whole set.
   Neighbours in the list rather than a random three, so two visits to two
   horses do not show the same three. */
/* A rail, not a row of three. 31 Aug: every other run of cards on this site
   slides and this one did not, which made the foot of a horse page read as a
   different site. It carries up to ten of the group now rather than three,
   because three fit on the screen and a slider with nothing to slide is a
   worse thing than a grid. */
const moreSection = (horse, group, list) => {
  const i = list.findIndex((h) => h.slug === horse.slug);
  const rest = [...list.slice(i + 1), ...list.slice(0, i)].slice(0, 10);
  if (!rest.length) return '';
  const id = `more-${group.dir}`;
  return `
  <section class="hmore">
    <div class="wrap">
      <div class="hmore__head">
        <h2 class="hmore__h">More <em>${esc(group.many)}</em></h2>
        <a class="hmore__all" href="/${group.dir}">All ${esc(group.many)} <span class="a" aria-hidden="true">&rarr;</span></a>
      </div>
      <div class="hmore__wrap">
        <ul class="hmore__run${group.grid || ''}" id="${id}" tabindex="0"
            aria-label="More ${esc(group.many)}">
${rest.map((h) => '          ' + (group.card ? group.card(h, false) : card(h, group))).join('\n')}
        </ul>
        <button class="topics-arrow topics-arrow--prev" data-rail="${id}" data-dir="-1"
                aria-label="Previous ${esc(group.many)}">&larr;</button>
        <button class="topics-arrow topics-arrow--next" data-rail="${id}" data-dir="1"
                aria-label="Next ${esc(group.many)}">&rarr;</button>
      </div>
    </div>
  </section>
`;
};

/* The rail's own controller. The homepage drives its four runs from a copy of
   this inside index.html; this is the one the sixty generated pages use, and
   it is written once here rather than once per builder. It sets scrollLeft and
   lets the stylesheet's scroll-behaviour decide how: passing an object to
   scrollTo was silently ignored in this build and the arrows did nothing at
   all, with no error to say so. */
const railScript = `<script>
(function(){
  document.querySelectorAll('[data-rail]').forEach(function(btn){
    var run = document.getElementById(btn.getAttribute('data-rail'));
    if(!run) return;
    btn.addEventListener('click', function(){
      var card = run.querySelector('li');
      var step = card ? card.getBoundingClientRect().width + 14 : run.clientWidth * .8;
      run.scrollLeft += step * Number(btn.getAttribute('data-dir'));
    });
  });
  document.querySelectorAll('.hmore__run').forEach(function(run){
    var wrap = run.parentElement;
    function sync(){
      var max = run.scrollWidth - run.clientWidth;
      wrap.querySelectorAll('[data-rail]').forEach(function(b){
        var back = Number(b.getAttribute('data-dir')) < 0;
        b.disabled = max < 4 || (back ? run.scrollLeft <= 3 : run.scrollLeft >= max - 3);
      });
    }
    run.addEventListener('scroll', sync, {passive:true});
    window.addEventListener('resize', sync);
    sync();
  });
})();
<\/script>`;

/* ── the horse page, section six: the invitation ───────────────────────
   The plate the whole site closes on, with this horse named in it. */
/* ── the contact section, on every single page ─────────────────────────
   Variation one of the six laid out on 30 Aug and chosen the same day: the
   invitation and the four ways to reach them on the navy half, the form on
   the ivory half. It replaces the CTA plate rather than standing next to it,
   because two invitations in a row is one too many, and the buttons higher up
   the page now land here instead of on the homepage.

   The name of the horse is already in a field the visitor can still edit:
   somebody writing about two of them should not have to fight it. */
const contactSection = (horse) => {
  const n = horseName(horse.name);
  const cross = horse.category === 'embryo';
  /* The heading was "Ask the people who bred her", lifted from the homepage.
     It is not true on most of these pages: seventeen of the twenty four mares
     and sport horses do not carry Von Axe or SVA in their name, which is to
     say they were bought rather than bred here. The same goes for the line
     under it, which said the visitor is speaking to the two people who chose
     the cross. What is true of every horse on the site is that there is no
     agent between them and the owners, so that is what it says now, with the
     horse's own name doing the work the claim was doing. */
  return `
  <section class="ask" id="ask">
    <div class="wrap">
      <div class="ask__box">
        <div class="ask__side">
          <div>
            <p class="plaque">Get in touch</p>
            <h2 class="ask__h">Ask us about <em>${esc(cross ? 'this cross' : n)}</em></h2>
            <p class="ask__lead">Write to us and we will get back to you.</p>
          </div>
          <div class="ask__people">
            <a class="ask__p" href="tel:+393495918565">
              <span class="ask__pk">Elisabetta</span><span class="ask__pv">+39 349 591 8565</span></a>
            <a class="ask__p" href="tel:+393483953433">
              <span class="ask__pk">Adriano</span><span class="ask__pv">+39 348 395 3433</span></a>
            <a class="ask__p" href="mailto:studvonaxe@gmail.com">
              <span class="ask__pk">By mail</span><span class="ask__pv">studvonaxe@gmail.com</span></a>
          </div>
        </div>
        <form class="ask__form" data-horse="${esc(n)}">
          <div class="ask__pair">
            <div class="ask__row">
              <label for="ask-name">Your name</label>
              <input id="ask-name" name="name" type="text" required autocomplete="name" placeholder="Name">
            </div>
            <div class="ask__row">
              <label for="ask-email">Email</label>
              <input id="ask-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
            </div>
          </div>
          <div class="ask__pair">
            <div class="ask__row">
              <label for="ask-tel">Telephone <span class="ask__opt">optional</span></label>
              <input id="ask-tel" name="tel" type="tel" autocomplete="tel" placeholder="+39 …">
            </div>
            <div class="ask__row">
              <label for="ask-about">About</label>
              <input id="ask-about" name="about" type="text" value="${esc(n)}">
            </div>
          </div>
          <div class="ask__row">
            <label for="ask-msg">Your message</label>
            <textarea id="ask-msg" name="message" rows="4" required
              placeholder="What would you like to know about ${esc(n)}?"></textarea>
          </div>
          <button type="submit" class="btn btn-gold btn-pill">Send it <span class="a" aria-hidden="true">&rarr;</span></button>
          <p class="ask__note" role="status"></p>
        </form>
      </div>
    </div>
  </section>
`;
};

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
          <a href="/contact" class="btn btn-gold btn-pill">Get in touch</a>
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
          <a href="/contact" class="btn btn-gold btn-pill">Get in touch</a>
          <a href="https://wa.me/393495918565" target="_blank" rel="noopener"
             class="btn btn-ghost btn-pill">Message on WhatsApp</a>
        </div>
      </div>
    </div>
  </section>
`;

/* ── section one: the hero ─────────────────────────────────────────────── */
const heroSection = (g) => `
  <!-- nhero--cut: this hero makes room at its foot for the filter bar to
       climb into. Only the archives have a bar, so only they carry it; the
       about, contact, news and legal heroes wear plain .nhero and keep the
       section rhythm the audit holds every section to. -->
  <section class="nhero nhero--cut">
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
const horsePage = (horse, group, body) => `<!DOCTYPE html>
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
${(() => {
  /* A horse page belongs to its archive, so that is the item marked in the
     menu: on /foals/arkhana the menu shows Foals. */
  const hd = headerFor(`/${group.dir}`);
  return /class="(eh|hp hp--hero)"/.test(body)
    ? hd                          /* a dark hero: transparent, and it pins on scroll */
    : hd.replace('class="hd"', 'class="hd is-pinned"');
})()}

<main id="main">
${body}
</main>
${footer}
${navScript}
${/class="(hgal|hvid)[ "]/.test(body) ? mediaScript : ''}
${body.includes('class="ask ord"') ? orderScript
  : body.includes('class="ask"') ? askScript : ''}
${body.includes('class="hmore__run') ? railScript : ''}
</body>
</html>
`;

/* ── the roll out ──────────────────────────────────────────────────────
   Four archives and a page for every horse on their site. Generated, so a
   horse added to horses-data.js appears in its archive, on its own page and
   in the "more" run of its neighbours in one command. */
const written = { archives: 0, horses: 0 };

/* ── available first ───────────────────────────────────────────────────
   Mark, 4 Sep. All is the chip every archive opens on since the client's
   round, and on these three that means a visitor lands on a record that is
   mostly sold: twelve of twelve sport horses, twenty of twenty one foals,
   seven of twelve mares. What is for sale should be the first thing in it
   rather than scattered through the rest.
   Stable, and it only moves the two halves past each other: inside each
   half the order their own site gave is untouched. Not on the embryos,
   which split on frozen and carrying rather than on sold, and not on the
   stallions, which carry no chips at all. */
const availableFirst = (group, list) =>
  (group.dir === 'embryos' || group.chips === false)
    ? list
    : [...list.filter((h) => !h.sold), ...list.filter((h) => h.sold)];

for (const key of Object.keys(GROUPS)) {
  const group = GROUPS[key];
  const list = availableFirst(group, HORSES.filter((h) => h.category === key));
  mkdirSync(join(root, group.dir), { recursive: true });

  writeFileSync(join(root, group.dir, 'index.html'), page({
    title: group.label,
    /* The page carries their paragraph; the search result carries desc when
       a group has one, because two of these run past 160 characters. */
    desc: group.desc || group.intro,
    path: `/${group.dir}`,
    image: group.img,
    body: heroSection(group) + gridSection(group, list) + ctaSection(group),
    extraScript: filterScript(group),
  }));
  written.archives++;

  for (const horse of list) {
    const body = key === 'stallion'
      ? stallionPage(horse, group, list)
      : key === 'embryo'
      ? embryoPage(horse, group, list)
      /* The films sit straight after the pedigree, which is where a cross
         carries its sire and dam lines: same plate, same place. */
      : introSection(horse, group) + pedigreeSection(horse) +
        videoSection(horse) + gallerySection(horse) + contactSection(horse) +
        moreSection(horse, group, list);
    writeFileSync(join(root, group.dir, `${horse.slug}.html`), horsePage(horse, group, body));
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
const stallions = HORSES.filter((h) => h.category === 'stallion');

writeFileSync(join(root, 'horses-home.js'),
`/* Cards for the homepage runs, written by scripts/build-horses.mjs from
   horses-data.js. Do not edit: rebuild. The homepage used to hold its own
   copy of this list and the two fell out of step. */
var HOME_HORSES = {
  /* The mixed run the homepage shows on arrival. It used to fall back to a
     second copy of the herd kept inside index.html, whose cards all pointed at
     the contact form: the label said View and the link went to a form, and
     that was the state every visitor met first. Each horse now carries its own
     page here as well, so the run is the same set of facts in all three
     filters. */
  /* Mixed on purpose since 31 Aug: the foals moved up here as a fourth chip,
     and All now means all three kinds in one run rather than sport horses and
     mares only. Two of each, so no group can fill the grid on its own. */
  all: ${JSON.stringify(
    [...sport.slice(0, 2), ...mares.slice(0, 2), ...foals.slice(0, 2)]
      .map((h) => card(h, GROUPS[h.category])).join('\n'))},
  /* Six, not eight: this run used to be the slider in the programme, where a
     ragged last row does not exist. It is a three across grid now. */
  foals: ${JSON.stringify(homeCards(foals, GROUPS.foal, 6))},
  /* The same card the archive uses, not a second one. A cross showed
     "Available" on the homepage and "Due 2027" on its archive, because the
     homepage run was built from the horse card and the archive from the
     embryo card. One embryo, one card, one word for its stage. */
  embryos: ${JSON.stringify(crosses.slice(0, 8).map((h) => embryoCard(h, false)).join('\n'))},
  mares: ${JSON.stringify(homeCards(mares, GROUPS.broodmare, 6))},
  /* The ICSI stallions, in the run where the foals used to be. Same card as
     the archive, so the run and the page say one thing. */
  stallions: ${JSON.stringify(stallions.slice(0, 8).map((h) => stallionCard(h, false)).join('\n'))},
  sport: ${JSON.stringify(homeCards(sport, GROUPS.sport, 6))},
  counts: ${JSON.stringify({
    mares: mares.length, foals: foals.length, crosses: crosses.length, sport: sport.length,
    stallions: stallions.length,
    damlines: damlinesOf(crosses),
    foalsAvailable: foals.filter((h) => !h.sold).length,
    crossesAvailable: crosses.filter((h) => !h.sold).length,
    maresAvailable: mares.filter((h) => !h.sold).length,
  })},
  words: ${JSON.stringify(WORDS)}
};
`);
console.log('wrote horses-home.js for the homepage runs');

/* ── what the homepage's tabs say ──────────────────────────────────────
   One entry per archive: the name on the tab, the line under it, the count,
   the picture and where it goes. Written here rather than typed into
   index.html for the reason every count on this site is: five numbers kept
   by hand go stale the first time a horse is added and nobody remembers the
   sentence. The blurb is each archive's own intro, which is already their
   approved copy, cut at its first sentence so it fits a tab.
   4 Sep, Mark: the band that offered five gold buttons becomes a tabbed
   panel, so a visitor can see everything they sell without leaving the
   homepage. */
{
  /* The whole intro, not its first sentence. It was cut to fit and came out
     as five one line labels; Mark, 4 Sep: the panel reads small and simple.
     These are each archive's own approved paragraph, which is two sentences
     for four of the five. */
  /* The menu's order, not the builder's: a visitor meets these five names in
     the header and in the footer, and meeting them in a third order here
     would read as a different list. */
  const ORDER = ['sport', 'broodmare', 'foal', 'embryo', 'stallion'];
  /* Written out, not made from the label. "See all " + the label lowercased
     turns ICSI semen into "icsi semen", and the archive of stallions is not
     called "all ICSI semen" anyway: it is the stallions. */
  const CTA = {
    sport: 'See all sport horses', broodmare: 'See all breeding mares',
    foal: 'See all foals', embryo: 'See all crosses', stallion: 'See all stallions',
  };
  const tabs = ORDER.map((key) => {
    const g = GROUPS[key];
    const list = HORSES.filter((h) => h.category === key);
    return {
      key,
      label: g.label,
      href: `/${g.dir}`,
      img: `/assets/img/${g.img}`,
      blurb: g.intro,
      /* The same focus the archive's own hero uses. These are 1920 by 853
         panoramas and the panel's window is nothing like that shape, so
         without a focus the crop lands wherever the middle happens to be. */
      pos: g.pos,
      cta: CTA[key],
      count: list.length,
      noun: list.length === 1 ? g.one : g.many,
      words: count(list.length),
    };
  });
  writeFileSync(join(root, 'home-tabs.js'),
`/* What the homepage's tabs say, written by scripts/build-horses.mjs.
   Do not edit: rebuild. */
var HOME_TABS = ${JSON.stringify(tabs, null, 2)};
if (typeof module !== 'undefined') { module.exports = HOME_TABS; }
`);
  console.log(`wrote home-tabs.js for the homepage tabs (${tabs.length} archives)`);
}
