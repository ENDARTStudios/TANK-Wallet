import { describe, it, expect } from "bun:test";
import { encryptSync, decryptSync } from "../crypted";

describe("crypted", () => {
  const key = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

  it("roundtrip", () => {
    const ct = encryptSync("portfolio-sync-2026", key);
    const pt = decryptSync(ct, key);
    expect(pt).toBe("portfolio-sync-2026");
  });

  it("ciphertext começa com enc:", () => {
    const ct = encryptSync("data", key);
    expect(ct.startsWith("enc:")).toBe(true);
  });

  it("chave errada falha", () => {
    const ct = encryptSync("secret", key);
    const wrong = new Uint8Array([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
    expect(() => decryptSync(ct, wrong)).not.toThrow();
  });
});
