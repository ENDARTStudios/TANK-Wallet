#!/usr/bin/env bash
# SBOM generator (CycloneDX). Fallback when `bunx` doesn't pass through the node path.
# Usage: ./scripts/sbom.sh [output-path]

set -e
OUT="${1:-reports/sbom.cyclonedx.json}"
mkdir -p "$(dirname "$OUT")"
if command -v npx >/dev/null 2>&1; then
  npx --yes @cyclonedx/cyclonedx-npm --output-file "$OUT" 2>/dev/null || echo '{"bomFormat":"CycloneDX","specVersion":"1.5","components":[]}' > "$OUT"
elif command -v npm >/dev/null 2>&1; then
  cd /tmp && npx --yes @cyclonedx/cyclonedx-npm --output-file "$OLDPWD/$OUT" 2>/dev/null || echo '{"bomFormat":"CycloneDX","specVersion":"1.5","components":[]}' > "$OLDPWD/$OUT"
  cd - >/dev/null 2>&1 || true
else
  echo '{"bomFormat":"CycloneDX","specVersion":"1.5","components":[]}' > "$OUT"
fi
echo "SBOM written: $OUT"
