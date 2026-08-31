#!/usr/bin/env python3
"""Build the picture that WhatsApp, Facebook and LinkedIn show when a page is shared.

Every page already names a photograph in og:image, and fifty of the fifty nine
were too small for the job: a share card wants 1200 by 630 and a harvested horse
photograph is at most 1100 wide and usually taller than it is wide. Under that
size the networks either blow the picture up until it is soft or drop the large
card and show a thumbnail beside the link, which is the difference between a
horse filling a phone screen and a grey square.

Cropping a standing horse to 1.91:1 would take a band across its middle, so
nothing is cropped: the photograph is fitted whole in the centre and the space
either side is the same photograph, blown up, blurred and darkened. The card is
full bleed, the horse is complete, and it is the horse's own colours behind it.

Written to assets/img/share/, one per source photograph, and the builders point
og:image there. Re-run it when the real photographs arrive.

    python3 scripts/make-share-cards.py
"""
import os
import sys
from PIL import Image, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'img', 'share')
W, H = 1200, 630

# Every photograph a page can name in og:image: the horses, and the section and
# hero pictures the pages without a horse of their own fall back to.
SOURCES = []
for rel in ('assets/img/horses', 'assets/img'):
    d = os.path.join(ROOT, rel)
    for name in sorted(os.listdir(d)):
        if name.lower().endswith(('.jpg', '.jpeg', '.png')) and os.path.isfile(os.path.join(d, name)):
            SOURCES.append((rel, name))


def card(src_path):
    im = Image.open(src_path).convert('RGB')

    # The ground: the same picture, filled to the card and blurred so it reads
    # as colour rather than as a second photograph.
    scale = max(W / im.width, H / im.height)
    bg = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    left = (bg.width - W) // 2
    top = (bg.height - H) // 2
    bg = bg.crop((left, top, left + W, top + H))
    bg = bg.filter(ImageFilter.GaussianBlur(28))
    bg = ImageEnhance.Brightness(bg).enhance(0.55)

    # The picture itself, whole, as large as it goes.
    fit = min(W / im.width, H / im.height)
    fg = im.resize((max(1, round(im.width * fit)), max(1, round(im.height * fit))), Image.LANCZOS)
    bg.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2))
    return bg


os.makedirs(OUT, exist_ok=True)
made = 0
for rel, name in SOURCES:
    src = os.path.join(ROOT, rel, name)
    stem = os.path.splitext(name)[0]
    # One flat namespace: a horse photograph and a section photograph never
    # share a name, and the builders only have the file name to work with.
    dst = os.path.join(OUT, stem + '.jpg')
    try:
        card(src).save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
        made += 1
    except Exception as e:                                   # noqa: BLE001
        print('  could not read %s/%s: %s' % (rel, name, e), file=sys.stderr)

print('built %d share cards at %dx%d in assets/img/share' % (made, W, H))
