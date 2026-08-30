# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 26 — Deploy + Smoke Test Prod

**Objetivo:** garantir que v1.1.0 deploya e responde corretamente em produção simulada.

**Issues mãe:** novas #59, #60

### Tarefas

#### T1 — Smoke tests (MÉDIO)
- **Arquivos:** `e2e/smoke.spec.ts` (novo)
- **Ações:**
  - Verificar `/` renderiza, `/api/health` retorna 200, `/sitemap.xml` válido
- **Critério:** `bunx playwright test e2e/smoke.spec.ts` verde

#### T2 — Deploy script (BAIXO)
- **Arquivos:** `scripts/deploy-preflight.sh` (novo)
- **Ações:**
  - Script bash: `bunx tsc`, `bun run lint`, `bun test`, `git status`, `git tag -l`
- **Critério:** script executa verde

### Definição de pronto (DoD)
- [ ] 2 arquivos + smoke test verde
- [ ] `tsc:0`
