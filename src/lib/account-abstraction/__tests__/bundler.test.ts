import { describe, it, expect } from "bun:test";
import { createSmartAccount, createUserOperation, sponsorUserOp, sendUserOperation, estimateUserOpGas, sponsorWithPaymaster } from "../index";

describe("bundler", () => {
  it("estimativa de gas", () => {
    const op = createUserOperation({ sender: "0xabc", callData: "0xdeadbeef" });
    const gas = estimateUserOpGas(op);
    expect(gas).toBeGreaterThanOrEqual(21000);
    expect(gas).toBe(21000 + Math.floor(op.callData.length / 4));
  });

  it("envio de UserOperation", () => {
    const op = createUserOperation({ sender: "0x1234567890123456789012345678901234567890", callData: "0x" });
    const res = sendUserOperation(op);
    expect(res.success).toBe(true);
    expect(res.userOpHash.startsWith("ophash_")).toBe(true);
  });

  it("paymaster sponsor", () => {
    const op = createUserOperation({ sender: "0xabc", callData: "0xdead" });
    const pm = sponsorWithPaymaster(op);
    expect(pm.success).toBe(true);
    expect(pm.sponsorAddress?.startsWith("0xSponsor")).toBe(true);
  });
});
