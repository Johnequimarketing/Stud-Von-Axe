#!/usr/bin/env python3
"""De vier controles op de Elementor-sjablonen, met per controle wat hij niet ziet.

Dat laatste is de les van het vorige project: daar slaagden drie controles
terwijl een hele categorie beeld nergens meereisde. Een controle die slaagt
bewijst alleen wat hij meet, dus staat er per controle bij wat buiten zijn
bereik valt.

Draai: python3 tools-controle.py
"""
import json, os, re, subprocess, sys, glob
from urllib.parse import unquote
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

WORTEL = os.path.dirname(os.path.abspath(__file__))
SJABLONEN = sorted(glob.glob(os.path.join(WORTEL, "wordpress-elementor", "*",
                                          "templates", "*.json")))
ACF = os.path.join(WORTEL, "elementor", "acf.json")
DEKKING = os.path.join(WORTEL, "elementor", "dekking.json")

fouten = []
notities = []


def fout(regel):
    fouten.append(regel)


def kop(n, titel, blind):
    print(f"\n{n}. {titel}")
    notities.append((titel, blind))


# ── 1. de validator ──────────────────────────────────────────────────────────
def controle_validator():
    kop(1, "De validator over elk sjabloon",
        "of een sjabloon er goed uitziet, en of Elementor hem op de doelsite "
        "werkelijk inleest")
    r = subprocess.run([sys.executable, os.path.join(WORTEL, "elementor", "validator.py")]
                       + SJABLONEN, capture_output=True, text=True)
    goed = r.stdout.count("✓")
    if r.returncode:
        print(r.stdout)
        fout("de validator wees sjablonen af")
    print(f"   {goed} van {len(SJABLONEN)} sjablonen goedgekeurd")
    return goed


# ── 2. dekking sjabloon tegen ontwerp ────────────────────────────────────────
def secties_in(sjabloon):
    doc = json.load(open(sjabloon, encoding="utf-8"))
    return len(doc.get("content", []))


def controle_dekking():
    kop(2, "Dekking: telt het sjabloon evenveel secties als de pagina",
        "wat er in een sectie staat. En hij ondertelt het nieuwsarchief en het "
        "nieuwsbericht: hun inhoud staat op de statische site buiten elke "
        "<section>, dus de teller ziet er één waar er meer zijn")
    dek = json.load(open(DEKKING, encoding="utf-8"))
    n = 0
    for pad in SJABLONEN:
        naam = os.path.basename(pad)
        if naam not in dek:
            continue
        n += 1
        was, is_ = dek[naam]["secties"], secties_in(pad)
        # header, footer en het kit hebben geen pagina om tegen te tellen
        if naam.startswith(("news",)) or dek[naam]["pagina"].startswith("news/"):
            print(f"   {naam:32} {is_} tegen {was}  (niet te tellen, zie hierboven)")
            continue
        merk = "ok" if is_ >= was - 1 else "TE WEINIG"
        if is_ < was - 1:
            fout(f"{naam}: {is_} secties tegen {was} op {dek[naam]['pagina']}")
        print(f"   {naam:32} {is_} tegen {was}  {merk}")
    return n


# ── 3. beeld ─────────────────────────────────────────────────────────────────
def controle_beeld(online=True):
    kop(3, "Beeld: bestaat elke foto die een sjabloon noemt, en is hij op te halen",
        "of het de juiste foto is. Een verkeerde foto met het goede pad haalt "
        "deze controle moeiteloos")
    urls = set()
    for pad in SJABLONEN:
        s = open(pad, encoding="utf-8").read()
        # alleen beeld. Een link-object draagt ook "url", en de WhatsApp-link
        # kwam zo als ontbrekend beeld uit deze controle rollen.
        urls |= set(re.findall(
            r'"url":\s*"(https?://[^"]+\.(?:jpg|jpeg|png|webp|gif|svg|avif))"', s, re.I))
    op_schijf, kapot = 0, 0
    for u in sorted(urls):
        rel = unquote(u.split(".app/", 1)[-1])
        if os.path.exists(os.path.join(WORTEL, rel)):
            op_schijf += 1
        else:
            kapot += 1
            fout(f"beeld staat niet op schijf: {rel}")
        if online:
            try:
                with urlopen(Request(u, method="HEAD"), timeout=10) as r:
                    if r.status != 200:
                        fout(f"beeld geeft {r.status}: {u}")
            except (HTTPError, URLError) as e:
                fout(f"beeld niet op te halen: {u} ({e})")
    print(f"   {len(urls)} unieke beeld-URL's, {op_schijf} op schijf, {kapot} niet"
          + (", allemaal opgehaald" if online and not kapot else ""))

    # en de dekking van de plugin erbij, want die telt wat de site toont
    r = subprocess.run([sys.executable, os.path.join(WORTEL, "wp", "controle_media.py")],
                       capture_output=True, text=True)
    laatste = [x for x in r.stdout.strip().splitlines() if "reist nergens mee" in x]
    if laatste:
        print(f"   plugin: {laatste[0].strip()}")
        if not laatste[0].strip().endswith("0"):
            fout("er is beeld dat de site toont en dat nergens meereist")
    return len(urls)


