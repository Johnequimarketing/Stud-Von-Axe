# Stud Von Axe: homepage

> ## Branch note: Direction B, "Notturno"
>
> This branch is **homepage direction 2 of 3** for Mark's review. Direction A,
> "Linea di Sangue", lives on `v2-homepage` and is documented in the rest of
> this file. Everything below still applies: same content layer, same
> provenance rules, same derived counts, same audit tooling, same launch
> blockers. Notturno changes **presentation only**, plus five layout rebuilds
> listed at the end of this note.
>
> ### The idea
>
> Direction A is a light editorial page with dark moments. Notturno inverts it:
> the whole page is deep navy, photography glows out of the dark, gold works
> full time instead of as an accent, and ivory is the ink. Rhythm comes from
> per-section washes, lifted panels and one bright moment (the gold contact
> plate) rather than from alternating cream and navy bands.
>
> ### Three semantic tokens change JOB, not just value
>
> The raw palette is byte for byte identical on both branches, so the Pantone
> swap point (`--raw-gold`) is unchanged. What changes is what three semantic
> tokens are *for*:
>
> | Token | Direction A | Notturno | Why the job changes |
> | --- | --- | --- | --- |
> | `--color-accent-ink` | gold mixed toward navy | `--raw-gold-soft` | This token is "gold AS TEXT at label sizes". On ivory that meant darkening the gold to clear 4.5:1; on navy the same requirement needs the opposite move. |
> | `--color-card` | `--raw-white` | navy lifted 9% toward ivory | Card ground. A white card on a navy page is a different design, not this one. |
> | `--color-on-primary` | `--color-dark-text` | `--raw-navy` | Text on the primary fill. `--color-primary` is gold here, so its ink has to be navy or the active segment of every control is gold on gold. |
>
> `--color-bg` is deliberately *lighter* than `--color-dark-bg`: a page base of
> `color-mix(in srgb, var(--raw-navy) 55%, var(--raw-navy-deep))` leaves the
> footer, the dark panels and the typographic stands still reading as deeper
> planes on it. A flat single navy would have flattened all of them.
>
> ### The signature motif
>
> The build brief asks for one visual motif repeated through the page. Notturno's
> is the **arch**: a full half round on a square footing, the stable door
> proportion, built from `border-radius: 100vw 100vw <radius> <radius>` so no
> mask is needed and the element stays a plain figure. It is used twice
> structurally, in the offer section and on the bases photograph. Twice is
> enough to read as a motif; arching every image would turn it into a texture.
>
> ### Layout rebuilds, not a retheme
>
> Five things were rebuilt rather than recoloured, weakest first:
>
> 1. **Offer** (`src/sections/offer/OfferIndex.tsx`) replaced the triptych. The
>    triptych showed three photographs with one word each and hid its content
>    behind hover, which reads thin in any screenshot. It is now a contained
>    plate: numbered index rows (01 Foals / 02 Embryos / 03 Semen) with gold
>    numerals, a one line description always visible, an arrow per row, and one
>    arch cropped photograph. `object-position: 90% 50%` on that figure is
>    computed, not guessed: the source is landscape, the arch is 4/5 so cover
>    crops horizontally only, and the foal's muzzle sits at about 93% of the
>    frame width.
> 2. **News fallback card**: a lone gold `x` on navy read as a broken image. The
>    panel now carries the story's headline set large, the same logic as the
>    horse card's typographic stand, and the card body drops its title so the
>    headline is never printed twice.
> 3. **Base cards** got per card washes (a gold bloom for Italy, a cooler ivory
>    lift for Belgium) and the gold node dot before the region kicker. Flat
>    rectangles on a flat dark ground read as placeholders.
> 4. **Cards get a 1px ivory ring** (`--color-border`) so a dark card separates
>    from the dark base at all. Hover lift is unchanged.
> 5. **Hero** display max went 4.5rem to 5rem, the intro tightened to 40ch, and
>    the frame no longer ends on a line: `.foot` in `HeroFull.module.css`
>    resolves the last 10% of the hero to `--color-bg` exactly. That strip is a
>    real element and not a pseudo on `.grade` on purpose, because the contrast
>    auditor walks elements and cannot see a paint layer parked on a pseudo.
>
> ### Accessibility notes specific to this direction
>
> - Audited with `scripts/contrast-audit.js` across all 12 regions at 1280, 768
>   and 390, plus every state of the three segmented controls: **0 failures**.
> - The gold contact plate is the tightest surface on the page. Small labels on
>   it measure 4.93:1 against a 4.5:1 requirement, so nothing on that plate may
>   be softened in tone. Its accent word earns its emphasis from italic and
>   `--raw-navy-deep` (5.47:1), not from a lighter ink.
> - Footer links grow to a 44px target below 768px and the list gap goes to
>   zero, so the column gets taller by the padding rather than by padding plus
>   gap.
> - Fixing the auditor was part of this branch: a gradient layer's colour is now
>   its first NON transparent stop. The hero vignette is written
>   `rgba(0, 0, 0, 0)` first, and taking the literal first colour function
>   composited every heading over the photograph toward black, reporting a
>   flattering 21:1 for white type instead of its real 17.29:1.


