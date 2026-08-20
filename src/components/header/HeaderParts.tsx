import { copy } from '@/content'
import logoHorizontal from '@/assets/brand/logo-horizontal-light.webp'
import styles from './HeaderParts.module.css'

export const NAV_LINKS = [
  { label: copy.nav.foals, href: '#available' },
  { label: copy.nav.embryos, href: '#bloodlines' },
  { label: copy.nav.semen, href: '#semen' },
  { label: copy.nav.results, href: '#results' },
  { label: copy.nav.news, href: '#news' },
]

/**
 * The supplied artwork is white-on-transparent, which reads over the hero.
 * On a light shell the same file is used as a mask and filled navy, and the
 * two layers crossfade.
 * TODO client-confirm: swap in the light-background (navy/gold) artwork
 * when it arrives: masking loses the gold crown.
 */
export function BrandMark({ light }: { light: boolean }) {
  return (
    <a href="#top" className={styles.brand} aria-label={copy.brand.name}>
      <img
        src={logoHorizontal}
        alt=""
        className={styles.brandWhite}
        data-hidden={light ? 'true' : undefined}
        width={600}
        height={264}
      />
      <span
        className={styles.brandInk}
        data-visible={light ? 'true' : undefined}
        style={{ ['--logo-src' as string]: `url(${logoHorizontal})` }}
        aria-hidden="true"
      />
    </a>
  )
}

export function HeaderNav({ className }: { className?: string }) {
  return (
    <nav
      className={[styles.nav, className].filter(Boolean).join(' ')}
      aria-label="Primary"
    >
      <ul className={styles.navList}>
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a className={styles.navLink} href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function LanguageToggle() {
  return (
    <p className={styles.language}>
      <span aria-current="true">{copy.footer.language.current}</span>
      <span className={styles.langDivider} aria-hidden="true">
        /
      </span>
      {/* TODO client-confirm: Italian is not wired up yet. */}
      <a className={styles.langLink} href="#top">
        {copy.footer.language.other}
      </a>
    </p>
  )
}

export function EnquireButton() {
  return (
    <a className={styles.enquire} href="#contact">
      {copy.nav.enquire}
    </a>
  )
}

export function MenuButton({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={styles.menuButton}
      aria-expanded={open}
      aria-controls="mobile-menu"
      onClick={onToggle}
    >
      <span className={styles.menuBars} aria-hidden="true">
        <span data-open={open ? 'true' : undefined} />
        <span data-open={open ? 'true' : undefined} />
      </span>
      <span className={styles.menuLabel}>
        {open ? copy.nav.close : copy.nav.menu}
      </span>
    </button>
  )
}

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <div
      id="mobile-menu"
      className={[styles.mobileMenu, open && styles.mobileMenuOpen]
        .filter(Boolean)
        .join(' ')}
      hidden={!open}
    >
      <nav aria-label="Mobile">
        <ul className={styles.mobileList}>
          {[...NAV_LINKS, { label: copy.nav.contact, href: '#contact' }].map(
            (link) => (
              <li key={link.href}>
                <a className={styles.mobileLink} href={link.href} onClick={onClose}>
                  {link.label}
                </a>
              </li>
            ),
          )}
        </ul>
      </nav>
      <div className={styles.mobileFoot}>
        <LanguageToggle />
        <a
          className={styles.mobileWhatsapp}
          href={`https://wa.me/${copy.contact.whatsappNumber}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          {copy.contact.whatsapp}
        </a>
      </div>
    </div>
  )
}
