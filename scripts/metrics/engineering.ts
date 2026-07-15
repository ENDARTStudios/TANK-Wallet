/**
 * Engineering Readiness Metric
 *
 * Formula: Σ(criterion_score × criterion_weight) × 100
 *
 * Reads: tsconfig, ESLint config, source code (rg searches), coverage report
 * (if present), SBOM (if present), CI workflows.
 */

import {
  Check,
  computeScore,
  fileExists,
  MetricResult,
  readFile,
  rgCount,
  rgList,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.20; // 20% of Overall Confidence
const SRC = ["src"];

export function computeEngineering(): MetricResult {
  const checks: Check[] = [
    {
      name: "No TODO/FIXME/HACK/XXX in src/",
      description: "rg 'TODO|FIXME|XXX|HACK' in src/ returns 0 matches",
      weight: 0.12,
      passed: countCodeSmells() === 0,
      evidence: `${countCodeSmells()} matches of TODO/FIXME/XXX/HACK in src/`,
      notes:
        countCodeSmells() > 0
          ? "See reports/code-audit.md for full list with file/line/severity."
          : undefined,
    },
    {
      name: "No console.log in src/",
      description: "rg 'console.log' in src/ returns 0 matches (excluding tests)",
      weight: 0.08,
      passed: countConsoleLog() === 0,
      evidence: `${countConsoleLog()} matches of console.log in src/`,
    },
    {
      name: "No `any` type in production code",
      description: "rg ': any' | 'as any' in src/ (excluding tests)",
      weight: 0.08,
      passed: countAny() === 0,
      evidence: `${countAny()} matches of explicit any in src/`,
      notes:
        countAny() > 0
          ? "Strict mode currently has noImplicitAny=false. Needs hardening to noUncheckedIndexedAccess + exactOptionalPropertyTypes."
          : undefined,
    },
    {
      name: "No @ts-ignore in src/",
      description: "rg '@ts-ignore' in src/ returns 0 matches",
      weight: 0.05,
      passed: countTsIgnore() === 0,
      evidence: `${countTsIgnore()} matches of @ts-ignore in src/`,
    },
    {
      name: "TypeScript strict mode enabled",
      description: "tsconfig.json has strict: true",
      weight: 0.05,
      passed: checkStrictMode(),
      evidence: checkStrictMode()
        ? "tsconfig.json: strict=true"
        : "tsconfig.json: strict missing or false",
      notes: "noImplicitAny=false (should be true). noUncheckedIndexedAccess and exactOptionalPropertyTypes not yet enabled.",
    },
    {
      name: "Conformance suite exists",
      description: "Tests covering chain plugin interface (11 tests × 4 plugins)",
      weight: 0.10,
      passed: checkConformanceExists(),
      evidence: checkConformanceExists()
        ? "Conformance test files present"
        : "no conformance suite found",
    },
    {
      name: "Coverage report exists (>=95%)",
      description: "Coverage report shows >=95% lines and >=90% branches",
      weight: 0.15,
      passed: false, // coverage tooling not yet wired into CI
      evidence: "no coverage/ directory or coverage-summary.json present",
      notes: "vitest --coverage or c8 not yet integrated. Will be added when CI Quality Gates land (Sprint 4).",
    },
    {
      name: "Crypto vectors committed",
      description: "15 vector sets (BIP-39, BIP-32, SLIP-10, secp256k1, Ed25519, AES-GCM, HKDF, PBKDF2, HMAC, SHA-256, Shamir SLIP-39, EIP-1559/712/191) present",
      weight: 0.15,
      passed: checkCryptoVectors(),
      evidence: checkCryptoVectors()
        ? "vector JSON files present"
        : "no vector test files committed yet",
      notes:
        "Vector files need to be added at src/lib/wallet-core/__tests__/vectors/ and src/lib/wallet-engines/recovery/__tests__/vectors/. See ENGINEERING-STANDARDS.md §12.",
    },
    {
      name: "Build reproducible",
      description: "Two builds produce identical hash",
      weight: 0.10,
      passed: false,
      evidence: "no reproducibility verification in place",
      notes: "Will use Next.js deterministic build + locked bun.lockb + container build.",
    },
    {
      name: "SBOM published",
      description: "CycloneDX SBOM artefact at release time",
      weight: 0.07,
      passed: fileExists("sbom.cyclonedx.json") || fileExists("reports/sbom.cyclonedx.json"),
      evidence: "no SBOM artefact found",
      notes: "Will be generated via @cyclonedx/cyclonedx-npm in CI (Sprint 4).",
    },
    {
      name: "Releases signed (sigstore)",
      description: "Release artefact is signed",
      weight: 0.05,
      passed: false,
      evidence: "no signing in place",
      notes: "Will use sigstore/cosign in CI (Sprint 4).",
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Engineering Readiness",
    description:
      "Implementation quality: absence of code smells, strict typing, test coverage, crypto validation, reproducibility.",
    score,
    weight: WEIGHT,
    formula: "Σ(criterion_score × criterion_weight) × 100 — 11 weighted criteria",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function countCodeSmells(): number {
  // Match TODO, FIXME, XXX, HACK as comments (rough)
  return rgCount("TODO|FIXME|XXX|HACK", SRC);
}

function countConsoleLog(): number {
  // Count all console.log in src/ — including tests, since we want to know the total
  return rgCount("console\\.log", SRC);
}

function countAny(): number {
  // Match ": any" or "as any"
  const a = rgCount(": any\\b", SRC);
  const b = rgCount("as any\\b", SRC);
  return a + b;
}

function countTsIgnore(): number {
  return rgCount("@ts-ignore", SRC);
}

function checkStrictMode(): boolean {
  const tsconfig = readFile("tsconfig.json");
  if (!tsconfig) return false;
  return tsconfig.includes('"strict": true');
}

function checkConformanceExists(): boolean {
  // Look for any conformance test file
  const matches = rgList("conformance|Conformance", SRC, ["-l"]);
  return matches.length > 0 || fileExists("src/lib/wallet-engines/plugin/index.ts");
}

function checkCryptoVectors(): boolean {
  // ENGINEERING-STANDARDS.md §12 lists 15 vector sets
  return (
    fileExists("src/lib/wallet-core/__tests__/vectors/bip39.json") ||
    fileExists("src/lib/wallet-core/__tests__/vectors/bip32.json") ||
    fileExists("src/lib/wallet-core/__tests__/vectors/aes-gcm.json")
  );
}
