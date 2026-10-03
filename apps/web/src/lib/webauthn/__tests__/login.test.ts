import { describe, it, expect } from "bun:test";
import { buildAssertionOptions, verifyAssertion } from "../login";

describe("webauthn login", () => {
  it("buildAssertionOptions com credentials", () => {
    const o = buildAssertionOptions({ rpId: "tankwallet.dev", credentialIds: ["c1", "c2"] });
    expect(o.allowCredentials).toHaveLength(2);
    expect(o.allowCredentials[0].id).toBe("c1");
  });

  it("verifyAssertion aceita válido", () => {
    const a = { id: "c1", rawId: "c1", type: "public-key", response: { clientDataJSON: "x", authenticatorData: "y", signature: "sig" } };
    const r = verifyAssertion(a, "chal_123", "https://tankwallet.dev");
    expect(r.verified).toBe(true);
    expect(r.counter).toBeGreaterThanOrEqual(0);
  });

  it("verifyAssertion rejeita type errado", () => {
    const a = { id: "c1", rawId: "c1", type: "wrong", response: { clientDataJSON: "x", authenticatorData: "y", signature: "s" } };
    expect(verifyAssertion(a, "c", "o").verified).toBe(false);
  });
});