A fresh homepage for Stud Von Axe, Italian breeder of showjumping sport horses.
Single page, anchor navigation, built with Vite + React + TypeScript and deployed
to Vercel.

## Design direction: "Linea di Sangue"

The organising idea is that **the pedigree is the visual identity**. Von Axe's
product is genetics, and their own tagline is "The blood never lies", so the
design system is built from hairline rules, node dots and `sire × dam`
typographic lockups: the same blaze-and-nodes device that runs down the middle
of their logo.

This solves the hardest content problem structurally rather than decoratively:
an embryo has no photograph, so an embryo is typography. Photography carries the
living horses; typography carries the genetics. Embryos and semen become
first-class commercial pillars without needing stand-in images or a card grid.

Deliberate constraints, taken from the client brief and Mark's feedback:

- Light ivory base carries all content. Blue is structure (rules, frames,
  headings). Gold is accent only. A full bleed gold ground was tried for the
  closing contact band and dropped: it stood out, but it spent the page's
  only gold surface on its quietest content and forced every ink on it to
  invert.
- A cinematic full-bleed hero, then **two** other dark moments: the embryo
  section and the footer. No long copy on dark blue. The embryo band was a
  deliberate spend on the client's call, chosen from three layouts; it lands
  between two ivory sections so no two dark grounds ever touch, and it
  carries only a name, a pedigree, one line and three counted facts.
- A deliberate radius scale rather than a single value (see below).
- **One** tinted band: the results section.
- No pinned scroll, no parallax, no marquees, no card grids. A single
  one-shot fade-up on scroll, and hover states. The one horizontal run is
  the catalogue carousel, which the client briefing asks for by name and
  which never moves on its own (see below).
- Sold status is quiet text naming its destination country ("Sold · GB"), which
  doubles as the proof of international reach. No flags, no ribbons, no count
  of countries is ever claimed.
- **Every run of items ends in a way out.** The homepage teases and links; it
  never tries to be the catalogue. The horse run ends in "See all horses",
  the results in "All results", and headline results are capped at four.
  When a fact needs more than a line or two, it belongs on that item's own
  page, which is why the semen spec row is three values and the embryo
  section counts pairings rather than listing them.

