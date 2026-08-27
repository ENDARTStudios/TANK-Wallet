# TANK Wallet — Product Requirements Document (PRD)

> Version: 1.0 · Status: Living · Dono: ENDARTStudios · Última revisão: 2026-08-25

## 1. Visão

**Produto:** A hot wallet construída para **nunca assinar uma transação perigosa**.

**Proposta de valor:** Em vez de executar transações, o TANK Wallet age como uma barreira ativa de segurança. Nenhum token, contrato ou DApp é confiável por padrão — tudo passa por inspeção, simulação e classificação de risco antes de qualquer interação.

**Tagline:** `ZERO TRUST SECURITY` — "The hot wallet built to never sign a dangerous transaction."

## 2. Público-alvo

| Persona | Perfil | Necessidade principal |
| --- | --- | --- |
| Usuário retail | Pessoa que opera DeFi sozinho | Proteção sem perder funcionalidade; revogação rápida |
| Operador diligente | Airdrops, alphas, novas DEX | Deteção de tokens scam / DApp phishing antes de assinar |
| Equipe Enterprise | Tesouraria / DAO / instituição | Multi-user, RBAC, HSM/MPC, SLA, audit |

## 3. Objetivos de produto

1. **R1 — Prevenção ativa de risco** (objetivo nº 1): reduzir a probabilidade de o usuário perder fundos por uma assinatura maliciosa.
2. **R2 — Soberania plena:** toda permissão concedida é audível e revogável a qualquer momento.
3. **R3 — Segurança por default:** postura conservadora — sem verificação, sem operação.
4. **R4 — Observabilidade:** toda falha crítica é compreensível, rastreável e atribuída.
5. **R5 — Monetização em camadas:** Free → PRO → Enterprise com recursos proporcionais.

## 4. Não-objetivos (fora de escopo)

- Não somos custodial: o servidor nunca guarda a chave privada do usuário.
- Não somos exchange; troca (swap) é futuro, com taxa 0,20% (Free) / 0% (PRO).
- Não garantimos proteção contra MITM de rede apenas por defesa própria.
- Não substituímos auditoria externa de contrato; oferecemos scan heurístico + APIs.

## 5. Escopo funcional (por fase)

| Fase | Módulo | Estado |
| --- | --- | --- |
| 1 | Fundação criptográfica: BIP-39/32/44, SLIP-0010, vault AES-GCM | Entregue |
| 2 | Soberania: ERC-20/NFT approvals, sessões, lockdown, scanner, DApp Shield, WHOIS | Entregue |
| 3 | Identidade de marca + UX (dashboard, health, timeline, AI assistant) | Entregue |
| 4 | Threat Intelligence Backend (Prisma/SQLite: tokens, sites, endereços, exploits) | Em curso |
| 5 | Broadcast + indexer (eth_sendRawTransaction, Alchemy/Infura) | Planejado |
| 6 | Assinaturas completas (PSBT, Solana, EIP-712, EIP-6963) | Planejado |
| 7 | Recuperação social (k-of-n) | Planejado |
| 8 | Engine de IA/detecção comportamental (BehaviorProfile/Anomaly) | Planejado |
| 9 | RBAC administrativo + catálogo de apps + feature flags (plataforma) | Planejado |
| 10 | Observabilidade ligada (Sentry/OTel) + E2E Playwright + deploy gate | Planejado |

## 6. Requisitos

### 6.1 Segurança
- **FR-SEC-01:** Toda assinatura exige simulação + detecção de calldata perigosa (delegatecall, selfdestruct, approve infinito, setApprovalForAll, Permit2).
- **FR-SEC-02:** Conexão de DApp passa por 7 verificações (blocklist, typosquatting, SSL, WHOIS/RDAP, reputação, subdomínio, TLD).
- **FR-SEC-03:** Lockdown em 4 níveis (L1 bloquear → L4 migrar) executável a qualquer momento.
- **FR-SEC-04:** Log imutável de todos os eventos de permissão (grant/revoke/expiry/use).
- **FR-SEC-05:** [novo] Rate limiting em todas as rotas /api + proteção anti-bot (modo WAF) + HSTS full/strict.
- **FR-SEC-06:** [novo] RBAC com matriz de níveis (ver `docs/RBAC.md`).
- **FR-SEC-07:** [novo] Segregação de dados por usuário/empresa via RLS (ver `docs/RLS.md`).

