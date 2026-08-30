#!/usr/bin/env node
/* Build 07-horse-contact.html: six ways to put a contact section on a horse,
 * foal, mare or embryo page.
 *
 * Asked for on 30 Aug: every single page except the news needs its own form,
 * with the contact details beside it and the name of the horse already filled
 * in, and the "Ask about this…" buttons should land on it instead of sending
 * the visitor back to the homepage.
 *
 * All six carry the same parts, so the choice is only about the shape:
 *   - the name of the horse, already in the form and still editable, because
 *     a visitor writing about two of them should not have to fight it
 *   - name, email, telephone and the message
 *   - the four ways to reach them: WhatsApp, Elisabetta, Adriano, email
 *
 * Run: node scripts/build-contact.mjs
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

/* A mare with a photograph and a long enough name to be a fair test. */
const H = HORSES.find((h) => h.slug === 'hypnotic-jt-z');
const N = name(H.name);
const SHOT = H.photos[0] ? `/${H.photos[0]}` : '';
const SHOT2 = H.photos[1] ? `/${H.photos[1]}` : SHOT;

const WA = 'https://wa.me/393495918565';
const PEOPLE = [
  ['WhatsApp', 'Fastest reply', WA],
  ['Elisabetta', '+39 349 591 8565', 'tel:+393495918565'],
  ['Adriano', '+39 348 395 3433', 'tel:+393483953433'],
  ['By mail', 'studvonaxe@gmail.com', 'mailto:studvonaxe@gmail.com'],
];

/* The fields, written once. Every variation prints the same five; what
   changes is how they are stacked. `p` is the id prefix, because six copies
   of the same form on one page would otherwise share label targets. */
const fields = (p, { stacked } = {}) => `
            <input type="hidden" name="horse" value="${esc(N)}">
            <div class="cf__pair${stacked ? ' is-stacked' : ''}">
              <div class="cf__row">
                <label for="${p}-name">Your name</label>
                <input id="${p}-name" name="name" type="text" required autocomplete="name" placeholder="Name">
              </div>
              <div class="cf__row">
                <label for="${p}-email">Email</label>
                <input id="${p}-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
              </div>
            </div>
            <div class="cf__pair${stacked ? ' is-stacked' : ''}">
              <div class="cf__row">
                <label for="${p}-tel">Telephone <span class="cf__opt">optional</span></label>
                <input id="${p}-tel" name="tel" type="tel" autocomplete="tel" placeholder="+39 …">
              </div>
              <div class="cf__row">
                <label for="${p}-about">About</label>
                <input id="${p}-about" name="about" type="text" value="${esc(N)}">
              </div>
            </div>
            <div class="cf__row">
              <label for="${p}-msg">Your message</label>
              <textarea id="${p}-msg" name="message" rows="4" required
                placeholder="What would you like to know about ${esc(N)}?"></textarea>
            </div>`;

const people = (cls) => PEOPLE.map(([k, v, href]) =>
  `<a class="${cls}__p" href="${esc(href)}"${/^https/.test(href) ? ' target="_blank" rel="noopener"' : ''}>
              <span class="${cls}__pk">${esc(k)}</span><span class="${cls}__pv">${esc(v)}</span></a>`).join('\n            ');