## Getting started

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 5188 |
| `npm run build` | Typecheck then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run images:fetch` | Download the client's photography and print a dimension report (see below) |
| `npm run brand:build` | Re-optimize the logo artwork from the source PNGs |

## Architecture

```
src/
├── styles/tokens.css     Single source of truth: colour, type, space, radius, containers
├── styles/global.css     Reset, base elements, focus states, reveal CSS
├── content/              All real content as typed TS constants
├── components/primitives/ Section, Container, Eyebrow, SectionHeading, Pedigree, MetaRow, Icon, CTALink, Reveal
├── components/           Header, Footer
├── sections/             One file + colocated CSS module per homepage section
└── hooks/useReveal.ts    One-shot IntersectionObserver, reduced-motion aware
```

### Colour and the gold swap

Every colour lives in `src/styles/tokens.css` in two layers: a raw palette (the
only place hex values appear) and semantic tokens that components consume. When
the client sends the Pantone, change **`--raw-gold`** and nothing else.

Gold has two tokens because it has two jobs:

- `--color-accent`: fills, rules, and gold text on dark grounds.
- `--color-accent-ink`: gold **as text on the light base**. The brand gold only
  reaches 3.0:1 on ivory, which fails WCAG AA at label sizes, so this variant is
  mixed toward navy to clear 4.5:1. It is derived from `--raw-gold`, so the
  Pantone swap still propagates from one line.

Re-run the contrast check after swapping the Pantone.

### Shape

The client asked for a rounded header and rounded buttons, so shape became a
scale rather than one value. Each step has a job, which keeps it from turning
into "everything is a pill":

| Token | Value | Used for |
| --- | --- | --- |
| `--radius-sm` | 4px | photography and thumbnails, so images read as images |
| `--radius-control` | 14px | buttons, inputs, controls |
| `--radius-md` | 16px | framed panels, form panels |
| `--radius-lg` | 20px | the header shell |
| `--radius-pill` | 999px | status chips, and nothing else |

The scale tightens as elements get smaller so the curvature reads as one
shape family at every size. Rules carry no radius at all, because they are
pure typography.

One full pill exists, and it is deliberately the only one: the status chip
on a horse card. It was tried as a 4px stamp first and read as too hard
against a photograph. The rule that keeps this from becoming "everything is
a pill" is that the pill radius is a named token with a single documented
use, so a second use has to be an argued decision rather than a copied
value.

### The header

A softly rounded bar floating clear of the page edge at every scroll position.

**Its geometry never changes.** Width, padding and radius all stay put, and
scrolling only crossfades the surface underneath: background, border and
shadow. That is deliberate. An earlier version animated the bar from floating
to full width, which meant the browser recalculated layout on every frame of
the transition and stuttered. Now there is no layout work at all.

Three surfaces, chosen from two inputs. `heroIsLight` says what the bar is
floating over, `scrolled` says whether the hero is still behind it. Over a
photograph it wears faint dark glass so white type holds; over an ivory hero
it drops away entirely, since there is nothing to separate from and nothing
worth blurring; once scrolled it takes the light surface. Each hero declares
its tone through `setHeroTone`, so a light hero gets the light treatment
immediately rather than only after scrolling.

The header carries the wordmark at all times, so the hero leads with its
statement rather than repeating the lockup.

### The hero

Full bleed, one photograph across the whole viewport, statement set low left.

The grading is three layers, not one: a bottom-weighted base wash under the
words, a lighter top wash so the floating header stays legible, and a soft
vignette to close the frame. The base wash is heavier on narrow screens, where
the type block covers more of the frame, and lifts on wide ones where the type
sits in a single corner. The crop is set in CSS rather than inline so it can
change with the breakpoint: a phone shows a narrow vertical slice of a nearly
square file, so it is pulled left to keep the head and neck in view.

Width is `100%` rather than `100vw` deliberately: on a block inside an unpadded
`<main>` the two are identical, but `100vw` overflows by the width of the
scrollbar.

### The stud section

`IntroStory` in `src/sections/intro/`, the chaptered account the visitor clicks
through: three short chapters (the beginning, our way, today), each led by a
serif statement, with the chapter control built as an accessible tablist
(arrow keys move between chapters).

The photograph (a bay foal and its dark mare, from the stud's own Instagram)
carries a navy card breaking over its bottom left with the journey from
Italy. The chapters sit on their own tinted panel that overlaps the
photograph's right edge and floats in front of it at desktop widths, rather
than sitting beside it with a gap: `.grid` drops its columns for a single
`position: relative` block, the photo stays in normal flow at 58% width, and
the panel is absolutely positioned at `left: 40%` with `z-index: 2`, so the
photo shows through only on its own left, top and bottom. Below 900px the
overlap is dropped entirely and the two stack normally. An icon badge was
tried on the photograph's corner and removed on review; the crop that made it
(`scripts/build-brand.mjs`) is left in place in case it is wanted again.

The photo's `objectPosition` and the panel's overlap point are tuned together,
not independently: the first version placed the panel's edge directly over
the foal's head, the actual subject of the photo, because the crop had it
sitting near the overlap boundary. Whenever the photo changes, re-check that
the subject lands in the exposed left portion before the overlap starts.

The photo column is 56% at desktop and the panel overlaps only about 11% of
it (down from an earlier pass at 50%/66% with an 16% overlap, which covered
too much of the photograph).

The figure ratio is `6 / 5` at desktop, not the `5 / 6` portrait it started
at. The source photo is a square crop, so a portrait box trimmed its left
and right edges and kept the full height, and at the section's actual width
that rendered taller than a typical viewport: scrolling to the section never
showed the whole photograph without scrolling again. A landscape ratio trims
the top and bottom instead, keeping the full width, so the whole photo,
panel and card fit inside one screen. `6 / 5` specifically, rather than the
shorter `4 / 3` it passed through on the way there, because the photo column
reads better as slightly taller than the panel's own intrinsic height than
as the shorter of the two.

The eyebrow rule (the short gold line above every section's small caption,
"THE STUD", "WHAT WE OFFER", "AVAILABLE NOW", and so on) is removed from the
shared `Eyebrow` primitive entirely, site-wide, not overridden per section.
An early pass only toned it down inside this section, which solved the wrong
problem: the ask was to remove it everywhere.

Six other layouts were explored before this one, including two more built from
reference mechanisms (a floating quote card, a prose-and-pillars index). All
were removed once this was chosen, along with their now-unused photography and
copy fields, rather than left behind as dead code.

### The icon mark

No standalone icon file exists yet, only the full lockups. `scripts/build-brand.mjs`
crops one out of `logo-stacked-light.png`: the icon and the wordmark's
decorative rule sit close enough vertically that a single crop always caught
a sliver of the rule as a stray line, so the icon is built from two slices,
above and below the rule, stitched with that band removed. Re-run
`npm run brand:build` if the source lockup changes.
TODO client-confirm: swap for a real vector icon mark if the client supplies
one, this crop is a stand-in.

The proportion and corner radius of each figure are set through
`--figure-ratio` and `--figure-radius` custom properties rather than descendant
selectors. CSS Modules hash class names per file, so a `.figure .media` rule
written in a layout stylesheet would compile to a `.media` class the element
does not actually carry and would silently do nothing. This bit us twice, so
the properties are the only supported way to restyle a figure from outside
`IntroParts.module.css`.

**Auditing contrast:** sample colours only after transitions have settled.
Buttons and the header crossfade over 420 to 480ms, and reading
`getComputedStyle` mid-transition returns an intermediate colour, which
produces convincing but bogus failures.

### The offer section

`OfferTriptych` in `src/sections/offer/`: one photographic band divided
into thirds with hairline seams and no gaps, deliberately so it reads as a
single divided composition rather than the three-card grid the brief rules
out. Two other layouts (a typographic index, a hover-spotlight) were
explored and removed once this was chosen.

At rest each panel shows only its number and title; description and CTA
reveal on hover or keyboard focus, with a deeper grade fading in behind
them. The reveal uses a grid-rows collapse rather than max-height, so the
motion tracks the content's real size. Crucially it is scoped to
`(hover: hover) and (pointer: fine)`: touch devices have no hover, so they
show everything permanently instead of hiding content behind a gesture
that does not exist.

Route photography is atmosphere, not catalogue: foal in the grass for
Foals, foal at its dam's side for Embryos, a presented mare for Semen.

### The available now section

`src/sections/available/`: the commercial heart, and the one place on the
page where horses are shown as a set. It is a filtered run of cards holding
only horses actually with the stud, the featured foal and the four mares,
because the section says "Available now" and a sold horse is not available.

Sold horses were originally in this run wearing `Sold · GB` badges, on the
argument that their destination countries prove international reach. That
proof is real and still needed, but it does not belong here: `recentPlacements`
in `src/content/horses.ts` still holds those six horses and their countries,
unused, waiting for a placements run of its own. **This is an open thread,
not a deletion.**

`Carousel.tsx` is manual only. The briefing asks for images that scroll in
a gallery rather than sit as separate blocks; what Mark rules out is the
*automatic* carousel, so there is no autoplay and no timer. Movement comes
from native scroll-snap (swipe on touch, trackpad anywhere) and from two
arrow buttons that page by exactly one card, measured from the first card's
real width plus the track's computed column gap rather than assumed. At
either end the arrows wrap to the opposite end instead of dead-ending.

Three details in that file are load-bearing and easy to undo by accident:

- The end detection uses an 8px tolerance, not an exact comparison. Scroll
  positions are fractional, and a click arriving while a previous smooth
  scroll is still settling reads as "not quite at the end" and silently
  does nothing. Eight pixels is far under one card, so it can never wrap
  early mid-run.
- The scroll reset on a filter change lives in a `useEffect`, not in the
  click handler. Resetting during the click scrolls the outgoing list, and
  the browser then re-anchors the track against the changed content and
  leaves it one card off.
- The track sets `overflow-anchor: none` for the same reason, and
  `overscroll-behavior-x: contain` so the horizontal scroll stays inside
  the track instead of leaking to the page.

The track bleeds past the container to the right so a card is visibly cut
off, which is the affordance that says there is more this way. Past 1440
there is no edge left to bleed into, so it sits inside the container like
every other section.

The arrows disable themselves when a run fits without scrolling, measured
with a `ResizeObserver` rather than assumed, because the Foals filter holds
a single horse today and arrows that silently do nothing read as broken.
Worth revisiting: with five horses in the section, the All / Foals /
Broodmares filter earns little, and a one-card tab is thin.

`HorseCard.tsx` is one object rather than a photograph with a caption
welded underneath: a 3/4 crop with the horse's name set over the foot of
the image, the meta line the build brief specifies (year, sex, sire) and a
link that names its own destination ("View Cortina ↗"). The studbook the
meta line used to carry is a detail page fact. Three earlier layouts were built and compared in place (a photograph
plus caption, a catalogue-entry ledger, and an overlapping ivory plate)
before this one was chosen; the picker and the losers were then deleted.

The card carries no pedigree, which was the deliberate cut: it made every
card in the run look identical from a distance, and it is the detail page's
job. There is no "View details" row either, because the whole card is the
link. The only exception is a horse with no verified photograph, where the
pedigree stands in for the *image* on a navy ground, never a lookalike
animal.

Three things in the card are load-bearing:

- The grade is near solid across the bottom of the image, not a gentle
  wash. That is what lets the born line be genuinely muted instead of
  competing with the name: as full ivory it fought the name, and as the
  muted tone over a lighter grade it measured 3.96:1 on the brightest
  photograph. The grade is what buys the hierarchy.
- The born line and the status chip are both 12px, one small size rather
  than two. 11px uppercase over photography is uncomfortable on a phone.
- A chip appears only when it says something the section title does not.
  Every horse here is available, so `Available` on all five would be
  decoration; only the gold `Featured` chip renders today. Reserved and
  sold keep a quiet glass treatment for when they are needed.

Cards currently link out to each horse's own page on studvonaxe.it in a new
tab, mapped in `images.ts` as `horseDetailUrls`. Those swap to internal
detail routes when those pages exist.

Cards currently link out to each horse's own page on studvonaxe.it in a new
tab, mapped in `images.ts` as `horseDetailUrls`. Those swap to internal
detail routes when those pages exist.

### The embryo section

`src/sections/bloodlines/`: the page's one dark band, and the section built
hardest for conversion.

An embryo has no photograph, so the **dam** is the subject. She is a living
horse with a verified picture of herself, which keeps the provenance rule
intact while giving the section real photography. The pairings are counted
beside her rather than listed: a name, her pedigree, one line in the stud's
own words, a three-value spec row, and two actions. Nothing else. Sire by
sire detail belongs on each horse's own page.

The heading and the damline selector share one line, which is what keeps the
whole section inside a screen (950px at 1280, down from 2288px for the first
full-ledger draft). Selector labels are the yard's short name for each dam,
because five full names do not fit beside a 55px heading; the full name is on
the button for a screen reader and set large in the panel.

Two decisions worth keeping:

- **The primary action is the enquiry**, a gold button opening a mail that
  names the damline. "See the pairings" is secondary. An earlier draft had
  fifteen Enquire links, one per pairing, and no primary at all.
- **The chip carries a count, not a price.** The reference layout this
  follows carries a covering fee. The stud publishes none, so the chip says
  "7 pairings", and every value in the spec row is counted from
  `pairings.ts` rather than written down.

Damline `note` strings are the **client's own prose**, lifted from each
mare's listing page and cut to one line. Two dams have none: Cabri's page
carries no prose, and Hypnotic JT Z has no page at all. Those render no line
rather than filler, and the field is optional so adding one is a data edit.

Two sentences on those pages were deliberately not used, and the reason is
in `pairings.ts`: both name auction sales, which contradicts the hero's
"Sold direct, never through auction". That is a real conflict in the
client's own material and needs their decision, not a silent choice.

### The semen section

`src/sections/semen/`: the route a straw travels, centred down the page.

**Frozen** at the Avantea laboratory in Cremona, **Shipped** across the EU
and for export, **To your mare** with stallion availability on request, and
then the gold button. Same three facts the client publishes, read as a
journey rather than a specification, so the section asks for the enquiry
instead of reporting data. Chosen from five concepts (fact panels beside a
photograph, this route, an arch cropped photograph, a navy band with layered
washes, and the product drawn as a hairline diagram).

**There is no photograph.** No stallion names are published and no stallion
photography exists, so a portrait of any horse here implies "this is the
stallion whose semen is for sale", a claim nobody has made. A conformation
shot from the client's library reads exactly that way and was rejected for
it. An earlier concept used a detail crop of a plaited neck as atmosphere;
`SemenFigure` and its provenance notes are still in the folder if that
returns.

**The device is the house motif doing structural work.** A hairline running
through gold rings, which is the pedigree separator at section scale, with
each fact's line icon inside its ring. The ring is filled with the page
ground so the rule reads as passing behind it.

Three geometry details, each from a measured mistake:

- The rule is drawn **per step**, not as one span across the list. A single
  span overshot the last node by 323px at 1280, because a node sits at its
  column's centre and not at the container's edge. The last step draws
  nothing, so the path ends exactly on its final mark.
- Each horizontal segment reaches **half a column plus the grid gap**. Using
  the gap alone stopped 24px short and left a break either side of every
  ring.
- On a phone the connector spans **only the gap between steps**. Running it
  from the foot of one ring to the next put the rule straight through two
  lines of centred text, because the label and body sit below the node there
  rather than beside it.

### The results section

`src/sections/proof/`: a navy intro card and the results as cards flowing
around it, built to be filled by the **Horsetelex plugin** rather than kept
by hand.

`liveResults` in `src/content/results.ts` is the only thing the section
reads, so wiring the plugin means swapping that export for the adapter's
output and changing nothing else. The `LiveResult` type is the contract:
`id`, `placing` and `horse` are required, everything else optional.

**Every optional field renders only when the feed carries it.** The mockup
this follows showed "with [rider]" as a placeholder, and a placeholder in
production reads as a bug, so a thin row degrades to a shorter card instead.
Dates are parsed and dropped if unparseable, because a broken date is worse
than no date. With no rows at all the section shows a single line rather than
an empty grid or an invented result.

Today it holds the two ring results the client's own site states, both
Calleryama, with no dates, sires or scores because those are not published.
It will look sparse until the feed is connected. That is the honest state.

Two consequences of the change, both improvements:

- **The auction results are gone from the homepage.** "Top price at auction"
  and "sold for €40,000 at Zangersheide" are sales, not ring results, and
  cannot fill this card. That also settles their contradiction with the
  hero's "sold direct, never through auction". They remain in `results` for
  a sales or news context.
- **The destination-countries reach sentence went with them**, so that proof
  now has no home on the page. The country code on a card is the venue's
  country, not a sale destination: do not conflate them.

Two implementation notes worth keeping:

- The intro card's column span sits on the **`Reveal` wrapper**, not the
  card. `Reveal` renders a div, so it is the grid item; putting the span on
  the card silently did nothing and left the intro one column wide.
- At desktop the card list is `display: contents` so the cards become items
  of the section grid and flow around the intro card. That is why it carries
  an explicit `role="list"`: some browsers drop the implicit list role when a
  list is `display: contents`.

**The section renders at most four cards** (`RESULT_LIMIT`), a hard cap on
the view rather than a property of the data: the feed can return fifty rows
and this still shows four and links out. Adding the "All results" link
earlier without this cap was an oversight.

**Real rows take the slots first**, and placeholders only fill what is left.
Sorting the two sets together would have dropped both real results, because
neither has a published date and every fabricated row does: the cap would
then have shown four invented results and hidden the only true ones.

**Placeholder rows.** The section currently renders fabricated results from
`src/content/results.placeholder.ts` so the grid can be reviewed full. They are ours, not
lifted from a mockup. Two rules were followed in writing them: the sires are
invented names, because hanging a made up horse off a real stallion reads as
a plausible pedigree claim, and there are no riders, because a fabricated
result is a layout problem where a fabricated person attached to one is not.
Their placings cover 1st, 3rd, 5th and 12th, which exercises every ordinal
suffix including the teens case.

**Two launch blockers here**, both listed in Outstanding:

1. `SHOW_PLACEHOLDER_RESULTS` must be `false`.
2. The kicker says "Live data · Horsetelex" and the intro says results are
   "updated automatically". Neither is true until the plugin is wired, so
   both are a promise the site should not make before then.

### The bases section

`src/sections/bases/`: one photographic moment with the statement on a navy
card overlapping it, and the two yards as typographic cards beside it,
Desenzano del Garda on navy, Lanaken on the tint. Chosen from three concepts
(this, a photo-free typographic diptych, and a people-led layout built on
the client's own about-page photo of Adriano).

**The base cards deliberately carry no photographs.** Nothing in the
client's library is identified as either yard, and a picture inside a card
titled "Lanaken" claims it shows Lanaken. The single photo is atmosphere on
the section, on the same terms as the offer section's photography, with the
open question recorded in `images.ts`. When the client sends real facility
photography (Outstanding #4), the cards can take it.

The losing concepts left useful residue, kept on purpose: `copy.en.ts`
carries the `peopleNames` / `peopleRole` lines for a future team or about
page, and `images.ts` notes the verified Adriano photograph
(`Adri-per-chi-siamo.jpg`, the client's own about-page image) so nobody has
to re-establish its provenance.

### The news section

`src/sections/news/`: three stories as a card run, heading and "All news"
sharing one line so the section's exit sits at eye level rather than after
the cards.

It replaces a ruled list that read as an archive index. Cards give the
stories the photography they already have and put the section in the same
movement language as the catalogue: the identical manual mechanics, arrows
that page by one measured card and wrap at the ends, native scroll snap for
swipe, nothing automatic, and a `STORY_LIMIT` of four so it stays a tease.

**Two of the three cards are image-led and one is not**, on the catalogue's
provenance rule. Contouch SVA and Cortina de Jolie Z each have a photograph
whose filename names them. Calleryama has none anywhere in the client's
library: her son Unguessable is photographed, but putting HIS picture on HER
story attaches a photo of a different horse to a named subject, which is the
exact thing the rule exists to stop. Her card is the navy typographic
treatment carrying the gold mark, the same fallback the catalogue uses.

**With three stories the run fits at desktop, so the arrows disable
themselves there** and the section reads as a static row; it becomes a
carousel on narrower screens and the moment a fourth story exists. That is
the same measured `ResizeObserver` check the catalogue uses, not a special
case.

### The contact section

`src/sections/contact/`: the page's closing ask on a **contained navy
plate**, inset from the page edges with layered washes rather than a flat
fill.

**Contained is what makes it work.** The footer is navy too, so a full width
navy section would run straight into it; the inset keeps an ivory gutter
around the card and lets it read as a plate. Two earlier attempts are worth
knowing about: a plain centred block on ivory (too quiet for the page's only
ask) and a full bleed gold band (stood out, but spent the only gold ground
on the quietest content and forced every ink on it to invert, including the
gold accent word going gold on gold).

The plate carries `data-theme="inverse"`, so the primitives inside it switch
to their dark ground inks rather than needing per element overrides, and the
gold button and gold accent both work unchanged on navy.

**It replaced an enquiry form, and that was a bug fix as much as a redesign.**
The form had no endpoint, so submitting it called `preventDefault` and did
nothing: a visitor typed a message, pressed send, and got silence. A button
that goes somewhere real is worth more than a form that swallows enquiries,
and the question of where enquiries should land now belongs to a proper
contact page rather than to the homepage.

The button points at the client's live contact page, which exists today at
`/en/contacts/`, verified rather than guessed. TODO client-confirm: swap for
the internal `/contact` route when the new site has one.

**It carries no phone numbers or email, and that is the point.** An earlier
version listed both numbers, the email and WhatsApp under a rule, which made
the section read as a second footer stacked on the real one. The footer sits
directly beneath it and its Contact column renders those same numbers and
email from the same `copy.contact` keys, so they were duplication, not
service. WhatsApp survives as the single alternative because it is the one
channel the footer does not carry.

One accessibility detail worth keeping: the WhatsApp link uses
`text-decoration` rather than a bottom border. As a plain inline link it
measured 31px tall, under the project's 44px minimum. A border sits at the
edge of the padding box, so the vertical padding needed to reach 44px would
have pulled the underline off the text; `text-underline-offset` keeps it
tight.

### Section headlines

Every section headline renders through the `SectionHeading` primitive: one
shared size token (`--text-heading`, peaking at 55px) and one gold italic
accent word per headline, echoing the hero's treatment. The accent word
lives in copy as `headingAccent` next to each `heading`, and the primitive
splits on its first occurrence. The accent uses `--color-accent-ink`
rather than the raw gold: at heading sizes the raw gold only just clears
3:1 on ivory, and the ink variant keeps the same warmth with real margin.
The stud section's chapter quotes carry the same treatment via
`quoteAccent`.

### Copy rules

No em dashes or en dashes anywhere, in copy or in comments. Use a colon, a
comma or a full stop instead.

### The `Pedigree` component

Genetics strings are stored as arrays of ancestors, never pre-joined. `Pedigree`
renders each name in a `nowrap` span joined by gold `×` separators with an
explicit `<wbr>` break opportunity, so a line breaks only *between* generations
and never inside a horse's name. Wrapped lines get a hanging indent.

This matters: JSX strips whitespace between elements, so without the `<wbr>` the
whole pedigree is one unbreakable run and forces horizontal overflow at 390px.

### Content and i18n

All copy lives in `src/content/copy.en.ts`, typed as `Copy`. Italian at launch
means adding `copy.it.ts` satisfying the same type plus a selector: no
component changes. Facts that still need client sign-off are marked in the
source with `// TODO client-confirm`.

