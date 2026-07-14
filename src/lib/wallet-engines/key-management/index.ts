'use client'

// ============ Key Management Engine (Production Hardening) ============
//
// PRINCIPLE: Never persist decrypted keys. Never log seeds. Zeroize after use.
//
// This engine is the most critical component. It manages:
// - Seed Generation (BIP-39)
// - HD Derivation (BIP-32, BIP-44, BIP-84, BIP-86, SLIP-0010)
// - Secure Storage (AES-256-GCM + PBKDF2)
// - Memory Protection (zeroization after use)
// - Hardware Wallet Bridge (future)
// - MPC (future)
// - Passkey Bridge (future)

import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { HDKey } from '@scure/bip32'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { publicKeyToAddress } from 'viem/accounts'
import { payments as btcPayments } from 'bitcoinjs-lib'
import { derivePath as slip10Derive } from 'ed25519-hd-key'
import * as ed25519 from '@noble/ed25519'
import { toHex } from '@/lib/wallet-core'

// ============ SecureBuffer — zeroizable memory wrapper ============

/**
 * Wraps sensitive byte arrays (seeds, private keys) so they can be
 * explicitly zeroized after use. JavaScript doesn't guarantee memory
 * zeroization (GC may move/copy), but this provides defense-in-depth:
 * - Overwrites the buffer with zeros when .destroy() is called
 * - Throws if accessed after destruction
 * - Never appears in JSON.stringify
 * - Never logged (toString returns [REDACTED])
 */
export class SecureBuffer {
  private buffer: Uint8Array | null
  private destroyed = false

  constructor(data: Uint8Array) {
    // Copy into a new buffer we control
    this.buffer = new Uint8Array(data.length)
    this.buffer.set(data)
  }

  /** Get the raw bytes. Throws if destroyed. */
  get bytes(): Uint8Array {
    if (this.destroyed || !this.buffer) {
      throw new Error('SecureBuffer has been destroyed — key zeroized')
    }
    return this.buffer
  }

  /** Get hex representation. Throws if destroyed. */
  get hex(): string {
    return toHex(this.bytes)
  }

  /** Whether the buffer has been zeroized. */
  get isDestroyed(): boolean {
    return this.destroyed
  }

  /** Zeroize the buffer and mark as destroyed. Safe to call multiple times. */
  destroy(): void {
    if (this.buffer) {
      // Overwrite with zeros (crypto.getRandomValues would be more secure
      // but zero is sufficient for preventing casual memory dumps)
      this.buffer.fill(0)
      // Overwrite with random for good measure
      crypto.getRandomValues(this.buffer)
      this.buffer.fill(0)
      this.buffer = null
    }
    this.destroyed = true
  }

  /** Never expose in JSON. */
  toJSON(): string {
    return '[REDACTED]'
  }

  /** Never expose in console. */
  toString(): string {
    return '[REDACTED:SecureBuffer]'
  }
}

// ============ In-memory key cache (never persisted) ============

interface KeyCacheEntry {
  seed: SecureBuffer
  derivedKeys: Map<string, SecureBuffer> // path → private key
  createdAt: number
  lastAccessedAt: number
}

class KeyCache {
  private cache = new Map<string, KeyCacheEntry>() // walletAddress → entry
  private maxAgeMs = 5 * 60 * 1000 // 5 minutes

  /** Store a decrypted seed in memory (NOT in localStorage). */
  set(walletAddress: string, seed: Uint8Array): void {
    // If there's an existing entry, destroy it first
    this.destroy(walletAddress)
    this.cache.set(walletAddress, {
      seed: new SecureBuffer(seed),
      derivedKeys: new Map(),
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    })
  }

  /** Get the seed for a wallet. Returns null if expired or not cached. */
  getSeed(walletAddress: string): SecureBuffer | null {
    const entry = this.cache.get(walletAddress)
    if (!entry) return null
    if (Date.now() - entry.createdAt > this.maxAgeMs) {
      this.destroy(walletAddress)
      return null
    }
    entry.lastAccessedAt = Date.now()
    return entry.seed
  }

