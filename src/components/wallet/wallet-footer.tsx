'use client'

import { useEffect, useState } from 'react'
import { Crown, ShieldCheck, Activity } from 'lucide-react'

/**
 * Footer global da Tank Wallet.
 * Reforça o posicionamento de "proteção ativa" — não é apenas copyright.
 *
 * Lê o estado PRO do localStorage para evitar acoplamento com o WalletProvider
 * (que só está disponível dentro do escopo da carteira).
 */
export function WalletFooter() {
  const [isProTier, setIsProTier] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem('tank:pro') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const handler = () => {
      try {
        setIsProTier(localStorage.getItem('tank:pro') === 'true')
      } catch {
        // ignore
      }
    }
    window.addEventListener('storage', handler)
    window.addEventListener('tank:pro-changed', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('tank:pro-changed', handler)
    }
  }, [])

  return (
    <footer className="mt-auto border-t border-border/40 bg-card/20 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-2.5 md:px-6">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-4">
          {/* Left: brand + version */}
          <div className="flex items-baseline gap-2 text-[11px]">
            <span className="font-black uppercase tracking-tight text-foreground">TANK</span>
            <span className="font-medium text-muted-foreground">Wallet</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground/70 font-mono">v1.0.0-beta</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground/70">Security Engine 2.0</span>
          </div>

          {/* Right: PRO status or copyright */}
          {isProTier ? (
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Crown className="h-3 w-3 text-amber-400" />
                <span className="font-bold text-amber-400">PRO ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Threat Intel Online</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Activity className="h-3 w-3 animate-pulse text-emerald-400" />
                <span>Last sync: 12s ago</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground/80">
              Copyright © 2026 END ART
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
