'use client'

import { useState, useMemo } from 'react'
import { useWallet } from './wallet-context'
import { chainById } from '@/lib/wallet/data'
import { verifyAddress, simulateTransaction, RISK_BG, RISK_DOT, RISK_LABEL, formatTokenAmount, formatUsd, shortenAddress } from '@/lib/wallet/security'
import { ChainBadge, RiskBadge, TokenAvatar } from './common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, ShieldAlert, AlertTriangle, Send, Loader2, Lock, CheckCircle2, Ban, Clock, Zap, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RiskAssessment, Token } from '@/lib/wallet/types'

const KNOWN_ADDRESSES = [
  { address: '0x7a25F3a8b9c4D2e1F678901a2B3c4D5e6F7081920a3B', isContract: false, reportsCount: 0, txCount: 142, label: 'Carteira própria (EOA)' },
  { address: '0x3f8B2c9D4e5F678901a2B3c4D5e6F7081920a3Bc4D', isContract: false, reportsCount: 3, txCount: 12, label: 'Endereço denunciado' },
  { address: '0x9b8c2d7e3F4a5B6c7D8e9F0a1B2c3D4e5F6a7B8c', isContract: false, reportsCount: 0, txCount: 87, label: 'Contato frequente' },
  { address: '0xa0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', isContract: true, reportsCount: 0, txCount: 99999, label: 'USDC contract' },
]

