#!/usr/bin/env node
/* Build the about page.
 *
 * Generated rather than hand written, for the same reason the news pages are:
 * it wears the homepage's stylesheet, header and footer, lifted verbatim at
 * build time by lib/shell.mjs. Edit index.html and rerun:
 *   node scripts/build-about.mjs
 *
 * Every fact on this page is theirs. The motto and the passion line are from
 * their own site; the German farms, the research into families, the split
 * between Desenzano and Lanaken and the direct sale are the sentences already
 * agreed on the homepage. Nothing new is claimed here.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, homeCss, pageHeroCss, storyCss, header, footer, head, navScript } from './lib/shell.mjs';

const CSS = homeCss + pageHeroCss + storyCss + `
  /* ── about page only. Everything above is the homepage stylesheet. ── */

  /* The hero starts at the very top and the header hangs over it, so the
     type has to clear the bar. Same figure as the news pages. */
  .nhero > .wrap{ padding-top:clamp(6rem,13vh,8rem); }
  /* The hero is a wide strip, so only a wide photograph survives it. The
     first two tried here were nearly square and the crop left a band of
     neck and nothing else. This one is 2.25:1 from their own old homepage,
     the horse to the right and green behind the type on the left, so it
     needs almost no crop at all. */
  .abhero .nhero__bg img{ object-position:50% 46%; }

  /* The story block (.abst) lives in lib/shell.mjs: the horse pages wear
     the same one. */
  /* ---- the picture, fading between three ----
     One frame, three photographs stacked in it, crossfading. A frame with
     a ratio rather than a picture on its own proportions, because three
     pictures of different shapes in one box would make the column jump
     every five seconds. Stacked in a grid cell so nothing is positioned
     absolutely and the box is sized by the artwork.
     It pauses on hover and on focus, and it does not run at all for a
     visitor who has asked for less motion. */
  .abfade{
    position:relative;
    display:grid; border-radius:var(--plate-radius); overflow:hidden;
    aspect-ratio:3 / 4; background:var(--color-navy-deep);
    box-shadow:0 30px 60px -46px rgba(var(--veil-rgb), .55);
  }
  .abfade img{
    grid-area:1 / 1; width:100%; height:100%; object-fit:cover;
    opacity:0; transition:opacity 1.1s var(--ease);
  }
  .abfade img.is-on{ opacity:1; }
  /* Three hairlines, not dots: the page already draws a rule under the
     places, and this is the same line doing a second job. */
  /* Absolutely placed, not a grid item: as a third child in the stack it
     opened a second row that the aspect ratio had no height for, and the
     hairlines rendered 70px below the frame, where overflow:hidden ate
     them. Measured in the browser; they were simply not there. */
  .abfade__dots{
    position:absolute; left:1.1rem; bottom:1.1rem; z-index:2;
    display:flex; gap:.45rem;
  }
  .abfade__dot{
    width:26px; height:2px; padding:0; border:none; border-radius:999px;
    background:rgba(255,255,255,.55); cursor:pointer;
    /* A hairline on a photograph is only as readable as what is behind it:
       this one sits on a pale sand floor in the first shot. */
    box-shadow:0 0 6px rgba(var(--veil-rgb), .55);
    transition:background .35s var(--ease), width .35s var(--ease);
  }
  .abfade__dot[aria-current="true"]{ background:var(--color-gold); width:38px; }
  @media (prefers-reduced-motion: reduce){
    .abfade img{ transition:none; }
  }
  /* ---- the two places ----
     Named as places, never as yards: Lanaken is where the programme runs,
     not a second address on a sign. Two countries, one programme. */
  .abpl{ display:grid; gap:.9rem; margin-top:1.6rem; padding-top:1.4rem; border-top:1px solid var(--color-line); }
  @media (min-width:560px){ .abpl{ grid-template-columns:1fr 1fr; gap:1.6rem; } }
  .abpl__k{
    display:block; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.35rem;
  }
  .abpl__v{ display:block; font-family:var(--font-display); font-weight:400; font-size:1.1rem; color:var(--color-ink); }
  .abpl__d{ display:block; margin-top:.15rem; font-size:14px; color:var(--color-ink-soft); }

  /* ---- what we offer: four photographs, four ways in ----
     Hairlines were too quiet for a section this important, so this is the
     page's own plate recipe at card size: photograph under a foot gradient,
     type standing on it. Two things keep it from being another card grid.
     The row is stepped, the even cards dropping by a fixed amount, which is
     the same trick the invitation plays on the homepage: it breaks the run
     rather than lining four boxes up like a table. And the whole card is
     the link, so there is no button to hunt for. */
  .aboff{ padding-bottom:clamp(2.8rem,6vw,4.6rem); }
  .aboff__grid{ display:grid; gap:1.1rem; margin-top:1.9rem; }
  @media (min-width:600px){ .aboff__grid{ grid-template-columns:1fr 1fr; gap:1.2rem; } }
  @media (min-width:1000px){
    .aboff__grid{ grid-template-columns:repeat(4, 1fr); gap:clamp(1rem,1.6vw,1.4rem); }
  }
  .aboff__i{
    position:relative; isolation:isolate; overflow:hidden; min-width:0;
    display:flex; flex-direction:column; justify-content:flex-end;
    aspect-ratio:2 / 3; border-radius:var(--plate-radius);
    background:var(--color-navy-deep);
    transition:transform .5s var(--ease), box-shadow .5s var(--ease);
  }
  .aboff__i:hover{ transform:translateY(-4px); box-shadow:0 30px 54px -40px rgba(var(--veil-rgb), .6); }
  .aboff__bg{ position:absolute; inset:0; z-index:0; }
  .aboff__bg img{
    width:100%; height:100%; object-fit:cover;
    transition:transform .8s var(--ease);
  }
  .aboff__i:hover .aboff__bg img{ transform:scale(1.045); }
  /* Two layers, and the second one is the point.
     A percentage gradient on the card cannot work here: a narrower card
     wraps the copy onto more lines, so the text block grows while the card
     shrinks, and the label that sat at 53% on a wide screen sat at 28% at
     1000px, straight back on the bright part of the photograph. Measured
     across seven widths.
     So the dark foot belongs to the TEXT, not to the card. It is a gradient
     on the block itself with a deep top padding, which means it is exactly
     as tall as the words are, at every width, whatever the copy is changed
     to later. The layer below is only a light wash over the picture. */
  .aboff__veil{
    position:absolute; inset:0; z-index:1;
    background:linear-gradient(180deg, rgba(var(--veil-rgb), .06) 0%, rgba(var(--veil-rgb), .22) 100%);
  }
  .aboff__foot{
    padding:3.8rem clamp(1.1rem,1.8vw,1.4rem) clamp(1.1rem,1.8vw,1.4rem);
    /* The whole fade happens inside the top padding, above the label. Put
       it lower and the label sits in the pale end of its own gradient,
       which is what the first attempt did: 1.0:1 on the brightest card.
       It stops at .84 rather than .98. At .98 the navy is opaque, which is
       why it read as black: nothing of the photograph is left to tint it,
       and #0a1526 on its own is hard to tell from black. At .84 the picture
       carries through the foot and the colour is visibly blue. Measured
       again after the change, because thinner means less contrast. */
    background:linear-gradient(180deg,
      rgba(var(--veil-rgb), 0) 0%, rgba(var(--veil-rgb), .54) 12%, rgba(var(--veil-rgb), .84) 24%, rgba(var(--veil-rgb), .90) 100%);
  }
  /* Written as :not() because .aboff__i > * carries the same specificity as
     the two layers above and, coming later, would drop them into the flow.
     This has cost half a day twice in this build. */
  .aboff__i > :not(.aboff__bg):not(.aboff__veil){ position:relative; z-index:2; min-width:0; }
  .aboff__foot{ display:block; }
  .aboff__k, .aboff__d, .aboff__a{ display:block; }
  .aboff__k{
    font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.18em; text-transform:uppercase; color:var(--color-gold); margin-bottom:.4rem;
  }
  .aboff__t{
    margin:0 0 .45rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.25rem,1.5vw + .55rem,1.5rem); line-height:1.06;
    letter-spacing:-.01em; color:var(--color-white);
  }
  .aboff__d{ margin:0 0 .9rem; font-size:13.5px; line-height:1.55; color:rgba(255,255,255,.78); }
  .aboff__a{
    font-family:var(--font-body); font-weight:700; font-size:10.5px;
    letter-spacing:.14em; text-transform:uppercase; color:var(--color-white);
    display:inline-flex; align-items:center; gap:.45rem; transition:gap .35s var(--ease);
  }
  .aboff__i:hover .aboff__a{ gap:.8rem; }
  .aboff__a .a{ color:var(--color-gold); }
  @media (prefers-reduced-motion: reduce){
    .aboff__i, .aboff__bg img, .aboff__a{ transition:none; }
    .aboff__i:hover{ transform:none; }
    .aboff__i:hover .aboff__bg img{ transform:none; }
  }

  /* ---- the invitation, the homepage plate, held to the page width ---- */
  .abcta{ padding-bottom:clamp(3.2rem,6vw,5rem); }