# ── 4. kruiscontrole: elke binding tegen de plugin ───────────────────────────
def controle_bindingen():
    kop(4, "Kruiscontrole: elke ACF-binding tegen de velden die de plugin aanmaakt",
        "een veld dat de plugin wél aanmaakt maar dat geen enkel sjabloon toont. "
        "Dat is een gat in de andere richting en staat onderaan apart")
    acf = json.load(open(ACF, encoding="utf-8"))
    bekend = {f["key"] for g in acf["groups"].values() for f in g["fields"].values()}
    gebruikt = set()
    for pad in SJABLONEN:
        s = open(pad, encoding="utf-8").read()
        for enc in re.findall(r'settings=\\"([^\\"]*)\\"', s) + re.findall(r'settings="([^"]*)"', s):
            for fk in re.findall(r'"key"\s*:\s*"(field_[a-z0-9_]+)"', unquote(enc)):
                gebruikt.add(fk)
    onbekend = gebruikt - bekend
    for fk in sorted(onbekend):
        fout(f"binding aan {fk}, dat de plugin niet aanmaakt")
    print(f"   {len(gebruikt)} bindingen, {len(onbekend)} naar een veld dat niet bestaat")

    # Een veld dat de plugin aanmaakt maar dat nergens getoond wordt, is een gat
    # tenzij er een reden bij staat. Een lijst afdrukken zonder reden leest als
    # "het is vast in orde", en dat was bij het vorige project precies hoe een
    # hele categorie beeld ongemerkt nergens meereisde.
    reden = {
        "sold": "de kaart en de pagina tonen status_line, dat hier de spiegel van is",
        "sold_to": "zit in status_line en in meta_line",
        "stage": "zit in stage_badge, met de emoji die de klant vroeg",
        "due_date": "zit in stage_badge",
        "sire_name": "de titel van een kruising is al 'vader × moeder'",
        "dam_name": "de titel van een kruising is al 'vader × moeder'",
        "videos": "de videowidget leest video_1_url, de platte spiegel ernaast",
        "video_1_id": "de widget leest video_1_url; dit veld blijft ernaast staan omdat "
                      "een id is wat de klant herkent als hij een film wil wisselen",
        "source": "interne herkomstregel, niet voor de bezoeker",
        "source_text": "interne herkomstregel, niet voor de bezoeker",
        "crosses": "wordt wél gebruikt, als gerelateerde query op de hengstpagina; "
                   "een query is geen dynamische tag en daarom ziet deze controle hem niet",
        "crowned": "drie hengsten dragen een kroontje op hun eigen kaart en niemand "
                   "heeft gezegd wat het betekent, dus er wordt niets voor getekend",
        "body_it": "de Italiaanse versie, leeg tot er vertaald wordt",
        "focus": "de uitsnede van de nieuwsfoto, door de importer gebruikt",
        "title_original": "hun eigen kop, bewaard naast de onze",
        "source_url": "waar het bericht vandaan komt, intern",
        "genetics": "wordt getoond",
    }
    ongebruikt = sorted(bekend - gebruikt)
    zonder = [x for x in ongebruikt
              if re.sub(r"^field_sva_(sp|bm|fo|em|st|nw|pa)_", "", x) not in reden]
    print(f"   {len(ongebruikt)} van de {len(bekend)} velden worden door geen sjabloon "
          f"getoond, {len(ongebruikt) - len(zonder)} daarvan met een vastgelegde reden")
    for x in zonder:
        fout(f"{x} wordt nergens getoond en er staat geen reden bij")
    if not zonder:
        for k in sorted({re.sub(r"^field_sva_(sp|bm|fo|em|st|nw|pa)_", "", x)
                         for x in ongebruikt}):
            print(f"     {k:14} {reden[k]}")
    return len(gebruikt)


