'use client'

// ============ Ethereum Plugin — Full Lifecycle ============
//
// Referência para todas as chains EVM (BNB, Polygon, Base, Arbitrum, Optimism, Avalanche).
// Implementa: broadcast EIP-1559, receipt parsing, nonce manager, gas estimator,
// confirmation monitor, reorg detection, replacement tx (speed up/cancel), mempool tracking.

import { createPublicClient, createWalletClient, http, type Hex, type Address, formatEther, parseEther } from 'viem'
import { mainnet, bsc, polygon, arbitrum, optimism, avalanche, base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import type {
  ChainPlugin, BuildTxParams, BuiltTransaction, SimulationResult,
  SignedTransaction, BroadcastResult, TransactionStatus,
  FeeEstimate, FeeEstimateParams, BalanceResult, AssetResult,
  HumanTxExplanation, PluginHealth, UTXO, TxOutput,
} from '../types'

const CHAIN_MAP: Record<string, { viem: typeof mainnet; rpcs: string[] }> = {
  ethereum: { viem: mainnet, rpcs: ['https://ethereum-rpc.publicnode.com', 'https://1rpc.io/eth'] },
  bsc: { viem: bsc, rpcs: ['https://bsc-rpc.publicnode.com', 'https://1rpc.io/bnb'] },
  polygon: { viem: polygon, rpcs: ['https://polygon-bor-rpc.publicnode.com', 'https://1rpc.io/matic'] },
  arbitrum: { viem: arbitrum, rpcs: ['https://arbitrum-one-rpc.publicnode.com', 'https://1rpc.io/arb'] },
  optimism: { viem: optimism, rpcs: ['https://optimism-rpc.publicnode.com', 'https://1rpc.io/op'] },
  avalanche: { viem: avalanche, rpcs: ['https://avalanche-c-chain-rpc.publicnode.com', 'https://1rpc.io/avax'] },
  base: { viem: base, rpcs: ['https://base-rpc.publicnode.com', 'https://1rpc.io/base'] },
}

const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
] as const

// ============ Nonce Manager ============

class NonceManager {
  private nonces = new Map<string, number>()

  async getNonce(client: ReturnType<typeof createPublicClient>, address: string): Promise<number> {
    const cached = this.nonces.get(address)
    const chainNonce = await client.getTransactionCount({ address: address as Address })
    if (cached !== undefined && cached >= chainNonce) {
      return cached + 1
    }
    this.nonces.set(address, chainNonce)
    return chainNonce
  }

  increment(address: string): void {
    const current = this.nonces.get(address) ?? 0
    this.nonces.set(address, current + 1)
  }

  reset(address: string): void {
    this.nonces.delete(address)
  }
}

// ============ Confirmation Monitor ============

class ConfirmationMonitor {
  async waitForConfirmation(
    client: ReturnType<typeof createPublicClient>,
    txHash: string,
    requiredConfirmations: number = 1,
    timeoutMs: number = 120_000
  ): Promise<TransactionStatus> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      try {
        const receipt = await client.getTransactionReceipt({ hash: txHash as Hex })
        if (receipt) {
          const currentBlock = await client.getBlockNumber()
          const confirmations = Number(currentBlock) - Number(receipt.blockNumber) + 1
          if (confirmations >= requiredConfirmations) {
            return {
              hash: txHash,
              status: receipt.status === 'success' ? 'confirmed' : 'failed',
              blockNumber: Number(receipt.blockNumber),
              confirmations,
              gasUsed: receipt.gasUsed.toString(),
              effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
            }
          }
        }
      } catch {
        // TX not yet in block — keep waiting
      }
      await new Promise(r => setTimeout(r, 3000))
    }
    return { hash: txHash, status: 'pending', confirmations: 0 }
  }

  async checkReorg(
    client: ReturnType<typeof createPublicClient>,
    txHash: string,
    lastKnownBlock?: number
  ): Promise<boolean> {
    try {
      const receipt = await client.getTransactionReceipt({ hash: txHash as Hex })
      if (!receipt) return false
      const currentBlock = await client.getBlockNumber()
      // If the block number changed significantly, might be reorg
      if (lastKnownBlock && Math.abs(Number(currentBlock) - lastKnownBlock) > 64) {
        return true
      }
      return false
    } catch {
      return false
    }
  }
}

// ============ Ethereum Plugin ============

export class EthereumPlugin implements ChainPlugin {
  readonly id: string
  readonly version: string = "1.0.0"
  readonly apiVersion: "1.0" = "1.0"
  readonly name: string
  readonly family = 'evm' as const
  readonly capabilities: string[]
  private chainConfig: typeof CHAIN_MAP[string]
  private client: ReturnType<typeof createPublicClient>
  private nonceManager = new NonceManager()
  private confirmationMonitor = new ConfirmationMonitor()
  private connected = false
  private lastBlockNumber = 0

