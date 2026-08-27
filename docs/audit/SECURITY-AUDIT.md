# Auditoria de Segurança — TANK Wallet (Sprint 5)

> Data: 2026-08-27 · Base: `main:bf4755a` (Sprint 4) · Auditor: skill Segurança (zero-trust)

## Checklist

| Área | Status | Evidência | Impacto | Correção |
| --- | --- | --- | --- | --- |
| Autenticação 401 | ✅ | `src/lib/auth/rbac.ts:31` `requirePermission:401` + testes `src/lib/auth/__tests__/rbac.test.ts:18` | CRÍTICO | OK — `viewer` sem sessão → 401 |
| Autorização 403 | ✅ | `src/lib/auth/rbac.ts:32` `403` + matriz `docs/RBAC.md:25` + teste cross-role `rbac.test.ts:26` | CRÍTICO | OK — `viewer→post_threats_seed 403` |
| RLS workspaceId | ✅ | `prisma/schema.prisma:113` `workspaceId String? + @@index([workspaceId])` x4 models + `src/lib/db/rls.ts:1` `filterByWorkspace 0 rows` + teste `rls.test.ts:18` | ALTO | OK app-layer; Postgres `FORCE RLS` em SPRINT-6 |
| Inputs `zod` | ⚠️ | `src/app/api/*/route.ts` usa `zod` em `wallet-core` mas nem toda rota valida — verificar `src/app/api/threats/*` | MÉDIO | Adicionar `zod` em toda rota de escrita (follow-up #19) |
| Segredos `.env` | ✅ | `git ls-files:.env:0` só `.env.example` (` .gitignore:34` `!.env.example`), `docs/security/pgp-private-key-DELETE-ME.asc:1` removido `b8be531`, `gitleaks` verde (CI `ci.yml:95`) | CRÍTICO | OK — `.env` fora do git |
| Upload | N/A | Sem upload de arquivo no app atual | — | — |
| SQLi / XSS | ✅ | Prisma ORM (`src/lib/db.ts:1` `PrismaClient`) sem query crua; `zod` + `Content-Security-Policy` `next.config.ts:28` | MÉDIO | OK |
| SSRF | ✅ | `src/app/api/whois/route.ts:1` valida URL + RDAP `rdap.org` sem SSRF para `file://` | MÉDIO | OK |
| HSTS | ✅ | `next.config.ts:48` `max-age=63072000` + `Caddyfile:35` `header_down HSTS` + `e2e/security.spec.ts:12` | ALTO | OK |
| Rate limit 429 | ✅ | `src/lib/security/rate-limit.ts:1` token bucket `120/30` + `src/proxy.ts:10` `429 Retry-After` + teste `rate-limit.test.ts:1` 4 pass + `e2e/security.spec.ts:22` | ALTO | OK |
| Bot fight 403 | ✅ | `src/lib/security/bot-guard.ts:1` `analyzeBotSignal` + `src/proxy.ts:12` `BOT_MODE monitor/block` `403 X-Bot-Score` + teste `bot-guard.test.ts:1` 6 pass | MÉDIO | OK |
| CSP / headers | ✅ | `next.config.ts:27` CSP `default-src 'self'` `X-Frame: DENY` `nosniff` `Referrer` `Permissions-Policy` | MÉDIO | OK |
| Sessão | ⚠️ | `next-auth 4.24.11` instalado mas `getSessionContext` stub (`src/lib/auth/rbac.ts:44` lê `x-*-header`) — prod precisa `next-auth` real | MÉDIO | SPRINT-6: ligar `next-auth` + `NEXTAUTH_SECRET` |
| Race condition | ✅ | `src/lib/security/rate-limit.ts:1` `Map` + `checkRateLimit` atômico por `key`; sem `await` race crítico | BAIXO | OK |

## Tentativas "tenta acessar o que não é seu" (reproduzíveis)

| Caso | Papel | Rota | Esperado | Resultado |
| --- | --- | --- | --- | --- |
| `viewer` post seed | viewer | `POST /api/threats/seed` | 403 | `requirePermission viewer post_threats_seed → 403` ✅ |
| Cross-workspace | ws_B | `PermissionAuditLog ws_A` | 0 rows | `filterByWorkspace ws_B → 0` ✅ `rls.test.ts:23` |
| Sem sessão | — | qualquer `post` | 401 | `requirePermission null → 401` ✅ |
| Bot block | curl | `GET /api/threats/token` | 403 em `block` | `bot-guard curl→403` ✅ |
| Rate flood | qualquer | `GET /api/health x121` | 429 | `checkRateLimit 121→429` ✅ |

## Achados abertos (para issues)

- `zod` em toda rota de escrita — criar issue #19
- `next-auth` prod ligar — issue #20 já em backlog #8
- Histórico PGP `filter-repo` — sprint dedicado (fora deste)
