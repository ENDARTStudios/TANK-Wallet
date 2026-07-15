# PROJECT_STATE.md — Memória do Projeto

> Estado atual do Tank Wallet. **AUTO-GENERATED** é produzido por
> `bun run metrics`. **MANUAL** é editado por humanos quando o estado
> muda de fase, módulo ou decisão.
>
> Status: **Atualizado em 2026-07-15**
> Commit fonte: 8eebfbeff2e8

---

## AUTO-GENERATED

> Esta seção é derivada de `reports/metrics.json`. Não editar manualmente.
> Para regenerar: `bun run metrics` e copiar `reports/metrics.json` para
> `.ai/state/metrics.snapshot.json`.

```
Last Metrics Snapshot:
  Source: reports/metrics.json
  Schema: 1.1
  Commit: 8eebfbeff2e82050dcd3d040ea72f2a16c60b47b
  Generated: 2026-07-15T14:40:13.447Z
  Script: scripts/metrics/index.ts v1.1.0
  SHA-256: f3ba1e94cdd66524826e7cf7bd14892b26864ab40cdb5c3622102644d68e4f83

Metrics:
  Architecture Compliance : 70%
  Engineering Readiness   : 21%
  Security Readiness      : 45%
  Security Assurance      : 0%
  Security Evidence       : 58%
  Operational Readiness   : 5%
  Release Readiness       : 0%
  Overall Confidence      : 28%

Release Decision: BLOCKED
  Hard Gates failing: 17 / 17

Code Audit:
  Source: reports/code-audit.md
  Total findings: 49 (0 critical, 22 high, 27 medium, 0 low)
```

**Para detalhes completos**: ler `reports/metrics.json` e
`reports/code-audit.md`. Este snapshot é apenas um resumo executivo.

---

## MANUAL

### Arquitetura

**Architecture Frozen 1.0** — congelada, imutável durante a série 1.x.

A Tank Wallet é uma **plataforma autocustodial de segurança para ativos
digitais**, baseada em decisões preventivas, evidências verificáveis e
defesa em profundidade. A carteira é apenas um dos pontos de interação
com o Security Kernel.

Para detalhes arquiteturais: ler `ARCHITECTURE-FREEZE-1.0-BASELINE.md`.
Para decisões arquiteturais individuais: ler
`.ai/decisions/ARCHITECTURE_DECISIONS.md` (ADR-001 a ADR-010).

### Fase Atual

**Sprint 4 — Production Readiness** (em andamento)

Foco atual: eliminar dívida técnica (49 findings em code-audit.md),
configurar CI Quality Gates, criar logger estruturado, commitar crypto
vectors, gerar SBOM, integrar scanners.

### Próximos Milestones

1. Eliminar 49 findings de `reports/code-audit.md` (Sprint 4).
2. Commitar 15 conjuntos de crypto vectors (Sprint 4).
3. Criar `src/lib/observability/` (logger + tracing + metrics) (Sprint 4).
4. Configurar CI Quality Gates (Semgrep, CodeQL, Trivy, Gitleaks) (Sprint 4).
5. Sprint 5: Audit #1, Audit #2, Pentest #1, Pentest #2, Bug Bounty,
   SECURITY.md, Final Validation Report.

### Known Risks

1. **Engineering Readiness em 21%** — crypto vectors não commitados,
   coverage tooling não integrado, SBOM/signing não implementados.
2. **Operational Readiness em 5%** — sem logger estruturado, sem
   Prometheus, sem OTel, sem Sentry, sem IR runbook.
3. **Release Readiness em 0%** — sem CI/CD Quality Gates, sem
   reproducible build, sem assinatura.
4. **Security Assurance em 0%** — sem auditorias externas (planejadas
   Sprint 5).
5. **17 Hard Gates bloqueando GA** — ver `reports/metrics.json` →
   `releaseDecision.blockingGates` para lista atualizada.

### Roadmap

| Sprint | Escopo | Status |
|--------|--------|--------|
| Sprint 1 | 100% dados reais, 0% mocks | ✅ Concluído |
| Sprint 2 | 4 chain plugins com pipeline completo | ✅ Concluído |
| Sprint 3 | Conformance Suite (Interface × Operational) | ✅ Concluído |
| Sprint 4 | Production Readiness | 🔄 Em andamento |
| Sprint 5 | Auditorias + Bug Bounty + SECURITY.md | 📋 Planejado |

### Módulos Existentes

> Lista completa em `ARCHITECTURE-FREEZE-1.0-BASELINE.md` e no código
> sob `src/lib/`. Esta seção apenas resume as áreas principais.

