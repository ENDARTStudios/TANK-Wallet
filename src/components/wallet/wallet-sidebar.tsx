'use client'

import { cn } from '@/lib/utils'
import { ScoreRing } from './common'
import { useWallet } from './wallet-context'
import {
  Shield,
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Lock, Globe, AlertTriangle, Settings,
  KeyRound, Power, Crown, History, Zap, Activity, Coins, Sparkles, ArrowRightLeft,
  Bell,
} from 'lucide-react'

export type WalletView =
  | 'dashboard'
  | 'assets'
  | 'nfts'
  | 'activity'
  | 'receive'
  | 'send'
  | 'swap'
  | 'bridge'
  | 'staking'
  | 'vault'
  | 'risk'
  | 'sovereignty'
  | 'scanner'
  | 'permissions'
  | 'history'
  | 'lockdown'
  | 'timeline'
  | 'health'
  | 'assistant'
  | 'notifications'
  | 'settings'

interface NavGroup {
  label: string
  items: Array<{ id: WalletView; label: string; icon: typeof LayoutDashboard; pro?: boolean; soon?: boolean }>
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'HOME',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'assets', label: 'Assets', icon: Coins, soon: true },
      { id: 'nfts', label: 'NFTs', icon: Sparkles, soon: true },
      { id: 'activity', label: 'Activity', icon: Activity },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { id: 'send', label: 'Send', icon: ArrowUpFromLine },
      { id: 'receive', label: 'Receive', icon: ArrowDownToLine },
      { id: 'swap', label: 'Swap', icon: ArrowRightLeft, soon: true },
      { id: 'bridge', label: 'Bridge', icon: Globe, soon: true },
      { id: 'staking', label: 'Staking', icon: Zap, soon: true },
    ],
  },
  {
    label: 'SECURITY',
    items: [
      { id: 'vault', label: 'Vault', icon: Lock },
      { id: 'health', label: 'Wallet Health', icon: Shield },
      { id: 'risk', label: 'Risk Center', icon: AlertTriangle },
      { id: 'permissions', label: 'Permission Manager', icon: KeyRound },
      { id: 'sovereignty', label: 'Sovereignty Center', icon: Shield },
      { id: 'scanner', label: 'Contract Scanner', icon: Zap },
      { id: 'dapps', label: 'DApp Shield', icon: Globe },
      { id: 'timeline', label: 'Security Timeline', icon: History },
      { id: 'assistant', label: 'AI Security Assistant', icon: Sparkles, pro: true },
      { id: 'lockdown', label: 'Lockdown', icon: Power, pro: true },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function WalletSidebar({
  view,
  onViewChange,
  onClose,
}: {
  view: WalletView
  onViewChange: (v: WalletView) => void
  onClose?: () => void
}) {
  const {
    globalRiskScore,
    vaultUnlocked,
    safeSessionActive,
    lockdownActive,
    isProTier,
    paranoidMode,
    erc20Approvals,
    nftApprovals,
    sessions,
    deviceWarnings,
  } = useWallet()

  const totalOpenPermissions = erc20Approvals.length + nftApprovals.length + sessions.length

  return (
    <aside className="flex h-full w-full flex-col bg-card/40 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
          <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
          {lockdownActive && (
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg leading-none flex items-baseline gap-1.5">
            <span className="font-black uppercase tracking-tight">TANK</span>
            <span className="font-medium text-muted-foreground">Wallet</span>
            {isProTier && (
              <Crown className="h-3.5 w-3.5 text-amber-400 self-center" />
            )}
          </h1>
          <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-emerald-400/80 font-semibold">
            {isProTier ? 'PRO · ZERO TRUST SECURITY' : 'ZERO TRUST SECURITY'}
          </p>
        </div>
      </div>

      {/* Risk score */}
      <div className="mx-4 mb-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-3">
        <div className="flex items-center gap-3">
          <ScoreRing score={globalRiskScore} size={56} label="Score" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Security Score</p>
            <p className="text-sm font-bold text-emerald-400">
              {globalRiskScore >= 90 ? 'Excelente' : globalRiskScore >= 70 ? 'Bom' : globalRiskScore >= 45 ? 'Atenção' : 'Crítico'}
            </p>
            <div className="mt-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={cn('h-1.5 w-1.5 rounded-full', vaultUnlocked ? 'bg-amber-400' : 'bg-emerald-500')} />
                <span className="text-muted-foreground">Vault {vaultUnlocked ? 'open' : 'sealed'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={cn('h-1.5 w-1.5 rounded-full', safeSessionActive ? 'bg-emerald-500' : 'bg-zinc-500')} />
                <span className="text-muted-foreground">Session {safeSessionActive ? 'secure' : 'idle'}</span>
              </div>
              {paranoidMode && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400">Paranoid ON</span>
                </div>
              )}
              {lockdownActive && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold">LOCKDOWN ACTIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {totalOpenPermissions > 0 && (
          <button
            onClick={() => { onViewChange('permissions'); onClose?.() }}
            className="mt-2 w-full rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-1.5 text-[10px] text-amber-300 hover:bg-amber-500/15"
          >
            {totalOpenPermissions} open permissions — review
          </button>
        )}
        {deviceWarnings.length > 0 && (
          <div className="mt-2 rounded-lg bg-red-500/10 border border-red-500/30 px-2 py-1.5 text-[10px] text-red-300">
            {deviceWarnings.length} device alert(s)
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70 font-semibold">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = view === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.soon) return
                      onViewChange(item.id)
                      onClose?.()
                    }}
                    className={cn(
                      'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      item.soon && 'opacity-50 cursor-not-allowed',
                      active
                        ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                      !item.soon && !active && 'hover:bg-muted/40'
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-emerald-400' : 'text-muted-foreground group-hover:text-foreground')} />
                    <span className="flex-1 text-left text-[13px]">{item.label}</span>
                    {item.soon && (
                      <span className="rounded bg-muted px-1 py-0.5 text-[8px] uppercase tracking-wider text-muted-foreground">Soon</span>
                    )}
                    {item.pro && !item.soon && !isProTier && (
                      <Crown className="h-3 w-3 text-amber-400/50" />
                    )}
                    {item.id === 'permissions' && totalOpenPermissions > 0 && (
                      <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                        {totalOpenPermissions}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 px-4 py-3">
        <div className="rounded-lg bg-muted/30 px-2.5 py-1.5 text-[10px] text-muted-foreground">
          <p className="font-semibold text-foreground/80">Auto-connected chains</p>
          <p className="mt-0.5">10 networks · 0 manual configs</p>
        </div>
      </div>
    </aside>
  )
}
