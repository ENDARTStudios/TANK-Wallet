'use client'

import { useState, useMemo } from 'react'
import { useWallet } from './wallet-context'
import { chainById } from '@/lib/wallet/data'
import { verifyAddress, simulateTransaction, RISK_BG, RISK_DOT, formatTokenAmount, formatUsd, shortenAddress } from '@/lib/wallet/security'
import { EvmProvider, EvmSigner, formatEtherSafe } from '@/lib/wallet-evm'
import { queryAddressSecurity } from '@/lib/wallet-security-real'
import { ChainBadge, RiskBadge, TokenAvatar } from './common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, ShieldAlert, AlertTriangle, Send, Loader2, Lock, CheckCircle2, Ban, Clock, Zap, Eye, EyeOff, FileCode2, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RiskAssessment, Token } from '@/lib/wallet/types'

const KNOWN_ADDRESSES = [
  { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', isContract: false, reportsCount: 0, txCount: 9999, label: 'vitalik.eth (vitalik)' },
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', isContract: true, reportsCount: 0, txCount: 999999, label: 'USDC contract' },
  { address: '0x3f8B2c9D4e5F678901a2B3c4D5e6F7081920a3Bc4D', isContract: false, reportsCount: 3, txCount: 12, label: 'Endereço denunciado (demo)' },
  { address: '0x7a25F3a8b9c4D2e1F678901a2B3c4D5e6F7081920a3B', isContract: false, reportsCount: 0, txCount: 87, label: 'Contato frequente (demo)' },
]

export function SendView() {
  const { tokens, safeSessionActive, startSafeSession, sendTransaction, realWallet, realBalances } = useWallet()
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
  const [onChainBalance, setOnChainBalance] = useState<string | null>(null)
  const [onChainNonce, setOnChainNonce] = useState<number | null>(null)
  const [onChainGas, setOnChainGas] = useState<bigint | null>(null)
  const [signedTxHex, setSignedTxHex] = useState<string | null>(null)
  const [signedTxHash, setSignedTxHash] = useState<string | null>(null)
  const [realCallResult, setRealCallResult] = useState<{ success: boolean; result?: string; error?: string } | null>(null)

  const selectedToken = useMemo(() => tokens.find((t) => t.id === selectedTokenId), [tokens, selectedTokenId])
  const isEvmChain = selectedToken && chainById(selectedToken.chain).isEvm
  const realBalance = selectedToken ? realBalances[selectedToken.chain] : null

  // ============ Real on-chain preflight ============

  const runChecks = async () => {
    if (!selectedToken || !recipient || !amount) return
    setVerifying(true)
    setVerification(null)
    setSimulation(null)
    setSignedTxHex(null)
    setSignedTxHash(null)
    setRealCallResult(null)

    // Local heuristic check
    const known = KNOWN_ADDRESSES.find((a) => a.address.toLowerCase() === recipient.toLowerCase())
    const checkInput = known
      ? { address: recipient, chain: selectedToken.chain, isContract: known.isContract, reportsCount: known.reportsCount, txCount: known.txCount }
      : { address: recipient, chain: selectedToken.chain, isContract: false, reportsCount: 0, txCount: 1 }
    let risk = verifyAddress(checkInput)

    // Real GoPlus address security check
    if (isEvmChain) {
      const goplusAddr = await queryAddressSecurity(selectedToken.chain, recipient)
      if (goplusAddr) {
        const totalReports = goplusAddr.phishing_count + goplusAddr.blackmail_count + goplusAddr.fake_token_count + goplusAddr.honeypot_count
        if (totalReports > 0) {
          risk = {
            level: 'high',
            score: Math.max(0, 30 - totalReports * 5),
            reasons: [
              ...risk.reasons,
              `GoPlus: ${goplusAddr.phishing_count} report(s) de phishing`,
              `GoPlus: ${goplusAddr.blackmail_count} report(s) de blackmail`,
              `GoPlus: ${goplusAddr.fake_token_count} report(s) de fake token`,
              `GoPlus: ${goplusAddr.honeypot_count} report(s) de honeypot`,
            ],
            blocked: totalReports >= 5,
          }
        } else {
          risk = {
            ...risk,
            reasons: [...risk.reasons, 'GoPlus: 0 reports de phishing/blackmail/honeypot'],
          }
        }
      }
    }

    const sim = simulateTransaction({
      to: recipient,
      tokenSymbol: selectedToken.symbol,
      amount: parseFloat(amount) || 0,
      chain: selectedToken.chain,
      permissions: [],
    })

    // Real eth_call simulation for EVM chains
    if (isEvmChain && realWallet) {
      try {
        const provider = new EvmProvider(selectedToken.chain)
        // Read sender balance and nonce in parallel
        const [bal, nonce, gasEstimate, callResult] = await Promise.all([
          provider.getBalance(realWallet.evm.address),
          provider.getNonce(realWallet.evm.address),
          provider.estimateGas({
            from: realWallet.evm.address,
            to: recipient,
            value: amount,
          }).catch(() => 21000n),
          provider.simulateCall({
            from: realWallet.evm.address,
            to: recipient,
            value: amount,
          }),
        ])
        setOnChainBalance(formatEtherSafe(bal))
        setOnChainNonce(nonce)
        setOnChainGas(gasEstimate)
        setRealCallResult(callResult)
        if (!callResult.success) {
          sim.warnings.push(`Simulação eth_call falhou: ${callResult.error?.slice(0, 80)}`)
        } else {
          sim.warnings.push('eth_call simulada com sucesso — transação não reverte')
        }
      } catch (e) {
        sim.warnings.push(`Falha ao consultar RPC: ${(e as Error).message}`)
      }
    }

    setVerification(risk)
    setSimulation(sim)
    setVerifying(false)
    setShowPreview(true)
  }

  const handlePaste = () => {
    setPasteWarning(true)
    setTimeout(() => setPasteWarning(false), 4000)
  }

  // ============ Real EIP-1559 signing ============

  const confirmSend = async () => {
    if (!selectedToken || !verification || !realWallet) return
    if (!safeSessionActive) {
      toast({ title: 'Sessão segura necessária', description: 'Ative a Sessão Segura antes de enviar.', variant: 'destructive' })
      return
    }
    if (verification.blocked) {
      toast({ title: 'Transação bloqueada', description: 'Endereço de destino está na blocklist.', variant: 'destructive' })
      return
    }
    if (!isEvmChain) {
      toast({ title: 'Chain não suportada', description: 'Assinatura real está disponível apenas para chains EVM nesta fase.', variant: 'destructive' })
      return
    }
    if (onChainBalance === null || onChainNonce === null) {
      toast({ title: 'Dados on-chain ausentes', description: 'Aguarde o carregamento dos dados RPC.', variant: 'destructive' })
      return
    }

    setSigning(true)
    try {
      const signer = new EvmSigner(realWallet.evm.privateKey, selectedToken.chain)
      const provider = new EvmProvider(selectedToken.chain)

      // Get fresh gas price — with fallback to a sensible default
      let gasPrice: bigint
      try {
        gasPrice = await provider.getGasPrice()
      } catch {
        // Fallback: 20 gwei
        gasPrice = 20n * 10n ** 9n
      }
      const maxFeePerGas = (gasPrice * 12n) / 10n // 20% headroom
      const maxPriorityFeePerGas = gasPrice / 10n

      const { signedTx, txHash } = await signer.sign1559Tx({
        to: recipient,
        value: amount,
        nonce: onChainNonce,
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        gasLimit: onChainGas ?? 21000n,
      })

      setSignedTxHex(signedTx)
      setSignedTxHash(txHash)

      // Record in tx history (status = "signed offline, ready to broadcast")
      sendTransaction({
        type: 'send',
        tokenSymbol: selectedToken.symbol,
        amount: parseFloat(amount),
        usdValue: parseFloat(amount) * selectedToken.priceUsd,
        chain: selectedToken.chain,
        counterparty: shortenAddress(recipient, 4),
      })

      toast({
        title: 'Transação assinada (EIP-1559)',
        description: 'Hex da transação assinada gerada. Pronta para broadcast via eth_sendRawTransaction.',
      })
    } catch (e) {
      toast({ title: 'Falha na assinatura', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSigning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enviar tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verificação de endereço via <strong>GoPlus</strong> · Simulação via <strong>eth_call real</strong> · Assinatura <strong>EIP-1559 real</strong> com sua chave privada.
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
                ? 'Transações serão assinadas com sua chave privada derivada via BIP-44.'
                : 'Ative a Sessão Segura para autorizar assinaturas reais.'}
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
                  realBalance={realBalances[t.chain]}
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
                <Label>Endereço de destino (real)</Label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="0x... ou ENS"
                  className="font-mono text-sm"
                />
                {pasteWarning && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Confira visualmente o endereço colado — malware pode ter substituído na área de transferência.</span>
                  </div>
                )}
              </div>

              {/* Quick contacts — including real vitalik.eth */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">Endereços:</span>
                {KNOWN_ADDRESSES.slice(0, 4).map((a) => (
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
                disabled={!selectedToken || !recipient || !amount || verifying || !isEvmChain}
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {verifying ? 'Consultando GoPlus + RPC…' : 'Verificar, simular (eth_call) e preparar'}
              </Button>
              {!isEvmChain && selectedToken && (
                <p className="text-[10px] text-amber-400">
                  Assinatura real está disponível apenas para chains EVM nesta fase. Solana/Bitcoin/Lightning em desenvolvimento.
                </p>
              )}
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
                  <p className="mt-1 text-xs text-muted-foreground/70">Verificação GoPlus + simulação eth_call + leitura RPC real.</p>
                </div>
              )}

              {verifying && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  <p className="mt-3 text-sm font-medium">Consultando chain em tempo real…</p>
                  <p className="mt-1 text-xs text-muted-foreground">GoPlus address_security + eth_call + getBalance + getNonce + estimateGas.</p>
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
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Para (verificação GoPlus)</span>
                      <RiskBadge level={verification.level} />
                    </div>
                    <p className="mt-2 font-mono text-xs break-all">{shortenAddress(recipient, 8)}</p>
                    <ul className="mt-2 space-y-1">
                      {verification.reasons.slice(0, 5).map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <span className={cn('mt-1 h-1 w-1 shrink-0 rounded-full', RISK_DOT[verification.level])} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Real on-chain data */}
                  {onChainBalance !== null && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
                        <Radio className="h-3 w-3 animate-pulse" /> Dados on-chain (RPC público)
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[9px] uppercase text-muted-foreground">Saldo</p>
                          <p className="font-mono font-bold">{formatTokenAmount(parseFloat(onChainBalance), 6)}</p>
                          <p className="text-[9px] text-muted-foreground">ETH</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-muted-foreground">Nonce</p>
                          <p className="font-mono font-bold">{onChainNonce}</p>
                          <p className="text-[9px] text-muted-foreground">txs</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-muted-foreground">Gas estimado</p>
                          <p className="font-mono font-bold">{Number(onChainGas ?? 0).toLocaleString()}</p>
                          <p className="text-[9px] text-muted-foreground">units</p>
                        </div>
                      </div>
                      {realCallResult && (
                        <div className="mt-2 pt-2 border-t border-emerald-500/20">
                          <p className="text-[9px] uppercase text-muted-foreground">eth_call</p>
                          <p className={cn('text-[11px] font-mono', realCallResult.success ? 'text-emerald-400' : 'text-red-400')}>
                            {realCallResult.success ? '✓ Simulação OK — não reverte' : `✗ ${realCallResult.error?.slice(0, 60) ?? 'falhou'}`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* Signed transaction result */}
                  {signedTxHex && (
                    <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Transação assinada (EIP-1559 real)
                      </div>
                      <div className="mt-2 space-y-1.5">
                        <div>
                          <p className="text-[9px] uppercase text-muted-foreground">Tx hash (keccak256)</p>
                          <p className="font-mono text-[10px] break-all text-emerald-300">{signedTxHash}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-muted-foreground">Signed raw tx (pronto para eth_sendRawTransaction)</p>
                          <p className="font-mono text-[9px] break-all text-muted-foreground max-h-20 overflow-y-auto">{signedTxHex}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-background/40 p-2">
                        <FileCode2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <p className="text-[10px] text-muted-foreground">
                          A transação está assinada offline com sua chave privada. Para broadcast real, é necessário conectar um node ou serviço de relay.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Network fee */}
                  <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">Taxa de rede estimada</span>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-emerald-400" />
                      <span className="font-medium">{onChainGas ? formatUsd(Number(onChainGas) * 4e-9 * 3245) : formatUsd(2.34)}</span>
                    </div>
                  </div>

                  {/* Confirm */}
                  {verification.blocked ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                      <Ban className="h-4 w-4 shrink-0 text-red-400" />
                      <p className="text-xs text-red-300">Transação bloqueada — destinatário com múltiplos reports no GoPlus.</p>
                    </div>
                  ) : !safeSessionActive ? (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                      <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                      <p className="text-xs text-amber-300">Ative a Sessão Segura para assinar esta transação.</p>
                    </div>
                  ) : !signedTxHex ? (
                    <Button
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={confirmSend}
                      disabled={signing}
                    >
                      {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {signing ? 'Assinando EIP-1559…' : 'Assinar EIP-1559 (real)'}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full gap-2" disabled>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Transação assinada — broadcast pendente
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

function TokenPickerRow({
  token,
  realBalance,
  selected,
  onSelect,
}: {
  token: Token
  realBalance: { balanceEther: string; loaded: boolean } | undefined
  selected: boolean
  onSelect: () => void
}) {
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
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{token.symbol}</p>
          <ChainBadge chainId={token.chain} />
        </div>
        <p className="truncate text-xs text-muted-foreground">{token.name}</p>
        {realBalance && token.standard === 'native' && (
          <p className="text-[10px] text-emerald-400/70">
            on-chain: {realBalance.loaded ? formatTokenAmount(parseFloat(realBalance.balanceEther), 6) : '...'}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{formatTokenAmount(token.balance, token.decimals)}</p>
        <p className="text-xs text-muted-foreground">{formatUsd(token.balance * token.priceUsd)}</p>
      </div>
    </button>
  )
}
