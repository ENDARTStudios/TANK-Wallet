# Auditoria de Banco — TANK Wallet (Sprint 5)

> Base: `prisma/schema.prisma:1` SQLite `file:./db/custom.db` · `docs/RLS.md:1` `docs/disaster-recovery.md`

## Tabelas e RLS

| Tabela | `workspaceId` | `@@index([workspaceId])` | `LIMIT` | Status |
| --- | --- | --- | --- | --- |
| `Workspace` | — (é tenant) | `@@index([tier])` | — | ✅ |
| `User` | `workspaceId String?` | `@@index([workspaceId])` `@@index([role])` | — | ✅ |
| `ThreatToken` | — (global) | `@@index([chain])` `@@index([active])` | — | ✅ global read-only |
| `ThreatSite` | — (global) | `@@index([active])` | — | ✅ |
| `ThreatAddress` | — (global) | `@@index([chain])` `@@index([active])` | — | ✅ |
| `ThreatExploit` | — (global) | `@@index([active])` | — | ✅ |
| `PermissionAuditLog` | `String?` | `@@index([workspaceId])` `@@index([walletAddress])` `@@index([timestamp])` | ✅ via `withWorkspaceFilter` | ✅ |
| `BehaviorProfile` | `String?` | `@@index([workspaceId])` | — | ✅ |
| `BehaviorAnomaly` | `String?` | `@@index([workspaceId])` `@@index([walletAddress])` | — | ✅ |
| `RecoveryContact` | `String?` | `@@index([workspaceId])` `@@index([walletAddress])` | — | ✅ |

## Queries

- Toda query com `workspaceId` deve usar `withWorkspaceFilter` `src/lib/db/rls.ts:1` e `LIMIT` (ver `AGENTS.md:7`) — verificado em `rls.test.ts:1` ✅
- Sem `cascade` perigosa (nenhum `onDelete: Cascade` em `schema.prisma`) ✅
- Sem query sem limite em `src/lib/wallet-*` (heurística local, não DB) ✅

## Dados sensíveis

- `RecoveryContact.contact` (PII email/phone) — nullable, sem cifra ainda; futuro `pgcrypto`/`AES` (ver `docs/RLS.md:7`) ⚠️ MÉDIO
- `User.email` `@unique` — PII, mas necessário; sem log de email em `logger.ts` ✅
- `DATABASE_URL` fora do git (`git ls-files:.env:0`) ✅

## Backup — "Se precisar restaurar tudo amanhã, existe backup?"

- **Hoje:** `db/custom.db` 139k em `file:./db/custom.db` (`prisma/schema.prisma:10`), `.env` fora do git, backup manual em `docs/disaster-recovery.md` (teste no sprint) ✅
- **Futuro Postgres:** `pg_dump` diário + retenção 30d + teste de restore a cada sprint (`disaster-recovery.md`) — já documentado
- **Verificado:** `bun prisma db push` + `generate` verde em Sprint 3; `db/custom.db` existe e é legível

## Achados

- Nenhuma tabela sem índice de tenant (após Sprint 3) ✅
- Nenhuma RLS permissiva (SQLite não tem `FORCE RLS`, mas app-layer `assertSameWorkspace 403` cobre)
- Próximo: migrar para Postgres `FORCE RLS` em SPRINT-6 (`docs/RLS.md:4`)
