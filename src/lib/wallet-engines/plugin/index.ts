// ============ Plugin Engine (Production Hardening) ============
//
// PRINCIPLE: Each blockchain implements the same interface.
// Adding a new chain = adding a new plugin.
//
// plugins/
// ├── ethereum/   (EVM)
// ├── bitcoin/    (UTXO)
// ├── solana/     (SPL)
// ├── sui/
// ├── aptos/
// ├── tron/
// └── ...
//
// All plugins implement the ChainPlugin interface.

// ============ Chain plugin interface ============

export interface ChainPlugin {
  /** Unique chain identifier */
  id: string
  /** Display name */
  name: string
  /** Short label for badges */
  shortLabel: string
  /** Symbol of native token */
  nativeSymbol: string
  /** Color (hex) for branding */
  color: string
  /** Icon glyph */
  glyph: string
  /** Chain family */
  family: 'evm' | 'utxo' | 'solana' | 'sui' | 'aptos' | 'tron' | 'cosmos' | 'other'
  /** Whether the plugin is fully implemented */
  implemented: boolean
  /** Whether the plugin is experimental */
  experimental?: boolean

  // === Address operations ===
  /** Derive address from mnemonic at given index */
  deriveAddress(mnemonic: string, index: number): Promise<string>
  /** Validate an address format */
  validateAddress(address: string): boolean
  /** Shorten an address for display */
  shortenAddress(address: string, chars?: number): string

  // === Balance operations ===
  /** Get native token balance */
  getBalance(address: string): Promise<string>
  /** Get all token balances (ERC-20, SPL, etc.) */
  getTokenBalances(address: string): Promise<ChainTokenBalance[]>

  // === Transaction operations ===
  /** Build a transaction */
  buildTransaction(params: ChainTxParams): Promise<ChainTx>
  /** Sign a transaction */
  signTransaction(tx: ChainTx, privateKey: Uint8Array): Promise<string>
  /** Broadcast a signed transaction */
  broadcastTransaction(signedTx: string): Promise<string>
  /** Get transaction status */
  getTransactionStatus(txHash: string): Promise<ChainTxStatus>

  // === Simulation ===
  /** Simulate a transaction (dry run) */
  simulateTransaction(params: ChainTxParams): Promise<ChainSimulationResult>

  // === Permission operations ===
  /** Get all open permissions/approvals for an address */
  getPermissions(address: string): Promise<ChainPermission[]>
  /** Build revocation transaction for a permission */
  buildRevokeTransaction(permissionId: string): Promise<ChainTx>

  // === Formatting ===
  /** Format an amount for display */
  formatAmount(raw: string, decimals: number): string
  /** Parse a human-readable amount to raw */
  parseAmount(formatted: string, decimals: number): string
}

export interface ChainTokenBalance {
  contractAddress: string | null
  symbol: string
  name: string
  decimals: number
  balance: string
  logoColor: string
  standard: string
}

export interface ChainTxParams {
  from: string
  to: string
  value?: string
  data?: string
  gasLimit?: string
  gasPrice?: string
}

export interface ChainTx {
  chain: string
  from: string
  to: string
  value?: string
  data?: string
  gasLimit: string
  gasPrice: string
  nonce: number
}

export interface ChainTxStatus {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: number
  confirmations: number
}

export interface ChainSimulationResult {
  success: boolean
  gasUsed?: string
  error?: string
  stateDiff?: Record<string, string>
}

export interface ChainPermission {
  id: string
  type: string
  tokenAddress?: string
  tokenSymbol?: string
  spenderAddress: string
  spenderName?: string
  allowance: string
  isInfinite: boolean
  revocable: boolean
}

// ============ Plugin registry ============

class PluginRegistry {
  private plugins = new Map<string, ChainPlugin>()

  register(plugin: ChainPlugin): void {
    this.plugins.set(plugin.id, plugin)
  }

  get(chainId: string): ChainPlugin | undefined {
    return this.plugins.get(chainId)
  }

  getAll(): ChainPlugin[] {
    return Array.from(this.plugins.values())
  }

  getImplemented(): ChainPlugin[] {
    return this.getAll().filter(p => p.implemented)
  }

