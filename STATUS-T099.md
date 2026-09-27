# STATUS-T099 — poweredby-header (F07-hardening, issue #74)

Data: 2026-09-27. Tarefa: T099-poweredby-header. Branch: chore/sprint-61-poweredby.
Resultado: **DONE** — finding Low mitigado + invariante testada.

## 1. Mudança (1 linha)

`next.config.ts`: `poweredByHeader: false`. Nenhuma outra diretiva/header tocado.

## 2. Verificação (crua, dev local)

- Antes: `X-Powered-By: Next.js` (curl `/`, 200).
- Depois: header ausente (`XPB_AFTER=[]`).
- Invariante E2E nova (`e2e/lockdown.spec.ts`, T099): `goto('/')` → `headers()["x-powered-by"]`
  `toBeUndefined` — **3 passed** (chromium + mobile-375 + tablet-768). Lição D100 aplicada:
  invariante testada, não comentário.

## 3. Verificação T099

- [x] Header ausente local (antes/depois).
- [x] Teste de headers atualizado (invariante nova, verde 3/3).
- [ ] Issue #74: fechar APÓS merge.
- [ ] CI verde + merge após REVIEW (D078).

Arquivos: `next.config.ts` (1 linha), `e2e/lockdown.spec.ts` (+1 teste), `STATUS-T099.md`.
