import { describe, it, expect } from "bun:test";
import { splitSecret, combineShares } from "../shamir";

describe("shamir", () => {
  it("split 2-of-3 recupera com 2 shares", () => {
    const secret = "tank-wallet-secret-2026";
    const shares = splitSecret({ secret, threshold: 2, shares: 3 });
    expect(shares).toHaveLength(3);
    const recovered = combineShares({ shares: [shares[0], shares[1]], threshold: 2 });
    expect(recovered).toBe(secret);
  });

  it("split 3-of-5 recupera com 3 shares consecutivos", () => {
    const secret = "another-secret-value";
    const shares = splitSecret({ secret, threshold: 3, shares: 5 });
    const recovered = combineShares({ shares: [shares[0], shares[1], shares[2]], threshold: 3 });
    expect(recovered).toBe(secret);
  });

  it("recover com shares insuficientes falha", () => {
    const secret = "test";
    const shares = splitSecret({ secret, threshold: 2, shares: 3 });
    expect(() => combineShares({ shares: [shares[0]], threshold: 2 })).toThrow();
  });

  it("threshold inválido lança", () => {
    expect(() => splitSecret({ secret: "x", threshold: 1, shares: 3 })).toThrow();
    expect(() => splitSecret({ secret: "x", threshold: 4, shares: 3 })).toThrow();
  });

  it("hex output com padding", () => {
    const shares = splitSecret({ secret: "a", threshold: 2, shares: 2 });
    expect(shares[0].length).toBe(2);
    expect(shares[1].length).toBe(2);
  });
});
