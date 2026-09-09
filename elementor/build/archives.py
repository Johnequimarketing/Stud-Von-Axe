"""De zes archieven: vijf paardarchieven en het nieuwsarchief.

Elk archief is drie stukken: een hero met hun eigen kop, de filterbalk met het
raster eronder, en het slotblok. Alleen dat middelste stuk is niet met Elementor
alleen te bouwen — zoeken, statuschips met tellingen en facetselects die met zijn
drieën tegelijk filteren bestaat daar niet. Wat hier wél gebouwd wordt is de
plaat waar die drie in horen, met een vaste id, zodat de gekozen filterplugin er
zonder herontwerp in valt.
"""
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib_axe import *          # noqa: F401,F403
from lib_axe import stage_folder

WORTEL = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def uit(stage_slug, naam):
    m = os.path.join(WORTEL, "wordpress-elementor", stage_folder(stage_slug), "templates")
    os.makedirs(m, exist_ok=True)
    return os.path.join(m, naam)


# Hun eigen koppen, woord voor woord uit scripts/build-horses.mjs. Het stuk in
# <em> staat op de site in goud; hier wordt dat een <span> met een kleur, want
# een <em> in een Elementor-kop erft de cursieve stand van de letter mee en
# Fraunces cursief is een andere letter dan Fraunces recht.
def kop(html):
    return html.replace("<em>", f'<span style="color:{GOUD}">').replace("</em>", "</span>")


GROEPEN = {
 "sport_horse": dict(
   stage="stage-3-sport-horses", bestand="archive-sport-horses.json",
   kicker="The sport horses",
   titel="Selected for potential. <em>Developed for performance.</em>",
   intro="Some are bred here. Others are carefully sourced and developed. What they share "
         "is the quality, potential and attention that define every horse we choose to "
         "represent.",
   foto="assets/img/arch-sport.jpg", pos="50% 50%",
   zoek="Try a sire, a damline or a country.",
   chips=True, chip_tax="availability", chip_label="Availability",
   selects=[('Sex', 'horse_sex'), ('Studbook', 'studbook'), ('Year of birth', 'birth_year')],
   cta_h="Looking for a particular <em>horse</em>?",
   cta_d="We also look on a client's behalf, across Europe and as far as America. Tell us "
         "what you need and we will go and find it.",
   query_id="sva_sport", tall='assets/img/arch-sport-tall.jpg',
   volgorde="title", kolommen=3),
 "breeding_mare": dict(
   stage="stage-4-breeding-mares", bestand="archive-breeding-mares.json",
   kicker="The mares",
   titel="The bloodlines behind <em>what we breed</em>",
   intro="Strong maternal lines are at the heart of our breeding programme. Each mare brings "
         "proven genetics, performance and the potential to produce the horses we want to "
         "see in the sport of tomorrow.",
   foto="assets/img/arch-mares.jpg", pos="50% 55%",
   zoek="Try a sire, a damline or a studbook.",
   # De klant haalde de selects op 3 september van de merries af. De chips en
   # het zoekveld blijven; wat hier niet staat, staat er met opzet niet.
   chips=True, chip_tax="availability", chip_label="Availability",
   selects=[],
   cta_h="Looking for a mare to <em>breed from</em>?",
   cta_d="Tell us the line you are after. If she is not here, we will say so, and we will "
         "tell you what is coming out of the same families.",
   query_id="sva_mares", tall='assets/img/arch-mares-tall.jpg',
   volgorde="title", kolommen=3),
 "foal": dict(
   stage="stage-5-foals", bestand="archive-foals.json",
   kicker="The foals",
   titel="Born from great bloodlines. <em>Raised in Belgium.</em>",
   intro="Born from proven bloodlines and raised with care, our foals are selected and "
         "developed with one goal: to become the sport horses of tomorrow.",
   foto="assets/img/arch-foals.jpg", pos="50% 50%",
   zoek="Try a sire, a damline, a year or a country.",
   chips=True, chip_tax="availability", chip_label="Availability",
   selects=[('Sex', 'horse_sex'), ('Year of birth', 'birth_year'), ('Studbook', 'studbook')],
   cta_h="Tell us what you are <em>looking for</em>.",
   cta_d="A foal on the ground, or a cross still to be made. Say what you are after and we "
         "will tell you plainly what we have.",
   query_id="sva_foals", tall='assets/img/arch-foals-tall.jpg',
   volgorde="date", kolommen=3),
 "embryo": dict(
   stage="stage-6-embryos", bestand="archive-embryos.json",
   kicker="The embryos",
   titel="The bloodlines you want. <em>The future you choose.</em>",
   intro="Selected from outstanding families and proven sport horse combinations, our "
         "embryos give breeders and owners access to bloodlines with real breeding and "
         "performance potential.",
   foto="assets/img/arch-embryos.jpg", pos="50% 50%",
   zoek="Try a sire, a dam or a year.",
   chips=True, chip_tax="embryo_stage", chip_label="Stage",
   selects=[('Sire', 'sire')],
   cta_h="Ask about a <em>cross</em>.",
   cta_d="Frozen or already carrying. We will tell you which stage a cross is at and what "
         "it takes to bring it home.",
   # De klant vroeg dit letterlijk: eerst de geïmplanteerde, dan de bevroren,
   # niet door elkaar. Op de term sorteren en niet op naam is precies dat.
   query_id="sva_embryos", tall=None,
   volgorde="embryo_stage", kolommen=3),
 "icsi_stallion": dict(
   stage="stage-7-icsi-semen", bestand="archive-icsi-semen.json",
   kicker="ICSI semen",
   titel="The best stallions. Quality semen. <em>Fair prices.</em>",
   intro="We offer ICSI semen from selected stallions, stored at Avantea and available at "
         "competitive prices, making proven genetics more accessible to breeders.",
   foto="assets/img/arch-semen.jpg", pos="50% 42%",
   zoek="Try a name or a sire.",
   # Geen chips. Elk ander archief filtert op iets wat de gegevens weten:
   # verkocht tegen beschikbaar, bevroren tegen dragend. Hier weten ze niets om
   # op te splitsen, dus een chip zou een knop zijn die niets doet.
   chips=False, chip_tax="", chip_label="",
   selects=[('Studbook', 'studbook'), ('Year of birth', 'birth_year')],
   cta_h="Order your ICSI <em>through us</em>.",
   cta_d="Open a stallion and the order form asks for everything we need: you, your mare, "
         "and when you want the dose.",
   query_id="sva_stallions", tall=None,
   volgorde="title", kolommen=4),
}


