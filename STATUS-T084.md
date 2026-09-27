# STATUS-T084 — T084-csp-nonce — DONE (sem merge até REVIEW, D078)

**Data:** 2026-09-26
**Branch:** chore/sprint-60-csp-nonce
**Tarefa:** T084-csp-nonce (test-first, fase report-only)

## Evidência — testes (test-first, vermelho → verde)

- `src/lib/security/__tests__/csp.test.ts` (4 testes): nonce único base64; política preserva diretivas + injeta nonce + report-uri; limite 64KB válido; valida ok/grande/malformado + contadores
- `bun test src/lib/security/`: 20 pass / 0 fail
- `bunx tsc --noEmit`: exit 0; `bunx eslint`: exit 0

## Evidência — runtime local

- `curl /`: `Content-Security-Policy-Report-Only` com `nonce-` + `report-uri /api/csp-report`
- 2 requests consecutivos: nonces diferentes
- POST `/api/csp-report` auth-gated (401 sem sessão, consistente com rotas threat)

## Arquivos

- `src/lib/security/csp.ts` (novo), `__tests__/csp.test.ts` (novo)
- `src/proxy.ts` (nonce por request + header report-only; matcher ampliado p/ páginas)
- `src/app/api/csp-report/route.ts` (novo: auth + rate limit + 64KB + 204 sem PII)

## Métricas

Report-only: zero risco de quebra; enforcing fica para T086 com critério objetivo.

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).
