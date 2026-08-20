/* Photography for the bases section, from the client's own uploads.
 *
 *   20230529-_PF38772.jpg  799x1200   A foal standing in an arena, hedge
 *     and post-and-rail behind. ATMOSPHERE: nothing identifies which base
 *     this is, so no caption may pin it to Italy or Belgium, which is also
 *     why the two base cards in this section carry no photographs at all.
 *     TODO client-confirm: which yard this shows.
 *
 * Candidates prepared for the concepts that lost, noted here so a team or
 * about page can pick them up without re-verifying:
 *   C8U6621_3-scaled.jpg    a bridled head under trees, atmosphere terms.
 *   Adri-per-chi-siamo.jpg  Adriano in the ring; the client's own filename
 *     ("Adri, per chi siamo" = "Adri, for the about page") makes it their
 *     chosen about photo. First names are public; full names are a TODO.
 */

import yard from '@/assets/img/bases-yard.jpg?w=480;720;1080&format=avif;webp;jpeg&as=picture'

import type { Picture } from '@/sections/hero/images'

export const basePictures = {
  yard: yard as Picture,
}
