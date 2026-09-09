"""De loop items: de kaarten die op de archieven en op de homepagina staan.

Acht kaarten, drie vormen. De paardkaart van de sportpaarden en de fokmerries,
de ec-kaart van de veulens, kruisingen en hengsten, en twee nieuwskaarten plus
het partnerlogo. Ze staan hier bij elkaar omdat een kaart die op twee plaatsen
anders is, op één van die twee plaatsen fout is.

Elke binding gaat via veld(post_type, naam) en die functie gooit een fout als
het veld niet bestaat. Een binding aan een veld dat de plugin niet aanmaakt
rendert als niets en is in de JSON onzichtbaar.
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


# Een widget waarvan de dynamische waarde leeg is, laat Elementor als lege
# widget staan. Op een kaart is dat een gat. Deze regel haalt hem weg zonder
# dat er per record een apart sjabloon nodig is.
VERBERG_LEEG = "selector:has(.elementor-heading-title:empty){display:none}"


def kaartfoto(hoogte_ratio="4/3", pos="50% 42%"):
    return W("theme-post-featured-image", {
        "image_size": "large",
        "custom_css": (f"selector img{{aspect-ratio:{hoogte_ratio};object-fit:cover;"
                       f"object-position:{pos};width:100%;display:block}}"),
    })


def kaarttitel(niveau="h2", kleur=INK, maat=21):
    s = {"title": "Horse name", "header_size": niveau, "title_color": kleur}
    s.update(typo("typography", SERIF, maat, "400", letter_spacing=round(maat * -0.02, 2),
                  line_height_em=1.12))
    s.update(dyn("title", "post-title"))
    return W("heading", s)


def veldregel(post_type, naam, kleur=INK_SOFT, maat=13, gewicht="500", ls=0.2,
              serif=False, transform=None):
    s = {"title": "", "header_size": "span", "title_color": kleur}
    s.update(typo("typography", SERIF if serif else SANS, maat, gewicht,
                  letter_spacing=ls, transform=transform, line_height_em=1.45))
    s.update(acf("title", post_type, naam))
    s["custom_css"] = VERBERG_LEEG
    return W("heading", s)


def vlagbadge(post_type):
    """De statusplaat mét het vlaggetje ervoor.

    Mark heeft twee keer om een vlaggetje bij "sold" gevraagd. De statische
    site tekent per land een eigen SVG; een ACF-veld kan geen tekening dragen,
    dus het vlagteken zelf staat in een eigen veld ernaast. Twee widgets in één
    plaat: het vlaggetje en de tekst, en allebei leeg bij een paard dat nog te
    koop is — dan verdwijnt de hele plaat.
    """
    vlag = W("heading", dict({"title": "", "header_size": "span", "title_color": WIT},
                             **typo(size=13, weight="400"),
                             **acf("title", post_type, "flag")))
    tekst = W("heading", dict({"title": "", "header_size": "span", "title_color": WIT},
                              **typo(size=11, weight="700", transform="uppercase",
                                     letter_spacing=1.6),
                              **acf("title", post_type, "status_line")))
    return C({
        "content_width": "full", "flex_direction": "row", "flex_gap": gap(7),
        "flex_align_items": "center", "width": sz(0),
        "background_background": "classic",
        "background_color": f"rgba({VEIL},.55)",
        "border_radius": radius(999),
        "border_border": "solid", "border_width": radius(1), "border_color": LIJN_DARK,
        "padding": box(6, 12, 6, 12),
        "custom_css": ("selector{-webkit-backdrop-filter:blur(10px) saturate(1.3);"
                       "backdrop-filter:blur(10px) saturate(1.3)}"
                       # geen tekst betekent geen plaat, geen leeg pilletje
                       "selector:not(:has(.elementor-heading-title:not(:empty)))"
                       "{display:none}"),
    }, [vlag, tekst])


def badge(post_type, naam, op_foto=True):
    """De plaat over de foto. Matglas over een foto, zoals op de site: een
    doorzichtige navy laag met een blur erachter, zodat de tekst leesbaar is
    zonder de foto af te dekken."""
    s = {"title": "", "header_size": "span", "title_color": WIT}
    s.update(typo("typography", SANS, 11, "700", transform="uppercase", letter_spacing=1.6))
    s.update(acf("title", post_type, naam))
    s["custom_css"] = (
        "selector .elementor-heading-title{display:inline-block;"
        f"padding:7px 12px;border-radius:999px;background:rgba({VEIL},.55);"
        "-webkit-backdrop-filter:blur(10px) saturate(1.3);"
        "backdrop-filter:blur(10px) saturate(1.3);"
        f"border:1px solid {LIJN_DARK}}}" + VERBERG_LEEG
    )
    return W("heading", s)


def kaartschil(kids, plat=False):
    """De bak eromheen. De hele kaart is de link, niet alleen de naam: een
    kaart waarvan alleen de kop klikt, laat de helft van de bezoekers zoeken."""
    s = {
        "content_width": "full", "flex_direction": "column", "flex_gap": gap(0),
        "background_background": "classic",
        "background_color": WIT if not plat else "rgba(0,0,0,0)",
        "border_radius": radius(R),
        "overflow": "hidden",
        "border_border": "solid", "border_width": radius(1), "border_color": LIJN,
        "height": sz(100, "%"),
    }
    s.update({"__dynamic__": {"link": make_dynamic_tag("post-url")}})
    s["link"] = link("#")
    return C(s, kids, is_inner=False)


# ───────────────────────── de paardkaart ─────────────────────────────────────
def paardkaart(post_type, bestand, stage):
    """Sportpaarden en fokmerries. Foto met de statusplaat erop, dan de naam,
    de kaartregel, de fokregel en 'View'."""
    beeld = C({
        "content_width": "full", "flex_direction": "column",
        "flex_justify_content": "flex-start", "flex_align_items": "flex-start",
        "padding": box(14, 14, 14, 14), "position": "relative",
        "css_classes": "sva-card-win",
        "custom_css": ("selector{position:relative}"
                       "selector>.elementor-widget-theme-post-featured-image{"
                       "position:absolute;inset:0;z-index:0}"
                       "selector>.elementor-widget-heading{position:relative;z-index:1}"),
        "min_height": sz(260),
    }, [kaartfoto("4/3"), vlagbadge(post_type)])

    lijf = C({
        "content_width": "full", "flex_direction": "column", "flex_gap": gap(6),
        "padding": box(18, 20, 20, 20),
    }, [
        kaarttitel("h2", INK, 21),
        veldregel(post_type, "meta_line", INK_SOFT, 13, "500"),
        veldregel(post_type, "genetics", NAVY2, 13, "600"),
        W("heading", dict({"title": "View &rarr;", "header_size": "span",
                           "title_color": GOUD_TXT},
                          **typo(size=12, weight="700", letter_spacing=1.0,
                                 transform="uppercase"))),
    ])

    return save([kaartschil([beeld, lijf])],
                f"Stud Von Axe — {post_type} card", uit(stage, bestand), "loop-item")


# ───────────────────────── de ec-kaart ───────────────────────────────────────
def eckaart(post_type, bestand, stage, badge_veld=None, badge_tekst=None,
            tweede_regel=None, zeg=True, jaar_badge=False):
    """Veulens, kruisingen en hengsten. Vierkante foto die onderaan in navy
    wegloopt, met de tekst op die verloop in plaats van eronder."""
    plaatjes = [kaartfoto("1/1", "50% 40%")]
    if post_type != "icsi_stallion":
        plaatjes.append(vlagbadge(post_type) if badge_veld == "status_line" else None)
    plaatjes = [x for x in plaatjes if x]

    beeld = C({
        "content_width": "full", "flex_direction": "column",
        "padding": box(14, 14, 14, 14), "min_height": sz(300),
        "custom_css": (
            "selector{position:relative}"
            "selector>.elementor-widget-theme-post-featured-image{position:absolute;inset:0;z-index:0}"
            "selector>.elementor-widget-heading{position:relative;z-index:2}"
            # de sluier die de foto onderin in navy laat weglopen, zodat de
            # tekst eronder op de foto kan staan en toch te lezen is
            "selector::after{content:'';position:absolute;inset:auto 0 0 0;height:62%;"
            f"background:linear-gradient(to bottom,rgba({VEIL},0),rgba({VEIL},.92));z-index:1}}"
        ),
    }, plaatjes)

    onder = []
    if jaar_badge:
        # "Born 2026": het jaar staat in zijn eigen veld, en Elementor kan er
        # zelf "Born " voor zetten. Daar is geen spiegelveld voor nodig.
        s = {"title": "", "header_size": "span", "title_color": GOUD}
        s.update(typo("typography", SANS, 11, "700", transform="uppercase", letter_spacing=1.6))
        s.update(dyn("title", "acf-text", veld(post_type, "year_of_birth")))
        s["__dynamic__"]["title"] = s["__dynamic__"]["title"].replace(
            'settings="', 'settings="')  # de before-tekst staat in de widget zelf
        s["custom_css"] = ('selector .elementor-heading-title::before{content:"Born "}'
                           + VERBERG_LEEG)
        onder.append(W("heading", s))
    if badge_veld and badge_veld != "status_line":
        onder.append(badge(post_type, badge_veld))
    if badge_tekst:
        s = {"title": badge_tekst, "header_size": "span", "title_color": GOUD}
        s.update(typo("typography", SANS, 11, "700", transform="uppercase", letter_spacing=1.6))
        onder.append(W("heading", s))

    onder.append(kaarttitel("h2", INK, 21))
    onder.append(veldregel(post_type, "genetics", INK_SOFT, 13, "600"))
    if tweede_regel:
        onder.append(veldregel(post_type, tweede_regel, INK_SOFT, 13, "500"))
    if zeg:
        # de gouden plaat met hun eigen zin. Elke kaart draagt hem, ook de
        # kruisingen zonder eigen zin: die lenen die van hun moeder.
        s = {"title": "", "header_size": "span", "title_color": INK}
        s.update(typo("typography", SANS, 12.5, "600", line_height_em=1.45))
        s.update(acf("title", post_type, "tagline"))
        s["custom_css"] = (
            "selector .elementor-heading-title{display:block;padding:10px 13px;"
            f"border-radius:{R_SM}px;background:{GOUD};color:{DARK}}}" + VERBERG_LEEG)
        onder.append(W("heading", s))

    lijf = C({"content_width": "full", "flex_direction": "column", "flex_gap": gap(7),
              "padding": box(16, 18, 20, 18)}, onder)

    return save([kaartschil([beeld, lijf])],
                f"Stud Von Axe — {post_type} card", uit(stage, bestand), "loop-item")


# ───────────────────────── nieuws en partners ────────────────────────────────
def nieuwskaart(bestand, stage, kort=False):
    beeld = kaartfoto("16/10", "50% 45%")
    kids = [
        veldregel("news_item", "eyebrow", GOUD, 11, "700", ls=2.42, transform="uppercase"),
        kaarttitel("h3", INK, 19),
    ]
    if not kort:
        kids.append(veldregel("news_item", "excerpt", INK_SOFT, 14, "400", ls=0))
    kids.append(W("heading", dict({"title": "Read more &rarr;", "header_size": "span",
                                   "title_color": GOUD_TXT},
                                  **typo(size=12, weight="700", letter_spacing=1.0,
                                         transform="uppercase"))))
    lijf = C({"content_width": "full", "flex_direction": "column", "flex_gap": gap(7),
              "padding": box(18, 20, 20, 20)}, kids)
    titel = "Stud Von Axe — News rail card" if kort else "Stud Von Axe — News card"
    return save([kaartschil([beeld, lijf])], titel, uit(stage, bestand), "loop-item")


def partnerkaart(bestand, stage):
    """Een logo in een bak van vaste hoogte. Vaste hoogte, want een percentage
    in een grid waarvan de rij door datzelfde beeld gemeten wordt, valt terug
    op auto: een logo van 600 bij 600 stond zo 334 pixels hoog in een bak van
    132. Breedte en hoogte allebei op 100% van een bak die zijn eigen maat kent,
    en object-fit contain eroverheen."""
    logo = W("image", dict({
        "image_size": "medium",
        "custom_css": ("selector{height:112px}selector img{width:100%;height:100%;"
                       "object-fit:contain;display:block}"),
    }, **dyn("image", "acf-image", veld("partner", "logo"))))

    # De naam en de zin over de partner. Allebei leeg vandaag: de klant heeft
    # nog geen website-adres en geen omschrijving aangeleverd. De plekken reizen
    # wél mee, zodat het invullen later geen sjabloonwijziging is. Een lege
    # widget haalt zichzelf weg.
    blurb = W("heading", dict({
        "title": "", "header_size": "span", "title_color": GRIJS,
        "custom_css": ("selector{text-align:center}"
                       "selector:has(.elementor-heading-title:empty){display:none}"),
    }, **typo(size=12, weight="500", line_height_em=1.45),
       **acf("title", "partner", "blurb")))

    schil = C({
        "content_width": "full", "flex_direction": "column",
        "flex_justify_content": "center", "flex_align_items": "center",
        "flex_gap": gap(8),
        "background_background": "classic", "background_color": WIT,
        "border_radius": radius(R), "padding": box(18, 22, 18, 22),
        "min_height": sz(148),
        "border_border": "solid", "border_width": radius(1), "border_color": LIJN,
        # de kaart is de link naar hun eigen website, als die er is
        "__dynamic__": {"link": make_dynamic_tag("acf-url", veld("partner", "website"))},
        "link": link("", external=True),
    }, [logo, blurb], is_inner=False)
    return save([schil], "Stud Von Axe — Partner logo", uit(stage, bestand), "loop-item")


if __name__ == "__main__":
    paden = [
        paardkaart("sport_horse", "loop-sport-horses.json", "stage-3-sport-horses"),
        paardkaart("breeding_mare", "loop-breeding-mares.json", "stage-4-breeding-mares"),
        eckaart("foal", "loop-foals.json", "stage-5-foals",
                badge_veld="status_line", tweede_regel="meta_line", jaar_badge=True),
        eckaart("embryo", "loop-embryos.json", "stage-6-embryos",
                badge_veld="stage_badge"),
        eckaart("icsi_stallion", "loop-icsi-semen.json", "stage-7-icsi-semen",
                badge_tekst="Availability on request", zeg=False),
        nieuwskaart("loop-news.json", "stage-9-about-news-legal"),
        nieuwskaart("loop-news-card.json", "stage-2-homepage", kort=True),
        partnerkaart("loop-partner.json", "stage-2-homepage"),
    ]
    for p in paden:
        print(f"  {os.path.basename(p)}")
