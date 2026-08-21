import { useCallback, useRef } from 'react'
import { copy } from '@/content'
import {
  featuredFoal,
  availableMares,
  recentPlacements,
} from '@/content/horses'
import { COUNTRY_NAMES, type Horse } from '@/content/types'
import { horseDetailUrls } from '@/content/horseDetailUrls'
import { horsePictures } from '@/sections/available/images'
import { Container, Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import styles from './HorsesCielo.module.css'
import './palette.css'

/**
 * The horses, as a looping run of cards. One card per horse: photograph,
 * name, one meta line, a status chip, and its own link out. The run wraps
 * at both ends, so the controls never dead end.
 *
 * The scroller is native CSS scroll snap, not a JS carousel: it drags on
 * a touch screen, throws with a trackpad, and the arrows only ever call
 * scrollBy. Every card holds a real link, so a keyboard reaches all of
 * them by tabbing and the browser scrolls each into view on focus, which
 * is why the track needs no tab stop of its own.
 *
 * The cast is decided by the provenance rule, not by us: a horse appears
 * only if `horsePictures` holds its verified photograph. Sold horses keep
 * their destination country in the chip, which is the page's only claim
 * of international reach and is counted, never asserted.
 *
 * Elementor map: this is a Loop Carousel over a horse CPT with the card
 * as its loop template, infinite loop on. The build map carries the card
 * CSS and the scrollBy fallback for a plain container build.
 */

/* Order follows the story: what is here now, then the produce already
   gone abroad. */
const ALL: Horse[] = [featuredFoal, ...availableMares, ...recentPlacements]
const cast = ALL.filter((h) => h.id in horsePictures)

const SEXES: Record<string, string> = {
  colt: 'Colt',
  filly: 'Filly',
  mare: 'Mare',
  gelding: 'Gelding',
  stallion: 'Stallion',
}

function metaLine(horse: Horse) {
  return [horse.year, horse.sex ? SEXES[horse.sex] : null, horse.pedigree[0]]
    .filter(Boolean)
    .join(' · ')
}

function statusLabel(horse: Horse) {
  if (horse.status.kind === 'sold') {
    const country = COUNTRY_NAMES[horse.status.country] ?? horse.status.country
    return `${copy.tenuta.horses.soldWord} · ${country}`
  }
  if (horse.status.kind === 'reserved') return copy.status.reserved
  return copy.status.available
}

export function HorsesCielo() {
  const t = copy.tenuta.horses
  const c = copy.cielo.horses
  const trackRef = useRef<HTMLUListElement>(null)

  const step = useCallback((direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector('li')
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    const distance = card ? card.getBoundingClientRect().width + gap : 320
    const max = track.scrollWidth - track.clientWidth
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 'auto'
      : 'smooth'

    /* The wrap. A 2px tolerance because scrollLeft is fractional on
       zoomed and high density displays, so an exact comparison never
       fires and the run appears to dead end. */
    if (direction === 1 && track.scrollLeft >= max - 2) {
      track.scrollTo({ left: 0, behavior })
      return
    }
    if (direction === -1 && track.scrollLeft <= 2) {
      track.scrollTo({ left: max, behavior })
      return
    }
    track.scrollBy({ left: distance * direction, behavior })
  }, [])

  return (
    <section
      id="horses"
      data-cielo
      className={styles.section}
      aria-labelledby="horses-heading"
    >
      <Container>
        <Reveal>
          <div className={styles.head}>
            <div>
              <Plaque index={2} rule={false}>
                {t.label}
              </Plaque>
              <h2 id="horses-heading" className={styles.heading}>
                <Accented
                  text={t.heading}
                  accent={t.headingAccent}
                  emClassName={styles.accent}
                />
              </h2>
              <p className={styles.intro}>{t.intro}</p>
            </div>

            <div className={styles.controls}>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => step(-1)}
                aria-label={c.prev}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => step(1)}
                aria-label={c.next}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* The track sits outside the container so the run can bleed to the
          viewport edge: a card cut off at the right is the affordance that
          says the row continues. */}
      <Reveal delay={120}>
        <ul
          ref={trackRef}
          className={styles.track}
          role="list"
          aria-label={c.regionLabel}
        >
          {cast.map((horse) => {
            const picture = horsePictures[horse.id]
            const href = horseDetailUrls[horse.id]

            return (
              <li key={horse.id} className={styles.item}>
                <a
                  className={styles.card}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span className={styles.window}>
                    <picture>
                      {Object.entries(picture.sources).map(
                        ([format, srcSet]) => (
                          <source
                            key={format}
                            type={`image/${format}`}
                            srcSet={srcSet}
                            sizes="(min-width: 900px) 320px, 74vw"
                          />
                        ),
                      )}
                      <img
                        src={picture.img.src}
                        width={picture.img.w}
                        height={picture.img.h}
                        alt={horse.name}
                        loading="lazy"
                      />
                    </picture>
                    <span className={styles.chip}>{statusLabel(horse)}</span>
                  </span>

                  <span className={styles.body}>
                    <h3 className={styles.name}>{horse.name}</h3>
                    <p className={styles.meta}>{metaLine(horse)}</p>
                    <span className={styles.view}>
                      {t.view}
                      <span className={styles.viewArrow} aria-hidden="true">
                        →
                      </span>
                    </span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </Reveal>

      <Container>
        <Reveal delay={200}>
          <a className={styles.seeAll} href="#contact">
            <span className={styles.seeAllLabel}>{t.seeAll}</span>
            <span className={styles.viewArrow} aria-hidden="true">
              →
            </span>
          </a>
        </Reveal>
      </Container>
    </section>
  )
}
