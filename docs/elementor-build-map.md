# La Tenuta: Elementor build map

How to rebuild the Direction C homepage in **WordPress + Elementor +
Unlimited Elements (UE)** so the production site matches the prototype.
The prototype (branch `direction-c-tenuta`) is the design authority; this
document is the translation layer. Rule of thumb throughout: **experience
first, layout second, widget third**. If a plain container with a few
lines of CSS reproduces the prototype, prefer it over a widget.

## Why the page looks the way it does

The design system was calibrated against five sites Mark designed. His
recurring language, all of which this page speaks:

1. Serif headlines with one italic accent word in colour.
2. Numbered section eyebrows ("01 · The stud").
3. Contained plates with generous radius alternating light/dark on a
   light ground, instead of hard full-bleed bands.
4. Card vocabulary: stat mini-card trios, meta chips, result cards with
   oversized serif ordinals.
5. The results bento: dark intro card + light result cards.
6. Full-pill buttons, paired solid + ghost.
7. Rounded corners on all photography.

## Global setup (do this first)

### Elementor Global Colors
| Global | Value | Job |
| --- | --- | --- |
| Bone | `#f4f0e7` | page ground, dark-plate text |
| Stone | `#e8e1d3` | panels, chips |
| Espresso | `#262019` | primary ink, solid buttons |
| Umber | `#57493a` | muted ink |
| Accent | `#5f5a3a` | THE swap point: accent words, dots, focus |
| Accent tint | mix accent 38% into bone (`#c8c6ad` approx) | accent words on dark grounds |
| Dark plate | `#1b1712` | embryo plate, results intro, invitation, footer |
| White | `#ffffff` | result cards |

When the client's final accent arrives, change **Accent** and recompute
**Accent tint**; nothing else moves.

### Elementor Global Fonts
- Display: **Fraunces** (Google Fonts), weights 320-400, optical sizing
  auto, italic for accent words. Headline letter-spacing -0.01em.
- Body/labels: **Instrument Sans**, 400/500/600.
- Labels: 12px, uppercase, letter-spacing 0.22em.

### Radius and spacing standards
- Photography 12px, cards 16px, plates 24px, buttons/chips full pill.
- Section padding: clamp(5rem, 10vw, 9.5rem) top and bottom.
- Container max 1280px.

### Motion standard
One timing everywhere: **650ms, cubic-bezier(0.32, 0.08, 0.24, 1)**
(300ms for hovers). Entrances: fade + 12px rise, once, on scroll into
view. Use Elementor motion effects sparingly and NEVER the default "Fade
In" on every widget; respect `prefers-reduced-motion` (Elementor's
"Improved CSS loading" keeps its motion off when the OS asks; verify).

Custom CSS to register once (site-wide):

```css
:root {
  --tenuta-ease: cubic-bezier(0.32, 0.08, 0.24, 1);
  --tenuta-dur: 650ms;
  --tenuta-dur-fast: 300ms;
}
@media (prefers-reduced-motion: reduce) {
  .tenuta-anim { transition: none !important; animation: none !important; }
}
```

### The plaque (numbered eyebrow), used by every section
Heading widget, text `01 · The stud`, label typography, plus:

```css
.tenuta-plaque { text-transform: uppercase; letter-spacing: .22em; }
.tenuta-plaque::before {
  content: ''; display: block; width: 2.5em; height: 1px;
  background: currentColor; margin-bottom: .75rem;
}
.tenuta-plaque .num { color: var(--e-global-color-accent); }
```

## Sections, in page order

### 1. Arrival (hero)
- Full-height container (100svh), background **video-ready**: Elementor
  background video with the photograph as fallback/poster. Until footage
  arrives, background image + a one-shot slow zoom (scale 1.06 → 1 over
  28s) on the image layer only. Set "Play on mobile" OFF so phones get
  the photograph.
- Two overlay layers (bottom-weighted warm-black gradient + light top
  wash), as separate absolutely positioned divs, not background-overlay,
  so they can be tuned independently.
- Content bottom-left: plaque (bone), H1 in Fraunces with the accent
  word in Accent tint italic, then TWO pill buttons: solid bone +
  ghost bone (1px border at 55% bone).
- Header: Elementor sticky header template, transparent over the hero,
  switching to bone glass (88% bone + 14px backdrop blur + hairline
  shadow) after ~24px scroll via Elementor's "sticky effects" style
  state. Enquire is a ghost pill.

### 2. Statement
- One container on bone. A single Fraunces heading at
  clamp(2.375rem, 6.6vw, 7.25rem) with the accent word in Accent italic,
  and a small image (12px radius) inline between two words: position an
  Image widget inside the heading line using an inline-block wrapper
  (UE "dual heading" style widgets also work, but a heading + inline
  image span is simpler and cleaner).
- Support paragraph in Umber, max 44ch.

### 3. The stud (Estate)
- Two containers in a row (7/5): photo (3/4, 12px radius) and a Stone
  panel (24px radius) pulled over the photo's edge with a negative left
  margin (-4rem) at desktop, stacking cleanly on mobile.
- Panel content: plaque `01`, H2 with accent word, body, then the two
  yard rows: icon-list widget with a small accent dot (no icon font
  needed: a 0.45rem circle via CSS) + place in Fraunces + region as an
  accent-ink label + one role line.
- Future: the photo swaps for ambient estate footage in the same slot.

### 4. The horses (the centrepiece)
Desktop = interactive selector, mobile = scroll-snap gallery. Two
builds, one hidden per breakpoint with Elementor's responsive
visibility (the prototype does exactly this; hidden lazy images do not
load).

