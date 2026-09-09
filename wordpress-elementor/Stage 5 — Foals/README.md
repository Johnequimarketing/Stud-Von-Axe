# Stage 5: Foals archive and single

Build the Foals archive with its filter bar and its card, and the single page behind it. 20 records are already in the site from stage 2.

**Planned:** Fri 18 Sep to Sat 19 Sep 2026

## Steps

1. Theme Builder → Loop Item → import `loop-foals.json`.
2. Theme Builder → Archive → import `archive-foals.json` → Display Conditions: Post Type Archive → Foals.
3. A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID of a loop item on this site, so open the grid, set Template to the loop item, and save. Once per grid. This is normal, not a fault.
4. Theme Builder → Single → import `single-foals.json` → Display Conditions: Singular → Foals.
5. Set up the filter bar: search, the status chips (All · Available · Sold) and the selects (Sex, Studbook, Year of birth). All three are Elementor Pro's own widgets and they are already in the template; check that the Loop Grid and every filter carry the same query id.
6. Open three records and compare them with the live preview: one with everything filled in, one without a photograph, and one that is sold.
7. Walk the archive at 1440, 768 and 390 pixels wide. The hero on a phone uses an upright crop of its own, so look at that too.

## Worth knowing

- A foal that grows into a sport horse has to be moved by hand later, and its web address changes with it. That is the price of seven separate post types, and it was a deliberate choice.
- Most foals have no film. The film section hides itself when the field is empty; check that on a foal that has none.
- **The filter bar is native, and it hangs on one thread: the query id.** The search box, the status chips and the selects are Elementor Pro's own Search and Taxonomy Filter widgets, and they find the Loop Grid only through the query id they share. It is already set in the template on all four. If you rebuild the grid by hand, set it again — a filter carrying the wrong query id sits there looking perfectly normal and does nothing at all.
- The chips are a Taxonomy Filter set to `checkbox_list`, which draws them as pills. That value is written into the template but it is the one setting here I could not test against a running Elementor. If they come out as a dropdown instead, it is one click in the widget: Filter → Selected type. Tell Mark either way, because then I know for the other four archives.
- The one thing Elementor cannot do is the **count behind each chip**, the 24 in 'Sold 24'. The chips filter correctly; only the number is missing. That is decoration and not function, and it is not worth a plugin for. Tell Mark if the client asks after it.
- **The order is the client's own and it is not alphabetical.** The importer gives every record the place it has on the static archive, and the Loop Grid is set to Menu Order to read it. Do not switch it to Title: an alphabetical list looks perfectly normal, so nobody would notice it had been resorted.
- The pedigree is a grid of fifteen cells, built with containers and dynamic fields, not a table. An empty cell shows 'To be filled in' by itself through the field's fallback. Check that on a horse whose third generation is unknown.
- The card grid on a phone is taller than it is wide, on purpose. The client asked for that. If a photograph is cut badly, tell Mark which one — the crop is set per record and is easy to move.
- **The sold badge carries the flag of the country.** The client asked for it twice and it had gone missing once before. The flag is a field of its own next to the badge text, because a drawn flag per country is not something a field can hold. One that is still available shows no badge at all rather than an empty pill.
- Where a record has only one photograph the hero crops high on that same file, so the band shows the head and the panel below shows the whole horse. Mark reported the head being cut off three times, so if you see it again, say so straight away.
- The `media-reference/` folder is **not** for uploading. Those photos are already in the media library, put there by the importer plugin. They are in the folder so you can check that the right photo landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

## Files in this folder

