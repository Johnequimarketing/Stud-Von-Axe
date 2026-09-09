"""Stage 1, de schil: header, footer en de 404.

Drie sjablonen die op elke pagina staan, dus alles wat hier scheef staat, staat
122 keer scheef. De header is het lastigste stuk van de hele bouw: hij zit in de
hero, is doorzichtig, en slaat om zodra de onderrand van de hero de balk raakt.
Dat laatste is geen Elementor-instelling maar vijftien regels eigen code, en die
worden hier meegeschreven zodat ze niet los van het sjabloon kunnen raken.
"""
import sys, os, json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib_axe import *          # noqa: F401,F403
from lib_axe import stage_folder

WORTEL = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UIT = os.path.join(WORTEL, "wordpress-elementor", stage_folder("stage-1-shell"), "templates")
os.makedirs(UIT, exist_ok=True)

LOGO_DONKER = "assets/logo/logo-horizontal-ondark.webp"
LOGO_LICHT  = "assets/logo/logo-plain-onlight.png"
LOGO_ICOON  = "assets/logo/icon-ondark.png"

WA = "https://wa.me/393495918565"


# ───────────────────────── header ────────────────────────────────────────────
def navmenu(menu_naam, uitlijning, mobiel=False):
    """Een Nav Menu. De site heeft geen één menu maar drie: links van de
    merknaam, rechts ervan, en één lange lijst voor de lade. Dat is geen
    versiering — de merknaam staat in het midden en splitst de balk."""
    s = {
        "menu": menu_naam,
        "layout": "dropdown" if mobiel else "horizontal",
        "align_items": uitlijning,
        "pointer": "none",
        "color_menu_item": WIT,
        "color_menu_item_hover": GOUD,
        "color_menu_item_active": GOUD,
        "space_between": sz(26),
    }
    s.update(typo("menu_typography", SANS, 13, "600", letter_spacing=0.6))
    if mobiel:
        s.update({
            "toggle": "burger",
            "toggle_size": sz(22),
            "toggle_color": WIT,
            "dropdown_background_color": DARK,
            "dropdown_color_menu_item": WIT,
            "dropdown_item_padding": box(14, 20, 14, 20),
            "full_width": "stretch",
        })
    return W("nav-menu", s)


def whatsapp_knop():
    """Rond, met het merkicoon. Zo antwoorden deze twee werkelijk, dus het
    staat op de balk naast het formulier en niet onderaan de contactpagina."""
    return W("icon", {
        "selected_icon": icon("fa-whatsapp", "fa-brands"),
        "view": "framed", "shape": "circle",
        "primary_color": WIT, "secondary_color": "rgba(255,255,255,.28)",
        "size": sz(16), "icon_padding": sz(9),
        "link": link(WA, external=True),
        "_element_id": "sva-wa",
    })


def header():
    logo_donker = W("theme-site-logo", {
        "image": img(LOGO_DONKER, "Von Axe, breeding and horse trading"),
        "align": "center", "width": sz(190),
        "_element_id": "sva-logo-ondark",
        "custom_css": "selector img{filter:drop-shadow(0 2px 10px rgba(10,21,38,.45))}",
    })
    # Het tweede bestand, voor als de balk op ivoor staat. Twee bestanden, geen
    # filter: de merken zijn van de klant en worden niet nagetekend of omgekleurd.
    logo_licht = W("image", {
        "image": img(LOGO_LICHT, ""),
        "align": "center", "width": sz(190),
        "_element_id": "sva-logo-onlight",
        "custom_css": "selector{position:absolute;inset:0;display:grid;place-items:center;opacity:0;transition:opacity .3s}",
    })

    links = cell([navmenu("Header left", "start")], 34,
                 extra={"flex_justify_content": "flex-start",
                        "hide_tablet": "hidden", "hide_mobile": "hidden"})
    midden = cell([logo_donker, logo_licht], 32,
                  extra={"flex_justify_content": "center", "flex_align_items": "center",
                         "position": "relative"})
    rechts = cell([
        navmenu("Header right", "end"),
        whatsapp_knop(),
        btn("goud", "Contact us", "/contact/", klein=True),
    ], 34, direction="row", gap_px=14,
        extra={"flex_justify_content": "flex-end", "flex_align_items": "center",
               "hide_tablet": "hidden", "hide_mobile": "hidden"})

    lade = cell([navmenu("Mobile menu", "start", mobiel=True)], 34,
                extra={"flex_justify_content": "flex-start",
                       "hide_desktop": "hidden"})

    rij = C({
        "content_width": "full", "width": sz(MAX_W), "flex_direction": "row",
        "flex_align_items": "center", "flex_justify_content": "space-between",
        "flex_gap": gap(18), "flex_wrap": "nowrap",
        "margin": {"unit": "px", "top": "0", "right": "auto", "bottom": "0",
                   "left": "auto", "isLinked": False},
    }, [links, lade, midden, rechts])

    bar = C({
        "background_background": "classic",
        "background_color": "rgba(0,0,0,0)",
        "padding": box(18, PAD_X, 18, PAD_X),
        "padding_mobile": box(12, PAD_X_M, 12, PAD_X_M),
        "flex_direction": "column",
        "position": "fixed", "_offset_y": sz(0), "z_index": 40,
        "width": sz(100, "%"),
        "_element_id": "sva-header",
        # De balk gaat door onderaan de sluier: de hero begint bovenaan de
        # pagina en de balk staat erin, niet erboven.
        "custom_css": (
            "selector{transition:background-color .3s,box-shadow .3s}"
            "selector.is-pinned{background-color:" + BG + ";"
            "box-shadow:0 1px 0 " + LIJN + "}"
            "selector.is-pinned #sva-logo-ondark{opacity:0}"
            "selector.is-pinned #sva-logo-onlight{opacity:1}"
            "selector.is-pinned .elementor-nav-menu a{color:" + INK + " !important;"
            "text-shadow:none}"
            "selector.is-pinned #sva-wa{color:" + INK + "}"
            "selector .elementor-nav-menu a{text-shadow:0 1px 8px rgba(10,21,38,.55)}"
        ),
    }, [rij], is_inner=False)

    return save([bar], "Stud Von Axe — Header", os.path.join(UIT, "header.json"), "header")


