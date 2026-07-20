'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck, Lock, KeyRound, Eye, Activity, AlertTriangle, CheckCircle2, XCircle,
  FileText, GitBranch, Package, Scan, Bug, FileCheck, Award, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  id: string
  category: string
  label: string
  description: string
  status: 'done' | 'in_progress' | 'planned'
  icon: typeof ShieldCheck
}

const CHECKLIST: ChecklistItem[] = [
  // Key Management
  { id: 'bip39', category: 'Key Management', label: 'BIP-39 mnemonic generation', description: 'Official BIP-39 with audited @scure/bip39 library', status: 'done', icon: KeyRound },
  { id: 'bip32', category: 'Key Management', label: 'BIP-32 HD derivation', description: 'Hierarchical deterministic key derivation', status: 'done', icon: KeyRound },
  { id: 'bip44', category: 'Key Management', label: 'BIP-44 multi-account', description: 'm/44\' for EVM, m/84\' for BTC Native SegWit, m/86\' for Taproot', status: 'done', icon: KeyRound },
  { id: 'slip10', category: 'Key Management', label: 'SLIP-0010 (Ed25519)', description: 'Solana keypair derivation', status: 'done', icon: KeyRound },
  { id: 'encryption', category: 'Key Management', label: 'Storage encryption (AES-256-GCM)', description: 'PBKDF2 250k iterations + AES-256-GCM', status: 'done', icon: Lock },
  { id: 'zeroization', category: 'Key Management', label: 'Memory zeroization', description: 'SecureBuffer destroys sensitive data after use', status: 'done', icon: Lock },
  { id: 'no-log-seeds', category: 'Key Management', label: 'Never log seeds/keys', description: 'Console.log sanitized to redact mnemonics and private keys', status: 'done', icon: Eye },
  { id: 'auto-lock', category: 'Key Management', label: 'Auto-lock (5min timeout)', description: 'Keys auto-zeroize after inactivity', status: 'done', icon: Lock },
  { id: 'mpc', category: 'Key Management', label: 'MPC (Multi-Party Computation)', description: 'Replace seed with distributed key shares', status: 'planned', icon: KeyRound },
  { id: 'passkey-bridge', category: 'Key Management', label: 'Passkey bridge', description: 'WebAuthn for wallet unlock', status: 'in_progress', icon: KeyRound },
  { id: 'hw-bridge', category: 'Key Management', label: 'Hardware wallet bridge', description: 'Ledger, Trezor, Keystone support', status: 'planned', icon: KeyRound },

  // Security Engines
  { id: 'simulation', category: 'Security Engine', label: 'Mandatory simulation', description: 'eth_call + state diff before every signature', status: 'done', icon: Eye },
  { id: 'threat-intel', category: 'Security Engine', label: 'Threat Intelligence (own DB)', description: 'Prisma-backed database with 29+ threats seeded', status: 'done', icon: ShieldCheck },
  { id: 'behavioral', category: 'Security Engine', label: 'Behavioral Engine', description: 'IA learns usage patterns and detects anomalies', status: 'done', icon: Activity },
  { id: 'permission', category: 'Security Engine', label: 'Permission Engine (universal)', description: 'ERC-20/721/1155/Permit2/ERC-4337/Solana/SPL/BTC/Lightning', status: 'done', icon: KeyRound },
  { id: 'policy', category: 'Security Engine', label: 'Policy Engine', description: 'Configurable rules: amount limits, time blocks, biometric thresholds', status: 'done', icon: ShieldCheck },
  { id: 'audit', category: 'Security Engine', label: 'Audit Engine (immutable)', description: 'HMAC-signed append-only log for all actions', status: 'done', icon: FileText },
  { id: 'notification', category: 'Security Engine', label: 'Notification Engine', description: 'Event-based alerts for threats and anomalies', status: 'done', icon: Activity },

  // Network
  { id: 'multi-chain', category: 'Network', label: 'Multi-chain real', description: '7 EVM chains with real RPC + 3 non-EVM (derivation only)', status: 'done', icon: Zap },
  { id: 'rpc-pool', category: 'Network', label: 'RPC pool with failover', description: 'Multiple RPCs per chain, circuit breaker, quorum reads', status: 'done', icon: Zap },
  { id: 'plugin', category: 'Network', label: 'Plugin Engine', description: 'Chain plugin interface for extensibility', status: 'done', icon: Package },

  // Testing
  { id: 'unit-tests', category: 'Testing', label: 'Unit tests >90% coverage', description: 'Jest/Vitest with >90% line coverage on security-critical modules', status: 'planned', icon: Bug },
  { id: 'integration-tests', category: 'Testing', label: 'Integration tests', description: 'End-to-end flows: create wallet → sign tx → broadcast', status: 'planned', icon: Bug },
  { id: 'e2e-tests', category: 'Testing', label: 'E2E tests (Playwright)', description: 'Browser automation tests for all critical paths', status: 'planned', icon: Bug },
  { id: 'fuzz-testing', category: 'Testing', label: 'Fuzz testing', description: 'Property-based testing for crypto operations', status: 'planned', icon: Bug },

  // Release
  { id: 'external-audit', category: 'Release', label: 'External security audit', description: 'Independent audit by Trail of Bits, Certik, or similar', status: 'planned', icon: Award },
  { id: 'reproducible-builds', category: 'Release', label: 'Reproducible builds', description: 'Deterministic build process with verifiable hashes', status: 'planned', icon: GitBranch },
  { id: 'release-signing', category: 'Release', label: 'Release signing', description: 'Signed binaries/packages with GPG or Sigstore', status: 'planned', icon: FileCheck },
  { id: 'sbom', category: 'Release', label: 'SBOM (Software Bill of Materials)', description: 'CycloneDX or SPDX manifest for all dependencies', status: 'planned', icon: Package },
  { id: 'sast-dast', category: 'Release', label: 'SAST/DAST pipeline', description: 'Static + dynamic analysis in CI/CD', status: 'planned', icon: Scan },
]

