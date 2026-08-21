import { useCallback, useRef, useState } from 'react'
import { copy } from '@/content'
import {
  featuredFoal,
  availableMares,
  recentPlacements,
} from '@/content/horses'
import { COUNTRY_NAMES, type Horse } from '@/content/types'
import { horseDetailUrls } from '@/content/horseDetailUrls'
import { Container, CTALink, Reveal } from '@/components/primitives'
import { Accented } from './Accented'
import { Photo } from './Photo'
import { Plaque } from './Plaque'
import { showcasePictures } from './images'
import styles from './Horses.module.css'

/**
 * The centrepiece: an interactive horse discovery experience, not a card
 * grid. Desktop is a name list beside one large portrait; pointing at or
 * arrowing to a name crossfades the portrait and its meta line. Mobile is
 * a scroll-snap gallery, a redesigned interaction rather than a shrunk one.
 *
 * The cast is decided by the provenance rule, not by us: a horse appears
 * here only if `showcasePictures` holds its verified photograph. Sold
 * horses appear with their destination country as quiet text, the page's
 * proof of international reach.
 *
 * Semantics: the list is a tablist (selection reveals content), the same
 * pattern as the old IntroStory chapters. Hover previews, click/arrow
 * selects, and the portrait region is the single tabpanel.
 *
 * Elementor map: UE content switcher / interactive banner, or the ~40 line
 * vanilla JS version carried in the build map. The mobile gallery is pure
 * CSS scroll snap either way.
 */

/* Order follows the story: the available horses first, then the produce
   that has gone abroad. */
const CAST_IDS = [
  featuredFoal.id,
  ...availableMares.map((h) => h.id),
  ...recentPlacements.map((h) => h.id),
]

const ALL_HORSES: Record<string, Horse> = Object.fromEntries(
  [featuredFoal, ...availableMares, ...recentPlacements].map((h) => [h.id, h]),
)

const cast = CAST_IDS.filter((id) => id in showcasePictures).map(
  (id) => ALL_HORSES[id],
)

const SEXES: Record<string, string> = {
  colt: 'Colt',
  filly: 'Filly',
  mare: 'Mare',
}

function metaLine(horse: Horse) {
  return [horse.year, horse.sex ? SEXES[horse.sex] : null, horse.pedigree[0]]
    .filter(Boolean)
    .join(' · ')
}

function statusLine(horse: Horse) {
  if (horse.status.kind === 'sold') {
    return `${copy.tenuta.horses.soldWord} · ${COUNTRY_NAMES[horse.status.country] ?? horse.status.country}`
  }
  return copy.status.available
}

/** The horse's short call name, for the compact View link. */
function firstName(horse: Horse) {
  return horse.name.split(' ')[0]
}

export function Horses() {
  const t = copy.tenuta.horses
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const move =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0
    if (!move) return
    event.preventDefault()
    setActive((current) => {
      const next = (current + move + cast.length) % cast.length
      tabRefs.current[next]?.focus()
      return next
    })
  }, [])

  const selected = cast[active]

  return (
    <section id="horses" className={styles.section} aria-labelledby="horses-heading">
      <Container>
        {/* The header is shared by both layouts, so the section keeps one
            heading (and one aria label) at every width. */}
        <Reveal className={styles.head}>
          <Plaque index={2}>{t.label}</Plaque>
          <h2 id="horses-heading" className={styles.heading}>
            <Accented text={t.heading} accent={t.headingAccent} emClassName={styles.accent} />
          </h2>
          <p className={styles.intro}>{t.intro}</p>
        </Reveal>

        <div className={styles.grid}>
          {/* ---- The list side ------------------------------------- */}
          <div className={styles.listSide}>
            <Reveal delay={140}>
              <div
                className={styles.names}
                role="tablist"
                aria-label={t.listLabel}
                aria-orientation="vertical"
                onKeyDown={onKeyDown}
              >
                {cast.map((horse, i) => (
                  <button
                    key={horse.id}
                    ref={(el) => {
                      tabRefs.current[i] = el
                    }}
                    type="button"
                    role="tab"
                    id={`horse-tab-${horse.id}`}
                    aria-selected={i === active}
                    aria-controls="horse-stage"
                    tabIndex={i === active ? 0 : -1}
                    className={styles.name}
                    data-active={i === active || undefined}
                    onClick={() => setActive(i)}
                    onPointerEnter={(e) => {
                      /* Hover previews on a real pointer only: on touch the
                         first tap must select, not preview. */
                      if (e.pointerType === 'mouse') setActive(i)
                    }}
                  >
                    <span className={styles.nameIndex} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.nameText}>{horse.name}</span>
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={220}>
              <CTALink href="https://www.studvonaxe.it/en/cavalli/" external>
                {t.seeAll}
              </CTALink>
            </Reveal>
          </div>

          {/* ---- The stage ----------------------------------------- */}
          <Reveal className={styles.stageSide} delay={100}>
            <div
              id="horse-stage"
              className={styles.stage}
              role="tabpanel"
              aria-labelledby={`horse-tab-${selected.id}`}
            >
              <div className={styles.portraits}>
                {cast.map((horse, i) => (
                  <div
                    key={horse.id}
                    className={styles.portrait}
                    data-active={i === active || undefined}
                  >
                    <Photo
                      picture={showcasePictures[horse.id]}
                      alt={`${horse.name}, ${metaLine(horse)}`}
                      sizes="(min-width: 900px) 54vw, 100vw"
                      className={styles.portraitPhoto}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.metaStrip}>
                <div className={styles.metaText} key={selected.id}>
                  <p className={styles.metaName}>
                    {selected.name}
                    <span className={styles.chip}>{statusLine(selected)}</span>
                  </p>
                  <p className={styles.metaLine}>{metaLine(selected)}</p>
                </div>
                <a
                  className={styles.view}
                  href={horseDetailUrls[selected.id]}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t.view} {firstName(selected)}
                  <span aria-hidden="true"> ↗</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ---- Mobile: the redesigned interaction ------------------- */}
        <div className={styles.rail}>
          <ul className={styles.railTrack} role="list" aria-label={t.label}>
            {cast.map((horse) => (
              <li key={horse.id} className={styles.railItem}>
                <Photo
                  picture={showcasePictures[horse.id]}
                  alt={`${horse.name}, ${metaLine(horse)}`}
                  sizes="82vw"
                  className={styles.railPhoto}
                />
                <p className={styles.metaName}>
                  {horse.name}
                  <span className={styles.chip}>{statusLine(horse)}</span>
                </p>
                <p className={styles.metaLine}>{metaLine(horse)}</p>
                <a
                  className={styles.view}
                  href={horseDetailUrls[horse.id]}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t.view} {firstName(horse)}
                  <span aria-hidden="true"> ↗</span>
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.railFoot}>
            <CTALink href="https://www.studvonaxe.it/en/cavalli/" external>
              {t.seeAll}
            </CTALink>
          </div>
        </div>
      </Container>
    </section>
  )
}
