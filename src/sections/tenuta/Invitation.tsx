import { copy } from '@/content'
import { Container, Reveal } from '@/components/primitives'
import { Accented } from './Accented'
import { Plaque } from './Plaque'
import styles from './Invitation.module.css'

/**
 * The closing ask, as an invitation rather than a sales button: Mark's
 * final-CTA plate, dark and generous, with the paired pills mirroring the
 * hero so the page opens and closes on the same gesture. Phones and email
 * live in the footer directly beneath, so they are not repeated here.
 *
 * Elementor map: a container with the dark background and radius, centred
 * content. The build map notes the future option of a cinematic video
 * ground here, the same HeroMedia slot as the hero.
 */
export function Invitation() {
  const t = copy.contact

  return (
    <section id="contact" className={styles.section} aria-labelledby="invitation-heading">
      <Container>
        <div className={styles.plate} data-theme="inverse">
          <Reveal>
            <Plaque tone="bone" className={styles.plaque}>
              {t.eyebrow}
            </Plaque>
          </Reveal>
          <Reveal delay={120}>
            <h2 id="invitation-heading" className={styles.heading}>
              <Accented
                text={t.heading}
                accent={t.headingAccent}
                emClassName={styles.accent}
              />
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className={styles.body}>{t.body}</p>
          </Reveal>
          <Reveal delay={280}>
            <div className={styles.actions}>
              <a className={styles.cta} href={`mailto:${t.email}`}>
                <span>{t.cta}</span>
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </a>
              <a
                className={styles.whatsapp}
                href={`https://wa.me/${t.whatsappNumber}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t.whatsapp}
              </a>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
