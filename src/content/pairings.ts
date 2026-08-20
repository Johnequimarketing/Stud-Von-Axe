import type { Damline } from './types'

/* Embryo offers, grouped by damline: the real families the stud breeds
   from. Audited from studvonaxe.it/en/embryos on 20 August 2026.
 *
 * The `note` on a damline is the stud's OWN prose from that mare's listing
 * page, cut to one line for the homepage. Nothing here is written for
 * them. Where their page carries no prose, the field is absent and the
 * homepage shows no line, which is why two of the five are missing:
 *   cabri-vd-berghoeve-z  page has no prose at all
 *   hypnotic-jt-z         has no page of her own, and the foal page out of
 *                         her carries no prose about her either
 * TODO client-confirm: one line each for Cabri and Hypnotic JT Z.
 *
 * Two sentences on those pages were deliberately NOT used, because both
 * name auction sales and the site's own positioning is "sold direct, never
 * through auction": Cortina's first colt "was sold for 40 000 euro at
 * Zangersheide Auction", and Agousha's dam "was sold as breeding mare for
 * 570 000 euro at Luc Henry's Stud Auction". Strong commercial proof, but
 * it contradicts the hero. Client decision, flagged not silently dropped. */

export const damlines: Damline[] = [
  {
    id: 'cortina-de-jolie-z',
    dam: 'Cortina de Jolie Z',
    pedigree: ['Cornet Obolensky', 'Calato', 'Darco', 'Chin Chin'],
    /* Their words: "Fuga is the full sister of the 5* Grand Prix mare Sea
       Coast Ferly (ex Ferly de Muze)." */
    note: 'Her dam Fuga de Muze is a full sister to the 5* Grand Prix mare Sea Coast Ferly.',
    pairings: [
      {
        id: 'emerald-x-cortina',
        sire: "Emerald van 't Ruytershof",
        expectedYear: 2027,
        form: 'expected',
        status: { kind: 'available' },
      },
      {
        id: 'aganix-x-cortina',
        sire: 'Aganix du Seigneur Z',
        expectedYear: 2027,
        form: 'expected',
        status: { kind: 'available' },
      },
      {
        id: 'catoki-x-cortina',
        sire: 'Catoki',
        expectedYear: 2027,
        form: 'expected',
        status: { kind: 'available' },
      },
      {
        id: 'united-touch-x-cortina',
        sire: 'United Touch S',
        expectedYear: 2027,
        form: 'frozen',
        status: { kind: 'available' },
      },
      {
        id: 'dourkhan-x-cortina',
        sire: 'Dourkhan Hero Z',
        expectedYear: 2027,
        form: 'frozen',
        status: { kind: 'available' },
      },
      {
        id: 'big-star-x-cortina',
        sire: 'Big Star',
        expectedYear: 2027,
        form: 'frozen',
        status: { kind: 'available' },
      },
      {
        id: 'uricas-x-cortina',
        sire: 'Uricas vd Kattevennen',
        expectedYear: 2027,
        form: 'frozen',
        status: { kind: 'available' },
      },
    ],
  },
  {
    id: 'cabri-vd-berghoeve-z',
    dam: 'Cabri vd Berghoeve Z',
    pedigree: ['Cornet Obolensky', 'Diamant de Semilly', 'Darco', 'Chin Chin'],
    pairings: [
      {
        id: 'united-touch-x-cabri',
        sire: 'United Touch S',
        expectedYear: 2027,
        form: 'expected',
        status: { kind: 'available' },
      },
      {
        id: 'zandor-x-cabri',
        sire: 'Zandor Z',
        expectedYear: 2027,
        form: 'expected',
        status: { kind: 'available' },
      },
      {
        id: 'chacco-blue-x-cabri',
        sire: 'Chacco Blue',
        expectedYear: 2027,
        form: 'expected',
        status: { kind: 'available' },
      },
    ],
  },
  {
    id: 'hypnotic-jt-z',
    dam: 'Hypnotic JT Z',
    pedigree: ['Halifax van het Kluizebos', 'Carthago'],
    pairings: [
      {
        id: 'for-pleasure-x-hypnotic',
        sire: 'For Pleasure',
        expectedYear: 2027,
        form: 'expected',
        status: { kind: 'available' },
      },
      {
        id: 'comme-il-faut-x-hypnotic',
        sire: 'Comme il Faut',
        expectedYear: 2027,
        form: 'frozen',
        status: { kind: 'available' },
      },
      {
        id: 'catoki-x-hypnotic',
        sire: 'Catoki',
        expectedYear: 2027,
        form: 'frozen',
        status: { kind: 'available' },
      },
    ],
  },
  {
    id: 'agousha-vd-berghoeve-z',
    dam: 'Agousha vd Berghoeve Z',
    pedigree: ['Aganix du Seigneur', 'Diamant de Semilly', 'Darco', 'Chin Chin'],
    /* Their words: "Agousha it's the diamond of our collection" and "Full
       sister of ATTOUCHA (160j) and H5 ALANA HERO Z (150j)." */
    note: 'The diamond of our collection, full sister to Attoucha (160) and H5 Alana Hero Z (150).',
    pairings: [
      {
        id: 'cornet-x-agousha',
        sire: 'Cornet Obolensky',
        expectedYear: 2027,
        form: 'expected',
        status: { kind: 'available' },
      },
    ],
  },
  {
    id: 'carma-vd-berghoeve-z',
    dam: 'Carma vd Berghoeve Z',
    pedigree: ['Comme il Faut', 'Nabab de Reve', 'Jalisco B'],
    /* Their page carries one line, as a heading: "Sister of Jaguar vd
       Berghoeve!" */
    note: 'Sister of Jaguar vd Berghoeve.',
    pairings: [
      {
        id: 'mosito-x-carma',
        sire: 'Mosito van het Hellehof',
        expectedYear: 2027,
        form: 'frozen',
        status: { kind: 'available' },
      },
    ],
  },
]

/** Total available pairings, derived: never hardcoded. */
export const availablePairingCount = damlines.reduce(
  (total, line) =>
    total + line.pairings.filter((p) => p.status.kind === 'available').length,
  0,
)