## Photography

`npm run images:fetch` walks the client site's Yoast sitemaps (their WordPress
REST API is blocked by a security plugin), scrapes upload URLs, strips
WordPress size suffixes to get originals, downloads them to git-ignored
`raw-images/`, and prints a dimension report.

The hero uses `src/assets/img/hero-grey.jpg` (the client's own
`NB2_4850-scaled.jpg`, 2560×2398), served through vite-imagetools as five
widths in avif, webp and jpeg. The 2560-wide avif is ~173 kB against ~645 kB
for the equivalent jpeg.

### Photo provenance rule

The client's own live site pairs at least two horses with photographs of
different horses, and one listing carries a file named `ChatGPT-Image-*.png`.
So a photograph may be attached to a named horse only when both hold: it came
from that horse's own listing page, **and** its source filename does not name
a different horse. A lookalike is never substituted, and a card goes without a
photo rather than with the wrong one.

`src/sections/available/images.ts` records the source filename beside every
photo it does use, and documents each deliberate absence with the filename
that disqualified it. Nine of the eleven catalogue horses have a verified
photograph on this rule.

**Review the dimension report before adding more.** Several of the client's
uploads are Facebook exports and are too small for full-bleed use; those need
original camera files. Sections that still lack photography render their
composition on the navy ground so layout can be reviewed without stand-ins.

