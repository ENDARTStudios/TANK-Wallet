// @ts-nocheck
'use client'

// ============ Architecture Freeze 1.0 ============
//
// A partir deste marco:
// - nenhum novo engine é criado
// - nenhum registry novo é adicionado
// - nenhum domínio TSF novo é criado sem justificativa formal
// - novas funcionalidades só podem reutilizar componentes existentes
//
// Todas as interfaces estão congeladas.

// ═══════════════════════════════════════════════════════════
// 1. FROZEN INTERFACE — SecurityEngine
// ═══════════════════════════════════════════════════════════

export interface SecurityContext {
  walletAddress: string
  chain: string
  contractAddress: string
  amountUsd: number
  isInfiniteApproval: boolean
  contractVerified: boolean
  deviceFingerprint: string
  hour: number
  isWeekend: boolean
  knownDevices: string[]
  knownChains: string[]
  securityLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4'
  /** Additional context specific to the action */
  metadata?: Record<string, unknown>
}

export interface SecurityResult {
  engineId: string
  engineVersion: string
  /** Score 0-100, higher = safer */
  score: number
  /** Risk level */
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  /** Whether the engine recommends blocking */
  blocked: boolean
  /** Evidence contributing to the result */
  evidence: string[]
  /** Human-readable explanation */
  explanation: string
  /** When the evaluation happened */
  evaluatedAt: number
  /** Duration of the evaluation in ms */
  durationMs: number
}

export interface HumanExplanation {
  summary: string
  details: string[]
  recommendation: string
  riskLevel: string
}

export interface EngineHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline'
  latencyMs: number
  lastCheckedAt: number
  /** Why the engine is degraded/unhealthy */
  issues: string[]
}

export interface EngineCapabilityManifest {
  id: string
  version: string
  name: string
  description: string
  /** Capabilities this engine provides */
  capabilities: string[]
  /** Other engines this engine requires */
  requires: string[]
  /** TSF domains this engine covers */
  tsfDomains: string[]
  /** TSS specs this engine enforces */
  tssSpecs: string[]
  /** Maturity level */
  maturity: 'production' | 'beta' | 'alpha' | 'deprecated'
  /** Fail-safe behavior when unavailable */
  failSafe: FailSafeBehavior
}

export interface FailSafeBehavior {
  /** What happens when this engine fails */
  onFailure: 'block_all' | 'block_critical' | 'degrade' | 'allow_with_warning' | 'allow'
  /** Description of the fail-safe behavior */
  description: string
  /** Whether critical actions are blocked when this engine is down */
  blocksCriticalActions: boolean
}

/**
 * THE frozen interface. Every security engine implements exactly this.
 * The SecurityKernel knows only this interface — never concrete implementations.
 *
 * @frozen v1.0 — do not modify without Architecture Review Board approval
 */
export interface SecurityEngine {
  readonly id: string
  readonly version: string

  /** Initialize the engine. Called once at kernel startup. */
  initialize(): Promise<void>

  /** Evaluate a security context. Returns a typed result with evidence. */
  evaluate(context: SecurityContext): Promise<SecurityResult>

  /** Explain a result in human-readable terms. */
  explain(result: SecurityResult): HumanExplanation

  /** Check engine health. Called periodically by the kernel. */
  health(): EngineHealth

  /** Get the capability manifest. */
  manifest(): EngineCapabilityManifest

  /** Gracefully shutdown the engine. */
  shutdown(): Promise<void>
}

// ═══════════════════════════════════════════════════════════
// 2. SECURITY EVENT BUS — typed events, no direct engine calls
// ═══════════════════════════════════════════════════════════

export type SecurityEventType =
  | 'THREAT_DETECTED'
  | 'SIMULATION_COMPLETED'
  | 'DEVICE_TRUST_CHANGED'
  | 'PERMISSION_CREATED'
  | 'PERMISSION_REVOKED'
  | 'LOCKDOWN_ACTIVATED'
  | 'LOCKDOWN_DEACTIVATED'
  | 'NEW_THREAT_FEED'
  | 'POLICY_VIOLATION'
  | 'NETWORK_DEGRADED'
  | 'PLUGIN_LOADED'
  | 'ENGINE_HEALTH_CHANGED'
  | 'BEHAVIOR_ANOMALY'
  | 'AUDIT_LOGGED'
  | 'DECISION_MADE'
  | 'KEYS_LOCKED'
  | 'KEYS_UNLOCKED'

