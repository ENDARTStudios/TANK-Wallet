'use client'

import { useState, useMemo } from 'react'
import { useWallet } from './wallet-context'
import { CHAINS, chainById } from '@/lib/wallet/data'
import { verifyTokenIntegrity, RISK_BG, RISK_DOT, RISK_LABEL, shortenAddress, formatTokenAmount } from '@/lib/wallet/security'
import { ChainBadge, RiskBadge, TokenAvatar } from './common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, ShieldAlert, QrCode, Copy, Check, AlertTriangle, Ban, Loader2, Scan, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChainId, RiskAssessment } from '@/lib/wallet/types'

const SAMPLE_INCOMING = [
  {
    label: 'USDT legítimo (Ethereum)',
    symbol: 'USDT',
    name: 'Tether USD',
    chain: 'ethereum' as ChainId,
    contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    isVerified: true,
    liquidityUsd: 5_000_000_000,
    holderCount: 850_000,
    sellTax: 0,
    hasMintAuthority: false,
    hasHoneypotPattern: false,
    amount: 250,
  },
  {
    label: 'Scam — honeypot (BSC)',
    symbol: 'SAFEBOOST',
    name: 'SafeBoost Inu',
    chain: 'bsc' as ChainId,
    contract: '0x4f2a9c2b3e1d4a5f6b7c8d9e0f1a2b3c4d5e6f70',
    isVerified: false,
    liquidityUsd: 42,
    holderCount: 12,
    sellTax: 99,
    hasMintAuthority: true,
    hasHoneypotPattern: true,
    amount: 1_000_000,
  },
  {
    label: 'Token suspeito — tax alta',
    symbol: 'MOONRUG',
    name: 'MoonRug Token',
    chain: 'polygon' as ChainId,
    contract: '0x2b3c4d5e6f7081920a3b4c5d6e7f8091a2b3c4d5',
    isVerified: false,
    liquidityUsd: 8_500,
    holderCount: 230,
    sellTax: 25,
    hasMintAuthority: false,
    hasHoneypotPattern: false,
    amount: 5_000,
  },
]