## Accessibility

- One `h1`, logical heading order, `main`/`footer`/`nav` landmarks, skip link.
- Contrast audited across every rendered text node: 0 failures at AA. The
  Whole page, all eleven regions, measured at 1280, 768 and 390. The
  auditor lives in `scripts/contrast-audit.js` and loads in the console with
  `fetch('/scripts/contrast-audit.js').then(r=>r.text()).then(eval)`, which
  Vite serves in dev without it shipping in a build. **Read its header
  before trusting a result**: it exists in that shape because naive versions gave false
  failures AND false passes, most often by measuring an element box instead
  of its glyphs, by ignoring a filled button's own background, or by
  sampling colour mid-transition.
- Visible focus ring on all interactive elements; 44px minimum targets. The
  floor lives on every `CTALink` variant, not just the filled ones: the text
  variant had none, so every "See all" link on the page measured 40 to 43px
  on a phone, and those are the way out of each section.
- No skipped heading levels. The horse card's name was an `h4` directly
  under a section `h2`, which jumped a level; it is an `h3` like every other
  card title.
- `prefers-reduced-motion` handled twice: the hook reveals immediately, and the
  hidden start state only exists inside a `no-preference` media query, so
  content can never be stranded invisible.
- Status labels are readable text, not colour alone; `Sold · GB` exposes the
  country name via `<abbr title>`.

