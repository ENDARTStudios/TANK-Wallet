# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 1 — Hardening de Segurança do Repo (maior impacto, menor complexidade)

**Objetivo:** eliminar segredos versionados, corrigir headers críticos de segurança e habilitar instrumentação mínima de observabilidade sem quebrar o app. É o sprint de menor complexidade com maior redução de risco.

**Issue mãe:** ver `docs/ISSUES-BACKLOG.md` #1, #2, #3 (repo hygiene + HSTS + observabilidade mínima).

### Tarefas

#### T1 — Remover `.env` do git e garantir `.gitignore` (CRÍTICO)
- **Arquivos:** `.env` (remover do índice), `.gitignore`, `.env.example` (já criado), `docs/SECRETS.md`
- **Ações:**
  - `git rm --cached .env`
  - Confirmar `git ls-files .env` vazio
  - Validar `.gitignore` contém `.env` e `.env.*.local`
  - Documentar rotação se o valor já vazou (ver `docs/SECRETS.md` §5)
- **Critério de fechamento:** `git ls-files | grep "^\.env$"` retorna vazio; `gitleaks` verde; PR referencia `Closes #1`
- **Testes:** `gitleaks detect --source . --verbose` sem achado; CI verde

#### T2 — Remover chave PGP privada do repo (ALTO)
- **Arquivos:** `docs/security/pgp-private-key-DELETE-ME.asc` (remover), `docs/security/pgp-key.asc` (manter pública), `docs/SECRETS.md`
- **Ações:**
  - `git rm docs/security/pgp-private-key-DELETE-ME.asc`
  - Gerar nova chave fora do repo se necessário e importar via secrets manager; revogar exposta
  - Se histórico contém a chave, planejar `filter-repo`/`BFG` em sprint dedicado (não neste PR)
- **Critério de fechamento:** arquivo removido do índice; `gitleaks` sem segredo; PR `Closes #2`
- **Testes:** `gitleaks` + `git log --all --full-history -- docs/security/pgp-private-key-DELETE-ME.asc` documentado no PR

#### T3 — HSTS + headers de segurança (MÉDIO)
- **Arquivos:** `next.config.ts`, `Caddyfile`, `docs/SECURITY-GATE.md`
- **Ações:**
  - Adicionar `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` em `next.config.ts:headers()`
  - Atualizar `Caddyfile` para `:443` com `tls` e `header_down Strict-Transport-Security ...` + redirect 80→443 (ou documentar edge externo)
  - Corrigir `typescript.ignoreBuildErrors: false` e `reactStrictMode: true` se não quebrar build (se quebrar, criar issue follow-up)
- **Critério de fechamento:** `curl -I https://localhost` retorna HSTS; `next build` sem `ignoreBuildErrors`; PR `Closes #3`
- **Testes:** `bun run build` verde; E2E Playwright verifica header; Lighthouse sem regressão

#### T4 — Observabilidade mínima (instrumentação + error boundary) (ALTO)
- **Arquivos:** `src/instrumentation.ts` (novo), `src/app/error.tsx`, `src/app/global-error.tsx`, `src/lib/observability/*`, `docs/OBSERVABILITY.md`, `.env.example`
- **Ações:**
  - Criar `instrumentation.ts` chamando `Sentry.init` + `initTracing()` condicional ao DSN
  - Criar `error.tsx`/`global-error.tsx` com `Sentry.captureException` e UI de recuperação
  - Adicionar `NEXT_PUBLIC_SENTRY_DSN` e `OTEL_EXPORTER_OTLP_ENDPOINT` no `.env.example` (sem valor)
- **Critério de fechamento:** `sentryError` dispara em erro simulado; `error.tsx` renderiza fallback; PR `Closes #4`
- **Testes:** `bun test` para logger masking; Playwright E2E que provoca erro e verifica fallback + traceId

### Fora de escopo neste sprint

- Migração para Postgres/RLS (SPRINT-4)
- Rate limiting / WAF / bot fight (SPRINT-4)
- Catálogo modular `src/features/` (SPRINT-5)
- Rotação completa de histórico git com `filter-repo` (sprint dedicado)

### Definição de pronto (DoD)

- [ ] Todos os PRs com `Closes #N` e labels (`security`, `chore`)
- [ ] Deploy gate verde: ESLint, `tsc --noEmit`, `bun test`, Semgrep, CodeQL, Gitleaks, Trivy, SBOM
- [ ] Nenhum segredo em `git ls-files`
- [ ] HSTS presente em resposta HTTPS
- [ ] `error.tsx` cobre rota crítica e Sentry recebe evento de teste
- [ ] Docs vivos atualizados no PR (este SPRINT.md marcado como concluído)
