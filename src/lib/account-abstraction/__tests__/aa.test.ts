import { describe, it, expect } from "bun:test";
import { createSmartAccount, createUserOperation, sponsorUserOp } from "../index";

describe("account-abstraction", () => {
  it("cria smart account", () => {
    const acc = createSmartAccount({ owner: "0x1234567890123456789012345678901234567890" });
    expect(acc.address.startsWith("0x")).toBe(true);
    expect(acc.factory).toBeTruthy();
  });

  it("cria UserOperation", () => {
    const op = createUserOperation({ sender: "0xabc0000000000000000000000000000000000000", callData: "0xdeadbeef" });
    expect(op.nonce).toBe("0x0");
    expect(op.callData).toBe("0xdeadbeef");
  });

  it("sponsor UserOp", () => {
    const op = createUserOperation({ sender: "0xabc0000000000000000000000000000000000000", callData: "0x" });
    const sponsored = sponsorUserOp(op);
    expect(sponsored.signature).toBe("0xsponsored");
  });
});
