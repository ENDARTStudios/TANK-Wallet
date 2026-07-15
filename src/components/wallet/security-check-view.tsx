'use client'

import { useState, useEffect } from 'react'
import { useWallet } from './wallet-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Fingerprint, Globe2, Activity,
  CheckCircle2, AlertTriangle, Brain, Zap, Loader2, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WalletView } from './wallet-sidebar'

interface CheckStep {
  id: string
  label: string
  icon: typeof Shield
  status: 'pending' | 'checking' | 'passed' | 'warning'
  detail: string
}

export function SecurityCheckView({ onComplete }: { onComplete: () => void }) {
  const { globalRiskScore, deviceWarnings, safeSessionActive, erc20Approvals, nftApprovals } = useWallet()
  const [step, setStep] = useState(0)
  const [allDone, setAllDone] = useState(false)

  const steps: CheckStep[] = [
    { id: 'device', label: 'Device Check', icon: Shield, status: 'pending', detail: deviceWarnings.length > 0 ? `${deviceWarnings.length} warning(s)` : 'Device trusted' },
    { id: 'threat', label: 'Threat Intelligence', icon: Globe2, status: 'pending', detail: 'Updated 12s ago' },
    { id: 'permissions', label: 'Permissions', icon: Lock, status: 'pending', detail: `${erc20Approvals.length + nftApprovals.length} monitored` },
    { id: 'behavior', label: 'Behavior Engine', icon: Brain, status: 'pending', detail: 'Profile loaded' },
    { id: 'status', label: 'Security Status', icon: ShieldCheck, status: 'pending', detail: `Score ${globalRiskScore}/100` },
  ]

  useEffect(() => {
    let mounted = true
    if (step >= steps.length) {
      const timer = setTimeout(() => {
        if (mounted) {
          setAllDone(true)
          setTimeout(onComplete, 800)
        }
      }, 100)
      return () => { mounted = false; clearTimeout(timer) }
    }
    const timer = setTimeout(() => {
      if (mounted) setStep(s => s + 1)
    }, 120)
    return () => { mounted = false; clearTimeout(timer) }
  }, [step, steps.length, onComplete])

  const currentStep = Math.min(step, steps.length - 1)

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
            <Shield className="h-8 w-8 text-white" strokeWidth={2} />
            {!allDone && <div className="absolute -inset-1 rounded-2xl border-2 border-emerald-500/30 animate-ping" />}
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">TANK</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 font-semibold">Zero Trust Security Platform</p>
        </div>

        {/* Security Check card */}
        <Card className="border-emerald-500/20 bg-card/60 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{allDone ? 'All Systems Protected' : 'Running Security Check'}</p>
                <p className="text-[11px] text-muted-foreground">{allDone ? 'Wallet is safe to use' : 'Verifying security status…'}</p>
              </div>
              {!allDone && <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />}
              {allDone && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            </div>

            {/* Steps */}
            <div className="space-y-2.5">
              {steps.map((s, i) => {
                const Icon = s.icon
                const isDone = i < step || allDone
                const isCurrent = i === currentStep && !allDone
                const isPending = i > step && !allDone
                return (
                  <div
                    key={s.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                      isDone && 'bg-emerald-500/5',
                      isCurrent && 'bg-emerald-500/10',
                      isPending && 'opacity-40'
                    )}
                  >
                    <div className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-colors',
                      isDone && 'bg-emerald-500/15 text-emerald-400',
                      isCurrent && 'bg-emerald-500/15 text-emerald-400',
                      isPending && 'bg-muted/30 text-muted-foreground'
                    )}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : isCurrent ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Final status */}
            {allDone && (
              <div className="mt-5 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Security Score</p>
                    <p className={cn(
                      'text-3xl font-black',
                      globalRiskScore >= 90 ? 'text-emerald-400' : globalRiskScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
                    )}>{globalRiskScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
                    <p className="text-sm font-bold text-emerald-400">PROTECTED</p>
                  </div>
                  <Button onClick={onComplete} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          Tank Wallet verifies security status before displaying your assets.
        </p>
      </div>
    </div>
  )
}
