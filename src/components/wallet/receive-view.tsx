'use client'

import { useState, useMemo } from 'react'
import { useWallet } from './wallet-context'
import { CHAINS, chainById } from '@/lib/wallet/data'
import { verifyTokenIntegrity, RISK_BG, RISK_DOT, RISK_LABEL, shortenAddress, formatTokenAmount } from '@/lib/wallet/security'
import { queryTokenSecurity, goplusToRiskAssessment } from '@/lib/wallet-security-real'
import { ChainBadge, RiskBadge, TokenAvatar } from './common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, ShieldAlert, QrCode, Copy, Check, AlertTriangle, Ban, Loader2, Scan, CheckCircle2, Zap, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChainId, RiskAssessment } from '@/lib/wallet/types'

const REAL_CHAIN_GROUPS = [
  { label: 'EVM (BIP-44 m/44\'/60\'/0\'/0/0)', chains: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base'] as ChainId[] },
  { label: 'Solana (SLIP-0010 m/44\'/501\'/0\'/0\')', chains: ['solana'] as ChainId[] },
  { label: 'Bitcoin (BIP-44 m/84\'/0\'/0\'/0/0 — Native SegWit)', chains: ['bitcoin'] as ChainId[] },
  { label: 'Lightning (BIP-44 m/44\'/0\'/0\'/0/0)', chains: ['lightning'] as ChainId[] },
]

export function ReceiveView() {
  const { realWallet, realBalances, loadingBalances, refreshBalances, blockedTokens, receiveToken } = useWallet()
  const { toast } = useToast()
  const [selectedChain, setSelectedChain] = useState<ChainId>('ethereum')
  const [copied, setCopied] = useState(false)
  const [verification, setVerification] = useState<RiskAssessment | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [pendingToken, setPendingToken] = useState<{ symbol: string; name: string; chain: ChainId; contract: string; amount: number } | null>(null)

  const chain = chainById(selectedChain)

  // ============ Get real address for the selected chain ============

  const realAddress = useMemo(() => {
    if (!realWallet) return ''
    switch (selectedChain) {
      case 'solana':
        return realWallet.solana.address
      case 'bitcoin':
        return realWallet.bitcoin.address
      case 'lightning':
        return realWallet.lightning.nodeId
      default:
        // EVM chains all share the same address (BIP-44 m/44'/60'/0'/0/0)
        return realWallet.evm.address
    }
  }, [realWallet, selectedChain])

  const realBalance = useMemo(() => realBalances[selectedChain], [realBalances, selectedChain])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(realAddress)
    } catch {
      // ignore
    }
    setCopied(true)
    toast({ title: 'Endereço copiado', description: `Endereço real derivado para ${chain.name}.` })
    setTimeout(() => setCopied(false), 1800)
  }

  // ============ GoPlus real verification ============

  const runRealGoPlusCheck = async (sample: typeof SAMPLE_INCOMING[0]) => {
    setVerifying(true)
    setPendingToken(sample)
    setVerification(null)
    try {
      const goplus = await queryTokenSecurity(sample.chain, sample.contract)
      let result: RiskAssessment
      if (goplus) {
        const assessed = goplusToRiskAssessment(goplus)
        result = {
          level: assessed.level,
          score: assessed.score,
          reasons: [`Análise GoPlus Security API (tempo real)`, ...assessed.reasons],
          blocked: assessed.blocked,
        }
      } else {
        // GoPlus didn't return — fall back to local heuristics
        result = verifyTokenIntegrity(
          {
            symbol: sample.symbol,
            name: sample.name,
            chain: sample.chain,
            contract: sample.contract,
          },
          blockedTokens
        )
        result.reasons = ['GoPlus indisponível — usando heurísticas locais', ...result.reasons]
      }
      setVerification(result)
    } catch (e) {
      setVerification({
        level: 'medium',
        score: 50,
        reasons: ['Erro ao consultar GoPlus', (e as Error).message],
        blocked: false,
      })
    } finally {
      setVerifying(false)
    }
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
      priceUsd: 1,
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
    if (result.accepted) {
      setVerification(null)
      setPendingToken(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Receber tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Endereço real derivado da sua seed. Verificação de integridade via <strong>GoPlus Security API</strong> em tempo real.
        </p>
      </div>

      <Tabs defaultValue="address" className="space-y-4">
        <TabsList>
          <TabsTrigger value="address">Meu endereço real</TabsTrigger>
          <TabsTrigger value="verify">Verificação GoPlus</TabsTrigger>
          <TabsTrigger value="scanner">Scanner de contrato</TabsTrigger>
        </TabsList>

        {/* ============ Address tab ============ */}
        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Selecione a rede</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {REAL_CHAIN_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">{group.label}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {group.chains.map((c) => {
                      const chain = chainById(c)
                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedChain(c)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all',
                            selectedChain === c
                              ? 'border-emerald-500/50 bg-emerald-500/10'
                              : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                          )}
                        >
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold"
                            style={{ backgroundColor: `${chain.color}20`, color: chain.color }}
                          >
                            {chain.glyph}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{chain.shortLabel}</p>
                            <p className="truncate text-[9px] text-muted-foreground">{chain.name}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {/* QR — deterministic based on real address */}
                <div className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-500/30 bg-white p-3">
                  <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-0.5">
                    {Array.from({ length: 144 }).map((_, i) => {
                      const hash = (realAddress.charCodeAt(i % realAddress.length) + i * 7) % 3 === 0
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
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Endereço real (derivado da sua seed)
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs font-mono break-all">
                        {realAddress}
                      </code>
                      <Button size="icon" variant="outline" onClick={copyAddress} className="shrink-0 border-emerald-500/40 text-emerald-400">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Real balance via RPC */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Saldo on-chain (RPC público)</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={refreshBalances}
                        disabled={loadingBalances}
                      >
                        {loadingBalances ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                        Atualizar
                      </Button>
                    </div>
                    {realBalance ? (
                      <div className="mt-1">
                        {realBalance.loaded ? (
                          <p className="text-sm font-bold">
                            {formatTokenAmount(parseFloat(realBalance.balanceEther), 6)} {chain.symbol}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-400">
                            {realBalance.error ?? 'RPC indisponível'}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          via {chainById(selectedChain).rpcLabel}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Carregando…</p>
                    )}
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-xs font-medium text-emerald-400">Recebimento protegido</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Qualquer token enviado passará por <strong>GoPlus Security API</strong> e heurísticas locais.
                        Tokens honeypot ou scam serão bloqueados e registrados na Central de Risco.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ GoPlus real-time verification ============ */}
        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-emerald-400" />
                Verificação em tempo real via GoPlus Security
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Consulta direta à API pública da GoPlus. Retorna análise completa do contrato: honeypot, mintable, proxy, LP lock, taxas, holders.
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => runRealGoPlusCheck(sample)}
                      disabled={verifying}
                    >
                      <Scan className="h-3.5 w-3.5" /> Consultar GoPlus
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {verifying && (
            <Card className="border-emerald-500/30">
              <CardContent className="flex items-center gap-3 p-6">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                <div>
                  <p className="text-sm font-medium">Consultando GoPlus Security API…</p>
                  <p className="text-xs text-muted-foreground">Analisando bytecode, source code, holder count, liquidez, LP lock, taxas e padrões de honeypot.</p>
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
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Análise detalhada (GoPlus + heurísticas)</p>
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
                      Recebimento bloqueado. Token registrado na Central de Risco e na blocklist local.
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
              <CardTitle className="text-base">Scanner de contrato (GoPlus)</CardTitle>
              <p className="text-xs text-muted-foreground">
                Cole qualquer endereço de contrato ERC-20 para análise completa via GoPlus Security API.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ContractScanner />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContractScanner() {
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState<string>('ethereum')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RiskAssessment | null>(null)
  const [info, setInfo] = useState<string>('')

  const scan = async () => {
    if (!address) return
    setLoading(true)
    setResult(null)
    setInfo('')
    try {
      const goplus = await queryTokenSecurity(chainId, address)
      if (!goplus) {
        setResult({
          level: 'medium',
          score: 50,
          reasons: ['GoPlus não encontrou dados para este contrato', 'Pode ser um token novo ou endereço inválido'],
          blocked: false,
        })
        setInfo('Sem dados na GoPlus API')
        return
      }
      setInfo(`${goplus.token_symbol} (${goplus.token_name}) · ${goplus.holder_count} holders`)
      setResult(goplusToRiskAssessment(goplus))
    } catch (e) {
      setResult({
        level: 'medium',
        score: 0,
        reasons: ['Erro ao consultar GoPlus', (e as Error).message],
        blocked: false,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Contrato ERC-20</Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Rede</Label>
          <Select value={chainId} onValueChange={setChainId}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base'].map((c) => (
                <SelectItem key={c} value={c}>{chainById(c).shortLabel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={scan} disabled={loading || !address} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
            Escanear
          </Button>
        </div>
      </div>

      {info && <p className="text-xs text-muted-foreground">{info}</p>}

      {result && (
        <div className={cn('rounded-xl border-2 p-3', RISK_BG[result.level].split(' ')[1])}>
          <div className="flex items-center justify-between mb-2">
            <RiskBadge level={result.level} />
            <span className={cn('text-lg font-bold', RISK_COLOR_LABEL(result.level))}>{result.score}/100</span>
          </div>
          <ul className="space-y-1">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs">
                <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', RISK_DOT[result.level])} />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3 text-[11px] text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>Dados em tempo real da <strong>GoPlus Security API</strong>. Análise inclui: honeypot, source code verification, mintable, proxy, hidden owner, transfer pausable, blacklist, sell/buy tax, liquidez, LP lock e holder count.</p>
      </div>
    </>
  )
}

const SAMPLE_INCOMING = [
  {
    label: 'USDT (Ethereum) — Tether real',
    symbol: 'USDT',
    name: 'Tether USD',
    chain: 'ethereum' as ChainId,
    contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    amount: 250,
  },
  {
    label: 'USDC (Ethereum) — Circle real',
    symbol: 'USDC',
    name: 'USD Coin',
    chain: 'ethereum' as ChainId,
    contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: 500,
  },
  {
    label: 'WETH (Ethereum) — Wrapped Ether',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    chain: 'ethereum' as ChainId,
    contract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: 0.5,
  },
]

function RISK_COLOR_LABEL(level: RiskAssessment['level']): string {
  return RISK_BG[level].split(' ').find((c) => c.startsWith('text-')) ?? 'text-foreground'
}
