// ============ Universal Permission Engine (Phase 6) ============
//
// "Least Privilege" — Nunca conceder mais permissões que o necessário.
// "User Sovereignty" — Tudo é auditável. Tudo é revogável quando o protocolo permitir.
//
// Suporte unificado para múltiplos protocolos de permissão:
// ERC-20, ERC-721, ERC-1155, Permit, Permit2, ERC-4337,
// Solana Delegates, SPL Approvals, Bitcoin PSBT, Lightning Channels

export type PermissionProtocol =
  | 'erc20'
  | 'erc721'
  | 'erc1155'
  | 'permit'
  | 'permit2'
  | 'erc4337'
  | 'solana_delegate'
  | 'spl'
  | 'bitcoin_psbt'
  | 'lightning_channel'

export interface UniversalPermission {
  id: string
  protocol: PermissionProtocol
  chain: string
  /** Token contract address (for ERC-20/721/1155) or null for native */
  tokenAddress: string | null
  tokenSymbol: string
  tokenName: string
  /** Spender address (who can use the permission) */
  spenderAddress: string
  spenderName: string
  /** Allowance amount (BigInt string for ERC-20, tokenId for ERC-721, "ALL" for setApprovalForAll) */
  allowance: string
  isInfinite: boolean
  /** When the permission was granted */
  grantedAt: number
  /** Last time the permission was used */
  lastUsedAt: number | null
  /** Risk level */
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  riskReasons: string[]
  /** Whether this permission can be revoked (some protocols don't support revocation) */
  revocable: boolean
  /** Revocation method if applicable */
  revocationMethod?: 'approve_zero' | 'set_approval_for_all_false' | 'cancel_permit2' | 'close_channel' | 'manual'
}

// ============ Protocol metadata ============

export const PROTOCOL_METADATA: Record<PermissionProtocol, {
  label: string
  description: string
  icon: string
  supportsRevocation: boolean
  defaultRiskLevel: UniversalPermission['riskLevel']
}> = {
  erc20: {
    label: 'ERC-20 Approval',
    description: 'Token allowance — spender can move up to N tokens',
    icon: '◈',
    supportsRevocation: true,
    defaultRiskLevel: 'low',
  },
  erc721: {
    label: 'ERC-721 Approval',
    description: 'NFT approval — spender can transfer a specific tokenId',
    icon: '◆',
    supportsRevocation: true,
    defaultRiskLevel: 'medium',
  },
  erc1155: {
    label: 'ERC-1155 Approval',
    description: 'Multi-token approval — setApprovalForAll grants control over all tokens in the collection',
    icon: '◇',
    supportsRevocation: true,
    defaultRiskLevel: 'high',
  },
  permit: {
    label: 'ERC-2612 Permit',
    description: 'Gasless approval via EIP-712 signature — spender can approve themselves on your behalf',
    icon: '✎',
    supportsRevocation: false, // permits expire, can't be revoked
    defaultRiskLevel: 'medium',
  },
  permit2: {
    label: 'Permit2',
    description: 'Universal approval router — single signature can authorize multiple token transfers',
    icon: '✎²',
    supportsRevocation: true,
    defaultRiskLevel: 'high',
  },
  erc4337: {
    label: 'ERC-4337 Session',
    description: 'Account Abstraction session key — can execute UserOps on your behalf',
    icon: '⊕',
    supportsRevocation: true,
    defaultRiskLevel: 'high',
  },
  solana_delegate: {
    label: 'Solana Delegate',
    description: 'Stake account delegate — validator can stake your SOL',
    icon: '◎',
    supportsRevocation: true,
    defaultRiskLevel: 'medium',
  },
  spl: {
    label: 'SPL Approval',
    description: 'Solana token account delegation — delegate can transfer tokens',
    icon: '◎',
    supportsRevocation: true,
    defaultRiskLevel: 'medium',
  },
  bitcoin_psbt: {
    label: 'Bitcoin PSBT',
    description: 'Partially Signed Bitcoin Transaction — co-signer can finalize and broadcast',
    icon: '₿',
    supportsRevocation: false, // PSBTs can be discarded but not revoked once broadcast
    defaultRiskLevel: 'low',
  },
  lightning_channel: {
    label: 'Lightning Channel',
    description: 'Payment channel — peer can route payments through your node',
    icon: '⚡',
    supportsRevocation: true,
    defaultRiskLevel: 'medium',
  },
}

