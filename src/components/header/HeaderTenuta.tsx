import { copy } from '@/content'
import {
  BrandMark,
  EnquireButton,
  HeaderNav,
  LanguageToggle,
  MenuButton,
  MobileMenu,
} from './HeaderParts'
import { useHeaderState } from './useHeaderState'
import styles from './HeaderTenuta.module.css'

/**
 * Direction C's header: a full-width bar, transparent over the hero with
 * bone inks, gaining a bone glass surface and a bottom hairline once the
 * page scrolls. Geometry never changes, only the surface crossfades, the
 * same no-layout-per-frame rule as the other directions.
 *
 * Elementor map: a sticky header template with two style states switched
 * on Elementor's own "sticky effects" scroll offset; the build map carries
 * the CSS for both states.
 */
export function HeaderTenuta() {
  const { open, setOpen, scrolled, heroIsLight } = useHeaderState()

  const light = scrolled || heroIsLight

  return (
    <>
      <a className={styles.skip} href="#main">
        {copy.nav.skip}
      </a>

      <header
        className={styles.bar}
        data-surface={light ? 'bone' : 'clear'}
      >
        <div className={styles.inner}>
          <BrandMark light={light} />
          <HeaderNav className={styles.nav} />
          <div className={styles.actions}>
            <LanguageToggle />
            <EnquireButton />
            <MenuButton open={open} onToggle={() => setOpen((v) => !v)} />
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
