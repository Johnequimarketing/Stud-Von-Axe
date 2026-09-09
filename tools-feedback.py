#!/usr/bin/env python3
"""Controleert of elke feedback van Mark en de klant in de overdracht terugkomt.

Niet in mijn hoofd maar in een lijst, en de lijst noemt per punt waar het staat:
in de gegevens (dan hoeft John niets), in het sjabloon (dan mag hij het niet
weghalen), of in de taaktekst (dan moet hij er iets mee). Een punt dat alleen in
het sjabloon staat en niet in de tekst is het gevaarlijkst: dan haalt iemand het
per ongeluk weg en niemand weet meer dat het er hoorde.

Draai: python3 tools-feedback.py
"""
import glob, json, os, re, sys

WORTEL = os.path.dirname(os.path.abspath(__file__))

# de feedback, in de woorden waarin hij gegeven is, met waar hij terug te vinden
# hoort zijn en met welk zoekwoord dat te bewijzen is
FEEDBACK = [
 ("Google Maps eraf: het kantoor staat in Castelnuovo, de stal niet",
  "taak", "no Google Maps block"),
 ("Stud Von Axe SRL, Via per Arni, zonder huisnummer",
  "taak", "Via per Arni"),
 ("Op mobiel zijn de kaarten verticaal en niet vierkant",
  "taak", "taller than it is wide"),
 ("United Touch S x Cabri links uitlijnen, hoofd in beeld",
  "taak", "aligned left"),
 ("Elke kruising de gouden tagline met tekst",
  "taak", "gold tagline plate"),
 ("Veulenhero op mobiel: minder inzoomen, meer van het veulen",
  "taak", "upright crop"),
 ("De merriehero dekte te veel van de foto af",
  "taak", "veil over the photograph"),
 ("Eerst de implanted, dan de frozen kruisingen, niet door elkaar",
  "taak", "implanted embryos first"),
 ("Een sneeuwvlokje bij frozen, een zandloper bij dragend",
  "taak", "carries an emoji"),
 ("De partnersstrook op home, about en contact",
  "taak", "Partner post type"),
 ("De kop van het paard viel eraf, drie keer gemeld",
  "taak", "head being cut off"),
 ("Een vlaggetje bij sold, met het land",
  "taak", "flag of the country"),
 ("De volgorde van de ICSI semen is hun eigen lijst, niet alfabetisch",
  "taak", "not alphabetical"),
 ("Nooit zelfgemaakte logo's, alleen de aangeleverde bestanden",
  "taak", "two logo files"),
 ("De merries hebben geen selects meer sinds 3 september",
  "taak", "No selects on this archive"),
 ("Order your ICSI through us",
  "sjabloon", "Order your ICSI"),
 ("Drie generaties diep, ook bij de hengsten",
  "taak", "third generation"),
 ("De kruisingen van deze hengst op zijn eigen pagina",
  "taak", "Crosses relationship field"),
 ("Het watermerk van de fotograaf blijft tot SASSO levert",
  "taak", "SASSO"),
 ("Carma en Heaven staan nog op een concoursfoto",
  "taak", "Carma"),
 ("De taalkiezer heeft niets achter zich",
  "taak", "language switcher"),
 ("Het btw-nummer is nog niet bevestigd tegen de nieuwe naam",
  "taak", "IT02519980466"),
 ("Het kroontje: niemand heeft gezegd wat het betekent",
  "taak", "crown"),
 ("Een groter, stapsgewijs bestelformulier bij ICSI",
  "taak", "configurator"),
]


def lees(patroon):
    t = ""
    for f in glob.glob(os.path.join(WORTEL, patroon)):
        t += open(f, encoding="utf-8").read() + "\n"
    return t.lower()


def taak_en_readme_gelijk():
    """De taaktekst in ClickUp en de README in de Drive komen uit dezelfde
    functie, dus ze horen woord voor woord hetzelfde te zeggen.

    Dat is niet vanzelf zo gebleven: op 9 september waren een paar
    ClickUp-teksten met de hand rijker gemaakt dan de README's, en John die
    offline in de Drive leest had dan minder dan John die ClickUp leest. Deze
    controle vergelijkt de noten van beide en klaagt als er één alleen in de
    taak staat.
    """
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "_sva_stages", os.path.join(WORTEL, "tools-gen-stages.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    scheef = 0
    for stage in mod.STAGES:
        readme = os.path.join(WORTEL, "wordpress-elementor", stage["drive_name"],
                              "README.md")
        if not os.path.exists(readme):
            print(f"  MIST  stage {stage['n']}: geen README")
            scheef += 1
            continue
        tekst = open(readme, encoding="utf-8").read()
        mist = [n for n in stage["notes"] if n[:60] not in tekst]
        if mist:
            scheef += len(mist)
            for m in mist:
                print(f"  MIST  stage {stage['n']}: noot staat niet in de README: {m[:60]}")
    return scheef


if __name__ == "__main__":
    taken = lees("wordpress-elementor/*/README.md")
    sjablonen = lees("wordpress-elementor/*/templates/*.json") + lees(
        "wordpress-elementor/*/templates/*.txt")
    payload = open(os.path.join(WORTEL, "wp", "stud-von-axe-importer", "data",
                               "payload.json"), encoding="utf-8").read().lower()

    fout = 0
    print(f"{len(FEEDBACK)} feedbackpunten\n")
    for label, hoort, naald in FEEDBACK:
        n = naald.lower()
        waar = []
        if n in taken:
            waar.append("taak")
        if n in sjablonen:
            waar.append("sjabloon")
        if n in payload:
            waar.append("data")
        ok = hoort in waar
        if not ok:
            fout += 1
        print(f"  {'ok ' if ok else 'MIST'}  {label[:62]:62} {'+'.join(waar) or 'nergens'}")

    print("\nen staat elke noot uit de taak ook in de README die naar de Drive gaat")
    scheef = taak_en_readme_gelijk()
    print(f"  {'ok' if not scheef else str(scheef) + ' scheef'}")

    print("\nwat deze controle niet kan zien: of het punt goed is uitgevoerd. Hij "
          "bewijst dat het\nis opgeschreven waar iemand het tegenkomt, niet dat het "
          "klopt op het scherm.")
    if fout or scheef:
        print(f"\n{fout + scheef} punten staan niet waar ze horen")
        sys.exit(1)
    print("\nelk punt staat waar het hoort")