// ============ Risk assessment per protocol ============

export function assessPermissionRisk(permission: UniversalPermission): UniversalPermission {
  const meta = PROTOCOL_METADATA[permission.protocol]
  const reasons: string[] = []
  let riskLevel: UniversalPermission['riskLevel'] = meta.defaultRiskLevel

  // Infinite ERC-20 approvals are high risk
  if (permission.protocol === 'erc20' && permission.isInfinite) {
    riskLevel = 'high'
    reasons.push('Aprovação infinita — spender pode mover qualquer quantidade')
  }

  // setApprovalForAll (ERC-721/1155) is critical
  if ((permission.protocol === 'erc721' || permission.protocol === 'erc1155') && permission.allowance === 'ALL') {
    riskLevel = 'critical'
    reasons.push('setApprovalForAll ativo — TODOS os NFTs da coleção podem ser movidos')
  }

  // Permit2 is high risk
  if (permission.protocol === 'permit2') {
    riskLevel = 'high'
    reasons.push('Permit2 — assinatura única pode autorizar múltiplas transferências futuras')
  }

  // ERC-4337 sessions are high risk
  if (permission.protocol === 'erc4337') {
    riskLevel = 'high'
    reasons.push('Session key pode executar UserOps sem confirmação individual')
  }

  // Stale permissions (not used in 30+ days)
  if (permission.lastUsedAt !== null) {
    const daysSinceUse = (Date.now() - permission.lastUsedAt) / (1000 * 60 * 60 * 24)
    if (daysSinceUse > 90) {
      reasons.push(`Sem uso há ${Math.floor(daysSinceUse)} dias — considere revogar`)
      if (riskLevel === 'low') riskLevel = 'medium'
    } else if (daysSinceUse > 30) {
      reasons.push(`Sem uso há ${Math.floor(daysSinceUse)} dias`)
    }
  }

  if (reasons.length === 0) {
    reasons.push('Sem sinais de risco identificados')
  }

  return { ...permission, riskLevel, riskReasons: reasons }
}

// ============ Aggregate all permissions ============

/**
 * Get all permissions for a wallet across all protocols.
 * This is the universal view promised by "User Sovereignty".
 */
