"""page-list.md voor stage 10: alle publieke pagina's, om af te lopen.

Geteld, niet opgeschreven. Een lijst die met de hand bijgehouden wordt, klopt
tot de eerste pagina die erbij komt.
"""
import os, sys, glob, re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib_axe import stage_folder

WORTEL = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIVE = "https://stud-von-axe-ten.vercel.app"
UIT = os.path.join(WORTEL, "wordpress-elementor", stage_folder("stage-10-check"), "templates")

MAPPEN = [
    ("Top level", ["index.html", "about/index.html", "contact/index.html",
                   "privacy/index.html", "terms/index.html", "404.html"]),
    ("Sport horses", None), ("Breeding mares", None), ("Foals", None),
    ("Embryos", None), ("ICSI semen", None), ("News", None),
]
MAP_VAN = {"Sport horses": "sport-horses", "Breeding mares": "breeding-mares",
           "Foals": "foals", "Embryos": "embryos", "ICSI semen": "icsi-semen",
           "News": "news"}


def titel(pad):
    s = open(os.path.join(WORTEL, pad), encoding="utf-8").read(4000)
    m = re.search(r"<title>(.*?)</title>", s, re.S)
    return re.sub(r"\s*\|\s*Stud Von Axe\s*$", "", m.group(1).strip()) if m else pad


if __name__ == "__main__":
    os.makedirs(UIT, exist_ok=True)
    regels = ["# Every public page, to walk against the live preview", "",
              f"Live preview: {LIVE}", "",
              "Tick a page when the heading text, the section order, the photographs and "
              "every link match. Write what does not match; do not fix it in this stage.",
              ""]
    totaal = 0
    for naam, vast in MAPPEN:
        if vast:
            paden = [p for p in vast if os.path.exists(os.path.join(WORTEL, p))]
        else:
            m = MAP_VAN[naam]
            paden = sorted(glob.glob(os.path.join(WORTEL, m, "*.html")))
            paden = [os.path.relpath(p, WORTEL) for p in paden]
            paden.sort(key=lambda p: (not p.endswith("index.html"), p))
        totaal += len(paden)
        regels += [f"## {naam} ({len(paden)})", ""]
        for p in paden:
            url = "/" + p.replace("index.html", "").replace(".html", "")
            regels.append(f"- [ ] {titel(p)} — `{url}`")
        regels.append("")
    regels.insert(5, f"**{totaal} pages.**")
    regels.insert(6, "")
    pad = os.path.join(UIT, "page-list.md")
    open(pad, "w", encoding="utf-8").write("\n".join(regels))
    print(f"  page-list.md   {totaal} pagina's")
