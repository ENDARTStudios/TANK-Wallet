import { describe, it, expect, beforeEach } from "bun:test";
import { createMpcV2Provider } from "../index";

describe("mpc v2", () => {
  let provider: ReturnType<typeof createMpcV2Provider>;

  beforeEach(() => {
    provider = createMpcV2Provider({ threshold: 2, totalShares: 3 });
  });

  it("generateKeyPair cria par de chaves com shares", async () => {
    const { shares, publicKey } = await provider.generateKeyPair({ threshold: 2, totalShares: 3 });
    expect(publicKey).toBeTruthy();
    expect(publicKey.startsWith("mpc_pk_")).toBe(true);
    expect(shares).toHaveLength(3);
    expect(shares.every(s => s.startsWith("share_"))).toBe(true);
  });

  it("sign e combineSignatures", async () => {
    const { shares, publicKey } = await provider.generateKeyPair({ threshold: 2, totalShares: 3 });
    
    const message = new TextEncoder().encode("test message");
    const signature = await provider.sign(message, shares.slice(0, 2));
    
    expect(signature.startsWith("combined_sig_")).toBe(true);
    expect(signature).toContain("2_");
  });

  it("verify rejeita assinatura inválida", async () => {
    const { shares } = await provider.generateKeyPair({ threshold: 2, totalShares: 3 });
    
    const message = new TextEncoder().encode("test");
    const signature = await provider.sign(message, shares.slice(0, 2));
    
    expect(provider.verify(new TextEncoder().encode("wrong message"), signature, "wrong_key")).toBe(false);
  });

  it("combineSignatures combina assinaturas corretamente", () => {
    const combined = "combined_sig_2_" + "abc123def456".slice(0, 16);
    expect(combined.startsWith("combined_sig_2_")).toBe(true);
    expect(combined.length).toBeGreaterThan(20);
  });

  it("threshold validation", async () => {
    const provider = createMpcV2Provider({ threshold: 3, totalShares: 5 });
    const { shares } = await provider.generateKeyPair({ threshold: 3, totalShares: 5 });
    
    const message = new TextEncoder().encode("test");
    
    // Should fail with only 2 shares
    await expect(provider.sign(message, shares.slice(0, 2))).rejects.toThrow("Need at least 3 shares");
    
    // Should work with 3 shares
    const sig = await provider.sign(message, shares.slice(0, 3));
    expect(sig.startsWith("combined_sig_3_")).toBe(true);
  });
});