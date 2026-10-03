// @ts-nocheck
'use client'

// ============ Audit Engine (Production Hardening) ============
//
// PRINCIPLE: "User Sovereignty" — everything generates audit.
//
// All actions are logged:
// Unlock, Approve, Swap, Bridge, Lockdown, Recovery, Export
//
// Logs are:
// - Immutable (append-only)
// - Digitally signed (HMAC-SHA256 with a per-session key)
// - Exportable (JSON + signature)
// - Never contain sensitive data (seeds, keys)

import { sha256 } from '@noble/hashes/sha2.js'
import { toHex } from '@/lib/wallet-core'

export type AuditAction =
  | 'unlock'
  | 'lock'
  | 'approve'
  | 'revoke'
  | 'swap'
  | 'bridge'
  | 'send'
  | 'receive'
  | 'lockdown'
  | 'lockdown_exit'
  | 'recovery_initiated'
  | 'recovery_completed'
  | 'export'
  | 'seed_revealed'
  | 'passkey_registered'
  | 'passkey_used'
  | 'contact_added'
  | 'contact_removed'
  | 'policy_changed'
  | 'device_warning'
  | 'behavioral_anomaly'
  | 'threat_blocked'
  | 'dapp_connected'
  | 'dapp_disconnected'
  | 'vault_unlocked'
  | 'vault_locked'
  | 'vault_deposit'
  | 'vault_withdraw'

export interface AuditEntry {
  id: string
  timestamp: number
  action: AuditAction
  /** Wallet address that performed the action */
  walletAddress: string
  /** Human-readable description */
  description: string
  /** Chain involved (if applicable) */
  chain?: string
  /** Token symbol (if applicable) */
  tokenSymbol?: string
  /** Amount (if applicable, never sensitive) */
  amount?: string
  /** Counterparty address (if applicable) */
  counterparty?: string
  /** Result of the action */
  result: 'success' | 'failure' | 'blocked'
  /** Additional metadata (never sensitive) */
  metadata?: Record<string, string | number | boolean>
  /** HMAC-SHA256 signature of the entry (for tamper detection) */
  signature: string
  /** Previous entry's signature (chain, for tamper-evident log) */
  previousSignature: string
}

// ============ HMAC signing ============

let sessionKey: Uint8Array | null = null

function getSessionKey(): Uint8Array {
  if (!sessionKey) {
    // Generate a per-session signing key (not persisted — logs can't be forged after session ends)
    sessionKey = crypto.getRandomValues(new Uint8Array(32))
  }
  return sessionKey
}

async function hmacSign(message: string, key: Uint8Array): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  return toHex(new Uint8Array(sig))
}

async function signEntry(entry: Omit<AuditEntry, 'signature' | 'previousSignature'>, previousSignature: string): Promise<string> {
  // Sign: timestamp + action + walletAddress + description + previousSignature
  const message = [
    entry.timestamp,
    entry.action,
    entry.walletAddress,
    entry.description,
    entry.chain ?? '',
    entry.tokenSymbol ?? '',
    entry.amount ?? '',
    entry.counterparty ?? '',
    entry.result,
    previousSignature,
  ].join('|')
  return hmacSign(message, getSessionKey())
}

// ============ Audit log store ============

const STORAGE_KEY = 'tank:audit-log'
const MAX_ENTRIES = 1000

export function loadAuditLog(): AuditEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAuditLog(entries: AuditEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // ignore
  }
}

// ============ Public API ============

export async function audit(
  action: AuditAction,
  walletAddress: string,
  description: string,
  options: {
    chain?: string
    tokenSymbol?: string
    amount?: string
    counterparty?: string
    result?: 'success' | 'failure' | 'blocked'
    metadata?: Record<string, string | number | boolean>
  } = {}
): Promise<AuditEntry> {
  const log = loadAuditLog()
  const previousSignature = log[0]?.signature ?? 'genesis'

  const entry: Omit<AuditEntry, 'signature' | 'previousSignature'> = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    action,
    walletAddress,
    description,
    chain: options.chain,
    tokenSymbol: options.tokenSymbol,
    amount: options.amount,
    counterparty: options.counterparty,
    result: options.result ?? 'success',
    metadata: options.metadata,
  }

  const signature = await signEntry(entry, previousSignature)

  const fullEntry: AuditEntry = {
    ...entry,
    signature,
    previousSignature,
  }

  log.unshift(fullEntry)
  saveAuditLog(log)

  return fullEntry
}

export function clearAuditLog(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function getAuditStats(): {
  total: number
  today: number
  blocked: number
  byAction: Record<string, number>
} {
  const log = loadAuditLog()
  const today = new Date().setHours(0, 0, 0, 0)
  const byAction: Record<string, number> = {}
  for (const entry of log) {
    byAction[entry.action] = (byAction[entry.action] ?? 0) + 1
  }
  return {
    total: log.length,
    today: log.filter(e => e.timestamp > today).length,
    blocked: log.filter(e => e.result === 'blocked').length,
    byAction,
  }
}

/**
 * Export the audit log as a signed JSON file.
 */
export async function exportAuditLog(walletAddress: string): Promise<void> {
  if (typeof window === 'undefined') return
  const log = loadAuditLog()
  const exportData = {
    exportedAt: new Date().toISOString(),
    walletAddress,
    entryCount: log.length,
    entries: log,
    // Sign the entire export with the session key
    exportSignature: await hmacSign(
      JSON.stringify(log.map(e => e.id).join(',')),
      getSessionKey()
    ),
  }
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tank-audit-log-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  // Audit the export itself
  await audit('export', walletAddress, 'Audit log exported', {
    metadata: { entryCount: log.length },
  })
}

/**
 * Verify the integrity of the audit log (chain of signatures).
 */
export async function verifyAuditLog(): Promise<{ valid: boolean; brokenAt?: number; reason?: string }> {
  const log = loadAuditLog()
  for (let i = 0; i < log.length; i++) {
    const entry = log[i]
    const expectedPrevious = i === log.length - 1 ? 'genesis' : log[i + 1].signature
    if (entry.previousSignature !== expectedPrevious) {
      return { valid: false, brokenAt: i, reason: 'Signature chain broken' }
    }
    // Verify signature
    const entryWithoutSig: Record<string, unknown> = { ...entry }
    const sig = entryWithoutSig.signature as string
    delete entryWithoutSig.signature
    delete entryWithoutSig.previousSignature
    const recomputed = await signEntry(entryWithoutSig as Omit<typeof entry, "signature" | "previousSignature">, entry.previousSignature)
    if (recomputed !== sig) {
      return { valid: false, brokenAt: i, reason: 'Signature mismatch — entry may be tampered' }
    }
  }
  return { valid: true }
}