def hero(g):
    binnen = wrap([
        eyebrow(g["kicker"]),
        W("heading", dict({"title": kop(g["titel"]), "header_size": "h1", "title_color": WIT},
                          **typo("typography", SERIF, 51, "400", size_tablet=42,
                                 size_mobile=32, letter_spacing=-1.02, line_height_em=1.04))),
        para(g["intro"], color=WIT_75, size=17, max_w=680),
    ], extra={"flex_gap": gap(0, 14)})

    # De rechtopstaande snede onder de tabletgrens. Een hero die drie keer zo
    # breed is als hoog toont op een telefoon nog geen halve foto, en dat was
    # precies de klacht van de klant over de veulens. Elementor kan per apparaat
    # een andere achtergrondfoto, dus dit is geen maatwerk.
    mobiel = ({"background_image_mobile": img(g["tall"], ""),
               "background_position_mobile": "center center",
               "background_size_mobile": "cover"} if g.get("tall") else {})

    return C({
        "background_background": "classic",
        "background_image": img(g["foto"], ""),
        "background_position": g["pos"].replace("%", "% ").strip().replace("  ", " "),
        "background_size": "cover",
        "background_overlay_background": "gradient",
        # De sluier is geen sfeerlaag maar een leesbaarheidsmaatregel: een kop
        # over een foto haalt het contrast niet vanzelf. Boven donker voor de
        # witte merknaam op de balk, onderin donkerder voor de kop zelf.
        "background_overlay_color": f"rgba({VEIL_TOP}, .78)",
        "background_overlay_color_b": f"rgba({VEIL}, .58)",
        "background_overlay_gradient_angle": {"unit": "deg", "size": 180, "sizes": []},
        "min_height": sz(468), "min_height_mobile": sz(420),
        "padding": box(150, PAD_X, 64, PAD_X),
        "padding_mobile": box(120, PAD_X_M, 48, PAD_X_M),
        "flex_direction": "column", "flex_justify_content": "flex-end",
        "_element_id": "top",
        "css_classes": "sva-hero",
        **mobiel,
    }, [binnen], is_inner=False)


