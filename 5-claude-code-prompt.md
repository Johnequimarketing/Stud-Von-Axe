# Claude Code prompt: Stud Von Axe homepage

Use Claude Fable 5 for this. It gives the best result on design work of this kind.

Run the prompt below three times, once per direction. Swap the direction block at the bottom each run and keep everything else identical, so the three concepts are comparable.

Copy everything between the lines.

---

You are designing and building the homepage for Stud Von Axe, an Italian sport horse breeder. This is a concept for a client pitch, so it has to look finished and it has to look expensive.

**Who this is for**

Stud Von Axe breeds and sells foals and embryos, and sells frozen semen through Avantea. They are based at Desenzano del Garda in Italy, with a breeding base in Belgium near Lanaken where their embryos are implanted and their foals are born.

Their buyers are serious horse people: professional riders, breeders, dealers and wealthy amateurs across Europe, America and Asia. Horses in this market change hands between fifty thousand and several hundred thousand euros. These people scan a page in seconds, on a phone, often standing at a competition. They decide on feeling first and detail second.

So the page has to do two things at once. It has to feel expensive and considered within the first two seconds, and it has to make asking about a horse effortless.

**The feeling to hit**

Quiet luxury. Think of how the best fashion houses and auction houses present themselves. Restraint, generous space, confident typography, imagery that is allowed to breathe. Nothing shouts. Nothing is crowded. Every element looks like someone chose it.

Be genuinely creative here. Do not build the obvious equestrian website with a hero image and three cards underneath. Find a layout, a rhythm and a set of details that feel designed rather than assembled. Unexpected is good. Cluttered is not.

**Brand**

Dark navy blue, gold as accent, white or a soft off white as the base.

The client had one specific complaint about their old site: text on dark blue backgrounds was hard to read and felt noisy. So light backgrounds carry the content. Blue is for structure, framing, borders and bands. Gold is used sparingly, so it still means something when it appears.

Define every colour as a CSS custom property at the top of the stylesheet. The exact gold Pantone is still coming from the client and needs to be swappable in one edit.

**Structure**

Build these sections in this order.

1. Hero. **The header and hero are already designed and signed off. Do not reinterpret them.** Use `hero-final.html` in this folder as the source of truth and reproduce it exactly, then style the rest of the page in your direction's voice. In short: full bleed photograph, transparent header with the wordmark centred and a hairline rule beneath the nav, a centred display statement in caps, a short lede, two pill buttons, and a marquee of portrait horse cards along the foot of the hero. The marquee is meant to run past the fold, that is deliberate.
2. Who they are. Three or four sentences. Ontario, the base near Lanaken, foals born and raised there and sold from there. Brief on purpose.
3. Three business lines. Foals. Embryos, with frozen and implanted as separate routes. Semen sales through Avantea. Equal weight, clearly separated. The semen line is new for them, so give it real presence.
4. Available now. A selection of current foals and embryos. Each card carries an image, the genetics line, year of birth, category and status.

   Card treatment, decided with the client on 13 August: a tall portrait card, roughly three by four, with a twenty pixel radius and the photograph full bleed inside it. In its resting state the card is nothing but the photograph, no text and no overlay at all. On hover, a soft gradient rises from the foot of the card and the name, category, year and status fade in over the image. Transition around half a second, nothing faster.

   Two rules that are not optional. First, the hover reveal must be scoped to pointer devices only, using a hover and fine pointer media query. There is no hover on a phone and most of this audience is on a phone at a show, so on touch devices the gradient and the text stay permanently visible. Second, the card is a link, and the same reveal must trigger on keyboard focus with a visible focus ring.

   No corner flags, ribbons, seals or stamps in any state. The resting card is clean photography, which is what the client asked for.

   Which horses: use only the four whose photographs on the client's own site actually show the named horse. Arkhana Von Axe Z, Cortina de Jolie Z, Charina Von Axe Z sold to GB, and Unguessable Von Axe sold to the US. Hayley VD Berghoeve Z and the Mosito x Carma frozen embryo are deliberately held back, because their listing photographs on studvonaxe.it are of two entirely different horses, Ganesh Hero Z and Elvis Ter Putte. Put them back once the client supplies correct images.

   Close the section with a short stat line stating how many countries their horses have sold to, drawn from the real sold records.
