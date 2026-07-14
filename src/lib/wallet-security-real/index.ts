// ============ wallet-security-real: GoPlus Security API integration ============
// Public API: https://api.gopluslabs.io/api/v1/token_security/{chain_id}?contract_addresses={addr}
// No auth required for basic queries.

export interface GoPlusTokenResult {
  token_name: string
  token_symbol: string
  total_supply: string
  holder_count: number
  /** "1" if honeypot detected */
  is_honeypot: string
  /** "1" if token is open source (verified) */
  is_open_source: string
  /** "1" if mintable (mint authority not renounced) */
  is_mintable: string
  /** "1" if proxy pattern */
  is_proxy: string
  /** "1" if owner can change balance */
  can_take_back_ownership: string
  /** "1" if owner hidden */
  hidden_owner: string
  /** "1" if selfdestruct possible */
  selfdestruct: string
  /** "1" if external call possible */
  external_call: string
  /** "1" if cannot sell all */
  cannot_sell_all: string
  /** "1" if cannot buy */
  cannot_buy: string
  /** personal slippage modifiable */
  personal_slippage_modifiable: string
  /** trading cooldown */
  trading_cooldown: string
  /** transfer pause */
  transfer_pausable: string
  /** "1" if blacklisted */
  is_blacklisted: string
  /** "1" if whitelisted */
  is_whitelisted: string
  /** anti-whale mechanism */
  is_anti_whale: string
  /** "1" if anti-whale modifiable */
  anti_whale_modifiable: string
  /** slippage modifiable */
  slippage_modifiable: string
  /** "1" if tax modifiable */
  is_taxable: string
  /** tax rate info */
  buy_tax: string
  sell_tax: string
  /** "1" if owner can change tax */
  is_tax_modifiable: string
  /** "1" if ownership renounced */
  is_owner_address: string
  /** "1" if creator address matches owner */
  is_in_dex: string
  /** liquidity pools */
  liquidity: string
  /** LP holders */
  lp_holder_count: number
  /** LP total supply */
  lp_total_supply: string
  /** LP locked info */
  lp_holders: Array<{ address: string; amount: string; locked: boolean }>
  /** top holders */
  holders: Array<{ address: string; amount: string }>
}

export interface GoPlusResponse {
  code: number
  message: string
  result: Record<string, GoPlusTokenResult> | null
}

// GoPlus chain IDs (different from EVM chain IDs)
const GOPLUS_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  avalanche: 43114,
  base: 8453,
}

const GOPLUS_API = 'https://api.gopluslabs.io/api/v1'

/**
 * Query the GoPlus Security API for a token's risk analysis.
 * Routes through our Next.js API proxy to avoid browser CORS restrictions.
 * Returns null if the chain isn't supported or the request fails.
 */
export async function queryTokenSecurity(
  chainId: string,
  contractAddress: string
): Promise<GoPlusTokenResult | null> {
  const goplusChain = GOPLUS_CHAIN_IDS[chainId]
  if (!goplusChain) return null
  const addr = contractAddress.toLowerCase()
  const url = `/api/goplus/token?chainId=${goplusChain}&address=${addr}`
  try {
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) return null
    const json = (await res.json()) as GoPlusResponse | { error: string }
    if ('error' in json) return null
    // GoPlus returns code:1 for success (not 0)
    if (!json.result) return null
    return json.result[addr] ?? null
  } catch {
    return null
  }
}

/**
 * Query GoPlus for malicious site detection.
 * Uses the address_security endpoint as proxy: not directly supported
 * but the URL can be checked via their phishing site API if available.
 * Falls back to null (caller uses local heuristics).
 */
export async function queryMaliciousSite(url: string): Promise<{
  phishing: boolean
  malware: boolean
  source: string
} | null> {
  // GoPlus has a malicious site API: GET /api/v1/site_security?url={url}
  // It's not always reliable, so we treat as best-effort.
  try {
    const u = encodeURIComponent(url)
    const res = await fetch(`${GOPLUS_API}/site_security?url=${u}`, { method: 'GET' })
    if (!res.ok) return null
    const json = (await res.json()) as { code: number; result: Record<string, { phishing: string; malware: string }> | null }
    if (json.code !== 0 || !json.result) return null
    const entry = json.result[url] ?? Object.values(json.result)[0]
    if (!entry) return null
    return {
      phishing: entry.phishing === '1',
      malware: entry.malware === '1',
      source: 'GoPlus',
    }
  } catch {
    return null
  }
}

/**
 * Query GoPlus address security (for send destinations).
 * Routes through our Next.js API proxy to avoid browser CORS.
 */
export async function queryAddressSecurity(
  chainId: string,
  address: string
): Promise<{
  phishing_count: number
  blackmail_count: number
  fake_token_count: number
  honeypot_count: number
} | null> {
  const goplusChain = GOPLUS_CHAIN_IDS[chainId]
  if (!goplusChain) return null
  const addr = address.toLowerCase()
  try {
    const res = await fetch(`/api/goplus/address?chainId=${goplusChain}&address=${addr}`)
    if (!res.ok) return null
    const json = (await res.json()) as { code: number; result: Record<string, string> | null } | { error: string }
    if ('error' in json) return null
    if (!json.result) return null
    const r = json.result
    return {
      phishing_count: parseInt(r['Phishing Count'] ?? '0', 10),
      blackmail_count: parseInt(r['Blackmail Count'] ?? '0', 10),
      fake_token_count: parseInt(r['Fake Token Count'] ?? '0', 10),
      honeypot_count: parseInt(r['Honeypot Count'] ?? '0', 10),
    }
  } catch {
    return null
  }
}

