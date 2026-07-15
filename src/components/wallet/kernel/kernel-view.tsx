'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Brain, Eye, Activity, KeyRound,
  Globe, Zap, FileText, Database, AlertTriangle, CheckCircle2, XCircle,
  Power, Cpu, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SECURITY_LEVELS, type SecurityLevel, runCryptographicSelfTest, type SelfTestResult,
} from '@/lib/wallet-kernel'

const ENGINES = [
  { name: 'Identity Engine', icon: KeyRound, color: 'text-emerald-400' },
  { name: 'Threat Intelligence', icon: Database, color: 'text-red-400' },
  { name: 'Behavior Engine', icon: Brain, color: 'text-purple-400' },
  { name: 'Transaction Engine', icon: Activity, color: 'text-blue-400' },
  { name: 'Simulation Engine', icon: Eye, color: 'text-teal-400' },
  { name: 'Permission Engine', icon: Lock, color: 'text-amber-400' },
  { name: 'Network Engine', icon: Globe, color: 'text-cyan-400' },
  { name: 'Privacy Engine', icon: Shield, color: 'text-indigo-400' },
  { name: 'Recovery Engine', icon: ShieldCheck, color: 'text-emerald-400' },
  { name: 'Policy Engine', icon: FileText, color: 'text-orange-400' },
  { name: 'Monitoring Engine', icon: Activity, color: 'text-pink-400' },
  { name: 'Forensic Engine', icon: AlertTriangle, color: 'text-red-400' },
]

export function KernelView() {
  const [level, setLevel] = useState<SecurityLevel>('L1')
  const [selfTests, setSelfTests] = useState<SelfTestResult[]>([])
  const [running, setRunning] = useState(false)
  const [tested, setTested] = useState(false)

  const runSelfTest = async () => {
    setRunning(true)
    const results = await runCryptographicSelfTest()
    setSelfTests(results)
    setTested(true)
    setRunning(false)
  }

  useEffect(() => {
    // Auto-run on mount — but don't update state synchronously
    let mounted = true
    const run = async () => {
      setRunning(true)
      const results = await runCryptographicSelfTest()
      if (mounted) {
        setSelfTests(results)
        setTested(true)
        setRunning(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  const allPassed = selfTests.length > 0 && selfTests.every(t => t.passed)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-400" />
          Security Kernel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Orquestrador central. Nenhuma assinatura acontece fora deste fluxo.
        </p>
      </div>

      {/* Kernel flow diagram */}
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-card">
        <CardContent className="relative p-6">
          {/* USER */}
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-2">
              <p className="text-sm font-bold text-emerald-400">USER</p>
            </div>
            <div className="h-6 w-px bg-emerald-500/30" />
            {/* KERNEL */}
            <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 px-8 py-3 shadow-lg shadow-emerald-500/20">
              <p className="text-base font-black uppercase tracking-tight text-emerald-400">Security Kernel</p>
              <p className="text-[9px] uppercase tracking-widest text-emerald-400/70 mt-0.5">TSS Enforced</p>
            </div>
            {/* ENGINES GRID */}
            <div className="grid grid-cols-3 gap-1.5 w-full max-w-2xl mt-2">
              {ENGINES.map((engine) => {
                const Icon = engine.icon
                return (
                  <div
                    key={engine.name}
                    className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/20 px-2 py-1.5"
                  >
                    <Icon className={cn('h-3 w-3 shrink-0', engine.color)} />
                    <span className="text-[10px] font-medium truncate">{engine.name}</span>
                  </div>
                )
              })}
            </div>
            <div className="h-6 w-px bg-emerald-500/30" />
            {/* BLOCKCHAIN */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-2">
              <p className="text-sm font-bold text-blue-400">Blockchain / DApps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Levels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-emerald-400" />
            Security Levels
          </CardTitle>
          <p className="text-xs text-muted-foreground">A Tank opera em 5 perfis de segurança.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-5">
            {Object.values(SECURITY_LEVELS).map(lvl => (
              <button
                key={lvl.level}
                onClick={() => setLevel(lvl.level)}
                className={cn(
                  'rounded-xl border p-3 text-left transition-all',
                  level === lvl.level
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{lvl.level}</span>
                  {level === lvl.level && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                </div>
                <p className="text-sm font-bold">{lvl.name}</p>
                <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">{lvl.description}</p>
                <div className="mt-2 space-y-0.5">
                  {lvl.biometricRequired && (
                    <p className="text-[8px] text-amber-400">✓ Biometria</p>
                  )}
                  {lvl.doubleConfirmation && (
                    <p className="text-[8px] text-amber-400">✓ Dupla confirmação</p>
                  )}
                  {lvl.blockUnknownContracts && (
                    <p className="text-[8px] text-red-400">✓ Block unknown</p>
                  )}
                  {lvl.privateRelaysRequired && (
                    <p className="text-[8px] text-blue-400">✓ Private relays</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cryptographic Self-Test */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-4 w-4 text-emerald-400" />
              Cryptographic Self-Test
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] gap-1"
              onClick={runSelfTest}
              disabled={running}
            >
              {running ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Re-run
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            TSS-005: testes criptográficos na inicialização. Se qualquer teste falhar, a carteira bloqueia.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {selfTests.length === 0 && running && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Executando testes...
            </div>
          )}
          {selfTests.map(test => (
            <div
              key={test.test}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3',
                test.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
              )}
            >
              {test.passed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold">{test.test}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{test.detail}</p>
              </div>
              <Badge variant="outline" className={cn(
                'text-[9px]',
                test.passed ? 'border-emerald-500/40 text-emerald-400' : 'border-red-500/40 text-red-400'
              )}>
                {test.passed ? 'PASS' : 'FAIL'}
              </Badge>
            </div>
          ))}
          {tested && (
            <div className={cn(
              'mt-3 rounded-lg border p-3 text-center',
              allPassed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
            )}>
              {allPassed ? (
                <>
                  <ShieldCheck className="mx-auto h-6 w-6 text-emerald-400" />
                  <p className="text-sm font-bold text-emerald-400 mt-1">Security Engine: PASSED</p>
                  <p className="text-[10px] text-muted-foreground">Wallet can operate safely</p>
                </>
              ) : (
                <>
                  <ShieldAlert className="mx-auto h-6 w-6 text-red-400" />
                  <p className="text-sm font-bold text-red-400 mt-1">Security Engine: FAILED</p>
                  <p className="text-[10px] text-muted-foreground">Wallet Locked — cryptographic integrity compromised</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kernel rule */}
      <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-400">Regra Arquitetural</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nenhum novo recurso entra na Tank Wallet sem passar pelo Security Kernel.
                A arquitetura está congelada e segue o Tank Security Standard (TSS).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
