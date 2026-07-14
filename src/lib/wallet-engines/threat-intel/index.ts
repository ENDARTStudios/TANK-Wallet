'use client'

// ============ Threat Intelligence Engine (Phase 4) ============
//
// "Verify Everything" — Nada é confiável.
// Banco de dados próprio de ameaças, atualizado continuamente por workers.

export interface ThreatToken {
  chain: string
  address: string
  symbol: string
  name: string
  reason: string
  category: 'honeypot' | 'rugpull' | 'phishing' | 'fake_token' | 'wash_trading' | 'infinite_tax' | 'hidden_mint'
  source: string
  severity: number
  firstSeenAt: string
  lastConfirmedAt: string
  active: boolean
}

export interface ThreatSite {
  url: string
  reason: string
  category: 'phishing' | 'drainer' | 'fake_dapp' | 'malware' | 'fake_airdrop' | 'impersonation'
  source: string
  severity: number
  active: boolean
}

export interface ThreatAddress {
  chain: string
  address: string
  reason: string
  category: 'drainer' | 'sanctioned' | 'mixer' | 'exploiter' | 'hacker' | 'blackmail' | 'fake_token_creator'
  source: string
  severity: number
  reportCount: number
  active: boolean
}

export interface ThreatExploit {
  protocolName: string
  affectedAddresses: string
  description: string
  category: 'bridge' | 'lending' | 'dex' | 'nft' | 'staking' | 'other'
  lossUsd: number | null
  exploitedAt: string
  active: boolean
}

/**
 * Query the Threat Intelligence database for a token contract.
 */
export async function queryThreatToken(chain: string, address: string): Promise<ThreatToken | null> {
  try {
    const res = await fetch(`/api/threats/token?chain=${encodeURIComponent(chain)}&address=${encodeURIComponent(address.toLowerCase())}`)
    if (!res.ok) return null
    const json = await res.json()
    return json.threat ?? null
  } catch {
    return null
  }
}

/**
 * Query the Threat Intelligence database for a DApp site.
 */
export async function queryThreatSite(url: string): Promise<ThreatSite | null> {
  try {
    const res = await fetch(`/api/threats/site?url=${encodeURIComponent(url)}`)
    if (!res.ok) return null
    const json = await res.json()
    return json.threat ?? null
  } catch {
    return null
  }
}

/**
 * Query the Threat Intelligence database for a wallet address.
 */
export async function queryThreatAddress(chain: string, address: string): Promise<ThreatAddress | null> {
  try {
    const res = await fetch(`/api/threats/address?chain=${encodeURIComponent(chain)}&address=${encodeURIComponent(address.toLowerCase())}`)
    if (!res.ok) return null
    const json = await res.json()
    return json.threat ?? null
  } catch {
    return null
  }
}

/**
 * Query known exploits (historical reference for risk analysis).
 */
export async function queryExploits(activeOnly = true): Promise<ThreatExploit[]> {
  try {
    const res = await fetch(`/api/threats/exploit?active=${!activeOnly}`)
    if (!res.ok) return []
    const json = await res.json()
    return json.exploits ?? []
  } catch {
    return []
  }
}

/**
 * Get total threat counts for UI display.
 */
export async function getThreatStats(): Promise<{ tokens: number; sites: number; addresses: number; exploits: number; total: number } | null> {
  try {
    const res = await fetch('/api/threats/seed')
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Seed the database with initial threat data (admin only in production).
 */
export async function seedThreatDatabase(): Promise<{ success: boolean; seeded: { tokens: number; sites: number; addresses: number; exploits: number } } | null> {
  try {
    const res = await fetch('/api/threats/seed', { method: 'POST' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ============ Combined risk assessment ============

export interface CombinedRiskAssessment {
  score: number // 0-100, higher = safer
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  reasons: string[]
  blocked: boolean
  sources: string[] // which engines flagged the threat
}

/**
 * Combine signals from multiple sources into a single risk assessment.
 * This is the "Verify Everything" principle in action.
 */
export function combineRiskSignals(signals: Array<{
  source: string
  score: number
  reasons: string[]
  blocked: boolean
}>): CombinedRiskAssessment {
  if (signals.length === 0) {
    return {
      score: 100,
      level: 'safe',
      reasons: ['No signals — unknown risk'],
      blocked: false,
      sources: [],
    }
  }

  const blocked = signals.some(s => s.blocked)
  if (blocked) {
    return {
      score: 0,
      level: 'critical',
      reasons: signals.flatMap(s => s.reasons),
      blocked: true,
      sources: signals.filter(s => s.blocked).map(s => s.source),
    }
  }

  // Weighted average — worst signal weighs more
  const sorted = [...signals].sort((a, b) => a.score - b.score)
  const worst = sorted[0]
  const avg = signals.reduce((acc, s) => acc + s.score, 0) / signals.length
  const score = Math.round(worst.score * 0.6 + avg * 0.4)

  return {
    score,
    level: score >= 90 ? 'safe' : score >= 70 ? 'low' : score >= 45 ? 'medium' : score >= 20 ? 'high' : 'critical',
    reasons: [...new Set(signals.flatMap(s => s.reasons))],
    blocked: false,
    sources: signals.map(s => s.source),
  }
}
