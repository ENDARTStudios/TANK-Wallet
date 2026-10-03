import { describe, it, expect } from "bun:test";
import { createAwsKmsHsm, createGcpKmsHsm, createAzureKeyVaultHsm } from "../hsm";

describe("hsm providers", () => {
  it("AwsKmsHsm sign e getPublicKey", async () => {
    const hsm = createAwsKmsHsm({ keyId: "arn:aws:kms:us-east-1:123456789:key/abc123", region: "us-east-1" });
    
    const payload = new Uint8Array([1, 2, 3, 4, 5]);
    const sig = await hsm.sign(payload, "test-key");
    
    expect(sig).toContain("aws-kms:");
    expect(sig).toContain("us-east-1");
    
    const pubKey = await hsm.getPublicKey("test-key");
    expect(pubKey.startsWith("aws-kms-pub:")).toBe(true);
  });

  it("GcpKmsHsm sign e getPublicKey", async () => {
    const hsm = createGcpKmsHsm({ keyId: "projects/my-project/locations/global/keyRings/kr/cryptoKeys/key1", location: "global" });
    
    const payload = new Uint8Array([1, 2, 3, 4, 5]);
    const sig = await hsm.sign(payload, "test-key");
    
    expect(sig).toContain("gcp-kms:");
    expect(sig).toContain("global");
    
    const pubKey = await hsm.getPublicKey("test-key");
    expect(pubKey.startsWith("gcp-kms-pub:")).toBe(true);
  });

  it("AzureKeyVaultHsm sign e getPublicKey", async () => {
    const hsm = createAzureKeyVaultHsm({ 
      keyId: "my-key", 
      vaultUrl: "https://myvault.vault.azure.net",
      credentials: { clientId: "cid", clientSecret: "secret", tenantId: "tid" }
    });
    
    const payload = new Uint8Array([1, 2, 3]);
    const sig = await hsm.sign(payload, "test-key");
    
    expect(sig).toContain("azure-kv:");
    expect(sig).toContain("myvault.vault.azure.net");
    
    const pubKey = await hsm.getPublicKey("test-key");
    expect(pubKey.startsWith("azure-kv-pub:")).toBe(true);
  });
});