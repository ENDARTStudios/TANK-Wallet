import { z } from "zod";
import { TypeSafeClient, noul, score } from "@typesafe-ai/sdk";
import { THREAT_INTEL_THRESHOLDS } from "@/lib/risk/thresholds";

export const JevDappInputSchema = z.object({
  url: z.string().min(1).max(2048).optional(),
  address: z.string().min(1).max(128).optional(),
  chain: z.string().min(1).max(64).optional(),
  contextText: z.string().max(4000).optional(),
}).refine((v) => v.url !== undefined || v.address !== undefined, {
  message: "url or address required",
});

export type JevDappInput = z.infer<typeof JevDappInputSchema>;

export type JevRecommendation = "allow" | "limit" | "block";

export interface JevPhishingAssessment {
  phishingProb: number;
  severity: number;
  severityLabel: "benign" | "suspicious" | "likely_malicious" | "confirmed_pattern";
  confidence: number;
  recommendation: JevRecommendation;
  skipped: boolean;
  skipReason?: string;
}

export interface JevSystemOneClient {
  systemOne(
    request: {
      state: Record<string, unknown>;
      questions: Record<string, unknown>;
    },
    options?: { timeout?: number },
  ): Promise<{
    answers: {
      phishing: { noul: number };
      severity: { score: number; confidence: number };
    };
  }>;
}

interface AssessOptions {
  client?: JevSystemOneClient;
  timeoutMs?: number;
}

const SEVERITY_LEVELS = [
  "No phishing, honeypot, drainer, or impersonation signals.",
  "Suspicious signals present but inconclusive.",
  "Likely malicious pattern consistent with phishing or drainer behavior.",
  "Confirmed malicious pattern matching known scam behavior.",
] as const;

export function isJevEnabled(): boolean {
  return (process.env.TYPESAFE_API_KEY ?? "").trim().length > 0;
}

function toRecommendation(phishingProb: number, severity: number): JevRecommendation {
  if (phishingProb >= THREAT_INTEL_THRESHOLDS.blockPhishingProb || severity >= THREAT_INTEL_THRESHOLDS.blockSeverity) return "block";
  if (phishingProb >= THREAT_INTEL_THRESHOLDS.limitPhishingProb || severity >= THREAT_INTEL_THRESHOLDS.limitSeverity) return "limit";
  return "allow";
}

function toSeverityLabel(severity: number): JevPhishingAssessment["severityLabel"] {
  if (severity >= THREAT_INTEL_THRESHOLDS.blockSeverity) return "confirmed_pattern";
  if (severity >= THREAT_INTEL_THRESHOLDS.limitSeverity) return "likely_malicious";
  if (severity >= THREAT_INTEL_THRESHOLDS.suspiciousSeverity) return "suspicious";
  return "benign";
}

export async function assessDappRisk(
  rawInput: unknown,
  opts?: AssessOptions,
): Promise<JevPhishingAssessment> {
  const input = JevDappInputSchema.parse(rawInput);
  if (!isJevEnabled() && opts?.client === undefined) {
    return {
      phishingProb: 0,
      severity: 0,
      severityLabel: "benign",
      confidence: 0,
      recommendation: "allow",
      skipped: true,
      skipReason: "TYPESAFE_API_KEY missing",
    };
  }
  const client = opts?.client ?? (new TypeSafeClient() as unknown as JevSystemOneClient);
  const timeoutMs = opts?.timeoutMs ?? 8000;
  const state = {
    dapp_url: input.url ?? null,
    contract_address: input.address ?? null,
    chain: input.chain ?? null,
    context: input.contextText ?? null,
  };
  try {
    const response = await client.systemOne(
      {
        state,
        questions: {
          phishing: noul("Does `dapp_url`, `contract_address`, or `context` indicate a phishing site, honeypot token, drainer, or impersonation scam?", {
            true: "Signals consistent with phishing, honeypot, drainer, or impersonation.",
            false: "No scam signals.",
          }),
          severity: score("Rate the scam severity evident in `dapp_url`, `contract_address`, and `context`.", [...SEVERITY_LEVELS]),
        },
      },
      { timeout: timeoutMs },
    );
    const phishingProb = response.answers.phishing.noul;
    const severity = response.answers.severity.score;
    const confidence = response.answers.severity.confidence;
    return {
      phishingProb,
      severity,
      severityLabel: toSeverityLabel(severity),
      confidence,
      recommendation: toRecommendation(phishingProb, severity),
      skipped: false,
    };
  } catch (error) {
    return {
      phishingProb: 0,
      severity: 0,
      severityLabel: "benign",
      confidence: 0,
      recommendation: "allow",
      skipped: true,
      skipReason: error instanceof Error ? error.message.slice(0, 200) : "jev_unavailable",
    };
  }
}
