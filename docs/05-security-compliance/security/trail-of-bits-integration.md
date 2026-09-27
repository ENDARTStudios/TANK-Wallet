# Trail of Bits Security Tools — Integration Guide

> Trail of Bits publishes free, open-source security analysis tools
> used by professional auditors. This document explains how each tool
> applies to Tank Wallet and when to use them.

---

## Applicability to Tank Wallet

Tank Wallet is a **client-side wallet** (TypeScript/Next.js), not a
smart contract project. Most Trail of Bits tools analyze Solidity/EVM
bytecode. They become relevant when:

1. **ERC-4337 Smart Accounts** are deployed (planned for PRO tier).
2. **Smart contract interactions** need pre-deployment analysis.
3. **Auditors** request reproducible analysis environment.

Until then, the tools are **installed and documented** but not executed
on every CI run.

---

## Tools

### Slither
- **What**: Static analysis framework for Solidity. Detects 90+ vulnerabilities.
- **Install**: `pip3 install slither-analyzer`
- **Use**: `slither contracts/ --sarif results.sarif`
- **CI**: `.github/workflows/slither.yml` (triggers when `.sol` files exist)
- **When**: Before deploying any smart contract.

### Mythril
- **What**: Symbolic execution for EVM bytecode. Finds deeper vulnerabilities.
- **Install**: `pip3 install mythril`
- **Use**: `myth analyze contracts/MyContract.sol`
- **When**: Complements Slither for critical contracts.

### Echidna
- **What**: Smart contract fuzzer. Tests invariants via property-based testing.
- **Install**: `bash scripts/security/setup-tools.sh echidna`
- **Use**: `echidna-test contracts/test/EchidnaBasic.sol --contract EchidnaBasic`
- **CI**: `.github/workflows/fuzzing.yml` (weekly + on `.sol` changes)
- **When**: After writing invariant test files.

### crytic-compile
- **What**: Unified compiler interface. Compiles contracts for Slither/Echidna.
- **Install**: `pip3 install crytic-compile`
- **Use**: `crytic-compile contracts/ --compile-force-framework hardhat`

### Tealer
- **What**: Static analysis for TEAL (Algorand) smart contracts.
- **Install**: `pip3 install tealer`
- **When**: Only if Algorand contracts are deployed (not currently planned).

---

## Quick Start

```bash
# Install all tools
bash scripts/security/setup-tools.sh

# Install specific tool
bash scripts/security/setup-tools.sh slither

# Run Slither on contracts (when they exist)
slither contracts/

# Run Echidna on test files (when they exist)
bash scripts/security/run-echidna.sh
```

---

## CI Integration

| Workflow | Trigger | Condition |
|----------|---------|-----------|
| `.github/workflows/slither.yml` | push/PR on `contracts/**` | Only if `.sol` files exist |
| `.github/workflows/fuzzing.yml` | Weekly + push on `contracts/**` | Only if `.sol` files exist |

Both workflows use `if: hashFiles(...)` to skip when no contracts exist.

---

## When to Use These Tools

| Phase | Tools | Priority |
|-------|-------|----------|
| Before deploying ERC-4337 account contracts | Slither + Mythril + Echidna | Critical |
| Before interacting with new protocol contracts | Slither (on the target contract) | High |
| During audit preparation | All tools + crytic-compile | High |
| Routine (weekly) | Echidna fuzzing | Medium |

---

## Reference

- Trail of Bits tools: https://github.com/crytic
- Slither documentation: https://github.com/crytic/slither
- Echidna documentation: https://github.com/crytic/echidna
- Mythril documentation: https://github.com/Consensys/mythril
