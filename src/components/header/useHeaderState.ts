import { useEffect, useState, useSyncExternalStore } from 'react'
import { getHeroTone, subscribeHeroTone } from '@/sections/hero/heroTone'

/** Scroll and mobile-menu state shared by every header variant. */
export function useHeaderState() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  /* Over a light hero the header needs its light treatment straight away,
     not only after scrolling. */
  const heroTone = useSyncExternalStore(subscribeHeroTone, getHeroTone, () => 'dark' as const)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Lock the page while the mobile menu covers it. */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return { open, setOpen, scrolled, heroIsLight: heroTone === 'light' }
}
