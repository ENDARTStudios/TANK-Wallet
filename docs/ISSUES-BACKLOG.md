# ISSUES-BACKLOG.md — Issues Prontas para Importação

> `gh` não está disponível neste ambiente; este arquivo é a fonte de verdade para abrir Issues.
> Cada issue abaixo tem `title`, `body` e `labels` prontos. Ao abrir no GitHub, use `Closes #N` no PR correspondente.

> **Como importar quando `gh` estiver disponível:**
> ```bash
> gh issue create --title "..." --body "..." --label "security,bug"
> ```

---

## #1 — [CRÍTICO] Remover `.env` do git e garantir `.gitignore`

- **Labels:** `security`, `bug`, `chore`
- **Branch sugerido:** `chore/issue-1-remove-env-from-git`
- **Body:**
  ```md
  **Contexto:** `AGENTS.md:0` e `docs/SECRETS.md` — `.env` está versionado (`git ls-files .env` confirma) apesar de `.gitignore` conter `.env*`.

  **Tarefa:**
  - `git rm --cached .env`
  - Confirmar `git ls-files .env` vazio
  - Garantir `.gitignore` cobre `.env` e `.env.*.local`
  - Se o valor vazou, rotacionar conforme `docs/SECRETS.md` §5

  **Critério de aceitação:**
  - [ ] `git ls-files | grep "^\.env$"` vazio
  - [ ] `gitleaks detect --source .` sem achado
  - [ ] CI (Gitleaks/CodeQL) verde

  **PR deve conter:** `Closes #1`
  ```

---

## #2 — [ALTO] Remover chave PGP privada do repositório

- **Labels:** `security`, `bug`
- **Branch:** `chore/issue-2-remove-pgp-private-key`
- **Body:**
  ```md
  **Contexto:** `docs/security/pgp-private-key-DELETE-ME.asc` contém chave privada.

  **Tarefa:**
  - `git rm docs/security/pgp-private-key-DELETE-ME.asc`
  - Manter apenas `pgp-key.asc` (pública)
  - Rotacionar e revogar a chave exposta; se necessário, planejar `filter-repo`/`BFG` em sprint dedicado

  **Critério:**
  - [ ] Arquivo removido do índice
  - [ ] `gitleaks` sem segredo
  - [ ] Documentado no PR se histórico precisa de purga

  **PR:** `Closes #2`
  ```

---

## #3 — [MÉDIO] HSTS + TLS + correção de headers

- **Labels:** `security`, `enhancement`
- **Branch:** `feat/issue-3-hsts-tls-headers`
- **Body:**
  ```md
  **Contexto:** `Caddyfile` só escuta `:81` sem TLS; `next.config.ts` não emite HSTS (`docs/SECURITY-GATE.md` §3).

  **Tarefa:**
  - Adicionar `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` em `next.config.ts`
  - Atualizar `Caddyfile` para `:443` com `tls` + `header_down HSTS` + redirect 80→443 (ou documentar edge externo)
  - Corrigir `typescript.ignoreBuildErrors: false` e `reactStrictMode: true` (ou abrir follow-up se quebrar build)

  **Critério:**
  - [ ] `curl -I https://...` retorna HSTS
  - [ ] `next build` sem `ignoreBuildErrors`
  - [ ] Sem regressão Lighthouse

  **PR:** `Closes #3`
  ```

---

## #4 — Observabilidade: `instrumentation.ts` + `error.tsx`/`global-error.tsx` + Sentry/OTel

- **Labels:** `enhancement`, `observability`
- **Branch:** `feat/issue-4-observability-wiring`
- **Body:**
  ```md
  **Contexto:** SDKs instalados mas nunca inicializados (`docs/OBSERVABILITY.md` §1). Sem `error.tsx`.

  **Tarefa:**
  - Criar `src/instrumentation.ts` com `Sentry.init` + `initTracing()` condicional ao DSN
  - Criar `src/app/error.tsx` e `global-error.tsx` com `captureException` + fallback UI
  - Adicionar vars em `.env.example`

  **Critério:**
  - [ ] Erro simulado aparece no Sentry com `traceId`
  - [ ] `error.tsx` renderiza fallback com retry
  - [ ] `logger.ts` mascara segredos

  **PR:** `Closes #4`
  ```

---

## #5 — Testes E2E (Playwright) + gate Codecov

- **Labels:** `enhancement`, `testing`
- **Branch:** `feat/issue-5-playwright-codecov`
- **Body:**
  ```md
  **Contexto:** `docs/TESTING.md` — E2E ausente; `ENGINEERING-STANDARDS.md` prevê Playwright.

  **Tarefa:**
  - Adicionar `playwright.config.ts`, `e2e/` com fluxos críticos (onboarding, scan, lockdown, RBAC)
  - Integrar `codecov` no CI e gate de não-regressão de cobertura

  **Critério:**
  - [ ] `npx playwright test` verde local e CI
  - [ ] `bun run test:coverage` + upload Codecov
  - [ ] PR com queda de cobertura falha

  **PR:** `Closes #5`
  ```

---

## #6 — Rate limiting em `/api/*`

- **Labels:** `security`, `enhancement`
- **Branch:** `feat/issue-6-rate-limit`
- **Body:**
  ```md
  **Contexto:** Nenhum rate limit em `src/app/api/*` (`docs/SECURITY-GATE.md` §2.2).

  **Tarefa:**
  - Implementar `src/lib/security/rate-limit.ts` (token bucket, env `API_RATE_LIMIT_PER_MIN`)
  - Middleware Next + wrapper de rota; `429` com `Retry-After` + `X-RateLimit-*`
  - Teste de integração por rota

  **Critério:**
  - [ ] 120 req/min → `429`
  - [ ] Teste reproduz limite

  **PR:** `Closes #6`
  ```

---

## #7 — WAF / Bot fight mode

- **Labels:** `security`, `enhancement`
- **Branch:** `feat/issue-7-waf-bot-mode`
- **Body:**
  ```md
  **Tarefa:**
  - Implementar `BOT_MODE=monitor|block` (fingerprint UA, headless, `Sec-Fetch`)
  - Edge (Caddy) + middleware Next; log em `monitor`, `403` em `block`
  - Documentar em `docs/SECURITY-GATE.md`

  **Critério:**
  - [ ] Bot simulado logado em `monitor`
  - [ ] Bloqueado em `block`

  **PR:** `Closes #7`
  ```

---

## #8 — RBAC: middleware + `requirePermission` + testes

- **Labels:** `security`, `enhancement`
- **Branch:** `feat/issue-8-rbac`
- **Body:**
  ```md
  **Contexto:** `docs/RBAC.md` — matriz definida, sem implementação.

  **Tarefa:**
  - Model `User`/`Workspace` no Prisma (com `workspaceId`, `role`)
  - `requirePermission(perm, ctx)` + `401`/`403` + testes por (rota × papel) — "tenta acessar o que não é seu"

  **Critério:**
  - [ ] `viewer` não acessa rota admin (`403`)
  - [ ] Sem sessão → `401`

  **PR:** `Closes #8`
  ```

---

## #9 — RLS: `workspace_id` + políticas (prep Postgres)

- **Labels:** `security`, `enhancement`, `database`
- **Branch:** `feat/issue-9-rls-workspace`
- **Body:**
  ```md
  **Contexto:** SQLite não tem RLS nativo (`docs/RLS.md`). App layer filtra hoje.

  **Tarefa:**
  - Adicionar `workspaceId` em `PermissionAuditLog`, `Behavior*`, `RecoveryContact`
  - Middleware injeta `workspaceId` do contexto; todo repo filtra
  - ADR para migração Postgres + políticas `FORCE RLS` (futuro)

  **Critério:**
  - [ ] Tentativa de ler registro de outro workspace retorna 0 rows
  - [ ] Índice em `workspaceId`

  **PR:** `Closes #9`
  ```

---

## #10 — Catálogo modular + feature flags (`src/features`)

- **Labels:** `enhancement`, `architecture`
- **Branch:** `feat/issue-10-modular-catalog`
- **Body:**
  ```md
  **Contexto:** `docs/ARCHITECTURE-MODULES.md` — hoje `wallet-*` e `components/wallet/*` sem catálogo `src/features/`.

  **Tarefa:**
  - Criar `src/features/` com fronteiras + `feature-flags.ts` (tier × flag)
  - Documentar catálogo e regras de import

  **Critério:**
  - [ ] Nenhum import cruzado viola fronteira (`scripts/verify/`)
  - [ ] Flag nova `off` por padrão, liberada por env

  **PR:** `Closes #10`
  ```

---

## #11 — Motion & UX compliance (skeleton, lazy, animações)

- **Labels:** `enhancement`, `ux`
- **Branch:** `feat/issue-11-motion-ux`
- **Body:**
  ```md
  **Contexto:** `AGENTS.md:3.5` + `docs/OBSERVABILITY.md` — Motion Principles + UI/UX Pro Max.

  **Tarefa:**
  - Skeleton/placeholder em todo dashboard e lista
  - Lazy-loading de rota/imagem/dado pesado
  - Animações suaves entrada/saída (Framer Motion/GSAP — escolher 1, não empilhar)
  - Responsivo 375/390/768 sem overflow; teclado não cobre form; AA + foco visível + ARIA

  **Critério:**
  - [ ] Playwright asserta skeleton antes do dado
  - [ ] Lighthouse sem CLS regressão

  **PR:** `Closes #11`
  ```

---

## #12 — SEO/AEO/AIO/GEO + sitemap/robots

- **Labels:** `enhancement`, `seo`
- **Branch:** `feat/issue-12-seo-geo`
- **Body:**
  ```md
  **Tarefa:**
  - `title`, `description`, `canonical`, `robots.txt`, `sitemap.xml`, Open Graph, JSON-LD
  - Validar com OpenSeo/Screaming Frog MCP; garantir indexabilidade

  **Critério:**
  - [ ] `robots.txt` + `sitemap.xml` acessíveis
  - [ ] Sem página bloqueada por engano

  **PR:** `Closes #12`
  ```

---

## #13 — Limpeza (Knip, dead code, CSS, assets, deps)

- **Labels:** `chore`
- **Branch:** `chore/issue-13-cleanup`
- **Body:**
  ```md
  **Contexto:** `AGENTS.md:9` skill Limpeza.

  **Tarefa:**
  - Rodar Knip/Biome para órfãos; remover mocks de produção, TODOs, `console.log`
  - Plano por risco/impacto antes de apagar

  **Critério:**
  - [ ] `knip` sem achados críticos
  - [ ] Sem `console.log` em `src/`

  **PR:** `Closes #13`
  ```

---

## #14 — Fix `tsconfig`/`next.config` (strict mode)

- **Labels:** `chore`, `enhancement`
- **Branch:** `chore/issue-14-strict-build`
- **Body:**
  ```md
  **Tarefa:**
  - `typescript.ignoreBuildErrors: false`
  - `reactStrictMode: true`
  - Corrigir erros de tipo expostos; remover `any` não justificado

  **Critério:**
  - [ ] `tsc --noEmit` verde
  - [ ] `next build` verde

  **PR:** `Closes #14`
  ```

---

## Notas de processo

- Todo PR deve conter `Closes #N` e atualizar docs vivos (`AGENTS.md:10`).
- Deploy gate: sem `green` (ESLint, `tsc`, `bun test`, Semgrep, CodeQL, Gitleaks, Trivy, SBOM) — sem merge.
- Este arquivo é a fonte quando `gh` não existe; quando existir, importar com `gh issue create`.