def filterplaat(post_type, g):
    """De navy plaat met het zoekveld, de statuschips en de facetselects.

    Alle drie zijn het echte Elementor Pro-widgets: `search` en
    `taxonomy-filter`. Ze vinden de loop grid via het query_id dat ze delen, en
    dat is de enige draad tussen die vier — vergeet je hem, dan staan de filters
    er wel en doen ze niets, en dat is aan niets te zien.

    Wat Elementor niet heeft is de telling achter elke chip ("Sold 24"). De
    chips zelf werken; alleen het getal ontbreekt. Dat is het enige stuk
    maatwerk dat overblijft, en het is een sieraad en geen werking.
    """
    q = g["query_id"]
    kids = [zoekveld(q, g["zoek"])]

    if g["chips"]:
        kids.append(C({
            "content_width": "full", "flex_direction": "row", "flex_gap": gap(8),
            "flex_wrap": "wrap", "_element_id": "sva-chips",
        }, [taxfilter(q, g["chip_tax"], g["chip_label"], vorm="checkbox_list")]))

    if g["selects"]:
        kids.append(C({
            "content_width": "full", "flex_direction": "row", "flex_gap": gap(8),
            "flex_wrap": "wrap", "_element_id": "sva-facets",
        }, [taxfilter(q, tax, label) for label, tax in g["selects"]]))

    return C({
        "content_width": "full", "width": sz(MAX_W),
        "background_background": "classic", "background_color": NAVY,
        "border_radius": radius(R_LG),
        "padding": box(20, 22, 20, 22),
        "flex_direction": "row", "flex_wrap": "wrap", "flex_gap": gap(14),
        "flex_align_items": "center",
        "margin": {"unit": "px", "top": "-56", "right": "auto", "bottom": "0",
                   "left": "auto", "isLinked": False},
        "_element_id": "sva-filter-bar",
        "z_index": 3,
        # de ingevoerde velden staan op een donkere plaat, dus ze worden hier
        # omgekeerd getekend; Elementor levert ze standaard op licht
        "custom_css": (
            f"selector input,selector select{{background:rgba(255,255,255,.08);"
            f"color:{WIT};border:1px solid {LIJN_DARK}}}"
            f"selector label{{color:{WIT_75}}}"
            f"selector .e-filter-item{{color:{WIT};border:1px solid {LIJN_DARK};"
            f"border-radius:999px;padding:7px 14px}}"
            f"selector .e-filter-item[aria-pressed=true]{{background:{GOUD};color:{DARK}}}"
        ),
    }, kids)


def raster(post_type, g):
    return loop_grid(post_type, columns=g["kolommen"], per_page=48,
                     query_id=g["query_id"],
                     orderby=("title" if g["volgorde"] == "title"
                              else "date" if g["volgorde"] == "date" else "menu_order"),
                     nothing_found="Nothing matches that yet. Clear the search and try again.",
                     extra={"columns_tablet": "2", "columns_mobile": "1",
                            "row_gap": sz(22), "column_gap": sz(22)})


def slotblok(g):
    return cta_band(kop(g["cta_h"]), g["cta_d"], [
        btn("goud", "Contact us", "/contact/"),
        btn("ghostw", "Message us on WhatsApp", "https://wa.me/393495918565", external=True),
    ])


def archief(post_type, g):
    lijst = C({
        "background_background": "classic", "background_color": BG,
        "padding": box(0, PAD_X, PAD_SECTION, PAD_X),
        "padding_mobile": box(0, PAD_X_M, PAD_SECTION_M, PAD_X_M),
        "flex_direction": "column", "flex_gap": gap(0, 34),
    }, [filterplaat(post_type, g), wrap([raster(post_type, g)])], is_inner=False)

    return save([hero(g), lijst, slotblok(g)],
                f"Stud Von Axe — {g['kicker']} archive",
                uit(g["stage"], g["bestand"]), "archive")


# ───────────────────────── het nieuwsarchief ─────────────────────────────────
def nieuwsarchief():
    binnen = wrap([
        eyebrow("News", align="center"),
        paginakop("What is happening at the yard", color=WIT, align="center"),
        para("Foals born, horses sold, semen available. The short version, as it happens.",
             color=WIT_75, align="center", max_w=560),
    ], extra={"flex_align_items": "center", "text_align": "center", "flex_gap": gap(0, 12)})

    h = C({
        "background_background": "classic", "background_color": NAVY,
        "background_overlay_background": "classic",
        "background_overlay_color": f"rgba({VEIL_TOP}, .5)",
        "min_height": sz(380), "min_height_mobile": sz(320),
        "padding": box(150, PAD_X, 64, PAD_X),
        "padding_mobile": box(120, PAD_X_M, 48, PAD_X_M),
        "flex_direction": "column", "flex_justify_content": "flex-end",
        "_element_id": "top", "css_classes": "sva-hero",
    }, [binnen], is_inner=False)

    lijst = section([wrap([loop_grid("news_item", columns=3, per_page=24, orderby="date",
                                     nothing_found="No news yet.")])], bg=BG)

    return save([h, lijst, cta_band(
        "Want to hear it first?", "The quickest way to hear about a foal or a cross is to ask.",
        [btn("goud", "Contact us", "/contact/")])],
        "Stud Von Axe — News archive",
        uit("stage-9-about-news-legal", "archive-news.json"), "archive")


if __name__ == "__main__":
    for pt, g in GROEPEN.items():
        print(f"  {os.path.basename(archief(pt, g))}")
    print(f"  {os.path.basename(nieuwsarchief())}")
