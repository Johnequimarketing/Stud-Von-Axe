import { copy } from '@/content'
import { Reveal } from '@/components/primitives'
import { Accented } from './Accented'
import { Photo } from './Photo'
import { Plaque } from './Plaque'
import { tenutaImages } from './images'
import styles from './Terra.module.css'

/**
 * The full-bleed Italy moment: the field photograph edge to edge with the
 * approved journey line as the page's second, and last, oversized
 * typographic statement. The grade layers are real elements so the
 * contrast auditor can see what sits behind the type.
 *
 * Elementor map: full-width container, background image, two overlay divs,
 * bottom-left content. No widgetry at all.
 */
export function Terra() {
  const t = copy.tenuta.terra

  return (
    <section className={styles.section} aria-label={t.statement}>
      <Photo
        picture={tenutaImages.terra}
        alt=""
        sizes="100vw"
        className={styles.figure}
      />
      <div className={styles.gradeBase} aria-hidden="true" />

      <div className={styles.inner}>
        <Reveal>
          <Plaque tone="bone">{t.caption}</Plaque>
        </Reveal>
        <Reveal delay={140}>
          <p className={styles.statement}>
            <Accented text={t.statement} accent={t.statementAccent} emClassName={styles.accent} />
          </p>
        </Reveal>
      </div>
    </section>
  )
}
