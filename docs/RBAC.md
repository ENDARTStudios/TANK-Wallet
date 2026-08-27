# TANK Wallet — RBAC (Matriz de Níveis de Acesso)

> Status: Design (a implementar em `PRD FR-SEC-06`). Idioma: pt-BR.

## 1. Modelado de papel

Os papéis derivam de **duas dimensões ortogonais**:
1. **Tier do plano** (recursos): `free`, `pro`, `enterprise-starter/business/custom`.
2. **Função** (scopes de ação): `viewer`, `member`, `admin`, `security`, `owner`.

Um "nível de acesso" é a combinação `tier × função`.

| Papel | Descrição | View (leitura) | Mutate (escrita) |
| --- | --- | --- | --- |
| `viewer` | Somente leitura (ex.: auditor de terceiros, sócio) | Tudo do workspace | Nenhum |
| `member` | Operador padrão da carteira | Próprio workspace | Operações no próprio workspace (assinaturas, revogações) |
| `admin` | Gerente do workspace | Todo workspace | Configurações, membros, padrões de risco |
| `security` | Analista de riscos | Todo workspace | Padrões de risco, blocklist, lockdown global |
| `owner` | Proprietário | Todo workspace | Tudo incl. exclusão, billing, integrações, rotação de chaves |

## 2. Matriz de permissões (permissão × papel)

`X` = permitido · `—` = negado por default

| Permissão | viewer | member | admin | security | owner |
| --- | --- | --- | --- | --- | --- |
| Ver resumo do portfólio | X | X | X | X | X |
| Assinar transação (send) | — | X | — | — | X |
| Revogar 1 aprovação | — | X | X | X | X |
| Lockdown (próprio) | — | X | X | X | X |
| Lockdown global (workspace) | — | — | X | X | X |
| Alterar blocklist | — | — | X | X | X |
| Concluir/membros (revogar/alterar por) | — | — | X | — | X |
| Conferir tier/upgrade (billing) | — | — | X | — | X |
| Exportar logs de auditoria | — | — | X | X | X |
| Aplainar-remover dados / workspace | — | — | — | — | X |

## 3. Mapeamento por recurso (rota / API)

| Recurso | viewer | member | admin | security | owner |
| --- | --- | --- | --- | --- | --- |
| `GET /api/health` | X | X | X | X | X |
| `GET /api/metrics` | — | — | X | X | X |
| `GET /api/threats/*` | X | X | X | X | X |
| `POST /api/threats/*` (seed) | — | — | X | X | X |
| `GET /api/whois` | X | X | X | X | X |
| `POST /send` (sign) | — | X | — | — | X |
| `POST /lockdown` | — | X | X | X | X |

## 4. Abordagem de implementação (futuro)

- `User` model (Prisma) com `workspaceId`, `role`, `tier`.
- Middleware/rotas: resolver `getServerSession` (next-auth) → `requirePermission(permission, ctx)`.
- Códigos de resposta: `401` (não autenticado), `403` (sem permissão).
- **Deny-by-default:** toda permissão ausente na matriz é negada.
- Teste: todo par (rota × papel) tem um teste de autorização (ver `docs/TESTING.md`).

## 5. RBAC multi-tenant + RLS

- Escreve por `workspaceId`.
- Read-only por `user.id` a `workspaceId`.
- Leia `docs/RLS.md` para a implementação de segregar de dados.
