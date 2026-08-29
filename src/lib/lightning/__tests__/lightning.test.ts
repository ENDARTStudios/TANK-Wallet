import { describe, it, expect } from "bun:test";
import { createInvoice, payInvoice, submarineSwap } from "../index";

describe("lightning", () => {
  it("cria invoice BOLT-11", () => {
    const inv = createInvoice({ amount: 1000, memo: "test" });
    expect(inv.bolt11.startsWith("lnbc")).toBe(true);
    expect(inv.paymentHash).toBeTruthy();
  });

  it("paga invoice", () => {
    const inv = createInvoice({ amount: 500 });
    const res = payInvoice(inv.bolt11);
    expect(res.success).toBe(true);
    expect(res.preimage).toBeTruthy();
  });

  it("submarine swap", () => {
    const s = submarineSwap({ from: "btc", to: "lightning", amount: 100000 });
    expect(s.swapId).toContain("swap_");
    expect(s.amount).toBe(100000);
  });
});
