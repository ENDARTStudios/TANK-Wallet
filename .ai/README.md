# .ai/ — Project Governance Layer

> Esta pasta contém as **regras permanentes** do projeto Tank Wallet.
> Estes documentos são a **fonte oficial de verdade** para governança,
> engenharia, prompting e output.

---

## Governance Metadata

```
Governance Version:
1.1

Architecture Freeze:
1.0

Last Review:
2026-07-15

Next Review:
Antes de Architecture Freeze 2.0 ou mudança em qualquer regra core.
```

Mudanças na própria governança devem ser registradas em
`decisions/DECISION_LOG.md` como nova entrada `D-XXX` descrevendo o
que mudou, alternativas consideradas e impacto.

---

## Status

- **Ativo a partir de**: Architecture Frozen 1.0
- **Mantenedor**: Engineering Lead + Security Lead
- **Alteração exige**: PR com 2 approvals

---

## Propósito

O Tank Wallet evoluiu de uma hot wallet Web3 para uma **plataforma
autocustodial de segurança para ativos digitais**. A arquitetura está
congelada (Architecture Freeze 1.0) e o backlog passou a ser
exclusivamente de engenharia.

Esta pasta existe para garantir que:

1. **Toda implementação futura** respeite as regras estabelecidas.
2. **Toda decisão arquitetural relevante** seja registrada e auditável.
3. **Toda tarefa** siga o mesmo fluxo: contexto → restrições → objetivo →
   plano → execução → validação → documentação.
4. **Nenhum conhecimento** seja perdido entre sessões, agentes ou
   colaboradores.
5. **Nenhuma regra estrutural** seja violada sem confirmação explícita.

---

## Estrutura

```
.ai/
├── README.md                          # Este documento
├── rules/                             # Documentos normativos (mudam raramente)
│   ├── CORE_RULES.md                  # 10 regras absolutas
│   ├── ENGINEERING_RULES.md           # Fluxo e restrições de engenharia
│   ├── OUTPUT_RULES.md                # Formato obrigatório de resposta
│   └── PROMPTING_RULES.md             # Regras de prompting
├── state/                             # Estado do projeto (muda frequentemente)
│   ├── PROJECT_STATE.md               # AUTO-GENERATED + MANUAL split
│   └── metrics.snapshot.json          # Cópia do último reports/metrics.json
├── decisions/                         # Histórico (append-only, imutável)
│   ├── DECISION_LOG.md                # Decisões operacionais (D-XXX)
│   └── ARCHITECTURE_DECISIONS.md      # ADRs (ADR-XXX)
└── templates/
    └── TASK_TEMPLATE.md               # Template padrão para tarefas
```

**Separação por tipo de ciclo de mudança**:

| Tipo | Diretório | Ciclo |
|------|-----------|-------|
| Normativo | `rules/` | Raramente (exige 2 approvals) |
| Estado | `state/` | Frequentemente (a cada sprint, a cada release) |
| Histórico | `decisions/` | Append-only (imutável após criação) |
| Template | `templates/` | Raramente |

Esta separação reduz a chance de editar documentos normativos durante
o desenvolvimento diário.

---

## Hierarquia de Autoridade

Em caso de conflito entre fontes, a precedência é:

1. **`.ai/rules/CORE_RULES.md`** — regras absolutas, nunca violáveis sem
   confirmação explícita do usuário.
2. **`.ai/rules/ENGINEERING_RULES.md`** — fluxo e restrições de engenharia.
3. **`ARCHITECTURE-FREEZE-1.0-BASELINE.md`** — arquitetura congelada.
4. **`ENGINEERING-STANDARDS.md`** — padrões de implementação.
5. **`KPI-FORMULAS.md`** — fórmulas e regras de medição.
6. **`.ai/state/PROJECT_STATE.md`** — memória do estado atual.
7. **`.ai/decisions/DECISION_LOG.md`** + **`ARCHITECTURE_DECISIONS.md`** —
   histórico de decisões.
