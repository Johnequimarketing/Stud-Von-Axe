# Stage 3: Sport horses archive and single

Build the Sport horses archive with its filter bar and its card, and the single page behind it. 12 records are already in the site from stage 2.

**Planned:** Mon 14 Sep to Tue 15 Sep 2026

## Steps

1. Theme Builder → Loop Item → import `loop-sport-horses.json`.
2. Theme Builder → Archive → import `archive-sport-horses.json` → Display Conditions: Post Type Archive → Sport horses.
3. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
4. Theme Builder → Single → import `single-sport-horses.json` → Display Conditions: Singular → Sport horses.
5. Set up the filter bar: search, the status chips (All · Available · Sold) and the selects (Sex, Studbook, Year of birth). All three are Elementor Pro's own widgets and they are already in the template; check that the Loop Grid and every filter carry the same query id.
6. Open three records and compare them with the live preview: one with everything filled in, one without a photograph, and one that is sold.
7. Walk the archive at 1440, 768 and 390 pixels wide. The hero on a phone uses an upright crop of its own where there is one, so look at that too.
8. Elementor → Custom Code → add `custom-code-hide-empty.txt`. Not every horse has a film or spare photographs, and a section headed 'See the horse move' with an empty box under it reads as a fault. These eight lines take such a section away. Added once, works on all five single templates.

## Worth knowing

- The single page carries the pedigree, the films, the photo gallery and the enquiry form. Breeding mares and foals use the same shape, so what you settle here is settled three times over.
- **The filter bar is native, and it hangs on one thread: the query id.** The search box, the status chips and the selects are Elementor Pro's own Search and Taxonomy Filter widgets, and they find the Loop Grid only through the query id they share. It is already set in the template on all four. If you rebuild the grid by hand, set it again — a filter carrying the wrong query id sits there looking perfectly normal and does nothing at all.
- The chips are a Taxonomy Filter set to `checkbox_list`, which draws them as pills. That value is written into the template but it is the one setting here I could not test against a running Elementor. If they come out as a dropdown instead, it is one click in the widget: Filter → Selected type. Tell Mark either way, because then I know for the other four archives.
- The one thing Elementor cannot do is the **count behind each chip**, the 24 in 'Sold 24'. The chips filter correctly; only the number is missing. That is decoration and not function, and it is not worth a plugin for. Tell Mark if the client asks after it.
- The pedigree is a grid of fifteen cells, built with containers and dynamic fields, not a table. An empty cell shows 'To be filled in' by itself through the field's fallback. Check that on a horse whose third generation is unknown.
- The card grid on a phone is taller than it is wide, on purpose. If a photograph is cut badly, tell Mark which horse — the crop is set per horse and is easy to move.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `archive-sport-horses.json`
- `loop-sport-horses.json`
- `single-sport-horses.json`
- `custom-code-hide-empty.txt`
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

