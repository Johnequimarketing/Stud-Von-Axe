"""Stud Von Axe — de gedeelde bouwer van Elementor-JSON.

Overgenomen uit lib_kleef.py, dat zelf uit lib_gugler.py en Stal 104 komt.
Alles onder de tokens is projectonafhankelijk en staat er letterlijk zoals het
daar stond: de sleutelvolgorde die een echte Elementor-export heeft, de
dynamische ACF-tags, de loop grids en de responsieve instellingen. Vervangen
zijn de tokens, de contactgegevens, de knopvarianten en de ACF-sleutels.

De ACF-sleutels worden niet hier opgeschreven maar uit elementor/acf.json
gelezen, dat door elementor/dump-acf.php uit de plugin zelf komt. De sleutels
worden in PHP samengesteld ('field_sva_' . $prefix . '_' . $naam), dus een
regex over de broncode kan ze niet eerlijk lezen — en precies dat sloeg bij de
vorige bouw een veld over.

Elk bestand dat hier geschreven wordt gaat langs elementor/validator.py voordat
het de deur uit gaat.
"""
from collections import OrderedDict
import secrets, json, os, urllib.parse, re

BASE_URL = "https://stud-von-axe-ten.vercel.app"

# ───────────────────────── tokens, uit :root in index.html ──────────────────
# Er is geen zwart in dit palet. Elke donkere behandeling is navy.
BG        = "#faf7f2"        # --color-base
BG_ALT    = "#f1ebe0"        # --color-base-alt
INK       = "#14202e"        # --color-ink
INK_SOFT  = "#4d5761"        # --color-ink-soft
GRIJS     = "#4d5761"
DARK      = "#0a1526"        # --color-navy-deep
NAVY      = "#0d1d36"        # --color-navy
NAVY2     = "#2c4468"        # --color-navy-soft
GOUD      = "#b59148"        # --color-gold
GOUD_TXT  = "#8a6d2f"        # goud donker genoeg om als tekst op licht te lezen
GOUD_SOFT = "#c9a86a"        # --color-gold-lift, benaderd in vaste hex
WIT       = "#ffffff"
LIJN      = "rgba(20,32,46,.12)"       # --color-line
LIJN_DARK = "rgba(255,255,255,.17)"    # --color-line-invert
WIT_75    = "rgba(238,241,245,.75)"    # --color-ink-invert op 75%

# de sluier waar elke hero op rust
VEIL      = "10, 21, 38"     # --veil-rgb
VEIL_TOP  = "13, 29, 54"     # --veil-top-rgb

SERIF = "Fraunces"
SANS  = "Manrope"

# de stylesheet rekent met clamp(); Elementor wil vaste pixels, want het kit zet
# de wortelgrootte. Elke clamp is hier omgezet naar drie vaste maten.
R_SM, R, R_LG = 10, 18, 26   # --card-radius 18, --plate-radius 26
MAX_W = 1280                 # --wrap
PAD_X = 40
PAD_X_M = 20

PAD_SECTION = 88             # --sec-full op zijn breedste clamp
PAD_SECTION_M = 56
PAD_BAND = 72

CONTACT = {
    "bedrijf": "Stud Von Axe SRL",
    "email": "studvonaxe@gmail.com",
    "adres": "Via per Arni, 55032 Castelnuovo Garfagnana (LU), Italy",
    "btw": "IT02519980466",
}

# ───────────────────────── core helpers ──────────────────────────────────────
def uid():
    return secrets.token_hex(4)


def C(settings, elements, is_inner=True):
    """Container. Key order: id, settings, elements, isInner, elType.

    A top level container must not carry content_width: Elementor sizes those
    itself and the validator rejects it. Rather than remembering that at every
    call site, it is stripped here.
    """
    if not is_inner:
        settings = {k: v for k, v in settings.items() if k != "content_width"}
    return OrderedDict([
        ("id", uid()), ("settings", settings), ("elements", elements),
        ("isInner", is_inner), ("elType", "container"),
    ])


def W(widget_type, settings, elements=None):
    """Widget. Key order: id, settings, elements, isInner, widgetType, elType."""
    return OrderedDict([
        ("id", uid()), ("settings", settings), ("elements", elements or []),
        ("isInner", False), ("widgetType", widget_type), ("elType", "widget"),
    ])


def sz(size, unit="px"):
    return {"unit": unit, "size": size, "sizes": []}


