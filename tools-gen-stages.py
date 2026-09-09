#!/usr/bin/env python3
"""The eleven stages: one ClickUp task and one Drive folder each.

The stage list is the single place the names, the order and the file names are
written down. The build scripts read the folder names from here (through
lib_axe.stage_folder), the Drive folders are named from here, and the ClickUp
tasks are described from here. Renaming a stage in one place therefore renames
it everywhere, which is the only way eleven folders and eleven tasks stay in
step with each other.

Run: python3 tools-gen-stages.py
"""
import datetime, json, os

ROOT = os.path.dirname(os.path.abspath(__file__))

LIVE = "https://stud-von-axe-ten.vercel.app"
STAGING = "https://studvonaxe.equiwebsites.com/"
STAGING_LOGIN = "https://studvonaxe.equiwebsites.com/login-backsite/"

# The three that break an import while looking like something else entirely.
# Every stage that imports a template repeats the first one.
FLEXBOX = ("**Elementor → Settings → Features → Flexbox Container → Active.** Without this every "
           "imported template renders as a white page and looks broken when it is not.")
LOOPLINK = ("A Loop Grid arrives with **no loop item linked**. A JSON file cannot know the post ID "
            "of a loop item on this site, so open the grid, set Template to the loop item, and "
            "save. Once per grid. This is normal, not a fault.")
TYPELANDS = ("Templates file themselves into the right place in Theme Builder because of the "
             "`type` in the JSON. If something lands in Saved Templates instead, tell me rather "
             "than moving it by hand.")
NOUPLOAD = ("The `media-reference/` folder is **not** for uploading. Those photos are already in "
            "the media library, put there by the importer plugin. They are in the folder so you "
            "can check that the right photo landed in the right place. Uploading them again "
            "gives every file a `-1` twin and the templates then point at the wrong one.")

