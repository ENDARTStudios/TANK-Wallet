'use client'

import { useWallet } from '../wallet-context'
import { shortenAddress } from '@/lib/wallet-sovereignty'
import { ChainBadge, TokenAvatar } from '../common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { KeyRound, Ban, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PermissionsView() {
  const {
    erc20Approvals,
    nftApprovals,
    refreshApprovals,
    loadingApprovals,
    revokeApproval,
    isProTier,
  } = useWallet()
  const { toast } = useToast()

  const totalInfinite = erc20Approvals.filter((a) => a.isInfinite).length

  const handleRevokeAll = async () => {
    if (!isProTier) {
      toast({ title: 'Recurso PRO', description: 'A revogação em massa está disponível no plano PRO.', variant: 'destructive' })
      return
    }
    const all = [...erc20Approvals, ...nftApprovals]
    for (const approval of all) {
      await revokeApproval(approval.id)
    }
    toast({ title: `${all.length} permissões revogadas`, description: 'Sua carteira está limpa.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-emerald-400" />
            Permission Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista tudo que pode gastar fundos em seu nome. Revogar com um clique.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-500/40 text-emerald-400 shrink-0"
            onClick={refreshApprovals}
            disabled={loadingApprovals}
          >
            {loadingApprovals ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Atualizar
          </Button>
          {(erc20Approvals.length > 0 || nftApprovals.length > 0) && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10 shrink-0"
              onClick={handleRevokeAll}
              disabled={!isProTier}
            >
              <Ban className="h-4 w-4" /> Revogar tudo
            </Button>
          )}
        </div>
      </div>

      {/* Infinite approvals warning */}
      {totalInfinite > 0 && (
        <Card className="border-2 border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400">
                {totalInfinite} aprovação(ões) infinita(s) ativa(s)
              </p>
              <p className="text-xs text-muted-foreground">
                Aprovações infinitas permitem que o contrato mova qualquer quantidade de tokens sem nova autorização.
                Considere revogar e aprovar apenas valores específicos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ERC-20 Approvals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-emerald-400" /> ERC-20 Approvals
            </span>
            <Badge variant="secondary" className="text-[10px]">{erc20Approvals.length} ativas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {erc20Approvals.length === 0 && !loadingApprovals && (
            <div className="py-8 text-center">
              <KeyRound className="mx-auto h-8 w-8 text-emerald-400/40" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma aprovação ERC-20 ativa</p>
            </div>
          )}
          {loadingApprovals && (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400" />
            </div>
          )}
          {erc20Approvals.map((approval) => (
            <div
              key={approval.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-2.5',
                approval.isInfinite
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-border/50 bg-muted/20'
              )}
            >
              <TokenAvatar symbol={approval.tokenSymbol} color={approval.tokenLogoColor} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{approval.tokenSymbol}</p>
                  <ChainBadge chainId={approval.chain as any} />
                  {approval.isInfinite && (
                    <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400 shrink-0">
                      INFINITO
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{approval.spenderName}</p>
                <p className="truncate text-[10px] font-mono text-muted-foreground/70">
                  {shortenAddress(approval.spenderAddress, 6)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10 shrink-0"
                onClick={async () => {
                  await revokeApproval(approval.id)
                  toast({ title: 'Aprovação revogada', description: `${approval.tokenSymbol} → ${approval.spenderName}` })
                }}
              >
                <Ban className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Revogar</span>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* NFT Approvals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-400" /> NFT Approvals (setApprovalForAll)
            </span>
            <Badge variant="secondary" className="text-[10px]">{nftApprovals.length} ativas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {nftApprovals.length === 0 && (
            <div className="py-8 text-center">
              <Ban className="mx-auto h-8 w-8 text-emerald-400/40" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma aprovação NFT ativa</p>
            </div>
          )}
          {nftApprovals.map((approval) => (
            <div
              key={approval.id}
              className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-2.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <Ban className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{approval.tokenName}</p>
                  <ChainBadge chainId={approval.chain as any} />
                </div>
                <p className="truncate text-xs text-muted-foreground">{approval.spenderName}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10 shrink-0"
                onClick={async () => {
                  await revokeApproval(approval.id)
                  toast({ title: 'NFT approval revogada', description: approval.tokenName })
                }}
              >
                <Ban className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Revogar</span>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
