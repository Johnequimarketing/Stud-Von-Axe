import { copy } from '@/content'
import { Reveal } from '@/components/primitives'
import { useDeclareHeroTone } from '@/sections/hero/useDeclareHeroTone'
import { cieloImages } from './images'
import { FeatureBar } from './FeatureBar'
import styles from './ArrivalContained.module.css'
import './palette.css'

/**
 * The fold: one rounded plate on the page ground, the way the reference
 * sites card their heroes, sized past the page's 1140 measure because the
 * hero owns the fold. The transparent header floats over the plate's top;
 * its glass only arrives on scroll. The banner fills the plate, a
 * bottom-weighted veil carries the type INSIDE the frame, and the glass
 * bar sits inset on the plate's foot.
 *
 * The type sits on the veiled lower half in bone, which is measured
 * against the darkened grass, not assumed.
 */
export function ArrivalContained() {
  const t = copy.cielo.arrival
  useDeclareHeroTone('light')

  return (
    <section id="top" data-cielo className={styles.hero} aria-label={copy.brand.name}>
      <div className={styles.plate}>
        <picture className={styles.media}>
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
            <source key={format} type={`image/${format}`} srcSet={srcSet} sizes="100vw" />
          ))}
          <img
            src={cieloImages.field.img.src}
            width={cieloImages.field.img.w}
            height={cieloImages.field.img.h}
            alt={t.photoAlt}
            fetchPriority="high"
          />
        </picture>
        <div className={styles.grade} aria-hidden="true" />

        <div className={styles.content}>
          <Reveal>
            <h1 className={styles.display}>
              <span>{t.headlineTop}</span>{' '}
              <span className={styles.displayGold}>
                {t.headlineBottom.replace(/\.$/, '')}
                <span className={styles.hang}>.</span>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            {/* No hanging comma here: the hang's negative margin eats the
                space AFTER it mid line, which printed BLOODLINES,PROVEN.
                Hanging punctuation is only for line ends. */}
            <p className={styles.sub}>
              {t.subTop} {t.subBottom}
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className={styles.actions}>
              <a className={styles.solid} href="#horses">
                {t.cta}
              </a>
              <a className={styles.ghost} href="#contact">
                {copy.hero.secondaryCta}
              </a>
            </div>
          </Reveal>
        </div>

        <div className={styles.barWrap}>
          <Reveal delay={300}>
            <FeatureBar inset />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
