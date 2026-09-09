# Stage 3: Sport horses archive and single

Build the Sport horses archive with its filter bar and its card, and the single page behind it. 12 records are already in the site from stage 2.

**Planned:** Mon 14 Sep to Tue 15 Sep 2026

## Steps

1. Theme Builder → Loop Item → import `loop-sport-horses.json`.
2. Theme Builder → Archive → import `archive-sport-horses.json` → Display Conditions: Post Type Archive → Sport horses.
3. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
4. Theme Builder → Single → import `single-sport-horses.json` → Display Conditions: Singular → Sport horses.
5. Set up the filter bar: search, the status chips (All · Available · Sold) and the selects (Sex, Studbook, Year of birth). See the note below — this is the one part Elementor does not do on its own.
6. Open three records and compare them with the live preview: one with everything filled in, one without a photograph, and one that is sold.
7. Walk the archive at 1440, 768 and 390 pixels wide.

## Worth knowing

- The single page carries the pedigree, the films, the photo gallery and the enquiry form. Breeding mares and foals use the same shape, so what you settle here is settled three times over.
- **The filter bar is not an Elementor widget.** Search plus status chips with live counts plus facet selects, all three filtering at once, is not something Elementor Pro can do. Mark decides before this stage starts whether we use a filter plugin (JetSmartFilters or Search & Filter Pro) or port the existing script as Custom Code. Whatever is chosen here is repeated on the other four archives, so do not solve it twice differently.
- The pedigree is a grid of fifteen cells, built with containers and dynamic fields, not a table. An empty cell shows 'To be filled in' by itself through the field's fallback. Check that on a horse whose third generation is unknown.
- The card grid on a phone is taller than it is wide, on purpose. If a photograph is cut badly, tell Mark which horse — the crop is set per horse and is easy to move.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `archive-sport-horses.json`
- `loop-sport-horses.json`
- `single-sport-horses.json`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app/sport-horses/ (Sport horses)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1kOgCZiyd_GA4j3bq9C2PJ9W5uNP9fB0R

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `arch-sport-tall.jpg` | — | design image |
| `arch-sport.jpg` | — | design image |
| `amnesia-sva-1.jpg` | Amnésia SVA | featured image |
| `amnesia-sva-2.jpg` | Amnésia SVA | gallery |
| `amnesia-sva-3.jpg` | Amnésia SVA | gallery |
| `amnesia-sva-4.jpg` | Amnésia SVA | gallery |
| `bec-emerald-sam-1.jpg` | Bec Emerald Sam | featured image |
| `bec-emerald-sam-2.jpg` | Bec Emerald Sam | gallery |
| `bec-emerald-sam-3.jpg` | Bec Emerald Sam | gallery |
| `bec-emerald-sam-4.jpg` | Bec Emerald Sam | gallery |
| `contouch-sva-1.jpg` | Contouch SVA | featured image |
| `contouch-sva-2.jpg` | Contouch SVA | gallery |
| `contouch-sva-3.jpg` | Contouch SVA | gallery |
| `contouch-sva-4.jpg` | Contouch SVA | gallery |
| `contouch-sva-5.jpg` | Contouch SVA | gallery |
| `diabalou-sva-1.jpg` | Diabalou SVA | featured image |
| `diabalou-sva-2.jpg` | Diabalou SVA | gallery |
| `diabalou-sva-3.jpg` | Diabalou SVA | gallery |
| `diabalou-sva-4.jpg` | Diabalou SVA | gallery |
| `diabalou-sva-5.jpg` | Diabalou SVA | gallery |
| `diacco-blue-sva-1.jpg` | Diacco Blue SVA | featured image |
| `diacco-blue-sva-2.jpg` | Diacco Blue SVA | gallery |
| `diacco-blue-sva-3.jpg` | Diacco Blue SVA | gallery |
| `diamecho-von-axe-z-1.jpg` | Diamecho Von Axe Z | featured image |
| `diamecho-von-axe-z-2.jpg` | Diamecho Von Axe Z | gallery |
| `diamecho-von-axe-z-3.jpg` | Diamecho Von Axe Z | gallery |
| `diamecho-von-axe-z-4.jpg` | Diamecho Von Axe Z | gallery |
| `domino-van-den-haze-z-1.jpg` | Domino Van den Haze Z | featured image |
| `domino-van-den-haze-z-2.jpg` | Domino Van den Haze Z | gallery |
| `domino-van-den-haze-z-3.jpg` | Domino Van den Haze Z | gallery |
| `domino-van-den-haze-z-4.jpg` | Domino Van den Haze Z | gallery |
| `domino-van-den-haze-z-5.jpg` | Domino Van den Haze Z | gallery |
| `filou-1.jpg` | Filou | featured image |
| `gamora-o-1.jpg` | Gamora O | featured image |
| `gamora-o-2.jpg` | Gamora O | gallery |
| `gamora-o-3.jpg` | Gamora O | gallery |
| `gamora-o-4.jpg` | Gamora O | gallery |
| `kashillio-mb-z-1.jpg` | Kashillio MB Z | featured image |
| `kashillio-mb-z-2.jpg` | Kashillio MB Z | gallery |
| `kashillio-mb-z-3.jpg` | Kashillio MB Z | gallery |
| `maralore-1.jpg` | Maralore | featured image |
| `maralore-2.jpg` | Maralore | gallery |
| `maralore-3.jpg` | Maralore | gallery |
| `maralore-4.jpg` | Maralore | gallery |
| `valkyrie-1.jpg` | Valkyrie | featured image |
| `valkyrie-2.jpg` | Valkyrie | gallery |
| `valkyrie-3.jpg` | Valkyrie | gallery |

47 files.

