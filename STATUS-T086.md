# STATUS-T086 — T086-csp-enforcing-promotion — DONE (sem merge até REVIEW, D078)

**Data:** 2026-09-26
**Branch:** chore/sprint-60-csp-enforcing
**Tarefa:** T086-csp-enforcing-promotion (test-first)

## Evidência — violação (janela desde 2977f20)

- Endpoint sem store persistente por desenho (sem PII retida); nenhum CI E2E falhou por CSP em nenhum run desde 2977f20; nenhum report de violação observado que exija mitigação
- Política enforcing = report-only + `report-to` (nenhuma diretiva removida; `unsafe-inline` preservado) → mudança de comportamento zero por construção

## Evidência — testes (test-first, vermelho → verde)

- `csp.test.ts` (6 testes): nonce único, report-only, enforcing (sem "Report-Only", com `report-to`), flag on/off, validação ok/grande/malformada + array report-to, contadores
- `bun test src/lib/security/`: 20+ pass / 0 fail
- `bunx tsc --noEmit`: exit 0; `bunx eslint`: exit 0

## Evidência — E2E com flag on (local, prova de não-quebra)

- `CSP_ENFORCE=1 bunx playwright test --workers=1`: 57 passed, 3 skipped (fixme), 0 failed

## Arquivos

- `src/lib/security/csp.ts` (report-to, flag, array), `__tests__/csp.test.ts`
- `src/proxy.ts` (flag → enforcing/report-only + Reporting-Endpoints), `.env.example` (`CSP_ENFORCE="false"`)

## Métricas

Rollback instantâneo via flag, sem redeploy. 0 segredos.

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).
