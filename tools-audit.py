#!/usr/bin/env python3
"""De eindcontrole op de overdrachtsmap, vóór hij de Drive op gaat.

Anders dan tools-controle.py, die de sjablonen nakijkt, kijkt deze naar wat er
werkelijk in de elf mappen ligt: is elk bestand er, is het niet leeg, is het
byte voor byte hetzelfde als het origineel, en reist elke foto die WordPress
straks nodig heeft ook echt mee.

Per controle staat opgeschreven wat hij niet kan zien.

Draai: python3 tools-audit.py
"""
import hashlib, importlib.util, json, os, subprocess, sys, glob, zipfile

WORTEL = os.path.dirname(os.path.abspath(__file__))
STAGES_MAP = os.path.join(WORTEL, "wordpress-elementor")
PAYLOAD = json.load(open(os.path.join(WORTEL, "wp", "stud-von-axe-importer",
                                      "data", "payload.json"), encoding="utf-8"))

spec = importlib.util.spec_from_file_location(
    "_sva_stages", os.path.join(WORTEL, "tools-gen-stages.py"))
S = importlib.util.module_from_spec(spec)
spec.loader.exec_module(S)

fouten, waarschuwingen, blind = [], [], []


def fout(r):
    fouten.append(r)


def waarschuw(r):
    waarschuwingen.append(r)


def kop(n, titel, niet_zien):
    print(f"\n{n}. {titel}")
    blind.append((titel, niet_zien))


def sha(pad):
    h = hashlib.sha256()
    with open(pad, "rb") as f:
        for blok in iter(lambda: f.read(1 << 16), b""):
            h.update(blok)
    return h.hexdigest()


def stage_map(s):
    return os.path.join(STAGES_MAP, s["drive_name"])


# ── 1. staat elke map er, met alles wat zijn README noemt ───────────────────
def c1():
    kop(1, "Elke stagemap, en elk bestand dat zijn eigen README noemt",
        "of de inhoud van een bestand klopt; hij kijkt naar namen en groottes")
    n = leeg = 0
    for s in S.STAGES:
        m = stage_map(s)
        if not os.path.isdir(m):
            fout(f"stage {s['n']}: de map {s['drive_name']} bestaat niet")
            continue
        if not os.path.isfile(os.path.join(m, "README.md")):
            fout(f"stage {s['n']}: geen README.md")
        for f in s["files"]:
            n += 1
            pad = os.path.join(m, "templates", f)
            if not os.path.isfile(pad):
                fout(f"stage {s['n']}: README noemt {f}, dat er niet ligt")
            elif os.path.getsize(pad) == 0:
                leeg += 1
                fout(f"stage {s['n']}: {f} is 0 bytes")
    # en andersom: ligt er iets dat geen README noemt?
    genoemd = {(s["n"], f) for s in S.STAGES for f in s["files"]}
    los = 0
    for s in S.STAGES:
        t = os.path.join(stage_map(s), "templates")
        for f in sorted(os.listdir(t)) if os.path.isdir(t) else []:
            if (s["n"], f) not in genoemd:
                los += 1
                waarschuw(f"stage {s['n']}: {f} ligt er wel maar staat in geen README")
    print(f"   {len(S.STAGES)} mappen, {n} genoemde bestanden, {leeg} leeg, "
          f"{los} ongenoemd")


