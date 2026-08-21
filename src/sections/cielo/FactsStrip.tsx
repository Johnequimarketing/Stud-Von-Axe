import { Container, Reveal } from '@/components/primitives'
import { FeatureBar } from './FeatureBar'
import styles from './FactsStrip.module.css'
import './palette.css'

/**
 * The four audited facts as their own strip, first thing below the fold:
 * the fold makes the impression, this makes the case. Held to the page's
 * 1140 measure like every other section.
 */
export function FactsStrip() {
  return (
    <section data-cielo className={styles.section} aria-label="The programme in four facts">
      <Container>
        <Reveal>
          <FeatureBar />
        </Reveal>
      </Container>
    </section>
  )
}
