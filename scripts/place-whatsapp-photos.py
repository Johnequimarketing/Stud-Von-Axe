#!/usr/bin/env python3
"""Place the photographs from the WhatsApp export of 6 September.

Reads content/whatsapp-2026-09-06/parsed.json, resizes each picture to the
convention fetch-horse-photos.py already set (1100 wide, q78, under 500 KB,
never enlarged) and writes them as assets/img/horses/<slug>-<n>.jpg.

Her photographs come first, in the order she sent them: the one she called
the "main pic" becomes -1, the "face inside" shots follow. Whatever the horse
already had is kept behind them, so nothing is lost, and the whole run is
renumbered so the naming convention holds.

Facing
------
She asked three times for the horses to look the same way on a page. Counted
off the pictures themselves: the mares are four to two facing left, the sport
horses eleven out of eleven facing right, the foals sixteen to five right.
So the target is per archive, which is where the cards sit beside each other.

Two things this will NOT flip, and both are deliberate:

* Competition photographs with legible sponsor boards. Seven of the nine
  left-facing stallion shots carry LONGINES, ROLEX or Allianz in frame, and a
  mirrored logo is visibly wrong. They stay as they are and are reported.
* Nothing at all, unless MIRROR says so. A mirrored horse wears its blaze and
  its socks on the wrong side, which is the one thing a buyer checks a
  photograph for. Every flip here is one Mark asked for on 7 September.

Usage:  python3 scripts/place-whatsapp-photos.py [--dry-run]
"""

import json, os, sys, io, re, subprocess
from PIL import Image, ImageOps, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'content', 'whatsapp-2026-09-06')
DST = os.path.join(ROOT, 'assets', 'img', 'horses')

WIDTH, QUALITY, FLOOR, CEILING = 1100, 78, 68, 500 * 1024

# The commit before the WhatsApp batch went in. Everything a horse owned at
# that point is read from here, so running this script twice cannot stack.
BASELINE = '2422cdb'
BEFORE = subprocess.run(
    ['git', 'ls-tree', '-r', '--name-only', BASELINE, 'assets/img/horses/'],
    cwd=ROOT, capture_output=True, text=True).stdout.split()

def git_show(path):
    return subprocess.run(['git', 'show', BASELINE + ':' + path],
                          cwd=ROOT, capture_output=True).stdout

# Photographs Mark supplied on 7 September, which take the card slot from
# whatever was there. Diabalou is the same shoot as hers, framed wider, so
# the horse survives the square crop; Filou's old one is a competition shot
# with another photographer's watermark across it. Their file is dropped, not
# pushed back, because in both cases the new one is the better of the two.
SUPPLIED = {
    'filou': 'content/manual-photos/filou.jpeg',
    'diabalou-sva': 'content/manual-photos/diabalou-sva.jpeg',
    # Sent later the same afternoon: the same shoot again, framed wide enough
    # that the whole horse survives the square card crop on its own. It needs
    # no composed background, which is why it is not in SQUARE.
    'unguessable-von-axe': 'content/manual-photos/unguessable-von-axe.jpeg',
    'waikiki-vd-berghoeve': 'content/manual-photos/waikiki-vd-berghoeve.jpeg',
    # A better frame, but still 1.58 to 1, so the square card would take his
    # muzzle off. This one is supplied AND composed: the new photograph on a
    # square ground of its own.
    'diamecho-von-axe-z': 'content/manual-photos/diamecho-von-axe-z.jpeg',
    'cacao-von-axe-z': 'content/manual-photos/cacao-von-axe-z.jpeg',
}

# The card window is square and a landscape photograph loses a third of its
# width to it, which is why these four lost a head or a tail. Their card
# picture is composed onto a square instead of cut to one: the whole horse,
# with the space around him filled from the same photograph, enlarged and
# blurred. Nothing is invented and nothing of the horse is lost. Mark named
# these four on 7 September.
# Empty, and that is the good outcome. Four horses were listed here on
# 7 September because the square card cut them; Mark then found a wider frame
# of each, and a real photograph beats a composed one every time. Diamecho is
# the one exception and he is handled below. The machinery stays: the next
# horse whose card cuts him goes in here and needs nothing else.
SQUARE = {'diamecho-von-axe-z'}