# ── 2. de drie plugin-zips ──────────────────────────────────────────────────
def c2():
    kop(2, "De importer-plugin: liggen de drie zips in stage 2 en kloppen ze",
        "of de plugin op een echte WordPress draait; hij pakt ze uit en telt")
    m = os.path.join(stage_map(S.STAGES[1]), "templates")
    verwacht = ["stud-von-axe-importer.zip",
                "stud-von-axe-importer-zonder-fotos.zip",
                "stud-von-axe-importer-fotos.zip"]
    for naam in verwacht:
        pad = os.path.join(m, naam)
        if not os.path.isfile(pad):
            fout(f"stage 2: {naam} ligt er niet")
            continue
        try:
            z = zipfile.ZipFile(pad)
        except zipfile.BadZipFile:
            fout(f"stage 2: {naam} is geen leesbare zip")
            continue
        kapot = z.testzip()
        if kapot:
            fout(f"stage 2: {naam} is beschadigd bij {kapot}")
        namen = z.namelist()
        mb = os.path.getsize(pad) / 1e6
        print(f"   {naam:44} {len(namen):4} bestanden  {mb:5.1f} MB")

        if naam == "stud-von-axe-importer.zip":
            for moet in ("stud-von-axe-importer/stud-von-axe-importer.php",
                         "stud-von-axe-importer/uninstall.php",
                         "stud-von-axe-importer/data/payload.json",
                         "stud-von-axe-importer/includes/class-structure.php",
                         "stud-von-axe-importer/includes/class-importer.php",
                         "stud-von-axe-importer/includes/class-media.php",
                         "stud-von-axe-importer/includes/class-admin.php",
                         "stud-von-axe-importer/includes/class-logger.php"):
                if moet not in namen:
                    fout(f"de hele zip mist {moet}")
            fotos = [x for x in namen if x.startswith("stud-von-axe-importer/assets/media/")]
            if len(fotos) != len(PAYLOAD["media"]):
                fout(f"de hele zip draagt {len(fotos)} foto's, het manifest noemt er "
                     f"{len(PAYLOAD['media'])}")
            # en de payload in de zip is dezelfde als die op schijf
            op_schijf = open(os.path.join(WORTEL, "wp", "stud-von-axe-importer",
                                          "data", "payload.json"), "rb").read()
            if z.read("stud-von-axe-importer/data/payload.json") != op_schijf:
                fout("de payload in de zip is niet dezelfde als die op schijf")

        if naam == "stud-von-axe-importer-fotos.zip":
            fotos = [x for x in namen if not x.endswith("/")]
            if len(fotos) != len(PAYLOAD["media"]):
                fout(f"de fotozip draagt {len(fotos)} bestanden, het manifest noemt er "
                     f"{len(PAYLOAD['media'])}")
            wortel = {x.split("/")[0] for x in namen}
            if wortel != {"stud-von-axe-media"}:
                fout(f"de fotozip pakt uit als {wortel}, verwacht stud-von-axe-media")

        if naam == "stud-von-axe-importer-zonder-fotos.zip":
            if any("/assets/media/" in x for x in namen):
                fout("de zip zonder foto's draagt toch foto's")


# ── 3. reist elke foto mee, en is hij byte voor byte gelijk ────────────────
def c3():
    kop(3, "De 251 foto's: staan ze in een stagemap, ongeschonden",
        "of het de juiste foto ís. Een verkeerde foto met de goede naam komt "
        "hier ongehinderd doorheen")
    in_stage = {}
    for s in S.STAGES:
        ref = os.path.join(stage_map(s), "media-reference")
        for f in sorted(os.listdir(ref)) if os.path.isdir(ref) else []:
            if f in in_stage:
                waarschuw(f"{f} ligt in twee stages: {in_stage[f][0]} en {s['n']}")
            in_stage[f] = (s["n"], os.path.join(ref, f))

    gelijk = anders = mist = 0
    for bron in sorted(PAYLOAD["media"]):
        naam = os.path.basename(bron)
        if naam not in in_stage:
            mist += 1
            fout(f"foto reist nergens mee: {bron}")
            continue
        _, pad = in_stage[naam]
        if sha(pad) == sha(os.path.join(WORTEL, bron)):
            gelijk += 1
        else:
            anders += 1
            fout(f"foto in de stagemap wijkt af van het origineel: {bron}")
    over = set(in_stage) - {os.path.basename(b) for b in PAYLOAD["media"]}
    for f in sorted(over):
        waarschuw(f"{f} ligt in een stagemap maar staat niet in het manifest")
    print(f"   {len(PAYLOAD['media'])} in het manifest, {gelijk} byte voor byte gelijk, "
          f"{anders} afwijkend, {mist} ontbrekend, {len(over)} teveel")

    # botsende basisnamen: twee bronpaden met dezelfde bestandsnaam zouden in
    # WordPress één attachment worden, of een -1 krijgen
    per_naam = {}
    for bron in PAYLOAD["media"]:
        per_naam.setdefault(os.path.basename(bron), []).append(bron)
    bots = {k: v for k, v in per_naam.items() if len(v) > 1}
    for k, v in bots.items():
        fout(f"twee bronnen delen de bestandsnaam {k}: {v}")
    print(f"   {len(bots)} botsende bestandsnamen in de mediabibliotheek")


