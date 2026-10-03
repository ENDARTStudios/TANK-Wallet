'use client'

import { useState } from 'react'
import { useWallet } from './wallet-context'
import { DAPPS } from '@/lib/wallet/data'
import { runDappShield, type DappShieldResult } from '@/lib/wallet-scanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Globe, Search, ShieldCheck, ShieldAlert, AlertTriangle, Ban, ExternalLink, Loader2, CheckCircle2, Lock, Globe2, Clock, Award, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SAMPLE_URLS = [
  { url: 'https://app.uniswap.org', label: 'Uniswap (legítimo)' },
  { url: 'https://metarnask-login.com', label: 'Phishing de MetaMask' },
  { url: 'https://opensea-mint-free.io', label: 'Drainer NFT falso' },
  { url: 'https://aave-v3-bonus.com', label: 'Phishing de Aave' },
  { url: 'https://jup.ag', label: 'Jupiter (legítimo)' },
]

const RATING_LABEL: Record<DappShieldResult['rating'], string> = {
  verified: 'Verificado',
  unknown: 'Desconhecido',
  malicious: 'Malicioso',
}

const RATING_COLOR: Record<DappShieldResult['rating'], string> = {
  verified: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  unknown: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  malicious: 'border-red-500/40 bg-red-500/10 text-red-400',
}

export function DappsView() {
  const { blockedSites, addSecurityEvent } = useWallet()
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<DappShieldResult | null>(null)
  const [checkedUrl, setCheckedUrl] = useState('')

  const runCheck = async (target?: string) => {
    const finalUrl = target ?? url
    if (!finalUrl) return
    setScanning(true)
    setResult(null)
    setCheckedUrl(finalUrl)
    if (target) setUrl(target)
    try {
      const r = await runDappShield(finalUrl, blockedSites)
      setResult(r)
      if (r.rating === 'malicious') {
        addSecurityEvent({
          type: 'blocked-site',
          title: 'Site malicioso bloqueado',
          description: `${r.domain} foi bloqueado pelo DApp Shield.`,
          severity: 'critical',
          related: r.domain,
        })
      }
    } catch (e) {
      toast({ title: 'Erro', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setScanning(false)
    }
  }

  const handleConnect = () => {
    if (!result || result.recommendation === 'block') return
    toast({
      title: result.recommendation === 'allow' ? 'Conexão autorizada' : 'Conexão limitada',
      description: `Tank Wallet conectada a ${result.domain} com permissões ${result.recommendation === 'allow' ? 'padrão' : 'restritas'}.`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="h-6 w-6 text-emerald-400" />
          DApp Shield
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Antes da conexão: verifica domínio, SSL, DNS, WHOIS, idade, phishing, typosquatting, clones e reputação.
        </p>
      </div>

      {/* URL scanner */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-emerald-400" />
            Verificar site antes de conectar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runCheck()}
                placeholder="https://app.uniswap.org"
                className="pl-10"
              />
            </div>
            <Button onClick={() => runCheck()} disabled={!url || scanning} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verificar
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">Testar:</span>
            {SAMPLE_URLS.map((s) => (
              <button
                key={s.url}
                onClick={() => runCheck(s.url)}
                className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scanning */}
      {scanning && (
        <Card className="border-emerald-500/30">
          <CardContent className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <div>
              <p className="text-sm font-medium">Executando DApp Shield…</p>
              <p className="text-xs text-muted-foreground">Verificando blocklist, typosquatting, SSL, WHOIS (idade real do domínio), TLDs suspeitos e reputação.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && !scanning && (
        <Card className={cn('border-2', RATING_COLOR[result.rating])}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {result.rating === 'verified' ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                ) : result.rating === 'malicious' ? (
                  <Ban className="h-5 w-5 shrink-0 text-red-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                )}
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{result.domain}</CardTitle>
                  <p className="text-xs text-muted-foreground">Análise completa DApp Shield</p>
                </div>
              </div>
              <Badge className={cn('border', RATING_COLOR[result.rating])}>
                {RATING_LABEL[result.rating]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Score + recommendation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score de segurança</p>
                <p className={cn(
                  'text-2xl font-bold',
                  result.riskScore >= 90 ? 'text-emerald-400' : result.riskScore >= 60 ? 'text-zinc-400' : result.riskScore >= 30 ? 'text-amber-400' : 'text-red-400'
                )}>
                  {result.riskScore}<span className="text-sm text-muted-foreground">/100</span>
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Recomendação</p>
                <p className={cn(
                  'text-sm font-bold capitalize',
                  result.recommendation === 'allow' && 'text-emerald-400',
                  result.recommendation === 'limit' && 'text-amber-400',
                  result.recommendation === 'block' && 'text-red-400'
                )}>
                  {result.recommendation === 'allow' ? 'Conexão permitida' : result.recommendation === 'limit' ? 'Conexão limitada' : 'Conexão bloqueada'}
                </p>
              </div>
            </div>

            {/* Checks list */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Verificações executadas</p>
              <div className="space-y-1.5">
                {result.checks.map((check, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-2 rounded-lg border p-2.5',
                      check.status === 'pass' && 'border-emerald-500/20 bg-emerald-500/5',
                      check.status === 'warn' && 'border-amber-500/20 bg-amber-500/5',
                      check.status === 'fail' && 'border-red-500/20 bg-red-500/5'
                    )}
                  >
                    {check.status === 'pass' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                    ) : check.status === 'warn' ? (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                    ) : (
                      <X className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold">{check.name}</p>
                        <Badge variant="outline" className={cn(
                          'text-[8px] h-3.5',
                          check.status === 'pass' && 'border-emerald-500/40 text-emerald-400',
                          check.status === 'warn' && 'border-amber-500/40 text-amber-400',
                          check.status === 'fail' && 'border-red-500/40 text-red-400'
                        )}>
                          {check.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{check.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            {result.recommendation === 'block' ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <Ban className="h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-red-300">
                  Conexão bloqueada. Não tente acessar por outro meio — este site está comprometido.
                </p>
              </div>
            ) : result.recommendation === 'limit' ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-xs text-amber-300">
                  Conexão limitada: apenas leitura. Não assine transações sem revisão adicional.
                </p>
              </div>
            ) : (
              <Button onClick={handleConnect} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Lock className="h-4 w-4" /> Conectar com permissões limitadas
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verified DApps catalog */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-emerald-400" />
              DApps verificados
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">{DAPPS.length} oficiais</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DAPPS.map((dapp) => (
              <button
                key={dapp.id}
                onClick={() => runCheck(`https://${dapp.url}`)}
                className="group flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-left transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{dapp.name}</p>
                  <p className="text-[10px] text-muted-foreground">{dapp.url}</p>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{dapp.description}</p>
                <Badge variant="outline" className="text-[9px] w-fit">{dapp.category}</Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blocklist */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Ban className="h-4 w-4 text-red-400" />
              Sites bloqueados ({blockedSites.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 max-h-64 overflow-y-auto">
          {blockedSites.map((site) => (
            <div key={site.id} className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
              <Ban className="h-4 w-4 shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-mono">{site.url}</p>
                <p className="truncate text-[10px] text-muted-foreground">{site.reason}</p>
              </div>
              <Badge variant="outline" className="text-[9px] border-red-500/40 text-red-400 shrink-0">
                {site.category}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
