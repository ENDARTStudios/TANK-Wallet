/**
 * SecurityDecisionPipeline — the heart of Tank Wallet.
 *
 * Orchestrates all security engines in parallel, aggregates their
 * results into a single DecisionResult, and produces structured
 * evidence that can be displayed to the user and stored in the
 * audit log.
 *
 * @stable
 * @since Architecture Freeze 1.0.0
 */

import type { SecurityContext, SecurityResult } from "./architecture-freeze";
import { logger } from "@/lib/observability/logger";

// ─── Public types ─────────────────────────────────────────────────────────

export interface DecisionResult {
  decision: "allow" | "block" | "challenge";
  securityLevel: "L0" | "L1" | "L2" | "L3" | "L4";
  engineResults: Record<string, SecurityResult>;
  score: number;
  evidence: Evidence[];
  sources: string[];
  violations: Array<{ policyId: string; reason: string }>;
  errors: Array<{ code: string; message: string }>;
  reproducible: boolean;
  decidedAt: string;
  durationMs: number;
  summary: string;
}

export interface Evidence {
  source: string;
  kind: string;
  payload: Record<string, unknown>;
  collectedAt: string;
}

export const DEFAULT_ENGINE_WEIGHTS: Record<string, number> = {
  "eng-001-key-management": 0.10,
  "eng-002-network": 0.05,
  "eng-003-simulation": 0.20,
  "eng-004-threat-intel": 0.25,
  "eng-005-behavior": 0.10,
  "eng-006-policy": 0.15,
  "eng-007-permission": 0.05,
  "eng-011-device-trust": 0.05,
  "eng-012-wallet-guardian": 0.05,
};

export interface PipelineEngine {
  readonly id: string;
  evaluate(context: SecurityContext): Promise<SecurityResult>;
}

export interface PipelineOptions {
  engines: PipelineEngine[];
  weights?: Record<string, number>;
  visibleEngines?: string[];
  engineTimeoutMs?: number;
  failSafeBlockOnEngineError?: boolean;
}

