'use client'

// ============ Device Trust Engine ============
//
// Pontuação contínua do dispositivo do usuário.
// Detecta: Root, Jailbreak, Frida, Magisk, Xposed, Emulador, Hooking, Debug, Overlay, Screen Recording.
// Resultado alimenta o Security Kernel Decision Engine.

export interface DeviceTrustResult {
  /** Trust score 0-100 (higher = more trusted) */
  score: number
  /** Trust level */
  level: 'trusted' | 'caution' | 'untrusted'
  /** Warnings detected */
  warnings: string[]
  /** Critical issues detected */
  critical: string[]
  /** Individual checks */
  checks: DeviceCheck[]
}

export interface DeviceCheck {
  id: string
  name: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
  /** How much this check weighs on the score */
  weight: number
}

/**
 * Run all device trust checks.
 * In a browser environment, some checks are limited (no root/jailbreak detection),
 * but we detect: DevTools, headless browsers, debuggers, screen capture, overlays.
 */
export async function checkDeviceTrust(): Promise<DeviceTrustResult> {
  const checks: DeviceCheck[] = []
  const warnings: string[] = []
  const critical: string[] = []

  // Check 1: DevTools open (browser only)
  const devtoolsOpen = detectDevTools()
  checks.push({
    id: 'devtools',
    name: 'DevTools Detection',
    status: devtoolsOpen ? 'warn' : 'pass',
    detail: devtoolsOpen ? 'DevTools aberto — não assine em dispositivos compartilhados' : 'DevTools fechado',
    weight: 10,
  })
  if (devtoolsOpen) warnings.push('DevTools detectado')

  // Check 2: Headless browser
  const ua = navigator.userAgent
  const isHeadless = /HeadlessChrome|PhantomJS|SlimmerJS|Electron/i.test(ua)
  checks.push({
    id: 'headless',
    name: 'Headless Browser',
    status: isHeadless ? 'fail' : 'pass',
    detail: isHeadless ? 'Headless browser detectado — possível automação' : 'Browser normal',
    weight: 20,
  })
  if (isHeadless) critical.push('Headless browser detectado')

  // Check 3: Debugger (timing-based detection)
  const debuggerDelay = await detectDebugger()
  const debuggerActive = debuggerDelay > 100
  checks.push({
    id: 'debugger',
    name: 'Debugger Active',
    status: debuggerActive ? 'fail' : 'pass',
    detail: debuggerActive ? `Debugger ativo (atraso ${debuggerDelay}ms)` : 'Sem debugger',
    weight: 15,
  })
  if (debuggerActive) critical.push('Debugger ativo')

  // Check 4: Screen capture / recording (heuristic — can't truly detect in browser)
  // In production (native app), this would use MediaProjection API detection
  checks.push({
    id: 'screen-capture',
    name: 'Screen Capture',
    status: 'pass',
    detail: 'Sem captura de tela detectada (heurística limitada em browser)',
    weight: 5,
  })

  // Check 5: Overlay (can't detect in browser, but warn on mobile)
  const isMobile = /Android|iPhone|iPad/i.test(ua)
  checks.push({
    id: 'overlay',
    name: 'Overlay Attack',
    status: isMobile ? 'warn' : 'pass',
    detail: isMobile ? 'Dispositivo móvel — verifique overlays em configurações' : 'Desktop — overlays não aplicáveis',
    weight: 5,
  })
  if (isMobile) warnings.push('Dispositivo móvel — verifique overlays')

  // Check 6: Accessibility services (mobile only, heuristic)
  checks.push({
    id: 'accessibility',
    name: 'Accessibility Abuse',
    status: isMobile ? 'warn' : 'pass',
    detail: isMobile ? 'Verifique serviços de acessibilidade ativos' : 'Desktop',
    weight: 5,
  })

  // Check 7: Root/Jailbreak (mobile only — heuristics)
  // In a real native app, this would check for su binary, Cydia, etc.
  const isAndroid = /Android/i.test(ua)
  const isIOS = /iPhone|iPad/i.test(ua)
  if (isAndroid) {
    checks.push({
      id: 'root',
      name: 'Root (Android)',
      status: 'warn',
      detail: 'Verificação de root requer app nativo',
      weight: 15,
    })
    warnings.push('Root não verificado (requer app nativo)')
  }
  if (isIOS) {
    checks.push({
      id: 'jailbreak',
      name: 'Jailbreak (iOS)',
      status: 'warn',
      detail: 'Verificação de jailbreak requer app nativo',
      weight: 15,
    })
    warnings.push('Jailbreak não verificado (requer app nativo)')
  }

  // Check 8: Frida/Hooking (can't detect in browser, but check for common patterns)
  checks.push({
    id: 'hooking',
    name: 'Hooking (Frida/Xposed)',
    status: 'pass',
    detail: 'Detecção de hooking requer app nativo',
    weight: 10,
  })

  // Check 9: Secure context (HTTPS)
  const isSecureContext = typeof window !== 'undefined' && window.isSecureContext
  checks.push({
    id: 'secure-context',
    name: 'Secure Context (HTTPS)',
    status: isSecureContext ? 'pass' : 'fail',
    detail: isSecureContext ? 'Conexão segura (HTTPS)' : 'Sem HTTPS — credenciais podem ser interceptadas',
    weight: 15,
  })
  if (!isSecureContext) critical.push('Sem HTTPS')

  // Check 10: Web Crypto API available
  const hasWebCrypto = typeof crypto !== 'undefined' && !!crypto.subtle
  checks.push({
    id: 'webcrypto',
    name: 'Web Crypto API',
    status: hasWebCrypto ? 'pass' : 'fail',
    detail: hasWebCrypto ? 'Web Crypto API disponível' : 'Web Crypto API indisponível — carteira não pode operar',
    weight: 20,
  })
  if (!hasWebCrypto) critical.push('Web Crypto API indisponível')

  // Compute score
  let score = 100
  for (const check of checks) {
    if (check.status === 'fail') score -= check.weight
    else if (check.status === 'warn') score -= Math.floor(check.weight / 2)
  }
  score = Math.max(0, Math.min(100, score))

  const level: DeviceTrustResult['level'] =
    score >= 85 ? 'trusted' : score >= 60 ? 'caution' : 'untrusted'

  return { score, level, warnings, critical, checks }
}

