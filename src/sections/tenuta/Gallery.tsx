import { copy } from '@/content'
import { Container, Reveal } from '@/components/primitives'
import { Photo } from './Photo'
import { Plaque } from './Plaque'
import { tenutaImages } from './images'
import styles from './Gallery.module.css'

/**
 * A curated, asymmetric close to the photography: one large frame with a
 * two-stack beside it, then the composition mirrored. Uncaptioned on
 * purpose: the provenance rule forbids the wrong name, and no name at all
 * is how a gallery stays a mood rather than a catalogue.
 *
 * Elementor map: a CSS grid of image widgets with the shared hover scale;
 * a UE gallery widget is the alternative recorded in the build map.
 */
const g = tenutaImages.gallery

export function Gallery() {
  return (
    <section className={styles.section} aria-label={copy.tenuta.gallery.label}>
      <Container>
        <Reveal className={styles.head}>
          <Plaque index={5}>{copy.tenuta.gallery.label}</Plaque>
        </Reveal>

        <div className={styles.grid}>
          <Reveal className={styles.cellWide}>
            <Photo
              picture={g.unguessable}
              alt="A horse and rider on course at a show"
              sizes="(min-width: 900px) 62vw, 100vw"
              className={styles.photoWide}
              hover
            />
          </Reveal>
          <Reveal delay={120} className={styles.cellTall}>
            <Photo
              picture={g.yard}
              alt="A dark bay horse at the yard"
              sizes="(min-width: 900px) 34vw, 100vw"
              className={styles.photoTall}
              hover
            />
          </Reveal>
          <Reveal delay={80} className={styles.cellSmall}>
            <Photo
              picture={g.charina}
              alt="A foal standing in a field"
              sizes="(min-width: 900px) 34vw, 48vw"
              className={styles.photoSmall}
              hover
            />
          </Reveal>
          <Reveal delay={160} className={styles.cellSmallB}>
            <Photo
              picture={g.uniqueTouch}
              alt="A foal trotting across a paddock"
              sizes="(min-width: 900px) 34vw, 48vw"
              className={styles.photoSmall}
              hover
            />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
