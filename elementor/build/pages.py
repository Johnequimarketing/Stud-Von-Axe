"""De vijf gewone pagina's: home, contact, over ons, privacy en voorwaarden.

De teksten staan hier woord voor woord zoals ze op de statische site staan.
Niets is hier opnieuw geschreven of ingekort: wat de klant heeft goedgekeurd is
wat er staat, en waar hun zin lang is blijft hij lang.
"""
import sys, os, json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib_axe import *          # noqa: F401,F403
from lib_axe import stage_folder

WORTEL = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WA = "https://wa.me/393495918565"


def uit(stage_slug, naam):
    m = os.path.join(WORTEL, "wordpress-elementor", stage_folder(stage_slug), "templates")
    os.makedirs(m, exist_ok=True)
    return os.path.join(m, naam)


def goud(html):
    return html.replace("<em>", f'<span style="color:{GOUD}">').replace("</em>", "</span>")


# ───────────────────────── de partnerstrook ──────────────────────────────────
def partners():
    """Staat op drie pagina's: home, over ons en contact. Eén functie, want een
    strook die op drie plaatsen anders is, is op twee ervan fout.

    De logo's komen uit een loop grid over het post type partner. De kaarten
    hebben een vaste hoogte: een percentagehoogte binnen een raster waarvan de
    rij door datzelfde beeld gemeten wordt valt terug op auto, en dan staat een
    logo van 600 bij 600 driehonderd pixels hoog in een bak van honderdertig.
    """
    return section([wrap([
        sec_head("Partners", "The people behind us.", align="center"),
        loop_grid("partner", columns=5, per_page=12, orderby="menu_order",
                  nothing_found="",
                  extra={"columns_tablet": "3", "columns_mobile": "2",
                         "row_gap": sz(16), "column_gap": sz(16)}),
    ], gap_px=0)], bg=BG_ALT, pad_top=PAD_SECTION, pad_bottom=PAD_SECTION)


