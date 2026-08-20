import {
  SHOW_PLACEHOLDER_RESULTS,
  copy,
  liveResults,
  placeholderResults,
} from '@/content'
import {
  CTALink,
  Container,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives'
import { ResultCard } from './ResultCard'
import styles from './Proof.module.css'

/* The live results index until an internal results page exists.
   TODO client-confirm: point at /results when that page is built. */
const ALL_RESULTS_HREF = 'https://www.studvonaxe.it/en/homepage/'

/* The homepage shows the newest few and links out for the rest, per the
   build brief. This is a hard cap on what the section renders, not a
   property of the data: the feed can return fifty rows and this still shows
   four. Adding the "All results" link without this cap was an oversight. */
const RESULT_LIMIT = 4

/**
 * Results, as a feed rather than a hand kept ledger.
 *
 * The navy intro card states what the section is and the cards are the rows,
 * so adding a result is a data event and never a copy edit. `liveResults` is
 * the only thing read here: wiring the Horsetelex plugin means swapping that
 * export for the adapter's output.
 *
 * Two consequences worth knowing. The auction sales that used to sit in this
 * section have gone, because a sale is not a ring result and cannot fill
 * this card: that also settles the contradiction with the hero's "sold
 * direct, never through auction". And the reach sentence naming destination
 * countries went with them, so that proof currently has no home on the page.
 */
export function Proof() {
  /* Newest first, and rows with no date last rather than dropped. The feed
     arrives in whatever order the API returns, so the section decides its
     own order rather than trusting it. */
  const byDate = (rows: typeof liveResults) =>
    [...rows].sort((a, b) => {
      if (a.date && b.date) return a.date < b.date ? 1 : -1
      if (a.date) return -1
      if (b.date) return 1
      return 0
    })

  /* Real rows take the slots first, and placeholders only fill what is
     left. Sorting the two together would have dropped both real results,
     because neither has a published date and the fabricated rows all do:
     the cap would have shown four invented results and hidden the only true
     ones. See `results.placeholder.ts`, which must be switched off before
     launch. */
  const real = byDate(liveResults)
  const filler = SHOW_PLACEHOLDER_RESULTS ? byDate(placeholderResults) : []
  const results = [...real, ...filler].slice(0, RESULT_LIMIT)

  const hasResults = results.length > 0

  return (
    <Section id="results" tone="surface" labelledBy="proof-heading">
      <Container>
        <div className={styles.grid}>
          {/* The span sits on the Reveal wrapper, not the card: Reveal
              renders a div, so it is the grid item and the card inside it is
              not. Putting the span on the card silently did nothing. */}
          <Reveal className={styles.introCell}>
            <div className={styles.intro} data-theme="inverse">
              <div className={styles.washes} aria-hidden="true" />
              <div className={styles.introInner}>
                <p className={styles.live}>
                  <span className={styles.dot} aria-hidden="true" />
                  {copy.proof.liveLabel}
                </p>
                <SectionHeading
                  id="proof-heading"
                  text={copy.proof.heading}
                  accent={copy.proof.headingAccent}
                  className={styles.heading}
                />
                <p className={styles.introBody}>{copy.proof.intro}</p>
              </div>
            </div>
          </Reveal>

          {/* `role="list"` on the list below is deliberate: at desktop it
              becomes `display: contents` so the cards flow into the section
              grid around the intro card, and some browsers drop the implicit
              list role when they do. */}
          {hasResults ? (
            <ul className={styles.cards} role="list">
              {results.map((result) => (
                <Reveal key={result.id} className={styles.cardCell}>
                  <ResultCard result={result} />
                </Reveal>
              ))}
            </ul>
          ) : (
            /* Never an empty grid and never a fabricated row. */
            <p className={styles.awaiting}>{copy.proof.awaiting}</p>
          )}
        </div>

        <Reveal>
          <div className={styles.action}>
            <CTALink href={ALL_RESULTS_HREF} external>
              {copy.proof.allResults}
            </CTALink>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
