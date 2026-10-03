#!/usr/bin/env bash
# List local branches already merged into main (safe to delete).
# Usage: ./scripts/cleanup-branches.sh [--delete]

set -e
DELETE=false
if [ "${1:-}" = "--delete" ]; then
  DELETE=true
fi

BRANCHES=$(git branch --merged main | grep -v '^\*' | grep -v 'main' | tr -d ' ' | tr -d '\r')
if [ -z "$BRANCHES" ]; then
  echo "No merged branches to clean."
  exit 0
fi

echo "Merged branches (safe to delete):"
echo "$BRANCHES" | sed 's/^/  - /'
echo ""

if [ "$DELETE" = true ]; then
  echo "Deleting..."
  echo "$BRANCHES" | while read -r b; do
    [ -n "$b" ] && git branch -d "$b" 2>&1 | sed 's/^/  /'
  done
  echo "Done."
else
  echo "Run with --delete to remove them."
fi