# ───────────────────────── homepagina ────────────────────────────────────────
def home():
    hero = C({
        "background_background": "classic",
        "background_image": img("assets/img/hero-jump.jpg",
                                "A horse and rider over a fence at Stud Von Axe"),
        "background_position": "center 32%", "background_size": "cover",
        "min_height": sz(760), "min_height_mobile": sz(620),
        "padding": box(180, PAD_X, 96, PAD_X),
        "padding_mobile": box(140, PAD_X_M, 64, PAD_X_M),
        "flex_direction": "column", "flex_justify_content": "flex-end",
        "position": "relative", "overflow": "hidden",
        "_element_id": "top", "css_classes": "sva-hero",
        # De foto is al warm afgeleverd door hun eigen bewerker; deze drie
        # waarden zijn wat de site erop legt en niet meer dan dat.
        "custom_css": (
            "selector{filter:none}"
            "selector::before{content:'';position:absolute;inset:0;z-index:0;"
            "background:inherit;background-size:cover;background-position:center 32%;"
            "filter:brightness(1.06) contrast(1.10) saturate(1.15)}"
            # de sluier: donker boven zodat de witte merknaam op de balk leest,
            # en een oplopende voet zodat de kop erop staat en niet erin verdwijnt
            "selector::after{content:'';position:absolute;inset:0;z-index:1;"
            f"background:linear-gradient(to bottom,rgba({VEIL_TOP},.88) 0%,"
            f"rgba({VEIL_TOP},.88) 4%,rgba({VEIL_TOP},.69) 11%,rgba({VEIL_TOP},.40) 18%,"
            f"rgba({VEIL_TOP},.16) 25%,rgba({VEIL_TOP},0) 30%,"
            f"rgba({VEIL},0) 46%,rgba({VEIL},.30) 52%,rgba({VEIL},.66) 58%,"
            f"rgba({VEIL},.88) 64%,rgba({VEIL},.98) 74%,rgba({VEIL},1) 84%)}}"
        ),
    }, [wrap([
        eyebrow("Foals &middot; Embryos &middot; ICSI semen"),
        W("heading", dict({"title": "Bred for the biggest <em>arenas</em>".replace(
            "<em>", f'<span style="color:{GOUD}">').replace("</em>", "</span>"),
            "header_size": "h1", "title_color": WIT},
            **typo("typography", SERIF, 102, "400", size_tablet=57, size_mobile=38,
                   letter_spacing=-1.54, line_height_em=0.9, transform="uppercase"))),
        para("Foals, embryos and ICSI semen: the crosses made in Italy, the foals raised "
             "in Belgium, sold direct to breeders worldwide.",
             color=WIT_75, size=18, max_w=640),
    ], extra={"z_index": 2, "flex_gap": gap(0, 16)})], is_inner=False)

    stud = section([wrap([row([
        cell([tegelfoto("assets/img/about-owners.jpg", "Elisabetta and Adriano of Stud Von Axe",
                        ratio="4/3", radius_px=R_LG)], 46),
        cell([
            eyebrow("About Stud Von Axe"),
            title("The vision behind Stud Von Axe"),
            para("Over the years, we have carefully developed a select group of exceptional "
                 "mares from some of the world's most distinguished dam lines. Every breeding "
                 "decision reflects our passion for show jumping and our commitment to "
                 "producing horses of the highest quality."),
            para("By combining proven, high performing mares with carefully chosen stallions, "
                 "we strive to produce modern sport horses with the talent, athleticism and "
                 "pedigree required to succeed at the highest levels of international "
                 "competition."),
            C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(10),
               "flex_wrap": "wrap", "padding": box(6, 0, 0, 0)},
              [btn("ghost", "About the stud &rarr;", "/about/")]),
        ], 54, gap_px=14),
    ], gap_px=34, align="center")], gap_px=0)], bg=BG)

    # De vijf tabbladen, "Every horse we have". Vijf echte panelen met een
    # foto, hun eigen zin en de knop naar het archief. Elementor's Tabs-widget
    # wisselt ze zelf; hier is geen regel code voor nodig. De eerste versie van
    # dit sjabloon had vijf lege panelen en vertrouwde op eigen JavaScript om ze
    # te vullen — dat is teruggedraaid, want een paneel dat leeg is tot er een
    # script draait, is leeg als dat script er niet is.
    #
    # De zinnen staan hier woord voor woord zoals ze in home-tabs.js staan, dat
    # scripts/build-horses.mjs schrijft. Geen aantallen in het paneel: die zouden
    # in WordPress niet meetellen met de kudde.
    TABBLADEN = [
        ("Sport horses", "assets/img/tab-sport.jpg", "/sport-horses/",
         "See all sport horses",
         "Some are bred here. Others are carefully sourced and developed. What they share "
         "is the quality, potential and attention that define every horse we choose to "
         "represent."),
        ("Breeding mares", "assets/img/tab-broodmare.jpg", "/breeding-mares/",
         "See all breeding mares",
         "Strong maternal lines are at the heart of our breeding programme. Each mare brings "
         "proven genetics, performance and the potential to produce the horses we want to "
         "see in the sport of tomorrow."),
        ("Foals", "assets/img/tab-foal.jpg", "/foals/", "See all foals",
         "Born from proven bloodlines and raised with care, our foals are selected and "
         "developed with one goal: to become the sport horses of tomorrow."),
        ("Embryos", "assets/img/tab-embryo.jpg", "/embryos/", "See all crosses",
         "Selected from outstanding families and proven sport horse combinations, our "
         "embryos give breeders and owners access to bloodlines with real breeding and "
         "performance potential."),
        ("ICSI semen", "assets/img/tab-stallion.jpg", "/icsi-semen/", "See all stallions",
         "We offer ICSI semen from selected stallions, stored at Avantea and available at "
         "competitive prices, making proven genetics more accessible to breeders."),
    ]

    def paneel(label, foto, url, knop, zin):
        return C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(26),
                  "flex_wrap": "wrap", "flex_align_items": "center",
                  "padding": box(22, 0, 0, 0)}, [
            cell([tegelfoto(foto, label, ratio="3/2", radius_px=R)], 54),
            cell([para(zin, size=17), btn("ghost", f"{knop} &rarr;", url)], 46, gap_px=16),
        ])

    tabbladen = section([wrap([
        sec_head("Every horse we have", "Five ways in", align="center"),
        W("nested-tabs", {
            "tabs": [{"_id": lbl.lower().replace(" ", "-"), "tab_title": lbl}
                     for lbl, *_ in TABBLADEN],
            "_element_id": "sva-tabs",
            "tabs_title_space_between": sz(22),
            "tabs_title_color": INK_SOFT,
            "tabs_title_color_active": INK,
            "horizontal_scroll": "enable",
            "box_border_border": "none",
        }, [paneel(*t) for t in TABBLADEN]),
    ], gap_px=0)], bg=BG_ALT)

    diensten = section([wrap([row([
        cell([
            eyebrow("What else we do"),
            title("We also look on your behalf."),
            para("Our work extends beyond the horses we breed ourselves. We source and broker "
                 "carefully selected sport horses and breeding mares for clients who value "
                 "quality, transparency and expertise. Every search begins with understanding "
                 "what the client needs, and ends with finding the right opportunity."),
            C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(10),
               "flex_wrap": "wrap", "padding": box(6, 0, 0, 0)}, [
                btn("goud", "Tell us what you need", "/contact/"),
                btn("ghost", "See our mares", "/breeding-mares/"),
            ]),
        ], 54, gap_px=14),
        cell([tegelfoto("assets/img/results-unguessable.jpg", "Unguessable in the ring",
                        ratio="4/3", radius_px=R_LG)], 46),
    ], gap_px=34, align="center")], gap_px=0)], bg=BG)

    vraag = cta_band(
        "Tell us the horse you have <em>in mind</em>.".replace(
            "<em>", f'<span style="color:{GOUD}">').replace("</em>", "</span>"),
        "A dose for your own mare, a cross already made, or a foal on the ground. Say what "
        "you are after and we will tell you plainly what we have.",
        [btn("goud", "Get in touch", "/contact/"),
         btn("ghostw", "Message on WhatsApp", WA, external=True)])

    nieuws = section([wrap([
        sec_head("News and results", "The latest from the stud.",
                 "Results, stories and moments from the stud. Follow the horses we breed, "
                 "develop and represent, from the sport arena to the breeding programme."),
        # De vier berichten hebben geen datum — die van hun eigen site klopten
        # niet — dus op datum sorteren zou een willekeurige orde geven.
        loop_grid("news_item", columns=3, per_page=6, orderby="menu_order",
                  nothing_found="", extra={"columns_tablet": "2", "columns_mobile": "1",
                                           "_element_id": "sva-news-rail"}),
    ], gap_px=0)], bg=BG_ALT)

    contactblok = contactkaart()

    return save([hero, stud, tabbladen, diensten, vraag, nieuws, contactblok, partners()],
                "Stud Von Axe — Home", uit("stage-2-homepage", "home.json"), "page")


