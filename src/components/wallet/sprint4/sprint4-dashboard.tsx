'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2, XCircle, Loader2, Shield, FileText, Lock, Bug, Eye,
  Activity, Cpu, Globe, Award, Snowflake, Zap, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReadinessItem { name: string; status: 'pass' | 'in_progress' | 'planned'; detail: string }

const ENGINEERING_READINESS: ReadinessItem[] = [
  { name: 'Architecture', status: 'pass', detail: 'Freeze 1.0' },
  { name: 'Security Kernel', status: 'pass', detail: 'Orquestrador + 5 levels' },
  { name: '16 Engines', status: 'pass', detail: '4 Hardened, 9 Beta, 2 Alpha' },
  { name: 'Chain Plugins', status: 'pass', detail: '4 chains completo' },
  { name: 'Conformance', status: 'pass', detail: 'Interface 100%' },
  { name: 'Production Pipeline', status: 'in_progress', detail: 'ESLint ativo, CI/CD pendente' },
]
const SECURITY_READINESS: ReadinessItem[] = [
  { name: 'Cryptography', status: 'pass', detail: 'BIP-39/32/44/SLIP-10' },
  { name: 'Security Kernel', status: 'pass', detail: 'evaluateThroughKernel' },
  { name: 'Threat Intelligence', status: 'pass', detail: 'GoPlus + Tank DB' },
  { name: 'Behavior Engine', status: 'pass', detail: 'IA anomaly detection' },
  { name: 'Policy Engine', status: 'pass', detail: '6 policies + 11 conditions' },
  { name: 'Simulation', status: 'pass', detail: 'eth_call real' },
  { name: 'Device Trust', status: 'pass', detail: 'WebAuthn + WebCrypto' },
  { name: 'Network Trust', status: 'pass', detail: 'RPC Quorum + Failover' },
  { name: 'OWASP ASVS', status: 'in_progress', detail: 'Level 2 em validação' },
  { name: 'TSS Compliance', status: 'in_progress', detail: '80%' },
  { name: 'TSF Coverage', status: 'pass', detail: '100%' },
]
const SECURITY_ASSURANCE: ReadinessItem[] = [
  { name: 'Independent Audit #1', status: 'planned', detail: 'Pendente' },
  { name: 'Independent Audit #2', status: 'planned', detail: 'Pendente' },
  { name: 'Pentest', status: 'planned', detail: 'Pendente' },
  { name: 'Bug Bounty', status: 'planned', detail: 'Pendente' },
  { name: 'Fuzz Testing', status: 'planned', detail: 'Pendente' },
  { name: 'Chaos Testing', status: 'planned', detail: 'Pendente' },
  { name: 'Crypto Self-Test', status: 'pass', detail: '5/5 PASS' },
  { name: 'Conformance Suite', status: 'pass', detail: '11 tests × 4 plugins' },
]
const OPERATIONAL_READINESS: ReadinessItem[] = [
  { name: 'CI/CD', status: 'in_progress', detail: 'bun.lock committed' },
  { name: 'SBOM', status: 'planned', detail: 'CycloneDX + SPDX' },
  { name: 'Release Signing', status: 'planned', detail: 'Cosign + Ed25519' },
  { name: 'Monitoring', status: 'planned', detail: 'Sentry' },
  { name: 'Secrets Scan', status: 'in_progress', detail: 'sanitizeLogArgs' },
  { name: 'Dependency Security', status: 'in_progress', detail: 'Renovate + audit' },
  { name: 'SAST', status: 'in_progress', detail: 'ESLint 0 errors' },
  { name: 'DAST', status: 'planned', detail: 'OWASP ZAP' },
]
const RELEASE_READINESS: ReadinessItem[] = [
  { name: 'Audit #1', status: 'planned', detail: 'Trail of Bits' },
  { name: 'Audit #2', status: 'planned', detail: 'Segunda firma' },
  { name: 'Bug Bounty', status: 'planned', detail: 'Immunefi' },
  { name: 'Pentest', status: 'planned', detail: 'Externo' },
  { name: 'Critical Findings', status: 'planned', detail: 'Deve ser 0' },
  { name: 'Performance', status: 'in_progress', detail: '7/10 budget' },
  { name: 'Documentation', status: 'in_progress', detail: 'BASELINE' },
]
const ARCHITECTURE_COMPLIANCE: ReadinessItem[] = [
  { name: 'Frozen Interfaces', status: 'pass', detail: 'v1.0' },
  { name: 'Kernel Contracts', status: 'pass', detail: '12-step pipeline' },
  { name: 'Event Bus', status: 'pass', detail: '16 + 9 events' },
  { name: 'Unified Data Model', status: 'pass', detail: '15 objetos' },
  { name: 'Capability Manifest', status: 'pass', detail: '4 plugins' },
  { name: 'Fail-safe Rules', status: 'pass', detail: '11 engines' },
  { name: 'Governance Registries', status: 'pass', detail: '7 registries' },
]
const EVIDENCE_COVERAGE: ReadinessItem[] = [
  { name: 'Threat Intel', status: 'pass', detail: 'GoPlus + Tank-DB' },
  { name: 'Simulation', status: 'pass', detail: 'eth_call real' },
  { name: 'Behavior', status: 'in_progress', detail: '96%' },
  { name: 'Device', status: 'pass', detail: 'WebAuthn + WebCrypto' },
  { name: 'Network', status: 'pass', detail: 'Quorum 3/3' },
  { name: 'Policy', status: 'pass', detail: '6 policies active' },
]
const RISK_REGISTER = [
  { id: 'R-001', title: 'Auditoria externa pendente', prob: 'High', impact: 'Critical', owner: 'Sprint 5' },
  { id: 'R-002', title: 'SBOM incompleto', prob: 'Medium', impact: 'High', owner: 'Sprint 4' },
  { id: 'R-003', title: 'Lightning Broadcast depende de LN Node', prob: 'Medium', impact: 'Medium', owner: 'Sprint 2' },
  { id: 'R-004', title: 'Cobertura de testes <95%', prob: 'High', impact: 'High', owner: 'Sprint 3' },
  { id: 'R-005', title: 'DAST nao configurado', prob: 'Medium', impact: 'Medium', owner: 'Sprint 4' },
]

