# STATUS-T098 — rate-limit-keying (Sprint 61/F08, resposta D098)

Data: 2026-09-27. Tarefa: T098-rate-limit-keying. Branch: chore/sprint-61-rate-limit-keying.
Resultado: **DONE** — keying por userId + bucket monitoria, TDD 4/4, integração provada.

## 1. TDD (red → green)

`src/lib/security/__tests__/rate-limit-keying.test.ts` (4 casos): antes 3 fail/1 pass
((b) anônimos inalterado por desenho); depois **4 pass**. Suíte security: 14 pass.

## 2. Implementação (mínima, 3 arquivos)

- `rate-limit.ts`: `rateLimitKey(req, userId?)` → `uid:<id>:<path>` (prefixo evita colisão
  com buckets IP); `consumeRateLimit` aceita `opts.userId`; `OPERATION_LIMITS += monitor: 600`
  (limites T083 intactos).
- `proxy.ts` (agora async): userId via `getToken` (JWT validado, nunca header) c/ fallback
  IP; `/api/health` sai do rate-limit do proxy (bucket próprio na rota — conserta comentário
  que mentia "exempt"); userId passado p/ reads E writes.
- `health route`: `consumeRateLimitAdvanced(operation:"monitor")` (600/min) + 429 c/ headers;
  200 inclui `X-RateLimit-*` do bucket efetivo. Prova viva: `X-RateLimit-Limit: 600` no ar.

## 3. Overhead encontrado e eliminado

Primeira versão chamava `getToken` (decrypt JWE) por request → p95 estourou 100ms no
test:load. Fix: só descriptografa se houver cookie `next-auth.session-token` (guard
síncrono; sem cookie não há identidade — semântica idêntica). Após: `test:load` EXIT 0.

## 4. Segurança (STRIDE)

- Spoofing: userId só de JWT validado; header x-user-id NÃO alimenta keying do proxy
  (k6/E2E continuam IP-keyed — baselines T091 inalterados). Anônimos: IP (inalterado).
- Tampering: cliente não escolhe chave; buckets server-side.
- Repudiation: contadores por operação + STATUS + headers do bucket efetivo.
- Info disclosure: headers sem userId (limit/remaining/reset apenas).
- DoS: CGNAT mitigado p/ autenticados; anônimos protegidos por IP; monitoria isolada 600.
- Elevation: sem mudança de permissões.

## 5. Verificação

- [x] 4 casos TDD verdes + 14 security + tsc 0 + eslint 0.
- [x] Integração: health 200 c/ Limit 600 + nonce (proxy async OK em dev); test:load EXIT 0.
- [x] LOAD-TESTING.md (tetos/keying) + DECISOES.md (D098). PR dedicado; merge após REVIEW.

Arquivos: `rate-limit.ts`, `proxy.ts`, `health/route.ts`, keying.test.ts, STATUS-T098.md,
DECISOES.md, `docs/06-devops-deployment/LOAD-TESTING.md`.
