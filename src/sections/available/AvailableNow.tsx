import { copy } from '@/content'
import {
  CTALink,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives'
import { Carousel } from './Carousel'
import styles from './AvailableNow.module.css'

/* The live catalogue until internal horse pages exist.
   TODO client-confirm: point at /horses when those are built. */
const CATALOGUE_HREF = 'https://www.studvonaxe.it/en/foals/'

/**
 * The commercial heart: the featured foal and the broodmares actually with
 * the stud, as one filtered run of cards ending in a way out.
 *
 * Sold horses used to ride here too, wearing their destination country as a
 * badge. They left when the section kept its promise instead: it says
 * "Available now", and a sold horse is not available.
 */
export function AvailableNow() {
  return (
    <Section id="available" labelledBy="available-heading">
      <Container>
        <Reveal>
          <div className={styles.head}>
            <Eyebrow>{copy.available.eyebrow}</Eyebrow>
            <SectionHeading
              id="available-heading"
              text={copy.available.heading}
              accent={copy.available.headingAccent}
              className={styles.heading}
            />
            <p className={styles.intro}>{copy.available.intro}</p>
          </div>
        </Reveal>

        <Reveal>
          <Carousel />
        </Reveal>

        {/* The way out. The brief asks every homepage run to end with one
            rather than becoming the whole catalogue. */}
        <Reveal>
          <div className={styles.seeAll}>
            <CTALink href={CATALOGUE_HREF} external>
              {copy.available.seeAll}
            </CTALink>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
