'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '../wallet-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Activity, Clock, Globe, DollarSign, Smartphone, Zap, AlertTriangle, Brain, TrendingUp, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  loadProfile, loadObservations, seedDemoObservations, detectAnomaly, getDeviceFingerprint,
  recordAction, type BehaviorProfile, type ObservedAction, type AnomalyResult,
} from '@/lib/wallet-engines/behavior'

export function BehaviorView() {
  const { realWallet } = useWallet()
  const { toast } = useToast()
  const [profile, setProfile] = useState<BehaviorProfile | null>(null)
  const [observations, setObservations] = useState<ObservedAction[]>([])
  const [anomaly, setAnomaly] = useState<AnomalyResult | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (!realWallet) return
    const addr = realWallet.evm.address
    // Seed demo data and load profile — using a flag to avoid re-seeding
    let mounted = true
    const init = () => {
      seedDemoObservations(addr)
      const p = loadProfile(addr)
      const obs = loadObservations(addr)
      if (mounted) {
        setProfile(p)
        setObservations(obs)
      }
    }
    init()
    return () => { mounted = false }
  }, [realWallet])

  const simulateNormalAction = () => {
    if (!realWallet || !profile) return
    setTesting(true)
    const action: ObservedAction = {
      walletAddress: realWallet.evm.address,
      timestamp: Date.now(),
      hour: 10 + Math.floor(Math.random() * 8),
      chain: 'ethereum',
      amountUsd: 100 + Math.random() * 300,
      deviceFingerprint: getDeviceFingerprint(),
      contractAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
      actionType: 'swap',
    }
    const result = detectAnomaly(action, profile)
    setAnomaly(result)
    const updated = recordAction(action)
    setProfile(updated)
    setObservations(loadObservations(realWallet.evm.address))
    setTesting(false)
    toast({
      title: result.blocked ? 'Anomalia bloqueada' : 'Ação registrada',
      description: result.reasons[0],
      variant: result.blocked ? 'destructive' : 'default',
    })
  }

  const simulateAnomalousAction = () => {
    if (!realWallet || !profile) return
    setTesting(true)
    // Simulate: $35,000 at 3am from a new device on BSC to an unknown contract
    const action: ObservedAction = {
      walletAddress: realWallet.evm.address,
      timestamp: Date.now(),
      hour: 3, // unusual hour
      chain: 'bsc', // new chain (profile uses ethereum)
      amountUsd: 35000, // way above typical ($50-$500)
      deviceFingerprint: 'dev-unknown-new-device', // new device
      contractAddress: '0x000000000000000000000000000000000000dead', // unknown contract
      actionType: 'send',
    }
    const result = detectAnomaly(action, profile)
    setAnomaly(result)
    setTesting(false)
    toast({
      title: result.level === 'extreme' ? 'RISCO EXTREMO DETECTADO' : 'Anomalia detectada',
      description: `Score: ${result.score}/100 — ${result.recommendedAction}`,
      variant: result.blocked ? 'destructive' : 'default',
    })
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Brain className="mx-auto h-10 w-10 text-muted-foreground/40 animate-pulse" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando perfil comportamental…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-400" />
          Behavioral Security
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          IA aprende seu padrão de uso e detecta anomalias. O maior diferencial da Tank Wallet.
        </p>
      </div>

      {/* Profile overview */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-card to-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-purple-400" />
            Behavior Profile
            <Badge variant="outline" className="text-[9px] border-purple-500/40 text-purple-400">
              {profile.observations} observations
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* Typical hours */}
            <ProfileStat
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Typical Hours"
              value={profile.typicalHours.length > 0 ? `${Math.min(...profile.typicalHours)}h-${Math.max(...profile.typicalHours)}h` : '—'}
              color="text-blue-400"
              bg="bg-blue-500/10"
            />
            {/* Typical chains */}
            <ProfileStat
              icon={<Globe className="h-3.5 w-3.5" />}
              label="Chains"
              value={profile.typicalChains.length > 0 ? profile.typicalChains.join(', ') : '—'}
              color="text-emerald-400"
              bg="bg-emerald-500/10"
            />
            {/* Typical amounts */}
            <ProfileStat
              icon={<DollarSign className="h-3.5 w-3.5" />}
              label="Median Amount"
              value={profile.typicalAmountsUsd.p50 > 0 ? `$${profile.typicalAmountsUsd.p50.toFixed(0)}` : '—'}
              color="text-amber-400"
              bg="bg-amber-500/10"
            />
            {/* P95 */}
            <ProfileStat
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="P95 Amount"
              value={profile.typicalAmountsUsd.p95 > 0 ? `$${profile.typicalAmountsUsd.p95.toFixed(0)}` : '—'}
              color="text-orange-400"
              bg="bg-orange-500/10"
            />
            {/* Devices */}
            <ProfileStat
              icon={<Smartphone className="h-3.5 w-3.5" />}
              label="Devices"
              value={String(profile.typicalDevices.length)}
              color="text-teal-400"
              bg="bg-teal-500/10"
            />
            {/* Frequency */}
            <ProfileStat
              icon={<Zap className="h-3.5 w-3.5" />}
              label="Frequency"
              value={`${profile.frequencyPerDay.toFixed(1)}/day`}
              color="text-purple-400"
              bg="bg-purple-500/10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Anomaly detection test */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Anomaly Detection Test
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Simule ações e veja como o Behavior Engine responde.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={simulateNormalAction}
              disabled={testing}
              variant="outline"
              className="gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            >
              <CheckCircle className="h-4 w-4" />
              Ação Normal
            </Button>
            <Button
              onClick={simulateAnomalousAction}
              disabled={testing}
              variant="outline"
              className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <AlertTriangle className="h-4 w-4" />
              Ação Anômala
            </Button>
          </div>

          {anomaly && (
            <div className={cn(
              'rounded-xl border-2 p-4',
              anomaly.level === 'normal' && 'border-emerald-500/30 bg-emerald-500/5',
              anomaly.level === 'low' && 'border-teal-500/30 bg-teal-500/5',
              anomaly.level === 'medium' && 'border-amber-500/30 bg-amber-500/5',
              anomaly.level === 'high' && 'border-orange-500/30 bg-orange-500/5',
              anomaly.level === 'extreme' && 'border-red-500/40 bg-red-500/10',
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {anomaly.blocked ? (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  ) : anomaly.score > 0 ? (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  )}
                  <span className={cn(
                    'text-sm font-bold uppercase',
                    anomaly.level === 'normal' && 'text-emerald-400',
                    anomaly.level === 'low' && 'text-teal-400',
                    anomaly.level === 'medium' && 'text-amber-400',
                    anomaly.level === 'high' && 'text-orange-400',
                    anomaly.level === 'extreme' && 'text-red-400',
                  )}>
                    {anomaly.level}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Anomaly Score</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    anomaly.score >= 60 ? 'text-red-400' : anomaly.score >= 40 ? 'text-amber-400' : anomaly.score >= 20 ? 'text-teal-400' : 'text-emerald-400',
                  )}>
                    {anomaly.score}<span className="text-sm text-muted-foreground">/100</span>
                  </p>
                </div>
              </div>
              <ul className="space-y-1">
                {anomaly.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className={cn('mt-1 h-1 w-1 shrink-0 rounded-full', anomaly.score > 0 ? 'bg-amber-400' : 'bg-emerald-400')} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-border/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Recommended Action</p>
                <p className="text-sm font-semibold mt-0.5 capitalize">
                  {anomaly.recommendedAction.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            O Behavior Engine aprende continuamente com cada ação: horários típicos, redes utilizadas,
            valores típicos, dispositivos habituais e contratos frequentes.
          </p>
          <p>
            Quando uma transação foge do padrão — por exemplo, um saque elevado para uma carteira
            nunca utilizada, originado de um novo dispositivo — o Behavior Engine eleva automaticamente
            o nível de proteção:
          </p>
          <div className="grid grid-cols-1 gap-1.5 mt-2">
            <ActionLevel level="normal" action="Permitir" color="text-emerald-400" />
            <ActionLevel level="low" action="Exigir confirmação" color="text-teal-400" />
            <ActionLevel level="medium" action="Exigir confirmação + biometria" color="text-amber-400" />
            <ActionLevel level="high" action="Ativar Modo Paranoico" color="text-orange-400" />
            <ActionLevel level="extreme" action="Bloquear temporariamente" color="text-red-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileStat({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/40 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={cn('flex h-5 w-5 items-center justify-center rounded', bg, color)}>
          {icon}
        </div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className={cn('text-sm font-bold truncate', color)}>{value}</p>
    </div>
  )
}

function ActionLevel({ level, action, color }: { level: string; action: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 p-2">
      <span className={cn('h-1.5 w-1.5 rounded-full', color.replace('text-', 'bg-'))} />
      <span className={cn('text-xs font-semibold capitalize w-20', color)}>{level}</span>
      <span className="text-xs text-muted-foreground">→ {action}</span>
    </div>
  )
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  // Reuse from lucide
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
