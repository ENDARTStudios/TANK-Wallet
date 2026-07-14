'use client'

import { useState } from 'react'
import { useWallet } from '../wallet-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Sparkles, AlertTriangle, ShieldCheck, Send, Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskExplanation {
  scenario: string
  explanation: string
  recommendation: string
  severity: 'safe' | 'warning' | 'critical'
}

const SAMPLE_SCENARIOS: RiskExplanation[] = [
  {
    scenario: 'Approve infinito de USDC para Uniswap',
    explanation:
      'Este contrato solicita autorização ilimitada para movimentar seus USDC. Caso seja comprometido, poderá transferir todos os seus tokens aprovados — não apenas o valor desta transação. Aprovações infinitas são convenientes (você não precisa aprovar a cada swap), mas criam um risco permanente: se o contrato for hackeado amanhã, o atacante poderá drenar todo o seu saldo de USDC até você revogar manualmente.',
    recommendation:
      'Recomenda-se conceder apenas o valor necessário para a operação atual. Se preferir manter o approve infinito pela conveniência, faça revogações periódicas no Permission Manager e nunca deixe aprovações infinitas em contratos que você não usa há mais de 30 dias.',
    severity: 'warning',
  },
  {
    scenario: 'setApprovalForAll em coleção BAYC para OpenSea',
    explanation:
      'setApprovalForAll concede ao OpenSea controle sobre TODOS os seus Bored Appts — não apenas um. Se a OpenSea for comprometida ou se um atacante encontrar uma vulnerabilidade no contrato de marketplace, ele poderá transferir toda a sua coleção em uma única transação, sem necessidade de nova aprovação. Este é um dos vetores de ataque mais comuns em NFTs.',
    recommendation:
      'Revogue imediatamente após listar/vender. Considere usar marketplaces que suportam aprovações por-item (como Blur V2) ou aguardar listagens pontuais. Nunca mantenha setApprovalForAll ativo em uma coleção se você não está ativamente negociando.',
    severity: 'critical',
  },
  {
    scenario: 'Recebimento de token SAFEBOOST (honeypot)',
    explanation:
      'A GoPlus Security API identificou este token como honeypot: a função de venda está bloqueada no contrato. Isso significa que você pode comprar e receber o token, mas nunca poderá vendê-lo. O padrão típico é: o atacante cria um token, infla o preço via wash trading, atrai compradores e, quando tentam vender, descobrem que é impossível. O token fica travado na sua carteira sem valor real.',
    recommendation:
      'Recebimento bloqueado automaticamente. Não interaja com este contrato em hipótese alguma. Se você já comprou antes do bloqueio, considere o valor perdido — não tente recuperá-lo enviando mais fundos. Adicione o contrato à blocklist manual para evitar futuras tentativas.',
    severity: 'critical',
  },
  {
    scenario: 'Conexão com site metarnask-login.com',
    explanation:
      'Este domínio imita a MetaMask ("metarnask" em vez de "metamask") — técnica conhecida como typosquatting. O objetivo é fazer você digitar sua seed phrase em um formulário falso. Uma vez capturada, os atacantes drenam sua carteira em segundos. O domínio também foi registrado recentemente, padrão clássico de phishing: domínios legítimos geralmente têm anos de histórico.',
    recommendation:
      'Conexão bloqueada. NUNCA digite sua seed phrase em nenhum site — a MetaMask legítima nunca pede isso. Se você já acessou este site, bloqueie a carteira imediatamente, considere migrar para uma nova carteira via Lockdown Nível 4 e mova todos os fundos.',
    severity: 'critical',
  },
  {
    scenario: 'Swap de 0.5 ETH para USDC no Uniswap V3',
    explanation:
      'Transação de swap padrão em DEX verificado. O contrato Uniswap V3 é open-source, auditado múltiplas vezes, com mais de 2 anos de operação sem incidentes. A simulação eth_call retornou sucesso — a transação não reverte. As permissões solicitadas são apenas as necessárias para esta operação pontual.',
    recommendation:
      'Transação segura para assinar. Certifique-se de revisar o valor e o destinatário. Após o swap, considere revogar a aprovação se não planeja fazer mais operações em breve.',
    severity: 'safe',
  },
]

