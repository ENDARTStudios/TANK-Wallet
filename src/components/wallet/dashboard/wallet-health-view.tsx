'use client'

import { useWallet } from '../wallet-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Activity,
  KeyRound, Fingerprint, Smartphone, RefreshCw, Lock, Bell, Database, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthCheck {
  id: string
  label: string
  status: 'ok' | 'warning' | 'critical'
  detail: string
  icon: typeof ShieldCheck
}

export function WalletHealthView() {
  const {
    globalRiskScore,
    erc20Approvals,
    nftApprovals,
    sessions,
    deviceWarnings,
    vaultUnlocked,
    paranoidMode,
    isProTier,
    safeSessionActive,
  } = useWallet()

  // Compute per-component health
  const criticalPermissions = nftApprovals.length + erc20Approvals.filter(a => a.isInfinite).length

  const checks: HealthCheck[] = [
    {
      id: 'backups',
      label: 'Backups',
      status: 'ok',
      detail: 'Seed phrase encrypted (AES-256-GCM)',
      icon: Database,
    },
    {
      id: 'seed',
      label: 'Seed',
      status: 'ok',
      detail: 'PBKDF2 250k iterations · Local only',
      icon: KeyRound,
    },
    {
      id: 'biometry',
      label: 'Biometria',
      status: 'ok',
      detail: 'WebAuthn available',
      icon: Fingerprint,
    },
    {
      id: 'permissions',
      label: 'Permissões',
      status: criticalPermissions > 0 ? 'critical' : erc20Approvals.length > 0 ? 'warning' : 'ok',
      detail: criticalPermissions > 0
        ? `${criticalPermissions} críticas · ${erc20Approvals.length} ERC-20 · ${nftApprovals.length} NFT`
        : erc20Approvals.length > 0
        ? `${erc20Approvals.length} active approvals`
        : 'No open approvals',
      icon: KeyRound,
    },
    {
      id: 'device',
      label: 'Dispositivo',
      status: deviceWarnings.length > 0 ? 'warning' : 'ok',
      detail: deviceWarnings.length > 0
        ? `${deviceWarnings.length} warning(s) detected`
        : 'No anomalies detected',
      icon: Smartphone,
    },
    {
      id: 'updates',
      label: 'Atualizações',
      status: 'ok',
      detail: 'Security Engine 2.0 · Threat Intel synced 12s ago',
      icon: RefreshCw,
    },
    {
      id: 'vault',
      label: 'Vault',
      status: vaultUnlocked ? 'warning' : 'ok',
      detail: vaultUnlocked ? 'Vault currently unlocked' : 'Vault sealed',
      icon: Lock,
    },
    {
      id: 'session',
      label: 'Sessão',
      status: safeSessionActive ? 'ok' : 'warning',
      detail: safeSessionActive ? 'Safe Session active' : 'Safe Session idle',
      icon: ShieldCheck,
    },
  ]

  const overallStatus = checks.some(c => c.status === 'critical')
    ? 'critical'
    : checks.some(c => c.status === 'warning')
    ? 'warning'
    : 'ok'

  const okCount = checks.filter(c => c.status === 'ok').length
  const warningCount = checks.filter(c => c.status === 'warning').length
  const criticalCount = checks.filter(c => c.status === 'critical').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          Wallet Health
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Painel de proteção ativa — semelhante a um antivírus, mas para sua carteira.
        </p>
      </div>

      {/* Overall health hero */}
      <Card className={cn(
        'relative overflow-hidden border-2',
        overallStatus === 'ok' && 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card',
        overallStatus === 'warning' && 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card',
        overallStatus === 'critical' && 'border-red-500/40 bg-gradient-to-br from-red-500/10 via-card to-card',
      )}>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl bg-emerald-500/10" />
        <CardContent className="relative p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Saúde Geral</p>
              <div className="flex items-end gap-2">
                <p className={cn(
                  'text-5xl font-bold tracking-tight',
                  overallStatus === 'ok' && 'text-emerald-400',
                  overallStatus === 'warning' && 'text-amber-400',
                  overallStatus === 'critical' && 'text-red-400',
                )}>
                  {globalRiskScore}<span className="text-xl text-muted-foreground">%</span>
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  overallStatus === 'ok' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                  overallStatus === 'warning' && 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                  overallStatus === 'critical' && 'border-red-500/30 bg-red-500/10 text-red-400',
                )}>
                  {overallStatus === 'ok' ? 'Protected' : overallStatus === 'warning' ? 'Attention' : 'Critical'}
                </span>
                {paranoidMode && (
                  <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400">
                    Paranoid ON
                  </Badge>
                )}
                {isProTier && (
                  <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400 gap-1">
                    PRO
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick counters */}
            <div className="grid grid-cols-3 gap-2">
              <Counter label="OK" value={okCount} color="text-emerald-400" bg="bg-emerald-500/10" />
              <Counter label="Warnings" value={warningCount} color="text-amber-400" bg="bg-amber-500/10" />
              <Counter label="Critical" value={criticalCount} color="text-red-400" bg="bg-red-500/10" />
            </div>
          </div>

          {/* Last scan */}
          <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 animate-pulse text-emerald-400" />
              <span>Last protection scan: <span className="text-emerald-400 font-medium">18 seconds ago</span></span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1.5">
              <RefreshCw className="h-3 w-3" /> Run scan now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed checks grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {checks.map((check) => {
          const Icon = check.icon
          return (
            <Card key={check.id} className={cn(
              'border',
              check.status === 'ok' && 'border-emerald-500/20',
              check.status === 'warning' && 'border-amber-500/30',
              check.status === 'critical' && 'border-red-500/30',
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                    check.status === 'ok' && 'bg-emerald-500/10 text-emerald-400',
                    check.status === 'warning' && 'bg-amber-500/10 text-amber-400',
                    check.status === 'critical' && 'bg-red-500/10 text-red-400',
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{check.label}</p>
                      {check.status === 'ok' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : check.status === 'warning' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action recommendations */}
      {criticalCount > 0 && (
        <Card className="border-2 border-red-500/40 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-red-400">
              <ShieldAlert className="h-4 w-4" /> Ação recomendada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nftApprovals.length > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div>
                  <p className="text-sm font-semibold text-red-400">Revogar NFT approvals</p>
                  <p className="text-[11px] text-muted-foreground">{nftApprovals.length} setApprovalForAll ativos — risco crítico</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10">
                  Revogar
                </Button>
              </div>
            )}
            {erc20Approvals.filter(a => a.isInfinite).length > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div>
                  <p className="text-sm font-semibold text-amber-400">Revogar approves infinitos</p>
                  <p className="text-[11px] text-muted-foreground">{erc20Approvals.filter(a => a.isInfinite).length} aprovações ilimitadas ativas</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                  Revisar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Counter({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={cn('rounded-xl border border-border/40 p-3 text-center', bg)}>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
    </div>
  )
}