export function ProductionHardeningView() {
  const { toast } = useToast()
  const [checklist] = useState(CHECKLIST)

  const done = checklist.filter(c => c.status === 'done').length
  const inProgress = checklist.filter(c => c.status === 'in_progress').length
  const planned = checklist.filter(c => c.status === 'planned').length
  const total = checklist.length
  const percentage = Math.round((done / total) * 100)

  // Group by category
  const categories = new Map<string, ChecklistItem[]>()
  for (const item of checklist) {
    if (!categories.has(item.category)) categories.set(item.category, [])
    categories.get(item.category)!.push(item)
  }

  const betaReady = percentage >= 80

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          Production Hardening
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Beta readiness checklist — os próximos 20% do trabalho que representam 80% da segurança real.
        </p>
      </div>

      {/* Overall progress */}
      <Card className={cn(
        'relative overflow-hidden border-2',
        betaReady ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-card' : 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-card'
      )}>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl bg-emerald-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Beta Readiness</p>
              <p className={cn(
                'text-5xl font-bold tracking-tight',
                betaReady ? 'text-emerald-400' : 'text-amber-400'
              )}>
                {percentage}<span className="text-xl text-muted-foreground">%</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={cn(
                  'border',
                  betaReady
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                )}>
                  {betaReady ? 'BETA READY' : 'IN PROGRESS'}
                </Badge>
                <span className="text-xs text-muted-foreground">{done}/{total} complete</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400 mb-1" />
                <p className="text-2xl font-bold text-emerald-400">{done}</p>
                <p className="text-[9px] uppercase text-muted-foreground">Done</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                <Activity className="mx-auto h-4 w-4 text-amber-400 mb-1" />
                <p className="text-2xl font-bold text-amber-400">{inProgress}</p>
                <p className="text-[9px] uppercase text-muted-foreground">In Progress</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3 text-center">
                <AlertTriangle className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-2xl font-bold text-muted-foreground">{planned}</p>
                <p className="text-[9px] uppercase text-muted-foreground">Planned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist by category */}
      {Array.from(categories.entries()).map(([category, items]) => {
        const catDone = items.filter(i => i.status === 'done').length
        const catTotal = items.length
        const catPct = Math.round((catDone / catTotal) * 100)
        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{category}</CardTitle>
                <Badge variant="outline" className={cn(
                  'text-[9px]',
                  catPct === 100 ? 'border-emerald-500/40 text-emerald-400' : catPct >= 50 ? 'border-amber-500/40 text-amber-400' : 'border-muted-foreground/40 text-muted-foreground'
                )}>
                  {catDone}/{catTotal}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map(item => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3',
                      item.status === 'done' && 'border-emerald-500/20 bg-emerald-500/5',
                      item.status === 'in_progress' && 'border-amber-500/30 bg-amber-500/5',
                      item.status === 'planned' && 'border-border/50 bg-muted/20'
                    )}
                  >
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                      item.status === 'done' && 'bg-emerald-500/10 text-emerald-400',
                      item.status === 'in_progress' && 'bg-amber-500/10 text-amber-400',
                      item.status === 'planned' && 'bg-muted/40 text-muted-foreground'
                    )}>
                      {item.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : item.status === 'in_progress' ? (
                        <Activity className="h-4 w-4 animate-pulse" />
                      ) : (
                        <Icon className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{item.label}</p>
                        {item.status === 'done' && (
                          <Badge variant="outline" className="text-[8px] border-emerald-500/40 text-emerald-400">✓ DONE</Badge>
                        )}
                        {item.status === 'in_progress' && (
                          <Badge variant="outline" className="text-[8px] border-amber-500/40 text-amber-400">IN PROGRESS</Badge>
                        )}
                        {item.status === 'planned' && (
                          <Badge variant="outline" className="text-[8px] border-muted-foreground/40 text-muted-foreground">PLANNED</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}

      {/* Final positioning */}
      <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Award className="h-6 w-6 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-400">Posicionamento Final</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Se esta arquitetura for implementada integralmente, a Tank Wallet deixa de competir apenas como
                uma carteira Web3 e passa a competir como uma <strong className="text-foreground">plataforma de
                segurança para ativos digitais</strong>. O valor percebido deixa de ser "armazenar e movimentar
                tokens" e passa a ser "reduzir a probabilidade de perda de ativos por erro do usuário, contratos
                maliciosos ou ataques", preservando a soberania do proprietário sobre suas chaves e permissões.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