export function AssistantView() {
  const { isProTier, setProTier } = useWallet()
  const [selected, setSelected] = useState<RiskExplanation | null>(SAMPLE_SCENARIOS[0])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)

  if (!isProTier) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            AI Security Assistant
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explica riscos em linguagem simples — reduz erros de usuários menos experientes.
          </p>
        </div>

        <Card className="border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-card">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Sparkles className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">Recurso PRO</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              O AI Security Assistant traduz riscos técnicos em linguagem natural.
              Ele explica o que cada contrato pode fazer, quais permissões estão sendo concedidas
              e o que pode dar errado — antes de você assinar.
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

  const askQuestion = async () => {
    if (!question.trim()) return
    setLoading(true)
    setAnswer(null)
    // Simulated AI response — in production, would call OpenAI/Anthropic
    setTimeout(() => {
      setAnswer(
        'Baseado na sua pergunta, identifiquei alguns pontos importantes:\n\n' +
        '1. A transação envolve um contrato não verificado — recomenda-se cautela.\n' +
        '2. As permissões solicitadas incluem approve, que concede ao spender controle sobre seus tokens.\n' +
        '3. Simulação eth_call mostrou que a transação não reverte, mas isso não significa que é segura.\n\n' +
        'Recomendação: não assine sem revisar o contrato no Scanner de Contratos primeiro.'
      )
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-400" />
          AI Security Assistant
          <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400 gap-1">
            <Crown className="h-2.5 w-2.5" /> PRO
          </Badge>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explica riscos em linguagem simples — antes de você assinar qualquer transação.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Sample scenarios */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cenários comuns</CardTitle>
              <p className="text-xs text-muted-foreground">Clique para ver a explicação do assistente</p>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {SAMPLE_SCENARIOS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setSelected(s); setAnswer(null) }}
                  className={cn(
                    'w-full text-left rounded-lg border p-2.5 transition-all',
                    selected === s
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {s.severity === 'safe' ? (
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                    ) : s.severity === 'warning' ? (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400" />
                    )}
                    <p className="text-xs font-medium">{s.scenario}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Ask question */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-emerald-400" /> Pergunte ao assistente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: É seguro aprovar este contrato? O que pode dar errado?"
                className="w-full rounded-lg border border-border/60 bg-muted/30 p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 min-h-[80px]"
              />
              <Button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Analisando…' : 'Perguntar'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Answer panel */}
        <div className="space-y-3">
          {selected && !answer && (
            <Card className={cn(
              'border-2',
              selected.severity === 'safe' && 'border-emerald-500/30',
              selected.severity === 'warning' && 'border-amber-500/30',
              selected.severity === 'critical' && 'border-red-500/30',
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                    selected.severity === 'safe' && 'bg-emerald-500/10 text-emerald-400',
                    selected.severity === 'warning' && 'bg-amber-500/10 text-amber-400',
                    selected.severity === 'critical' && 'bg-red-500/10 text-red-400',
                  )}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{selected.scenario}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Análise do AI Security Assistant</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">O que está acontecendo</p>
                  <p className="text-xs text-foreground/90 leading-relaxed">{selected.explanation}</p>
                </div>
                <div className={cn(
                  'rounded-lg border p-3',
                  selected.severity === 'safe' && 'border-emerald-500/30 bg-emerald-500/5',
                  selected.severity === 'warning' && 'border-amber-500/30 bg-amber-500/5',
                  selected.severity === 'critical' && 'border-red-500/30 bg-red-500/5',
                )}>
                  <p className={cn(
                    'text-[10px] uppercase tracking-wider font-semibold mb-1.5',
                    selected.severity === 'safe' && 'text-emerald-400',
                    selected.severity === 'warning' && 'text-amber-400',
                    selected.severity === 'critical' && 'text-red-400',
                  )}>Recomendação</p>
                  <p className="text-xs text-foreground/90 leading-relaxed">{selected.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {answer && (
            <Card className="border-2 border-emerald-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-emerald-400" /> Resposta do assistente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">{answer}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
