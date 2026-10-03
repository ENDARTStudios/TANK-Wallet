// @ts-nocheck
'use client'

// ============ Simulation Engine (Production Hardening) ============
//
// PRINCIPLE: "Explain Before Signing" — Never show only hexadecimal.
//
// Pipeline:
// eth_call → trace_call → State Diff → Asset Diff → Permission Diff → Gas Diff → Human Explanation
//
// Every signature depends on this engine.

import { simulateCall } from '../network'
import { analyzeCalldata } from '@/lib/wallet-scanner'
import type { Hex, Address } from 'viem'

// ============ Types ============

export interface StateDiff {
  /** Balance changes for each token */
  assetDiff: AssetDiff[]
  /** Permissions created by this transaction */
  permissionsCreated: PermissionChange[]
  /** Permissions removed */
  permissionsRemoved: PermissionChange[]
  /** NFTs affected */
  nftsAffected: NftChange[]
  /** Contracts called */
  contractsCalled: string[]
  /** Gas cost estimate */
  gasDiff: GasDiff
  /** Whether the simulation succeeded */
  success: boolean
  /** Error message if simulation failed */
  error?: string
  /** Human-readable explanation */
  humanExplanation: string
  /** Risk level based on simulation */
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  /** Whether to block the transaction */
  blocked: boolean
  blockReason?: string
}

export interface AssetDiff {
  token: string
  symbol: string
  amountBefore: string
  amountAfter: string
  change: string
  direction: 'in' | 'out' | 'none'
  usdValue?: number
}

export interface PermissionChange {
  type: 'erc20-approve' | 'erc721-approve-all' | 'erc1155-approve-all' | 'permit2' | 'permit' | 'erc4337-session'
  tokenSymbol?: string
  spenderAddress: string
  spenderName?: string
  amount?: string
  isInfinite?: boolean
  description: string
}

export interface NftChange {
  collection: string
  tokenId: string
  action: 'transfer' | 'approve' | 'approve-all'
  from?: string
  to?: string
}

export interface GasDiff {
  gasLimit: bigint
  gasPrice: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  estimatedCostWei: bigint
  estimatedCostUsd: number
}

// ============ Simulation ============

/**
 * Simulate a transaction and produce a full state diff.
 * This is what the user sees BEFORE signing.
 */
export async function simulateTransaction(params: {
  chain: string
  from: string
  to: string
  value?: string
  data?: string
  gasLimit?: bigint
  gasPrice?: bigint
}): Promise<StateDiff> {
  // 1. eth_call simulation
  const simulation = await simulateCall(params.chain, {
    from: params.from,
    to: params.to,
    value: params.value,
    data: params.data,
  })

  // 2. Analyze calldata for permission changes
  const calldataFindings = params.data ? analyzeCalldata(params.data) : []
  const permissionsCreated: PermissionChange[] = []
  const permissionsRemoved: PermissionChange[] = []
  const nftsAffected: NftChange[] = []
  const contractsCalled = [params.to]

  for (const finding of calldataFindings) {
    if (finding.title.includes('approve') && !finding.title.includes('All') && !finding.title.includes('Permit2')) {
      // ERC-20 approve
      const isInfinite = finding.title.includes('INFINITA')
      permissionsCreated.push({
        type: 'erc20-approve',
        spenderAddress: params.to,
        amount: isInfinite ? 'infinite' : 'limited',
        isInfinite,
        description: finding.description,
      })
    }
    if (finding.title.includes('setApprovalForAll')) {
      permissionsCreated.push({
        type: 'erc721-approve-all',
        spenderAddress: params.to,
        isInfinite: true,
        description: finding.description,
      })
      nftsAffected.push({
        collection: 'Unknown collection',
        tokenId: 'ALL',
        action: 'approve-all',
      })
    }
    if (finding.title.includes('Permit2')) {
      permissionsCreated.push({
        type: 'permit2',
        spenderAddress: params.to,
        description: finding.description,
      })
    }
  }

  // 3. Asset diff (would require trace_call in production)
  const assetDiff: AssetDiff[] = []
  if (params.value && parseFloat(params.value) > 0) {
    assetDiff.push({
      token: 'native',
      symbol: 'ETH',
      amountBefore: '—',
      amountAfter: '—',
      change: `-${params.value}`,
      direction: 'out',
    })
  }

  // 4. Gas diff
  const gasLimit = params.gasLimit ?? 21000n
  const gasPrice = params.gasPrice ?? 20n * 10n ** 9n
  const estimatedCostWei = gasLimit * gasPrice
  const estimatedCostUsd = Number(estimatedCostWei) / 1e18 * 3245.67 // approximate ETH price

  const gasDiff: GasDiff = {
    gasLimit,
    gasPrice,
    maxFeePerGas: gasPrice,
    maxPriorityFeePerGas: gasPrice / 10n,
    estimatedCostWei,
    estimatedCostUsd,
  }

  // 5. Determine risk level
  let riskScore = 100
  let blocked = false
  let blockReason: string | undefined

  if (!simulation.success) {
    riskScore -= 30
  }

  for (const perm of permissionsCreated) {
    if (perm.isInfinite) {
      riskScore -= 40
    }
    if (perm.type === 'erc721-approve-all' || perm.type === 'permit2') {
      riskScore -= 30
    }
  }

  // Check for selfdestruct
  if (calldataFindings.some(f => f.title.includes('selfdestruct'))) {
    riskScore = 0
    blocked = true
    blockReason = 'selfdestruct detectado — transação bloqueada'
  }

  riskScore = Math.max(0, Math.min(100, riskScore))
  const riskLevel: StateDiff['riskLevel'] =
    riskScore >= 90 ? 'safe' : riskScore >= 70 ? 'low' : riskScore >= 45 ? 'medium' : riskScore >= 20 ? 'high' : 'critical'

  // 6. Generate human explanation
  const humanExplanation = generateHumanExplanation({
    to: params.to,
    value: params.value,
    permissionsCreated,
    nftsAffected,
    assetDiff,
    gasDiff,
    simulation,
  })

  return {
    assetDiff,
    permissionsCreated,
    permissionsRemoved,
    nftsAffected,
    contractsCalled,
    gasDiff,
    success: simulation.success,
    error: simulation.error,
    humanExplanation,
    riskLevel,
    riskScore,
    blocked,
    blockReason,
  }
}

