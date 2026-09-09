"""Leest de tekst van de privacy- en voorwaardenpagina uit de statische site.

Niet overtypen en niet samenvatten: dit is juridische tekst en de klant heeft
hem goedgekeurd. Eén letter anders is een andere belofte. Het sjabloon droeg
eerst een plaatshouder met "de tekst komt tijdens de bouw over" — dat is werk
doorschuiven naar iemand die de tekst niet kent.

Schrijft elementor/juridisch.json.
"""
import html as htmllib
import json, os, re, sys

WORTEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def lees(pad):
    s = open(os.path.join(WORTEL, pad), encoding="utf-8").read()
    s = re.sub(r"<(script|style|svg)[\s\S]*?</\1>", "", s)
    s = re.sub(r"<!--[\s\S]*?-->", "", s)
    i = s.index('<section class="lg')
    j = s.rindex("</section>")
    blok = s[i:j]

    # de inhoudsopgave, in de orde waarin hij staat
    toc = [(m.group(1), re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m.group(2))).strip())
           for m in re.finditer(r'<a href="#([^"]+)" data-lg="[^"]*">([\s\S]*?)</a>', blok)]

    # en de body: elke <section id="sN"> in de kolom ernaast
    body = blok[blok.index('<div class="lg__body">'):]
    secties = []
    for m in re.finditer(r'<section id="([^"]+)">([\s\S]*?)</section>', body):
        anker, inhoud = m.group(1), m.group(2)
        kop = re.search(r"<h2[^>]*>([\s\S]*?)</h2>", inhoud)
        titel = (re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", kop.group(1))).strip()
                 if kop else "")
        rest = inhoud[kop.end():] if kop else inhoud
        # het nummertje boven de kop is opmaak van de statische pagina
        rest = re.sub(r'<span class="lg__no">[\s\S]*?</span>', "", rest)
        # alles wat een wysiwyg-veld niet hoeft te dragen
        rest = re.sub(r'\s*(class|id|style|data-[a-z-]+)="[^"]*"', "", rest)
        rest = re.sub(r"</?(?:div|section|span)[^>]*>", "", rest)
        rest = re.sub(r"[ \t]*\n[ \t]*", "\n", rest).strip()
        if titel and rest:
            secties.append({"anker": anker, "titel": titel, "html": rest})

    # de inhoudsopgave en de secties moeten dezelfde lijst zijn, in dezelfde orde
    if [a for a, _ in toc] != [x["anker"] for x in secties]:
        raise SystemExit(f"{pad}: de inhoudsopgave en de secties lopen uiteen:\n"
                         f"  toc     {[a for a, _ in toc]}\n"
                         f"  secties {[x['anker'] for x in secties]}")
    stempel = re.search(r'<p class="lg__stamp">([\s\S]*?)</p>', blok)
    return {"secties": secties,
            "stempel": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", stempel.group(1))).strip()
                       if stempel else ""}


if __name__ == "__main__":
    uit = {}
    for naam, pad in (("privacy", "privacy/index.html"), ("terms", "terms/index.html")):
        d = lees(pad)
        uit[naam] = d
        tekens = sum(len(re.sub(r"<[^>]+>", "", x["html"])) for x in d["secties"])
        print(f"  {naam:8} {len(d['secties']):2} secties, {tekens} tekens tekst")
        for x in d["secties"]:
            print(f"      {x['anker']}  {x['titel']}")
    if not all(x["secties"] for x in uit.values()):
        sys.exit("een van de twee pagina's leverde niets op")
    pad = os.path.join(os.path.dirname(os.path.abspath(__file__)), "juridisch.json")
    json.dump(uit, open(pad, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
