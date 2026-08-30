export interface RiskFeatures { value: number; recipientTrust: number; chainRisk: number; urgency: number; newRecipient: boolean }
export interface RiskVerdict { score: number; level: "low" | "medium" | "high"; reasons: string[] }

export function scoreRisk(features: RiskFeatures): RiskVerdict {
  const reasons: string[] = [];
  let score = 0;
  if (features.value > 10_000) { score += 35; reasons.push("large_value"); }
  else if (features.value > 1_000) { score += 15; reasons.push("medium_value"); }
  if (features.recipientTrust < 0.3) { score += 30; reasons.push("low_trust_recipient"); }
  if (features.chainRisk > 0.6) { score += 20; reasons.push("risky_chain"); }
  if (features.urgency > 0.8) { score += 15; reasons.push("urgent"); }
  if (features.newRecipient) { score += 10; reasons.push("new_recipient"); }
  score = Math.min(100, score);
  const level: RiskVerdict["level"] = score >= 70 ? "high" : score >= 35 ? "medium" : "low";
  return { score, level, reasons };
}