- `archive-foals.json`
- `loop-foals.json`
- `single-foals.json`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app/foals/ (Foals)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1UybXJgwTYQVwJIruT124bKXorw7Q_Scc

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `arch-foals-tall.jpg` | — | design image |
| `arch-foals.jpg` | — | design image |
| `arkhana-von-axe-z-1.jpg` | Arkhana Von Axe Z | featured image |
| `arkhana-von-axe-z-2.jpg` | Arkhana Von Axe Z | gallery |
| `arkhana-von-axe-z-3.jpg` | Arkhana Von Axe Z | gallery |
| `arkhana-von-axe-z-4.jpg` | Arkhana Von Axe Z | gallery |
| `baltimore-von-axe-z-1.jpg` | Baltimore Von Axe Z | featured image |
| `baltimore-von-axe-z-2.jpg` | Baltimore Von Axe Z | gallery |
| `baltimore-von-axe-z-3.jpg` | Baltimore Von Axe Z | gallery |
| `baltimore-von-axe-z-4.jpg` | Baltimore Von Axe Z | gallery |
| `baltimore-von-axe-z-5.jpg` | Baltimore Von Axe Z | gallery |
| `bellavista-von-axe-z-1.jpg` | Bellavista Von Axe Z | featured image |
| `bellavista-von-axe-z-2.jpg` | Bellavista Von Axe Z | gallery |
| `bellavista-von-axe-z-3.jpg` | Bellavista Von Axe Z | gallery |
| `bellavista-von-axe-z-4.jpg` | Bellavista Von Axe Z | gallery |
| `bellavista-von-axe-z-5.jpg` | Bellavista Von Axe Z | gallery |
| `cacao-von-axe-z-1.jpg` | Cacao Von Axe Z | featured image |
| `cara-von-axe-z-1.jpg` | Cara Von Axe Z | featured image |
| `cara-von-axe-z-2.jpg` | Cara Von Axe Z | gallery |
| `charina-von-axe-z-1.jpg` | Charina Von Axe Z | featured image |
| `charina-von-axe-z-2.jpg` | Charina Von Axe Z | gallery |
| `charina-von-axe-z-3.jpg` | Charina Von Axe Z | gallery |
| `coachella-von-axe-1.jpg` | Coachella Von Axe | featured image |
| `coachella-von-axe-2.jpg` | Coachella Von Axe | gallery |
| `coachella-von-axe-3.jpg` | Coachella Von Axe | gallery |
| `coachella-von-axe-4.jpg` | Coachella Von Axe | gallery |
| `comme-il-faut-x-hypnotic-jt-z-1.jpg` | Claire Von Axe Z | featured image |
| `comme-il-faut-x-hypnotic-jt-z-2.jpg` | Claire Von Axe Z | gallery |
| `comme-il-faut-x-hypnotic-jt-z-3.jpg` | Claire Von Axe Z | gallery |
| `comme-il-faut-x-hypnotic-jt-z-4.jpg` | Claire Von Axe Z | gallery |
| `comme-il-faut-x-hypnotic-jt-z-5.jpg` | Claire Von Axe Z | gallery |
| `coolrock-von-axe-z-1.jpg` | Coolrock Von Axe Z | featured image |
| `coolrock-von-axe-z-2.jpg` | Coolrock Von Axe Z | gallery |
| `cosmopolitan-von-axe-z-1.jpg` | Cosmopolitan Von Axe Z | featured image |
| `cosmopolitan-von-axe-z-2.jpg` | Cosmopolitan Von Axe Z | gallery |
| `cosmopolitan-von-axe-z-3.jpg` | Cosmopolitan Von Axe Z | gallery |
| `cosmopolitan-von-axe-z-4.jpg` | Cosmopolitan Von Axe Z | gallery |
| `cumax-von-axe-z-1.jpg` | Cumax Von Axe Z | featured image |
| `cumax-von-axe-z-2.jpg` | Cumax Von Axe Z | gallery |
| `cumax-von-axe-z-3.jpg` | Cumax Von Axe Z | gallery |
| `cumax-von-axe-z-4.jpg` | Cumax Von Axe Z | gallery |
| `cumax-von-axe-z-5.jpg` | Cumax Von Axe Z | gallery |
| `darkhan-von-axe-z-1.jpg` | Darkhan Von Axe Z | featured image |
| `darkhan-von-axe-z-2.jpg` | Darkhan Von Axe Z | gallery |
| `darkhan-von-axe-z-3.jpg` | Darkhan Von Axe Z | gallery |
| `darkhan-von-axe-z-4.jpg` | Darkhan Von Axe Z | gallery |
| `darkhan-von-axe-z-5.jpg` | Darkhan Von Axe Z | gallery |
| `delilah-von-axe-z-1.jpg` | Delilah Von Axe Z | featured image |
| `delilah-von-axe-z-2.jpg` | Delilah Von Axe Z | gallery |
| `delilah-von-axe-z-3.jpg` | Delilah Von Axe Z | gallery |
| `dourkhet-von-axe-z-1.jpg` | Dourkhet Von Axe Z | featured image |
| `dourkhet-von-axe-z-2.jpg` | Dourkhet Von Axe Z | gallery |
| `dourkhet-von-axe-z-3.jpg` | Dourkhet Von Axe Z | gallery |
| `dourkhet-von-axe-z-4.jpg` | Dourkhet Von Axe Z | gallery |
| `dourkhet-von-axe-z-5.jpg` | Dourkhet Von Axe Z | gallery |
| `dourkhet-von-axe-z-6.jpg` | Dourkhet Von Axe Z | gallery |
| `dune-von-axe-z-1.jpg` | Dune Von Axe Z | featured image |
| `dune-von-axe-z-2.jpg` | Dune Von Axe Z | gallery |
| `evoque-von-axe-z-1.jpg` | Evoque Von Axe Z | featured image |
| `evoque-von-axe-z-2.jpg` | Evoque Von Axe Z | gallery |
| `evoque-von-axe-z-3.jpg` | Evoque Von Axe Z | gallery |
| `hyori-von-axe-z-1.jpg` | Hyōri Von Axe Z | featured image |
| `hyori-von-axe-z-2.jpg` | Hyōri Von Axe Z | gallery |
| `hyori-von-axe-z-3.jpg` | Hyōri Von Axe Z | gallery |
| `hyori-von-axe-z-4.jpg` | Hyōri Von Axe Z | gallery |
| `hyori-von-axe-z-5.jpg` | Hyōri Von Axe Z | gallery |
| `hyori-von-axe-z-6.jpg` | Hyōri Von Axe Z | gallery |
| `medillin-von-axe-z-1.jpg` | Medillín Von Axe Z | featured image |
| `medillin-von-axe-z-2.jpg` | Medillín Von Axe Z | gallery |
| `medillin-von-axe-z-3.jpg` | Medillín Von Axe Z | gallery |
| `purple-rain-von-axe-z-1.jpg` | Purple Rain Von Axe Z | featured image |
| `purple-rain-von-axe-z-2.jpg` | Purple Rain Von Axe Z | gallery |
| `purple-rain-von-axe-z-3.jpg` | Purple Rain Von Axe Z | gallery |
| `unique-touch-von-axe-z-1.jpg` | Unique Touch Von Axe Z | featured image |
| `unique-touch-von-axe-z-2.jpg` | Unique Touch Von Axe Z | gallery |

75 files.

