#!/bin/bash
# Run Echidna property tests on all contracts with .yaml config.
# Echidna tests invariantes — properties that must always hold true.
# Documentation: https://github.com/crytic/echidna

set -euo pipefail

CONTRACTS_DIR="${1:-contracts}"
ECHIDNA_CONFIG="${2:-echidna.yaml}"

if [ ! -d "$CONTRACTS_DIR" ]; then
  echo "[echidna] No contracts directory found at $CONTRACTS_DIR"
  echo "[echidna] Skipping — not applicable for this project stage."
  exit 0
fi

# Find all Solidity test files matching *Echidna*.sol
TEST_FILES=$(find "$CONTRACTS_DIR" -name "*Echidna*.sol" -o -name "*echidna*.sol" 2>/dev/null)

if [ -z "$TEST_FILES" ]; then
  echo "[echidna] No Echidna test files found (*Echidna*.sol)"
  echo "[echidna] Create test files with invariant assertions to enable fuzzing."
  echo "[echidna] Example: contracts/test/EchidnaBasic.sol"
  exit 0
fi

for test_file in $TEST_FILES; do
  contract_name=$(basename "$test_file" .sol)
  echo "[echidna] Running on $test_file (contract: $contract_name)"

  if [ -f "$ECHIDNA_CONFIG" ]; then
    echidna-test "$test_file" --contract "$contract_name" --config "$ECHIDNA_CONFIG"
  else
    echidna-test "$test_file" --contract "$contract_name" --test-mode property
  fi
done

echo "[echidna] All property tests completed."