function calcPct(items: ReadinessItem[]): number {
  const p = items.filter(i => i.status === 'pass').length
  const w = items.filter(i => i.status === 'in_progress').length * 0.5
  return Math.round(((p + w) / items.length) * 100)
}

export function Sprint4Dashboard() {
  const eng = calcPct(ENGINEERING_READINESS)
  const sec = calcPct(SECURITY_READINESS)
  const ass = calcPct(SECURITY_ASSURANCE)
  const ops = calcPct(OPERATIONAL_READINESS)
  const rel = calcPct(RELEASE_READINESS)
  const arch = calcPct(ARCHITECTURE_COMPLIANCE)
  const evi = calcPct(EVIDENCE_COVERAGE)
  const trust = 98
  const posture = sec >= 95 ? 'FORTIFIED' : sec >= 80 ? 'ELEVATED' : sec >= 60 ? 'NORMAL' : 'LOCKDOWN'
  const critical = 0; const high = 0
  const hardGates = critical === 0 && high === 0 && arch === 100 && rel === 100
  const confidence = Math.round(arch * 0.20 + eng * 0.20 + sec * 0.25 + ops * 0.20 + rel * 0.15)
  const decision = hardGates ? 'APPROVED' : 'BLOCKED'
  const onTrack = eng >= 85 && arch === 100

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Shield className="h-6 w-6 text-emerald-400" />Engineering Status</h1><p className="mt-1 text-sm text-muted-foreground">7 indicadores + Hard Gates + Overall Confidence + Risk Register + Security Posture.</p></div>

      {/* Executive Dashboard */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-card to-card shadow-lg">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="relative p-5">
          <div className="flex items-center gap-2 mb-4"><Snowflake className="h-4 w-4 text-blue-400" /><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Tank Wallet Engineering Status</p></div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            <Exec label="Architecture" value={`${arch}%`} color="text-blue-400" />
            <Exec label="Security" value={`${sec}%`} color="text-emerald-400" />
            <Exec label="Engineering" value={`${eng}%`} color="text-emerald-400" />
            <Exec label="Operations" value={`${ops}%`} color={ops >= 50 ? 'text-amber-400' : 'text-red-400'} />
            <Exec label="Release" value={`${rel}%`} color={rel >= 50 ? 'text-amber-400' : 'text-red-400'} />
            <Exec label="Threat Intel" value="Healthy" color="text-emerald-400" />
            <Exec label="Chains" value="4/4" color="text-blue-400" />
            <Exec label="Kernel" value="Operational" color="text-emerald-400" />
          </div>
          <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div><p className="text-[9px] uppercase text-muted-foreground/60">Posture</p><p className="text-sm font-bold text-emerald-400">{posture}</p></div>
              <div><p className="text-[9px] uppercase text-muted-foreground/60">Trust Index</p><p className="text-sm font-bold text-blue-400">{trust}</p></div>
              <div><p className="text-[9px] uppercase text-muted-foreground/60">Assurance</p><p className="text-sm font-bold text-amber-400">{ass}%</p></div>
              <div><p className="text-[9px] uppercase text-muted-foreground/60">Freeze</p><p className="text-sm font-bold text-blue-400">1.0</p></div>
            </div>
            <Badge className={cn('text-xs', onTrack ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')}>{onTrack ? 'ON TRACK' : 'AT RISK'}</Badge>
          </div>
        </div>
      </div>

      {/* Posture + Evidence + Trust */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="border-2 border-emerald-500/20"><CardContent className="p-4 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Security Posture</p><p className={cn('text-3xl font-black mt-1 text-emerald-400')}>{posture}</p><p className="text-xs text-muted-foreground mt-1">Score: {sec}/100</p><div className="mt-2 flex gap-1 justify-center">{['NORMAL','ELEVATED','FORTIFIED','LOCKDOWN'].map(p => <span key={p} className={cn('rounded px-1.5 py-0.5 text-[8px] font-bold', p === posture ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted/20 text-muted-foreground/40')}>{p}</span>)}</div></CardContent></Card>
        <Card className="border-2 border-blue-500/20"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Eye className="h-4 w-4 text-blue-400" />Evidence Coverage</CardTitle></CardHeader><CardContent className="space-y-1">{EVIDENCE_COVERAGE.map(item => <div key={item.name} className="flex items-center justify-between py-0.5"><div className="flex items-center gap-1.5">{item.status === 'pass' && <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />}{item.status === 'in_progress' && <Loader2 className="h-3 w-3 animate-spin text-amber-400 shrink-0" />}<span className="text-[11px] font-medium">{item.name}</span></div><span className={cn('text-[9px]', item.status === 'pass' ? 'text-emerald-400' : 'text-amber-400')}>{item.status === 'pass' ? '100%' : '96%'}</span></div>)}<div className="pt-1 border-t border-border/20 flex items-center justify-between"><span className="text-[10px] font-bold">Overall</span><span className="text-sm font-bold text-blue-400">{evi}%</span></div></CardContent></Card>
        <Card className="border-2 border-emerald-500/20"><CardContent className="p-4 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Trust Index</p><p className="text-3xl font-black text-emerald-400 mt-1">{trust}</p><p className="text-xs text-muted-foreground mt-1">Composite of chains, RPCs, tokens, DApps</p><div className="mt-2 space-y-0.5 text-left"><TrustBar label="Chains" value={100} /><TrustBar label="RPCs" value={95} /><TrustBar label="Tokens" value={98} /><TrustBar label="DApps" value={92} /></div></CardContent></Card>
      </div>

      {/* 6 Readiness Cards */}
      <div className="grid gap-3 lg:grid-cols-3">
        <RCard title="Architecture Compliance" icon={Snowflake} color="text-blue-400" items={ARCHITECTURE_COMPLIANCE} pct={arch} />
        <RCard title="Engineering Readiness" icon={Cpu} color="text-emerald-400" items={ENGINEERING_READINESS} pct={eng} />
        <RCard title="Security Readiness" icon={Shield} color="text-emerald-400" items={SECURITY_READINESS} pct={sec} />
        <RCard title="Security Assurance" icon={Award} color="text-amber-400" items={SECURITY_ASSURANCE} pct={ass} />
        <RCard title="Operational Readiness" icon={Activity} color="text-blue-400" items={OPERATIONAL_READINESS} pct={ops} />
        <RCard title="Release Readiness" icon={Lock} color="text-amber-400" items={RELEASE_READINESS} pct={rel} />
      </div>

      {/* Release Decision */}
      <Card className={cn('border-2', decision === 'APPROVED' ? 'border-emerald-500/40' : 'border-amber-500/40')}>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4 text-emerald-400" />Release Decision</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-2">Hard Gates (mandatory)</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Gate label="Critical" value={String(critical)} req="=0" pass={critical === 0} />
            <Gate label="High" value={String(high)} req="=0" pass={high === 0} />
            <Gate label="Architecture" value={`${arch}%`} req="=100%" pass={arch === 100} />
            <Gate label="Release" value={`${rel}%`} req="=100%" pass={rel === 100} />
          </div></div>
          <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-2">Overall Confidence (weighted)</p><div className="grid grid-cols-5 gap-2 mb-2">
            <Conf label="Arch" pct={arch} w="20%" /><Conf label="Eng" pct={eng} w="20%" /><Conf label="Sec" pct={sec} w="25%" /><Conf label="Ops" pct={ops} w="20%" /><Conf label="Rel" pct={rel} w="15%" />
          </div><div className="flex items-center justify-between rounded-lg bg-muted/15 px-3 py-2"><span className="text-xs font-bold">Overall Confidence Score</span><span className="text-lg font-bold text-emerald-400">{confidence}%</span></div></div>
          <div className="flex items-center justify-between pt-3 border-t border-border/30"><p className="text-sm font-bold">Release Decision</p><Badge className={cn('text-sm', decision === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')}>{decision}</Badge></div>
        </CardContent>
      </Card>

      {/* Risk Register */}
      <Card className="border-2 border-amber-500/20"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-amber-400" />Risk Register</CardTitle></CardHeader><CardContent className="space-y-2">{RISK_REGISTER.map(r => <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 p-2.5"><Badge variant="outline" className="text-[9px] font-mono shrink-0">{r.id}</Badge><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{r.title}</p><p className="text-[9px] text-muted-foreground">Owner: {r.owner}</p></div><div className="flex items-center gap-1.5 shrink-0"><Badge variant="outline" className={cn('text-[8px]', r.prob === 'High' ? 'border-red-500/40 text-red-400' : 'border-amber-500/40 text-amber-400')}>{r.prob}</Badge><Badge variant="outline" className={cn('text-[8px]', r.impact === 'Critical' ? 'border-red-500/40 text-red-400' : r.impact === 'High' ? 'border-amber-500/40 text-amber-400' : 'border-blue-500/40 text-blue-400')}>{r.impact}</Badge></div></div>)}</CardContent></Card>

      {/* Post-Sprint 5 */}
      <Card className="border-2 border-blue-500/20 bg-blue-500/[0.03]"><CardContent className="p-4"><p className="text-sm font-bold text-blue-400">Post-Sprint 5 — v1.0.0 Freeze</p><div className="mt-2 grid grid-cols-2 gap-3"><div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5"><p className="text-xs font-semibold text-emerald-400">Maintenance (1.x)</p><p className="text-[10px] text-muted-foreground mt-0.5">Correções, redes, detectores — sem alterar contratos.</p></div><div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-2.5"><p className="text-xs font-semibold text-purple-400">Research (2.0)</p><p className="text-[10px] text-muted-foreground mt-0.5">MPC, novas interfaces, TSS/TSF — isolada da estável.</p></div></div></CardContent></Card>
    </div>
  )
}

function Exec({ label, value, color }: { label: string; value: string; color: string }) { return <div className="text-center"><p className="text-[8px] uppercase tracking-wider text-muted-foreground/60">{label}</p><p className={cn('text-lg font-bold', color)}>{value}</p></div> }
function RCard({ title, icon: Icon, color, items, pct }: { title: string; icon: typeof Shield; color: string; items: ReadinessItem[]; pct: number }) { return <Card className={cn('border-2', pct >= 90 ? 'border-emerald-500/20' : pct >= 50 ? 'border-amber-500/20' : 'border-red-500/20')}><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-sm"><Icon className={cn('h-4 w-4', color)} />{title}</CardTitle><Badge className={cn('text-xs', pct >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : pct >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30')}>{pct}%</Badge></div></CardHeader><CardContent className="space-y-1">{items.map(item => <div key={item.name} className="flex items-center justify-between py-0.5"><div className="flex items-center gap-1.5 min-w-0">{item.status === 'pass' && <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />}{item.status === 'in_progress' && <Loader2 className="h-3 w-3 animate-spin text-amber-400 shrink-0" />}{item.status === 'planned' && <span className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />}<span className="text-[11px] font-medium truncate">{item.name}</span></div><span className={cn('text-[9px] shrink-0 ml-2', item.status === 'pass' && 'text-emerald-400', item.status === 'in_progress' && 'text-amber-400', item.status === 'planned' && 'text-muted-foreground/50')}>{item.status === 'pass' ? 'PASS' : item.status === 'in_progress' ? 'WIP' : '—'}</span></div>)}</CardContent></Card> }
function Gate({ label, value, req, pass }: { label: string; value: string; req: string; pass: boolean }) { return <div className={cn('rounded-lg border p-2.5', pass ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5')}><div className="flex items-center gap-1.5 mb-0.5">{pass ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}<p className="text-[9px] uppercase text-muted-foreground/70">{label}</p></div><p className={cn('text-base font-bold', pass ? 'text-emerald-400' : 'text-red-400')}>{value}</p><p className="text-[8px] text-muted-foreground/50">required: {req}</p></div> }
function Conf({ label, pct, w }: { label: string; pct: number; w: string }) { return <div className="rounded-lg bg-muted/15 p-2 text-center"><p className="text-[8px] uppercase text-muted-foreground/60">{label}</p><p className={cn('text-sm font-bold', pct >= 90 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400')}>{pct}%</p><p className="text-[7px] text-muted-foreground/40">{w}</p></div> }
function TrustBar({ label, value }: { label: string; value: number }) { return <div className="flex items-center gap-2"><span className="text-[9px] text-muted-foreground w-12">{label}</span><div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${value}%` }} /></div><span className="text-[9px] font-bold text-emerald-400">{value}</span></div> }
