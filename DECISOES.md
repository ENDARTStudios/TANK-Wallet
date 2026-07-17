# DECISOES.md

> Registro de todas as decisões técnicas e de produto do projeto.
> Formatado conforme Seção 5 do `PROTOCOLO_MESTRE.md`.
>
> Mantenedor: Doer (registra) + Thinker (decide)
> Atualiza quando: toda nova decisão do Thinker ou resposta do Discovery.

---

## Discovery

> Respostas extraídas do histórico de conversas (Sprints 4–5+1) e
> formalizadas em conformidade com a Seção 4 do PROTOCOLO_MESTRE.md.

### [2026-07-16] Decisão: Discovery — O que é o projeto
**Resposta:** Plataforma autocustodial de segurança para ativos digitais que analisa riscos, simula operações e aplica políticas de segurança antes de autorizar qualquer transação.
Motivo: Diferencial competitivo — carteiras tradicionais executam transações; a Tank Wallet previne transações perigosas.

### [2026-07-16] Decisão: Discovery — Quem vai usar
**Resposta:** Três perfis:
- Free (US$ 0): usuários individuais, proteção inteligente para uso diário.
- PRO (US$ 19,99/mês): investidores e usuários avançados, continuous protection + smart access + smart accounts + privacy.
- Enterprise (US$ 499–1.499/mês + custom): empresas, DAOs, instituições — MPC, HSM, RBAC, SSO, SCIM, API, SLA.
Motivo: Monetização em camadas, diferencial de segurança para cada tier.

### [2026-07-16] Decisão: Discovery — Referência existente
**Resposta:** Carteiras tradicionais (MetaMask, Phantom) focam em armazenar e assinar. A Tank diferencia-se por ser uma camada de segurança preventiva antes da assinatura — Security Kernel que orquestra 16 engines em pipeline de 12 estágios.
Motivo: Nenhuma carteira do mercado oferece pipeline de decisão preventiva com evidence chain verificável.

### [2026-07-16] Decisão: Discovery — Login, pagamento, dado sensível
**Resposta:** Sim para todos:
- Login: Passkeys/WebAuthn (PRO), senha + biometria (Free).
- Pagamento: assinaturas recorrentes (PRO, Enterprise).
- Dado sensível: NÍVEL MÁXIMO — chaves privadas (AES-256-GCM vault), mnemonic (BIP-39), endereços de carteira, transações, behavior profiles.
Motivo: Produto de segurança financeira autocustodial — perda de chave = perda de fundos.

### [2026-07-16] Decisão: Discovery — Prazo
**Resposta:** Não definido formalmente. Status atual: AUDIT_READY, aguardando auditorias externas (Audit #1 crypto, Audit #2 engines, Pentest #1 frontend/API, Pentest #2 infra).
Motivo: O código está pronto; o bloqueio é externo (validação por terceiros).

### [2026-07-16] Decisão: Discovery — Nome, domínio, marca
**Resposta:** Nome definido: Tank Wallet. Domínio e marca visual ainda não definidos — pendente decisão do Operador.
Motivo: Nome já estabelecido em toda documentação e UI. Domínio/marca exigem registro externo.

### [2026-07-16] Decisão: Discovery — Definição de "pronto"
**Resposta:** Release Decision: READY_FOR_GA, com:
- 17/17 hard gates aprovados (auditorias concluídas, bug bounty público sem críticos por 90 dias).
- Overall Confidence ≥ 75%.
- Security Assurance ≥ 80%.
- Deploy em produção confirmado pelo Operador.
- MANUAL_DO_OPERADOR.md entregue.
Motivo: Produto de segurança financeira exige validação externa antes de GA.

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
