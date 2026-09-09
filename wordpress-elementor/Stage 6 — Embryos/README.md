# Stage 6: Embryos archive and single

Build the Embryos archive with its filter bar and its card, and the single page behind it. 30 records are already in the site from stage 2.

**Planned:** Sun 20 Sep to Mon 21 Sep 2026

## Steps

1. Theme Builder → Loop Item → import `loop-embryos.json`.
2. Theme Builder → Archive → import `archive-embryos.json` → Display Conditions: Post Type Archive → Embryos.
3. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
4. Theme Builder → Single → import `single-embryos.json` → Display Conditions: Singular → Embryos.
5. Set up the filter bar: search, the status chips (All · Carrying · Frozen) and the selects (Sire). All three are Elementor Pro's own widgets and they are already in the template; check that the Loop Grid and every filter carry the same query id.
6. Open three records and compare them with the live preview: one with everything filled in, one without a photograph, and one without a film or a gallery.
7. Walk the archive at 1440, 768 and 390 pixels wide.

## Worth knowing

- **The order matters and the client asked for it in writing: implanted embryos first, then the frozen ones, never mixed.** The importer numbers them that way and the grid reads Menu Order, so it comes out right by itself. Check it anyway on the first screen; it is the one thing on this page the client will look at.
- **Every cross carries the gold tagline plate under the breeding line.** The client asked for that explicitly: all of them, not some of them. A cross without a sentence of its own borrows its dam's, so none should be empty. If one is, that is the field and not the template.
- One card is cropped by hand: United Touch S x Cabri vd Berghoeve Z, aligned left so the horse's head is in frame, on both the carrying and the frozen version. Mark asked for that separately. It is the four lines in `custom-code-card-crop.txt`, keyed on the web address so it does not matter which post id the import happens to give.
- The stage badge carries an emoji: ❄ for frozen, ⏳ for carrying. The client asked for that by name — a snowflake on the frozen ones. It is written by the importer into one field, because Elementor cannot join a symbol, a word and a date that is sometimes empty.
- 18 of the 30 frozen embryos have no photograph of their own and show the sire's picture instead. That is intended, not a gap.
- **The filter bar is native, and it hangs on one thread: the query id.** The search box, the status chips and the selects are Elementor Pro's own Search and Taxonomy Filter widgets, and they find the Loop Grid only through the query id they share. It is already set in the template on all four. If you rebuild the grid by hand, set it again — a filter carrying the wrong query id sits there looking perfectly normal and does nothing at all.
- The chips are a Taxonomy Filter set to `checkbox_list`, which draws them as pills. That value is written into the template but it is the one setting here I could not test against a running Elementor. If they come out as a dropdown instead, it is one click in the widget: Filter → Selected type. Tell Mark either way, because then I know for the other four archives.
- The one thing Elementor cannot do is the **count behind each chip**, the 24 in 'Sold 24'. The chips filter correctly; only the number is missing. That is decoration and not function, and it is not worth a plugin for. Tell Mark if the client asks after it.
- **The order is the client's own and it is not alphabetical.** The importer gives every record the place it has on the static archive, and the Loop Grid is set to Menu Order to read it. Do not switch it to Title: an alphabetical list looks perfectly normal, so nobody would notice it had been resorted.
- The pedigree is a grid of fifteen cells, built with containers and dynamic fields, not a table. An empty cell shows 'To be filled in' by itself through the field's fallback. Check that on a horse whose third generation is unknown.
- The card grid on a phone is taller than it is wide, on purpose. The client asked for that. If a photograph is cut badly, tell Mark which one — the crop is set per record and is easy to move.
- Where a record has only one photograph the hero crops high on that same file, so the band shows the head and the panel below shows the whole horse. Mark reported the head being cut off three times, so if you see it again, say so straight away.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `archive-embryos.json`
- `loop-embryos.json`
- `single-embryos.json`
- `custom-code-card-crop.txt`
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