STAGES = [
 dict(
  n=1, slug="stage-1-shell",
  drive_name="Stage 1 — Header, footer, 404 & styling",
  name="Stage 1: Header, footer, 404 and the global styling",
  page="", live_label="Homepage",
  goal="Set the global styles and build the three parts that appear on every page. Everything "
       "in the later stages is built on top of this, so it is worth getting exactly right.",
  steps=[
    "Check the plugins. Elementor **Pro** and the Hello Elementor theme are active on staging "
    "already. **ACF Pro is not installed yet** — install and activate it first (version 6.1 or "
    "newer; Mark has the 6.6.2 zip). Nothing from stage 2 onwards works without it.",
    FLEXBOX,
    "Elementor → Tools → Import Kit, using `site-settings.json`: the colours, the two font "
    "roles, headings h1 to h6, the button styles and content width 1280.",
    "Google Fonts: **Fraunces** 300/400/500/600 plus 400 and 500 italic, and **Manrope** "
    "400/500/600/700/800. The kit asks for them; check they actually load.",
    "Appearance → Menus → create **three** menus. The brand mark stands in the middle of the "
    "bar and splits it, so the bar is not one menu but two, and the drawer is a third:\n"
    "  - **Header left** — Home, Sport horses, Breeding mares\n"
    "  - **Header right** — Foals, Embryos, ICSI semen\n"
    "  - **Mobile menu** — all six of those plus Contact us, in that order\n"
    "**Ask Mark first whether About us and News go in the menus too** — on the static site they "
    "are only reachable from the footer.",
    "Theme Builder → Header → import `header.json` → Display Conditions: Entire Site.",
    "Theme Builder → Footer → import `footer.json` → Display Conditions: Entire Site.",
    "Theme Builder → Single → import `404.json` → Display Conditions: 404 Page.",
  ],
  notes=[
    "The drawer takes over at **1140 pixels**, not at Elementor's own 1024. That is set in the "
    "kit, so importing `site-settings.json` sets it for the whole site. It is a measurement, not "
    "a preference: with the mark in the middle and three names either side the bar runs into "
    "itself below 1140.",
    "The header is the trickiest part of the whole build. It sits **inside** the hero, "
    "transparent, with a white logo; when you scroll past the bottom edge of the hero it turns "
    "into an ivory bar with the dark logo. That is not Elementor's sticky header — it measures "
    "the hero's own bottom edge, not a scroll distance. The fifteen lines that do it are in "
    "`custom-code-header.txt`: Elementor → Custom Code → Add New, place in `</body>`.",
    "There are two logo files, not one, and they crossfade. Both are in `media-reference/` so "
    "you can see which is which.",
    "The language switcher in the footer is **decoration**: English / Italiano / Français / "
    "Deutsch are plain labels with nothing behind them, exactly as on the static site. Do not "
    "wire them up; there are no translations yet and no translation plugin has been chosen.",
    "Check the header in the editor straight after importing. A white page means Flexbox "
    "Container is still switched off.",
    TYPELANDS,
  ],
  files=["site-settings.json", "header.json", "footer.json", "404.json",
         "custom-code-header.txt"],
 ),
 dict(
  n=2, slug="stage-2-homepage",
  drive_name="Stage 2 — Homepage & the content import",
  name="Stage 2: Homepage, the importer plugin and the partners rail",
  page="", live_label="Homepage",
  goal="Run the importer so all 113 records and 209 photos are on the site, then build the "
       "homepage on top of them.",
  steps=[
    "Plugins → Add New → Upload → `stud-von-axe-importer.zip`. Activate it. It refuses to run "
    "without ACF Pro, so make sure stage 1 is really finished.",
    "Tools → **Stud Von Axe importer**. Press **Dry run** first: it writes nothing and tells you "
    "exactly what it would do. Read it, then press **Import**. Leave the tab open — it runs in "
    "steps of twenty.",
    "Check the result: 12 sport horses, 12 breeding mares, 20 foals, 30 embryos, 32 ICSI "
    "stallions, 4 news reports, 3 partners, and seven taxonomies filled in.",
    "Run it a **second time** and check that it adds nothing. That proves the stamps work and "
    "that a later re-import will not duplicate anything.",
    "Theme Builder → Loop Item → import `loop-partner.json` and `loop-news-card.json`.",
    "Pages → Add New → **Home** → Edit with Elementor → import `home.json`.",
    "Settings → Reading → Homepage displays a static page → Home.",
    LOOPLINK + " The homepage has two: the news rail and the partners rail.",
    "Elementor → Custom Code → add `custom-code-rails.txt`, the arrows on the news rail and "
    "the partners rail.",
    "Walk the page at 1440, 768 and 390 pixels wide and compare it with the live preview.",
  ],
  notes=[
    "If the plugin upload fails because the file is too large, use the pair instead: install "
    "`stud-von-axe-importer-zonder-fotos.zip` first, then unpack "
    "`stud-von-axe-importer-fotos.zip` into `wp-content/uploads/` so that a folder "
    "`stud-von-axe-media` appears. The importer looks there too.",
    "The importer never deletes anything. Running it twice updates what is there and adds what "
    "is missing. It does overwrite a field you edited by hand if that field is in the import.",
    "When the import is finished the plugin **may be deleted**. Everything it made stays: the "
    "post types and fields are ACF's own records, the content is ordinary posts, the photos "
    "ordinary attachments. Please try this on staging and tell Mark what you see, because the "
    "whole build rests on it.",
    "The 'Every horse we have' block is five real tab panels, each with its own photograph, "
    "sentence and button. Elementor's Tabs widget switches them by itself; there is no code "
    "behind it. The five sentences are typed into the template because they are the client's "
    "own copy and do not live in a field.",
    "The partners have a logo but **no website link and no description yet**. Those fields "
    "travel empty. Mark is asking the client for them; the loop item already has the places.",
    NOUPLOAD,
    FLEXBOX,
  ],
  files=["home.json", "loop-partner.json", "loop-news-card.json",
         "custom-code-rails.txt",
         "stud-von-axe-importer.zip", "stud-von-axe-importer-zonder-fotos.zip",
         "stud-von-axe-importer-fotos.zip"],
 ),
]

