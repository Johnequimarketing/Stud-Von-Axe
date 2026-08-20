import { useEffect, useRef, useState } from 'react'
import { catalogue, copy, type Horse } from '@/content'
import { HorseCard } from './HorseCard'
import styles from './Carousel.module.css'

type FilterId = 'all' | Horse['category']

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A manually driven catalogue carousel: native scroll-snap for swipe, and
 * arrows that page by one card and wrap at either end. No autoplay, which
 * is the difference between the scrolling gallery the brief asks for and
 * the automatic carousel it rules out.
 */
export function Carousel() {
  const [filter, setFilter] = useState<FilterId>('all')
  const trackRef = useRef<HTMLUListElement>(null)

  const horses =
    filter === 'all'
      ? catalogue
      : catalogue.filter((horse) => horse.category === filter)

  /* A short run fits without scrolling, in which case the arrows have
     nothing to do and should say so rather than looking broken when
     clicked. Remeasured on resize as well as on a filter change, since the
     same run fits at one width and not another. */
  const [canPage, setCanPage] = useState(true)

  /* Two jobs, one effect, because both depend on the committed card list.
     A filtered run is a different set, so it starts from the beginning
     rather than leaving the reader mid-scroll in the old one, and this has
     to run after the new cards commit: resetting inside the click handler
     scrolls the outgoing list, and the browser then re-anchors the track
     against the changed content, leaving it a card off. */
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: 0, behavior: 'auto' })

    const measure = () => setCanPage(track.scrollWidth - track.clientWidth > 8)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [filter])

  /** One card plus its gap, measured rather than assumed. */
  const step = () => {
    const track = trackRef.current
    if (!track) return 0
    const first = track.querySelector('li')
    if (!first) return track.clientWidth
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
    return first.getBoundingClientRect().width + gap
  }

  const page = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return

    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
    const max = track.scrollWidth - track.clientWidth
    /* Generous tolerance rather than an exact comparison. Scroll positions
       are fractional, and a click landing while a previous smooth scroll
       is still settling would otherwise read as "not quite at the end" and
       silently do nothing instead of wrapping. Well under one card width,
       so it can never wrap early mid-run. */
    const EDGE = 8
    const atEnd = track.scrollLeft >= max - EDGE
    const atStart = track.scrollLeft <= EDGE

    if (direction === 1 && atEnd) {
      track.scrollTo({ left: 0, behavior })
      return
    }
    if (direction === -1 && atStart) {
      track.scrollTo({ left: max, behavior })
      return
    }

    track.scrollBy({ left: step() * direction, behavior })
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.controls}>
        <div
          className={styles.filter}
          role="tablist"
          aria-label={copy.available.filterLabel}
        >
          {copy.available.filters.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={filter === option.id}
              tabIndex={filter === option.id ? 0 : -1}
              className={styles.filterButton}
              data-active={filter === option.id ? 'true' : undefined}
              onClick={() => setFilter(option.id as FilterId)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            aria-label={copy.available.prevLabel}
            disabled={!canPage}
            onClick={() => page(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label={copy.available.nextLabel}
            disabled={!canPage}
            onClick={() => page(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <ul className={styles.track} ref={trackRef}>
        {horses.map((horse) => (
          <HorseCard key={horse.id} horse={horse} />
        ))}
      </ul>
    </div>
  )
}
