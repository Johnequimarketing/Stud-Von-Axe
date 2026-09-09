#!/usr/bin/env python3
"""
Zipt de plugin, en weigert code te versturen die niet parseert of niet slaagt.

Draai:  python3 wp/bouw_plugin.py

Er komen drie zips uit, want de media weegt zo'n 37 MB en veel hosts nemen een
plugin-upload boven 8, 16 of 32 MB niet aan:

  stud-von-axe-importer.zip               alles
  stud-von-axe-importer-zonder-fotos.zip  de code en de payload
  stud-von-axe-importer-fotos.zip         de foto's, uit te pakken in wp-content/uploads/

De mediaklasse kijkt op beide plekken, dus het gesplitste paar werkt zonder één
regel codeverschil. De map in de fotozip heet stud-von-axe-media en niet naar de
plugin, want hij wordt in uploads uitgepakt: de standaardnesting is fout en dat
blijkt pas op de server van de klant.
"""

import os
import subprocess
import sys
import zipfile
from pathlib import Path

HIER = Path(__file__).resolve().parent
PLUGIN = HIER / "stud-von-axe-importer"
UIT = HIER / "uit"
NAAM = "stud-von-axe-importer"
MEDIAMAP = "stud-von-axe-media"
GRENS_MB = 8            # de laagste cap die we bij een host zijn tegengekomen
OVERSLAAN = {"tests", "__pycache__", ".DS_Store", ".git"}


def php_klopt():
    fout = False
    for pad in sorted(PLUGIN.rglob("*.php")):
        if any(deel in OVERSLAAN for deel in pad.parts):
            continue
        r = subprocess.run(["php", "-l", str(pad)], capture_output=True, text=True)
        if r.returncode:
            print(r.stdout or r.stderr)
            fout = True
    return not fout


def test_klopt():
    r = subprocess.run(
        ["php", str(PLUGIN / "tests" / "test-mapping.php")],
        capture_output=True, text=True,
    )
    print(r.stdout.strip())
    return r.returncode == 0


def bestanden(met_media, alleen_media=False):
    for pad in sorted(PLUGIN.rglob("*")):
        if pad.is_dir() or any(deel in OVERSLAAN for deel in pad.parts):
            continue
        is_media = "assets/media" in pad.as_posix()
        if alleen_media:
            if is_media:
                # rechtstreeks naar stud-von-axe-media/, niet in de pluginmap
                yield pad, f"{MEDIAMAP}/{pad.name}"
            continue
        if is_media and not met_media:
            continue
        yield pad, f"{NAAM}/{pad.relative_to(PLUGIN).as_posix()}"


def zip_maken(doel, met_media=True, alleen_media=False):
    with zipfile.ZipFile(doel, "w", zipfile.ZIP_DEFLATED) as z:
        n = 0
        for pad, naam in bestanden(met_media, alleen_media):
            z.write(pad, naam)
            n += 1
    mb = doel.stat().st_size / 1048576
    print(f"  {doel.name:44s} {n:4d} bestanden  {mb:6.1f} MB")
    return mb


def main():
    if not (PLUGIN / "data" / "payload.json").exists():
        sys.exit("data/payload.json ontbreekt. Draai eerst python3 wp/bouw_payload.py")

    print("php -l over elk bestand")
    if not php_klopt():
        sys.exit("er zit een PHP-fout in, er wordt niets gezipt")

    print("\nde mapping-test")
    if not test_klopt():
        sys.exit("\nde test faalt, er wordt niets gezipt")

    UIT.mkdir(exist_ok=True)
    for oud in UIT.glob("*.zip"):
        oud.unlink()

    print("\nzips")
    heel = zip_maken(UIT / f"{NAAM}.zip", met_media=True)
    if heel > GRENS_MB:
        zip_maken(UIT / f"{NAAM}-zonder-fotos.zip", met_media=False)
        zip_maken(UIT / f"{NAAM}-fotos.zip", alleen_media=True)
        print(
            f"\n  De hele zip is {heel:.0f} MB en dat neemt niet elke host aan. Bij een\n"
            f"  weigering: upload de zip zonder foto's, en pak {NAAM}-fotos.zip\n"
            f"  uit in wp-content/uploads/ zodat de bestanden in\n"
            f"  wp-content/uploads/{MEDIAMAP}/ landen. De import vindt ze daar."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
