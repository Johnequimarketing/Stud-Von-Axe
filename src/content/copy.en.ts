/* All user-facing copy. Adding Italian later means adding copy.it.ts
   with the same shape: no component changes. */

export const copy = {
  brand: {
    name: 'Stud Von Axe',
    tagline: 'Breeding and horse trading',
  },

  nav: {
    foals: 'Foals',
    embryos: 'Embryos',
    semen: 'Semen',
    results: 'Results',
    news: 'News',
    contact: 'Contact',
    enquire: 'Enquire',
    menu: 'Menu',
    close: 'Close',
    skip: 'Skip to content',
  },

  hero: {
    /* Single statement, one accent word set in italic gold. */
    headingBefore: 'Showjumping bloodlines,',
    headingAccent: 'proven',
    headingAfter: 'in sport.',
    intro:
      'An Italian breeding programme producing foals and embryos from mares selected on pedigree and produce. Sold direct, never through auction.',
    primaryCta: 'See what is available',
    secondaryCta: 'Contact us',
  },

  intro: {
    eyebrow: 'The stud',
    heading: 'Born from a great passion for horses.',
    cta: 'More about the stud',

    /* Chaptered telling of the stud's story, one fact per chapter, all
       drawn from the client briefing or their own site. */
    chapters: [
      {
        id: 'beginning',
        number: '01',
        label: 'The beginning',
        quote: 'Born from a great passion for horses.',
        quoteAccent: 'passion',
        body: 'Stud Von Axe is the result of many years spent on the best German farms and of extensive research into the best international families. That knowledge became the standard every broodmare here still has to meet.',
      },
      {
        id: 'our-way',
        number: '02',
        label: 'Our way',
        quote: 'Pedigree and produce, nothing else.',
        quoteAccent: 'produce',
        body: 'Mares are selected on what they are and what they have produced. Our relationship with our customers is based on honesty and absolute transparency in all our sales.',
      },
      {
        id: 'today',
        number: '03',
        label: 'Today',
        quote: 'From Italy to the world, direct.',
        quoteAccent: 'world',
        body: 'Every pairing begins in Italy. Our team in Belgium manages the pregnancies and raises each foal until it is ready to leave. Every horse is sold direct, never through auction.',
      },
    ],
    /* TODO client-confirm: principals' full names and titles before any
       formal attribution appears. First names are already public on the
       site's contact page. */
    attribution: 'Adriano & Elisabetta',
    attributionRole: 'Stud Von Axe',

    /* Card text for the badge and card floating over the photograph. */
    cardQuote: 'From Italy, to the world.',
    cardCaption: 'ITALY · BELGIUM · SOLD DIRECT',
  },

  offer: {
    eyebrow: 'What we offer',
    heading: 'Three ways into the programme.',
    headingAccent: 'programme',
    lines: [
      {
        id: 'foals',
        number: '01',
        title: 'Foals',
        description:
          'Born and raised at our Belgian base, out of mares chosen for jumping ability and temperament.',
        href: '#available',
        cta: 'See the foals',
      },
      {
        id: 'embryos',
        number: '02',
        title: 'Embryos',
        description:
          'Frozen and implanted, from our own damlines. Pairings made on pedigree and produce.',
        href: '#bloodlines',
        cta: 'See the pairings',
      },
      {
        id: 'semen',
        number: '03',
        title: 'Semen',
        description:
          'Frozen semen through Avantea in Cremona, shipped across the EU and for export.',
        href: '#semen',
        cta: 'About semen sales',
      },
    ],
  },

  available: {
    eyebrow: 'Available now',
    heading: 'Horses with us today.',
    headingAccent: 'today',
    featuredLabel: 'Featured',
    intro:
      'Foals and broodmares with us now, sold direct rather than through auction.',
    filters: [
      { id: 'all', label: 'All horses' },
      { id: 'foal', label: 'Foals' },
      { id: 'broodmare', label: 'Broodmares' },
    ],
    filterLabel: 'Filter the catalogue',
    prevLabel: 'Previous horses',
    nextLabel: 'Next horses',
    /* The brief asks each card to name its own destination: "View [name]'s
       page". The horse's short name keeps it to one line on a 300px card. */
    cardCta: 'View',
    seeAll: 'See all horses',
    enquire: 'Enquire',
    enquireAbout: 'Enquire about',
    /* Not rendered. Labels for the per-horse pedigree links, which are a
       client dependency: the site only has profile level URLs so far. */
    horsetelex: 'HorseTelex',
    hippomundo: 'Hippomundo',
  },

  bloodlines: {
    eyebrow: 'Embryos',
    heading: 'The blood never lies.',
    headingAccent: 'blood',
    bodyShort:
      'Pairings made on pedigree and produce, from damlines we have built and kept.',
    frozenLabel: 'Frozen',
    expectedLabel: 'Expected',
    pairingWord: 'pairing',
    pairingWordPlural: 'pairings',
    pairingsCta: 'See the pairings',
    damlineSelectLabel: 'Choose a damline',
    /* Labels for the compact spec row. Every value under them is counted
       from the pairing data, never written here. */
    specPairings: 'Pairings',
    specForm: 'Form',
    specAvailable: 'Available',

    /* Not rendered on the homepage. The section deliberately carries a name,
       a pedigree, one line and three counted facts, so these were cut from
       it. They are real approved copy and the embryo detail pages will want
       them, and this repo has no version control to recover them from, so
       they stay here rather than being deleted. */
    body: 'Pairings are made on pedigree and produce, from damlines we have built and kept. An embryo carries the same decisions as a foal, made a year earlier.',
    frozenNote:
      'Frozen embryos are flushed and stored, shipped with full documentation.',
    expectedNote:
      'Expected embryos are already carried by our recipient mares in Belgium, with the pregnancy managed by our vet team.',
  },

  semen: {
    eyebrow: 'Semen sales',
    heading: 'Semen, through Avantea.',
    headingAccent: 'Avantea',
    /* Short on purpose: the three panels below carry the form, the centre
       and the reach, so the description carries only the credibility and
       the one caveat that explains why no stallions are named. */
    body: "Handled through one of Europe's reference centres for equine reproduction, with stallion availability on request.",
    cta: 'Ask about availability',

    /* The same three facts recast as a journey for the Route concept: no
       fact appears here that is not already in `specs`. The last step is
       the ask, which is why its text is the availability caveat. */
    routeSteps: [
      { label: 'Frozen', text: 'At the Avantea laboratory in Cremona', icon: 'frozen' },
      { label: 'Shipped', text: 'Across the EU and for export', icon: 'export' },
      { label: 'To your mare', text: 'Stallion availability on request', icon: 'node' },
    ],

    /* Not rendered: the section became a route, so these three facts are
       carried by `routeSteps` instead. Kept for a semen detail page, where
       a spec table is the right shape. `icon` names an entry in the Icon
       primitive, paired in content so it is a decision rather than array
       order. TODO client-confirm: no stallion names are published yet. */
    specs: [
      { label: 'Form', value: 'Frozen', icon: 'frozen' },
      { label: 'Centre', value: 'Avantea, Cremona', icon: 'laboratory' },
      { label: 'Shipping', value: 'EU and export', icon: 'export' },
    ],
  },

  proof: {
    /* TODO client-confirm: this kicker and the intro claim the feed is live
       and automatic. Neither is true until the Horsetelex plugin is wired,
       so both are a promise the site should not make before then. */
    liveLabel: 'Live data · Horsetelex',
    heading: 'Our horses in the ring.',
    headingAccent: 'in the ring',
    intro:
      'The latest international results from the horses in our collection, updated automatically through Horsetelex.',
    allResults: 'All results',
    /* Joining words inside a result card. */
    by: 'by',
    with: 'with',
    /* Shown in place of the cards until the feed is connected, so the
       section never sits empty and never fakes a row. */
    awaiting: 'Results appear here as soon as the feed is connected.',

    /* Not rendered by the live results design. Kept because they are real
       approved copy and this repo has no version control to recover them
       from. */
    resultsLabel: 'Also of note',
    reachLabel: 'Von Axe horses are with breeders and riders in',
  },

  bases: {
    eyebrow: 'The two bases',
    heading: 'Italy and Belgium.',
    headingAccent: 'Belgium',
    /* Derived from the audited base roles, nothing more: no distance, no
       founding dates, no acreage. */
    body: 'One programme across two yards.',
    /* Not rendered: written for a people-led concept that lost the bases
       round. A team or about page will want them, so they stay. First names
       are public on the client's contact page. */
    peopleNames: 'Adriano & Elisabetta',
    peopleRole: 'The programme is theirs: every pairing, both yards.',
  },

  news: {
    eyebrow: 'News',
    heading: 'From the stud.',
    headingAccent: 'stud',
    readMore: 'Read',
    viewAll: 'All news',
    prevLabel: 'Previous stories',
    nextLabel: 'Next stories',
  },

  contact: {
    eyebrow: 'Get in touch',
    heading: 'Ask about a horse.',
    headingAccent: 'horse',
    /* Two short lines: this is the page's closing ask, not a form. */
    body: 'Tell us what you are looking for and we will come back to you directly. We are happy to arrange a visit to either base.',
    cta: 'Contact us',
    /* WhatsApp is the one channel the footer does not carry, so it is the
       CTA's single alternative. The phones and email live in the footer
       directly beneath the section. */
    directLabel: 'Or message us on',
    whatsapp: 'WhatsApp',
    /* Real, already public on the client's own site. */
    contacts: [
      { name: 'Elisabetta', phone: '+39 349 591 8565', tel: '+393495918565' },
      { name: 'Adriano', phone: '+39 348 395 3433', tel: '+393483953433' },
    ],
    email: 'studvonaxe@gmail.com',
    /* TODO client-confirm: which line should the WhatsApp button use? */
    whatsappNumber: '393495918565',

    /* Not rendered. These were the enquiry form's labels, and the form was
       removed because it posted nowhere. Kept for a real contact page, and
       because this repo has no version control to recover them from. */
    nameLabel: 'Name',
    emailLabel: 'Email',
    messageLabel: 'Message',
    messagePlaceholder: 'Which horse or pairing are you interested in?',
    submit: 'Send enquiry',
  },

  /* ---- Direction C: La Tenuta -----------------------------------------
     Copy for the third homepage direction. Every line here is either
     approved copy reused from the blocks above, a fact audited from the
     client's own site, or a neutral invitation. Nothing new is claimed. */
  tenuta: {
    arrival: {
      /* The stud's own base, already public on the client's contact page. */
      location: 'Desenzano del Garda · Italia',
      cta: 'Discover the horses',
    },

    statement: {
      /* The client's own words, from the stud story above. */
      before: 'Born from a great',
      accent: 'passion',
      after: 'for horses.',
      support:
        'The result of many years spent on the best German farms and of extensive research into the best international families.',
    },

    estate: {
      label: 'The stud',
      heading: 'One programme across two yards.',
      headingAccent: 'two yards',
      /* Condensed from the three approved chapters, word for word where it
         matters. */
      body: 'Mares are selected on what they are and what they have produced. Every pairing begins in Italy, our team in Belgium manages the pregnancies and raises each foal until it is ready to leave, and every horse is sold direct, never through auction.',
      cta: 'More about the stud',
      yards: [
        {
          place: 'Desenzano del Garda',
          region: 'Italia',
          role: 'Where the pairings are made and the embryos begin.',
        },
        {
          place: 'Lanaken',
          region: 'Belgio',
          role: 'Where the pregnancies are managed and the foals are raised.',
        },
      ],
    },

    horses: {
      label: 'The horses',
      /* The client's own chapter quote, and exactly what this section
         shows: the horses standing here and the produce already sold. */
      heading: 'Pedigree and produce.',
      headingAccent: 'produce',
      intro:
        'Foals and broodmares from the programme, and where they have gone.',
      view: 'View',
      seeAll: 'See all horses',
      soldWord: 'Sold',
      listLabel: 'Choose a horse',
    },

    terra: {
      /* The approved journey-card line and caption, at full size. */
      statement: 'From Italy, to the world.',
      statementAccent: 'world',
      caption: 'Italy · Belgium · Sold direct',
    },

    programme: {
      label: 'The programme',
      /* The approved offer heading. Block titles, descriptions and the
         semen facts are read from `offer` and `semen` above, never
         duplicated here. */
      pairingsCta: 'Ask about the pairings',
      /* The embryo stats are counted from the pairing data at render
         time, never written here. */
      statPairings: 'Pairings',
      statDamlines: 'Damlines',
      statExpected: 'Expected',
    },

    proof: {
      label: 'Results',
      /* TODO client-confirm: same caveat as `proof` above. The feed is not
         live until the Horsetelex plugin is wired. */
      source: 'Horsetelex',
    },

    gallery: {
      label: 'From the yards',
    },
  },

  /* ---- Direction D: "Cielo" ------------------------------------------
     The airy pastel fold: a stacked display statement over a soft sky
     ground, the photograph melting up into it, and a frosted glass
     feature bar. Every line is approved copy or an audited fact restated;
     nothing new is claimed. */
  cielo: {
    /* The programme, as a numbered selector: three cards choose which
       panel shows. Titles, descriptions and CTAs are reused from the
       approved `offer` block; only the panels' own labels and tags are
       new. Every tag restates an audited fact, and the embryo tags are
       COUNTED from pairings.ts at render, never written. */
    programme: {
      label: 'The programme',
      heading: 'Three ways into the programme.',
      headingAccent: 'programme',
      intro:
        'Foals raised in Belgium, embryos from our own damlines, and frozen semen through Avantea.',
      selectLabel: 'Choose part of the programme',
      seeAll: 'Ask about the programme',
      panels: {
        foals: {
          eyebrow: 'Foals',
          meta: 'Lanaken, Belgium',
          /* Sourced from the approved offer line: "Born and raised at our
             Belgian base, out of mares chosen for jumping ability and
             temperament." */
          tags: ['Belgian base', 'Raised on site', 'Out of our own mares'],
          photoAlt: 'A dark bay foal standing in a summer field',
        },
        embryos: {
          eyebrow: 'Embryos',
          meta: 'From our own damlines',
          /* Tags are counted at render; see ProgrammeCielo. */
          tags: ['Frozen or implanted'],
          photoAlt: 'A mare standing with her foal in a paddock',
        },
        semen: {
          eyebrow: 'Semen',
          meta: 'Avantea, Cremona',
          tags: ['Frozen', 'Avantea, Cremona', 'EU and export', 'On request'],
          photoAlt: 'A plaited horse neck and shoulder in close up',
        },
      },
    },

    /* The gallery. Captions name a horse ONLY where the photograph is
       verified as that horse under the provenance rule; everything else
       gets a subject description or no caption at all. The Instagram
       handle and URL are the client's own, already public in the footer. */
    gallery: {
      label: 'Gallery',
      heading: 'From the yards.',
      headingAccent: 'yards',
      follow: 'Follow on Instagram',
      handle: '@studvonaxe',
      instagramUrl: 'https://www.instagram.com/studvonaxe/',
    },

    /* The reach section. The statement and caption are the approved
       journey lines; every number beside them is counted from the
       placements at render time. */
    reach: {
      label: 'Reach',
      statement: 'From Italy, to the world.',
      statementAccent: 'world',
      countriesWord: 'countries',
      listLabel: 'Placed horses and their destinations',
      /* Concept D's plate. The body is the section's own fact stated
         plainly: both yards, and horses now standing abroad. */
      plateBody:
        'Every pairing begins in Italy and every foal is raised in Belgium. The produce goes on from there, and horses bred here now stand with riders and breeders abroad.',
      plateCta: 'Ask about a horse',
      photoAlt: 'A horse and rider competing at an outdoor showjumping venue',
    },

    /* The horses carousel reuses the approved horses copy (label,
       heading, intro, view, seeAll); only the carousel's own controls are
       new here. */
    horses: {
      prev: 'Previous horses',
      next: 'Next horses',
      /* The run wraps, so the controls never dead end. Announced on the
         region so a keyboard user knows before they reach the last card. */
      regionLabel: 'Horses, a looping run',

      /* The category filter. Labels only: every count beside them is
         derived from the catalogue at render time, never written here, and
         a bucket with nothing in it never renders a chip at all. */
      filterLabel: 'Filter by type',
      filterAll: 'All horses',
      categories: {
        foal: 'Foals',
        broodmare: 'Broodmares',
        'sport-horse': 'Sport horses',
      },
      /* Spoken after a filter changes, so the swap is not silent. */
      resultCount: (n: number) => (n === 1 ? '1 horse' : `${n} horses`),
    },

    /* The stud section reuses the approved estate copy wholesale (label,
       heading, body, yards): only what the instax deck adds is new. */
    estate: {
      /* Captions describe the SUBJECT, never a place or a horse: these two
         photographs came from the client's own site and neither can be
         tied to a named horse or a named yard on the provenance rule. */
      photos: [
        { caption: 'Mare and foal', alt: 'A mare standing with her foal in a paddock' },
        { caption: 'The yard', alt: 'Horses in a stable yard on a bright day' },
      ],
      swapLabel: 'Show the next photograph',
      /* Read by screen readers when the deck changes, so the swap is not
         a silent visual event. */
      nowShowing: (caption: string) => `Now showing: ${caption}`,
    },

    arrival: {
      location: 'Desenzano del Garda · Italia',
      /* The client's own tagline, stacked as the display statement. */
      headlineTop: 'The blood',
      headlineBottom: 'never lies.',
      subTop: 'Italian showjumping bloodlines,',
      subBottom: 'proven in sport',
      cta: 'See what is available',
      photoAlt: 'A dark bay foal standing in a summer field at the Belgian base',
      /* The glass bar: four audited facts, one line each. */
      features: [
        {
          icon: 'node',
          title: 'Proven damlines',
          text: 'Pairings on pedigree and produce',
        },
        {
          icon: 'arch',
          title: 'Two bases',
          text: 'Italy and Belgium, one programme',
        },
        {
          icon: 'seal',
          title: 'Sold direct',
          text: 'Never through auction',
        },
        {
          icon: 'export',
          title: 'EU and export',
          text: 'Semen through Avantea, Cremona',
        },
      ],
    },
  },

  footer: {
    navHeading: 'Navigate',
    contactHeading: 'Contact',
    pedigreeHeading: 'Pedigrees',
    followHeading: 'Follow',
    social: [
      { label: 'Instagram', href: 'https://www.instagram.com/studvonaxe/' },
      { label: 'Facebook', href: 'https://www.facebook.com/StudVonAxe/' },
      {
        label: 'YouTube',
        href: 'https://www.youtube.com/channel/UCSw5nRpEP1NTAkQHyrfJZOg',
      },
    ],
    /* TODO client-confirm: per-horse pedigree URLs. These are the
       profile-level pages. */
    pedigreeLinks: [
      {
        label: 'HorseTelex',
        href: 'https://www.horsetelex.com/sponsors/profile/4368/stud-von-axe',
      },
      { label: 'Hippomundo', href: 'https://www.hippomundo.com/' },
    ],
    legal: 'Stud Von Axe Az. Agr. s.s.',
    language: { current: 'EN', other: 'IT' },
  },

  status: {
    /* `available` is not rendered: every horse in the catalogue section is
       available, so a badge saying so on all of them was noise. Kept for a
       detail page and for the day a mixed run needs it. */
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
  },
} as const

export type Copy = typeof copy
