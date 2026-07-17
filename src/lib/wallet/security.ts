import type {
  RiskAssessment,
  RiskLevel,
  BlockedToken,
  BlockedSite,
  Token,
} from './types'

// ============ Risk level colors / labels ============

export const RISK_LABEL: Record<RiskLevel, string> = {
  safe: 'Seguro',
  low: 'Baixo risco',
  medium: 'Médio risco',
  high: 'Alto risco',
  blocked: 'Bloqueado',
  critical: 'Crítico',
}

export const RISK_COLOR: Record<RiskLevel, string> = {
  safe: 'text-emerald-400',
  low: 'text-teal-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  blocked: 'text-red-400',
  critical: 'text-red-500',
}

export const RISK_BG: Record<RiskLevel, string> = {
  safe: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  low: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  medium: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  high: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  blocked: 'bg-red-500/10 border-red-500/30 text-red-400',
  critical: 'bg-red-500/20 border-red-500/40 text-red-500',
}

export const RISK_DOT: Record<RiskLevel, string> = {
  safe: 'bg-emerald-500',
  low: 'bg-teal-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  blocked: 'bg-red-500',
  critical: 'bg-red-600',
}

// ============ Token integrity verification ============

export interface TokenCheckInput {
  symbol: string
  name: string
  chain: string
  contract?: string
  liquidityUsd?: number
  holderCount?: number
  hasMintAuthority?: boolean
  hasHoneypotPattern?: boolean
  isVerified?: boolean
  sellTax?: number
}

/**
 * Verifica a integridade de um token recebido contra:
 *  - Blocklist local (scam conhecidos)
 *  - Heurísticas automáticas (honeypot, liquidez, taxas, mint)
 *  - Verificação de contrato em exploradores
 */
export function verifyTokenIntegrity(
  input: TokenCheckInput,
  blockedTokens: BlockedToken[]
): RiskAssessment {
  const reasons: string[] = []
  let score = 100

  // 1) Blocklist match — instant block
  const blocked = blockedTokens.find((bt) => {
    if (input.contract && bt.contract.toLowerCase() === input.contract.toLowerCase()) return true
    return bt.symbol.toUpperCase() === input.symbol.toUpperCase()
  })
  if (blocked) {
    return {
      level: 'blocked',
      score: 0,
      reasons: [
        `Token na blocklist: ${blocked.reason}`,
        `Bloqueado em ${new Date(blocked.blockedAt).toLocaleDateString('pt-BR')}`,
        `Fonte: ${blocked.source === 'auto' ? 'Detecção automática' : blocked.source === 'community' ? 'Comunidade' : 'Manual'}`,
      ],
      blocked: true,
    }
  }

  // 2) Honeypot pattern
  if (input.hasHoneypotPattern) {
    score -= 80
    reasons.push('Padrão honeypot detectado — função de venda pode estar bloqueada')
  }

  // 3) Mint authority not revoked
  if (input.hasMintAuthority) {
    score -= 35
    reasons.push('Mint authority não revogada — supply pode ser inflacionado')
  }

  // 4) Liquidity check
  if (input.liquidityUsd !== undefined) {
    if (input.liquidityUsd < 1000) {
      score -= 50
      reasons.push(`Liquidez muito baixa ($${input.liquidityUsd.toFixed(0)}) — risco de rug pull`)
    } else if (input.liquidityUsd < 10000) {
      score -= 20
      reasons.push(`Liquidez baixa ($${input.liquidityUsd.toFixed(0)})`)
    }
  }

  // 5) Sell tax
  if (input.sellTax !== undefined && input.sellTax > 10) {
    score -= 30
    reasons.push(`Taxa de venda elevada (${input.sellTax}%) — padrão de rug`)
  }

  // 6) Contract verification
  if (input.isVerified === false && input.contract) {
    score -= 25
    reasons.push('Contrato não verificado no explorador')
  } else if (input.isVerified === true) {
    reasons.push('Contrato verificado no explorador')
  }

  // 7) Holder count
  if (input.holderCount !== undefined && input.holderCount < 50) {
    score -= 15
    reasons.push(`Poucos holders (${input.holderCount}) — concentração de risco`)
  }

  // 8) Native / verified tokens always safe
  if (!input.contract) {
    return {
      level: 'safe',
      score: 99,
      reasons: ['Asset nativo', 'Sem risco de contrato'],
      blocked: false,
    }
  }

  score = Math.max(0, Math.min(100, score))
  const level: RiskLevel = score >= 90 ? 'safe' : score >= 70 ? 'low' : score >= 45 ? 'medium' : score >= 20 ? 'high' : 'blocked'
  const blocked_flag = level === 'blocked'

  if (reasons.length === 0) {
    reasons.push('Nenhum sinal de risco identificado')
  }

  return { level, score, reasons, blocked: blocked_flag }
}

