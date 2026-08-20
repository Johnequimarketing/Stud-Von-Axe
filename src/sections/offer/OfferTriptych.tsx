import { copy } from '@/content'
import { Container, Eyebrow, Reveal, Section, SectionHeading } from '@/components/primitives'
import { offerImages } from './images'
import styles from './OfferTriptych.module.css'

/**
 * The three routes as one continuous photographic band divided into
 * thirds. Deliberately no gaps between the panels, so it reads as a
 * single composition rather than a row of cards.
 *
 * At rest each panel shows only its number and title; the description
 * and call to action reveal on hover or keyboard focus. That reveal is
 * scoped to fine pointers: touch devices have no hover, so they show
 * everything permanently rather than hiding content behind a gesture
 * that does not exist.
 */
export function OfferTriptych() {
  return (
    <Section id="offer" labelledBy="offer-heading">
      <Container>
        <Reveal>
          <div className={styles.head}>
            <Eyebrow>{copy.offer.eyebrow}</Eyebrow>
            <SectionHeading
              id="offer-heading"
              text={copy.offer.heading}
              accent={copy.offer.headingAccent}
            />
          </div>
        </Reveal>

        <Reveal>
          <ul className={styles.band}>
            {copy.offer.lines.map((line) => {
              const picture = offerImages[line.id]
              return (
                <li key={line.id} className={styles.panelWrap}>
                  <a href={line.href} className={styles.panel}>
                    <picture className={styles.media}>
                      {Object.entries(picture.sources).map(([format, srcSet]) => (
                        <source
                          key={format}
                          type={`image/${format}`}
                          srcSet={srcSet}
                          sizes="(min-width: 900px) 33vw, 100vw"
                        />
                      ))}
                      <img
                        src={picture.img.src}
                        width={picture.img.w}
                        height={picture.img.h}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                    <span className={styles.grade} aria-hidden="true" />
                    <span className={styles.content}>
                      <span className={styles.number} aria-hidden="true">
                        {line.number}
                      </span>
                      <span className={styles.title}>{line.title}</span>
                      <span className={styles.revealBlock}>
                        <span className={styles.revealInner}>
                          <span className={styles.description}>
                            {line.description}
                          </span>
                          <span className={styles.action}>
                            {line.cta}
                            <span className={styles.arrow} aria-hidden="true">
                              →
                            </span>
                          </span>
                        </span>
                      </span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </Container>
    </Section>
  )
}
