#!/usr/bin/env python3
"""Take their own embryo card designs out of the photograph list.

Six of the fifteen crosses have a "photograph" that is not one: it is their
old card design, a flat navy field with the pairing set in type and an orange
FROZEN button, none of which is in this palette. Cropped into our frame it
loses half its own text and prints the cross twice.

They are found rather than listed by hand: a photograph almost never has more
than 45% of its pixels within a few points of one dark navy AND an orange this
site never uses. Verified against all 113 files; the only near miss was a bay
in front of a hedge at 21%, well under the line.

Run after fetch-horse-photos.py:  python3 scripts/mark-graphics.py
"""
import json, os, subprocess
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def is_their_card(path):
    im = Image.open(path).convert("RGB").resize((120, 120))
    px = list(im.getdata()); n = len(px)
    navy = sum(1 for r, g, b in px if r < 45 and g < 55 and b < 80 and abs(g - r) < 30)
    orange = sum(1 for r, g, b in px if r > 200 and 100 < g < 190 and b < 90)
    red = sum(1 for r, g, b in px if r > 140 and g < 80 and b < 80)
    # The FROZEN button is orange and the IMPLANTED one is red; the first
    # pass only knew about the orange and let a card through.
    return navy / n > 0.45 and (orange + red) / n > 0.004

horses = json.loads(subprocess.run(
    ["node", "-e", "console.log(JSON.stringify(require('./horses-data.js')))"],
    cwd=ROOT, capture_output=True, text=True, check=True).stdout)

moved = 0
for h in horses:
    keep, theirs = [], []
    for rel in h.get("photos", []):
        p = os.path.join(ROOT, rel)
        if os.path.exists(p) and is_their_card(p):
            theirs.append(rel); moved += 1
        else:
            keep.append(rel)
    h["photos"] = keep
    if theirs:
        h["theirCard"] = theirs          # kept, not deleted: it is their artwork
src = os.path.join(ROOT, "horses-data.js")
head = open(src, encoding="utf-8").read().split("var HORSES =")[0]
with open(src, "w", encoding="utf-8") as f:
    f.write(head + "var HORSES = " + json.dumps(horses, indent=1, ensure_ascii=False) +
            ";\nif (typeof module !== 'undefined') module.exports = HORSES;\n")

without = [h["name"] for h in horses if not h["photos"]]
print(f"moved {moved} of their own card designs out of the photo lists")
print(f"{len(without)} horses now have no photograph: {', '.join(n[:34] for n in without)}")