  /** Get or derive a private key for a specific path. */
  getOrDerive(walletAddress: string, path: string, deriveFn: (seed: Uint8Array) => Uint8Array): SecureBuffer | null {
    const entry = this.cache.get(walletAddress)
    if (!entry) return null
    if (Date.now() - entry.createdAt > this.maxAgeMs) {
      this.destroy(walletAddress)
      return null
    }
    let key = entry.derivedKeys.get(path)
    if (!key) {
      const derived = deriveFn(entry.seed.bytes)
      key = new SecureBuffer(derived)
      // Zeroize the temporary derived array
      derived.fill(0)
      entry.derivedKeys.set(path, key)
    }
    entry.lastAccessedAt = Date.now()
    return key
  }

  /** Zeroize and remove all keys for a wallet. */
  destroy(walletAddress: string): void {
    const entry = this.cache.get(walletAddress)
    if (entry) {
      entry.seed.destroy()
      for (const key of entry.derivedKeys.values()) {
        key.destroy()
      }
      entry.derivedKeys.clear()
      this.cache.delete(walletAddress)
    }
  }

  /** Zeroize ALL keys in the cache (e.g., on lock or lockdown). */
  destroyAll(): void {
    for (const addr of Array.from(this.cache.keys())) {
      this.destroy(addr)
    }
  }

  /** Check if a wallet's keys are currently in memory. */
  has(walletAddress: string): boolean {
    const entry = this.cache.get(walletAddress)
    if (!entry) return false
    if (Date.now() - entry.createdAt > this.maxAgeMs) {
      this.destroy(walletAddress)
      return false
    }
    return true
  }
}

// Singleton — only one key cache per session
const keyCache = new KeyCache()

// ============ Secure storage (encrypted at rest) ============

const STORAGE_KEY = 'tank:vault:v2'
const PBKDF2_ITERATIONS = 250_000
const SALT_LENGTH = 16
const IV_LENGTH = 12

export interface StoredVault {
  ciphertext: string // base64 of salt + iv + ciphertext
  createdAt: string
  fingerprint: string
  backedUp: boolean
  kdf: 'pbkdf2-sha256'
  kdfIterations: number
  cipher: 'aes-256-gcm'
  version: 2
}

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
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
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

export async function storeMnemonicSecure(
  mnemonic: string,
  password: string,
  fingerprint: string
): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt)
  const enc = new TextEncoder()
  const plaintext = enc.encode(mnemonic)
  const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  const ciphertext = new Uint8Array(ciphertextBuf)
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(ciphertext, salt.length + iv.length)
  // Zeroize temporaries
  plaintext.fill(0)
  ciphertext.fill(0)
  const vault: StoredVault = {
    ciphertext: bytesToBase64(combined),
    createdAt: new Date().toISOString(),
    fingerprint,
    backedUp: false,
    kdf: 'pbkdf2-sha256',
    kdfIterations: PBKDF2_ITERATIONS,
    cipher: 'aes-256-gcm',
    version: 2,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vault))
}