def box(t, r, b, l, unit="px"):
    return {"unit": unit, "top": str(t), "right": str(r), "bottom": str(b), "left": str(l),
            "isLinked": t == r == b == l}


def radius(v):
    return box(v, v, v, v)


def gap(v, row=None):
    row = v if row is None else row
    return {"column": str(v), "row": str(row), "unit": "px", "size": "", "isLinked": v == row}


def img(url, alt=""):
    """Images point at the live preview so a freshly imported template is not blank.
       id stays 0: Elementor re-imports the file into the media library on import."""
    full = url if url.startswith("http") else f"{BASE_URL}/{urllib.parse.quote(url)}"
    return {"url": full, "id": 0, "size": "", "alt": alt, "source": "library"}


def link(url, external=False):
    return {"url": url, "is_external": "yes" if external else "", "nofollow": ""}


def icon(name, library="fa-solid"):
    prefix = {"fa-solid": "fas", "fa-brands": "fab", "fa-regular": "far"}[library]
    return {"value": f"{prefix} {name}", "library": library}


# ───────────────────────── typography ────────────────────────────────────────
def typo(prefix="typography", family=SANS, size=16, weight="400", size_mobile=None,
         size_tablet=None, transform=None, letter_spacing=None, style=None,
         line_height_em=None):
    s = {
        f"{prefix}_typography": "custom",
        f"{prefix}_font_family": family,
        f"{prefix}_font_size": sz(size),
        f"{prefix}_font_weight": weight,
    }
    if size_tablet: s[f"{prefix}_font_size_tablet"] = sz(size_tablet)
    if size_mobile: s[f"{prefix}_font_size_mobile"] = sz(size_mobile)
    if transform:   s[f"{prefix}_text_transform"] = transform
    if letter_spacing is not None: s[f"{prefix}_letter_spacing"] = sz(letter_spacing)
    if style:       s[f"{prefix}_font_style"] = style
    if line_height_em: s[f"{prefix}_line_height"] = {"unit": "em", "size": line_height_em, "sizes": []}
    return s


def eyebrow(text, color=GOUD, align="left"):
    """Het bovenkopje. Geen kop maar een span, zodat het geen gewicht krijgt in
    de koppenstructuur van de pagina.

    Eén recept voor elke sectieopener, op licht en op donker: Manrope 700, 11px,
    .22em, goud. Gemeten op de live pagina, niet uit de clamp afgeleid."""
    s = {"title": text, "header_size": "span", "title_color": color, "align": align}
    s.update(typo(size=11, weight="700", transform="uppercase", letter_spacing=2.42))
    return W("heading", s)


def title(text, level="h2", color=INK, align="left", size=51, size_tablet=42, size_mobile=32):
    """Een sectiekop. De site zet alle koppen in de schreefletter, niet in de
    schreefloze, en met een regelafstand die strak tegen de tekst aan zit."""
    s = {"title": text, "header_size": level, "title_color": color, "align": align}
    s.update(typo("typography", SERIF, size, "400", size_mobile=size_mobile,
                  size_tablet=size_tablet, letter_spacing=round(size * -0.02, 2),
                  line_height_em=1.04))
    return W("heading", s)


def paginakop(text, color=INK, align="left"):
    """De h1 van een pagina, groter dan een sectiekop."""
    return title(text, level="h1", color=color, align=align,
                 size=48, size_tablet=42, size_mobile=32)


def para(html, color=INK_SOFT, size=18, align="left", max_w=None):
    s = {"editor": html if html.startswith("<") else f"<p>{html}</p>",
         "text_color": color, "align": align}
    s.update(typo(size=size, weight="400", line_height_em=1.65))
    if max_w:
        # max-width en niet de eigen breedteregelaar van Elementor: die zet een
        # vaste breedte, en die loopt op een smal scherm buiten beeld
        s["custom_css"] = f"selector {{ max-width: {max_w}px; }}"
    return W("text-editor", s)