export function ReceiveView() {
  const { address, blockedTokens, receiveToken } = useWallet()
  const { toast } = useToast()
  const [selectedChain, setSelectedChain] = useState<ChainId>('ethereum')
  const [copied, setCopied] = useState(false)
  const [verification, setVerification] = useState<RiskAssessment | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [pendingToken, setPendingToken] = useState<typeof SAMPLE_INCOMING[0] | null>(null)

  const chain = chainById(selectedChain)

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      // ignore
    }
    setCopied(true)
    toast({ title: 'Endereço copiado', description: 'Sempre confira o endereço ao colar — malware pode substituir áreas de transferência.' })
    setTimeout(() => setCopied(false), 1800)
  }

  const runVerification = (sample: typeof SAMPLE_INCOMING[0]) => {
    setVerifying(true)
    setPendingToken(sample)
    setVerification(null)
    setTimeout(() => {
      const result = verifyTokenIntegrity(
        {
          symbol: sample.symbol,
          name: sample.name,
          chain: sample.chain,
          contract: sample.contract,
          liquidityUsd: sample.liquidityUsd,
          holderCount: sample.holderCount,
          sellTax: sample.sellTax,
          hasMintAuthority: sample.hasMintAuthority,
          hasHoneypotPattern: sample.hasHoneypotPattern,
          isVerified: sample.isVerified,
        },
        blockedTokens
      )
      setVerification(result)
      setVerifying(false)
    }, 1100)
  }

  const acceptToken = () => {
    if (!pendingToken || !verification) return
    const result = receiveToken({
      id: `tk-${Date.now()}`,
      symbol: pendingToken.symbol,
      name: pendingToken.name,
      chain: pendingToken.chain,
      standard: 'ERC-20',
      balance: pendingToken.amount,
      decimals: 18,
      priceUsd: 1, // would be fetched from oracle
      change24h: 0,
      contract: pendingToken.contract,
      logoColor: chainById(pendingToken.chain).color,
      inVault: false,
      verified: verification.level === 'safe',
      risk: verification,
    })
    toast({
      title: result.accepted ? 'Token aceito' : 'Token bloqueado',
      description: result.reason,
      variant: result.accepted ? 'default' : 'destructive',
    })
    if (!result.accepted) {
      // Already logged in context
    } else {
      setVerification(null)
      setPendingToken(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Receber tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toda transferência recebida passa por verificação automática de integridade contra nossa blocklist e heurísticas de segurança.
        </p>
      </div>

      <Tabs defaultValue="address" className="space-y-4">
        <TabsList>
          <TabsTrigger value="address">Meu endereço</TabsTrigger>
          <TabsTrigger value="verify">Verificação de token</TabsTrigger>
          <TabsTrigger value="scanner">Scanner de contrato</TabsTrigger>
        </TabsList>

        {/* ============ Address tab ============ */}
        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Selecione a rede</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChain(c.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all',
                      selectedChain === c.id
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                    )}
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold"
                      style={{ backgroundColor: `${c.color}20`, color: c.color }}
                    >
                      {c.glyph}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{c.shortLabel}</p>
                      <p className="truncate text-[9px] text-muted-foreground">{c.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {/* Fake QR */}
                <div className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-500/30 bg-white p-3">
                  <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-0.5">
                    {Array.from({ length: 144 }).map((_, i) => {
                      // deterministic pattern based on address hash
                      const hash = (address.charCodeAt(i % address.length) + i) % 3 === 0
                      return <div key={i} className={cn('rounded-[1px]', hash ? 'bg-black' : 'bg-white')} />
                    })}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Recebendo na rede</p>
                    <div className="mt-1 flex items-center gap-2">
                      <ChainBadge chainId={chain.id} size="md" />
                      <span className="text-sm font-medium">{chain.name}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Endereço da carteira</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs font-mono break-all">
                        {address}
                      </code>
                      <Button size="icon" variant="outline" onClick={copyAddress} className="shrink-0 border-emerald-500/40 text-emerald-400">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-xs font-medium text-emerald-400">Recebimento protegido</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Qualquer token enviado para este endereço será escaneado automaticamente. Tokens maliciosos ou honeypots serão bloqueados e registrados na Central de Risco.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Verification tab ============ */}
        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scan className="h-4 w-4 text-emerald-400" />
                Simular recebimento & verificação
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Escolha um cenário de token recebido para ver como a FortiX valida integridade antes de aceitá-lo.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {SAMPLE_INCOMING.map((sample) => {
                const c = chainById(sample.chain)
                return (
                  <div
                    key={sample.label}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3"
                  >
                    <TokenAvatar symbol={sample.symbol} color={c.color} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{sample.symbol}</p>
                        <ChainBadge chainId={sample.chain} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{sample.label}</p>
                      <p className="mt-0.5 text-[10px] font-mono text-muted-foreground/70">{shortenAddress(sample.contract, 6)}</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10" onClick={() => runVerification(sample)}>
                      <Scan className="h-3.5 w-3.5" /> Verificar
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Verification result */}
          {verifying && (
            <Card className="border-emerald-500/30">
              <CardContent className="flex items-center gap-3 p-6">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                <div>
                  <p className="text-sm font-medium">Verificando integridade do token…</p>
                  <p className="text-xs text-muted-foreground">Checando blocklist, honeypot, liquidez, mint authority e verificação de contrato.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {verification && !verifying && pendingToken && (
            <Card className={cn('border-2', RISK_BG[verification.level].split(' ')[1])}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {verification.level === 'safe' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : verification.blocked ? (
                      <Ban className="h-5 w-5 text-red-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    )}
                    <div>
                      <CardTitle className="text-base">Resultado da verificação</CardTitle>
                      <p className="text-xs text-muted-foreground">{pendingToken.symbol} · {chainById(pendingToken.chain).name}</p>
                    </div>
                  </div>
                  <RiskBadge level={verification.level} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score de segurança</p>
                    <p className={cn('text-2xl font-bold', RISK_COLOR_LABEL(verification.level))}>
                      {verification.score}<span className="text-sm text-muted-foreground">/100</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
                    <p className={cn('text-sm font-bold', RISK_COLOR_LABEL(verification.level))}>
                      {verification.blocked ? 'Bloqueado' : verification.level === 'safe' ? 'Aceito' : 'Aceito com aviso'}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Análise detalhada</p>
                  <ul className="space-y-1.5">
                    {verification.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', RISK_DOT[verification.level])} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!verification.blocked && (
                  <Button onClick={acceptToken} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-4 w-4" /> Aceitar token ({formatTokenAmount(pendingToken.amount)} {pendingToken.symbol})
                  </Button>
                )}
                {verification.blocked && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <Ban className="h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-xs text-red-300">
                      Recebimento bloqueado automaticamente. O token foi registrado na sua Central de Risco e na blocklist global.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============ Scanner tab ============ */}
        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Scanner de contrato</CardTitle>
              <p className="text-xs text-muted-foreground">
                Cole o endereço do contrato de qualquer token para uma análise de segurança antes de aceitá-lo.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Endereço do contrato</Label>
                <Input placeholder="0x..." className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Rede</Label>
                <Select defaultValue="ethereum">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHAINS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Scan className="h-4 w-4" /> Escanear contrato
              </Button>
              <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3 text-[11px] text-muted-foreground">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>O scanner verifica: blocklist, honeypot, verificação de source code, holder count, liquidez em DEXs, taxa de transferência, mint authority e padrões de wash trading.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RISK_COLOR_LABEL(level: RiskAssessment['level']): string {
  return RISK_BG[level].split(' ').find((c) => c.startsWith('text-')) ?? 'text-foreground'
}