const VARIANTS = [
  {
    id: 'c1', title: 'The split plate',
    note: 'The homepage contact box, narrowed to one horse: the invitation and the four ways to reach them on the navy half, the form on the ivory half. It is the shape the site already has, so it needs no explaining, and the name of the horse sits in the heading as well as in the field.',
    html: () => `
      <section class="c1">
        <div class="wrap">
          <div class="c1__box">
            <div class="c1__side">
              <div>
                <p class="plaque">Ask about her</p>
                <h2 class="c1__h">Ask the people who <em>bred her</em>.</h2>
                <p class="c1__lead">No agent and no auction ring. You speak to the two people who chose the cross.</p>
              </div>
              <div class="c1__people">
                ${people('c1')}
              </div>
            </div>
            <form class="c1__form">
              ${fields('c1')}
              <button type="submit" class="btn btn-gold btn-pill">Send it <span class="a" aria-hidden="true">&rarr;</span></button>
            </form>
          </div>
        </div>
      </section>`,
  },
  {
    id: 'c2', title: 'Her picture, beside the form',
    note: 'The horse is in the room: her photograph stands to the left of the form at the same height, with her name on a gold label over it, so there is no doubt which horse the message is about. The four ways to reach them run under the picture rather than beside the fields.',
    html: () => `
      <section class="c2">
        <div class="wrap">
          <div class="c2__grid">
            <div class="c2__col">
              <div class="c2__win">
                <img src="${SHOT}" alt="${esc(N)}">
                <span class="c2__veil" aria-hidden="true"></span>
                <span class="c2__tag">${esc(N)}</span>
              </div>
              <div class="c2__people">
                ${people('c2')}
              </div>
            </div>
            <form class="c2__form">
              <p class="plaque">Ask about her</p>
              <h2 class="c2__h">Write to us about <em>${esc(N)}</em></h2>
              ${fields('c2')}
              <button type="submit" class="btn btn-gold btn-pill">Send it <span class="a" aria-hidden="true">&rarr;</span></button>
            </form>
          </div>
        </div>
      </section>`,
  },
  {
    id: 'c3', title: 'One quiet column',
    note: 'Nothing beside it and nothing behind it: a narrow column on the page ground, the form in the middle of it, and the four ways to reach them as one line underneath. The lightest of the six, and the one that reads best at the end of a long page where the eye is tired.',
    html: () => `
      <section class="c3">
        <div class="c3__in">
          <p class="plaque">Ask about her</p>
          <h2 class="c3__h">What would you like to know about <em>${esc(N)}</em>?</h2>
          <p class="c3__lead">Her family, what the line has produced, or what it takes to bring her home. We answer plainly.</p>
          <form class="c3__form">
            ${fields('c3')}
            <button type="submit" class="btn btn-gold btn-pill">Send it <span class="a" aria-hidden="true">&rarr;</span></button>
          </form>
          <div class="c3__people">
            ${people('c3')}
          </div>
        </div>
      </section>`,
  },
  {
    id: 'c4', title: 'The two of them, first',
    note: 'Elisabetta and Adriano are the reason the site says no agent and no auction ring, so they go first and at full size, each with their own number. The form sits under them across the whole width. It is the warmest of the six and the one that makes the smallest promise about a reply time.',
    html: () => `
      <section class="c4">
        <div class="wrap">
          <div class="c4__plate">
            <div class="c4__head">
              <p class="plaque">Ask about her</p>
              <h2 class="c4__h">Two people, <em>one answer</em></h2>
            </div>
            <div class="c4__cards">
              <a class="c4__card" href="tel:+393495918565">
                <span class="c4__init" aria-hidden="true">E</span>
                <span class="c4__cn">Elisabetta</span>
                <span class="c4__cv">+39 349 591 8565</span>
              </a>
              <a class="c4__card" href="tel:+393483953433">
                <span class="c4__init" aria-hidden="true">A</span>
                <span class="c4__cn">Adriano</span>
                <span class="c4__cv">+39 348 395 3433</span>
              </a>
              <a class="c4__card c4__card--wa" href="${WA}" target="_blank" rel="noopener">
                <span class="c4__init" aria-hidden="true">&#9993;</span>
                <span class="c4__cn">WhatsApp</span>
                <span class="c4__cv">Fastest reply</span>
              </a>
            </div>
            <form class="c4__form">
              ${fields('c4')}
              <button type="submit" class="btn btn-gold btn-pill">Send it <span class="a" aria-hidden="true">&rarr;</span></button>
            </form>
          </div>
        </div>
      </section>`,
  },
  {
    id: 'c5', title: 'On her photograph',
    note: 'Her picture runs the full width with the navy veil over it, and the form sits on a plate on top, the way the hero hands over to the tray. The most striking of the six and the heaviest: it asks for a photograph wide enough to survive the crop, which ten of the sixty do not have.',
    html: () => `
      <section class="c5">
        <div class="c5__bg" aria-hidden="true"><img src="${SHOT2}" alt=""></div>
        <span class="c5__veil" aria-hidden="true"></span>
        <div class="wrap c5__in">
          <div class="c5__type">
            <p class="plaque">Ask about her</p>
            <h2 class="c5__h">Interested in <em>${esc(N)}</em>?</h2>
            <p class="c5__lead">Ask us anything about the family behind her, what the line has produced,
            or what it takes to bring her home.</p>
            <div class="c5__people">
              ${people('c5')}
            </div>
          </div>
          <form class="c5__form">
            ${fields('c5', { stacked: true })}
            <button type="submit" class="btn btn-gold btn-pill">Send it <span class="a" aria-hidden="true">&rarr;</span></button>
          </form>
        </div>
      </section>`,
  },
  {
    id: 'c6', title: 'The sentence',
    note: 'The form written as the message itself: the fields sit inside a sentence, so filling it in reads as writing rather than as completing a record. Their own words are "honesty and absolute transparency", and this is the shape that sounds least like a form. The riskiest of the six, and the one that would be theirs alone.',
    html: () => `
      <section class="c6">
        <div class="wrap">
          <div class="c6__plate">
            <p class="plaque">Ask about her</p>
            <form class="c6__form">
              <input type="hidden" name="horse" value="${esc(N)}">
              <p class="c6__say">
                Hello, my name is
                <span class="c6__f"><label class="visually-hidden" for="c6-name">Your name</label>
                  <input id="c6-name" name="name" type="text" required autocomplete="name" size="14" placeholder="your name"></span>
                and I would like to know more about
                <span class="c6__f c6__f--horse"><label class="visually-hidden" for="c6-about">About</label>
                  <input id="c6-about" name="about" type="text" size="20" value="${esc(N)}"></span>.
                You can reach me at
                <span class="c6__f"><label class="visually-hidden" for="c6-email">Email</label>
                  <input id="c6-email" name="email" type="email" required autocomplete="email" size="20" placeholder="you@example.com"></span>
                or on
                <span class="c6__f"><label class="visually-hidden" for="c6-tel">Telephone</label>
                  <input id="c6-tel" name="tel" type="tel" autocomplete="tel" size="14" placeholder="+39 …"></span>.
              </p>
              <div class="c6__row">
                <label for="c6-msg">Anything else you want to tell us</label>
                <textarea id="c6-msg" name="message" rows="3" placeholder="Optional."></textarea>
              </div>
              <div class="c6__foot">
                <button type="submit" class="btn btn-gold btn-pill">Send it <span class="a" aria-hidden="true">&rarr;</span></button>
                <div class="c6__people">
                  ${people('c6')}
                </div>
              </div>
            </form>
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
    border-bottom:1px solid var(--color-line); padding:clamp(2rem,4vw,3.2rem) 0; }
  .d-warn{ width:min(var(--wrap), 100% - (2*var(--gutter))); margin:1.4rem auto 0;
    padding:1rem 1.2rem; border-radius:var(--plate-radius);
    background:color-mix(in srgb, var(--color-gold) 14%, var(--color-base));
    border:1px solid color-mix(in srgb, var(--color-gold) 40%, transparent);
    font-size:14.5px; line-height:1.6; color:var(--color-ink); }
  .d-warn b{ font-weight:700; }

  /* ── the fields, shared by all six ─────────────────────────────────────
     One set of rules so the six differ in shape and never in the parts. */
  .cf__pair{ display:grid; gap:1rem; }
  @media (min-width:620px){ .cf__pair:not(.is-stacked){ grid-template-columns:1fr 1fr; } }
  .cf__row{ display:flex; flex-direction:column; gap:.4rem; margin-bottom:1rem; }
  .cf__row label, .c6__row label{
    font-family:var(--font-body); font-weight:700; font-size:10px; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-gold);
  }
  .cf__opt{ font-weight:400; letter-spacing:.06em; text-transform:none; opacity:.75; }
  .cf__row input, .cf__row textarea, .c6__row textarea{
    width:100%; font-family:var(--font-body); font-size:15px; color:var(--color-ink);
    background:var(--color-base); border:1px solid var(--color-line);
    border-radius:var(--ctl-radius); padding:.7rem .85rem;
    transition:border-color .3s var(--ease);
  }
  .cf__row input:focus, .cf__row textarea:focus, .c6__row textarea:focus{
    outline:none; border-color:var(--color-gold);
  }
  .cf__row textarea, .c6__row textarea{ resize:vertical; line-height:1.55; }
  /* On a navy plate the fields have to invert or they are ivory boxes on navy. */
  .c4__form .cf__row input, .c4__form .cf__row textarea{
    background:rgba(255,255,255,.06); border-color:var(--color-line-invert); color:var(--color-white);
  }
  .c4__form .cf__row input::placeholder, .c4__form .cf__row textarea::placeholder{ color:rgba(255,255,255,.42); }
  .c4__form .cf__row label{ color:var(--color-gold); }

  /* the four ways to reach them, in two shapes */
  .c1__p, .c2__p, .c3__p, .c5__p, .c6__p{ display:flex; flex-direction:column; gap:.15rem;
    padding:.7rem 0; border-top:1px solid var(--color-line-invert); }
  .c1__pk, .c2__pk, .c3__pk, .c5__pk, .c6__pk{ font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); }
  .c1__pv, .c2__pv, .c3__pv, .c5__pv, .c6__pv{ font-family:var(--font-display); font-size:1rem; }

  /* ── one: the split plate ── */
  .c1__box{ display:grid; border-radius:var(--plate-radius); overflow:hidden;
    box-shadow:0 34px 76px -46px rgba(var(--veil-rgb),.55); }
  @media (min-width:900px){ .c1__box{ grid-template-columns:.85fr 1.15fr; } }
  .c1__side{ display:flex; flex-direction:column; justify-content:space-between; gap:2rem;
    padding:clamp(1.6rem,3vw,2.4rem); background:var(--color-navy-deep); }
  .c1__h{ margin:.5rem 0 .6rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw+.8rem,2rem); line-height:1.06; color:var(--color-white); }
  .c1__h em{ font-style:italic; color:var(--color-gold); }
  .c1__lead{ margin:0; font-size:15px; line-height:1.6; color:rgba(255,255,255,.74); max-width:38ch; }
  .c1__people{ display:grid; }
  .c1__pv{ color:var(--color-white); }
  .c1__form{ padding:clamp(1.6rem,3vw,2.4rem); background:var(--color-base); }

  /* ── two: her picture beside the form ── */
  .c2__grid{ display:grid; gap:clamp(1.6rem,3.4vw,2.8rem); align-items:start; }
  @media (min-width:900px){ .c2__grid{ grid-template-columns:.8fr 1.2fr; } }
  .c2__col{ min-width:0; }
  .c2__win{ position:relative; border-radius:var(--plate-radius); overflow:hidden; aspect-ratio:4/5;
    box-shadow:0 30px 60px -46px rgba(var(--veil-rgb),.55); }
  .c2__win img{ width:100%; height:100%; object-fit:cover; display:block; }
  .c2__veil{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(var(--veil-rgb),0) 55%, rgba(var(--veil-rgb),.72) 100%); }
  .c2__tag{ position:absolute; left:14px; bottom:14px; padding:.34em .85em; border-radius:var(--ctl-radius);
    background:var(--color-gold); color:var(--color-navy); font-family:var(--font-body); font-weight:700;
    font-size:10px; letter-spacing:.14em; text-transform:uppercase; }
  .c2__people{ display:grid; margin-top:1.2rem; }
  .c2__p{ border-top-color:var(--color-line); }
  .c2__pv{ color:var(--color-ink); }
  .c2__h{ margin:.5rem 0 1.4rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw+.8rem,2rem); line-height:1.06; color:var(--color-ink); }
  .c2__h em{ font-style:italic; color:var(--color-gold); }

  /* ── three: one quiet column ── */
  .c3__in{ width:min(680px, 100% - (2*var(--gutter))); margin:0 auto; text-align:center; }
  .c3__h{ margin:.5rem 0 .6rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw+.8rem,2.1rem); line-height:1.08; color:var(--color-ink); }
  .c3__h em{ font-style:italic; color:var(--color-gold); }
  .c3__lead{ margin:0 auto 1.8rem; max-width:48ch; font-size:16px; line-height:1.6; color:var(--color-ink-soft); }
  .c3__form{ text-align:left; }
  .c3__people{ display:flex; flex-wrap:wrap; justify-content:center; gap:.2rem 2rem; margin-top:1.8rem;
    padding-top:1.4rem; border-top:1px solid var(--color-line); }
  .c3__p{ border-top:0; padding:.3rem 0; align-items:center; }
  .c3__pv{ color:var(--color-ink); font-size:.95rem; }

  /* ── four: the two of them first ── */
  .c4__plate{ padding:clamp(1.6rem,3vw,2.4rem); border-radius:var(--plate-radius);
    background:var(--color-navy-deep); }
  .c4__head{ margin-bottom:clamp(1.2rem,2.4vw,1.8rem); }
  .c4__h{ margin:.4rem 0 0; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw+.8rem,2rem); line-height:1.05; color:var(--color-white); }
  .c4__h em{ font-style:italic; color:var(--color-gold); }
  .c4__cards{ display:grid; gap:.8rem; margin-bottom:clamp(1.4rem,2.6vw,2rem); }
  @media (min-width:760px){ .c4__cards{ grid-template-columns:repeat(3,1fr); } }
  .c4__card{ display:grid; gap:.2rem; padding:1.1rem 1.2rem; border-radius:var(--card-radius);
    background:rgba(255,255,255,.055); border:1px solid var(--color-line-invert);
    transition:background .3s var(--ease), border-color .3s var(--ease); }
  .c4__card:hover{ background:rgba(255,255,255,.1); border-color:var(--color-gold); }
  .c4__init{ display:grid; place-items:center; width:34px; height:34px; border-radius:50%;
    background:var(--color-gold); color:var(--color-navy); margin-bottom:.5rem;
    font-family:var(--font-display); font-size:1rem; }
  .c4__cn{ font-family:var(--font-display); font-size:1.15rem; color:var(--color-white); }
  .c4__cv{ font-family:var(--font-body); font-size:13.5px; color:rgba(255,255,255,.7); }

  /* ── five: on her photograph ── */
  .c5{ position:relative; isolation:isolate; overflow:hidden; border-radius:var(--plate-radius);
    width:min(var(--wrap), 100% - (2*var(--gutter))); margin-inline:auto; }
  .c5__bg{ position:absolute; inset:0; z-index:0; }
  .c5__bg img{ width:100%; height:100%; object-fit:cover; display:block; }
  .c5__veil{ position:absolute; inset:0; z-index:1;
    background:linear-gradient(100deg, rgba(var(--veil-rgb),.94) 0%, rgba(var(--veil-rgb),.86) 42%,
      rgba(var(--veil-rgb),.62) 100%); }
  .c5__in{ position:relative; z-index:2; display:grid; gap:clamp(1.6rem,3.4vw,2.8rem);
    padding-block:clamp(2rem,4vw,3.2rem); align-items:start; }
  @media (min-width:900px){ .c5__in{ grid-template-columns:1fr 1fr; } }
  .c5__h{ margin:.5rem 0 .6rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.6rem,2vw+.8rem,2.3rem); line-height:1.05; color:var(--color-white); }
  .c5__h em{ font-style:italic; color:var(--color-gold); }
  .c5__lead{ margin:0 0 1.4rem; font-size:15.5px; line-height:1.65; color:rgba(255,255,255,.78); max-width:42ch; }
  .c5__people{ display:grid; }
  .c5__pv{ color:var(--color-white); }
  .c5__form{ padding:clamp(1.3rem,2.4vw,1.8rem); border-radius:var(--plate-radius);
    background:var(--color-base); box-shadow:0 30px 60px -40px rgba(var(--veil-rgb),.7); }

  /* ── six: the sentence ── */
  .c6__plate{ padding:clamp(1.6rem,3vw,2.4rem); border-radius:var(--plate-radius);
    background:var(--color-base-alt); }
  .c6__say{ margin:.6rem 0 1.6rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.2rem,1.1vw+.9rem,1.6rem); line-height:2.1; color:var(--color-ink); max-width:60ch; }
  .c6__f{ display:inline-block; }
  .c6__f input{
    font-family:var(--font-display); font-size:inherit; color:var(--color-navy);
    background:transparent; border:0; border-bottom:1px solid var(--color-gold);
    padding:0 .3rem .1rem; text-align:center;
    transition:background .3s var(--ease);
  }
  .c6__f input::placeholder{ color:var(--color-ink-soft); font-style:italic; opacity:.7; }
  .c6__f input:focus{ outline:none; background:color-mix(in srgb, var(--color-gold) 16%, transparent); }
  .c6__f--horse input{ color:var(--color-navy); font-style:italic; }
  .c6__row{ display:flex; flex-direction:column; gap:.4rem; max-width:52ch; }
  .c6__foot{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between;
    gap:1.4rem; margin-top:1.6rem; padding-top:1.4rem; border-top:1px solid var(--color-line); }
  .c6__people{ display:flex; flex-wrap:wrap; gap:.2rem 1.8rem; }
  .c6__p{ border-top:0; padding:0; }
  .c6__pv{ color:var(--color-ink); font-size:.95rem; }
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="internal-doc" content="true">
<meta name="robots" content="noindex, nofollow">
<title>A contact section on every horse, six ways | Stud Von Axe</title>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${homeCss}${CSS}</style>
</head>
<body>

<header class="d-head">
  <p class="d-num">For Mark, to choose from</p>
  <h1>Asking about <em>one horse</em>, six ways</h1>
  <p>Every single page except the news gets its own contact section: the form, the four ways to reach
  them, and the name of the horse already filled in. The "Ask about this…" buttons stop sending people
  back to the homepage and land here instead.</p>
  <p>All six on ${esc(N)}, and all six carry exactly the same parts, so the choice is only about the
  shape. The name is in a field the visitor can still edit, because someone writing about two horses
  should not have to fight it.</p>
</header>

<div class="d-warn">
  <b>One thing to decide before this goes live.</b> The form on the homepage does not send anything
  today: it stops the submit and shows a thank you. Sixty pages of a form that quietly throws the
  message away is sixty broken promises, so it needs somewhere to go. Three ways, cheapest first:
  a <b>mailto:</b> link that opens the visitor's own mail app with everything filled in, no account and
  no cost, but it fails on a phone without a mail app configured; a <b>form service</b> such as
  Formspree or Web3Forms, a free tier and five minutes of setup, which mails it to studvonaxe@gmail.com;
  or a small <b>function on Vercel</b> with a mail provider behind it, which is the tidiest and needs an
  account and an API key. Say which and it is wired into whichever of the six you pick.
</div>

<main>
${VARIANTS.map((v, i) => `
<section class="d-sec" id="${v.id}">
  <div class="d-lab">
    <p class="d-num">Variation ${['one','two','three','four','five','six'][i]}</p>
    <h2>${esc(v.title)}</h2>
    <p class="d-note">${esc(v.note)}</p>
  </div>
  <div class="d-frame">${v.html()}</div>
</section>`).join('\n')}
</main>

<footer class="d-head" style="padding-bottom:4rem">
  <p style="font-size:14px">Say a number and it goes on all sixty single pages, with the buttons
  pointed at it.</p>
</footer>

</body>
</html>
`;

writeFileSync(join(root, '07-horse-contact.html'), html);
console.log(`built 07-horse-contact.html with ${VARIANTS.length} variations`);