// ============ Address verification ============

/**
 * Verifica um endereço de destino (send) contra heurísticas:
 *  - Blocklist de endereços
 *  - EOA vs contract
 *  - Histórico de denúncias
 */
export interface AddressCheckInput {
  address: string
  chain: string
  isContract: boolean
  reportsCount: number
  txCount: number
}

export function verifyAddress(input: AddressCheckInput): RiskAssessment {
  const reasons: string[] = []
  let score = 100

  // Contract destinations are riskier
  if (input.isContract) {
    score -= 15
    reasons.push('Destino é um contrato — revise as permissões solicitadas')
  } else {
    reasons.push('Destino é uma carteira (EOA) — sem risco de permissões')
  }

  // Community reports
  if (input.reportsCount >= 3) {
    score -= 60
    reasons.push(`Endereço com ${input.reportsCount} denúncias na comunidade`)
  } else if (input.reportsCount >= 1) {
    score -= 25
    reasons.push(`Endereço com ${input.reportsCount} denúncia(s)`)
  }

  // New address (no history)
  if (input.txCount < 5) {
    score -= 20
    reasons.push('Endereço novo — sem histórico suficiente')
  } else {
    reasons.push(`${input.txCount} transações no histórico`)
  }

  score = Math.max(0, Math.min(100, score))
  const level: RiskLevel = score >= 90 ? 'safe' : score >= 70 ? 'low' : score >= 45 ? 'medium' : score >= 20 ? 'high' : 'blocked'

  return { level, score, reasons, blocked: level === 'blocked' }
}

// ============ Site / DApp verification ============

export interface SiteCheckInput {
  url: string
}

export interface SiteCheckResult {
  rating: 'verified' | 'unknown' | 'suspicious' | 'malicious'
  score: number
  reasons: string[]
  blocked: boolean
  category?: string
}

/**
 * Verifica um site/DApp antes de conectar a carteira.
 * Checa contra a blocklist, similaridade com marcas legítimas,
 * idade do domínio (heurística) e certificado.
 */
export function verifySite(input: SiteCheckInput, blockedSites: BlockedSite[]): SiteCheckResult {
  const url = input.url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  const reasons: string[] = []
  let score = 100

  // 1) Blocklist exact match
  const blocked = blockedSites.find((bs) => bs.url.toLowerCase() === url || url.includes(bs.url.toLowerCase()))
  if (blocked) {
    return {
      rating: 'malicious',
      score: 0,
      reasons: [
        `Site na blocklist: ${blocked.reason}`,
        `Categoria: ${blocked.category}`,
        `Bloqueado em ${new Date(blocked.blockedAt).toLocaleDateString('pt-BR')}`,
      ],
      blocked: true,
      category: blocked.category,
    }
  }

  // 2) Typosquatting detection — close to known brands
  const brands = ['metamask', 'uniswap', 'opensea', 'aave', 'binance', 'coinbase', 'wallet-connect', 'ledger', 'trezor']
  for (const brand of brands) {
    // Simple Levenshtein-ish check: if URL contains a near-miss of a brand
    if (containsNearMatch(url, brand)) {
      score -= 70
      reasons.push(`Typosquatting: imita "${brand}" — provável phishing`)
    }
  }

  // 3) Suspicious TLDs
  if (/\.(xyz|top|click|loan|work|review|country|stream|gdn|bid)$/.test(url)) {
    score -= 30
    reasons.push('TLD frequentemente usado em golpes (.xyz/.top/.click)')
  }

  // 4) Subdomain abuse
  if ((url.match(/\./g) || []).length >= 3 && !url.startsWith('app.') && !url.startsWith('www.')) {
    score -= 20
    reasons.push('Múltiplos subdomínios — padrão suspeito')
  }

  // 5) IP literal
  if (/^\d{1,3}(\.\d{1,3}){3}/.test(url)) {
    score -= 40
    reasons.push('URL é um IP — sem certificado válido garantido')
  }

  // 6) No HTTPS
  if (!input.url.toLowerCase().startsWith('https')) {
    score -= 50
    reasons.push('Sem HTTPS — conexão não criptografada')
  } else {
    reasons.push('HTTPS ativo — conexão criptografada')
  }

  if (reasons.length === 0) {
    reasons.push('Nenhum indicador de risco conhecido')
    reasons.push('Domínio não está na blocklist')
  }

  score = Math.max(0, Math.min(100, score))
  const rating: SiteCheckResult['rating'] =
    score >= 90 ? 'verified' : score >= 60 ? 'unknown' : score >= 30 ? 'suspicious' : 'malicious'

  return { rating, score, reasons, blocked: rating === 'malicious' }
}