# The five horse archives share one shape, so they are written once and the
# five differences are filled in. Writing them out by hand five times is five
# chances for one of them to drift.
GROEPEN = [
 dict(n=3, slug="sport-horses", pt="sport_horse", drive="Sport horses",
      label="Sport horses", page="sport-horses/index.html", aantal=12,
      chips="All · Available · Sold", filters="Sex, Studbook, Year of birth",
      eigen=["The single page carries the pedigree, the films, the photo gallery and the enquiry "
             "form. Breeding mares and foals use the same shape, so what you settle here is "
             "settled three times over."]),
 dict(n=4, slug="breeding-mares", pt="breeding_mare", drive="Breeding mares",
      label="Breeding mares", page="breeding-mares/index.html", aantal=12,
      chips="All · Available · Sold", filters="",
      eigen=["**No selects on this archive.** The client took the age and studbook filters off "
             "the mares on 3 September. That is a choice, not an omission.",
             "The mares carry a Hippomundo link under the pedigree instead of a Horsetelex one, "
             "and only where the client gave us one. An empty link hides itself."]),
 dict(n=5, slug="foals", pt="foal", drive="Foals",
      label="Foals", page="foals/index.html", aantal=20,
      chips="All · Available · Sold", filters="Sex, Studbook, Year of birth",
      eigen=["A foal that grows into a sport horse has to be moved by hand later, and its web "
             "address changes with it. That is the price of seven separate post types, and it "
             "was a deliberate choice.",
             "Most foals have no film. The film section hides itself when the field is empty; "
             "check that on a foal that has none."]),
 dict(n=6, slug="embryos", pt="embryo", drive="Embryos",
      label="Embryos", page="embryos/index.html", aantal=30,
      chips="All · Carrying · Frozen", filters="Sire",
      eigen=["**The order matters and the client asked for it in writing: implanted embryos "
             "first, then the frozen ones, never mixed.** The archive query sorts on the Stage "
             "taxonomy for exactly this reason. Do not change it to alphabetical.",
             "The stage badge carries an emoji: ❄ for frozen, ⏳ for carrying.",
             "18 of the 30 frozen embryos have no photograph of their own and show the sire's "
             "picture instead. That is intended, not a gap."]),
 dict(n=7, slug="icsi-semen", pt="icsi_stallion", drive="ICSI semen",
      label="ICSI semen", page="icsi-semen/index.html", aantal=32,
      chips="none",
      filters="Studbook, Year of birth",
      eigen=["This archive has **no status chips**. Semen is not sold or available in the way a "
             "horse is; it is on request. The filter bar is search plus the two selects.",
             "Each stallion links to the embryos he is the sire of, through the Crosses "
             "relationship field. That grid is a Loop Grid with a related query, so it needs the "
             "embryo loop item from stage 6 linked to it."]),
]

for g in GROEPEN:
    STAGES.append(dict(
      n=g["n"], slug=f"stage-{g['n']}-{g['slug']}",
      drive_name=f"Stage {g['n']} — {g['drive']}",
      name=f"Stage {g['n']}: {g['label']} archive and single",
      page=g["page"], live_label=g["label"],
      goal=f"Build the {g['label']} archive with its filter bar and its card, and the single "
           f"page behind it. {g['aantal']} records are already in the site from stage 2.",
      steps=[
        f"Theme Builder → Loop Item → import `loop-{g['slug']}.json`.",
        f"Theme Builder → Archive → import `archive-{g['slug']}.json` → Display Conditions: "
        f"Post Type Archive → {g['label']}.",
        LOOPLINK,
        f"Theme Builder → Single → import `single-{g['slug']}.json` → Display Conditions: "
        f"Singular → {g['label']}.",
        "Set up the filter bar: search"
        + (f", the status chips ({g['chips']})" if g["chips"] != "none" else
           " and the two selects, with no status chips")
        + (f" and the selects ({g['filters']})." if g["filters"] else ".")
        + " All three are Elementor Pro's own widgets and they are already in the template; "
          "check that the Loop Grid and every filter carry the same query id.",
        "Open three records and compare them with the live preview: one with everything filled "
        "in, one without a photograph, and one that is sold.",
        "Walk the archive at 1440, 768 and 390 pixels wide. The hero on a phone uses an "
        "upright crop of its own where there is one, so look at that too.",
      ] + ([
        "Elementor \u2192 Custom Code \u2192 add `custom-code-hide-empty.txt`. Not every horse "
        "has a film or spare photographs, and a section headed 'See the horse move' with an "
        "empty box under it reads as a fault. These eight lines take such a section away. "
        "Added once, works on all five single templates.",
      ] if g["n"] == 3 else []),
      notes=g["eigen"] + [
        "**The filter bar is native, and it hangs on one thread: the query id.** The search "
        "box, the status chips and the selects are Elementor Pro's own Search and Taxonomy "
        "Filter widgets, and they find the Loop Grid only through the query id they share. It "
        "is already set in the template on all four. If you rebuild the grid by hand, set it "
        "again \u2014 a filter carrying the wrong query id sits there looking perfectly normal "
        "and does nothing at all.",
        "The chips are a Taxonomy Filter set to `checkbox_list`, which draws them as pills. "
        "That value is written into the template but it is the one setting here I could not "
        "test against a running Elementor. If they come out as a dropdown instead, it is one "
        "click in the widget: Filter → Selected type. Tell Mark either way, because then I "
        "know for the other four archives.",
        "The one thing Elementor cannot do is the **count behind each chip**, the 24 in "
        "'Sold 24'. The chips filter correctly; only the number is missing. That is "
        "decoration and not function, and it is not worth a plugin for. Tell Mark if the "
        "client asks after it.",
        "The pedigree is a grid of fifteen cells, built with containers and dynamic fields, not "
        "a table. An empty cell shows 'To be filled in' by itself through the field's fallback. "
        "Check that on a horse whose third generation is unknown.",
        "The card grid on a phone is taller than it is wide, on purpose. If a photograph is cut "
        "badly, tell Mark which horse — the crop is set per horse and is easy to move.",
        NOUPLOAD,
      ],
      files=([f"archive-{g['slug']}.json", f"loop-{g['slug']}.json", f"single-{g['slug']}.json"]
             + (["custom-code-hide-empty.txt"] if g["n"] == 3 else [])),
    ))

