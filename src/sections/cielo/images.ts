/* Direction D's fold photograph, from the client's own site (the same
   audited source as the offer/Terra sections on the other directions).
   Served as a responsive avif/webp/jpeg set by vite-imagetools. */

/* The hero backdrops: one per featured horse, cross faded as the card's
   switcher moves, which is what the refined reference does.
   
   Each horse gets ITS OWN verified photograph, from the provenance record
   in sections/available/images.ts. The reference pairs two of its horses
   with generically named files (NB2_4850, IMG_2051) that nothing ties to
   those horses, and the provenance rule forbids that: a photo may name a
   horse only if it came from that horse's own listing.
   
   The cast is also limited by SOURCE WIDTH. A full bleed hero is 1440 and
   up, so a 1280 source is the floor here and the widths below never
   upscale past their own file. That excludes Agousha (840), Charina (831)
   and Unique Touch (1152): all verified, none large enough to carry the
   fold without going soft. */
import backdropArkhana from '@/assets/img/horse-arkhana.jpg?w=760;1024;1280&format=avif;webp;jpeg&as=picture'
import backdropCortina from '@/assets/img/horse-cortina.jpg?w=760;1280;1920;2048&format=avif;webp;jpeg&as=picture'
import backdropCabri from '@/assets/img/horse-cabri.jpg?w=760;1280;1920;2560&format=avif;webp;jpeg&as=picture'
import backdropDune from '@/assets/img/horse-dune.jpg?w=760;1280;1920;2478&format=avif;webp;jpeg&as=picture'
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
  /** Hero backdrops keyed by horse id, in the fold's story order:
      the available foal, two broodmares, then produce placed abroad. */
  backdrops: {
    'arkhana-von-axe-z': backdropArkhana as Picture,
    'cortina-de-jolie-z': backdropCortina as Picture,
    'cabri-vd-berghoeve-z': backdropCabri as Picture,
    'dune-von-axe-z': backdropDune as Picture,
  } as Record<string, Picture>,
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