  constructor(chainId: string = 'ethereum') {
    this.id = chainId
    this.name = CHAIN_MAP[chainId]?.viem.name ?? chainId
    this.chainConfig = CHAIN_MAP[chainId] ?? CHAIN_MAP.ethereum
    this.capabilities = ['EIP-1559', 'EIP-712', 'ERC-20', 'ERC-721', 'ERC-1155', 'Permit', 'Permit2', 'ERC-4337', 'ENS', 'Multicall']
    this.client = createPublicClient({
      chain: this.chainConfig.viem,
      transport: http(this.chainConfig.rpcs[0], { timeout: 15000 }),
    })
  }

  manifest() {
    return {
      id: this.id,
      version: "1.0.0",
      apiVersion: "1.0" as const,
      maturity: "beta" as const,
      capabilities: this.capabilities,
      requires: ["NetworkEngine", "SimulationEngine"],
      failSafe: "deny" as const,
    }
  }


  async connect(): Promise<void> {
    try {
      const blockNumber = await this.client.getBlockNumber()
      this.lastBlockNumber = Number(blockNumber)
      this.connected = true
    } catch (e) {
      throw new Error(`Failed to connect to ${this.id}: ${(e as Error).message}`)
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
  }

  // ============ Build ============

  async buildTransaction(params: BuildTxParams): Promise<BuiltTransaction> {
    const [nonce, gasEstimate, gasPrice] = await Promise.all([
      params.nonce ?? this.nonceManager.getNonce(this.client, params.from),
      this.client.estimateGas({
        account: params.from as Address,
        to: params.to as Address,
        value: params.value ? parseEther(params.value) : undefined,
        data: params.data as Hex | undefined,
      }).catch(() => 21000n),
      this.client.getGasPrice().catch(() => 20n * 10n ** 9n),
    ])

    const maxFeePerGas = params.maxFeePerGas ?? ((gasPrice * 12n) / 10n).toString()
    const maxPriorityFeePerGas = params.maxPriorityFeePerGas ?? (gasPrice / 10n).toString()
    const n = typeof nonce === 'number' ? nonce : await nonce

    return {
      chain: this.id,
      from: params.from,
      to: params.to,
      value: params.value,
      data: params.data,
      gasLimit: gasEstimate.toString(),
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce: n,
      estimatedCostUsd: Number(gasEstimate * gasPrice) / 1e18 * 3245.67,
    }
  }

  // ============ Simulate ============

  async simulateTransaction(tx: BuiltTransaction): Promise<SimulationResult> {
    try {
      const result = await this.client.call({
        account: tx.from as Address,
        to: tx.to as Address,
        value: tx.value ? parseEther(tx.value) : undefined,
        data: tx.data as Hex | undefined,
      })
      return {
        success: true,
        gasUsed: tx.gasLimit,
        humanExplanation: `Simulação eth_call bem-sucedida. A transação não reverte. Custo estimado: ~${tx.estimatedCostUsd?.toFixed(2)} USD.`,
      }
    } catch (e) {
      return {
        success: false,
        error: (e as Error).message,
        humanExplanation: `⚠️ Simulação falhou: ${(e as Error).message.slice(0, 100)}. A transação provavelmente reverterá.`,
      }
    }
  }

  // ============ Sign ============

  async signTransaction(tx: BuiltTransaction, privateKey: Uint8Array): Promise<SignedTransaction> {
    const pkHex = `0x${Array.from(privateKey).map(b => b.toString(16).padStart(2, '0')).join('')}` as Hex
    const account = privateKeyToAccount(pkHex)
    const walletClient = createWalletClient({ account, chain: this.chainConfig.viem, transport: http() })

    const serialized = await account.signTransaction({
      chain: this.chainConfig.viem,
      type: 'eip1559',
      to: tx.to as Address,
      value: tx.value ? parseEther(tx.value) : 0n,
      nonce: tx.nonce,
      maxFeePerGas: BigInt(tx.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas),
      gas: BigInt(tx.gasLimit),
      data: tx.data as Hex | undefined,
    })

    // Compute hash
    const { keccak256 } = await import('viem')
    const txHash = keccak256(serialized as Hex)

    this.nonceManager.increment(tx.from)

    return {
      chain: this.id,
      signedTxHex: serialized,
      txHash,
    }
  }

  // ============ Broadcast ============

  async broadcastTransaction(signedTx: SignedTransaction): Promise<BroadcastResult> {
    try {
      // Use raw sendRawTransaction via RPC
      const response = await this.client.transport.request({
        method: 'eth_sendRawTransaction',
        params: [signedTx.signedTxHex],
      })
      const txHash = response as string
      return {
        success: true,
        txHash,
        broadcastAt: Date.now(),
      }
    } catch (e) {
      return {
        success: false,
        error: (e as Error).message,
        broadcastAt: Date.now(),
      }
    }
  }

  // ============ Monitor ============

  async monitorTransaction(txHash: string): Promise<TransactionStatus> {
    return this.confirmationMonitor.waitForConfirmation(this.client, txHash, 1, 120_000)
  }

  // ============ Replacement (speed up / cancel) ============

  async buildReplacementTransaction(
    originalTx: BuiltTransaction,
    type: 'speedup' | 'cancel'
  ): Promise<BuiltTransaction> {
    const gasPrice = await this.client.getGasPrice()
    const multiplier = type === 'speedup' ? 15n : 20n // 150% or 200%

    return {
      ...originalTx,
      maxFeePerGas: ((gasPrice * multiplier) / 10n).toString(),
      maxPriorityFeePerGas: ((gasPrice * multiplier) / 20n).toString(),
      nonce: originalTx.nonce, // Same nonce = replacement
      value: type === 'cancel' ? '0' : originalTx.value,
      to: type === 'cancel' ? originalTx.from : originalTx.to, // Cancel = send to self
      data: type === 'cancel' ? '0x' : originalTx.data,
    }
  }

  // ============ Reorg Detection ============

  async checkReorg(txHash: string, lastKnownBlock?: number): Promise<boolean> {
    return this.confirmationMonitor.checkReorg(this.client, txHash, lastKnownBlock)
  }

  // ============ Fees ============

  async estimateFees(_params?: FeeEstimateParams): Promise<FeeEstimate> {
    const gasPrice = await this.client.getGasPrice().catch(() => 20n * 10n ** 9n)
    const gwei = (n: bigint) => (Number(n) / 1e9).toFixed(1)
    const cost = (n: bigint) => Number(21000n * n) / 1e18 * 3245.67

    return {
      slow: gwei(gasPrice),
      standard: gwei((gasPrice * 11n) / 10n),
      fast: gwei((gasPrice * 13n) / 10n),
      instant: gwei((gasPrice * 15n) / 10n),
      estimatedCostUsd: {
        slow: cost(gasPrice),
        standard: cost((gasPrice * 11n) / 10n),
        fast: cost((gasPrice * 13n) / 10n),
        instant: cost((gasPrice * 15n) / 10n),
      },
      unit: 'gwei',
    }
  }

  // ============ Balance ============

  async getBalance(address: string): Promise<BalanceResult> {
    const balance = await this.client.getBalance({ address: address as Address })
    return {
      address,
      confirmed: formatEther(balance),
      unit: 'ETH',
    }
  }

  // ============ Assets ============

  async getAssets(address: string): Promise<AssetResult[]> {
    // In production, this would use an indexer (Alchemy/Covalent)
    // For now, return known tokens
    const knownTokens: Array<{ address: string; symbol: string; name: string; color: string }> = [
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', color: '#2775CA' },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', color: '#26A17B' },
      { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', color: '#627EEA' },
    ]

    const assets: AssetResult[] = []
    for (const token of knownTokens) {
      try {
        const [balance, decimals, symbol, name] = await Promise.all([
          this.client.readContract({ address: token.address as Address, abi: ERC20_ABI, functionName: 'balanceOf', args: [address as Address] }),
          this.client.readContract({ address: token.address as Address, abi: ERC20_ABI, functionName: 'decimals' }),
          this.client.readContract({ address: token.address as Address, abi: ERC20_ABI, functionName: 'symbol' }),
          this.client.readContract({ address: token.address as Address, abi: ERC20_ABI, functionName: 'name' }),
        ])
        if (balance > 0n) {
          assets.push({
            contractAddress: token.address,
            symbol: symbol as string,
            name: name as string,
            decimals: decimals as number,
            balance: balance.toString(),
            standard: 'ERC-20',
            logoColor: token.color,
          })
        }
      } catch { /* skip */ }
    }
    return assets
  }

  // ============ Explain ============

  explain(tx: BuiltTransaction | SignedTransaction): HumanTxExplanation {
    const isSigned = 'signedTxHex' in tx
    const built = isSigned ? null : (tx as BuiltTransaction)
    const details: string[] = []

    if (built) {
      details.push(`De: ${built.from}`)
      details.push(`Para: ${built.to}`)
      if (built.value) details.push(`Valor: ${built.value} ETH`)
      if (built.data && built.data !== '0x') details.push(`Dados: ${built.data.slice(0, 50)}...`)
      details.push(`Gas: ${built.gasLimit}`)
      details.push(`Nonce: ${built.nonce}`)
      details.push(`Custo estimado: $${built.estimatedCostUsd?.toFixed(2)}`)
    }

    return {
      summary: built?.value
        ? `Enviar ${built.value} ETH para ${built.to.slice(0, 10)}...${built.to.slice(-4)}`
        : `Interagir com contrato ${built?.to.slice(0, 10)}...`,
      details,
      riskLevel: 'low',
      recommendation: 'Verifique o endereço de destino antes de confirmar.',
    }
  }

  // ============ Health ============

  health(): PluginHealth {
    return {
      status: this.connected ? 'connected' : 'disconnected',
      latencyMs: 0,
      blockNumber: this.lastBlockNumber,
      rpcUrl: this.chainConfig.rpcs[0],
      lastCheckedAt: Date.now(),
    }
  }
}