def btn(variant, text, url, external=False, icon_name=None, klein=False):
    """De vijf knoppen van de site, uit .btn en zijn varianten in site.css.

    solid   gevuld met inkt, witte tekst, de gewone knop
    wit     wit vlak met inktkleurige tekst, op een donkere ondergrond
    ghost   doorzichtig met een inktkleurige rand, op licht
    ghostw  doorzichtig met een witte rand, op donker
    goud    goud vlak met witte tekst, voor de nadrukkelijke keuze
    """
    pad = box(10, 17, 10, 17) if klein else box(12, 20, 12, 20)
    base = {
        "text": text,
        "link": link(url, external),
        "border_radius": radius(999),
        "text_padding": pad,
        "button_padding": pad,
        "hover_animation": "float",
        # een doorzichtige rand op elke knop, zodat een gevulde en een omlijnde
        # knop even hoog zijn. Zonder dit scheelt het twee pixels.
        "border_border": "solid",
        "border_width": radius(1),
    }
    base.update(typo("typography", SANS, 11.5 if klein else 12.5, "700", letter_spacing=1.25))
    if icon_name:
        base["selected_icon"] = icon(icon_name)
        base["icon_align"] = "right"
        base["icon_indent"] = sz(9)
    # tekst, vlak, rand, vlak bij aanwijzen, rand bij aanwijzen, tekst bij aanwijzen
    #
    # Goud draagt navy-inkt, nooit wit: op #b59148 haalt witte tekst het
    # contrast niet. Dat staat zo in de ontwerpafspraken en is hier gemeten
    # terug te vinden op elke .btn van de site.
    varianten = {
        "goud":   (DARK, GOUD, GOUD, GOUD_SOFT, GOUD_SOFT, DARK),
        "solid":  (BG, NAVY, NAVY, DARK, DARK, BG),
        "wit":    (NAVY, WIT, WIT, BG_ALT, BG_ALT, NAVY),
        "ghost":  (INK, "rgba(0,0,0,0)", LIJN, NAVY, NAVY, BG),
        "ghostw": (WIT, "rgba(0,0,0,0)", LIJN_DARK, WIT, WIT, NAVY),
    }
    tekst, vlak, rand, vlak_hover, rand_hover, tekst_hover = varianten[variant]
    base.update({
        "button_text_color": tekst,
        "background_color": vlak,
        "button_background_color": vlak,
        "border_color": rand,
        "button_background_hover_color": vlak_hover,
        "button_hover_border_color": rand_hover,
        "button_text_color_hover": tekst_hover,
    })
    return W("button", base)


# ───────────────────────── layout ───────────────────────────────────────────
def section(children, bg=BG, pad_top=PAD_SECTION, pad_bottom=PAD_SECTION, extra=None,
            element_id=None, dark=False):
    """Een sectie op het hoogste niveau. Altijd isInner false, en nooit met een
    ingekaderde content_width: die zet Elementor zelf."""
    s = {
        "background_background": "classic",
        "background_color": NAVY if dark else bg,
        "padding": box(pad_top, PAD_X, pad_bottom, PAD_X),
        "padding_mobile": box(PAD_SECTION_M, PAD_X_M, PAD_SECTION_M, PAD_X_M),
        "flex_direction": "column",
    }
    if element_id:
        s["_element_id"] = element_id
    if extra:
        s.update(extra)
    return C(s, children, is_inner=False)


def wrap(children, width=MAX_W, extra=None, direction="column", gap_px=0):
    """De gecentreerde kolom van 1180px waar elke sectie in staat."""
    s = {
        "content_width": "full",
        "width": sz(width),
        "margin": {"unit": "px", "top": "0", "right": "auto", "bottom": "0", "left": "auto",
                   "isLinked": False},
        "flex_direction": direction,
    }
    if gap_px:
        s["flex_gap"] = gap(gap_px)
    if extra:
        s.update(extra)
    return C(s, children)


def row(cells, gap_px=24, align="stretch", wrap_cells=True, extra=None):
    s = {"content_width": "full", "flex_direction": "row", "flex_gap": gap(gap_px),
         "flex_align_items": align}
    if wrap_cells:
        s["flex_wrap"] = "wrap"
    if extra:
        s.update(extra)
    return C(s, cells)


def cell(children, width_pct=50, extra=None, direction="column", gap_px=16):
    s = {"content_width": "full", "width": sz(width_pct, "%"), "width_mobile": sz(100, "%"),
         "flex_direction": direction, "flex_gap": gap(gap_px)}
    if extra:
        s.update(extra)
    return C(s, children)


def sec_head(eyebrow_text, title_html, sub=None, align="left", level="h2"):
    """Het paar bovenkopje en kop waar bijna elke sectie mee begint."""
    kids = [eyebrow(eyebrow_text, align=align), title(title_html, level=level, align=align)]
    if sub:
        kids.append(para(sub, align=align, max_w=640))
    return C({"content_width": "full", "flex_direction": "column", "flex_gap": gap(12),
              "flex_align_items": "center" if align == "center" else "flex-start",
              "padding": box(0, 0, 44, 0),
              "text_align": align}, kids)


