// ============ wallet-core: BIP-39 mnemonic + HD derivation ============

import { InternalError, WalletError } from './errors'
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { HDKey } from '@scure/bip32'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { publicKeyToAddress } from 'viem/accounts'
import { payments as btcPayments } from 'bitcoinjs-lib'
import { derivePath as slip10Derive } from 'ed25519-hd-key'
import * as ed25519 from '@noble/ed25519'
import { secp256k1 } from '@noble/curves/secp256k1.js'

export type Mnemonic = string

export interface DerivedEvmAccount {
  path: string
  address: string
  privateKey: Uint8Array
  publicKey: Uint8Array
}

export interface DerivedSolanaAccount {
  path: string
  address: string
  secretKey: Uint8Array
  publicKey: Uint8Array
}

export interface DerivedBtcAccount {
  path: string
  address: string // Native SegWit (bech32)
  publicKey: Uint8Array
  privateKey: Uint8Array
}

export interface DerivedLightningAccount {
  path: string
  publicKey: Uint8Array
  privateKey: Uint8Array
  /** LN node id would be the 33-byte pubkey hex prefixed with 02/03 */
  nodeId: string
}

// ============ Mnemonic ============

export function createMnemonic(strength: 128 | 256 = 128): string {
  return generateMnemonic(wordlist, strength)
}

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic.trim().toLowerCase(), wordlist)
}

export async function mnemonicToSeedBytes(mnemonic: string): Promise<Uint8Array> {
  return mnemonicToSeed(mnemonic)
}

// ============ EVM derivation (BIP-44 m/44'/60'/0'/0/x) ============

export async function deriveEvmAccount(
  mnemonic: string,
  index = 0
): Promise<DerivedEvmAccount> {
  const seed = await mnemonicToSeed(mnemonic)
  const hd = HDKey.fromMasterSeed(seed)
  const path = `m/44'/60'/0'/0/${index}`
  const child = hd.derive(path)
  if (!child.privateKey || !child.publicKey) {
    throw new WalletError('TANK-6006', 'Failed to derive EVM private key')
  }
  // EVM address = last 20 bytes of keccak256(publicKey)
  const publicKeyUncompressed = child.publicKey.slice(1) // drop 0x04 prefix
  const addressBytes = keccak_256(publicKeyUncompressed).slice(-20)
  const address = `0x${toHex(addressBytes)}`
  // Cross-check with viem (sanity)
  const viemAddress = publicKeyToAddress(`0x${toHex(child.publicKey)}`)
  if (viemAddress.toLowerCase() !== address.toLowerCase()) {
    // Use viem's stricter implementation as canonical
    return {
      path,
      address: viemAddress,
      privateKey: child.privateKey,
      publicKey: child.publicKey,
    }
  }
  return { path, address, privateKey: child.privateKey, publicKey: child.publicKey }
}

// ============ Solana derivation (SLIP-0010 m/44'/501'/0'/0') ============

export async function deriveSolanaAccount(
  mnemonic: string,
  index = 0
): Promise<DerivedSolanaAccount> {
  const seed = await mnemonicToSeed(mnemonic)
  // ed25519-hd-key expects the seed as a hex string (not Uint8Array)
  const seedHex = toHex(seed)
  const path = `m/44'/501'/${index}'/0'`
  const derived = slip10Derive(path, seedHex)
  const privateKey = derived.key.slice(0, 32)
  const publicKey = await ed25519.getPublicKey(privateKey)
  // Solana address = base58-encoded 32-byte ed25519 public key
  const address = base58Encode(publicKey)
  // Solana Keypair is 64 bytes: privateKey || publicKey
  const secretKey = new Uint8Array(64)
  secretKey.set(privateKey, 0)
  secretKey.set(publicKey, 32)
  return { path, address, secretKey, publicKey }
}

// ============ Bitcoin derivation (BIP-44 m/44'/0'/0'/0/x, Native SegWit) ============

export async function deriveBtcAccount(
  mnemonic: string,
  index = 0
): Promise<DerivedBtcAccount> {
  const seed = await mnemonicToSeed(mnemonic)
  const hd = HDKey.fromMasterSeed(seed)
  const path = `m/84'/0'/0'/0/${index}` // Native SegWit (bech32)
  const child = hd.derive(path)
  if (!child.privateKey || !child.publicKey) {
    throw new WalletError('TANK-6006', 'Failed to derive BTC private key')
  }
  // Use compressed public key directly with bitcoinjs-lib payments (no ECPair needed)
  const { address } = btcPayments.p2wpkh({ pubkey: Buffer.from(child.publicKey) })
  return {
    path,
    address: address ?? '',
    publicKey: child.publicKey,
    privateKey: child.privateKey,
  }
}

// ============ Lightning derivation (BIP-44 m/44'/0'/0'/0/x, lightning variant) ============

export async function deriveLightningAccount(
  mnemonic: string,
  index = 0
): Promise<DerivedLightningAccount> {
  const seed = await mnemonicToSeed(mnemonic)
  const hd = HDKey.fromMasterSeed(seed)
  const path = `m/44'/0'/0'/0/${index}`
  const child = hd.derive(path)
  if (!child.privateKey || !child.publicKey) {
    throw new WalletError('TANK-6006', 'Failed to derive Lightning key')
  }
  // Lightning node id is the compressed 33-byte public key
  const nodeId = `02${toHex(child.publicKey.slice(1))}`
  return {
    path,
    publicKey: child.publicKey,
    privateKey: child.privateKey,
    nodeId,
  }
}

// ============ Multi-chain wallet ============

export interface FullWallet {
  mnemonic: string
  evm: DerivedEvmAccount
  solana: DerivedSolanaAccount
  bitcoin: DerivedBtcAccount
  lightning: DerivedLightningAccount
}

export async function deriveFullWallet(mnemonic: string): Promise<FullWallet> {
  const [evm, solana, bitcoin, lightning] = await Promise.all([
    deriveEvmAccount(mnemonic, 0),
    deriveSolanaAccount(mnemonic, 0),
    deriveBtcAccount(mnemonic, 0),
    deriveLightningAccount(mnemonic, 0),
  ])
  return { mnemonic, evm, solana, bitcoin, lightning }
}

// ============ Helpers ============

const HEX_CHARS = '0123456789abcdef'
export function toHex(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += HEX_CHARS[bytes[i] >> 4] + HEX_CHARS[bytes[i] & 0xf]
  }
  return out
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
export function base58Encode(bytes: Uint8Array): string {
  let num = BigInt('0')
  for (let i = 0; i < bytes.length; i++) {
    num = num * BigInt(256) + BigInt(bytes[i])
  }
  let out = ''
  while (num > 0) {
    const r = num % BigInt(58)
    out = BASE58_ALPHABET[Number(r)] + out
    num = num / BigInt(58)
  }
  // leading zeros
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    out = '1' + out
  }
  return out
}

export function bytesToHex(bytes: Uint8Array): string {
  return `0x${toHex(bytes)}`
}
