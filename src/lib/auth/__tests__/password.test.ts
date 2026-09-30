import { describe, it, expect } from "bun:test";
import { hashPassword, verifyPassword, needsRehash } from "../password";

describe("password (scrypt)", () => {
  it("hash + verify roundtrip", async () => {
    const hash = await hashPassword("S3nh4-Forte!123");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("S3nh4-Forte!123", hash)).toBe(true);
  });

  it("senha errada não verifica", async () => {
    const hash = await hashPassword("correta");
    expect(await verifyPassword("errada", hash)).toBe(false);
  });

  it("hashes do mesmo plaintext diferem (salt aleatório)", async () => {
    expect(await hashPassword("mesma")).not.toBe(await hashPassword("mesma"));
  });

  it("hash tamperado não verifica", async () => {
    const hash = await hashPassword("senha");
    const parts = hash.split("$");
    const hashB64 = Buffer.from(parts[5], "base64");
    hashB64[0] ^= 0xff;
    parts[5] = Buffer.from(hashB64).toString("base64");
    expect(await verifyPassword("senha", parts.join("$"))).toBe(false);
  });

  it("formato legado (texto puro) verifica + precisa de rehash", async () => {
    expect(await verifyPassword("plaintext-legacy", "plaintext-legacy")).toBe(true);
    expect(await verifyPassword("errada", "plaintext-legacy")).toBe(false);
    expect(needsRehash("plaintext-legacy")).toBe(true);
  });

  it("hash scrypt não precisa de rehash", async () => {
    expect(needsRehash(await hashPassword("senha"))).toBe(false);
  });

  it("string vazia ou malformada não verifica nem lança", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "scrypt$corrompido")).toBe(false);
  });
});
