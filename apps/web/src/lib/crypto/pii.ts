import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// v2: AES-256-GCM (SEC-002). Formato: pii:v2:<iv hex>:<tag hex>:<ct hex>
// Formato legado (XOR custom, pré SEC-002): pii:<iv hex>:<ct hex> — decrypt
// mantido apenas para migração de dados existentes; encrypt nunca o produz.
const V2_PREFIX = "pii:v2:";
const LEGACY_PREFIX = "pii:";
const KEY_LEN = 32;
const IV_LEN = 12;
const TAG_LEN = 16;

export function encryptPII(plaintext: string, key: Uint8Array): string {
  if (key.length !== KEY_LEN) {
    throw new Error(`pii: key must be ${KEY_LEN} bytes for AES-256-GCM (got ${key.length})`);
  }
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${V2_PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${ct.toString("hex")}`;
}

export function decryptPII(ciphertext: string, key: Uint8Array): string {
  if (ciphertext.startsWith(V2_PREFIX)) {
    const parts = ciphertext.split(":");
    if (parts.length !== 5) throw new Error("Invalid ciphertext");
    const iv = Buffer.from(parts[2], "hex");
    const tag = Buffer.from(parts[3], "hex");
    const ct = Buffer.from(parts[4], "hex");
    if (iv.length !== IV_LEN || tag.length !== TAG_LEN) throw new Error("Invalid ciphertext");
    if (key.length !== KEY_LEN) throw new Error(`pii: key must be ${KEY_LEN} bytes for AES-256-GCM`);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  }
  if (ciphertext.startsWith(LEGACY_PREFIX)) {
    return decryptLegacy(ciphertext, key);
  }
  throw new Error("Invalid ciphertext");
}

// Legado (XOR + PRNG djb2-like) — apenas decrypt para migração.
function decryptLegacy(ciphertext: string, key: Uint8Array): string {
  const parts = ciphertext.split(":");
  if (parts.length !== 3 || parts[0] !== "pii") throw new Error("Invalid ciphertext");
  const iv = Buffer.from(parts[1], "hex");
  const ct = Buffer.from(parts[2], "hex");
  const state = { h: initHash(key, iv) };
  const pt = new Uint8Array(ct.length);
  for (let i = 0; i < ct.length; i++) {
    const k = nextByte(state) ^ key[i % key.length] ^ iv[i % 12];
    pt[i] = ct[i] ^ k;
  }
  return Buffer.from(pt).toString("utf8");
}

function initHash(key: Uint8Array, iv: Uint8Array): number {
  let h = 5381;
  for (const b of key) h = ((h << 5) + h + b) >>> 0;
  for (const b of iv) h = ((h << 5) + h + b) >>> 0;
  return h;
}

function nextByte(state: { h: number }): number {
  state.h = ((state.h << 5) + state.h + (state.h >>> 13)) >>> 0;
  return state.h & 0xff;
}
