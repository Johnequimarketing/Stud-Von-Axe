/* The reach data, derived from the catalogue and nothing else.
 *
 * This is the one place on the page that evidences international reach,
 * and it has been homeless since the results section was rebuilt. Every
 * number here is COUNTED from the placements: the client's own site says
 * "our horses around the world" and almost certainly has more
 * destinations than these, but a claim only appears here once a horse and
 * a country exist for it. See the TODO in content/horses.ts. */

import { recentPlacements } from '@/content/horses'
import { COUNTRY_NAMES } from '@/content/types'

export interface Placement {
  horse: string
  country: string
}

/** Every placed horse with the country it went to, in catalogue order. */
export const placements: Placement[] = recentPlacements
  .filter((horse) => horse.status.kind === 'sold')
  .map((horse) => ({
    horse: horse.name,
    country:
      horse.status.kind === 'sold'
        ? (COUNTRY_NAMES[horse.status.country] ?? horse.status.country)
        : '',
  }))

/** Distinct destinations, which is the only country count we may state. */
export const countries: string[] = [
  ...new Set(placements.map((p) => p.country)),
]

/* Spelled out reads better than a numeral at display size, and the map
   only covers what the catalogue could plausibly reach. Anything past it
   falls back to the numeral rather than guessing a word. */
const WORDS = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
]

export function spell(n: number) {
  return WORDS[n] ?? String(n)
}
