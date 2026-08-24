import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { copy } from '@/content'
import {
  featuredFoal,
  availableMares,
  recentPlacements,
} from '@/content/horses'
import {
  COUNTRY_NAMES,
  type Horse,
  type HorseCategory,
} from '@/content/types'
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
 * Filtered by category, the taxonomy the client will actually manage in
 * WordPress. Counts beside each chip are derived from the catalogue, and a
 * category with nothing in it renders no chip, so the run can never be
 * filtered down to an empty state. Choosing a filter returns the run to
 * its first card, otherwise the reader lands mid row in a set they have
 * not seen.
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

/* Chip order is fixed here rather than taken from the data, so adding a
   horse can never reshuffle the filter bar. */
const CATEGORY_ORDER: HorseCategory[] = ['foal', 'broodmare', 'sport-horse']

type Filter = 'all' | HorseCategory

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
  const [filter, setFilter] = useState<Filter>('all')
  const [scrollable, setScrollable] = useState(true)

  const chips = useMemo(() => {
    const counted = CATEGORY_ORDER.map((id) => ({
      id: id as Filter,
      label: c.categories[id],
      count: cast.filter((h) => h.category === id).length,
    })).filter((chip) => chip.count > 0)

    return [
      { id: 'all' as Filter, label: c.filterAll, count: cast.length },
      ...counted,
    ]
  }, [c])

  const visible = useMemo(
    () => (filter === 'all' ? cast : cast.filter((h) => h.category === filter)),
    [filter],
  )

  /* Back to the first card whenever the run changes. */
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: 0, behavior: 'auto' })
  }, [filter])

  /* Arrows on a run that fits are dead controls, so they are measured
     rather than assumed: the count that fits changes with the viewport as
     well as with the filter. */
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => setScrollable(track.scrollWidth - track.clientWidth > 2)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [visible.length])

  const step = useCallback((direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector('li')
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    const distance = card ? card.getBoundingClientRect().width + gap : 320
    const max = track.scrollWidth - track.clientWidth
    /* 'auto' means "use the computed scroll-behavior", which the track
       declares as smooth and the reduced motion rule can override. No
       matchMedia branch needed here. */
    const behavior = 'auto' as const

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

            <div
              className={styles.filters}
              role="group"
              aria-label={c.filterLabel}
            >
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={styles.chipButton}
                  aria-pressed={filter === chip.id}
                  onClick={() => setFilter(chip.id)}
                >
                  {chip.label}
                  <span className={styles.chipCount}>{chip.count}</span>
                </button>
              ))}
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
          {visible.map((horse) => {
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
        <p className="visually-hidden" aria-live="polite">
          {c.resultCount(visible.length)}
        </p>
        {/* One row closes the section: the way out on the left, the run's
            controls on the right, where a reader's hand already is after
            dragging the cards. */}
        <Reveal delay={160}>
          <div className={styles.foot}>
            <a className={styles.seeAll} href="#contact">
              <span className={styles.seeAllLabel}>{t.seeAll}</span>
              <span className={styles.viewArrow} aria-hidden="true">
                →
              </span>
            </a>

            <div className={styles.controls}>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => step(-1)}
                aria-label={c.prev}
                disabled={!scrollable}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => step(1)}
                aria-label={c.next}
                disabled={!scrollable}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