# ── 4b. staat elke vaste zin in een sjabloon ook op de statische pagina ────
# De controle die de rest niet kan doen. Een sjabloon mag beeld en velden van de
# site lenen, maar vaste kopij hoort van de klant te komen. Bij de eindronde
# stonden er twee dingen in die ik zelf had bedacht: een blok "Belgium" met een
# adres dat niet bestaat, en de belofte dat ze in vier talen antwoorden. Beide
# zagen er volkomen normaal uit.
#
# Wat hij niet kan zien: een zin die wél op de site staat maar op de verkeerde
# pagina is beland.

# Zinnen die met opzet van ons zijn: opschriften, lege staten en de labels van
# een formulier dat op de statische site niet bestond. Per stuk een reden.
EIGEN_KOPIJ = {
    "Five ways in": "opschrift boven de vijf tabbladen; de statische site heeft daar geen kop",
    "Nothing here yet.": "de lege staat van een loop grid",
    "Nothing matches that yet. Clear the search and try again.": "de lege staat van een archief",
    "No crosses by this stallion on the site yet.": "de lege staat van het kruisingenraster",
    "To be filled in": "een leeg stamboomvakje, precies zoals de site het zegt",
    "This link is the pedigree of ": "de regel die zegt van wie een Horsetelex-link is",
    "Example story — not published news": "de markering op een voorbeeldbericht",
    "On this page": "het opschrift van de inhoudsopgave, zoals op de juridische pagina's",
    "Send": "de knop van het formulier",
    "Your name": "formulierlabel", "Your email": "formulierlabel",
    "Telephone": "formulierlabel", "About": "formulierlabel",
    "Your message": "formulierlabel", "Horse enquiry": "de naam van het formulier",
    "Contact": "de naam van het formulier",
    "Write to us": "onder het mailadres in de contactkaart",
    "Fastest reply": "onder WhatsApp, zoals op de contactpagina",
    "Call or message": "onder een telefoonnummer, zoals op de contactpagina",
    "Legal": "het bovenkopje van de twee juridische pagina's",
    "Four ways in": "opschrift boven de vier aanbodkaarten",
    "404": "het bovenkopje van de 404",
    "News": "het bovenkopje van het nieuwsarchief",
    "The story": "het bovenkopje boven het verhaal van een paard",
    "More": "het bovenkopje boven de rail met meer paarden",
    "Photographs": "het bovenkopje boven de galerij",
    "On film": "het bovenkopje boven de film",
    "The pedigree": "het bovenkopje boven de stamboom",
    "The cross": "het bovenkopje op een kruisingspagina",
    "The lines": "het bovenkopje boven de vader- en moederlijn",
    "Sire line": "kop boven de vaderlijn",
    "Dam line": "kop boven de moederlijn",
    "The crosses": "het bovenkopje boven de kruisingen van een hengst",
    "Ask us": "het bovenkopje boven het formulier",
    "Get in touch": "het bovenkopje boven het formulier, hun eigen woorden",
    "Partners": "het bovenkopje boven de partnerstrook",
    "Where we are": "het bovenkopje boven het adres",
    "Every horse we have": "hun eigen kop boven de tabbladen",
}


def _zinnen(sjabloon):
    """Elke vaste zin uit een sjabloon: koppen, tekstblokken en knoppen."""
    doc = json.load(open(sjabloon, encoding="utf-8"))
    uit = []

    def loop(el):
        s = el.get("settings", {}) or {}
        dyn = s.get("__dynamic__") or {}
        for sleutel in ("title", "editor", "text"):
            if sleutel in dyn:          # een dynamische waarde komt uit een veld
                continue
            waarde = s.get(sleutel)
            if not isinstance(waarde, str) or not waarde.strip():
                continue
            uit.append(waarde)
        for kind in el.get("elements", []) or []:
            loop(kind)

    for el in doc.get("content", []) or []:
        loop(el)
    return uit


def _kaal(t):
    # aria-label, title en alt dragen echte kopij: "Message us on WhatsApp"
    # staat op de site alleen in een attribuut. Ze worden apart geoogst en
    # achteraan gezet, niet ter plekke vervangen — dan staan ze nog tussen de
    # punthaken en eet de tagstripper ze een regel later alsnog op.
    attributen = " ".join(re.findall(r'(?:aria-label|title|alt)="([^"]*)"', t))
    t = re.sub(r"<[^>]+>", " ", t) + " " + attributen
    t = (t.replace("&rarr;", "").replace("&larr;", "").replace("&middot;", "·")
          .replace("&times;", "x").replace("&#9743;", "").replace("&nbsp;", " ")
          .replace("&ccedil;", "c").replace("&copy;", "").replace("&#169;", "")
          .replace("&#8599;", "").replace("&amp;", "&"))
    t = re.sub(r"[^a-z0-9 ]+", " ", t.lower())
    return re.sub(r"\s+", " ", t).strip()


