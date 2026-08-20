/* Photography for the offer section, from the client's own site. Each
   business line gets one image that sets its tone; these are routes, not
   catalogue entries, so the photos are atmosphere rather than listings.

   TODO client-confirm: which horses these show. */

import foal from '@/assets/img/offer-foal.jpg?w=560;840;1120;1600&format=avif;webp;jpeg&as=picture'
import embryo from '@/assets/img/offer-embryo.jpg?w=560;840;1120;1600&format=avif;webp;jpeg&as=picture'
import semen from '@/assets/img/offer-semen.jpg?w=560;840;1120;1600&format=avif;webp;jpeg&as=picture'

import type { Picture } from '@/sections/hero/images'

export const offerImages: Record<string, Picture> = {
  /** A foal loose in the grass at the Belgian base. */
  foals: foal as Picture,
  /** A foal at its dam's side: the damline made visible. */
  embryos: embryo as Picture,
  /** A plaited mare presented in hand. */
  semen: semen as Picture,
}
