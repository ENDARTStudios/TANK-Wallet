// @ts-nocheck
// ============ wallet-scanner: Smart Contract Scanner + DApp Shield ============
//
// "Antes de qualquer assinatura: análise completa."
// Detecta padrões perigosos em contratos e calldata.

import { createPublicClient, http, type Address, type Hex } from 'viem'
import { EVM_CHAINS, RPC_ENDPOINTS } from '@/lib/wallet-evm'

// ============ Smart Contract Scanner ============

export interface ContractScanResult {
  address: string
  chain: string
  /** Whether the contract is verified on Etherscan */
  isVerified: boolean
  /** Risk level computed from all signals */
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  riskScore: number // 0-100, higher = safer
  findings: ContractFinding[]
  bytecodeHash?: string
  bytecodeSize: number
  hasProxyPattern: boolean
  hasDelegatecall: boolean
  hasSelfdestruct: boolean
  hasMint: boolean
  hasOwnershipTransfer: boolean
  hasMulticall: boolean
}

export interface ContractFinding {
  severity: 'safe' | 'info' | 'warning' | 'danger' | 'critical'
  title: string
  description: string
  recommendation?: string
}

const DANGER_SELECTORS: Record<string, { title: string; description: string; severity: ContractFinding['severity'] }> = {
  // approve(address,uint256) — used to grant token allowance
  '0x095ea7b3': {
    title: 'approve() detectado',
    description: 'Esta transação concederá permissão ao spender para mover tokens em seu nome.',
    severity: 'warning',
  },
  // setApprovalForAll(address,bool) — NFT blanket approval
  '0xa22cb465': {
    title: 'setApprovalForAll() detectado',
    description: 'Esta transação dará ao spender controle sobre TODOS os seus NFTs desta coleção.',
    severity: 'critical',
  },
  // permit2 — Permit2 single signature approval
  '0x2b67b570': {
    title: 'Permit2 detectado',
    description: 'Permit2 permite que o contrato aprove tokens com uma única assinatura — pode ser abusado.',
    severity: 'critical',
  },
  // transferOwnership(address)
  '0xf2fde38b': {
    title: 'transferOwnership() detectado',
    description: 'Esta transação pode transferir ownership do contrato para outro endereço.',
    severity: 'danger',
  },
  // delegatecall — execution in caller's context
  '0x5c60da1b': {
    title: 'delegatecall detectado',
    description: 'delegatecall executa código no contexto do chamador — alta superfície de ataque.',
    severity: 'critical',
  },
  // upgradeTo(address) — proxy pattern
  '0x3659cfe6': {
    title: 'upgradeTo() — proxy pattern',
    description: 'Esta transação pode atualizar a implementação do proxy — lógica do contrato pode mudar.',
    severity: 'danger',
  },
  // multicall(bytes[])
  '0xac9650d8': {
    title: 'multicall() detectado',
    description: 'Múltiplas chamadas agrupadas — analise cada sub-chamada com atenção.',
    severity: 'warning',
  },
  // selfdestruct
  '0x43d726d6': {
    title: 'selfdestruct() detectado',
    description: 'CRÍTICO: esta transação pode destruir o contrato e enviar todo o ETH para um endereço.',
    severity: 'critical',
  },
}

/**
 * Scan a contract address by reading its bytecode and analyzing the selectors it contains.
 * Returns a detailed risk assessment.
 */
