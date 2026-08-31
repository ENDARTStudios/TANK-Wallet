# Performance Budget — TANK Wallet v1.2.1

> Fonte: `perf-budget.json` (Lighthouse + size budgets).
> Aplicado: `…` (rotas principais).

## Web Vitals

| Metric | Alvo | Crítico |
| --- | --- | --- |
| LCP (Largest Contentful Paint) | < 2.5s | > 4s |
| FCP (First Contentful Paint) | < 1.8s | > 3s |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.25 |
| TBT (Total Blocking Time) | < 200ms | > 600ms |
| INP (Interaction to Next Paint) | < 200ms | > 500ms |
| Speed Index | < 3s | > 5.8s |
| TTFB | < 600ms | > 1.5s |

## Resource Sizes

| Recurso | Alvo | Hard |
| --- | --- | --- |
| JavaScript | < 200kB | > 500kB |
| CSS | < 50kB | > 100kB |
| Imagem | < 100kB | > 300kB |
| Fontes | < 50kB | > 150kB |
| Third-party | 0 | > 0 |

## Requests

| Tipo | Alvo | Hard |
| --- | --- | --- |
| Total | < 50 | > 100 |
| Third-party | 0 | > 0 |

## Enforcement

- **warn** (Sprint 50): o `lighthouse.yml` falha gate quando Core Web Vitals estouram limite crítico.
- **error** (Sprint 51+): gate bloqueia merge.

## Roteamento

- Rotas aplicadas: `/`, `/dashboard`, `/send`, `/receive`, `/settings`.
- Adicione rotas públicas extras editando `applies-to`.

## Verificação local

```bash
bun run build
bun run start &
npx wait-on http://localhost:3000
npx lighthouse http://localhost:3000 --budget-path=./perf-budget.json
```

## Referências

- `docs/SECURITY-GATE.md` (gates de CI)
- `.github/workflows/lighthouse.yml` (job)
- `.lighthouserc.json` (config)
- [Web Vitals](https://web.dev/vitals/)
