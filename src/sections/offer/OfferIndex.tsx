import { copy } from '@/content'
import {
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives'
import { offerImages } from './images'
import styles from './OfferIndex.module.css'

/**
 * The three routes into the programme, as a numbered index beside one
 * photograph in an arch crop.
 *
 * This replaced a photographic triptych that showed only a number and a
 * one word title at rest and revealed the description on hover. Two
 * problems with that: the section read as three pictures and three words in
 * any screenshot, which is the thinnest moment on the page, and it hid its
 * own content behind a gesture. Everything is visible now, and each row is
 * a real link rather than a hover target.
 *
 * The arch is Notturno's signature image crop, repeated in the bases
 * section. It is built from the border radius rather than a mask, so the
 * figure stays a plain img and the shape costs nothing.
 */
export function OfferIndex() {
  const picture = offerImages.foals

  return (
    <Section id="offer" labelledBy="offer-heading">
      <Container>
        <Reveal>
          <div className={styles.plate}>
            <div className={styles.washes} aria-hidden="true" />

            <div className={styles.inner}>
              <div className={styles.text}>
                <Eyebrow>{copy.offer.eyebrow}</Eyebrow>
                <SectionHeading
                  id="offer-heading"
                  text={copy.offer.heading}
                  accent={copy.offer.headingAccent}
                  className={styles.heading}
                />

                <ol className={styles.rows}>
                  {copy.offer.lines.map((line) => (
                    <li key={line.id}>
                      <a className={styles.row} href={line.href}>
                        <span className={styles.number} aria-hidden="true">
                          {line.number}
                        </span>
                        <span className={styles.rowText}>
                          <span className={styles.title}>{line.title}</span>
                          <span className={styles.description}>
                            {line.description}
                          </span>
                        </span>
                        <span className={styles.arrow} aria-hidden="true">
                          →
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>

              <div className={styles.figure}>
                <picture>
                  {Object.entries(picture.sources).map(([format, srcSet]) => (
                    <source
                      key={format}
                      type={`image/${format}`}
                      srcSet={srcSet}
                      sizes="(min-width: 900px) 420px, 80vw"
                    />
                  ))}
                  <img
                    src={picture.img.src}
                    width={picture.img.w}
                    height={picture.img.h}
                    alt="A foal loose in the grass at the Belgian base"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
