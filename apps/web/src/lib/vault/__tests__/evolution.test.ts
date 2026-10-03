import { describe, it, expect } from "bun:test";
import { validateMultisig, validateTimelock, canSpend, applyPassphrase, createVaultEvolution } from "../evolution";

describe("vault evolution", () => {
  it("valida multisig k-of-n", () => {
    expect(validateMultisig({ threshold: 2, signers: ["a", "b", "c"] })).toBe(true);
    expect(validateMultisig({ threshold: 3, signers: ["a", "b"] })).toBe(false);
  });

  it("valida timelock", () => {
    expect(validateTimelock({ delaySeconds: 3600 })).toBe(true);
    expect(validateTimelock({ delaySeconds: 100, expirySeconds: 50 })).toBe(false);
  });

  it("canSpend respeita limite diário", () => {
    const limit = { daily: "1000", weekly: "5000", usedDaily: "600", usedWeekly: "1000" };
    expect(canSpend(limit, "300")).toBe(true);
    expect(canSpend(limit, "500")).toBe(false);
  });

  it("applyPassphrase deriva", () => {
    const out = applyPassphrase("abandon abandon", "secret123");
    expect(out).toContain("secret");
  });

  it("createVaultEvolution vazio", () => {
    expect(createVaultEvolution()).toEqual({});
  });
});
