import { describe, it, expect } from "bun:test";
import { generateSecret, getTOTP, verifyTOTP } from "../totp";

describe("totp", () => {
  it("generateSecret retorna base32", () => {
    const s = generateSecret();
    expect(s.length).toBe(20);
    expect(s).toMatch(/^[A-Z2-7]+$/);
  });

  it("getTOTP retorna 6 dígitos", () => {
    const s = generateSecret();
    const t = getTOTP(s, 1700000000000);
    expect(t).toMatch(/^\d{6}$/);
  });

  it("verifyTOTP aceita código atual", () => {
    const s = generateSecret();
    const t = getTOTP(s);
    expect(verifyTOTP(s, t)).toBe(true);
  });

  it("verifyTOTP rejeita código inválido", () => {
    const s = generateSecret();
    expect(verifyTOTP(s, "999999")).toBe(false);
  });
});
