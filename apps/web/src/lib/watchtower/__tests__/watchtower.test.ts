import { describe, it, expect } from "bun:test";
import { watchTransaction, isFinalized } from "../index";

describe("watchtower", () => {
  it("watchTransaction calcula confirmations", () => {
    const s = watchTransaction("0xhash", 100, 95);
    expect(s.confirmations).toBe(5);
    expect(s.reorged).toBe(false);
  });

  it("watchTransaction detecta reorg", () => {
    const s = watchTransaction("0xhash", 90, 100);
    expect(s.reorged).toBe(true);
  });

  it("isFinalized 12+", () => {
    expect(isFinalized(12)).toBe(true);
    expect(isFinalized(11)).toBe(false);
  });
});
