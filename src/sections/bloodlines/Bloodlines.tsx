import { useState } from 'react'
import { copy, damlines } from '@/content'
import {
  CTALink,
  Container,
  Eyebrow,
  MetaRow,
  Pedigree,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives'
import { DamlineTabs } from './DamlineTabs'
import {
  DamFigure,
  EMBRYO_INDEX,
  countWord,
  damSpecs,
  pairingCount,
} from './parts'
import styles from './Bloodlines.module.css'

/**
 * Embryos, on the page's third dark ground.
 *
 * An embryo has no photograph, so the dam is the subject: she is a living
 * horse with a verified picture of herself, and the pairings are counted
 * beside her rather than listed. Everything sire by sire belongs on the
 * horse's own page, which is why this section carries a name, a pedigree,
 * one line in the stud's own words, three counted facts and two actions,
 * and nothing else.
 *
 * Built for the enquiry: the gold button is the primary action and opens a
 * mail naming the damline. Chosen over three layouts (a light card, this,
 * and a plate floating over one wide photograph).
 *
 * The dark ground is a deliberate spend. The page budgets the hero and the
 * footer as its dark moments plus one tinted band for results; this is a
 * third. It is here because the gold does the most work on navy and
 * because this is the section meant to convert.
 */
export function Bloodlines() {
  const [active, setActive] = useState(0)
  const line = damlines[active]
  const n = pairingCount(line)

  return (
    <Section id="bloodlines" labelledBy="bloodlines-heading" tone="inverse">
      <Container>
        <Reveal>
          <div className={styles.top}>
            <div>
              <Eyebrow>{copy.bloodlines.eyebrow}</Eyebrow>
              <SectionHeading
                id="bloodlines-heading"
                text={copy.bloodlines.heading}
                accent={copy.bloodlines.headingAccent}
                className={styles.heading}
              />
              <p className={styles.intro}>{copy.bloodlines.bodyShort}</p>
            </div>
            <DamlineTabs
              active={active}
              onSelect={setActive}
              className={styles.tabs}
            />
          </div>
        </Reveal>

        <Reveal>
          <div
            key={line.id}
            id={`damline-panel-${line.id}`}
            role="tabpanel"
            aria-labelledby={`damline-tab-${line.id}`}
            className={styles.card}
          >
            <div className={styles.media}>
              <DamFigure line={line} width={560} className={styles.figure} />
              {/* The reference carries a covering fee here. The stud
                  publishes no prices, so the chip carries the fact that is
                  actually available and actually commercial. */}
              <span className={styles.chip}>
                <strong className={styles.chipValue}>{n}</strong>
                {countWord(n)}
              </span>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.damName}>{line.dam}</h3>
              <Pedigree
                pedigree={line.pedigree}
                size="meta"
                className={styles.pedigree}
              />

              {/* Only when the stud has actually written one. Two dams
                  have none and show nothing rather than filler. */}
              {line.note ? <p className={styles.note}>{line.note}</p> : null}

              <MetaRow items={damSpecs(line)} className={styles.specs} />

              <div className={styles.actions}>
                <CTALink
                  href={`mailto:${copy.contact.email}?subject=${encodeURIComponent(
                    `Enquiry: ${line.dam} pairings`,
                  )}`}
                  variant="solid"
                  ariaLabel={`${copy.available.enquireAbout} ${line.dam}`}
                >
                  {copy.available.enquire}
                </CTALink>
                <CTALink href={EMBRYO_INDEX} external>
                  {copy.bloodlines.pairingsCta}
                </CTALink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
