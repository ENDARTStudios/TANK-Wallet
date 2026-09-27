# STATUS-T083 — T083-rate-limit-advanced — DONE (sem merge até REVIEW, D078)

**Data:** 2026-09-26
**Branch:** chore/sprint-60-rate-limit-advanced
**Tarefa:** T083-rate-limit-advanced (test-first)

## Evidência — testes (test-first, vermelho → verde)

- `src/lib/security/__tests__/rate-limit-advanced.test.ts` (novo, 5 testes, `now` injetado, sem env): isolamento por usuário, limites por operação, teto global IP, headers + retry-after, contadores
- `bun test src/lib/security/`: 15 pass / 0 fail (4 existentes intactos — backward-compat)
- `bunx tsc --noEmit`: exit 0; `bunx eslint`: exit 0

## Evidência — implementação (aditiva)

- `OPERATION_LIMITS` (send 10, swap 5, approve 3, bridge 2) + `GLOBAL_IP_LIMIT` 100 em `rate-limit.ts`; exports antigos intocados
- `/api/broadcast` POST: `operation: "send"` com `ctx?.userId` real pós-auth; 429 com headers
- Desvio documentado: `proxy.ts` inalterado de propósito (sem rotas por operação no proxy; integração no ponto real com userId autenticado)

## Métricas

Kill-switch implícito: limites em const; 0 segredos; server-side.

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).

## Fechamento (R084)
- CI PR #61 12/12 verdes (run 36286047592, Vercel preview completed).
- Mapa: consumeRateLimitAdvanced só em broadcast/route.ts (send); swap/approve/bridge sem rotas — limites preparatórios.
- Runtime: headers allowed mostram bucket da operação (fix verificado via bun -e).


## CI final (run 36286382874, head 6f342b1)
- 12/12 pass: E2E 1m45s, Quality Gates 1m5s, Lighthouse, SBOM x2, CodeQL, Semgrep, Trivy, Gitleaks, Vercel preview completed.
- Runtime headers (bun -e): allowed=true, X-RateLimit-Limit=10 (op bucket), X-RateLimit-Operation=send.