- **Option A (preferred): custom JS on plain containers.** Name list
  (buttons) + stacked portrait images + meta strip. The complete logic
  is ~40 lines:

```js
(function () {
  var root = document.querySelector('.tenuta-horses');
  if (!root) return;
  var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
  var panes = [].slice.call(root.querySelectorAll('.horse-portrait'));
  var metas = [].slice.call(root.querySelectorAll('.horse-meta'));
  function select(i, focus) {
    tabs.forEach(function (t, j) {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
      t.classList.toggle('is-active', i === j);
    });
    panes.forEach(function (p, j) { p.classList.toggle('is-active', i === j); });
    metas.forEach(function (m, j) { m.hidden = i !== j; });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(i); });
    t.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') select(i);
    });
  });
  root.querySelector('[role="tablist"]').addEventListener('keydown', function (e) {
    var delta = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1
      : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    var current = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    select((current + delta + tabs.length) % tabs.length, true);
  });
  select(0);
})();
```

  Portrait crossfade CSS: portraits absolutely stacked,
  `opacity 0 → 1` over `var(--tenuta-dur)`; active name steps 12px right
  and takes full ink.

- **Option B: UE Content Switcher / Interactive Banner widget**, if the
  chosen widget supports hover-to-switch, aria tabs, and a 650ms fade.
  Test keyboard behaviour before committing; drop to Option A if the
  widget's semantics are weaker than the snippet above.
- **Mobile**: plain flex row, `overflow-x auto`,
  `scroll-snap-type: x mandatory`, cards at 82% width. No JS.
- Meta strip: name in Fraunces + ONE stone chip (pill) carrying
  "Available" or "Sold · Country" + one meta line (year · sex · sire) +
  "View [name] ↗" underlined link to the horse's page.
- Content rule: only horses with a verified photograph appear (photo
  provenance rule in the repo README).

### 5. Terra (full-bleed statement)
- Full-width container, background image (focal 60% 55%), one
  bottom-weighted warm-black overlay div, content bottom-left: bone
  plaque + the statement at the oversized size with "world" in Accent
  tint italic. Nothing else. This and the Statement are the page's only
  two oversized type moments; do not add more.

### 6. The programme
- Section head: plaque `03` + H2 with accent word.
- **Foals**: two-column container, text left / photo right (4/3, 12px
  radius, hover scale 1.04 on the image inside the clipped frame),
  hairline border-top.
- **Embryos: the page's one dark plate.** Container with Dark plate
  background, 24px radius: text column (number, H3, body, underlined
  text CTA) + the lockup column: sire × dam in Fraunces (the × in
  Accent tint), the dam's pedigree line in italic, then **three stat
  mini-cards** (16px radius, 1px bone-22% border, bone-8% fill): value
  in Fraunces over a tracked label. The numbers MUST come from the
  live pairing data (ACF/CPT count), never typed in.
- **Semen**: mirror of Foals (photo left), the three facts as one line
  of copy, underlined text CTA.
- An interactive accordion (UE accordion with image swap) is an
  approved alternative if the client later wants the three collapsed;
  do not use icon-box cards.

### 7. Results (the bento)
- 3-column grid: intro card spanning 2 columns (Dark plate, 24px
  radius): plaque `04` (bone), H2 with "in the ring" in Accent tint,
  "All results" underlined link pinned to the bottom. Then up to 4
  white result cards (16px radius, hairline border): oversized Fraunces
  placing with a small italic ordinal in Accent, horse name in tracked
  caps, venue · class line, optional "with Rider".
- Data comes from the Horsetelex feed when wired; a UE marquee/ticker
  is an option for a long feed later, OFF by default.

### 8. Gallery
- CSS grid: 12 columns; wide frame (8 cols, 16/10) + tall frame (4
  cols, 2 rows) + two square frames (4 cols each). Hover scale on
  images. UE image gallery is acceptable if it can reproduce exactly
  this asymmetric spread; otherwise plain containers.
- Uncaptioned by design; never caption a horse photo with a name unless
  the photo is verified as that horse.

### 9. Invitation (final CTA)
- Container, Dark plate, 24px radius, centred: plaque (bone), H2 with
  "horse" in Accent tint, two lines of body (bone-72%), then the paired
  pills mirroring the hero: solid bone pill (mailto) + ghost bone pill
  (WhatsApp). Future option: cinematic background video in this plate,
  same rules as the hero slot.

### 10. Footer
- Espresso-dark ground, four columns + logo, 44px-tall link targets on
  phones, plaque-style column headings.

## Performance budget

- Images: WebP/AVIF via WordPress; hero <= 300KB largest source; lazy
  load everything below the hero; explicit width/height everywhere.
- Video (when it arrives): <= 8MB, muted, no audio track, poster image,
  `preload="none"`, off on mobile.
- No slider/carousel libraries for anything the CSS scroll-snap rail
  already does. Every UE widget added must earn its JS weight.

## Accessibility checklist (non-negotiable)

- The horse selector: real `role="tablist"`/`tab` semantics, arrow-key
  navigation with wrap, visible focus ring (Accent, 2px, offset 3px).
- 44px minimum targets, including footer links on phones.
- One H1 (hero), one H2 per section, H3 for programme blocks.
- Contrast at AA everywhere, measured against the real composited
  grounds (photographs and gradients included), not assumed. The
  prototype repo carries the auditor (`scripts/contrast-audit.js`).
- `prefers-reduced-motion`: no hero zoom, no entrance movement, no
  hover scale.

## Things this page deliberately does NOT do

No icon-box card rows, no generic template heroes, no autoplaying
carousels, no parallax libraries, no more than two oversized type
moments, no gold, no invented numbers (every stat is counted from
data), no photo attached to the wrong horse.
