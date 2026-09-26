# STATUS-T080 — T080-jev-flag-wiring — DONE (sem merge até REVIEW, D078)

**Data:** 2026-09-26
**Branch:** chore/sprint-59-jev-flag-wiring
**Tarefa:** T080-jev-flag-wiring (test-first, D081 refinamentos)

## Evidência — testes (flag injetada, sem env)

- `src/lib/threat-intel/__tests__/jev-wiring.test.ts` (novo, 3 testes, `opts.jev` injetado, sem `process.env`):
  - flag off → payload sem campo `jev`, decisão inalterada (backward-compat)
  - flag on → `jev` anexado, `recommendation` inalterada
  - skip (assess lança) → `jev.skipped`, decisão inalterada
- `bun test src/lib/threat-intel/ src/lib/ai-risk/`: 12+ pass / 0 fail
- `bunx tsc --noEmit`: exit 0; `bunx eslint` (6 arquivos): exit 0

## Evidência — wiring

- `isJevFlagOn()` (`JEV_ENABLED`, default false) em `typesafe-jev.ts`
- `RiskResult.jev?` opcional; `aggregateThreatIntel` chama `assessDappRisk` só com flag on; `recommendation` só de fontes determinísticas
- `GET /api/risk` retorna `jev: { enabled }` (só estado da flag, sem segredo)
- `ThreatIntelView`: linha Jev AI Signal com `risk.jev_signal` / `risk.jev_unavailable` (pt-BR, en-US, es-ES) — nunca "seguro" quando skipped
- `.env.example`: `JEV_ENABLED="false"`

## Evidência — smoke real (saída redigida)

- 1 chamada com chave local + flag on: `{skipped:false, recommendation:allow, label:benign, confidence:0.80}`
- Chave e URL omitidas do registro

## Evidência — CI PR #57

- `gh pr checks 57`: 12/12 pass, incluindo `E2E Playwright`, `Quality Gates`, `Lighthouse audit` e `Vercel` (`Deployment has completed`)
- `gh pr view 57 --json state,mergeable`: OPEN, MERGEABLE

## Conformidade (§12/R13)

Todas as ações de infra via CLI (`gh`, `vercel whoami` para sessão pré-existente); nenhum pedido de browser/dashboard ao operador; nenhum segredo em código/logs/commits.

## Métricas

Flag default off (kill-switch); UI honesta; 11 arquivos, +133/-5.

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).
