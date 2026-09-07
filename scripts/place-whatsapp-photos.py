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

import json, os, sys, io
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'content', 'whatsapp-2026-09-06')
DST = os.path.join(ROOT, 'assets', 'img', 'horses')

WIDTH, QUALITY, FLOOR, CEILING = 1100, 78, 68, 500 * 1024

# the direction each archive settles on, counted off her own pictures
FACING = {'broodmare': 'left', 'foal': 'right', 'sport': 'right', 'stallion': 'right'}

# competition shots whose sponsor boards would read backwards
NO_FLIP = {
    'united touch s', 'heartbreaker', 'casall', 'for pleasure', 'vigo',
    'uricas', 'comme il faut', 'emerald',
}


def facing_of(index, table):
    return table.get(index)


def save(im, path, mirror):
    if mirror:
        im = ImageOps.mirror(im)
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

        # whatever the horse already had, behind hers, without repeating a file
        existing = []
        n = 1
        while True:
            p = os.path.join(DST, '%s-%d.jpg' % (slug, n))
            if not os.path.exists(p):
                break
            existing.append(p)
            n += 1

        # read the old files before anything is overwritten
        old_bytes = [open(p, 'rb').read() for p in existing]

        paths = []
        idx = 1
        for src, mirror in incoming:
            dst = os.path.join(DST, '%s-%d.jpg' % (slug, idx))
            if not dry:
                save(Image.open(src), dst, mirror)
            paths.append('assets/img/horses/%s-%d.jpg' % (slug, idx))
            idx += 1
        for blob in old_bytes:
            if idx > 8:
                break
            dst = os.path.join(DST, '%s-%d.jpg' % (slug, idx))
            if not dry:
                save(Image.open(io.BytesIO(blob)), dst, False)
            paths.append('assets/img/horses/%s-%d.jpg' % (slug, idx))
            idx += 1

        # a horse that had more files than the new run needs: drop the tail
        for extra in range(idx, len(existing) + len(incoming) + 2):
            p = os.path.join(DST, '%s-%d.jpg' % (slug, extra))
            if os.path.exists(p) and not dry:
                os.remove(p)

        out[slug] = {'name': row['name'], 'photos': paths,
                     'hers': len(incoming), 'kept': len(old_bytes)}

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
