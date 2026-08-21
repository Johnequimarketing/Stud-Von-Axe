import { copy } from '@/content'
import { Container, CTALink, Reveal } from '@/components/primitives'
import { Accented } from './Accented'
import { Photo } from './Photo'
import { Plaque } from './Plaque'
import { tenutaImages } from './images'
import styles from './Estate.module.css'

/**
 * The stud. A 60/40 split where the stone text panel overlaps the
 * photograph's edge, so image and content read as one composition rather
 * than two columns. The two yards close the panel as plaque lines: this
 * absorbs what used to be a whole Bases section.
 *
 * Elementor map: two containers with a negative margin overlap; the yard
 * lines are icon-list rows without icons. Slot for future ambient estate
 * footage is HeroMedia again, noted in the build map.
 */
export function Estate() {
  const e = copy.tenuta.estate

  return (
    <section id="stud" className={styles.section} aria-labelledby="estate-heading">
      <Container>
        <div className={styles.split}>
          <Reveal className={styles.figureCell}>
            <Photo
              picture={tenutaImages.estate}
              alt="A dark bay foal standing in an outdoor arena"
              sizes="(min-width: 900px) 60vw, 100vw"
              className={styles.figure}
            />
          </Reveal>

          <Reveal delay={140} className={styles.panelCell}>
            <div className={styles.panel}>
              <Plaque index={1}>{e.label}</Plaque>
              <h2 id="estate-heading" className={styles.heading}>
                <Accented text={e.heading} accent={e.headingAccent} emClassName={styles.accent} />
              </h2>
              <p className={styles.body}>{e.body}</p>

              <ul className={styles.yards} role="list">
                {e.yards.map((yard) => (
                  <li key={yard.place} className={styles.yard}>
                    <p className={styles.yardPlace}>
                      {yard.place} <span className={styles.yardRegion}>{yard.region}</span>
                    </p>
                    <p className={styles.yardRole}>{yard.role}</p>
                  </li>
                ))}
              </ul>

              <CTALink href="#contact" className={styles.cta}>
                {e.cta}
              </CTALink>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
