'use client'

// ============ Security Governance Layer ============
//
// Última camada estrutural da Tank Wallet.
// Nenhum engine conhece diretamente outro engine.
// Toda comunicação passa pelo Kernel e pelos registries.
//
// 7 Registries:
// 1. Policy Registry    — todas as políticas centralizadas
// 2. Threat Registry    — catálogo versionado de ameaças (THR-XXXX)
// 3. Trust Registry     — Trust Score independente por entidade
// 4. Decision Registry  — toda decisão com explicação reproduzível
// 5. Plugin Registry    — cada blockchain declara capacidades
// 6. Feature Registry   — cada funcionalidade declara engines utilizados
// 7. Audit Registry     — logs imutáveis assinados

import type { PolicyRule } from '../wallet-engines/policy'

// ============ 1. Policy Registry ============

export interface RegistryPolicy extends PolicyRule {
  /** YAML-style declaration for portability */
  declaration: string
  /** When this policy was registered */
  registeredAt: number
  /** Version of this policy */
  version: string
}

const policyRegistry = new Map<string, RegistryPolicy>()

export function registerPolicy(policy: PolicyRule): void {
  const declaration = [
    `policy:`,
    `  id: ${policy.id}`,
    `  enabled: ${policy.enabled}`,
    `  priority: ${policy.priority}`,
    ``,
    `conditions:`,
    `  ${policy.condition}: ${JSON.stringify(policy.params)}`,
    ``,
    `action:`,
    `  ${policy.action}`,
  ].join('\n')
  policyRegistry.set(policy.id, {
    ...policy,
    declaration,
    registeredAt: Date.now(),
    version: '1.0.0',
  })
}

export function getRegisteredPolicy(id: string): RegistryPolicy | undefined {
  return policyRegistry.get(id)
}

export function getAllRegisteredPolicies(): RegistryPolicy[] {
  return Array.from(policyRegistry.values()).sort((a, b) => b.priority - a.priority)
}

// ============ 2. Threat Registry ============

export interface ThreatEntry {
  id: string // THR-XXXX
  name: string
  category: string
  description: string
  /** ATT&CK technique IDs */
  attackMapping: string[]
  /** CWE IDs */
  cweMapping: string[]
  /** CVE IDs (when applicable) */
  cveMapping: string[]
  /** Indicators of Compromise */
  iocs: string[]
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  /** Engines responsible for detection */
  responsibleEngines: string[]
  /** Applicable policies */
  applicablePolicies: string[]
  /** Coverage status */
  coverage: 'detected' | 'blocked' | 'partial' | 'planned'
}

