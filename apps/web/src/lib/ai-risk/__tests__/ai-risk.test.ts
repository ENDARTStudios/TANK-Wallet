import { describe, it, expect } from "bun:test";
import { scoreRisk } from "../index";

describe("ai-risk", () => {
  it("low value safe recipient", () => {
    const v = scoreRisk({ value: 100, recipientTrust: 0.9, chainRisk: 0.1, urgency: 0.1, newRecipient: false });
    expect(v.level).toBe("low");
  });

  it("high value untrusted new recipient", () => {
    const v = scoreRisk({ value: 50000, recipientTrust: 0.1, chainRisk: 0.8, urgency: 0.9, newRecipient: true });
    expect(v.level).toBe("high");
    expect(v.reasons).toContain("large_value");
    expect(v.reasons).toContain("low_trust_recipient");
  });

  it("medium value medium trust", () => {
    const v = scoreRisk({ value: 5000, recipientTrust: 0.3, chainRisk: 0.7, urgency: 0.5, newRecipient: false });
    expect(v.level).toBe("medium");
  });
});
