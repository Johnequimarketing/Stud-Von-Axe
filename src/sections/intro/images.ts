/* Photography for the intro section, from the stud's own Instagram
   (instagram.com/studvonaxe).

   TODO client-confirm: which foal and mare this shows, and that the stud
   is happy for the same photo they posted to be reused on the site. */

import foal from '@/assets/img/intro-foal-star.jpg?w=640;960;1280;1920&format=avif;webp;jpeg&as=picture'

import type { Picture } from '@/sections/hero/images'

export const introImages = {
  /** A bay foal with a white star, alongside its dark mare in the field. */
  foal: foal as Picture,
}
