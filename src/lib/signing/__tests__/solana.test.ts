import { describe, it, expect } from "bun:test";
import { createVersionedTx, signVersionedTx, isVersionedTx } from "../solana";

describe("solana", () => {
  it("cria VersionedTx", () => {
    const tx = createVersionedTx("payer123", "hash123");
    expect(tx.version).toBe(0);
    expect(isVersionedTx(tx)).toBe(true);
  });

  it("assina VersionedTx", () => {
    const tx = createVersionedTx("payer", "hash");
    const signed = signVersionedTx(tx, "sig123");
    expect(signed.signatures).toEqual(["sig123"]);
  });

  it("isVersionedTx false para objeto inválido", () => {
    expect(isVersionedTx({})).toBe(false);
    expect(isVersionedTx(null)).toBe(false);
  });
});
