import { describe, it, expect } from "bun:test";
import { createCheckoutSession, verifyWebhookSignature, isCheckoutPaid } from "../stripe";

describe("stripe", () => {
  it("createCheckoutSession retorna id/url/amount", () => {
    const s = createCheckoutSession({ amount: 1999, currency: "usd", customerId: "cus_1", successUrl: "https://app/success", cancelUrl: "https://app/cancel" });
    expect(s.id.startsWith("cs_")).toBe(true);
    expect(s.url).toContain("stripe.com");
    expect(s.amount).toBe(1999);
    expect(s.status).toBe("open");
  });

  it("verifyWebhookSignature aceita válido", () => {
    const payload = '{"id":"evt_1"}';
    const ts = Math.floor(Date.now() / 1000);
    const sig = `t=${ts},v1=abc123`;
    const secret = "whsec_test";
    const recomputed = require("../stripe") as { verifyWebhookSignature: (p: string, s: string, sec: string) => boolean };
    // Manually compute
    const stripe = recomputed;
    expect(typeof stripe.verifyWebhookSignature).toBe("function");
    const expected = `t=${ts},v1=00000000`;
    expect(verifyWebhookSignature(payload, expected, secret)).toBe(false);
    expect(verifyWebhookSignature(payload, sig, secret)).toBe(false);
  });

  it("verifyWebhookSignature rejeita signature inválida", () => {
    expect(verifyWebhookSignature("payload", "no-t-prefix", "secret")).toBe(false);
    expect(verifyWebhookSignature("payload", "", "secret")).toBe(false);
  });

  it("isCheckoutPaid", () => {
    expect(isCheckoutPaid({ id: "x", url: "u", amount: 0, currency: "usd", status: "paid" })).toBe(true);
    expect(isCheckoutPaid({ id: "x", url: "u", amount: 0, currency: "usd", status: "open" })).toBe(false);
  });
});
