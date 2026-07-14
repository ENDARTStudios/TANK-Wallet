'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck, Database, Ban, Globe, AlertTriangle, Skull, RefreshCw, Loader2,
  TrendingDown, Clock, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getThreatStats, seedThreatDatabase, queryExploits,
  type ThreatExploit,
} from '@/lib/wallet-engines/threat-intel'

interface Stats {
  tokens: number
  sites: number
  addresses: number
  exploits: number
  total: number
}

export function ThreatIntelView() {
  const { toast } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [exploits, setExploits] = useState<ThreatExploit[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [s, e] = await Promise.all([
      getThreatStats(),
      queryExploits(false),
    ])
    setStats(s)
    setExploits(e)
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [s, e] = await Promise.all([
        getThreatStats(),
        queryExploits(false),
      ])
      if (mounted) {
        setStats(s)
        setExploits(e)
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleSeed = async () => {
    setSeeding(true)
    const result = await seedThreatDatabase()
    if (result) {
      toast({
        title: 'Database populated',
        description: `${result.seeded.tokens} tokens, ${result.seeded.sites} sites, ${result.seeded.addresses} addresses, ${result.seeded.exploits} exploits`,
      })
      loadData()
    }
    setSeeding(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-400" />
            Threat Intelligence
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Backend próprio de inteligência de ameaças. Atualização contínua por workers.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-emerald-500/40 text-emerald-400 shrink-0"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Atualizar
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ThreatStat
          icon={<Ban className="h-4 w-4" />}
          label="Malicious Tokens"
          value={stats?.tokens ?? 0}
          color="text-red-400"
          bg="bg-red-500/10"
        />
        <ThreatStat
          icon={<Globe className="h-4 w-4" />}
          label="Phishing Sites"
          value={stats?.sites ?? 0}
          color="text-orange-400"
          bg="bg-orange-500/10"
        />
        <ThreatStat
          icon={<Skull className="h-4 w-4" />}
          label="Bad Addresses"
          value={stats?.addresses ?? 0}
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
        <ThreatStat
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Known Exploits"
          value={stats?.exploits ?? 0}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
      </div>

      {/* Total + seed button */}
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Threats Tracked</p>
              <p className="text-4xl font-bold text-emerald-400">{stats?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Banco de dados próprio · atualizado continuamente
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 gap-1">
                <ShieldCheck className="h-3 w-3" /> Active
              </Badge>
              <Button
                onClick={handleSeed}
                disabled={seeding}
                size="sm"
                variant="outline"
                className="gap-2 border-emerald-500/40 text-emerald-400"
              >
                {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
                Seed database
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Sources</CardTitle>
          <p className="text-xs text-muted-foreground">
            A Threat Intelligence agrega sinais de múltiplas fontes.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { name: 'GoPlus Security', status: 'active', desc: 'Token + address security' },
              { name: 'ChainPatrol', status: 'planned', desc: 'Phishing URLs' },
              { name: 'ScamSniffer', status: 'planned', desc: 'Drainer addresses' },
              { name: 'HashDit', status: 'planned', desc: 'Transaction simulation' },
              { name: 'PhishFort', status: 'planned', desc: 'Real-time blocking' },
              { name: 'Tank AI Engine', status: 'active', desc: 'Pattern detection' },
              { name: 'Community reports', status: 'active', desc: 'User-submitted threats' },
              { name: 'OFAC sanctions', status: 'active', desc: 'Sanctioned addresses' },
              { name: 'Internal heuristics', status: 'active', desc: 'Auto-detection' },
            ].map((src) => (
              <div
                key={src.name}
                className={cn(
                  'rounded-lg border p-2.5',
                  src.status === 'active'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-border/50 bg-muted/20'
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold truncate">{src.name}</p>
                  <span className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    src.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                  )} />
                </div>
                <p className="text-[10px] text-muted-foreground">{src.desc}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[8px] mt-1',
                    src.status === 'active'
                      ? 'border-emerald-500/40 text-emerald-400'
                      : 'border-muted-foreground/40 text-muted-foreground'
                  )}
                >
                  {src.status === 'active' ? 'ACTIVE' : 'PLANNED'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Known exploits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Skull className="h-4 w-4 text-red-400" />
            Known Exploits
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Histórico de exploits para análise de risco e referência.
          </p>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {exploits.length === 0 && !loading && (
            <div className="py-8 text-center">
              <Skull className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhum exploit cadastrado</p>
            </div>
          )}
          {exploits.map((e, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-muted/20 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{e.protocolName}</p>
                    <Badge variant="outline" className="text-[9px] capitalize">{e.category}</Badge>
                    {e.active && (
                      <Badge variant="outline" className="text-[9px] border-red-500/40 text-red-400">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{e.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(e.exploitedAt).toLocaleDateString('pt-BR')}
                    </span>
                    {e.lossUsd && (
                      <span className="flex items-center gap-1 text-red-400">
                        <TrendingDown className="h-2.5 w-2.5" />
                        ${e.lossUsd.toLocaleString('en-US')} lost
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* API reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-emerald-400" />
            API Endpoints
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Consulta pública para integração com outros módulos.
          </p>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/threats/token?chain=X&address=Y', desc: 'Query malicious token' },
            { method: 'GET', path: '/api/threats/site?url=X', desc: 'Query phishing site' },
            { method: 'GET', path: '/api/threats/address?chain=X&address=Y', desc: 'Query bad address' },
            { method: 'GET', path: '/api/threats/exploit', desc: 'List known exploits' },
            { method: 'POST', path: '/api/threats/token', desc: 'Submit new threat (community)' },
            { method: 'POST', path: '/api/threats/seed', desc: 'Seed database (admin)' },
          ].map((api, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] font-mono shrink-0',
                  api.method === 'GET'
                    ? 'border-emerald-500/40 text-emerald-400'
                    : 'border-amber-500/40 text-amber-400'
                )}
              >
                {api.method}
              </Badge>
              <code className="text-[10px] font-mono text-foreground/80 truncate flex-1">{api.path}</code>
              <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">{api.desc}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ThreatStat({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', bg, color)}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={cn('text-xl font-bold', color)}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
