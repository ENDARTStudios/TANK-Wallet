# ANALYTICS — Métricas e Analytics

> **Tipo:** Qualidade · **Atualizado:** 2026-09-23 · Fórmulas canônicas: `../KPI-FORMULAS.md`
> **Política:** analytics **first-party** — zero third-party trackers (budget third-party = 0, [PERFORMANCE.md](PERFORMANCE.md)); privacidade em [COMPLIANCE.md](COMPLIANCE.md).

## 1. Métricas de produto (o que prova que o produto funciona)

| Métrica | Definição (fonte: KPI-FORMULAS.md) | Meta |
| --- | --- | --- |
| Sinais de risco bloqueados | Eventos de detecção/bloqueio antes da assinatura (Risk Center + timeline) | Crescimento contínuo |
| Aprovações revogadas | Revogações individuais + lockdowns L3 | Tendência de alta |
| Conversão Free → PRO | Upgrades ativos / usuários ativos | KPI de monetização |
| Retenção de wallet | Sessões de retorno por usuário | — |
| Overall Confidence | Score composto de gates internos | ≥ 90% p/ release |

**Execução:** `bun run metrics` (calcula, assina e arquiva histórico — reproduzível por fórmula, não por "achaço").

## 2. Métricas técnicas (runtime)

| Fonte | Conteúdo |
| --- | --- |
| `/api/dashboard` | rps · errorRate · p95 · activeUsers (`src/lib/metrics/dashboard.ts`) |
| `/api/metrics/prometheus` | Exposição Prometheus (prom-client) → Grafana |
| Sentry | Erros, sessões com erro, performance |
| OTel | Traces ponta a ponta com `traceId` |

**Regra R4:** toda falha crítica gera **1 alerta** (não 5 duplicados nem 0).

## 3. Métricas de qualidade de engenharia

| Fonte | Uso |
| --- | --- |
| Codecov | Cobertura; PR não reduz agregado; alvo 80% `src/lib` |
| `bun run audit:code` | Dívida técnica |
| `bun run verify` | 11 gates internos |
| `bun run bench` | Benchmarks de performance próprios |
| Lighthouse CI | Perf/a11y/bp/SEO ≥ 0.9 por PR de UI |
| `bun run enforce` | Governance as code |

## 4. Eventos de produto rastreáveis

Linha do tempo unificada (`history-view`) e `PermissionAuditLog` já registram: permissão concedida/revogada/expirada/usada, bloqueio de DApp, detecção de token scam, lockdown L1-L4, alertas de anomalia. **Estes eventos são a fonte primária de analytics de segurança** — sem/snippet externo.

## 5. Privacidade por design

- Nenhum evento contém endereço de carteira em claro nos relatórios agregados (hash quando necessário).
- Logs passam por `redact` (tokens/emails/chaves) antes de sair.
- Usuário Enterprise pode contratar exportação dedicada dos eventos do workspace.

## 6. Dashboards e rituais

- **Grafana:** painel com rps/errorRate/p95/activeUsers + alertas (ver [MONITORING.md](MONITORING.md)).
- **Ritual de sprint:** rodar `bun run metrics` no fechamento e registrar tendência no `../worklog.md`.
- **Ritual de release:** anexar snapshot de métricas ao PR de release (evidência para Release Decision).

## 7. Instruções de atualização

1. Nova métrica: defina a **fórmula** em `../KPI-FORMULAS.md` primeiro, depois instrumente — sem fórmula não há métrica.
2. Mudança de meta: justifique com dado (tendência ≥ 3 medições) e registre em `../DECISOES.md`.
3. Novo alerta: um incidente = um alerta; configurar no Grafana/Sentry conforme §2.
