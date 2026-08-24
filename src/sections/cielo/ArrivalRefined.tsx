import { useEffect, useRef, useState } from 'react'
import { copy } from '@/content'
import {
  featuredFoal,
  availableMares,
  recentPlacements,
} from '@/content/horses'
import { COUNTRY_NAMES, type Horse } from '@/content/types'
import { horseDetailUrls } from '@/content/horseDetailUrls'
import { horsePictures } from '@/sections/available/images'
import { Reveal } from '@/components/primitives'
import { useDeclareHeroTone } from '@/sections/hero/useDeclareHeroTone'
import { cieloImages } from './images'
import styles from './ArrivalRefined.module.css'
import './palette.css'

/**
 * The fold: one dark navy plate held a hairline in from the viewport, the
 * photograph filling it under a single four stop scrim, the statement
 * bottom left, and a featured horse card bottom right whose thumbnails
 * switch which horse it shows.
 *
 * Type is the pairing the reference established: Jost semibold upright for
 * the statement, Libre Caslon italic in gold for the one accent word, Jost
 * for every control and label.
 *
 * The cast is the provenance rule's, not ours: only horses whose verified
 * photograph exists can be featured, so the card can never show a name
 * over the wrong horse. Sold horses keep their destination country, which
 * is the page's one claim of reach and is read from the data.
 *
 * Elementor map: a container with the navy background and radius, a
 * background image, one overlay div, and the card as an inner container.
 * The switcher is the same ~12 line class toggle as the stud deck; the
 * build map carries it.
 */
/* The cast is whichever horses have a hero sized verified photograph, in
   story order. Driven by the backdrop map rather than a slice, so a horse
   can only be featured if the fold actually has a picture big enough to
   carry it. */
const CAST: Horse[] = [featuredFoal, ...availableMares, ...recentPlacements]
  .filter((h) => h.id in cieloImages.backdrops && h.id in horsePictures)

const SEXES: Record<string, string> = {
  colt: 'Colt',
  filly: 'Filly',
  mare: 'Mare',
  gelding: 'Gelding',
  stallion: 'Stallion',
}

function categoryWord(horse: Horse) {
  if (horse.category === 'broodmare') return 'Broodmare'
  if (horse.category === 'sport-horse') return 'Sport horse'
  return horse.sex ? SEXES[horse.sex] : 'Foal'
}

function statusWord(horse: Horse) {
  if (horse.status.kind === 'sold') {
    const country = COUNTRY_NAMES[horse.status.country] ?? horse.status.country
    return `${copy.tenuta.horses.soldWord}, ${country}`
  }
  if (horse.status.kind === 'reserved') return copy.status.reserved
  return copy.status.available
}