export async function loadMnemonicSecure(password: string): Promise<{ mnemonic: string; backedUp: boolean; fingerprint: string } | null> {
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
    const plaintextBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
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

export function clearVault(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  keyCache.destroyAll()
}

// ============ Seed generation and validation ============

export function generateSeed(strength: 128 | 256 = 128): string {
  return generateMnemonic(wordlist, strength)
}

export function isValidSeed(mnemonic: string): boolean {
  return validateMnemonic(mnemonic.trim().toLowerCase(), wordlist)
}

export function fingerprintSeed(mnemonic: string): string {
  const hash = sha256(new TextEncoder().encode(mnemonic.trim().toLowerCase()))
  return Array.from(hash.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase()
}

// ============ In-memory key management ============

/**
 * Decrypt the mnemonic and load the seed into the secure key cache.
 * The seed stays in memory (SecureBuffer) for up to 5 minutes, then auto-zeroizes.
 * The decrypted mnemonic string is NEVER persisted.
 */
export async function unlockKeys(walletAddress: string, password: string): Promise<boolean> {
  const result = await loadMnemonicSecure(password)
  if (!result) return false
  const seed = await mnemonicToSeed(result.mnemonic)
  keyCache.set(walletAddress, seed)
  // Zeroize the seed array (SecureBuffer has its own copy)
  seed.fill(0)
  // Do NOT store the mnemonic string anywhere — it's gone after this function
  return true
}

/**
 * Lock all keys — zeroize the entire key cache.
 * Called on: manual lock, auto-lock timeout, lockdown.
 */
export function lockKeys(): void {
  keyCache.destroyAll()
}

/**
 * Check if keys are currently in memory for a wallet.
 */
export function areKeysUnlocked(walletAddress: string): boolean {
  return keyCache.has(walletAddress)
}

/**
 * Get the EVM private key for a wallet (derives if needed, caches in secure memory).
 * The returned SecureBuffer MUST be destroyed by the caller after use.
 */
export function getEvmPrivateKey(walletAddress: string, index = 0): SecureBuffer | null {
  return keyCache.getOrDerive(walletAddress, `m/44'/60'/0'/0/${index}`, (seed) => {
    const hd = HDKey.fromMasterSeed(seed)
    const child = hd.derive(`m/44'/60'/0'/0/${index}`)
    if (!child.privateKey) throw new Error('Failed to derive EVM key')
    // Return a COPY — the HDKey's internal buffer shouldn't be exposed
    const copy = new Uint8Array(child.privateKey)
    return copy
  })
}

/**
 * Get the Solana keypair for a wallet.
 */
export function getSolanaKeypair(walletAddress: string, index = 0): SecureBuffer | null {
  return keyCache.getOrDerive(walletAddress, `m/44'/501'/${index}'/0'`, (seed) => {
    const seedHex = toHex(seed)
    const derived = slip10Derive(`m/44'/501'/${index}'/0'`, seedHex)
    return derived.key.slice(0, 32)
  })
}

/**
 * Get the Bitcoin private key (Native SegWit, BIP-84).
 */
export function getBtcPrivateKey(walletAddress: string, index = 0): SecureBuffer | null {
  return keyCache.getOrDerive(walletAddress, `m/84'/0'/0'/0/${index}`, (seed) => {
    const hd = HDKey.fromMasterSeed(seed)
    const child = hd.derive(`m/84'/0'/0'/0/${index}`)
    if (!child.privateKey) throw new Error('Failed to derive BTC key')
    const copy = new Uint8Array(child.privateKey)
    return copy
  })
}

// ============ Logging safety ============

/**
 * NEVER log seeds, mnemonics, or private keys.
 * This function sanitizes log arguments to prevent accidental exposure.
 */
export function sanitizeLogArgs(args: unknown[]): unknown[] {
  return args.map(arg => {
    if (arg instanceof SecureBuffer) return '[REDACTED:SecureBuffer]'
    if (typeof arg === 'string') {
      // Check if it looks like a mnemonic (12+ space-separated words)
      if (/^([a-z]+\s){11,}[a-z]+$/i.test(arg.trim())) return '[REDACTED:mnemonic]'
      // Check if it looks like a private key (64 hex chars)
      if (/^0x[0-9a-f]{64}$/i.test(arg)) return '[REDACTED:privateKey]'
      // Check if it looks like a hex seed
      if (/^[0-9a-f]{128}$/i.test(arg)) return '[REDACTED:seed]'
    }
    if (arg && typeof arg === 'object' && 'mnemonic' in arg) {
      return { ...arg, mnemonic: '[REDACTED]' }
    }
    if (arg && typeof arg === 'object' && 'privateKey' in arg) {
      return { ...arg, privateKey: '[REDACTED]' }
    }
    if (arg && typeof arg === 'object' && 'seed' in arg) {
      return { ...arg, seed: '[REDACTED]' }
    }
    return arg
  })
}

// Override console.log to sanitize (defense-in-depth)
if (typeof window !== 'undefined' && !((console as any)._tankSanitized)) {
  const originalLog = console.log
  const originalWarn = console.warn
  const originalError = console.error
  ;(console as any).log = (...args: unknown[]) => originalLog(...sanitizeLogArgs(args))
  ;(console as any).warn = (...args: unknown[]) => originalWarn(...sanitizeLogArgs(args))
  ;(console as any).error = (...args: unknown[]) => originalError(...sanitizeLogArgs(args))
  ;(console as any)._tankSanitized = true
}

// ============ Auto-lock timer ============

let autoLockTimer: ReturnType<typeof setTimeout> | null = null
const AUTO_LOCK_MS = 5 * 60 * 1000 // 5 minutes

export function resetAutoLockTimer(onLock: () => void): void {
  if (autoLockTimer) clearTimeout(autoLockTimer)
  autoLockTimer = setTimeout(() => {
    lockKeys()
    onLock()
  }, AUTO_LOCK_MS)
}

export function clearAutoLockTimer(): void {
  if (autoLockTimer) {
    clearTimeout(autoLockTimer)
    autoLockTimer = null
  }
}

// ============ Multi-path derivation support ============

export const DERIVATION_PATHS = {
  EVM: "m/44'/60'/0'/0/0",        // BIP-44 Ethereum
  BTC_NATIVE_SEGWIT: "m/84'/0'/0'/0/0", // BIP-84 Native SegWit
  BTC_TAPROOT: "m/86'/0'/0'/0/0",  // BIP-86 Taproot
  SOLANA: "m/44'/501'/0'/0'",      // SLIP-0010 Solana
  LIGHTNING: "m/44'/0'/0'/0/0",    // Lightning variant
} as const

export interface DerivedAddresses {
  evm: string
  btc: string
  solana: string
  lightning: string
}

export async function deriveAllAddresses(mnemonic: string): Promise<DerivedAddresses> {
  const seed = await mnemonicToSeed(mnemonic)
  const hd = HDKey.fromMasterSeed(seed)

  // EVM
  const evmChild = hd.derive(DERIVATION_PATHS.EVM)
  const evmAddress = evmChild.publicKey
    ? publicKeyToAddress(`0x${toHex(evmChild.publicKey)}`)
    : ''

  // BTC Native SegWit
  const btcChild = hd.derive(DERIVATION_PATHS.BTC_NATIVE_SEGWIT)
  const btcAddress = btcChild.publicKey
    ? btcPayments.p2wpkh({ pubkey: Buffer.from(btcChild.publicKey) }).address ?? ''
    : ''

  // Solana (SLIP-0010)
  const seedHex = toHex(seed)
  const solDerived = slip10Derive(DERIVATION_PATHS.SOLANA, seedHex)
  const solPriv = solDerived.key.slice(0, 32)
  const solPub = await ed25519.getPublicKey(solPriv)
  const solanaAddress = (() => {
    const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    let num = BigInt('0')
    for (let i = 0; i < solPub.length; i++) num = num * BigInt(256) + BigInt(solPub[i])
    let out = ''
    while (num > 0) {
      const r = num % BigInt(58)
      out = BASE58_ALPHABET[Number(r)] + out
      num = num / BigInt(58)
    }
    for (let i = 0; i < solPub.length && solPub[i] === 0; i++) out = '1' + out
    return out
  })()

  // Lightning
  const lnChild = hd.derive(DERIVATION_PATHS.LIGHTNING)
  const lightningAddress = lnChild.publicKey ? `02${toHex(lnChild.publicKey.slice(1))}` : ''

  // Zeroize seed
  seed.fill(0)

  return {
    evm: evmAddress,
    btc: btcAddress,
    solana: solanaAddress,
    lightning: lightningAddress,
  }
}
