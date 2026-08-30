#!/usr/bin/env python3
"""Read the YouTube ids harvested onto each horse, fetch the title and the
poster frame for each one, and write horses-videos.js.

The poster is stored locally on purpose. A YouTube iframe on page load hands
every visitor to Google before they have asked to watch anything; with a local
still and a play button, nothing leaves the site until the visitor clicks. It
is also faster: a still is 40 KB, an embedded player is a megabyte.

Titles come from YouTube's oEmbed endpoint, which is public and needs no key.
A film whose title cannot be read keeps the horse's name as its label rather
than an empty one.

Run after scripts/harvest-horses.mjs:  python3 scripts/fetch-videos.py
"""
import json, os, re, subprocess, urllib.request, urllib.error
from io import BytesIO
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img", "video")
WIDTH, QUALITY = 960, 78
os.makedirs(OUT, exist_ok=True)

horses = json.loads(subprocess.run(
    ["node", "-e", "console.log(JSON.stringify(require('./horses-data.js')))"],
    cwd=ROOT, capture_output=True, text=True, check=True).stdout)

def get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (site rebuild for the owner)"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def title_of(vid):
    try:
        raw = get(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json")
        return json.loads(raw).get("title", "").strip()
    except Exception:
        return ""

def poster_of(vid):
    """maxres is the 1280 wide still and does not exist for every film; sd and
    hq always do. Tried largest first so the still is never upscaled."""
    for name in ("maxresdefault", "sddefault", "hqdefault"):
        try:
            raw = get(f"https://img.youtube.com/vi/{vid}/{name}.jpg")
        except urllib.error.HTTPError:
            continue
        im = Image.open(BytesIO(raw)).convert("RGB")
        # hqdefault comes back 480x360 with black bars top and bottom; the
        # frame itself is the middle 480x270.
        if name == "hqdefault" and im.size == (480, 360):
            im = im.crop((0, 45, 480, 315))
        if im.width > WIDTH:
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        path = os.path.join(OUT, f"{vid}.jpg")
        im.save(path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        return f"assets/img/video/{vid}.jpg", im.size
    return "", (0, 0)

meta, seen, films = {}, set(), 0
for h in horses:
    for vid in h.get("videos", []):
        films += 1
        if vid in seen:
            continue
        seen.add(vid)
        title = title_of(vid)
        poster, size = poster_of(vid)
        meta[vid] = {"title": title, "poster": poster, "w": size[0], "h": size[1],
                     "horse": h["name"]}
        print(f"  {vid}  {size[0]}x{size[1]}  {title[:60] or '(no title)'}")

total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print(f"\n{len(meta)} films on {films} placements, {total/1e6:.1f} MB in assets/img/video")

with open(os.path.join(ROOT, "horses-videos.js"), "w", encoding="utf-8") as f:
    f.write("""/* Title and poster frame for every film on a horse's page, read from
   YouTube by scripts/fetch-videos.py. The ids themselves live on the horse in
   horses-data.js; this is only what is needed to show the film without
   loading YouTube on arrival. Regenerate rather than edit. */
var HORSE_VIDEOS = """ + json.dumps(meta, indent=1, ensure_ascii=False) + """;
if (typeof module !== 'undefined') module.exports = HORSE_VIDEOS;
""")
print("wrote horses-videos.js")
