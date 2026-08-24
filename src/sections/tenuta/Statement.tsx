import { copy } from '@/content'
import { Container, Reveal } from '@/components/primitives'
import { Photo } from './Photo'
import { tenutaImages } from './images'
import styles from './Statement.module.css'

/**
 * Discovery. The client's own line set as the page's first oversized
 * typographic moment, with a small photograph inset into the text block
 * the way a magazine drops an image into a pull quote. One accent word,
 * in italic olive: the page's only coloured word.
 *
 * Elementor map: one heading widget with spans plus an absolutely
 * positioned image widget; the build map carries the exact offsets.
 */
export function Statement() {
  const s = copy.tenuta.statement

  return (
    <section className={styles.section} aria-label={`${s.before} ${s.accent} ${s.after}`}>
      <Container>
        <Reveal>
          {/* Real text, not aria-hidden: the empty-alt image between the
              words is silent for screen readers, so the sentence reads
              straight through it. */}
          {/* A div, not a p: the inline photograph renders a div, and a
              div inside a p is invalid, which makes the browser reparent
              the nodes. The section already carries the sentence as its
              aria-label. */}
          <div className={styles.statement}>
            {s.before}{' '}
            <span className={styles.inset}>
              <Photo
                picture={tenutaImages.statementDetail}
                alt=""
                sizes="(min-width: 900px) 180px, 110px"
                className={styles.insetPhoto}
              />
            </span>{' '}
            <em className={styles.accent}>{s.accent}</em> {s.after}
          </div>
        </Reveal>
        <Reveal delay={140}>
          <p className={styles.support}>{s.support}</p>
        </Reveal>
      </Container>
    </section>
  )
}
