'use client'

// ============ ChainPlugin — Frozen Interface v1.0 (Architecture Freeze 1.0) ============
//
// O Security Kernel nunca precisa conhecer Ethereum, Bitcoin ou Solana.
// Todas as chains implementam exatamente o mesmo contrato.
// apiVersion permite ao Kernel rejeitar plugins incompatíveis.

export interface CapabilityManifest {
  readonly id: string
  readonly version: string
  readonly apiVersion: '1.0'
  readonly maturity: 'production' | 'beta' | 'alpha' | 'deprecated'
  readonly capabilities: string[]
  readonly requires: string[] // Engine IDs required
  readonly failSafe: 'deny' | 'retry-deny' | 'degrade'
}

export interface ChainPlugin {
  readonly id: string
  readonly version: string
  readonly apiVersion: '1.0'
  readonly name: string
  readonly family: 'evm' | 'utxo' | 'solana' | 'lightning' | 'other'
  readonly capabilities: string[]

  // Manifest — Kernel loads plugins only through manifest
  manifest(): CapabilityManifest

  // Lifecycle
  connect(): Promise<void>
  disconnect(): Promise<void>

  // Transaction pipeline
  buildTransaction(params: BuildTxParams): Promise<BuiltTransaction>
  simulateTransaction(tx: BuiltTransaction): Promise<SimulationResult>
  signTransaction(tx: BuiltTransaction, privateKey: Uint8Array): Promise<SignedTransaction>
  broadcastTransaction(signedTx: SignedTransaction): Promise<BroadcastResult>
  monitorTransaction(txHash: string): Promise<TransactionStatus>

  // Fees
  estimateFees(params?: FeeEstimateParams): Promise<FeeEstimate>

  // State
  getBalance(address: string): Promise<BalanceResult>
  getAssets(address: string): Promise<AssetResult[]>

  // Human explanation
  explain(tx: BuiltTransaction | SignedTransaction): HumanTxExplanation

  // Health
  health(): PluginHealth
}

// ============ Shared types ============

export interface BuildTxParams {
  from: string
  to: string
  value?: string
  data?: string
  gasLimit?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  nonce?: number
  /** For UTXO chains: selected UTXOs */
  utxos?: UTXO[]
  /** For Solana: instructions */
  instructions?: unknown[]
}

export interface BuiltTransaction {
  chain: string
  from: string
  to: string
  value?: string
  data?: string
  gasLimit: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  nonce: number
  /** For UTXO: selected inputs/outputs */
  inputs?: UTXO[]
  outputs?: TxOutput[]
  /** For Solana: compiled instructions */
  compiledInstructions?: unknown[]
  /** Estimated cost in USD */
  estimatedCostUsd?: number
}

export interface UTXO {
  txid: string
  vout: number
  value: number // in satoshis
  scriptPubKey: string
  confirmations: number
}

export interface TxOutput {
  address: string
  value: number // in satoshis
}

export interface SignedTransaction {
  chain: string
  signedTxHex: string
  txHash: string
  /** Raw bytes for broadcast */
  rawBytes?: Uint8Array
}

export interface BroadcastResult {
  success: boolean
  txHash?: string
  error?: string
  /** Mempool entry time */
  broadcastAt: number
}

export interface TransactionStatus {
  hash: string
  status: 'pending' | 'confirmed' | 'failed' | 'reorg'
  blockNumber?: number
  confirmations: number
  gasUsed?: string
  effectiveGasPrice?: string
  /** True if transaction was replaced (speed up/cancel) */
  replaced?: boolean
  replacementHash?: string
}

export interface SimulationResult {
  success: boolean
  gasUsed?: string
  error?: string
  stateDiff?: Record<string, string>
  assetDiff?: Array<{ token: string; change: string; direction: 'in' | 'out' }>
  events?: string[]
  humanExplanation: string
}

export interface FeeEstimate {
  slow: string
  standard: string
  fast: string
  instant: string
  /** In USD */
  estimatedCostUsd: { slow: number; standard: number; fast: number; instant: number }
  unit: string // 'gwei' | 'sat/vB' | 'microLamport'
}

export interface FeeEstimateParams {
  urgency?: 'slow' | 'standard' | 'fast' | 'instant'
  txSize?: number // for UTXO chains
}

export interface BalanceResult {
  address: string
  confirmed: string
  unconfirmed?: string
  unit: string
}

export interface AssetResult {
  contractAddress?: string
  symbol: string
  name: string
  decimals: number
  balance: string
  standard: string
  logoColor?: string
}

export interface HumanTxExplanation {
  summary: string
  details: string[]
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
}

export interface PluginHealth {
  status: 'connected' | 'degraded' | 'disconnected'
  latencyMs: number
  blockNumber?: number
  rpcUrl?: string
  lastCheckedAt: number
}
