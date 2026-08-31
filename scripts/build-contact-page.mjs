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

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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

  /* ── the two places ───────────────────────────────────────────────── */
  .pl{ padding-block:0 var(--sec-full); }
  .pl__head{ max-width:52ch; margin-bottom:clamp(1.6rem,3vw,2.4rem); }
  .pl__h{
    margin:.5rem 0 .6rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.6rem,2vw + .8rem,2.2rem); line-height:1.06; color:var(--color-ink);
  }
  .pl__h em{ font-style:italic; color:var(--color-gold); }
  .pl__intro{ margin:0; font-size:16px; line-height:1.7; color:var(--color-ink-soft); }
  .pl__grid{ display:grid; gap:clamp(1rem,2vw,1.4rem); }
  @media (min-width:820px){ .pl__grid{ grid-template-columns:1fr 1fr; } }
  .pl__card{
    display:grid; grid-template-rows:auto 1fr; overflow:hidden;
    border-radius:var(--plate-radius); background:var(--color-base);
    border:1px solid var(--color-line);
    box-shadow:0 26px 60px -44px rgba(var(--veil-rgb),.5);
  }
  /* The map's own frame. It holds the invitation before the map arrives and
     the map itself after, at the same size either way, so nothing on the page
     jumps when somebody presses the button. */
  .pl__map{ position:relative; aspect-ratio:16/10; background:var(--color-navy-deep); }
  .pl__map iframe{ width:100%; height:100%; border:0; display:block; }
  .pl__ask{
    position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:flex-start; justify-content:flex-end; gap:.5rem;
    padding:clamp(1.1rem,2vw,1.5rem);
  }
  .pl__askT{
    margin:0; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold);
  }
  .pl__askD{ margin:0 0 .5rem; font-size:13px; line-height:1.55;
    color:rgba(255,255,255,.7); max-width:34ch; }
  .pl__body{ padding:clamp(1.2rem,2.2vw,1.7rem); display:grid; align-content:start; gap:.1rem; }
  .pl__kick{
    margin:0 0 .35rem; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold);
  }
  .pl__name{ margin:0 0 .5rem; font-family:var(--font-display); font-weight:400;
    font-size:1.35rem; line-height:1.15; color:var(--color-ink); }
  .pl__addr{ font-style:normal; font-size:15px; line-height:1.65; color:var(--color-ink); }
  /* A gap in what we were given, said out loud rather than pinned somewhere
     approximate. Same treatment as the blocks on the terms page. */
  .pl__note{
    margin:.9rem 0 0; padding:.7rem .85rem; border-radius:var(--ctl-radius);
    background:color-mix(in srgb, var(--color-gold) 14%, var(--color-base));
    box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 45%, transparent);
    font-family:var(--font-body); font-size:13px; line-height:1.6; color:var(--color-navy);
  }
  .pl__go{
    margin-top:1rem; justify-self:start;
    font-family:var(--font-body); font-weight:700; font-size:11px; letter-spacing:.16em;
    text-transform:uppercase; color:var(--color-navy);
    border-bottom:1px solid var(--color-line); padding-bottom:2px;
    transition:border-color .3s var(--ease), color .3s var(--ease);
  }
  .pl__go:hover{ color:var(--color-gold); border-color:var(--color-gold); }
  .pl__go .a{ color:var(--color-gold); font-size:.9em; }

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

/* ── the two places, with a map each ───────────────────────────────────
   Asked for on 31 Aug: both locations under the form, with Google Maps and
   the address.

   The map does not load until somebody asks for it. An embedded Google map
   fetches from Google the moment the page opens and hands over the visitor's
   IP address whether they wanted a map or not, and /privacy says on this same
   site that nothing on a page comes from anywhere but our own server. So each
   map is a plate with the address on it and a button; press it and the map
   arrives in place. The address, the postcode and a link that opens Google
   Maps in a new tab are all there without loading anything, which is what most
   people came for anyway.

   What is real here and what is not: the Italian address is the registered
   company, word for word as Mark sent it. Lanaken is a town and nothing more,
   because no street address for the Belgian yard has ever been given, and a
   pin dropped on a town centre is not where their stable is. It says so
   rather than guessing. */
