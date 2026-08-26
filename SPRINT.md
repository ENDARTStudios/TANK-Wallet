# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 3 — WAF/Bot Fight + RBAC/RLS Foundation + Catálogo Modular

**Objetivo:** fechar a superfície de ataque de rede (bot) e fundar isolamento multi-tenant (RBAC + RLS app-layer) sem migrar para Postgres ainda. Maior impacto em segurança após rate-limit, com complexidade média e reversível.

**Issues mãe:** `docs/ISSUES-BACKLOG.md` #7, #8, #9, #10

### Tarefas

#### T1 — WAF / Bot fight mode (MÉDIO)
- **Arquivos:** `src/lib/security/bot-guard.ts` (novo), `src/lib/security/__tests__/bot-guard.test.ts` (novo), `src/proxy.ts`, `.env.example`, `docs/SECURITY-GATE.md`
- **Ações:**
  - Implementar `analyzeBotSignal(req)` — UA vazio/suspeito (`curl`, `python`, `headless`, `puppeteer`), `Sec-Fetch-*` ausente, `X-Forwarded-For` anômalo, ausência de `Accept-Language`
  - `BOT_MODE=monitor` → loga `warn` com `botScore`; `BOT_MODE=block` → `403` com `X-Bot-Score`
  - Integrar em `src/proxy.ts` antes do rate-limit; não bloquear `/api/health`
  - Env `BOT_MODE` em `.env.example`
- **Critério:** `BOT_MODE=monitor` loga bot simulado; `BOT_MODE=block` retorna `403` para `User-Agent: curl/8.0`; teste reproduz
- **Testes:** `bun test src/lib/security/__tests__/bot-guard.test.ts` 6 pass
- **Ref:** `Closes #7`

#### T2 — RBAC foundation (ALTO)
- **Arquivos:** `prisma/schema.prisma` (novos models `Workspace`, `User`), `src/lib/auth/rbac.ts` (novo), `src/lib/auth/__tests__/rbac.test.ts` (novo), `docs/RBAC.md`
- **Ações:**
  - Prisma: `Workspace { id, name, tier, createdAt }`, `User { id, email, role, tier, workspaceId→Workspace, createdAt }`, `role` enum `viewer|member|admin|security|owner`
  - `src/lib/auth/rbac.ts`: `ROLE_PERMISSIONS`, `hasPermission(role, perm)`, `requirePermission(ctx, perm)` → `401`/`403`, `deny-by-default`
  - Helper `getSessionContext(req)` stub (lê `x-workspace-id` + `x-user-role` headers para teste; prod usará `next-auth`)
- **Critério:** `viewer` não acessa `POST /api/threats/seed` (`403`), sem sessão → `401`, `owner` passa; `bun test rbac` verde
- **Testes:** `bun test src/lib/auth/__tests__/rbac.test.ts` cobrindo matriz `viewer/member/admin/security/owner`
- **Ref:** `Closes #8`

#### T3 — RLS app-layer (MÉDIO)
- **Arquivos:** `prisma/schema.prisma` (add `workspaceId` em `PermissionAuditLog`, `BehaviorProfile`, `BehaviorAnomaly`, `RecoveryContact` + índices), `src/lib/db/rls.ts` (novo), `src/lib/db/__tests__/rls.test.ts` (novo), `docs/RLS.md`
- **Ações:**
  - Add `workspaceId String?` + `@@index([workspaceId])` nos 4 models; manter compat com dados existentes (nullable)
  - `src/lib/db/rls.ts`: `withWorkspaceFilter(workspaceId, where)` + `assertSameWorkspace(recordWorkspaceId, ctx)`
  - Migrar com `prisma db push` (SQLite compat)
- **Critério:** registro de `workspace-A` não é visível com `workspace-B`; `bun test rls` verde; `prisma generate` verde
- **Testes:** `bun test src/lib/db/__tests__/rls.test.ts`
- **Ref:** `Closes #9`

#### T4 — Catálogo modular + feature flags (MÉDIO)
- **Arquivos:** `src/lib/config/feature-flags.ts` (expandir), `src/lib/config/__tests__/feature-flags.test.ts` (novo), `docs/ARCHITECTURE-MODULES.md`
- **Ações:**
  - Expandir `feature-flags.ts`: `FeatureFlagKey` (`owl_behavior`, `persistence_recovery`, `admin_rbac`, `bot_mode`) + `isFeatureOn(flag, ctx)` (env > banco override > default) + `getVisibleEngines` já existe
  - Teste cobrindo `tier × flag`
- **Critério:** `isFeatureOn` respeita env e override; `bun test feature-flags` verde
- **Ref:** `Closes #10`

### Fora de escopo neste sprint

- WAF edge avançado (Cloudflare) — futuro
- Migração Postgres `FORCE RLS` — SPRINT-4 (quando multi-tenant real)
- `next-auth` completo + OAuth — SPRINT-4
- SEO/GEO `#12` e Knip `#13` — sprint dedicado após gates

### Definição de pronto (DoD)

- [ ] PRs `Closes #7 #8 #9 #10` com labels `security`
- [ ] `bun test src/lib/security/__tests__/bot-guard.test.ts` + `rbac` + `rls` + `feature-flags` verdes
- [ ] `bunx tsc --noEmit` verde; `next build --webpack` compila (Turbopack proxy ok)
- [ ] `/api/health` livre de bot/rate; `/api/threats/seed` exige `security|admin|owner` (`403` caso contrário)
- [ ] `workspaceId` filtra 0 rows em tentativa cross-tenant
- [ ] Deploy gate verde: ESLint, `tsc`, `bun test`, Playwright, Semgrep, CodeQL, Gitleaks, Trivy, SBOM
- [ ] Docs vivos atualizados (RBAC, RLS, SECURITY-GATE, ARCHITECTURE-MODULES) e SPRINT.md marcado concluído
