import { copy } from '@/content'
import { Container, Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import { countries, spell } from './reach'
import styles from './ReachArc.module.css'
import './palette.css'

/**
 * Concept B, "The Arc": the journey drawn rather than photographed. One
 * gold arc springs from the origin node and the destinations sit along it,
 * which is the pedigree node device at section scale. No map: an accurate
 * world map is a lot of chrome for one fact, and a stylised one is a
 * decoration pretending to be data.
 *
 * The arc and its nodes are decorative, so the countries are also a real
 * list underneath for anything that does not paint SVG.
 *
 * Elementor map: an inline SVG in an HTML widget plus a flex row of
 * labels. No plugin needed.
 */
export function ReachArc() {
  const r = copy.cielo.reach

  /* Labels are spread evenly along the arc's own parameter, so adding a
     destination never needs a hand placed percentage. */
  const stops = countries.map((country, i) => ({
    country,
    /* Inset from both ends: the origin owns the left tip. */
    t: countries.length === 1 ? 0.5 : 0.18 + (i / (countries.length - 1)) * 0.78,
  }))

  return (
    <section id="reach" data-cielo className={styles.section} aria-labelledby="reach-heading">
      <Container>
        <Reveal>
          <div className={styles.head}>
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
            <p className={styles.lead}>
              {r.lead} {spell(countries.length)} {r.countriesWord}.
            </p>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className={styles.stage}>
            <svg
              className={styles.arc}
              viewBox="0 0 1000 260"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                className={styles.arcPath}
                d="M 40 220 C 300 20, 700 20, 960 220"
                fill="none"
              />
            </svg>

            {/* The origin, anchored to the arc's left foot. */}
            <p className={styles.origin}>
              <span className={styles.originName}>{r.originLabel}</span>
              <span className={styles.originRole}>{r.originRole}</span>
            </p>

            <ul className={styles.stops} role="list" aria-label={r.listLabel}>
              {stops.map((stop) => (
                <li
                  key={stop.country}
                  className={styles.stop}
                  style={{ ['--t' as string]: String(stop.t) }}
                >
                  <span className={styles.node} aria-hidden="true" />
                  <span className={styles.stopName}>{stop.country}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
