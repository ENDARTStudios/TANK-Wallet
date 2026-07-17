# DECISOES.md

> Registro de todas as decisões técnicas e de produto do projeto.
> Formatado conforme Seção 5 do `PROTOCOLO_MESTRE.md`.
>
> Mantenedor: Doer (registra) + Thinker (decide)
> Atualiza quando: toda nova decisão do Thinker ou resposta do Discovery.

---

## Discovery

> Respostas definitivas confirmadas pelo Operador em 2026-07-16.
> Substituem as versões preliminares registradas anteriormente.

### [2026-07-16] Decisão: Discovery — O que é o projeto
**Resposta:** Zero Trust Security Platform — plataforma autocustodial de segurança para ativos digitais que implementa defesa preventiva, análise de risco em tempo real e soberania do usuário sobre suas chaves e permissões. O Security Kernel orquestra 16 engines em pipeline de 12 estágios antes de qualquer assinatura, produzindo evidence chain verificável e reproduzível.
Motivo: Diferencial competitivo absoluto — carteiras tradicionais (MetaMask, Phantom, Rabby) focam em armazenar e assinar; nenhuma oferece pipeline de decisão preventiva com evidence chain. A Tank Wallet é uma camada de segurança que acontece antes da assinatura, não depois.
Alternativas consideradas: Hot wallet convencional com plugins de segurança (descartada — segurança não pode ser plugin, tem que ser arquitetura).

### [2026-07-16] Decisão: Discovery — Quem vai usar
**Resposta:** Três perfis com escalonamento claro:

| Plano | Público | Preço | Pilares |
|-------|---------|-------|---------|
| Free | Usuários individuais, iniciantes em cripto | US$ 0 | Todos os engines de segurança sem restrição; serviços contínuos limitados; swap com taxa 0,20% |
| PRO | Investidores e usuários avançados que movimentam valores significativos | US$ 19,99/mês | Continuous Protection (Behavioral AI, Fortress, monitoramento 24/7); Smart Access (Passkeys, biometria, Smart Recovery); Smart Accounts (ERC-4337, Session Keys, Spending Limits); Privacy (RPC Quorum, Private Broadcast); zero swap fee |
| Enterprise Starter | Empresas pequenas, DAOs | US$ 499/mês | MPC, HSM Cloud, RBAC, SSO, SCIM, API, até 10 usuários |
| Enterprise Business | Empresas médias, instituições | US$ 1.499/mês | Usuários ilimitados, múltiplos HSMs, SIEM avançado, SOC2, SLA 99,9% |
| Enterprise Custom | Grandes instituições, bancos | Sob consulta | HSM dedicado, on-premises, ISO 27001, SLA 24×7 |

Estimativa de lançamento: não definida formalmente, mas o produto está pronto tecnicamente (AUDIT_READY).
Motivo: Monetização em camadas — segurança é grátis para todos (diferencial competitivo), mas proteção contínua, privacidade e features avançadas são pagas. Enterprise atende demanda institucional por compliance e SLA.
Alternativas consideradas: Modelo totalmente gratuito com monetização por swap (descartada — não sustenta operação de segurança 24/7); modelo pago apenas (descartada — limita adoção e rede de proteção colaborativa).

### [2026-07-16] Decisão: Discovery — Referência existente
**Resposta:** Carteiras tradicionais como MetaMask, Phantom e Rabby servem como referência de UX e fluxo de interação, mas nenhuma oferece o que a Tank Wallet propõe. A diferença fundamental:
- MetaMask/Phantom/Rabby: usuário assina → transação vai → se deu errado, perdeu.
- Tank Wallet: usuário pede para assinar → Kernel analisa com 16 engines → se perigoso, bloqueia com evidence → se seguro, permite com verificação.

O conceito mais próximo no mercado é o de "firewall de transações" (como o Pocket Universe ou Blowfish), mas esses são produtos separados que se conectam a carteiras existentes. A Tank Wallet integra a segurança na própria carteira — não é um add-on, é a arquitetura.
Motivo: Nenhuma carteira do mercado oferece pipeline de decisão preventiva com evidence chain verificável integrado nativamente. O posicionamento "Zero Trust Security Platform" é único.
Alternativas consideradas: Posicionar como "carteira com segurança extra" (descartada — diminui o diferencial); posicionar como firewall de transações standalone (descartada — perde a vantagem da custódia integrada).

### [2026-07-16] Decisão: Discovery — Login, pagamento, dado sensível
**Resposta:** Sim para login, pagamento e dado sensível. Não para upload de arquivo.