export interface SecurityEvent<T = unknown> {
  type: SecurityEventType
  timestamp: number
  source: string // engine ID that emitted the event
  payload: T
}

type EventHandler<T = unknown> = (event: SecurityEvent<T>) => void

class SecurityEventBus {
  private handlers = new Map<SecurityEventType, Set<EventHandler>>()
  private eventLog: SecurityEvent[] = []
  private maxLogSize = 500

  on<T>(type: SecurityEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler as EventHandler)
    // Return unsubscribe function
    return () => this.handlers.get(type)?.delete(handler as EventHandler)
  }

  emit<T>(type: SecurityEventType, source: string, payload: T): void {
    const event: SecurityEvent<T> = {
      type,
      timestamp: Date.now(),
      source,
      payload,
    }
    // Log the event
    this.eventLog.unshift(event)
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.length = this.maxLogSize
    }
    // Notify handlers
    const handlers = this.handlers.get(type)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event)
        } catch (e) {
          console.warn(`[EventBus] Handler error for ${type}:`, e)
        }
      }
    }
  }

  getEventLog(): SecurityEvent[] {
    return this.eventLog
  }

  getEventLogByType(type: SecurityEventType): SecurityEvent[] {
    return this.eventLog.filter(e => e.type === type)
  }

  clearLog(): void {
    this.eventLog = []
  }
}

// Singleton event bus
export const eventBus = new SecurityEventBus()

// ═══════════════════════════════════════════════════════════
// 3. ENGINE REGISTRY — registered engines with version + maturity
// ═══════════════════════════════════════════════════════════

export interface EngineRegistration {
  engine: SecurityEngine
  manifest: EngineCapabilityManifest
  registeredAt: number
  health: EngineHealth
}

const engineRegistry = new Map<string, EngineRegistration>()

export function registerEngine(engine: SecurityEngine): void {
  const manifest = engine.manifest()
  // Validate SemVer compatibility (basic check)
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    throw new Error(`Engine ${manifest.id} has invalid version: ${manifest.version}`)
  }
  // Check if already registered
  if (engineRegistry.has(manifest.id)) {
    throw new Error(`Engine ${manifest.id} is already registered`)
  }
  engineRegistry.set(manifest.id, {
    engine,
    manifest,
    registeredAt: Date.now(),
    health: { status: 'healthy', latencyMs: 0, lastCheckedAt: 0, issues: [] },
  })
  eventBus.emit('PLUGIN_LOADED', 'kernel', { engineId: manifest.id, version: manifest.version })
}

export function getEngine(id: string): SecurityEngine | undefined {
  return engineRegistry.get(id)?.engine
}

export function getEngineRegistration(id: string): EngineRegistration | undefined {
  return engineRegistry.get(id)
}

export function getAllEngines(): EngineRegistration[] {
  return Array.from(engineRegistry.values())
}

export function getEnginesByMaturity(level: string): EngineRegistration[] {
  return getAllEngines().filter(r => r.manifest.maturity === level)
}

// ═══════════════════════════════════════════════════════════
// 4. MATURITY MODEL
// ═══════════════════════════════════════════════════════════

export type MaturityLevel = 'production' | 'beta' | 'alpha' | 'deprecated'

export interface MaturityCriteria {
  level: MaturityLevel
  label: string
  description: string
  requirements: string[]
  color: string
}

export const MATURITY_LEVELS: Record<MaturityLevel, MaturityCriteria> = {
  production: {
    level: 'production',
    label: 'Production',
    description: 'Aprovado para uso em ambiente real com ativos reais.',
    requirements: [
      'Cobertura de testes ≥95%',
      'Auditoria externa concluída',
      'Pentest aprovado',
      'Documentação completa',
      'Performance dentro do budget',
      'Fail-safe testado',
      'Sem vulnerabilidades conhecidas de alta severidade',
    ],
    color: 'text-emerald-400',
  },
  beta: {
    level: 'beta',
    label: 'Beta',
    description: 'Funcional mas com testes e auditorias em andamento.',
    requirements: [
      'Cobertura de testes ≥70%',
      'Testes de integração básicos',
      'Documentação parcial',
      'Fail-safe implementado mas não testado em produção',
    ],
    color: 'text-amber-400',
  },
  alpha: {
    level: 'alpha',
    label: 'Alpha',
    description: 'Implementação inicial — não usar com ativos reais.',
    requirements: [
      'Implementação funcional',
      'Testes manuais',
      'Documentação mínima',
      'Pode ter breaking changes',
    ],
    color: 'text-orange-400',
  },
  deprecated: {
    level: 'deprecated',
    label: 'Deprecated',
    description: 'Substituído por versão mais nova — remoção planejada.',
    requirements: ['Não usar em novos deploys'],
    color: 'text-red-400',
  },
}

