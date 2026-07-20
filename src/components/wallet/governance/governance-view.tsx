'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield, Database, FileText, KeyRound, Globe, Activity, AlertTriangle,
  CheckCircle2, XCircle, Ban, Eye, TrendingUp, Layers, Award, BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAllRegisteredPolicies, getAllThreats, getAllTrustEntries,
  getDecisionStats, getAllPluginCapabilities, getAllFeatures,
  getGovernanceStats, FEATURE_ACCEPTANCE_CRITERIA,
} from '@/lib/wallet-governance'
import { TSF_DOMAINS, COVERAGE_MATRIX, OWASP_REQUIREMENT } from '@/lib/wallet-tsf'

export function GovernanceView() {
  const stats = getGovernanceStats()
  const policies = getAllRegisteredPolicies()
  const threats = getAllThreats()
  const trustEntries = getAllTrustEntries()
  const decisions = getDecisionStats()
  const plugins = getAllPluginCapabilities()
  const features = getAllFeatures()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-400" />
          Security Governance Layer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Última camada estrutural. Nenhum engine conhece diretamente outro — toda comunicação passa pelo Kernel e pelos registries.
        </p>
      </div>

      {/* Diagram */}
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-card">
        <CardContent className="relative p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-2">
              <p className="text-sm font-bold text-emerald-400">Tank Wallet</p>
            </div>
            <div className="h-4 w-px bg-emerald-500/30" />
            <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 px-6 py-2">
              <p className="text-sm font-black text-emerald-400">Security Kernel</p>
            </div>
            <div className="h-4 w-px bg-emerald-500/30" />
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 w-full max-w-2xl">
              <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold text-center mb-2">Security Governance Layer</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {['Policy Registry', 'Threat Registry', 'Trust Registry', 'Decision Registry', 'Plugin Registry', 'Feature Registry', 'Audit Registry'].map(r => (
                  <div key={r} className="rounded border border-border/40 bg-muted/20 px-2 py-1 text-center">
                    <span className="text-[9px] font-medium">{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-4 w-px bg-emerald-500/30" />
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-6 py-2">
              <p className="text-sm font-bold text-purple-400">12 Security Engines</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registry stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <RegistryStat icon={FileText} label="Policies" value={stats.policies} color="text-amber-400" />
        <RegistryStat icon={AlertTriangle} label="Threats" value={stats.threats} color="text-red-400" />
        <RegistryStat icon={CheckCircle2} label="Trust" value={stats.trustEntries} color="text-emerald-400" />
        <RegistryStat icon={Activity} label="Decisions" value={stats.decisions} color="text-blue-400" />
        <RegistryStat icon={Globe} label="Plugins" value={stats.plugins} color="text-cyan-400" />
        <RegistryStat icon={Layers} label="Features" value={stats.features} color="text-purple-400" />
        <RegistryStat icon={Shield} label="Blocked" value={stats.coverage.blocked} color="text-orange-400" />
      </div>

      {/* Tabs for registries */}
      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="threats">Threat Registry ({threats.length})</TabsTrigger>
          <TabsTrigger value="trust">Trust Registry ({trustEntries.length})</TabsTrigger>
          <TabsTrigger value="policies">Policy Registry ({policies.length})</TabsTrigger>
          <TabsTrigger value="plugins">Plugin Registry ({plugins.length})</TabsTrigger>
          <TabsTrigger value="features">Feature Registry ({features.length})</TabsTrigger>
          <TabsTrigger value="decisions">Decision Registry ({decisions.total})</TabsTrigger>
          <TabsTrigger value="tsf">TSF Domains</TabsTrigger>
          <TabsTrigger value="matrix">Coverage Matrix</TabsTrigger>
          <TabsTrigger value="criteria">Acceptance Criteria</TabsTrigger>
        </TabsList>

        {/* Threat Registry */}
        <TabsContent value="threats">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Threat Registry — Catálogo Versionado</CardTitle>
              <p className="text-xs text-muted-foreground">
                Cada ameaça tem ID único (THR-XXXX), mapeamento ATT&CK/CWE/CVE, engines responsáveis e status de cobertura.
              </p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {threats.map(t => (
                <div key={t.id} className={cn(
                  'rounded-xl border p-3',
                  t.coverage === 'blocked' && 'border-emerald-500/20 bg-emerald-500/5',
                  t.coverage === 'detected' && 'border-amber-500/20 bg-amber-500/5',
                  t.coverage === 'partial' && 'border-orange-500/20 bg-orange-500/5',
                  t.coverage === 'planned' && 'border-muted-foreground/20 bg-muted/20'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px] font-mono">{t.id}</Badge>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <Badge variant="outline" className={cn(
                          'text-[8px]',
                          t.riskLevel === 'critical' && 'border-red-500/40 text-red-400',
                          t.riskLevel === 'high' && 'border-orange-500/40 text-orange-400',
                          t.riskLevel === 'medium' && 'border-amber-500/40 text-amber-400',
                          t.riskLevel === 'low' && 'border-emerald-500/40 text-emerald-400'
                        )}>
                          {t.riskLevel}
                        </Badge>
                        <Badge variant="outline" className="text-[8px]">{t.category}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{t.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.responsibleEngines.map(e => (
                          <Badge key={e} variant="outline" className="text-[8px]">{e}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className={cn(
                      'text-[9px] shrink-0',
                      t.coverage === 'blocked' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      t.coverage === 'detected' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      t.coverage === 'partial' && 'bg-orange-500/10 text-orange-400 border-orange-500/30',
                      t.coverage === 'planned' && 'bg-muted text-muted-foreground'
                    )}>
                      {t.coverage === 'blocked' && <><CheckCircle2 className="h-2 w-2 mr-0.5" />BLOCKED</>}
                      {t.coverage === 'detected' && <><Eye className="h-2 w-2 mr-0.5" />DETECTED</>}
                      {t.coverage === 'partial' && <><AlertTriangle className="h-2 w-2 mr-0.5" />PARTIAL</>}
                      {t.coverage === 'planned' && <><Ban className="h-2 w-2 mr-0.5" />PLANNED</>}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trust Registry */}
        <TabsContent value="trust">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Trust Registry — Trust Score por Entidade</CardTitle>
              <p className="text-xs text-muted-foreground">Cada entidade recebe Trust Score independente. Engines consultam o mesmo registro.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {(['dapp', 'rpc', 'bridge', 'token', 'oracle'] as const).map(type => {
                const entries = trustEntries.filter(e => e.type === type)
                if (entries.length === 0) return null
                return (
                  <div key={type}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{type.toUpperCase()}</p>
                    <div className="grid gap-1.5 sm:grid-cols-2 mb-3">
                      {entries.map(e => (
                        <div key={e.id} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shrink-0',
                            e.trustScore >= 95 ? 'bg-emerald-500/10 text-emerald-400' :
                            e.trustScore >= 85 ? 'bg-teal-500/10 text-teal-400' :
                            e.trustScore >= 70 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          )}>
                            {e.trustScore}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{e.name}</p>
                            <p className="text-[9px] text-muted-foreground truncate font-mono">{e.identifier}</p>
                          </div>
                          <Badge variant="outline" className={cn(
                            'text-[8px] shrink-0',
                            e.level === 'verified' && 'border-emerald-500/40 text-emerald-400',
                            e.level === 'known' && 'border-teal-500/40 text-teal-400',
                            e.level === 'unknown' && 'border-muted-foreground/40 text-muted-foreground',
                            e.level === 'suspicious' && 'border-amber-500/40 text-amber-400',
                            e.level === 'malicious' && 'border-red-500/40 text-red-400'
                          )}>
                            {e.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plugin Registry */}
        <TabsContent value="plugins">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plugin Registry — Capacidades por Chain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {plugins.map(p => (
                <div key={p.chainId} className={cn(
                  'rounded-xl border p-3',
                  p.implemented ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/50 bg-muted/20 opacity-70'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <Badge variant="outline" className="text-[8px]">{p.family}</Badge>
                      {p.implemented ? (
                        <Badge variant="outline" className="text-[8px] border-emerald-500/40 text-emerald-400">IMPLEMENTED</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[8px] border-muted-foreground/40 text-muted-foreground">PLANNED</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.capabilities.map(c => (
                      <Badge key={c} variant="outline" className="text-[8px] gap-0.5">
                        <CheckCircle2 className="h-2 w-2" />{c}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Registry */}
        <TabsContent value="features">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Feature Registry — Engines por Funcionalidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {features.map(f => (
                <div key={f.id} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold">{f.name}</p>
                    <Badge variant="outline" className={cn(
                      'text-[8px]',
                      f.status === 'active' ? 'border-emerald-500/40 text-emerald-400' : 'border-muted-foreground/40 text-muted-foreground'
                    )}>{f.status}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2">{f.description}</p>
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Engines</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {f.engines.map(e => <Badge key={e} variant="outline" className="text-[8px]">{e}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">TSS Specs</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {f.tssSpecs.map(s => <Badge key={s} variant="outline" className="text-[8px] border-blue-500/40 text-blue-400">{s}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Threats</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {f.threats.map(t => <Badge key={t} variant="outline" className="text-[8px] border-red-500/40 text-red-400">{t}</Badge>)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                      <div>
                        <p className="text-muted-foreground">Revocation:</p>
                        <p className="text-foreground">{f.revocationMethod}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fail-safe:</p>
                        <p className="text-foreground">{f.failSafeBehavior}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TSF Domains */}
        <TabsContent value="tsf">
          <div className="space-y-3">
            {TSF_DOMAINS.map(d => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px] font-mono">{d.id}</Badge>
                        <p className="text-base font-bold">{d.title}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{d.description}</p>
                      <p className="text-[11px] italic text-emerald-400 mt-1">"{d.principle}"</p>
                      <div className="mt-2">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Threats ({d.threats.length})</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {d.threats.map(t => (
                            <Badge key={t.name} variant="outline" className="text-[8px]">{t.name}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Response Engines</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {d.responseEngines.map(e => (
                            <Badge key={e} variant="outline" className="text-[8px] border-blue-500/40 text-blue-400">{e}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Coverage Matrix */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Security Coverage Matrix</CardTitle>
              <p className="text-xs text-muted-foreground">Detectar / Bloquear / Recuperar / Auditar por ameaça.</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left p-2 font-semibold">Ameaça</th>
                      <th className="text-center p-2 font-semibold">Detectar</th>
                      <th className="text-center p-2 font-semibold">Bloquear</th>
                      <th className="text-center p-2 font-semibold">Recuperar</th>
                      <th className="text-center p-2 font-semibold">Auditoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COVERAGE_MATRIX.map(row => (
                      <tr key={row.threat} className="border-b border-border/20">
                        <td className="p-2 font-medium">{row.threat}</td>
                        <td className="text-center p-2">{renderCoverage(row.detect)}</td>
                        <td className="text-center p-2">{renderCoverage(row.block)}</td>
                        <td className="text-center p-2">{renderCoverage(row.recover)}</td>
                        <td className="text-center p-2">{renderCoverage(row.audit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Acceptance Criteria */}
        <TabsContent value="criteria">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                New Feature Acceptance Criteria
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Regra obrigatória: nenhuma funcionalidade é integrada sem responder a estas 7 perguntas.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {FEATURE_ACCEPTANCE_CRITERIA.map((c, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{c.question}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* OWASP */}
          <Card className="mt-4 border-2 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Award className="h-6 w-6 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-400">OWASP ASVS Requirement</p>
                  <p className="text-xs text-muted-foreground mt-1">{OWASP_REQUIREMENT.requirement}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {OWASP_REQUIREMENT.scope.map(s => (
                      <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>
                    ))}
                    <Badge variant="outline" className="text-[8px] border-amber-500/40 text-amber-400">Level 2 (Standard)</Badge>
                    <Badge variant="outline" className="text-[8px] border-red-500/40 text-red-400">MANDATORY</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Defense in Depth */}
          <Card className="mt-4 border-2 border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">Defense in Depth</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A Tank Wallet assume postura de defesa em profundidade. Nenhuma camada é considerada suficiente isoladamente.
                    Cada transação, conexão ou atualização deve atravessar múltiplos mecanismos independentes — reputação, simulação,
                    políticas, comportamento, dispositivo, rede e inteligência de ameaças — antes de ser autorizada.
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

function RegistryStat({ icon: Icon, label, value, color }: { icon: typeof Shield; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg shrink-0 bg-muted/30', color)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={cn('text-lg font-bold', color)}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function renderCoverage(val: boolean | 'partial'): React.ReactNode {
  if (val === true) return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
  if (val === 'partial') return <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mx-auto" />
  return <XCircle className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
}