// ============ Human explanation generator ============

function generateHumanExplanation(params: {
  to: string
  value?: string
  permissionsCreated: PermissionChange[]
  nftsAffected: NftChange[]
  assetDiff: AssetDiff[]
  gasDiff: GasDiff
  simulation: { success: boolean; error?: string }
}): string {
  const parts: string[] = []

  // What this transaction does
  if (params.permissionsCreated.length > 0) {
    for (const perm of params.permissionsCreated) {
      if (perm.type === 'erc20-approve' && perm.isInfinite) {
        parts.push(`Este contrato solicita autorização ILIMITADA para movimentar seus tokens.`)
        parts.push(`Se o contrato for comprometido, o atacante poderá transferir todos os seus tokens aprovados — não apenas o valor desta transação.`)
      } else if (perm.type === 'erc20-approve') {
        parts.push(`Este contrato solicita autorização para movimentar uma quantidade específica dos seus tokens.`)
      } else if (perm.type === 'erc721-approve-all') {
        parts.push(`Este contrato solicita controle sobre TODOS os seus NFTs da coleção.`)
        parts.push(`Se o contrato for comprometido, o atacante poderá transferir toda a sua coleção em uma única transação.`)
      } else if (perm.type === 'permit2') {
        parts.push(`Este contrato usa Permit2 — uma única assinatura pode autorizar múltiplas transferências futuras sem nova confirmação.`)
      }
    }
  } else if (params.value && parseFloat(params.value) > 0) {
    parts.push(`Esta transação envia ${params.value} ETH para ${params.to.slice(0, 10)}...${params.to.slice(-4)}.`)
  } else {
    parts.push(`Esta transação interage com o contrato ${params.to.slice(0, 10)}...${params.to.slice(-4)}.`)
  }

  // Simulation result
  if (!params.simulation.success) {
    parts.push(`⚠️ A simulação falhou: ${params.simulation.error?.slice(0, 100) ?? 'erro desconhecido'}. A transação provavelmente reverterá.`)
  } else {
    parts.push(`✓ A simulação foi bem-sucedida — a transação não reverte.`)
  }

  // Gas cost
  parts.push(`Taxa de rede estimada: $${params.gasDiff.estimatedCostUsd.toFixed(2)}.`)

  return parts.join(' ')
}

// ============ Quick risk check ============

export function quickRiskCheck(diff: StateDiff): {
  allow: boolean
  requireBiometric: boolean
  requireConfirmation: boolean
  reason: string
} {
  if (diff.blocked) {
    return { allow: false, requireBiometric: false, requireConfirmation: false, reason: diff.blockReason ?? 'Blocked' }
  }
  if (diff.riskLevel === 'critical') {
    return { allow: false, requireBiometric: true, requireConfirmation: true, reason: 'Risco crítico — biometria obrigatória' }
  }
  if (diff.riskLevel === 'high') {
    return { allow: true, requireBiometric: true, requireConfirmation: true, reason: 'Risco elevado — biometria necessária' }
  }
  if (diff.riskLevel === 'medium') {
    return { allow: true, requireBiometric: false, requireConfirmation: true, reason: 'Risco moderado — confirmação necessária' }
  }
  return { allow: true, requireBiometric: false, requireConfirmation: true, reason: 'Transação segura' }
}
