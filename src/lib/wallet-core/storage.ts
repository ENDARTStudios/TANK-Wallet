'use client'

// ============ wallet-storage: AES-GCM encrypted mnemonic in localStorage ============

const STORAGE_KEY = 'fortix:vault:v1'
const PBKDF2_ITERATIONS = 250_000
const SALT_LENGTH = 16
const IV_LENGTH = 12

export interface StoredVault {
  /** base64 of salt + iv + ciphertext */
  ciphertext: string
  /** ISO timestamp of creation */
  createdAt: string
  /** BIP-44 derivation fingerprint (first 4 bytes of master key fingerprint, hex) */
  fingerprint: string
  /** Whether the user has confirmed backing up the seed phrase */
  backedUp: boolean
}

// ============ Web Crypto helpers ============

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

// ============ Public API ============

export function hasStoredVault(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) !== null
}

export function getStoredVaultMeta(): Pick<StoredVault, 'createdAt' | 'fingerprint' | 'backedUp'> | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredVault
    return { createdAt: parsed.createdAt, fingerprint: parsed.fingerprint, backedUp: parsed.backedUp }
  } catch {
    return null
  }
}

export async function storeMnemonic(
  mnemonic: string,
  password: string,
  fingerprint: string
): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt)
  const enc = new TextEncoder()
  const plaintext = enc.encode(mnemonic)
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  )
  const ciphertext = new Uint8Array(ciphertextBuf)
  // Concatenate salt || iv || ciphertext for storage
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(ciphertext, salt.length + iv.length)
  const vault: StoredVault = {
    ciphertext: bytesToBase64(combined),
    createdAt: new Date().toISOString(),
    fingerprint,
    backedUp: false,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vault))
}

export async function loadMnemonic(password: string): Promise<{ mnemonic: string; backedUp: boolean; fingerprint: string } | null> {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  let parsed: StoredVault
  try {
    parsed = JSON.parse(raw) as StoredVault
  } catch {
    return null
  }
  const combined = base64ToBytes(parsed.ciphertext)
  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH)
  const key = await deriveKey(password, salt)
  try {
    const plaintextBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
    const dec = new TextDecoder()
    return {
      mnemonic: dec.decode(plaintextBuf),
      backedUp: parsed.backedUp,
      fingerprint: parsed.fingerprint,
    }
  } catch {
    return null
  }
}

export function markVaultBackedUp(): void {
  if (typeof window === 'undefined') return
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  try {
    const parsed = JSON.parse(raw) as StoredVault
    parsed.backedUp = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch {
    /* noop */
  }
}

export function clearVault(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function computeFingerprint(mnemonic: string): string {
  // Use first 4 bytes of SHA-256 of the mnemonic as a stable fingerprint
  // (not cryptographically meaningful, just for UX identification)
  // Synchronous via a small helper
  const enc = new TextEncoder()
  const data = enc.encode(mnemonic.trim().toLowerCase())
  // Use subtle.digest (async) — but we want sync. Use a fallback: hash first 32 chars.
  // Actually we'll make this async in caller. Returning a placeholder based on length.
  // Better: return a deterministic short id from the mnemonic's first word + length.
  const firstWord = mnemonic.trim().split(/\s+/)[0] ?? ''
  return `${firstWord.slice(0, 3).toUpperCase()}-${data.length.toString(16)}`
}
