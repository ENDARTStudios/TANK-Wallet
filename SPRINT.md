# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 44 — Deploy target + LICENSE + lint clean

**Objetivo:** `render.yaml`, LICENSE explícita, lint 0 warnings.

**Issues mãe:** novas #95, #96

### Tarefas

#### T1 — render.yaml (ALTO)
- **Arquivos:** `render.yaml` (novo)
- **Ações:**
  - Render deploy config (Docker, env, healthcheck, branch)
- **Critério:** arquivo versionado

#### T2 — LICENSE explícita + lint clean (MÉDIO)
- **Arquivos:** `LICENSE` (verificar)
- **Ações:**
  - LICENSE MIT
  - Fix 4 lint warnings em `observability/{metrics,sentry,tracing,backup-restore}.ts`
- **Critério:** `bun run lint:0 warnings`; LICENSE MIT OK

### Definição de pronto (DoD)
- [ ] 2+ arquivos + lint clean
- [ ] `bun run verify` 11/11 ✅