def tegelfoto(url, alt, ratio="4/3", radius_px=None):
    """Een foto in een afgeronde bak. aspect-ratio en object-fit hebben geen
    eigen instelling in Elementor, dus dat is een regel eigen CSS."""
    return W("image", {
        "image": img(url, alt), "image_size": "large",
        "custom_css": (f"selector img {{ aspect-ratio: {ratio}; object-fit: cover;"
                       f" width: 100%; border-radius: {radius_px or R}px; }}"),
    })


def hero(kop, onder, foto, alt, knoppen=None, pillen=None, hoog=True):
    """De kopsectie: een grote foto met een sluier eroverheen en de tekst erop.

    Een kop over een foto haalt het contrast niet vanzelf. De sluier is daarom
    geen sfeerlaag maar een leesbaarheidsmaatregel, en staat er op elke pagina.
    """
    kids = []
    if pillen:
        kids.append(C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(8),
                       "flex_wrap": "wrap"},
                      [pil(x) for x in pillen]))
    kids.append(title(kop, level="h1", color=WIT, size=64, size_tablet=46, size_mobile=33))
    if onder:
        kids.append(para(onder, color="rgba(238,241,246,.82)", size=17, max_w=620))
    if knoppen:
        kids.append(C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(10),
                       "flex_wrap": "wrap", "padding": box(10, 0, 0, 0)}, knoppen))

    binnen = C({"content_width": "full", "width": sz(MAX_W), "flex_direction": "column",
                "flex_gap": gap(18),
                "margin": {"unit": "px", "top": "0", "right": "auto", "bottom": "0",
                           "left": "auto", "isLinked": False}}, kids)

    return C({
        "background_background": "classic",
        "background_image": img(foto, alt),
        "background_position": "center center",
        "background_size": "cover",
        "background_overlay_background": "gradient",
        "background_overlay_color": "rgba(15,28,51,.72)",
        "background_overlay_color_b": "rgba(15,28,51,.42)",
        "background_overlay_gradient_angle": {"unit": "deg", "size": 160, "sizes": []},
        "min_height": sz(660 if hoog else 460),
        "min_height_mobile": sz(520 if hoog else 400),
        "padding": box(170, PAD_X, 90, PAD_X),
        "padding_mobile": box(130, PAD_X_M, 60, PAD_X_M),
        "flex_direction": "column",
        "flex_justify_content": "flex-end",
        "border_radius": radius(R_LG),
        "overflow": "hidden",
        "margin": {"unit": "px", "top": "0", "right": "14", "bottom": "0", "left": "14",
                   "isLinked": False},
    }, [binnen], is_inner=False)


def pil(tekst):
    """Een predicaat of keurmerk als pil, zoals in de hero van de site."""
    return C({"content_width": "full", "background_background": "classic",
              "background_color": "rgba(238,241,246,.12)", "border_radius": radius(999),
              "padding": box(6, 13, 6, 13), "width": sz(0), "flex_direction": "row"},
             [W("heading", dict({"title": tekst, "header_size": "span", "title_color": WIT},
                                **typo(size=11.5, weight="600", transform="uppercase",
                                       letter_spacing=1.1)))])


def cta_band(kop, onder, knoppen, foto=None):
    """Het slotblok dat op meerdere pagina's terugkomt: donkere band, kop,
    tekst en de knoppen."""
    binnen = C({"content_width": "full", "width": sz(MAX_W), "flex_direction": "column",
                "flex_gap": gap(16), "flex_align_items": "center",
                "margin": {"unit": "px", "top": "0", "right": "auto", "bottom": "0",
                           "left": "auto", "isLinked": False}}, [
        title(kop, color=WIT, align="center"),
        para(onder, color="rgba(238,241,246,.8)", align="center", max_w=620),
        C({"content_width": "full", "flex_direction": "row", "flex_gap": gap(10),
           "flex_wrap": "wrap", "flex_justify_content": "center",
           "padding": box(8, 0, 0, 0)}, knoppen),
    ])
    s = {
        "background_background": "gradient",
        "background_color": NAVY,
        "background_color_b": DARK,
        "background_gradient_angle": {"unit": "deg", "size": 150, "sizes": []},
        "padding": box(PAD_BAND, PAD_X, PAD_BAND, PAD_X),
        "padding_mobile": box(52, PAD_X_M, 52, PAD_X_M),
        "border_radius": radius(R_LG),
        "flex_direction": "column",
        "margin": {"unit": "px", "top": "0", "right": "14", "bottom": "0", "left": "14",
                   "isLinked": False},
    }
    if foto:
        s.update({"background_background": "classic", "background_image": img(foto, ""),
                  "background_size": "cover", "background_position": "center center",
                  "background_overlay_background": "classic",
                  "background_overlay_color": "rgba(15,28,51,.78)"})
    return C(s, [binnen], is_inner=False)


