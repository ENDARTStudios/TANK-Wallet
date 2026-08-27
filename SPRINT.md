# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 6 — Postgres FORCE RLS + next-auth Prod (Etapa 1/3)

**Objetivo:** fundar multi-tenant real com Postgres e autenticação prod, sem quebrar SQLite dev. É a base para RBAC/RLS `FORCE` e sessão.

**Issues mãe:** `docs/ISSUES-BACKLOG.md` #8, #9 (e novas #19, #20)

### Tarefas

#### T1 — Postgres + Docker + Prisma RLS (ALTO)
- **Arquivos:** `docker-compose.yml` (novo), `prisma/schema.prisma`, `prisma/migrations/` (gerado), `prisma/rls.sql` (novo), `.env.example`, `docs/RLS.md`, `docs/disaster-recovery.md`
- **Ações:**
  - `docker-compose.yml`: `postgres:16` + `pgadmin` (opcional) com `POSTGRES_DB=tank_wallet`, `DATABASE_URL=postgresql://...`
  - `schema.prisma`: manter `sqlite` para dev, documentar `postgresql` para prod via `// provider = postgresql` comentado + `rls.sql` com `CREATE POLICY` + `FORCE RLS` + `current_setting('app.current_workspace')`
  - `rls.sql`: políticas para `PermissionAuditLog`, `Behavior*`, `RecoveryContact`, `User` (`USING workspaceId = current_workspace()`)
  - `.env.example`: `DATABASE_URL` Postgres + `DIRECT_URL`
- **Critério:** `docker compose up -d` sobe Postgres; `prisma generate` verde; `rls.sql` versionado; `bunx tsc --noEmit:0`
- **Testes:** `prisma/rls.sql` sintaxe válida (`psql -f` dry-run)
- **Ref:** `Closes #19`

#### T2 — next-auth Prod (ALTO)
- **Arquivos:** `src/app/api/auth/[...nextauth]/route.ts` (novo), `src/lib/auth/nextauth.ts` (novo), `src/lib/auth/rbac.ts` (atualizar `getSessionContext` → `getServerSession`), `.env.example`, `next.config.ts`
- **Ações:**
  - `nextauth.ts`: `CredentialsProvider` (email + senha) + `PrismaAdapter` (ou JWT sem adapter para SQLite), `NEXTAUTH_SECRET` + `NEXTAUTH_URL`, callbacks `jwt`/`session` com `workspaceId`+`role`
  - `route.ts`: `export { GET, POST } from next-auth/next`
  - `rbac.ts`: `getSessionContext` passa a usar `getServerSession(authOptions)` quando `NEXTAUTH_SECRET` presente, fallback para headers em test
- **Critério:** `GET /api/auth/session` retorna `workspaceId`+`role` quando autenticado; sem sessão → `401` em rota protegida; `bun test rbac` verde
- **Testes:** `src/lib/auth/__tests__/rbac.test.ts` cobre `requirePermission` com `next-auth` mock
- **Ref:** `Closes #20`

#### T3 — Integração RBAC + RLS em rota exemplo (MÉDIO)
- **Arquivos:** `src/app/api/threats/seed/route.ts` (novo ou atualizar), `src/lib/db/rls.ts`
- **Ações:**
  - Proteger `POST /api/threats/seed` com `requirePermission(ctx, post_threats_seed)` → `401/403` + `withWorkspaceFilter` para `workspaceId`
  - E2E `e2e/security.spec.ts` verifica `403` para `viewer`
- **Critério:** `viewer → 403`, `security → 200` (quando autenticado); `e2e` cobre
- **Ref:** `Closes #8` (parte 2)

### Fora de escopo neste sprint

- WalletConnect v2 — Sprint 7
- Threat Intel real — Sprint 8
- Migração de dados SQLite→Postgres — script separado (não neste PR)

### Definição de pronto (DoD)

- [ ] `docker-compose.yml` + `prisma/rls.sql` versionados
- [ ] `prisma/schema.prisma` com `Workspace`/`User` + `workspaceId` + `@@index` (já em Sprint 3, agora com `rls.sql`)
- [ ] `src/app/api/auth/[...nextauth]/route.ts` + `src/lib/auth/nextauth.ts` + `rbac.ts` integrado
- [ ] `bun test rbac+rls` verde; `bunx tsc --noEmit:0`; `next build --webpack: compiled`
- [ ] `POST /api/threats/seed` com `401/403` comprovado
- [ ] Deploy gate verde
