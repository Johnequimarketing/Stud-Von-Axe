"""Schrijft elementor/dekking.json: per statische pagina het aantal secties en
de koppen, zodat tools-controle.py de sjablonen ertegen kan houden.

Eén representatieve pagina per sjabloon. Honderdtweeëntwintig pagina's tellen
zou 122 keer hetzelfde bewijzen, want 110 daarvan komen uit acht patronen.
"""
import json, os, re, sys

WORTEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# sjabloon -> de pagina die hij moet kunnen tekenen
PAGINAS = {
    "home.json": "index.html",
    "about.json": "about/index.html",
    "contact.json": "contact/index.html",
    "privacy.json": "privacy/index.html",
    "terms.json": "terms/index.html",
    "404.json": "404.html",
    "archive-sport-horses.json": "sport-horses/index.html",
    "archive-breeding-mares.json": "breeding-mares/index.html",
    "archive-foals.json": "foals/index.html",
    "archive-embryos.json": "embryos/index.html",
    "archive-icsi-semen.json": "icsi-semen/index.html",
    "archive-news.json": "news/index.html",
    "single-sport-horses.json": "sport-horses/contouch-sva.html",
    "single-breeding-mares.json": "breeding-mares/cortina-de-jolie-z.html",
    "single-foals.json": "foals/arkhana-von-axe-z.html",
    "single-embryos.json": "embryos/big-star-x-cortina-de-jolie-z.html",
    "single-icsi-semen.json": "icsi-semen/big-star.html",
    "single-news.json": "news/icsi-semen-available.html",
}


def plat(x):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", x)).strip()


def lees(pad):
    s = open(os.path.join(WORTEL, pad), encoding="utf-8").read()
    s = re.sub(r"<!--[\s\S]*?-->", "", s)
    s = re.sub(r"<(script|style|svg)[\s\S]*?</\1>", "", s)
    i = s.find("<header")
    j = s.find("<footer")
    body = s[i:j] if i >= 0 and j > i else s
    secties = re.findall(r'<section[^>]*class="([^"]*)"', body)
    koppen = [plat(k) for _, k in re.findall(r"<(h1|h2)[^>]*>([\s\S]*?)</\1>", body)]
    return {"pagina": pad, "secties": len(secties), "klassen": secties,
            "h1_h2": len(koppen), "koppen": koppen}


if __name__ == "__main__":
    uit, ontbreekt = {}, []
    for sjabloon, pagina in PAGINAS.items():
        if not os.path.exists(os.path.join(WORTEL, pagina)):
            ontbreekt.append(pagina)
            continue
        uit[sjabloon] = lees(pagina)
    pad = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dekking.json")
    json.dump(uit, open(pad, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for s, d in uit.items():
        print(f"  {s:32} {d['secties']:2} secties  {d['h1_h2']:2} koppen  {d['pagina']}")
    if ontbreekt:
        print("\nNIET GEVONDEN:", ", ".join(ontbreekt))
        sys.exit(1)
    print(f"\n{len(uit)} pagina's in dekking.json")