```
src/lib/
├── wallet-core/           # BIP-39/32/44, SLIP-10, AES-256-GCM vault
├── wallet-sovereignty/    # Permissions + Lockdown
├── wallet-evm/            # EVM provider + signer, multi-RPC failover
├── wallet-security-real/  # Security Kernel
├── wallet-scanner/        # Smart contract scanner
├── wallet-engines/        # 12 security engines (audit, behavior,
│                          # key-management, network, notification,
│                          # permission, plugin, policy, recovery,
│                          # simulation, threat-intel, transaction)
└── wallet/                # types, security, data
```

### Módulos Congelados (áreas protegidas)

Ver `CORE_RULES.md` Regra 8 para lista completa. Resumo:

- `src/lib/wallet-security-real/` (Security Kernel)
- `src/lib/wallet-engines/*/index.ts` (interfaces públicas)
- `prisma/schema.prisma` (7 registries)
- `scripts/metrics/_shared.ts` (schema MetricsReport)
- `config/kpi-weights.json` (pesos — exige 2 approvals)
- Documentos: `ARCHITECTURE-FREEZE-1.0-BASELINE.md`, `KPI-FORMULAS.md`,
  `ENGINEERING-STANDARDS.md`

### Decisões Importantes

Ver `.ai/decisions/DECISION_LOG.md` para decisões operacionais e
`.ai/decisions/ARCHITECTURE_DECISIONS.md` para decisões arquiteturais
(ADRs).

Resumo de quantas decisões ativas: ver topo de cada arquivo.

### Documentos Permanentes

| Documento | Propósito |
|-----------|-----------|
| `ARCHITECTURE-FREEZE-1.0-BASELINE.md` | Arquitetura congelada + governança |
| `ARCHITECTURE.md` | História e motivação |
| `ENGINEERING-STANDARDS.md` | Padrões de implementação (17 seções) |
| `KPI-FORMULAS.md` | Fórmulas e schema das métricas |
| `.ai/README.md` | Governança permanente — propósito e hierarquia |
| `.ai/rules/CORE_RULES.md` | 10 regras absolutas |
| `.ai/rules/ENGINEERING_RULES.md` | Fluxo e restrições de engenharia |
| `.ai/rules/PROMPTING_RULES.md` | Regras de prompting |
| `.ai/rules/OUTPUT_RULES.md` | Formato obrigatório de resposta |
| `.ai/state/PROJECT_STATE.md` | Este documento — memória do projeto |
| `.ai/state/metrics.snapshot.json` | Snapshot de metrics.json |
| `.ai/decisions/DECISION_LOG.md` | Registro de decisões operacionais |
| `.ai/decisions/ARCHITECTURE_DECISIONS.md` | ADRs (decisões arquiteturais) |
| `.ai/templates/TASK_TEMPLATE.md` | Template padrão para tarefas |
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
- Threat Intel via GoPlus real, Simulation via eth_call real, Device
  Trust via WebAuthn/WebCrypto real, Network via RPC quorum real.

### Fase 5 — Sprint 2 (concluído)

- 4 chain plugins com pipeline completo (Ethereum, Bitcoin, Solana,
  Lightning).
- Conformance Suite: 11 testes × 4 plugins.

### Fase 6 — Sprint 3 (concluído)

- Conformance Suite separada em Interface (offline) vs Operational
  (infra).
- Security Validation Report gerado automaticamente.

### Fase 7 — Sprint 4 (em andamento)

- Production Readiness.
- Foco atual: eliminar dívida técnica, configurar CI Quality Gates,
  criar logger estruturado, commitar crypto vectors, gerar SBOM.

### Fase 8 — Engineering Standards (concluída)

- `ENGINEERING-STANDARDS.md` publicado (17 seções).
- `KPI-FORMULAS.md` publicado com fórmulas reproduzíveis.

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

### Fase 10 — Governance Layer (concluída)

- `.ai/` criada com 8 arquivos de governança.
- Memória operacional permanente estabelecida.

### Fase 11 — Governance Refactor (atual, 2026-07-15)

- `.ai/` reestruturada em subdiretórios: `rules/`, `state/`,
  `decisions/`, `templates/`.
- `PROJECT_STATE.md` dividido em AUTO-GENERATED + MANUAL, sem
  duplicar métricas.
- `DECISION_LOG.md` migrado para formato rígido imutável.
- `ARCHITECTURE_DECISIONS.md` criado com ADRs (ADR-001 a ADR-010).
- `metrics.snapshot.json` criado em `state/`.
- `README.md` atualizado com `GOVERNANCE_VERSION`.
- `worklog.md` passa a usar IDs estruturados `WL-YYYY-MM-DD-NNN`.

---

## Regra de Atualização

- **AUTO-GENERATED**: nunca editar manualmente. Regenerar via
  `bun run metrics` e copiar `reports/metrics.json` para
  `.ai/state/metrics.snapshot.json`.
- **MANUAL**: atualizar quando fase, módulo, decisão ou roadmap muda.
- **Histórico de Fases**: append-only. Nunca remover entrada anterior.
- Toda atualização deve registrar data, commit e quem atualizou.