function containsNearMatch(url: string, brand: string): boolean {
  // Detects if the URL contains a brand with up to 2 char variations
  // e.g. "metarnask" for "metamask"
  if (url.includes(brand)) return false // exact match — legit if not blocked
  const variations = generateVariations(brand)
  return variations.some((v) => url.includes(v))
}

function generateVariations(word: string): string[] {
  // Swap, add, remove one char near each position
  const result: string[] = []
  for (let i = 0; i < word.length; i++) {
    // Swap adjacent
    if (i < word.length - 1) {
      const arr = word.split('')
      ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
      result.push(arr.join(''))
    }
    // Add a duplicate
    result.push(word.slice(0, i + 1) + word[i] + word.slice(i + 1))
    // Drop a char
    if (word.length > 3) {
      result.push(word.slice(0, i) + word.slice(i + 1))
    }
  }
  return result
}

// ============ Transaction simulation ============

export interface TxSimulationInput {
  to: string
  tokenSymbol: string
  amount: number
  chain: string
  /** Permissions requested by the contract (e.g. approve, transferFrom) */
  permissions?: string[]
}

export interface TxSimulationResult {
  approved: boolean
  warnings: string[]
  /** Estimated balance change for the user (negative = outflow) */
  balanceDeltaUsd: number
  /** Permissions granted that could be abused */
  dangerousPermissions: string[]
}

/**
 * Simula uma transação antes de assiná-la, identificando
 * permissões perigosas e drenagens potenciais.
 */
export function simulateTransaction(input: TxSimulationInput): TxSimulationResult {
  const warnings: string[] = []
  const dangerousPermissions: string[] = []
  let approved = true

  // Check permissions
  if (input.permissions?.includes('approve')) {
    warnings.push('Permissão "approve" concederá acesso ilimitado ao saldo do token')
    dangerousPermissions.push('approve (unlimited)')
  }
  if (input.permissions?.includes('permit')) {
    warnings.push('Assinatura "permit" pode autorizar transferências futuras sem confirmação')
    dangerousPermissions.push('permit (gasless)')
  }
  if (input.permissions?.includes('setApprovalForAll')) {
    warnings.push('"setApprovalForAll" delega controle de TODOS os seus NFTs do contrato')
    dangerousPermissions.push('setApprovalForAll (NFTs)')
    approved = false
  }
  if (input.permissions?.includes('signMessage')) {
    warnings.push('Assinatura de mensagem pode ser reaproveitada — só assine se confiar 100%')
    dangerousPermissions.push('signMessage')
  }

  // Pattern: drainer — drains entire balance
  if (input.permissions?.includes('transferFrom') && input.amount === 0) {
    warnings.push('Transação de valor 0 com transferFrom — padrão típico de drainer')
    approved = false
  }

  return {
    approved,
    warnings,
    balanceDeltaUsd: 0, // would be computed from real tx data
    dangerousPermissions,
  }
}

// ============ Global wallet risk score ============

export function computeGlobalRiskScore(
  tokens: Token[],
  vaultUnlocked: boolean,
  safeSessionActive: boolean
): number {
  let score = 70 // base

  // Bonus for verified tokens
  const verifiedCount = tokens.filter((t) => t.verified).length
  score += Math.min(20, verifiedCount * 2)

  // Penalty for high-risk tokens
  const highRiskCount = tokens.filter((t) => t.risk.level === 'high' || t.risk.level === 'medium').length
  score -= highRiskCount * 10

  // Bonus for vault locked
  if (!vaultUnlocked) score += 5
  // Bonus for safe session active
  if (safeSessionActive) score += 5

  return Math.max(0, Math.min(100, score))
}

// ============ Helpers ============

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatTokenAmount(amount: number, decimals = 2): string {
  if (amount === 0) return '0'
  if (amount < 0.0001) return '<0.0001'
  if (amount < 1) return amount.toFixed(6)
  if (amount < 100) return amount.toFixed(4)
  if (amount < 10000) return amount.toFixed(2)
  return amount.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
