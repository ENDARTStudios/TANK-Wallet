# PRD — Product Requirements Document

> **Tipo:** Produto · **Versão:** 1.2.1 · **Atualizado:** 2026-09-23 · **Dono:** ENDARTStudios
> **Documento canônico completo:** [`../PRD.md`](../PRD.md) (raiz). Este arquivo é a visão viva em `docs/` e deve acompanhar cada release.

## 1. Visão

**Produto:** a hot wallet construída para **nunca assinar uma transação perigosa**.

**Tagline:** `ZERO TRUST SECURITY` — "The hot wallet built to never sign a dangerous transaction."

**Proposta de valor:** em vez de executar transações, o TANK Wallet é uma barreira ativa de segurança. Nenhum token, contrato ou DApp é confiável por padrão — tudo passa por inspeção, simulação e classificação de risco antes de qualquer interação.

## 2. Objetivos de produto

| ID | Objetivo | Medida |
| --- | --- | --- |
| R1 | Prevenção ativa de risco (objetivo nº 1) | Sinais de risco detectados/bloqueados antes da assinatura |
| R2 | Soberania plena | Toda permissão é audível e revogável a qualquer momento |
| R3 | Segurança por default | Sem verificação, sem operação |
| R4 | Observabilidade | Toda falha crítica tem 1 alerta, 1 traceId, 1 dono |
| R5 | Monetização em camadas | Conversão Free → PRO → Enterprise |

## 3. Não-objetivos

- Não somos custodial: o servidor nunca guarda a chave privada do usuário.
- Não somos exchange; swap é futuro (taxa 0,20% Free / 0% PRO).
- Não garantimos proteção contra MITM de rede apenas por defesa própria.
- Não substituímos auditoria externa de contrato; oferecemos scan heurístico + APIs.

## 4. Escopo por fase (estado em v1.2.1)

| Fase | Módulo | Estado |
| --- | --- | --- |
| 1 | Fundação criptográfica (BIP-39/32/44, SLIP-0010, vault AES-GCM) | ✅ Entregue |
| 2 | Soberania (approvals, sessões, lockdown L1-L4, scanner, DApp Shield, WHOIS) | ✅ Entregue |
| 3 | Identidade de marca + UX (dashboard, health, timeline, AI assistant) | ✅ Entregue |
| 4 | Threat Intelligence Backend (Prisma: tokens, sites, endereços, exploits) | 🔄 Em curso |
| 5 | Broadcast + indexer (eth_sendRawTransaction, Alchemy/Infura/Helius) | 🔄 Libs implementadas, integração contínua |
| 6 | Assinaturas completas (PSBT, Solana, EIP-712, EIP-6963) | 🔄 Libs implementadas |
| 7 | Recuperação social (k-of-n) | 🔄 Lib implementada |
| 8 | IA comportamental (BehaviorProfile/Anomaly + lockdown ≥80) | 🔄 Lib implementada |
| 9 | RBAC + catálogo de apps + feature flags | ✅ Base entregue (RBAC.md, RLS.md) |
| 10 | Observabilidade ligada + E2E Playwright + deploy gate | ✅ Entregue (Sentry/OTel + 6 specs E2E) |

## 5. Requisitos-chave

### Segurança
- **FR-SEC-01:** toda assinatura exige simulação + detecção de calldata perigosa (delegatecall, selfdestruct, approve infinito, setApprovalForAll, Permit2).
- **FR-SEC-02:** conexão de DApp passa por 7 verificações (blocklist, typosquatting, SSL, WHOIS/RDAP, reputação, subdomínio, TLD).
- **FR-SEC-03:** Lockdown em 4 níveis (L1 bloquear → L4 migrar) executável a qualquer momento.
- **FR-SEC-04:** log imutável de eventos de permissão (HMAC chain tamper-evident).
- **FR-SEC-05:** rate limiting em todas as rotas `/api` + anti-bot (WAF) + HSTS full/strict com preload.
- **FR-SEC-06:** RBAC com matriz de níveis ([RBAC.md](RBAC.md)).
- **FR-SEC-07:** segregação de dados por usuário/empresa via RLS ([RLS.md](RLS.md)).

### UX / Motion
- **FR-UX-01:** todo elemento tem skeleton, lazy loading e animações suaves de entrada/saída/progresso.
- **FR-UX-02:** responsivo sem overflow horizontal em 375 / 390 / 768 px; teclado não cobre formulário.
- **FR-UX-03:** acessibilidade: contraste AA, foco visível, ARIA, navegação por teclado.
- **FR-UX-04:** feedback de progresso em toda ação assíncrona (scan, lockdown, envio).

### Plataforma
- **FR-PLT-01:** catálogo de apps/features com feature flags por tier ([ARCHITECTURE-MODULES.md](ARCHITECTURE-MODULES.md)).
- **FR-PLT-02:** observabilidade ligada: Sentry + OpenTelemetry + error boundary ([OBSERVABILITY.md](OBSERVABILITY.md)).
- **FR-PLT-03:** suíte unit/integração/E2E com gate de cobertura ([TESTING.md](TESTING.md)).
- **FR-PLT-04:** secrets via `.env` fora do git ([SECRETS.md](SECRETS.md)).

## 6. Tiers de monetização

| Recurso | Free | PRO (US$ 19,99/mês) | Enterprise |
| --- | --- | --- | --- |
| Multi-chain (10 redes) + scanners básicos | ✅ | ✅ | ✅ |
| Revogação individual de permissões | ✅ | ✅ | ✅ |
| Taxa de swap | 0,20% | 0% | 0% |
| Lockdown + Modo Paranoico + Revogação em massa | — | ✅ | ✅ |
| Shamir Backup + Undo Center + Auto-Revoke | — | ✅ | ✅ |
| Monitoramento contínuo + AI Risk Engine | — | ✅ | ✅ |
| Multi-user, RBAC, HSM/MPC, SLA, audit | — | — | ✅ |

## 7. Métricas de sucesso

- **Relevância:** redução de danos — sinais de risco detectados/bloqueados antes da assinatura.
- **Retenção PRO:** conversão Free → PRO.
- **Observabilidade:** toda falha crítica com 1 alerta.
- **Performance:** LCP < 2.5s, CLS < 0.1, Lighthouse ≥ 0.9 nas 4 categorias.
- **Segurança:** 0 crítico aberto no deploy gate; 0 segredo versionado.

## 8. Riscos ativos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| SQLite não suporta RLS nativo | Médio | Migrar para Postgres quando multi-tenant (script pronto) |
| E2E com falha de env/setup no CI | Médio | T062 (Sprint 59) — reabilitar 9 testes pulados |
| Auditorias externas pendentes | Alto | Pacote pronto (`docs/audit-package/`); commissionar Audit #1 |
| Bug bounty não lançado | Médio | Launch pós-Audit #1 (Immunefi) |

## 9. Instruções de atualização

1. Toda release atualiza a tabela de fases (§4) e os riscos (§8).
2. Novo requisito funcional recebe ID `FR-<área>-NN` e issue correspondente.
3. Item `[novo]` vira issue + PR (ver `ISSUES-BACKLOG.md`).
4. Mudanças estruturais de visão/tiers exigem revisão do dono (ENDARTStudios).
