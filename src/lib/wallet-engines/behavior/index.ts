'use client'

// ============ Behavior Engine (Phase 8) ============
//
// "Continuous Protection" — A carteira continua protegendo mesmo sem uso.
//
// A IA aprende o perfil de uso do proprietário:
// - horários típicos
// - dispositivos habituais
// - países / IPs
// - redes utilizadas
// - contratos frequentes
// - ticket médio
// - frequência
//
// Quando uma transação foge do padrão, o Behavior Engine eleva
// automaticamente o nível de proteção.

export interface BehaviorProfile {
  walletAddress: string
  /** Typical active hours (0-23) — bimodal distribution */
  typicalHours: number[]
  /** Chains the user typically interacts with */
  typicalChains: string[]
  /** Typical transaction amounts in USD (percentiles) */
  typicalAmountsUsd: { p25: number; p50: number; p75: number; p95: number; max: number }
  /** Devices the user typically uses (fingerprints) */
  typicalDevices: string[]
  /** Contracts the user frequently interacts with */
  typicalContracts: string[]
  /** Average transactions per day */
  frequencyPerDay: number
  /** Total observations */
  observations: number
  /** Last updated */
  updatedAt: number
}

export interface ObservedAction {
  walletAddress: string
  timestamp: number
  hour: number
  chain: string
  amountUsd: number
  deviceFingerprint: string
  contractAddress: string
  actionType: 'send' | 'swap' | 'approve' | 'stake' | 'bridge' | 'mint'
}

export interface AnomalyResult {
  score: number // 0-100, higher = more anomalous
  level: 'normal' | 'low' | 'medium' | 'high' | 'extreme'
  reasons: string[]
  recommendedAction: 'allow' | 'require_confirmation' | 'activate_paranoid' | 'block_temporarily' | 'block'
  blocked: boolean
}

const PROFILE_KEY = 'tank:behavior-profile'
const OBSERVATIONS_KEY = 'tank:behavior-observations'
const MAX_OBSERVATIONS = 200

// ============ Persistence (localStorage) ============

export function loadProfile(walletAddress: string): BehaviorProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    return all[walletAddress] ?? null
  } catch {
    return null
  }
}

