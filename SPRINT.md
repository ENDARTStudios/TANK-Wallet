# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 22 — Migration Postgres + Backups restore test + DR drill

**Objetivo:** preparar migração Postgres e validar backup restore em CI.

**Issues mãe:** novas #51, #52

### Tarefas

#### T1 — Migration Postgres (ALTO)
- **Arquivos:** `prisma/schema.postgres.prisma` (novo), `scripts/migrate-sqlite-to-postgres.ts` (novo), `prisma/schema.prisma` (atualizar)
- **Ações:**
  - `schema.postgres.prisma`: `provider = postgresql`
  - `migrate-sqlite-to-postgres.ts`: export SQLite → import Postgres
  - `schema.prisma`: switch env-based
- **Critério:** `tsc:0`; `migrate-sqlite-to-postgres.ts` compila

#### T2 — Backup restore test (ALTO)
- **Arquivos:** `scripts/backup-restore-test.ts` (novo), `scripts/__tests__/backup-restore.test.ts` (novo)
- **Ações:**
  - `backup-restore-test.ts`: cria db de teste, faz backup, restore, valida
- **Critério:** `bun test backup-restore` 2 pass

#### T3 — DR drill (MÉDIO)
- **Arquivos:** `docs/disaster-recovery.md` (atualizar)
- **Ações:**
  - Documentar drill RTO/RPO + checklist
- **Critério:** doc atualizado

### Definição de pronto (DoD)
- [ ] `tsc:0` + 2 pass backup-restore
- [ ] `docs/disaster-recovery.md` atualizado
