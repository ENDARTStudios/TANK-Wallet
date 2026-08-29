import { describe, it, expect } from "bun:test";
import { createRecoverySet, recoverWallet, verifyRecoveryContact } from "../index";

describe("social-recovery", () => {
  it("cria recovery set 2-of-3", () => {
    const set = createRecoverySet({ threshold: 2, contacts: ["a@a.com", "b@b.com", "c@b.com"] });
    expect(set.shares).toHaveLength(3);
    expect(set.threshold).toBe(2);
  });

  it("recupera com threshold", () => {
    const set = createRecoverySet({ threshold: 2, contacts: ["a", "b", "c"] });
    expect(recoverWallet({ shares: set.shares.slice(0, 2), threshold: 2 }).success).toBe(true);
    expect(recoverWallet({ shares: set.shares.slice(0, 1), threshold: 2 }).success).toBe(false);
  });

  it("verifica contato", () => {
    expect(verifyRecoveryContact("alice@example.com")).toBe(true);
    expect(verifyRecoveryContact("0xabc123...")).toBe(true);
    expect(verifyRecoveryContact("short")).toBe(false);
  });
});
