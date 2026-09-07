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
cp "$root/sitemap.xml" "$here/sitemap.xml"
cp "$root/robots.txt" "$here/robots.txt"
# Four variation documents used to be published here so Mark could pick a
# design on his phone. Every one of those choices has been made and built, so
# they came off the site and out of the repository on 31 Aug. Which variation
# won is written beside the code that carries it.
mkdir -p "$here/news"
rm -f "$here/news/"*.html
cp "$root/news/"*.html "$here/news/"
mkdir -p "$here/about"
rm -f "$here/about/"*.html
cp "$root/about/index.html" "$here/about/index.html"
mkdir -p "$here/contact" && cp "$root/contact/index.html" "$here/contact/index.html"
mkdir -p "$here/privacy" && cp "$root/privacy/index.html" "$here/privacy/index.html"
mkdir -p "$here/terms" && cp "$root/terms/index.html" "$here/terms/index.html"
cp "$root/404.html" "$here/404.html"
for group in breeding-mares foals embryos sport-horses icsi-semen; do
  mkdir -p "$here/$group"
  rm -f "$here/$group/"*.html
  cp "$root/$group/"*.html "$here/$group/"
done
echo "copied index.html, news-data.js, the about page, $(ls "$here/news" | wc -l | tr -d ' ') news pages and $(cat "$here"/breeding-mares/*.html "$here"/foals/*.html "$here"/embryos/*.html "$here"/sport-horses/*.html "$here"/icsi-semen/*.html 2>/dev/null | grep -c '<!DOCTYPE') horse pages"

# ── the scripts the pages actually reference ──────────────────────────
# Read out of the pages, the way the photographs below are, and for the same
# reason. This was two typed lines, news-data.js and horses-home.js, and on
# 4 Sep it cost a published page its content: home-tabs.js and
# results-data.js were added to index.html, nobody added them here, and the
# tab panel on the live homepage stayed shut because the file it reads was a
# 404. The same list was still copying horses-home.js, which nothing has
# referenced since the card runs came off.
# A missing script refuses the publish, exactly like a missing photograph.
rm -f "$here/"*.js
while IFS= read -r js; do
  if [[ -f "$root/$js" ]]; then
    cp "$root/$js" "$here/$js"
  else
    echo "MISSING script, refusing to publish: $js" >&2
    exit 1
  fi
done < <(cat "$root/index.html" "$root/news/"*.html "$root/about/index.html" \
  "$root/breeding-mares/"*.html "$root/foals/"*.html "$root/embryos/"*.html \
  "$root/sport-horses/"*.html "$root/icsi-semen/"*.html "$root/contact/index.html" \
  "$root/privacy/index.html" "$root/terms/index.html" "$root/404.html" 2>/dev/null \
  | grep -o 'src="[^"]*\.js"' | sed 's/src="//;s/"//' | sort -u)
echo "copied $(ls "$here"/*.js 2>/dev/null | wc -l | tr -d ' ') script(s) the pages reference"

# ── only the assets the page actually references ──────────────────────
# Read out of index.html rather than copying the whole folder, so an
# unused or unreleased photograph can never reach the internet by sitting
# in the same directory as one that is used.
mkdir -p "$here/assets/img/horses" "$here/assets/img/video" "$here/assets/img/placeholder" "$here/assets/img/share" "$here/assets/logo"
rm -f "$here/assets/img/"*.jpg "$here/assets/img/"*.png "$here/assets/img/horses/"* "$here/assets/img/video/"* "$here/assets/img/placeholder/"* "$here/assets/img/share/"* "$here/assets/logo/"*
count=0
while IFS= read -r ref; do
  if [[ -f "$root/$ref" ]]; then
    cp "$root/$ref" "$here/$ref"
    count=$((count + 1))
  else
    echo "MISSING asset, refusing to publish: $ref" >&2
    exit 1
  fi
# Every page that is published, and every script that is published with it.
# The scripts were a hand-picked one, news-data.js, and on 7 Sep the five new
# tab pictures went live as 404s because home-tabs.js is the only file that
# names them and nothing was reading it. The scripts in "$here" are exactly
# the ones the pages asked for, copied a few lines above, so scanning those
# closes the hole rather than lengthening the list again.
done < <(cat "$root/index.html" "$root/news/"*.html "$root/about/index.html" \
  "$root/breeding-mares/"*.html "$root/foals/"*.html "$root/embryos/"*.html "$root/sport-horses/"*.html \
  "$root/icsi-semen/"*.html "$root/contact/index.html" \
  "$root/privacy/index.html" "$root/terms/index.html" "$root/404.html" \
  "$here/"*.js \
  | grep -oE 'assets/(img/horses|img/video|img/placeholder|img/share|img|logo)/[A-Za-z0-9._-]+' | sort -u)
echo "copied $count assets"

echo
echo "deploy/ now contains:"
(cd "$here" && find . -type f -not -path './.vercel/*' | sed 's|^\./|  |' | sort)
echo
echo "next: cd '$here' && vercel --prod"
