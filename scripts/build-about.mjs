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
          <img src="/assets/img/hero-embryos.jpg" alt="A mare with her foal" loading="lazy"
               width="1920" height="1734">
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

  <!-- THREE. The invitation. The homepage plate, unchanged. -->
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
