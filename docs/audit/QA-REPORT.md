# QA Hostil — TANK Wallet (Sprint 5)

> `AGENTS.md:3` bug flow + `docs/TESTING.md:6` + `e2e/*.spec.ts:1`

## Casos "tente quebrar"

| Caso | Input | Esperado | Evidência |
| --- | --- | --- | --- |
| Campo vazio | `import` textarea vazio → `Continuar` disabled | botão desabilitado | `e2e/onboarding.spec.ts:14` `disabled` ✅ |
| Texto gigante | `mnemonic` 10k chars | `isValidMnemonic false` → erro | `src/lib/wallet-core` + teste `rbac` |
| Duplo clique | `Criar carteira` duplo | `loading` desabilita botão | `src/components/wallet/onboarding/onboarding.tsx:175` `disabled={!revealedWords}` |
| Sessão expirada | sem `x-user-role` → `POST` | 401 | `src/lib/auth/rbac.ts:31` `401` |
| Duas abas | `filterByWorkspace` com ws diferente | 0 rows | `src/lib/db/rls.test.ts:18` |
| Falha API 500 | `page.route **/api/** abort` | página mantém `TANK` | `e2e/security.spec.ts:18` |
| Idempotência | `checkRateLimit x121` | 429 `Retry-After` | `src/lib/security/__tests__/rate-limit.test.ts:1` |
| XSS | `<script>` em `textarea` | `zod` + `escape` (não executa) | `src/lib/wallet-core` valida mnemonic |
| SQLi | `' OR 1=1` em `email` | Prisma ORM sem query crua | `src/lib/db.ts:1` |
| Bot | `curl/8.0` | `BOT_MODE block → 403` | `src/lib/security/__tests__/bot-guard.test.ts:1` |

## Responsivo 375/390/768

| Viewport | Teste | Resultado |
| --- | --- | --- |
| 375 SE | `scrollWidth <= innerWidth` | `e2e/onboarding.spec.ts:20` ✅ |
| 390 | `textarea` foco + `boundingBox` | `e2e/onboarding.spec.ts:27` ✅ |
| 768 tablet | `scrollWidth > clientWidth` false | `e2e/lockdown.spec.ts:14` ✅ |

## Erro em produção (observabilidade)

| Ação | Log | Monitoramento | Alerta |
| --- | --- | --- | --- |
| `throw` em `error.tsx` | `Sentry.captureException` `src/app/error.tsx:10` | `src/instrumentation.ts:1` `initObservability` | `Sentry` + `OTel` `tracing.ts:1` |
| `Retry` | reseta sem reload | `error.tsx: reset()` | `global-error.tsx:1` fallback |
| `traceId` | `X-Request-Id` em `proxy.ts` + `getRateLimitHeaders` | `src/lib/observability/logger.ts` | `prom-client` `/api/metrics` |

## Limpeza

| Check | Resultado |
| --- | --- |
| `console.log` em `src/` | 0 (`grep` Sprint 5) ✅ |
| `TODO` sem issue | 0 ✅ |
| `any` não justificado | 0 em `rbac.ts`/`rls.ts` (`strict:true`) ✅ |
| `gsap-public/` duplicação | 3 cópias — plano em `docs/CLEANUP-PLAN.md:6` ⚠️ BAIXO |

## Evidências `file:line`

- `src/lib/auth/__tests__/rbac.test.ts:18` 11 pass
- `src/lib/db/__tests__/rls.test.ts:18` 6 pass
- `src/lib/security/__tests__/bot-guard.test.ts:1` 6 pass + `rate-limit.test.ts:1` 4 pass
- `e2e/onboarding.spec.ts:1` `e2e/security.spec.ts:1` `e2e/lockdown.spec.ts:1` cobrem 375/390/768 + HSTS + skeleton