// ═══════════════════════════════════════════════════════════
// 5. PERFORMANCE BUDGET
// ═══════════════════════════════════════════════════════════

export interface PerformanceTarget {
  operation: string
  target: string
  targetMs: number
  category: 'kernel' | 'engine' | 'action'
}

export const PERFORMANCE_BUDGET: PerformanceTarget[] = [
  { operation: 'Inicialização do Kernel', target: '< 300 ms', targetMs: 300, category: 'kernel' },
  { operation: 'Avaliação de política', target: '< 20 ms', targetMs: 20, category: 'engine' },
  { operation: 'Simulação local', target: '< 2 s', targetMs: 2000, category: 'engine' },
  { operation: 'Decision Engine (sem simulação)', target: '< 100 ms', targetMs: 100, category: 'engine' },
  { operation: 'Ativação de Lockdown', target: '< 5 s', targetMs: 5000, category: 'action' },
  { operation: 'Carregamento de plugins', target: '< 200 ms', targetMs: 200, category: 'kernel' },
  { operation: 'Atualização de Threat Intel', target: '< 60 s após sync', targetMs: 60000, category: 'engine' },
  { operation: 'Auto-lock timeout', target: '5 min', targetMs: 300000, category: 'kernel' },
  { operation: 'RPC failover', target: '< 15 s', targetMs: 15000, category: 'engine' },
  { operation: 'Audit log write', target: '< 10 ms', targetMs: 10, category: 'engine' },
]

// ═══════════════════════════════════════════════════════════
// 6. UNIFIED DATA MODEL — shared central objects
// ═══════════════════════════════════════════════════════════

export interface UnifiedThreat {
  id: string // THR-XXXX
  name: string
  category: string
  description: string
  iocs: string[]
  attackMapping: string[] // MITRE ATT&CK
  cweMapping: string[]
  cveMapping: string[]
  blockStrategy: string
  detectionStrategy: string
  recoveryStrategy: string
  affectedChains: string[]
  affectedWalletVersions: string[]
  confidence: number // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastUpdated: number
  coverage: 'blocked' | 'detected' | 'partial' | 'planned'
}

export interface UnifiedTrustScore {
  entityType: 'dapp' | 'rpc' | 'bridge' | 'token' | 'oracle' | 'contract'
  identifier: string
  name: string
  score: number
  level: 'verified' | 'known' | 'unknown' | 'suspicious' | 'malicious'
  sources: string[]
  lastUpdated: number
}

export interface UnifiedPolicy {
  id: string
  name: string
  enabled: boolean
  condition: string
  action: 'allow' | 'require_confirmation' | 'require_biometric' | 'block'
  priority: number
}

export interface UnifiedAuditEvent {
  id: string
  timestamp: number
  action: string
  walletAddress: string
  description: string
  result: 'success' | 'failure' | 'blocked'
  signature: string
  previousSignature: string
}

export interface UnifiedSimulationResult {
  success: boolean
  stateDiff: Record<string, string>
  assetDiff: Array<{ token: string; change: string; direction: 'in' | 'out' }>
  permissionDiff: { created: string[]; removed: string[] }
  gasEstimate: string
  humanExplanation: string
}

export interface UnifiedDeviceState {
  fingerprint: string
  trustScore: number
  level: 'trusted' | 'caution' | 'untrusted'
  warnings: string[]
  critical: string[]
}

export interface UnifiedTransactionIntent {
  from: string
  to: string
  value: string
  data: string
  chain: string
  amountUsd: number
  isInfiniteApproval: boolean
  contractVerified: boolean
}

export interface UnifiedPermission {
  id: string
  protocol: string
  chain: string
  tokenSymbol: string
  spenderAddress: string
  allowance: string
  isInfinite: boolean
  revocable: boolean
  riskLevel: string
}

export interface UnifiedWalletState {
  address: string
  isLocked: boolean
  securityLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4'
  vaultUnlocked: boolean
  safeSessionActive: boolean
  paranoidMode: boolean
  lockdownActive: boolean
}

// ═══════════════════════════════════════════════════════════
// 7. EVIDENCE-BASED DECISIONS
// ═══════════════════════════════════════════════════════════

