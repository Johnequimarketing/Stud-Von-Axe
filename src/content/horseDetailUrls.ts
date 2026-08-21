/* Each horse's own page on the client's live site. Content, not
   presentation, so it lives in the content layer where every direction can
   reach it without dragging a section's image imports into the bundle.
   TODO client-confirm: these become internal detail routes once those
   pages exist; for now the link opens the client's current listing. */

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