export async function getAllPermissions(walletAddress: string): Promise<UniversalPermission[]> {
  const permissions: UniversalPermission[] = []

  // ERC-20 + ERC-721/1155 (via existing wallet-sovereignty module)
  try {
    const { readErc20Approvals, readNftApprovals } = await import('@/lib/wallet-sovereignty')
    const chainIds = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base']
    // Note: in production, tokens list would come from indexer
    const knownTokens: Array<{ address: string; symbol: string; logoColor: string }> = [
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', logoColor: '#2775CA' },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', logoColor: '#26A17B' },
      { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', logoColor: '#627EEA' },
    ]
    for (const chain of chainIds) {
      try {
        const erc20 = await readErc20Approvals(chain, walletAddress, knownTokens)
        for (const a of erc20) {
          permissions.push(assessPermissionRisk({
            id: a.id,
            protocol: 'erc20',
            chain: a.chain,
            tokenAddress: a.tokenAddress,
            tokenSymbol: a.tokenSymbol,
            tokenName: a.tokenSymbol,
            spenderAddress: a.spenderAddress,
            spenderName: a.spenderName,
            allowance: a.allowance,
            isInfinite: a.isInfinite,
            grantedAt: Date.now(),
            lastUsedAt: a.lastUsedAt,
            riskLevel: 'low',
            riskReasons: [],
            revocable: true,
            revocationMethod: 'approve_zero',
          }))
        }
        const nfts = await readNftApprovals(chain, walletAddress)
        for (const n of nfts) {
          permissions.push(assessPermissionRisk({
            id: n.id,
            protocol: 'erc721',
            chain: n.chain,
            tokenAddress: n.tokenAddress,
            tokenSymbol: n.tokenName,
            tokenName: n.tokenName,
            spenderAddress: n.spenderAddress,
            spenderName: n.spenderName,
            allowance: 'ALL',
            isInfinite: true,
            grantedAt: Date.now(),
            lastUsedAt: null,
            riskLevel: 'critical',
            riskReasons: n.riskReasons,
            revocable: true,
            revocationMethod: 'set_approval_for_all_false',
          }))
        }
      } catch {
        // skip chain
      }
    }
  } catch {
    // module not available
  }

  // Permit2 approvals would be read from Permit2 contract
  // ERC-4337 sessions would be read from the smart account
  // Solana delegates via getStakeAccounts / getTokenAccountsByDelegate
  // Lightning channels via listchannels / listpeers

  return permissions
}

// ============ Revoke permission ============

export function buildRevocationCalldata(permission: UniversalPermission): string | null {
  switch (permission.revocationMethod) {
    case 'approve_zero':
      // approve(spender, 0) = 0x095ea7b3 + spender (32 bytes) + 0 (32 bytes)
      return `0x095ea7b3${permission.spenderAddress.slice(2).toLowerCase().padStart(64, '0')}${'0'.repeat(64)}`
    case 'set_approval_for_all_false':
      // setApprovalForAll(spender, false) = 0xa22cb465 + spender (32 bytes) + 0 (32 bytes)
      return `0xa22cb465${permission.spenderAddress.slice(2).toLowerCase().padStart(64, '0')}${'0'.repeat(64)}`
    case 'cancel_permit2':
      // Permit2 has its own cancellation mechanism
      return null // would require calling permit2.invalidateNonces()
    case 'close_channel':
      // Lightning channel close requires BOLT-2 cooperation or force-close
      return null
    default:
      return null
  }
}

// ============ Filters ============

export type PermissionFilter =
  | 'all'
  | 'high-risk'
  | 'critical'
  | 'infinite'
  | 'unused-90d'
  | 'unused-30d'
  | 'non-revocable'
  | 'erc20'
  | 'erc721'
  | 'erc1155'
  | 'permit2'
  | 'erc4337'
  | 'solana'
  | 'bitcoin'
  | 'lightning'

export function filterPermissions(permissions: UniversalPermission[], filter: PermissionFilter): UniversalPermission[] {
  switch (filter) {
    case 'all':
      return permissions
    case 'high-risk':
      return permissions.filter(p => p.riskLevel === 'high')
    case 'critical':
      return permissions.filter(p => p.riskLevel === 'critical')
    case 'infinite':
      return permissions.filter(p => p.isInfinite)
    case 'unused-90d':
      return permissions.filter(p => p.lastUsedAt === null || (Date.now() - p.lastUsedAt) > 90 * 24 * 60 * 60 * 1000)
    case 'unused-30d':
      return permissions.filter(p => p.lastUsedAt === null || (Date.now() - p.lastUsedAt) > 30 * 24 * 60 * 60 * 1000)
    case 'non-revocable':
      return permissions.filter(p => !p.revocable)
    case 'erc20':
      return permissions.filter(p => p.protocol === 'erc20')
    case 'erc721':
      return permissions.filter(p => p.protocol === 'erc721')
    case 'erc1155':
      return permissions.filter(p => p.protocol === 'erc1155')
    case 'permit2':
      return permissions.filter(p => p.protocol === 'permit2')
    case 'erc4337':
      return permissions.filter(p => p.protocol === 'erc4337')
    case 'solana':
      return permissions.filter(p => p.protocol === 'solana_delegate' || p.protocol === 'spl')
    case 'bitcoin':
      return permissions.filter(p => p.protocol === 'bitcoin_psbt')
    case 'lightning':
      return permissions.filter(p => p.protocol === 'lightning_channel')
    default:
      return permissions
  }
}
