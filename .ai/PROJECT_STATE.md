# PROJECT_STATE.md — Memória do Projeto

> Estado atual do Tank Wallet. **Append-only**: nunca apagar histórico.
> Apenas atualizar a seção "atual" ou acrescentar entrada em "histórico".
>
> Status: **Atualizado em 2026-07-15**
> Commit: 8eebfbeff2e8
> Schema: metrics.json v1.1

---

## Atual — Snapshot Corrente

### Arquitetura

**Architecture Frozen 1.0** — congelada, imutável durante a série 1.x.

A Tank Wallet é uma **plataforma autocustodial de segurança para ativos
digitais**, baseada em decisões preventivas, evidências verificáveis e
defesa em profundidade. A carteira é apenas um dos pontos de interação
com o Security Kernel.

### 10 Componentes Congelados

1. Security Kernel — pipeline de 12 estágios (User Action → Chain
   Plugin → Transaction Engine → Simulation → Threat Intel →
   Behavior → Policy → Decision → Signature → Broadcast → Audit →
   Notification).
2. 16 Security Engines (12 implementados + 4 candidatos a Freeze 2.0).
3. Tank Security Standard (TSS) — 10 specs, 80% enforced.
4. Tank Security Framework (TSF) — 7 domínios.
5. Security Governance Layer — 7 registries.
6. Security Event Bus — 16 security events + 9 chain events.
7. Unified Data Model — 15 objetos centrais.
8. ChainPlugin Interface (apiVersion 1.0) — 4 plugins (Ethereum,
   Bitcoin, Solana, Lightning).
9. Architecture Contracts — 15 contratos imutáveis.
10. Decision Engine — evidence-based, com `evidence[]`, `sources[]`,
    `engineScores{}`.

### Módulos Existentes

```
src/
├── app/
│   ├── api/
│   │   ├── goplus/{token,address}/route.ts    # GoPlus proxy (real)
│   │   ├── threats/{exploit,token,address,site,seed}/route.ts
│   │   └── whois/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                                     # shadcn/ui (50+ components)
│   └── wallet/
│       ├── dashboard-view.tsx
│       ├── wallet-context.tsx
│       ├── wallet-{header,sidebar,footer}.tsx
│       ├── send-view.tsx, receive-view.tsx
│       ├── vault-view.tsx, dapps-view.tsx
│       ├── settings-view.tsx, history-view.tsx
│       ├── scanner/scanner-view.tsx
│       ├── onboarding/onboarding.tsx
│       ├── production/{hardening-view,policy-view}.tsx
│       ├── sprint4/sprint4-dashboard.tsx       # SOC Dashboard
│       ├── sovereignty/
│       │   ├── sovereignty-view.tsx
│       │   ├── permissions-view.tsx
│       │   ├── timeline-view.tsx
│       │   ├── lockdown-view.tsx
│       │   ├── assistant-view.tsx
│       │   └── history-view.tsx
│       ├── dashboard/wallet-health-view.tsx
│       └── engines/
│           ├── security-dna-view.tsx
│           ├── behavior-view.tsx
│           ├── recovery-view.tsx
│           └── threat-intel-view.tsx
└── lib/
    ├── db.ts                                   # Prisma client
    ├── utils.ts                                # cn() e utilidades
    ├── wallet-core/                            # Crypto primitives
    │   ├── index.ts                            # BIP-39/32/44, SLIP-10
    │   └── storage.ts                          # AES-256-GCM vault
    ├── wallet-sovereignty/                     # Permissions + Lockdown
    │   └── index.ts
    ├── wallet-evm/                             # EVM provider + signer
    │   └── index.ts                            # multi-RPC failover
    ├── wallet-security-real/                   # Security Kernel
    │   └── index.ts
    ├── wallet-scanner/                         # Smart contract scanner
    │   └── index.ts
    ├── wallet-engines/                         # 12 security engines
    │   ├── audit/
    │   ├── behavior/
    │   ├── key-management/
    │   ├── network/
    │   ├── notification/
    │   ├── permission/
    │   ├── plugin/
    │   ├── policy/
    │   ├── recovery/
    │   ├── simulation/
    │   ├── threat-intel/
    │   └── transaction/
    └── wallet/
        ├── types.ts
        ├── security.ts
        └── data.ts
```

### Módulos Congelados (áreas protegidas)

- `src/lib/wallet-security-real/` (Security Kernel)
- `src/lib/wallet-engines/*/index.ts` (interfaces públicas dos engines)
- `prisma/schema.prisma` (7 registries — adicionar campos é ok, remover
  é breaking)
- `scripts/metrics/_shared.ts` (schema do MetricsReport)
- `config/kpi-weights.json` (pesos — exige 2 approvals)
- `ARCHITECTURE-FREEZE-1.0-BASELINE.md`
- `KPI-FORMULAS.md` (fórmulas e pesos)
- `ENGINEERING-STANDARDS.md` (seções marcadas como contrato)

