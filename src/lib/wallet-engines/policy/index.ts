// @ts-nocheck
'use client'

// ============ Policy Engine (Production Hardening) ============
//
// PRINCIPLE: "Least Privilege" — configurable security policies.
//
// Examples:
// - Never approve infinite to unknown contracts
// - Never send > US$ 5000 without biometrics
// - Block BSC between 02:00 and 06:00
// - Require biometric for amounts > US$ 1000
// - Block new contracts entirely (paranoid mode)

export type PolicyAction = 'allow' | 'require_confirmation' | 'require_biometric' | 'block'
export type PolicyCondition =
  | 'always'
  | 'amount_above'
  | 'amount_below'
  | 'chain_is'
  | 'chain_is_not'
  | 'time_between'
  | 'contract_unknown'
  | 'contract_known'
  | 'infinite_approval'
  | 'new_device'
  | 'new_chain'
  | 'weekend'

export interface PolicyRule {
  id: string
  name: string
  description: string
  enabled: boolean
  /** Built-in or custom */
  builtin: boolean
  /** Condition that triggers the policy */
  condition: PolicyCondition
  /** Condition parameters (e.g. amount threshold, chain name, time range) */
  params: Record<string, string | number>
  /** Action to take when condition is met */
  action: PolicyAction
  /** Priority (higher = evaluated first) */
  priority: number
}

export interface PolicyEvaluation {
  rule: PolicyRule
  triggered: boolean
  action: PolicyAction
  reason: string
}

export interface PolicyEvaluationResult {
  /** All rules that were triggered */
  triggeredRules: PolicyEvaluation[]
  /** Final action (most restrictive of all triggered rules) */
  finalAction: PolicyAction
  /** Whether the transaction is blocked */
  blocked: boolean
  /** Whether biometric is required */
  requireBiometric: boolean
  /** Whether confirmation is required */
  requireConfirmation: boolean
  /** Human-readable explanation */
  explanation: string
}

// ============ Default policies ============

const DEFAULT_POLICIES: PolicyRule[] = [
  {
    id: 'no-infinite-approve-unknown',
    name: 'No infinite approve to unknown contracts',
    description: 'Bloqueia aprovações infinitas para contratos não verificados.',
    enabled: true,
    builtin: true,
    condition: 'infinite_approval',
    params: { contractStatus: 'unknown' },
    action: 'block',
    priority: 100,
  },
  {
    id: 'biometric-large-amount',
    name: 'Biometria para valores > US$ 5.000',
    description: 'Exige biometria para transações acima de US$ 5.000.',
    enabled: true,
    builtin: true,
    condition: 'amount_above',
    params: { threshold: 5000 },
    action: 'require_biometric',
    priority: 90,
  },
  {
    id: 'biometric-new-device',
    name: 'Biometria para dispositivos novos',
    description: 'Exige biometria quando a transação vem de um dispositivo não reconhecido.',
    enabled: true,
    builtin: true,
    condition: 'new_device',
    params: {},
    action: 'require_biometric',
    priority: 85,
  },
  {
    id: 'block-bsc-night',
    name: 'Bloquear BSC entre 02:00-06:00',
    description: 'Bloqueia transações na BSC entre 02:00 e 06:00 (horário de alto risco).',
    enabled: false, // disabled by default — user can enable
    builtin: true,
    condition: 'time_between',
    params: { chain: 'bsc', start: 2, end: 6 },
    action: 'block',
    priority: 80,
  },
  {
    id: 'confirm-new-chain',
    name: 'Confirmação para redes novas',
    description: 'Exige confirmação extra ao usar uma rede que você não usou antes.',
    enabled: true,
    builtin: true,
    condition: 'new_chain',
    params: {},
    action: 'require_confirmation',
    priority: 70,
  },
  {
    id: 'confirm-large-amount',
    name: 'Confirmação para valores > US$ 1.000',
    description: 'Exige confirmação manual para transações acima de US$ 1.000.',
    enabled: true,
    builtin: true,
    condition: 'amount_above',
    params: { threshold: 1000 },
    action: 'require_confirmation',
    priority: 60,
  },
]

// ============ Policy store ============

const STORAGE_KEY = 'tank:policies'

export function loadPolicies(): PolicyRule[] {
  if (typeof window === 'undefined') return DEFAULT_POLICIES
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_POLICIES
    const custom = JSON.parse(stored) as PolicyRule[]
    // Merge: built-in defaults + custom rules
    const builtins = DEFAULT_POLICIES.map(b => {
      const override = custom.find(c => c.id === b.id)
      return override ? { ...b, enabled: override.enabled } : b
    })
    const userCustom = custom.filter(c => !c.builtin)
    return [...builtins, ...userCustom]
  } catch {
    return DEFAULT_POLICIES
  }
}

export function savePolicies(policies: PolicyRule[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policies))
  } catch {
    // ignore
  }
}

