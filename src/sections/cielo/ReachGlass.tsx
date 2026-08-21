import { copy } from '@/content'
import { Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import { tenutaImages } from '@/sections/tenuta/images'
import { countries, spell } from './reach'
import styles from './ReachGlass.module.css'
import './palette.css'

/**
 * Concept C, "Cinematic glass": the full bleed photograph stays, but it
 * stops being a backdrop for a caption. A frosted plate sits on it and
 * carries the statement, the two yards and the counted destinations, so
 * the section holds evidence rather than atmosphere alone. The plate is
 * the fold's own glass, which is what ties the two ends of the page.
 *
 * Inks sit on the plate, never on the photograph, so contrast is a
 * property of the plate and cannot drift when the picture changes.
 *
 * Elementor map: full width container with a background image, and one
 * inner container with the blur and radius.
 */
export function ReachGlass() {
  const r = copy.cielo.reach

  return (
    <section id="reach" data-cielo className={styles.section} aria-labelledby="reach-heading">
      <picture className={styles.media}>
        {Object.entries(tenutaImages.terra.sources).map(([format, srcSet]) => (
          <source
            key={format}
            type={`image/${format}`}
            srcSet={srcSet}
            sizes="100vw"
          />
        ))}
        <img
          src={tenutaImages.terra.img.src}
          width={tenutaImages.terra.img.w}
          height={tenutaImages.terra.img.h}
          alt=""
          loading="lazy"
        />
      </picture>

      <div className={styles.inner}>
        <Reveal>
          <div className={styles.plate}>
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

            <div className={styles.facts}>
              <p className={styles.yard}>
                <span className={styles.yardName}>{r.originLabel}</span>
                <span className={styles.yardRole}>{r.originRole}</span>
              </p>
              <p className={styles.yard}>
                <span className={styles.yardName}>{r.raisedLabel}</span>
                <span className={styles.yardRole}>{r.raisedRole}</span>
              </p>
            </div>

            <div className={styles.reach}>
              <p className={styles.count}>
                <span className={styles.countValue}>
                  {spell(countries.length)}
                </span>{' '}
                {r.countriesWord}
              </p>
              <ul className={styles.countries} role="list" aria-label={r.listLabel}>
                {countries.map((country) => (
                  <li key={country} className={styles.country}>
                    {country}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