export interface EvidenceBasedDecision {
  decision: 'ALLOW' | 'WARN' | 'REQUIRE_EXTRA_AUTH' | 'BLOCK'
  confidence: number // 0-100
  score: number // 0-100, higher = safer
  evidence: string[]
  engineResults: Array<{
    engineId: string
    score: number
    evidence: string[]
    durationMs: number
  }>
  context: SecurityContext
  timestamp: number
  explanation: string
  /** Audit trail — can be reproduced */
  reproducible: boolean
}

// ═══════════════════════════════════════════════════════════
// 8. LAYER SEPARATION — strict 4-layer architecture
// ═══════════════════════════════════════════════════════════

export const ARCHITECTURE_LAYERS = [
  {
    id: 'ui',
    name: 'UI Layer',
    description: 'Interface do usuário — recebe ações, exibe resultados',
    rules: ['Nunca acessa Engines diretamente', 'Nunca acessa Plugins diretamente', 'Comunica apenas com o Security Kernel'],
  },
  {
    id: 'kernel',
    name: 'Security Kernel',
    description: 'Único orquestrador — conhece apenas a interface SecurityEngine',
    rules: ['Único ponto de decisão', 'Valida compatibilidade via manifests', 'Aplica fail-safe modes'],
  },
  {
    id: 'engines',
    name: 'Security Engines',
    description: '12+ engines independentes — comunicam via Event Bus',
    rules: ['Nenhum engine conhece outro diretamente', 'Comunicação apenas via Event Bus', 'Todos implementam SecurityEngine interface'],
  },
  {
    id: 'plugins',
    name: 'Blockchain Plugins',
    description: 'Cada chain implementa ChainPlugin interface',
    rules: ['Isolados do Kernel', 'Capability Manifest declarado', 'Sandbox por chain'],
  },
] as const

// ═══════════════════════════════════════════════════════════
// 9. SINGLE DECISION FLOW — no alternative paths
// ═══════════════════════════════════════════════════════════

export const DECISION_PIPELINE = [
  'User Action',
  'Security Kernel',
  'Policy Registry',
  'Threat Registry',
  'Trust Registry',
  'Decision Engine',
  'Simulation',
  'User Explanation',
  'Signature',
  'Broadcast',
  'Audit',
  'Monitoring',
] as const

// ═══════════════════════════════════════════════════════════
// 10. v1.0 COMPLETION CRITERIA
// ═══════════════════════════════════════════════════════════

export interface CompletionCriterion {
  id: string
  category: string
  requirement: string
  status: 'done' | 'in_progress' | 'planned'
  detail: string
}

export const V1_COMPLETION_CRITERIA: CompletionCriterion[] = [
  { id: 'interfaces-frozen', category: 'Architecture', requirement: 'Todas as interfaces congeladas', status: 'done', detail: 'SecurityEngine interface definida e congelada' },
  { id: 'conformance-tests', category: 'Testing', requirement: 'Todos os engines com testes de conformidade', status: 'planned', detail: 'Conformance Test Suite pendente' },
  { id: 'registries-versioned', category: 'Architecture', requirement: 'Todos os registries versionados', status: 'done', detail: '7 registries com versionamento' },
  { id: 'tss-tsf-coverage', category: 'Documentation', requirement: 'Cobertura completa do TSS e TSF documentada', status: 'done', detail: 'TSS 80% enforced, TSF 7 domínios' },
  { id: 'audits', category: 'Security', requirement: 'Duas auditorias independentes concluídas', status: 'planned', detail: 'Trail of Bits / Certik pendente' },
  { id: 'pentest', category: 'Security', requirement: 'Testes de invasão (pentest) aprovados', status: 'planned', detail: 'Pentest externo pendente' },
  { id: 'reproducible-builds', category: 'Release', requirement: 'Builds reproduzíveis e assinados', status: 'planned', detail: 'Pipeline de build reproduzível pendente' },
  { id: 'dependency-chain', category: 'Supply Chain', requirement: 'Cadeia de dependências validada', status: 'in_progress', detail: 'npm audit + SBOM pendente' },
  { id: 'vuln-disclosure', category: 'Security', requirement: 'Política formal de divulgação de vulnerabilidades', status: 'planned', detail: 'SECURITY.md pendente' },
  { id: 'bug-bounty', category: 'Security', requirement: 'Programa de bug bounty antes do lançamento público', status: 'planned', detail: 'Immunefi / HackerOne pendente' },
]

// ═══════════════════════════════════════════════════════════
// 11. ENGINE MATURITY STATUS (current snapshot)
// ═══════════════════════════════════════════════════════════

