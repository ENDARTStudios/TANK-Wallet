# STATUS-T079 — T079-nextauth-url-guard — DONE (sem merge até REVIEW, D078)

**Data:** 2026-09-25
**Commit:** 4feb302 (`fix: T079 guard NEXTAUTH_URL empty/invalid with fallback`)
**Branch:** chore/sprint-59-nextauth-guard → PR #55 (base main, sem merge até REVIEW)
**Tarefa:** T079-nextauth-url-guard (TDD: teste primeiro, vermelho confirmado)

## Evidência — TDD

- Teste escrito primeiro: `src/lib/env/__tests__/url.test.ts` (6 casos: válido, undefined, vazio, espaços, inválido, VERCEL_URL) → vermelho confirmado (`Cannot find module '../url'`)
- Implementação: `src/lib/env/url.ts` (`resolveBaseUrl`, trim + try/catch + fallback ordenado, sem log de valores)
- Pós-fix: 6 pass / 0 fail

## Evidência — verificação

- `bun test src/lib/env/`: 6 pass / 0 fail
- `bunx tsc --noEmit`: exit 0
- `bunx eslint` (5 arquivos): exit 0
- `grep new URL(process.env`: 0 ocorrências em `src/` (todos os 3 usos via `resolveBaseUrl`: `layout.tsx:22`, `sitemap.ts`, `robots.ts`)
- Build com `NEXTAUTH_URL=""` (cenário Vercel exato): `Compiled successfully`, prerender `22/22` sem `Failed to collect` (exit 1 apenas na cópia standalone Windows, pré-existente e não relacionada)

## Arquivos

- `src/lib/env/url.ts` (novo), `src/lib/env/__tests__/url.test.ts` (novo)
- `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts` (guard aplicado)

## Métricas

TDD red→green em 1 ciclo; 5 arquivos, +57/-3.

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).
