import { useState } from 'react'
import { copy } from '@/content'
import { Container, Icon, Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import { cieloImages } from './images'
import styles from './EstateCielo.module.css'
import './palette.css'

/**
 * The stud, as a deck of instax prints. Two photographs sit tilted and
 * overlapping beside the copy; pressing the stack brings the print behind
 * to the front. Two prints for two yards, which is what the heading says.
 *
 * The whole stack is ONE button rather than one button per print. Per
 * print was the first build and it broke keyboard use: advancing moved
 * `tabIndex` to the other frame, so the element holding focus became
 * unfocusable and the ring vanished mid-interaction. One button is also
 * the honest model, because the deck has exactly one action: advance.
 * The live region speaks the change, since a silent visual swap does not
 * exist for a screen reader.
 *
 * Elementor map: two image widgets in a relative container, rotations and
 * shadows in custom CSS, and a ~12 line class toggle for the swap. A UE
 * photo-stack widget can stand in only if it exposes real button
 * semantics and honours reduced motion; the build map carries both.
 */
export function EstateCielo() {
  const e = copy.tenuta.estate
  const d = copy.cielo.estate
  const [front, setFront] = useState(0)

  const count = cieloImages.deck.length
  const advance = () => setFront((i) => (i + 1) % count)

  return (
    <section
      id="stud"
      data-cielo
      className={styles.section}
      aria-labelledby="estate-heading"
    >
      <Container>
        <div className={styles.split}>
          <Reveal className={styles.copyCell}>
            <div className={styles.copy}>
              <Plaque index={1} rule={false}>
                {e.label}
              </Plaque>
              <h2 id="estate-heading" className={styles.heading}>
                <Accented
                  text={e.heading}
                  accent={e.headingAccent}
                  emClassName={styles.accent}
                />
              </h2>
              <p className={styles.body}>{e.body}</p>

              <ul className={styles.yards} role="list">
                {e.yards.map((yard) => (
                  <li key={yard.place} className={styles.yard}>
                    <p className={styles.yardPlace}>
                      {yard.place}{' '}
                      <span className={styles.yardRegion}>{yard.region}</span>
                    </p>
                    <p className={styles.yardRole}>{yard.role}</p>
                  </li>
                ))}
              </ul>

              <a className={styles.cta} href="#contact">
                <span className={styles.ctaLabel}>{e.cta}</span>
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={140} className={styles.deckCell}>
            <div className={styles.deck}>
              <button
                type="button"
                className={styles.stack}
                onClick={advance}
                aria-label={d.swapLabel}
              >
                {cieloImages.deck.map((picture, i) => {
                  /* Depth counted from the front, so the transforms
                     describe a position in the stack rather than a
                     specific photograph. */
                  const depth = (i - front + count) % count
                  const photo = d.photos[i]

                  return (
                    <span
                      key={photo.caption}
                      className={styles.frame}
                      data-depth={depth}
                    >
                      <span className={styles.window}>
                        <picture>
                          {Object.entries(picture.sources).map(
                            ([format, srcSet]) => (
                              <source
                                key={format}
                                type={`image/${format}`}
                                srcSet={srcSet}
                                sizes="(min-width: 900px) 420px, 82vw"
                              />
                            ),
                          )}
                          <img
                            src={picture.img.src}
                            width={picture.img.w}
                            height={picture.img.h}
                            alt={photo.alt}
                            loading="lazy"
                          />
                        </picture>
                      </span>
                      {/* The chin: the white strip you would write on. */}
                      <span className={styles.chin}>
                        <span className={styles.caption}>{photo.caption}</span>
                        <span className={styles.swapMark} aria-hidden="true">
                          <Icon name="swap" size={16} />
                        </span>
                      </span>
                    </span>
                  )
                })}
              </button>

              <p className={styles.hint} aria-hidden="true">
                {d.swapLabel}
              </p>

              <p className="visually-hidden" aria-live="polite">
                {d.nowShowing(d.photos[front].caption)}
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
