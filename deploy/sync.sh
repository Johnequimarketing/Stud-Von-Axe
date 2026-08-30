#!/usr/bin/env bash
# Copy the site, and ONLY the site, into deploy/ before publishing it.
#
# Why a folder and not the project root: the root holds the briefing
# documents, which carry the client's phone numbers, street address, VAT
# number and our own notes about the slipped deadline. It also holds four
# internal working documents: the design system, the build checklist, the
# feedback log with Mark's own words in it, and a photo library that links
# to 215 originals. None of that belongs on a public URL.
#
# So this copies by whitelist, never by exclusion. A file that is not named
# here does not go out, which is the only way round that stays safe when
# someone adds a file and forgets about this script.

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(dirname "$here")"

# ── the pages ─────────────────────────────────────────────────────────
cp "$root/index.html" "$here/index.html"
cp "$root/news-data.js" "$here/news-data.js"
cp "$root/horses-home.js" "$here/horses-home.js"
# One internal document goes out on purpose: the card variations Mark has to
# choose from, so he can look at them on a phone. It carries noindex and no
# client data. Take this line out once a variation is chosen.
cp "$root/04-embryo-cards.html" "$here/04-embryo-cards.html"
cp "$root/05-embryo-lines.html" "$here/05-embryo-lines.html"
cp "$root/06-embryo-head.html" "$here/06-embryo-head.html"
mkdir -p "$here/news"
rm -f "$here/news/"*.html
cp "$root/news/"*.html "$here/news/"
mkdir -p "$here/about"
rm -f "$here/about/"*.html
cp "$root/about/index.html" "$here/about/index.html"
for group in breeding-mares foals embryos sport-horses; do
  mkdir -p "$here/$group"
  rm -f "$here/$group/"*.html
  cp "$root/$group/"*.html "$here/$group/"
done
echo "copied index.html, news-data.js, the about page, $(ls "$here/news" | wc -l | tr -d ' ') news pages and $(cat "$here"/breeding-mares/*.html "$here"/foals/*.html "$here"/embryos/*.html "$here"/sport-horses/*.html 2>/dev/null | grep -c '<!DOCTYPE') horse pages"

# ── only the assets the page actually references ──────────────────────
# Read out of index.html rather than copying the whole folder, so an
# unused or unreleased photograph can never reach the internet by sitting
# in the same directory as one that is used.
mkdir -p "$here/assets/img/horses" "$here/assets/img/video" "$here/assets/logo"
rm -f "$here/assets/img/"*.jpg "$here/assets/img/"*.png "$here/assets/img/horses/"* "$here/assets/img/video/"* "$here/assets/logo/"*
count=0
while IFS= read -r ref; do
  if [[ -f "$root/$ref" ]]; then
    cp "$root/$ref" "$here/$ref"
    count=$((count + 1))
  else
    echo "MISSING asset, refusing to publish: $ref" >&2
    exit 1
  fi
done < <(cat "$root/index.html" "$root/news-data.js" "$root/news/"*.html "$root/about/index.html" \
  "$root/breeding-mares/"*.html "$root/foals/"*.html "$root/embryos/"*.html "$root/sport-horses/"*.html \
  | grep -oE 'assets/(img/horses|img/video|img|logo)/[A-Za-z0-9._-]+' | sort -u)
echo "copied $count assets"

echo
echo "deploy/ now contains:"
(cd "$here" && find . -type f -not -path './.vercel/*' | sed 's|^\./|  |' | sort)
echo
echo "next: cd '$here' && vercel --prod"
