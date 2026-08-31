#!/usr/bin/env node
/* Build contact/index.html, the seventh page on the owners' list of 29 August.
 *
 * Everything on it already existed and was scattered: the two people were only
 * on the homepage, the form only on the sixty horse pages, and the two places
 * only in a sentence on the about page. Nothing here is new copy except the
 * opening line, which says what happens when you write rather than why you
 * should trust them — the rule settled on 30 August.
 *
 * Run: node scripts/build-contact-page.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, pageHeroCss, header, footer, head, navScript, askScript, headerFor } from './lib/shell.mjs';

const CSS = homeCss + pageHeroCss + `
  /* ── contact page only. Everything above is the homepage stylesheet. ── */
  .nhero > .wrap{ padding-top:clamp(6rem,13vh,8rem); }
  .cnhero .nhero__bg img{ object-position:50% 40%; }

  .cn{ padding-block:var(--sec-half); }

  /* The three ways to reach them, at full size and first, because they are
     the answer for most visitors: nobody fills in a form to ask a question
     they could put in a WhatsApp message. */
  .cn__ways{ display:grid; gap:clamp(.8rem,1.6vw,1.1rem); margin-bottom:clamp(2rem,4vw,3rem); }
  @media (min-width:760px){ .cn__ways{ grid-template-columns:repeat(3,1fr); } }
  .cn__way{
    display:grid; gap:.2rem; padding:clamp(1.2rem,2.2vw,1.6rem);
    border-radius:var(--card-radius); background:var(--color-navy-deep);
    border:1px solid var(--color-line-invert);
    transition:border-color .3s var(--ease), transform .35s var(--ease);
  }
  .cn__way:hover{ border-color:var(--color-gold); transform:translateY(-2px); }
  .cn__init{
    display:grid; place-items:center; width:38px; height:38px; border-radius:50%;
    background:var(--color-gold); color:var(--color-navy); margin-bottom:.7rem;
    font-family:var(--font-display); font-size:1.05rem;
  }
  .cn__wn{ font-family:var(--font-display); font-size:1.25rem; color:var(--color-white); }
  .cn__wv{ font-family:var(--font-body); font-size:14px; color:rgba(255,255,255,.72); }
  .cn__wk{
    font-family:var(--font-body); font-weight:700; font-size:9.5px; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-gold); margin-top:.5rem;
  }

  /* The form, the same split plate the sixty horse pages carry, minus the
     About field: on a horse page it names the horse, here there is none. */
  .cn__box{ display:grid; border-radius:var(--plate-radius); overflow:hidden;
    box-shadow:0 34px 76px -46px rgba(var(--veil-rgb),.55); }
  @media (min-width:900px){ .cn__box{ grid-template-columns:.85fr 1.15fr; } }
  .cn__side{ display:flex; flex-direction:column; justify-content:space-between; gap:2rem;
    padding:clamp(1.6rem,3vw,2.4rem); background:var(--color-navy-deep); }
  .cn__h{ margin:.5rem 0 .6rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.5rem,1.8vw + .8rem,2rem); line-height:1.06; color:var(--color-white); }
  .cn__h em{ font-style:italic; color:var(--color-gold); }
  .cn__lead{ margin:0; font-size:15px; line-height:1.6; color:rgba(255,255,255,.74); max-width:38ch; }
  .cn__places{ display:grid; gap:.9rem; }
  .cn__place{ display:grid; gap:.1rem; padding-top:.9rem; border-top:1px solid var(--color-line-invert); }
  .cn__pk{ font-family:var(--font-body); font-weight:700; font-size:10px; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-gold); }
  .cn__pv{ font-family:var(--font-display); font-size:1.05rem; color:var(--color-white); }
  .cn__pd{ font-family:var(--font-body); font-size:13px; color:rgba(255,255,255,.6); }
