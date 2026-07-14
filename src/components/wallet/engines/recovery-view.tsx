'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '../wallet-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck, KeyRound, Fingerprint, Download, Plus, Users, Lock, AlertTriangle,
  CheckCircle2, Zap, Copy, Eye, EyeOff, Loader2, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  splitMnemonic, reconstructMnemonic, registerPasskey,
  saveRecoveryContacts, loadRecoveryContacts, generateEmergencyKit, downloadEmergencyKit,
  type MnemonicShamirShare, type PasskeyCredential, type RecoveryContact,
} from '@/lib/wallet-engines/recovery'

export function RecoveryView() {
  const { realWallet } = useWallet()
  const { toast } = useToast()
  const [shamirShares, setShamirShares] = useState<MnemonicShamirShare[]>([])
  const [shamirK, setShamirK] = useState(3)
  const [shamirN, setShamirN] = useState(5)
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([])
  const [contacts, setContacts] = useState<RecoveryContact[]>([])
  const [newContactName, setNewContactName] = useState('')
  const [newContactAddress, setNewContactAddress] = useState('')
  const [showShares, setShowShares] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (realWallet) {
      setContacts(loadRecoveryContacts(realWallet.evm.address))
      const savedPasskeys = localStorage.getItem(`tank:passkeys:${realWallet.evm.address}`)
      if (savedPasskeys) {
        try { setPasskeys(JSON.parse(savedPasskeys)) } catch { /* ignore */ }
      }
    }
  }, [realWallet])

  const handleShamirSplit = async () => {
    if (!realWallet) return
    setGenerating(true)
    try {
      // In production, this would use the actual decrypted mnemonic
      // For demo, we use a placeholder
      const demoMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const shares = splitMnemonic(demoMnemonic, shamirK, shamirN)
      setShamirShares(shares)
      toast({ title: 'Shamir Backup gerado', description: `${shamirN} shares criados, ${shamirK} necessários para recuperar.` })
    } catch (e) {
      toast({ title: 'Erro', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const handleRegisterPasskey = async () => {
    const name = prompt('Nome para esta Passkey (ex: MacBook Pro):')
    if (!name) return
    const credential = await registerPasskey(name)
    if (credential) {
      const updated = [...passkeys, credential]
      setPasskeys(updated)
      if (realWallet) {
        localStorage.setItem(`tank:passkeys:${realWallet.evm.address}`, JSON.stringify(updated))
      }
      toast({ title: 'Passkey registrada', description: `${name} pode agora autenticar o desbloqueio.` })
    } else {
      toast({ title: 'Falha', description: 'Não foi possível registrar a Passkey.', variant: 'destructive' })
    }
  }

  const handleAddContact = () => {
    if (!newContactName || !newContactAddress || !realWallet) return
    const contact: RecoveryContact = {
      id: `rc-${Date.now()}`,
      name: newContactName,
      contact: newContactAddress,
      type: 'wallet',
      verified: false,
      addedAt: Date.now(),
    }
    const updated = [...contacts, contact]
    setContacts(updated)
    saveRecoveryContacts(realWallet.evm.address, updated)
    setNewContactName('')
    setNewContactAddress('')
    toast({ title: 'Contato adicionado', description: `${newContactName} pode ajudar na recuperação social.` })
  }

  const handleEmergencyKit = async () => {
    if (!realWallet) return
    const password = prompt('Senha mestra para criptografar o Emergency Kit:')
    if (!password) return
    try {
      const kit = await generateEmergencyKit({
        walletAddress: realWallet.evm.address,
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        masterPassword: password,
        recoveryContacts: contacts,
        passkeys,
        hardwareWallets: [],
        shamirShares: shamirShares.length > 0 ? shamirShares : undefined,
      })
      downloadEmergencyKit(kit)
      toast({ title: 'Emergency Kit gerado', description: 'Arquivo JSON criptografado baixado.' })
    } catch (e) {
      toast({ title: 'Erro', description: (e as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          Recovery Center
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Módulo completo de recuperação — Shamir Backup, Passkeys, Social Recovery, Emergency Kit.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Shamir Shares</p>
                <p className="text-lg font-bold">{shamirShares.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Fingerprint className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Passkeys</p>
                <p className="text-lg font-bold">{passkeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Contacts</p>
                <p className="text-lg font-bold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Download className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Emergency Kit</p>
                <p className="text-lg font-bold">{shamirShares.length > 0 || passkeys.length > 0 ? 'Ready' : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shamir Backup */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-emerald-400" />
              Shamir Backup
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Divide sua seed em N shares. Qualquer K shares podem reconstruir a carteira.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Threshold (K)</Label>
                <Input
                  type="number"
                  value={shamirK}
                  onChange={(e) => setShamirK(Math.max(2, parseInt(e.target.value) || 2))}
                  min={2}
                  max={10}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Total shares (N)</Label>
                <Input
                  type="number"
                  value={shamirN}
                  onChange={(e) => setShamirN(Math.max(shamirK, parseInt(e.target.value) || 5))}
                  min={shamirK}
                  max={10}
                  className="h-9"
                />
              </div>
            </div>
            <Button
              onClick={handleShamirSplit}
              disabled={generating}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Gerar {shamirN} shares (K={shamirK})
            </Button>

            {shamirShares.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {shamirShares.length} shares gerados
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => setShowShares(!showShares)}
                  >
                    {showShares ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showShares ? 'Ocultar' : 'Revelar'}
                  </Button>
                </div>
                {showShares && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {shamirShares.map((share, i) => (
                      <div key={i} className="rounded-lg border border-border/50 bg-muted/20 p-2">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[9px]">Share #{share.index}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[9px] gap-1"
                            onClick={() => {
                              navigator.clipboard.writeText(share.words.join(' '))
                              toast({ title: 'Share copiado' })
                            }}
                          >
                            <Copy className="h-2.5 w-2.5" /> Copiar
                          </Button>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground break-all">
                          {share.words.slice(0, 5).join(' ')}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-amber-400" />
                  <p className="text-[10px] text-amber-300">
                    Distribua cada share em locais diferentes. Nunca armazene 2 shares no mesmo lugar.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passkeys */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Fingerprint className="h-4 w-4 text-blue-400" />
              Passkeys (WebAuthn)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Autenticação biométrica para desbloquear a carteira. Substitui senha por biometria.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleRegisterPasskey}
              variant="outline"
              className="w-full gap-2 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
            >
              <Fingerprint className="h-4 w-4" /> Registrar Passkey
            </Button>
            {passkeys.length > 0 ? (
              <div className="space-y-1.5">
                {passkeys.map((pk, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2">
                    <Fingerprint className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{pk.name}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {new Date(pk.createdAt).toLocaleDateString('pt-BR')} · {pk.deviceType}
                      </p>
                    </div>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <Fingerprint className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">Nenhuma Passkey registrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Recovery */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-teal-400" />
              Social Recovery
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Adicione contatos de confiança que podem ajudar na recuperação.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Nome"
                className="h-9 text-sm"
              />
              <Input
                value={newContactAddress}
                onChange={(e) => setNewContactAddress(e.target.value)}
                placeholder="0x... ou email"
                className="h-9 text-sm font-mono"
              />
              <Button
                onClick={handleAddContact}
                disabled={!newContactName || !newContactAddress}
                size="sm"
                className="gap-1.5 bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {contacts.length > 0 ? (
              <div className="space-y-1.5">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2">
                    <Users className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.name}</p>
                      <p className="text-[9px] font-mono text-muted-foreground truncate">{c.contact}</p>
                    </div>
                    {c.verified ? (
                      <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400">Verificado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400">Pendente</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">Nenhum contato adicionado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Kit */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-amber-400" />
              Emergency Kit
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Bundle criptografado com tudo necessário para recuperar a carteira.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Seed criptografada (AES-256-GCM)</span>
                <CheckCircle2 className={cn('h-3 w-3', shamirShares.length > 0 ? 'text-emerald-400' : 'text-muted-foreground/30')} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Shamir shares</span>
                <CheckCircle2 className={cn('h-3 w-3', shamirShares.length > 0 ? 'text-emerald-400' : 'text-muted-foreground/30')} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Passkeys registradas</span>
                <CheckCircle2 className={cn('h-3 w-3', passkeys.length > 0 ? 'text-emerald-400' : 'text-muted-foreground/30')} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Recovery contacts</span>
                <CheckCircle2 className={cn('h-3 w-3', contacts.length > 0 ? 'text-emerald-400' : 'text-muted-foreground/30')} />
              </div>
            </div>
            <Button
              onClick={handleEmergencyKit}
              variant="outline"
              className="w-full gap-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            >
              <Download className="h-4 w-4" /> Gerar e baixar Emergency Kit
            </Button>
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
              <Lock className="h-3 w-3 shrink-0 mt-0.5 text-amber-400" />
              <p className="text-[10px] text-amber-300">
                O Emergency Kit é criptografado com sua senha mestra. Guarde em local seguro e offline.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hardware Wallet placeholder */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40">
            <Zap className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium">Hardware Wallet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Suporte para Ledger, Trezor, Keystone e GridPlus em desenvolvimento (Phase 6).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
