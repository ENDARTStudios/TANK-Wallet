// @ts-nocheck
// ============ Transaction Engine (Phase 5) ============
//
// "Explain Before Signing" — Nunca mostrar apenas hexadecimal.
// Pipeline obrigatório: Build → Simulate → Analyze → Risk Score → User Confirmation → Broadcast → Monitor

import type { Hex, Address } from 'viem'
import { EvmProvider, EvmSigner } from '@/lib/wallet-evm'
import { analyzeCalldata } from '@/lib/wallet-scanner'
import { queryThreatAddress, queryThreatToken, combineRiskSignals, type CombinedRiskAssessment } from '../threat-intel'

export type TxStage =
  | 'building'
  | 'simulating'
  | 'analyzing'
  | 'scoring'
  | 'confirming'
  | 'broadcasting'
  | 'monitoring'
  | 'confirmed'
  | 'failed'
  | 'blocked'

export interface TransactionPipeline {
  id: string
  stage: TxStage
  // Inputs
  from: string
  to: string
  value: string
  data?: string
  chain: string
  // Build stage
  built?: {
    gasEstimate: bigint
    gasPrice: bigint
    nonce: number
  }
  // Simulate stage
  simulated?: {
    success: boolean
    result?: string
    error?: string
  }
  // Analyze stage
  analyzed?: {
    findings: Array<{ severity: string; title: string; description: string; recommendation?: string }>
    permissionsCreated: string[]
    permissionsRemoved: string[]
    contractsCalled: string[]
  }
  // Score stage
  scored?: CombinedRiskAssessment
  // Confirmation
  confirmed?: boolean
  // Broadcast
  broadcasted?: {
    signedTx: string
    txHash: string
    broadcastAt?: number
  }
  // Monitor
  monitored?: {
    confirmations: number
    status: 'pending' | 'confirmed' | 'failed' | 'reorg'
    blockNumber?: number
    detectedSandwich?: boolean
    detectedFrontrun?: boolean
  }
  // Metadata
  createdAt: number
  updatedAt: number
  error?: string
}

// ============ Stage 1: Build ============

export async function buildTransaction(params: {
  from: string
  to: string
  value: string
  data?: string
  chain: string
}): Promise<{ gasEstimate: bigint; gasPrice: bigint; nonce: number }> {
  const provider = new EvmProvider(params.chain)
  let gasEstimate: bigint
  let gasPrice: bigint
  let nonce: number
  try {
    gasEstimate = await provider.estimateGas({
      from: params.from,
      to: params.to,
      value: params.value,
      data: params.data,
    })
  } catch {
    gasEstimate = 21000n
  }
  try {
    gasPrice = await provider.getGasPrice()
  } catch {
    gasPrice = 20n * 10n ** 9n
  }
  try {
    nonce = await provider.getNonce(params.from)
  } catch {
    nonce = 0
  }
  return { gasEstimate, gasPrice, nonce }
}

// ============ Stage 2: Simulate ============

export async function simulateTransaction(params: {
  from: string
  to: string
  value: string
  data?: string
  chain: string
}): Promise<{ success: boolean; result?: string; error?: string }> {
  const provider = new EvmProvider(params.chain)
  return provider.simulateCall({
    from: params.from,
    to: params.to,
    value: params.value,
    data: params.data,
  })
}

// ============ Stage 3: Analyze ============

export async function analyzeTransaction(params: {
  from: string
  to: string
  value: string
  data?: string
  chain: string
}): Promise<{
  findings: Array<{ severity: string; title: string; description: string; recommendation?: string }>
  permissionsCreated: string[]
  permissionsRemoved: string[]
  contractsCalled: string[]
}> {
  const findings: TransactionPipeline['analyzed']['findings'] = []
  const permissionsCreated: string[] = []
  const permissionsRemoved: string[] = []
  const contractsCalled: string[] = [params.to]

  // Analyze calldata for dangerous selectors
  if (params.data) {
    const calldataFindings = analyzeCalldata(params.data)
    findings.push(...calldataFindings)
    for (const f of calldataFindings) {
      if (f.title.includes('approve') || f.title.includes('setApprovalForAll') || f.title.includes('Permit2')) {
        permissionsCreated.push(f.title)
      }
    }
  }

  // Check destination address against threat database
  const threatAddr = await queryThreatAddress(params.chain, params.to)
  if (threatAddr) {
    findings.push({
      severity: 'critical',
      title: `Destinatário na Threat Intelligence: ${threatAddr.category}`,
      description: threatAddr.reason,
      recommendation: 'Transação bloqueada — destinatário é conhecido como malicioso.',
    })
  }

  return { findings, permissionsCreated, permissionsRemoved, contractsCalled }
}

// ============ Stage 4: Risk Score ============

