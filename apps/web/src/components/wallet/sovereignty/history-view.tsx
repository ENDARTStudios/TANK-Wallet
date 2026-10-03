'use client'

import { useWallet } from '../wallet-context'
import { chainById } from '@/lib/wallet/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, KeyRound, Ban, Globe, Power, Shield, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HistoryView() {
  const { permissionHistory, securityEvents, transactions } = useWallet()

  // Combine permission events + security events + transactions into one timeline
  type TimelineEvent = {
    id: string
    timestamp: number
    type: 'permission' | 'security' | 'transaction'
    icon: typeof KeyRound
    iconColor: string
    iconBg: string
    title: string
    description: string
    chain?: string
    severity?: string
  }

  const timeline: TimelineEvent[] = [
    ...permissionHistory.map((p) => ({
      id: p.id,
      timestamp: p.timestamp,
      type: 'permission' as const,
      icon: p.type === 'granted' ? KeyRound : p.type === 'revoked' ? Ban : Clock,
      iconColor: p.type === 'granted' ? 'text-amber-400' : p.type === 'revoked' ? 'text-emerald-400' : 'text-muted-foreground',
      iconBg: p.type === 'granted' ? 'bg-amber-500/10' : p.type === 'revoked' ? 'bg-emerald-500/10' : 'bg-muted',
      title: p.description,
      description: `${p.tokenSymbol ?? '—'} → ${p.spenderName ?? '—'}${p.amount ? ` (${p.amount})` : ''}`,
      chain: p.chain,
    })),
    ...securityEvents.map((s) => ({
      id: s.id,
      timestamp: s.timestamp,
      type: 'security' as const,
      icon: s.severity === 'critical' ? Ban : s.severity === 'warning' ? Shield : Power,
      iconColor: s.severity === 'critical' ? 'text-red-400' : s.severity === 'warning' ? 'text-amber-400' : 'text-emerald-400',
      iconBg: s.severity === 'critical' ? 'bg-red-500/10' : s.severity === 'warning' ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      title: s.title,
      description: s.description,
      severity: s.severity,
    })),
    ...transactions.slice(0, 10).map((t) => ({
      id: t.id,
      timestamp: t.timestamp,
      type: 'transaction' as const,
      icon: t.type === 'send' ? Power : t.type === 'receive' ? KeyRound : t.type === 'vault-move' ? Shield : Globe,
      iconColor: t.status === 'blocked' ? 'text-red-400' : t.type === 'send' ? 'text-amber-400' : t.type === 'receive' ? 'text-emerald-400' : 'text-blue-400',
      iconBg: t.status === 'blocked' ? 'bg-red-500/10' : t.type === 'send' ? 'bg-amber-500/10' : t.type === 'receive' ? 'bg-emerald-500/10' : 'bg-blue-500/10',
      title: `${t.type === 'send' ? 'Enviado' : t.type === 'receive' ? 'Recebido' : t.type === 'vault-move' ? 'Cofre' : t.type} · ${t.tokenSymbol}`,
      description: `${t.amount > 0 ? t.amount.toFixed(4) : '—'} ${t.tokenSymbol} · ${t.counterparty}`,
      chain: t.chain,
      severity: t.status === 'blocked' ? 'critical' : undefined,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  // Group by day
  const grouped = new Map<string, TimelineEvent[]>()
  for (const ev of timeline) {
    const day = new Date(ev.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(ev)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-emerald-400" />
          Histórico completo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nada desaparece. Toda ação gera um evento — permissões, transações, alertas de segurança.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Linha do tempo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from(grouped.entries()).map(([day, events]) => (
            <div key={day}>
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur py-1.5 -mx-2 px-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {day}
                </p>
              </div>
              <div className="mt-2 space-y-2">
                {events.map((ev) => {
                  const Icon = ev.icon
                  return (
                    <div
                      key={ev.id}
                      className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-3"
                    >
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', ev.iconBg, ev.iconColor)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold">{ev.title}</p>
                          {ev.chain && (
                            <Badge variant="outline" className="text-[9px] h-4">
                              {chainById(ev.chain).shortLabel}
                            </Badge>
                          )}
                          {ev.severity && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[9px] h-4',
                                ev.severity === 'critical' && 'border-red-500/40 text-red-400',
                                ev.severity === 'warning' && 'border-amber-500/40 text-amber-400',
                                ev.severity === 'info' && 'border-emerald-500/40 text-emerald-400'
                              )}
                            >
                              {ev.severity}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[9px] h-4 capitalize">
                            {ev.type === 'permission' ? 'Permissão' : ev.type === 'security' ? 'Segurança' : 'Transação'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{ev.description}</p>
                      </div>
                      <div className="shrink-0 text-[10px] text-muted-foreground text-right">
                        {new Date(ev.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {timeline.length === 0 && (
            <div className="py-12 text-center">
              <History className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">Sem eventos ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
