import { copy } from '@/content'
import { Container, Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import { galleryFrames, FramePicture } from './galleryFrames'
import styles from './GalleryMosaic.module.css'
import './palette.css'

/**
 * Concept A, "Mosaic": an asymmetric bento of six frames with one navy
 * Instagram tile closing the composition, so the grid itself makes the
 * ask. Hover lifts the caption chip in from the frame's foot; the chip is
 * the fold's glass, and frames without a verified name simply never get
 * one.
 *
 * Elementor map: a CSS grid of image widgets plus one container tile; a
 * UE gallery only if it can reproduce exactly this spread.
 */
export function GalleryMosaic() {
  const g = copy.cielo.gallery

  return (
    <section id="gallery" data-cielo className={styles.section} aria-labelledby="gallery-heading">
      <Container>
        <Reveal>
          <div className={styles.head}>
            <div>
              <Plaque index={5} rule={false}>
                {g.label}
              </Plaque>
              <h2 id="gallery-heading" className={styles.heading}>
                <Accented text={g.heading} accent={g.headingAccent} emClassName={styles.accent} />
              </h2>
            </div>
          </div>
        </Reveal>

        <div className={styles.grid}>
          {galleryFrames.map((frame, i) => (
            <Reveal key={frame.id} delay={60 * i} className={styles[`cell${i}`]}>
              <figure className={styles.frame}>
                <FramePicture
                  frame={frame}
                  sizes="(min-width: 900px) 560px, 92vw"
                />
                {frame.caption ? (
                  <figcaption className={styles.chip}>{frame.caption}</figcaption>
                ) : null}
              </figure>
            </Reveal>
          ))}

          {/* The Instagram tile: the grid's last cell is the ask. */}
          <Reveal delay={380} className={styles.cellIg}>
            <a
              className={styles.igTile}
              href={g.instagramUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className={styles.igHandle}>{g.handle}</span>
              <span className={styles.igLabel}>
                {g.follow}
                <span className={styles.igArrow} aria-hidden="true">
                  ↗
                </span>
              </span>
            </a>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
