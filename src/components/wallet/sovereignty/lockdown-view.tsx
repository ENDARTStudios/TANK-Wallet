'use client'

import { useState } from 'react'
import { useWallet } from '../wallet-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Power, AlertTriangle, ShieldCheck, Loader2, CheckCircle2, Crown, Lock, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [executing, setExecuting] = useState(false)

  const totalToRevoke = erc20Approvals.length + nftApprovals.length + sessions.length

  const handleExecute = async () => {
    setConfirmOpen(false)
    setExecuting(true)
    await runLockdown()
    setExecuting(false)
    toast({
      title: 'LOCKDOWN executado',
      description: `${totalToRevoke} permissões revogadas. Modo somente leitura ativo.`,
      variant: 'default',
    })
  }

  // If not PRO, show upgrade screen
  if (!isProTier) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Power className="h-6 w-6 text-red-400" />
            Lockdown
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Botão de emergência — revoga todas as permissões em um toque.
          </p>
        </div>

        <Card className="border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-card">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Crown className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">Recurso PRO</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              O Lockdown é o recurso de emergência mais poderoso da Tank Wallet.
              Com um toque, ele revoga todas as aprovações ERC-20, NFT, Permit2,
              encerra sessões DApp, desconecta WalletConnect e ativa modo somente leitura.
            </p>
            <p className="mt-4 text-2xl font-bold">US$ 19,99<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
            <p className="text-xs text-muted-foreground">ou US$ 203,90/ano (15% off)</p>
            <Button
              className="mt-6 gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => {
                setProTier(true)
                toast({ title: 'PRO ativado', description: 'Todos os recursos de segurança estão desbloqueados.' })
              }}
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
          Botão de emergência. Revoga todas as permissões, encerra sessões, bloqueia novas assinaturas.
          Tempo estimado: 30-90 segundos.
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
          {/* Warning + execute */}
          <Card className="border-2 border-red-500/40 bg-gradient-to-br from-red-500/10 via-card to-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={executing}
                    className={cn(
                      'flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-500/40 transition-all hover:scale-105 active:scale-95',
                      executing && 'animate-pulse'
                    )}
                  >
                    {executing ? <Loader2 className="h-10 w-10 animate-spin" /> : <Power className="h-10 w-10" />}
                  </button>
                  <div className="absolute -inset-2 rounded-full border-2 border-red-500/30 animate-ping" />
                </div>
                <h2 className="text-xl font-bold text-red-400">
                  {executing ? 'Executando Lockdown…' : 'Botão de Emergência'}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {executing
                    ? 'Revogando todas as permissões, encerrando sessões e ativando modo somente leitura…'
                    : 'Um toque revoga todas as permissões e ativa modo somente leitura. Use em caso de comprometimento suspeito.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview of what will be revoked */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">O que será revogado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <PreviewRow icon={<Ban className="h-3.5 w-3.5 text-amber-400" />} label="Aprovações ERC-20" count={erc20Approvals.length} />
              <PreviewRow icon={<Ban className="h-3.5 w-3.5 text-red-400" />} label="Aprovações NFT (setApprovalForAll)" count={nftApprovals.length} />
              <PreviewRow icon={<Power className="h-3.5 w-3.5 text-blue-400" />} label="Sessões DApp" count={sessions.length} />
              <PreviewRow icon={<Lock className="h-3.5 w-3.5 text-zinc-400" />} label="Permit2" count={0} />
              <PreviewRow icon={<Power className="h-3.5 w-3.5 text-zinc-400" />} label="WalletConnect v2" count={0} />
              <PreviewRow icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />} label="Bloquear novas assinaturas" />
              <PreviewRow icon={<Lock className="h-3.5 w-3.5 text-emerald-400" />} label="Ativar modo somente leitura" />
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
            <DialogTitle className="text-center">Confirmar Lockdown</DialogTitle>
            <DialogDescription className="text-center">
              Esta ação revogará <strong>{totalToRevoke} permissões</strong> e ativará modo somente leitura.
              Você poderá desfazê-lo a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button className="gap-2 bg-red-600 hover:bg-red-700" onClick={handleExecute}>
              <Power className="h-4 w-4" /> Executar Lockdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PreviewRow({ icon, label, count }: { icon: React.ReactNode; label: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/40">{icon}</div>
      <p className="flex-1 text-xs">{label}</p>
      {count !== undefined && (
        <Badge variant="outline" className="text-[9px]">{count}</Badge>
      )}
    </div>
  )
}
