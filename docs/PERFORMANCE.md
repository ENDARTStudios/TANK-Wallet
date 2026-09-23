# PERFORMANCE — Budgets e Web Vitals

> **Tipo:** Qualidade · **Atualizado:** 2026-09-23 · Fontes: `perf-budget.json` · `.lighthouserc.json` · [PERFORMANCE-BUDGET.md](PERFORMANCE-BUDGET.md)
> Gate de CI: `lighthouse.yml` falha o PR se qualquer categoria < 0.9.

## 1. Web Vitals (alvo / crítico)

| Métrica | Alvo | Crítico |
| --- | --- | --- |
| LCP | < 2.5s | > 4s |
| FCP | < 1.8s | > 3s |
| CLS | < 0.1 | > 0.25 |
| TBT | < 200ms | > 600ms |
| INP | < 200ms | > 500ms |
| Speed Index | < 3s | > 5.8s |
| TTFB | < 600ms | > 1.5s |

## 2. Tamanho de recurso (alvo / hard)

| Recurso | Alvo | Hard |
| --- | --- | --- |
| JavaScript | < 200kB | > 500kB |
| CSS | < 50kB | > 100kB |
| Imagem | < 100kB | > 300kB |
| Fontes | < 50kB | > 150kB |
| Third-party | **0** | > 0 |

## 3. Técnicas obrigatórias (já padrão do repo)

- **Lazy-loading:** rotas dinâmicas, imagens `next/image` (sharp), componentes pesados com `next/dynamic`.
- **Skeleton** antes de dado (também é requisito de motion — [DESIGN.md](DESIGN.md)).
- **Cache:** React Query (`@tanstack/react-query`) para dados; proxy WHOIS com cache 1h; SW cache-first offline.
- **Server components** por default; `"use client"` só onde há interação.
- **Sem third-party JS em produção** (budget = 0; analytics é first-party via `/api/metrics`).

## 4. Antipadrões que o review rejeita

Consulta repetida · render extra · operação bloqueante no main thread · imagem sem otimização · JS desnecessário no client bundle · requisição duplicada · fonte pesada sem `font-display` · componente over-render · query sem `LIMIT`.

## 5. Medição contínua

| Instrumento | Onde |
| --- | --- |
| Lighthouse CI | `.github/workflows/lighthouse.yml` + `e2e/lighthouse-budget.spec.ts` |
| Benchmarks próprios | `bun run bench` |
| Métricas de runtime | `/api/dashboard` (rps, errorRate, p95, activeUsers) + `/api/metrics/prometheus` → Grafana |
| Formulas de KPI | `../KPI-FORMULAS.md` (`bun run metrics`) |

## 6. Instruções de atualização

1. Novo bundle grande (> 50kB gz): justifique no PR e ajuste budget **com ADR** — nunca silenciosamente.
2. Regressão de LCP/CLS num PR: bloqueia merge (gate), corrige antes.
3. Ao mudar `perf-budget.json`, atualize as tabelas §1-§2 aqui e [PERFORMANCE-BUDGET.md](PERFORMANCE-BUDGET.md).
