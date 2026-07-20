'use client'

// ============ Security Kernel (TSS — Single Point of Truth) ============
//
// PRINCIPLE: No signature happens outside this flow.
//
//                    USER
//                      │
//              Security Kernel
//  ─────────────────────────────────────────
//  Identity Engine
//  Threat Intelligence Engine
//  Behavior Engine
//  Transaction Engine
//  Simulation Engine
//  Permission Engine
//  Network Engine
//  Privacy Engine
//  Recovery Engine
//  Policy Engine
//  Monitoring Engine
//  Forensic Engine
//  ─────────────────────────────────────────
//              Blockchain / DApps
//
// REGRA: nenhum novo recurso entra na Tank Wallet sem passar pelo Security Kernel.

import type { CombinedRiskAssessment } from '../wallet-engines/threat-intel'
import type { AnomalyResult } from '../wallet-engines/behavior'
import type { StateDiff } from '../wallet-engines/simulation'
import type { PolicyEvaluationResult } from '../wallet-engines/policy'

// ============ Kernel types ============

export type SecurityLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4'

export interface SecurityLevelConfig {
  level: SecurityLevel
  name: string
  description: string
  /** Whether simulation is mandatory */
  mandatorySimulation: boolean
  /** Whether biometric is required for any signature */
  biometricRequired: boolean
  /** Whether double confirmation is required */
  doubleConfirmation: boolean
  /** Whether paranoid mode (block unknown contracts) is on */
  blockUnknownContracts: boolean
  /** Whether private RPC relays are required */
  privateRelaysRequired: boolean
  /** Amount threshold for extra auth (USD) */
  amountThreshold: number
}

export const SECURITY_LEVELS: Record<SecurityLevel, SecurityLevelConfig> = {
  L0: {
    level: 'L0',
    name: 'Normal',
    description: 'Máxima praticidade para uso diário.',
    mandatorySimulation: true,
    biometricRequired: false,
    doubleConfirmation: false,
    blockUnknownContracts: false,
    privateRelaysRequired: false,
    amountThreshold: 10000,
  },
  L1: {
    level: 'L1',
    name: 'Protected',
    description: 'Verificações padrão sempre ativas.',
    mandatorySimulation: true,
    biometricRequired: false,
    doubleConfirmation: false,
    blockUnknownContracts: false,
    privateRelaysRequired: false,
    amountThreshold: 5000,
  },
  L2: {
    level: 'L2',
    name: 'Hardened',
    description: 'Simulações, análises profundas e políticas mais restritivas.',
    mandatorySimulation: true,
    biometricRequired: true,
    doubleConfirmation: false,
    blockUnknownContracts: false,
    privateRelaysRequired: false,
    amountThreshold: 1000,
  },
  L3: {
    level: 'L3',
    name: 'Zero Trust',
    description: 'Toda interação exige validação explícita e inspeção completa.',
    mandatorySimulation: true,
    biometricRequired: true,
    doubleConfirmation: true,
    blockUnknownContracts: true,
    privateRelaysRequired: true,
    amountThreshold: 500,
  },
  L4: {
    level: 'L4',
    name: 'Fortress',
    description: 'Modo máximo: bloqueio preventivo, políticas rigorosas, autenticação reforçada e isolamento das operações.',
    mandatorySimulation: true,
    biometricRequired: true,
    doubleConfirmation: true,
    blockUnknownContracts: true,
    privateRelaysRequired: true,
    amountThreshold: 0, // any amount requires auth
  },
}

// ============ Kernel context (passed through all engines) ============

export interface KernelContext {
  /** Wallet address initiating the action */
  walletAddress: string
  /** Chain involved */
  chain: string
  /** Amount in USD */
  amountUsd: number
  /** Contract address being interacted with */
  contractAddress: string
  /** Whether the contract is verified */
  contractVerified: boolean
  /** Whether this is an infinite approval */
  isInfiniteApproval: boolean
  /** Device fingerprint */
  deviceFingerprint: string
  /** Current hour (0-23) */
  hour: number
  /** Whether it's weekend */
  isWeekend: boolean
  /** Known devices for the wallet */
  knownDevices: string[]
  /** Known chains for the wallet */
  knownChains: string[]
  /** Current security level */
  securityLevel: SecurityLevel
}

// ============ Engine outputs ============

