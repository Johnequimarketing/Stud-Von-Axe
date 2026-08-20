import { useLayoutEffect } from 'react'
import { setHeroTone, type HeroTone } from './heroTone'

/** Each hero variant declares the ground the header will float over. */
export function useDeclareHeroTone(tone: HeroTone) {
  useLayoutEffect(() => {
    setHeroTone(tone)
  }, [tone])
}
