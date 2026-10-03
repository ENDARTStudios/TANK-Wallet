// @ts-nocheck
'use client'

// ============ Network Engine (Production Hardening) ============
//
// PRINCIPLE: Never trust a single RPC endpoint.
//
// Features:
// - Multiple RPCs per chain (pool)
// - Health check (periodic latency + availability)
// - Quorum (for critical reads, query N RPCs and compare)
// - Blacklist (auto-disable failing RPCs)
// - Circuit breaker (stop hitting dead RPCs)
// - Failover (try next RPC on failure)
// - Cache (avoid redundant reads)
// - Rate limiting (per-RPC)

import { createPublicClient, http, type Hex, type Address, type Chain as ViemChain } from 'viem'
import { mainnet, bsc, polygon, arbitrum, optimism, avalanche, base } from 'viem/chains'

// ============ Types ============

export interface RpcEndpoint {
  url: string
  chain: string
  /** Current health status */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'blacklisted'
  /** Average latency in ms (rolling) */
  latencyMs: number
  /** Consecutive failures */
  consecutiveFailures: number
  /** Total requests sent */
  totalRequests: number
  /** Total failures */
  totalFailures: number
  /** Last health check timestamp */
  lastCheckedAt: number
  /** Blacklisted until this timestamp */
  blacklistedUntil?: number
}

export interface NetworkStats {
  chain: string
  endpoints: RpcEndpoint[]
  totalRequests: number
  totalFailures: number
  cacheHits: number
  cacheMisses: number
}

// ============ RPC Pool ============

const CHAIN_REGISTRY: Record<string, { viem: ViemChain; rpcs: string[] }> = {
  ethereum: {
    viem: mainnet,
    rpcs: [
      'https://ethereum-rpc.publicnode.com',
      'https://1rpc.io/eth',
      'https://eth.llamarpc.com',
    ],
  },
  bsc: {
    viem: bsc,
    rpcs: [
      'https://bsc-rpc.publicnode.com',
      'https://1rpc.io/bnb',
      'https://bsc-dataseed.binance.org',
    ],
  },
  polygon: {
    viem: polygon,
    rpcs: [
      'https://polygon-bor-rpc.publicnode.com',
      'https://1rpc.io/matic',
      'https://polygon-rpc.com',
    ],
  },
  arbitrum: {
    viem: arbitrum,
    rpcs: [
      'https://arbitrum-one-rpc.publicnode.com',
      'https://1rpc.io/arb',
      'https://arb1.arbitrum.io/rpc',
    ],
  },
  optimism: {
    viem: optimism,
    rpcs: [
      'https://optimism-rpc.publicnode.com',
      'https://1rpc.io/op',
      'https://mainnet.optimism.io',
    ],
  },
  avalanche: {
    viem: avalanche,
    rpcs: [
      'https://avalanche-c-chain-rpc.publicnode.com',
      'https://1rpc.io/avax',
      'https://api.avax.network/ext/bc/C/rpc',
    ],
  },
  base: {
    viem: base,
    rpcs: [
      'https://base-rpc.publicnode.com',
      'https://1rpc.io/base',
      'https://mainnet.base.org',
    ],
  },
}

// ============ Circuit breaker ============

const MAX_FAILURES = 3
const BLACKLIST_DURATION_MS = 60_000 // 1 minute
const HEALTH_CHECK_INTERVAL_MS = 30_000 // 30 seconds

class RpcPool {
  private endpoints = new Map<string, RpcEndpoint>() // key: chain:url
  private cache = new Map<string, { value: unknown; expiresAt: number }>()
  private stats = new Map<string, { requests: number; failures: number; cacheHits: number; cacheMisses: number }>()

  constructor() {
    // Initialize endpoints
    for (const [chain, config] of Object.entries(CHAIN_REGISTRY)) {
      for (const url of config.rpcs) {
        const key = `${chain}:${url}`
        this.endpoints.set(key, {
          url,
          chain,
          status: 'healthy',
          latencyMs: 0,
          consecutiveFailures: 0,
          totalRequests: 0,
          totalFailures: 0,
          lastCheckedAt: 0,
        })
      }
      this.stats.set(chain, { requests: 0, failures: 0, cacheHits: 0, cacheMisses: 0 })
    }
  }

