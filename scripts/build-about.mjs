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

  /* ---- the story: words on the left, the photograph on the right ----
     Two even columns rather than a picture that spans and a caption that
     floats. The picture keeps its own proportions: this one stands, and a
     fixed aspect ratio would crop the yard out of it. */
  .abst{ padding-block:clamp(3.2rem,6vw,5rem); }
  .abst__grid{ display:grid; gap:clamp(1.8rem,4vw,3.2rem); align-items:center; }
  @media (min-width:900px){ .abst__grid{ grid-template-columns:1.05fr .95fr; } }
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
  .abst__pic{
    border-radius:var(--plate-radius); overflow:hidden;
    box-shadow:0 30px 60px -46px rgba(10,21,38,.55);
  }
  .abst__pic img{ display:block; width:100%; height:auto; }

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
  image: 'hero-neck-wide.jpg',
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
      <img src="/assets/img/hero-neck-wide.jpg" alt="" fetchpriority="high" width="1920" height="1093">
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
    <div class="wrap abst__grid">
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

      <div class="abst__col abst__pic">
        <img src="/assets/img/bases-yard.jpg" alt="A mare and foal at the stud" loading="lazy"
             width="799" height="1200">
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
          <p class="pcta__h">Ask us anything <em>about a horse</em>.</p>
          <p class="pcta__d">A foal on the ground, a cross still to be made, or a mare to breed from.
          Say what you are after and we will tell you plainly what we have.</p>
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
</body>
</html>
`;

mkdirSync(join(root, 'about'), { recursive: true });
writeFileSync(join(root, 'about', 'index.html'), page);
console.log('built about/index.html');
