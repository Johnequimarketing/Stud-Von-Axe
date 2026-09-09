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
from html import unescape
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

  const c = src.indexOf('/* telex:start');
  const d = src.indexOf('/* telex:end */');
  if (c < 0 || d < 0) throw new Error('kon de Horsetelex-regel niet uit build-horses.mjs lichten');
  const tblock = src.slice(src.indexOf('*/', c) + 2, d);
  if (tblock.length < 400) throw new Error('het gelichte telex-blok is te klein om te kloppen');
  global.__telex = new Function('horseName', tblock + '; return { telexOf };')(global.__words.horseName);
})();
const { theirWords, COUNTRY, SEX, horseName, bornYear, isFrozen } = global.__words;
const { telexOf } = global.__telex;

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
  /* Alleen een link die deze pagina ook zou tekenen. Twee records dragen een
     zoekopdracht in plaats van een stamboompagina, met een HTML-entiteit erin,
     en elf dragen de link van een ouder. */
  telex: (() => { const t = telexOf(h); return t ? t.url : ''; })(),
  telex_of: (() => { const t = telexOf(h); return t && !t.self ? t.of : ''; })(),
  tagline: theirWords(h.tagline || ''),
  /* De site zet de fokregel door horseName heen, niet alleen door theirWords:
     hun bron schrijft hem in kapitalen en de pagina toont hem als namen. Zonder
     dit stonden 95 fokregels in de import in kapitalen terwijl de site ze in
     gemengd schrift toont. */
  genetics: horseName(theirWords(h.genetics || '')),
  /* De twee spiegels die de archiefkaart afdrukt. Elementor schrijft één
     dynamische tag per widget en kan vier velden niet aaneenrijgen met een
     scheidingsteken dat verdwijnt als een veld leeg is, dus die regel wordt
     hier één keer samengesteld. Precies de samenstelling die cardOf() in
     scripts/build-horses.mjs doet, met dezelfde gelichte helpers; controle 5
     leest de archiefpagina's terug en bewijst dat ze gelijk zijn. */
  meta_line: (h.category === 'foal'
    /* De veulenkaart draagt het jaar in zijn eigen badge, dus die regel begint
       bij het geslacht. Verder dezelfde onderdelen in dezelfde volgorde. */
    ? [SEX(h), h.studbook || '',
       (h.sold && h.country) ? 'Sold to ' + (COUNTRY[h.country] || h.country) : '']
    : [
        h.year ? 'Born ' + bornYear(h) : '',
        SEX(h),
        h.studbook || '',
        (h.sold && h.country) ? 'Sold to ' + (COUNTRY[h.country] || h.country) : '',
      ]).filter(Boolean).join(' \u00b7 '),
  /* De badge over de foto. Een veulen dat te koop is draagt "Available", een
     verkocht paard het land. Dat staat nergens als één veld, en Elementor kan
     "Sold to " + land niet met een lege staat combineren. */
  status_line: (h.sold && h.country)
    ? 'Sold to ' + (COUNTRY[h.country] || h.country)
    : (h.sold ? 'Sold' : 'Available'),
  /* Het plaatje op de badge is de klant zijn eigen vraag: een sneeuwvlok bij
     bevroren, een zandloper bij dragend. \uFE0E houdt het een letterteken en
     geen kleurenemoji, zodat het naast de tekst niet uit de regel springt. */
  stage_badge: isFrozen(h)
    ? '\u2744\uFE0E Frozen'
    : (h.year ? '\u23F3\uFE0E Due ' + h.year : ''),
  /* De damline op een kruising is de fokregel min de eerste naam, precies zoals
     damlineOf() op de site hem samenstelt. */
  damline: horseName(theirWords((h.genetics || '').split(/\s+X\s+/i).slice(1).join(' x '))),
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
        "meta_line": c["meta_line"],
        "status_line": c["status_line"],
        "horsetelex": c["telex"],
        "horsetelex_of": c["telex_of"],
        "body": html(h.get("body") or []),
        "gallery": fotos,
        # De tweede foto in een eigen veld. De pagina toont hem naast de naam
        # terwijl de eerste de achtergrond vult, en Elementor kan het tweede
        # item van een galerij niet aanwijzen zonder code. 37 van de 44 paarden
        # hebben er twee of meer; wie er één heeft laat dit leeg en de pagina
        # laat dat vlak dan weg.
        "photo_2": fotos[1] if len(fotos) > 1 else "",
        # De videowidget wil een adres en geen id. Beide velden reizen mee,
        # want de tekstvorm is wat de klant herkent en de link is wat de widget
        # leest.
        "video_1_url": f"https://www.youtube.com/watch?v={ids[0]}" if ids else "",
        "video_1_id": ids[0] if ids else "",
        "videos": [{"youtube_id": v, "title": (videos.get(v) or {}).get("title", "")} for v in ids],
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
        "stage_badge": c["stage_badge"],
        "horsetelex": c["telex"],
        "horsetelex_of": c["telex_of"],
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
        "horsetelex": c["telex"],
        "horsetelex_of": c["telex_of"],
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
# Beelden die op schijf staan maar door geen publieke pagina meer getoond worden.
# Restanten van een eerdere bouw en van het ontwerpdocument. Ze zouden als rommel
# in de mediabibliotheek landen, dus ze blijven eruit, met de reden erbij in
# plaats van onthouden.
DOOD = {
    "hero-cortina-wide.jpg": "vervangen door arch-mares.jpg op 7 september",
    "hero-neck-wide.jpg": "restant, nergens meer gebruikt",
    "hero-embryos.jpg": "alleen in het ontwerpdocument",
    "hero-foals.jpg": "alleen in het ontwerpdocument",
    "hero-semen.jpg": "alleen in het ontwerpdocument",
    "hero-sport.jpg": "alleen in het ontwerpdocument",
    "horse-cortina.jpg": "alleen in het ontwerpdocument",
    "thumb-embryos.jpg": "alleen in het ontwerpdocument",
    "thumb-foals.jpg": "alleen in het ontwerpdocument",
    "thumb-semen.jpg": "alleen in het ontwerpdocument",
    "thumb-sport.jpg": "alleen in het ontwerpdocument",
    "horse-agousha.jpg": "restant van een eerdere bouw",
    "horse-arkhana.jpg": "restant van een eerdere bouw",
    "horse-cabri.jpg": "restant van een eerdere bouw",
    "horse-charina.jpg": "restant van een eerdere bouw",
    "horse-coolrock.jpg": "restant van een eerdere bouw",
    "horse-dourkhet.jpg": "restant van een eerdere bouw",
    "horse-dune.jpg": "restant van een eerdere bouw",
    "horse-unique-touch.jpg": "restant van een eerdere bouw",
}


