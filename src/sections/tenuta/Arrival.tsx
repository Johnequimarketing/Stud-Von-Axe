import { copy } from '@/content'
import { useDeclareHeroTone } from '@/sections/hero/useDeclareHeroTone'
import { Reveal } from '@/components/primitives'
import { HeroMedia } from './HeroMedia'
import { Plaque } from './Plaque'
import { tenutaImages } from './images'
import styles from './Arrival.module.css'

/**
 * Arrival. Full viewport, one photograph (video-ready, see HeroMedia), the
 * type block low-left the way an estate gate sits at the end of a drive:
 * location plaque, one statement, one way in. Nothing else competes.
 *
 * Elementor map: full-height container, background media, content aligned
 * bottom-left, Elementor entrance disabled in favour of the shared reveal.
 */
export function Arrival() {
  useDeclareHeroTone('dark')

  return (
    <section id="top" className={styles.hero} aria-label={copy.brand.name}>
      <HeroMedia picture={tenutaImages.hero} />
      {/* Two grade layers as real elements, never pseudos, so the contrast
          auditor can see every paint that sits behind the type. */}
      <div className={styles.gradeBase} aria-hidden="true" />
      <div className={styles.gradeTop} aria-hidden="true" />

      <div className={styles.inner}>
        <Reveal>
          <Plaque tone="bone">{copy.tenuta.arrival.location}</Plaque>
        </Reveal>
        <Reveal delay={120}>
          <h1 className={styles.heading}>
            {copy.hero.headingBefore}{' '}
            <em className={styles.headingAccent}>{copy.hero.headingAccent}</em>{' '}
            {copy.hero.headingAfter}
          </h1>
        </Reveal>
        <Reveal delay={240}>
          {/* Mark's paired buttons: one solid pill, one ghost pill. */}
          <div className={styles.actions}>
            <a className={styles.pillSolid} href="#horses">
              <span>{copy.tenuta.arrival.cta}</span>
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
            </a>
            <a className={styles.pillGhost} href="#contact">
              {copy.hero.secondaryCta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
