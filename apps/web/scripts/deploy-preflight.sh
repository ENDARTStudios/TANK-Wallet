#!/usr/bin/env bash
# TANK Wallet v1.1.0 — Deploy Preflight
# Executa validações antes de criar tag/deploy

set -e

echo "=== TSC ==="
bunx tsc --noEmit

echo "=== LINT ==="
bun run lint

echo "=== UNIT TESTS ==="
bun test src

echo "=== AUDIT:CODE ==="
bun run audit:code

echo "=== VERIFY ==="
bun run verify

echo "=== SECRETS CHECK ==="
LEAK=$(git ls-files | grep -E "^\.env$|pgp-private|secrets/" || true)
if [ -n "$LEAK" ]; then
  echo "FAIL: secrets found:"
  echo "$LEAK"
  exit 1
fi
echo "OK no secrets in tracked files"

echo "=== TAG ==="
git tag -l | grep "v1.1.0" || echo "v1.1.0 not found (run: git tag -a v1.1.0 -m 'v1.1.0')"

echo "=== GIT STATUS ==="
git status --porcelain

echo "=== DONE: ready to deploy ==="
