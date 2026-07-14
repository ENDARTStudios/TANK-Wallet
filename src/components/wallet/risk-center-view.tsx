'use client'

import { useState, useMemo } from 'react'
import { useWallet } from './wallet-context'
import { chainById } from '@/lib/wallet/data'
import { formatTokenAmount, formatUsd, timeAgo } from '@/lib/wallet/security'
import { ChainBadge, RiskBadge } from './common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Ban, AlertTriangle, ShieldCheck, Clock, Globe, Trash2, Activity, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RiskCenterView() {
  const { securityEvents, blockedTokens, blockedSites, transactions, clearSecurityEvents, removeBlockedToken } = useWallet()

  const blockedCount = useMemo(
    () => transactions.filter((t) => t.status === 'blocked').length,
    [transactions]
  )
  const suspiciousCount = useMemo(
    () => transactions.filter((t) => t.risk.level === 'medium' || t.risk.level === 'high').length,
    [transactions]
  )
  const criticalEvents = useMemo(
    () => securityEvents.filter((e) => e.severity === 'critical').length,
    [securityEvents]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Central de Risco</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Histórico completo de ataques bloqueados, tokens maliciosos, sites phishing e transações suspeitas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Ban className="h-4 w-4" />} label="Tokens bloqueados" value={blockedTokens.length} color="text-red-400" bg="bg-red-500/10" />
        <StatCard icon={<Globe className="h-4 w-4" />} label="Sites bloqueados" value={blockedSites.length} color="text-orange-400" bg="bg-orange-500/10" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Transações suspeitas" value={suspiciousCount} color="text-amber-400" bg="bg-amber-500/10" />
        <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="Alertas críticos" value={criticalEvents} color="text-red-400" bg="bg-red-500/10" />
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Eventos de segurança</TabsTrigger>
          <TabsTrigger value="tokens">Tokens bloqueados</TabsTrigger>
          <TabsTrigger value="sites">Sites bloqueados</TabsTrigger>
          <TabsTrigger value="txs">Transações suspeitas</TabsTrigger>
        </TabsList>

        {/* ============ Events ============ */}
        <TabsContent value="events" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Linha do tempo
                </CardTitle>
                {securityEvents.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-[10px] gap-1" onClick={clearSecurityEvents}>
                    <Trash2 className="h-3 w-3" /> Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {securityEvents.length === 0 && (
                <div className="py-8 text-center">
                  <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400/40" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhum evento registrado</p>
                </div>
              )}
              {securityEvents.map((ev) => {
                const Icon =
                  ev.type === 'blocked-token' ? Ban :
                  ev.type === 'blocked-site' ? Globe :
                  ev.type === 'suspicious-tx' ? AlertTriangle :
                  ev.type === 'vault-access' ? ShieldCheck : ShieldAlert
                const color =
                  ev.severity === 'critical' ? 'text-red-400 bg-red-500/10' :
                  ev.severity === 'warning' ? 'text-amber-400 bg-amber-500/10' :
                  'text-emerald-400 bg-emerald-500/10'
                return (
                  <div key={ev.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold">{ev.title}</p>
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
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{ev.description}</p>
                      {ev.related && (
                        <p className="mt-1 text-[10px] font-mono text-muted-foreground/70">{ev.related}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(ev.timestamp)}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Blocked tokens ============ */}
        <TabsContent value="tokens" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ban className="h-4 w-4 text-red-400" />
                Blocklist de tokens ({blockedTokens.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {blockedTokens.map((bt) => {
                const chain = chainById(bt.chain)
                return (
                  <div key={bt.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                          style={{ backgroundColor: `${chain.color}20`, color: chain.color }}
                        >
                          {bt.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{bt.symbol}</p>
                            <ChainBadge chainId={bt.chain} />
                          </div>
                          <p className="text-[11px] text-muted-foreground">{bt.name}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[9px] h-5',
                          bt.source === 'auto' && 'border-emerald-500/40 text-emerald-400',
                          bt.source === 'community' && 'border-teal-500/40 text-teal-400',
                          bt.source === 'manual' && 'border-zinc-500/40 text-zinc-400'
                        )}
                      >
                        {bt.source === 'auto' ? 'Auto' : bt.source === 'community' ? 'Comunidade' : 'Manual'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-background/40 px-2 py-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Contrato:</span>
                      <code className="flex-1 truncate text-[10px] font-mono">{bt.contract}</code>
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
                      <p className="text-[11px] text-muted-foreground">{bt.reason}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {timeAgo(bt.blockedAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => removeBlockedToken(bt.id)}
                      >
                        <Trash2 className="h-2.5 w-2.5" /> Remover
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Blocked sites ============ */}
        <TabsContent value="sites" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-orange-400" />
                Sites bloqueados ({blockedSites.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {blockedSites.map((site) => (
                <div key={site.id} className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                    <Ban className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs">{site.url}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{site.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className="text-[9px] h-4 border-red-500/40 text-red-400">
                      {site.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(site.blockedAt)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Suspicious / blocked transactions ============ */}
        <TabsContent value="txs" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Transações suspeitas e bloqueadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {transactions
                .filter((t) => t.status === 'blocked' || t.risk.level === 'medium' || t.risk.level === 'high')
                .map((tx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      'rounded-xl border p-3',
                      tx.status === 'blocked' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg',
                          tx.status === 'blocked' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                        )}>
                          {tx.status === 'blocked' ? <Ban className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold capitalize">
                              {tx.type === 'receive' ? 'Recebimento' : tx.type === 'send' ? 'Envio' : tx.type === 'vault-move' ? 'Cofre' : tx.type}
                            </p>
                            <ChainBadge chainId={tx.chain} />
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono">{tx.counterparty}</p>
                        </div>
                      </div>
                      <RiskBadge level={tx.risk.level} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor</p>
                        <p className={cn('font-semibold', tx.status === 'blocked' && 'text-red-400 line-through')}>
                          {tx.amount > 0 ? `${formatTokenAmount(tx.amount)} ${tx.tokenSymbol}` : '—'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {tx.usdValue > 0 ? formatUsd(tx.usdValue) : 'bloqueado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Quando</p>
                        <p className="font-medium">{timeAgo(tx.timestamp)}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{tx.status}</p>
                      </div>
                    </div>
                    <div className="mt-2 rounded-lg bg-background/40 p-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Análise</p>
                      <ul className="space-y-0.5">
                        {tx.risk.reasons.slice(0, 3).map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                            <span className={cn('mt-1 h-1 w-1 shrink-0 rounded-full', tx.status === 'blocked' ? 'bg-red-500' : 'bg-amber-500')} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {tx.note && (
                      <p className="mt-2 text-[11px] italic text-muted-foreground">{tx.note}</p>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bg, color)}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={cn('text-xl font-bold', color)}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