def controle_kopij():
    kop("4b", "Staat elke vaste zin in een sjabloon ook op de statische pagina",
        "of een zin op de júiste pagina staat. Hij zoekt in alles wat de site "
        "zegt — alle 122 pagina's, plus de gegevensbestanden en de aria-labels "
        "— want een zin kan met opzet ergens anders staan")
    dek = json.load(open(DEKKING, encoding="utf-8"))
    # één grote hooiberg van alles wat de statische site zegt. Per pagina zoeken
    # gaf valse alarmen: de vijf zinnen bij de tabbladen op de homepagina zijn de
    # intro's van de vijf archieven en staan dus op die archieven.
    bron = ""
    for pagina in sorted({d["pagina"] for d in dek.values()}):
        vol = os.path.join(WORTEL, pagina)
        if os.path.exists(vol):
            bron += _kaal(open(vol, encoding="utf-8").read()) + " "
    # Ook de gegevensbestanden, want een zin kan in de data staan en op één
    # pagina tegelijk gerenderd worden: de vijf knoppen bij de tabbladen komen
    # uit home-tabs.js en maar één ervan staat in de HTML.
    for extra in ("home-tabs.js", "news-data.js", "horses-extra.js"):
        vol = os.path.join(WORTEL, extra)
        if os.path.exists(vol):
            bron += _kaal(open(vol, encoding="utf-8").read()) + " "
    # En één representatieve detailpagina per soort: koppen als "Our own crosses
    # by him" staan alleen op een record dat er meer dan één heeft.
    import glob as _g
    for map_ in ("sport-horses", "breeding-mares", "foals", "embryos", "icsi-semen", "news"):
        for vol in sorted(_g.glob(os.path.join(WORTEL, map_, "*.html"))):
            bron += _kaal(open(vol, encoding="utf-8").read()) + " "
    n = eigen = vreemd = 0
    for pad in SJABLONEN:
        naam = os.path.basename(pad)
        if naam not in dek:
            continue
        for zin in _zinnen(pad):
            plat = _kaal(zin)
            woorden = plat.split()
            if len(woorden) < 3:        # losse woorden zeggen niets
                continue
            n += 1
            if " ".join(woorden) in bron:
                continue
            if any(_kaal(k) and _kaal(k).strip() in plat for k in EIGEN_KOPIJ):
                eigen += 1
                continue
            vreemd += 1
            fout(f"{naam}: \"{re.sub(r'<[^>]+>', '', zin)[:70]}\" staat nergens op de "
                 f"statische site en staat niet op de lijst van eigen kopij")
    print(f"   {n} vaste zinnen, {n - eigen - vreemd} letterlijk van de site, "
          f"{eigen} met opzet van ons, {vreemd} onbekend")
    return n


# ── 5. staat in elke stagemap wat zijn README noemt ─────────────────────────
def controle_stages():
    kop(5, "Staat in elke stagemap wat zijn README noemt",
        "of de inhoud van een bestand klopt. Hij telt bestandsnamen, niets meer")
    sys.path.insert(0, WORTEL)
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "_sva_stages", os.path.join(WORTEL, "tools-gen-stages.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    n, mis = 0, 0
    for s in mod.STAGES:
        m = os.path.join(WORTEL, "wordpress-elementor", s["drive_name"])
        for f in s["files"]:
            n += 1
            hier = os.path.join(m, "templates", f)
            elders = os.path.join(WORTEL, "wp", "uit", f)
            if not (os.path.exists(hier) or os.path.exists(elders)):
                mis += 1
                fout(f"stage {s['n']}: README noemt {f}, dat er niet is")
    print(f"   {n} bestanden genoemd, {mis} niet gevonden")
    return n


if __name__ == "__main__":
    print(f"{len(SJABLONEN)} sjablonen gevonden")
    controle_validator()
    controle_dekking()
    controle_beeld(online="--offline" not in sys.argv)
    controle_bindingen()
    controle_kopij()
    controle_stages()

    print("\nwat deze controles niet kunnen zien")
    for titel, blind in notities:
        print(f"  - {titel.lower()}: {blind}")
    print("  - en geen van vijven: of de JSON werkelijk importeert in Elementor op "
          "staging. Daarom staat stage 1 vooraan.")

    if fouten:
        print(f"\n{len(fouten)} FOUTEN")
        for f in fouten:
            print("  ", f)
        sys.exit(1)
    print("\nalles groen")
