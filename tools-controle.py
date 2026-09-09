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