## Verified

Reviewed at 390 / 768 / 1440 (and confirmed no horizontal overflow at any of
them), production build clean, `tsc --noEmit` clean.

## Outstanding from the client

1. **Gold Pantone.** Placeholder `#b28a4d` in use.
2. **Light-background logo** (navy/gold) as transparent PNG or SVG. The supplied
   artwork is the white/gold version; the ivory header currently masks it to flat
   navy, which loses the gold crown. Vector also needed for favicon and print.
3. **Confirmation of the two-base wording.** The live site names only the
   Castelnuovo Garfagnana address; Desenzano del Garda and Lanaken come from the
   briefing.
4. **Facility photography** for both bases.
5. **Avantea stallion specifics.** The semen section is written to work without
   them.
6. **Correct photographs** for Hayley VD Berghoeve Z, the Mosito × Carma
   embryo, Carma VD Berghoeve Z and Electra Von Axe Z. In every case the
   image on the horse's own live listing page is named after a different
   horse: Carma's page carries `Jaguar-VD-B-3.jpeg`, and Electra's carries a
   file named for a United Touch S × Cortina de Jolie Z pairing. Hayley and
   the Mosito embryo are held out of the catalogue entirely; Carma and
   Electra appear as typographic cards until real photographs of themselves
   arrive. See the provenance rule under Photography.
