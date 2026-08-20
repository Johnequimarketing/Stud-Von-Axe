/* Catalogue photography, keyed by the horse id in `src/content/horses.ts`.
 *
 * Every photo comes from that horse's OWN listing page on studvonaxe.it,
 * and its source filename was checked so it does not name a different
 * horse. That verification is the whole point: the client's live site
 * pairs at least two horses with photos of other horses, so a
 * plausible-looking image is not evidence it is the right animal.
 *
 * Provenance, page slug to file (all under /en/cavalli/):
 *   arkhana        aganix-du-seigneur-z-x-cortina-de-jolie-z-3
 *                  e2c30f92-7f9a-47d7-b9a4-fb5919abf104.jpg
 *   cortina        cortina-de-jolie-z-2            NB2_4839.jpg
 *   cabri          cabri-vd-berghoeve-z-2          NB2_6934-scaled.jpg
 *   agousha        agousha-vd-berghoeve-z-2        AGOUSHA-...jpeg (names her)
 *   charina        chacco-blue-x-cortina-de-jolie-z-2        IMG_2051.jpg
 *   unique-touch   united-touch-x-cortina-de-jolie-z
 *                  unique-touch-von-axe-...jpeg (names her)
 *   dune           diamant-de-semilly-x-hypnotic-jt-z-2   NB2_6805-2-...jpg
 *   coolrock       chacco-blue-x-halifax-...-carthago-4   NB2_6313-2-...jpg
 *   dourkhet       dourkhan-hero-z-x-cortina-de-jolie-z-6 NB2_5273.jpg
 *
 * Deliberately absent, and why:
 *   carma-vd-berghoeve-z  Her page's only photo is `Jaguar-VD-B-3.jpeg`,
 *                         which names a different horse.
 *   electra-von-axe-z     Her page's only image is
 *                         `Copia-di-Copia-di-united-touch-s-x-Cortina-de-jolie-Z.png`,
 *                         naming a different pairing entirely (she is
 *                         Emerald x Agousha).
 * Both fall back to the typographic card. TODO client-confirm: request
 * photographs of Carma and Electra themselves.
 */

import arkhana from '@/assets/img/horse-arkhana.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'
import cortina from '@/assets/img/horse-cortina.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'
import cabri from '@/assets/img/horse-cabri.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'
import agousha from '@/assets/img/horse-agousha.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'
import charina from '@/assets/img/horse-charina.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'
import uniqueTouch from '@/assets/img/horse-unique-touch.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'
import dune from '@/assets/img/horse-dune.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'
import coolrock from '@/assets/img/horse-coolrock.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'
import dourkhet from '@/assets/img/horse-dourkhet.jpg?w=380;560;760&format=avif;webp;jpeg&as=picture'

import type { Picture } from '@/sections/hero/images'

/** Any id missing here renders the typographic card instead. */
export const horsePictures: Record<string, Picture> = {
  'arkhana-von-axe-z': arkhana as Picture,
  'cortina-de-jolie-z': cortina as Picture,
  'cabri-vd-berghoeve-z': cabri as Picture,
  'agousha-vd-berghoeve-z': agousha as Picture,
  'charina-von-axe-z': charina as Picture,
  'unique-touch-von-axe-z': uniqueTouch as Picture,
  'dune-von-axe-z': dune as Picture,
  'coolrock-von-axe-z': coolrock as Picture,
  'dourkhet-von-axe-z': dourkhet as Picture,
}

/* Each horse's own page on the client's live site.
   TODO client-confirm: these become internal detail routes once those
   pages exist; for now the card opens the client's current listing. */
const BASE = 'https://www.studvonaxe.it/en/cavalli'

export const horseDetailUrls: Record<string, string> = {
  'arkhana-von-axe-z': `${BASE}/aganix-du-seigneur-z-x-cortina-de-jolie-z-3/`,
  'cortina-de-jolie-z': `${BASE}/cortina-de-jolie-z-2/`,
  'cabri-vd-berghoeve-z': `${BASE}/cabri-vd-berghoeve-z-2/`,
  'agousha-vd-berghoeve-z': `${BASE}/agousha-vd-berghoeve-z-2/`,
  'carma-vd-berghoeve-z': `${BASE}/carma-vd-bergheove-z-2/`,
  'charina-von-axe-z': `${BASE}/chacco-blue-x-cortina-de-jolie-z-2/`,
  'unique-touch-von-axe-z': `${BASE}/united-touch-x-cortina-de-jolie-z/`,
  'electra-von-axe-z': `${BASE}/emerald-vant-ruytershof-x-agousha-vd-berghoeve-z/`,
  'dune-von-axe-z': `${BASE}/diamant-de-semilly-x-hypnotic-jt-z-2/`,
  'coolrock-von-axe-z': `${BASE}/chacco-blue-x-halifax-van-het-kluizebos-x-carthago-4/`,
  'dourkhet-von-axe-z': `${BASE}/dourkhan-hero-z-x-cortina-de-jolie-z-6/`,
}