`;

const WAYS = [
  ['W', 'WhatsApp', 'Fastest reply', 'Message us', 'https://wa.me/393495918565'],
  ['E', 'Elisabetta', '+39 349 591 8565', 'Call or message', 'tel:+393495918565'],
  ['A', 'Adriano', '+39 348 395 3433', 'Call or message', 'tel:+393483953433'],
];

const page = `<!DOCTYPE html>
<html lang="en">
<head>
${head({
  title: 'Contact',
  desc: 'Write to Stud Von Axe. Elisabetta and Adriano answer themselves, from Desenzano del Garda in Italy and Lanaken in Belgium.',
  path: '/contact',
  image: 'hero-neck-wide.jpg',
  ldType: 'ContactPage',
  ldExtra: { publisher: { '@type': 'Organization', name: 'Stud Von Axe' } },
})}
<style>${CSS}</style>
</head>
<body>
${headerFor('/contact')}

<main id="main">

  <section class="nhero cnhero">
    <div class="nhero__bg" aria-hidden="true">
      <img src="/assets/img/hero-neck-wide.jpg" alt="" fetchpriority="high">
    </div>
    <div class="nhero__veil" aria-hidden="true"></div>
    <div class="wrap">
      <div class="nhero__grid">
        <div>
          <p class="plaque">Contact</p>
          <h1 class="arch__h">Write to us <em>directly</em></h1>
        </div>
        <p class="arch__intro">There is nobody in between. Elisabetta and Adriano read what comes
        in and one of them answers.</p>
      </div>
    </div>
  </section>

  <section class="cn">
    <div class="wrap">
      <div class="cn__ways">
${WAYS.map(([i, name, value, action, href]) => `        <a class="cn__way" href="${href}"${/^https/.test(href) ? ' target="_blank" rel="noopener"' : ''}>
          <span class="cn__init" aria-hidden="true">${i}</span>
          <span class="cn__wn">${name}</span>
          <span class="cn__wv">${value}</span>
          <span class="cn__wk">${action}</span>
        </a>`).join('\n')}
      </div>

      <div class="cn__box">
        <div class="cn__side">
          <div>
            <p class="plaque">By mail</p>
            <h2 class="cn__h">Tell us what you are <em>looking for</em></h2>
            <p class="cn__lead">Write to us and we will get back to you. If you would rather write
            yourself, we are at <a href="mailto:studvonaxe@gmail.com" style="color:var(--color-gold)">studvonaxe@gmail.com</a>.</p>
          </div>
          <div class="cn__places">
            <div class="cn__place">
              <span class="cn__pk">Where the crosses are made</span>
              <span class="cn__pv">Desenzano del Garda</span>
              <span class="cn__pd">Italy</span>
            </div>
            <div class="cn__place">
              <span class="cn__pk">Where the foals are raised</span>
              <span class="cn__pv">Lanaken</span>
              <span class="cn__pd">Belgium</span>
            </div>
          </div>
        </div>
        <form class="ask__form" data-horse="">
          <div class="ask__pair">
            <div class="ask__row">
              <label for="cn-name">Your name</label>
              <input id="cn-name" name="name" type="text" required autocomplete="name" placeholder="Name">
            </div>
            <div class="ask__row">
              <label for="cn-email">Email</label>
              <input id="cn-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
            </div>
          </div>
          <div class="ask__pair">
            <div class="ask__row">
              <label for="cn-tel">Telephone <span class="ask__opt">optional</span></label>
              <input id="cn-tel" name="tel" type="tel" autocomplete="tel" placeholder="+39 …">
            </div>
            <div class="ask__row">
              <label for="cn-about">What about</label>
              <select id="cn-about" name="about" required>
                <option value="" selected>Choose one</option>
                <option>A foal</option>
                <option>An embryo</option>
                <option>A breeding mare</option>
                <option>A sport horse</option>
                <option>ICSI semen</option>
                <option>Something else</option>
              </select>
            </div>
          </div>
          <div class="ask__row">
            <label for="cn-msg">Your message</label>
            <textarea id="cn-msg" name="message" rows="4" required
              placeholder="What are you looking for?"></textarea>
          </div>
          <button type="submit" class="btn btn-gold btn-pill">Send it <span class="a" aria-hidden="true">&rarr;</span></button>
          <p class="ask__note" role="status"></p>
        </form>
      </div>
    </div>
  </section>

</main>
${footer}
${navScript}
${askScript}
</body>
</html>
`;

mkdirSync(join(root, 'contact'), { recursive: true });
writeFileSync(join(root, 'contact', 'index.html'), page);
console.log('built contact/index.html');
