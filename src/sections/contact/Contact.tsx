import { copy } from '@/content'
import {
  CTALink,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives'
import styles from './Contact.module.css'

/* The client's live contact page, which exists today at /en/contacts/.
   TODO client-confirm: point at the internal /contact route when the new
   site has one. */
const CONTACT_HREF = 'https://www.studvonaxe.it/en/contacts/'

/**
 * The page's closing ask: one statement, one button, one alternative.
 *
 * This replaced an enquiry form. The form had no endpoint, so submitting it
 * ran `preventDefault` and did nothing: a visitor typed a message, pressed
 * send, and got silence. A button that goes somewhere real is worth more
 * than a form that swallows enquiries, and the decision about where
 * enquiries should land now belongs to a proper contact page.
 *
 * It carries NO phone numbers or email address, which is the opposite of an
 * earlier version. The footer sits directly beneath this and its Contact
 * column already renders both numbers and the email from the same copy
 * keys, so listing them here made the section read as a second footer
 * stacked on the real one. WhatsApp stays because it is the one channel the
 * footer does not carry.
 *
 * The ask sits on a contained navy plate rather than a full bleed band.
 * Contained is what makes it work next to the footer: the footer is navy
 * too, and a full width navy section would run straight into it, where an
 * inset card keeps an ivory gutter around itself and reads as a plate. The
 * plate carries `data-theme="inverse"` so the primitives inside switch to
 * their dark ground inks.
 */
export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-heading">
      <Container>
        <Reveal>
          <div className={styles.plate} data-theme="inverse">
            <div className={styles.washes} aria-hidden="true" />

            <div className={styles.band}>
              <Eyebrow className={styles.eyebrow}>
                {copy.contact.eyebrow}
              </Eyebrow>
              <SectionHeading
                id="contact-heading"
                text={copy.contact.heading}
                accent={copy.contact.headingAccent}
                className={styles.heading}
              />
              <p className={styles.body}>{copy.contact.body}</p>

              <div className={styles.action}>
                <CTALink href={CONTACT_HREF} variant="solid" external>
                  {copy.contact.cta}
                </CTALink>
              </div>

              <p className={styles.alt}>
                {copy.contact.directLabel}{' '}
                <a
                  className={styles.whatsapp}
                  href={`https://wa.me/${copy.contact.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {copy.contact.whatsapp}
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
