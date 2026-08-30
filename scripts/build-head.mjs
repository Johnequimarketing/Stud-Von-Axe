#!/usr/bin/env node
/* Build 06-embryo-head.html: six ways to open an embryo page.
 *
 * The problem being solved: a hero carrying the name and their sentence, and
 * then a second block underneath carrying the photograph and the figures,
 * reads as two things that arrived separately. Mark: "heel rommelig". Every
 * variation here is an attempt to make the top of the page one object.
 *
 * All six on the real cross, with the fields a cross actually has: stage,
 * due, sire, dam, the dam's Horsetelex link, and two actions. No sex, no
 * height, no studbook, no Horsetelex of its own.
 *
 * Run: node scripts/build-head.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, esc } from './lib/shell.mjs';

const HORSES = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();

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

/* The long one on purpose: three words a side is where a heading starts
   breaking, and half the crosses are this long. */
const C = HORSES.find((h) => h.slug === 'mosito-van-het-hellenof-x-carma-vd-berghoeve-z');
const SIRE = name(C.name.split(/\s+X\s+/i)[0]);
const damRaw = C.name.split(/\s+X\s+/i).slice(1).join(' x ').trim();
const dam = HORSES.find((m) => flat(m.name) === flat(damRaw))
         || HORSES.find((m) => flat(m.name).startsWith(flat(damRaw).slice(0, 12)));
const DAM = name(dam ? dam.name : damRaw);
const SAY = theirs(C.tagline);
const SHOT = C.photos[0] ? `/${C.photos[0]}` : (dam && dam.photos[0] ? `/${dam.photos[0]}` : '');
const STAGE = /frozen/i.test(C.year || '') ? 'Frozen' : `Due ${C.year}`;
const TELEX = (dam && dam.horsetelex) || '';

const FACTS = [
  ['Stage', /frozen/i.test(C.year || '') ? 'Frozen embryo' : 'Carrying'],
  ['Due', /frozen/i.test(C.year || '') ? 'On implantation' : C.year],
  ['Sire', SIRE],
  ['Dam', DAM],
];

const facts = (cls) => FACTS.map(([k, v]) =>
  `<div><span class="${cls}__k">${esc(k)}</span><span class="${cls}__v">${esc(v)}</span></div>`).join('\n            ');
/* The ghost button is drawn white, for a navy plate. On the ivory ground it
   needs ink, which is the same fix the horse pages carry, and getting it the
   wrong way round makes it vanish: white on ivory. */
const acts = (cls, light) => `
          <div class="${cls}__acts">
            <a href="#" class="btn btn-gold btn-pill">Ask about this embryo</a>
            <a href="#" class="btn btn-ghost btn-pill ${light ? 'is-light' : 'is-dark'}">Message on WhatsApp</a>
          </div>`;
const telex = (cls) => TELEX
  ? `<p class="${cls}__telex"><a href="${esc(TELEX)}" target="_blank" rel="noopener">View ${esc(DAM)} on Horsetelex <span aria-hidden="true">&#8599;</span></a></p>`
  : '';
const img = (cls) => SHOT
  ? `<img class="${cls}__img" src="${SHOT}" alt="${esc(name(C.name))}">`
  : `<span class="${cls}__img h-none"><img src="/assets/logo/icon-ondark.png" data-ground="dark" alt="" aria-hidden="true"></span>`;

