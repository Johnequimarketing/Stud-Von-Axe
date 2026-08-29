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
import { root, homeCss, pageHeroCss, header, footer, head, navScript } from './lib/shell.mjs';

const CSS = homeCss + pageHeroCss + `
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
    box-shadow:0 30px 60px -46px rgba(10,21,38,.55);
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
    width:26px; height:2px; padding:0; border:none; border-radius:2px;
    background:rgba(255,255,255,.55); cursor:pointer;
    /* A hairline on a photograph is only as readable as what is behind it:
       this one sits on a pale sand floor in the first shot. */
    box-shadow:0 0 6px rgba(6,12,20,.55);
    transition:background .35s var(--ease), width .35s var(--ease);
  }
  .abfade__dot[aria-current="true"]{ background:var(--color-gold); width:38px; }
  @media (prefers-reduced-motion: reduce){
    .abfade img{ transition:none; }
  }
  .abst__h{
    margin:.7rem 0 1.2rem; font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.8rem,2.6vw + .9rem,2.9rem); line-height:1.04;
    letter-spacing:-.02em; color:var(--color-ink); max-width:15ch; text-wrap:balance;
  }
  .abst__h em{ font-style:italic; color:var(--color-gold); }
  .abst__lead{ margin:0 0 1rem; font-size:17.5px; line-height:1.6; color:var(--color-ink); max-width:52ch; }
  .abst__body{ margin:0 0 1rem; font-size:16px; line-height:1.68; color:var(--color-ink-soft); max-width:52ch; }
  .abst__body b{ font-weight:700; color:var(--color-ink); }
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
    /* the step. Only where there are four across: at two across it would
       stagger the pairs and read as a mistake. */
    .aboff__i:nth-child(even){ margin-top:clamp(1.4rem,3.4vw,2.8rem); }
  }
  .aboff__i{
    position:relative; isolation:isolate; overflow:hidden; min-width:0;
    display:flex; flex-direction:column; justify-content:flex-end;
    aspect-ratio:4 / 5; border-radius:var(--plate-radius);
    background:var(--color-navy-deep);
    padding:clamp(1.1rem,1.8vw,1.5rem);
    transition:transform .5s var(--ease), box-shadow .5s var(--ease);
  }
  .aboff__i:hover{ transform:translateY(-4px); box-shadow:0 30px 54px -40px rgba(10,21,38,.6); }
  .aboff__bg{ position:absolute; inset:0; z-index:0; }
  .aboff__bg img{
    width:100%; height:100%; object-fit:cover;
    transition:transform .8s var(--ease);
  }
  .aboff__i:hover .aboff__bg img{ transform:scale(1.045); }
  /* A foot gradient, not a flat veil: the picture stays a picture at the
     head and closes where the type sits. The stops are not a guess. The
     gold label is the house eyebrow, and the house threshold for gold on a
     dark ground is 3:1; measured on the rendered card, behind the label
     itself rather than somewhere near it, the first draft came in at 1.53
     on the brightest of the four. These stops put every card over the
     line. Re-measure if the photographs are ever swapped. */
  .aboff__veil{
    position:absolute; inset:0; z-index:1;
    background:linear-gradient(180deg,
      rgba(6,12,20,.04) 0%, rgba(8,16,28,.12) 42%, rgba(7,14,24,.80) 56%, rgba(6,12,20,.97) 100%);
  }
  /* Written as :not() because .aboff__i > * carries the same specificity as
     the two layers above and, coming later, would drop them into the flow.
     This has cost half a day twice in this build. */
  .aboff__i > :not(.aboff__bg):not(.aboff__veil){ position:relative; z-index:2; min-width:0; }
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
  desc: 'Stud Von Axe was born from a passion for horses: mares chosen after years on the best German farms, every cross begun in Desenzano del Garda and every foal carried and raised in Lanaken.',
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
      <!-- Not "one programme" a second time: the heading above already says
           it, and repeating it makes the page sound like it is running out
           of things to say. -->
      <h2 class="abst__h">Four ways <em>in</em></h2>
      <div class="aboff__grid">

        <a class="aboff__i" href="/#programme">
          <span class="aboff__bg" aria-hidden="true">
            <img src="/assets/img/offer-foal.jpg" alt="" loading="lazy" width="1200" height="883"
                 style="object-position:50% 42%">
          </span>
          <span class="aboff__veil" aria-hidden="true"></span>
          <span class="aboff__k">Lanaken, Belgium</span>
          <h3 class="aboff__t">Foals</h3>
          <span class="aboff__d">Born and raised in Lanaken, out of mares chosen for jumping.</span>
          <span class="aboff__a">See the foals <span class="a" aria-hidden="true">&rarr;</span></span>
        </a>

        <a class="aboff__i" href="/#programme">
          <span class="aboff__bg" aria-hidden="true">
            <img src="/assets/img/offer-embryo.jpg" alt="" loading="lazy" width="1200" height="1084"
                 style="object-position:52% 38%">
          </span>
          <span class="aboff__veil" aria-hidden="true"></span>
          <span class="aboff__k">Frozen or carrying</span>
          <h3 class="aboff__t">Embryos</h3>
          <span class="aboff__d">Frozen from our own damlines, or already carrying in Lanaken.</span>
          <span class="aboff__a">Ask about a cross <span class="a" aria-hidden="true">&rarr;</span></span>
        </a>

        <a class="aboff__i" href="/news/icsi-semen-available">
          <span class="aboff__bg" aria-hidden="true">
            <img src="/assets/img/offer-semen.jpg" alt="" loading="lazy" width="1200" height="872"
                 style="object-position:48% 44%">
          </span>
          <span class="aboff__veil" aria-hidden="true"></span>
          <span class="aboff__k">With Avantea, Cremona</span>
          <h3 class="aboff__t">ICSI semen</h3>
          <span class="aboff__d">Worked with our own mares through OPU and ICSI.</span>
          <span class="aboff__a">Read the story <span class="a" aria-hidden="true">&rarr;</span></span>
        </a>

        <a class="aboff__i" href="/#horses">
          <span class="aboff__bg" aria-hidden="true">
            <img src="/assets/img/results-unguessable.jpg" alt="" loading="lazy" width="1200" height="932"
                 style="object-position:50% 40%">
          </span>
          <span class="aboff__veil" aria-hidden="true"></span>
          <span class="aboff__k">Sourced and brokered</span>
          <h3 class="aboff__t">Sport horses</h3>
          <span class="aboff__d">Mares to compete or to breed from, and we look on your behalf.</span>
          <span class="aboff__a">See the horses <span class="a" aria-hidden="true">&rarr;</span></span>
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
