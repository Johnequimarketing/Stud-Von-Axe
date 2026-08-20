import { COUNTRY_NAMES, type Horse } from './types'

/* Catalogue data audited from studvonaxe.it on 20 August 2026.
   TODO client-confirm: inventory is current at build time only: confirm with the client before launch. */

/** The one foal currently available. Carries the featured slot. */
export const featuredFoal: Horse = {
  id: 'arkhana-von-axe-z',
  name: 'Arkhana Von Axe Z',
  category: 'foal',
  sex: 'colt',
  year: 2026,
  pedigree: [
    'Aganix du Seigneur Z',
    'Cornet Obolensky',
    'Calato',
    'Darco',
    'Chin Chin',
  ],
  status: { kind: 'available' },
  studbook: 'Zangersheide',
  featured: true,
}

/** Broodmares listed as available. Only horses whose published photo
    matches the named horse are shown: see the photography note in
    the project plan. */
export const availableMares: Horse[] = [
  {
    id: 'cortina-de-jolie-z',
    name: 'Cortina de Jolie Z',
    category: 'broodmare',
    sex: 'mare',
    year: 2019,
    pedigree: ['Cornet Obolensky', 'Calato', 'Darco', 'Chin Chin'],
    status: { kind: 'available' },
    studbook: 'Zangersheide',
  },
  {
    id: 'cabri-vd-berghoeve-z',
    name: 'Cabri vd Berghoeve Z',
    category: 'broodmare',
    sex: 'mare',
    year: 2020,
    pedigree: [
      'Cornet Obolensky',
      'Diamant de Semilly',
      'Darco',
      'Chin Chin',
    ],
    status: { kind: 'available' },
    studbook: 'Zangersheide',
  },
  {
    id: 'agousha-vd-berghoeve-z',
    name: 'Agousha vd Berghoeve Z',
    category: 'broodmare',
    sex: 'mare',
    year: 2022,
    pedigree: [
      'Aganix du Seigneur',
      'Diamant de Semilly',
      'Darco',
      'Chin Chin',
    ],
    status: { kind: 'available' },
    studbook: 'Zangersheide',
  },
  {
    id: 'carma-vd-berghoeve-z',
    name: 'Carma vd Berghoeve Z',
    category: 'broodmare',
    sex: 'mare',
    year: 2024,
    pedigree: ['Comme il Faut', 'Nabab de Reve', 'Jalisco B'],
    status: { kind: 'available' },
    studbook: 'Zangersheide',
  },
]

/** Recent placements: sold-to country is the proof of reach, shown as
    quiet text rather than a badge. */
export const recentPlacements: Horse[] = [
  {
    id: 'charina-von-axe-z',
    name: 'Charina Von Axe Z',
    category: 'foal',
    sex: 'filly',
    year: 2026,
    pedigree: ['Chacco Blue', 'Cornet Obolensky', 'Calato', 'Darco'],
    status: { kind: 'sold', country: 'GB' },
  },
  {
    id: 'unique-touch-von-axe-z',
    name: 'Unique Touch Von Axe Z',
    category: 'foal',
    year: 2026,
    pedigree: ['United Touch S', 'Cornet Obolensky', 'Calato', 'Darco'],
    status: { kind: 'sold', country: 'BR' },
  },
  {
    id: 'electra-von-axe-z',
    name: 'Electra Von Axe Z',
    category: 'foal',
    year: 2026,
    pedigree: [
      "Emerald van 't Ruytershof",
      'Aganix du Seigneur',
      'Diamant de Semilly',
      'Darco',
    ],
    status: { kind: 'sold', country: 'NL' },
  },
  {
    id: 'dune-von-axe-z',
    name: 'Dune Von Axe Z',
    category: 'foal',
    year: 2025,
    pedigree: [
      'Diamant de Semilly',
      'Halifax van het Kluizebos',
      'Carthago',
    ],
    status: { kind: 'sold', country: 'PL' },
  },
  {
    id: 'coolrock-von-axe-z',
    name: 'Coolrock Von Axe Z',
    category: 'foal',
    year: 2024,
    pedigree: ['Chacco Blue', 'Halifax van het Kluizebos', 'Carthago'],
    status: { kind: 'sold', country: 'IE' },
  },
  {
    id: 'dourkhet-von-axe-z',
    name: 'Dourkhet Von Axe Z',
    category: 'foal',
    year: 2024,
    pedigree: ['Dourkhan Hero Z', 'Cornet Obolensky', 'Calato', 'Darco'],
    status: { kind: 'sold', country: 'US' },
  },
]

/** The catalogue the homepage carousel walks: the featured foal first,
    then the mares. Only horses actually with the stud, because the
    section says "Available now" and a sold horse is not available.
    `recentPlacements` still holds the horses that have gone abroad: their
    destination countries are the proof of international reach and want a
    home of their own, not a Sold badge inside the available run. */
export const catalogue: Horse[] = [featuredFoal, ...availableMares]

/** Countries Von Axe horses have actually gone to, DERIVED from the sold
    listings rather than written down.
 *
 *  This was previously a hand written list of fifteen countries, with a
 *  comment claiming it came from the sold listings. It did not: only six of
 *  the fifteen appear anywhere in this data, and the client's own site
 *  publishes no country list at all. The brief forbids inventing reach, so
 *  the list now can only ever contain what a listing evidences, and adding
 *  a country means adding the sold horse it came from.
 *
 *  TODO client-confirm: they say "our horses around the world" and almost
 *  certainly have more destinations than these six. Any addition needs the
 *  horse and the country from them. */
export const destinationCountries = [
  ...new Set(
    recentPlacements
      .map((horse) =>
        horse.status.kind === 'sold' ? COUNTRY_NAMES[horse.status.country] : null,
      )
      .filter((name): name is string => Boolean(name)),
  ),
]
