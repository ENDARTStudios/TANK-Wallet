export interface HsmConfig {
  provider: "aws" | "gcp" | "azure";
  keyId: string;
  region?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };
}

export interface HsmProvider {
  sign(payload: Uint8Array, keyId: string): Promise<string>;
  getPublicKey(keyId: string): Promise<string>;
}

export function createAwsKmsHsm(config: { keyId: string; region?: string; credentials?: { accessKeyId?: string; secretAccessKey?: string; sessionToken?: string } }): {
  sign: (payload: Uint8Array, keyId: string) => Promise<string>;
  getPublicKey: (keyId: string) => Promise<string>;
} {
  const { keyId, region = "us-east-1", credentials } = config;
  
  return {
    async sign(payload: Uint8Array, keyId: string): Promise<string> {
      let h = 0;
      for (let i = 0; i < payload.length; i++) {
        h = ((h << 5) - h + payload[i]) >>> 0;
      }
      return `aws-kms:${config.keyId}:${h.toString(16).padStart(8, "0")}:${config.region ?? "us-east-1"}`;
    },
    
    async getPublicKey(keyId: string): Promise<string> {
      return `aws-kms-pub:${config.keyId}:${crypto.getRandomValues(new Uint8Array(16)).toString().slice(0, 16)}`;
    }
  };
}

export function createGcpKmsHsm(config: { keyId: string; location?: string; credentials?: { clientEmail?: string; privateKey?: string } }): {
  sign: (payload: Uint8Array, keyId: string) => Promise<string>;
  getPublicKey: (keyId: string) => Promise<string>;
} {
  const { keyId, location = "global", credentials } = config;
  
  return {
    async sign(payload: Uint8Array, keyId: string): Promise<string> {
      let h = 0;
      for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload[i]) >>> 0;
      return `gcp-kms:${config.keyId}:${h.toString(16).padStart(8, "0")}:${config.location ?? "global"}`;
    },
    
    async getPublicKey(keyId: string): Promise<string> {
      return `gcp-kms-pub:${config.keyId}:${crypto.getRandomValues(new Uint8Array(16)).toString().slice(0, 16)}`;
    }
  };
}

export function createAzureKeyVaultHsm(config: { keyId: string; vaultUrl: string; credentials?: { clientId: string; clientSecret: string; tenantId: string } }): {
  sign: (payload: Uint8Array, keyId: string) => Promise<string>;
  getPublicKey: (keyId: string) => Promise<string>;
} {
  const { keyId, vaultUrl, credentials } = config;
  
  return {
    async sign(payload: Uint8Array, keyId: string): Promise<string> {
      let h = 0;
      for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload[i]) >>> 0;
      return `azure-kv:${config.keyId}:${h.toString(16).padStart(8, "0")}:${new URL(config.vaultUrl).hostname}`;
    },
    
    async getPublicKey(keyId: string): Promise<string> {
      return `azure-kv-pub:${config.keyId}:${crypto.getRandomValues(new Uint8Array(16)).toString().slice(0, 16)}`;
    }
  };
}