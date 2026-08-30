import { describe, it, expect } from "bun:test";
import { packUserOp, unpackUserOp, getUserOpHash } from "../v0.7";

describe("v0.7", () => {
  it("pack/unpack roundtrip", () => {
    const op = packUserOp({ sender: "0x1234567890123456789012345678901234567890", nonce: "0x0", callData: "0xdeadbeef" });
    const u = unpackUserOp(op);
    expect(u.sender).toBe(op.sender);
    expect(u.callData).toBe("0xdeadbeef");
  });

  it("pack com signature", () => {
    const op = packUserOp({ sender: "0xabc", nonce: "0x1", callData: "0x", signature: "0xsig" });
    expect(op.signature).toBe("0xsig");
    expect(op.preVerificationGas).toBe("0x0");
  });

  it("getUserOpHash determinístico", () => {
    const op = packUserOp({ sender: "0xabc", nonce: "0x0", callData: "0x" });
    const h1 = getUserOpHash(op, "0xEntryPoint", 1);
    const h2 = getUserOpHash(op, "0xEntryPoint", 1);
    expect(h1).toBe(h2);
    expect(h1.startsWith("0x")).toBe(true);
  });
});
