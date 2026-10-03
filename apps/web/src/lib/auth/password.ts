import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

// Parâmetros OWASP recomendados para scrypt (N=2^14, r=8, p=1).
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;
const KEY_LEN = 64;
const SALT_LEN = 16;
const ALGORITHM = "scrypt";

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = await scrypt(plain, salt, KEY_LEN, SCRYPT_PARAMS);
  return [ALGORITHM, SCRYPT_PARAMS.N, SCRYPT_PARAMS.r, SCRYPT_PARAMS.p, salt.toString("base64"), derived.toString("base64")].join("$");
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (typeof stored !== "string" || stored.length === 0) return false;
  if (!stored.startsWith(`${ALGORITHM}$`)) {
    // Legado: senha em texto puro (pré SEC-001). Constant-time para não vazar prefixo.
    return safeEqualStrings(plain, stored);
  }
  const parts = stored.split("$");
  if (parts.length !== 6) return false;
  const [, nRaw, rRaw, pRaw, saltB64, hashB64] = parts;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p) || N <= 0 || r <= 0 || p <= 0) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltB64, "base64");
    expected = Buffer.from(hashB64, "base64");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  let derived: Buffer;
  try {
    derived = await scrypt(plain, salt, expected.length, { N, r, p, maxmem: 64 * 1024 * 1024 });
  } catch {
    return false;
  }
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// true quando a credencial armazenada não está no formato atual e deve ser
// rehasheada no próximo login bem-sucedido (upgrade transparente).
export function needsRehash(stored: string): boolean {
  return typeof stored !== "string" || !stored.startsWith(`${ALGORITHM}$`);
}

function safeEqualStrings(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Compara igualmente para manter tempo estável entre ramos de tamanho distinto.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}
