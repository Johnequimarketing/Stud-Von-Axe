import { useEffect, useRef, useState } from 'react'
import { copy, news } from '@/content'
import { NewsCard } from './NewsCard'
import styles from './NewsCarousel.module.css'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* The homepage teases and links out: at most four stories ride here. */
const STORY_LIMIT = 4

/**
 * The news run: the same manual carousel mechanics as the catalogue, with
 * no filter. Native scroll snap for swipe, arrows that page by one card and
 * wrap at the ends, nothing automatic.
 */
export function NewsCarousel() {
  const trackRef = useRef<HTMLUListElement>(null)

  /* A short run fits without scrolling, in which case the arrows have
     nothing to do and should say so rather than looking broken. Remeasured
     on resize, since the same run fits at one width and not another. */
  const [canPage, setCanPage] = useState(true)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => setCanPage(track.scrollWidth - track.clientWidth > 8)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

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
    /* Generous tolerance rather than an exact comparison: scroll positions
       are fractional, and a click landing while a smooth scroll settles
       would otherwise read as "not quite at the end" and do nothing. */
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
      <div className={styles.arrows}>
        <button
          type="button"
          className={styles.arrow}
          aria-label={copy.news.prevLabel}
          disabled={!canPage}
          onClick={() => page(-1)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          className={styles.arrow}
          aria-label={copy.news.nextLabel}
          disabled={!canPage}
          onClick={() => page(1)}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <ul className={styles.track} ref={trackRef}>
        {news.slice(0, STORY_LIMIT).map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}
