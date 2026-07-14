'use client'

import { useState, useMemo } from 'react'
import { useWallet } from './wallet-context'
import { chainById } from '@/lib/wallet/data'
import { formatTokenAmount, formatUsd, timeAgo } from '@/lib/wallet/security'
import { ChainBadge, TokenAvatar, ScoreRing } from './common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Lock, Unlock, Shield, ShieldCheck, ArrowRight, ArrowLeft, Fingerprint, Clock, AlertTriangle, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Token } from '@/lib/wallet/types'

export function VaultView() {
  const { vaultTokens, tokens, vaultUnlocked, unlockVault, lockVault, moveToVault, moveFromVault, transactions } = useWallet()
  const { toast } = useToast()
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [movingToken, setMovingToken] = useState<Token | null>(null)
  const [moveDirection, setMoveDirection] = useState<'in' | 'out' | null>(null)

  const vaultValue = useMemo(
    () => vaultTokens.reduce((acc, t) => acc + t.balance * t.priceUsd, 0),
    [vaultTokens]
  )
  const hotValue = useMemo(
    () => tokens.reduce((acc, t) => acc + t.balance * t.priceUsd, 0),
    [tokens]
  )
  const vaultMovements = useMemo(
    () => transactions.filter((t) => t.type === 'vault-move').slice(0, 5),
    [transactions]
  )

  const handleUnlock = () => {
    if (unlockVault(pin)) {
      toast({ title: 'Cofre desbloqueado', description: 'Acesso concedido por 5 minutos.' })
      setPinDialogOpen(false)
      setPin('')
    } else {
      toast({ title: 'PIN incorreto', description: 'Tente novamente. (Demo: 123456)', variant: 'destructive' })
    }
  }

  const startMove = (token: Token, direction: 'in' | 'out') => {
    if (!vaultUnlocked && direction === 'out') {
      setPinDialogOpen(true)
      return
    }
    setMovingToken(token)
    setMoveDirection(direction)
  }

  const confirmMove = () => {
    if (!movingToken || !moveDirection) return
    if (moveDirection === 'in') {
      moveToVault(movingToken.id)
      toast({ title: 'Movido para o cofre', description: `${movingToken.symbol} agora está em cold storage.` })
    } else {
      moveFromVault(movingToken.id)
      toast({ title: 'Retirado do cofre', description: `${movingToken.symbol} voltou para a hot wallet.` })
    }
    setMovingToken(null)
    setMoveDirection(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cofre</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tokens em cold storage — protegidos por PIN, biometria e timelock. Não assinam transações automaticamente.
          </p>
        </div>
        <Button
          variant={vaultUnlocked ? 'outline' : 'default'}
          className={cn('gap-2 shrink-0', !vaultUnlocked && 'bg-emerald-600 hover:bg-emerald-700')}
          onClick={() => (vaultUnlocked ? lockVault() : setPinDialogOpen(true))}
        >
          {vaultUnlocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          <span className="hidden sm:inline">{vaultUnlocked ? 'Bloquear cofre' : 'Desbloquear cofre'}</span>
          <span className="sm:hidden">{vaultUnlocked ? 'Bloquear' : 'Abrir'}</span>
        </Button>
      </div>

      {/* Vault status hero */}
      <Card className={cn(
        'relative overflow-hidden border-2 transition-all',
        vaultUnlocked ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card' : 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-card'
      )}>
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <CardContent className="relative p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className={cn(
                'relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg',
                vaultUnlocked ? 'bg-emerald-500/20' : 'bg-amber-500/20'
              )}>
                {vaultUnlocked ? <Unlock className="h-7 w-7 text-emerald-400" /> : <Lock className="h-7 w-7 text-amber-400" />}
                <div className={cn(
                  'absolute -inset-1 rounded-2xl border-2',
                  vaultUnlocked ? 'border-emerald-500/30 animate-pulse' : 'border-amber-500/20'
                )} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {vaultUnlocked ? 'Cofre desbloqueado' : 'Cofre bloqueado'}
                </p>
                <p className="text-3xl font-bold tracking-tight">{formatUsd(vaultValue)}</p>
                <p className="text-xs text-muted-foreground">{vaultTokens.length} tokens em cold storage</p>
              </div>
            </div>

            <div className="flex-1" />

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                <ScoreRing score={vaultUnlocked ? 92 : 99} size={48} label={vaultUnlocked ? 'Aberto' : 'Fechado'} />
              </div>
              <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                <Clock className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Timelock</p>
                <p className="text-xs font-bold">{vaultUnlocked ? '5 min' : '24h'}</p>
              </div>
            </div>
          </div>

          {!vaultUnlocked && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <p className="text-[11px] text-muted-foreground">
                Para mover tokens para fora do cofre, é necessário desbloquear com PIN + biometria. Cada sessão dura 5 minutos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vault tokens */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4 text-emerald-400" /> No cofre
              </CardTitle>
              <span className="text-xs text-muted-foreground">{formatUsd(vaultValue)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {vaultTokens.length === 0 && (
              <div className="py-8 text-center">
                <Lock className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">Cofre vazio</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Mova tokens da hot wallet para o cofre.</p>
              </div>
            )}
            {vaultTokens.map((t) => (
              <VaultTokenRow
                key={t.id}
                token={t}
                actionLabel="Retirar"
                actionIcon={<ArrowLeft className="h-3.5 w-3.5" />}
                onAction={() => startMove(t, 'out')}
                disabled={!vaultUnlocked}
                disabledReason={!vaultUnlocked ? 'Desbloqueie o cofre' : undefined}
              />
            ))}
          </CardContent>
        </Card>

        {/* Hot wallet tokens (move to vault) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-emerald-400" /> Hot wallet
              </CardTitle>
              <span className="text-xs text-muted-foreground">{formatUsd(hotValue)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
            {tokens.map((t) => (
              <VaultTokenRow
                key={t.id}
                token={t}
                actionLabel="Mover para cofre"
                actionIcon={<ArrowRight className="h-3.5 w-3.5" />}
                onAction={() => startMove(t, 'in')}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent vault movements */}
      {vaultMovements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Movimentações do cofre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vaultMovements.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  tx.counterparty === 'Cofre interno' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                )}>
                  {tx.counterparty === 'Cofre interno' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">
                    {tx.counterparty === 'Cofre interno' ? 'Para o cofre' : 'Do cofre para hot wallet'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(tx.timestamp)} · {tx.note}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">{formatTokenAmount(tx.amount)} {tx.tokenSymbol}</p>
                  <p className="text-[10px] text-muted-foreground">{formatUsd(tx.usdValue)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Unlock dialog */}
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Fingerprint className="h-6 w-6 text-emerald-400" />
            </div>
            <DialogTitle className="text-center">Desbloquear cofre</DialogTitle>
            <DialogDescription className="text-center">
              Confirme com seu PIN de 6 dígitos. A biometria será solicitada em seguida.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN do cofre</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5 shrink-0" />
              <span>Demo: use <code className="font-mono text-emerald-400">123456</code></span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPinDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={handleUnlock} disabled={pin.length < 6}>
              <Fingerprint className="h-4 w-4" /> Desbloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move confirmation */}
      <Dialog open={!!movingToken} onOpenChange={(o) => !o && setMovingToken(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {moveDirection === 'in' ? <Lock className="h-4 w-4 text-emerald-400" /> : <Unlock className="h-4 w-4 text-amber-400" />}
              {moveDirection === 'in' ? 'Mover para o cofre' : 'Retirar do cofre'}
            </DialogTitle>
            <DialogDescription>
              {moveDirection === 'in'
                ? 'O token será protegido por PIN + timelock. Não poderá ser enviado até ser retirado.'
                : 'O token voltará para a hot wallet e estará disponível para transações.'}
            </DialogDescription>
          </DialogHeader>
          {movingToken && (
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <TokenAvatar symbol={movingToken.symbol} color={movingToken.logoColor} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{movingToken.symbol}</p>
                <p className="text-xs text-muted-foreground">{formatTokenAmount(movingToken.balance, movingToken.decimals)} · {formatUsd(movingToken.balance * movingToken.priceUsd)}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMovingToken(null)}>Cancelar</Button>
            <Button
              className={cn('gap-2', moveDirection === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : '')}
              onClick={confirmMove}
            >
              <ShieldCheck className="h-4 w-4" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VaultTokenRow({
  token,
  actionLabel,
  actionIcon,
  onAction,
  disabled,
  disabledReason,
}: {
  token: Token
  actionLabel: string
  actionIcon: React.ReactNode
  onAction: () => void
  disabled?: boolean
  disabledReason?: string
}) {
  const chain = chainById(token.chain)
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5">
      <div className="relative">
        <TokenAvatar symbol={token.symbol} color={token.logoColor} />
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background"
          style={{ backgroundColor: chain.color }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{token.symbol}</p>
          <ChainBadge chainId={token.chain} />
        </div>
        <p className="truncate text-xs text-muted-foreground">{token.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{formatTokenAmount(token.balance, token.decimals)}</p>
        <p className="text-xs text-muted-foreground">{formatUsd(token.balance * token.priceUsd)}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onAction}
        disabled={disabled}
        title={disabledReason}
        className="gap-1.5 shrink-0 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
      >
        {actionIcon}
        <span className="hidden sm:inline">{actionLabel}</span>
      </Button>
    </div>
  )
}
