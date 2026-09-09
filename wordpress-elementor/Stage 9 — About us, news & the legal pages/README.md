# Stage 9: About us, the news pages, privacy and terms

Build the remaining pages: the story of the stud, the news archive and its single, and the two legal pages.

**Planned:** Sat 26 Sep to Sun 27 Sep 2026

## Steps

1. Pages → Add New → **About us** → import `about.json`.
2. Theme Builder → Loop Item → import `loop-news.json`.
3. Theme Builder → Archive → import `archive-news.json` → Display Conditions: Post Type Archive → News.
4. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
5. Theme Builder → Single → import `single-news.json` → Display Conditions: Singular → News.
6. Pages → Add New → **Privacy policy** → import `privacy.json`.
7. Pages → Add New → **Terms and conditions** → import `terms.json`.
8. Elementor → Custom Code → add `custom-code-toc.txt`, the scroll marker on the legal pages' table of contents.

## Worth knowing

- **The partners strip is on this page, on the contact page and on the homepage.** It is the same Loop Grid over the Partner post type all three times — build it once in stage 2 and reuse it, do not draw it again. The client asked for it on all three.
- The About page has three photographs that fade into each other every five seconds. That is Elementor's own Slides widget, no code. It stops when you hover or tab into it and it never starts at all for a visitor who has asked for less motion.
- The four news reports **have no dates**. Their own dates did not match what actually happened, so rather than publish a wrong date there is none. Two of the four are marked as examples in the `is_placeholder` field; the template shows a quiet marker on those.
- There is a second body field `body_it` for the Italian version later. It is empty and the template ignores it while it is empty.
- The privacy page says in so many words that the site sets no cookies and runs no analytics. **That stops being true in stage 11.** When the analytics and the cookie banner go on, this page has to be rewritten. It is on the list for stage 11 as well.
- The legal pages have a sticky table of contents that marks where you are. Sticky is Elementor's own; the marking is the twenty lines in `custom-code-toc.txt`.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `about.json`
- `archive-news.json`
- `loop-news.json`
- `single-news.json`
- `privacy.json`
- `terms.json`
- `custom-code-toc.txt`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app/about/ (About us)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1YFL2whWSFuqOilFALS2vnk0P9tNy6RgR

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `about-hero.jpg` | — | design image |
| `bases-yard.jpg` | — | design image |
| `hero-grey-wide.jpg` | — | design image |
| `hero-grey.jpg` | — | design image |
| `intro-foal-star.jpg` | — | design image |
| `news-calleryama.jpg` | Calleryama wins the Nations Cup of Barcelona | featured image |
| `news-hero.jpg` | — | design image |
| `news-lanaken.jpg` | Results from Lanaken | featured image |
| `offer-embryo.jpg` | — | design image |
| `offer-foal.jpg` | — | design image |
| `offer-semen.jpg` | — | design image |
| `results-contouch.jpg` | Contouch SVA takes the top price | featured image |
| `semen-detail.jpg` | ICSI semen available for breeders | featured image |

13 files.

