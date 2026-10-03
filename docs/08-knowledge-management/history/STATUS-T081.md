# STATUS-T081 — T081-reconciliar-plano-mestre — DONE (sem merge até REVIEW, D078)

**Data:** 2026-09-26
**Commit:** a025830 (`docs: T081 reconcile PLANO_MESTRE`)
**Branch:** chore/sprint-59-plano-mestre → PR #58 (base main, sem merge até REVIEW)
**Tarefa:** T081-reconciliar-plano-mestre

## Evidência

- `git mv PLANO_MESTRE.md docs/08-knowledge-management/historical/PLANO_MESTRE_ALMANAQUE.md` (histórico preservado, trilha git mantida)
- Antigo descrevia outro produto — grep: `Almanaque` (linha 31), `clubes/jogadores/competições` (27), `clube/jogador/competição` (168), `biografias` (172), `pesquisar clube` (180), `lista de clubes` (193); stack Fastify/pnpm/PostgreSQL
- Novo plano: TANK Wallet real (Next 16, Bun, Prisma, MPC v2, HSM, Vercel, PRs #50–#57, fases F07–F10)
- `DECISOES.md`: entrada de reconciliação; `SPRINT.md`: `[x] T081` (aguardando REVIEW)
- Docs-only: `tsc`/`eslint`/`bun test` não afetados (nenhum `.ts` tocado)

## Métricas

4 arquivos, +355/-316 (maioria: mover + reescrever plano).

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).