# de vijftien regels die Elementor niet heeft
CUSTOM_CODE_HEADER = """<!-- Stud Von Axe — de kopbalk die omslaat op de onderrand van de hero.

     Elementor's sticky header meet een scrollafstand. Deze meet de onderrand
     van de hero zelf, want de balk zit in de hero en moet precies omslaan waar
     de foto ophoudt. Een vaste afstand klopt op de homepagina niet en op een
     archief evenmin, want die hero's zijn niet even hoog.

     Plaatsen: Elementor -> Custom Code -> Add New -> Location: </body>.
     Voorwaarde: Entire Site. -->
<script>
(function(){
  var hd = document.getElementById('sva-header');
  if (!hd) return;
  var hero = document.querySelector('.sva-hero');
  function sync(){
    if (!hero) { hd.classList.add('is-pinned'); return; }
    hd.classList.toggle('is-pinned',
      hero.getBoundingClientRect().bottom <= hd.offsetHeight + 8);
  }
  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  addEventListener('load', sync);
  sync();
})();
</script>
"""


# ───────────────────────── footer ────────────────────────────────────────────
def kolom(kop, regels, breedte=22):
    kids = [W("heading", dict({"title": kop, "header_size": "h2", "title_color": GOUD},
                              **typo(size=11, weight="700", transform="uppercase",
                                     letter_spacing=2.42)))]
    def li(tekst, url):
        extern = ' target="_blank" rel="noopener"' if url.startswith("http") else ""
        return f'<li><a href="{url}"{extern}>{tekst}</a></li>'

    kids.append(W("text-editor", dict({
        "editor": "<ul>" + "".join(li(t, u) for t, u in regels) + "</ul>",
        "text_color": WIT_75,
    }, **typo(size=15, weight="400", line_height_em=2.0))))
    return cell(kids, breedte, gap_px=14)


