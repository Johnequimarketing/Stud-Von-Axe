#!/usr/bin/env python3
"""Build the placeholder pictures and film still used on horse pages that have
neither of their own.

Asked for on 30 Aug: without them Mark and his team cannot see what the gallery
and the film section are supposed to look like, because thirty five of the
sixty pages have no spare photograph and thirty eight have no film.

The rule that matters here: a placeholder must never be mistaken for a picture
of that horse. Each one is built from a general photograph of the yard, laid
under a heavy navy veil so it plainly is not a portrait, with PLACEHOLDER
written across it in the house gold and a line underneath saying what it is
standing in for. Provenance is not being bent: the caption on the page says so
too, and the audit counts them.

Run: python3 scripts/make-placeholders.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img", "placeholder")
os.makedirs(OUT, exist_ok=True)

NAVY = (10, 21, 38)
GOLD = (181, 145, 72)
IVORY = (250, 247, 242)

# General pictures of the place, never of one horse.
SOURCES = [
    ("gallery-1.jpg", "hero-grey-wide.jpg", (1100, 825)),
    ("gallery-2.jpg", "bases-yard.jpg",     (1100, 825)),
    ("gallery-3.jpg", "hero-neck-wide.jpg", (1100, 825)),
    ("gallery-4.jpg", "about-hero.jpg",     (1100, 825)),
    ("film.jpg",      "hero-sport.jpg",     (960, 540)),
]

def font(size, bold=True):
    for path in ("/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                 "/System/Library/Fonts/Supplemental/Arial.ttf",
                 "/Library/Fonts/Arial.ttf"):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def cover(im, size):
    w, h = size
    scale = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left, top = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((left, top, left + w, top + h))

for out_name, src_name, size in SOURCES:
    src = os.path.join(ROOT, "assets", "img", src_name)
    im = cover(Image.open(src).convert("RGB"), size)

    # Heavy navy veil: a placeholder should not read as a photograph anyone
    # chose, and the word on top has to hold its contrast over any frame.
    veil = Image.new("RGB", size, NAVY)
    im = Image.blend(im, veil, 0.78)

    d = ImageDraw.Draw(im)
    w, h = size
    big = font(round(w * 0.072))
    small = font(round(w * 0.024))

    word = "PLACEHOLDER"
    # Letter-spaced by hand: PIL has no tracking, and the house sets this
    # word wide.
    track = round(w * 0.012)
    widths = [d.textlength(c, font=big) for c in word]
    total = sum(widths) + track * (len(word) - 1)
    x = (w - total) / 2
    # The film still carries a play button dead centre on the page, so the
    # word sits above it rather than behind it.
    y = h * 0.20 if out_name == "film.jpg" else h * 0.40
    for c, cw in zip(word, widths):
        d.text((x, y), c, font=big, fill=GOLD)
        x += cw + track

    sub = "Film to be supplied" if out_name == "film.jpg" else "Photograph to be supplied"
    sw = d.textlength(sub, font=small)
    d.text(((w - sw) / 2, y + w * 0.098), sub, font=small, fill=IVORY)

    # A gold hairline over and under, so it reads as a marked-off frame.
    line_w = round(w * 0.30)
    for ly in (y - w * 0.035, y + w * 0.148):
        d.rectangle([(w - line_w) / 2, ly, (w + line_w) / 2, ly + 1], fill=GOLD)

    im.save(os.path.join(OUT, out_name), "JPEG", quality=80, optimize=True, progressive=True)
    print(f"  {out_name}  {size[0]}x{size[1]}  from {src_name}")

total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print(f"\n{len(SOURCES)} placeholders, {total/1024:.0f} KB in assets/img/placeholder")