`;

const page = `<!DOCTYPE html>
<html lang="en">
<head>
${head({
  title: 'About',
  desc: 'Mares chosen after years on the best German farms, every cross begun in Desenzano del Garda, every foal carried and raised in Lanaken.',
  path: '/about',
  image: 'about-hero.jpg',
  ldType: 'AboutPage',
  ldExtra: { publisher: { '@type': 'Organization', name: 'Stud Von Axe' } },
})}
<style>${CSS}</style>
</head>
<body>
${header}

<main id="main">

  <!-- ONE. The hero. Their own motto, in their own capitals on their own
       site, so it is the one line on this page that needs no explaining. -->
  <section class="nhero abhero">
    <div class="nhero__bg" aria-hidden="true">
      <img src="/assets/img/about-hero.jpg" alt="" fetchpriority="high" width="1920" height="855">
    </div>
    <div class="nhero__veil" aria-hidden="true"></div>
    <div class="wrap">
      <div class="nhero__grid">
        <div>
          <p class="eyebrow">About Stud Von Axe</p>
          <h1 class="arch__h">The blood never <em>lies</em></h1>
        </div>
        <p class="arch__intro">Stud Von Axe was born from a great passion for horses. The mares behind
        it were chosen after years spent on the best German farms and long research into the families
        that produce sport horses.</p>
      </div>
    </div>
  </section>

  <!-- TWO. How it works, in the sentences already agreed on the homepage.
       Words left, photograph right, the picture on its own proportions. -->
  <section class="abst">
    <!-- The head from the supplied logo, navy, barely there, bleeding off
         the right edge: the homepage's own watermark recipe, class and all,
         so there is one of these on the site rather than two. -->
    <div class="stud__mark" aria-hidden="true">
      <img src="/assets/logo/icon-onlight.png" data-ground="light" alt="">
    </div>
    <div class="wrap abst__grid">

      <div class="abst__col">
        <div class="abfade" id="abfade">
          <img src="/assets/img/bases-yard.jpg" class="is-on" alt="A mare and foal at the stud"
               width="799" height="1200">
          <img src="/assets/img/intro-foal-star.jpg" alt="A foal in the field" loading="lazy"
               width="1200" height="1200">
          <img src="/assets/img/hero-grey.jpg" alt="A horse at the stud" loading="lazy"
               width="1200" height="1124">
          <div class="abfade__dots" role="tablist" aria-label="Photographs">
            <button class="abfade__dot" type="button" role="tab" aria-current="true" aria-label="Photograph 1"></button>
            <button class="abfade__dot" type="button" role="tab" aria-current="false" aria-label="Photograph 2"></button>
            <button class="abfade__dot" type="button" role="tab" aria-current="false" aria-label="Photograph 3"></button>
          </div>
        </div>
      </div>

      <div class="abst__col">
        <p class="plaque">How we work</p>
        <h2 class="abst__h">Two countries, <em>one programme</em></h2>
        <p class="abst__lead">We do not buy a pedigree and hope. Every mare here was chosen for what her
        family actually produces in sport, not for how the paper reads.</p>
        <p class="abst__body">Every cross begins in <b>Desenzano del Garda</b>. Our own team in
        <b>Lanaken</b> implants the embryo, carries the pregnancy and raises the foal until the day it
        leaves. Nothing is handed to a third party halfway.</p>
        <p class="abst__body">We tell a buyer what we see in a horse, the limits as well as the
        strengths, and we sell direct.</p>

        <div class="abpl">
          <div>
            <span class="abpl__k">Italy</span>
            <span class="abpl__v">Desenzano del Garda</span>
            <span class="abpl__d">Where every cross begins</span>
          </div>
          <div>
            <span class="abpl__k">Belgium</span>
            <span class="abpl__v">Lanaken</span>
            <span class="abpl__d">Where the foal is carried and raised</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- THREE. The four routes, in the homepage's own words, each pointing at
       the place that already holds them. Without this the page is a dead
       end: it says who they are and then stops. -->
  <section class="aboff">
    <div class="wrap">
      <p class="plaque">What we offer</p>
      <!-- "Four ways in" said nothing a reader could use, and naming all
           four ran to three lines. Plain words instead, which is the house
           rule anyway. -->
      <h2 class="abst__h">What we <em>sell</em></h2>
      <div class="aboff__grid">

        <a class="aboff__i" href="/foals">
          <span class="aboff__bg" aria-hidden="true">
            <img src="/assets/img/offer-foal.jpg" alt="" loading="lazy" width="1200" height="883"
                 style="object-position:50% 42%">
          </span>
          <span class="aboff__veil" aria-hidden="true"></span>
          <span class="aboff__foot">
            <span class="aboff__k">Lanaken, Belgium</span>
            <h3 class="aboff__t">Foals</h3>
            <span class="aboff__d">Born and raised at our Belgian base, out of mares chosen for jumping ability and temperament. You collect a horse already on the ground.</span>
            <span class="aboff__a">See the foals <span class="a" aria-hidden="true">&rarr;</span></span>
          </span>
        </a>

        <a class="aboff__i" href="/embryos">
          <span class="aboff__bg" aria-hidden="true">
            <img src="/assets/img/offer-embryo.jpg" alt="" loading="lazy" width="1200" height="1084"
                 style="object-position:52% 38%">
          </span>
          <span class="aboff__veil" aria-hidden="true"></span>
          <span class="aboff__foot">
            <span class="aboff__k">Frozen or carrying</span>
            <h3 class="aboff__t">Embryos</h3>
            <span class="aboff__d">Frozen from our own damlines, or already carrying in Lanaken. Every cross is made on pedigree and on what the mare has produced.</span>
            <span class="aboff__a">See the crosses <span class="a" aria-hidden="true">&rarr;</span></span>
          </span>
        </a>

        <a class="aboff__i" href="/news/icsi-semen-available">
          <span class="aboff__bg" aria-hidden="true">
            <img src="/assets/img/offer-semen.jpg" alt="" loading="lazy" width="1200" height="872"
                 style="object-position:48% 44%">
          </span>
          <span class="aboff__veil" aria-hidden="true"></span>
          <span class="aboff__foot">
            <span class="aboff__k">With Avantea, Cremona</span>
            <h3 class="aboff__t">ICSI semen</h3>
            <span class="aboff__d">Worked with our own mares through OPU and ICSI. The stallions we hold are named on request rather than listed.</span>
            <span class="aboff__a">Read the story <span class="a" aria-hidden="true">&rarr;</span></span>
          </span>
        </a>

        <a class="aboff__i" href="/sport-horses">
          <span class="aboff__bg" aria-hidden="true">
            <img src="/assets/img/results-unguessable.jpg" alt="" loading="lazy" width="1200" height="932"
                 style="object-position:50% 40%">
          </span>
          <span class="aboff__veil" aria-hidden="true"></span>
          <span class="aboff__foot">
            <span class="aboff__k">Sourced and brokered</span>
            <h3 class="aboff__t">Sport horses</h3>
            <span class="aboff__d">Several of our mares are available to compete or to breed from. We also look on a client's behalf, across Europe and as far as America.</span>
            <span class="aboff__a">See the horses <span class="a" aria-hidden="true">&rarr;</span></span>
          </span>
        </a>
      </div>
    </div>
  </section>

  <!-- FOUR. The invitation. The homepage plate, unchanged. -->
  <section class="abcta">
    <div class="wrap">
      <div class="pcta">
        <div class="pcta__bg" aria-hidden="true">
          <img src="/assets/img/hero-grey-wide.jpg" alt="" loading="lazy">
        </div>
        <div class="pcta__veil" aria-hidden="true"></div>
        <div>
          <p class="pcta__h">Tell us what you are <em>looking for</em>.</p>
          <p class="pcta__d">A foal on the ground, an embryo, a cross still to be made, or a mare to
          breed from. Say what you are after and we will tell you plainly what we have.</p>
        </div>
        <div class="pcta__acts">
          <a href="/#contact" class="btn btn-gold btn-pill">Get in touch</a>
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
/* The picture fades between three, five seconds apart. It stops on hover,
   on focus and on a click of the hairlines, and it never starts at all for
   a visitor who has asked for less motion: for them the first photograph
   simply stands. */
(function(){
  var box = document.getElementById('abfade');
  if(!box) return;
  var shots = box.querySelectorAll('img');
  var dots  = box.querySelectorAll('.abfade__dot');
  if(shots.length < 2) return;
  var at = 0, timer = null;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  function show(i){
    at = (i + shots.length) % shots.length;
    shots.forEach(function(im, n){ im.classList.toggle('is-on', n === at); });
    dots.forEach(function(d, n){ d.setAttribute('aria-current', n === at ? 'true' : 'false'); });
  }
  function play(){ if(still.matches) return; stop(); timer = setInterval(function(){ show(at + 1); }, 5000); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  dots.forEach(function(d, n){
    d.addEventListener('click', function(){ show(n); stop(); });
  });
  box.addEventListener('mouseenter', stop);
  box.addEventListener('mouseleave', play);
  box.addEventListener('focusin', stop);
  box.addEventListener('focusout', play);
  still.addEventListener('change', function(){ still.matches ? stop() : play(); });
  play();
})();
<\/script>
</body>
</html>
`;

mkdirSync(join(root, 'about'), { recursive: true });
writeFileSync(join(root, 'about', 'index.html'), page);
console.log('built about/index.html');
