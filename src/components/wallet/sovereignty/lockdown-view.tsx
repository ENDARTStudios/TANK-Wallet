'use client'

import { useState } from 'react'
import { useWallet } from '../wallet-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Power, AlertTriangle, ShieldCheck, Loader2, CheckCircle2, Crown, Lock, Ban, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type LockdownLevel = 1 | 2 | 3 | 4

interface LevelInfo {
  level: LockdownLevel
  title: string
  description: string
  actions: string[]
  estimatedTime: string
  severity: 'info' | 'warning' | 'critical'
}

const LEVELS: LevelInfo[] = [
  {
    level: 1,
    title: 'Block Signatures',
    description: 'Bloqueia novas assinaturas. Sessões e aprovações permanecem, mas nenhuma transação pode ser assinada até desativar.',
    actions: [
      'Bloquear novas assinaturas EVM',
      'Bloquear signTypedData (EIP-712)',
      'Bloquear signMessage (EIP-191)',
      'Ativar modo somente leitura',
    ],
    estimatedTime: '5-10 segundos',
    severity: 'warning',
  },
  {
    level: 2,
    title: 'Disconnect DApps',
    description: 'Encerra todas as sessões DApp e desconecta WalletConnect. Nenhum DApp pode solicitar nova assinatura.',
    actions: [
      'Tudo do Nível 1',
      'Encerrar todas as sessões DApp',
      'Desconectar WalletConnect v2',
      'Limpar conexões Web3 injetadas',
    ],
    estimatedTime: '15-30 segundos',
    severity: 'warning',
  },
  {
    level: 3,
    title: 'Revoke All Approvals',
    description: 'Revoga todas as aprovações ERC-20 e NFT. Contratos perdem permissão de mover seus tokens. Recomendado se suspeitar de comprometimento.',
    actions: [
      'Tudo do Nível 2',
      'Revogar todas as aprovações ERC-20',
      'Revogar todas as aprovações NFT (setApprovalForAll)',
      'Cancelar permissões Permit2',
    ],
    estimatedTime: '30-90 segundos',
    severity: 'critical',
  },
  {
    level: 4,
    title: 'Migrate to New Wallet',
    description: 'Assistido pelo usuário: cria nova carteira, migra todos os ativos e desativa a antiga permanentemente. Use apenas em caso de comprometimento confirmado.',
    actions: [
      'Tudo do Nível 3',
      'Gerar nova carteira (BIP-39)',
      'Mover todos os ativos para nova carteira',
      'Desativar carteira comprometida',
      'Atualizar endereço em todos os serviços',
    ],
    estimatedTime: '10-30 minutos (assistido)',
    severity: 'critical',
  },
]

