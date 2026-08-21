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
import deckFoal from '@/assets/img/intro-foal-star.jpg?w=440;640;880&format=avif;webp;jpeg&as=picture'
import deckYard from '@/assets/img/bases-yard.jpg?w=440;640;799&format=avif;webp;jpeg&as=picture'

/* The reach plate's photograph: a horse and rider competing, which is
   what "to the world" actually looks like. Used uncaptioned and never
   attached to a named horse, so the provenance rule is satisfied even
   though the source filename names one. */
import reachSport from '@/assets/img/results-unguessable.jpg?w=560;760;1040&format=avif;webp;jpeg&as=picture'

/* The programme's three panels. Foals and semen keep the photographs the
   other directions use; the embryo panel takes the mare-and-foal frame,
   uncaptioned, because the mares ARE where an embryo comes from. */
import progFoal from '@/assets/img/offer-foal.jpg?w=560;760;1040&format=avif;webp;jpeg&as=picture'
import progEmbryo from '@/assets/img/offer-embryo.jpg?w=560;760;1040&format=avif;webp;jpeg&as=picture'
import progSemen from '@/assets/img/offer-semen.jpg?w=560;760;1040&format=avif;webp;jpeg&as=picture'

/* The gallery pool. Named-horse frames reuse the verified catalogue
   photography (horsePictures) so nothing here re-imports it; these two
   are the frames only the gallery uses. */
import galleryNeck from '@/assets/img/semen-detail.jpg?w=560;900;1280&format=avif;webp;jpeg&as=picture'
import galleryContouch from '@/assets/img/results-contouch.jpg?w=480;760;1170&format=avif;webp;jpeg&as=picture'

export const cieloImages = {
  /** Dark bay foal standing in profile in a bright summer field. */
  field: fieldFoal as Picture,
  /** The wide pasture banner: mare and foal left, jumper right. */
  banner: banner as Picture,
  /** The stud section's instax deck, in stack order. */
  deck: [deckFoal, deckYard] as Picture[],
  /** The reach plate: horse and rider out competing. */
  reach: reachSport as Picture,
  /** Gallery-only frames. */
  galleryNeck: galleryNeck as Picture,
  galleryContouch: galleryContouch as Picture,
  /** The programme panels, keyed by the copy's own line ids. */
  programme: {
    foals: progFoal as Picture,
    embryos: progEmbryo as Picture,
    semen: progSemen as Picture,
  } as Record<string, Picture>,
}
