'use client'

import { useMemo } from 'react'
import { useWallet } from './wallet-context'
import { CHAINS, chainById } from '@/lib/wallet/data'
import { ChainBadge, RiskBadge, TokenAvatar } from './common'
import { formatTokenAmount, formatUsd, timeAgo } from '@/lib/wallet/security'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Lock, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Zap, Activity, Star, Globe2, KeyRound, Power } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WalletView } from './wallet-sidebar'

export function DashboardView({ onViewChange }: { onViewChange: (v: WalletView) => void }) {
  const {
    tokens,
    vaultTokens,
    transactions,
    blockedTokens,
    securityEvents,
    realBalances,
    loadingBalances,
    erc20Approvals,
    nftApprovals,
    sessions,
    globalRiskScore,
  } = useWallet()

  const totalBalance = useMemo(
    () => tokens.reduce((acc, t) => acc + t.balance * t.priceUsd, 0),
    [tokens]
  )
  const vaultBalance = useMemo(
    () => vaultTokens.reduce((acc, t) => acc + t.balance * t.priceUsd, 0),
    [vaultTokens]
  )
  const totalChange24h = useMemo(() => {
    return tokens.reduce((acc, t) => acc + (t.balance * t.priceUsd * t.change24h) / 100, 0)
  }, [tokens])

  const perChainBalance = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of tokens) {
      map.set(t.chain, (map.get(t.chain) ?? 0) + t.balance * t.priceUsd)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [tokens])

  // Wallet Health metrics
  const threatsBlocked = blockedTokens.length + securityEvents.filter(e => e.severity === 'critical').length
  const openPermissions = erc20Approvals.length + nftApprovals.length + sessions.length
  const connectedDapps = sessions.length
  const healthStars = globalRiskScore >= 90 ? 5 : globalRiskScore >= 75 ? 4 : globalRiskScore >= 60 ? 3 : globalRiskScore >= 40 ? 2 : 1
  const healthStatus = globalRiskScore >= 90 ? 'Protected' : globalRiskScore >= 70 ? 'Good' : globalRiskScore >= 45 ? 'Attention' : 'Critical'

  return (
    <div className="space-y-6">
      {/* Wallet Health hero panel */}
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
        <CardContent className="relative p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            {/* Left: Health + balance */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Wallet Health</p>
                <span className={cn(
                  'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                  healthStatus === 'Protected' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                  healthStatus === 'Good' && 'border-teal-500/30 bg-teal-500/10 text-teal-400',
                  healthStatus === 'Attention' && 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                  healthStatus === 'Critical' && 'border-red-500/30 bg-red-500/10 text-red-400',
                )}>
                  {healthStatus}
                </span>
              </div>
              <div className="flex items-end gap-3">
                <p className={cn(
                  'text-4xl font-bold tracking-tight',
                  globalRiskScore >= 70 ? 'text-emerald-400' : globalRiskScore >= 45 ? 'text-amber-400' : 'text-red-400'
                )}>
                  {globalRiskScore}<span className="text-lg text-muted-foreground">/100</span>
                </p>
                <div className="flex items-center gap-0.5 pb-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        'h-3.5 w-3.5',
                        s <= healthStars ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Balance (hot wallet)</p>
                <p className="text-2xl font-bold tracking-tight">{formatUsd(totalBalance)}</p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {totalChange24h >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span className={cn('font-medium', totalChange24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {totalChange24h >= 0 ? '+' : ''}{formatUsd(totalChange24h)} (24h)
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => onViewChange('receive')} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <ArrowDownToLine className="h-4 w-4" /> Receive
                </Button>
                <Button onClick={() => onViewChange('send')} size="sm" variant="outline" className="gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                  <ArrowUpFromLine className="h-4 w-4" /> Send
                </Button>
                <Button onClick={() => onViewChange('vault')} size="sm" variant="outline" className="gap-2">
                  <Lock className="h-4 w-4" /> Vault
                </Button>
                <Button onClick={() => onViewChange('scanner')} size="sm" variant="outline" className="gap-2">
                  <Zap className="h-4 w-4" /> Scan
                </Button>
              </div>
            </div>

            {/* Right: Quick stats grid */}
            <div className="grid grid-cols-2 gap-2 min-w-[260px]">
              <QuickStat
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Risk Score"
                value={String(globalRiskScore)}
                color="text-emerald-400"
                bg="bg-emerald-500/10"
                onClick={() => onViewChange('health')}
              />
              <QuickStat
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                label="Threats Blocked"
                value={String(threatsBlocked)}
                color="text-red-400"
                bg="bg-red-500/10"
                onClick={() => onViewChange('risk')}
              />
              <QuickStat
                icon={<KeyRound className="h-3.5 w-3.5" />}
                label="Permissions"
                value={String(openPermissions)}
                color={openPermissions > 0 ? 'text-amber-400' : 'text-emerald-400'}
                bg={openPermissions > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}
                onClick={() => onViewChange('permissions')}
              />
              <QuickStat
                icon={<Globe2 className="h-3.5 w-3.5" />}
                label="Connected DApps"
                value={String(connectedDapps)}
                color="text-blue-400"
                bg="bg-blue-500/10"
                onClick={() => onViewChange('sovereignty')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chains grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Connected Networks</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {loadingBalances ? 'syncing…' : 'auto-configured'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {CHAINS.map((chain) => {
              const bal = perChainBalance.find(([id]) => id === chain.id)?.[1] ?? 0
              const realBal = realBalances[chain.id]
              return (
                <div
                  key={chain.id}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-3 transition-all hover:border-border"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                      style={{ backgroundColor: `${chain.color}20`, color: chain.color }}
                    >
                      {chain.glyph}
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
                  </div>
                  <p className="mt-2 text-xs font-semibold">{chain.shortLabel}</p>
                  <p className="text-[10px] text-muted-foreground">{chain.name}</p>
                  {realBal && realBal.loaded ? (
                    <p className="mt-1 text-xs font-bold text-foreground/80">
                      {formatTokenAmount(parseFloat(realBal.balanceEther), 6)} {chain.symbol}
                    </p>
                  ) : realBal && !realBal.loaded ? (
                    <p className="mt-1 text-[10px] text-muted-foreground/60">RPC off</p>
                  ) : (
                    <p className="mt-1 text-xs font-bold text-foreground/80">
                      {bal > 0 ? formatUsd(bal) : '—'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Token list */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Assets</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{tokens.length} active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {tokens.map((t) => {
              const chain = chainById(t.chain)
              return (
                <div
                  key={t.id}
                  className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-border/60 hover:bg-muted/30"
                >
                  <div className="relative">
                    <TokenAvatar symbol={t.symbol} color={t.logoColor} />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background"
                      style={{ backgroundColor: chain.color }}
                      title={chain.name}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{t.symbol}</p>
                      <ChainBadge chainId={t.chain} />
                      {t.verified && (
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{t.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatTokenAmount(t.balance, t.decimals)}</p>
                    <p className="text-xs text-muted-foreground">{formatUsd(t.balance * t.priceUsd)}</p>
                  </div>
                  <div className="hidden w-16 text-right sm:block">
                    <p className={cn('text-xs font-medium', t.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => onViewChange('activity')}>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {transactions.slice(0, 8).map((tx) => {
              const Icon =
                tx.type === 'send' ? ArrowUpFromLine : tx.type === 'receive' ? ArrowDownToLine : tx.type === 'vault-move' ? Lock : ArrowRightLeft
              const iconColor =
                tx.status === 'blocked'
                  ? 'text-red-400 bg-red-500/10'
                  : tx.type === 'send'
                  ? 'text-amber-400 bg-amber-500/10'
                  : tx.type === 'receive'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-blue-400 bg-blue-500/10'
              return (
                <div key={tx.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconColor)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-medium capitalize">
                        {tx.type === 'vault-move' ? 'Vault' : tx.type === 'send' ? 'Sent' : tx.type === 'receive' ? 'Received' : tx.type}
                      </p>
                      <ChainBadge chainId={tx.chain} />
                      {tx.status === 'blocked' && <RiskBadge level="blocked" />}
                    </div>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {timeAgo(tx.timestamp)} · {tx.counterparty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-xs font-semibold', tx.status === 'blocked' && 'text-red-400 line-through')}>
                      {tx.amount > 0 ? formatTokenAmount(tx.amount) : '—'} {tx.tokenSymbol}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {tx.usdValue > 0 ? formatUsd(tx.usdValue) : 'blocked'}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Security alerts preview */}
      {securityEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Security Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => onViewChange('risk')}>
                Risk Center
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {securityEvents.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-3',
                  ev.severity === 'critical'
                    ? 'border-red-500/30 bg-red-500/5'
                    : ev.severity === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border/50 bg-muted/20'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                    ev.severity === 'critical' ? 'bg-red-500' : ev.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{ev.title}</p>
                  <p className="text-[11px] text-muted-foreground">{ev.description}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(ev.timestamp)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function QuickStat({
  icon,
  label,
  value,
  color,
  bg,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bg: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/40 p-2.5 text-left transition-all hover:border-border hover:bg-background/60"
    >
      <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg shrink-0', bg, color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={cn('text-sm font-bold', color)}>{value}</p>
      </div>
    </button>
  )
}
