'use client'

import { useWallet } from '../wallet-context'
import { chainById } from '@/lib/wallet/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  History, KeyRound, Ban, Globe, Power, Shield, Clock, ArrowDown, Zap,
  CheckCircle2, AlertTriangle, Activity, ArrowRightLeft, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  timestamp: number
  time: string
  date: string
  icon: typeof KeyRound
  iconBg: string
  iconColor: string
  title: string
  description: string
  chain?: string
  tag: string
  tagColor: string
  connected?: boolean // shows arrow ↓ to next
}

export function TimelineView() {
  const { permissionHistory, securityEvents, transactions, sessions } = useWallet()

  // Build timeline with chronological ordering
  const events: TimelineEvent[] = [
    ...permissionHistory.map(p => {
      const isGranted = p.type === 'granted'
      const isRevoked = p.type === 'revoked'
      return {
        id: p.id,
        timestamp: p.timestamp,
        time: new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        date: new Date(p.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        icon: isGranted ? KeyRound : isRevoked ? Ban : Clock,
        iconBg: isGranted ? 'bg-amber-500/10' : isRevoked ? 'bg-emerald-500/10' : 'bg-muted',
        iconColor: isGranted ? 'text-amber-400' : isRevoked ? 'text-emerald-400' : 'text-muted-foreground',
        title: p.description,
        description: `${p.tokenSymbol ?? '—'} → ${p.spenderName ?? '—'}${p.amount ? ` (${p.amount})` : ''}`,
        chain: p.chain,
        tag: p.permissionType.toUpperCase(),
        tagColor: 'border-blue-500/40 text-blue-400',
        connected: true,
      }
    }),
    ...securityEvents.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      time: new Date(s.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: new Date(s.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      icon: s.severity === 'critical' ? Ban : s.severity === 'warning' ? AlertTriangle : Shield,
      iconBg: s.severity === 'critical' ? 'bg-red-500/10' : s.severity === 'warning' ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      iconColor: s.severity === 'critical' ? 'text-red-400' : s.severity === 'warning' ? 'text-amber-400' : 'text-emerald-400',
      title: s.title,
      description: s.description,
      tag: s.type.toUpperCase().replace('-', ' '),
      tagColor: s.severity === 'critical' ? 'border-red-500/40 text-red-400' : s.severity === 'warning' ? 'border-amber-500/40 text-amber-400' : 'border-emerald-500/40 text-emerald-400',
      related: s.related,
      connected: true,
    } as TimelineEvent)),
    ...transactions.slice(0, 15).map(t => ({
      id: t.id,
      timestamp: t.timestamp,
      time: new Date(t.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: new Date(t.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      icon: t.type === 'send' ? Power : t.type === 'receive' ? ArrowDown : t.type === 'vault-move' ? Shield : ArrowRightLeft,
      iconBg: t.status === 'blocked' ? 'bg-red-500/10' : t.type === 'send' ? 'bg-amber-500/10' : t.type === 'receive' ? 'bg-emerald-500/10' : 'bg-blue-500/10',
      iconColor: t.status === 'blocked' ? 'text-red-400' : t.type === 'send' ? 'text-amber-400' : t.type === 'receive' ? 'text-emerald-400' : 'text-blue-400',
      title: `${t.type === 'send' ? 'Sent' : t.type === 'receive' ? 'Received' : t.type === 'vault-move' ? 'Vault Move' : t.type} · ${t.tokenSymbol}`,
      description: `${t.amount > 0 ? t.amount.toFixed(4) : '—'} ${t.tokenSymbol} · ${t.counterparty}`,
      chain: t.chain,
      tag: t.status === 'blocked' ? 'BLOCKED' : t.type.toUpperCase(),
      tagColor: t.status === 'blocked' ? 'border-red-500/40 text-red-400' : 'border-blue-500/40 text-blue-400',
      connected: true,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  // Group by day
  const grouped = new Map<string, TimelineEvent[]>()
  for (const ev of events) {
    const day = ev.date
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(ev)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-emerald-400" />
          Security Timeline
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Linha do tempo visual completa — toda ação, do connect ao revoke, conectada em sequência.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Events</p>
                <p className="text-lg font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Permissions</p>
                <p className="text-lg font-bold">{permissionHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Ban className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Blocked</p>
                <p className="text-lg font-bold">{securityEvents.filter(e => e.severity === 'critical').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Globe className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Sessions</p>
                <p className="text-lg font-bold">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity Flow</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="py-12 text-center">
              <History className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No events yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(grouped.entries()).map(([day, dayEvents]) => (
                <div key={day}>
                  {/* Day header */}
                  <div className="sticky top-0 z-10 bg-background/80 backdrop-blur py-1.5 -mx-2 px-2 mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {day}
                    </p>
                  </div>

                  {/* Events with connecting arrows */}
                  <div className="space-y-0">
                    {dayEvents.map((ev, idx) => {
                      const Icon = ev.icon
                      const isLast = idx === dayEvents.length - 1
                      return (
                        <div key={ev.id} className="flex gap-3">
                          {/* Time + icon column */}
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono text-muted-foreground/70 mb-1">{ev.time}</span>
                            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', ev.iconBg, ev.iconColor)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {!isLast && (
                              <div className="w-px flex-1 bg-border/40 my-1" style={{ minHeight: '20px' }} />
                            )}
                          </div>

                          {/* Content */}
                          <div className={cn('flex-1 pb-4', !isLast && 'border-l-0')}>
                            <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-semibold">{ev.title}</p>
                                    <Badge variant="outline" className={cn('text-[8px] h-4', ev.tagColor)}>
                                      {ev.tag}
                                    </Badge>
                                    {ev.chain && (
                                      <Badge variant="outline" className="text-[8px] h-4">
                                        {chainById(ev.chain).shortLabel}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{ev.description}</p>
                                </div>
                              </div>
                            </div>
                            {!isLast && (
                              <div className="flex items-center gap-1 ml-4 mt-1 text-[9px] text-muted-foreground/40">
                                <ArrowDown className="h-2.5 w-2.5" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