const PLACES = [
  {
    kick: 'Italy',
    name: 'Castelnuovo Garfagnana',
    lines: ['Stud Von Axe Az. Agr. s.s.', 'Via per Arni 30', '55032 Castelnuovo Garfagnana (LU)', 'Italy'],
    /* Their own footer and the company register both say Castelnuovo
       Garfagnana; the briefing this site was written from says Desenzano del
       Garda, which is two hundred kilometres away and is named in ninety two
       places here, including the footer of this very page. Both cannot be
       where you drive to, and it is question one on the checklist.
       What the visitor is told is the useful half of that: ring first. A
       buyer does not need to hear that our own pages disagree with each
       other, and telling them so is not honesty, it is noise. */
    note: 'This is the registered address. Ring us before you set off and we will tell you where the horse you want to see is standing.',
    q: 'Via per Arni 30, 55032 Castelnuovo Garfagnana LU, Italy',
  },
  {
    kick: 'Belgium',
    name: 'Lanaken',
    lines: ['Lanaken', 'Belgium'],
    note: 'The map shows the town. Ring us for the gate and we will send you the pin.',
    q: 'Lanaken, Belgium',
  },
];

const placesSection = `
  <section class="pl" id="places">
    <div class="wrap">
      <div class="pl__head">
        <p class="plaque">Where we are</p>
        <h2 class="pl__h">Two countries, <em>one programme</em></h2>
        <p class="pl__intro">Every cross begins in Italy and every foal is raised in Belgium. You are
        welcome at either, by appointment.</p>
      </div>
      <div class="pl__grid">
${PLACES.map((pl) => `        <div class="pl__card">
          <div class="pl__map" data-map="${esc(`https://www.google.com/maps?q=${encodeURIComponent(pl.q)}&output=embed`)}">
            <div class="pl__ask">
              <p class="pl__askT">Google Maps</p>
              <p class="pl__askD">The map is not loaded until you ask for it, because loading it hands
              your IP address to Google.</p>
              <button class="btn btn-gold btn-pill btn-sm" type="button" data-load>Show the map</button>
            </div>
          </div>
          <div class="pl__body">
            <p class="pl__kick">${esc(pl.kick)}</p>
            <h3 class="pl__name">${esc(pl.name)}</h3>
            <address class="pl__addr">${pl.lines.map(esc).join('<br>')}</address>
            ${pl.note ? `<p class="pl__note">${esc(pl.note)}</p>` : ''}
            <a class="pl__go" href="https://www.google.com/maps/search/?api=1&amp;query=${esc(encodeURIComponent(pl.q))}"
               target="_blank" rel="noopener">Open in Google Maps <span class="a" aria-hidden="true">&#8599;</span></a>
          </div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>
`;

const placesScript = `<script>
(function(){
  var maps = [].slice.call(document.querySelectorAll('[data-map]'));
  maps.forEach(function(box){
    var btn = box.querySelector('[data-load]');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-map');
      f.title = 'Map';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      box.innerHTML = '';
      box.appendChild(f);
    });
  });
})();
<\/script>`;

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
      <!-- The stable wall, not a close up of a neck. 31 Aug: the old one was a
           slab of brown with the head cut off at the edge, and it was the same
           plaited horse the ICSI archive already carries. A contact page wants
           the place, and this is their own header photograph of it. -->
      <img src="/assets/img/hero-contact.jpg" alt="" fetchpriority="high" width="1420" height="634"
           style="object-position:50% 34%">
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
          <!-- Not the same line as the heading over the maps further down.
               One page saying "Two countries, one programme" twice reads as a
               page that lost its place. -->
          <div class="cn__places">
            <div class="cn__place">
              <span class="cn__pk">The two places</span>
              <span class="cn__pv">Italy and Belgium</span>
              <span class="cn__pd">On the map below</span>
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

${placesSection}

</main>
${footer}
${navScript}
${askScript}
${placesScript}
</body>
</html>
`;

mkdirSync(join(root, 'contact'), { recursive: true });
writeFileSync(join(root, 'contact', 'index.html'), page);
console.log('built contact/index.html');
