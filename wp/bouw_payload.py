#!/usr/bin/env python3
"""
De generator: leest de statische site, schrijft payload.json en verzamelt de media.

Dit is de helft waar alle beslissingen thuishoren, want hier zijn ze nog te
controleren. De plugin leest records en schrijft posts, en beslist nooit iets:
die krijgt maar één kans om het goed te doen, op de server van iemand anders.

Draai:  python3 wp/bouw_payload.py

Hij weigert iets te schrijven als er ook maar één ding niet klopt.
"""

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
ROOT = HIER.parent
PLUGIN = HIER / "stud-von-axe-importer"
UIT = PLUGIN / "data" / "payload.json"
MEDIA = PLUGIN / "assets" / "media"

fouten = []


def fout(regel):
    fouten.append(regel)


# ── de data uit de site lezen ────────────────────────────────────────────────
# De bronbestanden zijn JavaScript, geen JSON: `var HORSES = [...]` met commentaar
# ertussen. Node leest ze zoals de site ze leest, wat betekent dat de generator
# en de browser gegarandeerd dezelfde waarheid zien.

LEES = r"""
const fs = require('fs');
function loadVar(f) {
  const s = fs.readFileSync(f, 'utf8');
  const m = /^\s*(?:var|const|let)\s+(\w+)/m.exec(s);
  return (0, eval)(s + ';' + m[1]);
}
const H = loadVar('horses-data.js');
const S = loadVar('semen-data.js');
const WA = loadVar('horses-whatsapp.js');
const E = loadVar('horses-extra.js');
const N = loadVar('news-data.js');
let V = {};
try { V = loadVar('horses-videos.js'); } catch (e) {}

/* De naamgeving komt letterlijk uit de bouwer van de site, tussen de markers
   words:start en words:end. Zelf naschrijven leverde 137 stambooncellen op die
   anders gespeld waren dan de pagina ze toont: "Van’t Roosakker" tegen "van't
   Roosakker", "Comme Il Faut" tegen "Comme il faut". Eén definitie, en de
   import en de site kunnen niet uit elkaar lopen. */
(function () {
  const src = fs.readFileSync('scripts/build-horses.mjs', 'utf8');
  const a = src.indexOf('/* words:start');
  const b = src.indexOf('/* words:end */');
  if (a < 0 || b < 0) throw new Error('kon de naamgeving niet uit build-horses.mjs lichten');
  const block = src.slice(src.indexOf('*/', a) + 2, b);
  if (block.length < 800) throw new Error('het gelichte blok is te klein om te kloppen');
  global.__words = new Function(block + '; return { theirWords, COUNTRY, SEX, horseName, bornYear, isFrozen };')();
})();
const { theirWords, COUNTRY, SEX, horseName, bornYear, isFrozen } = global.__words;

/* De derde generatie van een hengst staat niet in semen-data.js: de bouwer
   leidt hem af uit de stambomen die hun eigen site wel publiceert. Dezelfde
   afleiding, letterlijk uit scripts/build-horses.mjs:40-73 overgenomen, want
   een generator die iets anders leest dan de site is precies de fout waar dit
   ontwerp tegen beschermt. */
const keyOf = n => String(n || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const PARENTS = (() => {
  const m = new Map();
  const add = (name, sire, dam) => {
    const k = keyOf(name);
    if (!k || (!sire && !dam)) return;
    const cur = m.get(k) || { sire: '', dam: '' };
    if (!cur.sire && sire) cur.sire = sire;
    if (!cur.dam && dam) cur.dam = dam;
    m.set(k, cur);
  };
  for (const h of H) {
    const p = h.pedigree || {}, t = p.third || [];
    add(p.sire, p.sireSire, p.sireDam);
    add(p.dam, p.damSire, p.damDam);
    add(p.sireSire, t[0], t[1]); add(p.sireDam, t[2], t[3]);
    add(p.damSire, t[4], t[5]); add(p.damDam, t[6], t[7]);
  }
  return m;
})();
for (const st of S) {
  const p = st.pedigree;
  if (p.third && p.third.length) continue;
  const of = n => PARENTS.get(keyOf(n)) || { sire: '', dam: '' };
  p.third = [p.sireSire, p.sireDam, p.damSire, p.damDam]
    .flatMap(n => { const r = of(n); return [r.sire, r.dam]; });
}

/* Exact de samenvoeging die scripts/build-horses.mjs doet, zodat de import en
   de statische site het over dezelfde 106 records hebben. */
const DROP = new Set((WA.DROP || []).map(d => d.slug || d));
const horses = [...H, ...S]
  .filter(h => !DROP.has(h.slug))
  .map(h => {
    const p = (WA.PATCH || {})[h.slug];
    if (!p) return h;
    const { renamedFrom, said, ...fields } = p;
    return { ...h, ...fields };
  })
  .concat(Object.values(WA.NEW || {}));

/* De velden die de site berekent, hier één keer berekend en meegestuurd, zodat
   Python ze niet hoeft na te bouwen. */
const gerekend = horses.map(h => ({
  slug: h.slug,
  title: horseName(h.name),
  sex: SEX(h),
  born_year: bornYear(h),
  frozen: isFrozen(h),
  country: h.country && COUNTRY[h.country] ? COUNTRY[h.country] : '',
  tagline: theirWords(h.tagline || ''),
  genetics: theirWords(h.genetics || ''),
  ped: (() => {
    const p = h.pedigree || {}, t = p.third || [];
    const o = {
      sire: horseName(p.sire || ''), dam: horseName(p.dam || ''),
      sire_sire: horseName(p.sireSire || ''), sire_dam: horseName(p.sireDam || ''),
      dam_sire: horseName(p.damSire || ''), dam_dam: horseName(p.damDam || ''),
    };
    for (let i = 0; i < 8; i++) o['gp_' + (i + 1)] = horseName(t[i] || '');
    return o;
  })(),
}));

process.stdout.write(JSON.stringify({ horses, gerekend, extra: E, news: N, videos: V }));
"""


