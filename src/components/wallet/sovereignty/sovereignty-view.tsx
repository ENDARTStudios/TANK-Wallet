'use client'

import { useState } from 'react'
import { useWallet } from '../wallet-context'
import { chainById } from '@/lib/wallet/data'
import { shortenAddress, timeAgo } from '@/lib/wallet-sovereignty'
import { ChainBadge, RiskBadge, TokenAvatar } from '../common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { KeyRound, Ban, Clock, Globe, Shield, Power, RefreshCw, Loader2, ExternalLink, AlertTriangle, Crown, History, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SovereigntyView() {
  const {
    realWallet,
    erc20Approvals,
    nftApprovals,
    sessions,
    permissionHistory,
    refreshApprovals,
    loadingApprovals,
    revokeApproval,
    endSession,
    isProTier,
  } = useWallet()
  const { toast } = useToast()

  const handleRevoke = async (id: string, label: string) => {
    await revokeApproval(id)
    toast({ title: 'Permissão revogada', description: `${label} não pode mais mover seus ativos.` })
  }

  const handleEndSession = (id: string, name: string) => {
    endSession(id)
    toast({ title: 'Sessão encerrada', description: `${name} foi desconectado.` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            Sovereignty Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Princípio nº 1: <strong>Nada é permanente sem o consentimento contínuo do usuário.</strong> Toda permissão concedida pode ser auditada e revogada.
          </p>
        </div>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ERC-20 Approvals</p>
                <p className="text-xl font-bold text-amber-400">{erc20Approvals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Ban className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">NFT Approvals</p>
                <p className="text-xl font-bold text-red-400">{nftApprovals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sessões DApp</p>
                <p className="text-xl font-bold text-blue-400">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <History className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Eventos no log</p>
                <p className="text-xl font-bold text-emerald-400">{permissionHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="erc20" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="erc20" className="gap-1.5">
            ERC-20 ({erc20Approvals.length})
          </TabsTrigger>
          <TabsTrigger value="nft" className="gap-1.5">
            NFTs ({nftApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5">
            Sessions ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            Histórico ({permissionHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* ERC-20 Approvals */}
        <TabsContent value="erc20" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-emerald-400" />
                Aprovações ERC-20 ativas
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Contratos que podem mover seus tokens. Aprovações infinitas são especialmente perigosas.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {erc20Approvals.length === 0 && !loadingApprovals && (
                <div className="py-8 text-center">
                  <Shield className="mx-auto h-8 w-8 text-emerald-400/40" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma aprovação ERC-20 ativa</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">Sua carteira está limpa.</p>
                </div>
              )}
              {loadingApprovals && (
                <div className="py-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400" />
                  <p className="mt-2 text-sm text-muted-foreground">Lendo aprovações on-chain…</p>
                </div>
              )}
              {erc20Approvals.map((approval) => (
                <div
                  key={approval.id}
                  className={cn(
                    'rounded-xl border p-3',
                    approval.isInfinite
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-border/50 bg-muted/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <TokenAvatar symbol={approval.tokenSymbol} color={approval.tokenLogoColor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{approval.tokenSymbol}</p>
                        <ChainBadge chainId={approval.chain as any} />
                        {approval.isInfinite && (
                          <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400">
                            INFINITO
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        → {approval.spenderName}
                      </p>
                      <p className="truncate text-[10px] font-mono text-muted-foreground/70">
                        {shortenAddress(approval.spenderAddress, 6)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleRevoke(approval.id, `${approval.tokenSymbol} → ${approval.spenderName}`)}
                      >
                        <Ban className="h-3.5 w-3.5" /> Revogar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NFT Approvals */}
        <TabsContent value="nft" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ban className="h-4 w-4 text-red-400" />
                Aprovações NFT (setApprovalForAll)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Cada item abaixo dá ao spender controle sobre <strong>TODOS os NFTs</strong> da coleção. Revogue imediatamente se não estiver em uso.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {nftApprovals.length === 0 && (
                <div className="py-8 text-center">
                  <Shield className="mx-auto h-8 w-8 text-emerald-400/40" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma aprovação NFT ativa</p>
                </div>
              )}
              {nftApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-xl border border-red-500/30 bg-red-500/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                      <Ban className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{approval.tokenName}</p>
                        <ChainBadge chainId={approval.chain as any} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">→ {approval.spenderName}</p>
                      <p className="text-[10px] text-red-400">Pode mover TODOS os NFTs desta coleção</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleRevoke(approval.id, `${approval.tokenName} → ${approval.spenderName}`)}
                    >
                      <Ban className="h-3.5 w-3.5" /> Revogar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-blue-400" />
                Sessões DApp ativas
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Cada conexão com um DApp cria uma sessão. Encerre sessões que não usa mais.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessions.length === 0 && (
                <div className="py-8 text-center">
                  <Globe className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhuma sessão DApp ativa</p>
                </div>
              )}
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-border/50 bg-muted/20 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: `${session.dappLogoColor}20`, color: session.dappLogoColor }}
                    >
                      {session.dappName.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{session.dappName}</p>
                        <RiskBadge level={session.riskLevel} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground font-mono">{session.dappUrl}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Conectado há {timeAgo(session.connectedAt).replace(' atrás', '')} · Última atividade: {timeAgo(session.lastActiveAt)}
                      </p>
                      <div className="mt-2 space-y-0.5">
                        {session.permissions.map((perm, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground">
                            • {perm.description}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleEndSession(session.id, session.dappName)}
                      >
                        <Power className="h-3.5 w-3.5" /> Encerrar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permission history */}
        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-emerald-400" />
                Histórico completo de permissões
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Nada desaparece. Toda ação gera um evento.
              </p>
            </CardHeader>
            <CardContent className="space-y-1">
              {permissionHistory.map((ev) => {
                const isGranted = ev.type === 'granted'
                const isRevoked = ev.type === 'revoked'
                return (
                  <div
                    key={ev.id}
                    className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/10 p-2.5"
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg shrink-0',
                        isGranted
                          ? 'bg-amber-500/10 text-amber-400'
                          : isRevoked
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isGranted ? <KeyRound className="h-3.5 w-3.5" /> : isRevoked ? <Ban className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">
                        {ev.description}
                        {ev.tokenSymbol && ` · ${ev.tokenSymbol}`}
                        {ev.spenderName && ` → ${ev.spenderName}`}
                        {ev.amount && ` (${ev.amount})`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(ev.timestamp).toLocaleString('pt-BR')}
                        {ev.chain && ` · ${chainById(ev.chain).name}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Undo Center (PRO feature) */}
      <Card className={cn('border-2', isProTier ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/50')}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Undo Center
              {!isProTier && <Crown className="h-3 w-3 text-amber-400" />}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-amber-500/40 text-amber-400"
              onClick={() => toast({ title: 'Em breve', description: 'Recurso PRO.' })}
            >
              <Eye className="h-3.5 w-3.5" /> Ativar PRO
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sempre que possível, a Tank sugere ações corretivas automáticas.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-xs font-semibold text-amber-400">Sugestões ativas</p>
            <ul className="mt-1.5 space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                <span>
                  Aprovação infinita encontrada — considere revogar e aprovar apenas o valor necessário.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                <span>
                  Contrato OpenSea não tem atividade há 30 dias — permissão setApprovalForAll ainda ativa.
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
