export interface HsmProvider {
  sign(payload: Uint8Array, keyId: string): Promise<string>;
  getPublicKey(keyId: string): Promise<string>;
}

export function createLocalHsm(): HsmProvider {
  const keys = new Map<string, string>();
  return {
    async sign(payload, keyId) {
      let secret = keys.get(keyId);
      if (!secret) {
        secret = `hk_${keyId}_${Math.random().toString(36).slice(2, 10)}`;
        keys.set(keyId, secret);
      }
      let h = 0;
      for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload[i]) >>> 0;
      return `${keyId}:${h.toString(16).padStart(8, "0")}`;
    },
    async getPublicKey(keyId) {
      return `pub_${keyId}_${(keys.get(keyId) ?? "new").slice(3, 9)}`;
    },
  };
}

export function createRemoteHsm(endpoint: string): HsmProvider {
  return {
    async sign(payload, keyId) {
      let h = 0;
      for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload[i]) >>> 0;
      return `remote:${endpoint}:${keyId}:${h.toString(16)}`;
    },
    async getPublicKey(keyId) {
      return `pub_remote_${keyId}`;
    },
  };
}
