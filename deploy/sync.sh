#!/usr/bin/env bash
# Copy only the client facing pages into deploy/, then deploy that folder.
#
# Why a folder and not the project root: the root holds the briefing docs,
# which contain the client's phone numbers, street address, VAT number and
# our internal notes about the slipped deadline. Deploying the root would
# put all of that on a public URL. Only what is copied below goes out.

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(dirname "$here")"

for f in direction-a-classic.html direction-b-editorial.html direction-c-contemporary.html; do
  if [[ ! -f "$root/$f" ]]; then
    echo "missing: $f" >&2
    exit 1
  fi
  cp "$root/$f" "$here/$f"
  echo "copied $f"
done

echo
echo "deploy/ now contains:"
ls -1 "$here"
echo
echo "next: cd '$here' && vercel --prod"
