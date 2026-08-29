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
mkdir -p "$here/news"
rm -f "$here/news/"*.html
cp "$root/news/"*.html "$here/news/"
echo "copied index.html, news-data.js and $(ls "$here/news" | wc -l | tr -d ' ') news pages"

# ── only the assets the page actually references ──────────────────────
# Read out of index.html rather than copying the whole folder, so an
# unused or unreleased photograph can never reach the internet by sitting
# in the same directory as one that is used.
mkdir -p "$here/assets/img" "$here/assets/logo"
rm -f "$here/assets/img/"* "$here/assets/logo/"*
count=0
while IFS= read -r ref; do
  if [[ -f "$root/$ref" ]]; then
    cp "$root/$ref" "$here/$ref"
    count=$((count + 1))
  else
    echo "MISSING asset, refusing to publish: $ref" >&2
    exit 1
  fi
done < <(cat "$root/index.html" "$root/news-data.js" "$root/news/"*.html \
  | grep -oE 'assets/(img|logo)/[A-Za-z0-9._-]+' | sort -u)
echo "copied $count assets"

echo
echo "deploy/ now contains:"
(cd "$here" && find . -type f -not -path './.vercel/*' | sed 's|^\./|  |' | sort)
echo
echo "next: cd '$here' && vercel --prod"
