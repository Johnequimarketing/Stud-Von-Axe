# Stage 4: Breeding mares archive and single

Build the Breeding mares archive with its filter bar and its card, and the single page behind it. 12 records are already in the site from stage 2.

**Planned:** Wed 16 Sep to Thu 17 Sep 2026

## Steps

1. Theme Builder → Loop Item → import `loop-breeding-mares.json`.
2. Theme Builder → Archive → import `archive-breeding-mares.json` → Display Conditions: Post Type Archive → Breeding mares.
3. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
4. Theme Builder → Single → import `single-breeding-mares.json` → Display Conditions: Singular → Breeding mares.
5. Set up the filter bar: search, the status chips (All · Available · Sold). See the note below — this is the one part Elementor does not do on its own.
6. Open three records and compare them with the live preview: one with everything filled in, one without a photograph, and one that is sold.
7. Walk the archive at 1440, 768 and 390 pixels wide.

## Worth knowing

- **No selects on this archive.** The client took the age and studbook filters off the mares on 3 September. That is a choice, not an omission.
- The mares carry a Hippomundo link under the pedigree instead of a Horsetelex one, and only where the client gave us one. An empty link hides itself.
- **The filter bar is not an Elementor widget.** Search plus status chips with live counts plus facet selects, all three filtering at once, is not something Elementor Pro can do. Mark decides before this stage starts whether we use a filter plugin (JetSmartFilters or Search & Filter Pro) or port the existing script as Custom Code. Whatever is chosen here is repeated on the other four archives, so do not solve it twice differently.
- The pedigree is a grid of fifteen cells, built with containers and dynamic fields, not a table. An empty cell shows 'To be filled in' by itself through the field's fallback. Check that on a horse whose third generation is unknown.
- The card grid on a phone is taller than it is wide, on purpose. If a photograph is cut badly, tell Mark which horse — the crop is set per horse and is easy to move.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `archive-breeding-mares.json`
- `loop-breeding-mares.json`
- `single-breeding-mares.json`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app/breeding-mares/ (Breeding mares)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1iIvmWnGZBB0GMoFfwg6uv_ROrcwstAfa

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `arch-mares-tall.jpg` | — | design image |
| `arch-mares.jpg` | — | design image |
| `agousha-vd-berghoeve-z-1.jpg` | Agousha vd Berghoeve Z | featured image |
| `cabri-vd-berghoeve-z-1.jpg` | Cabri vd Berghoeve Z | featured image |
| `cardesse-von-axe-1.jpg` | Cardesse Von Axe | featured image |
| `cardesse-von-axe-2.jpg` | Cardesse Von Axe | gallery |
| `carma-vd-bergheove-z-1.jpg` | Carma vd Bergheove Z | featured image |
| `cartoona-blue-1.jpg` | Cartoona Blue | featured image |
| `cartoona-blue-2.jpg` | Cartoona Blue | gallery |
| `cartoona-blue-3.jpg` | Cartoona Blue | gallery |
| `cartoona-blue-4.jpg` | Cartoona Blue | gallery |
| `cortina-de-jolie-z-1.jpg` | Cortina de Jolie Z | featured image |
| `cortina-de-jolie-z-2.jpg` | Cortina de Jolie Z | gallery |
| `cortina-de-jolie-z-3.jpg` | Cortina de Jolie Z | gallery |
| `cortina-de-jolie-z-4.jpg` | Cortina de Jolie Z | gallery |
| `cortina-de-jolie-z-5.jpg` | Cortina de Jolie Z | gallery |
| `cortina-de-jolie-z-6.jpg` | Cortina de Jolie Z | gallery |
| `hayley-vd-berghoeve-z-1.jpg` | Hayley vd Berghoeve Z | featured image |
| `heaven-vd-berghoeve-z-1.jpg` | Heaven vd Berghoeve Z | featured image |
| `hypnotic-jt-z-1.jpg` | Hypnotic JT Z | featured image |
| `hypnotic-jt-z-2.jpg` | Hypnotic JT Z | gallery |
| `hypnotic-jt-z-3.jpg` | Hypnotic JT Z | gallery |
| `hypnotic-jt-z-4.jpg` | Hypnotic JT Z | gallery |
| `hypnotic-jt-z-5.jpg` | Hypnotic JT Z | gallery |
| `hypnotic-jt-z-6.jpg` | Hypnotic JT Z | gallery |
| `hypnotic-jt-z-7.jpg` | Hypnotic JT Z | gallery |
| `hypnotic-jt-z-8.jpg` | Hypnotic JT Z | gallery |
| `patchina-vant-merelsnest-1.jpg` | Patchina Van’t Merelsnest | featured image |
| `patchina-vant-merelsnest-2.jpg` | Patchina Van’t Merelsnest | gallery |
| `patchina-vant-merelsnest-3.jpg` | Patchina Van’t Merelsnest | gallery |
| `patchina-vant-merelsnest-4.jpg` | Patchina Van’t Merelsnest | gallery |
| `patchina-vant-merelsnest-5.jpg` | Patchina Van’t Merelsnest | gallery |
| `patchina-vant-merelsnest-6.jpg` | Patchina Van’t Merelsnest | gallery |
| `unguessable-von-axe-1.jpg` | Unguessable Von Axe | featured image |
| `unguessable-von-axe-2.jpg` | Unguessable Von Axe | gallery |
| `unguessable-von-axe-3.jpg` | Unguessable Von Axe | gallery |
| `unguessable-von-axe-4.jpg` | Unguessable Von Axe | gallery |
| `unguessable-von-axe-5.jpg` | Unguessable Von Axe | gallery |
| `unguessable-von-axe-6.jpg` | Unguessable Von Axe | gallery |
| `unguessable-von-axe-7.jpg` | Unguessable Von Axe | gallery |
| `waikiki-vd-berghoeve-1.jpg` | Waikiki vd Berghoeve | featured image |
| `waikiki-vd-berghoeve-2.jpg` | Waikiki vd Berghoeve | gallery |

42 files.

