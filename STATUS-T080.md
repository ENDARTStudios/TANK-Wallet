# STATUS-T080 — T080-jev-flag-wiring — DONE (sem merge até REVIEW, D078)

**Data:** 2026-09-26
**Branch:** chore/sprint-59-jev-flag-wiring
**Tarefa:** T080-jev-flag-wiring (test-first)

## Evidência — testes

- `src/lib/threat-intel/__tests__/jev-wiring.test.ts` (novo, 3 testes, flag injetada via `opts.jev`, sem `process.env`):
  - flag off → payload sem campo `jev`, decisão inalterada
  - flag on → `jev` anexado, decisão final inalterada
  - skip (erro) → `jev.skipped`, decisão inalterada
- `bun test src/lib/threat-intel/ src/lib/ai-risk/`: 12+ pass / 0 fail
- `bunx tsc --noEmit`: exit 0; `bunx eslint` (6 arquivos): exit 0

## Evidência — wiring

- `isJevFlagOn()` (`JEV_ENABLED`, default false) em `typesafe-jev.ts`
- `RiskResult.jev?` opcional; `aggregateThreatIntel` chama `assessDappRisk` só com flag on; `recommendation` calculada só de fontes determinísticas
- `GET /api/risk` retorna `jev: { enabled }` (só estado da flag, sem segredo)
- `ThreatIntelView`: linha Jev AI Signal com `risk.jev_signal` / `risk.jev_unavailable` (pt-BR, en-US, es-ES)
- `.env.example`: `JEV_ENABLED="false"`

## Evidência — smoke real (saída redigida)

- Chamada real com chave local + flag on: `{skipped:false, recommendation:allow, label:benign, confidence:0.80}`
- Chave e URL interna omitidas do registro

## Métricas

Flag default off (kill-switch); UI honesta; 0 segredos em código/logs/commits.

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).