export function ArrivalRefined() {
  const t = copy.cielo.arrival
  const [active, setActive] = useState(0)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  useDeclareHeroTone('dark')

  /* Warm the backdrops nobody has asked for yet.
     A stacked backdrop at opacity 0 is NOT loaded by the browser: it is
     not rendered, so Chromium never even runs resource selection on it.
     Measured here, the second, third and fourth frames sat at
     naturalWidth 0 indefinitely, and switching horse showed the bare
     navy plate. Nudging one to opacity 0.01 loaded it at once, which
     confirms the cause but leaves three ghost layers veiling the active
     frame. So the stack keeps a clean opacity 0 and the files are warmed
     through the platform's own preload instead, on idle so they never
     compete with the first paint. */
  useEffect(() => {
    let links: HTMLLinkElement[] = []
    const warm = () => {
      links = CAST.slice(1).map((h) => {
        const picture = cieloImages.backdrops[h.id]
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = picture.img.src
        const avif = picture.sources.avif ?? Object.values(picture.sources)[0]
        if (avif) {
          link.setAttribute('imagesrcset', avif)
          link.setAttribute('imagesizes', '100vw')
        }
        document.head.appendChild(link)
        return link
      })
    }

    /* requestIdleCallback is unimplemented in Safari, so the timeout is a
       real branch rather than defensive noise. */
    const canIdle = typeof window.requestIdleCallback === 'function'
    const handle = canIdle
      ? window.requestIdleCallback(warm, { timeout: 2000 })
      : window.setTimeout(warm, 1200)

    return () => {
      if (canIdle) window.cancelIdleCallback(handle as number)
      else window.clearTimeout(handle as number)
      links.forEach((l) => l.remove())
    }
  }, [])

  const horse = CAST[active]
  /* No visible "featured horse" label: the reference has none, and the
     card's own position and switcher make its job obvious. The string
     stays in the copy layer as the region's accessible name. */

  return (
    <section id="top" data-cielo className={styles.hero} aria-label={copy.brand.name}>
      <div className={styles.plate}>
        {/* One backdrop per horse, stacked and cross faded on opacity as
            the switcher moves, so the frame always shows the horse the
            card names. All of them are decorative: the card names and
            links the horse, which is the accessible route to him.

            Only the first carries high fetch priority. The rest are low,
            so the one that paints the fold wins the network and the
            others arrive before anybody can reach the switcher, without
            four hero sized files competing for the first paint. */}
        <div className={styles.media}>
          {CAST.map((h, i) => {
            const picture = cieloImages.backdrops[h.id]
            return (
              <picture key={h.id} className={styles.backdrop} data-active={i === active}>
                {Object.entries(picture.sources).map(([format, srcSet]) => (
                  <source key={format} type={`image/${format}`} srcSet={srcSet} sizes="100vw" />
                ))}
                <img
                  src={picture.img.src}
                  width={picture.img.w}
                  height={picture.img.h}
                  alt=""
                  decoding="async"
                  /* Spread with the lowercase attribute name. React 18's
                     runtime does not recognise camelCase fetchPriority and
                     logs a warning for it, while the TS DOM types only
                     accept the camelCase form, so neither spelling is
                     both quiet and typed. The spread satisfies both. */
                  {...({
                    fetchpriority: i === 0 ? 'high' : 'low',
                  } as Record<string, string>)}
                />
              </picture>
            )
          })}
        </div>
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.body}>
          <div className={styles.statementBlock}>
            <Reveal>
              <p className={styles.eyebrow}>{t.location}</p>
            </Reveal>
            <Reveal delay={120}>
              <h1 className={styles.statement}>
                {t.statement} <em className={styles.accent}>{t.statementAccent}</em>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className={styles.lede}>{t.lede}</p>
            </Reveal>
            <Reveal delay={280}>
              <div className={styles.actions}>
                <a className={styles.gold} href="#contact">
                  {copy.contact.cta}
                </a>
                <a className={styles.ghost} href="#horses">
                  {copy.tenuta.horses.seeAll}
                </a>
              </div>
            </Reveal>
          </div>

          {/* ---- The featured horse ---- */}
          <Reveal delay={340} className={styles.cardCell}>
            <div className={styles.card} role="group" aria-label={t.featuredLabel}>
              <a
                className={styles.cardName}
                href={horseDetailUrls[horse.id]}
                target="_blank"
                rel="noreferrer noopener"
              >
                {horse.name}
              </a>
              {/* The visual row's separators are dots, which carry no text,
                  so the three facts ran together as one word for a screen
                  reader. The sentence is spoken from its own node and the
                  decorated row is hidden from the tree. */}
              <p className={styles.cardMeta}>
                <span className="visually-hidden">
                  {`${categoryWord(horse)}, ${horse.year}, ${statusWord(horse)}`}
                </span>
                <span className={styles.metaRow} aria-hidden="true">
                  <span>{categoryWord(horse)}</span>
                  <span className={styles.dot} />
                  <span>{horse.year}</span>
                  <span className={styles.dot} />
                  <em className={styles.cardStatus}>{statusWord(horse)}</em>
                </span>
              </p>

              <div
                className={styles.thumbs}
                role="tablist"
                aria-label={t.switcherLabel}
              >
                {CAST.map((h, i) => (
                  <button
                    key={h.id}
                    ref={(node) => {
                      thumbRefs.current[i] = node
                    }}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={h.name}
                    tabIndex={i === active ? 0 : -1}
                    className={styles.thumb}
                    onClick={() => setActive(i)}
                    onKeyDown={(event) => {
                      const move =
                        event.key === 'ArrowRight'
                          ? 1
                          : event.key === 'ArrowLeft'
                            ? -1
                            : 0
                      if (!move) return
                      event.preventDefault()
                      /* Focus has to MOVE with the selection. Only the
                         selected thumb is tabbable, so leaving focus
                         behind on a now tabIndex -1 button drops the ring
                         mid interaction. */
                      const next = (active + move + CAST.length) % CAST.length
                      setActive(next)
                      thumbRefs.current[next]?.focus()
                    }}
                  >
                    <img
                      src={horsePictures[h.id].img.src}
                      alt=""
                      width={62}
                      height={62}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
