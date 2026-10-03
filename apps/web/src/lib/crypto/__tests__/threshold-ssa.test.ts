import { describe, it, expect } from "bun:test";
import { signThreshold, verifyThreshold, combinePartialSignatures } from "../threshold-ssa";

describe("threshold-ssa", () => {
  it("sign com 2-of-3", () => {
    const sig = signThreshold({ message: "tx1", shares: ["s1", "s2"], threshold: 2 });
    expect(sig.participants).toBe(2);
    expect(sig.r).toBeTruthy();
  });

  it("verify com pubkey", () => {
    const sig = signThreshold({ message: "tx2", shares: ["s1", "s2", "s3"], threshold: 2 });
    expect(verifyThreshold({ message: "tx2", signature: sig, publicKey: "pk" })).toBe(true);
  });

  it("combine partials", () => {
    const a = signThreshold({ message: "tx3", shares: ["s1", "s2"], threshold: 2 });
    const b = signThreshold({ message: "tx3", shares: ["s3", "s4"], threshold: 2 });
    const c = combinePartialSignatures([a, b]);
    expect(c.participants).toBe(2);
    expect(c.s.length).toBe(2 * 2);
  });
});
