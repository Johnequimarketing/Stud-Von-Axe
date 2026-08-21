import { copy } from '@/content'
import { Icon, Reveal } from '@/components/primitives'
import type { IconName } from '@/components/primitives'
import { useDeclareHeroTone } from '@/sections/hero/useDeclareHeroTone'
import { cieloImages } from './images'
import styles from './ArrivalCielo.module.css'

/**
 * Direction D's fold: the airy pastel composition. A soft sky gradient is
 * the section's own ground, the display statement sits ON that ground in
 * deep ink, and the photograph rises from the bottom and melts into the
 * sky through a gradient veil. A frosted glass feature bar closes the
 * frame.
 *
 * Two honest departures from the reference this fold is built after:
 * - The reference sets white display type on a pale sky, which measures
 *   around 2:1. Ours is ink on the sky ground, which keeps the airy look
 *   AND clears AA with room to spare.
 * - The veil that blends the photograph into the sky is a real element
 *   painting the ground colour, not a mask, so the contrast auditor can
 *   see it and an Elementor rebuild can recreate it with one gradient
 *   overlay.
 */
export function ArrivalCielo() {
  const t = copy.cielo.arrival
  useDeclareHeroTone('light')

  return (
    <section id="top" className={styles.hero} aria-label={copy.brand.name}>
      {/* The type block, on the sky ground. */}
      <div className={styles.head}>
        <Reveal delay={120}>
          <h1 className={styles.display}>
            <span className={styles.displayLine}>{t.headlineTop}</span>
            <span className={[styles.displayLine, styles.displayGold].join(' ')}>
              {/* The period hangs: at display size its advance pulls the
                  centred line visibly left of the words above it, so it
                  stops counting toward the centring. */}
              {t.headlineBottom.replace(/\.$/, '')}
              <span className={styles.hang}>.</span>
            </span>
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className={styles.sub}>
            {t.subTop.replace(/,$/, '')}
            <span className={styles.hang}>,</span>
            <br />
            <strong className={styles.subStrong}>{t.subBottom}</strong>
          </p>
        </Reveal>
        <Reveal delay={300}>
          <a className={styles.cta} href="#horses">
            {t.cta}
          </a>
        </Reveal>
      </div>

      {/* The photography. Art-directed per breakpoint: desktop gets the
          wide pasture banner (mare and foal left, jumper right, the centre
          open for the type and the glass bar); a 2.36:1 banner dies in a
          phone crop, so phones keep the foal figure. One <picture> with
          media queries, so only the matching source ever downloads. */}
      <div className={styles.stage}>
        <picture>
          {Object.entries(cieloImages.banner.sources).map(([format, srcSet]) => (
            <source
              key={format}
              media="(min-width: 700px)"
              type={`image/${format}`}
              srcSet={srcSet}
              sizes="100vw"
            />
          ))}
          {Object.entries(cieloImages.field.sources).map(([format, srcSet]) => (
            <source
              key={format}
              type={`image/${format}`}
              srcSet={srcSet}
              sizes="104vw"
            />
          ))}
          <img
            src={cieloImages.field.img.src}
            width={cieloImages.field.img.w}
            height={cieloImages.field.img.h}
            alt={t.photoAlt}
            fetchPriority="high"
          />
        </picture>
        {/* The blend: the sky ground colour dissolving into the banner's
            own sky, so photograph and atmosphere read as one. */}
        <div className={styles.veil} aria-hidden="true" />
      </div>

      {/* The frosted glass feature bar. */}
      <div className={styles.barWrap}>
        <Reveal delay={200}>
          <ul className={styles.bar} role="list">
            {t.features.map((f) => (
              <li key={f.title} className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden="true">
                  <Icon name={f.icon as IconName} size={20} />
                </span>
                <span className={styles.featureText}>
                  <span className={styles.featureTitle}>{f.title}</span>
                  <span className={styles.featureLine}>{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