def to_square(im, margin=0.03):
    side = max(im.size)
    w, h = im.size
    bg = im.resize((int(w * max(side / w, side / h) * 1.25),
                    int(h * max(side / w, side / h) * 1.25)), Image.LANCZOS)
    bg = bg.crop(((bg.width - side) // 2, (bg.height - side) // 2,
                  (bg.width - side) // 2 + side, (bg.height - side) // 2 + side))
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(side // 40))).enhance(0.82)
    inner = int(side * (1 - margin * 2))
    f = min(inner / w, inner / h)
    fg = im.resize((int(w * f), int(h * f)), Image.LANCZOS)
    bg.paste(fg, ((side - fg.width) // 2, (side - fg.height) // 2))
    return bg


# the direction each archive settles on, counted off her own pictures
FACING = {'broodmare': 'left', 'foal': 'right', 'sport': 'right', 'stallion': 'right'}

# competition shots whose sponsor boards would read backwards
NO_FLIP = {
    'united touch s', 'heartbreaker', 'casall', 'for pleasure', 'vigo',
    'uricas', 'comme il faut', 'emerald',
}


# A horse she never sent a new photograph of, but whose old one has to turn.
# Agousha, 6 September 09:24: "Can you turn also Agousha to have all of them
# looking to the same side". She sent a picture of her own screen with it, not
# a picture of the horse, so the one already on the site is the one to flip.
TURN_EXISTING = {
    'agousha-vd-berghoeve-z',
    # Purple Rain is a sold foal she sent no new picture of, and the one on
    # the site faced left while the other nineteen foals face right.
    'purple-rain-von-axe-z',
}


def save(im, path, mirror, square=False):
    if mirror:
        im = ImageOps.mirror(im)
    if square:
        im = to_square(im)
    w, h = im.size
    if w > WIDTH:
        im = im.resize((WIDTH, round(h * WIDTH / w)), Image.LANCZOS)
    im = im.convert('RGB')
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
    if buf.tell() > CEILING:
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=FLOOR, optimize=True, progressive=True)
    with open(path, 'wb') as f:
        f.write(buf.getvalue())
    return buf.tell(), im.size


def main():
    dry = '--dry-run' in sys.argv
    data = json.load(open(os.path.join(SRC, 'parsed.json')))
    faces = json.load(open(os.path.join(SRC, 'facing.json')))

    os.makedirs(DST, exist_ok=True)
    out, flipped, skipped, kept_text = {}, [], [], []

    for row in data['rows']:
        slug = row.get('slug')
        if not slug:
            skipped.append(row['name'] + ' (no slug)')
            continue
        want = FACING.get(row['block'])

        # what she sent, in her order
        incoming = []
        for sh in row['shots']:
            src = os.path.join(SRC, sh['file'])
            if not os.path.exists(src):
                skipped.append(row['name'] + ' ' + sh['file'])
                continue
            has = faces.get(sh['file'])
            # 'front' is a head portrait looking at the camera. It has no side
            # to line up, so flipping one only moves a blaze. Only a horse
            # standing or jumping in profile is ever turned.
            mirror = bool(want and has in ('left', 'right') and has != want)
            if mirror and row['name'].lower() in NO_FLIP:
                kept_text.append('%s  %s  faces %s, left alone: sponsor boards'
                                 % (row['name'], sh['at'], has))
                mirror = False
            if mirror:
                flipped.append('%s  %s  %s -> %s' % (row['name'], sh['at'], has, want))
            incoming.append((src, mirror))

        # What the horse had before this batch, read out of the commit that
        # came before it rather than off the disk. Reading the directory made
        # the script count its own previous output as "existing", so every run
        # appended her photographs again: 151 files became 215, then 271.
        # git is the one record of the state before 6 September that a re-run
        # cannot corrupt, which is what makes this repeatable.
        existing = [p for p in BEFORE if re.fullmatch(re.escape(slug) + r'-\d+\.jpg', os.path.basename(p))]
        existing.sort(key=lambda p: int(re.search(r'-(\d+)\.jpg$', p).group(1)))
        old_bytes = [git_show(p) for p in existing]

        if slug in SUPPLIED:
            incoming = [(os.path.join(ROOT, SUPPLIED[slug]), False)]

        paths = []
        idx = 1
        for src, mirror in incoming:
            dst = os.path.join(DST, '%s-%d.jpg' % (slug, idx))
            if not dry:
                save(Image.open(src), dst, mirror, square=(idx == 1 and slug in SQUARE))
            paths.append('assets/img/horses/%s-%d.jpg' % (slug, idx))
            idx += 1
        turn = slug in TURN_EXISTING
        for n, blob in enumerate(old_bytes):
            if idx > 8:
                break
            dst = os.path.join(DST, '%s-%d.jpg' % (slug, idx))
            if not dry:
                save(Image.open(io.BytesIO(blob)), dst, turn and n == 0,
                     square=(idx == 1 and slug in SQUARE))
            paths.append('assets/img/horses/%s-%d.jpg' % (slug, idx))
            idx += 1

        # a horse that had more files than the new run needs: drop the tail
        for extra in range(idx, len(existing) + len(incoming) + 2):
            p = os.path.join(DST, '%s-%d.jpg' % (slug, extra))
            if os.path.exists(p) and not dry:
                os.remove(p)

        out[slug] = {'name': row['name'], 'photos': paths,
                     'hers': len(incoming), 'kept': len(old_bytes)}

    # A horse she sent nothing for is never in data['rows'], so the loop above
    # never reaches it. Purple Rain is one: a sold foal facing the wrong way
    # with no replacement coming. Turned here, from the baseline, so a re-run
    # gives the same picture rather than flipping it back and forth.
    # a supplied photograph for a horse she sent nothing for
    for slug, rel in SUPPLIED.items():
        if slug in out:
            continue
        old = [p for p in BEFORE if re.fullmatch(re.escape(slug) + r'-\d+\.jpg', os.path.basename(p))]
        if not dry:
            save(Image.open(os.path.join(ROOT, rel)),
                 os.path.join(DST, '%s-1.jpg' % slug), False)
        for n in range(2, len(old) + 2):
            f = os.path.join(DST, '%s-%d.jpg' % (slug, n))
            if os.path.exists(f) and not dry:
                os.remove(f)
        out[slug] = {'name': slug, 'photos': ['assets/img/horses/%s-1.jpg' % slug],
                     'hers': 1, 'kept': 0}

    for slug in sorted(SQUARE | TURN_EXISTING):
        if slug in out:
            continue
        first = 'assets/img/horses/%s-1.jpg' % slug
        if first not in BEFORE:
            skipped.append(slug + ' (nothing to turn)')
            continue
        if not dry:
            save(Image.open(io.BytesIO(git_show(first))), os.path.join(ROOT, first),
                 slug in TURN_EXISTING, square=slug in SQUARE)
        flipped.append('%s  the picture already on the site, %s' % (
            slug, 'turned' if slug in TURN_EXISTING else 'squared'))

    # the two archive heroes she offered, and her screen shot, which is not a horse
    heroes = {}
    for sh in data['shots']:
        role = sh.get('role') or ''
        if role.startswith('page image for'):
            heroes[role.replace('page image for ', '').strip()] = sh['file']

    if not dry:
        json.dump({'horses': out, 'heroes': heroes},
                  open(os.path.join(SRC, 'placed.json'), 'w'), indent=1)

    print('%s%d horses, %d of her photographs placed, %d kept from before'
          % ('DRY RUN  ' if dry else '', len(out),
             sum(v['hers'] for v in out.values()),
             sum(v['kept'] for v in out.values())))
    print('mirrored %d:' % len(flipped))
    for f in flipped:
        print('   ' + f)
    if kept_text:
        print('left as they are, %d:' % len(kept_text))
        for f in kept_text:
            print('   ' + f)
    if skipped:
        print('skipped %d: %s' % (len(skipped), ', '.join(skipped[:6])))
    print('archive heroes offered: ' + ', '.join(heroes) if heroes else '')


if __name__ == '__main__':
    main()
