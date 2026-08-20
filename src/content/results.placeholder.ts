/* =====================================================================
 * PLACEHOLDER DATA. NOT REAL RESULTS. REMOVE BEFORE LAUNCH.
 * =====================================================================
 *
 * Four fabricated rows, written for this project, so the results grid can
 * be reviewed full rather than with only the two ring results the client
 * currently publishes. Nothing here is a Von Axe horse and nothing here
 * happened.
 *
 * Deliberate choices that keep fabricated data from doing damage:
 *
 * - The horses and their sires are invented names. Hanging a made up horse
 *   off a REAL stallion (a Cornet Obolensky, a Diarado) would read as a
 *   plausible pedigree claim, which is the one thing this project does not
 *   do anywhere else.
 * - No riders. A fabricated result is a layout problem; a fabricated
 *   person's name attached to one is a different kind of problem. It also
 *   exercises the card's graceful omission, and the real Barcelona row
 *   still shows the rider treatment.
 * - The placings cover 1st, 3rd, 5th and 12th, which is every ordinal
 *   suffix including the teens case the mockup's set never reached.
 *
 * Real rows arrive from the Horsetelex plugin, which replaces
 * `liveResults` in `./results.ts`.
 *
 * Turning this off is a one line change: set SHOW_PLACEHOLDER_RESULTS to
 * false. It is listed as launch-blocking in the README alongside the
 * `noindex` tag.
 */

import type { LiveResult } from './types'

/** LAUNCH BLOCKER: must be false before the site goes live. */
export const SHOW_PLACEHOLDER_RESULTS = true

export const placeholderResults: LiveResult[] = [
  {
    id: 'placeholder-1',
    placing: 1,
    horse: 'Aria Fontane',
    sire: 'Silverbrook',
    date: '2026-07-18',
    venue: 'Valkenswaard',
    className: '1m40 CSI2*',
    score: '0/0/62.18',
    country: 'NED',
  },
  {
    id: 'placeholder-2',
    placing: 3,
    horse: 'Vesper Lane',
    sire: 'Nocturne',
    date: '2026-07-11',
    venue: 'Hamburg',
    className: '1m45 Grand Prix',
    score: '0/0/39.74',
    country: 'GER',
  },
  {
    id: 'placeholder-3',
    placing: 5,
    horse: 'Marchetto',
    sire: 'Pallantine',
    date: '2026-07-02',
    venue: 'Rome',
    className: '1m35 Big Tour',
    score: '0/4/58.90',
    country: 'ITA',
  },
  {
    id: 'placeholder-4',
    placing: 12,
    horse: 'Solstice Bay',
    sire: 'Harrowgate',
    date: '2026-06-24',
    venue: 'Opglabbeek',
    className: '1m30 Youngster Tour',
    score: '4/0/41.32',
    country: 'BEL',
  },
]
