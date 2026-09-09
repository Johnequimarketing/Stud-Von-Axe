# Stage 2: Homepage, the importer plugin and the partners rail

Run the importer so all 113 records and 209 photos are on the site, then build the homepage on top of them.

**Planned:** Sat 12 Sep to Sun 13 Sep 2026

## Steps

1. Plugins → Add New → Upload → `stud-von-axe-importer.zip`. Activate it. It refuses to run without ACF Pro, so make sure stage 1 is really finished.
2. Tools → **Stud Von Axe importer**. Press **Dry run** first: it writes nothing and tells you exactly what it would do. Read it, then press **Import**. Leave the tab open — it runs in steps of twenty.
3. Check the result: 12 sport horses, 12 breeding mares, 20 foals, 30 embryos, 32 ICSI stallions, 4 news reports, 3 partners, and seven taxonomies filled in.
4. Run it a **second time** and check that it adds nothing. That proves the stamps work and that a later re-import will not duplicate anything.
5. Theme Builder → Loop Item → import `loop-partner.json` and `loop-news-card.json`.
6. Pages → Add New → **Home** → Edit with Elementor → import `home.json`.
7. Settings → Reading → Homepage displays a static page → Home.
8. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault. The homepage has two: the news rail and the partners rail.
9. Elementor → Custom Code → add `custom-code-rails.txt`, the arrows on the news rail and the partners rail.
10. Walk the page at 1440, 768 and 390 pixels wide and compare it with the live preview.

## Worth knowing

- If the plugin upload fails because the file is too large, use the pair instead: install `stud-von-axe-importer-zonder-fotos.zip` first, then unpack `stud-von-axe-importer-fotos.zip` into `wp-content/uploads/` so that a folder `stud-von-axe-media` appears. The importer looks there too.
- The importer never deletes anything. Running it twice updates what is there and adds what is missing. It does overwrite a field you edited by hand if that field is in the import.
- When the import is finished the plugin **may be deleted**. Everything it made stays: the post types and fields are ACF's own records, the content is ordinary posts, the photos ordinary attachments. Please try this on staging and tell Mark what you see, because the whole build rests on it.
- The 'Every horse we have' block is five real tab panels, each with its own photograph, sentence and button. Elementor's Tabs widget switches them by itself; there is no code behind it. The five sentences are typed into the template because they are the client's own copy and do not live in a field.
- The partners have a logo but **no website link and no description yet**. Those fields travel empty. Mark is asking the client for them; the loop item already has the places.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.
- **Elementor → Settings → Features → Flexbox Container → Active.** Without this every imported template renders as a white page and looks broken when it is not.

## Files in this folder

- `home.json`
- `loop-partner.json`
- `loop-news-card.json`
- `custom-code-rails.txt`
- `stud-von-axe-importer.zip`
- `stud-von-axe-importer-zonder-fotos.zip`
- `stud-von-axe-importer-fotos.zip`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app (Homepage)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1fMfjvfsEwwAg1xd0Xg78Ib-S_Q26KCK2

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `about-owners.jpg` | — | design image |
| `hero-jump.jpg` | — | design image |
| `centro-medico-ippocrate.jpg` | Centro Medico Ippocrate | featured image |
| `de-brabander.jpg` | De Brabander | featured image |
| `semap.jpg` | SEMAP Marble & Surface | featured image |
| `results-unguessable.jpg` | — | design image |
| `tab-broodmare.jpg` | — | design image |
| `tab-embryo.jpg` | — | design image |
| `tab-foal.jpg` | — | design image |
| `tab-sport.jpg` | — | design image |
| `tab-stallion.jpg` | — | design image |

11 files.