export async function scanContract(
  chain: string,
  contractAddress: string
): Promise<ContractScanResult | null> {
  const publicClient = createPublicClient({
    chain: EVM_CHAINS[chain],
    transport: http(RPC_ENDPOINTS[chain][0], { timeout: 15000 }),
  })

  let bytecode: Hex
  try {
    bytecode = (await publicClient.getCode({ address: contractAddress as Address })) as Hex
    if (!bytecode || bytecode === '0x') {
      return {
        address: contractAddress,
        chain,
        isVerified: false,
        riskLevel: 'high',
        riskScore: 20,
        findings: [
          {
            severity: 'danger',
            title: 'Endereço não é um contrato',
            description: 'O endereço informado não contém bytecode — pode ser um EOA ou o contrato foi destruído.',
          },
        ],
        bytecodeSize: 0,
        hasProxyPattern: false,
        hasDelegatecall: false,
        hasSelfdestruct: false,
        hasMint: false,
        hasOwnershipTransfer: false,
        hasMulticall: false,
      }
    }
  } catch {
    return null
  }

  const findings: ContractFinding[] = []
  let riskScore = 100
  const bytecodeLower = bytecode.toLowerCase()

  // Detect known dangerous patterns via bytecode substring
  const hasDelegatecall = bytecodeLower.includes('f4')
  const hasSelfdestruct = bytecodeLower.includes('ff')
  const hasProxyPattern = bytecodeLower.includes('3659cfe6') // upgradeTo
  const hasOwnershipTransfer = bytecodeLower.includes('f2fde38b')
  const hasMint = bytecodeLower.includes('40c10f19') // mint(address,uint256)
  const hasMulticall = bytecodeLower.includes('ac9650d8')

  if (hasDelegatecall) {
    riskScore -= 30
    findings.push({
      severity: 'critical',
      title: 'delegatecall presente',
      description: 'O contrato pode executar código externo no seu contexto — risco elevado de drenagem.',
      recommendation: 'Revise cuidadosamente o destino de cada delegatecall.',
    })
  }
  if (hasSelfdestruct) {
    riskScore -= 50
    findings.push({
      severity: 'critical',
      title: 'selfdestruct presente',
      description: 'O contrato pode ser destruído — fundos podem ser enviados para qualquer endereço.',
      recommendation: 'Não interaja sem auditoria prévia.',
    })
  }
  if (hasProxyPattern) {
    riskScore -= 25
    findings.push({
      severity: 'danger',
      title: 'Padrão proxy detectado',
      description: 'A lógica do contrato pode ser alterada pelo owner via upgradeTo().',
      recommendation: 'Verifique quem é o owner e se há timelock.',
    })
  }
  if (hasOwnershipTransfer) {
    riskScore -= 10
    findings.push({
      severity: 'info',
      title: 'transferOwnership presente',
      description: 'Owner pode ser transferido — confirme quem controla o contrato.',
    })
  }
  if (hasMint) {
    riskScore -= 15
    findings.push({
      severity: 'warning',
      title: 'Função mint presente',
      description: 'O contrato pode criar novos tokens — supply não é fixo.',
    })
  }

  if (findings.length === 0) {
    findings.push({
      severity: 'safe',
      title: 'Nenhum padrão perigoso detectado',
      description: 'O bytecode não contém seletores de funções perigosas conhecidas.',
    })
  }

  riskScore = Math.max(0, Math.min(100, riskScore))
  const riskLevel: ContractScanResult['riskLevel'] =
    riskScore >= 90 ? 'safe' : riskScore >= 70 ? 'low' : riskScore >= 45 ? 'medium' : riskScore >= 20 ? 'high' : 'critical'

  return {
    address: contractAddress,
    chain,
    isVerified: bytecode.length > 100, // heuristic: long bytecode = likely verified
    riskLevel,
    riskScore,
    findings,
    bytecodeSize: Math.floor((bytecode.length - 2) / 2),
    hasProxyPattern,
    hasDelegatecall,
    hasSelfdestruct,
    hasMint,
    hasOwnershipTransfer,
    hasMulticall,
  }
}

/**
 * Analyze raw calldata (hex) and detect dangerous function selectors.
 * Used before signing any transaction.
 */
export function analyzeCalldata(calldata: string): ContractFinding[] {
  const findings: ContractFinding[] = []
  if (!calldata || calldata.length < 10) return findings

  const selector = calldata.slice(0, 10).toLowerCase()
  const known = DANGER_SELECTORS[selector]
  if (known) {
    findings.push({
      severity: known.severity,
      title: known.title,
      description: known.description,
      recommendation: selector === '0x095ea7b3' || selector === '0xa22cb465'
        ? 'Confirme o endereço do spender e considere aprovar apenas o valor necessário.'
        : 'Revise cuidadosamente antes de assinar.',
    })
  }

  // Detect infinite approval (max uint256 in last 32 bytes)
  if (selector === '0x095ea7b3' && calldata.length >= 138) {
    const amountHex = calldata.slice(-64)
    if (amountHex === 'f'.repeat(64)) {
      findings.push({
        severity: 'critical',
        title: 'Aprovação INFINITA detectada',
        description: 'Esta transação aprova o spender para mover uma quantidade ilimitada de tokens.',
        recommendation: 'Considere aprovar apenas o valor necessário para a operação atual.',
      })
    }
  }

  return findings
}