# ───────────────────────── het contactblok ──────────────────────────────────
def contactkaart(met_kop=True):
    """De donkere kaart met het formulier links en de drie manieren om ze te
    bereiken rechts. Staat op de homepagina en op de contactpagina."""
    kanalen = []
    for letter, naam, waarde, url, onder in (
        ("W", "WhatsApp", "Message us", WA, "Fastest reply"),
        ("E", "Elisabetta", "+39 349 591 8565", "tel:+393495918565", "Call or message"),
        ("A", "Adriano", "+39 348 395 3433", "tel:+393483953433", "Call or message"),
        ("@", "By mail", CONTACT["email"], f"mailto:{CONTACT['email']}", "Write to us"),
    ):
        kanalen.append(C({
            "content_width": "full", "flex_direction": "column", "flex_gap": gap(2),
            "padding": box(14, 16, 14, 16), "border_radius": radius(R),
            "background_background": "classic", "background_color": "rgba(255,255,255,.06)",
            "border_border": "solid", "border_width": radius(1), "border_color": LIJN_DARK,
            "link": link(url, external=url.startswith("http")),
        }, [
            W("heading", dict({"title": naam, "header_size": "span", "title_color": GOUD},
                              **typo(size=11, weight="700", transform="uppercase",
                                     letter_spacing=1.6))),
            W("heading", dict({"title": waarde, "header_size": "span", "title_color": WIT},
                              **typo(size=15, weight="600"))),
            W("heading", dict({"title": onder, "header_size": "span",
                               "title_color": "rgba(238,241,245,.55)"},
                              **typo(size=12, weight="500"))),
        ]))

    form = W("form", {
        "form_name": "Contact",
        "form_fields": [
            {"_id": "name", "field_type": "text", "field_label": "Your name",
             "placeholder": "Your name", "required": "true", "width": "50"},
            {"_id": "email", "field_type": "email", "field_label": "Your email",
             "placeholder": "you@example.com", "required": "true", "width": "50"},
            {"_id": "topic", "field_type": "select", "field_label": "About",
             "field_options": "A foal\nAn embryo\nICSI semen\nA sport horse\nA breeding mare\nSomething else",
             "required": "", "width": "100"},
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
    })

    kop = [eyebrow("Get in touch"), title("Ask us about a horse.", color=WIT),
           para("Write to us and we will get back to you.", color=WIT_75)] if met_kop else []

    binnen = wrap(kop + [row([
        cell([form], 58),
        cell(kanalen, 42, gap_px=10),
    ], gap_px=26)], extra={"flex_gap": gap(0, 22)})

    return C({
        "background_background": "gradient", "background_color": NAVY,
        "background_color_b": DARK,
        "background_gradient_angle": {"unit": "deg", "size": 150, "sizes": []},
        "padding": box(PAD_SECTION, PAD_X, PAD_SECTION, PAD_X),
        "padding_mobile": box(PAD_SECTION_M, PAD_X_M, PAD_SECTION_M, PAD_X_M),
        "flex_direction": "column", "_element_id": "contact",
        "custom_css": (f"selector .elementor-field-group>label{{color:{WIT_75}}}"),
    }, [binnen], is_inner=False)


# ───────────────────────── over ons ──────────────────────────────────────────
def about():
    hero = C({
        "background_background": "classic",
        "background_image": img("assets/img/about-hero.jpg", ""),
        "background_position": "center center", "background_size": "cover",
        "background_overlay_background": "gradient",
        "background_overlay_color": f"rgba({VEIL_TOP}, .78)",
        "background_overlay_color_b": f"rgba({VEIL}, .58)",
        "background_overlay_gradient_angle": {"unit": "deg", "size": 180, "sizes": []},
        "min_height": sz(520), "min_height_mobile": sz(440),
        "padding": box(150, PAD_X, 70, PAD_X),
        "padding_mobile": box(120, PAD_X_M, 50, PAD_X_M),
        "flex_direction": "column", "flex_justify_content": "flex-end",
        "_element_id": "top", "css_classes": "sva-hero",
    }, [wrap([
        eyebrow("About Stud Von Axe"),
        paginakop("From sport to the next generation", color=WIT),
        para("Our mares combine sport and breeding in Italy, where they compete and produce "
             "embryos. Pregnancies are then carried out in Belgium, where the foals are born "
             "and raised, bringing together two countries in one carefully managed breeding "
             "programme.", color=WIT_75, size=17, max_w=700),
    ], extra={"flex_gap": gap(0, 14)})], is_inner=False)

    # Drie foto's die in elkaar overvloeien. Elementor's eigen Slides-widget:
    # hij stopt bij aanwijzen en bij toetsfocus, en hij start niet voor een
    # bezoeker die om minder beweging heeft gevraagd.
    verhaal = section([wrap([row([
        cell([W("slides", {
            "slides": [{"_id": f"s{i}", "background_background": "classic",
                        "background_image": img(p, ""), "background_size": "cover"}
                       for i, p in enumerate(("assets/img/bases-yard.jpg",
                                              "assets/img/intro-foal-star.jpg",
                                              "assets/img/hero-grey.jpg"))],
            "slides_height": sz(440), "navigation": "dots",
            "autoplay": "yes", "autoplay_speed": 5000, "pause_on_hover": "yes",
            "pause_on_interaction": "yes", "transition": "fade",
            "custom_css": f"selector .swiper{{border-radius:{R_LG}px}}",
        })], 46),
        cell([
            eyebrow("How we work"),
            title("Two countries, one programme"),
            para("We do not buy a pedigree and hope. Every mare here was chosen for what her "
                 "family actually produces in sport, not for how the paper reads."),
            para("Every cross begins in Tuscany. Our own team in Lanaken implants the embryo, "
                 "carries the pregnancy and raises the foal until the day it leaves. Nothing "
                 "is handed to a third party halfway."),
            para("We tell a buyer what we see in a horse, the limits as well as the strengths, "
                 "and we sell direct."),
        ], 54, gap_px=14),
    ], gap_px=34, align="center")], gap_px=0)], bg=BG)

    aanbod = section([wrap([
        sec_head("What we offer", "Four ways in", align="center"),
        row([
            aanbodkaart("Lanaken, Belgium", "Foals",
                        "Born and raised in Belgium, out of mares chosen for jumping ability "
                        "and temperament. You collect a horse already on the ground.",
                        "See the foals &rarr;", "/foals/",
                        "assets/img/offer-foal.jpg"),
            aanbodkaart("Frozen or carrying", "Embryos",
                        "Frozen from our own damlines, or already carrying in Lanaken. Every "
                        "cross is made on pedigree and on what the mare has produced.",
                        "See the crosses &rarr;", "/embryos/",
                        "assets/img/offer-embryo.jpg"),
            aanbodkaart("With Avantea, Cremona", "ICSI semen",
                        "Worked with our own mares through OPU and ICSI. The stallions we "
                        "offer are listed with their pedigrees, at fixed prices.",
                        "See the stallions &rarr;", "/icsi-semen/",
                        "assets/img/offer-semen.jpg"),
            aanbodkaart("Sourced and brokered", "Sport horses",
                        "Several of our mares are available to compete or to breed from. We "
                        "also look on a client's behalf, across Europe and as far as America.",
                        "See the horses &rarr;", "/sport-horses/",
                        "assets/img/results-unguessable.jpg"),
        ], gap_px=18),
    ], gap_px=0)], bg=BG_ALT)

    slot = cta_band(
        "Tell us what you are <em>looking for</em>.".replace(
            "<em>", f'<span style="color:{GOUD}">').replace("</em>", "</span>"),
        "A foal on the ground, an embryo, a cross still to be made, or a mare to breed from. "
        "Say what you are after and we will tell you plainly what we have.",
        [btn("goud", "Get in touch", "/contact/"),
         btn("ghostw", "Message on WhatsApp", WA, external=True)])

    return save([hero, verhaal, aanbod, slot, partners()],
                "Stud Von Axe — About us",
                uit("stage-9-about-news-legal", "about.json"), "page")


def aanbodkaart(bovenkop, kop_tekst, tekst, knop, url, foto=None):
    kids = [tegelfoto(foto, kop_tekst, ratio="4/3", radius_px=R_SM)] if foto else []
    return cell(kids + [
        W("heading", dict({"title": bovenkop, "header_size": "span", "title_color": GOUD},
                          **typo(size=11, weight="700", transform="uppercase",
                                 letter_spacing=2.42))),
        W("heading", dict({"title": kop_tekst, "header_size": "h3", "title_color": INK},
                          **typo("typography", SERIF, 21, "400", line_height_em=1.15))),
        para(tekst, size=15),
        btn("ghost", knop, url, klein=True),
    ], 25, gap_px=10, extra={
        "background_background": "classic", "background_color": WIT,
        "border_radius": radius(R), "padding": box(22, 22, 22, 22),
        "border_border": "solid", "border_width": radius(1), "border_color": LIJN,
        "width_tablet": sz(48, "%"),
    })


# ───────────────────────── contact ───────────────────────────────────────────
def contact():
    hero = C({
        "background_background": "classic", "background_color": NAVY,
        "background_image": img("assets/img/hero-contact.jpg", ""),
        "background_position": "center 40%", "background_size": "cover",
        "background_overlay_background": "gradient",
        "background_overlay_color": f"rgba({VEIL_TOP}, .82)",
        "background_overlay_color_b": f"rgba({VEIL}, .66)",
        "background_overlay_gradient_angle": {"unit": "deg", "size": 180, "sizes": []},
        "min_height": sz(420), "min_height_mobile": sz(360),
        "padding": box(150, PAD_X, 64, PAD_X),
        "padding_mobile": box(120, PAD_X_M, 48, PAD_X_M),
        "flex_direction": "column", "flex_justify_content": "flex-end",
        "_element_id": "top", "css_classes": "sva-hero",
    }, [wrap([
        eyebrow("Contact"),
        paginakop("Write to us directly", color=WIT),
        para("There is nobody in between. Elisabetta and Adriano read what comes in and one "
             "of them answers.", color=WIT_75, size=17, max_w=640),
    ], extra={"flex_gap": gap(0, 14)})], is_inner=False)

    # Geen kaartblok. De klant vroeg de Google Maps eraf: het kantoor staat in
    # Castelnuovo Garfagnana, de stal niet, en een kaart die naar het kantoor
    # wijst stuurt bezoekers naar de verkeerde plek.
    plaatsen = section([wrap([
        sec_head("Where we are", "Where to find us",
                 "Every cross begins in Italy and every foal is raised in Belgium. You are "
                 "welcome by appointment: ring first and we will say where to come."),
        # Eén adres, want de echte pagina noemt er één. Er stond hier ook een
        # blok "Belgium" met een zin die ik zelf bedacht had; Lanaken is geen
        # staladres en dat is een staande afspraak: twee landen, één programma,
        # nooit twee stallen.
        row([
            cell([
                W("heading", dict({"title": "Italy", "header_size": "h3", "title_color": INK},
                                  **typo("typography", SERIF, 21, "400"))),
                W("heading", dict({"title": "Castelnuovo Garfagnana", "header_size": "span",
                                   "title_color": GOUD},
                                  **typo(size=11, weight="700", transform="uppercase",
                                         letter_spacing=2.42))),
                para(f"{CONTACT['bedrijf']}<br>Via per Arni<br>"
                     f"55032 Castelnuovo Garfagnana (LU)<br>Italy", size=15),
                para("This is the office, not the yard. No horse stands here. Ring us before "
                     "you set off and we will tell you where the one you want to see is.",
                     size=14, color=GRIJS),
            ], 60, gap_px=8),
        ], gap_px=26),
    ], gap_px=0)], bg=BG)

    return save([hero, contactkaart(met_kop=True), plaatsen, partners()],
                "Stud Von Axe — Contact",
                uit("stage-8-contact", "contact.json"), "page")


# ───────────────────────── privacy en voorwaarden ────────────────────────────
# De tekst komt uit elementor/juridisch.json, dat elementor/lees-juridisch.py
# letterlijk van de statische pagina's leest. Niet overtypen en niet
# samenvatten: dit is juridische tekst die de klant heeft goedgekeurd, en één
# letter anders is een andere belofte. De eerste versie van dit sjabloon droeg
# een plaatshouder met "de tekst komt tijdens de bouw over", en dat is werk
# doorschuiven naar iemand die de tekst niet kent.
with open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                       "juridisch.json"), encoding="utf-8") as _f:
    JURIDISCH = json.load(_f)


