// ============ wallet-evm: real RPC provider + EIP-1559 signing ============

import { createWalletClient, http, type Hex, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  mainnet, bsc, polygon, arbitrum, optimism, avalanche, base,
  type Chain as ViemChain,
} from 'viem/chains'
import { createPublicClient, formatEther, parseEther, type TransactionReceipt } from 'viem'

// ============ Chain registry ============

export const EVM_CHAINS: Record<string, ViemChain & { rpcLabel: string }> = {
  ethereum: { ...mainnet, rpcLabel: 'eth.llamarpc.com (public)' },
  bsc: { ...bsc, rpcLabel: 'bsc-dataseed.binance.org (public)' },
  polygon: { ...polygon, rpcLabel: 'polygon-rpc.com (public)' },
  arbitrum: { ...arbitrum, rpcLabel: 'arb1.arbitrum.io (public)' },
  optimism: { ...optimism, rpcLabel: 'mainnet.optimism.io (public)' },
  avalanche: { ...avalanche, rpcLabel: 'api.avax.network (public)' },
  base: { ...base, rpcLabel: 'mainnet.base.org (public)' },
}

export const EVM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  avalanche: 43114,
  base: 8453,
}

// Public RPC endpoints (with failover) — all CORS-enabled for browser use
// publicnode.com is the most reliable for browser-side CORS, listed first
export const RPC_ENDPOINTS: Record<string, string[]> = {
  ethereum: [
    'https://ethereum-rpc.publicnode.com',
    'https://1rpc.io/eth',
    'https://eth.llamarpc.com',
  ],
  bsc: [
    'https://bsc-rpc.publicnode.com',
    'https://1rpc.io/bnb',
    'https://bsc-dataseed.binance.org',
  ],
  polygon: [
    'https://polygon-bor-rpc.publicnode.com',
    'https://1rpc.io/matic',
    'https://polygon-rpc.com',
  ],
  arbitrum: [
    'https://arbitrum-one-rpc.publicnode.com',
    'https://1rpc.io/arb',
    'https://arb1.arbitrum.io/rpc',
  ],
  optimism: [
    'https://optimism-rpc.publicnode.com',
    'https://1rpc.io/op',
    'https://mainnet.optimism.io',
  ],
  avalanche: [
    'https://avalanche-c-chain-rpc.publicnode.com',
    'https://1rpc.io/avax',
    'https://api.avax.network/ext/bc/C/rpc',
  ],
  base: [
    'https://base-rpc.publicnode.com',
    'https://1rpc.io/base',
    'https://mainnet.base.org',
  ],
}

// ============ Provider with failover ============

export class EvmProvider {
  private chainId: string
  private currentEndpoint = 0
  private publicClient

  constructor(chainId: string) {
    this.chainId = chainId
    this.publicClient = createPublicClient({
      chain: EVM_CHAINS[chainId],
      transport: http(RPC_ENDPOINTS[chainId][0], { timeout: 15000 }),
    })
  }

  private switchEndpoint() {
    this.currentEndpoint = (this.currentEndpoint + 1) % RPC_ENDPOINTS[this.chainId].length
    this.publicClient = createPublicClient({
      chain: EVM_CHAINS[this.chainId],
      transport: http(RPC_ENDPOINTS[this.chainId][this.currentEndpoint], { timeout: 15000 }),
    })
  }

  async getBalance(address: string): Promise<bigint> {
    for (let attempt = 0; attempt < RPC_ENDPOINTS[this.chainId].length; attempt++) {
      try {
        return await this.publicClient.getBalance({ address: address as Address })
      } catch {
        this.switchEndpoint()
      }
    }
    throw new Error(`Failed to fetch balance on ${this.chainId}`)
  }

  async getNonce(address: string): Promise<number> {
    for (let attempt = 0; attempt < RPC_ENDPOINTS[this.chainId].length; attempt++) {
      try {
        return await this.publicClient.getTransactionCount({ address: address as Address })
      } catch {
        this.switchEndpoint()
      }
    }
    throw new Error(`Failed to fetch nonce on ${this.chainId}`)
  }

  async getChainId(): Promise<number> {
    return await this.publicClient.getChainId()
  }

  async getGasPrice(): Promise<bigint> {
    return await this.publicClient.getGasPrice()
  }

  async estimateGas(tx: {
    from: string
    to: string
    value?: string
    data?: string
  }): Promise<bigint> {
    return await this.publicClient.estimateGas({
      account: tx.from as Address,
      to: tx.to as Address,
      value: tx.value ? parseEther(tx.value) : undefined,
      data: tx.data as Hex | undefined,
    })
  }

