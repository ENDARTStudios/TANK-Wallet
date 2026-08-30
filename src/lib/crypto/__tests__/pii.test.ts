import { describe, it, expect } from "bun:test";
import { encryptPII, decryptPII } from "../pii";

describe("pii", () => {
  const key = new Uint8Array(32).fill(7);

  it("roundtrip email", () => {
    const ct = encryptPII("alice@example.com", key);
    expect(decryptPII(ct, key)).toBe("alice@example.com");
  });

  it("roundtrip phone", () => {
    const ct = encryptPII("+5511999998888", key);
    expect(decryptPII(ct, key)).toBe("+5511999998888");
  });

  it("ciphertext começa com pii:", () => {
    const ct = encryptPII("data", key);
    expect(ct.startsWith("pii:")).toBe(true);
  });
});
