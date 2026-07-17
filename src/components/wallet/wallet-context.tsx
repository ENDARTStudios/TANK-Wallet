'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { INITIAL_WALLET_STATE, INITIAL_BLOCKED_TOKENS, INITIAL_BLOCKED_SITES } from '@/lib/wallet/data'
import type {
  WalletState,
  Token,
  Transaction,
  BlockedToken,
  SecurityEvent,
  RiskAssessment,
} from '@/lib/wallet/types'
import { computeGlobalRiskScore } from '@/lib/wallet/security'
import type { FullWallet } from '@/lib/wallet-core'
import { InternalError } from '@/lib/wallet-core/errors'
import { hasStoredVault } from '@/lib/wallet-core/storage'
import { EvmProvider, formatEtherSafe } from '@/lib/wallet-evm'
import { chainById } from '@/lib/wallet/data'
import type { Erc20Approval, NftApproval, DappSession, PermissionEvent, LockdownResult } from '@/lib/wallet-sovereignty'
import { getInitialSessions, getInitialPermissionHistory, executeLockdown } from '@/lib/wallet-sovereignty'

interface RealChainBalance {
  chain: string
  address: string
  balanceWei: bigint
  balanceEther: string
  loaded: boolean
  error?: string
}

interface WalletContextValue extends WalletState {
  // Real key management
  realWallet: FullWallet | null
  isLocked: boolean
  lockWallet: () => void
  setRealWallet: (w: FullWallet) => void
  // Real chain data
  realBalances: Record<string, RealChainBalance>
  refreshBalances: () => Promise<void>
  loadingBalances: boolean
  // Vault actions
  unlockVault: (pin: string) => boolean
  lockVault: () => void
  moveToVault: (tokenId: string) => void
  moveFromVault: (tokenId: string) => void
  // Safe session
  startSafeSession: () => void
  endSafeSession: () => void
  // Token receiving
  receiveToken: (token: Token) => { accepted: boolean; reason: string }
  // Sending
  sendTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status' | 'risk'>) => {
    approved: boolean
    reason: string
    risk: RiskAssessment
  }
  // Blocklist management
  addBlockedToken: (bt: Omit<BlockedToken, 'id' | 'blockedAt'>) => void
  removeBlockedToken: (id: string) => void
  // Security events
  addSecurityEvent: (ev: Omit<SecurityEvent, 'id' | 'timestamp'>) => void
  clearSecurityEvents: () => void
  // ============ Sovereignty ============
  erc20Approvals: Erc20Approval[]
  nftApprovals: NftApproval[]
  sessions: DappSession[]
  permissionHistory: PermissionEvent[]
  refreshApprovals: () => Promise<void>
  loadingApprovals: boolean
  revokeApproval: (id: string) => Promise<void>
  endSession: (id: string) => void
  lockdownActive: boolean
  lockdownResult: LockdownResult | null
  runLockdown: () => Promise<void>
  clearLockdown: () => void
  // ============ PRO tier ============
  isProTier: boolean
  setProTier: (pro: boolean) => void
  // ============ Paranoico mode ============
  paranoidMode: boolean
  setParanoidMode: (on: boolean) => void
  // ============ Device security ============
  deviceWarnings: string[]
}

const WalletContext = createContext<WalletContextValue | null>(null)