7. **Per-horse HorseTelex and Hippomundo URLs.** Slots are built and wired to
   profile-level placeholders.
8. **Contact page and enquiry destination.** The homepage no longer carries a
   form: it had no endpoint and silently swallowed submissions, so it was
   replaced by a call to action pointing at the live `/en/contacts/` page.
   Confirm the internal route for the new site and where enquiries should
   land. The form's field labels are kept unused in `copy.en.ts` for
   whoever builds that page.
9. **WhatsApp number**: currently Elisabetta's line.
10. **News article URLs.** The live site's news cards appear to link to
    mismatched articles.
11. **Confirmation the catalogue is current.** Inventory audited 20 August 2026:
    1 foal, 4 broodmares and 15 embryo pairings available.
12. **Which horse the hero photograph shows**, before any caption names it.
13. **One line each for Cabri vd Berghoeve Z and Hypnotic JT Z.** Every other
    damline shows a single line of the stud's own prose in the embryo
    section. Cabri's listing page has none and Hypnotic JT Z has no page at
    all, so those two show no line. A sentence each and they drop straight
    in as a `note` in `src/content/pairings.ts`.
14. **The auction contradiction.** Cortina de Jolie Z's page says her first
    colt "was sold for 40 000 euro at Zangersheide Auction", and Agousha's
    says her dam sold "for 570 000 euro at Luc Henry's Stud Auction". Both
    are strong commercial proof and both contradict the hero's "Sold direct,
    never through auction". Either the positioning line softens or those
    facts stay off the site. Held out until the client decides.