export function saveProfile(profile: BehaviorProfile): void {
  if (typeof window === 'undefined') return
  try {
    const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    all[profile.walletAddress] = profile
    localStorage.setItem(PROFILE_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

export function loadObservations(walletAddress: string): ObservedAction[] {
  if (typeof window === 'undefined') return []
  try {
    const all = JSON.parse(localStorage.getItem(OBSERVATIONS_KEY) || '{}')
    return all[walletAddress] ?? []
  } catch {
    return []
  }
}

export function saveObservations(walletAddress: string, observations: ObservedAction[]): void {
  if (typeof window === 'undefined') return
  try {
    const all = JSON.parse(localStorage.getItem(OBSERVATIONS_KEY) || '{}')
    // Keep only the most recent MAX_OBSERVATIONS
    all[walletAddress] = observations.slice(0, MAX_OBSERVATIONS)
    localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

// ============ Record action (learning) ============

export function recordAction(action: ObservedAction): BehaviorProfile {
  const observations = loadObservations(action.walletAddress)
  observations.unshift(action)
  saveObservations(action.walletAddress, observations)

  const profile = computeProfile(action.walletAddress, observations)
  saveProfile(profile)
  return profile
}

// ============ Compute profile from observations ============

export function computeProfile(walletAddress: string, observations: ObservedAction[]): BehaviorProfile {
  if (observations.length === 0) {
    return {
      walletAddress,
      typicalHours: [],
      typicalChains: [],
      typicalAmountsUsd: { p25: 0, p50: 0, p75: 0, p95: 0, max: 0 },
      typicalDevices: [],
      typicalContracts: [],
      frequencyPerDay: 0,
      observations: 0,
      updatedAt: Date.now(),
    }
  }

  // Hours histogram
  const hourCounts = new Array(24).fill(0)
  for (const obs of observations) {
    hourCounts[obs.hour]++
  }
  // Top hours (those with > 5% of total observations)
  const threshold = observations.length * 0.05
  const typicalHours = hourCounts
    .map((count, hour) => ({ count, hour }))
    .filter(h => h.count > threshold)
    .map(h => h.hour)

  // Chains
  const chainCounts = new Map<string, number>()
  for (const obs of observations) {
    chainCounts.set(obs.chain, (chainCounts.get(obs.chain) ?? 0) + 1)
  }
  const typicalChains = Array.from(chainCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([chain]) => chain)

  // Amounts (sorted)
  const amounts = observations.map(o => o.amountUsd).filter(a => a > 0).sort((a, b) => a - b)
  const typicalAmountsUsd = amounts.length > 0
    ? {
        p25: amounts[Math.floor(amounts.length * 0.25)] ?? 0,
        p50: amounts[Math.floor(amounts.length * 0.5)] ?? 0,
        p75: amounts[Math.floor(amounts.length * 0.75)] ?? 0,
        p95: amounts[Math.floor(amounts.length * 0.95)] ?? 0,
        max: amounts[amounts.length - 1] ?? 0,
      }
    : { p25: 0, p50: 0, p75: 0, p95: 0, max: 0 }

  // Devices
  const deviceCounts = new Map<string, number>()
  for (const obs of observations) {
    deviceCounts.set(obs.deviceFingerprint, (deviceCounts.get(obs.deviceFingerprint) ?? 0) + 1)
  }
  const typicalDevices = Array.from(deviceCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([device]) => device)

  // Contracts
  const contractCounts = new Map<string, number>()
  for (const obs of observations) {
    if (obs.contractAddress) {
      contractCounts.set(obs.contractAddress, (contractCounts.get(obs.contractAddress) ?? 0) + 1)
    }
  }
  const typicalContracts = Array.from(contractCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([contract]) => contract)

  // Frequency (transactions per day, based on last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recent = observations.filter(o => o.timestamp > thirtyDaysAgo)
  const frequencyPerDay = recent.length / 30

  return {
    walletAddress,
    typicalHours,
    typicalChains,
    typicalAmountsUsd,
    typicalDevices,
    typicalContracts,
    frequencyPerDay,
    observations: observations.length,
    updatedAt: Date.now(),
  }
}

// ============ Detect anomaly ============

export function detectAnomaly(action: ObservedAction, profile: BehaviorProfile): AnomalyResult {
  const reasons: string[] = []
  let score = 0

  // If we don't have enough observations, can't detect anomalies
  if (profile.observations < 5) {
    return {
      score: 0,
      level: 'normal',
      reasons: ['Perfil em aprendizado — poucas observações para detectar anomalias'],
      recommendedAction: 'allow',
      blocked: false,
    }
  }

  // 1. Unusual hour
  if (profile.typicalHours.length > 0 && !profile.typicalHours.includes(action.hour)) {
    score += 20
    reasons.push(`Horário atípico (${action.hour}h) — você normalmente transaciona em ${profile.typicalHours.join(', ')}h`)
  }

  // 2. New chain
  if (profile.typicalChains.length > 0 && !profile.typicalChains.includes(action.chain)) {
    score += 25
    reasons.push(`Rede nova (${action.chain}) — você normalmente usa ${profile.typicalChains.join(', ')}`)
  }

  // 3. Amount anomaly
  if (action.amountUsd > 0) {
    if (action.amountUsd > profile.typicalAmountsUsd.max * 3) {
      score += 40
      reasons.push(`Valor muito acima do padrão — $${action.amountUsd.toFixed(2)} vs máximo histórico $${profile.typicalAmountsUsd.max.toFixed(2)}`)
    } else if (action.amountUsd > profile.typicalAmountsUsd.p95 * 2) {
      score += 25
      reasons.push(`Valor acima do percentil 95 — $${action.amountUsd.toFixed(2)} vs P95 $${profile.typicalAmountsUsd.p95.toFixed(2)}`)
    }
  }

  // 4. New device
  if (profile.typicalDevices.length > 0 && !profile.typicalDevices.includes(action.deviceFingerprint)) {
    score += 35
    reasons.push('Dispositivo novo — não reconhecido no seu perfil de uso')
  }

  // 5. New contract
  if (profile.typicalContracts.length > 0 && action.contractAddress && !profile.typicalContracts.includes(action.contractAddress)) {
    score += 15
    reasons.push('Contrato novo — não está nos seus contratos frequentes')
  }

  // 6. High frequency burst (more than 10x typical daily frequency in last hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  const observations = loadObservations(action.walletAddress)
  const lastHour = observations.filter(o => o.timestamp > oneHourAgo)
  if (profile.frequencyPerDay > 0 && lastHour.length > profile.frequencyPerDay * 10) {
    score += 30
    reasons.push(`Frequência anormal — ${lastHour.length} transações na última hora vs frequência típica de ${profile.frequencyPerDay.toFixed(1)}/dia`)
  }

  score = Math.min(100, score)

  let level: AnomalyResult['level'] = 'normal'
  let recommendedAction: AnomalyResult['recommendedAction'] = 'allow'
  let blocked = false

  if (score >= 80) {
    level = 'extreme'
    recommendedAction = 'block_temporarily'
    blocked = true
  } else if (score >= 60) {
    level = 'high'
    recommendedAction = 'activate_paranoid'
  } else if (score >= 40) {
    level = 'medium'
    recommendedAction = 'require_confirmation'
  } else if (score >= 20) {
    level = 'low'
    recommendedAction = 'require_confirmation'
  }

  if (reasons.length === 0) {
    reasons.push('Ação dentro do padrão de uso')
  }

  return { score, level, reasons, recommendedAction, blocked }
}

// ============ Device fingerprint ============

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server'
  const parts = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}`,
    `${screen.colorDepth}`,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() ?? 'unknown',
  ]
  // Simple hash
  const str = parts.join('|')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `dev-${Math.abs(hash).toString(16)}`
}

// ============ Seed demo observations ============

export function seedDemoObservations(walletAddress: string): void {
  if (typeof window === 'undefined') return
  const existing = loadObservations(walletAddress)
  if (existing.length > 0) return

  const device = getDeviceFingerprint()
  const now = Date.now()
  const observations: ObservedAction[] = []

  // Simulate 30 days of typical activity
  for (let i = 0; i < 30; i++) {
    const daysAgo = 30 - i
    const timestamp = now - daysAgo * 24 * 60 * 60 * 1000
    const hour = 9 + Math.floor(Math.random() * 9) // 9am-6pm
    const amountUsd = 50 + Math.random() * 450 // $50-$500
    observations.push({
      walletAddress,
      timestamp,
      hour,
      chain: 'ethereum',
      amountUsd,
      deviceFingerprint: device,
      contractAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // Uniswap V3 Router
      actionType: 'swap',
    })
  }

  saveObservations(walletAddress, observations)
  const profile = computeProfile(walletAddress, observations)
  saveProfile(profile)
}
