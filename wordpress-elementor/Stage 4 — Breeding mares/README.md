# Stage 4: Breeding mares archive and single

Build the Breeding mares archive with its filter bar and its card, and the single page behind it. 12 records are already in the site from stage 2.

**Planned:** Wed 16 Sep to Thu 17 Sep 2026

## Steps

1. Theme Builder → Loop Item → import `loop-breeding-mares.json`.
2. Theme Builder → Archive → import `archive-breeding-mares.json` → Display Conditions: Post Type Archive → Breeding mares.
3. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
4. Theme Builder → Single → import `single-breeding-mares.json` → Display Conditions: Singular → Breeding mares.
5. Set up the filter bar: search, the status chips (All · Available · Sold). All three are Elementor Pro's own widgets and they are already in the template; check that the Loop Grid and every filter carry the same query id.
6. Open three records and compare them with the live preview: one with everything filled in, one without a photograph, and one that is sold.
7. Walk the archive at 1440, 768 and 390 pixels wide. The hero on a phone uses an upright crop of its own where there is one, so look at that too.

## Worth knowing

- **No selects on this archive.** The client took the age and studbook filters off the mares on 3 September. That is a choice, not an omission.
- The mares carry a Hippomundo link under the pedigree instead of a Horsetelex one, and only where the client gave us one. An empty link hides itself.
- **The filter bar is native, and it hangs on one thread: the query id.** The search box, the status chips and the selects are Elementor Pro's own Search and Taxonomy Filter widgets, and they find the Loop Grid only through the query id they share. It is already set in the template on all four. If you rebuild the grid by hand, set it again — a filter carrying the wrong query id sits there looking perfectly normal and does nothing at all.
- The chips are a Taxonomy Filter set to `checkbox_list`, which draws them as pills. That value is written into the template but it is the one setting here I could not test against a running Elementor. If they come out as a dropdown instead, it is one click in the widget: Filter → Selected type. Tell Mark either way, because then I know for the other four archives.
- The one thing Elementor cannot do is the **count behind each chip**, the 24 in 'Sold 24'. The chips filter correctly; only the number is missing. That is decoration and not function, and it is not worth a plugin for. Tell Mark if the client asks after it.
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

