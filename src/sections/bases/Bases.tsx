import { bases, copy } from '@/content'
import {
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives'
import { BaseFigure } from './BaseFigure'
import styles from './Bases.module.css'

/**
 * The two bases: one photographic moment with the statement on it, and the
 * two yards as quiet typographic cards beside it. Chosen from three
 * concepts (this, a photo-free typographic diptych, and a people-led
 * layout using the client's own about-page photo of Adriano).
 *
 * The base cards deliberately carry NO photograph. Nothing in the client's
 * library is identified as Desenzano or Lanaken, and a picture inside a
 * card titled "Lanaken" would claim it shows Lanaken. The one photo here is
 * atmosphere on the section, not evidence on a card, the same terms the
 * offer section's photography lives under.
 */
export function BasesSection() {
  return (
    <Section id="bases" labelledBy="bases-heading">
      <Container>
        <div className={styles.bento}>
          <Reveal className={styles.stageCell}>
            <div className={styles.stage}>
              <BaseFigure
                name="yard"
                alt="A foal standing in an arena"
                className={styles.figure}
              />
              <div className={styles.card} data-theme="inverse">
                <Eyebrow className={styles.eyebrow}>
                  {copy.bases.eyebrow}
                </Eyebrow>
                <SectionHeading
                  id="bases-heading"
                  text={copy.bases.heading}
                  accent={copy.bases.headingAccent}
                  className={styles.heading}
                />
                <p className={styles.body}>{copy.bases.body}</p>
              </div>
            </div>
          </Reveal>

          <div className={styles.stack}>
            {bases.map((base, i) => (
              <Reveal key={base.id} delay={i * 90} className={styles.cardCell}>
                <article
                  className={styles.base}
                  data-tone={i === 0 ? 'dark' : 'light'}
                  data-theme={i === 0 ? 'inverse' : undefined}
                >
                  <p className={styles.region}>{base.region}</p>
                  <h3 className={styles.place}>{base.place}</h3>
                  <p className={styles.role}>{base.role}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
