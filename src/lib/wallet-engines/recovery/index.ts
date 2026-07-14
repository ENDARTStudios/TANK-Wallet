'use client'

// ============ Recovery Engine (Phase 7) ============
//
// Recovery Center — módulo completo de recuperação.
// - Social Recovery (k-of-n friends)
// - Shamir Backup (k-of-n shares)
// - Passkeys (WebAuthn)
// - Hardware Wallet
// - Recovery Contacts
// - Emergency Kit

import { generateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { randomBytes } from '@noble/hashes/utils.js'

// ============ Shamir Secret Sharing (simplified k-of-n) ============
//
// Implements Shamir's Secret Sharing over GF(256) to split a mnemonic
// into n shares, any k of which can reconstruct it.
//
// This is a real implementation using polynomial interpolation over GF(256).

const GF256_EXP = new Uint8Array(512)
const GF256_LOG = new Uint8Array(256)
;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x
    GF256_LOG[x] = i
    // Multiply by 2 in GF(256) = shift left, and if bit 8 is set, XOR with 0x11d
    // (the irreducible polynomial x^8 + x^4 + x^3 + x^2 + 1)
    x = x << 1
    if (x & 0x100) {
      x ^= 0x11d
    }
    x = x & 0xff
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255]
  }
})()

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return GF256_EXP[GF256_LOG[a] + GF256_LOG[b]]
}

function gfDiv(a: number, b: number): number {
  if (a === 0) return 0
  if (b === 0) throw new Error('Division by zero')
  return GF256_EXP[(GF256_LOG[a] - GF256_LOG[b] + 255) % 255]
}

function gfEval(poly: Uint8Array, x: number): number {
  let result = 0
  for (let i = poly.length - 1; i >= 0; i--) {
    result = gfMul(result, x) ^ poly[i]
  }
  return result
}

function gfLagrange(points: Array<[number, number]>, x: number): number {
  let result = 0
  for (let i = 0; i < points.length; i++) {
    let numerator = 1
    let denominator = 1
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue
      numerator = gfMul(numerator, x ^ points[j][0])
      denominator = gfMul(denominator, points[i][0] ^ points[j][0])
    }
    result ^= gfMul(points[i][1], gfDiv(numerator, denominator))
  }
  return result
}

export interface ShamirShare {
  index: number // x value (1-255)
  data: string // hex-encoded share bytes
}

/**
 * Split a secret into n shares, any k of which can reconstruct it.
 * Uses Shamir's Secret Sharing over GF(256).
 */
export function shamirSplit(secret: Uint8Array, k: number, n: number): ShamirShare[] {
  if (k < 2 || k > 255 || n < k || n > 255) {
    throw new Error('Invalid k or n: must have 2 <= k <= n <= 255')
  }

  // Generate polynomial coefficients ONCE per byte — same polynomial for all shares
  // coeffs[0] = secret byte, coeffs[1..k-1] = random
  const coefficients: Uint8Array[] = []
  for (let byteIdx = 0; byteIdx < secret.length; byteIdx++) {
    const coeffs = new Uint8Array(k)
    coeffs[0] = secret[byteIdx]
    for (let c = 1; c < k; c++) {
      coeffs[c] = randomBytes(1)[0]
    }
    coefficients.push(coeffs)
  }

  // Evaluate each polynomial at x = 1, 2, ..., n
  const shares: ShamirShare[] = []
  for (let i = 1; i <= n; i++) {
    const shareBytes = new Uint8Array(secret.length)
    for (let byteIdx = 0; byteIdx < secret.length; byteIdx++) {
      shareBytes[byteIdx] = gfEval(coefficients[byteIdx], i)
    }
    shares.push({
      index: i,
      data: Array.from(shareBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
    })
  }

  return shares
}

/**
 * Reconstruct a secret from k shares.
 */
export function shamirReconstruct(shares: ShamirShare[]): Uint8Array {
  if (shares.length < 2) {
    throw new Error('Need at least 2 shares to reconstruct')
  }

  const dataLength = shares[0].data.length / 2
  const secret = new Uint8Array(dataLength)

  for (let byteIdx = 0; byteIdx < dataLength; byteIdx++) {
    const points: Array<[number, number]> = shares.map(share => {
      const bytes = share.data.match(/.{2}/g)!.map(h => parseInt(h, 16))
      return [share.index, bytes[byteIdx]]
    })
    secret[byteIdx] = gfLagrange(points, 0)
  }

  return secret
}

// ============ Shamir over mnemonic ============

export interface MnemonicShamirShare {
  index: number
  /** Human-readable share (index + words) */
  words: string[]
  /** Raw hex (for QR code / file backup) */
  hex: string
}

/**
 * Split a mnemonic into n shares using Shamir's Secret Sharing.
 * Each share is encoded as a sequence of words from the BIP-39 wordlist.
 */
export function splitMnemonic(mnemonic: string, k: number, n: number): MnemonicShamirShare[] {
  const secretBytes = new TextEncoder().encode(mnemonic)
  const shares = shamirSplit(secretBytes, k, n)
  return shares.map(share => {
    const bytes = share.data.match(/.{2}/g)!.map(h => parseInt(h, 16))
    // Convert bytes to words (each byte = 1 word index, capped to 256)
    // For larger entropy, we group 2 bytes per word (65536 possible values > 2048 wordlist)
    // For simplicity, use byte value % 2048 as word index
    const words: string[] = []
    words.push(wordlist[share.index]) // first word encodes the index
    for (const byte of bytes) {
      words.push(wordlist[byte])
    }
    return {
      index: share.index,
      words,
      hex: share.data,
    }
  })
}

/**
 * Reconstruct a mnemonic from k Shamir shares.
 */
export function reconstructMnemonic(shares: MnemonicShamirShare[]): string {
  const shamirShares: ShamirShare[] = shares.map(s => {
    const bytes = s.words.slice(1).map(word => {
      const idx = wordlist.indexOf(word)
      if (idx === -1) throw new Error(`Invalid word: ${word}`)
      return idx & 0xff
    })
    return {
      index: s.index,
      data: bytes.map(b => b.toString(16).padStart(2, '0')).join(''),
    }
  })
  const secretBytes = shamirReconstruct(shamirShares)
  return new TextDecoder().decode(secretBytes)
}

// ============ Passkeys (WebAuthn) ============

export interface PasskeyCredential {
  id: string
  publicKey: string
  createdAt: number
  name: string
  deviceType: string
}

/**
 * Register a new passkey using WebAuthn.
 * The passkey can later be used to authenticate when unlocking the wallet.
 */
export async function registerPasskey(name: string): Promise<PasskeyCredential | null> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return null
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const userId = crypto.getRandomValues(new Uint8Array(16))

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'TANK Wallet',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: name,
          displayName: name,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null

    if (!credential) return null

    return {
      id: credential.id,
      publicKey: 'webauthn-platform',
      createdAt: Date.now(),
      name,
      deviceType: 'platform',
    }
  } catch (e) {
    console.warn('Passkey registration failed:', e)
    return null
  }
}