const THREAT_CATALOG: ThreatEntry[] = [
  {
    id: 'THR-0001',
    name: 'Unlimited Approval',
    category: 'Smart Contracts',
    description: 'Aprovação infinita permite que contrato mova qualquer quantidade de tokens.',
    attackMapping: ['T1557', 'T1566'],
    cweMapping: ['CWE-732'],
    cveMapping: [],
    iocs: ['approve(spender, max_uint256)', 'allowance == type(uint256).max'],
    riskLevel: 'high',
    responsibleEngines: ['Permission Engine', 'Policy Engine', 'Simulation Engine'],
    applicablePolicies: ['no-infinite-approve-unknown'],
    coverage: 'blocked',
  },
  {
    id: 'THR-0002',
    name: 'Permit2 Abuse',
    category: 'Smart Contracts',
    description: 'Permit2 permite autorizar múltiplas transferências com uma única assinatura.',
    attackMapping: ['T1557'],
    cweMapping: ['CWE-285'],
    cveMapping: [],
    iocs: ['Permit2 contract', 'permit2.transferFrom'],
    riskLevel: 'high',
    responsibleEngines: ['Signature Engine', 'Permission Engine', 'Simulation Engine'],
    applicablePolicies: ['biometric-large-amount'],
    coverage: 'blocked',
  },
  {
    id: 'THR-0003',
    name: 'Address Poisoning',
    category: 'Engenharia Social',
    description: 'Atacante envia pequenas transferências de endereço visualmente similar para envenenar histórico.',
    attackMapping: ['T1566', 'T1584'],
    cweMapping: [],
    cveMapping: [],
    iocs: ['zero-value transfers', 'similar prefix/suffix addresses'],
    riskLevel: 'high',
    responsibleEngines: ['Wallet Guardian', 'Behavior Engine'],
    applicablePolicies: [],
    coverage: 'detected',
  },
  {
    id: 'THR-0004',
    name: 'Clipboard Hijacking',
    category: 'Engenharia Social',
    description: 'Malware substitui endereço copiado na área de transferência.',
    attackMapping: ['T1115', 'T1056'],
    cweMapping: [],
    cveMapping: [],
    iocs: ['clipboard content mismatch', 'address substitution on paste'],
    riskLevel: 'critical',
    responsibleEngines: ['Wallet Guardian', 'Device Trust Engine'],
    applicablePolicies: [],
    coverage: 'blocked',
  },
  {
    id: 'THR-0005',
    name: 'Honeypot Token',
    category: 'Smart Contracts',
    description: 'Token com função de venda bloqueada — vítima compra mas não pode vender.',
    attackMapping: [],
    cweMapping: ['CWE-829'],
    cveMapping: [],
    iocs: ['is_honeypot=1', 'cannot_sell_all=1', 'sell_tax>50%'],
    riskLevel: 'critical',
    responsibleEngines: ['Threat Intelligence', 'Simulation Engine', 'Contract Scanner'],
    applicablePolicies: [],
    coverage: 'blocked',
  },
  {
    id: 'THR-0006',
    name: 'Rug Pull',
    category: 'Smart Contracts',
    description: 'Deployer remove liquidez após atrair compradores.',
    attackMapping: [],
    cweMapping: [],
    cveMapping: [],
    iocs: ['liquidity removed', 'owner mint', 'LP not locked'],
    riskLevel: 'critical',
    responsibleEngines: ['Threat Intelligence', 'Liquidity Engine'],
    applicablePolicies: [],
    coverage: 'blocked',
  },
  {
    id: 'THR-0007',
    name: 'Phishing DApp',
    category: 'Engenharia Social',
    description: 'Site falso imita DApp legítimo para capturar assinaturas.',
    attackMapping: ['T1566', 'T1583'],
    cweMapping: [],
    cveMapping: [],
    iocs: ['typosquatting domain', 'new domain registration', 'fake airdrop'],
    riskLevel: 'critical',
    responsibleEngines: ['DApp Shield', 'Threat Intelligence'],
    applicablePolicies: ['block-bsc-night'],
    coverage: 'blocked',
  },
  {
    id: 'THR-0008',
    name: 'Deepfake / Synthetic Identity',
    category: 'AI Threats',
    description: 'IA gera vídeo/áudio sintético para impersonar suporte ou figura de autoridade.',
    attackMapping: ['T1586', 'T1656'],
    cweMapping: [],
    cveMapping: [],
    iocs: ['seed phrase request', 'urgent verification', 'video claiming to be Tank support'],
    riskLevel: 'critical',
    responsibleEngines: ['AI Security Engine', 'Wallet Guardian'],
    applicablePolicies: [],
    coverage: 'partial',
  },
  {
    id: 'THR-0009',
    name: 'Prompt Injection',
    category: 'AI Threats',
    description: 'Atacante injeta instruções maliciosas em prompts de IA.',
    attackMapping: ['T1055'],
    cweMapping: ['CWE-74'],
    cveMapping: [],
    iocs: ['ignore previous instructions', 'system prompt leak', 'jailbreak attempt'],
    riskLevel: 'high',
    responsibleEngines: ['AI Security Engine'],
    applicablePolicies: [],
    coverage: 'detected',
  },
  {
    id: 'THR-0010',
    name: 'Memory Scraping / Infostealer',
    category: 'Wallet Security',
    description: 'Malware extrai chaves privadas da memória do processo.',
    attackMapping: ['T1005', 'T1056'],
    cweMapping: ['CWE-316'],
    cveMapping: [],
    iocs: ['process memory dump', 'key material in logs'],
    riskLevel: 'critical',
    responsibleEngines: ['Key Management Engine', 'Device Trust Engine'],
    applicablePolicies: [],
    coverage: 'blocked',
  },
  {
    id: 'THR-0011',
    name: 'Root / Jailbreak',
    category: 'Device Security',
    description: 'Dispositivo com root/jailbreak permite acesso privilegiado a apps maliciosos.',
    attackMapping: ['T1068', 'T1548'],
    cweMapping: [],
    cveMapping: [],
    iocs: ['su binary', 'Cydia', 'Magisk', 'Xposed framework'],
    riskLevel: 'high',
    responsibleEngines: ['Device Trust Engine'],
    applicablePolicies: [],
    coverage: 'detected',
  },
  {
    id: 'THR-0012',
    name: 'RPC Tracking / Privacy Leakage',
    category: 'Privacy',
    description: 'RPC público correlaciona endereços e histórico de transações.',
    attackMapping: ['T1580', 'T1590'],
    cweMapping: ['CWE-359'],
    cveMapping: [],
    iocs: ['multiple address queries from same IP', 'address correlation'],
    riskLevel: 'medium',
    responsibleEngines: ['Privacy Engine', 'Network Engine'],
    applicablePolicies: [],
    coverage: 'partial',
  },
  {
    id: 'THR-0013',
    name: 'Supply Chain Attack',
    category: 'Infrastructure',
    description: 'Dependência comprometida injeta código malicioso no build.',
    attackMapping: ['T1195', 'T1585'],
    cweMapping: ['CWE-1357'],
    cveMapping: [],
    iocs: ['modified package', 'unexpected network calls', 'typosquatted package'],
    riskLevel: 'critical',
    responsibleEngines: ['Secure Update Engine', 'Audit Engine'],
    applicablePolicies: [],
    coverage: 'partial',
  },
  {
    id: 'THR-0014',
    name: 'Reentrancy',
    category: 'Smart Contracts',
    description: 'Contrato chama externo antes de atualizar estado, permitindo reentrada maliciosa.',
    attackMapping: [],
    cweMapping: ['CWE-836'],
    cveMapping: [],
    iocs: ['external call before state update', 'Curve-style vulnerability'],
    riskLevel: 'critical',
    responsibleEngines: ['Simulation Engine', 'Contract Scanner'],
    applicablePolicies: [],
    coverage: 'detected',
  },
  {
    id: 'THR-0015',
    name: 'Flash Loan Exploit',
    category: 'Smart Contracts',
    description: 'Atacante usa flash loan para manipular preço oráculo em uma única transação.',
    attackMapping: [],
    cweMapping: ['CWE-682'],
    cveMapping: [],
    iocs: ['single-tx price manipulation', 'flash loan + oracle query'],
    riskLevel: 'critical',
    responsibleEngines: ['Simulation Engine', 'Oracle Engine'],
    applicablePolicies: [],
    coverage: 'detected',
  },
]

