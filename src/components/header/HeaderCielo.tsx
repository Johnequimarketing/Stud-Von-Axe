import { copy } from '@/content'
import {
  BrandMark,
  HeaderNav,
  LanguageToggle,
  MenuButton,
  MobileMenu,
} from './HeaderParts'
import { useHeaderState } from './useHeaderState'
import styles from './HeaderCielo.module.css'

/**
 * Direction D's header, after the reference's fold: logo left, nav
 * centred, actions right with a frosted glass Enquire pill. The fold is
 * light, so the header runs ink from the first frame; on scroll the whole
 * bar takes the glass surface the pill already wears.
 */
export function HeaderCielo() {
  const { open, setOpen, scrolled } = useHeaderState()

  return (
    <>
      <a className={styles.skip} href="#main">
        {copy.nav.skip}
      </a>

      <header className={styles.bar} data-surface={scrolled ? 'glass' : 'clear'}>
        <div className={styles.inner}>
          <BrandMark light />
          <HeaderNav className={styles.nav} />
          <div className={styles.actions}>
            <LanguageToggle />
            <a className={styles.enquire} href="#contact">
              {copy.nav.enquire}
            </a>
            <MenuButton open={open} onToggle={() => setOpen((v) => !v)} />
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