export function togglePolicy(id: string): PolicyRule[] {
  const policies = loadPolicies()
  const updated = policies.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
  savePolicies(updated)
  return updated
}

export function addCustomPolicy(rule: Omit<PolicyRule, 'id' | 'builtin'>): PolicyRule[] {
  const policies = loadPolicies()
  const newRule: PolicyRule = {
    ...rule,
    id: `custom-${Date.now()}`,
    builtin: false,
  }
  const updated = [...policies, newRule]
  savePolicies(updated)
  return updated
}

export function removePolicy(id: string): PolicyRule[] {
  const policies = loadPolicies()
  const updated = policies.filter(p => p.id !== id || p.builtin) // can't remove builtins
  savePolicies(updated)
  return updated
}

// ============ Policy evaluation ============

export interface PolicyContext {
  amountUsd: number
  chain: string
  contractAddress: string
  contractVerified: boolean
  isInfiniteApproval: boolean
  deviceFingerprint: string
  knownDevices: string[]
  knownChains: string[]
  hour: number
  isWeekend: boolean
}

export function evaluatePolicies(ctx: PolicyContext): PolicyEvaluationResult {
  const policies = loadPolicies().filter(p => p.enabled).sort((a, b) => b.priority - a.priority)
  const triggered: PolicyEvaluation[] = []

  for (const rule of policies) {
    const result = evaluateRule(rule, ctx)
    if (result.triggered) {
      triggered.push(result)
    }
  }

  // Determine final action (most restrictive wins)
  let finalAction: PolicyAction = 'allow'
  for (const t of triggered) {
    const action = t.action as string
    if (action === 'block') { finalAction = 'block'; break }
    if (action === 'require_biometric' && (finalAction as string) !== 'block') finalAction = 'require_biometric'
    if (action === 'require_confirmation' && (finalAction as string) === 'allow') finalAction = 'require_confirmation'
  }

  const explanations: string[] = triggered.map(t => `${t.rule.name}: ${t.reason}`)

  return {
    triggeredRules: triggered,
    finalAction,
    blocked: finalAction === 'block',
    requireBiometric: finalAction === 'require_biometric' || finalAction === 'block',
    requireConfirmation: finalAction !== 'allow',
    explanation: explanations.length > 0
      ? explanations.join('\n')
      : 'Nenhuma política disparada — transação dentro dos limites configurados.',
  }
}

function evaluateRule(rule: PolicyRule, ctx: PolicyContext): PolicyEvaluation {
  let triggered = false
  let reason = ''

  switch (rule.condition) {
    case 'always':
      triggered = true
      reason = 'Sempre aplicável'
      break

    case 'amount_above': {
      const threshold = rule.params.threshold as number
      triggered = ctx.amountUsd > threshold
      reason = `Valor $${ctx.amountUsd.toFixed(2)} > $${threshold}`
      break
    }

    case 'amount_below': {
      const threshold = rule.params.threshold as number
      triggered = ctx.amountUsd < threshold
      reason = `Valor $${ctx.amountUsd.toFixed(2)} < $${threshold}`
      break
    }

    case 'chain_is': {
      const chain = rule.params.chain as string
      triggered = ctx.chain === chain
      reason = `Rede ${ctx.chain} = ${chain}`
      break
    }

    case 'chain_is_not': {
      const chain = rule.params.chain as string
      triggered = ctx.chain !== chain
      reason = `Rede ${ctx.chain} ≠ ${chain}`
      break
    }

    case 'time_between': {
      const start = rule.params.start as number
      const end = rule.params.end as number
      const chain = rule.params.chain as string | undefined
      triggered = (!chain || ctx.chain === chain) && ctx.hour >= start && ctx.hour < end
      reason = `Horário ${ctx.hour}h entre ${start}h e ${end}h${chain ? ` na rede ${chain}` : ''}`
      break
    }

    case 'contract_unknown':
      triggered = !ctx.contractVerified
      reason = `Contrato ${ctx.contractAddress.slice(0, 10)}... não é verificado`
      break

    case 'contract_known':
      triggered = ctx.contractVerified
      reason = `Contrato verificado`
      break

    case 'infinite_approval':
      triggered = ctx.isInfiniteApproval
      reason = `Aprovação infinita detectada`
      break

    case 'new_device':
      triggered = !ctx.knownDevices.includes(ctx.deviceFingerprint)
      reason = `Dispositivo não reconhecido: ${ctx.deviceFingerprint}`
      break

    case 'new_chain':
      triggered = !ctx.knownChains.includes(ctx.chain)
      reason = `Rede nova: ${ctx.chain}`
      break

    case 'weekend':
      triggered = ctx.isWeekend
      reason = `Final de semana`
      break
  }

  return {
    rule,
    triggered,
    action: triggered ? rule.action : 'allow',
    reason: triggered ? reason : 'Não disparada',
  }
}