const threatRegistry = new Map<string, ThreatEntry>()
for (const t of THREAT_CATALOG) threatRegistry.set(t.id, t)

export function getThreat(id: string): ThreatEntry | undefined {
  return threatRegistry.get(id)
}

export function getAllThreats(): ThreatEntry[] {
  return THREAT_CATALOG
}

export function getThreatsByCategory(category: string): ThreatEntry[] {
  return THREAT_CATALOG.filter(t => t.category === category)
}

// ============ 3. Trust Registry ============

export type EntityType = 'dapp' | 'rpc' | 'bridge' | 'token' | 'oracle' | 'contract'

export interface TrustEntry {
  id: string
  type: EntityType
  name: string
  identifier: string // URL, address, or RPC URL
  trustScore: number // 0-100
  level: 'verified' | 'known' | 'unknown' | 'suspicious' | 'malicious'
  sources: string[] // which sources contributed to the score
  lastUpdated: number
}

const trustRegistry = new Map<string, TrustEntry>()

const INITIAL_TRUST: TrustEntry[] = [
  // DApps
  { id: 'trust-uniswap', type: 'dapp', name: 'Uniswap V3', identifier: 'app.uniswap.org', trustScore: 99, level: 'verified', sources: ['manual', 'chainpatrol', 'community'], lastUpdated: Date.now() },
  { id: 'trust-aave', type: 'dapp', name: 'Aave V3', identifier: 'app.aave.com', trustScore: 98, level: 'verified', sources: ['manual', 'community'], lastUpdated: Date.now() },
  { id: 'trust-opensea', type: 'dapp', name: 'OpenSea', identifier: 'opensea.io', trustScore: 95, level: 'verified', sources: ['manual', 'community'], lastUpdated: Date.now() },
  { id: 'trust-1inch', type: 'dapp', name: '1inch', identifier: 'app.1inch.io', trustScore: 97, level: 'verified', sources: ['manual', 'community'], lastUpdated: Date.now() },
  { id: 'trust-curve', type: 'dapp', name: 'Curve Finance', identifier: 'curve.fi', trustScore: 96, level: 'verified', sources: ['manual', 'community'], lastUpdated: Date.now() },
  // RPCs
  { id: 'trust-infura', type: 'rpc', name: 'Infura', identifier: 'mainnet.infura.io', trustScore: 99, level: 'verified', sources: ['manual', 'uptime-monitor'], lastUpdated: Date.now() },
  { id: 'trust-alchemy', type: 'rpc', name: 'Alchemy', identifier: 'eth-mainnet.alchemyapi.io', trustScore: 98, level: 'verified', sources: ['manual', 'uptime-monitor'], lastUpdated: Date.now() },
  { id: 'trust-ankr', type: 'rpc', name: 'Ankr', identifier: 'rpc.ankr.com', trustScore: 96, level: 'verified', sources: ['manual', 'uptime-monitor'], lastUpdated: Date.now() },
  { id: 'trust-publicnode', type: 'rpc', name: 'PublicNode', identifier: 'ethereum-rpc.publicnode.com', trustScore: 95, level: 'verified', sources: ['manual', 'uptime-monitor'], lastUpdated: Date.now() },
  { id: 'trust-1rpc', type: 'rpc', name: '1RPC', identifier: '1rpc.io', trustScore: 93, level: 'verified', sources: ['manual', 'privacy-focused'], lastUpdated: Date.now() },
  // Bridges
  { id: 'trust-across', type: 'bridge', name: 'Across Protocol', identifier: 'across.to', trustScore: 98, level: 'verified', sources: ['manual', 'audited'], lastUpdated: Date.now() },
  { id: 'trust-hop', type: 'bridge', name: 'Hop Protocol', identifier: 'app.hop.exchange', trustScore: 95, level: 'verified', sources: ['manual', 'audited'], lastUpdated: Date.now() },
  { id: 'trust-wormhole', type: 'bridge', name: 'Wormhole', identifier: 'wormhole.com', trustScore: 85, level: 'known', sources: ['manual', 'previously-exploited'], lastUpdated: Date.now() },
  // Tokens
  { id: 'trust-usdc', type: 'token', name: 'USDC', identifier: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', trustScore: 100, level: 'verified', sources: ['manual', 'circle-issued', 'audited'], lastUpdated: Date.now() },
  { id: 'trust-usdt', type: 'token', name: 'USDT', identifier: '0xdAC17F958D2ee523a2206206994597C13D831ec7', trustScore: 98, level: 'verified', sources: ['manual', 'tether-issued'], lastUpdated: Date.now() },
  { id: 'trust-weth', type: 'token', name: 'WETH', identifier: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', trustScore: 100, level: 'verified', sources: ['manual', 'canonical'], lastUpdated: Date.now() },
  // Oracles
  { id: 'trust-chainlink', type: 'oracle', name: 'Chainlink', identifier: 'chain.link', trustScore: 100, level: 'verified', sources: ['manual', 'audited', 'market-leader'], lastUpdated: Date.now() },
  { id: 'trust-pyth', type: 'oracle', name: 'Pyth Network', identifier: 'pyth.network', trustScore: 95, level: 'verified', sources: ['manual', 'audited'], lastUpdated: Date.now() },
]

for (const t of INITIAL_TRUST) trustRegistry.set(t.identifier.toLowerCase(), t)

export function getTrustEntry(identifier: string): TrustEntry | undefined {
  return trustRegistry.get(identifier.toLowerCase())
}

export function getTrustByType(type: EntityType): TrustEntry[] {
  return INITIAL_TRUST.filter(t => t.type === type)
}

export function getAllTrustEntries(): TrustEntry[] {
  return INITIAL_TRUST
}

// ============ 4. Decision Registry ============

export interface DecisionRecord {
  id: string
  timestamp: number
  /** Final decision */
  decision: 'ALLOW' | 'WARN' | 'REQUIRE_EXTRA_AUTH' | 'BLOCK'
  /** Decision score */
  score: number
  /** Per-engine scores */
  engineScores: Record<string, number>
  /** Context of the action */
  context: {
    chain?: string
    contractAddress?: string
    amountUsd?: number
    walletAddress?: string
  }
  /** Reasons contributing to the decision */
  reasons: string[]
  /** Whether the action was blocked */
  blocked: boolean
}

const decisionRegistry: DecisionRecord[] = []
const MAX_DECISIONS = 500

export function recordDecision(decision: Omit<DecisionRecord, 'id' | 'timestamp'>): DecisionRecord {
  const record: DecisionRecord = {
    ...decision,
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  }
  decisionRegistry.unshift(record)
  if (decisionRegistry.length > MAX_DECISIONS) decisionRegistry.length = MAX_DECISIONS
  return record
}

export function getDecisionHistory(): DecisionRecord[] {
  return decisionRegistry
}

export function getDecisionStats(): {
  total: number
  allowed: number
  warned: number
  requiredAuth: number
  blocked: number
} {
  return {
    total: decisionRegistry.length,
    allowed: decisionRegistry.filter(d => d.decision === 'ALLOW').length,
    warned: decisionRegistry.filter(d => d.decision === 'WARN').length,
    requiredAuth: decisionRegistry.filter(d => d.decision === 'REQUIRE_EXTRA_AUTH').length,
    blocked: decisionRegistry.filter(d => d.decision === 'BLOCK').length,
  }
}

// ============ 5. Plugin Registry (capabilities) ============

export interface PluginCapabilities {
  chainId: string
  name: string
  capabilities: string[]
  family: string
  implemented: boolean
}

const PLUGIN_CAPABILITIES: PluginCapabilities[] = [
  { chainId: 'ethereum', name: 'Ethereum', family: 'evm', implemented: true, capabilities: ['EIP-1559', 'EIP-712', 'Permit', 'Permit2', 'ERC-4337', 'ENS', 'ERC-20', 'ERC-721', 'ERC-1155'] },
  { chainId: 'bsc', name: 'BNB Smart Chain', family: 'evm', implemented: true, capabilities: ['EIP-1559', 'EIP-712', 'Permit', 'Permit2', 'ERC-20', 'ERC-721', 'ERC-1155'] },
  { chainId: 'polygon', name: 'Polygon PoS', family: 'evm', implemented: true, capabilities: ['EIP-1559', 'EIP-712', 'Permit', 'Permit2', 'ERC-20', 'ERC-721', 'ERC-1155'] },
  { chainId: 'arbitrum', name: 'Arbitrum One', family: 'evm', implemented: true, capabilities: ['EIP-1559', 'EIP-712', 'Permit', 'Permit2', 'ERC-4337', 'ERC-20', 'ERC-721'] },
  { chainId: 'optimism', name: 'Optimism', family: 'evm', implemented: true, capabilities: ['EIP-1559', 'EIP-712', 'Permit', 'Permit2', 'ERC-20', 'ERC-721'] },
  { chainId: 'avalanche', name: 'Avalanche C-Chain', family: 'evm', implemented: true, capabilities: ['EIP-1559', 'EIP-712', 'Permit', 'ERC-20', 'ERC-721'] },
  { chainId: 'base', name: 'Base', family: 'evm', implemented: true, capabilities: ['EIP-1559', 'EIP-712', 'Permit', 'Permit2', 'ERC-4337', 'ERC-20', 'ERC-721'] },
  { chainId: 'solana', name: 'Solana', family: 'solana', implemented: true, capabilities: ['Versioned Transactions', 'SPL Token', 'SPL Delegate', 'Compressed NFTs'] },
  { chainId: 'bitcoin', name: 'Bitcoin', family: 'utxo', implemented: true, capabilities: ['PSBT', 'Native SegWit', 'Taproot', 'Miniscript', 'BIP-174'] },
  { chainId: 'lightning', name: 'Lightning Network', family: 'lightning', implemented: true, capabilities: ['BOLT-11 Invoices', 'Payment Channels', 'Submarine Swaps'] },
  { chainId: 'sui', name: 'Sui', family: 'sui', implemented: false, capabilities: ['Sui Move', 'Object Model'] },
  { chainId: 'aptos', name: 'Aptos', family: 'aptos', implemented: false, capabilities: ['Move', 'Resource Model'] },
  { chainId: 'tron', name: 'Tron', family: 'tron', implemented: false, capabilities: ['TRC-20', 'TRC-721'] },
]

export function getPluginCapabilities(chainId: string): PluginCapabilities | undefined {
  return PLUGIN_CAPABILITIES.find(p => p.chainId === chainId)
}

export function getAllPluginCapabilities(): PluginCapabilities[] {
  return PLUGIN_CAPABILITIES
}

// ============ 6. Feature Registry ============

export interface FeatureRegistration {
  id: string
  name: string
  description: string
  /** Engines involved in the feature's decision flow */
  engines: string[]
  /** TSS specs the feature must comply with */
  tssSpecs: string[]
  /** Threats this feature addresses */
  threats: string[]
  /** How the feature is audited */
  auditActions: string[]
  /** How to revoke/disable the feature */
  revocationMethod: string
  /** How the feature fails safely */
  failSafeBehavior: string
  status: 'active' | 'planned' | 'disabled'
}

const FEATURE_REGISTRY: FeatureRegistration[] = [
  {
    id: 'feat-send',
    name: 'Send Transaction',
    description: 'Enviar tokens/ETH para outro endereço',
    engines: ['Simulation Engine', 'Threat Intelligence', 'Behavior Engine', 'Policy Engine', 'Network Engine', 'Permission Engine', 'Audit Engine'],
    tssSpecs: ['TSS-001', 'TSS-002', 'TSS-003', 'TSS-004', 'TSS-009'],
    threats: ['THR-0001', 'THR-0003', 'THR-0004', 'THR-0010'],
    auditActions: ['send'],
    revocationMethod: 'Lockdown L1 bloqueia assinaturas',
    failSafeBehavior: 'Se qualquer engine falhar, transação é bloqueada',
    status: 'active',
  },
  {
    id: 'feat-swap',
    name: 'Token Swap',
    description: 'Trocar tokens via DEX',
    engines: ['Simulation Engine', 'Threat Intelligence', 'Behavior Engine', 'Policy Engine', 'Network Engine', 'Permission Engine', 'Audit Engine'],
    tssSpecs: ['TSS-001', 'TSS-002', 'TSS-003', 'TSS-004', 'TSS-006', 'TSS-009'],
    threats: ['THR-0001', 'THR-0005', 'THR-0006', 'THR-0014', 'THR-0015'],
    auditActions: ['swap'],
    revocationMethod: 'Lockdown L1 bloqueia assinaturas',
    failSafeBehavior: 'Se simulação falhar, swap é bloqueado',
    status: 'planned',
  },
  {
    id: 'feat-bridge',
    name: 'Cross-Chain Bridge',
    description: 'Mover ativos entre chains',
    engines: ['Simulation Engine', 'Threat Intelligence', 'Behavior Engine', 'Policy Engine', 'Network Engine', 'Audit Engine'],
    tssSpecs: ['TSS-001', 'TSS-002', 'TSS-003', 'TSS-004', 'TSS-009'],
    threats: ['THR-0006', 'THR-0015'],
    auditActions: ['bridge'],
    revocationMethod: 'Lockdown L2 desconecta DApps',
    failSafeBehavior: 'Se bridge comprometida, bloqueio automático',
    status: 'planned',
  },
  {
    id: 'feat-approve',
    name: 'Token Approval',
    description: 'Aprovar gastador para mover tokens',
    engines: ['Permission Engine', 'Policy Engine', 'Simulation Engine', 'Threat Intelligence', 'Audit Engine'],
    tssSpecs: ['TSS-001', 'TSS-002', 'TSS-003', 'TSS-006', 'TSS-007', 'TSS-009'],
    threats: ['THR-0001', 'THR-0002'],
    auditActions: ['approve', 'revoke'],
    revocationMethod: 'Permission Manager + Lockdown L3',
    failSafeBehavior: 'Approve infinito bloqueado para unknowns',
    status: 'active',
  },
  {
    id: 'feat-dapp-connect',
    name: 'DApp Connection',
    description: 'Conectar carteira a DApp',
    engines: ['DApp Shield', 'Threat Intelligence', 'Privacy Engine', 'Audit Engine'],
    tssSpecs: ['TSS-001', 'TSS-004', 'TSS-009'],
    threats: ['THR-0007', 'THR-0012'],
    auditActions: ['dapp_connected', 'dapp_disconnected'],
    revocationMethod: 'Lockdown L2 encerra sessões',
    failSafeBehavior: 'Se DApp malicioso, conexão bloqueada',
    status: 'active',
  },
]

export function getAllFeatures(): FeatureRegistration[] {
  return FEATURE_REGISTRY
}

export function getFeature(id: string): FeatureRegistration | undefined {
  return FEATURE_REGISTRY.find(f => f.id === id)
}

// ============ 7. Audit Registry (reference to Audit Engine) ============

export interface AuditRegistryEntry {
  id: string
  timestamp: number
  action: string
  description: string
  result: string
  signature: string
}

// Audit Registry is backed by the Audit Engine (HMAC-signed)
// This is a reference interface for governance purposes

// ============ New Feature Acceptance Criteria ============

export interface FeatureAcceptanceCriteria {
  question: string
  description: string
}

export const FEATURE_ACCEPTANCE_CRITERIA: FeatureAcceptanceCriteria[] = [
  {
    question: 'Quais ameaças ela introduz?',
    description: 'Toda nova funcionalidade deve documentar as ameaças que introduz e como são mitigadas.',
  },
  {
    question: 'Quais TSS ela deve cumprir?',
    description: 'Listar quais Tank Security Standards a funcionalidade deve atender.',
  },
  {
    question: 'Quais engines participam da decisão?',
    description: 'Declarar explicitamente quais engines do Security Kernel são envolvidos.',
  },
  {
    question: 'Como ela é auditada?',
    description: 'Definir quais actions são logadas no Audit Engine.',
  },
  {
    question: 'Como ela é revogada ou desativada?',
    description: 'Definir como a funcionalidade pode ser desativada em caso de comprometimento.',
  },
  {
    question: 'Como ela falha de forma segura (fail-safe)?',
    description: 'Definir o comportamento quando engines falham — sempre falhar para o lado seguro (block).',
  },
  {
    question: 'Quais testes automatizados cobrem seus fluxos críticos?',
    description: 'Listar testes unitários, de integração e E2E que cobrem a funcionalidade.',
  },
]

// ============ Governance stats ============

export function getGovernanceStats() {
  return {
    policies: getAllRegisteredPolicies().length,
    threats: THREAT_CATALOG.length,
    trustEntries: INITIAL_TRUST.length,
    decisions: decisionRegistry.length,
    plugins: PLUGIN_CAPABILITIES.length,
    features: FEATURE_REGISTRY.length,
    coverage: {
      blocked: THREAT_CATALOG.filter(t => t.coverage === 'blocked').length,
      detected: THREAT_CATALOG.filter(t => t.coverage === 'detected').length,
      partial: THREAT_CATALOG.filter(t => t.coverage === 'partial').length,
      planned: THREAT_CATALOG.filter(t => t.coverage === 'planned').length,
    },
  }
}
