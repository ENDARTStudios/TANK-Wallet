'use client'

import { useState } from 'react'
import { useWallet } from './wallet-context'
import { ChainBadge, ScoreRing } from './common'
import { CHAINS } from '@/lib/wallet/data'
import { shortenAddress } from '@/lib/wallet/security'
import { Menu, Copy, Check, Shield, ShieldCheck, Zap, Globe2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { WalletSidebar, type WalletView } from './wallet-sidebar'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function WalletHeader({
  view,
  onViewChange,
}: {
  view: WalletView
  onViewChange: (v: WalletView) => void
}) {
  const { address, globalRiskScore, safeSessionActive, startSafeSession, endSafeSession } = useWallet()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      // fallback
    }
    setCopied(true)
    toast({ title: 'Endereço copiado', description: 'Lembre-se: verifique sempre o endereço de destino ao colar.' })
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navegação</SheetTitle>
            <WalletSidebar view={view} onViewChange={onViewChange} onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Address pill */}
        <button
          onClick={copyAddress}
          className="group flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 py-1.5 pl-3 pr-2 text-xs font-medium transition-colors hover:bg-muted/70"
        >
          <span className="hidden sm:inline text-muted-foreground">Endereço:</span>
          <span className="font-mono">{shortenAddress(address, 5)}</span>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />}
        </button>

        {/* Networks indicator */}
        <div className="hidden lg:flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">10 redes ativas</span>
          <div className="ml-1 flex -space-x-1.5">
            {CHAINS.slice(0, 7).map((c) => (
              <span
                key={c.id}
                className="inline-block h-4 w-4 rounded-full border border-background"
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-background bg-muted text-[8px] font-bold">
              +3
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Safe session toggle */}
        <Button
          variant={safeSessionActive ? 'default' : 'outline'}
          size="sm"
          onClick={() => (safeSessionActive ? endSafeSession() : startSafeSession())}
          className={cn(
            'gap-2',
            safeSessionActive
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{safeSessionActive ? 'Sessão segura ativa' : 'Ativar sessão segura'}</span>
          <span className="sm:hidden">Sessão</span>
        </Button>

        {/* Mini score */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2 py-1">
          <ScoreRing score={globalRiskScore} size={28} />
          <div className="pr-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Score</p>
            <p className="text-xs font-bold text-emerald-400">{globalRiskScore}/100</p>
          </div>
        </div>
      </div>
    </header>
  )
}
