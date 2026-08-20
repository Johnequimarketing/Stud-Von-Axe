import { useState } from 'react'
import { copy } from '@/content'
import { CTALink, Container, Eyebrow, Reveal, Section } from '@/components/primitives'
import { IntroFigure } from './IntroParts'
import { introImages } from './images'
import styles from './IntroStory.module.css'

/**
 * "The stud." Photograph left, with a navy card carrying the journey from
 * Italy breaking over its base. On the right, the same story told in three
 * short chapters the visitor can click through, set on its own tinted
 * panel so it reads as a card rather than loose text beside the photo.
 * The chapter control is a rounded square segment group, matching the
 * header's shape language.
 */
export function IntroStory() {
  const [active, setActive] = useState(0)
  const chapter = copy.intro.chapters[active]

  return (
    <Section id="stud" labelledBy="intro-heading">
      <Container>
        <div className={styles.grid}>
          <Reveal>
            <div className={styles.plate}>
              <IntroFigure
                className={styles.figure}
                picture={introImages.foal}
                alt="A bay foal with a white star, beside its dark mare"
                sizes="(min-width: 900px) 46vw, 100vw"
                objectPosition="30% 38%"
              />
              <figure className={styles.card}>
                <blockquote className={styles.cardQuote}>
                  {copy.intro.cardQuote}
                </blockquote>
                <figcaption className={styles.cardCaption}>
                  {copy.intro.cardCaption}
                </figcaption>
              </figure>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className={styles.panel}>
              <Eyebrow>{copy.intro.eyebrow}</Eyebrow>
              <h2 id="intro-heading" className="visually-hidden">
                {copy.intro.heading}
              </h2>

              <div
                className={styles.chapterNav}
                role="tablist"
                aria-label="Chapters"
              >
                {copy.intro.chapters.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    id={`chapter-tab-${c.id}`}
                    aria-selected={i === active}
                    aria-controls={`chapter-panel-${c.id}`}
                    tabIndex={i === active ? 0 : -1}
                    className={styles.chapterButton}
                    data-active={i === active ? 'true' : undefined}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => {
                      const count = copy.intro.chapters.length
                      if (e.key === 'ArrowRight') setActive((active + 1) % count)
                      if (e.key === 'ArrowLeft')
                        setActive((active - 1 + count) % count)
                    }}
                  >
                    <span className={styles.chapterNumber} aria-hidden="true">
                      {c.number}
                    </span>
                    {c.label}
                  </button>
                ))}
              </div>

              <div
                key={chapter.id}
                id={`chapter-panel-${chapter.id}`}
                role="tabpanel"
                aria-labelledby={`chapter-tab-${chapter.id}`}
                className={styles.chapterBody}
              >
                <blockquote className={styles.quote}>
                  {'“'}
                  {chapter.quote.slice(0, chapter.quote.indexOf(chapter.quoteAccent))}
                  <em className={styles.quoteAccent}>{chapter.quoteAccent}</em>
                  {chapter.quote.slice(
                    chapter.quote.indexOf(chapter.quoteAccent) +
                      chapter.quoteAccent.length,
                  )}
                  {'”'}
                </blockquote>
                <p className={styles.body}>{chapter.body}</p>
              </div>

              <div className={styles.foot}>
                <div>
                  <p className={styles.attribution}>{copy.intro.attribution}</p>
                  <p className={styles.role}>{copy.intro.attributionRole}</p>
                </div>
                <CTALink href="#available" className={styles.footCta}>
                  {copy.intro.cta}
                </CTALink>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