export function SendView() {
  const { tokens, safeSessionActive, startSafeSession, sendTransaction } = useWallet()
  const { toast } = useToast()
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(tokens[0]?.id ?? null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [verification, setVerification] = useState<RiskAssessment | null>(null)
  const [simulation, setSimulation] = useState<ReturnType<typeof simulateTransaction> | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [signing, setSigning] = useState(false)
  const [pasteWarning, setPasteWarning] = useState(false)

  const selectedToken = useMemo(() => tokens.find((t) => t.id === selectedTokenId), [tokens, selectedTokenId])

  const runChecks = () => {
    if (!selectedToken || !recipient || !amount) return
    setVerifying(true)
    setVerification(null)
    setSimulation(null)
    setTimeout(() => {
      // Find matching known address or default
      const known = KNOWN_ADDRESSES.find((a) => a.address.toLowerCase() === recipient.toLowerCase())
      const checkInput = known
        ? { address: recipient, chain: selectedToken.chain, isContract: known.isContract, reportsCount: known.reportsCount, txCount: known.txCount }
        : { address: recipient, chain: selectedToken.chain, isContract: false, reportsCount: 0, txCount: 1 }
      const risk = verifyAddress(checkInput)
      const sim = simulateTransaction({
        to: recipient,
        tokenSymbol: selectedToken.symbol,
        amount: parseFloat(amount) || 0,
        chain: selectedToken.chain,
        permissions: [],
      })
      setVerification(risk)
      setSimulation(sim)
      setVerifying(false)
      setShowPreview(true)
    }, 1200)
  }

  const handlePaste = () => {
    // Detect a paste event - in real wallet, we'd compute hash of pasted content
    setPasteWarning(true)
    setTimeout(() => setPasteWarning(false), 4000)
  }

  const confirmSend = () => {
    if (!selectedToken || !verification) return
    if (!safeSessionActive) {
      toast({ title: 'Sessão segura necessária', description: 'Ative a Sessão Segura antes de enviar.', variant: 'destructive' })
      return
    }
    if (verification.blocked) {
      toast({ title: 'Transação bloqueada', description: 'Endereço de destino está na blocklist.', variant: 'destructive' })
      return
    }
    setSigning(true)
    setTimeout(() => {
      const result = sendTransaction({
        type: 'send',
        tokenSymbol: selectedToken.symbol,
        amount: parseFloat(amount),
        usdValue: parseFloat(amount) * selectedToken.priceUsd,
        chain: selectedToken.chain,
        counterparty: shortenAddress(recipient, 4),
      })
      setSigning(false)
      toast({
        title: result.approved ? 'Transação confirmada' : 'Falha no envio',
        description: result.reason,
        variant: result.approved ? 'default' : 'destructive',
      })
      if (result.approved) {
        setAmount('')
        setRecipient('')
        setShowPreview(false)
        setVerification(null)
        setSimulation(null)
      }
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enviar tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toda transação passa por verificação de endereço, simulação e assinatura em Sessão Segura.
        </p>
      </div>

      {/* Safe session banner */}
      <Card className={cn(
        'border-2 transition-all',
        safeSessionActive ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-amber-500/40 bg-amber-500/5'
      )}>
        <CardContent className="flex items-center gap-3 p-4">
          {safeSessionActive ? <ShieldCheck className="h-5 w-5 text-emerald-400" /> : <Lock className="h-5 w-5 text-amber-400" />}
          <div className="flex-1">
            <p className={cn('text-sm font-semibold', safeSessionActive ? 'text-emerald-400' : 'text-amber-400')}>
              {safeSessionActive ? 'Sessão Segura ativa' : 'Sessão Segura inativa'}
            </p>
            <p className="text-xs text-muted-foreground">
              {safeSessionActive
                ? 'Transações serão assinadas com confirmação biométrica e simulação prévia.'
                : 'Ative a Sessão Segura para autorizar envios. Sem ela, transações não podem ser assinadas.'}
            </p>
          </div>
          <Button
            size="sm"
            variant={safeSessionActive ? 'outline' : 'default'}
            className={cn(safeSessionActive ? 'border-emerald-500/40 text-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700')}
            onClick={() => (safeSessionActive ? null : startSafeSession())}
          >
            {safeSessionActive ? 'Ativa' : 'Ativar'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Send form */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Selecionar token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto">
              {tokens.map((t) => (
                <TokenPickerRow
                  key={t.id}
                  token={t}
                  selected={selectedTokenId === t.id}
                  onSelect={() => setSelectedTokenId(t.id)}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Destinatário e valor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Endereço de destino</Label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="0x... ou ENDEREÇO.sol"
                  className="font-mono text-sm"
                />
                {pasteWarning && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Confira visualmente o endereço colado — malware pode ter substituído na área de transferência.</span>
                  </div>
                )}
              </div>

              {/* Quick contacts */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">Contatos:</span>
                {KNOWN_ADDRESSES.slice(0, 3).map((a) => (
                  <button
                    key={a.address}
                    onClick={() => setRecipient(a.address)}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] transition-colors',
                      recipient === a.address
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Valor</Label>
                  {selectedToken && (
                    <button
                      onClick={() => setAmount(String(selectedToken.balance))}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Máx: {formatTokenAmount(selectedToken.balance, selectedToken.decimals)}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pr-20 text-lg font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    {selectedToken?.symbol}
                  </span>
                </div>
                {selectedToken && amount && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatUsd(parseFloat(amount) * selectedToken.priceUsd)}
                  </p>
                )}
              </div>

              <Button
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={runChecks}
                disabled={!selectedToken || !recipient || !amount || verifying}
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {verifying ? 'Verificando…' : 'Verificar e simular'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview / verification panel */}
        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4 text-emerald-400" />
                Pré-visualização segura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!showPreview && !verifying && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-muted-foreground">Aguardando verificação</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">Preencha token, destinatário e valor para iniciar a simulação.</p>
                </div>
              )}

              {verifying && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  <p className="mt-3 text-sm font-medium">Simulando transação…</p>
                  <p className="mt-1 text-xs text-muted-foreground">Verificando endereço, permissões e impacto no saldo.</p>
                </div>
              )}

              {showPreview && verification && simulation && selectedToken && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Você envia</span>
                      <ChainBadge chainId={selectedToken.chain} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <TokenAvatar symbol={selectedToken.symbol} color={selectedToken.logoColor} size="sm" />
                      <div>
                        <p className="text-sm font-bold">{formatTokenAmount(parseFloat(amount) || 0, selectedToken.decimals)} {selectedToken.symbol}</p>
                        <p className="text-xs text-muted-foreground">{formatUsd(parseFloat(amount) * selectedToken.priceUsd)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Para</span>
                      <RiskBadge level={verification.level} />
                    </div>
                    <p className="mt-2 font-mono text-xs break-all">{shortenAddress(recipient, 8)}</p>
                    <ul className="mt-2 space-y-1">
                      {verification.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <span className={cn('mt-1 h-1 w-1 shrink-0 rounded-full', RISK_DOT[verification.level])} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Simulation warnings */}
                  {simulation.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" /> Avisos da simulação
                      </div>
                      <ul className="mt-1.5 space-y-1">
                        {simulation.warnings.map((w, i) => (
                          <li key={i} className="text-[11px] text-amber-300">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {simulation.dangerousPermissions.length === 0 && simulation.warnings.length === 0 && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <p className="text-[11px] text-emerald-300">Simulação limpa — nenhuma permissão perigosa detectada.</p>
                    </div>
                  )}

                  {/* Network fee */}
                  <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">Taxa de rede estimada</span>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-emerald-400" />
                      <span className="font-medium">{formatUsd(2.34)}</span>
                    </div>
                  </div>

                  {/* Confirm */}
                  {verification.blocked ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                      <Ban className="h-4 w-4 shrink-0 text-red-400" />
                      <p className="text-xs text-red-300">Transação bloqueada — destinatário na blocklist.</p>
                    </div>
                  ) : !safeSessionActive ? (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                      <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                      <p className="text-xs text-amber-300">Ative a Sessão Segura para assinar esta transação.</p>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={confirmSend}
                      disabled={signing}
                    >
                      {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {signing ? 'Assinando com biometria…' : 'Assinar e enviar'}
                    </Button>
                  )}

                  <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> Sessão segura expira em 5 min após cada assinatura
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TokenPickerRow({ token, selected, onSelect }: { token: Token; selected: boolean; onSelect: () => void }) {
  const chain = chainById(token.chain)
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all',
        selected
          ? 'border-emerald-500/50 bg-emerald-500/10'
          : 'border-border/50 bg-muted/20 hover:bg-muted/40'
      )}
    >
      <div className="relative">
        <TokenAvatar symbol={token.symbol} color={token.logoColor} />
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background"
          style={{ backgroundColor: chain.color }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{token.symbol}</p>
        <p className="truncate text-xs text-muted-foreground">{token.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{formatTokenAmount(token.balance, token.decimals)}</p>
        <p className="text-xs text-muted-foreground">{formatUsd(token.balance * token.priceUsd)}</p>
      </div>
    </button>
  )
}