def lees_site():
    r = subprocess.run(
        ["node", "-e", LEES], cwd=ROOT, capture_output=True, text=True
    )
    if r.returncode:
        print(r.stderr)
        sys.exit("kon de data van de site niet lezen")
    return json.loads(r.stdout)


# ── media ────────────────────────────────────────────────────────────────────
# Eén functie die overal vandaan geroepen wordt, zodat een foto niet in een veld
# kan belanden zonder ook in het manifest te belanden. Dat was bij Stoeterij de
# fout die drie geslaagde controles misten: vijfendertig hengstfoto's stonden op
# de site en reisden nergens mee.

media = {}


def beeld(pad, alt):
    if not pad:
        return ""
    if not (ROOT / pad).exists():
        fout(f"foto staat niet op schijf: {pad}")
        return ""
    if pad not in media:
        media[pad] = {"file": pad.replace("/", "__"), "alt": alt}
    return pad


def beelden(paden, alt):
    return [p for p in (beeld(x, alt) for x in paden) if p]


# ── kleine hulpjes ───────────────────────────────────────────────────────────


# De naamgeving, het geslacht, het geboortejaar en de landnamen worden door de
# site zelf berekend en meegestuurd in `gerekend`. Python rekent hier niets na:
# twee lezers van dezelfde waarheid moeten dezelfde waarheid lezen.
BEREKEND = {}


def html(alineas):
    """Een lijst alinea's wordt één wysiwyg-veld. Elementor kan een ACF-repeater
    niet doorlopen zonder code, en een verhaal is hier geen structuur maar
    gewoon tekst, dus dit is de vorm die de klant ook wil bewerken."""
    return "".join(f"<p>{a}</p>" for a in alineas if a)


def b(slug):
    return BEREKEND[slug]


# ── de records ───────────────────────────────────────────────────────────────

GROEP = {
    "sport": "sport_horses",
    "broodmare": "breeding_mares",
    "foal": "foals",
}


def paardrecord(h, videos):
    c = b(h["slug"])
    fotos = beelden(h.get("photos") or [], c["title"])
    ids = list(h.get("videos") or [])

    velden = {
        "tagline": c["tagline"],
        "genetics": c["genetics"],
        "sex": c["sex"],
        "year_of_birth": h.get("year", ""),
        "studbook": h.get("studbook", ""),
        "height": h.get("height", ""),
        "sold": bool(h.get("sold")),
        "sold_to": c["country"],
        "horsetelex": h.get("horsetelex", ""),
        "body": html(h.get("body") or []),
        "gallery": fotos,
        "video_1_id": ids[0] if ids else "",
        "videos": [{"youtube_id": v} for v in ids],
        "source": h.get("source", ""),
    }
    velden.update(c["ped"])

    termen = {
        "availability": ["Sold" if h.get("sold") else "Available"],
        "horse_sex": [c["sex"]] if c["sex"] else [],
        "studbook": [h["studbook"]] if h.get("studbook") else [],
        "birth_year": [c["born_year"]] if re.fullmatch(r"\d{4}", c["born_year"] or "") else [],
        "sire": [c["ped"]["sire"]] if c["ped"]["sire"] else [],
        "sold_to": [c["country"]] if c["country"] else [],
    }

    return {
        "slug": h["slug"],
        "title": c["title"],
        "thumbnail": fotos[0] if fotos else "",
        "terms": termen,
        "fields": velden,
    }


