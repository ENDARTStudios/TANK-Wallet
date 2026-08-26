# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 2 — E2E Playwright + Gate de Qualidade (maior impacto para evitar regressões)

**Objetivo:** garantir que mudanças de UI/segurança não quebrem fluxos críticos e que a cobertura não regrida. É o próximo menor custo com maior proteção contra regressões visuais e de segurança.

**Issues mãe:** `docs/ISSUES-BACKLOG.md` #5, #6, #14

### Tarefas

#### T1 — Playwright E2E (CRÍTICO)
- **Arquivos:** `playwright.config.ts` (novo), `e2e/` (novo), `package.json`, `.github/workflows/ci.yml`, `docs/TESTING.md`
- **Ações:**
  - Instalar `playwright` + `playwright.config.ts` (baseURL `http://localhost:3000`, webServer `next dev`)
  - Criar `e2e/onboarding.spec.ts` (criar wallet → unlock), `e2e/lockdown.spec.ts` (L1-L3), `e2e/security.spec.ts` (HSTS header, error.tsx fallback)
  - Validar que skeleton aparece antes do dado (`[data-skeleton]`) e que animações Motion não quebram em 375/390/768
- **Critério:** `npx playwright test` verde local e CI; screenshots/vídeo em CI
- **Testes:** `bunx playwright test --reporter=list` verde; PR falha se E2E quebrar
- **Ref:** `Closes #5`

#### T2 — Gate Codecov + `test:coverage` (MÉDIO)
- **Arquivos:** `codecov.yml` (novo), `.github/workflows/ci.yml`, `package.json`, `docs/TESTING.md`
- **Ações:**
  - Adicionar step `bun run test:coverage` + upload Codecov no `ci.yml`
  - Configurar `codecov.yml` com alvo 80% em `src/lib` e `status.project.default.threshold: 0%` (não reduzir cobertura)
  - Documentar em `docs/TESTING.md` §5
- **Critério:** PR com queda de cobertura falha; badge Codecov no README
- **Testes:** `bun run test:coverage` gera `coverage/lcov.info`; upload simulado
- **Ref:** `Closes #5` (parte 2)

#### T3 — Rate limiting em `/api/*` (ALTO — segurança)
- **Arquivos:** `src/lib/security/rate-limit.ts` (novo), `src/middleware.ts` (novo), `src/app/api/*/route.ts`, `.env.example`, `docs/SECURITY-GATE.md`
- **Ações:**
  - Implementar token bucket in-memory (fallback Redis) com `API_RATE_LIMIT_PER_MIN=120` (escrita `30/min`)
  - Middleware Next: `X-RateLimit-*` + `429 Retry-After` em `/api/threats/*`, `/api/whois`, `/api/goplus/*`
  - Teste de integração por rota (primeiro `200`, após limite `429`)
- **Critério:** `curl` 121 req/min → `429`; teste reproduz limite; sem regressão em rotas públicas
- **Testes:** `bun test src/lib/security/__tests__/rate-limit.test.ts`
- **Ref:** `Closes #6`

#### T4 — Strict build (`typescript.ignoreBuildErrors` + `reactStrictMode`) (MÉDIO)
- **Arquivos:** `next.config.ts`, `tsconfig.json` (se necessário), `src/lib/db.ts` (já corrigido), `docs/SECURITY-GATE.md`
- **Ações:**
  - `next.config.ts:typescript.ignoreBuildErrors=false`, `reactStrictMode=true` (reverter se quebrar)
  - Corrigir erros de tipo (`any` não justificado, `zod` na entrada)
  - Validar `bunx tsc --noEmit` e `next build`
- **Critério:** `tsc --noEmit` verde; `next build` verde; sem `any` novo
- **Testes:** CI `tsc` + `build` verdes
- **Ref:** `Closes #14`

### Fora de escopo neste sprint

- WAF/bot fight mode (`#7`, SPRINT-3)
- RBAC/RLS (`#8`/`#9`, SPRINT-3) — requer model `User`/`Workspace` e decisão Postgres
- Catálogo modular `src/features/` (`#10`, SPRINT-4)
- SEO/GEO (`#12`) e limpeza Knip (`#13`) — sprint dedicado após gates estáveis

### Definição de pronto (DoD)

- [ ] PRs com `Closes #N` e labels (`testing`, `security`, `chore`)
- [ ] `npx playwright test` verde + Codecov sem queda
- [ ] `429` comprovado em `/api/*` após limite
- [ ] `tsc --noEmit` + `next build` verdes com `strict` ligado
- [ ] Deploy gate verde: ESLint, `tsc`, `bun test`, Playwright, Semgrep, CodeQL, Gitleaks, Trivy, SBOM
- [ ] `error.tsx` + HSTS verificados em E2E
- [ ] Docs vivos atualizados (TESTING, SECURITY-GATE) e SPRINT.md marcado concluído
