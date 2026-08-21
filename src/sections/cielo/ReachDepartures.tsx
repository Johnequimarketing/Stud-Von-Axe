import { copy } from '@/content'
import { Container, Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import { countries, placements, spell } from './reach'
import styles from './ReachDepartures.module.css'
import './palette.css'

/**
 * Concept A, "Departures": no photograph at all. The statement carries
 * the left, and the right is the register of horses that have left with
 * the country each went to. The section stops being a caption over a
 * picture and becomes the page's proof of reach.
 *
 * Rows are separated by space and a node dot, not by rules.
 *
 * Elementor map: two containers; the register is a Loop Grid over placed
 * horses, one row per item, or a plain icon list if it stays static.
 */
export function ReachDepartures() {
  const r = copy.cielo.reach

  return (
    <section id="reach" data-cielo className={styles.section} aria-labelledby="reach-heading">
      <Container>
        <div className={styles.split}>
          <Reveal>
            <div className={styles.copy}>
              <Plaque index={3} rule={false}>
                {r.label}
              </Plaque>
              <h2 id="reach-heading" className={styles.statement}>
                <Accented
                  text={r.statement}
                  accent={r.statementAccent}
                  emClassName={styles.accent}
                />
              </h2>
              <p className={styles.lead}>{r.lead}</p>
              <p className={styles.count}>
                <span className={styles.countValue}>
                  {spell(countries.length)}
                </span>{' '}
                {r.countriesWord}
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <ul className={styles.register} role="list" aria-label={r.listLabel}>
              {placements.map((p) => (
                <li key={p.horse} className={styles.row}>
                  <span className={styles.horse}>{p.horse}</span>
                  <span className={styles.country}>{p.country}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