def embryorecord(h, sirelijnen):
    c = b(h["slug"])
    fotos = beelden(h.get("photos") or [], c["title"])
    bevroren = c["frozen"]
    vader = h.get("pedigree", {}).get("sire", "")

    velden = {
        "sire_name": c["ped"]["sire"],
        "dam_name": c["ped"]["dam"],
        "tagline": c["tagline"],
        "genetics": c["genetics"],
        "stage": "frozen" if bevroren else "carrying",
        "due_date": "" if bevroren else h.get("year", ""),
        "horsetelex": h.get("horsetelex", ""),
        "sire_line": html([sirelijnen[vader.upper()]]) if vader.upper() in sirelijnen else "",
        "dam_line": "",
        "gallery": fotos,
        "source": h.get("source", ""),
    }
    velden.update(c["ped"])

    return {
        "slug": h["slug"],
        "title": c["title"],
        "thumbnail": fotos[0] if fotos else "",
        "terms": {
            "embryo_stage": ["Frozen" if bevroren else "Carrying"],
            "sire": [c["ped"]["sire"]] if c["ped"]["sire"] else [],
        },
        "fields": velden,
    }


def stallionrecord(h, sirelijnen):
    c = b(h["slug"])
    fotos = beelden(h.get("photos") or [], c["title"])
    verhaal = list(h.get("body") or [])
    lijn = sirelijnen.get(h["name"].upper())
    if lijn and lijn not in verhaal:
        verhaal.append(lijn)

    velden = {
        "genetics": c["genetics"],
        "year_of_birth": h.get("year", ""),
        "studbook": h.get("studbook", ""),
        "availability": "On request",
        "crowned": bool(h.get("crowned")),
        "horsetelex": h.get("horsetelex", ""),
        "body": html(verhaal),
        "source_text": h.get("sourceText", ""),
        "crosses": list(h.get("crosses") or []),
        "gallery": fotos,
    }
    velden.update(c["ped"])

    return {
        "slug": h["slug"],
        "title": c["title"],
        "thumbnail": fotos[0] if fotos else "",
        "terms": {
            "studbook": [h["studbook"]] if h.get("studbook") else [],
            "sire": [c["ped"]["sire"]] if c["ped"]["sire"] else [],
        },
        "fields": velden,
    }


def nieuwsrecord(n):
    pad = n["img"] if n["img"].startswith("assets/") else "assets/img/" + n["img"]
    foto = beeld(pad, n["title"])
    return {
        "slug": n["slug"],
        "title": n["title"],
        "thumbnail": foto,
        "terms": {},
        "fields": {
            "eyebrow": n.get("eyebrow", ""),
            "excerpt": n.get("excerpt", ""),
            "body": html(n.get("body") or []),
            "body_it": html(n.get("bodyIt") or []),
            "focus": n.get("focus", ""),
            "is_placeholder": bool(n.get("ph")),
            "title_original": n.get("titleOriginal", ""),
            "source_url": n.get("source", ""),
        },
    }


# De drie partners staan nergens in een databestand: ze zijn op 9 september met
# de hand in index.html gezet en hun namen leven alleen in de alt-tekst. Hier
# staan ze dus letterlijk, met de bron erbij, tot iemand er meer over levert.
PARTNERS = [
    ("de-brabander", "De Brabander", "assets/img/partners/de-brabander.jpg"),
    ("centro-medico-ippocrate", "Centro Medico Ippocrate", "assets/img/partners/centro-medico-ippocrate.jpg"),
    ("semap", "SEMAP Marble & Surface", "assets/img/partners/semap.jpg"),
]


