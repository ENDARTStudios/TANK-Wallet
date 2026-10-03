# STATUS-T082 — T082-roteamento-intent — DONE (sem merge até REVIEW, D078)

**Data:** 2026-09-26
**Branch:** chore/sprint-59-intent-routing
**Tarefa:** T082-roteamento-intent (test-first, A1–A7)

## Evidência — testes (7 pass / 0 fail)

- `classifier.test.ts` (6): flag off sem chamar TypeSafe; allowlist local sem rede; TypeSafe quando claro; Noul incerto força unclassified; timeout vira unavailable; input vazio rejeitado
- `i18n.test.ts` (1): 7 chaves `intent.*` presentes e não-vazias em pt-BR/en-US/es-ES
- `intent-advisory.test.ts`: aggregator com/sem contexto Jev de alto risco → mesma recommendation; sem campo `intent` no payload
- `bunx tsc --noEmit`: exit 0; `bunx eslint`: exit 0

## Evidência — ajustes A1–A7

- A1: `INTENT_ROUTING_ENABLED` + `INTENT_TIMEOUT_MS` em `.env.example` (defaults off/3000), flag própria separada de `JEV_ENABLED`
- A2: `source: typesafe|local-heuristic|unavailable` + badge na UI; allowlist só alta precisão, resto unclassified
- A3: só metadados ao TypeSafe (`chain`, `contract_address`, `function_selector`, `value_wei`, `dapp_origin` hostname); nunca texto livre
- A4: `INTENT_TIMEOUT_MS` 3000 + `Promise.race`; nunca bloqueia, nunca lança
- A5: 5 classes de teste acima
- A6: `src/lib/intent/metrics.ts` (contadores source:intent, sem payload)
- A7: STRIDE em DECISOES.md

## Arquivos

`src/lib/intent/classifier.ts`, `metrics.ts`, `__tests__/classifier.test.ts`, `__tests__/i18n.test.ts`, `src/lib/threat-intel/__tests__/intent-advisory.test.ts`, `intent-badge.tsx`, i18n ×3, `.env.example`, `DECISOES.md`

## Métricas

Test-first (vermelho: módulo inexistente → verde); 0 segredos; server-only.

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).
