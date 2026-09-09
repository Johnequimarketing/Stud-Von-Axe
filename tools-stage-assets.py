#!/usr/bin/env python3
"""Zet per stagemap klaar wat erin hoort: de sjablonen staan er al, hier komen
de foto's en de tabel die zegt waar elke foto naartoe gaat.

Mark vroeg de foto's ook in de Drive, in de juiste map met de juiste naam. Dat
gebeurt hier — met één belangrijke aantekening die ook in elke README staat:
**deze foto's zijn niet om te uploaden.** Ze staan al in de mediabibliotheek,
gezet door de importer-plugin. Ze liggen in de stagemap zodat John kan nakijken
of de juiste foto op de juiste plek staat. Uploadt hij ze opnieuw, dan krijgt
elk bestand een tweelingbroer met -1 erachter en wijst elke sjabloon-URL naar de
verkeerde.

De naam in media-reference/ is de naam die het bestand in de mediabibliotheek
krijgt: basename() van het bronpad, want dat is wat class-media.php aan
wp_upload_bits meegeeft.

Draai: python3 tools-stage-assets.py
"""
import json, os, re, shutil, sys, importlib.util

WORTEL = os.path.dirname(os.path.abspath(__file__))
PAYLOAD = os.path.join(WORTEL, "wp", "stud-von-axe-importer", "data", "payload.json")
PLUGINZIPS = os.path.join(WORTEL, "wp", "uit")

spec = importlib.util.spec_from_file_location(
    "_sva_stages", os.path.join(WORTEL, "tools-gen-stages.py"))
STAGES_MOD = importlib.util.module_from_spec(spec)
spec.loader.exec_module(STAGES_MOD)

# welke inhoudsgroep bij welke stage hoort
GROEP_STAGE = {
    "sport_horses": "stage-3-sport-horses",
    "breeding_mares": "stage-4-breeding-mares",
    "foals": "stage-5-foals",
    "embryos": "stage-6-embryos",
    "stallions": "stage-7-icsi-semen",
    "news": "stage-9-about-news-legal",
    "partners": "stage-2-homepage",
}

# de ontwerpbeelden: naar de stage die ze gebruikt. Geen regex over de
# sjablonen, want een beeld dat in een sjabloon staat kan er ook in staan
# zonder dat die stage erover gaat; dit is de toewijzing met de hand, en de
# controle onderaan zegt wat er niet in een stage terechtkwam.
ONTWERP_STAGE = {
    "stage-1-shell": ["assets/logo/"],
    "stage-2-homepage": ["assets/img/hero-jump.jpg", "assets/img/about-owners.jpg",
                         "assets/img/results-unguessable.jpg", "assets/img/tab-"],
    "stage-3-sport-horses": ["assets/img/arch-sport"],
    "stage-4-breeding-mares": ["assets/img/arch-mares"],
    "stage-5-foals": ["assets/img/arch-foals"],
    "stage-6-embryos": ["assets/img/arch-embryos"],
    "stage-7-icsi-semen": ["assets/img/arch-semen"],
    "stage-8-contact": ["assets/img/hero-contact.jpg"],
    "stage-9-about-news-legal": ["assets/img/about-hero.jpg", "assets/img/bases-yard.jpg",
                                 "assets/img/intro-foal-star.jpg", "assets/img/hero-grey",
                                 "assets/img/offer-", "assets/img/news"],
}


def stage_map(slug):
    naam = {s["slug"]: s["drive_name"] for s in STAGES_MOD.STAGES}[slug]
    return os.path.join(WORTEL, "wordpress-elementor", naam)


def main():
    payload = json.load(open(PAYLOAD, encoding="utf-8"))
    media = payload["media"]

    # bron -> (stage, waar hij heen gaat)
    toewijzing = {}

    for groep, slug in GROEP_STAGE.items():
        for r in payload[groep]:
            paden = []
            if r.get("thumbnail"):
                paden.append((r["thumbnail"], "featured image"))
            for p in (r["fields"].get("gallery") or []):
                if p != r.get("thumbnail"):
                    paden.append((p, "gallery"))
            if r["fields"].get("logo"):
                paden.append((r["fields"]["logo"], "logo"))
            for p, veld in paden:
                toewijzing.setdefault(p, (slug, r["title"], veld))

    for slug, patronen in ONTWERP_STAGE.items():
        for p in media:
            if p in toewijzing:
                continue
            if any(p.startswith(pat) for pat in patronen):
                toewijzing[p] = (slug, "—", "design image")

    verweesd = [p for p in media if p not in toewijzing]

    # wegschrijven
    per_stage = {}
    for bron, (slug, waar, veld) in sorted(toewijzing.items()):
        per_stage.setdefault(slug, []).append((bron, waar, veld))

    totaal = 0
    for s in STAGES_MOD.STAGES:
        m = stage_map(s["slug"])
        ref = os.path.join(m, "media-reference")
        if os.path.isdir(ref):
            shutil.rmtree(ref)
        os.makedirs(ref, exist_ok=True)
        rijen = per_stage.get(s["slug"], [])
        for bron, _, _ in rijen:
            doel = os.path.join(ref, os.path.basename(bron))
            shutil.copy2(os.path.join(WORTEL, bron), doel)
        totaal += len(rijen)

        # de tabel achter de README aan
        readme = os.path.join(m, "README.md")
        tekst = open(readme, encoding="utf-8").read() if os.path.exists(readme) else ""
        tekst = tekst.split("\n## The photographs in this folder")[0].rstrip()
        if rijen:
            tekst += ("\n\n## The photographs in this folder\n\n"
                      "**Do not upload these.** They are already in the media library, put "
                      "there by the importer plugin in stage 2. They are here so you can "
                      "check that the right photograph landed in the right place. Uploading "
                      "them again gives every file a `-1` twin and the templates then point "
                      "at the wrong one.\n\n"
                      "| File in the media library | Belongs to | Used as |\n|---|---|---|\n")
            for bron, waar, veld in rijen:
                tekst += f"| `{os.path.basename(bron)}` | {waar} | {veld} |\n"
            tekst += f"\n{len(rijen)} files.\n"
        else:
            tekst += "\n\n## The photographs in this folder\n\nNone. This stage adds no images.\n"
        open(readme, "w", encoding="utf-8").write(tekst + "\n")
        print(f"  {s['drive_name']:44} {len(rijen):3} foto's")

    # de plugin-zips horen bij stage 2
    if os.path.isdir(PLUGINZIPS):
        doel = os.path.join(stage_map("stage-2-homepage"), "templates")
        for f in sorted(os.listdir(PLUGINZIPS)):
            if f.endswith(".zip"):
                shutil.copy2(os.path.join(PLUGINZIPS, f), os.path.join(doel, f))
                print(f"     plugin: {f}")

    print(f"\n{totaal} van de {len(media)} bestanden uit het manifest verdeeld")
    if verweesd:
        print(f"{len(verweesd)} kwamen in geen enkele stage terecht:")
        for p in verweesd[:20]:
            print("   ", p)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
