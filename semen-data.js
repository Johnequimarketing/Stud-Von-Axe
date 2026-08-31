/* The semen line, in three kinds: fresh, ICSI and frozen.
 *
 * There is no stallion list. Their own standing instruction is that stallions
 * are named on request rather than published, and nothing has arrived that
 * says otherwise: no names, no availability, no prices. So this file holds
 * three placeholder records, one per kind, which the page renders as marked
 * stand-ins the way the empty galleries and film sections do. Nobody must be
 * able to mistake one for a stallion that exists.
 *
 * When the list comes, replace the records here and nothing else changes: the
 * page, the filters and the cards are already built for real ones. A real
 * record drops `placeholder` and fills name, line, studbook and what is known
 * about availability.
 *
 * Asked of the owners on 31 Aug 2026, with the question of whether their word
 * is ICSI or frozen, because the homepage and the about page each say one.
 */
var SEMEN = [
  { slug: 'fresh',  kind: 'fresh',  label: 'Fresh',
    placeholder: true,
    note: 'Collected and shipped the same day, within range of the yard.' },
  { slug: 'icsi',   kind: 'icsi',   label: 'ICSI',
    placeholder: true,
    note: 'For OPU and ICSI with your own mares, through Avantea in Cremona.' },
  { slug: 'frozen', kind: 'frozen', label: 'Frozen',
    placeholder: true,
    note: 'Stored and shipped across the EU and for export.' },
];
if (typeof module !== 'undefined') module.exports = SEMEN;