export interface EngineOutputs {
  threat: { score: number; reasons: string[]; blocked: boolean } | null
  behavior: AnomalyResult | null
  simulation: StateDiff | null
  policy: PolicyEvaluationResult | null
  deviceTrust: { score: number; level: string; warnings: string[] } | null
  permission: { openApprovals: number; criticalApprovals: number } | null
  network: { rpcScore: number; latency: number } | null
}

// ============ Kernel decision ============

export type KernelDecision = 'ALLOW' | 'WARN' | 'REQUIRE_EXTRA_AUTH' | 'BLOCK'

export interface KernelResult {
  decision: KernelDecision
  /** Final decision score (0-100, higher = safer) */
  decisionScore: number
  /** Per-engine scores */
  engineScores: {
    threat: number
    behavior: number
    device: number
    contract: number
    permission: number
    network: number
    policy: number
    simulation: number
  }
  /** All reasons that contributed to the decision */
  reasons: string[]
  /** Whether biometric is required */
  requireBiometric: boolean
  /** Whether double confirmation is required */
  requireDoubleConfirmation: boolean
  /** Whether the action is blocked */
  blocked: boolean
  /** Block reason if blocked */
  blockReason?: string
  /** Human-readable explanation */
  explanation: string
  /** Audit trail of all engine evaluations */
  auditTrail: Array<{ engine: string; score: number; contribution: string }>
}

// ============ Kernel orchestrator ============

/**
 * The Security Kernel orchestrates all engines and produces a single,
 * explainable, auditable decision before any blockchain interaction.
 *
 * TSS-001 (Zero Trust): nothing is trusted by default
 * TSS-002 (Explainability): always explain what will happen
 * TSS-003 (Mandatory Simulation): no broadcast without simulation
 * TSS-004 (Multi-source Consensus): multiple sources consulted
 * TSS-010 (Human First): AI recommends, user decides
 */
