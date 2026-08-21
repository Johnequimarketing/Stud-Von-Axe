/* Direction D's fold photograph, from the client's own site (the same
   audited source as the offer/Terra sections on the other directions).
   Served as a responsive avif/webp/jpeg set by vite-imagetools. */

import fieldFoal from '@/assets/img/offer-foal.jpg?w=760;1140;1520;2048;2560&format=avif;webp;jpeg&as=picture'
import type { Picture } from '@/sections/hero/images'

export const cieloImages = {
  /** Dark bay foal standing in profile in a bright summer field. */
  field: fieldFoal as Picture,
}
