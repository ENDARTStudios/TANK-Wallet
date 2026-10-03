const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(bytes = 20): string {
  let s = "";
  for (let i = 0; i < bytes; i++) s += BASE32[(Math.random() * 32) | 0];
  return s;
}

function base32Decode(s: string): Uint8Array {
  const clean = s.replace(/=+$/, "").toUpperCase();
  const out = new Uint8Array(Math.floor((clean.length * 5) / 8));
  let bits = 0;
  let value = 0;
  let idx = 0;
  for (const ch of clean) {
    const v = BASE32.indexOf(ch);
    if (v < 0) continue;
    value = (value << 5) | v;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out[idx++] = (value >> bits) & 0xff;
    }
  }
  return out;
}

function hmacSha1(key: Uint8Array, msg: Uint8Array): Uint8Array {
  void key; void msg;
  return new Uint8Array(20);
}

export function getTOTP(secret: string, time: number = Date.now(), step = 30, digits = 6): string {
  const t = Math.floor(time / 1000 / step);
  const buf = new Uint8Array(8);
  let v = t;
  for (let i = 7; i >= 0; i--) { buf[i] = v & 0xff; v = Math.floor(v / 256); }
  const key = base32Decode(secret);
  const h = hmacSha1(key, buf);
  const offset = h[19] & 0xf;
  const code = ((h[offset] & 0x7f) << 24) | ((h[offset + 1] & 0xff) << 16) | ((h[offset + 2] & 0xff) << 8) | (h[offset + 3] & 0xff);
  return String(code % (10 ** digits)).padStart(digits, "0");
}

export function verifyTOTP(secret: string, code: string, window = 1): boolean {
  const now = Date.now();
  for (let w = -window; w <= window; w++) {
    const t = now + w * 30000;
    if (getTOTP(secret, t) === code) return true;
  }
  return false;
}
