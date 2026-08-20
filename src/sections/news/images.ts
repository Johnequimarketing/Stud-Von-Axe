/* Photography for the news cards, on the catalogue's provenance rule: a
 * photo rides a story only when its own filename names the story's subject.
 *
 *   contouch    Contouch-SVA-stud-von-axe-2.jpg (names him), already
 *               prepared as results-contouch.jpg for the old results round.
 *   cortina     NB2_4839.jpg from her own listing page, already prepared
 *               as horse-cortina.jpg for the catalogue.
 *
 * Deliberately absent:
 *   calleryama  No photograph anywhere in the client's library names her.
 *               Her son Unguessable is photographed, but putting HIS
 *               picture on HER story attaches a photo of a different horse
 *               to a named subject, which is the exact thing the rule
 *               exists to stop. Her card is typographic.
 */

import contouch from '@/assets/img/results-contouch.jpg?w=480;720;1170&format=avif;webp;jpeg&as=picture'
import cortina from '@/assets/img/horse-cortina.jpg?w=480;720;1080&format=avif;webp;jpeg&as=picture'

import type { Picture } from '@/sections/hero/images'

export const newsPictures: Record<string, Picture> = {
  contouch: contouch as Picture,
  cortina: cortina as Picture,
}
