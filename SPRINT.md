# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 28 — RLS Postgres real (RUNTIME)

**Objetivo:** validar e aplicar `rls.sql` em runtime Postgres + migrate deploy.

**Issues mãe:** novas #63, #64

### Tarefas

#### T1 — RLS runtime apply (ALTO)
- **Arquivos:** `scripts/apply-rls.ts` (novo), `scripts/__tests__/rls-apply.test.ts` (novo)
- **Ações:**
  - `apply-rls.ts`: conectar Postgres via `pg`, executar `rls.sql`
  - Teste: dry-run com SQLite mock ou skip se DATABASE_URL=sqlite
- **Critério:** `bun test rls-apply` 2 pass

#### T2 — migrate deploy (MÉDIO)
- **Arquivos:** `scripts/migrate-deploy.ts` (novo)
- **Ações:**
  - `migrate-deploy.ts`: `prisma migrate deploy` + `apply-rls`
- **Critério:** `tsc:0` + `migrate-deploy.ts` compila

### Definição de pronto (DoD)
- [ ] 3 arquivos + 2 pass
- [ ] `tsc:0`