**Login:**
- Free: senha + biometria (WebAuthn Platform Authenticator).
- PRO: Passkeys (WebAuthn cross-device), biometria, Smart Recovery.
- Enterprise: SSO (SAML/OIDC), SCIM, RBAC.

**Pagamento:**
- Free: taxa de swap 0,20% por transação.
- PRO: assinatura mensal US$ 19,99, zero taxa de swap.
- Enterprise: assinatura mensal US$ 499–1.499+, com SLA e features institucionais.

**Dado sensível — NÍVEL MÁXIMO:**
- Chaves privadas (AES-256-GCM vault, PBKDF2 250k iterações, SecureBuffer com zeroização).
- Mnemonic BIP-39 (nunca em texto plano, nunca logada, nunca em DB).
- Endereços de carteira (considerados PII — mascarados em logs).
- Transações (calldata analisado para PII, state diff estruturado).
- Behavior profiles (horários típicos, chains típicas, valores típicos — em Prisma SQLite local).
- Permissões ERC-20/721/1155 (allowances infinitos = risco crítico).
- Audit log (HMAC chain tamper-evident — modificação detectável).

**Upload de arquivo:** não aplicável. A carteira não recebe uploads de usuário. O único "arquivo" é o vault criptografado em localStorage, que é gerado internamente.

Motivo: Produto de segurança financeira autocustodial. Perda de chave = perda de fundos. Nível de sensibilidade justifica: AES-256-GCM, PBKDF2 250k, HMAC chain, SecureBuffer zeroização, PII sanitization em logger e Sentry, e a arquitetura completa de 16 engines de segurança.
Alternativas consideradas: Custodial (descartada — o usuário deve ter soberania total sobre suas chaves); semi-custodial com HSM (apenas Enterprise tier, não para Free/PRO).

