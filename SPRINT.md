# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 27 — v1.1.1 hotfix + Observability tuning

**Objetivo:** corrigir findings menores e ajustar Sentry/OTel.

**Issues mãe:** novas #61, #62

### Tarefas

#### T1 — v1.1.1 version bump (BAIXO)
- **Arquivos:** `package.json`, `CHANGELOG.md`
- **Ações:**
  - `1.1.0 → 1.1.1` patch
  - CHANGELOG entrada
- **Critério:** versão 1.1.1

#### T2 — Logger mask util (MÉDIO)
- **Arquivos:** `src/lib/observability/redact.ts` (novo), `src/lib/observability/__tests__/redact.test.ts` (novo)
- **Ações:**
  - `redact.ts`: `redactSecrets` para mascarar em logs
- **Critério:** `bun test redact` 3 pass

### Definição de pronto (DoD)
- [ ] patch + 3 pass redact
- [ ] `tsc:0`