8. **Prompt do usuário** — instrução específica da sessão.

> Se um prompt do usuário conflitar com qualquer regra estrutural acima
> (itens 1-5), o modelo **deve parar e solicitar confirmação explícita**
> antes de proceder. Não deve escolher arbitrariamente.

---

## Comportamento Permanente

Antes de executar **qualquer** tarefa neste projeto, o modelo deve:

1. **Ler `.ai/rules/`** completo (4 arquivos normativos).
2. **Ler `.ai/state/PROJECT_STATE.md`** para conhecer o estado atual.
3. **Ler `.ai/decisions/DECISION_LOG.md`** e
   **`.ai/decisions/ARCHITECTURE_DECISIONS.md`** para conhecer decisões
   anteriores relevantes.
4. **Ler `worklog.md`** para entender o trabalho recente de outros agentes.
5. **Ler `reports/metrics.json`** para conhecer o estado atual dos KPIs.
6. **Consultar `DECISION_LOG.md`** antes de propor qualquer mudança
   arquitetural.
7. **Atualizar `state/PROJECT_STATE.md`** quando o estado do projeto
   mudar (nova fase, novo módulo, nova decisão).
8. **Respeitar `rules/ENGINEERING_RULES.md`** em toda implementação.
9. **Seguir `rules/OUTPUT_RULES.md`** em toda resposta técnica.
10. **Só então executar** a solicitação do usuário.

Estes documentos são a **memória operacional permanente** do projeto.
Devem ser mantidos sincronizados durante toda a evolução do código.

---

## Quando Atualizar

| Evento | Arquivo a atualizar |
|--------|---------------------|
| Nova decisão arquitetural | `decisions/ARCHITECTURE_DECISIONS.md` (novo ADR) |
| Nova decisão operacional | `decisions/DECISION_LOG.md` (novo D-XXX) |
| Mudança de fase (Sprint 4 → Sprint 5) | `state/PROJECT_STATE.md` (seção MANUAL) |
| Novo módulo implementado | `state/PROJECT_STATE.md` (seção MANUAL) |
| Novo componente congelado | `state/PROJECT_STATE.md` + novo ADR |
| Mudança em regra de engenharia | `rules/ENGINEERING_RULES.md` (via PR com 2 approvals) |
| Mudança em regra core | `rules/CORE_RULES.md` (via PR com 2 approvals) |
| Nova execução de metrics | `state/metrics.snapshot.json` (sobrescrever) + `state/PROJECT_STATE.md` seção AUTO-GENERATED |
| Tarefa concluída | `worklog.md` (append com ID `WL-YYYY-MM-DD-NNN`) |
| Mudança na própria governança | `decisions/DECISION_LOG.md` (novo D-XXX) + bump em `Governance Version` no topo deste README |

**Regra append-only**: `decisions/DECISION_LOG.md` e
`decisions/ARCHITECTURE_DECISIONS.md` nunca editam entradas existentes
(salvo para adicionar `Superseded By`). `state/PROJECT_STATE.md` seção
AUTO-GENERATED é sobrescrita; seção MANUAL pode ser editada; seção
"Histórico de Fases" é append-only.

---

## Versionamento da Governança

| Governance Version | Data | Mudança |
|--------------------|------|---------|
| 1.0 | 2026-07-15 | Criação inicial da estrutura `.ai/` com 8 arquivos planos. |
| 1.1 | 2026-07-15 | Refatoração estrutural: subdiretórios `rules/`, `state/`, `decisions/`, `templates/`. PROJECT_STATE com split AUTO/MANUAL. DECISION_LOG em formato rígido imutável. Adicionado ARCHITECTURE_DECISIONS.md com 10 ADRs. Adicionado `metrics.snapshot.json`. Worklog passa a usar IDs `WL-YYYY-MM-DD-NNN`. |

Mudança de Governance Version major (1.x → 2.0) só acontece com
Architecture Freeze 2.0.