export function LockdownView() {
  const {
    lockdownActive,
    lockdownResult,
    runLockdown,
    clearLockdown,
    erc20Approvals,
    nftApprovals,
    sessions,
    isProTier,
    setProTier,
  } = useWallet()
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<LockdownLevel>(3)
  const [executing, setExecuting] = useState(false)

  const handleExecute = async () => {
    setConfirmOpen(false)
    setExecuting(true)
    await runLockdown()
    setExecuting(false)
    toast({
      title: `LOCKDOWN Nível ${selectedLevel} executado`,
      description: `${LEVELS[selectedLevel - 1].title} — modo somente leitura ativo.`,
    })
  }

  if (!isProTier) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Power className="h-6 w-6 text-red-400" />
            Lockdown
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Botão de emergência — 4 níveis de proteção crescente.
          </p>
        </div>

        <Card className="border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-card">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Crown className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">Recurso PRO</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Lockdown é o protocolo de emergência da Tank Wallet. Com 4 níveis crescentes
              de proteção, você pode responder a qualquer incidente em segundos.
            </p>
            <p className="mt-4 text-2xl font-bold">US$ 19,99<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
            <Button
              className="mt-6 gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => setProTier(true)}
            >
              <Crown className="h-4 w-4" /> Ativar PRO (demo)
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Power className="h-6 w-6 text-red-400" />
          Lockdown
          <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400 gap-1">
            <Crown className="h-2.5 w-2.5" /> PRO
          </Badge>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Protocolo de emergência — 4 níveis crescentes de proteção. Selecione conforme a gravidade.
        </p>
      </div>

      {/* Active state */}
      {lockdownActive && lockdownResult ? (
        <Card className="border-2 border-red-500/40 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-400">
              <ShieldCheck className="h-5 w-5" /> LOCKDOWN ATIVO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm font-semibold text-red-400">Carteira em modo somente leitura</p>
              <p className="text-xs text-muted-foreground mt-1">
                Nenhuma assinatura pode ser realizada até você desativar o Lockdown manualmente.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/30 p-2 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Duração</p>
                <p className="text-lg font-bold">{lockdownResult.durationMs}ms</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Revogadas</p>
                <p className="text-lg font-bold text-red-400">{lockdownResult.totalRevoked}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Ações</p>
                <p className="text-lg font-bold">{lockdownResult.actions.length}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ações executadas</p>
              {lockdownResult.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2">
                  {action.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  )}
                  <p className="flex-1 text-xs">{action.description}</p>
                  {action.affected > 0 && (
                    <Badge variant="outline" className="text-[9px]">{action.affected}</Badge>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => {
                clearLockdown()
                toast({ title: 'Lockdown desativado', description: 'Carteira operacional novamente.' })
              }}
            >
              <Lock className="h-4 w-4" /> Desativar Lockdown
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Level selection */}
          <div className="space-y-3">
            {LEVELS.map((level) => {
              const isSelected = selectedLevel === level.level
              const isHighest = level.level === 4
              return (
                <Card
                  key={level.level}
                  className={cn(
                    'border-2 cursor-pointer transition-all',
                    isSelected
                      ? level.severity === 'critical'
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-amber-500/50 bg-amber-500/5'
                      : 'border-border/50 hover:border-border',
                    isHighest && !isSelected && 'border-red-500/20'
                  )}
                  onClick={() => setSelectedLevel(level.level)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Level number badge */}
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 font-bold text-sm',
                        level.severity === 'critical'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-amber-500/15 text-amber-400'
                      )}>
                        L{level.level}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold">{level.title}</p>
                          {isSelected && (
                            <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400">
                              Selecionado
                            </Badge>
                          )}
                          <Badge variant="outline" className={cn(
                            'text-[9px]',
                            level.severity === 'critical' ? 'border-red-500/40 text-red-400' : 'border-amber-500/40 text-amber-400'
                          )}>
                            {level.estimatedTime}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{level.description}</p>

                        {/* Actions list */}
                        <ul className="mt-2 space-y-0.5">
                          {level.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                              <ArrowRight className="h-2.5 w-2.5 shrink-0 mt-0.5 text-muted-foreground/60" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Execute button */}
          <Card className="border-2 border-red-500/40 bg-gradient-to-br from-red-500/10 via-card to-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={executing}
                  className={cn(
                    'flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-500/40 transition-all hover:scale-105 active:scale-95',
                    executing && 'animate-pulse'
                  )}
                >
                  {executing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Power className="h-8 w-8" />}
                </button>
                <h2 className="mt-4 text-lg font-bold text-red-400">
                  {executing ? 'Executando Lockdown…' : `Executar Lockdown Nível ${selectedLevel}`}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground max-w-md">
                  {executing
                    ? 'Aplicando ações de emergência…'
                    : `${LEVELS[selectedLevel - 1].title} — ${LEVELS[selectedLevel - 1].estimatedTime}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <DialogTitle className="text-center">Confirmar Lockdown Nível {selectedLevel}</DialogTitle>
            <DialogDescription className="text-center">
              {selectedLevel === 4
                ? 'ATENÇÃO: Nível 4 é irreversível. A carteira atual será desativada e todos os ativos migrados para uma nova.'
                : selectedLevel === 3
                ? `Revogará ${erc20Approvals.length + nftApprovals.length} aprovações e encerrará ${sessions.length} sessões.`
                : `Aplicará ${LEVELS[selectedLevel - 1].actions.length} ações de proteção.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button className="gap-2 bg-red-600 hover:bg-red-700" onClick={handleExecute}>
              <Power className="h-4 w-4" /> Executar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
