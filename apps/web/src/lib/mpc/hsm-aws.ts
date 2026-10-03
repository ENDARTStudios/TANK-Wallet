export interface KmsConfig { provider: "aws" | "gcp" | "azure"; keyId: string; region?: string }

export function createAwsKmsHsm(config: KmsConfig): { sign: (payload: Uint8Array) => Promise<string>; getPublicKey: () => Promise<string> } {
  return {
    async sign(payload: Uint8Array): Promise<string> {
      let h = 0;
      for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload[i]) >>> 0;
      return `aws-kms:${config.keyId}:${h.toString(16).padStart(8, "0")}:${config.region ?? "us-east-1"}`;
    },
    async getPublicKey(): Promise<string> {
      return `aws-pub:${config.keyId}`;
    },
  };
}

export function createGcpKmsHsm(config: KmsConfig): { sign: (payload: Uint8Array) => Promise<string>; getPublicKey: () => Promise<string> } {
  return {
    async sign(payload: Uint8Array): Promise<string> {
      let h = 0;
      for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload[i]) >>> 0;
      return `gcp-kms:${config.keyId}:${h.toString(16)}`;
    },
    async getPublicKey(): Promise<string> {
      return `gcp-pub:${config.keyId}`;
    },
  };
}
