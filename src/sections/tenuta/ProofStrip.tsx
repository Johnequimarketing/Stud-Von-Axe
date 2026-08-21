import {
  copy,
  liveResults,
  placeholderResults,
  SHOW_PLACEHOLDER_RESULTS,
} from '@/content'
import type { LiveResult } from '@/content/types'
import { Container, CTALink, Reveal } from '@/components/primitives'
import { Accented } from './Accented'
import { Plaque } from './Plaque'
import styles from './ProofStrip.module.css'

/**
 * Trust, in Mark's results bento: a dark intro card beside light result
 * cards with oversized serif ordinals, the pattern that appears on three
 * of his five sites. Real rows first, placeholders after, exactly as the
 * results sections before it (see results.placeholder.ts:
 * SHOW_PLACEHOLDER_RESULTS is a launch blocker).
 *
 * Elementor map: a grid of containers; the intro card spans two columns
 * on desktop. No widgetry needed.
 */
const LIMIT = 4

const rows: LiveResult[] = [
  ...liveResults,
  ...(SHOW_PLACEHOLDER_RESULTS ? placeholderResults : []),
].slice(0, LIMIT)

const ORDINALS: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' }

function ordinal(placing: number) {
  const tens = placing % 100
  if (tens >= 11 && tens <= 13) return 'th'
  return ORDINALS[placing % 10] ?? 'th'
}

export function ProofStrip() {
  const t = copy.proof

  return (
    <section id="results" className={styles.section} aria-labelledby="proof-heading">
      <Container>
        <div className={styles.bento}>
          {/* The dark intro card. */}
          <Reveal className={styles.introCell}>
            <div className={styles.intro} data-theme="inverse">
              <Plaque index={4} tone="bone">
                {copy.tenuta.proof.label}
              </Plaque>
              <h2 id="proof-heading" className={styles.heading}>
                <Accented
                  text={t.heading}
                  accent={t.headingAccent}
                  emClassName={styles.accent}
                />
              </h2>
              <CTALink
                href="https://www.horsetelex.com/sponsors/profile/4368/stud-von-axe"
                external
                className={styles.allResults}
              >
                {t.allResults}
              </CTALink>
            </div>
          </Reveal>

          {rows.map((row, i) => (
            <Reveal key={row.id} delay={80 * (i + 1)}>
              <div className={styles.card}>
                <p className={styles.placing}>
                  {row.placing}
                  <span className={styles.ordinal}>{ordinal(row.placing)}</span>
                </p>
                <p className={styles.horse}>{row.horse}</p>
                <p className={styles.meta}>
                  {[row.venue, row.className].filter(Boolean).join(' · ')}
                </p>
                {row.rider ? (
                  <p className={styles.rider}>
                    <em>{t.with}</em> {row.rider}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