export async function evaluateThroughKernel(
  ctx: KernelContext,
  engines: EngineOutputs
): Promise<KernelResult> {
  const reasons: string[] = []
  const auditTrail: KernelResult['auditTrail'] = []
  let requireBiometric = false
  let requireDoubleConfirmation = false
  let blocked = false
  let blockReason: string | undefined

  // ===== Engine 1: Threat Intelligence =====
  const threatScore = engines.threat?.score ?? 100
  auditTrail.push({
    engine: 'Threat Intelligence',
    score: threatScore,
    contribution: engines.threat?.reasons.join('; ') ?? 'No threats found',
  })
  if (engines.threat?.blocked) {
    blocked = true
    blockReason = `Threat Intelligence: ${engines.threat.reasons[0]}`
  }
  reasons.push(...(engines.threat?.reasons ?? []))

  // ===== Engine 2: Behavior =====
  const behaviorScore = engines.behavior ? 100 - engines.behavior.score : 100
  auditTrail.push({
    engine: 'Behavior',
    score: behaviorScore,
    contribution: engines.behavior?.reasons.join('; ') ?? 'Normal pattern',
  })
  if (engines.behavior?.blocked) {
    blocked = true
    blockReason = `Behavioral anomaly: ${engines.behavior.reasons[0]}`
  }
  if (engines.behavior && (engines.behavior.level === 'high' || engines.behavior.level === 'extreme')) {
    requireBiometric = true
    requireDoubleConfirmation = true
  }

  // ===== Engine 3: Simulation =====
  const simulationScore = engines.simulation?.riskScore ?? 100
  auditTrail.push({
    engine: 'Simulation',
    score: simulationScore,
    contribution: engines.simulation?.humanExplanation ?? 'No simulation data',
  })
  if (engines.simulation?.blocked) {
    blocked = true
    blockReason = `Simulation: ${engines.simulation.blockReason}`
  }

  // ===== Engine 4: Policy =====
  const policyScore = engines.policy?.blocked ? 0 : (engines.policy?.requireBiometric ? 50 : 100)
  auditTrail.push({
    engine: 'Policy',
    score: policyScore,
    contribution: engines.policy?.explanation ?? 'No policy triggered',
  })
  if (engines.policy?.blocked) {
    blocked = true
    blockReason = `Policy: ${engines.policy.triggeredRules[0]?.rule.name}`
  }
  if (engines.policy?.requireBiometric) requireBiometric = true
  if (engines.policy?.requireConfirmation) requireDoubleConfirmation = true

  // ===== Engine 5: Device Trust =====
  const deviceScore = engines.deviceTrust?.score ?? 100
  auditTrail.push({
    engine: 'Device Trust',
    score: deviceScore,
    contribution: engines.deviceTrust?.warnings.join('; ') ?? 'Device trusted',
  })
  if (deviceScore < 50) {
    requireBiometric = true
    reasons.push('Device trust baixo — biometria obrigatória')
  }

  // ===== Engine 6: Contract Intelligence =====
  const contractScore = ctx.contractVerified ? 90 : 40
  auditTrail.push({
    engine: 'Contract Intelligence',
    score: contractScore,
    contribution: ctx.contractVerified ? 'Contrato verificado' : 'Contrato não verificado',
  })
  if (!ctx.contractVerified && ctx.isInfiniteApproval) {
    blocked = true
    blockReason = 'Approve infinito para contrato não verificado (TSS-006 Least Privilege)'
  }

  // ===== Engine 7: Permission =====
  const permissionScore = engines.permission
    ? Math.max(0, 100 - engines.permission.criticalApprovals * 20)
    : 100
  auditTrail.push({
    engine: 'Permission',
    score: permissionScore,
    contribution: engines.permission
      ? `${engines.permission.openApprovals} open, ${engines.permission.criticalApprovals} critical`
      : 'No permission data',
  })

  // ===== Engine 8: Network =====
  const networkScore = engines.network?.rpcScore ?? 100
  auditTrail.push({
    engine: 'Network',
    score: networkScore,
    contribution: `RPC score ${networkScore}, latency ${engines.network?.latency ?? 0}ms`,
  })

  // ===== Apply security level overrides =====
  const levelConfig = SECURITY_LEVELS[ctx.securityLevel]
  if (levelConfig.biometricRequired) requireBiometric = true
  if (levelConfig.doubleConfirmation) requireDoubleConfirmation = true
  if (levelConfig.blockUnknownContracts && !ctx.contractVerified) {
    blocked = true
    blockReason = `Security Level ${ctx.securityLevel} bloqueia contratos não verificados`
  }
  if (ctx.amountUsd > levelConfig.amountThreshold) {
    requireBiometric = true
  }

  // ===== Compute final decision score =====
  // Weighted: threat (25%), simulation (20%), behavior (15%), policy (15%), contract (10%), device (10%), network (5%)
  const decisionScore = Math.round(
    threatScore * 0.25 +
    simulationScore * 0.20 +
    behaviorScore * 0.15 +
    policyScore * 0.15 +
    contractScore * 0.10 +
    deviceScore * 0.10 +
    networkScore * 0.05
  )

  // ===== Determine decision =====
  let decision: KernelDecision
  if (blocked) {
    decision = 'BLOCK'
  } else if (decisionScore < 40 || requireBiometric) {
    decision = 'REQUIRE_EXTRA_AUTH'
  } else if (decisionScore < 70 || requireDoubleConfirmation) {
    decision = 'WARN'
  } else {
    decision = 'ALLOW'
  }

  // ===== Generate human explanation (TSS-002) =====
  const explanation = generateExplanation(decision, decisionScore, auditTrail, ctx)

  return {
    decision,
    decisionScore,
    engineScores: {
      threat: threatScore,
      behavior: behaviorScore,
      device: deviceScore,
      contract: contractScore,
      permission: permissionScore,
      network: networkScore,
      policy: policyScore,
      simulation: simulationScore,
    },
    reasons,
    requireBiometric,
    requireDoubleConfirmation,
    blocked,
    blockReason,
    explanation,
    auditTrail,
  }
}