export async function runSecurityDecisionPipeline(
  context: SecurityContext,
  options: PipelineOptions
): Promise<DecisionResult> {
  const start = Date.now();
  const weights = options.weights ?? DEFAULT_ENGINE_WEIGHTS;
  const timeout = options.engineTimeoutMs ?? 5000;
  const failSafeBlock = options.failSafeBlockOnEngineError ?? true;

  const settled = await Promise.allSettled(
    options.engines.map((engine) =>
      Promise.race([
        engine.evaluate(context),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Engine ${engine.id} timed out after ${timeout}ms`)), timeout)
        ),
      ])
    )
  );

  const engineResults: Record<string, SecurityResult> = {};
  const evidence: Evidence[] = [];
  const violations: Array<{ policyId: string; reason: string }> = [];
  const errors: Array<{ code: string; message: string }> = [];
  const sources: string[] = [];
  let anyBlocked = false;
  let anyEngineFailed = false;

  for (let i = 0; i < options.engines.length; i++) {
    const engine = options.engines[i];
    const result = settled[i];

    if (result.status === "fulfilled") {
      const r = result.value;
      engineResults[engine.id] = r;
      for (const ev of r.evidence) {
        evidence.push({
          source: engine.id,
          kind: ev,
          payload: { level: r.level, score: r.score },
          collectedAt: new Date(r.evaluatedAt).toISOString(),
        });
        sources.push(`${engine.id}:${ev}`);
      }
      if (r.blocked) anyBlocked = true;
      if (r.level === "critical" || r.level === "high") {
        violations.push({ policyId: "POL-002", reason: r.explanation });
      }
    } else {
      anyEngineFailed = true;
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      errors.push({ code: "TANK-8003", message: `Engine ${engine.id} failed: ${reason}` });
      if (failSafeBlock) anyBlocked = true;
    }
  }

  const totalWeight = Object.entries(weights).reduce(
    (sum, [id, w]) => sum + (engineResults[id] ? w : 0), 0
  );
  const weightedScore = Object.entries(engineResults).reduce((sum, [id, r]) => {
    const w = weights[id] ?? 0;
    return sum + r.score * w;
  }, 0);
  const aggregatedScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

  let decision: DecisionResult["decision"];
  if (anyBlocked) {
    decision = "block";
  } else if (aggregatedScore >= 80) {
    decision = "allow";
  } else if (aggregatedScore >= 50) {
    decision = "challenge";
  } else {
    decision = "block";
  }

  const securityLevel = scoreToLevel(aggregatedScore, anyBlocked);
  const summary = buildSummary(decision, securityLevel, aggregatedScore, violations, evidence);
  const durationMs = Date.now() - start;

  return {
    decision, securityLevel, engineResults, score: aggregatedScore,
    evidence, sources, violations, errors,
    reproducible: !anyEngineFailed, decidedAt: new Date().toISOString(),
    durationMs, summary,
  };
}

function scoreToLevel(score: number, blocked: boolean): DecisionResult["securityLevel"] {
  if (blocked) return "L4";
  if (score >= 90) return "L0";
  if (score >= 75) return "L1";
  if (score >= 50) return "L2";
  if (score >= 25) return "L3";
  return "L4";
}

function buildSummary(
  decision: DecisionResult["decision"],
  level: DecisionResult["securityLevel"],
  score: number,
  violations: Array<{ policyId: string; reason: string }>,
  evidence: Evidence[]
): string {
  const parts: string[] = [];
  parts.push(`Decision: ${decision.toUpperCase()} (level ${level}, score ${score}/100).`);
  if (violations.length > 0) parts.push(`${violations.length} violation(s) detected.`);
  if (evidence.length > 0) parts.push(`${evidence.length} evidence piece(s) collected from ${new Set(evidence.map((e) => e.source)).size} engine(s).`);
  if (decision === "block") parts.push("Transaction blocked — review the evidence below before proceeding.");
  else if (decision === "challenge") parts.push("Transaction requires explicit confirmation — review the warnings below.");
  else parts.push("Transaction appears safe — proceed with normal caution.");
  return parts.join(" ");
}

// ─── Engine adapters ──────────────────────────────────────────────────────

export function makeThreatIntelEngine(
  lookupFn: (address: string, chain: string) => Promise<{ threat: boolean; severity: number; reasons: string[] }>
): PipelineEngine {
  return {
    id: "eng-004-threat-intel",
    async evaluate(context: SecurityContext): Promise<SecurityResult> {
      const start = Date.now();
      try {
        const result = await lookupFn(context.contractAddress, context.chain);
        const score = result.threat ? 100 - result.severity : 100;
        const blocked = result.threat && result.severity >= 70;
        return {
          engineId: "eng-004-threat-intel", engineVersion: "1.0.0",
          score, level: result.threat ? (result.severity >= 80 ? "critical" : result.severity >= 50 ? "high" : "medium") : "safe",
          blocked,
          evidence: result.threat ? [`threat-detected: severity=${result.severity} reasons=${result.reasons.join(";")}`] : ["no-threat-detected"],
          explanation: result.threat ? `Threat Intel: ${result.reasons.join("; ")}` : "Threat Intel: address not flagged.",
          evaluatedAt: Date.now(), durationMs: Date.now() - start,
        };
      } catch (e) {
        return {
          engineId: "eng-004-threat-intel", engineVersion: "1.0.0",
          score: 50, level: "medium", blocked: false,
          evidence: ["lookup-failed"],
          explanation: `Threat Intel: lookup failed — ${(e as Error).message}`,
          evaluatedAt: Date.now(), durationMs: Date.now() - start,
        };
      }
    },
  };
}

export function makeSimulationEngine(
  simulateFn: (context: SecurityContext) => Promise<{ success: boolean; revertReason?: string; stateChanges: number; approvalChanges: number; humanExplanation: string }>
): PipelineEngine {
  return {
    id: "eng-003-simulation",
    async evaluate(context: SecurityContext): Promise<SecurityResult> {
      const start = Date.now();
      try {
        const sim = await simulateFn(context);
        let score = 100;
        if (!sim.success) score -= 50;
        if (sim.approvalChanges > 0) score -= 30;
        score = Math.max(0, score);
        const blocked = !sim.success || (sim.approvalChanges > 0 && context.isInfiniteApproval);
        return {
          engineId: "eng-003-simulation", engineVersion: "1.0.0",
          score, level: blocked ? "high" : score >= 80 ? "safe" : "medium",
          blocked,
          evidence: [`simulation-success=${sim.success}`, `state-changes=${sim.stateChanges}`, `approval-changes=${sim.approvalChanges}`, sim.revertReason ? `revert-reason=${sim.revertReason}` : ""].filter(Boolean),
          explanation: sim.humanExplanation,
          evaluatedAt: Date.now(), durationMs: Date.now() - start,
        };
      } catch (e) {
        return {
          engineId: "eng-003-simulation", engineVersion: "1.0.0",
          score: 0, level: "critical", blocked: true,
          evidence: ["simulation-failed"],
          explanation: `Simulation: failed — ${(e as Error).message}`,
          evaluatedAt: Date.now(), durationMs: Date.now() - start,
        };
      }
    },
  };
}

export function makeContractScannerEngine(
  scanFn: (address: string, chain: string) => Promise<{ score: number; findings: string[]; humanExplanation: string }>
): PipelineEngine {
  return {
    id: "eng-012-wallet-guardian",
    async evaluate(context: SecurityContext): Promise<SecurityResult> {
      const start = Date.now();
      try {
        const scan = await scanFn(context.contractAddress, context.chain);
        const blocked = scan.score < 40;
        return {
          engineId: "eng-012-wallet-guardian", engineVersion: "1.0.0",
          score: scan.score,
          level: scan.score >= 80 ? "safe" : scan.score >= 50 ? "medium" : scan.score >= 25 ? "high" : "critical",
          blocked,
          evidence: scan.findings,
          explanation: scan.humanExplanation,
          evaluatedAt: Date.now(), durationMs: Date.now() - start,
        };
      } catch (e) {
        return {
          engineId: "eng-012-wallet-guardian", engineVersion: "1.0.0",
          score: 50, level: "medium", blocked: false,
          evidence: ["scan-failed"],
          explanation: `Contract Scanner: failed — ${(e as Error).message}`,
          evaluatedAt: Date.now(), durationMs: Date.now() - start,
        };
      }
    },
  };
}
