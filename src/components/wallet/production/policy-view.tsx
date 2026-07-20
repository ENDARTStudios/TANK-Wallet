'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck, Ban, Fingerprint, Clock, DollarSign, Smartphone, Globe, Zap, Plus, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  loadPolicies, togglePolicy, type PolicyRule, type PolicyAction,
} from '@/lib/wallet-engines/policy'

const ACTION_LABEL: Record<PolicyAction, string> = {
  allow: 'Permitir',
  require_confirmation: 'Exigir confirmação',
  require_biometric: 'Exigir biometria',
  block: 'Bloquear',
}

const ACTION_COLOR: Record<PolicyAction, string> = {
  allow: 'text-emerald-400',
  require_confirmation: 'text-amber-400',
  require_biometric: 'text-orange-400',
  block: 'text-red-400',
}

export function PolicyView() {
  const { toast } = useToast()
  const [policies, setPolicies] = useState<PolicyRule[]>(() => loadPolicies())

  const handleToggle = (id: string) => {
    const updated = togglePolicy(id)
    setPolicies(updated)
    const policy = updated.find(p => p.id === id)
    toast({
      title: policy?.enabled ? 'Política ativada' : 'Política desativada',
      description: policy?.name,
    })
  }

  const enabledCount = policies.filter(p => p.enabled).length
  const blockCount = policies.filter(p => p.enabled && p.action === 'block').length
  const biometricCount = policies.filter(p => p.enabled && p.action === 'require_biometric').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          Policy Engine
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Regras configuráveis que controlam quando bloquear, exigir biometria ou confirmação.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Active</p>
                <p className="text-lg font-bold">{enabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Ban className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Blocking</p>
                <p className="text-lg font-bold text-red-400">{blockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                <Fingerprint className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Biometric</p>
                <p className="text-lg font-bold text-orange-400">{biometricCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Security Policies</CardTitle>
          <p className="text-xs text-muted-foreground">
            Cada política é avaliada antes de cada assinatura. A mais restritiva vence.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {policies.map(policy => (
            <div
              key={policy.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 transition-all',
                policy.enabled
                  ? policy.action === 'block'
                    ? 'border-red-500/30 bg-red-500/5'
                    : policy.action === 'require_biometric'
                    ? 'border-orange-500/30 bg-orange-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                  : 'border-border/50 bg-muted/20 opacity-60'
              )}
            >
              {/* Toggle */}
              <Switch
                checked={policy.enabled}
                onCheckedChange={() => handleToggle(policy.id)}
                className="mt-1"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{policy.name}</p>
                  <Badge variant="outline" className={cn('text-[9px]', ACTION_COLOR[policy.action])}>
                    {ACTION_LABEL[policy.action]}
                  </Badge>
                  {policy.builtin && (
                    <Badge variant="outline" className="text-[8px] border-blue-500/40 text-blue-400">
                      BUILT-IN
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{policy.description}</p>
                {/* Condition params */}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {policy.condition === 'amount_above' && (
                    <Badge variant="outline" className="text-[8px] gap-0.5">
                      <DollarSign className="h-2 w-2" /> &gt; ${policy.params.threshold}
                    </Badge>
                  )}
                  {policy.condition === 'time_between' && (
                    <Badge variant="outline" className="text-[8px] gap-0.5">
                      <Clock className="h-2 w-2" /> {policy.params.start}h-{policy.params.end}h
                      {policy.params.chain ? ` · ${policy.params.chain}` : ''}
                    </Badge>
                  )}
                  {policy.condition === 'infinite_approval' && (
                    <Badge variant="outline" className="text-[8px] gap-0.5">
                      <Ban className="h-2 w-2" /> Infinite approve
                    </Badge>
                  )}
                  {policy.condition === 'new_device' && (
                    <Badge variant="outline" className="text-[8px] gap-0.5">
                      <Smartphone className="h-2 w-2" /> New device
                    </Badge>
                  )}
                  {policy.condition === 'new_chain' && (
                    <Badge variant="outline" className="text-[8px] gap-0.5">
                      <Globe className="h-2 w-2" /> New chain
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Example policies info */}
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-blue-400" />
            Como funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            Antes de cada assinatura, o Policy Engine avalia todas as políticas ativas contra o contexto da transação
            (valor, rede, horário, dispositivo, contrato). A ação mais restritiva entre as políticas disparadas vence:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
              <p className="text-[10px] font-semibold text-emerald-400">Permitir</p>
              <p className="text-[10px]">Transação assinada normalmente</p>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2">
              <p className="text-[10px] font-semibold text-amber-400">Exigir confirmação</p>
              <p className="text-[10px]">Usuário deve confirmar manualmente</p>
            </div>
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-2">
              <p className="text-[10px] font-semibold text-orange-400">Exigir biometria</p>
              <p className="text-[10px]">Face ID / Touch ID / WebAuthn</p>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2">
              <p className="text-[10px] font-semibold text-red-400">Bloquear</p>
              <p className="text-[10px]">Transação não pode ser assinada</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