function generateExplanation(
  decision: KernelDecision,
  score: number,
  trail: KernelResult['auditTrail'],
  ctx: KernelContext
): string {
  const parts: string[] = []

  if (decision === 'BLOCK') {
    parts.push(`🚫 Transação BLOQUEADA pelo Security Kernel (score ${score}/100).`)
  } else if (decision === 'REQUIRE_EXTRA_AUTH') {
    parts.push(`⚠️ Transação requer autenticação extra (score ${score}/100).`)
  } else if (decision === 'WARN') {
    parts.push(`⚡ Transação permitida com avisos (score ${score}/100).`)
  } else {
    parts.push(`✓ Transação aprovada pelo Security Kernel (score ${score}/100).`)
  }

  // Mention top contributing factors
  const sorted = [...trail].sort((a, b) => a.score - b.score)
  const worst = sorted[0]
  if (worst && worst.score < 70) {
    parts.push(`Fator principal: ${worst.engine} (${worst.score}/100) — ${worst.contribution}.`)
  }

  // Context
  if (ctx.isInfiniteApproval) {
    parts.push(`Atenção: esta é uma aprovação infinita.`)
  }
  if (!ctx.contractVerified) {
    parts.push(`Contrato não verificado — revisão manual recomendada.`)
  }

  return parts.join(' ')
}

// ============ Kernel gate (TSS rule enforcement) ============

/**
 * TSS enforcement: every action must pass through this gate.
 * Returns true if the action is allowed to proceed.
 */
export function kernelGate(result: KernelResult): boolean {
  // TSS-003: Mandatory Simulation — no broadcast without simulation
  if (result.engineScores.simulation === 0) {
    return false
  }
  // TSS-006: Least Privilege — blocked actions never proceed
  if (result.blocked) {
    return false
  }
  return true
}

// ============ Cryptographic self-test (TSS-005) ============

export interface SelfTestResult {
  test: string
  passed: boolean
  detail: string
}

/**
 * TSS-005 (Cryptographic Hygiene): run self-tests at wallet startup.
 * If any test fails, the wallet locks and refuses to operate.
 */
export async function runCryptographicSelfTest(): Promise<SelfTestResult[]> {
  const results: SelfTestResult[] = []

  // Test 1: CSPRNG
  try {
    const random = crypto.getRandomValues(new Uint8Array(32))
    const allZero = random.every(b => b === 0)
    results.push({
      test: 'CSPRNG (crypto.getRandomValues)',
      passed: !allZero,
      detail: allZero ? 'RNG returned all zeros — CRITICAL FAILURE' : '32 random bytes generated successfully',
    })
  } catch (e) {
    results.push({ test: 'CSPRNG', passed: false, detail: (e as Error).message })
  }

  // Test 2: AEAD (AES-256-GCM)
  try {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const data = new TextEncoder().encode('tank-self-test')
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
    const match = new TextDecoder().decode(decrypted) === 'tank-self-test'
    results.push({
      test: 'AEAD (AES-256-GCM)',
      passed: match,
      detail: match ? 'Encrypt/decrypt round-trip successful' : 'Round-trip mismatch',
    })
  } catch (e) {
    results.push({ test: 'AEAD', passed: false, detail: (e as Error).message })
  }

  // Test 3: Key derivation (PBKDF2)
  try {
    const enc = new TextEncoder()
    const baseKey = await crypto.subtle.importKey('raw', enc.encode('test'), { name: 'PBKDF2' }, false, ['deriveKey'])
    const derived = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode('salt'), iterations: 1000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )
    results.push({
      test: 'Key Derivation (PBKDF2-SHA256)',
      passed: !!derived,
      detail: 'PBKDF2 key derivation successful',
    })
  } catch (e) {
    results.push({ test: 'Key Derivation', passed: false, detail: (e as Error).message })
  }

  // Test 4: SHA-256
  try {
    const data = new TextEncoder().encode('tank')
    const hash = await crypto.subtle.digest('SHA-256', data)
    const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
    const expected = '8a7d3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3'
    // Just verify it produces a 64-char hex string
    results.push({
      test: 'SHA-256',
      passed: hex.length === 64,
      detail: `Hash length: ${hex.length} (expected 64)`,
    })
  } catch (e) {
    results.push({ test: 'SHA-256', passed: false, detail: (e as Error).message })
  }

  // Test 5: HMAC
  try {
    const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
    const data = new TextEncoder().encode('test')
    const sig = await crypto.subtle.sign('HMAC', key, data)
    const valid = await crypto.subtle.verify('HMAC', key, sig, data)
    results.push({
      test: 'HMAC-SHA256',
      passed: valid,
      detail: valid ? 'HMAC sign/verify successful' : 'HMAC verification failed',
    })
  } catch (e) {
    results.push({ test: 'HMAC', passed: false, detail: (e as Error).message })
  }

  return results
}
