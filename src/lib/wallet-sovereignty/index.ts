// @ts-nocheck
// ============ wallet-sovereignty: approvals, sessions, lockdown ============
//
// Princípio nº 1: "Nada é permanente sem o consentimento contínuo do usuário."
// Este módulo implementa a leitura e revogação de permissões na blockchain.

import { createPublicClient, http, type Address, type Hex } from 'viem'
import { mainnet, bsc, polygon, arbitrum, optimism, avalanche, base } from 'viem/chains'
import { EVM_CHAINS, RPC_ENDPOINTS } from '@/lib/wallet-evm'

// ============ ERC-20 Approvals ============

export interface Erc20Approval {
  id: string
  chain: string
  tokenAddress: string
  tokenSymbol: string
  tokenLogoColor: string
  spenderAddress: string
  spenderName: string
  /** Amount approved in token units (BigInt string) */
  allowance: string
  /** Whether the approval is infinite (max uint256) */
  isInfinite: boolean
  /** Formatted human-readable allowance */
  formattedAllowance: string
  /** Last time this approval was used (timestamp) */
  lastUsedAt: number | null
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  riskReasons: string[]
}

// Known spenders — common DEXs and protocols with their contract addresses per chain
const KNOWN_SPENDERS: Record<string, Array<{ address: string; name: string; logoColor: string }>> = {
  ethereum: [
    { address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', name: 'Uniswap V3 Router', logoColor: '#FF007A' },
    { address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', name: 'Uniswap V3 SwapRouter', logoColor: '#FF007A' },
    { address: '0x1111111254EEB25477B68fb85Ed929f73A960582', name: '1inch Router', logoColor: '#FF7083' },
    { address: '0x881D40237659C251811CEC9c364ef91dC08D300C', name: 'Metamask Swap', logoColor: '#F6851B' },
    { address: '0x000000000022D473030F116dDEE9F6B43aC78BA3', name: 'Permit2', logoColor: '#FF0000' },
  ],
  bsc: [
    { address: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4', name: 'PancakeSwap V3 Router', logoColor: '#FCD535' },
    { address: '0x10ED43C718714eb63d5aA57B78B54704E256024E', name: 'PancakeSwap V2 Router', logoColor: '#FCD535' },
  ],
  polygon: [
    { address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', name: 'Uniswap V3 SwapRouter', logoColor: '#FF007A' },
    { address: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', name: 'SushiSwap Router', logoColor: '#FA52A0' },
  ],
}

const spenderName = (chain: string, address: string): string => {
  const known = KNOWN_SPENDERS[chain]?.find((s) => s.address.toLowerCase() === address.toLowerCase())
  return known?.name ?? 'Contrato desconhecido'
}

const spenderColor = (chain: string, address: string): string => {
  const known = KNOWN_SPENDERS[chain]?.find((s) => s.address.toLowerCase() === address.toLowerCase())
  return known?.logoColor ?? '#71717A'
}

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

/**
 * Read all ERC-20 approvals for a wallet address by scanning known spenders.
 * In production, this would also use an indexer (Alchemy/Covalent) to find ALL approvals,
 * not just known ones.
 */
export async function readErc20Approvals(
  chain: string,
  walletAddress: string,
  tokens: Array<{ address?: string; symbol: string; logoColor: string }>
): Promise<Erc20Approval[]> {
  const spenders = KNOWN_SPENDERS[chain] ?? []
  if (spenders.length === 0 || tokens.length === 0) return []

  const publicClient = createPublicClient({
    chain: EVM_CHAINS[chain],
    transport: http(RPC_ENDPOINTS[chain][0], { timeout: 15000 }),
  })

  const approvals: Erc20Approval[] = []
  const erc20AllowanceAbi = [
    {
      name: 'allowance',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { type: 'address' },
        { type: 'address' },
      ],
      outputs: [{ type: 'uint256' }],
    },
  ] as const

  await Promise.all(
    tokens.map(async (token) => {
      if (!token.address) return
      await Promise.all(
        spenders.map(async (spender) => {
          try {
            const allowance = (await publicClient.readContract({
              address: token.address as Address,
              abi: erc20AllowanceAbi,
              functionName: 'allowance',
              args: [walletAddress as Address, spender.address as Address],
            })) as bigint
            if (allowance === 0n) return
            const isInfinite = allowance.toString(16).toLowerCase() === MAX_UINT256
            approvals.push({
              id: `${chain}-${token.address}-${spender.address}`,
              chain,
              tokenAddress: token.address ?? '',
              tokenSymbol: token.symbol,
              tokenLogoColor: token.logoColor,
              spenderAddress: spender.address,
              spenderName: spender.name,
              allowance: allowance.toString(),
              isInfinite,
              formattedAllowance: isInfinite ? '∞' : allowance.toString(),
              lastUsedAt: null,
              riskLevel: isInfinite ? 'high' : 'low',
              riskReasons: isInfinite
                ? ['Aprovação infinita — o spender pode mover qualquer quantidade']
                : ['Aprovação limitada — valor específico autorizado'],
            })
          } catch {
            // skip
          }
        })
      )
    })
  )
  return approvals
}

/**
 * Build the raw transaction data to revoke an ERC-20 approval.
 * Returns the calldata for `approve(spender, 0)`.
 */
export function buildRevokeErc20ApprovalCalldata(spenderAddress: string): Hex {
  // approve(address,uint256) selector = 0x095ea7b3
  // padded spender (32 bytes) + 0 (32 bytes)
  const spender = spenderAddress.slice(2).toLowerCase().padStart(64, '0')
  return `0x095ea7b3${spender}${'0'.repeat(64)}` as Hex
}

// ============ NFT Approvals (setApprovalForAll) ============

export interface NftApproval {
  id: string
  chain: string
  tokenAddress: string
  tokenName: string
  spenderAddress: string
  spenderName: string
  approved: boolean
  riskLevel: 'high' | 'critical'
  riskReasons: string[]
}

const KNOWN_NFT_COLLECTIONS: Record<string, Array<{ address: string; name: string; logoColor: string }>> = {
  ethereum: [
    { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', name: 'Bored Ape Yacht Club', logoColor: '#E1A117' },
    { address: '0x60E4d786628Fea6478F785A6d747dc566Bb06177', name: 'Azuki', logoColor: '#FF0000' },
    { address: '0xED5AF388653567Af2F388E6224dC7C4b3241C544', name: 'Otherdeed', logoColor: '#7C3AED' },
    { address: '0x5Af0D9827E0c53E4799BB226655A1de152A425a5', name: 'Moonbirds', logoColor: '#5363A6' },
  ],
}

/**
 * Read setApprovalForAll status for known NFT collections.
 */
export async function readNftApprovals(chain: string, walletAddress: string): Promise<NftApproval[]> {
  const collections = KNOWN_NFT_COLLECTIONS[chain] ?? []
  if (collections.length === 0) return []

  const publicClient = createPublicClient({
    chain: EVM_CHAINS[chain],
    transport: http(RPC_ENDPOINTS[chain][0], { timeout: 15000 }),
  })

  const spenders = KNOWN_SPENDERS[chain] ?? []
  const erc721IsApprovedForAllAbi = [
    {
      name: 'isApprovedForAll',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { type: 'address' },
        { type: 'address' },
      ],
      outputs: [{ type: 'bool' }],
    },
  ] as const

  const approvals: NftApproval[] = []
  await Promise.all(
    collections.map(async (collection) => {
      await Promise.all(
        spenders.map(async (spender) => {
          try {
            const approved = (await publicClient.readContract({
              address: collection.address as Address,
              abi: erc721IsApprovedForAllAbi,
              functionName: 'isApprovedForAll',
              args: [walletAddress as Address, spender.address as Address],
            })) as boolean
            if (approved) {
              approvals.push({
                id: `${chain}-${collection.address}-${spender.address}`,
                chain,
                tokenAddress: collection.address,
                tokenName: collection.name,
                spenderAddress: spender.address,
                spenderName: spender.name,
                approved: true,
                riskLevel: 'critical',
                riskReasons: [
                  'setApprovalForAll ativo — TODOS os NFTs da coleção podem ser movidos',
                  'Revogar imediatamente se não estiver em uso ativo',
                ],
              })
            }
          } catch {
            // skip
          }
        })
      )
    })
  )
  return approvals
}

/**
 * Build calldata to revoke a setApprovalForAll (set to false).
 */
export function buildRevokeNftApprovalCalldata(spenderAddress: string): Hex {
  // setApprovalForAll(address,bool) selector = 0xa22cb465
  const spender = spenderAddress.slice(2).toLowerCase().padStart(64, '0')
  // bool false = 0
  return `0xa22cb465${spender}${'0'.repeat(64)}` as Hex
}

// ============ Sessions (DApp connections) ============

export interface DappSession {
  id: string
  dappName: string
  dappUrl: string
  dappLogoColor: string
  connectedAt: number
  lastActiveAt: number
  permissions: DappPermission[]
  riskLevel: 'safe' | 'low' | 'medium' | 'high'
}

export interface DappPermission {
  type: 'sign-message' | 'spend-erc20' | 'spend-nft' | 'add-chain' | 'switch-chain' | 'sign-typed-data'
  description: string
  tokenSymbol?: string
  amount?: string
  grantedAt: number
}

// Mock sessions — in production these would be WalletConnect v2 sessions
export function getInitialSessions(): DappSession[] {
  const now = Date.now()
  return [
    {
      id: 'sess-1',
      dappName: 'Uniswap V3',
      dappUrl: 'app.uniswap.org',
      dappLogoColor: '#FF007A',
      connectedAt: now - 1000 * 60 * 60 * 24 * 2,
      lastActiveAt: now - 1000 * 60 * 15,
      permissions: [
        { type: 'sign-message', description: 'Assinar mensagens EIP-191', grantedAt: now - 1000 * 60 * 60 * 24 * 2 },
        { type: 'spend-erc20', description: 'Gastar USDC até ∞', tokenSymbol: 'USDC', amount: '∞', grantedAt: now - 1000 * 60 * 60 * 24 },
      ],
      riskLevel: 'medium',
    },
    {
      id: 'sess-2',
      dappName: 'OpenSea',
      dappUrl: 'opensea.io',
      dappLogoColor: '#2081E2',
      connectedAt: now - 1000 * 60 * 60 * 24 * 5,
      lastActiveAt: now - 1000 * 60 * 60 * 3,
      permissions: [
        { type: 'spend-nft', description: 'setApprovalForAll em BAYC', grantedAt: now - 1000 * 60 * 60 * 24 * 5 },
        { type: 'sign-typed-data', description: 'Assinar EIP-712 para listagens', grantedAt: now - 1000 * 60 * 60 * 24 * 5 },
      ],
      riskLevel: 'high',
    },
    {
      id: 'sess-3',
      dappName: 'Aave V3',
      dappUrl: 'app.aave.com',
      dappLogoColor: '#B6509E',
      connectedAt: now - 1000 * 60 * 60 * 24 * 7,
      lastActiveAt: now - 1000 * 60 * 60 * 24,
      permissions: [
        { type: 'spend-erc20', description: 'Gastar WETH até ∞', tokenSymbol: 'WETH', amount: '∞', grantedAt: now - 1000 * 60 * 60 * 24 * 7 },
      ],
      riskLevel: 'medium',
    },
  ]
}

// ============ Permission history (audit log) ============

export interface PermissionEvent {
  id: string
  timestamp: number
  type: 'granted' | 'revoked' | 'expired' | 'used'
  permissionType: 'erc20-approval' | 'nft-approval' | 'permit2' | 'session' | 'delegation'
  description: string
  chain?: string
  tokenSymbol?: string
  spenderName?: string
  amount?: string
}

export function getInitialPermissionHistory(): PermissionEvent[] {
  const now = Date.now()
  return [
    {
      id: 'pe-1',
      timestamp: now - 1000 * 60 * 60 * 24,
      type: 'granted',
      permissionType: 'erc20-approval',
      description: 'Aprovação concedida',
      chain: 'ethereum',
      tokenSymbol: 'USDC',
      spenderName: 'Uniswap V3 Router',
      amount: '∞',
    },
    {
      id: 'pe-2',
      timestamp: now - 1000 * 60 * 60 * 24 * 2,
      type: 'granted',
      permissionType: 'nft-approval',
      description: 'setApprovalForAll concedida',
      chain: 'ethereum',
      tokenSymbol: 'BAYC',
      spenderName: 'OpenSea',
    },
    {
      id: 'pe-3',
      timestamp: now - 1000 * 60 * 60 * 24 * 3,
      type: 'revoked',
      permissionType: 'erc20-approval',
      description: 'Aprovação revogada',
      chain: 'ethereum',
      tokenSymbol: 'USDT',
      spenderName: '1inch Router',
    },
    {
      id: 'pe-4',
      timestamp: now - 1000 * 60 * 60 * 24 * 5,
      type: 'granted',
      permissionType: 'session',
      description: 'Sessão DApp conectada',
      spenderName: 'OpenSea',
    },
    {
      id: 'pe-5',
      timestamp: now - 1000 * 60 * 60 * 24 * 7,
      type: 'granted',
      permissionType: 'erc20-approval',
      description: 'Aprovação concedida',
      chain: 'ethereum',
      tokenSymbol: 'WETH',
      spenderName: 'Aave V3',
      amount: '∞',
    },
  ]
}

// ============ Lockdown ============

export interface LockdownResult {
  success: boolean
  startedAt: number
  completedAt: number
  durationMs: number
  actions: Array<{
    type: 'revoke-erc20' | 'revoke-nft' | 'cancel-permit2' | 'end-session' | 'disconnect-wc' | 'block-signatures' | 'read-only-mode'
    description: string
    success: boolean
    affected: number
  }>
  totalRevoked: number
}

/**
 * Execute the Lockdown protocol — revoke all permissions, end all sessions,
 * disable new signatures, activate read-only mode.
 *
 * In production, each revoke would broadcast an actual transaction.
 * For demo purposes, we simulate the execution.
 */
export async function executeLockdown(
  approvals: Erc20Approval[],
  nftApprovals: NftApproval[],
  sessions: DappSession[]
): Promise<LockdownResult> {
  const startedAt = Date.now()
  const actions: LockdownResult['actions'] = []

  // Simulate revocation (in production: broadcast approve(spender, 0) for each)
  await new Promise((r) => setTimeout(r, 800))
  actions.push({
    type: 'revoke-erc20',
    description: `Revogar ${approvals.length} aprovações ERC-20`,
    success: true,
    affected: approvals.length,
  })

  await new Promise((r) => setTimeout(r, 600))
  actions.push({
    type: 'revoke-nft',
    description: `Revogar ${nftApprovals.length} aprovações NFT (setApprovalForAll)`,
    success: true,
    affected: nftApprovals.length,
  })

  await new Promise((r) => setTimeout(r, 400))
  actions.push({
    type: 'cancel-permit2',
    description: 'Cancelar todas as permissões Permit2',
    success: true,
    affected: 0,
  })

  await new Promise((r) => setTimeout(r, 400))
  actions.push({
    type: 'end-session',
    description: `Encerrar ${sessions.length} sessões de DApps`,
    success: true,
    affected: sessions.length,
  })

  await new Promise((r) => setTimeout(r, 300))
  actions.push({
    type: 'disconnect-wc',
    description: 'Desconectar WalletConnect v2',
    success: true,
    affected: 0,
  })

  await new Promise((r) => setTimeout(r, 200))
  actions.push({
    type: 'block-signatures',
    description: 'Bloquear novas assinaturas',
    success: true,
    affected: 0,
  })

  await new Promise((r) => setTimeout(r, 200))
  actions.push({
    type: 'read-only-mode',
    description: 'Ativar modo somente leitura',
    success: true,
    affected: 0,
  })

  const completedAt = Date.now()
  return {
    success: true,
    startedAt,
    completedAt,
    durationMs: completedAt - startedAt,
    actions,
    totalRevoked: approvals.length + nftApprovals.length + sessions.length,
  }
}

// ============ Helpers ============

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s atrás`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}
