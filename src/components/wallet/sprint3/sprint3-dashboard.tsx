'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2, XCircle, Loader2, Zap, FileText, Bug, Brain, Activity,
  Shield, AlertTriangle, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EthereumPlugin } from '@/lib/wallet-plugins/ethereum'
import { BitcoinPlugin } from '@/lib/wallet-plugins/bitcoin'
import { SolanaPlugin } from '@/lib/wallet-plugins/solana'
import { LightningPlugin } from '@/lib/wallet-plugins/lightning'
import { runConformanceSuite, generateSecurityValidationReport, type ConformanceResult, type SecurityValidationReport } from '@/lib/wallet-plugins/conformance'

export function Sprint3Dashboard() {
  const [results, setResults] = useState<ConformanceResult[]>([])
  const [report, setReport] = useState<SecurityValidationReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      const plugins = [new EthereumPlugin('ethereum'), new BitcoinPlugin(), new SolanaPlugin(), new LightningPlugin()]
      const allResults: ConformanceResult[] = []
      for (const plugin of plugins) {
        const result = await runConformanceSuite(plugin)
        allResults.push(result)
        if (mounted) setResults([...allResults])
      }
      if (mounted) { setReport(generateSecurityValidationReport(allResults)); setLoading(false) }
    }
    run()
    return () => { mounted = false }
  }, [])

  const allConformance = results.length > 0 && results.every(r => r.overallStatus === 'pass')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Shield className="h-6 w-6 text-emerald-400" />Sprint 3 — Security Validation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conformance → Unit → Property → Fuzz → Chaos → Memory → E2E</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Conformance" value={results.length > 0 ? `${results.filter(r => r.overallStatus === 'pass').length}/${results.length}` : '—'} sub={allConformance ? 'All pass' : 'Running...'} color={allConformance ? 'text-emerald-400' : 'text-amber-400'} done={allConformance} />
        <Metric label="Coverage Target" value="≥95%" sub="Production engines" color="text-amber-400" done={false} />
        <Metric label="Fuzz Testing" value="PLANNED" sub="PSBT, RLP, ABI, BOLT-11" color="text-muted-foreground" done={false} />
        <Metric label="Chaos Testing" value="PLANNED" sub="RPC, reorg, timeout" color="text-muted-foreground" done={false} />
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Conformance Suite — Per Chain</CardTitle><p className="text-xs text-muted-foreground">11 tests per plugin.</p></CardHeader>
        <CardContent className="space-y-4">
          {loading && results.length === 0 && <div className="flex items-center gap-2 py-4"><Loader2 className="h-4 w-4 animate-spin text-emerald-400" /><p className="text-sm text-muted-foreground">Running...</p></div>}
          {results.map(result => (
            <div key={result.chainId} className={cn('rounded-xl border p-3', result.overallStatus === 'pass' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5')}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><p className="text-sm font-bold">{result.chainName}</p><Badge variant="outline" className={cn('text-[9px]', result.overallStatus === 'pass' ? 'border-emerald-500/40 text-emerald-400' : 'border-red-500/40 text-red-400')}>{result.overallStatus === 'pass' ? '✓ PASS' : '✗ FAIL'}</Badge></div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground"><span>{result.passed}/{result.totalTests} passed</span><span>{result.durationMs}ms</span></div>
              </div>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {result.tests.map(test => (
                  <div key={test.name} className={cn('flex items-center gap-1.5 rounded px-1.5 py-1 text-[9px]', test.status === 'pass' && 'bg-emerald-500/5', test.status === 'fail' && 'bg-red-500/5')}>
                    {test.status === 'pass' && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400 shrink-0" />}
                    {test.status === 'fail' && <XCircle className="h-2.5 w-2.5 text-red-400 shrink-0" />}
                    <span className={cn('truncate', test.status === 'pass' && 'text-emerald-400', test.status === 'fail' && 'text-red-400')}>{test.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {report && (
        <Card className="border-2 border-emerald-500/30">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-emerald-400" />Security Validation Report</CardTitle><p className="text-[10px] text-muted-foreground">Generated: {report.generatedAt}</p></CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Row label="Conformance" value={`${report.conformance.passed}/${report.conformance.totalPlugins}`} status={report.conformance.percentage === 100 ? 'PASS' : 'FAIL'} />
              <Row label="Coverage" value={`${report.coverage.current}%`} status={report.coverage.status} />
              <Row label="Property Tests" value={report.propertyTests.detail} status={report.propertyTests.status} />
              <Row label="Fuzz Cases" value={`${report.fuzzCases.total}`} status={report.fuzzCases.status} />
              <Row label="Memory Leaks" value={`${report.memoryLeaks.count}`} status={report.memoryLeaks.status} />
              <Row label="Crypto Self-Test" value={`${report.cryptoSelfTest.passed}/${report.cryptoSelfTest.tests}`} status={report.cryptoSelfTest.status} />
              <Row label="TSS Compliance" value={`${report.tssCompliance.percentage}%`} status={report.tssCompliance.percentage === 100 ? 'PASS' : 'IN_PROGRESS'} />
              <Row label="TSF Coverage" value={`${report.tsfCoverage.percentage}%`} status={report.tsfCoverage.percentage === 100 ? 'PASS' : 'FAIL'} />
            </div>
            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
              <p className="text-sm font-bold">Overall Status</p>
              <Badge className={cn('text-xs', report.overallStatus === 'PASS' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', report.overallStatus === 'IN_PROGRESS' && 'bg-amber-500/10 text-amber-400 border-amber-500/30')}>{report.overallStatus}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Metric({ label, value, sub, color, done }: { label: string; value: string; sub: string; color: string; done: boolean }) {
  return <div className="rounded-xl bg-muted/15 p-3"><div className="flex items-center gap-1.5 mb-0.5">{done && <CheckCircle2 className={cn('h-3 w-3', color)} />}<p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{label}</p></div><p className={cn('text-lg font-bold', color)}>{value}</p><p className="text-[9px] text-muted-foreground">{sub}</p></div>
}

function Row({ label, value, status }: { label: string; value: string; status: string }) {
  return <div className="flex items-center justify-between py-1 border-b border-border/10 last:border-0"><div className="flex items-center gap-2">{status === 'PASS' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}{status === 'FAIL' && <XCircle className="h-3 w-3 text-red-400" />}{status === 'PLANNED' && <span className="h-3 w-3 rounded-full border border-muted-foreground/30" />}{status === 'IN_PROGRESS' && <Loader2 className="h-3 w-3 animate-spin text-amber-400" />}<span className="text-xs font-medium">{label}</span></div><div className="flex items-center gap-2"><span className="text-[11px] text-muted-foreground">{value}</span><Badge variant="outline" className={cn('text-[8px] w-16 justify-center', status === 'PASS' && 'border-emerald-500/40 text-emerald-400', status === 'FAIL' && 'border-red-500/40 text-red-400', status === 'PLANNED' && 'border-muted-foreground/40 text-muted-foreground', status === 'IN_PROGRESS' && 'border-amber-500/40 text-amber-400')}>{status}</Badge></div></div>
}
