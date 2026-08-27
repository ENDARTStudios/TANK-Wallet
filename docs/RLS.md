# TANK Wallet — RLS (Row Level Security)

> Status: Design. **Hoje o banco é SQLite (single-tenant) → RLS nativo não se aplica.**
> Este doc define a política para a migração multi-tenant (Postgres), conforme `PRD FR-SEC-07`.

## 1. Princípio

Nenhum usuário/empresa vê dados que não são seus. Cada tabela com escopo de tenant tem um `tenant_id` (ou `workspace_id`) e toda consulta é filtrada por contexto de autenticação. `deny-by-default`.

## 2. Modelo de tenant

- **`workspace`** = tenant (pessoa, DAO ou equipe Enterprise).
- **`user`** pertence a `workspace` com `role` (ver `docs/RBAC.md`).
- Todo dado proprietário carrega `workspace_id`.

## 3. Tabelas e política (metas — Postgres)

| Tabela | Chave de tenant | Política (resumo) |
| --- | --- | --- |
| `ThreatToken` | — | Global (read-only shared). Já é threat intel comum; `FOR SELECT` todos. |
| `ThreatSite` | — | Global read-only. |
| `ThreatAddress` | — | Global read-only. |
| `ThreatExploit` | — | Global read-only. |
| `PermissionAuditLog` | `workspace_id` (add) | `USING (workspace_id = current_workspace())` |
| `BehaviorProfile` | `workspace_id` (add) | `USING (workspace_id = current_workspace())` |
| `BehaviorAnomaly` | `workspace_id` (add) | `USING (workspace_id = current_workspace())` |
| `RecoveryContact` | `workspace_id` (add) | `USING (workspace_id = current_workspace())` |
| `Wallet` (futuro) | `workspace_id` | `USING (workspace_id = current_workspace())` |

Modelos `Threat*` são **threat intelligence** (dado do sistema/segurança) e não do usuário — logo partilhados de leitura, sem RLS de tenant, mas com `FOR SELECT` e escrita apenas por `security`/`owner`.

## 4. Implementação (Postgres, futuro)

```sql
CREATE FUNCTION current_workspace() RETURNS uuid AS $$
  SELECT current_setting('app.current_workspace', true)::uuid
$$ LANGUAGE sql STABLE;

ALTER TABLE "PermissionAuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PermissionAuditLog" FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_isolation ON "PermissionAuditLog"
  FOR ALL
  USING ("workspace_id" = current_workspace());
```

- `app.current_workspace` setado por conexão (Prisma `$executeRaw` / pool middleware) a partir da sessão autenticada.
- `FORCE` garante que nem o dono da tabela ignora a política.
- Queries **sempre** limitadas (`LIMIT`) + índices em `workspace_id` (evitar full scan e vazamento).

## 5. Mapping → Prisma (hoje)

- **Application layer:** todo repositório recebe `workspaceId` em contexto e filtra. Middleware injeta no `ctx`.
- Testes de segurança: tentar ler registro de *outro* workspace deve retornar 0 linhas.

## 6. Backup & restauração (obrigatório)

> "Se precisar restaurar tudo amanhã, existe backup?" → **meta: SIM.**

- Backup diário do `db/custom.db` (agora) / dump Postgres (futuro) com retenção 30 dias.
- Restauração testada pelo menos a cada sprint (`docs/disaster-recovery.md`).
- Segredos **nunca** no backup legível; `.env` versionado fora do db.

## 7. Riscos abertos

- `Threat*` models sem tenant: seguro hoje (são threat intel, não dados pessoais). Ao virar dado por usuário, adicionar `workspace_id`.
- `RecoveryContact.contact` pode ser dado pessoal (e-mail/telefone) → tratar como PII, cifrar em repouso no futuro (Postgres + pgcrypto / app-layer AES).