const VARIANTS = [
  {
    id: 'tray', title: 'The tray',
    note: 'One photograph across the top and the figures on a plate that hangs into it from below, the way the homepage hero hands over to the topics tray. Measured after Mark said the title sat against the block: there were exactly nought pixels between them. The photograph is taller now, the name sits well clear of the plate, and the plate hangs a little less deep, so the two overlap without touching.',
    html: () => `
      <section class="h1">
        <div class="h1__win">${img('h1')}<span class="h1__veil" aria-hidden="true"></span>
          <div class="h1__type">
            <a class="h1__back" href="#"><span aria-hidden="true">&larr;</span> Embryos</a>
            <p class="h1__h">${esc(SIRE)} <em>&times;</em> ${esc(DAM)}</p>
          </div>
        </div>
        <div class="wrap">
          <div class="h1__tray">
            <span class="h1__stage">${esc(STAGE)}</span>
            <p class="h1__say">${esc(SAY)}</p>
            <div class="h1__facts">
            ${facts('h1')}
            </div>
            ${telex('h1')}
            ${acts('h1', true)}
          </div>
        </div>
      </section>`,
  },
  {
    id: 'tray-top', title: 'The tray, name at the head',
    note: 'The same plate, with the name moved to the top of the photograph instead of the foot. Nothing can crowd it from below, the picture is uninterrupted where the horse is, and the eye reads down: name, photograph, figures.',
    html: () => `
      <section class="h7">
        <div class="h7__win">${img('h7')}<span class="h7__veil" aria-hidden="true"></span>
          <div class="h7__type">
            <a class="h7__back" href="#"><span aria-hidden="true">&larr;</span> Embryos</a>
            <p class="h7__h">${esc(SIRE)} <em>&times;</em> ${esc(DAM)}</p>
          </div>
        </div>
        <div class="wrap">
          <div class="h7__tray">
            <span class="h7__stage">${esc(STAGE)}</span>
            <p class="h7__say">${esc(SAY)}</p>
            <div class="h7__facts">
            ${facts('h7')}
            </div>
            ${telex('h7')}
            ${acts('h7', true)}
          </div>
        </div>
      </section>`,
  },
  {
    id: 'tray-clean', title: 'The tray, nothing on the photograph',
    note: 'The plate carries the name as well, so the photograph is only a photograph. It solves the crowding by removing the cause, it is the kindest to a picture, and it is the one that still works on the seven crosses that have no photograph of their own.',
    html: () => `
      <section class="h8">
        <div class="h8__win">${img('h8')}<span class="h8__veil" aria-hidden="true"></span>
          <a class="h8__back" href="#"><span aria-hidden="true">&larr;</span> Embryos</a>
        </div>
        <div class="wrap">
          <div class="h8__tray">
            <span class="h8__stage">${esc(STAGE)}</span>
            <p class="h8__h">${esc(SIRE)} <em>&times;</em> ${esc(DAM)}</p>
            <p class="h8__say">${esc(SAY)}</p>
            <div class="h8__facts">
            ${facts('h8')}
            </div>
            ${telex('h8')}
            ${acts('h8', true)}
          </div>
        </div>
      </section>`,
  },
  {
    id: 'split', title: 'The split screen',
    note: 'No separate hero at all: the photograph takes half the screen at full height and everything else stands beside it. One block, so nothing can look like it arrived separately, and the picture is the largest it is anywhere in these six.',
    html: () => `
      <section class="h2">
        <div class="h2__pic">${img('h2')}</div>
        <div class="h2__body">
          <a class="h2__back" href="#"><span aria-hidden="true">&larr;</span> Embryos</a>
          <span class="h2__stage">${esc(STAGE)}</span>
          <p class="h2__h">${esc(SIRE)} <em>&times;</em> ${esc(DAM)}</p>
          <p class="h2__say">${esc(SAY)}</p>
          <div class="h2__facts">
            ${facts('h2')}
          </div>
          ${telex('h2')}
          ${acts('h2', true)}
        </div>
      </section>`,
  },
  {
    id: 'band', title: 'The band',
    note: 'A shallow photograph with the name on it, and under it one ivory band holding the figures in a row with the buttons at its end. It is the quietest of the six and the only one where the whole head fits on a laptop screen without scrolling.',
    html: () => `
      <section class="h3">
        <div class="h3__win">${img('h3')}<span class="h3__veil" aria-hidden="true"></span>
          <div class="h3__type">
            <a class="h3__back" href="#"><span aria-hidden="true">&larr;</span> Embryos</a>
            <p class="h3__h">${esc(SIRE)} <em>&times;</em> ${esc(DAM)}</p>
            <p class="h3__say">${esc(SAY)}</p>
          </div>
        </div>
        <div class="wrap h3__bar">
          <div class="h3__facts">
            ${facts('h3')}
          </div>
          ${acts('h3', true)}
        </div>
      </section>`,
  },
  {
    id: 'card', title: 'The card',
    note: 'The archive card at page size: the photograph fading into navy and the name, the figures and the buttons carrying on out of it in the same navy. Whoever clicked a card lands on the same object, one size up, which is the strongest thing this one has going for it.',
    html: () => `
      <section class="h4">
        <div class="wrap">
          <a class="h4__back" href="#"><span aria-hidden="true">&larr;</span> Embryos</a>
          <div class="h4__card">
            <div class="h4__win">${img('h4')}<span class="h4__fade" aria-hidden="true"></span></div>
            <div class="h4__seam"><span class="h4__stage">${esc(STAGE)}</span></div>
            <div class="h4__body">
              <p class="h4__h">${esc(SIRE)} <em>&times;</em> ${esc(DAM)}</p>
              <p class="h4__say">${esc(SAY)}</p>
              <div class="h4__facts">
              ${facts('h4')}
              </div>
              ${telex('h4')}
              ${acts('h4', false)}
            </div>
          </div>
        </div>
      </section>`,
  },
  {
    id: 'masthead', title: 'The masthead',
    note: 'Name and sentence on the ivory ground, on their own, with the photograph and the figures underneath. Nothing is set over a photograph, which means the heading is at full contrast and a long pair of names has the whole page width to break across instead of half of it.',
    html: () => `
      <section class="h5">
        <div class="wrap">
          <a class="h5__back" href="#"><span aria-hidden="true">&larr;</span> Embryos</a>
          <span class="h5__stage">${esc(STAGE)}</span>
          <p class="h5__h">${esc(SIRE)} <em>&times;</em> ${esc(DAM)}</p>
          <p class="h5__say">${esc(SAY)}</p>
          <div class="h5__grid">
            <div class="h5__pic">${img('h5')}</div>
            <div class="h5__side">
              <div class="h5__facts">
              ${facts('h5')}
              </div>
              ${telex('h5')}
              ${acts('h5', true)}
            </div>
          </div>
        </div>
      </section>`,
  },
  {
    id: 'glass', title: 'The glass card',
    note: 'The homepage hero, applied to a cross: one full photograph with a small plate sitting on it that holds the stage, the figures and the two buttons. Everything is in one frame and the picture is uninterrupted behind it. It is the boldest of the six and the one that needs a good photograph, which seven crosses do not have.',
    html: () => `
      <section class="h6">
        <div class="h6__win">${img('h6')}<span class="h6__veil" aria-hidden="true"></span></div>
        <div class="wrap h6__in">
          <div class="h6__type">
            <a class="h6__back" href="#"><span aria-hidden="true">&larr;</span> Embryos</a>
            <p class="h6__h">${esc(SIRE)} <em>&times;</em> ${esc(DAM)}</p>
            <p class="h6__say">${esc(SAY)}</p>
          </div>
          <div class="h6__glass">
            <span class="h6__stage">${esc(STAGE)}</span>
            <div class="h6__facts">
            ${facts('h6')}
            </div>
            ${telex('h6')}
            ${acts('h6', false)}
          </div>
        </div>
      </section>`,
  },
];