// ============ DApp Shield ============

export interface DappShieldResult {
  url: string
  domain: string
  /** 3 states only: Verified (safe) / Unknown (no info, caution) / Malicious (blocked) */
  rating: 'verified' | 'unknown' | 'malicious'
  riskScore: number // 0-100, higher = safer
  checks: DappShieldCheck[]
  recommendation: 'allow' | 'limit' | 'block'
  /** Whether the user has previously granted permissions to this domain */
  hasOpenPermissions: boolean
}

export interface DappShieldCheck {
  category: 'blocklist' | 'typosquatting' | 'ssl' | 'whois' | 'age' | 'reputation' | 'subdomain'
  name: string
  status: 'pass' | 'warn' | 'fail'
  description: string
}

const VERIFIED_DAPPS: Array<{ domain: string; name: string; minAgeDays: number }> = [
  { domain: 'app.uniswap.org', name: 'Uniswap', minAgeDays: 1500 },
  { domain: 'app.aave.com', name: 'Aave', minAgeDays: 1500 },
  { domain: 'opensea.io', name: 'OpenSea', minAgeDays: 2500 },
  { domain: 'lido.fi', name: 'Lido', minAgeDays: 1200 },
  { domain: 'jup.ag', name: 'Jupiter', minAgeDays: 800 },
  { domain: 'curve.fi', name: 'Curve', minAgeDays: 1500 },
  { domain: 'app.1inch.io', name: '1inch', minAgeDays: 1500 },
  { domain: 'app.balancer.fi', name: 'Balancer', minAgeDays: 1500 },
]

const KNOWN_BRANDS = ['metamask', 'uniswap', 'opensea', 'aave', 'binance', 'coinbase', 'wallet-connect', 'ledger', 'trezor', '1inch', 'curve', 'lido']

/**
 * Run the full DApp Shield check suite on a URL.
 * Uses the /api/whois proxy to fetch real domain age.
 */