STAGES += [
 dict(
  n=8, slug="stage-8-contact",
  drive_name="Stage 8 — Contact & e-mail",
  name="Stage 8: Contact page, the forms and the e-mails",
  page="contact/index.html", live_label="Contact",
  goal="Build the contact page and give the site a real form for the first time, with proper "
       "e-mails to the client and to us.",
  steps=[
    "Pages → Add New → **Contact us** → import `contact.json`.",
    "Set up the Elementor Form: two actions, **Email** to the client and **Email 2** to us.",
    "Install and configure an SMTP plugin. Without it WordPress sends through the host's mail "
    "and half of it lands in spam.",
    "Import the two e-mail designs from `email-to-client.html` and `email-to-sender.html`.",
    "Send a test from the contact form and from a horse page, and check that both arrive.",
    "Check the enquiry form on a horse page: it must carry the horse's name in the subject line "
    "by itself.",
  ],
  notes=[
    "**Today neither form actually sends anything.** Both open the visitor's mail app with a "
    "prepared message to studvonaxe@gmail.com. That was a deliberate choice on the static site "
    "because there was no back end. This stage is where it becomes a real form.",
    "**Two things must be settled before this stage starts:** which address receives the mail "
    "(studvonaxe@gmail.com or an address on the domain), and which SMTP account we send "
    "through. Both are questions for the client, not decisions to make in the builder.",
    "There is no Google Maps block on the contact page and it must not come back. The client "
    "asked for it to be removed: the office is in Castelnuovo Garfagnana, the stable is not.",
    "The company details are: Stud Von Axe SRL, Via per Arni, 55032 Castelnuovo Garfagnana "
    "(LU), Italy. **No house number** — that is correct, not missing. The VAT number "
    "IT02519980466 still has to be confirmed against the new SRL name.",
    "The enquiry form is on 106 horse pages. It is part of the single templates from stages 3 "
    "to 7, so building it here means going back into those five templates once. That is on "
    "purpose: the form design should be settled before it is copied five times.",
    NOUPLOAD,
  ],
  files=["contact.json", "email-to-client.html", "email-to-sender.html"],
 ),
 dict(
  n=9, slug="stage-9-about-news-legal",
  drive_name="Stage 9 — About us, news & the legal pages",
  name="Stage 9: About us, the news pages, privacy and terms",
  page="about/index.html", live_label="About us",
  goal="Build the remaining pages: the story of the stud, the news archive and its single, and "
       "the two legal pages.",
  steps=[
    "Pages → Add New → **About us** → import `about.json`.",
    "Theme Builder → Loop Item → import `loop-news.json`.",
    "Theme Builder → Archive → import `archive-news.json` → Display Conditions: Post Type "
    "Archive → News.",
    LOOPLINK,
    "Theme Builder → Single → import `single-news.json` → Display Conditions: Singular → News.",
    "Pages → Add New → **Privacy policy** → import `privacy.json`.",
    "Pages → Add New → **Terms and conditions** → import `terms.json`.",
    "Elementor → Custom Code → add `custom-code-toc.txt`, the scroll marker on the legal pages' "
    "table of contents.",
  ],
  notes=[
    "The About page has three photographs that fade into each other every five seconds. That is "
    "Elementor's own Slides widget, no code. It stops when you hover or tab into it and it never "
    "starts at all for a visitor who has asked for less motion.",
    "The four news reports **have no dates**. Their own dates did not match what actually "
    "happened, so rather than publish a wrong date there is none. Two of the four are marked as "
    "examples in the `is_placeholder` field; the template shows a quiet marker on those.",
    "There is a second body field `body_it` for the Italian version later. It is empty and the "
    "template ignores it while it is empty.",
    "The privacy page says in so many words that the site sets no cookies and runs no analytics. "
    "**That stops being true in stage 11.** When the analytics and the cookie banner go on, this "
    "page has to be rewritten. It is on the list for stage 11 as well.",
    "The legal pages have a sticky table of contents that marks where you are. Sticky is "
    "Elementor's own; the marking is the twenty lines in `custom-code-toc.txt`.",
    NOUPLOAD,
  ],
  files=["about.json", "archive-news.json", "loop-news.json", "single-news.json",
         "privacy.json", "terms.json", "custom-code-toc.txt"],
 ),
 dict(
  n=10, slug="stage-10-check",
  drive_name="Stage 10 — Check everything",
  name="Stage 10: Check everything",
  page=None, live_label="",
  goal="Walk the whole site against the live preview and write down what does not match, "
       "before anything is switched on for the public.",
  steps=[
    "Open all 122 pages of the live preview beside staging. The list is in `page-list.md`.",
    "Per page: heading text, section order, photographs, and every link.",
    "Check the five archives on all three filters at once: type a name, press a chip, choose a "
    "select. The three have to narrow the list together, not replace each other.",
    "Check the embryo archive again on the order: implanted first, then frozen.",
    "Check every single at 1440, 768 and 390 pixels.",
    "Rank Math: title and description on the seven main pages and on the six archives.",
    "Check that nothing is in the WordPress editor. All copy is in ACF fields; if a page shows "
    "text that is not in a field, it was typed in by hand and it will be lost on re-import.",
    "Write down what does not match. Do not fix it in this stage — collect it first, then we "
    "decide together what is a fault and what is a change.",
  ],
  notes=[
    "Things that are **meant** to be empty, so they are not faults: 14 of 106 horses have no "
    "height; 40 of 106 have no country, because only sold horses have one; 44 of 106 have no "
    "story text; the partners have no website and no description; the news reports have no "
    "dates.",
    "The hero photograph carries the photographer's watermark and the LA CACCIA logo. That stays "
    "until SASSO FOTOGRAFIE sends the licensed file. It is not a mistake and it is not to be "
    "edited out.",
    "Two horses, Carma and Heaven, are still shown on a competition photograph rather than a "
    "portrait. Mark has asked the client for better ones.",
  ],
  files=["page-list.md"],
 ),
 dict(
  n=11, slug="stage-11-plugins",
  drive_name="Stage 11 — The remaining plugins",
  name="Stage 11: Cookies, analytics and going live",
  page=None, live_label="",
  goal="Everything that has to be arranged around the site before it can be public.",
  steps=[
    "CookieYes: install, configure, and put the banner in the client's own categories.",
    "Google Analytics 4 and Google Search Console: property, tag, and the sitemap.",
    "Rewrite the privacy page: it currently states that the site sets no cookies and runs no "
    "analytics, and after this stage that is no longer true.",
    "Rank Math: sitemap, robots, and the social image for each of the seven main pages.",
    "Check that staging is on **noindex** and that the live site is not.",
    "Redirects from the old web addresses, if the client has an old site that is being replaced.",
    "Performance: LiteSpeed cache is already on. Check that it does not cache the filter bar's "
    "results.",
    "Backup and an update policy.",
  ],
  notes=[
    "**The language switcher has nothing behind it.** The footer shows English, Italiano, "
    "Français and Deutsch on all 122 pages as plain labels with no links. Four dead controls per "
    "page. There is no translation plugin in any stage, so a decision is needed: either "
    "WPML/Polylang and Italian becomes a project of its own, or the switcher comes out until "
    "there is something to switch to. Italian is the client's own language, so this is worth "
    "putting to them properly.",
    "There is no cookie banner and no analytics on the site today, so nothing has to be removed "
    "first. This stage adds them from nothing.",
    "The contact form and the enquiry forms only start sending in stage 8. If that stage is not "
    "finished, do not go live: a contact page whose form does nothing is worse than no form.",
  ],
  files=[],
 ),
]

