# Stage 6: Embryos archive and single

Build the Embryos archive with its filter bar and its card, and the single page behind it. 30 records are already in the site from stage 2.

**Planned:** Sun 20 Sep to Mon 21 Sep 2026

## Steps

1. Theme Builder → Loop Item → import `loop-embryos.json`.
2. Theme Builder → Archive → import `archive-embryos.json` → Display Conditions: Post Type Archive → Embryos.
3. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
4. Theme Builder → Single → import `single-embryos.json` → Display Conditions: Singular → Embryos.
5. Set up the filter bar: search, the status chips (All · Carrying · Frozen) and the selects (Sire). See the note below — this is the one part Elementor does not do on its own.
6. Open three records and compare them with the live preview: one with everything filled in, one without a photograph, and one that is sold.
7. Walk the archive at 1440, 768 and 390 pixels wide.

## Worth knowing

- **The order matters and the client asked for it in writing: implanted embryos first, then the frozen ones, never mixed.** The archive query sorts on the Stage taxonomy for exactly this reason. Do not change it to alphabetical.
- The stage badge carries an emoji: ❄ for frozen, ⏳ for carrying.
- 18 of the 30 frozen embryos have no photograph of their own and show the sire's picture instead. That is intended, not a gap.
- **The filter bar is not an Elementor widget.** Search plus status chips with live counts plus facet selects, all three filtering at once, is not something Elementor Pro can do. Mark decides before this stage starts whether we use a filter plugin (JetSmartFilters or Search & Filter Pro) or port the existing script as Custom Code. Whatever is chosen here is repeated on the other four archives, so do not solve it twice differently.
- The pedigree is a grid of fifteen cells, built with containers and dynamic fields, not a table. An empty cell shows 'To be filled in' by itself through the field's fallback. Check that on a horse whose third generation is unknown.
- The card grid on a phone is taller than it is wide, on purpose. If a photograph is cut badly, tell Mark which horse — the crop is set per horse and is easy to move.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `archive-embryos.json`
- `loop-embryos.json`
- `single-embryos.json`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app/embryos/ (Embryos)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1sBXY-uj2pae11LLp3HmoRjs5M3rnALpM

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `arch-embryos.jpg` | — | design image |
| `aganix-du-seigneur-z-x-cortina-de-jolie-z-1.jpg` | Aganix du Seigneur Z x Cortina de Jolie Z | featured image |
| `big-star-1.jpg` | Big Star x Cortina de Jolie Z | featured image |
| `catoki-1.jpg` | Catoki x Hypnotic JT Z | featured image |
| `catoki-x-cortina-de-jolie-z-1.jpg` | Catoki x Cortina de Jolie Z | featured image |
| `chacco-blue-1.jpg` | Chacco Blue x Cabri vd Berghoeve Z | featured image |
| `comme-il-faut-1.jpg` | Comme il Faut x Patchina van’t Merelsnest | featured image |
| `cornet-obolensky-1.jpg` | Cornet Obolensky x Agousha vd Berghoeve Z | featured image |
| `cornet-obolensky-x-agousha-vd-berghoeve-z-1.jpg` | Cornet Obolensky x Agousha vd Berghoeve Z | featured image |
| `diamant-de-semilly-1.jpg` | Diamant de Semilly x Hypnotic JT Z | featured image |
| `dominator-2000-z-x-hypnotic-jt-z-1.jpg` | Dominator 2000 Z x Hypnotic JT Z | featured image |
| `dominator-2000-z-x-hypnotic-jt-z-2.jpg` | Dominator 2000 Z x Hypnotic JT Z | gallery |
| `dourkhan-hero-z-x-cortina-de-jolie-z-1.jpg` | Dourkhan Hero Z x Cortina de Jolie Z | featured image |
| `dourkhan-hero-z-x-cortina-de-jolie-z-2.jpg` | Dourkhan Hero Z x Cortina de Jolie Z | gallery |
| `emerald-van-t-ruytershof-1.jpg` | Emerald van't Ruytershof x Cortina de Jolie Z | featured image |
| `for-pleasure-1.jpg` | For Pleasure x Hypnotic JT Z | featured image |
| `for-pleasure-x-hypnotic-jt-z-1.jpg` | For Pleasure x Hypnotic JT Z | featured image |
| `mosito-van-het-hellenof-x-carma-vd-berghoeve-z-1.jpg` | Mosito van het Hellenof x Carma vd Berghoeve Z | featured image |
| `united-touch-s-1.jpg` | United Touch S x Cortina de Jolie Z | featured image |
| `united-touch-s-x-cabri-vd-berghoeve-z-1.jpg` | United Touch S x Cabri vd Berghoeve Z | featured image |
| `uricas-van-kattevennen-1.jpg` | Uricas vd Kattevennen x Cortina de Jolie Z | featured image |
| `zandor-z-x-cabri-vd-berghoeve-z-1.jpg` | Zandor Z x Cabri vd Berghoeve Z | featured image |
| `zandor-z-x-cabri-vd-berghoeve-z-2.jpg` | Zandor Z x Cabri vd Berghoeve Z | gallery |

23 files.

