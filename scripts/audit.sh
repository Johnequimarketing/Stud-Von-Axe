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

# Every page on disk, found rather than listed. The list used to be typed out
# here, which meant a page nobody added to it was silently never audited: the
# contact page was built, passed nothing, and the run still said 79 pages.
# Excluded on purpose: deploy/ is the published copy, _archive/ is finished
# work, and the v2-* directories are git worktrees with their own repos.
# mapfile is bash 4; macOS ships bash 3.2, so the array is filled the portable
# way. No page here has a space in its name, and the audit fails loudly if the
# list comes back empty.
pages=()
while IFS= read -r f; do pages+=("$f"); done < <(
  find . -name '*.html' \
    -not -path './deploy/*' -not -path './_archive/*' -not -path './_to_delete/*' \
    -not -path './v2-*' -not -path './node_modules/*' -not -path './content/*' \
    -not -name '_*.html' \
    | sed 's|^\./||' | sort
)
if [ ${#pages[@]} -eq 0 ]; then
  echo "  FOUND NO PAGES. The audit refuses to report green on nothing."
  exit 1
fi

echo
echo "── Every page against the rules ──────────────────────────────"
echo "   ${#pages[@]} pages found on disk"
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
