import { HeroActions, HeroHeading, HeroIntro } from './HeroParts'
import { HeroImage } from './HeroImage'
import { heroImages } from './images'
import { useDeclareHeroTone } from './useDeclareHeroTone'
import styles from './HeroFull.module.css'

/**
 * Full-bleed cinematic hero: one photograph across the whole viewport with
 * the statement set low left.
 *
 * The horse's head sits left of centre in the file, so the crop is pulled
 * up to keep it clear of the type, and the grading is bottom-weighted the
 * way a film frame is: dark at the base where the words are, clean
 * through the middle where the horse is.
 */
export function HeroFull() {
  useDeclareHeroTone('dark')

  return (
    <section className={styles.hero} id="top">
      <HeroImage
        className={styles.media}
        picture={heroImages.grey}
        alt="A dapple grey Von Axe sport horse"
        sizes="100vw"
        priority
      />

      {/* Three graded layers rather than one: a base wash for the words, a
          light top wash so the header reads, and a soft vignette to hold
          the eye in the frame. */}
      <div className={styles.grade} aria-hidden="true" />
      {/* The last strip of the frame, resolved to the page ground so the hero
         does not end on a line. */}
      <div className={styles.foot} aria-hidden="true" />

      <div className={styles.inner}>
        <HeroHeading />
        <HeroIntro className={styles.intro} />
        <HeroActions />
      </div>
    </section>
  )
}