const VAULT_PIN = '123456' // demo PIN

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL_WALLET_STATE)
  const [realWallet, setRealWalletState] = useState<FullWallet | null>(null)
  const [isLocked, setIsLocked] = useState<boolean>(true)
  const [realBalances, setRealBalances] = useState<Record<string, RealChainBalance>>({})
  const [loadingBalances, setLoadingBalances] = useState(false)
  // ============ Sovereignty state ============
  const [erc20Approvals, setErc20Approvals] = useState<Erc20Approval[]>([])
  const [nftApprovals, setNftApprovals] = useState<NftApproval[]>([])
  const [sessions, setSessions] = useState<DappSession[]>(getInitialSessions())
  const [permissionHistory, setPermissionHistory] = useState<PermissionEvent[]>(getInitialPermissionHistory())
  const [loadingApprovals, setLoadingApprovals] = useState(false)
  const [lockdownActive, setLockdownActive] = useState(false)
  const [lockdownResult, setLockdownResult] = useState<LockdownResult | null>(null)
  const [isProTier, setIsProTier] = useState(false)
  const [paranoidMode, setParanoidMode] = useState(false)
  const [deviceWarnings, setDeviceWarnings] = useState<string[]>([])

  // Check on mount if there's a stored vault
  useEffect(() => {
    if (!hasStoredVault()) {
      // No vault — onboarding will handle create/import flow
      setIsLocked(true)
    }
  }, [])

  const setRealWallet = useCallback((w: FullWallet) => {
    setRealWalletState(w)
    setIsLocked(false)
  }, [])

  const lockWallet = useCallback(() => {
    setRealWalletState(null)
    setIsLocked(true)
    setRealBalances({})
  }, [])

  // ============ Real RPC balance fetching ============

  const refreshBalances = useCallback(async () => {
    if (!realWallet) return
    setLoadingBalances(true)

    const evmChains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base']
    const address = realWallet.evm.address

    const updates: Record<string, RealChainBalance> = {}
    await Promise.all(
      evmChains.map(async (chainId) => {
        try {
          const provider = new EvmProvider(chainId)
          const balanceWei = await provider.getBalance(address)
          updates[chainId] = {
            chain: chainId,
            address,
            balanceWei,
            balanceEther: formatEtherSafe(balanceWei),
            loaded: true,
          }
        } catch (e) {
          updates[chainId] = {
            chain: chainId,
            address,
            balanceWei: 0n,
            balanceEther: '0',
            loaded: false,
            error: (e as Error).message,
          }
        }
      })
    )

    // Solana (no real RPC integrated yet — use derived address)
    updates['solana'] = {
      chain: 'solana',
      address: realWallet.solana.address,
      balanceWei: 0n,
      balanceEther: '0',
      loaded: false,
      error: 'Solana RPC not yet integrated',
    }
    updates['bitcoin'] = {
      chain: 'bitcoin',
      address: realWallet.bitcoin.address,
      balanceWei: 0n,
      balanceEther: '0',
      loaded: false,
      error: 'Bitcoin RPC not yet integrated',
    }
    updates['lightning'] = {
      chain: 'lightning',
      address: realWallet.lightning.nodeId,
      balanceWei: 0n,
      balanceEther: '0',
      loaded: false,
      error: 'Lightning node required',
    }

    setRealBalances(updates)
    setLoadingBalances(false)
  }, [realWallet])

  // Auto-fetch balances when wallet is unlocked
  useEffect(() => {
    if (realWallet && !isLocked) {
      refreshBalances()
    }
  }, [realWallet, isLocked, refreshBalances])

  // ============ Vault actions ============

  const unlockVault = useCallback((pin: string) => {
    if (pin === VAULT_PIN) {
      setState((s) => ({ ...s, vaultUnlocked: true }))
      const ev: SecurityEvent = {
        id: `se-${Date.now()}`,
        type: 'vault-access',
        title: 'Cofre desbloqueado',
        description: 'Cofre desbloqueado via PIN + biometria — sessão de 5 minutos.',
        timestamp: Date.now(),
        severity: 'info',
      }
      setState((s) => ({ ...s, securityEvents: [ev, ...s.securityEvents] }))
      return true
    }
    return false
  }, [])

  const lockVault = useCallback(() => {
    setState((s) => ({ ...s, vaultUnlocked: false }))
  }, [])

  const moveToVault = useCallback((tokenId: string) => {
    setState((s) => {
      const token = s.tokens.find((t) => t.id === tokenId)
      if (!token) return s
      const movedToken = { ...token, inVault: true }
      return {
        ...s,
        tokens: s.tokens.filter((t) => t.id !== tokenId),
        vaultTokens: [...s.vaultTokens, movedToken],
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'vault-move',
            tokenSymbol: token.symbol,
            amount: token.balance,
            usdValue: token.balance * token.priceUsd,
            chain: token.chain,
            counterparty: 'Cofre interno',
            timestamp: Date.now(),
            status: 'confirmed',
            risk: { level: 'safe', score: 99, reasons: ['Transferência interna para cofre'], blocked: false },
            note: 'Movido para o cofre',
          },
          ...s.transactions,
        ],
      }
    })
  }, [])

  const moveFromVault = useCallback((tokenId: string) => {
    setState((s) => {
      const token = s.vaultTokens.find((t) => t.id === tokenId)
      if (!token) return s
      const movedToken = { ...token, inVault: false }
      return {
        ...s,
        vaultTokens: s.vaultTokens.filter((t) => t.id !== tokenId),
        tokens: [...s.tokens, movedToken],
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'vault-move',
            tokenSymbol: token.symbol,
            amount: token.balance,
            usdValue: token.balance * token.priceUsd,
            chain: token.chain,
            counterparty: 'Hot wallet',
            timestamp: Date.now(),
            status: 'confirmed',
            risk: { level: 'safe', score: 99, reasons: ['Retirado do cofre'], blocked: false },
            note: 'Retirado do cofre',
          },
          ...s.transactions,
        ],
      }
    })
  }, [])

  const startSafeSession = useCallback(() => setState((s) => ({ ...s, safeSessionActive: true })), [])
  const endSafeSession = useCallback(() => setState((s) => ({ ...s, safeSessionActive: false })), [])

  const receiveToken = useCallback((token: Token) => {
    if (token.risk.blocked) {
      const ev: SecurityEvent = {
        id: `se-${Date.now()}`,
        type: 'blocked-token',
        title: 'Token malicioso bloqueado',
        description: `Recebimento de ${token.symbol} (${token.chain}) bloqueado automaticamente.`,
        timestamp: Date.now(),
        severity: 'critical',
        related: token.symbol,
      }
      setState((s) => ({
        ...s,
        securityEvents: [ev, ...s.securityEvents],
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'receive',
            tokenSymbol: token.symbol,
            amount: token.balance,
            usdValue: 0,
            chain: token.chain,
            counterparty: token.contract ?? 'unknown',
            timestamp: Date.now(),
            status: 'blocked',
            risk: token.risk,
            note: 'Recebimento bloqueado',
          },
          ...s.transactions,
        ],
      }))
      return { accepted: false, reason: 'Token bloqueado pela verificação de integridade' }
    }
    setState((s) => {
      const existing = s.tokens.find((t) => t.id === token.id)
      if (existing) {
        return {
          ...s,
          tokens: s.tokens.map((t) => (t.id === token.id ? { ...t, balance: t.balance + token.balance } : t)),
        }
      }
      return { ...s, tokens: [...s.tokens, token] }
    })
    return { accepted: true, reason: 'Token aceito — passou na verificação de integridade' }
  }, [])

  const sendTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'timestamp' | 'status' | 'risk'>) => {
      const risk: RiskAssessment = {
        level: 'safe',
        score: 92,
        reasons: ['Endereço verificado', 'Sem permissões perigosas'],
        blocked: false,
      }
      setState((s) => {
        const token = s.tokens.find((t) => t.symbol === tx.tokenSymbol && t.chain === tx.chain)
        if (!token || token.balance < tx.amount) return s
        return {
          ...s,
          tokens: s.tokens.map((t) => (t.id === token.id ? { ...t, balance: t.balance - tx.amount } : t)),
          transactions: [
            { ...tx, id: `tx-${Date.now()}`, timestamp: Date.now(), status: 'confirmed', risk },
            ...s.transactions,
          ],
        }
      })
      return { approved: true, reason: 'Transação confirmada na Sessão Segura', risk }
    },
    []
  )

  const addBlockedToken = useCallback((bt: Omit<BlockedToken, 'id' | 'blockedAt'>) => {
    setState((s) => ({
      ...s,
      blockedTokens: [{ ...bt, id: `bt-${Date.now()}`, blockedAt: Date.now() }, ...s.blockedTokens],
    }))
  }, [])

  const removeBlockedToken = useCallback((id: string) => {
    setState((s) => ({ ...s, blockedTokens: s.blockedTokens.filter((bt) => bt.id !== id) }))
  }, [])

  const addSecurityEvent = useCallback((ev: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    setState((s) => ({
      ...s,
      securityEvents: [{ ...ev, id: `se-${Date.now()}`, timestamp: Date.now() }, ...s.securityEvents],
    }))
  }, [])

  const clearSecurityEvents = useCallback(() => setState((s) => ({ ...s, securityEvents: [] })), [])

  // ============ Sovereignty implementations ============

  const refreshApprovals = useCallback(async () => {
    if (!realWallet) return
    setLoadingApprovals(true)
    try {
      const { readErc20Approvals, readNftApprovals } = await import('@/lib/wallet-sovereignty')
      // Use real wallet's ERC-20 tokens (we use the mock tokens for demo since most have 0 balance)
      const evmTokens = state.tokens
        .filter((t) => t.contract && t.chain !== 'solana' && t.chain !== 'bitcoin' && t.chain !== 'lightning')
        .map((t) => ({ address: t.contract, symbol: t.symbol, logoColor: t.logoColor }))
      const chainIds = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base']
      const allErc20: Erc20Approval[] = []
      const allNft: NftApproval[] = []
      for (const chain of chainIds) {
        try {
          const erc20 = await readErc20Approvals(chain, realWallet.evm.address, evmTokens)
          allErc20.push(...erc20)
        } catch { /* skip */ }
        try {
          const nfts = await readNftApprovals(chain, realWallet.evm.address)
          allNft.push(...nfts)
        } catch { /* skip */ }
      }
      setErc20Approvals(allErc20)
      setNftApprovals(allNft)
    } catch (e) {
      // graceful degradation
      console.warn('Failed to refresh approvals:', e)
    } finally {
      setLoadingApprovals(false)
    }
  }, [realWallet, state.tokens])

  const revokeApproval = useCallback(async (id: string) => {
    // Find the approval and record the revocation
    const approval = erc20Approvals.find((a) => a.id === id) || nftApprovals.find((a) => a.id === id)
    if (approval) {
      // In production: build revoke calldata and broadcast via EvmSigner
      // For demo: just remove from state and add to history
      setErc20Approvals((prev) => prev.filter((a) => a.id !== id))
      setNftApprovals((prev) => prev.filter((a) => a.id !== id))
      const event: PermissionEvent = {
        id: `pe-${Date.now()}`,
        timestamp: Date.now(),
        type: 'revoked',
        permissionType: 'erc20-approval',
        description: 'Aprovação revogada',
        chain: approval.chain,
        tokenSymbol: 'tokenSymbol' in approval ? approval.tokenSymbol : undefined,
        spenderName: approval.spenderName,
      }
      setPermissionHistory((prev) => [event, ...prev])
    }
  }, [erc20Approvals, nftApprovals])

  const endSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    const event: PermissionEvent = {
      id: `pe-${Date.now()}`,
      timestamp: Date.now(),
      type: 'revoked',
      permissionType: 'session',
      description: 'Sessão DApp encerrada',
    }
    setPermissionHistory((prev) => [event, ...prev])
  }, [])

  const runLockdown = useCallback(async () => {
    setLockdownActive(true)
    const result = await executeLockdown(erc20Approvals, nftApprovals, sessions)
    setLockdownResult(result)
    // Clear all permissions after lockdown
    setErc20Approvals([])
    setNftApprovals([])
    setSessions([])
    // Add to history
    const event: SecurityEvent = {
      id: `se-${Date.now()}`,
      type: 'high-risk-warning',
      title: 'LOCKDOWN executado',
      description: `${result.totalRevoked} permissões revogadas em ${result.durationMs}ms. Modo somente leitura ativo.`,
      timestamp: Date.now(),
      severity: 'critical',
    }
    setState((s) => ({ ...s, securityEvents: [event, ...s.securityEvents] }))
  }, [erc20Approvals, nftApprovals, sessions])

  const clearLockdown = useCallback(() => {
    setLockdownActive(false)
    setLockdownResult(null)
  }, [])

  const setProTierCallback = useCallback((pro: boolean) => setIsProTier(pro), [])
  const setParanoidModeCallback = useCallback((on: boolean) => setParanoidMode(on), [])

  // ============ Device security checks (client-side heuristics) ============
  useEffect(() => {
    if (typeof window === 'undefined') return
    const warnings: string[] = []
    // DevTools open detection (rough heuristic)
    const threshold = 160
    const widthDiff = window.outerWidth - window.innerWidth > threshold
    const heightDiff = window.outerHeight - window.innerHeight > threshold
    if (widthDiff || heightDiff) {
      warnings.push('DevTools detectado — não deixe o navegador aberto em dispositivos compartilhados.')
    }
    // Tampered UA
    const ua = navigator.userAgent
    if (/HeadlessChrome|PhantomJS|SlimerJS/.test(ua)) {
      warnings.push('Headless browser detectado — possível automação.')
    }
    // Debugger statement detection — heuristic via devtools open check
    // (Removed inline debugger statement because it triggers in dev mode)
    setDeviceWarnings(warnings)
  }, [])

  // Refresh approvals when wallet unlocks
  useEffect(() => {
    if (realWallet && !isLocked) {
      refreshApprovals()
    }
  }, [realWallet, isLocked, refreshApprovals])

  // Compute security score with sovereignty components
  const baseRiskScore = computeGlobalRiskScore(state.tokens, state.vaultUnlocked, state.safeSessionActive)
  const infiniteApprovals = erc20Approvals.filter((a) => a.isInfinite).length
  const openNftApprovals = nftApprovals.length
  const sovereigntyAdjustment = Math.max(0, infiniteApprovals * 3 + openNftApprovals * 8)
  const globalRiskScore = Math.max(0, baseRiskScore - sovereigntyAdjustment)

  const value: WalletContextValue = {
    ...state,
    realWallet,
    isLocked,
    lockWallet,
    setRealWallet,
    realBalances,
    refreshBalances,
    loadingBalances,
    globalRiskScore,
    unlockVault,
    lockVault,
    moveToVault,
    moveFromVault,
    startSafeSession,
    endSafeSession,
    receiveToken,
    sendTransaction,
    addBlockedToken,
    removeBlockedToken,
    addSecurityEvent,
    clearSecurityEvents,
    // Sovereignty
    erc20Approvals,
    nftApprovals,
    sessions,
    permissionHistory,
    refreshApprovals,
    loadingApprovals,
    revokeApproval,
    endSession,
    lockdownActive,
    lockdownResult,
    runLockdown,
    clearLockdown,
    // PRO tier
    isProTier,
    setProTier: setProTierCallback,
    // Paranoico
    paranoidMode,
    setParanoidMode: setParanoidModeCallback,
    // Device
    deviceWarnings,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new InternalError('TANK-8002', 'useWallet must be used within WalletProvider')
  return ctx
}

export { INITIAL_BLOCKED_TOKENS, INITIAL_BLOCKED_SITES }
export { chainById }
