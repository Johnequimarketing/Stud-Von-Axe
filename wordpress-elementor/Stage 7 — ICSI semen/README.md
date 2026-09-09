# Stage 7: ICSI semen archive and single

Build the ICSI semen archive with its filter bar and its card, and the single page behind it. 32 records are already in the site from stage 2.

**Planned:** Tue 22 Sep to Wed 23 Sep 2026

## Steps

1. Theme Builder → Loop Item → import `loop-icsi-semen.json`.
2. Theme Builder → Archive → import `archive-icsi-semen.json` → Display Conditions: Post Type Archive → ICSI semen.
3. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
4. Theme Builder → Single → import `single-icsi-semen.json` → Display Conditions: Singular → ICSI semen.
5. Set up the filter bar: search and the two selects, with no status chips and the selects (Studbook, Year of birth). See the note below — this is the one part Elementor does not do on its own.
6. Open three records and compare them with the live preview: one with everything filled in, one without a photograph, and one that is sold.
7. Walk the archive at 1440, 768 and 390 pixels wide.

## Worth knowing

- This archive has **no status chips**. Semen is not sold or available in the way a horse is; it is on request. The filter bar is search plus the two selects.
- Each stallion links to the embryos he is the sire of, through the Crosses relationship field. That grid is a Loop Grid with a related query, so it needs the embryo loop item from stage 6 linked to it.
- **The filter bar is not an Elementor widget.** Search plus status chips with live counts plus facet selects, all three filtering at once, is not something Elementor Pro can do. Mark decides before this stage starts whether we use a filter plugin (JetSmartFilters or Search & Filter Pro) or port the existing script as Custom Code. Whatever is chosen here is repeated on the other four archives, so do not solve it twice differently.
- The pedigree is a grid of fifteen cells, built with containers and dynamic fields, not a table. An empty cell shows 'To be filled in' by itself through the field's fallback. Check that on a horse whose third generation is unknown.
- The card grid on a phone is taller than it is wide, on purpose. If a photograph is cut badly, tell Mark which horse — the crop is set per horse and is easy to move.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `archive-icsi-semen.json`
- `loop-icsi-semen.json`
- `single-icsi-semen.json`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app/icsi-semen/ (ICSI semen)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1nH9TscniONIYNNO6F_YXsO7hgLFw0OSJ

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `arch-semen.jpg` | — | design image |
| `baloubet-du-rouet-1.jpg` | Baloubet du Rouet | featured image |
| `bamako-de-muze-1.jpg` | Bamako de Muze | featured image |
| `casall-1.jpg` | Casall | featured image |
| `clinton-1.jpg` | Clinton | featured image |
| `conthargos-1.jpg` | Conthargos | featured image |
| `cumano-1.jpg` | Cumano | featured image |
| `darco-1.jpg` | Darco | featured image |
| `echo-van-t-spieveld-1.jpg` | Echo van't Spieveld | featured image |
| `el-torreo-de-muze-1.jpg` | El Torreo de Muze | featured image |
| `elvis-ter-putte-1.jpg` | Elvis Ter Putte | featured image |
| `heartbreaker-1.jpg` | Heartbreaker | featured image |
| `kannan-1.jpg` | Kannan | featured image |
| `kasanova-de-la-pomme-1.jpg` | Kasanova de la Pomme | featured image |
| `kashmir-van-t-schuttershof-1.jpg` | Kashmir van't Schuttershof | featured image |
| `mosito-van-het-hellenof-1.jpg` | Mosito van het Hellenof | featured image |
| `mumbai-vd-moerhoeve-1.jpg` | Mumbai vd Moerhoeve | featured image |
| `nabab-de-reve-1.jpg` | Nabab de Reve | featured image |
| `stakkato-gold-1.jpg` | Stakkato Gold | featured image |
| `tinkas-boy-1.jpg` | Tinka's Boy | featured image |
| `toulon-1.jpg` | Toulon | featured image |
| `untouchable-1.jpg` | Untouchable | featured image |
| `vigo-d-arsouilles-1.jpg` | Vigo D'Arsouilles | featured image |

23 files.