/**
 * Translate GoPlus result into our internal RiskAssessment.
 */
export function goplusToRiskAssessment(r: GoPlusTokenResult): {
  level: 'safe' | 'low' | 'medium' | 'high' | 'blocked'
  score: number
  reasons: string[]
  blocked: boolean
} {
  const reasons: string[] = []
  let score = 100

  if (r.is_honeypot === '1') {
    score = 0
    reasons.push('HONEYPOT DETECTADO — venda bloqueada pelo contrato')
    return { level: 'blocked', score: 0, reasons, blocked: true }
  }
  if (r.cannot_sell_all === '1') {
    score -= 60
    reasons.push('Não é possível vender todo o saldo')
  }
  if (r.cannot_buy === '1') {
    score -= 60
    reasons.push('Não é possível comprar este token')
  }
  if (r.is_open_source !== '1') {
    score -= 30
    reasons.push('Contrato NÃO verificado — source code fechado')
  } else {
    reasons.push('Contrato verificado (open source)')
  }
  if (r.is_mintable === '1') {
    score -= 35
    reasons.push('Mint authority ativa — supply pode ser inflacionado')
  }
  if (r.hidden_owner === '1') {
    score -= 30
    reasons.push('Owner oculto — risco de manipulação')
  }
  if (r.is_proxy === '1') {
    score -= 25
    reasons.push('Contrato proxy — lógica pode ser alterada')
  }
  if (r.selfdestruct === '1') {
    score = 0
    reasons.push('SELFDESTRUCT habilitado — contrato pode ser destruído')
    return { level: 'blocked', score: 0, reasons, blocked: true }
  }
  if (r.transfer_pausable === '1') {
    score -= 20
    reasons.push('Transferências podem ser pausadas pelo owner')
  }
  if (r.is_blacklisted === '1') {
    score -= 40
    reasons.push('Mecanismo de blacklist no contrato')
  }
  if (r.is_owner_address !== '1') {
    score -= 10
    reasons.push('Ownership não renunciada')
  } else {
    reasons.push('Ownership renunciada')
  }
  // Tax analysis
  const sellTax = parseFloat(r.sell_tax ?? '0')
  const buyTax = parseFloat(r.buy_tax ?? '0')
  if (sellTax > 10) {
    score -= 40
    reasons.push(`Taxa de venda altíssima: ${sellTax.toFixed(1)}%`)
  } else if (sellTax > 5) {
    score -= 20
    reasons.push(`Taxa de venda elevada: ${sellTax.toFixed(1)}%`)
  } else if (sellTax > 0) {
    reasons.push(`Taxa de venda: ${sellTax.toFixed(1)}%`)
  }
  if (buyTax > 10) {
    score -= 30
    reasons.push(`Taxa de compra altíssima: ${buyTax.toFixed(1)}%`)
  }
  // Liquidity — only penalize if we have actual LP data (some tokens like stablecoins
  // don't have DEX liquidity reported by GoPlus but are still legitimate)
  const liq = parseFloat(r.liquidity ?? '0')
  if (liq === 0 && r.holder_count > 100000 && r.is_open_source === '1') {
    // Likely a major token (USDT, USDC) without DEX LP — don't penalize
    reasons.push('Liquidez DEX não reportada (token majoritariamente CEX)')
  } else if (liq < 10000 && liq > 0) {
    score -= 50
    reasons.push(`Liquidez muito baixa: $${liq.toFixed(0)}`)
  } else if (liq < 100000 && liq > 0) {
    score -= 20
    reasons.push(`Liquidez baixa: $${liq.toFixed(0)}`)
  } else if (liq >= 100000) {
    reasons.push(`Liquidez saudável: $${liq.toLocaleString('en-US', { maximumFractionDigits: 0 })}`)
  }
  // Holder count
  if (r.holder_count < 100) {
    score -= 25
    reasons.push(`Poucos holders: ${r.holder_count}`)
  } else if (r.holder_count < 1000) {
    score -= 10
    reasons.push(`Holders limitados: ${r.holder_count}`)
  } else {
    reasons.push(`${r.holder_count.toLocaleString('en-US')} holders`)
  }
  // LP lock
  const lpLocked = r.lp_holders?.some((h) => h.locked)
  if (lpLocked) {
    reasons.push('Liquidez bloqueada (LP lock ativo)')
  } else {
    score -= 20
    reasons.push('Liquidez NÃO bloqueada — risco de rug pull')
  }

  if (reasons.length === 0) reasons.push('Nenhum sinal de risco identificado')
  score = Math.max(0, Math.min(100, Math.round(score)))

  // Override: well-known legitimate tokens (verified + huge holder base) never get blocked
  // even if they have centralization features like pausable / blacklist (USDT, USDC, etc.)
  const isWellKnownLegit =
    r.is_open_source === '1' &&
    r.holder_count > 100000 &&
    r.is_honeypot !== '1' &&
    r.cannot_sell_all !== '1' &&
    sellTax < 5 &&
    buyTax < 5
  if (isWellKnownLegit && score < 60) {
    score = 75 // Bump to "low risk" — known token with centralization tradeoffs
    reasons.push('Token amplamente adotado (holder count > 100k) com source verified')
  }

  const level: 'safe' | 'low' | 'medium' | 'high' | 'blocked' =
    score >= 90 ? 'safe' : score >= 70 ? 'low' : score >= 45 ? 'medium' : score >= 20 ? 'high' : 'blocked'
  return { level, score, reasons, blocked: level === 'blocked' }
}
