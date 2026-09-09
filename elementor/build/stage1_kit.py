"""Stage 1, het kit: kleuren, letters en de maatvoering als Site Settings.

Alles waar de paginasjablonen naar verwijzen staat hier, dus dit gaat als eerste
de site in. Wordt het overgeslagen, dan landt elk sjabloon daarna buiten de
huisstijl en is er niets aan te zien behalve dat het niet klopt.

De maten hieronder zijn op de live pagina gemeten in Chrome op 1440, 768 en 375,
niet uit de clamp() in de stylesheet afgeleid. Een clamp die je met de hand
uitrekent klopt bijna, en bijna is bij een letterschaal zichtbaar.
"""
import sys, os, json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib_axe import *          # noqa: F401,F403
from lib_axe import stage_folder

WORTEL = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UIT = os.path.join(WORTEL, "wordpress-elementor", stage_folder("stage-1-shell"), "templates")

# De vier systeemkleuren eerst; Elementor toont die bovenaan in elke kleurkiezer.
# Er is geen zwart in dit palet: elke donkere behandeling is navy.
KLEUREN = [
    ("primary", "Navy", NAVY), ("secondary", "Ink", INK),
    ("text", "Ink soft", INK_SOFT), ("accent", "Gold", GOUD),
    ("sva_navy_deep", "Navy deep", DARK), ("sva_navy_soft", "Navy soft", NAVY2),
    ("sva_base", "Base", BG), ("sva_base_alt", "Base alt", BG_ALT),
    ("sva_gold_text", "Gold on light", GOUD_TXT), ("sva_gold_lift", "Gold lift", GOUD_SOFT),
    ("sva_white", "White", WIT), ("sva_line", "Line", LIJN),
    ("sva_line_invert", "Line on dark", LIJN_DARK),
]

# label, slug, familie, gewicht, maat, maat op mobiel, letterafstand, transform, stijl
LETTERS = [
    ("Heading", "primary", SERIF, "400", 51, 32, -1.02, None, None),
    ("Heading italic", "secondary", SERIF, "400", 51, 32, -1.02, None, "italic"),
    ("Body", "text", SANS, "400", 18, 18, 0, None, None),
    ("Eyebrow", "accent", SANS, "700", 11, 11, 2.42, "uppercase", None),
]

# tag, maat, maat op tablet, maat op mobiel — gemeten
KOPPEN = [("h1", 48, 42, 32), ("h2", 51, 42, 32), ("h3", 21, 19, 18),
          ("h4", 18, 17, 16), ("h5", 15, 15, 15), ("h6", 13, 13, 13)]

# Wat de stylesheet doet en Elementor niet als instelling kent. Meer dan dit
# hoort er niet in: een regel die op een widget kan hoort niet in het kit, en
# een regel die in het kit hoort staat niet op negenentwintig widgets.
EIGEN_CSS = "\n".join([
    "/* de menubalk zweeft over de pagina; zonder deze marge landt een anker uit",
    "   het menu of de footer met zijn kop onder die balk */",
    "[id]{scroll-margin-top:104px}",
    "",
    "/* alle koppen in de schreefletter, ook binnen een widget die zijn eigen kop",
    "   meebrengt, zoals een loop item of de titel van een archief */",
    ".elementor-widget-heading .elementor-heading-title,",
    ".elementor-widget-theme-post-title .elementor-heading-title{",
    f"  font-family:'{SERIF}',Georgia,serif;font-weight:400;letter-spacing:-.02em}}",
    "",
    "/* een kaart mag bij het aanwijzen optillen zonder dat de sectie hem afsnijdt */",
    ".elementor-loop-container .e-loop-item{transition:transform .3s}",
    ".elementor-loop-container .e-loop-item:hover{transform:translateY(-4px)}",
    "",
    "/* de rails: horizontaal scrollen met snap, en geen scrollbalk in beeld.",
    "   Dit is de enige plek waar het staat; de vier rails delen het. */",
    ".sva-rail{overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;",
    "  scrollbar-width:none}",
    ".sva-rail::-webkit-scrollbar{display:none}",
    ".sva-rail>*{scroll-snap-align:start}",
    "",
    "/* een lege pijl is geen pijl: uitgeschakeld leest hij als uitgeschakeld */",
    ".sva-arrow[disabled]{opacity:.32;cursor:default}",
])