const CSS = `
  body{ background:var(--color-base); }
  .d-head{ width:min(var(--wrap), 100% - (2*var(--gutter))); margin:0 auto; padding:clamp(3rem,7vh,5rem) 0 1rem; }
  .d-head h1{ font-family:var(--font-display); font-weight:400; font-size:clamp(1.9rem,3vw+.8rem,2.8rem);
    line-height:1.05; letter-spacing:-.02em; color:var(--color-ink); margin:.5rem 0 .8rem; }
  .d-head h1 em{ font-style:italic; color:var(--color-gold); }
  .d-head p{ max-width:64ch; color:var(--color-ink-soft); font-size:16px; margin:0 0 .7rem; }
  .d-sec{ padding:clamp(2.4rem,5vw,3.6rem) 0 0; border-top:1px solid var(--color-line); }
  .d-lab{ width:min(var(--wrap), 100% - (2*var(--gutter))); margin:0 auto clamp(1.4rem,3vw,2rem); }
  .d-num{ font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.22em;
    text-transform:uppercase; color:var(--color-gold); margin:0 0 .4rem; }
  .d-lab h2{ font-family:var(--font-display); font-weight:400; font-size:clamp(1.4rem,1.8vw+.7rem,1.9rem);
    color:var(--color-ink); margin:0 0 .6rem; }
  .d-note{ max-width:72ch; color:var(--color-ink-soft); font-size:15px; line-height:1.6; margin:0; }
  .d-frame{ background:var(--color-base); border-top:1px solid var(--color-line);
    border-bottom:1px solid var(--color-line); }
  /* In this sheet the samples get fixed heights instead of viewport ones:
     six heroes each asking for 64vh makes the page as long as the window is
     tall, which is fine in a browser and useless in a render. On the real
     page they keep their vh. */
  .d-frame .h1__win{ height:420px; }
  .d-frame .h7__win{ height:380px; }
  .d-frame .h8__win{ height:400px; }
  .d-frame .h2__pic{ min-height:460px; }
  .d-frame .h3__win{ height:300px; }
  .d-frame .h6{ min-height:520px; }
  .h-none{ display:grid; place-items:center; background:var(--color-navy-deep); }
  .h-none img{ width:auto; height:26%; max-height:96px; opacity:.16; }

  /* shared bits */
  .h1__k,.h7__k,.h8__k,.h2__k,.h3__k,.h4__k,.h5__k,.h6__k{ display:block; font-family:var(--font-body); font-weight:700;
    font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.28rem; }
  .h1__v,.h7__v,.h8__v,.h2__v,.h3__v,.h4__v,.h5__v,.h6__v{ display:block; font-family:var(--font-display);
    font-weight:400; font-size:1.05rem; line-height:1.25; }
  .h1__stage,.h7__stage,.h8__stage,.h2__stage,.h3__stage,.h4__stage,.h5__stage,.h6__stage{ display:inline-flex; align-items:center;
    padding:.34em .85em; border-radius:var(--ctl-radius); background:var(--color-gold);
    color:var(--color-navy); font-family:var(--font-body); font-weight:700; font-size:9.5px;
    letter-spacing:.16em; text-transform:uppercase; }
  .h1__back,.h7__back,.h8__back,.h2__back,.h3__back,.h4__back,.h5__back,.h6__back{ display:inline-flex; align-items:center;
    gap:.5rem; font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.18em;
    text-transform:uppercase; }
  /* Rendered as paragraphs in this sheet: six samples on one page cannot
     each carry an h1, and the audit is right to say so. On the real page it
     is an h1, and the class is the same either way. */
  .h1__h,.h7__h,.h8__h,.h2__h,.h3__h,.h4__h,.h5__h,.h6__h{ font-family:var(--font-display); font-weight:400;
    line-height:1.04; letter-spacing:-.02em; margin:.6rem 0 0; }
  .h1__h em,.h7__h em,.h8__h em,.h2__h em,.h3__h em,.h4__h em,.h5__h em,.h6__h em{ font-style:italic; color:var(--color-gold); }
  .h1__say,.h7__say,.h8__say,.h2__say,.h3__say,.h4__say,.h5__say,.h6__say{ font-family:var(--font-display); font-style:italic;
    line-height:1.45; }
  .btn-ghost.is-dark{ border-color:rgba(255,255,255,.34); color:var(--color-white); }
  .btn-ghost.is-dark:hover{ border-color:var(--color-white); }
  .btn-ghost.is-light{ border-color:var(--color-line); color:var(--color-ink); }
  .btn-ghost.is-light:hover{ border-color:var(--color-navy); color:var(--color-navy); }
  .h1__acts,.h7__acts,.h8__acts,.h2__acts,.h3__acts,.h4__acts,.h5__acts,.h6__acts{ display:flex; flex-wrap:wrap; gap:.7rem; }
  .h1__telex a,.h7__telex a,.h8__telex a,.h2__telex a,.h4__telex a,.h5__telex a,.h6__telex a{ font-family:var(--font-body);
    font-weight:700; font-size:11px; letter-spacing:.1em; text-transform:uppercase; }

  /* 1 tray */
  .h1__win{ position:relative; height:clamp(300px,42vh,420px); overflow:hidden; background:var(--color-navy-deep); }
  .h1__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .h1__veil{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),.5) 0%, rgba(var(--veil-rgb),.35) 40%, rgba(var(--veil-rgb),.8) 100%); }
  .h1__type{ position:absolute; left:0; right:0; bottom:clamp(2.2rem,5vw,3.4rem);
    width:min(var(--wrap), 100% - (2*var(--gutter))); margin-inline:auto; }
  .h1__back{ color:rgba(255,255,255,.72); }
  .h1__h{ font-size:clamp(1.8rem,2.8vw + .9rem,2.8rem); color:var(--color-white); max-width:20ch; }
  .h1__tray{ position:relative; margin-top:clamp(-3.4rem,-4vw,-2.4rem); z-index:2;
    background:var(--color-base); border-radius:var(--plate-radius);
    padding:clamp(1.3rem,2.6vw,1.9rem); box-shadow:0 30px 60px -44px rgba(var(--veil-rgb),.5); }
  .h1__say{ margin:.7rem 0 1.1rem; font-size:16px; color:var(--color-navy); max-width:52ch; }
  .h1__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem 1.4rem;
    padding-top:1.1rem; border-top:1px solid var(--color-line); }
  @media (min-width:760px){ .h1__facts{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
  .h1__v{ color:var(--color-ink); }
  .h1__telex{ margin:1.1rem 0 1.1rem; }
  .h1__telex a{ color:var(--color-navy); border-bottom:1px solid var(--color-line); padding-bottom:2px; }


  /* 1 tray, with room: the name clears the plate rather than resting on it */
  .h1__win{ height:clamp(360px,50vh,480px); }
  .h1__type{ bottom:clamp(4.4rem,7vw,5.6rem); }
  .h1__tray{ margin-top:clamp(-2.6rem,-3vw,-1.8rem); }

  /* 7 tray, name at the head */
  .h7__win{ position:relative; height:clamp(320px,44vh,440px); overflow:hidden; background:var(--color-navy-deep); }
  .h7__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .h7__veil{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),.72) 0%, rgba(var(--veil-rgb),.38) 46%, rgba(var(--veil-rgb),.6) 100%); }
  .h7__type{ position:absolute; left:0; right:0; top:calc(var(--hd-top) + var(--hd-plate) + 1.4rem);
    width:min(var(--wrap), 100% - (2*var(--gutter))); margin-inline:auto; }
  .h7__back{ color:rgba(255,255,255,.72); }
  .h7__h{ font-size:clamp(1.8rem,2.8vw + .9rem,2.8rem); color:var(--color-white); max-width:20ch; }
  .h7__tray{ position:relative; margin-top:clamp(-2.6rem,-3vw,-1.8rem); z-index:2;
    background:var(--color-base); border-radius:var(--plate-radius);
    padding:clamp(1.3rem,2.6vw,1.9rem); box-shadow:0 30px 60px -44px rgba(var(--veil-rgb),.5); }
  .h7__say{ margin:.7rem 0 1.1rem; font-size:16px; color:var(--color-navy); max-width:52ch; }
  .h7__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem 1.4rem;
    padding-top:1.1rem; border-top:1px solid var(--color-line); }
  @media (min-width:760px){ .h7__facts{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
  .h7__v{ color:var(--color-ink); }
  .h7__telex{ margin:1.1rem 0; }
  .h7__telex a{ color:var(--color-navy); border-bottom:1px solid var(--color-line); padding-bottom:2px; }

  /* 8 tray, nothing on the photograph */
  .h8__win{ position:relative; height:clamp(340px,46vh,460px); overflow:hidden; background:var(--color-navy-deep); }
  .h8__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .h8__veil{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),.5) 0%, rgba(var(--veil-rgb),.18) 44%, rgba(var(--veil-rgb),.34) 100%); }
  .h8__back{ position:absolute; left:0; right:0; top:calc(var(--hd-top) + var(--hd-plate) + 1.4rem);
    width:min(var(--wrap), 100% - (2*var(--gutter))); margin-inline:auto;
    color:rgba(255,255,255,.78); }
  .h8__tray{ position:relative; margin-top:clamp(-3rem,-3.4vw,-2rem); z-index:2;
    background:var(--color-base); border-radius:var(--plate-radius);
    padding:clamp(1.4rem,2.8vw,2rem); box-shadow:0 30px 60px -44px rgba(var(--veil-rgb),.5); }
  .h8__h{ margin:.9rem 0 0; font-size:clamp(1.7rem,2.4vw + .8rem,2.5rem); color:var(--color-ink);
    max-width:22ch; }
  .h8__say{ margin:.6rem 0 1.2rem; font-size:16px; color:var(--color-navy); max-width:52ch; }
  .h8__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem 1.4rem;
    padding-top:1.1rem; border-top:1px solid var(--color-line); }
  @media (min-width:760px){ .h8__facts{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
  .h8__v{ color:var(--color-ink); }
  .h8__telex{ margin:1.1rem 0; }
  .h8__telex a{ color:var(--color-navy); border-bottom:1px solid var(--color-line); padding-bottom:2px; }
  /* 2 split screen */
  .h2{ display:grid; align-items:stretch; }
  @media (min-width:900px){ .h2{ grid-template-columns:1fr 1fr; } }
  .h2__pic{ position:relative; min-height:clamp(320px,52vh,560px); background:var(--color-navy-deep); }
  .h2__img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .h2__body{ padding:clamp(1.8rem,4vw,3.2rem) var(--gutter); display:flex; flex-direction:column; }
  @media (min-width:900px){ .h2__body{ padding-right:clamp(2rem,5vw,4rem); justify-content:center; } }
  .h2__back{ color:var(--color-ink-soft); margin-bottom:.9rem; }
  .h2__stage{ align-self:flex-start; }
  .h2__h{ font-size:clamp(1.7rem,2.2vw + .9rem,2.5rem); color:var(--color-ink); }
  .h2__say{ margin:.7rem 0 1.3rem; font-size:16px; color:var(--color-navy); max-width:44ch; }
  .h2__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1.1rem 1.4rem;
    padding-top:1.2rem; border-top:1px solid var(--color-line); }
  .h2__v{ color:var(--color-ink); }
  .h2__telex{ margin:1.2rem 0; }
  .h2__telex a{ color:var(--color-navy); border-bottom:1px solid var(--color-line); padding-bottom:2px; }

  /* 3 band */
  .h3__win{ position:relative; height:clamp(240px,34vh,340px); overflow:hidden; background:var(--color-navy-deep); }
  .h3__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .h3__veil{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),.48) 0%, rgba(var(--veil-rgb),.34) 42%, rgba(var(--veil-rgb),.84) 100%); }
  .h3__type{ position:absolute; left:0; right:0; bottom:clamp(1.2rem,3vw,2rem);
    width:min(var(--wrap), 100% - (2*var(--gutter))); margin-inline:auto; }
  .h3__back{ color:rgba(255,255,255,.72); }
  .h3__h{ font-size:clamp(1.6rem,2.4vw + .8rem,2.3rem); color:var(--color-white); max-width:22ch; }
  .h3__say{ margin:.5rem 0 0; font-size:14.5px; color:rgba(255,255,255,.8); max-width:52ch; }
  .h3__bar{ display:flex; flex-wrap:wrap; align-items:end; justify-content:space-between; gap:1.4rem;
    padding-block:clamp(1.2rem,2.6vw,1.8rem); }
  .h3__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem 2.2rem; }
  @media (min-width:760px){ .h3__facts{ grid-template-columns:repeat(4,auto); } }
  .h3__v{ color:var(--color-ink); }

  /* 4 card */
  .h4__back{ color:var(--color-ink-soft); margin-bottom:1rem; }
  .h4__card{ border-radius:var(--plate-radius); overflow:hidden; background:var(--color-navy-deep); }
  .h4__win{ position:relative; aspect-ratio:21/9; overflow:hidden; }
  .h4__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .h4__fade{ position:absolute; left:0; right:0; bottom:-1px; height:52%;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),0) 0%, rgba(var(--veil-rgb),.55) 46%,
      rgba(var(--veil-rgb),.92) 82%, var(--color-navy-deep) 100%); }
  .h4__seam{ display:flex; align-items:center; gap:.7rem; padding:0 clamp(1.2rem,2.4vw,1.8rem); }
  .h4__seam::after{ content:""; flex:1 1 auto; height:1px;
    background:color-mix(in srgb, var(--color-gold) 65%, transparent); }
  .h4__body{ padding:.9rem clamp(1.2rem,2.4vw,1.8rem) clamp(1.4rem,2.6vw,1.9rem); }
  .h4__h{ margin-top:0; font-size:clamp(1.6rem,2.2vw + .8rem,2.3rem); color:var(--color-white); }
  .h4__say{ margin:.6rem 0 1.2rem; font-size:15px; color:rgba(255,255,255,.86); max-width:52ch; }
  .h4__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem 1.4rem;
    padding-top:1.1rem; border-top:1px solid rgba(255,255,255,.16); }
  @media (min-width:760px){ .h4__facts{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
  .h4__v{ color:var(--color-white); }
  .h4__telex{ margin:1.1rem 0; }
  .h4__telex a{ color:var(--color-white); border-bottom:1px solid rgba(255,255,255,.3); padding-bottom:2px; }

  /* 5 masthead */
  .h5{ padding-top:clamp(1rem,2vw,1.6rem); }
  .h5__back{ color:var(--color-ink-soft); }
  .h5__stage{ margin:1rem 0 0; }
  .h5__h{ font-size:clamp(1.9rem,3vw + 1rem,3.1rem); color:var(--color-ink); max-width:24ch; }
  .h5__say{ margin:.8rem 0 1.6rem; font-size:17px; color:var(--color-navy); max-width:56ch; }
  .h5__grid{ display:grid; gap:clamp(1.4rem,3vw,2.4rem); align-items:stretch; }
  @media (min-width:900px){ .h5__grid{ grid-template-columns:1.15fr .85fr; } }
  .h5__pic{ position:relative; min-height:280px; border-radius:var(--plate-radius); overflow:hidden;
    background:var(--color-navy-deep); }
  .h5__img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .h5__side{ display:flex; flex-direction:column; }
  .h5__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1.2rem 1.4rem; }
  .h5__v{ color:var(--color-ink); }
  .h5__telex{ margin:1.3rem 0; }
  .h5__telex a{ color:var(--color-navy); border-bottom:1px solid var(--color-line); padding-bottom:2px; }
  .h5__acts{ margin-top:auto; }

  /* 6 glass card */
  .h6{ position:relative; isolation:isolate; min-height:clamp(420px,64vh,620px); display:grid;
    align-items:end; background:var(--color-navy-deep); }
  .h6__win{ position:absolute; inset:0; z-index:0; }
  .h6__img{ width:100%; height:100%; object-fit:cover; display:block; }
  .h6__veil{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),.46) 0%, rgba(var(--veil-rgb),.3) 38%, rgba(var(--veil-rgb),.82) 100%); }
  .h6__in{ position:relative; z-index:2; display:grid; gap:clamp(1.2rem,2.6vw,2rem);
    align-items:end; padding-block:clamp(1.8rem,4vw,2.8rem); }
  @media (min-width:900px){ .h6__in{ grid-template-columns:1fr .8fr; } }
  .h6__back{ color:rgba(255,255,255,.72); }
  .h6__h{ font-size:clamp(1.8rem,2.6vw + .9rem,2.7rem); color:var(--color-white); max-width:18ch; }
  .h6__say{ margin:.7rem 0 0; font-size:15.5px; color:rgba(255,255,255,.84); max-width:46ch; }
  .h6__glass{ border-radius:var(--plate-radius); padding:clamp(1.2rem,2.4vw,1.6rem);
    background:rgba(var(--veil-rgb),.62); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,.14); }
  .h6__facts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem 1.2rem;
    margin-top:.9rem; padding-top:.9rem; border-top:1px solid rgba(255,255,255,.16); }
  .h6__v{ color:var(--color-white); font-size:.98rem; }
  .h6__telex{ margin:1rem 0; }
  .h6__telex a{ color:var(--color-white); border-bottom:1px solid rgba(255,255,255,.3); padding-bottom:2px; }
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="internal-doc" content="true">
<meta name="robots" content="noindex, nofollow">
<title>Opening an embryo page, six ways | Stud Von Axe</title>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${homeCss}${CSS}</style>
</head>
<body>

<header class="d-head">
  <p class="d-num">For Mark, to choose from</p>
  <h1>Six ways to open <em>a cross</em></h1>
  <p>A hero with the name on it and then a second block with the photograph and the figures reads as two
  things that arrived separately. Each of these makes the top of the page one object instead.</p>
  <p>All six on ${esc(SIRE)} &times; ${esc(DAM)}, which is the longest pair of names in the fifteen: three
  words a side is where a heading starts breaking, so if one of these holds this cross it holds all of
  them. The dam and sire section, the pedigree and the rest of the page stay exactly as they are.</p>
</header>

<main>
${VARIANTS.map((v, i) => `
<section class="d-sec" id="${v.id}">
  <div class="d-lab">
    <p class="d-num">Variation ${['one','one A','one B','two','three','four','five','six'][i]}</p>
    <h2>${esc(v.title)}</h2>
    <p class="d-note">${esc(v.note)}</p>
  </div>
  <div class="d-frame">${v.html()}</div>
</section>`).join('\n')}
</main>

<footer class="d-head" style="padding-bottom:4rem">
  <p style="font-size:14px">Say a number and it becomes the top of all fifteen embryo pages.</p>
</footer>

</body>
</html>
`;

writeFileSync(join(root, '06-embryo-head.html'), html);
console.log(`built 06-embryo-head.html with ${VARIANTS.length} variations`);