15. **Photographs of Hypnotic JT Z**, who has no listing page of her own and
    so shows her pedigree in place of a portrait in the embryo section.

## Consistency rules the audit enforces

Checked by measuring the rendered page rather than reading the CSS, because
each of these was broken at some point without being visible:

| Rule | How it is checked |
| --- | --- |
| One heading size for every visible section headline (55px) | `getComputedStyle` on each `main > section h2`. The bases headline was 40px, shrunk to fit a card; the card was widened instead |
| No skipped heading levels | Walk every `h1`..`h6` in document order |
| No hex colours outside `tokens.css` | `grep` for `#` in section CSS |
| No off-scale spacing | `grep` for raw `px` in padding, margin and gap. A 4px segmented control inset was repeated in four files and is `--space-1`; a 6px card gap is `--space-2` |
| 44px minimum touch targets | Measure every `a` and `button` height at 390 |
| No page level horizontal overflow | `scrollWidth` against `clientWidth`, plus a per element sweep that ignores the deliberate right bleed tracks |
| No unrendered copy without a reason | Cross reference every `copy` key against the source; anything unused carries a comment saying why it stays |

## Launch blockers

Things that are deliberately wrong right now and must be changed before the
site goes live:

| Where | What |
| --- | --- |
| `index.html` | Remove the `noindex` meta tag |
| `src/content/results.placeholder.ts` | Set `SHOW_PLACEHOLDER_RESULTS` to `false`. Four fabricated results are rendering |
| `src/content/copy.en.ts` (`proof`) | The "Live data · Horsetelex" kicker and "updated automatically" intro are only true once the plugin is wired |
| `src/styles/tokens.css` | Swap `--raw-gold` for the client's Pantone, then re-run the contrast audit |

## Deployment

Vercel auto-detects the Vite preset. `vercel.json` sets `cleanUrls` and two
security headers; no SPA rewrites are needed. `index.html` carries the meta, OG
and JSON-LD tags and a `noindex` that must be **removed at go-live**.

## Note on the repo

The internal briefing documents live in a sibling folder and contain client PII.
They must never be copied into this repository, Vercel deploys whatever is
committed. `.gitignore` covers document formats defensively.
