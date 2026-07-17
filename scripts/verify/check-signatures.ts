/**
 * Signature verification — checks .sig files for metrics.json and code-audit.md.
 * Self-contained (no import from _shared.ts to avoid missing-export issues).
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";

const PROJECT_ROOT = resolve(__dirname, "..", "..");
const ARTIFACTS = ["reports/metrics.json", "reports/code-audit.md"];

interface SigFile {
  integrityHash: string;
  artifact: string;
}

function verifyArtifact(relativePath: string): { valid: boolean; reason?: string } {
  const absPath = join(PROJECT_ROOT, relativePath);
  const sigPath = absPath + ".sig";

  if (!existsSync(absPath)) return { valid: false, reason: `artifact missing: ${relativePath}` };
  if (!existsSync(sigPath)) return { valid: false, reason: `signature missing: ${relativePath}.sig` };

  try {
    const sig = JSON.parse(readFileSync(sigPath, "utf8")) as SigFile;
    const content = readFileSync(absPath);
    const expected = createHash("sha256").update(content).digest("hex");
    if (expected !== sig.integrityHash) {
      return { valid: false, reason: `integrity hash mismatch for ${relativePath}` };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, reason: `failed to parse signature: ${(e as Error).message}` };
  }
}

function main(): void {
  let allValid = true;
  for (const a of ARTIFACTS) {
    const r = verifyArtifact(a);
    if (r.valid) {
      console.log(`✅ ${a} — verified`);
    } else {
      console.error(`❌ ${a} — ${r.reason}`);
      allValid = false;
    }
  }
  if (!allValid) process.exit(1);
}

main();