def feitkaart(label, waarde, binding=None):
    """Een feit in een vakje. Een los getal op een lijntje leest als onaf."""
    w = W("heading", dict({"title": waarde, "header_size": "span", "title_color": INK},
                          **typo(family=SERIF, size=22, weight="400")))
    if binding:
        w["settings"].update(acf("title", *binding))
    return C({"content_width": "full", "flex_direction": "column", "flex_gap": gap(3),
              "padding": box(18, 20, 18, 20), "border_radius": radius(R),
              "background_background": "classic", "background_color": WIT,
              "border_border": "solid", "border_width": radius(1), "border_color": LIJN,
              "width": sz(24, "%"), "width_tablet": sz(48, "%"), "width_mobile": sz(100, "%")}, [
        W("heading", dict({"title": label, "header_size": "span", "title_color": GRIJS},
                          **typo(size=11, weight="600", transform="uppercase",
                                 letter_spacing=1))),
        w,
    ])


# ───────────────────────── dynamic tags ──────────────────────────────────────
def make_dynamic_tag(tag_name, field_key=None):
    payload = urllib.parse.quote(json.dumps({"key": field_key})) if field_key else "%7B%7D"
    return f'[elementor-tag id="{uid()}" name="{tag_name}" settings="{payload}"]'


def dyn(setting_key, tag_name, field_key=None):
    """Merge into widget settings. Always keep a literal fallback in the setting
       itself so the template still reads correctly in the editor."""
    return {"__dynamic__": {setting_key: make_dynamic_tag(tag_name, field_key)}}


def post_title_tag():
    return make_dynamic_tag("post-title")


def post_url_tag():
    return make_dynamic_tag("post-url")


def terms_tag(taxonomie):
    """De termen van een paard, bijvoorbeeld de soort als badge op een kaart."""
    lading = urllib.parse.quote(json.dumps({"taxonomy": taxonomie}))
    return f'[elementor-tag id="{uid()}" name="post-terms" settings="{lading}"]'


def dyn_terms(setting_key, taxonomie):
    return {"__dynamic__": {setting_key: terms_tag(taxonomie)}}


def acf(setting_key, veld, soort="acf-text"):
    """Kortste vorm voor de binding die het vaakst voorkomt."""
    return dyn(setting_key, soort, ACF[veld])


# ───────────────────────── de ACF-sleutels ──────────────────────────────────
# Uit elementor/acf.json, dat elementor/dump-acf.php uit de plugin zelf haalt
# door de structuurklasse echt te draaien. Niets hier is overgetypt.
_ACF_JSON = os.path.join(os.path.dirname(os.path.abspath(__file__)), "acf.json")
with open(_ACF_JSON, encoding="utf-8") as _f:
    ACF_MAP = json.load(_f)

# Elke veldgroep hoort bij precies één post type, dus de sleutel is te vinden
# met (post type, veldnaam). Dat leest op de aanroepplek als sva("sport_horse",
# "tagline") en is niet te verwarren met een veld van een ander type.
_BY_TYPE = {}
for _gk, _g in ACF_MAP["groups"].items():
    for _pt in _g["post_types"]:
        _BY_TYPE[_pt] = _g["fields"]

POST_TYPES = ACF_MAP["post_types"]
TAXONOMIES = ACF_MAP["taxonomies"]


def veld(post_type, naam):
    """De ACF-sleutel, of een harde fout. Een binding aan een veld dat niet
    bestaat rendert als niets en is in de JSON onzichtbaar."""
    try:
        return _BY_TYPE[post_type][naam]["key"]
    except KeyError:
        bekend = sorted(_BY_TYPE.get(post_type, {}))
        raise KeyError(f"{post_type} heeft geen veld {naam!r}; wel: {bekend}") from None