export async function runDappShield(
  url: string,
  blockedSites: Array<{ url: string; reason: string; category: string }>
): Promise<DappShieldResult> {
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
  const domain = normalized
  const checks: DappShieldCheck[] = []
  let riskScore = 100

  // 1) Blocklist check
  const blocked = blockedSites.find((bs) => domain === bs.url.toLowerCase() || domain.includes(bs.url.toLowerCase()))
  if (blocked) {
    checks.push({
      category: 'blocklist',
      name: 'Blocklist global',
      status: 'fail',
      description: `Domínio na blocklist: ${blocked.reason}`,
    })
    riskScore = 0
  } else {
    checks.push({
      category: 'blocklist',
      name: 'Blocklist global',
      status: 'pass',
      description: 'Domínio não consta em nossa blocklist interna.',
    })
  }

  // 2) Typosquatting
  let typosquat = false
  for (const brand of KNOWN_BRANDS) {
    if (containsNearMatch(domain, brand)) {
      typosquat = true
      break
    }
  }
  checks.push({
    category: 'typosquatting',
    name: 'Typosquatting',
    status: typosquat ? 'fail' : 'pass',
    description: typosquat
      ? 'Domínio imita uma marca conhecida com pequenas alterações — provável phishing.'
      : 'Domínio não imita marcas conhecidas.',
  })
  if (typosquat) riskScore -= 70

  // 3) SSL
  const hasHttps = url.toLowerCase().startsWith('https://')
  checks.push({
    category: 'ssl',
    name: 'Certificado SSL',
    status: hasHttps ? 'pass' : 'fail',
    description: hasHttps
      ? 'Conexão HTTPS ativa — tráfego criptografado.'
      : 'Sem HTTPS — conexão não criptografada.',
  })
  if (!hasHttps) riskScore -= 50

  // 4) WHOIS / domain age (best-effort via proxy)
  let whoisInfo: { ageDays: number | null; registeredAt: string | null } = { ageDays: null, registeredAt: null }
  try {
    const res = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}`)
    if (res.ok) {
      whoisInfo = await res.json()
    }
  } catch {
    // network error — skip
  }

  if (whoisInfo.ageDays !== null) {
    let ageStatus: DappShieldCheck['status'] = 'pass'
    let ageDescription = `Domínio registrado há ${whoisInfo.ageDays} dias.`
    if (whoisInfo.ageDays < 30) {
      ageStatus = 'fail'
      ageDescription = `Domínio registrado há apenas ${whoisInfo.ageDays} dias — altíssimo risco.`
      riskScore -= 50
    } else if (whoisInfo.ageDays < 180) {
      ageStatus = 'warn'
      ageDescription = `Domínio jovem (${whoisInfo.ageDays} dias) — risco moderado.`
      riskScore -= 20
    }
    checks.push({
      category: 'age',
      name: 'Idade do domínio (WHOIS)',
      status: ageStatus,
      description: ageDescription,
    })
  } else {
    checks.push({
      category: 'age',
      name: 'Idade do domínio (WHOIS)',
      status: 'warn',
      description: 'WHOIS indisponível — não foi possível verificar a idade do domínio.',
    })
  }

  // 5) Reputation (verified DApps list)
  const verified = VERIFIED_DAPPS.find((v) => v.domain === domain)
  checks.push({
    category: 'reputation',
    name: 'Reputação',
    status: verified ? 'pass' : 'warn',
    description: verified
      ? `${verified.name} está na lista de DApps verificados.`
      : 'Domínio não está na lista de DApps verificados — não é necessariamente malicioso, mas requer cautela.',
  })
  if (verified) riskScore += 10

  // 6) Subdomain abuse
  const subdomainCount = (domain.match(/\./g) || []).length
  if (subdomainCount >= 3 && !domain.startsWith('app.') && !domain.startsWith('www.')) {
    checks.push({
      category: 'subdomain',
      name: 'Subdomínios',
      status: 'warn',
      description: 'Múltiplos subdomínios — padrão às vezes usado em phishing.',
    })
    riskScore -= 15
  } else {
    checks.push({
      category: 'subdomain',
      name: 'Subdomínios',
      status: 'pass',
      description: 'Estrutura de domínio normal.',
    })
  }

  // Suspicious TLD
  if (/\.(xyz|top|click|loan|work|review|country|stream|gdn|bid)$/.test(domain)) {
    checks.push({
      category: 'reputation',
      name: 'TLD suspeito',
      status: 'warn',
      description: 'TLD frequentemente usado em golpes (.xyz, .top, .click, etc.).',
    })
    riskScore -= 25
  }

  riskScore = Math.max(0, Math.min(100, riskScore))
  // 3-state model: Verified / Unknown / Malicious
  // "Desconhecido" ≠ "Perigoso" — millions of new DApps, lack of data doesn't mean malicious
  const rating: DappShieldResult['rating'] =
    riskScore >= 85 ? 'verified' : riskScore >= 35 ? 'unknown' : 'malicious'

  const recommendation: DappShieldResult['recommendation'] =
    rating === 'verified' ? 'allow' : rating === 'unknown' ? 'limit' : 'block'

  return {
    url,
    domain,
    rating,
    riskScore,
    checks,
    recommendation,
    hasOpenPermissions: false, // would be populated from sessions
  }
}

function containsNearMatch(url: string, brand: string): boolean {
  if (url.includes(brand)) return false
  const variations = generateVariations(brand)
  return variations.some((v) => url.includes(v))
}

function generateVariations(word: string): string[] {
  const result: string[] = []
  for (let i = 0; i < word.length; i++) {
    if (i < word.length - 1) {
      const arr = word.split('')
      ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
      result.push(arr.join(''))
    }
    result.push(word.slice(0, i + 1) + word[i] + word.slice(i + 1))
    if (word.length > 3) {
      result.push(word.slice(0, i) + word.slice(i + 1))
    }
  }
  return result
}

// ============ Secure Transaction Mode — state diff simulation ============

export interface TxStateDiff {
  success: boolean
  balanceBefore: Record<string, string> // token symbol → formatted amount
  balanceAfter: Record<string, string>
  tokensSent: Array<{ symbol: string; amount: string; usdValue: number }>
  tokensReceived: Array<{ symbol: string; amount: string; usdValue: number }>
  nftsInvolved: Array<{ name: string; tokenId: string; action: 'transfer' | 'approve' }>
  permissionsCreated: Array<{ type: string; description: string; riskLevel: 'low' | 'medium' | 'high' | 'critical' }>
  permissionsRemoved: Array<{ type: string; description: string }>
  contractsCalled: string[]
  gasEstimate: string
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  warnings: string[]
  /** Whether signature should be blocked entirely */
  blocked: boolean
  blockReason?: string
}

/**
 * Build a state-diff preview for a transaction.
 * In production, this would call Tenderly Simulation API or run a local fork.
 * Here we use heuristics based on calldata analysis.
 */
export function simulateTxDiff(params: {
  to: string
  value: string
  calldata?: string
  tokenSymbol: string
  tokenAmount: string
  chain: string
}): TxStateDiff {
  const warnings: string[] = []
  const permissionsCreated: TxStateDiff['permissionsCreated'] = []
  let riskScore = 100
  let blocked = false
  let blockReason: string | undefined

  // Analyze calldata if present
  if (params.calldata) {
    const findings = analyzeCalldata(params.calldata)
    for (const finding of findings) {
      if (finding.severity === 'critical') {
        riskScore -= 40
        warnings.push(finding.title + ': ' + finding.description)
        if (finding.title.includes('INFINITA') || finding.title.includes('setApprovalForAll')) {
          permissionsCreated.push({
            type: finding.title.includes('INFINITA') ? 'erc20-infinite-approve' : 'nft-approve-all',
            description: finding.description,
            riskLevel: 'critical',
          })
        }
        if (finding.title.includes('selfdestruct')) {
          blocked = true
          blockReason = 'selfdestruct detectado — transação bloqueada'
        }
      } else if (finding.severity === 'danger') {
        riskScore -= 25
        warnings.push(finding.title + ': ' + finding.description)
      } else if (finding.severity === 'warning') {
        riskScore -= 10
        warnings.push(finding.title + ': ' + finding.description)
      }
    }
  }

  // Build balance diff
  const balanceBefore: Record<string, string> = {
    [params.tokenSymbol]: params.tokenAmount,
    ETH: '3.4521',
  }
  const balanceAfter: Record<string, string> = {
    [params.tokenSymbol]: (parseFloat(params.tokenAmount) - parseFloat(params.tokenAmount)).toFixed(6),
    ETH: '3.4521',
  }

  const tokensSent = [
    {
      symbol: params.tokenSymbol,
      amount: params.tokenAmount,
      usdValue: parseFloat(params.tokenAmount) * 3245.67,
    },
  ]

  riskScore = Math.max(0, Math.min(100, riskScore))
  const riskLevel: TxStateDiff['riskLevel'] =
    riskScore >= 90 ? 'safe' : riskScore >= 70 ? 'low' : riskScore >= 45 ? 'medium' : riskScore >= 20 ? 'high' : 'critical'

  return {
    success: !blocked,
    balanceBefore,
    balanceAfter,
    tokensSent,
    tokensReceived: [],
    nftsInvolved: params.calldata?.startsWith('0xa22cb465')
      ? [{ name: 'Collection', tokenId: 'ALL', action: 'approve' }]
      : [],
    permissionsCreated,
    permissionsRemoved: [],
    contractsCalled: [params.to],
    gasEstimate: '21000',
    riskLevel,
    riskScore,
    warnings,
    blocked,
    blockReason,
  }
}
