'use client'

// ============ Signature Engine ============
//
// Toda assinatura recebe classificação de risco.
// Tipos: SignMessage, TypedData, Permit, Permit2, NFT Approval, Transfer, Contract Execution

export type SignatureType =
  | 'sign-message'      // EIP-191 personal sign
  | 'typed-data'        // EIP-712 typed data
  | 'permit'            // ERC-2612 gasless approve
  | 'permit2'           // Permit2 universal approval
  | 'nft-approval'      // setApprovalForAll
  | 'transfer'          // simple ETH/token transfer
  | 'contract-execution' // arbitrary contract call
  | 'deploy'            // contract deployment

export interface SignatureClassification {
  type: SignatureType
  label: string
  description: string
  baseRiskScore: number // 0-100, higher = safer
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  requiresSimulation: boolean
  requiresBiometric: boolean
  requiresDoubleConfirmation: boolean
  canBlock: boolean
  humanExplanation: string
}

const SIGNATURE_CLASSIFICATIONS: Record<SignatureType, SignatureClassification> = {
  'sign-message': {
    type: 'sign-message',
    label: 'Sign Message (EIP-191)',
    description: 'Assinatura de mensagem arbitrária. Pode ser usada para autenticação ou, em casos maliciosos, para autorizar transações futuras.',
    baseRiskScore: 60,
    riskLevel: 'medium',
    requiresSimulation: false,
    requiresBiometric: false,
    requiresDoubleConfirmation: true,
    canBlock: true,
    humanExplanation: 'Este site pede que você assine uma mensagem. Assinaturas de mensagem podem ser usadas para autenticação, mas também podem ser maliciosas — nunca assine mensagens que não entende.',
  },
  'typed-data': {
    type: 'typed-data',
    label: 'Typed Data (EIP-712)',
    description: 'Assinatura de dados tipados. Mais seguro que signMessage pois o conteúdo é estruturado, mas ainda pode autorizar operações.',
    baseRiskScore: 50,
    riskLevel: 'medium',
    requiresSimulation: false,
    requiresBiometric: false,
    requiresDoubleConfirmation: true,
    canBlock: true,
    humanExplanation: 'Este site pede que você assine dados tipados (EIP-712). Estruturado, mas pode autorizar operações como listagens de NFT ou permits.',
  },
  'permit': {
    type: 'permit',
    label: 'Permit (ERC-2612)',
    description: 'Aprovação gasless via assinatura. O gastador pode aprovar a si mesmo em seu nome sem transação on-chain.',
    baseRiskScore: 40,
    riskLevel: 'high',
    requiresSimulation: false,
    requiresBiometric: true,
    requiresDoubleConfirmation: true,
    canBlock: true,
    humanExplanation: 'Esta assinatura é um Permit (ERC-2612) — concede aprovação gasless. O gastador pode mover seus tokens sem nova confirmação. Permits não podem ser revogados, apenas expiram.',
  },
  'permit2': {
    type: 'permit2',
    label: 'Permit2 (Universal)',
    description: 'Sistema universal de aprovação da Uniswap. Uma única assinatura pode autorizar múltiplas transferências futuras.',
    baseRiskScore: 25,
    riskLevel: 'high',
    requiresSimulation: false,
    requiresBiometric: true,
    requiresDoubleConfirmation: true,
    canBlock: true,
    humanExplanation: 'Esta assinatura usa Permit2 — uma única assinatura pode autorizar múltiplas transferências futuras sem nova confirmação. Risco elevado.',
  },
  'nft-approval': {
    type: 'nft-approval',
    label: 'NFT Approval (setApprovalForAll)',
    description: 'Concede controle sobre TODOS os NFTs da coleção ao gastador.',
    baseRiskScore: 15,
    riskLevel: 'critical',
    requiresSimulation: true,
    requiresBiometric: true,
    requiresDoubleConfirmation: true,
    canBlock: true,
    humanExplanation: 'Esta transação concede setApprovalForAll — o gastador poderá transferir TODOS os seus NFTs desta coleção. Risco crítico. Revogue imediatamente após uso.',
  },
  'transfer': {
    type: 'transfer',
    label: 'Transfer',
    description: 'Transferência simples de ETH ou token. Risco limitado ao valor transferido.',
    baseRiskScore: 80,
    riskLevel: 'low',
    requiresSimulation: true,
    requiresBiometric: false,
    requiresDoubleConfirmation: false,
    canBlock: false,
    humanExplanation: 'Esta é uma transferência simples. Verifique o endereço de destino e o valor antes de confirmar.',
  },
  'contract-execution': {
    type: 'contract-execution',
    label: 'Contract Execution',
    description: 'Execução arbitrária de contrato. Pode fazer qualquer coisa — simulação obrigatória.',
    baseRiskScore: 50,
    riskLevel: 'medium',
    requiresSimulation: true,
    requiresBiometric: false,
    requiresDoubleConfirmation: true,
    canBlock: true,
    humanExplanation: 'Esta transação executa um contrato. Simulação obrigatória para determinar o impacto exato.',
  },
  'deploy': {
    type: 'deploy',
    label: 'Contract Deployment',
    description: 'Deploy de novo contrato. O bytecode será executado na chain.',
    baseRiskScore: 30,
    riskLevel: 'high',
    requiresSimulation: true,
    requiresBiometric: true,
    requiresDoubleConfirmation: true,
    canBlock: true,
    humanExplanation: 'Esta transação faz deploy de um novo contrato. Verifique o bytecode antes de confirmar.',
  },
}

export function classifySignature(
  type: SignatureType,
  context?: { isInfiniteApproval?: boolean; contractVerified?: boolean }
): SignatureClassification {
  const base = SIGNATURE_CLASSIFICATIONS[type]
  let score = base.baseRiskScore
  let level = base.riskLevel

  // Adjust for infinite approval
  if (context?.isInfiniteApproval) {
    score -= 30
    if (level === 'medium') level = 'high'
    if (level === 'low') level = 'medium'
  }

  // Adjust for unverified contract
  if (context?.contractVerified === false) {
    score -= 20
    if (level === 'low') level = 'medium'
  }

  score = Math.max(0, Math.min(100, score))
  const finalLevel: SignatureClassification['riskLevel'] =
    score >= 90 ? 'safe' : score >= 70 ? 'low' : score >= 45 ? 'medium' : score >= 20 ? 'high' : 'critical'

  return { ...base, baseRiskScore: score, riskLevel: finalLevel }
}

export function getAllSignatureTypes(): SignatureClassification[] {
  return Object.values(SIGNATURE_CLASSIFICATIONS)
}
