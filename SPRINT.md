# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 4 — SEO/GEO + Limpeza + Finalização Modular

**Objetivo:** fechar SEO técnico (indexabilidade) e dívida de limpeza com baixo risco, completando docs vivos. Último sprint de hardening antes de backend real (Postgres, WalletConnect).

**Issues mãe:** `docs/ISSUES-BACKLOG.md` #10, #12, #13

### Tarefas

#### T1 — SEO/GEO (MÉDIO)
- **Arquivos:** `src/app/layout.tsx`, `src/app/robots.ts` (novo), `src/app/sitemap.ts` (novo), `public/robots.txt` (remover), `docs/SECURITY-GATE.md` (se necessário)
- **Ações:**
  - `layout.tsx`: `metadataBase`, `alternates.canonical`, `openGraph` (pt_BR), `twitter`, `robots index/follow`, `JSON-LD` `SoftwareApplication`
  - `robots.ts`: `allow /`, `disallow /api/,/_next/`, `sitemap: base/sitemap.xml`
  - `sitemap.ts`: `/` + `/#security`
  - Remover `public/robots.txt` estático (App Router gera)
- **Critério:** `curl /robots.txt` contém `Sitemap`, `/sitemap.xml` lista URLs, `view-source` tem `application/ld+json`; Lighthouse SEO 100
- **Testes:** `e2e/seo.spec.ts` (opcional) verifica headers + JSON-LD
- **Ref:** `Closes #12`

#### T2 — Catálogo modular (MÉDIO)
- **Arquivos:** `src/features/README.md` (novo), `docs/ARCHITECTURE-MODULES.md`
- **Ações:**
  - Criar `src/features/` placeholder com estrutura alvo e regras de fronteira
  - Documentar migração incremental em `ARCHITECTURE-MODULES.md`
- **Critério:** `src/features/README.md` existe; `feature-flags.ts` já expandido em Sprint 3
- **Ref:** `Closes #10`

#### T3 — Limpeza (BAIXO)
- **Arquivos:** `docs/CLEANUP-PLAN.md` (novo), `.gitignore`, `next.config.ts` (já corrigido)
- **Ações:**
  - Gerar plano por risco/impacto (ver `CLEANUP-PLAN.md`): `gsap-public` duplicação, `TODO` 0, `knip` próximo
  - Remover `public/robots.txt` duplicado; confirmar `db/custom.db` backup
- **Critério:** `docs/CLEANUP-PLAN.md` com 3 níveis de risco; sem `TODO` sem issue; `knip` report em próximo chore
- **Ref:** `Closes #13`

### Fora de escopo neste sprint

- Migração Postgres `FORCE RLS` — SPRINT-5 (quando multi-tenant)
- WalletConnect v2 + EIP-6963 — SPRINT-5
- Backend Threat Intel real (ChainPatrol etc.) — SPRINT-5

### Definição de pronto (DoD)

- [ ] PR `Closes #10 #12 #13` com labels `seo`, `chore`
- [ ] `/robots.txt` e `/sitemap.xml` acessíveis e corretos
- [ ] `view-source` contém `canonical` + `og:` + `application/ld+json`
- [ ] `src/features/README.md` + `CLEANUP-PLAN.md` existem
- [ ] `bunx tsc --noEmit` verde; `bun test` verde; `next build --webpack` compila
- [ ] Deploy gate verde: ESLint, `tsc`, `bun test`, Playwright, Semgrep, CodeQL, Gitleaks, Trivy, SBOM
- [ ] Docs vivos atualizados e SPRINT.md marcado concluído
