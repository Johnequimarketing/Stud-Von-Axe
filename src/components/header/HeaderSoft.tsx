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
import styles from './HeaderSoft.module.css'

/**
 * A softly rounded bar floating clear of the page edge at every scroll
 * position. Its geometry never changes, so scrolling only crossfades the
 * surface underneath it and there is no layout work per frame.
 *
 * Three surfaces, chosen from two inputs. `heroIsLight` says what the bar
 * is floating over; `scrolled` says whether the hero is still behind it.
 */
export function HeaderSoft() {
  const { open, setOpen, scrolled, heroIsLight } = useHeaderState()

  const light = scrolled || heroIsLight
  const surface = scrolled
    ? styles.light
    : heroIsLight
      ? [styles.light, styles.lightFlat].join(' ')
      : styles.overPhoto

  return (
    <>
      <a className={styles.skip} href="#main">
        {copy.nav.skip}
      </a>

      <header className={styles.wrap}>
        <div className={[styles.shell, surface].join(' ')}>
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
