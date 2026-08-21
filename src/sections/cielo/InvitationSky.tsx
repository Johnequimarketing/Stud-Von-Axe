import { copy } from '@/content'
import { Reveal } from '@/components/primitives'
import { Accented } from '@/sections/tenuta/Accented'
import { Plaque } from '@/sections/tenuta/Plaque'
import styles from './InvitationSky.module.css'
import './palette.css'

/**
 * Concept C, "The sky": the fold's gradient returns with nothing on it
 * but the ask at display size and the gold pill. The quietest of the
 * three: the page opens on the sky and closes on it, and the emptiness
 * IS the design. WhatsApp rides as a text line so the pill stays alone.
 *
 * Elementor map: a container with the gradient background and a heading.
 */
export function InvitationSky() {
  const t = copy.contact

  return (
    <section id="contact" data-cielo className={styles.section} aria-labelledby="invitation-heading">
      <div className={styles.inner}>
        <Reveal>
          <Plaque index={6} rule={false} className={styles.plaque}>
            {copy.cielo.invitation.label}
          </Plaque>
        </Reveal>
        <Reveal delay={100}>
          <h2 id="invitation-heading" className={styles.heading}>
            <Accented text={t.heading} accent={t.headingAccent} emClassName={styles.accent} />
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className={styles.body}>{t.body}</p>
        </Reveal>
        <Reveal delay={260}>
          <div className={styles.actions}>
            <a className={styles.solid} href={`mailto:${t.email}`}>
              {t.cta}
            </a>
            <p className={styles.direct}>
              {t.directLabel}{' '}
              <a
                className={styles.whatsapp}
                href={`https://wa.me/${t.whatsappNumber}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t.whatsapp}
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
