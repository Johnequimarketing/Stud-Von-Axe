#!/usr/bin/env node
/* The two legal pages and the page nobody means to land on.
 *
 *   /privacy   what this site does with a visitor, which is very little, and
 *              the one thing it does that is easy to miss: it loads its two
 *              typefaces from Google, and that hands Google the visitor's IP
 *              address. That is a fact about the build, not a guess, so it is
 *              written down.
 *   /terms     the ground the orders stand on. Almost none of this is ours to
 *              write: a price, a guarantee and a cancellation window are the
 *              owners' decisions. The page is built with the headings a stud's
 *              terms need and every one of them says plainly that the wording
 *              is still to come, so the checkbox at the end of the order form
 *              points somewhere real and the team can see what to fill.
 *   /404       asked for on 31 Aug. Says what happened and hands over the five
 *              archives, because a dead end on a catalogue site should put you
 *              back in the catalogue.
 *
 * The company details are the ones Mark sent on 31 Aug, which are also the
 * ones on their own site's footer: Stud Von Axe Az. Agr. s.s., Via per Arni 30,
 * 55032 Castelnuovo Garfagnana (LU), P. IVA IT02519980466. That settles the
 * registered address. Whether the crosses are still made in Desenzano del
 * Garda, which is what the briefing said and what this site says in five
 * places, is a separate question and is on the checklist.
 *
 * Run: node scripts/build-legal.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, pageHeroCss, footer, head, navScript, headerFor, header } from './lib/shell.mjs';

const CSS = homeCss + pageHeroCss + `
  /* ── the legal pages and the 404. Everything above is the homepage sheet. ── */
  .nhero > .wrap{ padding-top:clamp(6rem,13vh,8rem); }

  .lg{ padding-block:var(--sec-half); }
  .lg__grid{ display:grid; gap:clamp(2rem,5vw,4rem); }
  @media (min-width:900px){ .lg__grid{ grid-template-columns:.32fr .68fr; align-items:start; } }

  /* The contents list stays beside the text on a wide screen: eleven headings
     is a long page and a reader wants to see the shape of it. */
  .lg__toc{ position:sticky; top:calc(var(--hd-top) + var(--hd-bar) + 1.4rem); }
  .lg__toc ol{ list-style:none; margin:0; padding:0; display:grid; gap:.1rem;
    counter-reset:lgc; }
  .lg__toc a{
    display:flex; gap:.7rem; padding:.4rem 0;
    font-family:var(--font-body); font-size:14px; line-height:1.4;
    color:var(--color-ink-soft); border-bottom:1px solid transparent;
    transition:color .3s var(--ease);
  }
  .lg__toc a:hover{ color:var(--color-navy); }
  .lg__toc a::before{
    counter-increment:lgc; content:counter(lgc, decimal-leading-zero);
    font-weight:700; font-size:10px; letter-spacing:.18em; color:var(--color-gold);
    padding-top:.28rem;
  }

  .lg__body > section{ padding-top:clamp(1.6rem,3vw,2.4rem); }
  .lg__body > section + section{ border-top:1px solid var(--color-line); margin-top:clamp(1.6rem,3vw,2.4rem); }
  .lg__h{
    margin:0 0 .8rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.3rem,1.4vw + .8rem,1.7rem); line-height:1.1; color:var(--color-ink);
  }
  .lg__body p{ margin:0 0 .9rem; font-size:16px; line-height:1.7; color:var(--color-ink); max-width:66ch; }
  .lg__body ul{ margin:0 0 .9rem 1.1rem; padding:0; }
  .lg__body li{ font-size:16px; line-height:1.7; color:var(--color-ink); max-width:64ch; }

  /* A paragraph the owners still have to write. Marked the way the stand-in
     photographs are marked, so nobody mistakes a placeholder for a term. */
  .lg__todo{
    margin:0 0 .9rem; padding:.85rem 1rem; border-radius:var(--ctl-radius);
    background:color-mix(in srgb, var(--color-gold) 14%, var(--color-base));
    box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 45%, transparent);
    font-family:var(--font-body); font-size:14px; line-height:1.6;
    color:var(--color-navy); max-width:66ch;
  }
  .lg__todo b{ display:block; font-weight:700; font-size:10px; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-gold); margin-bottom:.25rem; }

  .lg__note{ margin:0 0 1.6rem; font-size:14px; line-height:1.6; color:var(--color-ink-soft); }

  /* ── 404 ──────────────────────────────────────────────────────────────
     One navy plate, the mark behind it, and the way back. No photograph: a
     picture of a horse over an error is a joke the visitor is not in the mood
     for, and every photograph on this site names a horse. */
  .nf{ min-height:78svh; display:grid; align-items:center;
    background:var(--color-navy-deep); position:relative; overflow:clip; }
  .nf__mark{
    position:absolute; z-index:0; pointer-events:none; user-select:none;
    right:clamp(0px, 1.5vw, 3rem); top:50%; transform:translateY(-50%);
    width:clamp(190px, 26vw, 400px); opacity:.06;
  }
  .nf__mark img{ width:100%; height:auto; display:block; }
  .nf .wrap{ position:relative; z-index:1; padding-block:clamp(6rem,14vh,9rem) clamp(3rem,7vh,5rem); }
  .nf__h{
    margin:.8rem 0 .8rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(2rem,3.4vw + 1rem,3.4rem); line-height:1.04; letter-spacing:-.02em;
    color:var(--color-white); max-width:18ch;
  }
  .nf__h em{ font-style:italic; color:var(--color-gold); }
  .nf__lead{ margin:0 0 2rem; font-size:16px; line-height:1.7;
    color:rgba(255,255,255,.74); max-width:52ch; }
  .nf__ways{ display:flex; flex-wrap:wrap; gap:.6rem; }
  .nf__way{
    display:inline-flex; align-items:center; gap:.5rem;
    padding:.6rem 1rem; border-radius:100px;
    border:1px solid var(--color-line-invert); color:var(--color-white);
    font-family:var(--font-body); font-size:14px;
    transition:background .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease);
  }
  .nf__way:hover{ background:var(--color-white); color:var(--color-navy); border-color:var(--color-white); }
