#!/usr/bin/env bash
# The whole audit, in one command. Run it after every change.
#
#   bash scripts/audit.sh
#
# Three passes. The first holds every page to the rules on its own: tokens, the
# type scale, contrast, the words this market uses, headings, the search head,
# links, assets, and whether the inline scripts parse and have controls behind
# them. The second holds the pages to each other and to horses-data.js: the
# same horse spelled the same way everywhere, every figure traceable to the
# record, one set of layout tokens, no card pointing at a page that is not
# there. The third renders every horse page in Chrome and measures it, because
# a flex rule aimed at one column and applied to both spills a paragraph across
# the page without changing a single character of markup.
#
# Anything not green here does not go out.
set -uo pipefail
cd "$(dirname "$0")/.."

pages=(index.html about/index.html news/index.html news/*.html
       breeding-mares/*.html foals/*.html embryos/*.html sport-horses/*.html
       00-design-system.html 01-build-checklist.html 02-feedback-log.html
       04-embryo-cards.html 05-embryo-lines.html 06-embryo-head.html
       07-horse-contact.html)

echo
echo "── Every page against the rules ──────────────────────────────"
node scripts/audit-homepage.mjs "${pages[@]}" | tail -3
a=${PIPESTATUS[0]}

echo "── The pages against each other and the data ─────────────────"
node scripts/audit-site.mjs | tail -12
b=${PIPESTATUS[0]}

# The third pass needs Chrome and the dev server, because it is about the
# rendered result rather than the markup. Skipped, loudly, when either is
# missing: a check that quietly does not run is worse than no check.
c=0
if curl -sf -o /dev/null "http://localhost:5187/"; then
  echo "── The rendered pages, measured in a browser ─────────────────"
  node scripts/audit-layout.mjs | tail -8
  c=${PIPESTATUS[0]}
else
  echo "── The rendered pages ───────────────────────────────────────"
  echo "  SKIPPED: no dev server on :5187, so layout was not measured."
  c=1
fi

echo
if [ "$a" -eq 0 ] && [ "$b" -eq 0 ] && [ "$c" -eq 0 ]; then
  echo "  All three passes green across ${#pages[@]} pages."
else
  echo "  NOT GREEN. Nothing goes out until it is."
fi
exit $(( a + b + c ))
