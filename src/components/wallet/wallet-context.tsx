'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
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

interface WalletContextValue extends WalletState {
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
}

const WalletContext = createContext<WalletContextValue | null>(null)

const VAULT_PIN = '123456' // demo PIN

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL_WALLET_STATE)

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

  const startSafeSession = useCallback(() => {
    setState((s) => ({ ...s, safeSessionActive: true }))
  }, [])

  const endSafeSession = useCallback(() => {
    setState((s) => ({ ...s, safeSessionActive: false }))
  }, [])

  const receiveToken = useCallback(
    (token: Token) => {
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
            tokens: s.tokens.map((t) =>
              t.id === token.id ? { ...t, balance: t.balance + token.balance } : t
            ),
          }
        }
        return { ...s, tokens: [...s.tokens, token] }
      })
      return { accepted: true, reason: 'Token aceito — passou na verificação de integridade' }
    },
    []
  )

  const sendTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'timestamp' | 'status' | 'risk'>) => {
      const risk: RiskAssessment = {
        level: 'safe',
        score: 92,
        reasons: ['Endereço verificado', 'Sem permissões perigosas'],
        blocked: false,
      }
      // Check if token exists in sufficient balance
      setState((s) => {
        const token = s.tokens.find((t) => t.symbol === tx.tokenSymbol && t.chain === tx.chain)
        if (!token || token.balance < tx.amount) {
          return s
        }
        return {
          ...s,
          tokens: s.tokens.map((t) =>
            t.id === token.id ? { ...t, balance: t.balance - tx.amount } : t
          ),
          transactions: [
            {
              ...tx,
              id: `tx-${Date.now()}`,
              timestamp: Date.now(),
              status: 'confirmed',
              risk,
            },
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
      blockedTokens: [
        { ...bt, id: `bt-${Date.now()}`, blockedAt: Date.now() },
        ...s.blockedTokens,
      ],
    }))
  }, [])

  const removeBlockedToken = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      blockedTokens: s.blockedTokens.filter((bt) => bt.id !== id),
    }))
  }, [])

  const addSecurityEvent = useCallback((ev: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    setState((s) => ({
      ...s,
      securityEvents: [
        { ...ev, id: `se-${Date.now()}`, timestamp: Date.now() },
        ...s.securityEvents,
      ],
    }))
  }, [])

  const clearSecurityEvents = useCallback(() => {
    setState((s) => ({ ...s, securityEvents: [] }))
  }, [])

  // Compute global risk score dynamically
  const globalRiskScore = computeGlobalRiskScore(state.tokens, state.vaultUnlocked, state.safeSessionActive)

  const value: WalletContextValue = {
    ...state,
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
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

export { INITIAL_BLOCKED_TOKENS, INITIAL_BLOCKED_SITES }