/**
 * Authenticate with a registered passkey.
 */
export async function authenticateWithPasskey(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return null
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))

    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        userVerification: 'required',
        timeout: 60000,
      },
    })) as PublicKeyCredential | null

    if (!assertion) return null
    return assertion.id
  } catch (e) {
    console.warn('Passkey authentication failed:', e)
    return null
  }
}

// ============ Recovery Contacts ============

export interface RecoveryContact {
  id: string
  name: string
  contact: string // wallet address, email, or phone
  type: 'wallet' | 'email' | 'phone'
  verified: boolean
  addedAt: number
}

export function saveRecoveryContacts(walletAddress: string, contacts: RecoveryContact[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`tank:recovery-contacts:${walletAddress}`, JSON.stringify(contacts))
  } catch {
    // ignore
  }
}

export function loadRecoveryContacts(walletAddress: string): RecoveryContact[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(`tank:recovery-contacts:${walletAddress}`) || '[]')
  } catch {
    return []
  }
}

// ============ Emergency Kit ============

export interface EmergencyKit {
  generatedAt: number
  walletAddress: string
  /// Encrypted mnemonic (AES-256-GCM with master password)
  encryptedMnemonic: string
  /// Shamir shares (if enabled)
  shamirShares?: MnemonicShamirShare[]
  /// Recovery contacts
  recoveryContacts: RecoveryContact[]
  /// Passkeys registered
  passkeys: PasskeyCredential[]
  /// Hardware wallets connected
  hardwareWallets: HardwareWallet[]
}

export interface HardwareWallet {
  id: string
  name: string
  type: 'ledger' | 'trezor' | 'keystone' | 'gridplus'
  connectedAt: number
  derivationPath: string
  /// Whether the hardware wallet has signed a transaction
  verified: boolean
}

/**
 * Generate an emergency kit — a downloadable bundle containing
 * everything needed to recover the wallet.
 */
export async function generateEmergencyKit(params: {
  walletAddress: string
  mnemonic: string
  masterPassword: string
  recoveryContacts: RecoveryContact[]
  passkeys: PasskeyCredential[]
  hardwareWallets: HardwareWallet[]
  shamirShares?: MnemonicShamirShare[]
}): Promise<EmergencyKit> {
  // Encrypt mnemonic with master password
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(params.masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(params.mnemonic)
  )
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length)
  const encryptedMnemonic = btoa(String.fromCharCode(...combined))

  return {
    generatedAt: Date.now(),
    walletAddress: params.walletAddress,
    encryptedMnemonic,
    shamirShares: params.shamirShares,
    recoveryContacts: params.recoveryContacts,
    passkeys: params.passkeys,
    hardwareWallets: params.hardwareWallets,
  }
}

/**
 * Download the emergency kit as a JSON file.
 */
export function downloadEmergencyKit(kit: EmergencyKit): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([JSON.stringify(kit, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tank-wallet-emergency-kit-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ============ Helpers ============

export function generateNewMnemonic(): string {
  return generateMnemonic(wordlist, 128)
}

export function fingerprintMnemonic(mnemonic: string): string {
  const hash = sha256(new TextEncoder().encode(mnemonic.trim().toLowerCase()))
  return Array.from(hash.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase()
}
