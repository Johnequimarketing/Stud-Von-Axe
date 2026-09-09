"""De zes detailsjablonen: vijf paardvormen en het nieuwsbericht.

Sportpaarden, fokmerries en veulens delen exact hetzelfde patroon — gemeten:
hp hp--hero / ped / hvid / hgal / ask / hmore op alle drie. Ze worden hier dan
ook uit één functie gebouwd met het post type als parameter, zodat een correctie
op alle drie tegelijk landt. Drie aparte sjablonen zijn het toch, want een
Elementor-single bindt aan één post type en de veldsleutels verschillen per
veldgroep.

De stamboom is het enige stuk waar Elementor niets voor heeft. Het is geen
tabel maar een raster van vijftien vakjes waarvan elk vakje zijn eigen plek
krijgt; auto-flow zette bij het vorige project stilletjes een paard een
generatie te hoog toen er één vakje leeg was.
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


LEEG = "To be filled in"


# ───────────────────────── de stamboom ───────────────────────────────────────
# kolom, rij, hoogte in rijen — precies zoals pedigreeSection() ze zet
CELLEN = [
    ("sire",      2, 1, 4), ("dam",       2, 5, 4),
    ("sire_sire", 3, 1, 2), ("sire_dam",  3, 3, 2),
    ("dam_sire",  3, 5, 2), ("dam_dam",   3, 7, 2),
    ("gp_1", 4, 1, 1), ("gp_2", 4, 2, 1), ("gp_3", 4, 3, 1), ("gp_4", 4, 4, 1),
    ("gp_5", 4, 5, 1), ("gp_6", 4, 6, 1), ("gp_7", 4, 7, 1), ("gp_8", 4, 8, 1),
]


def stamboomcel(post_type, naam, kol, rij, hoog, diep):
    """Eén vakje. De lege staat wordt getekend en niet weggelaten: een gat in
    een stamboom leest als een fout in de opmaak, een vakje met 'To be filled
    in' leest als wat het is. De terugvalwaarde staat in de tag zelf, dus dat
    gebeurt vanzelf en niet per paard."""
    tint = {1: 0.10, 2: 0.06, 3: 0.035}[diep]
    s = {"title": LEEG, "header_size": "span", "title_color": INK}
    s.update(typo("typography", SANS, 13 if diep < 3 else 12, "600" if diep == 1 else "500",
                  line_height_em=1.3))
    s.update(acf("title", post_type, naam))
    s["custom_css"] = (
        f"selector{{grid-column:{kol};grid-row:{rij} / span {hoog};"
        f"background:color-mix(in srgb, {GOUD} {int(tint*100)}%, {WIT});"
        f"border:1px solid {LIJN};border-radius:{R_SM}px;padding:10px 12px;"
        "display:flex;align-items:center}"
        # het vakje dat op de terugvalwaarde blijft staan, leest als open
        f'selector:has(.elementor-heading-title:not(:empty)) {{}}'
    )
    return W("heading", s)


def stamboom(post_type, onderwerp_tekst="This horse"):
    kids = []
    # het onderwerp zelf, over de volle hoogte in de eerste kolom, in goud
    s = {"title": onderwerp_tekst, "header_size": "span", "title_color": DARK}
    s.update(typo("typography", SERIF, 19, "400", line_height_em=1.15))
    if post_type != "embryo":
        s.update(dyn("title", "post-title"))
    s["custom_css"] = (
        f"selector{{grid-column:1;grid-row:1 / span 8;background:{GOUD};"
        f"border-radius:{R_SM}px;padding:12px 14px;display:flex;align-items:center}}")
    kids.append(W("heading", s))

    for naam, kol, rij, hoog in CELLEN:
        diep = 1 if kol == 2 else 2 if kol == 3 else 3
        kids.append(stamboomcel(post_type, naam, kol, rij, hoog, diep))

    raster = C({
        "content_width": "full",
        "custom_css": ("selector{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));"
                       "grid-template-rows:repeat(8,minmax(44px,auto));gap:.4rem;"
                       "min-width:640px}"
                       "selector>.elementor-widget{width:auto}"),
    }, kids)

    plaat = C({
        "content_width": "full",
        "background_background": "classic", "background_color": WIT,
        "border_radius": radius(R_LG), "padding": box(22, 22, 22, 22),
        "border_border": "solid", "border_width": radius(1), "border_color": LIJN,
        # op een telefoon schuift de stamboom zijwaarts; hem inklappen zou de
        # generaties door elkaar zetten
        "custom_css": "selector{overflow-x:auto}",
    }, [raster])

    noot = W("button", dict({
        "text": "Pedigree on Horsetelex",
        "border_radius": radius(999), "text_padding": box(10, 17, 10, 17),
        "button_padding": box(10, 17, 10, 17), "hover_animation": "float",
        "border_border": "solid", "border_width": radius(1),
        "button_text_color": INK, "background_color": "rgba(0,0,0,0)",
        "button_background_color": "rgba(0,0,0,0)", "border_color": LIJN,
        "button_background_hover_color": NAVY, "button_hover_border_color": NAVY,
        "button_text_color_hover": BG,
        "link": link("#", external=True),
        # een knop naar een lege link is een knop naar niets
        "custom_css": "selector:has(a[href='']){display:none}",
    }, **typo("typography", SANS, 12.5, "700", letter_spacing=1.25),
       **dyn("link", "acf-url", veld(post_type, "horsetelex"))))

    van_wie = W("heading", dict({
        "title": "", "header_size": "span", "title_color": GRIJS,
        "custom_css": ('selector .elementor-heading-title::before'
                       '{content:"This link is the pedigree of "}'
                       "selector:has(.elementor-heading-title:empty){display:none}"),
    }, **typo(size=13, weight="500"), **acf("title", post_type, "horsetelex_of")))

    return section([wrap([
        sec_head("The pedigree", "Three generations deep"),
        plaat,
        C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(12),
           "flex_wrap": "wrap", "flex_align_items": "center",
           "padding": box(16, 0, 0, 0)}, [noot, van_wie]),
    ], gap_px=0)], bg=BG_ALT)


# ───────────────────────── de hero van een paardpagina ───────────────────────
def paardhero(post_type, terug_label, terug_url):
    # Eén foto, twee sneden. Waar een paard maar één foto heeft, snijdt de band
    # hoog op datzelfde bestand, zodat de band de kop toont en de kolom eronder
    # het hele paard. Mark heeft drie keer gemeld dat de kop eraf viel; op de
    # statische site is dit `.eh__win--high { object-position: center 22% }`.
    # Hier hangt het aan de tweede foto: is die er niet, dan snijdt de band hoog.
    achter = W("theme-post-featured-image", {
        "image_size": "full",
        "css_classes": "sva-hero-img",
        "custom_css": ("selector{position:absolute;inset:0;z-index:0}"
                       "selector img{width:100%;height:100%;object-fit:cover;"
                       "object-position:50% 38%}"),
    })
    veil = W("html", {"html": "", "custom_css": (
        "selector{position:absolute;inset:0;z-index:1;"
        f"background:linear-gradient(to bottom,rgba({VEIL_TOP},.72) 0%,"
        f"rgba({VEIL_TOP},.28) 34%,rgba({VEIL},.55) 72%,rgba({VEIL},.9) 100%)}}")})

    terug = W("button", dict({
        "text": f"&larr; {terug_label}", "link": link(terug_url),
        "border_radius": radius(999), "text_padding": box(9, 16, 9, 16),
        "button_padding": box(9, 16, 9, 16), "hover_animation": "float",
        "border_border": "solid", "border_width": radius(1), "border_color": LIJN_DARK,
        "button_text_color": WIT, "background_color": "rgba(0,0,0,0)",
        "button_background_color": "rgba(0,0,0,0)",
        "button_background_hover_color": WIT, "button_hover_border_color": WIT,
        "button_text_color_hover": NAVY,
    }, **typo("typography", SANS, 12, "600", letter_spacing=0.8)))

    lade = C({
        "content_width": "full",
        "background_background": "classic", "background_color": BG,
        "border_radius": radius(R_LG), "padding": box(28, 30, 28, 30),
        "flex_direction": "column", "flex_gap": gap(14),
    }, [
        W("theme-post-title", dict({"title": "", "header_size": "h1", "title_color": INK},
                                   **typo("typography", SERIF, 48, "400", size_tablet=42,
                                          size_mobile=32, letter_spacing=-0.96,
                                          line_height_em=1.02))),
        W("heading", dict({"title": "", "header_size": "span", "title_color": NAVY2},
                          **typo(size=15, weight="600"),
                          **acf("title", post_type, "genetics"))),
        # hun eigen zin over dit paard. Op de statische pagina is dat hp__lead,
        # en hij staat bij twaalf van de twaalf merries en twintig van de
        # twintig veulens ingevuld.
        W("heading", dict({"title": "", "header_size": "span", "title_color": INK,
                           "custom_css": ("selector .elementor-heading-title{display:block}"
                                          "selector:has(.elementor-heading-title:empty)"
                                          "{display:none}")},
                          **typo(size=16, weight="500", line_height_em=1.5),
                          **acf("title", post_type, "tagline"))),
        W("heading", dict({"title": "", "header_size": "span", "title_color": INK_SOFT},
                          **typo(size=14, weight="500"),
                          **acf("title", post_type, "meta_line"))),
        C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(10),
           "flex_wrap": "wrap"}, [
            btn("goud", "Ask about this horse", "#ask"),
        ]),
    ])

    rij = row([
        cell([W("image", dict({
            "image_size": "large",
            "css_classes": "sva-second",
            "custom_css": (f"selector img{{border-radius:{R_LG}px;width:100%;"
                           "aspect-ratio:4/3.4;object-fit:cover}}"
                           # een paard met maar één foto laat dit vlak weg; de
                           # achtergrond toont die ene al
                           "selector:not(:has(img)){display:none}"),
        }, **dyn("image", "acf-image", veld(post_type, "photo_2"))))], 46),
        cell([lade], 54, extra={"flex_justify_content": "center"}),
    ], gap_px=26, align="center")

    feiten = row([
        feitkaart("Born", "", (post_type, "year_of_birth")),
        feitkaart("Sex", "", (post_type, "sex")),
        feitkaart("Studbook", "", (post_type, "studbook")),
        feitkaart("Height", "", (post_type, "height")),
    ], gap_px=12)

    binnen = wrap([terug, rij, feiten], extra={"flex_gap": gap(0, 26), "z_index": 2})

    return C({
        "background_background": "classic", "background_color": NAVY,
        "padding": box(140, PAD_X, PAD_SECTION, PAD_X),
        "padding_mobile": box(110, PAD_X_M, PAD_SECTION_M, PAD_X_M),
        "flex_direction": "column", "position": "relative", "overflow": "hidden",
        "_element_id": "top", "css_classes": "sva-hero",
        "custom_css": (
            "selector:not(:has(.sva-second img)) .sva-hero-img img"
            "{object-position:center 22%}"),
    }, [achter, veil, binnen], is_inner=False)


# ───────────────────────── film, galerij, formulier, rail ────────────────────
def films(post_type):
    # De widget wil een volledig YouTube-adres en geen id. video_1_url is het
    # veld dat de importer daarvoor schrijft; video_1_id staat er nog naast
    # omdat dat is wat de klant herkent als hij het wil wijzigen.
    speler = W("video", dict({
        "video_type": "youtube",
        "show_image_overlay": "yes", "lazy_load": "yes",
        "image_overlay": img("assets/img/hero-jump.jpg", ""),
        "aspect_ratio": "169",
        "custom_css": f"selector .elementor-wrapper{{border-radius:{R_LG}px;overflow:hidden}}",
    }, **dyn("youtube_url", "acf-url", veld(post_type, "video_1_url"))))

    # Niet elk paard heeft een film: 5 van de 20 veulens wel, 11 van de 12
    # sportpaarden. Een lege filmsectie leest als een fout, dus de sectie draagt
    # een klasse waarop custom-code-hide-empty.txt hem weghaalt als er niets in
    # staat.
    return section([wrap([
        sec_head("On film", "See the horse move"),
        speler,
    ], gap_px=0)], bg=NAVY, extra={"background_color": NAVY,
                                   "css_classes": "sva-hide-if-empty"})


def galerij(post_type):
    g = W("gallery", dict({
        "gallery_layout": "grid", "columns": "3", "columns_tablet": "2",
        "columns_mobile": "1", "gap": {"column": "14", "row": "14", "unit": "px",
                                       "size": "", "isLinked": True},
        "aspect_ratio": "43", "overlay_background": "yes",
        "open_lightbox": "yes",
        "custom_css": f"selector .e-gallery-image{{border-radius:{R}px}}",
    }, **dyn("gallery", "acf-gallery", veld(post_type, "gallery"))))
    return section([wrap([sec_head("Photographs", "More of this horse"), g], gap_px=0)],
                   bg=BG, extra={"css_classes": "sva-hide-if-empty"})


def verhaal(post_type, kop_tekst="In their own words"):
    return section([wrap([
        sec_head("The story", kop_tekst),
        W("text-editor", dict({"editor": "", "text_color": INK_SOFT},
                              **typo(size=18, weight="400", line_height_em=1.7),
                              **{"custom_css": "selector{max-width:760px}"},
                              **acf("editor", post_type, "body"))),
    ], gap_px=0)], bg=BG)


def vraagblok():
    """Het formulier. Op de statische site opent dit de mailtoepassing van de
    bezoeker, want er was geen achterkant. Hier is het Elementor's eigen
    formulier — en dat is meteen de reden dat stage 8 bestaat: zonder een
    ontvangend adres en SMTP verstuurt dit niets."""
    form = W("form", {
        "form_name": "Horse enquiry",
        "form_fields": [
            {"_id": "name", "field_type": "text", "field_label": "Your name",
             "placeholder": "Your name", "required": "true", "width": "50"},
            {"_id": "email", "field_type": "email", "field_label": "Your email",
             "placeholder": "you@example.com", "required": "true", "width": "50"},
            {"_id": "phone", "field_type": "tel", "field_label": "Telephone",
             "placeholder": "Optional", "required": "", "width": "50"},
            {"_id": "about", "field_type": "text", "field_label": "About",
             "placeholder": "Which horse", "required": "", "width": "50",
             "field_value": "", "__dynamic__": {"field_value": make_dynamic_tag("post-title")}},
            {"_id": "message", "field_type": "textarea", "field_label": "Your message",
             "placeholder": "What would you like to know?", "required": "true",
             "width": "100", "rows": 5},
        ],
        "button_text": "Send",
        "submit_actions": ["email", "email2"],
        "email_to": CONTACT["email"],
        "email_subject": "Enquiry from the website",
        "label_color": WIT_75, "field_text_color": WIT,
        "field_background_color": "rgba(255,255,255,.08)",
        "border_color": LIJN_DARK, "border_width": radius(1),
        "field_border_radius": radius(12),
        "button_background_color": GOUD, "button_text_color": DARK,
        "_element_id": "ask-form",
    })
    binnen = wrap([
        sec_head("Ask us", "Ask about this horse",
                 "Tell us what you would like to know. We answer in Italian, English, "
                 "French and German."),
        form,
    ], width=780, gap_px=0)
    return C({
        "background_background": "gradient", "background_color": NAVY,
        "background_color_b": DARK,
        "background_gradient_angle": {"unit": "deg", "size": 150, "sizes": []},
        "padding": box(PAD_BAND, PAD_X, PAD_BAND, PAD_X),
        "padding_mobile": box(52, PAD_X_M, 52, PAD_X_M),
        "flex_direction": "column", "_element_id": "ask",
        "custom_css": (f"selector .elementor-field-group>label{{color:{WIT_75}}}"
                       f"selector h2{{color:{WIT}}}selector p{{color:{WIT_75}}}"),
    }, [binnen], is_inner=False)


def meer(post_type, label, url):
    return section([wrap([
        sec_head("More", f"More {label.lower()}"),
        loop_grid(post_type, columns=4, per_page=8, orderby="rand",
                  nothing_found="", extra={"columns_tablet": "2", "columns_mobile": "1"}),
        C({"content_width": "full", "flex_direction": "row", "padding": box(20, 0, 0, 0)},
          [btn("ghost", f"All {label.lower()}", url)]),
    ], gap_px=0)], bg=BG_ALT)


# ───────────────────────── de sjablonen ──────────────────────────────────────
PAARDEN = [
    ("sport_horse", "stage-3-sport-horses", "single-sport-horses.json",
     "Sport horses", "/sport-horses/"),
    ("breeding_mare", "stage-4-breeding-mares", "single-breeding-mares.json",
     "Breeding mares", "/breeding-mares/"),
    ("foal", "stage-5-foals", "single-foals.json", "Foals", "/foals/"),
]


def paardpagina(post_type, stage, bestand, label, url):
    inhoud = [
        paardhero(post_type, label, url),
        stamboom(post_type),
        verhaal(post_type),
        films(post_type),
        galerij(post_type),
        vraagblok(),
        meer(post_type, label, url),
    ]
    return save(inhoud, f"Stud Von Axe — {label} single", uit(stage, bestand), "single")


def embryopagina():
    pt = "embryo"
    hero = C({
        "background_background": "classic", "background_color": NAVY,
        "padding": box(140, PAD_X, PAD_SECTION, PAD_X),
        "padding_mobile": box(110, PAD_X_M, PAD_SECTION_M, PAD_X_M),
        "flex_direction": "column", "position": "relative", "overflow": "hidden",
        "_element_id": "top", "css_classes": "sva-hero",
    }, [
        W("theme-post-featured-image", {
            "image_size": "full",
            # 27 van de 30 kruisingen dragen één foto, meestal die van de vader,
            # dus ook hier de hoge snede zodat de kop in de band staat
            "custom_css": ("selector{position:absolute;inset:0;z-index:0}"
                           "selector img{width:100%;height:100%;object-fit:cover;"
                           "object-position:center 22%}")}),
        W("html", {"html": "", "custom_css": (
            "selector{position:absolute;inset:0;z-index:1;"
            f"background:linear-gradient(to bottom,rgba({VEIL_TOP},.74) 0%,"
            f"rgba({VEIL},.5) 45%,rgba({VEIL},.92) 100%)}}")}),
        wrap([
            eyebrow("The cross"),
            W("theme-post-title", dict({"header_size": "h1", "title_color": WIT},
                                       **typo("typography", SERIF, 48, "400",
                                              size_tablet=42, size_mobile=32,
                                              letter_spacing=-0.96, line_height_em=1.04))),
            W("heading", dict({"title": "", "header_size": "span", "title_color": GOUD},
                              **typo(size=13, weight="700", transform="uppercase",
                                     letter_spacing=1.6),
                              **acf("title", pt, "stage_badge"))),
            W("heading", dict({"title": "", "header_size": "span", "title_color": WIT_75},
                              **typo(size=16, weight="500"),
                              **acf("title", pt, "genetics"))),
            C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(10),
               "flex_wrap": "wrap", "padding": box(8, 0, 0, 0)},
              [btn("goud", "Ask about this cross", "#ask")]),
        ], extra={"z_index": 2, "flex_gap": gap(0, 12)}),
    ], is_inner=False)

    lijnen = section([wrap([
        sec_head("The lines", "Where this cross comes from"),
        row([
            cell([W("heading", dict({"title": "Sire line", "header_size": "h3",
                                     "title_color": INK}, **typo(SERIF and "typography",
                                                                 SERIF, 21, "400"))),
                  W("text-editor", dict({"editor": "", "text_color": INK_SOFT},
                                        **typo(size=17, weight="400", line_height_em=1.7),
                                        **acf("editor", pt, "sire_line")))], 50),
            cell([W("heading", dict({"title": "Dam line", "header_size": "h3",
                                     "title_color": INK}, **typo("typography", SERIF, 21, "400"))),
                  W("text-editor", dict({"editor": "", "text_color": INK_SOFT},
                                        **typo(size=17, weight="400", line_height_em=1.7),
                                        **acf("editor", pt, "dam_line")))], 50),
        ], gap_px=28),
    ], gap_px=0)], bg=BG)

    return save([hero, stamboom(pt, "Your next embryo"), lijnen, galerij(pt), vraagblok(),
                 meer(pt, "Embryos", "/embryos/")],
                "Stud Von Axe — Embryo single",
                uit("stage-6-embryos", "single-embryos.json"), "single")


def hengstpagina():
    pt = "icsi_stallion"
    hero = C({
        "background_background": "classic", "background_color": NAVY,
        "padding": box(140, PAD_X, PAD_SECTION, PAD_X),
        "padding_mobile": box(110, PAD_X_M, PAD_SECTION_M, PAD_X_M),
        "flex_direction": "column", "position": "relative", "overflow": "hidden",
        "_element_id": "top", "css_classes": "sva-hero",
    }, [
        W("theme-post-featured-image", {
            "image_size": "full",
            # Alle 32 hengsten hebben precies één foto, dus hier is de hoge
            # snede niet voorwaardelijk maar de regel. Dit is het antwoord op
            # "kop nog steeds afgeknipt", drie keer gemeld op deze pagina's.
            "custom_css": ("selector{position:absolute;inset:0;z-index:0}"
                           "selector img{width:100%;height:100%;object-fit:cover;"
                           "object-position:center 22%}")}),
        W("html", {"html": "", "custom_css": (
            "selector{position:absolute;inset:0;z-index:1;"
            f"background:linear-gradient(to bottom,rgba({VEIL_TOP},.7) 0%,"
            f"rgba({VEIL},.5) 45%,rgba({VEIL},.92) 100%)}}")}),
        wrap([
            eyebrow("ICSI semen"),
            W("theme-post-title", dict({"header_size": "h1", "title_color": WIT},
                                       **typo("typography", SERIF, 48, "400",
                                              size_tablet=42, size_mobile=32,
                                              letter_spacing=-0.96, line_height_em=1.04))),
            W("heading", dict({"title": "", "header_size": "span", "title_color": WIT_75},
                              **typo(size=16, weight="500"),
                              **acf("title", pt, "genetics"))),
            C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(10),
               "flex_wrap": "wrap", "padding": box(8, 0, 0, 0)},
              [btn("goud", "Ask about this stallion", "#ask")]),
        ], extra={"z_index": 2, "flex_gap": gap(0, 12)}),
        wrap([row([
            feitkaart("Born", "", (pt, "year_of_birth")),
            feitkaart("Studbook", "", (pt, "studbook")),
            feitkaart("Availability", "", (pt, "availability")),
        ], gap_px=12)], extra={"z_index": 2, "padding": box(26, 0, 0, 0)}),
    ], is_inner=False)

    # De kruisingen waarvan deze hengst de vader is. Elementor's loop grid leest
    # een relatieveld met een gerelateerde query; het loop item is dat van de
    # kruisingen uit stage 6, dus dat moet gekoppeld worden.
    kruisingen = section([wrap([
        sec_head("The crosses", "Embryos by this stallion"),
        loop_grid("embryo", columns=4, per_page=12, orderby="menu_order",
                  nothing_found="No crosses by this stallion on the site yet.",
                  extra={"columns_tablet": "2", "columns_mobile": "1",
                         "post_query_post_type": "related",
                         "post_query_relationship_field": veld(pt, "crosses")}),
    ], gap_px=0)], bg=BG_ALT)

    return save([hero, stamboom(pt), verhaal(pt, "About this stallion"), kruisingen,
                 galerij(pt), vraagblok(), meer(pt, "ICSI semen", "/icsi-semen/")],
                "Stud Von Axe — ICSI stallion single",
                uit("stage-7-icsi-semen", "single-icsi-semen.json"), "single")


def nieuwspagina():
    pt = "news_item"
    hero = C({
        "background_background": "classic", "background_color": NAVY,
        "padding": box(150, PAD_X, 70, PAD_X),
        "padding_mobile": box(115, PAD_X_M, 50, PAD_X_M),
        "flex_direction": "column", "position": "relative", "overflow": "hidden",
        "_element_id": "top", "css_classes": "sva-hero",
    }, [
        W("theme-post-featured-image", {
            "image_size": "full",
            "custom_css": ("selector{position:absolute;inset:0;z-index:0}"
                           "selector img{width:100%;height:100%;object-fit:cover}")}),
        W("html", {"html": "", "custom_css": (
            "selector{position:absolute;inset:0;z-index:1;"
            f"background:linear-gradient(to bottom,rgba({VEIL_TOP},.76) 0%,"
            f"rgba({VEIL},.88) 100%)}}")}),
        wrap([
            W("heading", dict({"title": "", "header_size": "span", "title_color": GOUD},
                              **typo(size=11, weight="700", transform="uppercase",
                                     letter_spacing=2.42),
                              **acf("title", pt, "eyebrow"))),
            W("theme-post-title", dict({"header_size": "h1", "title_color": WIT},
                                       **typo("typography", SERIF, 48, "400",
                                              size_tablet=42, size_mobile=32,
                                              letter_spacing=-0.96, line_height_em=1.04))),
            W("heading", dict({"title": "", "header_size": "span", "title_color": WIT_75},
                              **typo(size=17, weight="400", line_height_em=1.6),
                              **acf("title", pt, "excerpt"))),
        ], width=880, extra={"z_index": 2, "flex_gap": gap(0, 12)}),
    ], is_inner=False)

    # Twee van de vier berichten zijn voorbeelden. Zolang dat zo is hoort de
    # pagina dat te zeggen; een voorbeeld dat zich voordoet als nieuws is erger
    # dan een lege nieuwspagina.
    voorbeeld = W("heading", dict({
        "title": "", "header_size": "span", "title_color": DARK,
        "custom_css": ("selector .elementor-heading-title{display:inline-block;"
                       f"padding:8px 13px;border-radius:{R_SM}px;background:{GOUD_SOFT}}}"
                       'selector .elementor-heading-title::before'
                       '{content:"Example story — not published news"}'
                       "selector:has(.elementor-heading-title:empty){display:none}"),
    }, **typo(size=12, weight="700", transform="uppercase", letter_spacing=1.2),
       **acf("title", pt, "is_placeholder")))

    tekst = section([wrap([
        voorbeeld,
        W("text-editor", dict({"editor": "", "text_color": INK},
                              **typo(size=18, weight="400", line_height_em=1.75),
                              **acf("editor", pt, "body"))),
    ], width=780, gap_px=0)], bg=BG)

    return save([hero, tekst, cta_band(
        "Want to hear it first?",
        "Ask us about a foal, a cross or a dose and we will tell you what we have.",
        [btn("goud", "Contact us", "/contact/")])],
        "Stud Von Axe — News single",
        uit("stage-9-about-news-legal", "single-news.json"), "single")


if __name__ == "__main__":
    for args in PAARDEN:
        print(f"  {os.path.basename(paardpagina(*args))}")
    for f in (embryopagina, hengstpagina, nieuwspagina):
        print(f"  {os.path.basename(f())}")