`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const page = ({ title, desc, path, body, hd }) => `<!DOCTYPE html>
<html lang="en">
<head>
${head({ title, desc, path, image: 'hero-grey-wide.jpg' })}
<style>${CSS}</style>
</head>
<body>
${hd}

<main id="main">
${body}
</main>
${footer}
${navScript}
</body>
</html>
`;

const hero = (kicker, title, intro) => `
  <section class="nhero">
    <div class="nhero__bg" aria-hidden="true">
      <img src="/assets/img/hero-grey-wide.jpg" alt="" fetchpriority="high" width="1920" height="1150"
           style="object-position:50% 46%">
    </div>
    <div class="nhero__veil" aria-hidden="true"></div>
    <div class="wrap">
      <div class="nhero__grid">
        <div>
          <p class="eyebrow">${esc(kicker)}</p>
          <h1 class="arch__h">${title}</h1>
        </div>
        <p class="arch__intro">${esc(intro)}</p>
      </div>
    </div>
  </section>
`;

/* One list per page: the heading, and the paragraphs under it. A string is a
   paragraph; an array is a list; an object is a block the owners still owe. */
const section = (s, i) => `
      <section id="s${i + 1}">
        <h2 class="lg__h">${esc(s.h)}</h2>
${(s.p || []).map((b) => Array.isArray(b)
    ? `        <ul>${b.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`
    : typeof b === 'object'
      ? `        <p class="lg__todo"><b>Still to come from the owners</b>${esc(b.todo)}</p>`
      : `        <p>${esc(b)}</p>`).join('\n')}
      </section>`;

const legalPage = ({ title, kicker, h1, intro, note, sections, path }) => page({
  title, desc: intro, path, hd: headerFor(path),
  body: hero(kicker, h1, intro) + `
  <section class="lg">
    <div class="wrap lg__grid">
      <nav class="lg__toc" aria-label="On this page">
        <ol>
${sections.map((s, i) => `          <li><a href="#s${i + 1}">${esc(s.h)}</a></li>`).join('\n')}
        </ol>
      </nav>
      <div class="lg__body">
        <p class="lg__note">${esc(note)}</p>
${sections.map(section).join('\n')}
      </div>
    </div>
  </section>
