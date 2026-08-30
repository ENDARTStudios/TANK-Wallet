# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 39 — Metrics dashboard (Grafana-ready)

**Objetivo:** `/api/dashboard` com métricas agregadas Grafana-ready.

**Issues mãe:** novas #85, #86

### Tarefas

#### T1 — Dashboard route (ALTO)
- **Arquivos:** `src/app/api/dashboard/route.ts` (novo), `src/lib/metrics/dashboard.ts` (novo), `src/lib/metrics/__tests__/dashboard.test.ts` (novo)
- **Ações:**
  - `dashboard.ts`: `getDashboardMetrics()` retorna { rps, errorRate, p95, activeUsers }
  - `route.ts`: `GET /api/dashboard`
- **Critério:** `bun test dashboard` 4 pass

#### T2 — Prometheus format (MÉDIO)
- **Arquivos:** `src/app/api/metrics/prometheus/route.ts` (novo)
- **Ações:**
  - `GET /api/metrics/prometheus` formato Prometheus exposition
- **Critério:** `tsc:0`

### Definição de pronto (DoD)
- [ ] 4 arquivos + 4 pass
- [ ] `tsc:0`