  getAvailable(): ChainPlugin[] {
    return this.getAll()
  }
}

export const pluginRegistry = new PluginRegistry()

// ============ Helper to shorten addresses ============

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// ============ Mock plugins for non-EVM chains (stubs for future) ============

const MOCK_PLUGINS: ChainPlugin[] = [
  {
    id: 'sui',
    name: 'Sui',
    shortLabel: 'SUI',
    nativeSymbol: 'SUI',
    color: '#4DA2FF',
    glyph: '◉',
    family: 'sui',
    implemented: false,
    experimental: true,
    deriveAddress: async () => '',
    validateAddress: () => false,
    shortenAddress,
    getBalance: async () => '0',
    getTokenBalances: async () => [],
    buildTransaction: async () => ({ chain: 'sui', from: '', to: '', gasLimit: '0', gasPrice: '0', nonce: 0 }),
    signTransaction: async () => '',
    broadcastTransaction: async () => '',
    getTransactionStatus: async () => ({ hash: '', status: 'pending', confirmations: 0 }),
    simulateTransaction: async () => ({ success: false }),
    getPermissions: async () => [],
    buildRevokeTransaction: async () => ({ chain: 'sui', from: '', to: '', gasLimit: '0', gasPrice: '0', nonce: 0 }),
    formatAmount: (raw) => raw,
    parseAmount: (formatted) => formatted,
  },
  {
    id: 'aptos',
    name: 'Aptos',
    shortLabel: 'APT',
    nativeSymbol: 'APT',
    color: '#06B6D4',
    glyph: '▲',
    family: 'aptos',
    implemented: false,
    experimental: true,
    deriveAddress: async () => '',
    validateAddress: () => false,
    shortenAddress,
    getBalance: async () => '0',
    getTokenBalances: async () => [],
    buildTransaction: async () => ({ chain: 'aptos', from: '', to: '', gasLimit: '0', gasPrice: '0', nonce: 0 }),
    signTransaction: async () => '',
    broadcastTransaction: async () => '',
    getTransactionStatus: async () => ({ hash: '', status: 'pending', confirmations: 0 }),
    simulateTransaction: async () => ({ success: false }),
    getPermissions: async () => [],
    buildRevokeTransaction: async () => ({ chain: 'aptos', from: '', to: '', gasLimit: '0', gasPrice: '0', nonce: 0 }),
    formatAmount: (raw) => raw,
    parseAmount: (formatted) => formatted,
  },
  {
    id: 'tron',
    name: 'Tron',
    shortLabel: 'TRX',
    nativeSymbol: 'TRX',
    color: '#FF060A',
    glyph: '◆',
    family: 'tron',
    implemented: false,
    experimental: true,
    deriveAddress: async () => '',
    validateAddress: () => false,
    shortenAddress,
    getBalance: async () => '0',
    getTokenBalances: async () => [],
    buildTransaction: async () => ({ chain: 'tron', from: '', to: '', gasLimit: '0', gasPrice: '0', nonce: 0 }),
    signTransaction: async () => '',
    broadcastTransaction: async () => '',
    getTransactionStatus: async () => ({ hash: '', status: 'pending', confirmations: 0 }),
    simulateTransaction: async () => ({ success: false }),
    getPermissions: async () => [],
    buildRevokeTransaction: async () => ({ chain: 'tron', from: '', to: '', gasLimit: '0', gasPrice: '0', nonce: 0 }),
    formatAmount: (raw) => raw,
    parseAmount: (formatted) => formatted,
  },
]

// Register mock plugins
for (const plugin of MOCK_PLUGINS) {
  pluginRegistry.register(plugin)
}

// ============ Plugin metadata for UI ============

export function getPluginCatalog(): Array<{
  id: string
  name: string
  shortLabel: string
  color: string
  glyph: string
  family: string
  implemented: boolean
  experimental?: boolean
}> {
  return pluginRegistry.getAll().map(p => ({
    id: p.id,
    name: p.name,
    shortLabel: p.shortLabel,
    color: p.color,
    glyph: p.glyph,
    family: p.family,
    implemented: p.implemented,
    experimental: p.experimental,
  }))
}
