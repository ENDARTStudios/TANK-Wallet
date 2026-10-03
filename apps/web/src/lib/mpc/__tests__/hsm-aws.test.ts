import { describe, it, expect } from "bun:test";
import { createAwsKmsHsm, createGcpKmsHsm } from "../hsm-aws";

describe("hsm-aws", () => {
  it("AwsKmsHsm sign", async () => {
    const hsm = createAwsKmsHsm({ provider: "aws", keyId: "key-123", region: "us-east-1" });
    const sig = await hsm.sign(new Uint8Array([1, 2, 3]));
    expect(sig).toContain("aws-kms:key-123");
  });

  it("GcpKmsHsm sign", async () => {
    const hsm = createGcpKmsHsm({ provider: "gcp", keyId: "gcp-key-1" });
    const sig = await hsm.sign(new Uint8Array([5, 5]));
    expect(sig).toContain("gcp-kms:gcp-key-1");
  });
});
