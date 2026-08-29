export interface BehaviorAction { hour: number; chain: string; amount: string; device: string }
export interface BehaviorProfile { typicalHours: number[]; typicalChains: string[]; typicalAmounts: string[]; typicalDevices: string[] }

export function learnProfile(actions: BehaviorAction[]): BehaviorProfile {
  const hours = [...new Set(actions.map((a) => a.hour))];
  const chains = [...new Set(actions.map((a) => a.chain))];
  const amounts = actions.map((a) => a.amount);
  const devices = [...new Set(actions.map((a) => a.device))];
  return { typicalHours: hours, typicalChains: chains, typicalAmounts: amounts, typicalDevices: devices };
}

export function detectAnomaly(action: BehaviorAction, profile: BehaviorProfile): { score: number; reasons: string[]; shouldLockdown: boolean } {
  const reasons: string[] = [];
  let score = 0;
  if (!profile.typicalHours.includes(action.hour)) {
    score += 30;
    reasons.push("unusual_hour");
  }
  if (!profile.typicalChains.includes(action.chain)) {
    score += 40;
    reasons.push("unusual_chain");
  }
  if (!profile.typicalDevices.includes(action.device)) {
    score += 20;
    reasons.push("unusual_device");
  }
  const avg = profile.typicalAmounts.length ? Number(profile.typicalAmounts.reduce((a, b) => (BigInt(a) + BigInt(b)).toString(), "0")) / profile.typicalAmounts.length : 0;
  if (Number(action.amount) > avg * 5) {
    score += 30;
    reasons.push("large_amount");
  }
  return { score: Math.min(100, score), reasons, shouldLockdown: score >= 80 };
}
