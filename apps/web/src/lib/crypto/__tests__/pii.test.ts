import { describe, it, expect } from "bun:test";
import { encryptPII, decryptPII } from "../pii";

describe("pii (AES-256-GCM v2)", () => {
  const key = new Uint8Array(32).fill(7);

  it("roundtrip email", () => {
    const ct = encryptPII("alice@example.com", key);
    expect(decryptPII(ct, key)).toBe("alice@example.com");
  });

  it("roundtrip phone", () => {
    const ct = encryptPII("+5511999998888", key);
    expect(decryptPII(ct, key)).toBe("+5511999998888");
  });

  it("ciphertext usa formato v2 com IV aleatório (dois ciphertexts diferem)", () => {
    const a = encryptPII("mesmo-plaintext", key);
    const b = encryptPII("mesmo-plaintext", key);
    expect(a.startsWith("pii:v2:")).toBe(true);
    expect(a).not.toBe(b);
  });

  it("ciphertext tamperado falha na verificação GCM", () => {
    const ct = encryptPII("dados-sensiveis", key);
    const parts = ct.split(":");
    const ctBytes = Buffer.from(parts[4], "hex");
    ctBytes[0] ^= 0xff;
    parts[4] = Buffer.from(ctBytes).toString("hex");
    expect(() => decryptPII(parts.join(":"), key)).toThrow();
  });

  it("chave errada falha na verificação GCM", () => {
    const ct = encryptPII("dados", key);
    const wrongKey = new Uint8Array(32).fill(8);
    expect(() => decryptPII(ct, wrongKey)).toThrow();
  });

  it("encrypt exige chave de 32 bytes (fail-closed)", () => {
    const shortKey = new Uint8Array(31).fill(7);
    expect(() => encryptPII("x", shortKey)).toThrow(/32 bytes/);
  });
});

describe("pii — compatibilidade com formato legado (XOR)", () => {
  const key = new Uint8Array(32).fill(7);

  // Vetor congelado gerado pela implementação legada (2026-09-30) antes da
  // reescrita; permite decrypt de dados existentes durante a migração.
  it("decrypt de ciphertext legado", () => {
    const legacy =
      "pii:090909090909090909090909:3de895d17e8b4264cdb2fee623046d7adc0808f7dcb7e05729";
    expect(decryptPII(legacy, key)).toBe("legacy-vector@example.com");
  });

  it("encrypt novo NUNCA produz formato legado sem tag", () => {
    const ct = encryptPII("novo", key);
    expect(ct.split(":")).toHaveLength(5); // pii : v2 : iv : tag : ct
  });
});
