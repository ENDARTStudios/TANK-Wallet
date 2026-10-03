import { describe, it, expect } from "bun:test";
import { learnProfile, detectAnomaly } from "../index";

describe("behavior-ai", () => {
  it("aprende perfil", () => {
    const profile = learnProfile([
      { hour: 10, chain: "ethereum", amount: "100", device: "chrome" },
      { hour: 11, chain: "ethereum", amount: "200", device: "chrome" },
    ]);
    expect(profile.typicalHours).toContain(10);
    expect(profile.typicalChains).toContain("ethereum");
  });

  it("detecta anomalia de horário", () => {
    const profile = learnProfile([{ hour: 10, chain: "ethereum", amount: "100", device: "chrome" }]);
    const res = detectAnomaly({ hour: 3, chain: "ethereum", amount: "100", device: "chrome" }, profile);
    expect(res.score).toBeGreaterThanOrEqual(30);
    expect(res.reasons).toContain("unusual_hour");
  });

  it("lockdown quando score >=80", () => {
    const profile = learnProfile([{ hour: 10, chain: "ethereum", amount: "100", device: "chrome" }]);
    const res = detectAnomaly({ hour: 3, chain: "solana", amount: "10000", device: "unknown" }, profile);
    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.shouldLockdown).toBe(true);
  });
});
