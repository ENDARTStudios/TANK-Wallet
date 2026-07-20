'use client'

// ============ Wallet Guardian Engine ============
//
// Protects the user from social engineering and UI-level attacks:
// - Clipboard Hijacking (malware swaps copied address)
// - Address Poisoning (attacker sends small tx from lookalike address)
// - Fake Support (Telegram/Discord/WhatsApp links)
// - Deepfake (seed/key requests)

export interface GuardianAlert {
  id: string
  type: 'clipboard-hijack' | 'address-poisoning' | 'fake-support' | 'deepfake-attempt' | 'suspicious-clipboard'
  severity: 'warning' | 'critical'
  title: string
  message: string
  timestamp: number
  /** The address the user copied */
  copiedAddress?: string
  /** The address that would actually be used */
  detectedAddress?: string
}

const GUARDIAN_STORAGE_KEY = 'tank:guardian-alerts'
const CLIPBOARD_CACHE_KEY = 'tank:clipboard-cache'

// ============ Clipboard Hijacking Detection ============

/**
 * When the user pastes an address, compare with what they likely copied.
 * If they don't match, the clipboard may have been hijacked.
 */
export function checkClipboardIntegrity(
  pastedAddress: string,
  expectedAddress?: string
): GuardianAlert | null {
  if (!expectedAddress) {
    // No expected address — can't compare, but check format
    if (!isValidAddressFormat(pastedAddress)) {
      return {
        id: `guard-${Date.now()}`,
        type: 'suspicious-clipboard',
        severity: 'warning',
        title: 'Endereço colado parece inválido',
        message: 'O endereço colado não corresponde a um formato válido. Verifique se o clipboard não foi alterado.',
        timestamp: Date.now(),
        detectedAddress: pastedAddress,
      }
    }
    return null
  }

  if (pastedAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    return {
      id: `guard-${Date.now()}`,
      type: 'clipboard-hijack',
      severity: 'critical',
      title: 'Possível clipboard hijacking',
      message: `Você copiou ${expectedAddress.slice(0, 10)}...${expectedAddress.slice(-4)} mas o clipboard contém ${pastedAddress.slice(0, 10)}...${pastedAddress.slice(-4)}. Malware pode ter substituído o endereço.`,
      timestamp: Date.now(),
      copiedAddress: expectedAddress,
      detectedAddress: pastedAddress,
    }
  }
  return null
}

/**
 * Cache the address when the user copies it, so we can compare on paste.
 */
export function cacheCopiedAddress(address: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CLIPBOARD_CACHE_KEY, address)
  } catch {
    // ignore
  }
}

export function getCachedCopiedAddress(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(CLIPBOARD_CACHE_KEY)
  } catch {
    return null
  }
}

// ============ Address Poisoning Detection ============

export interface KnownAddress {
  address: string
  label: string
  lastUsed: number
}

const KNOWN_ADDRESSES_KEY = 'tank:known-addresses'