def partnerrecord(slug, naam, logo, volgorde):
    return {
        "slug": slug,
        "title": naam,
        "menu_order": volgorde,
        "thumbnail": beeld(logo, naam),
        "terms": {},
        "fields": {
            "logo": beeld(logo, naam),
            # Leeg, en dat is bekend: de eigenaren hebben geen link en geen
            # tekst aangeleverd. Het veld reist mee zodat het scherm laat zien
            # wat er nog komt in plaats van het te verbergen.
            "website": "",
            "blurb": "",
        },
    }


# De ontwerpbeelden. Geen post, alleen de bibliotheek, zodat de Elementor-bouw
# ze kan pakken. De deelkaarten reizen met opzet niet mee: die zijn volledig
# afgeleid en WordPress maakt zijn eigen og:image.
def bibliotheek():
    uit = []
    for pad in sorted((ROOT / "assets" / "img").glob("*.jpg")):
        uit.append(beeld(f"assets/img/{pad.name}", ""))
    for pad in sorted((ROOT / "assets" / "logo").iterdir()):
        if pad.suffix.lower() in (".png", ".webp", ".jpg"):
            uit.append(beeld(f"assets/logo/{pad.name}", ""))
    return [p for p in uit if p]


# ── controle ─────────────────────────────────────────────────────────────────


def controleer(payload):
    groepen = [k for k in payload if k not in ("generated_from", "media", "library")]
    for groep in groepen:
        records = payload[groep]
        if not records:
            fout(f"groep {groep} is leeg")
            continue

        slugs = [r["slug"] for r in records]
        for s in set(slugs):
            if slugs.count(s) > 1:
                fout(f"{groep}: slug {s} komt {slugs.count(s)} keer voor")

        sleutels = set(records[0]["fields"])
        for r in records:
            mist = sleutels - set(r["fields"])
            extra = set(r["fields"]) - sleutels
            if mist:
                fout(f"{groep}/{r['slug']}: mist veld(en) {sorted(mist)}")
            if extra:
                fout(f"{groep}/{r['slug']}: heeft veld(en) te veel {sorted(extra)}")

        for r in records:
            for tax, namen in r.get("terms", {}).items():
                if len(namen) > 1 and tax != "sire":
                    fout(f"{groep}/{r['slug']}: {len(namen)} termen in {tax}, één verwacht")


# De pagina's die de statische site al gebouwd heeft, per groep.
GERENDERD = {
    "sport_horses": "sport-horses", "breeding_mares": "breeding-mares",
    "foals": "foals", "embryos": "embryos", "stallions": "icsi-semen",
}


def controleer_tegen_site(payload):
    """De vierde controle: leest de gerenderde pagina's terug en kijkt of elke
    naam die de payload draagt daar ook zo staat.

    Dit is de controle die de andere drie niet kunnen doen. Die bewijzen dat
    elk veld geschreven wordt, dat elke sleutel bestaat en dat elke foto
    meereist, maar geen van drieën merkt dat de import een naam ánders spelt
    dan de pagina. De eerste versie van deze generator schreef "Van’t
    Roosakker" waar de site "van't Roosakker" toont: 137 cellen, alle
    controles groen.

    Wat hij niet kan zien: een veld dat nergens gerenderd wordt. Voor de
    velden die alleen in WordPress bestaan is er geen pagina om tegen te
    lezen."""
    n = 0
    for groep, map_ in GERENDERD.items():
        for r in payload[groep]:
            pagina = ROOT / map_ / (r["slug"] + ".html")
            if not pagina.exists():
                fout(f"{groep}/{r['slug']}: de site heeft hier geen pagina van")
                continue
            html = pagina.read_text(encoding="utf-8")
            for veld in ("sire", "dam", "sire_sire", "sire_dam", "dam_sire", "dam_dam"):
                naam = r["fields"].get(veld) or ""
                if not naam:
                    continue
                n += 1
                if naam not in html:
                    fout(f"{groep}/{r['slug']}: {veld} \"{naam}\" staat niet zo op de pagina")
            titel = r["title"]
            if titel not in html and titel.replace(" x ", " &times; ") not in html:
                fout(f"{groep}/{r['slug']}: de titel \"{titel}\" staat niet zo op de pagina")
    return n