export interface EngineMaturityStatus {
  engineId: string
  name: string
  version: string
  maturity: MaturityLevel
  failSafe: string
}

export const ENGINE_MATURITY_SNAPSHOT: EngineMaturityStatus[] = [
  { engineId: 'key-management', name: 'Key Management', version: '2.0.0', maturity: 'production', failSafe: 'Bloquear completamente a carteira' },
  { engineId: 'network', name: 'Network', version: '1.5.0', maturity: 'production', failSafe: 'Modo degradado usando política definida' },
  { engineId: 'audit', name: 'Audit', version: '1.2.0', maturity: 'production', failSafe: 'Não permitir ações críticas sem registro' },
  { engineId: 'governance', name: 'Governance', version: '1.0.0', maturity: 'production', failSafe: 'Usar último snapshot válido' },
  { engineId: 'simulation', name: 'Simulation', version: '2.0.0', maturity: 'beta', failSafe: 'Bloquear transações que exigem simulação' },
  { engineId: 'threat-intel', name: 'Threat Intelligence', version: '2.3.1', maturity: 'beta', failSafe: 'Permitir apenas com aviso e registrar auditoria' },
  { engineId: 'behavior', name: 'Behavior', version: '1.8.0', maturity: 'beta', failSafe: 'Reduzir para modo padrão' },
  { engineId: 'policy', name: 'Policy', version: '1.4.2', maturity: 'beta', failSafe: 'Aplicar política mais restritiva' },
  { engineId: 'permission', name: 'Permission', version: '1.3.0', maturity: 'beta', failSafe: 'Tratar todas como críticas' },
  { engineId: 'notification', name: 'Notification', version: '1.1.0', maturity: 'beta', failSafe: 'Silenciar — não afeta segurança' },
  { engineId: 'plugin', name: 'Plugin', version: '1.0.0', maturity: 'beta', failSafe: 'Desabilitar chain afetada' },
  { engineId: 'device-trust', name: 'Device Trust', version: '1.0.0', maturity: 'beta', failSafe: 'Reduzir confiança e exigir auth adicional' },
  { engineId: 'recovery', name: 'Recovery', version: '1.0.0', maturity: 'alpha', failSafe: 'Bloquear operações de recuperação' },
  { engineId: 'ai-security', name: 'AI Security', version: '0.9.0', maturity: 'alpha', failSafe: 'Permitir com aviso manual' },
  { engineId: 'signature', name: 'Signature', version: '1.0.0', maturity: 'beta', failSafe: 'Bloquear assinatura' },
  { engineId: 'guardian', name: 'Wallet Guardian', version: '1.0.0', maturity: 'beta', failSafe: 'Alertar mas permitir' },
]

// ═══════════════════════════════════════════════════════════
// 12. FAIL-SAFE MODES TABLE
// ═══════════════════════════════════════════════════════════

export interface FailSafeMode {
  engine: string
  failure: string
  action: string
  blocksCritical: boolean
}

export const FAIL_SAFE_MODES: FailSafeMode[] = [
  { engine: 'Threat Intelligence', failure: 'Feed indisponível', action: 'Permitir apenas com aviso e registrar auditoria', blocksCritical: false },
  { engine: 'Simulation', failure: 'Erro na simulação', action: 'Bloquear transações que exigem simulação', blocksCritical: true },
  { engine: 'Device Trust', failure: 'Indisponível', action: 'Reduzir nível de confiança e exigir autenticação adicional', blocksCritical: false },
  { engine: 'Network', failure: 'Quorum indisponível', action: 'Entrar em modo degradado usando política definida', blocksCritical: false },
  { engine: 'Audit', failure: 'Falha de escrita', action: 'Não permitir ações críticas sem registro', blocksCritical: true },
  { engine: 'Key Management', failure: 'Falha', action: 'Bloquear completamente a carteira', blocksCritical: true },
  { engine: 'Policy', failure: 'Indisponível', action: 'Aplicar política mais restritiva (deny-all)', blocksCritical: true },
  { engine: 'Behavior', failure: 'Indisponível', action: 'Reduzir para modo padrão sem anomalias', blocksCritical: false },
  { engine: 'Permission', failure: 'Indisponível', action: 'Tratar todas as permissões como críticas', blocksCritical: false },
  { engine: 'Recovery', failure: 'Indisponível', action: 'Bloquear operações de recuperação', blocksCritical: true },
  { engine: 'AI Security', failure: 'Indisponível', action: 'Permitir com aviso manual — não afeta decisões críticas', blocksCritical: false },
]
