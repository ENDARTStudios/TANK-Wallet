import { describe, it, expect } from "bun:test";
import { generateMpcShare, combineShares, createPasskey } from "../index";

describe("mpc", () => {
  it("gera 2 shares", () => {
    const shares = generateMpcShare();
    expect(shares).toHaveLength(2);
    expect(shares[0].id).toBe("1");
  });

  it("combina shares", () => {
    const shares = generateMpcShare();
    const combined = combineShares(shares);
    expect(combined.startsWith("combined_")).toBe(true);
  });

  it("cria passkey", () => {
    const p = createPasskey("alice");
    expect(p.username).toBe("alice");
    expect(p.publicKey).toContain("alice");
  });
});
