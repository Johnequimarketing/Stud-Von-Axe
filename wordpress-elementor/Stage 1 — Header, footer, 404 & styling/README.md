# Stage 1: Header, footer, 404 and the global styling

Set the global styles and build the three parts that appear on every page. Everything in the later stages is built on top of this, so it is worth getting exactly right.

**Planned:** Thu 10 Sep to Fri 11 Sep 2026

## Steps

1. Check the plugins. Elementor **Pro** and the Hello Elementor theme are active on staging already. **ACF Pro is not installed yet** — install and activate it first (version 6.1 or newer; Mark has the 6.6.2 zip). Nothing from stage 2 onwards works without it.
2. **Elementor → Settings → Features → Flexbox Container → Active.** Without this every imported template renders as a white page and looks broken when it is not.
3. Elementor → Tools → Import Kit, using `site-settings.json`: the colours, the two font roles, headings h1 to h6, the button styles and content width 1280.
4. Google Fonts: **Fraunces** 300/400/500/600 plus 400 and 500 italic, and **Manrope** 400/500/600/700/800. The kit asks for them; check they actually load.
5. Appearance → Menus → create **three** menus. The brand mark stands in the middle of the bar and splits it, so the bar is not one menu but two, and the drawer is a third:
  - **Header left** — Home, Sport horses, Breeding mares
  - **Header right** — Foals, Embryos, ICSI semen
  - **Mobile menu** — all six of those plus Contact us, in that order
**Ask Mark first whether About us and News go in the menus too** — on the static site they are only reachable from the footer.
6. Theme Builder → Header → import `header.json` → Display Conditions: Entire Site.
7. Theme Builder → Footer → import `footer.json` → Display Conditions: Entire Site.
8. Theme Builder → Single → import `404.json` → Display Conditions: 404 Page.

## Worth knowing

- The drawer takes over at **1140 pixels**, not at Elementor's own 1024. That is set in the kit, so importing `site-settings.json` sets it for the whole site. It is a measurement, not a preference: with the mark in the middle and three names either side the bar runs into itself below 1140.
- The header is the trickiest part of the whole build. It sits **inside** the hero, transparent, with a white logo; when you scroll past the bottom edge of the hero it turns into an ivory bar with the dark logo. That is not Elementor's sticky header — it measures the hero's own bottom edge, not a scroll distance. The fifteen lines that do it are in `custom-code-header.txt`: Elementor → Custom Code → Add New, place in `</body>`.
- There are two logo files, not one, and they crossfade. Both are in `media-reference/` so you can see which is which.
- The language switcher in the footer is **decoration**: English / Italiano / Français / Deutsch are plain labels with nothing behind them, exactly as on the static site. Do not wire them up; there are no translations yet and no translation plugin has been chosen.
- Check the header in the editor straight after importing. A white page means Flexbox Container is still switched off.
- Templates file themselves into the right place in Theme Builder because of the `type` in the JSON. If something lands in Saved Templates instead, tell me rather than moving it by hand.

## Files in this folder

- `site-settings.json`
- `header.json`
- `footer.json`
- `404.json`
- `custom-code-header.txt`
- `preview.html` — the page as it should look, opens on its own

---

**Live preview:** https://stud-von-axe-ten.vercel.app (Homepage)
**Staging:** https://studvonaxe.equiwebsites.com/ — log in at https://studvonaxe.equiwebsites.com/login-backsite/, account in Bitwarden
**Drive folder:** https://drive.google.com/drive/folders/1tVCCJRb1mNveomAwKwpRdIq1aNImN443

## The photographs in this folder

**Do not upload these.** They are already in the media library, put there by the importer plugin in stage 2. They are here so you can check that the right photograph landed in the right place. Uploading them again gives every file a `-1` twin and the templates then point at the wrong one.

| File in the media library | Belongs to | Used as |
|---|---|---|
| `Middel 2hoofd icon favicon blauw.png` | — | design image |
| `Middel 3hoofd icon favicon wit .png` | — | design image |
| `Middel 5logo zonder subtekst.png` | — | design image |
| `Middel 6logo zonder subtekst wit.png` | — | design image |
| `favicon-180.png` | — | design image |
| `favicon-32.png` | — | design image |
| `favicon-512.png` | — | design image |
| `icon-mark-ondark.webp` | — | design image |
| `icon-ondark.png` | — | design image |
| `icon-onlight.png` | — | design image |
| `logo-horizontal-ondark.webp` | — | design image |
| `logo-horizontal-onlight.png` | — | design image |
| `logo-plain-ondark.png` | — | design image |
| `logo-plain-onlight.png` | — | design image |
| `logo-stacked-ondark.webp` | — | design image |
| `logo-stacked-onlight.png` | — | design image |

16 files.

