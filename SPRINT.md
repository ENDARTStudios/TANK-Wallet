# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 5 — Auditoria Completa (Segurança + Performance + Banco + SEO + QA hostil)

**Objetivo:** executar as skills de auditoria previstas em `AGENTS.md:5-9` sobre o estado pós-Sprint 4 (`main:bf4755a`). Não é feature, é verificação — gerar evidências, transformar achados em issues/testes reprodutíveis e fechar gaps sem introduzir regressão.

**Issues mãe:** `docs/ISSUES-BACKLOG.md` #1-#14 (re-auditar) + novos achados deste sprint

### Tarefas

#### T1 — Auditoria de Segurança (CRÍTICO)
- **Arquivos:** `docs/audit/SECURITY-AUDIT.md` (novo), `src/lib/auth/__tests__/rbac.test.ts` (já cobre 401/403), `src/lib/db/__tests__/rls.test.ts`, `src/proxy.ts`, `next.config.ts`, `.env.example`, `prisma/schema.prisma`
- **Ações:**
  - Checklist zero-trust: auth (401/403), RBAC (matriz `docs/RBAC.md`), RLS (`workspaceId` + `withWorkspaceFilter`), inputs (`zod` em rotas), secrets (`.env` fora do git, `gitleaks` verde), HSTS (header + Caddy), rate-limit (429), bot (403 `X-Bot-Score`), CSP/X-Frame/nosniff
  - Testes "tenta acessar o que não é seu": `viewer→POST /api/threats/seed 403`, cross-workspace `filterByWorkspace 0 rows`, sem sessão `401`
  - Varredura `grep` por `any` não justificado, `console.log`, `TODO` sem issue
- **Critério:** `docs/audit/SECURITY-AUDIT.md` com tabela impacto/severidade/correção; `bun test rbac+rls+bot+rate` verde; sem segredo em `git ls-files`
- **Ref:** `Closes #15`

#### T2 — Auditoria de Performance (MÉDIO)
- **Arquivos:** `docs/audit/PERFORMANCE-AUDIT.md` (novo), `src/lib/wallet-*`, `src/components/wallet/*`, `next.config.ts`
- **Ações:**
  - Gates: LCP <2.5s, CLS <0.1, Lighthouse CI no PR de UI
  - Procurar: queries repetidas, renders extras, operações bloqueantes, imagens gigantes, JS desnecessário, fontes pesadas, falta de cache (ver `AGENTS.md:6`)
  - Medir `bun run bench` e `reports/` já existentes
- **Critério:** `PERFORMANCE-AUDIT.md` com achados + plano por risco; `tsc` verde
- **Ref:** `Closes #16`

#### T3 — Auditoria de Banco (MÉDIO)
- **Arquivos:** `docs/audit/DB-AUDIT.md` (novo), `prisma/schema.prisma`, `docs/RLS.md`, `docs/disaster-recovery.md`
- **Ações:**
  - Verificar: toda tabela com `workspaceId` tem `@@index([workspaceId])`, queries com `LIMIT`, sem `cascade` perigosa, dados sensíveis cifrados/mascarados
  - Pergunta: "Se precisar restaurar tudo amanhã, existe backup?" — validar `db/custom.db` backup + `disaster-recovery.md` teste no sprint
  - `prisma generate` + `db push` verde
- **Critério:** `DB-AUDIT.md` com checklist + resposta backup; `prisma/schema.prisma` sem tabela sem índice de tenant
- **Ref:** `Closes #17`

#### T4 — SEO/GEO + QA hostil + Limpeza (MÉDIO)
- **Arquivos:** `docs/audit/SEO-AUDIT.md`, `docs/audit/QA-REPORT.md`, `docs/CLEANUP-PLAN.md` (atualizar), `e2e/*.spec.ts`, `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`
- **Ações:**
  - SEO: `title`, `description`, `canonical`, `robots.txt`, `sitemap.xml`, Open Graph, JSON-LD, `view-source` indexável (ver `AGENTS.md:8`)
  - QA hostil: campo vazio, texto gigante, duplo clique, sessão expirada, duas abas, falha API, idempotência, XSS/SQLi stub, upload errado
  - Responsivo 375/390/768 sem overflow; `error.tsx` fallback com `Sentry` + `traceId`
  - Limpeza: `knip`/`depcheck` para órfãos, `console.log` em `src/`, `TODO` sem issue
- **Critério:** `SEO-AUDIT.md` e `QA-REPORT.md` com evidências; `e2e` cobre 375/390/768 + error fallback; sem `console.log` em `src/`
- **Ref:** `Closes #18`

### Fora de escopo neste sprint

- Novas features (WalletConnect, MPC, Lightning) — próximo ciclo
- Migração Postgres `FORCE RLS` — SPRINT-6
- Rotação de histórico git com `filter-repo` para PGP — sprint dedicado

### Definição de pronto (DoD)

- [ ] `docs/audit/*.md` 4 relatórios com impacto/severidade/correção e evidências `file:line`
- [ ] `bun test` 32+ pass (rbac, rls, bot, rate, flags) + `bunx tsc --noEmit:0` + `eslint:0` + `next build --webpack: compiled`
- [ ] `git ls-files:.env:0`, `gitleaks` verde, HSTS + CSP + rate `429` + bot `403` comprovados em `e2e`
- [ ] Backup `db/custom.db` verificável (`disaster-recovery.md`)
- [ ] Sem `console.log` em `src/`, sem `TODO` sem issue, sem `any` não justificado
- [ ] Deploy gate verde: ESLint, `tsc`, `bun test`, Playwright, Semgrep, CodeQL, Gitleaks, Trivy, SBOM