def verslag(payload):
    print("\ngeschreven:")
    for groep in payload:
        if groep in ("generated_from", "media", "library"):
            continue
        print(f"  {groep:16s} {len(payload[groep]):4d}")
    print(f"  {'library':16s} {len(payload['library']):4d} ontwerpbeelden")
    print(f"  {'media':16s} {len(payload['media']):4d} bestanden")

    bytes_ = sum((ROOT / p).stat().st_size for p in payload["media"])
    print(f"  {'':16s}      {bytes_ / 1048576:.1f} MB\n")

    termen = {}
    for groep in payload:
        if groep in ("generated_from", "media", "library"):
            continue
        for r in payload[groep]:
            for tax, namen in r.get("terms", {}).items():
                termen.setdefault(tax, set()).update(namen)
    print("termen:")
    for tax in sorted(termen):
        print(f"  {tax:16s} {len(termen[tax]):3d}")

    print("\nnog aan te vullen:")
    for groep in payload:
        if groep in ("generated_from", "media", "library"):
            continue
        leeg = {}
        for r in payload[groep]:
            for naam, waarde in r["fields"].items():
                if waarde in ("", [], None):
                    leeg[naam] = leeg.get(naam, 0) + 1
        for naam, n in sorted(leeg.items(), key=lambda x: -x[1]):
            if n:
                print(f"  {groep:16s} {naam:16s} {n:3d} van {len(payload[groep])} leeg")


# ── schrijven ────────────────────────────────────────────────────────────────


def schrijf(payload):
    UIT.parent.mkdir(parents=True, exist_ok=True)
    if MEDIA.exists():
        shutil.rmtree(MEDIA)
    MEDIA.mkdir(parents=True)
    for pad, entry in payload["media"].items():
        shutil.copy2(ROOT / pad, MEDIA / entry["file"])
    UIT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")


def main():
    data = lees_site()
    paarden = data["horses"]
    BEREKEND.update({r["slug"]: r for r in data["gerekend"]})
    sirelijnen = {k: v["line"] for k, v in (data["extra"].get("sires") or {}).items() if v.get("line")}

    payload = {
        "generated_from": "de statische site van Stud Von Axe, gegenereerd door wp/bouw_payload.py",
        "sport_horses": [],
        "breeding_mares": [],
        "foals": [],
        "embryos": [],
        "stallions": [],
        "news": [],
        "partners": [],
    }

    for h in paarden:
        cat = h["category"]
        if cat in GROEP:
            payload[GROEP[cat]].append(paardrecord(h, data.get("videos") or {}))
        elif cat == "embryo":
            payload["embryos"].append(embryorecord(h, sirelijnen))
        elif cat == "stallion":
            payload["stallions"].append(stallionrecord(h, sirelijnen))
        else:
            fout(f"onbekende categorie {cat} bij {h['slug']}")

    for n in data["news"]:
        payload["news"].append(nieuwsrecord(n))

    for i, (slug, naam, logo) in enumerate(PARTNERS):
        payload["partners"].append(partnerrecord(slug, naam, logo, i))

    payload["library"] = bibliotheek()
    payload["media"] = media

    # Een hengst draagt de lijst met wat er met hem gefokt is, en die lijst is
    # geteld en niet geclaimd. Eén verwijzing is achtergebleven: Electra Von Axe
    # is op 6 september op verzoek van de eigenaren uit de catalogus gehaald,
    # maar staat nog in het crosses-veld van Emerald van't Ruytershof. De
    # statische site tekent hem al niet meer; hier wordt hij er net zo uit
    # gefilterd, hardop, zodat een lege plek een reden heeft.
    bestaat = {r["slug"] for g in GERENDERD for r in payload[g]}
    weg = 0
    for r in payload["stallions"]:
        heel = r["fields"]["crosses"]
        r["fields"]["crosses"] = [s for s in heel if s in bestaat]
        for s in heel:
            if s not in bestaat:
                weg += 1
                print(f"  weggelaten: {r['title']} verwijst naar {s}, dat niet meer op de site staat")
    if weg:
        print()

    controleer(payload)
    cellen = controleer_tegen_site(payload)

    if fouten:
        print("BOUW GESTOPT, er is niets geschreven\n")
        for f in fouten:
            print("  FOUT  ", f)
        return 1

    schrijf(payload)
    verslag(payload)
    print(f"\ngecontroleerd tegen de gerenderde site: {cellen} stamboomcellen "
          f"en {sum(len(payload[g]) for g in GERENDERD)} titels, 0 afwijkingen")
    return 0


if __name__ == "__main__":
    sys.exit(main())