def veldsoort(post_type, naam):
    return _BY_TYPE[post_type][naam]["type"]


# ACF-veldsoort → de naam van de Elementor dynamic tag die hem kan lezen
TAGSOORT = {
    "text": "acf-text", "textarea": "acf-text", "url": "acf-url",
    "wysiwyg": "acf-text", "select": "acf-text", "true_false": "acf-text",
    "image": "acf-image", "gallery": "acf-gallery", "relationship": "acf-relation",
    "repeater": "acf-text",
}


def acf(setting_key, post_type, naam, soort=None):
    """Kortste vorm voor de binding die het vaakst voorkomt."""
    soort = soort or TAGSOORT[veldsoort(post_type, naam)]
    return dyn(setting_key, soort, veld(post_type, naam))


def loop_grid(post_type, columns=3, per_page=12, query_id=None, orderby="menu_order",
              nothing_found="Nothing here yet.", extra=None):
    """Een loop grid. template_id blijft 0: een JSON kan de post-id van het loop
       item op de doelsite niet kennen, dus dat wordt na de import een keer met de
       hand gekoppeld. Dat hoort zo.

       query_id is geen versiering: het zoekveld en elke taxonomiefilter vinden
       de grid alleen via die naam. Zonder query_id staan de filters er wel en
       doen ze niets, en dat is aan niets te zien."""
    s = {
        "template_id": 0,
        "_skin": "post",
        "columns": str(columns),
        "columns_tablet": "2",
        "columns_mobile": "1",
        "row_gap": sz(24),
        "column_gap": sz(24),
        "post_query_post_type": post_type,
        "post_query_posts_per_page": per_page,
        "post_query_orderby": orderby,
        "nothing_found_message": nothing_found,
    }
    if query_id:
        s["post_query_query_id"] = query_id
    if extra:
        s.update(extra)
    return W("loop-grid", s)


# ───────────────────────── de filterbalk ────────────────────────────────────
# Elementor Pro heeft hier meer voor dan ik eerst dacht: `search` en
# `taxonomy-filter` zijn echte widgets en werken samen met een loop grid zodra
# alle drie hetzelfde query_id dragen. Bij Stoeterij staan er zeven van in
# productie. Wat Elementor niet heeft is de telling áchter elke chip; dat is
# het enige stuk dat maatwerk blijft.

def zoekveld(query_id, placeholder):
    return W("search", {
        "placeholder": placeholder,
        "query_id": query_id,
        "border_radius": radius(999),
        "input_padding": box(12, 18, 12, 18),
        "_element_id": "sva-search",
    })


def taxfilter(query_id, taxonomie, label, vorm="dropdown"):
    """vorm 'dropdown' geeft een select, 'checkbox_list' geeft de chips."""
    return W("taxonomy-filter", {
        "query_id": query_id,
        "taxonomy": taxonomie,
        "filter_by": "taxonomy",
        "selected_type": vorm,
        "dropdown_placeholder": label,
        "border_radius": radius(999),
    })


# ───────────────────────── save ──────────────────────────────────────────────
VALID_TYPES = ("page", "header", "footer", "loop-item", "archive", "single", "popup")


def save(content, doc_title, path, template_type="page", page_settings=None):
    assert template_type in VALID_TYPES, f"unknown template type {template_type}"
    if page_settings is None:
        page_settings = {"hide_title": "yes"} if template_type in ("page", "single", "archive") else {}
    doc = OrderedDict([
        ("content", content),
        ("page_settings", page_settings),
        ("version", "0.4"),
        ("title", doc_title),
        ("type", template_type),
    ])
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
    return path


def stage_folder(slug):
    """Translate a stage slug to the folder name on disk.

    The folders are named after the Google Drive folders the ClickUp tasks
    already link to, so that uploading lands in the folder the tasks point at.
    tools-gen-stages.py is the one place those names are written down; reading
    them from there means a rename there cannot leave these build scripts
    writing into a folder nobody looks at.
    """
    import importlib.util
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src = os.path.join(root, "tools-gen-stages.py")
    spec = importlib.util.spec_from_file_location("_sva_stages", src)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    names = {s["slug"]: s["drive_name"] for s in mod.STAGES}
    if slug not in names:
        raise KeyError(f"unknown stage slug {slug!r}; known: {sorted(names)}")
    return names[slug]
