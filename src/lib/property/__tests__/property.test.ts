import { describe, it, expect } from "bun:test";
import { forAll, integerGenerator, stringGenerator } from "../index";

describe("property", () => {
  it("forAll com inteiros positivos", () => {
    const gen = integerGenerator(1, 10);
    const res = forAll(gen, (n) => n >= 1 && n <= 10, 50);
    expect(res.success).toBe(true);
  });

  it("forAll detecta contraexemplo", () => {
    const gen = integerGenerator(1, 100);
    const res = forAll(gen, (n) => n < 50, 100);
    expect(res.success).toBe(false);
    expect(res.counterexample).toBeDefined();
  });

  it("stringGenerator produz strings", () => {
    const gen = stringGenerator(2, 5);
    const res = forAll(gen, (s) => s.length >= 2 && s.length <= 5, 20);
    expect(res.success).toBe(true);
  });
});
