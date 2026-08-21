/* Direction C photography, all from the provenance-cleared pool (see the
   README's photo provenance rule). Each image is spent exactly once on the
   page: the budget is finite and a repeated photograph reads as a template.

   Elementor note: these responsive avif/webp/jpeg sets are what WordPress
   generates natively from the media library; the build map records the
   target widths per slot. */

import heroGrey from '@/assets/img/hero-grey.jpg?w=760;1140;1520;2048;2560&format=avif;webp;jpeg&as=picture'
/* The inline statement detail was the plaited-neck file first, but the
   semen block already leads with a plaited neck: two of the same gesture
   on one page reads as a template. The Contouch conformation shot is the
   detail instead. */
import statementDetail from '@/assets/img/results-contouch.jpg?w=420;640;900&format=avif;webp;jpeg&as=picture'
import estateFoal from '@/assets/img/intro-foal-star.jpg?w=760;1140;1520;2048&format=avif;webp;jpeg&as=picture'
import terraField from '@/assets/img/offer-foal.jpg?w=960;1440;1920;2560&format=avif;webp;jpeg&as=picture'
import programmeFoals from '@/assets/img/offer-embryo.jpg?w=640;960;1280&format=avif;webp;jpeg&as=picture'
import programmeSemen from '@/assets/img/offer-semen.jpg?w=640;960;1280&format=avif;webp;jpeg&as=picture'

/* The showcase portraits, larger than the old card sizes because the
   selected horse fills half the viewport. Only horses with a verified
   photograph appear in the showcase at all. */
import arkhana from '@/assets/img/horse-arkhana.jpg?w=700;1000;1280&format=avif;webp;jpeg&as=picture'
import cortina from '@/assets/img/horse-cortina.jpg?w=760;1140;1600&format=avif;webp;jpeg&as=picture'
import cabri from '@/assets/img/horse-cabri.jpg?w=760;1140;1600&format=avif;webp;jpeg&as=picture'
import dune from '@/assets/img/horse-dune.jpg?w=760;1140;1600&format=avif;webp;jpeg&as=picture'
import coolrock from '@/assets/img/horse-coolrock.jpg?w=760;1140;1600&format=avif;webp;jpeg&as=picture'
import dourkhet from '@/assets/img/horse-dourkhet.jpg?w=760;1140;1600&format=avif;webp;jpeg&as=picture'

/* The gallery. Photographs of named horses appear here uncaptioned, which
   the provenance rule allows: it forbids attaching a photo to the WRONG
   name, not showing a cleared photo without one. */
import galleryYard from '@/assets/img/bases-yard.jpg?w=480;720;960&format=avif;webp;jpeg&as=picture'
import galleryUnguessable from '@/assets/img/results-unguessable.jpg?w=640;960;1280&format=avif;webp;jpeg&as=picture'
import galleryUniqueTouch from '@/assets/img/horse-unique-touch.jpg?w=480;720;1000&format=avif;webp;jpeg&as=picture'
import galleryCharina from '@/assets/img/horse-charina.jpg?w=420;640;830&format=avif;webp;jpeg&as=picture'

import type { Picture } from '@/sections/hero/images'

export const tenutaImages = {
  hero: heroGrey as Picture,
  statementDetail: statementDetail as Picture,
  estate: estateFoal as Picture,
  terra: terraField as Picture,
  programmeFoals: programmeFoals as Picture,
  programmeSemen: programmeSemen as Picture,
  gallery: {
    yard: galleryYard as Picture,
    unguessable: galleryUnguessable as Picture,
    uniqueTouch: galleryUniqueTouch as Picture,
    charina: galleryCharina as Picture,
  },
}

/** Showcase portraits by horse id: the cast list of the Horses section. */
export const showcasePictures: Record<string, Picture> = {
  'arkhana-von-axe-z': arkhana as Picture,
  'cortina-de-jolie-z': cortina as Picture,
  'cabri-vd-berghoeve-z': cabri as Picture,
  'dune-von-axe-z': dune as Picture,
  'coolrock-von-axe-z': coolrock as Picture,
  'dourkhet-von-axe-z': dourkhet as Picture,
}
