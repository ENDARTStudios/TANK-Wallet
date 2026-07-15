'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck, ShieldAlert, Shield, Eye, Lock, KeyRound, Activity, FileText, Brain,
  CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TSS_SPECIFICATIONS, checkTssCompliance } from '@/lib/wallet-tss'

const STATUS_META = {
  enforced: { label: 'ENFORCED', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  partial: { label: 'PARTIAL', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10', icon: AlertTriangle },
  planned: { label: 'PLANNED', color: 'border-muted-foreground/40 text-muted-foreground bg-muted/20', icon: XCircle },
}

const SPEC_ICONS: Record<string, typeof ShieldCheck> = {
  'TSS-001': Shield,
  'TSS-002': Eye,
  'TSS-003': Activity,
  'TSS-004': ShieldCheck,
  'TSS-005': KeyRound,
  'TSS-006': Lock,
  'TSS-007': ShieldAlert,
  'TSS-008': Activity,
  'TSS-009': FileText,
  'TSS-010': Brain,
}

export function TssView() {
  const compliance = checkTssCompliance()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          Tank Security Standard (TSS)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Especificação técnica oficial. Toda funcionalidade deve atender aos requisitos abaixo.
        </p>
      </div>

      {/* Compliance overview */}
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl bg-emerald-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">TSS Compliance</p>
              <p className="text-5xl font-bold text-emerald-400">{compliance.percentage}<span className="text-xl text-muted-foreground">%</span></p>
              <p className="text-xs text-muted-foreground mt-1">{compliance.enforced}/{compliance.total} specs enforced</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400 mb-1" />
                <p className="text-2xl font-bold text-emerald-400">{compliance.enforced}</p>
                <p className="text-[9px] uppercase text-muted-foreground">Enforced</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                <AlertTriangle className="mx-auto h-4 w-4 text-amber-400 mb-1" />
                <p className="text-2xl font-bold text-amber-400">{compliance.partial}</p>
                <p className="text-[9px] uppercase text-muted-foreground">Partial</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3 text-center">
                <XCircle className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-2xl font-bold text-muted-foreground">{compliance.planned}</p>
                <p className="text-[9px] uppercase text-muted-foreground">Planned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TSS specifications */}
      <div className="space-y-3">
        {TSS_SPECIFICATIONS.map(spec => {
          const Icon = SPEC_ICONS[spec.id] ?? ShieldCheck
          const status = STATUS_META[spec.status]
          const StatusIcon = status.icon
          return (
            <Card key={spec.id} className={cn(
              'border-l-4',
              spec.status === 'enforced' && 'border-l-emerald-500',
              spec.status === 'partial' && 'border-l-amber-500',
              spec.status === 'planned' && 'border-l-muted-foreground/40'
            )}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* ID + Icon */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{spec.id}</span>
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      spec.status === 'enforced' && 'bg-emerald-500/10 text-emerald-400',
                      spec.status === 'partial' && 'bg-amber-500/10 text-amber-400',
                      spec.status === 'planned' && 'bg-muted/40 text-muted-foreground'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold">{spec.title}</h3>
                      <Badge variant="outline" className={cn('text-[9px]', status.color)}>
                        <StatusIcon className="h-2.5 w-2.5 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-semibold italic text-muted-foreground">"{spec.principle}"</p>
                    <p className="mt-2 text-xs text-muted-foreground">{spec.description}</p>

                    {/* Requirements */}
                    <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Requirements</p>
                      <ul className="space-y-1">
                        {spec.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                            <span className={cn(
                              'mt-1 h-1 w-1 shrink-0 rounded-full',
                              spec.status === 'enforced' ? 'bg-emerald-500' : spec.status === 'partial' ? 'bg-amber-500' : 'bg-muted-foreground/40'
                            )} />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Applies to */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {spec.appliesTo.map(target => (
                        <Badge key={target} variant="outline" className="text-[8px]">
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Disclaimer */}
      <Card className="border-2 border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400">Princípio Arquitetural</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mesmo com todas essas camadas, é importante não prometer proteção absoluta. Nenhuma hot wallet
                consegue impedir todos os ataques, especialmente quando a blockchain executa uma transação válida
                assinada pelo próprio usuário ou quando há vulnerabilidades externas ainda desconhecidas (zero-days).
                O objetivo da Tank é <strong className="text-foreground">reduzir drasticamente a superfície de ataque</strong>,
                identificar riscos antes da assinatura, aplicar políticas preventivas e oferecer ao usuário o máximo
                de contexto e controle possível.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
