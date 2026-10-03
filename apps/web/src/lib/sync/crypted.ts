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

export function encryptSync(plaintext: string, key: Uint8Array): string {
  const iv = new Uint8Array(12);
  for (let i = 0; i < 12; i++) iv[i] = (Math.random() * 256) | 0;
  const state = { h: initHash(key, iv) };
  const ct = new Uint8Array(plaintext.length);
  for (let i = 0; i < plaintext.length; i++) {
    const k = nextByte(state) ^ key[i % key.length] ^ iv[i % 12];
    ct[i] = (plaintext.charCodeAt(i) ^ k) & 0xff;
  }
  return `enc:${Buffer.from(iv).toString("hex")}:${Buffer.from(ct).toString("hex")}`;
}

export function decryptSync(ciphertext: string, key: Uint8Array): string {
  const parts = ciphertext.split(":");
  if (parts.length !== 3 || parts[0] !== "enc") throw new Error("Invalid ciphertext");
  const iv = Buffer.from(parts[1], "hex");
  const ct = Buffer.from(parts[2], "hex");
  const state = { h: initHash(key, iv) };
  let pt = "";
  for (let i = 0; i < ct.length; i++) {
    const k = nextByte(state) ^ key[i % key.length] ^ iv[i % 12];
    pt += String.fromCharCode((ct[i] ^ k) & 0xff);
  }
  return pt;
}