def bibliotheek():
    uit = []
    for pad in sorted((ROOT / "assets" / "img").glob("*.jpg")):
        if pad.name in DOOD:
            continue
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


def _plat(s):
    """Tags eruit, entiteiten terug, witruimte gelijk. Zo vergelijk je wat de
    bezoeker leest en niet hoe het toevallig gecodeerd staat."""
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", s))).strip()


# De pagina's die de statische site al gebouwd heeft, per groep.
GERENDERD = {
    "sport_horses": "sport-horses", "breeding_mares": "breeding-mares",
    "foals": "foals", "embryos": "embryos", "stallions": "icsi-semen",
}


sirelijn_teksten = []


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
            plat = _plat(html)

            # De waarden zelf, niet alleen de stamboom. Dit ving de fokregel,
            # die in de bron in kapitalen staat en op de pagina in gemengd
            # schrift: 95 records mis terwijl elke andere controle groen stond.
            for veld in ("tagline", "studbook", "height", "genetics"):
                waarde = r["fields"].get(veld) or ""
                if not waarde:
                    continue
                # Twee uitzonderingen, allebei met een reden. Een kruising toont
                # de damline en niet de hele fokregel, en bij een hengst staat
                # de fokregel alleen in de beschrijving voor een zoekresultaat.
                if veld == "genetics" and groep == "embryos":
                    continue
                n += 1
                if _plat(waarde) not in plat and waarde not in unescape(html):
                    fout(f"{groep}/{r['slug']}: {veld} \"{waarde[:44]}\" staat niet zo op de pagina")

            for alinea in re.findall(r"<p>(.*?)</p>", r["fields"].get("body") or ""):
                kort = _plat(alinea)[:60]
                if not kort:
                    continue
                # De vaderlijnteksten staan op de site bij de kruisingen en niet
                # bij de hengst zelf, omdat linesSection() alleen vanaf de
                # embryopagina geroepen wordt. In WordPress hoort die tekst wél
                # op de hengst: hij gaat over hem. De payload draagt dus meer
                # dan de pagina toont, en dat is de bedoeling.
                if groep == "stallions" and kort in _plat("".join(sirelijn_teksten)):
                    continue
                n += 1
                if kort not in plat:
                    fout(f"{groep}/{r['slug']}: een alinea van het verhaal staat niet op de pagina")

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


def controleer_de_kaarten(payload):
    """De vijfde controle: de twee spiegelvelden tegen de archiefkaarten.

    `meta_line` en `stage_badge` staan op geen enkele detailpagina — ze bestaan
    alleen omdat de kaart op het archief ze afdrukt en Elementor vier velden
    niet aaneen kan rijgen. Controle 4 leest de detailpagina's en kan ze dus
    per definitie niet zien. Zonder deze controle zou een spiegel die
    stilletjes iets anders samenstelt dan de kaart nergens opvallen: dat is
    precies het gat dat bij het vorige project een hele categorie beeld miste.

    Wat hij niet kan zien: of de spiegel op de WordPress-kaart even mooi
    afbreekt als hier. Dat is een ontwerpvraag, geen gegevensvraag.
    """
    n = 0
    for groep, map_ in GERENDERD.items():
        pagina = ROOT / map_ / "index.html"
        if not pagina.exists():
            fout(f"{groep}: het archief {map_}/index.html bestaat niet")
            continue
        plat = _plat(pagina.read_text(encoding="utf-8"))
        for r in payload[groep]:
            for veld in ("meta_line", "status_line", "stage_badge"):
                waarde = r["fields"].get(veld) or ""
                if not waarde:
                    continue
                n += 1
                if _plat(waarde) not in plat:
                    fout(f"{groep}/{r['slug']}: {veld} \"{waarde}\" staat niet zo op "
                         f"{map_}/index.html")
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
    sirelijn_teksten.extend(sirelijnen.values())

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
    kaarten = controleer_de_kaarten(payload)

    if fouten:
        print("BOUW GESTOPT, er is niets geschreven\n")
        for f in fouten:
            print("  FOUT  ", f)
        return 1

    schrijf(payload)
    verslag(payload)
    print(f"\ngecontroleerd tegen de gerenderde site: {cellen} waarden en "
          f"{sum(len(payload[g]) for g in GERENDERD)} titels op de detailpagina's, "
          f"{kaarten} spiegelwaarden op de archiefkaarten, 0 afwijkingen")
    return 0


if __name__ == "__main__":
    sys.exit(main())
