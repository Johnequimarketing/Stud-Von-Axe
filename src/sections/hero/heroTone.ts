/**
 * The header floats over the hero, so it needs to know whether the ground
 * beneath it is a photograph or the ivory page. Each hero variant declares
 * its own tone and the header subscribes.
 */
export type HeroTone = 'dark' | 'light'

let tone: HeroTone = 'dark'
const listeners = new Set<() => void>()

export function setHeroTone(next: HeroTone) {
  if (next === tone) return
  tone = next
  listeners.forEach((l) => l())
}

export function getHeroTone() {
  return tone
}

export function subscribeHeroTone(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
