'use client'

import { useState } from 'react'
import { WalletProvider, useWallet } from '@/components/wallet/wallet-context'
import { WalletSidebar, type WalletView } from '@/components/wallet/wallet-sidebar'
import { WalletHeader } from '@/components/wallet/wallet-header'
import { DashboardView } from '@/components/wallet/dashboard-view'
import { ReceiveView } from '@/components/wallet/receive-view'
import { SendView } from '@/components/wallet/send-view'
import { VaultView } from '@/components/wallet/vault-view'
import { DappsView } from '@/components/wallet/dapps-view'
import { RiskCenterView } from '@/components/wallet/risk-center-view'
import { SettingsView } from '@/components/wallet/settings-view'
import { Onboarding } from '@/components/wallet/onboarding/onboarding'
import { SovereigntyView } from '@/components/wallet/sovereignty/sovereignty-view'
import { PermissionsView } from '@/components/wallet/sovereignty/permissions-view'
import { LockdownView } from '@/components/wallet/sovereignty/lockdown-view'
import { HistoryView } from '@/components/wallet/sovereignty/history-view'
import { TimelineView } from '@/components/wallet/sovereignty/timeline-view'
import { AssistantView } from '@/components/wallet/sovereignty/assistant-view'
import { ScannerView } from '@/components/wallet/scanner/scanner-view'
import { WalletHealthView } from '@/components/wallet/dashboard/wallet-health-view'

export default function Home() {
  return (
    <WalletProvider>
      <WalletApp />
    </WalletProvider>
  )
}

function WalletApp() {
  const { isLocked, realWallet, setRealWallet, lockWallet } = useWallet()
  const [view, setView] = useState<WalletView>('dashboard')

  if (isLocked || !realWallet) {
    return <Onboarding onUnlocked={setRealWallet} />
  }

  return (
    <div className="flex flex-1 bg-background">
      <div className="hidden md:block w-64 shrink-0 border-r border-border/50">
        <div className="sticky top-0 h-screen">
          <WalletSidebar view={view} onViewChange={setView} />
        </div>
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <WalletHeader view={view} onViewChange={setView} onLock={lockWallet} />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            {view === 'dashboard' && <DashboardView onViewChange={setView} />}
            {view === 'receive' && <ReceiveView />}
            {view === 'send' && <SendView />}
            {view === 'vault' && <VaultView />}
            {view === 'dapps' && <DappsView />}
            {view === 'scanner' && <ScannerView />}
            {view === 'permissions' && <PermissionsView />}
            {view === 'sovereignty' && <SovereigntyView />}
            {view === 'lockdown' && <LockdownView />}
            {view === 'risk' && <RiskCenterView />}
            {view === 'history' && <HistoryView />}
            {view === 'timeline' && <TimelineView />}
            {view === 'health' && <WalletHealthView />}
            {view === 'assistant' && <AssistantView />}
            {view === 'notifications' && <SettingsView />}
            {view === 'settings' && <SettingsView />}
            {/* Soon views — show placeholder */}
            {(view === 'assets' || view === 'nfts' || view === 'activity' || view === 'swap' || view === 'bridge' || view === 'staking') && (
              <SoonView view={view} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function SoonView({ view }: { view: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h1 className="text-2xl font-bold capitalize">{view}</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Este módulo está em desenvolvimento e será lançado em uma próxima fase.
        Acompanhe o roadmap em <code className="text-emerald-400">ARCHITECTURE.md</code>.
      </p>
    </div>
  )
}