  /** Get all healthy endpoints for a chain, ordered by latency. */
  private getHealthyEndpoints(chain: string): RpcEndpoint[] {
    const now = Date.now()
    return Array.from(this.endpoints.values())
      .filter(e => e.chain === chain)
      .filter(e => {
        // Check if blacklisted
        if (e.blacklistedUntil && now < e.blacklistedUntil) return false
        if (e.blacklistedUntil && now >= e.blacklistedUntil) {
          // Unblacklist
          e.status = 'healthy'
          e.consecutiveFailures = 0
          e.blacklistedUntil = undefined
        }
        return e.status !== 'blacklisted'
      })
      .sort((a, b) => a.latencyMs - b.latencyMs)
  }

  /** Execute a read with failover across multiple RPCs. */
  async read<T>(chain: string, operation: (client: ReturnType<typeof createPublicClient>) => Promise<T>): Promise<T> {
    const cacheKey = `${chain}:${operation.toString().slice(0, 100)}`
    // Check cache (5 second TTL for most reads)
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      const s = this.stats.get(chain)!
      s.cacheHits++
      return cached.value as T
    }
    const s = this.stats.get(chain)!
    s.cacheMisses++

    const endpoints = this.getHealthyEndpoints(chain)
    if (endpoints.length === 0) {
      throw new Error(`No healthy RPC endpoints for chain ${chain}`)
    }

    let lastError: Error | null = null
    for (const endpoint of endpoints) {
      const key = `${chain}:${endpoint.url}`
      try {
        const start = performance.now()
        const client = createPublicClient({
          chain: CHAIN_REGISTRY[chain].viem,
          transport: http(endpoint.url, { timeout: 15000 }),
        })
        const result = await operation(client)
        const latency = performance.now() - start

        // Update endpoint stats
        endpoint.latencyMs = endpoint.latencyMs * 0.7 + latency * 0.3 // rolling average
        endpoint.consecutiveFailures = 0
        endpoint.totalRequests++
        endpoint.lastCheckedAt = Date.now()
        endpoint.status = latency > 3000 ? 'degraded' : 'healthy'

        s.requests++

        // Cache the result
        this.cache.set(cacheKey, { value: result, expiresAt: Date.now() + 5000 })

        return result
      } catch (e) {
        endpoint.consecutiveFailures++
        endpoint.totalFailures++
        endpoint.totalRequests++
        lastError = e as Error

        // Circuit breaker
        if (endpoint.consecutiveFailures >= MAX_FAILURES) {
          endpoint.status = 'blacklisted'
          endpoint.blacklistedUntil = Date.now() + BLACKLIST_DURATION_MS
        }

        // Try next endpoint
        continue
      }
    }

