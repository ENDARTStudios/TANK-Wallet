# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 46 — knip cleanup + deps reduction

**Objetivo:** remover dependências realmente não usadas (75 → 0) e manter em package.json as que ainda são importadas via dynamic/indirect.

**Issues mãe:** novas #99, #100

### Tarefas

#### T1 — Remover deps não usadas (ALTO)
- **Arquivos:** `package.json`
- **Ações:**
  - Manter deps usadas via dynamic import: `@prisma/client`, `@sentry/nextjs`, `@opentelemetry/*`, `@noble/curves`, `@noble/hashes`, `@noble/ed25519`, `@scure/*`, `@tanstack/*`
  - Remover deps não usadas: dnd-kit, gsap/react, hookform/resolvers, mdxeditor/editor, radix-ui/* (não importados), reactuses/core
  - Verificar via `bun test` + `bunx tsc --noEmit`
- **Critério:** `bunx knip` 0 unused deps

#### T2 — knip.json entry fix (MÉDIO)
- **Arquivos:** `knip.json`
- **Ações:**
  - Adicionar `entry` patterns para dynamic imports
- **Critério:** `bunx knip` 0 errors

### Definição de pronto (DoD)
- [ ] 2 arquivos
- [ ] `bunx knip` 0 errors
- [ ] `bun test` 227 pass
- [ ] `verify:11/11 ✅`
