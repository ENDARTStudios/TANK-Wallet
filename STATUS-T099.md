# STATUS-T099 — poweredby-header (F07-hardening, issue #74)

Data: 2026-09-27. Tarefa: T099-poweredby-header. Branch: chore/sprint-61-poweredby.
Resultado: **DONE** — finding Low mitigado + invariante testada.

## 1. Mudança (1 linha)

`next.config.ts`: `poweredByHeader: false`. Nenhuma outra diretiva/header tocado.

## 2. Verificação (crua, production build local — `next build` + `next start :3001/:3000`)

- Antes (config original, prod): `HTTP 200` + **`X-Powered-By: Next.js` presente** (confirma finding #74; DAST observou em deploy).
- Depois (`poweredByHeader: false`, prod): `HTTP 200`, **header ausente**.
- Caveat honesto (D100): `next dev` (Turbopack) **não emite o header em nenhuma config** — curl em dev é vácuo (ausente antes e depois). A prova real é o production build acima.
- Invariante E2E nova (`e2e/lockdown.spec.ts`, T099): `goto('/')` → `headers()["x-powered-by"]`
  `toBeUndefined` — **3 passed em PROD com fix** (chromium + mobile-375 + tablet-768).
- Controle negativo (prod sem fix): **3 failed** — invariante provada não-vácua onde o header é emitido.
- Nota CI: o job E2E do CI roda `bun run dev` (vácuo para este header); o teste vale como smoke + trava regressão se o CI migrar para `next start`. Não alterado `playwright.config.ts` (fora do escopo T099).
- `tsc --noEmit`: 0. `eslint` (arquivos tocados): 0.

## 3. Verificação T099

- [x] Header ausente local (antes/depois em production build).
- [x] Teste de headers atualizado (invariante nova, verde 3/3 em prod; controle negativo 3 failed sem fix).
- [x] Issue #74: fechada automaticamente no merge do PR #77.
- [x] CI verde (required 11/11; Vercel preview fail = quota 402 não-required, D100) + merge em `9feb5fe`.

Arquivos: `next.config.ts` (1 linha), `e2e/lockdown.spec.ts` (+1 teste), `STATUS-T099.md`.
