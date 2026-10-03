import { describe, it, expect } from "bun:test";
import { generateChallenge, buildAttestationOptions, verifyAttestation } from "../register";

describe("webauthn register", () => {
  it("generateChallenge base64url 43 chars", () => {
    const c = generateChallenge();
    expect(c.length).toBeGreaterThanOrEqual(43);
    expect(c).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("buildAttestationOptions com rp/user/params", () => {
    const o = buildAttestationOptions({ rpId: "tankwallet.dev", userName: "alice", userId: "u1", userDisplay: "Alice" });
    expect(o.rp.id).toBe("tankwallet.dev");
    expect(o.user.name).toBe("alice");
    expect(o.pubKeyCredParams.length).toBe(2);
  });

  it("verifyAttestation aceita public-key válido", () => {
    const a = { id: "cred1", rawId: "cred1", type: "public-key", response: { clientDataJSON: "eyJ0eXBlIjoiY3JlYXRlIn0", attestationObject: "o2NmbXRkbm9uZWdhdHRTdGF0Zx" } };
    const r = verifyAttestation(a);
    expect(r.verified).toBe(true);
    expect(r.credentialId).toBe("cred1");
  });

  it("verifyAttestation rejeita type errado", () => {
    const a = { id: "c", rawId: "c", type: "wrong", response: { clientDataJSON: "x", attestationObject: "y" } };
    const r = verifyAttestation(a);
    expect(r.verified).toBe(false);
  });
});
