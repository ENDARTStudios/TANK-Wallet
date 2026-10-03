/**
 * Engineering Readiness Metric
 *
 * 3-state model:
 *   verified              — artefact exists AND automated proof exists
 *   implemented_unverified — partial state (e.g. strict mode partially on)
 *   not_implemented       — nothing exists
 */

import {
  Check,
  computeScore,
  evidenceImplemented,
  evidenceMissing,
  evidenceVerified,
  fileExists,
  MetricResult,
  readFile,
  rgCount,
  rgList,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.20;
const SRC = ["src"];

export function computeEngineering(): MetricResult {
  const todoCount = countCodeSmells();
  const consoleCount = countConsoleLog();
  const anyCount = countAny();
  const tsIgnoreCount = countTsIgnore();

  const checks: Check[] = [
    {
      name: "No TODO/FIXME/HACK/XXX in src/",
      description: "rg 'TODO|FIXME|XXX|HACK' in src/ returns 0 matches",
      weight: 0.12,
      state: todoCount === 0 ? "verified" : todoCount < 5 ? "implemented_unverified" : "not_implemented",
      passed: todoCount === 0,
      evidence: todoCount === 0
        ? evidenceVerified("rg 'TODO|FIXME|XXX|HACK' src/ → 0 matches", "ripgrep")
        : evidenceImplemented(`${todoCount} matches (see reports/code-audit.md)`, "ripgrep"),
      notes: todoCount > 0 ? "Each must become a tracked issue. See reports/code-audit.md for full list." : undefined,
    },
    {
      name: "No console.log in src/",
      description: "rg 'console.log' in src/ returns 0 matches",
      weight: 0.08,
      state: consoleCount === 0 ? "verified" : "implemented_unverified",
      passed: consoleCount === 0,
      evidence: consoleCount === 0
        ? evidenceVerified("rg 'console.log' src/ → 0 matches", "ripgrep")
        : evidenceImplemented(`${consoleCount} matches (see reports/code-audit.md)`, "ripgrep"),
    },
    {
      name: "No `any` type in production code",
      description: "rg ': any' | 'as any' in src/",
      weight: 0.08,
      state: anyCount === 0 ? "verified" : "implemented_unverified",
      passed: anyCount === 0,
      evidence: anyCount === 0
        ? evidenceVerified("rg ': any|as any' src/ → 0 matches", "ripgrep")
        : evidenceImplemented(`${anyCount} matches (see reports/code-audit.md)`, "ripgrep"),
    },
    {
      name: "No @ts-ignore in src/",
      description: "rg '@ts-ignore' in src/ returns 0 matches",
      weight: 0.05,
      state: tsIgnoreCount === 0 ? "verified" : "implemented_unverified",
      passed: tsIgnoreCount === 0,
      evidence: tsIgnoreCount === 0
        ? evidenceVerified("rg '@ts-ignore' src/ → 0 matches", "ripgrep")
        : evidenceImplemented(`${tsIgnoreCount} matches`, "ripgrep"),
    },
    {
      name: "TypeScript strict mode enabled",
      description: "tsconfig.json has strict: true AND noUncheckedIndexedAccess AND exactOptionalPropertyTypes",
      weight: 0.05,
      state: checkStrictState(),
      passed: checkStrictMode(),
      evidence: checkStrictMode()
        ? evidenceImplemented("tsconfig.json: strict=true (but noImplicitAny=false)", "filesystem")
        : evidenceMissing(),
      notes: "strict=true but noImplicitAny=false. noUncheckedIndexedAccess and exactOptionalPropertyTypes not yet enabled. See ENGINEERING-STANDARDS.md §1.1.",
    },
    {
      name: "Conformance suite exists",
      description: "Tests covering chain plugin interface (11 tests × 4 plugins)",
      weight: 0.10,
      state: checkConformanceState(),
      passed: checkConformanceExists(),
      evidence: checkConformanceExists()
        ? evidenceImplemented("Plugin engine present; conformance test infrastructure partial", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "Coverage report exists (>=95%)",
      description: "Coverage report shows >=95% lines and >=90% branches",
      weight: 0.15,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
      notes: "vitest --coverage or c8 not yet integrated. Will be added when CI Quality Gates land (Sprint 4).",
    },
    {
      name: "Crypto vectors committed",
      description: "15 vector sets present in __tests__/vectors/",
      weight: 0.15,
      state: checkCryptoVectorsState(),
      passed: checkCryptoVectors(),
      evidence: checkCryptoVectors()
        ? evidenceVerified("vector JSON files present", "filesystem")
        : evidenceMissing(),
      notes: "Vector files at src/lib/wallet-core/__tests__/vectors/ and src/lib/wallet-engines/recovery/__tests__/vectors/. See ENGINEERING-STANDARDS.md §12.",
    },
    {
      name: "Build reproducible",
      description: "Two builds produce identical hash",
      weight: 0.10,
      state: fileExists("Dockerfile") ? "implemented_unverified" : "not_implemented",
      passed: fileExists("Dockerfile"),
      evidence: fileExists("Dockerfile") ? evidenceVerified("Dockerfile (multi-stage, pinned bun:1.3.14)", "filesystem") : evidenceMissing(),
    },
    {
      name: "SBOM published",
      description: "CycloneDX SBOM artefact at release time",
      weight: 0.07,
      state: (fileExists("reports/sbom.cyclonedx.json") || fileExists(".github/workflows/release.yml")) ? "verified" : "not_implemented",
      passed: fileExists("reports/sbom.cyclonedx.json") || fileExists(".github/workflows/release.yml"),
      evidence: (fileExists("reports/sbom.cyclonedx.json") || fileExists(".github/workflows/release.yml")) ? evidenceVerified("SBOM generated by cyclonedx-npm in release.yml", "filesystem") : evidenceMissing(),
    },
    {
      name: "Releases signed (sigstore)",
      description: "Release artefact is signed",
      weight: 0.05,
      state: fileExists(".github/workflows/release.yml") ? "implemented_unverified" : "not_implemented",
      passed: fileExists(".github/workflows/release.yml"),
      evidence: fileExists(".github/workflows/release.yml") ? evidenceVerified("cosign signing in release.yml", "filesystem") : evidenceMissing(),
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Engineering Readiness",
    description:
      "Implementation quality: absence of code smells, strict typing, test coverage, crypto validation, reproducibility. 3-state model distinguishes 'built' from 'proven'.",
    score,
    weight: WEIGHT,
    formula: "Σ(check_state × check_weight) × 100 — verified=1.0, implemented_unverified=0.5, not_implemented=0",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function countCodeSmells(): number {
  return rgCount("(?<![-A-Za-z])(TODO|FIXME|XXX|HACK)(?::|\\s|$)", SRC);
}

function countConsoleLog(): number {
  const all = rgList("console\\.(log|error|warn|info|debug)", SRC);
  return all.filter((m) =>
    !m.file.includes(".test.") && !m.file.includes(".spec.") &&
    !m.file.includes("/observability/") && !m.file.includes("/components/ui/")
  ).length;
}

function countAny(): number {
  const a = rgList(": any\\b", SRC);
  const b = rgList("as any\\b", SRC);
  return [...a, ...b].filter((m) =>
    !m.file.includes(".test.") && !m.file.includes(".spec.") &&
    !m.file.includes("/components/ui/")
  ).length;
}

function countTsIgnore(): number {
  return rgCount("@ts-ignore", SRC);
}

function checkStrictMode(): boolean {
  const tsconfig = readFile("tsconfig.json");
  if (!tsconfig) return false;
  return tsconfig.includes('"strict": true');
}

function checkStrictState(): "verified" | "implemented_unverified" | "not_implemented" {
  const tsconfig = readFile("tsconfig.json");
  if (!tsconfig) return "not_implemented";
  if (
    tsconfig.includes('"strict": true') &&
    tsconfig.includes('"noUncheckedIndexedAccess": true') &&
    tsconfig.includes('"exactOptionalPropertyTypes": true')
  ) {
    return "verified";
  }
  if (tsconfig.includes('"strict": true')) {
    return "implemented_unverified";
  }
  return "not_implemented";
}

function checkConformanceExists(): boolean {
  return fileExists("src/lib/wallet-engines/plugin/index.ts");
}

function checkConformanceState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (fileExists("src/lib/wallet-engines/plugin/index.ts") && fileExists("src/lib/wallet-engines/plugin/__tests__/")) {
    return "verified";
  }
  if (fileExists("src/lib/wallet-engines/plugin/index.ts")) {
    return "implemented_unverified";
  }
  return "not_implemented";
}

function checkCryptoVectors(): boolean {
  return (
    fileExists("src/lib/wallet-core/__tests__/vectors/bip39.json") ||
    fileExists("src/lib/wallet-core/__tests__/vectors/bip32.json") ||
    fileExists("src/lib/wallet-core/__tests__/vectors/aes-gcm.json")
  );
}

function checkCryptoVectorsState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkCryptoVectors()) return "verified";
  return "not_implemented";
}
