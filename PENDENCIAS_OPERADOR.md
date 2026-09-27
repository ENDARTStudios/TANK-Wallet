# PENDENCIAS_OPERADOR.md

> Fila de ações manuais do Operador — bloqueios que não podem ser
> automatizados. Formatado conforme Seção 7 do `PROTOCOLO_MESTRE.md`.
>
> Mantenedor: Doer (adiciona itens)
> Resolve: Operador (responde "feito o item Nº X")

---

### [1] Ativar GitHub Security Advisories
Por quê: Permite que pesquisadores reportem vulnerabilidades diretamente pelo GitHub, de forma privada e rastreada.
Onde: GitHub → aba "Security" do repositório → "Advisories"
Passo a passo:
1. Acesse o repositório no GitHub
2. Clique na aba "Security"
3. No menu lateral, clique em "Advisories"
4. Clique em "Enable security advisories" (ou "Ativar avisos de segurança")
5. Confirme a ativação
Como saber que deu certo: A página de Advisories mostra "Enabled" e permite criar novos advisories
Depois de feito: responda "feito o item Nº 1"

### [2] Guardar chave privada PGP com segurança
Por quê: A chave privada PGP é usada para descriptografar reports de vulnerabilidade enviados por pesquisadores. Se perdida, reports ficam inacessíveis.
Onde: Computador pessoal do Operador (NUNCA no repositório)
Passo a passo:
1. A chave privada foi gerada pelo Doer e está disponível temporariamente neste ambiente
2. Exporte a chave privada: `gpg --export-secret-keys "Tank Wallet Security" > tank-wallet-sec-private.key`
3. Guarde o arquivo `tank-wallet-sec-private.key` em local seguro (pen drive criptografado, gerenciador de senhas, ou 1Password/Bitwarden)
4. Delete o arquivo do computador após guardar: `shred -u tank-wallet-sec-private.key`
5. A chave pública já está commitada em `docs/05-security-compliance/security/pgp-key.asc` — não é sensível
Como saber que deu certo: Você consegue importar a chave privada em outro computador com `gpg --import tank-wallet-sec-private.key` e ela mostra "Tank Wallet Security"
Depois de feito: responda "feito o item Nº 2"

### [3] Criar conta e lançar bug bounty no Immunefi
Por quê: O bug bounty público permite que pesquisadores encontrem vulnerabilidades por recompensa. É a principal camada de validação externa gratuita.
Onde: https://immunefi.com/
Passo a passo: ver `docs/05-security-compliance/security/bug-bounty-launch-guide.md` (guia completo)
Como saber que deu certo: O programa aparece em https://immunefi.com/bounty/tankwallet
Depois de feito: responda "feito o item Nº 3"

---

<!-- Novas pendências são adicionadas acima deste comentário:
### [Nº] Título curto
Por quê: <1 frase, sem jargão>
Onde: <nome exato do site/app, com link>
Passo a passo:
1. ...
Como saber que deu certo: <o que aparece na tela>
Depois de feito: responda "feito o item Nº X"
-->

### [PEND-AUDIT] Escolher audit firm + aprovar orcamento + assinar engagement letter
Por que: pacote pronto em docs/05-security-compliance/audit-package/ (T085). Seguir docs/05-security-compliance/audit-package/CONTACT-RUNBOOK.md. Decisao de negocio (orcamento/contrato), fora do ciclo simbiotico.

### [4] Decidir: SSO em Production e intencional? + status DNS tankwallet.dev
Por quê: Produção e previews estão atrás de Vercel Authentication (login SSO) — público externo não carrega o app; isso invalida qualquer medição de produção e bloqueia a ativação do CSP enforcing (T087/T092).
Onde: Vercel dashboard → projeto tank-wallet → Settings → Deployment Protection; provedor DNS do domínio.
Passo a passo:
1. Informar se o SSO em Production é intencional (gate pré-lançamento) ou misconfiguração.
2. Se misconfiguração: restringir proteção a Preview e liberar Production.
3. Informar status do DNS tankwallet.dev (não resolve; configurar ou confirmar descarte).
Como saber que deu certo: curl público em produção retorna o app (não "Login - Vercel"); tankwallet.dev resolve ou decisão de descarte registrada.
Depois de feito: responda "feito o item Nº 4".

### [5] Fornecer meio de diagnóstico atrás do SSO (bypass) — sem colar segredo no chat
Por quê: Separar H1 (build antigo) de H2 (middleware não compila) exige ler headers do app atrás do muro SSO (T092).
Onde: Vercel dashboard → projeto tank-wallet → Settings → Deployment Protection → Bypass.
Passo a passo (SEM colar o token no chat):
1. Com o header x-vercel-protection-bypass, rodar: GET / e GET /terms no preview do PR #65/#67 e anotar APENAS presença/ausência de: x-csp-nonce, Reporting-Endpoints, Content-Security-Policy-Report-Only.
2. Devolver só o resultado redigido (ex.: "preview T086: nonce AUSENTE").
Alternativa sem token: autorizar o Doer a ler via sessão CLI vinculada (sem exibir valores).
Como saber que deu certo: resposta redigida permite fechar H1/H2 e retomar T087.
Depois de feito: responda "feito o item Nº 5".

### [PEND-VERCEL-QUOTA] RESOLVIDA (transitória — não requer ação)
Quota 402 api-deployments-free-per-day estourou em 2026-09-26 e resetou no dia seguinte (previews dos PRs #67/#68 deployaram). Nenhuma ação do Operador. Se recursar, vira decisão de custo (upgrade Hobby→Pro).

