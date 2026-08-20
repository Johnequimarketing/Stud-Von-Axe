/* Typed content models. Every value that reaches the page is real data
   pulled from studvonaxe.it or the client briefing: never invented. */

export type CountryCode =
  | 'IT' | 'GB' | 'NL' | 'BE' | 'DE' | 'FR' | 'ES' | 'IE'
  | 'PL' | 'LT' | 'CZ' | 'SI' | 'US' | 'BR' | 'AR'

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  IT: 'Italy',
  GB: 'Great Britain',
  NL: 'Netherlands',
  BE: 'Belgium',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IE: 'Ireland',
  PL: 'Poland',
  LT: 'Lithuania',
  CZ: 'Czechia',
  SI: 'Slovenia',
  US: 'United States',
  BR: 'Brazil',
  AR: 'Argentina',
}

export type SaleStatus =
  | { kind: 'available' }
  | { kind: 'reserved' }
  | { kind: 'sold'; country: CountryCode }

export type HorseCategory = 'foal' | 'broodmare' | 'sport-horse'
export type Sex = 'colt' | 'filly' | 'mare' | 'gelding' | 'stallion'

export interface ImageRef {
  /** Optimized `?as=picture` import, or a plain URL while sourcing. */
  src: string
  alt: string
  width?: number
  height?: number
}

export interface Horse {
  id: string
  name: string
  category: HorseCategory
  sex?: Sex
  /** Year of birth. */
  year: number
  /** Ancestors in generation order: never a pre-joined string, so the
      Pedigree component can break lines only between generations. */
  pedigree: string[]
  status: SaleStatus
  image?: ImageRef
  studbook?: string
  /** Carries the featured badge in the catalogue. One horse at a time. */
  featured?: boolean
  /** Where the horse currently stands, when the client states it. */
  base?: string
}

/** An embryo offer: sire crossed with one of the damlines. */
export interface Pairing {
  id: string
  sire: string
  expectedYear: number
  /** 'frozen' = flushed and stored; 'expected' = carried by a recipient mare. */
  form: 'frozen' | 'expected'
  status: SaleStatus
}

/** A damline family, heading a group of pairings. */
export interface Damline {
  id: string
  dam: string
  /** The dam's own pedigree, shown once at the family head. */
  pedigree: string[]
  /** One line on why this family matters, in the stud's own words. Optional
      because it only exists where the client has actually written it: a dam
      without one shows no line rather than a written-for-her filler. */
  note?: string
  image?: ImageRef
  pairings: Pairing[]
}

/**
 * One competition result in the shape the Horsetelex plugin will supply.
 *
 * Only `id`, `horse` and `placing` are required. Everything else is optional
 * on purpose: the card renders a field only when the feed actually carries
 * it, so a thin row degrades to a smaller card instead of printing a
 * placeholder. The mockup's "with [rider]" is exactly the thing this
 * prevents reaching production.
 */
export interface LiveResult {
  id: string
  /** Finishing position as a number, so the ordinal can be typeset. */
  placing: number
  horse: string
  /** Sire, shown as "by Cornet Obolensky". */
  sire?: string
  /** ISO date, formatted for display at render time. */
  date?: string
  venue?: string
  /** Height and class, e.g. "1m45 Grand Prix". */
  className?: string
  /** Faults and time as the feed reports them, e.g. "0/0/38.42". */
  score?: string
  rider?: string
  /** Three letter country of the venue, e.g. "GER". Not a sale destination. */
  country?: string
}

export interface ResultItem {
  id: string
  /** The horse the result belongs to. */
  horse: string
  /** Relationship to the breeding programme, when relevant. */
  relation?: string
  achievement: string
  rider?: string
}

export interface NewsItem {
  id: string
  title: string
  excerpt: string
  href: string
}

export interface BaseLocation {
  id: string
  place: string
  region: string
  role: string
  image?: ImageRef
}
