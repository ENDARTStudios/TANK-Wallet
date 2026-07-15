'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield, Lock, Layers, GitBranch, Activity, Zap, Database, AlertTriangle,
  CheckCircle2, XCircle, Snowflake, FileText, Cpu, Gauge, BookOpen, Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ARCHITECTURE_LAYERS, DECISION_PIPELINE, ENGINE_MATURITY_SNAPSHOT,
  FAIL_SAFE_MODES, PERFORMANCE_BUDGET, V1_COMPLETION_CRITERIA,
  MATURITY_LEVELS, type MaturityLevel,
} from '@/lib/wallet-kernel/architecture-freeze'

export function ArchitectureFreezeView() {
  const doneCriteria = V1_COMPLETION_CRITERIA.filter(c => c.status === 'done').length
  const totalCriteria = V1_COMPLETION_CRITERIA.length
  const criteriaPct = Math.round((doneCriteria / totalCriteria) * 100)

  const productionEngines = ENGINE_MATURITY_SNAPSHOT.filter(e => e.maturity === 'production').length
  const betaEngines = ENGINE_MATURITY_SNAPSHOT.filter(e => e.maturity === 'beta').length
  const alphaEngines = ENGINE_MATURITY_SNAPSHOT.filter(e => e.maturity === 'alpha').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Snowflake className="h-6 w-6 text-blue-400" />
          Architecture Freeze 1.0
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A arquitetura está congelada. O foco passa de "o que construir" para "como validar e manter a segurança ao longo do tempo".
        </p>
      </div>

      {/* Freeze banner */}
      <Card className="border-2 border-blue-500/40 bg-gradient-to-br from-blue-500/10 via-card to-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 shrink-0">
              <Snowflake className="h-7 w-7 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-blue-400">Architecture Freeze 1.0 — Active</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A partir deste marco: nenhum novo engine é criado, nenhum registry novo é adicionado,
                nenhum domínio TSF novo é criado sem justificativa formal. Novas funcionalidades só podem
                reutilizar os componentes existentes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-blue-500/40 text-blue-400">Interfaces Frozen</Badge>
                <Badge variant="outline" className="border-blue-500/40 text-blue-400">Event Bus Active</Badge>
                <Badge variant="outline" className="border-blue-500/40 text-blue-400">Fail-Safe Declared</Badge>
                <Badge variant="outline" className="border-blue-500/40 text-blue-400">SemVer Enforced</Badge>
                <Badge variant="outline" className="border-blue-500/40 text-blue-400">Defense in Depth</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="layers" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="layers">Layer Separation</TabsTrigger>
          <TabsTrigger value="flow">Decision Flow</TabsTrigger>
          <TabsTrigger value="interface">Frozen Interface</TabsTrigger>
          <TabsTrigger value="maturity">Maturity Model</TabsTrigger>
          <TabsTrigger value="failsafe">Fail-Safe Modes</TabsTrigger>
          <TabsTrigger value="performance">Performance Budget</TabsTrigger>
          <TabsTrigger value="v1">v1.0 Criteria</TabsTrigger>
        </TabsList>

        {/* Layer Separation */}
        <TabsContent value="layers">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4 text-emerald-400" />
                Layer Separation — 4 Layers
              </CardTitle>
              <p className="text-xs text-muted-foreground">Nenhuma camada pode acessar diretamente outra que não seja a imediatamente inferior.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {ARCHITECTURE_LAYERS.map((layer, i) => (
                <div key={layer.id}>
                  <div className={cn(
                    'rounded-xl border-2 p-4',
                    i === 0 && 'border-purple-500/30 bg-purple-500/5',
                    i === 1 && 'border-emerald-500/40 bg-emerald-500/5',
                    i === 2 && 'border-blue-500/30 bg-blue-500/5',
                    i === 3 && 'border-amber-500/30 bg-amber-500/5',
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">L{i + 1}</span>
                      <p className="text-sm font-bold">{layer.name}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{layer.description}</p>
                    <div className="space-y-1">
                      {layer.rules.map((rule, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                          <CheckCircle2 className="h-2.5 w-2.5 shrink-0 mt-0.5 text-emerald-400" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {i < ARCHITECTURE_LAYERS.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="text-muted-foreground/40 text-xs">↓</div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decision Flow */}
        <TabsContent value="flow">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-emerald-400" />
                Single Decision Flow — No Alternative Paths
              </CardTitle>
              <p className="text-xs text-muted-foreground">Toda operação segue exatamente o mesmo pipeline. Não deve existir nenhum caminho alternativo.</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-1">
                {DECISION_PIPELINE.map((step, i) => (
                  <div key={step} className="flex flex-col items-center w-full">
                    <div className={cn(
                      'rounded-lg border px-4 py-2 text-center w-full max-w-xs',
                      i === 0 && 'border-purple-500/30 bg-purple-500/5',
                      i === 1 && 'border-emerald-500/40 bg-emerald-500/10 font-bold',
                      step === 'Signature' && 'border-amber-500/30 bg-amber-500/5',
                      step === 'Audit' && 'border-blue-500/30 bg-blue-500/5',
                      !['0', '1'].includes(String(i)) && step !== 'Signature' && step !== 'Audit' && 'border-border/50 bg-muted/20',
                    )}>
                      <span className="text-xs font-medium">{step}</span>
                    </div>
                    {i < DECISION_PIPELINE.length - 1 && (
                      <div className="text-muted-foreground/30 text-xs py-0.5">↓</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Frozen Interface */}
        <TabsContent value="interface">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4 text-emerald-400" />
                Frozen Interface — SecurityEngine
              </CardTitle>
              <p className="text-xs text-muted-foreground">O SecurityKernel conhece apenas esta interface. Nunca implementações concretas.</p>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/60 bg-zinc-950/50 p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-emerald-400/90">{`interface SecurityEngine {
  readonly id: string
  readonly version: string

  ${'// Initialize — called once at kernel startup'}
  initialize(): Promise${'<void>'}

  ${'// Evaluate a security context'}
  evaluate(context: SecurityContext): Promise${'<SecurityResult>'}

  ${'// Explain a result in human-readable terms'}
  explain(result: SecurityResult): HumanExplanation

  ${'// Check engine health'}
  health(): EngineHealth

  ${'// Get capability manifest'}
  manifest(): EngineCapabilityManifest

  ${'// Gracefully shutdown'}
  shutdown(): Promise${'<void>'}
}`}</pre>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">SecurityResult</p>
                  <p className="text-[11px] text-muted-foreground mt-1">score, level, blocked, evidence[], explanation, durationMs</p>
                </div>
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">EngineCapabilityManifest</p>
                  <p className="text-[11px] text-muted-foreground mt-1">id, version, capabilities[], requires[], tsfDomains[], tssSpecs[], maturity, failSafe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maturity Model */}
        <TabsContent value="maturity">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4 text-emerald-400" />
                Engine Maturity Model
              </CardTitle>
              <p className="text-xs text-muted-foreground">Promoção para nível superior depende de critérios objetivos, não apenas implementação.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Maturity levels legend */}
              <div className="grid grid-cols-3 gap-2">
                {(['production', 'beta', 'alpha'] as MaturityLevel[]).map(level => (
                  <div key={level} className="rounded-lg border border-border/40 bg-muted/20 p-2 text-center">
                    <p className={cn('text-xs font-bold', MATURITY_LEVELS[level].color)}>{MATURITY_LEVELS[level].label}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{MATURITY_LEVELS[level].description}</p>
                  </div>
                ))}
              </div>

              {/* Engine list */}
              <div className="space-y-1.5">
                {ENGINE_MATURITY_SNAPSHOT.map(e => (
                  <div key={e.engineId} className={cn(
                    'flex items-center gap-3 rounded-lg border p-2.5',
                    e.maturity === 'production' && 'border-emerald-500/20 bg-emerald-500/5',
                    e.maturity === 'beta' && 'border-amber-500/20 bg-amber-500/5',
                    e.maturity === 'alpha' && 'border-orange-500/20 bg-orange-500/5',
                  )}>
                    <div className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg shrink-0 text-[9px] font-bold uppercase',
                      e.maturity === 'production' && 'bg-emerald-500/10 text-emerald-400',
                      e.maturity === 'beta' && 'bg-amber-500/10 text-amber-400',
                      e.maturity === 'alpha' && 'bg-orange-500/10 text-orange-400',
                    )}>
                      {e.maturity === 'production' ? 'PROD' : e.maturity === 'beta' ? 'BETA' : 'ALPHA'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold">{e.name}</p>
                        <Badge variant="outline" className="text-[8px] font-mono">v{e.version}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Fail-safe: {e.failSafe}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
                  <p className="text-xl font-bold text-emerald-400">{productionEngines}</p>
                  <p className="text-[9px] uppercase text-muted-foreground">Production</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2 text-center">
                  <p className="text-xl font-bold text-amber-400">{betaEngines}</p>
                  <p className="text-[9px] uppercase text-muted-foreground">Beta</p>
                </div>
                <div className="rounded-lg bg-orange-500/10 p-2 text-center">
                  <p className="text-xl font-bold text-orange-400">{alphaEngines}</p>
                  <p className="text-[9px] uppercase text-muted-foreground">Alpha</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fail-Safe Modes */}
        <TabsContent value="failsafe">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Fail-Safe Modes — Predictable Behavior on Failure
              </CardTitle>
              <p className="text-xs text-muted-foreground">Todo engine declara seu comportamento quando indisponível.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {FAIL_SAFE_MODES.map((mode, i) => (
                <div key={i} className={cn(
                  'flex items-start gap-3 rounded-xl border p-3',
                  mode.blocksCritical ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'
                )}>
                  <div className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg shrink-0',
                    mode.blocksCritical ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                  )}>
                    {mode.blocksCritical ? <XCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold">{mode.engine}</p>
                      <Badge variant="outline" className="text-[8px]">{mode.failure}</Badge>
                      {mode.blocksCritical && (
                        <Badge variant="outline" className="text-[8px] border-red-500/40 text-red-400">BLOCKS CRITICAL</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">→ {mode.action}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Budget */}
        <TabsContent value="performance">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-4 w-4 text-emerald-400" />
                Performance Budget — Measurable Targets
              </CardTitle>
              <p className="text-xs text-muted-foreground">Metas mensuráveis para cada operação crítica.</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left p-2 font-semibold">Operação</th>
                      <th className="text-center p-2 font-semibold">Meta</th>
                      <th className="text-center p-2 font-semibold">Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERFORMANCE_BUDGET.map(p => (
                      <tr key={p.operation} className="border-b border-border/20">
                        <td className="p-2 font-medium">{p.operation}</td>
                        <td className="text-center p-2 font-mono text-emerald-400">{p.target}</td>
                        <td className="text-center p-2">
                          <Badge variant="outline" className={cn(
                            'text-[8px]',
                            p.category === 'kernel' && 'border-emerald-500/40 text-emerald-400',
                            p.category === 'engine' && 'border-blue-500/40 text-blue-400',
                            p.category === 'action' && 'border-amber-500/40 text-amber-400',
                          )}>{p.category}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* v1.0 Criteria */}
        <TabsContent value="v1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  v1.0 Completion Criteria
                </CardTitle>
                <Badge variant="outline" className={cn(
                  'text-[9px]',
                  criteriaPct >= 80 ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'
                )}>
                  {doneCriteria}/{totalCriteria} ({criteriaPct}%)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Critério de conclusão: não é "quantas funcionalidades existem", mas qualidade, segurança e auditabilidade.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {V1_COMPLETION_CRITERIA.map(c => (
                <div key={c.id} className={cn(
                  'flex items-start gap-3 rounded-xl border p-3',
                  c.status === 'done' && 'border-emerald-500/20 bg-emerald-500/5',
                  c.status === 'in_progress' && 'border-amber-500/30 bg-amber-500/5',
                  c.status === 'planned' && 'border-border/50 bg-muted/20',
                )}>
                  {c.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : c.status === 'in_progress' ? (
                    <Activity className="h-4 w-4 shrink-0 text-amber-400 mt-0.5 animate-pulse" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-muted-foreground/40 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold">{c.requirement}</p>
                      <Badge variant="outline" className="text-[8px]">{c.category}</Badge>
                      {c.status === 'done' && <Badge variant="outline" className="text-[8px] border-emerald-500/40 text-emerald-400">✓ DONE</Badge>}
                      {c.status === 'in_progress' && <Badge variant="outline" className="text-[8px] border-amber-500/40 text-amber-400">IN PROGRESS</Badge>}
                      {c.status === 'planned' && <Badge variant="outline" className="text-[8px] border-muted-foreground/40 text-muted-foreground">PLANNED</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Final statement */}
          <Card className="mt-4 border-2 border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Snowflake className="h-6 w-6 shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-400">Architecture Frozen</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Com este congelamento, a Tank Wallet passa a ter uma arquitetura adequada para evolução de longo prazo.
                    Novas capacidades poderão ser adicionadas sem alterar o núcleo, preservando compatibilidade, auditabilidade
                    e previsibilidade. O foco deixa de ser expandir a estrutura e passa a ser elevar a qualidade da
                    implementação, dos testes e da validação de segurança.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