### [2026-07-16] Decisão: Discovery — Prazo
**Resposta:** Nenhum prazo formal definido. O status atual é AUDIT_READY (Overall Confidence 71%, `bun run verify` APPROVED com 11/11 gates). O bloqueio para GA é exclusivamente externo: auditorias de segurança independentes (Audit #1 crypto, Audit #2 engines), pentests (Pentest #1 frontend/API, Pentest #2 infra/supply chain), e lançamento de bug bounty público (Immunefi).

A parte técnica está completa. Não há tarefa de código pendente sem violar o Architecture Freeze 1.0.0. O Doer está em standby ativo, aguardando findings de auditoria para corrigir.
Motivo: Produto de segurança financeira não pode ir para GA sem validação externa. É uma decisão de governança, não de engenharia.
Alternativas consideradas: Lançar sem auditorias (descartada — risco reputacional e legal inaceitável para produto financeiro); lançar apenas para beta fechado sem auditorias (possível, mas Security Assurance permaneceria em 5%, limitando a credibilidade).

### [2026-07-16] Decisão: Discovery — Nome, domínio, marca
**Resposta:**
- **Nome**: Tank Wallet — confirmado e estabelecido em toda documentação, UI, e governança.
- **Domínio**: não definido. Pendente registro pelo Operador.
- **Marca visual**: não definida. O produto usa atualmente tema dark com paleta emerald (verde) como cor de segurança, mas não há identidade visual formal (logo profissional, guidelines de marca, etc.).
- **Copyright**: END ART Studios (confirmado no arquivo `LICENSE`).
- **Contato comercial**: endart.studios@gmail.com (confirmado no arquivo `NOTICE`).

Motivo: Nome já estabelecido e consistente. Domínio e marca exigem investimento e decisão externa — não bloqueiam o desenvolvimento técnico, mas são necessários antes do deploy público.
Alternativas consideradas: Nenhum nome alternativo foi considerado — Tank Wallet foi o nome escolhido desde o início do projeto.

### [2026-07-16] Decisão: Discovery — Definição de "pronto"
**Resposta:** O projeto é considerado "pronto" (GA) quando **todos** os seguintes critérios são atendidos simultaneamente:

1. **Release Decision: READY_FOR_GA** — 17/17 hard gates aprovados automaticamente via `bun run metrics`, incluindo:
   - Audit #1 completada sem criticals.
   - Audit #2 completada sem criticals.
   - Pentest #1 completado sem criticals.
   - Pentest #2 completado sem criticals.
   - Bug bounty público ativo por ≥90 dias sem criticals abertos.
   - SECURITY.md publicado.
   - Incident Response runbook testado.
2. **Overall Confidence ≥ 75%** — medido por `bun run metrics`, reproduzível, com SHA-256 assinado.
3. **Security Assurance ≥ 80%** — auditorias externas elevam Assurance de 5% para ≥80%.
4. **`bun run verify` APPROVED** — todos os 11 gates passando (lint, typecheck, tests, conformance, metrics, audit, enforce, SBOM, secrets-scan, dependency-scan, signature-verify).
5. **Deploy em produção** — confirmado pelo Operador acessando a URL real.
6. **MANUAL_DO_OPERADOR.md entregue** — com instruções em linguagem simples: como saber se está no ar, o que fazer se parar de funcionar, como pedir alteração futura.

A decisão de release é **automática e baseada em evidência** — não há aprovação manual subjetiva. Quando os hard gates passam, o sistema declara READY_FOR_GA.
Motivo: Produto de segurança financeira exige validação externa, evidência reproduzível, e processo automático de decisão. Não pode depender de "achar que está pronto" — precisa ser mensurado e verificado.
Alternativas consideradas: Aprovação manual por comitê (descartada — subjetiva e não reproduzível); GA sem auditorias (descartada — risco inaceitável).

---

## Decisões técnicas (espelho de .ai/decisions/DECISION_LOG.md)

> As 12 decisões operacionais (D-001 a D-012) e 10 ADRs (ADR-001 a ADR-010)
> continuam registradas integralmente em `.ai/decisions/DECISION_LOG.md` e
> `.ai/decisions/ARCHITECTURE_DECISIONS.md`. Este arquivo é o ponto de
> entrada do protocolo v2.0; os arquivos em `.ai/` são a fonte canônica
> detalhada.

### Resumo das decisões ativas

| ID | Título | Status |
|----|--------|--------|
| D-001 | Architecture Freeze 1.0 | Accepted |
| D-002 | Security Evidence como 3ª dimensão | Accepted |
| D-003 | Release Decision via Hard Gates | Accepted |
| D-004 | Modelo de 3 estados por check | Accepted |
| D-005 | Zero percentuais hardcoded | Accepted |
| D-006 | Pesos configuráveis via config/kpi-weights.json | Accepted |
| D-007 | Histórico imutável em reports/history/ | Accepted |
| D-008 | SHA-256 do report para integridade | Accepted |
| D-009 | Governance layer .ai/ como memória operacional | Accepted |
| D-010 | Refatoração estrutural da governança .ai/ | Accepted |
| D-011 | Finalização da baseline de governança (9 documentos) | Accepted |
| D-012 | Governance as Code (enforcement automático) | Accepted |

### ADRs ativos

| ID | Título | Status |
|----|--------|--------|
| ADR-001 | Security Kernel como orquestrador único | Accepted |
| ADR-002 | Security Event Bus tipado | Accepted |
| ADR-003 | SecurityEngine interface | Accepted |
| ADR-004 | ChainPlugin Interface (apiVersion 1.0) | Accepted |
| ADR-005 | Unified Data Model (15 objetos centrais) | Accepted |
| ADR-006 | Tank Security Standard (TSS) — 10 specs | Accepted |
| ADR-007 | Tank Security Framework (TSF) — 7 domínios | Accepted |
| ADR-008 | Decision Engine evidence-based | Accepted |
| ADR-009 | Security Governance Layer (7 registries) | Accepted |
| ADR-010 | Architecture Contracts (15 contratos imutáveis) | Accepted |

---

<!-- Novas decisões são adicionadas abaixo neste formato:
## [YYYY-MM-DD] Decisão: <o quê>
Motivo: <por quê>
Alternativas consideradas: <se houver>
-->

## [2026-07-17] Decisão: D-013 — Camadas de segurança gratuitas em vez de auditoria paga
Motivo: Operador confirmou que não há orçamento para auditorias externas pagas. Thinker propôs empilhar todas as camadas gratuitas disponíveis (Slither, Mythril, Echidna, Foundry, Trail of Bits tools, CodeQL, Semgrep, Gitleaks, Trivy, OWASP ZAP, bug bounty público) como alternativa. Isso não substitui o selo de uma firma reconhecida, mas maximiza a confiança alcançável sem orçamento.
Alternativas consideradas: Auditoria paga (descartada — sem orçamento); lançar sem nenhuma validação externa (descartada — risco inaceitável); esperar por orçamento futuro (descartada — opera em paralelo com camadas gratuitas).
