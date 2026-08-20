import { copy } from '@/content'
import { Container, Section } from '@/components/primitives'
import logoHorizontal from '@/assets/brand/logo-horizontal-light.webp'
import styles from './Footer.module.css'

const NAV = [
  { label: copy.nav.foals, href: '#available' },
  { label: copy.nav.embryos, href: '#bloodlines' },
  { label: copy.nav.semen, href: '#semen' },
  { label: copy.nav.results, href: '#results' },
  { label: copy.nav.news, href: '#news' },
  { label: copy.nav.contact, href: '#contact' },
]

/** The single dark moment on the page. Carries no long copy. */
export function Footer() {
  return (
    <Section as="footer" tone="inverse" className={styles.footer}>
      <Container>
        <h2 className="visually-hidden">Site information</h2>
        <div className={styles.top}>
          {/* The supplied white lockup is made for exactly this ground. */}
          <img
            src={logoHorizontal}
            alt={copy.brand.name}
            className={styles.logo}
            width={600}
            height={264}
          />

          <div className={styles.columns}>
            <div className={styles.column}>
              <h3 className={styles.columnHeading}>{copy.footer.navHeading}</h3>
              <ul className={styles.list}>
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a className={styles.link} href={item.href}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.column}>
              <h3 className={styles.columnHeading}>{copy.footer.contactHeading}</h3>
              <ul className={styles.list}>
                {copy.contact.contacts.map((person) => (
                  <li key={person.tel}>
                    <a className={styles.link} href={`tel:${person.tel}`}>
                      {person.phone}
                    </a>
                  </li>
                ))}
                <li>
                  <a className={styles.link} href={`mailto:${copy.contact.email}`}>
                    {copy.contact.email}
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.column}>
              <h3 className={styles.columnHeading}>{copy.footer.pedigreeHeading}</h3>
              <ul className={styles.list}>
                {copy.footer.pedigreeLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      className={styles.link}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.column}>
              <h3 className={styles.columnHeading}>{copy.footer.followHeading}</h3>
              <ul className={styles.list}>
                {copy.footer.social.map((item) => (
                  <li key={item.label}>
                    <a
                      className={styles.link}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.legal}>
            {copy.footer.legal} · {copy.brand.tagline}
          </p>
          <p className={styles.language}>
            <span aria-current="true">{copy.footer.language.current}</span>
            <span className={styles.divider} aria-hidden="true">
              /
            </span>
            <a className={styles.langLink} href="#top">
              {copy.footer.language.other}
            </a>
          </p>
        </div>
      </Container>
    </Section>
  )
}