### Roadmap

| Sprint | Escopo | Status |
|--------|--------|--------|
| Sprint 1 | 100% dados reais, 0% mocks | ✅ Concluído |
| Sprint 2 | 4 chain plugins com pipeline completo | ✅ Concluído |
| Sprint 3 | Conformance Suite (Interface × Operational) | ✅ Concluído |
| Sprint 4 | Production Readiness (CI/CD, SBOM, scanners, signing) | 🔄 Em andamento (13%) |
| Sprint 5 | Auditorias (Audit #1, #2, Pentest, Bug Bounty, SECURITY.md) | 📋 Planejado |

### Fase Atual

**Sprint 4 — Production Readiness**

Foco: eliminar dívida técnica, configurar CI Quality Gates, criar
logger estruturado, commitar crypto vectors, gerar SBOM, integrar
scanners (Semgrep, CodeQL, Trivy, Gitleaks).

### KPIs Atuais

> Snapshot em 2026-07-15, commit `8eebfbeff2e8`.
> Para valores atuais: `bun run metrics` → `reports/metrics.json`.

| Métrica | Score | State Summary |
|---------|-------|---------------|
| Architecture Compliance | 70% | ✅4 🟡5 ❌1 |
| Engineering Readiness | 21% | ✅1 🟡4 ❌6 |
| Security Readiness | 45% | ✅0 🟡7 ❌2 |
| Security Assurance | 0% | ✅0 🟡0 ❌7 |
| Security Evidence | 58% | ✅2 🟡4 ❌1 |
| Operational Readiness | 5% | ✅0 🟡2 ❌8 |
| Release Readiness | 0% | ✅0 🟡0 ❌11 |
| Overall Confidence | 28% | ✅0 🟡5 ❌1 |
| Release Decision | BLOCKED | 17 hard gates falhando |

### Decisões Importantes (resumo)

Ver `DECISION_LOG.md` para detalhes. Resumo:

- **D-001**: Architecture Freeze 1.0 — arquitetura congelada, sem novos
  componentes estruturais na série 1.x.
- **D-002**: Security Evidence como 3ª dimensão (além de Readiness e
  Assurance).
- **D-003**: Release Decision baseada em 17 Hard Gates booleanos, não
  em percentuais.
- **D-004**: Modelo de 3 estados por check (verified /
  implemented_unverified / not_implemented).
- **D-005**: Zero percentuais hardcoded — tudo derivado de
  `reports/metrics.json`.
- **D-006**: Pesos configuráveis via `config/kpi-weights.json`.
- **D-007**: Histórico imutável em `reports/history/`.
- **D-008**: SHA-256 do report para integridade.
- **D-009**: Governance layer `.ai/` como memória operacional
  permanente.

### Dívida Técnica Ativa

`reports/code-audit.md` contém 49 findings:

- 19 untyped `throw new Error(...)` (deveriam usar `TankError` tipado).
- 11 explicit `any` em código de produção.
- 8 TODO/FIXME/XXX/HACK pendentes de conversão em issues.
- 7 `console.*` em código de produção (deveriam usar logger
  estruturado).
- 4 mocks em caminhos de produção (deveriam estar em `*.mock.ts`).

### Hard Gates Bloqueando GA (17)

1. Critical vulns resolved (sem SAST em CI)
2. High vulns resolved (sem SAST em CI)
3. Coverage ≥ 95% (sem coverage tooling)
4. Crypto vectors validated (não committed)
5. SBOM published (não gerado)
6. Reproducible build (não implementado)
7. Release signed (sem sigstore)
8. SAST in CI (Semgrep/CodeQL não configurados)
9. Gitleaks in CI (não integrado)
10. Trivy in CI (não integrado)
11. SECURITY.md published (não criado)
12. Audit #1 completed (Sprint 5)
13. Audit #2 completed (Sprint 5)
14. Pentest #1 completed (Sprint 5)
15. Pentest #2 completed (Sprint 5)
16. Bug bounty public (pós-Audit #1)
17. Incident Response runbook (não escrito)

---

## Documentos Permanentes

| Documento | Propósito |
|-----------|-----------|
| `ARCHITECTURE-FREEZE-1.0-BASELINE.md` | Arquitetura congelada + governança |
| `ARCHITECTURE.md` | História e motivação da arquitetura |
| `ENGINEERING-STANDARDS.md` | Padrões de implementação (17 seções) |
| `KPI-FORMULAS.md` | Fórmulas e schema das métricas |
| `.ai/README.md` | Governança permanente — propósito e hierarquia |
| `.ai/CORE_RULES.md` | 10 regras absolutas |
| `.ai/ENGINEERING_RULES.md` | Fluxo e restrições de engenharia |
| `.ai/PROMPTING_RULES.md` | Regras de prompting |
| `.ai/OUTPUT_RULES.md` | Formato obrigatório de resposta (7 seções) |
| `.ai/PROJECT_STATE.md` | Este documento — memória do projeto |
| `.ai/DECISION_LOG.md` | Registro de decisões arquiteturais |
| `.ai/TASK_TEMPLATE.md` | Template padrão para tarefas |
| `worklog.md` | Log de trabalho multi-agente (append-only) |
| `reports/metrics.json` | Snapshot atual dos KPIs (sobrescrito) |
| `reports/metrics.md` | KPIs em markdown humano-legível |
| `reports/code-audit.md` | Dívida técnica enumerada |
| `reports/history/` | Snapshots imutáveis por commit |

---

## Histórico de Fases (append-only)

### Fase 0–2 — Foundation (concluída)

- Phase 0: Protótipo inicial.
- Phase 1: Fundação criptográfica (BIP-39/32/44, SLIP-10, AES-256-GCM,
  EvmProvider, EvmSigner, GoPlus API real).
- Phase 2: Sovereignty Layer (ERC-20/NFT approvals, sessions, lockdown,
  smart contract scanner, calldata analyzer).

### Fase 3 — Architecture Formalization (concluída)

- 10 componentes arquiteturais formalizados.
- 16 security engines especificados.
- TSS (10 specs) e TSF (7 domínios) publicados.
- Architecture Freeze 1.0 declarado.

### Fase 4 — Sprint 1 (concluído)

- 100% dados reais, 0% mocks.
- Threat Intel via GoPlus real.
- Simulation via eth_call real.
- Device Trust via WebAuthn/WebCrypto real.
- Network via RPC quorum real.

### Fase 5 — Sprint 2 (concluído)

- 4 chain plugins com pipeline completo (Ethereum, Bitcoin, Solana,
  Lightning).
- Conformance Suite: 11 testes × 4 plugins.

### Fase 6 — Sprint 3 (concluído)

- Conformance Suite separada em Interface (offline) vs Operational
  (infra).
- Security Validation Report gerado automaticamente.

### Fase 7 — Sprint 4 (em andamento, 13%)

- Production Readiness.
- 1 DONE (Release Dashboard UI).
- 4 IN PROGRESS.
- 3 PLANNED.

### Fase 8 — Engineering Standards (concluída)

- `ENGINEERING-STANDARDS.md` publicado (17 seções).
- `KPI-FORMULAS.md` publicado com fórmulas reproduzíveis.
- `worklog.md` inicializado.

### Fase 9 — Metrics Pipeline (concluída)

- 8 scripts em `scripts/metrics/`.
- `bun run metrics` gera `reports/metrics.json` + `metrics.md`.
- `bun run audit:code` gera `reports/code-audit.md`.
- 3 dimensões de segurança (Readiness, Evidence, Assurance).
- Modelo de 3 estados por check.
- 17 Hard Gates para release decision.
- Pesos configuráveis em `config/kpi-weights.json`.
- SHA-256 do report para integridade.
- Histórico imutável em `reports/history/`.

### Fase 10 — Governance Layer (atual, 2026-07-15)

- `.ai/` criada com 8 arquivos de governança.
- Memória operacional permanente estabelecida.
- Regras de prompting, output, engenharia e core formalizadas.
- Decision log pré-populado com 9 decisões.

---

## Próximas Fases (planejadas, não iniciadas)

### Sprint 4 — Production Readiness (continuação)

1. Eliminar 49 findings de code-audit.md.
2. Criar `src/lib/observability/logger.ts` (Pino estruturado).
3. Commitar crypto vectors (15 conjuntos).
4. Configurar CI Quality Gates (Semgrep, CodeQL, Trivy, Gitleaks).
5. Gerar SBOM CycloneDX.
6. Implementar release signing (sigstore).

### Sprint 5 — Audits + Bug Bounty

1. Audit #1 (crypto + key management + recovery).
2. Audit #2 (engines + decision pipeline + event bus).
3. Pentest #1 (frontend + API).
4. Pentest #2 (infra + supply chain).
5. Bug bounty público (Immunefi ou HackerOne).
6. SECURITY.md publicado.
7. Final Validation Report.

### Architecture Freeze 2.0 (pós-1.x, candidatas registradas)

- Mudanças no Security Kernel.
- Mudanças no Event Bus.
- Mudanças no contrato SecurityEngine.
- Novo Unified Data Model.
- Mudanças no TSS ou TSF.
- Mudanças no pipeline de decisão.
- Mudanças nos registries.
- Extração de engines faltantes (device-trust, wallet-guardian,
  ai-security, governance) como módulos próprios.

---

## Regra de Atualização

Este documento é **append-only** para a seção "Histórico de Fases" e
"Decisões Importantes". A seção "Atual — Snapshot Corrente" pode ser
sobrescrita quando o estado muda, mas o histórico anterior deve ser
preservado em "Histórico de Fases".

Toda atualização deve registrar:

- Data (ISO).
- Commit.
- Quem atualizou (agente ou humano).
- O que mudou (uma linha).
