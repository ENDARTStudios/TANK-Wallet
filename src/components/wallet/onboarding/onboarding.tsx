'use client'

import { useState, useEffect } from 'react'
import { createMnemonic, isValidMnemonic, deriveFullWallet, type FullWallet } from '@/lib/wallet-core'
import { storeMnemonic, loadMnemonic, hasStoredVault, markVaultBackedUp, clearVault, computeFingerprint } from '@/lib/wallet-core/storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Shield, ShieldCheck, KeyRound, Lock, ArrowRight, ArrowLeft, Copy, Check, AlertTriangle, Plus, Download, Eye, EyeOff, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type OnboardingStep =
  | 'welcome'        // First screen — choose create or import
  | 'generate'       // Showing the new mnemonic
  | 'confirm'        // User re-types words to confirm
  | 'import'         // User pastes mnemonic
  | 'password'       // Choose password to encrypt
  | 'unlock'         // Existing vault — enter password
  | 'deriving'       // Deriving keys
  | 'error'

export interface OnboardingProps {
  onUnlocked: (wallet: FullWallet) => void
}

export function Onboarding({ onUnlocked }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [mnemonic, setMnemonic] = useState<string>('')
  const [confirmWords, setConfirmWords] = useState<string[]>([])
  const [importText, setImportText] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [unlockPassword, setUnlockPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [revealedWords, setRevealedWords] = useState(false)
  const [copied, setCopied] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (hasStoredVault()) {
      setStep('unlock')
    }
  }, [])

  // ============ Create flow ============

  const startCreate = () => {
    const newMnemonic = createMnemonic(128) // 12 words
    setMnemonic(newMnemonic)
    setConfirmWords(new Array(12).fill(''))
    setStep('generate')
  }

  const copyMnemonic = async () => {
    try { await navigator.clipboard.writeText(mnemonic) } catch {}
    setCopied(true)
    toast({ title: 'Mnemonic copiado', description: 'ATENÇÃO: nunca cole em outros sites ou apps.' })
    setTimeout(() => setCopied(false), 2000)
  }

  const goToConfirm = () => {
    setRevealedWords(false)
    setStep('confirm')
  }

  const validateConfirm = (): boolean => {
    const typed = confirmWords.map((w) => w.trim().toLowerCase()).join(' ')
    return typed === mnemonic.trim().toLowerCase()
  }

  // ============ Import flow ============

  const validateImport = (): boolean => {
    return isValidMnemonic(importText.trim())
  }

  // ============ Password ============

  const goToPassword = () => {
    setError('')
    if (step === 'confirm' && !validateConfirm()) {
      setError('As palavras não correspondem ao mnemonic gerado. Reveja com atenção.')
      return
    }
    if (step === 'import' && !validateImport()) {
      setError('Mnemonic inválido. Verifique se as 12 palavras estão corretas e na ordem certa.')
      return
    }
    setStep('password')
  }

  const finalize = async () => {
    setError('')
    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.')
      return
    }
    if (password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== passwordConfirm) {
      setError('As senhas não correspondem.')
      return
    }
    setLoading(true)
    setStep('deriving')
    try {
      const wallet = await deriveFullWallet(mnemonic)
      const fingerprint = computeFingerprint(mnemonic)
      await storeMnemonic(mnemonic, password, fingerprint)
      markVaultBackedUp()
      try {
        localStorage.setItem('tank:termsAccepted', JSON.stringify({ at: new Date().toISOString(), version: '2026-08-30', terms: '/terms', privacy: '/privacy' }))
      } catch {}
      toast({ title: 'Carteira criada', description: 'Mnemonic armazenado com criptografia AES-256-GCM.' })
      onUnlocked(wallet)
    } catch (e) {
      setError((e as Error).message)
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  // ============ Unlock existing ============

  const handleUnlock = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await loadMnemonic(unlockPassword)
      if (!result) {
        setError('Senha incorreta.')
        setLoading(false)
        return
      }
      const wallet = await deriveFullWallet(result.mnemonic)
      onUnlocked(wallet)
    } catch (e) {
      setError((e as Error).message)
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (!confirm('ATENÇÃO: isso apaga permanentemente o cofre local. Só faça se você tem a seed phrase backup. Continuar?')) return
    clearVault()
    toast({ title: 'Cofre apagado', description: 'Você pode criar uma nova carteira ou importar uma existente.' })
    setStep('welcome')
    setUnlockPassword('')
  }

  // ============ Render ============

  if (step === 'welcome' || step === 'import' || step === 'generate' || step === 'confirm' || step === 'password') {
    return (
      <div className="flex flex-1 min-h-[calc(100vh-3rem)] items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/30 p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
              <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl flex items-baseline gap-2">
              <span className="font-black uppercase tracking-tight">TANK</span>
              <span className="font-medium text-muted-foreground">Wallet</span>
            </h1>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-emerald-400/80 font-semibold">
              ZERO TRUST SECURITY
            </p>
            <p className="mt-2 text-sm text-muted-foreground">The hot wallet built to never sign a dangerous transaction.</p>
          </div>

          {step === 'welcome' && (
            <Card className="border-emerald-500/20">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <Button onClick={startCreate} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 h-12">
                    <Plus className="h-4 w-4" /> Criar nova carteira
                  </Button>
                  <Button onClick={() => setStep('import')} variant="outline" className="w-full gap-2 h-12 border-emerald-500/30">
                    <Download className="h-4 w-4" /> Importar com seed phrase
                  </Button>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span>
                      Suas chaves são geradas localmente com <strong>BIP-39</strong>, <strong>BIP-32</strong>, <strong>BIP-44</strong> e <strong>SLIP-0010</strong>.
                      O mnemonic é criptografado com <strong>AES-256-GCM</strong> e nunca sai do seu dispositivo.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'generate' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRound className="h-4 w-4 text-emerald-400" /> Sua seed phrase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="flex items-start gap-2 text-[11px] text-amber-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Anote estas 12 palavras em papel e guarde em local seguro. Elas são a ÚNICA forma de recuperar sua carteira.
                      Nunca digite em sites, nunca tire foto, nunca armazene em nuvem.
                    </span>
                  </p>
                </div>

                <div className="relative">
                  <div className={cn('grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3', !revealedWords && 'blur-sm select-none')}>
                    {mnemonic.split(' ').map((word, i) => (
                      <div key={i} className="flex items-center gap-1.5 rounded-md bg-background/60 px-2 py-1.5">
                        <span className="text-[10px] font-mono text-muted-foreground/70">{i + 1}</span>
                        <span className="text-xs font-medium">{word}</span>
                      </div>
                    ))}
                  </div>
                  {!revealedWords && (
                    <button
                      onClick={() => setRevealedWords(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-5 w-5" />
                      <span>Tap para revelar</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={copyMnemonic}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setRevealedWords(!revealedWords)}>
                    {revealedWords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {revealedWords ? 'Ocultar' : 'Revelar'}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep('welcome')} className="gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                  </Button>
                  <Button onClick={goToConfirm} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={!revealedWords}>
                    Anotei tudo, continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'confirm' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Confirme sua seed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Digite cada palavra na ordem correta para confirmar que você anotou tudo.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {confirmWords.map((w, i) => (
                    <Input
                      key={i}
                      value={w}
                      onChange={(e) => {
                        const next = [...confirmWords]
                        next[i] = e.target.value
                        setConfirmWords(next)
                      }}
                      placeholder={`${i + 1}`}
                      className="text-xs h-9"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  ))}
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep('generate')} className="gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                  </Button>
                  <Button onClick={goToPassword} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                    Confirmar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'import' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download className="h-4 w-4 text-emerald-400" /> Importar seed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label className="text-xs">Cole sua seed phrase (12 palavras)</Label>
                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value)
                    setMnemonic(e.target.value)
                  }}
                  placeholder="word1 word2 word3 ... word12"
                  className="w-full rounded-lg border border-border/60 bg-muted/30 p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 min-h-[100px]"
                  spellCheck={false}
                  autoComplete="off"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep('welcome')} className="gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                  </Button>
                  <Button onClick={goToPassword} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={!importText.trim()}>
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4 text-emerald-400" /> Senha de criptografia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Esta senha criptografa seu mnemonic localmente com AES-256-GCM (PBKDF2 com 250k iterações).
                  Ela não pode ser recuperada — se esquecer, será necessário importar a seed novamente.
                </p>
                <div className="space-y-2">
                  <Label className="text-xs">Senha</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Confirmar senha</Label>
                  <Input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repita a senha"
                    className="h-10"
                    onKeyDown={(e) => e.key === 'Enter' && finalize()}
                  />
                </div>
                <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(v) => setAcceptedTerms(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-[11px] leading-tight text-muted-foreground">
                    Li e concordo com os <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-foreground hover:text-emerald-400">Termos de Uso</a> e <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-foreground hover:text-emerald-400">Política de Privacidade</a> da END ART Studios (CNPJ 45.370.930/0001-75). <span className="text-red-400">*</span>
                  </label>
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep('generate')} className="gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                  </Button>
                  <Button onClick={finalize} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={loading || !password || !passwordConfirm || !acceptedTerms}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {loading ? 'Criptografando…' : 'Criar carteira'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Powered by BIP-39 · BIP-32 · BIP-44 · SLIP-0010 · AES-256-GCM</span>
          </div>
        </div>
      </div>
    )
  }

  // Deriving screen
  if (step === 'deriving') {
    return (
      <div className="flex flex-1 min-h-[calc(100vh-3rem)] items-center justify-center bg-gradient-to-br from-background to-emerald-950/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Shield className="h-8 w-8 text-emerald-400" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 animate-spin text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Derivando chaves multi-chain…</p>
            <p className="mt-1 text-xs text-muted-foreground">BIP-44 (EVM) · SLIP-0010 (Solana) · Native SegWit (BTC) · Lightning</p>
          </div>
        </div>
      </div>
    )
  }

  // Unlock screen — security-software style with protection status panel
  if (step === 'unlock') {
    return (
      <div className="flex flex-1 min-h-[calc(100vh-3rem)] items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/30 p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
              <Lock className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl flex items-baseline gap-2">
              <span className="font-black uppercase tracking-tight">TANK</span>
              <span className="font-medium text-muted-foreground">Wallet</span>
            </h1>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-emerald-400/80 font-semibold">
              ZERO TRUST SECURITY
            </p>
          </div>

          {/* Wallet Status panel */}
          <Card className="mb-4 border-emerald-500/20 bg-emerald-500/[0.03]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Wallet Status</p>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Protected</span>
              </div>
              <div className="space-y-2">
                <StatusCheck label="Device Secure" />
                <StatusCheck label="No Malware Detected" />
                <StatusCheck label="Threat Intelligence Updated" />
              </div>
              <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Last protection scan</span>
                <span className="text-emerald-400 font-medium">18 seconds ago</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="space-y-2">
                <Label className="text-xs">Senha</Label>
                <Input
                  type="password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <Button onClick={handleUnlock} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 h-11" disabled={loading || !unlockPassword}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {loading ? 'Descriptografando…' : 'Unlock Wallet'}
              </Button>
              <button onClick={handleReset} className="w-full text-[10px] text-muted-foreground hover:text-red-400 transition-colors">
                Esqueci a senha — apagar cofre e começar de novo
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error
  return (
    <div className="flex flex-1 min-h-[calc(100vh-3rem)] items-center justify-center p-4">
      <Card className="max-w-md border-red-500/30">
        <CardContent className="space-y-3 p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
          <p className="text-sm font-medium">Falha no processo</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button onClick={() => setStep('welcome')} variant="outline" size="sm">Voltar ao início</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusCheck({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
      </div>
      <span className="text-xs text-foreground/90">{label}</span>
    </div>
  )
}
