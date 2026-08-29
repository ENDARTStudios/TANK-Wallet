import { describe, it, expect } from "bun:test";
import { isTaprootAddress, isSegWitAddress } from "../psbt";

describe("psbt", () => {
  it("Taproot e SegWit detection", () => {
    expect(isTaprootAddress("bc1p5cyxnuxmeuwuvkwfem96lttc9g8f4q6fr8n6j")).toBe(true);
    expect(isSegWitAddress("bc1qxy2k...")).toBe(true);
    expect(isTaprootAddress("1A1zP1...")).toBe(false);
  });

  it("isSegWit true para bc1q", () => {
    expect(isSegWitAddress("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4")).toBe(true);
  });
});
