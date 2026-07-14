'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Lock, Activity, KeyRound, Eye, Shield, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DNAPath {
  id: string
  title: string
  principle: string
  description: string
  icon: typeof ShieldCheck
  color: string
  bg: string
  implementation: string[]
}

const PRINCIPLES: DNAPath[] = [
  {
    id: 'verify',
    title: 'Verify Everything',
    principle: 'Nada é confiável.',
    description: 'Todo token, contrato, DApp e endereço passa por inspeção antes de qualquer interação. A Tank Wallet assume que tudo é suspeito até ser comprovado seguro.',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    implementation: [
      'GoPlus Security API em tempo real',
      'Threat Intelligence database própria',
      'Smart Contract Scanner (bytecode analysis)',
      'DApp Shield (WHOIS, SSL, typosquatting)',
      'Calldata analyzer (approve, setApprovalForAll, Permit2)',
    ],
  },
  {
    id: 'least-privilege',
    title: 'Least Privilege',
    principle: 'Nunca conceder mais permissões que o necessário.',
    description: 'Aprovações infinitas são detectadas e sinalizadas. A Tank recomenda aprovar apenas o valor necessário para cada operação.',
    icon: Lock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    implementation: [
      'Detecta approves infinitos (max uint256)',
      'Alerta sobre setApprovalForAll',
      'Permission Manager com filtros por risco',
      'Recomenda revogação de permissões não usadas',
      'Auto-revoke de contratos abandonados (PRO)',
    ],
  },
  {
    id: 'continuous',
    title: 'Continuous Protection',
    principle: 'A carteira continua protegendo mesmo sem uso.',
    description: 'O Behavior Engine aprende seu padrão de uso. O Threat Intelligence atualiza continuamente. Mesmo com a carteira fechada, você está protegido.',
    icon: Activity,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    implementation: [
      'Behavior Engine (IA aprende horários, redes, valores)',
      'Threat Intelligence com workers contínuos',
      'Monitoramento de contratos comprometidos (PRO)',
      'Notificações de permissões perigosas (PRO)',
      'Alertas de tokens que viraram scam (PRO)',
    ],
  },
  {
    id: 'sovereignty',
    title: 'User Sovereignty',
    principle: 'Tudo é auditável. Tudo é revogável.',
    description: 'O usuário é o proprietário dos ativos e das permissões. A Tank torna visível tudo que normalmente fica oculto na blockchain.',
    icon: KeyRound,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    implementation: [
      'Permission Manager universal (ERC-20/721/1155/Permit2/ERC-4337)',
      'Sovereignty Center com histórico imutável',
      'Lockdown com 4 níveis de emergência',
      'Revogação com um clique',
      'Security Timeline com todos os eventos',
    ],
  },
  {
    id: 'explain',
    title: 'Explain Before Signing',
    principle: 'Nunca mostrar apenas hexadecimal.',
    description: 'Antes de cada assinatura, a Tank explica em linguagem simples o que a transação faz, quais permissões são concedidas e o que pode dar errado.',
    icon: Eye,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    implementation: [
      'AI Security Assistant (PRO) — explica riscos em linguagem natural',
      'Transaction pipeline (Build→Simulate→Analyze→Score→Confirm)',
      'State diff simulation (saldo antes/depois)',
      'Calldata decodificado em linguagem humana',
      "Exemplo: 'Este contrato poderá movimentar seus USDC até o limite aprovado'",
    ],
  },
]

export function SecurityDnaView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-400" />
          Security DNA
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Em vez de vender funcionalidades, a Tank Wallet comunica princípios. Estes são os 5 pilares que orientam toda decisão técnica e de produto.
        </p>
      </div>

      {/* Hero */}
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <CardContent className="relative p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
            <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">TANK Wallet</h2>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-emerald-400/80 font-semibold">
            ZERO TRUST SECURITY
          </p>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            A carteira que toma decisões de segurança antes do usuário cometer um erro.
          </p>
        </CardContent>
      </Card>

      {/* 5 Principles */}
      <div className="space-y-3">
        {PRINCIPLES.map((p, idx) => {
          const Icon = p.icon
          return (
            <Card key={p.id} className={cn('border-l-4', p.color.replace('text-', 'border-l-'))}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Number + icon */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      P{idx + 1}
                    </span>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', p.bg, p.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold">{p.title}</h3>
                      <Badge variant="outline" className={cn('text-[9px]', p.color.replace('text-', 'border-').replace('-400', '-500/40'))}>
                        {p.color.includes('emerald') ? 'Security' : p.color.includes('amber') ? 'Permission' : p.color.includes('blue') ? 'Monitoring' : p.color.includes('teal') ? 'Control' : 'Transparency'}
                      </Badge>
                    </div>
                    <p className={cn('mt-1 text-sm font-semibold italic', p.color)}>"{p.principle}"</p>
                    <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>

                    {/* Implementation list */}
                    <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Como a Tank implementa</p>
                      <ul className="space-y-1">
                        {p.implementation.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                            <Zap className={cn('h-2.5 w-2.5 shrink-0 mt-0.5', p.color)} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mission statement */}
      <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6 text-center">
          <p className="text-sm font-semibold text-emerald-400">
            "O objetivo da Tank Wallet não é competir com MetaMask, Trust Wallet ou Phantom.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            É ser reconhecida como <strong className="text-foreground">a carteira que toma decisões de segurança antes do usuário cometer um erro</strong>, mantendo o controle integral dos ativos nas mãos do proprietário."
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