  /**
   * Simulate a transaction via eth_call — returns the result without broadcasting.
   * Used by the Safe Session to preview the effect of a transaction.
   */
  async simulateCall(tx: {
    from: string
    to: string
    value?: string
    data?: string
  }): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      const result = await this.publicClient.call({
        account: tx.from as Address,
        to: tx.to as Address,
        value: tx.value ? parseEther(tx.value) : undefined,
        data: tx.data as Hex | undefined,
      })
      return { success: true, result: result as string }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  /**
   * Read ERC-20 token info: name, symbol, decimals, balance
   */
  async readErc20(tokenAddress: string, holderAddress: string): Promise<{
    name: string
    symbol: string
    decimals: number
    balance: bigint
  }> {
    const publicClient = this.publicClient
    const name = (await publicClient.readContract({
      address: tokenAddress as Address,
      abi: [
        { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
      ] as const,
      functionName: 'name',
    })) as string
    const symbol = (await publicClient.readContract({
      address: tokenAddress as Address,
      abi: [
        { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
      ] as const,
      functionName: 'symbol',
    })) as string
    const decimals = (await publicClient.readContract({
      address: tokenAddress as Address,
      abi: [
        { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
      ] as const,
      functionName: 'decimals',
    })) as number
    const balance = (await publicClient.readContract({
      address: tokenAddress as Address,
      abi: [
        { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
      ] as const,
      functionName: 'balanceOf',
      args: [holderAddress as Address],
    })) as bigint
    return { name, symbol, decimals, balance }
  }

  async waitForTx(hash: string): Promise<TransactionReceipt | null> {
    try {
      return await this.publicClient.waitForTransactionReceipt({ hash: hash as Hex, timeout: 60_000 })
    } catch {
      return null
    }
  }
}

// ============ Signer: real EIP-1559 + EIP-712 ============

export class EvmSigner {
  private privateKey: Uint8Array
  private chain: ViemChain
  public address: string

  constructor(privateKey: Uint8Array, chainId: string) {
    this.privateKey = privateKey
    this.chain = EVM_CHAINS[chainId]
    const pkHex = `0x${Array.from(privateKey).map((b) => b.toString(16).padStart(2, '0')).join('')}` as Hex
    const account = privateKeyToAccount(pkHex)
    this.address = account.address
  }

  /**
   * Sign an EIP-1559 transaction offline.
   * Returns the signed raw transaction hex (ready to broadcast via eth_sendRawTransaction).
   */
  async sign1559Tx(params: {
    to: string
    value: string // in ether
    nonce: number
    maxFeePerGas: string // in wei (hex or decimal string)
    maxPriorityFeePerGas: string
    gasLimit: bigint
    data?: string
  }): Promise<{ signedTx: string; txHash: string }> {
    const pkHex = `0x${Array.from(this.privateKey).map((b) => b.toString(16).padStart(2, '0')).join('')}` as Hex
    const account = privateKeyToAccount(pkHex)
    const serialized = await account.signTransaction({
      chain: this.chain,
      type: 'eip1559',
      to: params.to as Address,
      value: parseEther(params.value),
      nonce: params.nonce,
      maxFeePerGas: BigInt(params.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(params.maxPriorityFeePerGas),
      gas: params.gasLimit,
      data: params.data as Hex | undefined,
      // Explicit chainId to avoid RPC lookup
      chainId: this.chain.id,
    })
    // Compute hash via viem's keccak256
    const { keccak256 } = await import('viem')
    const txHash = keccak256(serialized as Hex)
    return { signedTx: serialized, txHash }
  }

  /**
   * Sign an EIP-712 typed data payload.
   * Returns the 65-byte signature hex (r, s, v).
   */
  async signTypedData(typedData: {
    domain: {
      name: string
      version: string
      chainId: number
      verifyingContract: string
    }
    types: Record<string, Array<{ name: string; type: string }>>
    primaryType: string
    message: Record<string, unknown>
  }): Promise<string> {
    const pkHex = `0x${Array.from(this.privateKey).map((b) => b.toString(16).padStart(2, '0')).join('')}` as Hex
    const account = privateKeyToAccount(pkHex)
    return await account.signTypedData(typedData)
  }

  /**
   * Sign a personal message (EIP-191).
   */
  async signMessage(message: string): Promise<string> {
    const pkHex = `0x${Array.from(this.privateKey).map((b) => b.toString(16).padStart(2, '0')).join('')}` as Hex
    const account = privateKeyToAccount(pkHex)
    return await account.signMessage({ message })
  }
}

// ============ Helpers ============

export function formatEtherSafe(wei: bigint): string {
  return formatEther(wei)
}

export function parseEtherSafe(ether: string): bigint {
  return parseEther(ether)
}
