#!/usr/bin/env python3
"""Download the photographs horses-data.js points at, optimise them, and
write the local paths back into the data file.

Provenance is automatic here: every file comes from that horse's own page on
the client's site, which is the standing rule for naming a horse in a caption.

WordPress serves the same picture under several names: NB2_8000.jpg,
NB2_8000-scaled.jpg and NB2_8000-150x150.jpg are one photograph. They are
deduplicated on the stem, and the largest version wins.

Run after scripts/harvest-horses.mjs:  python3 scripts/fetch-horse-photos.py
"""
import json, os, re, subprocess, sys, urllib.request
from io import BytesIO
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img", "horses")
MAX_PER_HORSE = 8
WIDTH = 1100
QUALITY = 78

os.makedirs(OUT, exist_ok=True)

data = subprocess.run(
    ["node", "-e", "console.log(JSON.stringify(require('./horses-data.js')))"],
    cwd=ROOT, capture_output=True, text=True, check=True).stdout
horses = json.loads(data)

def stem(url):
    name = url.rsplit("/", 1)[-1]
    return re.sub(r"(-scaled)?\.(jpg|jpeg|png)$", "", name, flags=re.I).lower()

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (site rebuild for the owner)"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()

done = 0
skipped = 0
for horse in horses:
    picked, seen = [], set()
    for url in horse.get("photos", []):
        s = stem(url)
        if s in seen:
            continue
        seen.add(s)
        picked.append(url)
        if len(picked) >= MAX_PER_HORSE:
            break

    local = []
    for i, url in enumerate(picked, 1):
        target = f"{horse['slug']}-{i}.jpg"
        path = os.path.join(OUT, target)
        rel = f"assets/img/horses/{target}"
        if os.path.exists(path):
            local.append(rel)
            skipped += 1
            continue
        try:
            raw = fetch(url)
            im = Image.open(BytesIO(raw)).convert("RGB")
            w, h = im.size
            if w > WIDTH:
                im = im.resize((WIDTH, round(h * WIDTH / w)), Image.LANCZOS)
            im.save(path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            kb = os.path.getsize(path) / 1024
            if kb > 500:            # the audit's own ceiling
                im.save(path, "JPEG", quality=68, optimize=True, progressive=True)
            local.append(rel)
            done += 1
        except Exception as exc:                       # noqa: BLE001
            print(f"  could not take {url.rsplit('/', 1)[-1]} for {horse['name']}: {exc}", file=sys.stderr)
    horse["photos"] = local

src = os.path.join(ROOT, "horses-data.js")
head = open(src, encoding="utf-8").read().split("var HORSES =")[0]
with open(src, "w", encoding="utf-8") as f:
    f.write(head + "var HORSES = " + json.dumps(horses, indent=1, ensure_ascii=False) +
            ";\nif (typeof module !== 'undefined') module.exports = HORSES;\n")

total_kb = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)) / 1024
have = sum(1 for h in horses if h["photos"])
print(f"downloaded {done}, already had {skipped}")
print(f"{have} of {len(horses)} horses have a photograph, {total_kb/1024:.1f} MB in assets/img/horses")