def juridisch(titel, bestand, sleutel, bovenkop, onder):
    d = JURIDISCH[sleutel]

    hero = C({
        "background_background": "classic", "background_color": NAVY,
        "padding": box(150, PAD_X, 60, PAD_X),
        "padding_mobile": box(115, PAD_X_M, 44, PAD_X_M),
        "flex_direction": "column", "_element_id": "top", "css_classes": "sva-hero",
    }, [wrap([eyebrow(bovenkop), paginakop(titel, color=WIT),
              para(onder, color=WIT_75, size=16, max_w=640)],
             extra={"flex_gap": gap(0, 12)})], is_inner=False)

    # de inhoudsopgave, uit dezelfde bron als de secties, dus hij kan niet
    # verwijzen naar een kop die er niet is
    toc = W("text-editor", dict({
        "editor": "<p><strong>On this page</strong></p><ol data-sva-toc>"
                  + "".join(f'<li><a href="#{x["anker"]}">{x["titel"]}</a></li>'
                            for x in d["secties"])
                  + "</ol>"
                  + (f'<p class="sva-stamp">{d["stempel"]}</p>' if d["stempel"] else ""),
        "text_color": INK_SOFT,
        "custom_css": ("selector ol{list-style:none;padding:0;counter-reset:s}"
                       "selector li{counter-increment:s;margin:0 0 .5rem}"
                       'selector li::before{content:counter(s,decimal-leading-zero) "  ";'
                       f"color:{GOUD};font-weight:700}}"
                       f"selector .sva-stamp{{margin-top:1.4rem;font-size:12px;color:{GRIJS}}}"),
    }, **typo(size=14, weight="500", line_height_em=1.6)))

    # elke sectie een eigen kop met een anker, zodat de inhoudsopgave werkt en
    # de scrollmarkering iets heeft om op te wijzen
    kolom = []
    for i, x in enumerate(d["secties"], 1):
        kolom.append(W("heading", dict({
            "title": f"{i:02d}", "header_size": "span", "title_color": GOUD,
        }, **typo(size=11, weight="700", letter_spacing=2.42))))
        kolom.append(W("heading", dict({
            "title": x["titel"], "header_size": "h2", "title_color": INK,
            "_element_id": x["anker"],
        }, **typo("typography", SERIF, 24, "400", line_height_em=1.15))))
        kolom.append(W("text-editor", dict({
            "editor": x["html"], "text_color": INK,
            "custom_css": "selector{max-width:70ch}selector li{margin:0 0 .4rem}",
        }, **typo(size=17, weight="400", line_height_em=1.75))))

    inhoud = section([wrap([row([
        cell([toc], 28, extra={"custom_css": "selector{position:sticky;top:112px;"
                                             "align-self:start}"}),
        cell(kolom, 72, gap_px=10),
    ], gap_px=34, align="stretch")], gap_px=0)], bg=BG)

    return save([hero, inhoud], f"Stud Von Axe — {titel}",
                uit("stage-9-about-news-legal", bestand), "page")


if __name__ == "__main__":
    paden = [
        home(), contact(), about(),
        # Kop en onderregel woord voor woord van de statische pagina.
        juridisch("What happens with your details", "privacy.json", "privacy", "Privacy",
                  "This site collects nothing about you by itself. What you send us by mail "
                  "we keep only to answer you."),
        juridisch("The ground an order stands on", "terms.json", "terms", "Terms",
                  "The terms an order for ICSI semen, an embryo or a horse is made under. "
                  "The headings are here; most of the wording is the owners' to write."),
    ]
    for p in paden:
        print(f"  {os.path.basename(p)}")
