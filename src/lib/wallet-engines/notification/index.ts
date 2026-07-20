'use client'

// ============ Notification Engine (Production Hardening) ============
//
// PRINCIPLE: "Continuous Protection" — alerts even when the wallet is closed.
//
// Event-based notifications:
// - Contract compromised → you have approval → click to revoke
// - New vulnerability → you have affected assets
// - Token became scam → you hold it
// - Approve expired → safe
// - Suspicious login attempt

export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'success'
export type NotificationCategory =
  | 'threat'
  | 'permission'
  | 'transaction'
  | 'behavior'
  | 'system'
  | 'recovery'

export interface TankNotification {
  id: string
  severity: NotificationSeverity
  category: NotificationCategory
  title: string
  message: string
  timestamp: number
  read: boolean
  /** Action label (e.g., "Revogar", "Ver detalhes") */
  actionLabel?: string
  /** Action type for routing */
  actionType?: 'revoke' | 'view-risk' | 'view-permissions' | 'view-tx' | 'lockdown' | 'dismiss'
  /** Action payload (e.g., approval ID, tx hash) */
  actionPayload?: string
  /** Whether this notification has been dismissed */
  dismissed?: boolean
}

// ============ Notification store ============

const STORAGE_KEY = 'tank:notifications'

export function loadNotifications(): TankNotification[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveNotifications(notifications: TankNotification[]): void {
  if (typeof window === 'undefined') return
  try {
    // Keep only the most recent 100
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 100)))
  } catch {
    // ignore
  }
}

export function addNotification(notification: Omit<TankNotification, 'id' | 'timestamp' | 'read'>): TankNotification {
  const full: TankNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    read: false,
  }
  const all = loadNotifications()
  all.unshift(full)
  saveNotifications(all)
  return full
}

export function markAsRead(id: string): void {
  const all = loadNotifications()
  const updated = all.map(n => n.id === id ? { ...n, read: true } : n)
  saveNotifications(updated)
}

export function markAllAsRead(): void {
  const all = loadNotifications()
  saveNotifications(all.map(n => ({ ...n, read: true })))
}

export function dismissNotification(id: string): void {
  const all = loadNotifications()
  saveNotifications(all.map(n => n.id === id ? { ...n, dismissed: true, read: true } : n))
}

export function clearAllNotifications(): void {
  saveNotifications([])
}

export function getUnreadCount(): number {
  return loadNotifications().filter(n => !n.read && !n.dismissed).length
}

// ============ Event-based notification generators ============

/**
 * Generate a notification when a contract the user has approved to is compromised.
 */
export function notifyContractCompromised(
  contractAddress: string,
  contractName: string,
  approvalId: string
): TankNotification {
  return addNotification({
    severity: 'critical',
    category: 'threat',
    title: 'Contrato comprometido',
    message: `O contrato ${contractName} (${contractAddress.slice(0, 10)}...) foi comprometido. Você possui aprovação ativa — revogue imediatamente.`,
    actionLabel: 'Revogar agora',
    actionType: 'revoke',
    actionPayload: approvalId,
  })
}

/**
 * Generate a notification when a new vulnerability affects user assets.
 */
export function notifyVulnerabilityAffected(
  protocolName: string,
  affectedAssets: string[]
): TankNotification {
  return addNotification({
    severity: 'warning',
    category: 'threat',
    title: 'Vulnerabilidade detectada',
    message: `Nova vulnerabilidade em ${protocolName}. Você possui ativos afetados: ${affectedAssets.join(', ')}.`,
    actionLabel: 'Ver detalhes',
    actionType: 'view-risk',
  })
}

/**
 * Generate a notification when a token the user holds became scam.
 */
export function notifyTokenBecameScam(
  tokenSymbol: string,
  tokenName: string,
  reason: string
): TankNotification {
  return addNotification({
    severity: 'critical',
    category: 'threat',
    title: 'Token em sua carteira classificado como scam',
    message: `${tokenSymbol} (${tokenName}) foi identificado como malicioso: ${reason}. O token foi oculto e bloqueado para interação.`,
    actionLabel: 'Ver na Central de Risco',
    actionType: 'view-risk',
  })
}

/**
 * Generate a notification when behavioral anomaly is detected.
 */
export function notifyBehavioralAnomaly(
  score: number,
  reasons: string[]
): TankNotification {
  return addNotification({
    severity: score >= 80 ? 'critical' : 'warning',
    category: 'behavior',
    title: score >= 80 ? 'Anomalia comportamental crítica' : 'Anomalia comportamental detectada',
    message: `Score: ${score}/100. ${reasons[0]}. ${score >= 80 ? 'Transação bloqueada temporariamente.' : 'Confirmação extra necessária.'}`,
    actionLabel: 'Ver detalhes',
    actionType: score >= 80 ? 'lockdown' : 'view-risk',
  })
}

/**
 * Generate a notification when an approval is about to expire (Permit2).
 */
export function notifyApprovalExpiring(
  tokenSymbol: string,
  spenderName: string,
  hoursRemaining: number
): TankNotification {
  return addNotification({
    severity: 'info',
    category: 'permission',
    title: 'Aprovação expirando',
    message: `A aprovação de ${tokenSymbol} para ${spenderName} expira em ${hoursRemaining}h.`,
    actionLabel: 'Ver permissões',
    actionType: 'view-permissions',
  })
}

/**
 * Generate a notification when a new device accesses the wallet.
 */
export function notifyNewDevice(
  deviceFingerprint: string,
  userAgent: string
): TankNotification {
  return addNotification({
    severity: 'warning',
    category: 'system',
    title: 'Novo dispositivo detectado',
    message: `Acesso de um dispositivo não reconhecido. Modo Paranoico recomendado.`,
    actionLabel: 'Ver detalhes',
    actionType: 'view-risk',
  })
}

/**
 * Generate a notification for a successful transaction.
 */
export function notifyTransactionConfirmed(
  tokenSymbol: string,
  amount: string,
  chain: string
): TankNotification {
  return addNotification({
    severity: 'success',
    category: 'transaction',
    title: 'Transação confirmada',
    message: `${amount} ${tokenSymbol} enviada com sucesso na rede ${chain}.`,
    actionLabel: 'Ver transação',
    actionType: 'view-tx',
  })
}

// ============ Seed demo notifications ============

export function seedDemoNotifications(): void {
  const existing = loadNotifications()
  if (existing.length > 0) return

  notifyContractCompromised(
    '0x1234567890abcdef1234567890abcdef12345678',
    'OpenSea Seaport 1.5',
    'approval-opensea-1'
  )

  notifyVulnerabilityAffected('Curve Finance', ['crvUSD', '3pool LP'])

  notifyTokenBecameScam('SAFEBOOST', 'SafeBoost Inu', 'Honeypot detectado')

  notifyBehavioralAnomaly(85, ['Horário atípico (3h)', 'Valor $35.000 vs máximo $463'])

  notifyApprovalExpiring('USDC', 'Uniswap V3 Router', 24)

  notifyTransactionConfirmed('ETH', '0.5', 'Ethereum')
}
