# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 50 — Perf budget + OTel attrs + final polish

**Objetivo:** budget de performance explícito + atributos OTel + polimento final.

**Issues mãe:** novas #107, #108

### Tarefas

#### T1 — Perf budget (MÉDIO)
- **Arquivos:** `perf-budget.json` (novo), `docs/PERFORMANCE-BUDGET.md` (novo)
- **Ações:**
  - `perf-budget.json` com budgets LCP/CLS/TBT/FCP/INP + JS/CSS size
- **Critério:** arquivo versionado

#### T2 — OTel attrs (BAIXO)
- **Arquivos:** `src/lib/observability/attrs.ts` (novo), `src/lib/observability/__tests__/attrs.test.ts` (novo)
- **Ações:**
  - `attrs.ts`: `getOtelAttrs()` retorna {service, version, env, deploy}
- **Critério:** 2 tests pass

### Definição de pronto (DoD)
- [ ] 4 arquivos + 2 pass
- [ ] `tsc:0`