# ── 4. het logo en de andere merkbestanden ─────────────────────────────────
def c4():
    kop(4, "De logo's: reizen ze mee en staan ze waar de sjablonen ze zoeken",
        "of het logo er goed uitziet op ivoor of op de foto")
    logos = sorted(p for p in PAYLOAD["media"] if p.startswith("assets/logo/"))
    op_schijf = sorted(p.replace(WORTEL + "/", "")
                       for p in glob.glob(os.path.join(WORTEL, "assets", "logo", "*")))
    print(f"   {len(op_schijf)} bestanden in assets/logo, {len(logos)} in het manifest")
    for p in op_schijf:
        merk = "reist mee" if p in logos else "reist NIET mee"
        print(f"     {os.path.basename(p):40} {merk}")
    # de drie die de sjablonen echt noemen
    gebruikt = set()
    for f in glob.glob(os.path.join(STAGES_MAP, "*", "templates", "*.json")):
        s = open(f, encoding="utf-8").read()
        for p in op_schijf:
            if os.path.basename(p) in s:
                gebruikt.add(p)
    for p in sorted(gebruikt):
        if p not in logos:
            fout(f"sjabloon gebruikt {p}, maar dat reist niet mee in de plugin")
    print(f"   {len(gebruikt)} logo's worden door een sjabloon gebruikt, "
          f"{len([p for p in gebruikt if p in logos])} daarvan reizen mee")


# ── 5. elk beeld dat een sjabloon toont, komt straks uit de bibliotheek ────
def c5():
    kop(5, "Elk beeld in een sjabloon zit ook in de mediabibliotheek",
        "of Elementor de foto bij het inlezen werkelijk overneemt; dat is pas "
        "op staging te zien")
    from urllib.parse import unquote
    verwezen = set()
    for f in glob.glob(os.path.join(STAGES_MAP, "*", "templates", "*.json")):
        s = open(f, encoding="utf-8").read()
        import re
        for u in re.findall(r'"url":\s*"(https?://[^"]+\.(?:jpg|jpeg|png|webp|gif|svg))"',
                            s, re.I):
            verwezen.add(unquote(u.split(".app/", 1)[-1]))
    mist = [p for p in sorted(verwezen) if p not in PAYLOAD["media"]]
    for p in mist:
        fout(f"sjabloon toont {p}, maar dat staat niet in het manifest — na de "
             f"import staat er een gat")
    print(f"   {len(verwezen)} beelden in de sjablonen, {len(verwezen) - len(mist)} "
          f"in het manifest, {len(mist)} niet")


# ── 6. de inhoud: telt de payload wat de site telt ─────────────────────────
def c6():
    kop(6, "De inhoud: telt de payload evenveel records als de site pagina's heeft",
        "of een record ook klopt; dat doet wp/bouw_payload.py met 985 waarden "
        "tegen de gerenderde pagina's")
    mappen = {"sport_horses": "sport-horses", "breeding_mares": "breeding-mares",
              "foals": "foals", "embryos": "embryos", "stallions": "icsi-semen",
              "news": "news"}
    for groep, m in mappen.items():
        pagina = len([p for p in glob.glob(os.path.join(WORTEL, m, "*.html"))
                      if not p.endswith("index.html")])
        rec = len(PAYLOAD[groep])
        merk = "ok" if pagina == rec else "WIJKT AF"
        if pagina != rec:
            fout(f"{groep}: {rec} records tegen {pagina} pagina's op de site")
        print(f"   {groep:16} {rec:3} records   {pagina:3} pagina's   {merk}")
    print(f"   {'partners':16} {len(PAYLOAD['partners']):3} records   "
          f"  — geen eigen pagina's, ze staan in de strook")
    totaal = sum(len(PAYLOAD[g]) for g in list(mappen) + ["partners"])
    print(f"   {totaal} records in totaal")


