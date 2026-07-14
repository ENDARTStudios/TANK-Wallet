'use client'

import { cn } from '@/lib/utils'
import { ScoreRing } from './common'
import { useWallet } from './wallet-context'
import { Shield, LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Lock, Globe, AlertTriangle, Settings } from 'lucide-react'

export type WalletView =
  | 'dashboard'
  | 'receive'
  | 'send'
  | 'vault'
  | 'dapps'
  | 'risk'
  | 'settings'

const NAV_ITEMS: { id: WalletView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Portfolio', icon: LayoutDashboard },
  { id: 'receive', label: 'Receber', icon: ArrowDownToLine },
  { id: 'send', label: 'Enviar', icon: ArrowUpFromLine },
  { id: 'vault', label: 'Cofre', icon: Lock },
  { id: 'dapps', label: 'DApps', icon: Globe },
  { id: 'risk', label: 'Central de Risco', icon: AlertTriangle },
  { id: 'settings', label: 'Ajustes', icon: Settings },
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
  const { globalRiskScore, vaultUnlocked, safeSessionActive } = useWallet()

  return (
    <aside className="flex h-full w-full flex-col bg-card/40 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
          <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">FortiX</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Secure Wallet</p>
        </div>
      </div>

      {/* Risk score */}
      <div className="mx-4 mb-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4">
        <div className="flex items-center gap-3">
          <ScoreRing score={globalRiskScore} size={64} label="Score" />
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground">Score de Segurança</p>
            <p className="text-sm font-semibold text-emerald-400">
              {globalRiskScore >= 90 ? 'Excelente' : globalRiskScore >= 70 ? 'Bom' : globalRiskScore >= 45 ? 'Atenção' : 'Crítico'}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={cn('h-1.5 w-1.5 rounded-full', vaultUnlocked ? 'bg-amber-400' : 'bg-emerald-400')} />
                <span className="text-muted-foreground">Cofre {vaultUnlocked ? 'aberto' : 'fechado'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={cn('h-1.5 w-1.5 rounded-full', safeSessionActive ? 'bg-emerald-400' : 'bg-zinc-500')} />
                <span className="text-muted-foreground">Sessão segura {safeSessionActive ? 'ativa' : 'inativa'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id)
                onClose?.()
              }}
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4 transition-colors', active ? 'text-emerald-400' : 'text-muted-foreground group-hover:text-foreground')} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-4">
        <div className="rounded-xl bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
          <p className="font-semibold text-foreground/80">Multi-chain auto-conectado</p>
          <p className="mt-0.5">10 redes · 0 configurações manuais</p>
        </div>
      </div>
    </aside>
  )
}