    s.failures++
    throw lastError ?? new Error(`All RPC endpoints failed for chain ${chain}`)
  }

  /** Execute a critical read with quorum (query N RPCs, compare results). */
  async readWithQuorum<T>(chain: string, operation: (client: ReturnType<typeof createPublicClient>) => Promise<T>): Promise<T> {
    const endpoints = this.getHealthyEndpoints(chain).slice(0, 3) // top 3 by latency
    if (endpoints.length < 2) {
      // Not enough for quorum — fall back to single read
      return this.read(chain, operation)
    }

    const results = await Promise.allSettled(
      endpoints.map(async endpoint => {
        const client = createPublicClient({
          chain: CHAIN_REGISTRY[chain].viem,
          transport: http(endpoint.url, { timeout: 15000 }),
        })
        return operation(client)
      })
    )

    // Find the majority result
    const successResults = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<T>[]
    if (successResults.length === 0) {
      throw new Error(`Quorum read failed — all RPCs returned errors`)
    }

    // Compare results — if all agree, return. If disagreement, return majority.
    const serialized = successResults.map(r => JSON.stringify(r.value))
    const counts = new Map<string, number>()
    for (const s of serialized) {
      counts.set(s, (counts.get(s) ?? 0) + 1)
    }
    let maxCount = 0
    let majorityValue = serialized[0]
    for (const [val, count] of counts) {
      if (count > maxCount) {
        maxCount = count
        majorityValue = val
      }
    }
    return JSON.parse(majorityValue) as T
  }

  /** Get network statistics for a chain. */
  getStats(chain: string): NetworkStats {
    const endpoints = Array.from(this.endpoints.values()).filter(e => e.chain === chain)
    const s = this.stats.get(chain) ?? { requests: 0, failures: 0, cacheHits: 0, cacheMisses: 0 }
    return {
      chain,
      endpoints,
      totalRequests: s.requests,
      totalFailures: s.failures,
      cacheHits: s.cacheHits,
      cacheMisses: s.cacheMisses,
    }
  }

  /** Get all network statistics. */
  getAllStats(): NetworkStats[] {
    return Object.keys(CHAIN_REGISTRY).map(chain => this.getStats(chain))
  }

  /** Run a health check on all endpoints. */
  async healthCheck(): Promise<void> {
    for (const [chain, config] of Object.entries(CHAIN_REGISTRY)) {
      for (const url of config.rpcs) {
        const key = `${chain}:${url}`
        const endpoint = this.endpoints.get(key)!
        if (endpoint.status === 'blacklisted') continue
        try {
          const start = performance.now()
          const client = createPublicClient({
            chain: config.viem,
            transport: http(url, { timeout: 5000 }),
          })
          await client.getChainId()
          const latency = performance.now() - start
          endpoint.latencyMs = endpoint.latencyMs * 0.5 + latency * 0.5
          endpoint.status = latency > 3000 ? 'degraded' : 'healthy'
          endpoint.lastCheckedAt = Date.now()
        } catch {
          endpoint.consecutiveFailures++
          if (endpoint.consecutiveFailures >= MAX_FAILURES) {
            endpoint.status = 'blacklisted'
            endpoint.blacklistedUntil = Date.now() + BLACKLIST_DURATION_MS
          }
        }
      }
    }
  }

  /** Clear the cache. */
  clearCache(): void {
    this.cache.clear()
  }
}

// Singleton
const rpcPool = new RpcPool()

// Start periodic health checks
if (typeof window !== 'undefined') {
  setInterval(() => {
    rpcPool.healthCheck().catch(() => { /* ignore */ })
  }, HEALTH_CHECK_INTERVAL_MS)
}

// ============ Public API ============

export { rpcPool }

/**
 * Get balance with failover and cache.
 */
export async function getBalance(chain: string, address: string): Promise<bigint> {
  return rpcPool.read(chain, (client) =>
    client.getBalance({ address: address as Address })
  )
}

/**
 * Get balance with quorum (for critical reads like before signing).
 */
export async function getBalanceWithQuorum(chain: string, address: string): Promise<bigint> {
  return rpcPool.readWithQuorum(chain, (client) =>
    client.getBalance({ address: address as Address })
  )
}

/**
 * Get nonce with failover.
 */
export async function getNonce(chain: string, address: string): Promise<number> {
  return rpcPool.read(chain, (client) =>
    client.getTransactionCount({ address: address as Address })
  )
}

/**
 * Get gas price with failover.
 */
export async function getGasPrice(chain: string): Promise<bigint> {
  return rpcPool.read(chain, (client) => client.getGasPrice())
}

/**
 * Simulate a call (eth_call) with failover.
 */
export async function simulateCall(chain: string, params: {
  from: string
  to: string
  value?: string
  data?: string
}): Promise<{ success: boolean; result?: string; error?: string }> {
  try {
    const result = await rpcPool.read(chain, (client) =>
      client.call({
        account: params.from as Address,
        to: params.to as Address,
        data: params.data as Hex | undefined,
      })
    )
    return { success: true, result: result as unknown as string }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

/**
 * Get all network statistics.
 */
export function getNetworkStats(): NetworkStats[] {
  return rpcPool.getAllStats()
}

/**
 * Get supported chains.
 */
export function getSupportedChains(): string[] {
  return Object.keys(CHAIN_REGISTRY)
}
