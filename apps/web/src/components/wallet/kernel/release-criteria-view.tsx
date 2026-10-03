'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Target, CheckCircle2, XCircle, TrendingUp, Bug, Shield, FileCheck, Award, Clock, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReleaseCriteria {
  category: string
  metric: string
  target: string
  current: string
  status: 'done' | 'in_progress' | 'planned'
  icon: typeof Target
}

const CRITERIA: ReleaseCriteria[] = [
  {
    category: 'Testing',
    metric: 'Cobertura de testes',
    target: '≥95%',
    current: '~10% (manual testing only)',
    status: 'planned',
    icon: TrendingUp,
  },
  {
    category: 'Testing',
    metric: 'Testes de integração',
    target: '100% dos fluxos críticos',
    current: 'Manual E2E via Agent Browser',
    status: 'planned',
    icon: Bug,
  },
  {
    category: 'Testing',
    metric: 'Testes E2E',
    target: 'Fluxos completos (criar, recuperar, enviar, swap, revogar)',
    current: 'Manual via Agent Browser',
    status: 'planned',
    icon: Bug,
  },
  {
    category: 'Testing',
    metric: 'Fuzz testing',
    target: 'Todos os parsers e motores criptográficos',
    current: 'Não iniciado',
    status: 'planned',
    icon: Bug,
  },
  {
    category: 'Audit',
    metric: 'Auditorias externas',
    target: 'Pelo menos 2 independentes',
    current: 'Não iniciado',
    status: 'planned',
    icon: Award,
  },
  {
    category: 'Dependencies',
    metric: 'Dependências críticas',
    target: '0 vulnerabilidades conhecidas de alta severidade',
    current: 'npm audit pendente',
    status: 'in_progress',
    icon: Shield,
  },
  {
    category: 'Threat Intel',
    metric: 'Tempo para aplicar inteligência de ameaças',
    target: '<5 minutos para indicadores críticos',
    current: 'Manual seed (workers planejados)',
    status: 'in_progress',
    icon: Clock,
  },
  {
    category: 'Decision Engine',
    metric: 'Falsos positivos',
    target: 'Meta definida e monitorada',
    current: 'Não medido ainda',
    status: 'planned',
    icon: Activity,
  },
  {
    category: 'Privacy',
    metric: 'Telemetria',
    target: 'Opcional, anonimizada e desativada por padrão',
    current: 'Nenhuma telemetria implementada',
    status: 'done',
    icon: FileCheck,
  },
]

export function ReleaseCriteriaView() {
  const done = CRITERIA.filter(c => c.status === 'done').length
  const inProgress = CRITERIA.filter(c => c.status === 'in_progress').length
  const planned = CRITERIA.filter(c => c.status === 'planned').length
  const total = CRITERIA.length
  const percentage = Math.round((done / total) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Target className="h-6 w-6 text-emerald-400" />
          v1.0 Release Criteria
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Critérios objetivos para o lançamento da versão 1.0.
        </p>
      </div>

      {/* Progress */}
      <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl bg-amber-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">v1.0 Readiness</p>
              <p className="text-5xl font-bold text-amber-400">{percentage}<span className="text-xl text-muted-foreground">%</span></p>
              <p className="text-xs text-muted-foreground mt-1">{done}/{total} criteria met</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400 mb-1" />
                <p className="text-2xl font-bold text-emerald-400">{done}</p>
                <p className="text-[9px] uppercase text-muted-foreground">Done</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                <Activity className="mx-auto h-4 w-4 text-amber-400 mb-1" />
                <p className="text-2xl font-bold text-amber-400">{inProgress}</p>
                <p className="text-[9px] uppercase text-muted-foreground">In Progress</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3 text-center">
                <XCircle className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-2xl font-bold text-muted-foreground">{planned}</p>
                <p className="text-[9px] uppercase text-muted-foreground">Planned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CRITERIA.map((c, i) => {
            const Icon = c.icon
            return (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-3',
                  c.status === 'done' && 'border-emerald-500/20 bg-emerald-500/5',
                  c.status === 'in_progress' && 'border-amber-500/30 bg-amber-500/5',
                  c.status === 'planned' && 'border-border/50 bg-muted/20'
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                  c.status === 'done' && 'bg-emerald-500/10 text-emerald-400',
                  c.status === 'in_progress' && 'bg-amber-500/10 text-amber-400',
                  c.status === 'planned' && 'bg-muted/40 text-muted-foreground'
                )}>
                  {c.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : c.status === 'in_progress' ? (
                    <Activity className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Icon className="h-4 w-4 opacity-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{c.metric}</p>
                    <Badge variant="outline" className="text-[8px]">{c.category}</Badge>
                    {c.status === 'done' && (
                      <Badge variant="outline" className="text-[8px] border-emerald-500/40 text-emerald-400">✓ DONE</Badge>
                    )}
                    {c.status === 'in_progress' && (
                      <Badge variant="outline" className="text-[8px] border-amber-500/40 text-amber-400">IN PROGRESS</Badge>
                    )}
                    {c.status === 'planned' && (
                      <Badge variant="outline" className="text-[8px] border-muted-foreground/40 text-muted-foreground">PLANNED</Badge>
                    )}
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Target: </span>
                      <span className="font-medium text-foreground">{c.target}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current: </span>
                      <span className="text-muted-foreground">{c.current}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Goal statement */}
      <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-400">Objetivo</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Com esses elementos, a Tank Wallet deixa de ser apenas um conjunto de engines independentes
                e passa a operar como um <strong className="text-foreground">sistema de decisão de segurança</strong>,
                em que todos os motores contribuem para uma decisão única, explicável, auditável e consistente
                antes de qualquer interação com a blockchain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