instellingen = {
    "system_colors": [{"_id": s, "title": t, "color": c} for s, t, c in KLEUREN[:4]],
    "custom_colors": [{"_id": s, "title": t, "color": c} for s, t, c in KLEUREN[4:]],
    "system_typography": [],
    "container_width": sz(MAX_W),
    "space_between_widgets": sz(20),
    # De drawer neemt het over bij 1140, niet bij Elementor's eigen 1024. Dat is
    # geen smaak maar een meting: met de merknaam in het midden en drie namen
    # aan weerszijden loopt de balk onder 1140 op elkaar.
    "active_breakpoints": ["viewport_mobile", "viewport_tablet"],
    "viewport_tablet": 1140,
    "viewport_mobile": 767,
    "page_title_selector": "h1.entry-title",
    "activeItemIndex": 1,
    "custom_css": EIGEN_CSS,
    "body_typography_typography": "custom",
    "body_typography_font_family": SANS,
    "body_typography_font_size": sz(18),
    "body_typography_font_weight": "400",
    "body_typography_line_height": {"unit": "em", "size": 1.65, "sizes": []},
    "body_color": INK,
    "link_normal_color": GOUD_TXT,
    "link_hover_color": NAVY,
}

for label, slug, fam, gewicht, maat, maat_m, ls, tr, st in LETTERS:
    t = {"_id": slug, "title": label,
         "typography_typography": "custom",
         "typography_font_family": fam,
         "typography_font_weight": gewicht,
         "typography_font_size": sz(maat),
         "typography_font_size_mobile": sz(maat_m),
         "typography_letter_spacing": sz(ls)}
    if tr:
        t["typography_text_transform"] = tr
    if st:
        t["typography_font_style"] = st
    instellingen["system_typography"].append(t)

for tag, maat, maat_t, maat_m in KOPPEN:
    instellingen[f"{tag}_typography_typography"] = "custom"
    instellingen[f"{tag}_typography_font_family"] = SERIF
    instellingen[f"{tag}_typography_font_weight"] = "400"
    instellingen[f"{tag}_typography_font_size"] = sz(maat)
    instellingen[f"{tag}_typography_font_size_tablet"] = sz(maat_t)
    instellingen[f"{tag}_typography_font_size_mobile"] = sz(maat_m)
    instellingen[f"{tag}_typography_letter_spacing"] = sz(round(maat * -0.02, 2))
    instellingen[f"{tag}_typography_line_height"] = {
        "unit": "em", "size": 1.04 if maat > 26 else 1.15, "sizes": []}
    instellingen[f"{tag}_color"] = INK

# de standaardknop, gelijk aan .btn.btn-gold op de site: goud vlak, navy inkt
instellingen.update({
    "button_typography_typography": "custom",
    "button_typography_font_family": SANS,
    "button_typography_font_size": sz(12.5),
    "button_typography_font_weight": "700",
    "button_typography_letter_spacing": sz(1.25),
    "button_background_color": GOUD,
    "button_text_color": DARK,
    "button_hover_background_color": GOUD_SOFT,
    "button_hover_text_color": DARK,
    "button_border_radius": radius(999),
    "button_padding": box(12, 20, 12, 20),
})

os.makedirs(UIT, exist_ok=True)
pad = os.path.join(UIT, "site-settings.json")
json.dump({"page_settings": instellingen, "version": "0.4",
           "title": "Stud Von Axe — Site settings", "type": "kit"},
          open(pad, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"  site-settings.json   {len(KLEUREN)} kleuren, {len(LETTERS)} letterrollen, "
      f"{len(KOPPEN)} kopniveaus, {len(EIGEN_CSS)} tekens eigen CSS")
