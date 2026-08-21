import { useCallback, useRef, useState } from 'react'
import { copy } from '@/content'
import { damlines, availablePairingCount } from '@/content/pairings'
import { Container, Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import { cieloImages } from './images'
import styles from './ProgrammeCielo.module.css'
import './palette.css'

/**
 * The programme as a numbered selector, after the reference the user
 * supplied: three cards choose a panel, the chosen card fills navy while
 * the others stay white, and the panel below shows that part of the
 * programme with its photograph, its copy and its facts as pill tags.
 *
 * A real tablist, because selection reveals content: arrow keys and
 * Home/End move the selection, only the selected card takes tab focus,
 * and one panel is labelled by whichever card is active. Activation
 * follows focus, which is the correct pattern when switching panels is
 * instant and cheap.
 *
 * Elementor map: Elementor's own Tabs widget carries the semantics, with
 * the card row restyled as the tab titles and this panel as the content.
 * A UE content switcher works too; the build map notes what to check.
 */

/* The embryo tags are counted, never written: a pairing added to the data
   changes the section without anybody editing copy. */
const expectedYears = damlines
  .flatMap((d) => d.pairings)
  .map((p) => p.expectedYear)
  .filter((y): y is number => typeof y === 'number')

const EMBRYO_COUNTS = [
  `${availablePairingCount} pairings`,
  `${damlines.length} damlines`,
  ...(expectedYears.length ? [`Expected ${Math.min(...expectedYears)}`] : []),
]

export function ProgrammeCielo() {
  const p = copy.cielo.programme
  const lines = copy.offer.lines
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const move =
        event.key === 'ArrowRight' || event.key === 'ArrowDown'
          ? 1
          : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
            ? -1
            : 0

      if (move) {
        event.preventDefault()
        setActive((current) => {
          const next = (current + move + lines.length) % lines.length
          tabRefs.current[next]?.focus()
          return next
        })
        return
      }

      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        const next = event.key === 'Home' ? 0 : lines.length - 1
        tabRefs.current[next]?.focus()
        setActive(next)
      }
    },
    [lines.length],
  )

  const line = lines[active]
  const panel = p.panels[line.id as keyof typeof p.panels]
  const picture = cieloImages.programme[line.id]
  const tags = line.id === 'embryos' ? [...EMBRYO_COUNTS, ...panel.tags] : panel.tags

  return (
    <section
      id="programme"
      data-cielo
      className={styles.section}
      aria-labelledby="programme-heading"
    >
      <Container>
        <Reveal>
          <div className={styles.head}>
            <Plaque index={4} rule={false}>
              {p.label}
            </Plaque>
            <h2 id="programme-heading" className={styles.heading}>
              <Accented
                text={p.heading}
                accent={p.headingAccent}
                emClassName={styles.accent}
              />
            </h2>
            <p className={styles.intro}>{p.intro}</p>
          </div>
        </Reveal>

        {/* ---- The numbered selector ---- */}
        <Reveal delay={100}>
          <div
            className={styles.selector}
            role="tablist"
            aria-label={p.selectLabel}
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
          >
            {lines.map((item, i) => {
              const meta = p.panels[item.id as keyof typeof p.panels].meta
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[i] = node
                  }}
                  type="button"
                  role="tab"
                  id={`programme-tab-${item.id}`}
                  aria-controls="programme-panel"
                  aria-selected={active === i}
                  tabIndex={active === i ? 0 : -1}
                  className={styles.card}
                  onClick={() => setActive(i)}
                >
                  <span className={styles.thumb}>
                    <img
                      src={cieloImages.programme[item.id].img.src}
                      alt=""
                      width={80}
                      height={80}
                      loading="lazy"
                    />
                  </span>
                  <span className={styles.cardText}>
                    <span className={styles.cardTitle}>{item.title}</span>
                    <span className={styles.cardMeta}>{meta}</span>
                  </span>
                  <span className={styles.cardNumber} aria-hidden="true">
                    {item.number}
                  </span>
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* ---- The panel ---- */}
        <div
          className={styles.panel}
          id="programme-panel"
          role="tabpanel"
          aria-labelledby={`programme-tab-${line.id}`}
          tabIndex={-1}
        >
          <div className={styles.figure} key={`figure-${line.id}`}>
            <picture>
              {Object.entries(picture.sources).map(([format, srcSet]) => (
                <source
                  key={format}
                  type={`image/${format}`}
                  srcSet={srcSet}
                  sizes="(min-width: 900px) 520px, 90vw"
                />
              ))}
              <img
                src={picture.img.src}
                width={picture.img.w}
                height={picture.img.h}
                alt={panel.photoAlt}
                loading="lazy"
              />
            </picture>
          </div>

          <div className={styles.detail} key={`detail-${line.id}`}>
            <p className={styles.eyebrow}>{panel.eyebrow}</p>
            <h3 className={styles.title}>{line.title}</h3>
            <p className={styles.body}>{line.description}</p>

            <ul className={styles.tags} role="list">
              {tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>

            <a className={styles.cta} href={line.href}>
              <span className={styles.ctaLabel}>{line.cta}</span>
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>

        <Reveal delay={160}>
          <a className={styles.seeAll} href="#contact">
            <span className={styles.seeAllLabel}>{p.seeAll}</span>
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </a>
        </Reveal>
      </Container>
    </section>
  )
}
