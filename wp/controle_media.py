#!/usr/bin/env python3
"""
De vierde controle: reist elk beeld dat de site toont ergens mee naartoe?

Dit is de controle die bij Stoeterij ontbrak, en de reden dat die playbook
bestaat. Daar slaagden er drie op een bouw waar vijfendertig hengstfoto's op de
site stonden, in de repo stonden, in een opzoektabel stonden, en in geen enkel
veld, geen manifest en geen sjabloon. De mapping-test bewijst dat elk
aangekondigd veld geschreven wordt, maar er wás geen veld. De dekkingscontrole
telt secties, niet wat erin staat.

Wat deze controle niet ziet: een beeld dat de site zelf ook niet toont omdat het
ontwerp het vergeten is. Hij vergelijkt de import met de site, niet met de
bedoeling.

Draai:  python3 wp/controle_media.py
"""

import json
import re
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
ROOT = HIER.parent
PAYLOAD = HIER / "stud-von-axe-importer" / "data" / "payload.json"

# Werkdocumenten, geen publieke pagina's. Die tonen onder andere de hele
# fotobibliotheek op ware grootte, en die hoort niet in WordPress.
INTERN = {
    "00-design-system.html", "01-build-checklist.html", "02-feedback-log.html",
    "03-photo-library.html", "_overview.html", "_export-programme-two-runs.html",
}

MAPPEN = [".", "sport-horses", "breeding-mares", "foals", "embryos", "icsi-semen",
          "news", "about", "contact", "privacy", "terms"]

# Bewust niet meegestuurd, met de reden erbij, zodat een weglating vastligt in
# plaats van onthouden te worden.
VRIJGESTELD = {
    "assets/img/share/": "deelkaarten van 1200x630: volledig afgeleid van de eerste "
                         "foto, en WordPress maakt zijn eigen og:image",
    "assets/img/video/": "YouTube-posters: Elementor haalt die bij YouTube zelf",
    "assets/img/placeholder/": "plaatshouders van de galerij- en filmsecties, die in "
                               "WordPress door echte media vervangen worden",
}

BEELD = re.compile(
    r'(?:src|srcset|content)="(?:https://www\.studvonaxe\.it/|\.\./)?/?'
    r'((?:assets)/[A-Za-z0-9._/-]+\.(?:jpg|jpeg|png|webp))"'
)
IN_JS = re.compile(r'["\'](?:/)?((?:assets)/[A-Za-z0-9._/-]+\.(?:jpg|jpeg|png|webp))')


def vrijgesteld(pad):
    return next((r for pre, r in VRIJGESTELD.items() if pad.startswith(pre)), None)


def main():
    if not PAYLOAD.exists():
        sys.exit("payload.json ontbreekt. Draai eerst python3 wp/bouw_payload.py")
    manifest = set(json.loads(PAYLOAD.read_text(encoding="utf-8"))["media"])

    getoond = set()
    for map_ in MAPPEN:
        for f in (ROOT / map_).glob("*.html"):
            if f.name in INTERN:
                continue
            for m in BEELD.finditer(f.read_text(encoding="utf-8")):
                getoond.add(m.group(1))
    for js in ("home-tabs.js", "news-data.js"):
        for m in IN_JS.finditer((ROOT / js).read_text(encoding="utf-8")):
            getoond.add(m.group(1))

    vrij = {x for x in getoond if vrijgesteld(x)}
    mist = sorted(getoond - manifest - vrij)

    print(f"beelden die een publieke pagina toont : {len(getoond)}")
    print(f"  in het manifest                     : {len(getoond & manifest)}")
    print(f"  vrijgesteld, met reden              : {len(vrij)}")
    print(f"  reist nergens mee                   : {len(mist)}")
    for x in mist:
        print("     ", x)

    extra = sorted(manifest - getoond)
    print(f"\nin het manifest maar door geen publieke pagina getoond: {len(extra)}")
    print("  (logo's, favicons en de galerijfoto's die alleen op de detailpagina")
    print("   staan; die horen er te zijn voor de Elementor-bouw)")

    return 1 if mist else 0


if __name__ == "__main__":
    sys.exit(main())