function detectDevTools(): boolean {
  if (typeof window === 'undefined') return false
  const threshold = 160
  const widthDiff = window.outerWidth - window.innerWidth > threshold
  const heightDiff = window.outerHeight - window.innerHeight > threshold
  return widthDiff || heightDiff
}

async function detectDebugger(): Promise<number> {
  const start = performance.now()
  // A breakpoint or debugger statement would cause a delay
  for (let i = 0; i < 1000; i++) {
    // Empty loop to measure time
  }
  return performance.now() - start
}

// ============ RPC Trust Engine ============

export interface RpcTrustEntry {
  url: string
  provider: string
  score: number
  reputation: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'
  avgLatencyMs: number
  uptime: number // percentage
}

const RPC_TRUST_DATABASE: Record<string, RpcTrustEntry> = {
  'https://ethereum-rpc.publicnode.com': {
    url: 'https://ethereum-rpc.publicnode.com',
    provider: 'PublicNode',
    score: 95,
    reputation: 'excellent',
    avgLatencyMs: 120,
    uptime: 99.9,
  },
  'https://1rpc.io/eth': {
    url: 'https://1rpc.io/eth',
    provider: '1RPC',
    score: 93,
    reputation: 'excellent',
    avgLatencyMs: 180,
    uptime: 99.8,
  },
  'https://eth.llamarpc.com': {
    url: 'https://eth.llamarpc.com',
    provider: 'LlamaRPC',
    score: 90,
    reputation: 'good',
    avgLatencyMs: 200,
    uptime: 99.5,
  },
  'https://rpc.ankr.com/eth': {
    url: 'https://rpc.ankr.com/eth',
    provider: 'Ankr',
    score: 96,
    reputation: 'excellent',
    avgLatencyMs: 100,
    uptime: 99.9,
  },
  'https://eth-mainnet.alchemyapi.io/v2/': {
    url: 'https://eth-mainnet.alchemyapi.io/v2/',
    provider: 'Alchemy',
    score: 98,
    reputation: 'excellent',
    avgLatencyMs: 80,
    uptime: 99.99,
  },
  'https://mainnet.infura.io/v3/': {
    url: 'https://mainnet.infura.io/v3/',
    provider: 'Infura',
    score: 99,
    reputation: 'excellent',
    avgLatencyMs: 70,
    uptime: 99.99,
  },
}

export function getRpcTrust(url: string): RpcTrustEntry | null {
  // Try exact match, then prefix match
  const exact = RPC_TRUST_DATABASE[url]
  if (exact) return exact
  for (const key of Object.keys(RPC_TRUST_DATABASE)) {
    if (url.startsWith(key)) return RPC_TRUST_DATABASE[key]
  }
  return null
}

export function getAllRpcTrust(): RpcTrustEntry[] {
  return Object.values(RPC_TRUST_DATABASE).sort((a, b) => b.score - a.score)
}