### 6.2 UX / Motion
- **FR-UX-01:** Todo elemento tem skeleton, lazy loading e animações suaves de entrada/saída/carregamento/progresso (skill Motion Principles).
- **FR-UX-02:** Responsivo sem overflow horizontal em 375 / 390 / 768 px; teclado não cobre o formulário.
- **FR-UX-03:** Acessibilidade: contraste AA, foco visível, ARIA, navegação por teclado.
- **FR-UX-04:** Feedback de progresso em toda ação assíncrona (scan, lockdown, envio).

### 6.3 Plataforma
- **FR-PLT-01:** [novo] Catálogo de apps/features com feature flags por tier e feature (ver `docs/ARCHITECTURE-MODULES.md`).
- **FR-PLT-02:** [novo] Observabilidade ligada: Sentry + OpenTelemetry + error boundary (ver `docs/OBSERVABILITY.md`).
- **FR-PLT-03:** [novo] Suíte de testes unit/integração/E2E com gate de cobertura (ver `docs/TESTING.md`).
- **FR-PLT-04:** [novo] Gerenciamento de secrets via `.env` fora do git + variáveis de ambiente (ver `docs/SECRETS.md`).

## 7. Critérios de aceitação (exemplos)

- **AC-01 (rate limit):** uma rota `/api` sob 100 req/s do mesmo cliente retorna `429` com `Retry-After`; teste E2E comprova.
- **AC-02 (HSTS):** resposta em HTTPS contém `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
- **AC-03 (RBAC):** um usuário `viewer` não consegue chamar uma rota admin; teste de segurança falha caso passe.
- **AC-04 (skeleton):** toda seção do dashboard exibe skeleton antes dos dados; Playwright asserete.

## 8. Métricas de sucesso

- **Relevância:** redução de danos — sinais de risco detectados/bloqueados antes da assinatura.
- **Retenção PRO:** conversão Free → PRO.
- **Observabilidade:** toda falha crítica tem 1 alerta.
- **Performance:** Core Web Vitals no padrão (LCP < 2.5s, CLS < 0.1).
- **Segurança:** 0 crítico aberto no deploy gate; 0 segredo versionado.

## 9. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| `.env` versionado no git | CRÍTICO | Remover do git + rota de rotação (SPRINT-1) |
| Chave PGP privada no repo | ALTO | Remover + rodar (SPRINT-1) |
| Observabilidade não ligada (Sentry/OTel no-op) | ALTO | `instrumentation.ts` + DSN (SPRINT-2) |
| SQLite não suporta RLS nativo | MÉDIO | Migrar para Postgres quando multi-tenant (SPRINT-4) |
| Mudar UX sem E2E regressão | MÉDIO | Playwright + gate de cobertura (SPRINT-3) |

## 10. Roadmap curto (em prioridade)

1. **SPRINT-1:** Segurança comprometida do repo (`.env` + PGP) — maior impacto, menor complexidade.
2. **SPRINT-2:** Observabilidade ligada (Sentry/OTel/instrumentação) + error boundaries.
3. **SPRINT-3:** E2E Playwright + gate de cobertura.
4. **SPRINT-4:** Segmentação de plataforma (catálogo de apps, flags, RBAC, rate-limit, WAF, HSTS) + avaliar Postgres.

## 11. Open (no issues backlog)

- Todo item `[novo]` vira issue + PR (ver `docs/ISSUES-BACKLOG.md`).
- Padrão de gestão (Issues → PRs → Motion → Skills) definido em `AGENTS.md`.
