'use client'

import { useState } from 'react'
import { useWallet } from '../wallet-context'
import { chainById } from '@/lib/wallet/data'
import { scanContract, analyzeCalldata, type ContractScanResult, type ContractFinding } from '@/lib/wallet-scanner'
import { ChainBadge, RiskBadge } from '../common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Zap, Loader2, ShieldCheck, AlertTriangle, Ban, FileCode2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const SAMPLE_CONTRACTS = [
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', chain: 'ethereum', label: 'USDT (Tether)' },
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chain: 'ethereum', label: 'USDC (Circle)' },
  { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', chain: 'ethereum', label: 'WETH (Wrapped Ether)' },
  { address: '0x000000000022D473030F116dDEE9F6B43aC78BA3', chain: 'ethereum', label: 'Permit2 (Uniswap)' },
]

export function ScannerView() {
  const [address, setAddress] = useState('')
  const [chain, setChain] = useState('ethereum')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ContractScanResult | null>(null)
  const [calldata, setCalldata] = useState('')
  const [calldataFindings, setCalldataFindings] = useState<ContractFinding[]>([])
  const { toast } = useToast()

  const runScan = async (target?: { address: string; chain: string }) => {
    const finalAddress = target?.address ?? address
    const finalChain = target?.chain ?? chain
    if (!finalAddress) return
    setScanning(true)
    setResult(null)
    if (target) {
      setAddress(target.address)
      setChain(target.chain)
    }
    try {
      const r = await scanContract(finalChain, finalAddress)
      setResult(r)
      if (!r) {
        toast({ title: 'Falha no scan', description: 'Não foi possível ler o bytecode do contrato.', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Erro', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setScanning(false)
    }
  }

  const analyzeCalldataBtn = () => {
    if (!calldata || calldata.length < 10) return
    const findings = analyzeCalldata(calldata)
    setCalldataFindings(findings)
    if (findings.length === 0) {
      toast({ title: 'Calldata limpa', description: 'Nenhum padrão perigoso detectado.' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-6 w-6 text-emerald-400" />
          Smart Contract Scanner
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Antes de qualquer assinatura: análise completa do bytecode. Detecta delegatecall, selfdestruct, proxy, mint, ownership transfer e mais.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contract scanner */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode2 className="h-4 w-4 text-emerald-400" />
              Scanner de contrato
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Cole qualquer endereço de contrato para análise de bytecode em tempo real.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono"
              />
              <Select value={chain} onValueChange={setChain}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base'].map((c) => (
                    <SelectItem key={c} value={c}>{chainById(c).shortLabel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => runScan()}
                disabled={scanning || !address}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Scan
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center">Testar:</span>
              {SAMPLE_CONTRACTS.map((s) => (
                <button
                  key={s.address}
                  onClick={() => runScan(s)}
                  className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/50"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calldata analyzer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-emerald-400" />
              Calldata analyzer
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Cole o hex da calldata antes de assinar. Detecta approve infinito, setApprovalForAll, Permit2, etc.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={calldata}
              onChange={(e) => setCalldata(e.target.value)}
              placeholder="0x095ea7b3000000000000000000000000..."
              className="w-full rounded-lg border border-border/60 bg-muted/30 p-3 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 min-h-[100px]"
              spellCheck={false}
            />
            <Button
              onClick={analyzeCalldataBtn}
              disabled={!calldata || calldata.length < 10}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Zap className="h-4 w-4" /> Analisar calldata
            </Button>
            {calldataFindings.length > 0 && (
              <div className="space-y-1.5">
                {calldataFindings.map((f, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-lg border p-2.5',
                      f.severity === 'critical' && 'border-red-500/30 bg-red-500/5',
                      f.severity === 'danger' && 'border-orange-500/30 bg-orange-500/5',
                      f.severity === 'warning' && 'border-amber-500/30 bg-amber-500/5',
                      f.severity === 'info' && 'border-blue-500/30 bg-blue-500/5',
                      f.severity === 'safe' && 'border-emerald-500/30 bg-emerald-500/5'
                    )}
                  >
                    <p className="text-xs font-semibold">{f.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{f.description}</p>
                    {f.recommendation && (
                      <p className="text-[10px] text-emerald-400 mt-1">→ {f.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan result */}
      {scanning && (
        <Card className="border-emerald-500/30">
          <CardContent className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <div>
              <p className="text-sm font-medium">Lendo bytecode on-chain…</p>
              <p className="text-xs text-muted-foreground">Detectando padrões perigosos: delegatecall, selfdestruct, proxy, mint, ownership.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !scanning && (
        <Card className={cn(
          'border-2',
          result.riskLevel === 'safe' && 'border-emerald-500/40',
          result.riskLevel === 'low' && 'border-teal-500/40',
          result.riskLevel === 'medium' && 'border-amber-500/40',
          result.riskLevel === 'high' && 'border-orange-500/40',
          result.riskLevel === 'critical' && 'border-red-500/40'
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {result.riskLevel === 'safe' ? (
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
                ) : result.riskLevel === 'critical' ? (
                  <Ban className="h-5 w-5 shrink-0 text-red-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                )}
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">Resultado do scan</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono truncate">{result.address}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <RiskBadge level={result.riskLevel} />
                <Badge variant="outline" className="text-[9px]">{result.riskScore}/100</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Findings grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricCard label="Bytecode size" value={`${result.bytecodeSize} bytes`} />
              <MetricCard label="Verified" value={result.isVerified ? 'Sim' : 'Não'} />
              <MetricCard label="Proxy" value={result.hasProxyPattern ? 'Sim' : 'Não'} valueClass={result.hasProxyPattern ? 'text-amber-400' : ''} />
              <MetricCard label="delegatecall" value={result.hasDelegatecall ? 'Sim' : 'Não'} valueClass={result.hasDelegatecall ? 'text-red-400' : 'text-emerald-400'} />
              <MetricCard label="selfdestruct" value={result.hasSelfdestruct ? 'Sim' : 'Não'} valueClass={result.hasSelfdestruct ? 'text-red-400' : 'text-emerald-400'} />
              <MetricCard label="Mint" value={result.hasMint ? 'Sim' : 'Não'} valueClass={result.hasMint ? 'text-amber-400' : ''} />
              <MetricCard label="Ownership xfer" value={result.hasOwnershipTransfer ? 'Sim' : 'Não'} />
              <MetricCard label="Multicall" value={result.hasMulticall ? 'Sim' : 'Não'} />
            </div>

            {/* Findings list */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Análise detalhada</p>
              <div className="space-y-1.5">
                {result.findings.map((f, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-lg border p-3',
                      f.severity === 'critical' && 'border-red-500/30 bg-red-500/5',
                      f.severity === 'danger' && 'border-orange-500/30 bg-orange-500/5',
                      f.severity === 'warning' && 'border-amber-500/30 bg-amber-500/5',
                      f.severity === 'info' && 'border-blue-500/30 bg-blue-500/5',
                      f.severity === 'safe' && 'border-emerald-500/30 bg-emerald-500/5'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                        f.severity === 'critical' && 'bg-red-500',
                        f.severity === 'danger' && 'bg-orange-500',
                        f.severity === 'warning' && 'bg-amber-500',
                        f.severity === 'info' && 'bg-blue-500',
                        f.severity === 'safe' && 'bg-emerald-500'
                      )} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{f.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{f.description}</p>
                        {f.recommendation && (
                          <p className="text-[10px] text-emerald-400 mt-1">→ {f.recommendation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('text-xs font-bold', valueClass)}>{value}</p>
    </div>
  )
}