def footer():
    merk = cell([
        W("image", {"image": img(LOGO_DONKER, "Von Axe, breeding and horse trading"),
                    "align": "left", "width": sz(190),
                    "link_to": "custom", "link": link("/")}),
    ], 30, gap_px=16)

    navigeren = kolom("Navigate", [
        ("Sport horses", "/sport-horses/"), ("Breeding mares", "/breeding-mares/"),
        ("Foals", "/foals/"), ("Embryos", "/embryos/"), ("ICSI semen", "/icsi-semen/"),
        ("About us", "/about/"), ("News", "/news/"), ("Contact", "/contact/"),
    ])
    contact = kolom("Contact", [
        (CONTACT["email"], f"mailto:{CONTACT['email']}"),
        ("Elisabetta &#9743; +39 349 591 8565", "tel:+393495918565"),
        ("Adriano &#9743; +39 348 395 3433", "tel:+393483953433"),
    ])
    volgen = kolom("Follow", [
        ("Instagram &#8599;", "https://instagram.com/studvonaxe"),
        ("Facebook &#8599;", "https://facebook.com/StudVonAxe"),
        ("YouTube &#8599;", "https://youtube.com/channel/UCSw5nRpEP1NTAkQHyrfJZOg"),
    ])

    boven = wrap([row([merk, navigeren, contact, volgen], gap_px=32)], extra={"z_index": 2})

    streep = W("divider", {"color": LIJN_DARK, "weight": sz(1), "gap": sz(28)})

    onder = wrap([row([
        cell([W("text-editor", dict({
            "editor": ('<p>&#169; 2026 Von Axe. All rights reserved. '
                       '<span>Made by <a href="https://equimarketing.com" target="_blank" '
                       'rel="noopener">EquiMarketing</a></span></p>'),
            "text_color": WIT_75}, **typo(size=14, weight="400")))], 60),
        cell([W("text-editor", dict({
            "editor": ('<p><a href="/privacy/">Privacy policy</a> &nbsp; '
                       '<a href="/terms/">Terms and conditions</a></p>'),
            "text_color": WIT_75, "align": "right"}, **typo(size=14, weight="400")))], 40,
            extra={"flex_align_items": "flex-end"}),
    ], gap_px=18)], extra={"z_index": 2})

    # De registratieregel. Een Italiaanse vennootschap moet haar naam, zetel en
    # btw-nummer tonen waar een bezoeker ze kan vinden. Woord voor woord zoals
    # de klant hem gaf: Via per Arni draagt geen huisnummer, en dat klopt.
    registratie = wrap([W("text-editor", dict({
        "editor": (f"<p>{CONTACT['bedrijf']} &middot; {CONTACT['adres']} "
                   f"&middot; P. IVA {CONTACT['btw']}</p>"),
        "text_color": "rgba(238,241,245,.55)", "align": "center"},
        **typo(size=13, weight="400")))], extra={"z_index": 2})

    # De taalkiezer. Vier labels, geen links — er zijn nog geen vertalingen en
    # er is nog geen vertaalplugin gekozen. Hij staat er omdat hij op de
    # statische site ook staat; hij hoort niet aangesloten te worden.
    taal = wrap([W("text-editor", dict({
        "editor": ('<p><span aria-current="true">English</span> &middot; '
                   '<span>Italiano</span> &middot; <span>Fran&ccedil;ais</span> &middot; '
                   '<span>Deutsch</span></p>'),
        "text_color": "rgba(238,241,245,.42)", "align": "center"},
        **typo(size=12, weight="500", letter_spacing=0.6)))], extra={"z_index": 2})

    sec = C({
        "background_background": "classic",
        "background_color": DARK,
        "background_overlay_background": "classic",
        "background_overlay_image": img(LOGO_ICOON, ""),
        "background_overlay_position": "center right",
        "background_overlay_repeat": "no-repeat",
        "background_overlay_size": "contain",
        "background_overlay_opacity": {"unit": "px", "size": 0.05, "sizes": []},
        "padding": box(72, PAD_X, 40, PAD_X),
        "padding_mobile": box(56, PAD_X_M, 32, PAD_X_M),
        "flex_direction": "column", "flex_gap": gap(0, 26),
        "overflow": "hidden",
    }, [boven, streep, onder, registratie, taal], is_inner=False)

    return save([sec], "Stud Von Axe — Footer", os.path.join(UIT, "footer.json"), "footer")


# ───────────────────────── 404 ───────────────────────────────────────────────
def notfound():
    binnen = wrap([
        # Hun eigen woorden, van 404.html. Er stond "This page has left the
        # yard" en dat had ik zelf bedacht.
        eyebrow("Page not found", align="center"),
        paginakop("That page is not here", color=WIT, align="center"),
        para("Either it never was, or it has moved while this site was being rebuilt. "
             "Everything the stud has is one of these.",
             color=WIT_75, align="center", max_w=560),
        C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(10),
           "flex_wrap": "wrap", "flex_justify_content": "center",
           "padding": box(14, 0, 0, 0)}, [
            btn("goud", "Home &rarr;", "/"),
            btn("ghostw", "Sport horses", "/sport-horses/"),
            btn("ghostw", "Breeding mares", "/breeding-mares/"),
            btn("ghostw", "Foals", "/foals/"),
            btn("ghostw", "Embryos", "/embryos/"),
            btn("ghostw", "ICSI semen", "/icsi-semen/"),
        ]),
    ], extra={"flex_align_items": "center", "text_align": "center"})

    sec = C({
        "background_background": "classic",
        "background_image": img("assets/img/arch-foals.jpg", ""),
        "background_position": "center center", "background_size": "cover",
        "background_overlay_background": "classic",
        "background_overlay_color": f"rgba({VEIL}, .82)",
        "min_height": sz(680), "min_height_mobile": sz(560),
        "padding": box(160, PAD_X, 110, PAD_X),
        "padding_mobile": box(120, PAD_X_M, 80, PAD_X_M),
        "flex_direction": "column", "flex_justify_content": "center",
        "_element_id": "top",
        "css_classes": "sva-hero",
    }, [binnen], is_inner=False)

    return save([sec], "Stud Von Axe — 404", os.path.join(UIT, "404.json"), "single")


if __name__ == "__main__":
    for pad in (header(), footer(), notfound()):
        print(f"  {os.path.basename(pad)}")
    with open(os.path.join(UIT, "custom-code-header.txt"), "w", encoding="utf-8") as f:
        f.write(CUSTOM_CODE_HEADER)
    print("  custom-code-header.txt")