export function loadKnownAddresses(): KnownAddress[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KNOWN_ADDRESSES_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveKnownAddress(address: string, label: string): void {
  if (typeof window === 'undefined') return
  const known = loadKnownAddresses()
  const existing = known.find(a => a.address.toLowerCase() === address.toLowerCase())
  if (existing) {
    existing.lastUsed = Date.now()
    existing.label = label
  } else {
    known.push({ address, label, lastUsed: Date.now() })
  }
  localStorage.setItem(KNOWN_ADDRESSES_KEY, JSON.stringify(known))
}

/**
 * Check if an address is a known address or a visually-similar lookalike (poisoning).
 */
export function checkAddressPoisoning(address: string): GuardianAlert | null {
  const known = loadKnownAddresses()
  // Exact match — safe
  if (known.some(a => a.address.toLowerCase() === address.toLowerCase())) {
    return null
  }
  // Check for visual similarity with known addresses
  for (const knownAddr of known) {
    if (isVisualLookalike(address, knownAddr.address)) {
      return {
        id: `guard-${Date.now()}`,
        type: 'address-poisoning',
        severity: 'critical',
        title: 'Possível address poisoning',
        message: `Este endereço se parece com "${knownAddr.label}" (${knownAddr.address.slice(0, 10)}...${knownAddr.address.slice(-4)}) mas é diferente. Pode ser um ataque de envenenamento de endereço.`,
        timestamp: Date.now(),
        detectedAddress: address,
      }
    }
  }
  return null
}

/**
 * Check if two addresses are visually similar (same prefix and/or suffix).
 * Address poisoning attacks create addresses with the same first 4 and last 4 chars.
 */
function isVisualLookalike(addr1: string, addr2: string): boolean {
  if (addr1.length !== addr2.length) return false
  const prefix1 = addr1.slice(0, 6).toLowerCase()
  const prefix2 = addr2.slice(0, 6).toLowerCase()
  const suffix1 = addr1.slice(-6).toLowerCase()
  const suffix2 = addr2.slice(-6).toLowerCase()
  // Same prefix AND suffix but different address = poisoning
  if (prefix1 === prefix2 && suffix1 === suffix2 && addr1.toLowerCase() !== addr2.toLowerCase()) {
    return true
  }
  return false
}

// ============ Fake Support Detection ============

const FAKE_SUPPORT_PATTERNS = [
  { pattern: /t\.me\/|telegram\.me\//, platform: 'Telegram' },
  { pattern: /discord\.gg\/|discord\.com\/invite\//, platform: 'Discord' },
  { pattern: /wa\.me\/|whatsapp\.com\//, platform: 'WhatsApp' },
]

export function checkFakeSupport(url: string): GuardianAlert | null {
  for (const { pattern, platform } of FAKE_SUPPORT_PATTERNS) {
    if (pattern.test(url.toLowerCase())) {
      return {
        id: `guard-${Date.now()}`,
        type: 'fake-support',
        severity: 'warning',
        title: `Link de ${platform} detectado`,
        message: `Suporte oficial da Tank Wallet nunca solicita acesso via ${platform}. Se alguém pediu para você abrir este link, pode ser uma tentativa de golpe. Nenhum funcionário da Tank solicitará sua Seed Phrase.`,
        timestamp: Date.now(),
      }
    }
  }
  return null
}

// ============ Deepfake / Seed Request Detection ============

const SEED_REQUEST_PATTERNS = [
  /seed\s*phrase/i,
  /recovery\s*phrase/i,
  /private\s*key/i,
  /mnemonic/i,
  /12\s*words/i,
  /24\s*words/i,
  /digite\s*sua\s*seed/i,
  /entre\s*com\s*sua\s*seed/i,
  /confirm\s*your\s*seed/i,
  /enter\s*your\s*seed/i,
]

/**
 * Detect if a message (e.g., from a DApp or chat) is requesting the seed phrase.
 */
export function checkSeedRequest(message: string): GuardianAlert | null {
  for (const pattern of SEED_REQUEST_PATTERNS) {
    if (pattern.test(message)) {
      return {
        id: `guard-${Date.now()}`,
        type: 'deepfake-attempt',
        severity: 'critical',
        title: 'Tentativa de roubo de seed phrase',
        message: 'Nenhum funcionário da Tank Wallet solicitará sua Seed Phrase. Esta mensagem pode ser uma tentativa de golpe ou deepfake. NUNCA compartilhe sua seed phrase com ninguém.',
        timestamp: Date.now(),
      }
    }
  }
  return null
}

// ============ Alert storage ============

export function loadGuardianAlerts(): GuardianAlert[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(GUARDIAN_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveGuardianAlert(alert: GuardianAlert): void {
  if (typeof window === 'undefined') return
  const alerts = loadGuardianAlerts()
  alerts.unshift(alert)
  localStorage.setItem(GUARDIAN_STORAGE_KEY, JSON.stringify(alerts.slice(0, 50)))
}

export function clearGuardianAlerts(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUARDIAN_STORAGE_KEY)
}

// ============ Helpers ============

function isValidAddressFormat(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}