# ── 6b. de afvinklijst van stage 10 ────────────────────────────────────────
WERKSTUKKEN = {
    "00-design-system.html": "het ontwerpsysteem, geen pagina van de site",
    "01-build-checklist.html": "de bouwlijst, intern",
    "02-feedback-log.html": "het feedbacklogboek, intern",
    "03-photo-library.html": "het fotooverzicht, intern",
    "_overview.html": "het overzicht van de concepten, intern",
    "_export-programme-two-runs.html": "een notitie over de export, intern",
    "content/backup-2026-09-07/electra-von-axe-z.html": "een back-up van een gedropt paard",
    "content/whatsapp-2026-09-06/review.html": "de WhatsApp-ronde, intern",
}


def c6b():
    kop("6b", "De afvinklijst van stage 10 tegen de HTML op schijf",
        "of een pagina ook klopt; hij telt bestanden")
    import re
    alle = set()
    for pad in glob.glob(os.path.join(WORTEL, "**", "*.html"), recursive=True):
        rel = os.path.relpath(pad, WORTEL)
        if rel.split(os.sep)[0] in ("deploy", "node_modules", "wp", "wordpress-elementor"):
            continue
        if rel.startswith("v2-"):
            continue
        alle.add(rel)
    lijst = open(os.path.join(stage_map(S.STAGES[9]), "templates", "page-list.md"),
                 encoding="utf-8").read()
    n_lijst = len(re.findall(r"^- \[ \]", lijst, re.M))
    onbekend = sorted(x for x in alle if x not in WERKSTUKKEN)
    print(f"   {len(alle)} html-bestanden op schijf, {len(WERKSTUKKEN)} daarvan werkstukken "
          f"met een reden, {len(onbekend)} echte pagina's")
    print(f"   de afvinklijst noemt er {n_lijst}")
    if n_lijst != len(onbekend):
        fout(f"de afvinklijst noemt {n_lijst} pagina's, er staan er {len(onbekend)} op schijf")
    for w in WERKSTUKKEN:
        if w not in alle:
            waarschuw(f"{w} staat als werkstuk vrijgesteld maar bestaat niet meer")


# ── 7. draaien de andere controles nog ─────────────────────────────────────
def c7():
    kop(7, "De sjabloon- en plugincontroles, opnieuw gedraaid",
        "niets nieuws; dit is er om te bewijzen dat ze nu nog steeds slagen")
    for naam, cmd in (("tools-controle.py", [sys.executable, "tools-controle.py"]),
                      ("de mapping-test", ["php", "wp/stud-von-axe-importer/tests/test-mapping.php"]),
                      ("de mediadekking", [sys.executable, "wp/controle_media.py"])):
        r = subprocess.run(cmd, cwd=WORTEL, capture_output=True, text=True)
        laatste = [x for x in r.stdout.strip().splitlines() if x.strip()][-1] if r.stdout.strip() else ""
        merk = "ok" if r.returncode == 0 else "GEFAALD"
        if r.returncode:
            fout(f"{naam} faalde")
        print(f"   {naam:22} {merk:8} {laatste.strip()[:70]}")


if __name__ == "__main__":
    print("Audit van de overdrachtsmap wordpress-elementor/")
    for f in (c1, c2, c3, c4, c5, c6, c6b, c7):
        f()

    print("\nwat deze audit niet kan zien")
    for t, b in blind:
        print(f"  - {t.lower()}: {b}")

    if waarschuwingen:
        print(f"\n{len(waarschuwingen)} AANTEKENINGEN")
        for w in waarschuwingen:
            print("  ", w)
    if fouten:
        print(f"\n{len(fouten)} FOUTEN")
        for f_ in fouten:
            print("  ", f_)
        sys.exit(1)
    print("\nalles groen")
