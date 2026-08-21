import { copy } from '@/content'
import {
  CTALink,
  Container,
  Eyebrow,
  Icon,
  Reveal,
  Section,
  SectionHeading,
  type IconName,
} from '@/components/primitives'
import styles from './SemenRoute.module.css'

/**
 * Semen sales, as a route rather than a data sheet.
 *
 * The three facts are the same ones the client publishes: frozen at Avantea
 * in Cremona, shipped across the EU and for export, stallion availability
 * on request. What changes is that they read as the path a straw actually
 * travels, ending at the reader's own mare, so the section asks for the
 * enquiry instead of listing specifications.
 *
 * The device is the house one: a hairline running through gold node dots,
 * the same mark the pedigree separators use, drawn at section scale. This is
 * the first place that motif does structural work rather than decorating.
 *
 * Centred, on the client's call. The path reads as a journey down the middle
 * of the page and the button sits at the end of it, which puts the one
 * action in the section on the centre line.
 */
export function SemenSection() {
  const steps = copy.semen.routeSteps

  return (
    <Section id="semen" labelledBy="semen-heading" className={styles.section}>
      <div className={styles.wash} aria-hidden="true" />
      <Container>
        <Reveal>
          <div className={styles.head}>
            <Eyebrow>{copy.semen.eyebrow}</Eyebrow>
            <SectionHeading
              id="semen-heading"
              text={copy.semen.heading}
              accent={copy.semen.headingAccent}
              className={styles.heading}
            />
            <p className={styles.body}>{copy.semen.body}</p>
          </div>
        </Reveal>

        <Reveal>
          {/* The order is carried by the list, so the rule and the nodes
              are free to be purely decorative. */}
          <ol className={styles.route}>
            {steps.map((step) => (
              <li key={step.label} className={styles.step}>
                <span className={styles.node} aria-hidden="true">
                  <Icon name={step.icon as IconName} size={20} />
                </span>

                <div className={styles.stepText}>
                  <p className={styles.stepLabel}>{step.label}</p>
                  <p className={styles.stepBody}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* The end of the path. Centred, so it sits on the same line the
            route runs down. */}
        <Reveal>
          <div className={styles.action}>
            <CTALink href="#contact" variant="solid">
              {copy.semen.cta}
            </CTALink>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
