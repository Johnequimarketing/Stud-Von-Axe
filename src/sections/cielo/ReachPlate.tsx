import { copy } from '@/content'
import { Container, Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import { cieloImages } from './images'
import { countries, spell } from './reach'
import styles from './ReachPlate.module.css'
import './palette.css'

/**
 * Concept D: a contained navy plate, copy left and photograph right, both
 * inset within it. The plate is the brand navy, so the page's one dark
 * moment is also the logo's own colour, and the pale ground carries it
 * rather than a full bleed band.
 *
 * The counted destinations sit under the body as quiet labels, so the
 * section still holds its evidence: six countries, every one of them read
 * from the catalogue.
 *
 * The photograph is used UNCAPTIONED and is never tied to a named horse,
 * which is what lets a file whose name mentions one be used at all.
 *
 * Elementor map: one container with the navy background and radius, two
 * child containers inside it, image widget on the right. No plugin.
 */
export function ReachPlate() {
  const r = copy.cielo.reach

  return (
    <section id="reach" data-cielo className={styles.section} aria-labelledby="reach-heading">
      <Container>
        <Reveal>
          <div className={styles.plate}>
            <div className={styles.copy}>
              <Plaque index={3} rule={false} tone="bone" className={styles.plaque}>
                {r.label}
              </Plaque>

              <h2 id="reach-heading" className={styles.statement}>
                <Accented
                  text={r.statement}
                  accent={r.statementAccent}
                  emClassName={styles.accent}
                />
              </h2>

              <p className={styles.body}>{r.plateBody}</p>

              <div className={styles.reach}>
                <p className={styles.count}>
                  <span className={styles.countValue}>
                    {spell(countries.length)}
                  </span>{' '}
                  {r.countriesWord}
                </p>
                <ul
                  className={styles.countries}
                  role="list"
                  aria-label={r.listLabel}
                >
                  {countries.map((country) => (
                    <li key={country} className={styles.country}>
                      {country}
                    </li>
                  ))}
                </ul>
              </div>

              <a className={styles.cta} href="#contact">
                {r.plateCta}
              </a>
            </div>

            <div className={styles.figure}>
              <picture>
                {Object.entries(cieloImages.reach.sources).map(
                  ([format, srcSet]) => (
                    <source
                      key={format}
                      type={`image/${format}`}
                      srcSet={srcSet}
                      sizes="(min-width: 900px) 520px, 88vw"
                    />
                  ),
                )}
                <img
                  src={cieloImages.reach.img.src}
                  width={cieloImages.reach.img.w}
                  height={cieloImages.reach.img.h}
                  alt={r.photoAlt}
                  loading="lazy"
                />
              </picture>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
