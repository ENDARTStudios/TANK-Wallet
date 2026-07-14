// ============ FortiX Wallet Types ============

export type ChainId =
  | 'ethereum'
  | 'bsc'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'avalanche'
  | 'base'
  | 'solana'
  | 'bitcoin'
  | 'lightning'

export interface Chain {
  id: ChainId
  name: string
  symbol: string
  shortLabel: string
  color: string
  isEvm: boolean
  rpcLabel: string
  glyph: string
}

export type TokenStandard =
  | 'native'
  | 'ERC-20'
  | 'ERC-721'
  | 'ERC-1155'
  | 'SPL'
  | 'BRC-20'
  | 'Ordinals'

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'blocked'

export interface RiskAssessment {
  level: RiskLevel
  score: number // 0-100, higher = safer
  reasons: string[]
  blocked: boolean
}

export interface Token {
  id: string
  symbol: string
  name: string
  chain: ChainId
  standard: TokenStandard
  balance: number
  decimals: number
  priceUsd: number
  change24h: number
  contract?: string
  logoColor: string
  inVault: boolean
  risk: RiskAssessment
  verified: boolean
}

export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'swap' | 'vault-move' | 'stake'
  tokenSymbol: string
  amount: number
  usdValue: number
  chain: ChainId
  counterparty: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed' | 'blocked'
  risk: RiskAssessment
  note?: string
}

export interface BlockedToken {
  id: string
  symbol: string
  name: string
  chain: ChainId
  contract: string
  reason: string
  blockedAt: number
  source: 'auto' | 'community' | 'manual'
}

export interface BlockedSite {
  id: string
  url: string
  reason: string
  blockedAt: number
  category: 'phishing' | 'malware' | 'fake-dapp' | 'drainer' | 'suspicious'
}

export interface SecurityEvent {
  id: string
  type: 'blocked-token' | 'blocked-site' | 'suspicious-tx' | 'high-risk-warning' | 'vault-access'
  title: string
  description: string
  timestamp: number
  severity: 'info' | 'warning' | 'critical'
  related?: string
}

export interface DAppInfo {
  id: string
  name: string
  url: string
  category: string
  rating: 'verified' | 'unknown' | 'suspicious' | 'malicious'
  description: string
}

export interface WalletState {
  address: string
  tokens: Token[]
  vaultTokens: Token[]
  transactions: Transaction[]
  blockedTokens: BlockedToken[]
  blockedSites: BlockedSite[]
  securityEvents: SecurityEvent[]
  vaultUnlocked: boolean
  safeSessionActive: boolean
  globalRiskScore: number
}
