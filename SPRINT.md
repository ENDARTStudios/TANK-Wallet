# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 43 — Sentry/OTel wire completo

**Objetivo:** `initObservability` real carrega Sentry SDK + traceId + OTel trace propagation.

**Issues mãe:** novas #93, #94

### Tarefas

#### T1 — initObservability completo (ALTO)
- **Arquivos:** `src/lib/observability/init.ts` (novo), `src/lib/observability/__tests__/init.test.ts` (novo)
- **Ações:**
  - `init.ts`: `initObservability({ dsn, env, release, sampleRate })` lazy + trace correlation
- **Critério:** `bun test init` 3 pass

#### T2 — Wire em instrumentation.ts (MÉDIO)
- **Arquivos:** `src/instrumentation.ts` (atualizar)
- **Ações:**
  - `register()` chama `initObservability()` com DSN do env
- **Critério:** `tsc:0`

### Definição de pronto (DoD)
- [ ] 3 arquivos + 3 pass
- [ ] `tsc:0`