5. Semen sales. Its own band, introducing Avantea and frozen semen sales, with a clear route to enquire. This is a new business line, not yet on their current site, so give it real presence. Keep the stallion specifics general: no named stallions, an invitation to ask which stallions are currently collecting.
6. Services. One compact band: sourcing horses for clients, mediation, mares available for sport and breeding. Short.

   Also include a band on the two bases, placed after Who they are: Desenzano del Garda in Italy, the base in Belgium close to Lanaken where the vet team implants the embryos and the foals are born and raised, and embryo production out of Ontario. This is their most concrete difference from other breeders and it deserves more than the sentence it used to get.

   Every horse card carries a HorseTelex link and a Hippomundo link. The brief is explicit that both go on every horse, because some buyers prefer one and some the other, and the client treats it as extra service. Until per horse URLs arrive, point them at the stud HorseTelex profile and the Hippomundo homepage and mark them as placeholders in a comment.
7. News and results. Real competition results, not sales data: Calleryama, ridden by Gilles Thomas, winning the Barcelona Nations Cup and placing second at Madrid CSI3 star. Offspring of their broodmare Cortina de Jolie Z placing at the Lanaken 2022 World Championships for young horses. This is their sport proof, separate from the sold stat line in the Available now section.

   Style this as a competition results feed rather than a news blog, so it sits in the same family as the automated HorseTelex feeds running on Stal 104 and Gugler. It is a static mock for now: say so in a comment, carry a visible caption that results connect to a live feed once wired, and never present it to the client as live data. Do not invent additional results, these two are all we have verified.

8. Instagram. A grid linking out to instagram.com/studvonaxe. Two of the agency's other stable sites run a social feed and the client posts results there. A real embed needs API access we do not have, so use photographs from their own site as representative images. Never write invented captions, like counts or post dates.
9. Contact. A short form and a WhatsApp button.
10. Footer. Navigation, language switcher, social links, contact details, space for HorseTelex and Hippomundo.

**Copy rules**

Write all copy in English, in a human voice. Short sentences. Plain words. Nothing that sounds like it came out of a template or out of an AI.

Never use hyphens or dashes as punctuation anywhere in the copy.

Do not write marketing filler. No "where excellence meets passion", no "your journey starts here", no "we go above and beyond". Say concrete things about horses, breeding and what they actually do.

Use real content pulled from studvonaxe.it: their horses, genetics lines, photography and news items. Never lorem ipsum.

**Icons**

Use unicode characters for all icons. No icon libraries, no SVG icon sets, no font icons. Choose characters that fit the restrained tone, at a weight and size that reads as deliberate rather than decorative.

**Technical**

Static HTML and CSS in a single file, with minimal JavaScript only where it earns its place.

Fully responsive. Test at 390, 768 and 1440. The horse cards and the long genetics lines are where layouts break, so solve those first. Design the card sections mobile first.

Self host the fonts or load them correctly, and check the licence on anything outside Google Fonts.

Body text at 17 or 18 pixels. Line length between 60 and 75 characters. Build the navigation so it still works when the labels are in German or French, which run longer than English.

Interaction should be subtle. Slow transitions, restrained hover states, no animation that draws attention to itself.

**Deliverable**

One complete homepage, ready to deploy to Vercel and show to a client.

---

**Direction blocks**

Paste one of these at the end of the prompt for each run.

**Direction A: Classic**

Traditional European stud. Restrained and timeless. Headings in Cormorant Garamond or EB Garamond, body in Inter or Source Sans 3. Generous line height, wide margins, a great deal of white space. Fine blue rules between sections. Gold on hover states and small labels only. Cards follow the shared portrait and hover reveal described in section 4. Within that, keep this direction's restraint: the revealed status is a small italic caption and the gradient is the lightest of the three.

**Direction B: Modern editorial**

Magazine feel. Strong contrast between headline and body. Headings in Instrument Serif or Fraunces, body in Manrope or Geist. Large display type with tight tracking, asymmetric layouts, full bleed imagery, text overlapping image edges. Gold as a thin underline or marker on key words. Cards follow the shared portrait and hover reveal described in section 4. Within that, the revealed status is a bold sans label and sold cards swap the call to action to asking about a similar horse.

**Direction C: Contemporary refined**

The most modern of the three. Quiet and disciplined, closer to how good fashion and design brands present themselves. Headings in Libre Caslon Display or Newsreader, body in Jost or Archivo. Strong grid, precise spacing, small caps for labels and categories. Blue as full bands for separation with white cards sitting on top. Gold reserved almost entirely for status and interaction. Cards follow the shared portrait and hover reveal described in section 4. Within that, the revealed status is small caps, letter spaced, marked with a small gold dot.
