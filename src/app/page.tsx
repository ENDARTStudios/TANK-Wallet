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

  // Show onboarding / unlock screen if wallet is locked
  if (isLocked || !realWallet) {
    return <Onboarding onUnlocked={setRealWallet} />
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0 border-r border-border/50">
        <div className="sticky top-0 h-screen">
          <WalletSidebar view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <WalletHeader view={view} onViewChange={setView} onLock={lockWallet} />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            {view === 'dashboard' && <DashboardView onViewChange={setView} />}
            {view === 'receive' && <ReceiveView />}
            {view === 'send' && <SendView />}
            {view === 'vault' && <VaultView />}
            {view === 'dapps' && <DappsView />}
            {view === 'risk' && <RiskCenterView />}
            {view === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  )
}
