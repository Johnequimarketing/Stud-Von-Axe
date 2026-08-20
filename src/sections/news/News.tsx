import { copy } from '@/content'
import {
  CTALink,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives'
import { NewsCarousel } from './NewsCarousel'
import styles from './News.module.css'

/* The live news index until internal post pages exist.
   TODO client-confirm: point at /news when those are built. */
const ALL_NEWS_HREF = 'https://www.studvonaxe.it/en/homepage/'

/**
 * News as a card run: headline, one line, out to the story. The ruled list
 * it replaces read as an archive; cards give the stories the photography
 * they already have (two of the three subjects carry verified photos) and
 * put the section in the same movement language as the catalogue.
 */
export function News() {
  return (
    <Section id="news" labelledBy="news-heading">
      <Container>
        <Reveal>
          <div className={styles.head}>
            <div>
              <Eyebrow>{copy.news.eyebrow}</Eyebrow>
              <SectionHeading
                id="news-heading"
                text={copy.news.heading}
                accent={copy.news.headingAccent}
                className={styles.heading}
              />
            </div>
            <CTALink href={ALL_NEWS_HREF} external className={styles.viewAll}>
              {copy.news.viewAll}
            </CTALink>
          </div>
        </Reveal>

        <Reveal>
          <NewsCarousel />
        </Reveal>
      </Container>
    </Section>
  )
}
