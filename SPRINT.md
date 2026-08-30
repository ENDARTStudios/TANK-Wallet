# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 30 — Sentry real + traceId correlation

**Objetivo:** wire Sentry SDK com traceId e propagação de contexto.

**Issues mãe:** novas #67, #68

### Tarefas

#### T1 — Sentry wire real (ALTO)
- **Arquivos:** `src/lib/observability/sentry-real.ts` (novo), `src/lib/observability/__tests__/sentry-real.test.ts` (novo)
- **Ações:**
  - `sentry-real.ts`: `initSentry(dsn, env, release)` lazy import + `captureException`/`setTraceId`
- **Critério:** `bun test sentry-real` 3 pass

#### T2 — traceId propagation (MÉDIO)
- **Arquivos:** `src/lib/observability/traceid.ts` (novo), `src/lib/observability/__tests__/traceid.test.ts` (novo)
- **Ações:**
  - `traceid.ts`: `newTraceId`, `withTraceId(ctx, fn)` async-local-storage
- **Critério:** `bun test traceid` 3 pass

### Definição de pronto (DoD)
- [ ] 4 arquivos + 6 pass
- [ ] `tsc:0`
