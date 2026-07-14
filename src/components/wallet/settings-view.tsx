'use client'

import { useState, useEffect } from 'react'
import { useWallet } from './wallet-context'
import { CHAINS } from '@/lib/wallet/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, Lock, Fingerprint, Bell, Globe, Trash2, Plus, KeyRound, Eye, EyeOff, Shield, Crown, Power, AlertTriangle, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SettingsView() {
  const { addBlockedToken, blockedTokens, isProTier, setProTier, paranoidMode, setParanoidMode, deviceWarnings } = useWallet()
  const { toast } = useToast()
  const [newTokenSymbol, setNewTokenSymbol] = useState('')
  const [newTokenContract, setNewTokenContract] = useState('')
  const [newTokenChain, setNewTokenChain] = useState('ethereum')

  // Sync PRO state with localStorage so the footer (outside WalletProvider) can read it
  useEffect(() => {
    try {
      localStorage.setItem('tank:pro', String(isProTier))
      window.dispatchEvent(new Event('tank:pro-changed'))
    } catch {
      // ignore
    }
  }, [isProTier])

  const addManualBlock = () => {
    if (!newTokenSymbol || !newTokenContract) return
    addBlockedToken({
      symbol: newTokenSymbol.toUpperCase(),
      name: newTokenSymbol.toUpperCase(),
      chain: newTokenChain as any,
      contract: newTokenContract,
      reason: 'Bloqueado manualmente pelo usuário',
      source: 'manual',
    })
    toast({ title: 'Token adicionado à blocklist', description: `${newTokenSymbol} agora será bloqueado.` })
    setNewTokenSymbol('')
    setNewTokenContract('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configurações de segurança, PRO tier, modo paranoico, redes e blocklist.
        </p>
      </div>

      {/* PRO Tier banner */}
      <Card className={cn(
        'border-2',
        isProTier ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-card' : 'border-border/50'
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className={cn('h-4 w-4', isProTier ? 'text-amber-400' : 'text-muted-foreground')} />
            Tank Wallet {isProTier ? 'PRO' : 'Free'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isProTier ? (
            <>
              <p className="text-sm text-muted-foreground">
                Faça upgrade para PRO e desbloqueie: Sentinel AI, Threat Intelligence em tempo real, Smart Simulation,
                Lockdown, Modo Paranoico, Auto-Revoke e monitoramento contínuo.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-lg font-bold">US$ 19,99<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                  <p className="text-[10px] text-muted-foreground">Plano mensal</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                  <p className="text-lg font-bold text-amber-400">US$ 203,90<span className="text-xs font-normal text-muted-foreground">/ano</span></p>
                  <p className="text-[10px] text-amber-400">15% off (2 meses grátis)</p>
                </div>
              </div>
              <Button
                className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => {
                  setProTier(true)
                  toast({ title: 'PRO ativado', description: 'Todos os recursos de segurança desbloqueados.' })
                }}
              >
                <Crown className="h-4 w-4" /> Ativar PRO (demo)
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                <Crown className="h-4 w-4 text-amber-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-400">PRO ativo</p>
                  <p className="text-[11px] text-muted-foreground">Todos os recursos de segurança estão desbloqueados.</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setProTier(false)
                  toast({ title: 'PRO desativado', description: 'Você voltou para o plano Free.' })
                }}
              >
                Voltar para Free (demo)
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Device warnings */}
      {deviceWarnings.length > 0 && (
        <Card className="border-2 border-red-500/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-red-400">
              <Smartphone className="h-4 w-4" /> Alertas de dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deviceWarnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-red-500/5 border border-red-500/20 p-2.5">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                <p className="text-xs text-red-300">{w}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ToggleRow
              icon={<Fingerprint className="h-4 w-4" />}
              title="Autenticação biométrica"
              description="Exigir biometria para abrir e assinar transações"
              defaultChecked
            />
            <ToggleRow
              icon={<Lock className="h-4 w-4" />}
              title="Bloqueio automático"
              description="Bloquear após 5 min de inatividade"
              defaultChecked
            />
            <ToggleRow
              icon={<Eye className="h-4 w-4" />}
              title="Ocultar saldos por padrão"
              description="Mostrar valores apenas ao tocar"
            />
            <ToggleRow
              icon={<Shield className="h-4 w-4" />}
              title="Verificação de integridade obrigatória"
              description="Bloquear recebimento de tokens não verificados"
              defaultChecked
            />
            <ToggleRow
              icon={<KeyRound className="h-4 w-4" />}
              title="Confirmar endereço de destino"
              description="Exigir confirmação visual antes de enviar"
              defaultChecked
            />
            <ToggleRow
              icon={<Power className="h-4 w-4" />}
              title="Modo Paranoico"
              description="Toda assinatura exige simulação + biometria + confirmação dupla"
              checked={paranoidMode}
              onCheckedChange={setParanoidMode}
              proFeature={!isProTier}
            />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-emerald-400" /> Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ToggleRow
              icon={<Shield className="h-4 w-4" />}
              title="Alertas de token malicioso"
              description="Notificar quando um token for bloqueado"
              defaultChecked
            />
            <ToggleRow
              icon={<Globe className="h-4 w-4" />}
              title="Alertas de site malicioso"
              description="Notificar ao tentar acessar site na blocklist"
              defaultChecked
            />
            <ToggleRow
              icon={<Bell className="h-4 w-4" />}
              title="Transações recebidas"
              description="Notificar ao receber tokens"
              defaultChecked
            />
            <ToggleRow
              icon={<Lock className="h-4 w-4" />}
              title="Acessos ao cofre"
              description="Notificar quando o cofre for desbloqueado"
              defaultChecked
            />
            <ToggleRow
              icon={<AlertTriangle className="h-4 w-4" />}
              title="Monitoramento contínuo (PRO)"
              description="Alertar mesmo com a carteira fechada quando contratos forem comprometidos"
              proFeature={!isProTier}
            />
          </CardContent>
        </Card>
      </div>

      {/* Networks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-emerald-400" /> Redes suportadas
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">auto-configurado</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {CHAINS.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-3"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ backgroundColor: `${c.color}20`, color: c.color }}
                >
                  {c.glyph}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{c.shortLabel}</p>
                  <p className="truncate text-[9px] text-muted-foreground">{c.rpcLabel}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Todas as redes são pré-configuradas — você não precisa adicionar RPCs manuais.
          </p>
        </CardContent>
      </Card>

      {/* Manual blocklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-emerald-400" /> Blocklist manual
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Adicione manualmente tokens que você quer bloquear.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Símbolo</Label>
              <Input value={newTokenSymbol} onChange={(e) => setNewTokenSymbol(e.target.value)} placeholder="SCAM" className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Contrato</Label>
              <Input value={newTokenContract} onChange={(e) => setNewTokenContract(e.target.value)} placeholder="0x..." className="text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Rede</Label>
              <Select value={newTokenChain} onValueChange={setNewTokenChain}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHAINS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.shortLabel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addManualBlock} disabled={!newTokenSymbol || !newTokenContract} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Bloquear
              </Button>
            </div>
          </div>

          {blockedTokens.filter((bt) => bt.source === 'manual').length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bloqueados manualmente:</p>
              {blockedTokens.filter((bt) => bt.source === 'manual').map((bt) => (
                <div key={bt.id} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2">
                  <Badge variant="outline" className="text-[9px] border-zinc-500/40 text-zinc-400">manual</Badge>
                  <span className="text-xs font-semibold">{bt.symbol}</span>
                  <code className="flex-1 truncate text-[10px] font-mono text-muted-foreground">{bt.contract}</code>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-emerald-400" /> Backup & recuperação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3">
            <div>
              <p className="text-sm font-medium">Seed phrase (12 palavras)</p>
              <p className="text-[11px] text-muted-foreground">Backup offline recomendado — nunca em nuvem</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 border-emerald-500/40 text-emerald-400">
              <Eye className="h-3.5 w-3.5" /> Revelar
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3">
            <div>
              <p className="text-sm font-medium">Shamir Backup (PRO)</p>
              <p className="text-[11px] text-muted-foreground">Dividir seed em N partes (threshold k-of-n)</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" disabled={!isProTier}>
              <KeyRound className="h-3.5 w-3.5" /> Configurar
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3">
            <div>
              <p className="text-sm font-medium">PIN do cofre</p>
              <p className="text-[11px] text-muted-foreground">Trocar PIN de 6 dígitos</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <KeyRound className="h-3.5 w-3.5" /> Trocar
            </Button>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-medium text-amber-400">Boas práticas</p>
              <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                <li>• Mantenha a seed em papel, fora de fotos digitais e notas em nuvem</li>
                <li>• Nunca digite a seed em sites — apenas na própria carteira</li>
                <li>• Use o cofre para valores que não vai movimentar no dia</li>
                <li>• Ative o Modo Paranoico para grandes transações</li>
                <li>• Revogue aprovações infinitas regularmente</li>
                <li>• Mantenha o app sempre atualizado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ToggleRow({
  icon,
  title,
  description,
  defaultChecked,
  checked,
  onCheckedChange,
  proFeature,
}: {
  icon: React.ReactNode
  title: string
  description: string
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (v: boolean) => void
  proFeature?: boolean
}) {
  const [internalChecked, setInternalChecked] = useState(!!defaultChecked)
  const isControlled = checked !== undefined
  const value = isControlled ? checked! : internalChecked
  const handleChange = (v: boolean) => {
    if (onCheckedChange) onCheckedChange(v)
    if (!isControlled) setInternalChecked(v)
  }
  return (
    <div className={cn('flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/30', proFeature && !value && 'opacity-70')}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium">{title}</p>
          {proFeature && <Crown className="h-3 w-3 text-amber-400" />}
        </div>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={value} onCheckedChange={handleChange} />
    </div>
  )
}