export async function scoreTransaction(params: {
  from: string
  to: string
  value: string
  data?: string
  chain: string
  analyzed: TransactionPipeline['analyzed']
}): Promise<CombinedRiskAssessment> {
  const signals: Array<{ source: string; score: number; reasons: string[]; blocked: boolean }> = []

  // Signal 1: Calldata analysis
  const criticalFindings = params.analyzed!.findings.filter(f => f.severity === 'critical').length
  const dangerFindings = params.analyzed!.findings.filter(f => f.severity === 'danger').length
  const warningFindings = params.analyzed!.findings.filter(f => f.severity === 'warning').length
  const calldataScore = Math.max(0, 100 - criticalFindings * 40 - dangerFindings * 25 - warningFindings * 10)
  signals.push({
    source: 'calldata-analyzer',
    score: calldataScore,
    reasons: params.analyzed!.findings.map(f => f.title),
    blocked: criticalFindings > 0 && params.analyzed!.findings.some(f => f.title.includes('selfdestruct')),
  })

  // Signal 2: Threat Intelligence database
  const threatAddr = await queryThreatAddress(params.chain, params.to)
  if (threatAddr) {
    signals.push({
      source: 'threat-intel',
      score: 0,
      reasons: [threatAddr.reason],
      blocked: true,
    })
  } else {
    signals.push({
      source: 'threat-intel',
      score: 100,
      reasons: ['Destinatário não consta na Threat Intelligence'],
      blocked: false,
    })
  }

  return combineRiskSignals(signals)
}

// ============ Stage 5: User Confirmation ============

export function requiresUserConfirmation(scored: CombinedRiskAssessment): {
  required: boolean
  paranoidMode: boolean
  reason: string
} {
  if (scored.blocked) {
    return { required: false, paranoidMode: false, reason: 'Transação bloqueada automaticamente' }
  }
  if (scored.level === 'critical' || scored.level === 'high') {
    return { required: true, paranoidMode: true, reason: 'Risco elevado — Modo Paranoico ativado' }
  }
  if (scored.level === 'medium') {
    return { required: true, paranoidMode: false, reason: 'Risco moderado — confirmação necessária' }
  }
  return { required: true, paranoidMode: false, reason: 'Transação segura para assinar' }
}

// ============ Stage 6: Broadcast ============

export async function broadcastTransaction(params: {
  privateKey: Uint8Array
  to: string
  value: string
  nonce: number
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  gasLimit: bigint
  data?: string
  chain: string
}): Promise<{ signedTx: string; txHash: string }> {
  const signer = new EvmSigner(params.privateKey, params.chain)
  return signer.sign1559Tx({
    to: params.to,
    value: params.value,
    nonce: params.nonce,
    maxFeePerGas: params.maxFeePerGas.toString(),
    maxPriorityFeePerGas: params.maxPriorityFeePerGas.toString(),
    gasLimit: params.gasLimit,
    data: params.data,
  })
}

// ============ Stage 7: Monitor ============

export async function monitorTransaction(params: {
  chain: string
  txHash: string
}): Promise<{
  confirmations: number
  status: 'pending' | 'confirmed' | 'failed' | 'reorg'
  blockNumber?: number
  detectedSandwich?: boolean
  detectedFrontrun?: boolean
}> {
  const provider = new EvmProvider(params.chain)
  const receipt = await provider.waitForTx(params.txHash)
  if (!receipt) {
    return { confirmations: 0, status: 'pending' }
  }
  return {
    confirmations: 1, // would track more over time
    status: receipt.status === 'success' ? 'confirmed' : 'failed',
    blockNumber: Number(receipt.blockNumber),
    // Sandwich/frontrun detection would require mempool monitoring
    detectedSandwich: false,
    detectedFrontrun: false,
  }
}

// ============ Full pipeline orchestrator ============

export async function runPipeline(params: {
  from: string
  to: string
  value: string
  data?: string
  chain: string
  onStageChange?: (stage: TxStage, pipeline: TransactionPipeline) => void
}): Promise<TransactionPipeline> {
  const pipeline: TransactionPipeline = {
    id: `tx-${Date.now()}`,
    stage: 'building',
    from: params.from,
    to: params.to,
    value: params.value,
    data: params.data,
    chain: params.chain,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  // Stage 1: Build
  pipeline.stage = 'building'
  pipeline.updatedAt = Date.now()
  params.onStageChange?.('building', pipeline)
  try {
    pipeline.built = await buildTransaction(params)
  } catch (e) {
    pipeline.stage = 'failed'
    pipeline.error = `Build failed: ${(e as Error).message}`
    return pipeline
  }

  // Stage 2: Simulate
  pipeline.stage = 'simulating'
  pipeline.updatedAt = Date.now()
  params.onStageChange?.('simulating', pipeline)
  try {
    pipeline.simulated = await simulateTransaction(params)
  } catch (e) {
    pipeline.simulated = { success: false, error: (e as Error).message }
  }

  // Stage 3: Analyze
  pipeline.stage = 'analyzing'
  pipeline.updatedAt = Date.now()
  params.onStageChange?.('analyzing', pipeline)
  try {
    pipeline.analyzed = await analyzeTransaction(params)
  } catch (e) {
    pipeline.analyzed = { findings: [], permissionsCreated: [], permissionsRemoved: [], contractsCalled: [params.to] }
  }

  // Stage 4: Score
  pipeline.stage = 'scoring'
  pipeline.updatedAt = Date.now()
  params.onStageChange?.('scoring', pipeline)
  try {
    pipeline.scored = await scoreTransaction({ ...params, analyzed: pipeline.analyzed })
    if (pipeline.scored.blocked) {
      pipeline.stage = 'blocked'
      pipeline.error = pipeline.scored.reasons.join('; ')
      params.onStageChange?.('blocked', pipeline)
      return pipeline
    }
  } catch (e) {
    pipeline.stage = 'failed'
    pipeline.error = `Score failed: ${(e as Error).message}`
    return pipeline
  }

  // Stage 5: Confirmation (waiting for user)
  pipeline.stage = 'confirming'
  pipeline.updatedAt = Date.now()
  params.onStageChange?.('confirming', pipeline)

  return pipeline
}
