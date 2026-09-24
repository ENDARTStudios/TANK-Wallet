# MONITORING — Monitoramento em Produção

> **Tipo:** Operação · **Atualizado:** 2026-09-23 · Detalhe técnico: [OBSERVABILITY.md](OBSERVABILITY.md) · Incidentes: [incident-response.md](incident-response.md)
> **Regra R4:** toda falha crítica gera **1 alerta** — nem silêncio, nem spam.

## 1. Sinais coletados

| Sinal | Fonte | Uso |
| --- | --- | --- |
| Erros + sessões com erro | Sentry (`src/instrumentation.ts` → DSN prod) | Detecção de bug em produção |
| Traces distribuídos | OpenTelemetry (OTLP) com `traceId` | Correlação ponta a ponta |
| Métricas de app | `/api/metrics/prometheus` (prom-client) → Grafana | rps · errorRate · p95 · activeUsers |
| Liveness/readiness | `/api/health` (Render healthcheck + smoke E2E) | Disponibilidade |
| Logs estruturados | `logger.ts` JSON (ts, level, svc, traceId, userId, workspaceId) | Investigação |
| Cadeia de suprimento | cosign verify + SBOM | Integridade da imagem |
| Backup | Workflow restore-e2e (segundas 06:00 UTC) | Recuperabilidade |

## 2. Dashboards (Grafana)

Painel base alimenta-se de `src/lib/metrics/dashboard.ts` (rps, errorRate, p95, activeUsers) e da exposição Prometheus. Visões esperadas: tráfego por rota de API, latência p95 por integração (GoPlus/RDAP/RPC), taxa de erro 5xx, eventos de segurança (lockdown, bloqueios) por dia.

## 3. Alertas mínimos configurados/alvo

| Condição | Severidade | Ação |
| --- | --- | --- |
| `/api/health` falha 2× consecutivas | Página | Ver Render + rollback se deploy recente |
| errorRate > 5% por 5 min | Crítico | Investigar por traceId no Sentry |
| p95 > 1.5s por 10 min | Alto | Checar integrações lentas / RPC |
| Sentry: novo issue com spike | Alto | Triar (bug × ruído) |
| Falha de segurança em engine (fail-closed acionado) | Alto | Verificar integração (GoPlus/RDAP) antes que degrade UX |
| Restore-e2e semanal falha | Alto | Backup inutilizável = risco de dados |
| Cota/erro de integração externa | Médio | Issue `sev:high` no provider |

## 4. Playbook de prova (telemetria viva — lição A2)

- [ ] Falhar 1 ação crítica → Sentry recebe com `traceId`.
- [ ] `Retry` do `error.tsx` reseta sem recarregar a página.
- [ ] Dashboard mostra usuário + workspace (nunca o segredo).
- [ ] `/api/health` indica observabilidade ativa.

Gate correspondente: build falha se scaffold Sentry/OTel ausente (`scripts/verify/`).

## 5. Regras de log em produção

- JSON estruturado com `traceId` na resposta (`X-Request-Id`) para o usuário reportar.
- Redaction obrigatória (`redactSecrets`): tokens, emails, chaves → `***`.
- **Nunca** logar mnemonic/chave privada/calldata completo (só hash).

## 6. Rituais de operação

- **Diário (automático):** healthchecks + alertas.
- **Semanal:** revisão de erros novos no Sentry; restore-e2e; revisão de quotas.
- **Por release:** snapshot de métricas anexado ao PR ([ANALYTICS.md](ANALYTICS.md) §6); drill de DR.
- **Post-mortem:** todo incidente P1/P2 gera documento (causa, timeline, ação) em `../worklog.md` + aprendizado em [MEMORY.md](MEMORY.md).

## 7. Instruções de atualização

1. Novo alerta: tabela §3 + configuração no Grafana/Sentry no mesmo change.
2. Nova métrica exposta: atualizar [ANALYTICS.md](ANALYTICS.md) e fórmula em `../KPI-FORMULAS.md`.
3. Incidente real: revisar se alerta existente flagrou — se não, ajustar detector.