assert len(STAGES) == 11, f"{len(STAGES)} stages, expected 11"
assert [s["n"] for s in STAGES] == list(range(1, 12)), "stage numbers out of order"
assert len({s["slug"] for s in STAGES}) == 11, "duplicate stage slug"


# ───────────────────────── schedule ──────────────────────────────────────────
# Calendar days, not working days. Mark asked for it in so many words: two days
# per stage, one after the other, through the weekend as well.
EERSTE_DAG = datetime.date(2026, 9, 10)     # Thursday
DAGEN_PER_STAGE = 2


def schedule(first=EERSTE_DAG, per_stage=DAGEN_PER_STAGE):
    cur, uit = first, []
    for _ in STAGES:
        eind = cur + datetime.timedelta(days=per_stage - 1)
        uit.append((cur, eind))
        cur = eind + datetime.timedelta(days=1)
    return uit


# ───────────────────────── rendering ─────────────────────────────────────────
def links_block(s, drive_url=None):
    regels = []
    if s["page"] is not None:
        # de statische site serveert map/ net zo goed als map/index.html, en
        # een link met index.html erin leest als een bestand in plaats van een
        # pagina
        schoon = s["page"].replace("index.html", "")
        pagina = f"{LIVE}/{schoon}" if schoon else LIVE
        regels.append(f"**Live preview:** {pagina}"
                      + (f" ({s['live_label']})" if s["live_label"] else ""))
    regels.append(f"**Staging:** {STAGING} — log in at {STAGING_LOGIN}, account in Bitwarden")
    if drive_url:
        regels.append(f"**Drive folder:** {drive_url}")
    return "\n".join(regels)


