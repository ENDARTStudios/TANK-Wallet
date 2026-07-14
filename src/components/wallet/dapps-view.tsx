'use client'

import { useState } from 'react'
import { useWallet } from './wallet-context'
import { DAPPS } from '@/lib/wallet/data'
import { verifySite, RISK_BG, RISK_DOT, type SiteCheckResult } from '@/lib/wallet/security'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Globe, Search, ShieldCheck, ShieldAlert, AlertTriangle, Ban, ExternalLink, Loader2, CheckCircle2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const SAMPLE_URLS = [
  { url: 'app.uniswap.org', label: 'Uniswap (legítimo)' },
  { url: 'metarnask-login.com', label: 'Phishing de MetaMask' },
  { url: 'opensea-mint-free.io', label: 'Drainer NFT falso' },
  { url: 'aave-v3-bonus.com', label: 'Phishing de Aave' },
  { url: 'jup.ag', label: 'Jupiter (legítimo)' },
]

const RATING_LABEL: Record<SiteCheckResult['rating'], string> = {
  verified: 'Verificado',
  unknown: 'Desconhecido',
  suspicious: 'Suspeito',
  malicious: 'Malicioso',
}

export function DappsView() {
  const { blockedSites, addSecurityEvent } = useWallet()
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<SiteCheckResult | null>(null)
  const [checkedUrl, setCheckedUrl] = useState('')

  const runCheck = (target?: string) => {
    const finalUrl = target ?? url
    if (!finalUrl) return
    setVerifying(true)
    setResult(null)
    setCheckedUrl(finalUrl)
    setTimeout(() => {
      const r = verifySite({ url: finalUrl }, blockedSites)
      setResult(r)
      setVerifying(false)
      if (r.blocked) {
        addSecurityEvent({
          type: 'blocked-site',
          title: 'Site malicioso bloqueado',
          description: `${finalUrl} foi bloqueado antes da conexão DApp.`,
          severity: 'critical',
          related: finalUrl,
        })
      }
    }, 1100)
  }

  const handleConnect = () => {
    if (!result || result.blocked) return
    toast({
      title: 'Conexão autorizada',
      description: `FortiX conectada a ${checkedUrl} com permissões limitadas.`,
    })
    setResult(null)
    setUrl('')
    setCheckedUrl('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browser DApp</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Antes de conectar a carteira a qualquer site, a FortiX verifica a URL contra blocklist, typosquatting, TLDs suspeitos e certificado.
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
                placeholder="ex: app.uniswap.org"
                className="pl-10"
              />
            </div>
            <Button onClick={() => runCheck()} disabled={!url || verifying} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verificar
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">Testar:</span>
            {SAMPLE_URLS.map((s) => (
              <button
                key={s.url}
                onClick={() => {
                  setUrl(s.url)
                  runCheck(s.url)
                }}
                className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {verifying && (
        <Card className="border-emerald-500/30">
          <CardContent className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <div>
              <p className="text-sm font-medium">Verificando {checkedUrl}…</p>
              <p className="text-xs text-muted-foreground">Checando blocklist, typosquatting, TLD, certificado e domínios similares.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !verifying && (
        <Card className={cn('border-2', result.blocked ? 'border-red-500/40' : result.rating === 'verified' ? 'border-emerald-500/40' : 'border-amber-500/40')}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {result.rating === 'verified' ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                ) : result.blocked ? (
                  <Ban className="h-5 w-5 shrink-0 text-red-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                )}
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{checkedUrl}</CardTitle>
                  <p className="text-xs text-muted-foreground">Análise de segurança</p>
                </div>
              </div>
              <Badge
                className={cn(
                  'border',
                  result.rating === 'verified' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                  result.rating === 'unknown' && 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
                  result.rating === 'suspicious' && 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                  result.rating === 'malicious' && 'bg-red-500/10 border-red-500/30 text-red-400'
                )}
              >
                {RATING_LABEL[result.rating]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score de segurança</p>
                <p className={cn('text-2xl font-bold', result.score >= 90 ? 'text-emerald-400' : result.score >= 60 ? 'text-zinc-400' : result.score >= 30 ? 'text-amber-400' : 'text-red-400')}>
                  {result.score}<span className="text-sm text-muted-foreground">/100</span>
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</p>
                <p className="text-sm font-bold capitalize">{result.category ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">{result.blocked ? 'Bloqueado' : 'Permitido'}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Detalhes da verificação</p>
              <ul className="space-y-1.5">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', result.blocked ? 'bg-red-500' : result.rating === 'verified' ? 'bg-emerald-500' : 'bg-amber-500')} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.blocked ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <Ban className="h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-red-300">
                  Conexão bloqueada. Este site está na nossa blocklist de DApps maliciosos. Não tente acessá-lo por outro meio.
                </p>
              </div>
            ) : result.rating === 'suspicious' ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-xs text-amber-300">
                  Site suspeito. Recomendamos não conectar a carteira. Se precisar acessar, use quantias pequenas.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex-1">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <p className="text-xs text-emerald-300">Site seguro para conexão. Permissões serão limitadas por padrão.</p>
                </div>
                <Button onClick={handleConnect} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shrink-0">
                  <Lock className="h-4 w-4" /> Conectar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verified DApps catalog */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
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
                onClick={() => {
                  setUrl(dapp.url)
                  runCheck(dapp.url)
                }}
                className="group flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-left transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{dapp.name}</p>
                  <p className="text-[10px] text-muted-foreground">{dapp.url}</p>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{dapp.description}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[9px] h-4">{dapp.category}</Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blocklist preview */}
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
