/* Direction D's fold photograph, from the client's own site (the same
   audited source as the offer/Terra sections on the other directions).
   Served as a responsive avif/webp/jpeg set by vite-imagetools. */

import fieldFoal from '@/assets/img/offer-foal.jpg?w=760;1140;1520;2048;2560&format=avif;webp;jpeg&as=picture'
/* TODO client-confirm: the desktop banner is AI GENERATED (supplied by the
   user, produced with Gemini). It is a mood background, never attached to
   a named horse, but a breeder fronting the site with AI horses needs the
   client's explicit sign-off, and the 1584px source is soft on 2x
   displays. Replace with commissioned photography when it exists. */
import banner from '@/assets/img/cielo-hero-banner.jpg?w=760;1140;1584&format=avif;webp;jpeg&as=picture'
import type { Picture } from '@/sections/hero/images'

/* The stud deck: two photographs from the client's own site. Square-ish
   crops, because the instax frame is square. */
import deckFoal from '@/assets/img/intro-foal-star.jpg?w=520;760;1040&format=avif;webp;jpeg&as=picture'
import deckYard from '@/assets/img/bases-yard.jpg?w=520;760&format=avif;webp;jpeg&as=picture'

export const cieloImages = {
  /** Dark bay foal standing in profile in a bright summer field. */
  field: fieldFoal as Picture,
  /** The wide pasture banner: mare and foal left, jumper right. */
  banner: banner as Picture,
  /** The stud section's instax deck, in stack order. */
  deck: [deckFoal, deckYard] as Picture[],
}