`,
});

const COMPANY = 'Stud Von Axe Az. Agr. s.s., Via per Arni 30, 55032 Castelnuovo Garfagnana (LU), Italy. '
  + 'P. IVA IT02519980466.';

/* ── privacy ─────────────────────────────────────────────────────────── */
writeFileSync(join(root, 'privacy', 'index.html'), legalPage({
  title: 'Privacy policy',
  kicker: 'Privacy',
  h1: 'What happens with <em>your details</em>',
  intro: 'This site collects nothing about you by itself. What you send us by mail we keep only to answer you.',
  note: 'Last written on 31 August 2026. Two things on this page are still to be confirmed by the owners and are marked where they sit.',
  path: '/privacy',
  sections: [
    { h: 'Who we are', p: [
      `The company behind this site is ${COMPANY}`,
      'Write to studvonaxe@gmail.com, or telephone Elisabetta on +39 349 591 8565 or Adriano on +39 348 395 3433.',
    ] },
    { h: 'What this site collects', p: [
      'Nothing. There is no analytics on these pages, no advertising, no tracking pixel and no cookie of our own. Nothing is stored in your browser and nothing about your visit reaches us.',
      'The one exception is worth naming plainly: the two typefaces are loaded from Google Fonts, so opening a page asks Google for those files and Google sees your IP address in the request. Nothing else on the page comes from anywhere but our own server.',
    ] },
    { h: 'The forms', p: [
      'The forms on this site do not send anything anywhere by themselves. When you press send, your own mail programme opens with the answers written into a message addressed to us, and nothing leaves your computer until you send that message yourself.',
      'So we receive what you choose to send: your name, how to reach you, and what you tell us about your mare or the horse you are asking about.',
    ] },
    { h: 'What we do with it', p: [
      'We read it and we answer it. We do not sell it, we do not pass it to anyone else, and we do not add you to a mailing list.',
      { todo: 'How long a message and its details are kept, and whether the details of an order are held for longer than the enquiry.' },
    ] },
    { h: 'Your rights', p: [
      'Under the General Data Protection Regulation you can ask us what we hold about you, ask for it to be corrected, or ask for it to be deleted. Write to studvonaxe@gmail.com and we will answer.',
      'If you think we have handled your details badly you can complain to the Italian supervisory authority, the Garante per la protezione dei dati personali.',
    ] },
    { h: 'When this site changes', p: [
      'This site is being rebuilt. When it moves to its new form it may add things this page does not describe yet, and this page is written again on the day that happens rather than afterwards.',
      { todo: 'Whether the rebuilt site will carry analytics or a newsletter, which decides whether it needs a cookie notice.' },
    ] },
  ],
}));

/* ── terms ───────────────────────────────────────────────────────────── */
writeFileSync(join(root, 'terms', 'index.html'), legalPage({
  title: 'Terms and conditions',
  kicker: 'Terms',
  h1: 'The ground an order <em>stands on</em>',
  intro: 'The terms an order for ICSI semen, an embryo or a horse is made under. The headings are here; most of the wording is the owners’ to write.',
  note: 'This page is a framework, not a contract. Every block marked in gold is waiting for the owners to say what their terms actually are, and until they do nothing on this page binds anyone.',
  path: '/terms',
  sections: [
    { h: 'Who these terms apply to', p: [
      `These terms apply to every order placed with ${COMPANY}`,
      'They apply from the moment you send an order and we confirm it.',
    ] },
    { h: 'Prices and VAT', p: [
      { todo: 'The price per ICSI dose, whether it differs per stallion, and whether the prices shown are with or without VAT. Also whether a price holds for a season or is quoted per order.' },
    ] },
    { h: 'Ordering ICSI semen', p: [
      'An order is placed through the form on a stallion’s page. We answer with what we hold of that stallion, what it costs and when it can leave.',
      { todo: 'Whether an order is binding once confirmed, and what happens if the stallion is out of stock after a confirmation.' },
    ] },
    { h: 'Delivery and shipping', p: [
      'ICSI doses are produced with Avantea in Cremona and ship across the European Union and for export.',
      { todo: 'Who arranges and pays for shipping, which carrier is used, what happens to a shipment that arrives late or thawed, and which countries are excluded.' },
    ] },
    { h: 'Guarantees', p: [
      { todo: 'Whether there is a live foal guarantee or a replacement dose, on what conditions, and what a buyer has to send in to claim one.' },
    ] },
    { h: 'Payment', p: [
      { todo: 'When payment is due, which methods are accepted, and whether the goods leave before or after payment.' },
    ] },
    { h: 'Papers and registration', p: [
      { todo: 'Which papers travel with a dose, an embryo or a horse, and who registers a resulting foal with which studbook.' },
    ] },
    { h: 'Health and veterinary', p: [
      { todo: 'The health status the stud guarantees, the tests carried out, and what a buyer’s own vet is expected to do on arrival.' },
    ] },
    { h: 'Cancelling an order', p: [
      { todo: 'Whether an order can be cancelled, until when, and what it costs.' },
    ] },
    { h: 'Liability', p: [
      { todo: 'What the stud is and is not answerable for once the goods have left.' },
    ] },
    { h: 'Which law applies', p: [
      { todo: 'Italian law and an Italian court is the usual answer for a company registered here, but it is theirs to state.' },
    ] },
  ],
}));

/* ── 404 ─────────────────────────────────────────────────────────────── */
const WAYS = [
  ['/', 'Home'],
  ['/sport-horses', 'Sport horses'],
  ['/breeding-mares', 'Breeding mares'],
  ['/foals', 'Foals'],
  ['/embryos', 'Embryos'],
  ['/icsi-semen', 'ICSI semen'],
  ['/contact', 'Contact'],
];

writeFileSync(join(root, '404.html'), page({
  title: 'Page not found',
  desc: 'That page is not here. The horses, the crosses and the stallions are.',
  path: '/404',
  hd: header,
  body: `
  <section class="nf">
    <div class="nf__mark" aria-hidden="true">
      <img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="">
    </div>
    <div class="wrap">
      <!-- Not the number: the house rule bans an eyebrow that opens with one,
           because that is how the decorative "01 &middot;" labels crept in. The
           status code is in the title of the page, where a browser and a
           search engine read it. -->
      <p class="eyebrow">Page not found</p>
      <h1 class="nf__h">That page is <em>not here</em></h1>
      <p class="nf__lead">Either it never was, or it has moved while this site was being rebuilt.
      Everything the stud has is one of these.</p>
      <div class="nf__ways">
${WAYS.map(([href, label]) => `        <a class="nf__way" href="${href}">${esc(label)} <span class="a" aria-hidden="true">&rarr;</span></a>`).join('\n')}
      </div>
    </div>
  </section>
`,
}));

console.log('built privacy/index.html, terms/index.html and 404.html');
