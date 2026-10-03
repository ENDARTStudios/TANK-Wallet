#!/bin/bash
# Setup Trail of Bits security tools for Tank Wallet.
# All tools are free and open-source: https://github.com/crytic
#
# Usage:
#   bash scripts/security/setup-tools.sh           # install all
#   bash scripts/security/setup-tools.sh slither   # install specific tool

set -euo pipefail

TOOLS=(
  "slither:Slither — Solidity static analysis framework"
  "mythril:Mythril — Symbolic execution for EVM bytecode"
  "echidna:Echidna — Smart contract fuzzer"
  "crytic-compile:Crytic-Compile — Unified compiler interface"
  "tealer:Tealer — TEAL (Algorand) static analysis"
)

install_slither() {
  echo "Installing Slither..."
  pip3 install slither-analyzer
}

install_mythril() {
  echo "Installing Mythril..."
  pip3 install mythril
}

install_echidna() {
  echo "Installing Echidna..."
  if command -v echidna-test &>/dev/null; then
    echo "  Already installed: $(echidna-test --version)"
    return
  fi
  case "$(uname -s)" in
    Linux*)
      sudo apt-get update && sudo apt-get install -y libsecp256k1-0 libfftw3-3
      wget -q https://github.com/crytic/echidna/releases/download/v2.2.0/echidna-2.2.0-x86_64-Linux.tar.gz
      tar xzf echidna-2.2.0-x86_64-Linux.tar.gz
      sudo mv echidna /usr/local/bin/
      rm echidna-2.2.0-x86_64-Linux.tar.gz
      ;;
    Darwin*)
      brew install echidna
      ;;
    *)
      echo "  Unsupported OS. Install manually: https://github.com/crytic/echidna"
      ;;
  esac
}

install_crytic-compile() {
  echo "Installing crytic-compile..."
  pip3 install crytic-compile
}

install_tealer() {
  echo "Installing Tealer..."
  if command -v tealer &>/dev/null; then
    echo "  Already installed"
    return
  fi
  # Tealer requires Python and is installed via pip
  pip3 install tealer
}

echo "════════════════════════════════════════════════════════════"
echo "  Trail of Bits Security Tools — Setup"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ "$#" -gt 0 ]; then
  for tool in "$@"; do
    "install_$tool" 2>/dev/null || echo "  ⚠ Unknown tool: $tool"
  done
else
  for entry in "${TOOLS[@]}"; do
    name="${entry%%:*}"
    desc="${entry#*:}"
    echo "→ $desc"
    "install_$name" 2>/dev/null || echo "  ⚠ Could not install $name (may require manual setup)"
    echo ""
  done
fi

echo "════════════════════════════════════════════════════════════"
echo "  Installation complete."
echo "  Note: Slither, Mythril, Echidna, and Tealer require Solidity"
echo "  contracts to analyze. Tank Wallet is a client-side wallet —"
echo "  these tools become relevant when smart account contracts"
echo "  (ERC-4337) are deployed."
echo "════════════════════════════════════════════════════════════"
