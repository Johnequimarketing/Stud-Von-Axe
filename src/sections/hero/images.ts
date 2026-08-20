/* Hero photography, sourced from the client's own site and served as a
   responsive avif/webp/jpeg set by vite-imagetools.

   TODO client-confirm: this is the highest-resolution version published on
   studvonaxe.it. An original camera file would be better for full-bleed
   use, and we should confirm which horse it shows before any caption
   names one. */

import heroGrey from '@/assets/img/hero-grey.jpg?w=760;1140;1520;2048;2560&format=avif;webp;jpeg&as=picture'

export interface Picture {
  sources: Record<string, string>
  img: { src: string; w: number; h: number }
}

export const heroImages = {
  /** Dapple grey, head left of centre against blurred green. */
  grey: heroGrey as Picture,
}
