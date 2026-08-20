import type { NewsItem, ResultItem, LiveResult, BaseLocation } from './types'

/* Only results the client's own site states. Nothing added, nothing
   rounded up. If more proof is wanted, that is a content request. */

/* Ring results, in the shape the Horsetelex plugin will fill.
 *
 * These two are the only competition placings the client's own site states,
 * and every field below is from it. There are no dates, sires or scores for
 * them, so those fields are absent rather than guessed: the card omits what
 * it does not have. Barcelona and Madrid give the country.
 *
 * TODO plugin: replace this array with the Horsetelex feed. It is the only
 * thing the results section reads, so wiring the plugin means swapping this
 * export for the adapter's output and nothing else.
 *
 * The other results the site states are SALES, not ring results (top price
 * at auction, sold for a figure). They cannot fill this card shape and are
 * kept below in `results` for a sales or news context. */
export const liveResults: LiveResult[] = [
  {
    id: 'calleryama-barcelona',
    placing: 1,
    horse: 'Calleryama',
    venue: 'Barcelona',
    className: 'Nations Cup',
    rider: 'Gilles Thomas',
    country: 'ESP',
  },
  {
    id: 'calleryama-madrid',
    placing: 2,
    horse: 'Calleryama',
    venue: 'Madrid',
    className: 'Nations Cup CSI3*',
    country: 'ESP',
  },
]

export const featuredResult: ResultItem = {
  id: 'calleryama-barcelona',
  horse: 'Calleryama',
  relation: 'dam of Unguessable Von Axe',
  /* Reads inside the featured sentence, so it starts lower case. */
  achievement: 'winner of the Nations Cup of Barcelona',
  rider: 'Gilles Thomas',
}

export const results: ResultItem[] = [
  {
    id: 'calleryama-madrid',
    horse: 'Calleryama',
    relation: 'dam of Unguessable Von Axe',
    achievement: 'Second place, Nations Cup CSI3* Madrid',
  },
  {
    id: 'contouch-auction',
    horse: 'Contouch SVA',
    achievement: 'Top price at Your Auction, sold for €150,000',
  },
  {
    id: 'cortina-first-colt',
    horse: 'First colt of Cortina de Jolie Z',
    relation: 'by For Pleasure',
    achievement: 'Sold for €40,000 at Zangersheide',
  },
  {
    id: 'evoque-sale',
    horse: 'Evoque Von Axe Z',
    achievement: 'Sold for €27,000',
  },
]

export const news: NewsItem[] = [
  {
    id: 'contouch',
    title: 'Contouch SVA takes top price at Your Auction',
    excerpt:
      'Sold for €150,000, the highest price of the auction, and now competing internationally.',
    href: 'https://www.studvonaxe.it/en/homepage/',
  },
  {
    id: 'calleryama',
    title: 'Calleryama wins the Nations Cup of Barcelona',
    excerpt:
      'The dam of Unguessable Von Axe adds a Nations Cup win to a second place in Madrid.',
    href: 'https://www.studvonaxe.it/en/homepage/',
  },
  {
    id: 'cortina',
    title: 'Cortina de Jolie Z joins the broodmare band',
    excerpt:
      'A Cornet Obolensky daughter out of the Calato line, now producing for the programme.',
    href: 'https://www.studvonaxe.it/en/homepage/',
  },
]

/* TODO client-confirm: the two-base operation comes from the client
   briefing. The current public site names only the Tuscany address, so
   the wording below must be signed off before launch. */
export const bases: BaseLocation[] = [
  {
    id: 'italy',
    place: 'Desenzano del Garda',
    region: 'Italy',
    role: 'Where the pairings are made and the embryos begin.',
  },
  {
    id: 'belgium',
    place: 'Lanaken',
    region: 'Belgium',
    role: 'Where the pregnancies are managed and the foals are raised.',
  },
]
