# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 29 — Lighthouse CI real

**Objetivo:** workflow Lighthouse CI rodando em PR com budget gate.

**Issues mãe:** novas #65, #66

### Tarefas

#### T1 — Lighthouse workflow (ALTO)
- **Arquivos:** `.github/workflows/lighthouse.yml` (novo)
- **Ações:**
  - Workflow com `treosh/lighthouse-ci-action` + budgets
- **Critério:** arquivo versionado

#### T2 — Budget assert test (MÉDIO)
- **Arquivos:** `e2e/lighthouse-budget.spec.ts` (novo)
- **Ações:**
  - Verificar `.lighthouserc.json` existe e tem budgets
- **Critério:** `bun test e2e` verde

### Definição de pronto (DoD)
- [ ] 2 arquivos
- [ ] `tsc:0`