def _body(s, kop):
    uit = [f"{kop} {s['name']}", "", s["goal"], "", "**Steps**", ""]
    uit += [f"{i}. {t}" for i, t in enumerate(s["steps"], 1)]
    if s["notes"]:
        uit += ["", "**Worth knowing**", ""] + [f"- {n}" for n in s["notes"]]
    return uit


def readme(s, dates, drive_url=None):
    a, b = dates
    uit = [f"# {s['name']}", "", s["goal"], "",
           f"**Planned:** {a:%a %d %b} to {b:%a %d %b %Y}", "", "## Steps", ""]
    uit += [f"{i}. {t}" for i, t in enumerate(s["steps"], 1)]
    if s["notes"]:
        uit += ["", "## Worth knowing", ""] + [f"- {n}" for n in s["notes"]]
    if s["files"]:
        uit += ["", "## Files in this folder", ""] + [f"- `{f}`" for f in s["files"]]
    if s["page"] is not None:
        uit.append("- `preview.html` — the page as it should look, opens on its own")
    uit += ["", "---", "", links_block(s, drive_url), ""]
    return "\n".join(uit)


def clickup_description(s, drive_url=None):
    return "\n".join(_body(s, "##") + ["", "---", "", links_block(s, drive_url)])


def drive_map():
    pad = os.path.join(ROOT, "elementor", "drive-folders.json")
    return json.load(open(pad, encoding="utf-8")) if os.path.exists(pad) else {}


if __name__ == "__main__":
    rooster = schedule()
    drive = drive_map()
    for s, d in zip(STAGES, rooster):
        map_ = os.path.join(ROOT, "wordpress-elementor", s["drive_name"])
        os.makedirs(os.path.join(map_, "templates"), exist_ok=True)
        os.makedirs(os.path.join(map_, "media-reference"), exist_ok=True)
        with open(os.path.join(map_, "README.md"), "w", encoding="utf-8") as f:
            f.write(readme(s, d, drive.get(s["slug"])))
        print(f"  {s['n']:>2}. {s['drive_name']:44} {d[0]:%a %d %b} → {d[1]:%a %d %b}"
              f"   {'drive' if drive.get(s['slug']) else 'nog geen drive-link'}")
    print(f"\n{len(STAGES)} README's geschreven, planning van "
          f"{rooster[0][0]:%d %b} tot {rooster[-1][1]:%d %b %Y}")
