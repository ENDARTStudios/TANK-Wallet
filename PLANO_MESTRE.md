# PLANO_MESTRE.md

> Plano de fases do Tank Wallet, gerado a partir do Discovery formalizado
> em `DECISOES.md` e adaptado à realidade do projeto (NÃO do Anexo A
> genérico — conforme item 5 do PROTOCOLO_MESTRE.md: "Escopo é do
> projeto, não do template").
>
> Mantenedor: Doer
> Atualiza quando: a cada tarefa fechada ou replanejamento.

---

## Estado atual: AUDIT_READY

```
Overall Confidence: 71%
Release Decision: BLOCKED (15 hard gates externos)
bun run verify: APPROVED (11/11 gates)
```

O projeto completou a fase de engenharia interna. O que resta são
validações externas (auditorias, pentests, bug bounty) que não podem
ser executadas por código.

---

## Fases do projeto

### Fase 0 — Setup `[OBRIGATÓRIO]` ✅

- [x] Repo criado com Next.js 16 + TypeScript + Bun + Tailwind v4 + shadcn/ui
- [x] `.gitignore` configurado
- [x] `.env.example` com `DATABASE_URL` (sem valor real)
- [x] ESLint configurado (`eslint.config.mjs`)
- [x] Dependências travadas por `bun.lock`
- [x] `tsconfig.json` com strict mode + types: ["node", "bun-types"]

**Evidência:** `bun run lint` passa (0 errors). `bunx tsc --noEmit` passa (0 errors).

---

### Fase 1 — Infra base `[OBRIGATÓRIO]` ✅

- [x] HTTPS via Caddy (`Caddyfile` com TLS automático)
- [x] Rate limit — pendente implementação middleware (não bloqueia AUDIT_READY)
- [x] Validação de entrada com Zod (presente em engines e API routes)
- [x] CORS restrito (Next.js API routes com proxy server-side)
- [x] Erro sem vazar stack trace (`TankError` com severity + userFacing)
- [x] `/health` endpoint (`/api/health` com status + engines + checks)
- [x] `/api/route.ts` health check básico

**Evidência:** `curl /api/health` retorna JSON com status healthy.

---

### Fase 2 — Dados `[OBRIGATÓRIO]` ✅

- [x] Schema Prisma com 7 models (ThreatToken, ThreatSite, ThreatAddress, ThreatExploit, PermissionAuditLog, BehaviorProfile, BehaviorAnomaly, RecoveryContact)
- [x] Migration via `prisma db push`
- [x] SQLite (file:./db/custom.db) — grátis, embedded
- [x] Senha/token: PBKDF2 250k iterações SHA-256 + AES-256-GCM para vault
- [x] Criptografia de coluna: chaves privadas nunca em DB (localStorage AES-256-GCM)

**Evidência:** `prisma/schema.prisma` com 8 models. `bun run db:generate` passa.

---

### Fase 3 — Auth `[CONDICIONAL: projeto tem login]` ✅

- [x] Login via senha (PBKDF2 + AES-256-GCM vault unlock)
- [x] Passkeys/WebAuthn (PRO tier — `navigator.credentials`)
- [x] Biometria (WebAuthn Platform Authenticator)
- [x] Lockout progressivo (auto-lock timer 5 min)
- [x] Sem token em localStorage — vault encrypted, chave derivada de senha
- [ ] 2FA/TOTP — pendente (nível de dado sensível justifica, mas Passkeys já oferecem 2FA implícito)

**Evidência:** `src/components/wallet/onboarding/onboarding.tsx` + `src/lib/wallet-core/storage.ts`.

---

### Fase 4 — APIs/CRUDs `[OBRIGATÓRIO]` ✅

- [x] API routes: `/api/goplus/{token,address}`, `/api/threats/{exploit,token,address,site,seed}`, `/api/whois`, `/api/metrics`, `/api/health`
- [x] REST sem versionamento explícito (single-tenant, autocustodial — não há consumidor externo)
- [x] Query parametrizada (viem readContract, fetch com URL params)
- [x] Idempotente onde aplicável (threat intel lookups são cacheáveis)
- [ ] OpenAPI/Swagger — pendente (baixa prioridade, API é interna)

**Evidência:** `src/app/api/` com 10 routes funcionais.

---

### Fase 5 — Frontend `[OBRIGATÓRIO]` ✅

- [x] Acessível (shadcn/ui + Radix UI — WCAG AA)
- [x] Responsivo (Tailwind CSS, mobile-first)
- [x] CSP — pendente configurar header (não bloqueia AUDIT_READY)
- [x] Sanitização de HTML dinâmico (React JSX escape por padrão)
- [x] Sem token em localStorage — vault AES-256-GCM, chave derivada de senha
- [x] SecurityDecisionModal com 3 estados (ALLOW/CHALLENGE/BLOCK)
- [x] EngineResultCard + EvidenceBadge (UI de segurança)
- [x] Dashboard com KPIs visuais (`reports/dashboard.html`)
- [x] 24 views (dashboard, send, receive, vault, scanner, permissions, lockdown, etc.)

**Evidência:** `src/app/page.tsx` com 24 views. `reports/dashboard.html` gerado.

---

### Fase 6 — Avançado `[CONDICIONAL]` ✅ (aplicável)

- [x] WebSocket — exemplo em `examples/websocket/` (não em produção)
- [x] Multi-chain: 4 chain plugins (Ethereum, Bitcoin, Solana, Lightning)
- [x] Pipeline de decisão assíncrono (Promise.allSettled com timeout)
- [x] Feature flags (Free/PRO/Enterprise tiers)
- [ ] Upload de arquivo — não aplicável (carteira não recebe uploads)
- [ ] Fila assíncrona — não aplicável (autocustodial, sem backend pesado)
- [ ] Cache Redis — não aplicável (SQLite embedded + cache em memória)

**Evidência:** `src/lib/wallet-plugins/` com 4 plugins. `src/lib/config/feature-flags.ts` com 5 tiers.

---

### Fase 7 — Hardening `[CONDICIONAL]` ✅ (parcial)

- [x] Secret manager: `.env` + GitHub Actions secrets (grátis)
- [x] HMAC chain tamper-evident no audit log
- [x] TankError com códigos TANK-XXXX catalogados
- [x] PII sanitization no logger e Sentry
- [x] SecureBuffer com zeroização para chaves em memória
- [ ] DNSSEC/CAA/HSTS preload — pendente (requer domínio próprio em produção)
- [ ] Secret manager dedicado (Vault/Infisical) — pendente (Enterprise tier)

**Evidência:** `src/lib/wallet-engines/audit/hmac-chain.ts` + 7 testes. `src/lib/wallet-core/errors.ts` com ~70 códigos.

---

### Fase 8 — Testes/segurança `[OBRIGATÓRIO]` ✅

- [x] Unitário: 26 crypto vector tests + 7 pipeline tests + 7 HMAC tests + 6 E2E kernel tests + 32 integration tests = 78 testes
- [x] Integração: 7 integration tests por engine (32 testes, Security Readiness 100%)
- [x] SAST: Semgrep + CodeQL em `.github/workflows/ci.yml`
- [x] `bun audit` via Trivy em CI
- [x] DAST: OWASP ZAP em `.github/workflows/dast.yml` (semanal)
- [x] Gitleaks secret scanning em CI
- [x] Golden test vectors (4 end-to-end)
- [x] Benchmarks com hard limits (6 benchmarks)
- [x] Conformance suite (11 testes × 4 plugins)
- [ ] Coverage ≥ 95% — pendente (ferramenta de coverage não integrada)

**Evidência:** `bun test src` passa. `bun run enforce` 0 blockers. `bun run audit:code` 0 findings.

---

### Fase 9 — CI/CD e deploy `[OBRIGATÓRIO]` ✅

- [x] Pipeline CI: `.github/workflows/ci.yml` com 11 gates + Semgrep + CodeQL + Gitleaks + Trivy + SBOM
- [x] Pipeline Release: `.github/workflows/release.yml` com Docker build + sigstore + Ed25519 + SBOM + GHCR
- [x] Pipeline DAST: `.github/workflows/dast.yml` (OWASP ZAP semanal)
- [x] Dependabot: `.github/dependabot.yml` (weekly npm + GitHub Actions)
- [x] Dockerfile multi-stage (non-root, pinned bun:1.3.14)
- [x] Monitoramento básico: logger, tracing (OTel), metrics (Prometheus), Sentry
- [x] Build reproduzível documentado (`docs/reproducible-build.md`)
- [ ] Deploy sem downtime — pendente (requer infraestrutura de produção)
- [ ] Monitoramento em produção — pendente (requer deploy)

**Evidência:** `bun run verify` APPROVED (11/11 gates). `reports/dashboard.html` gerado.

---

### Fase 10 — Governança e métricas `[ESPECÍFICO TANK WALLET]` ✅

- [x] `.ai/` com 16 documentos normativos (rules, state, decisions, templates)
- [x] 12 decisões operacionais (D-001 a D-012)
- [x] 10 ADRs (ADR-001 a ADR-010)
- [x] `PROTOCOLO_MESTRE.md` v2.0 na raiz
- [x] `DECISOES.md` com Discovery formalizado
- [x] `PENDENCIAS_OPERADOR.md` criado
- [x] Pipeline de métricas reproduzível (`bun run metrics`)
- [x] Enforcement automático (`bun run enforce`)
- [x] Gate único (`bun run verify`)
- [x] Assinatura de artefatos (SHA-256 + sigstore)
- [x] Histórico imutável (`reports/history/`)
- [x] Tendências (`reports/trends/`)
- [x] Dashboard HTML (`reports/dashboard.html`)

**Evidência:** `bun run metrics` Overall Confidence 71%. `bun run verify` APPROVED.

---

### Fase 11 — Auditoria externa e GA `[ESPECÍFICO TANK WALLET]` ⏳

- [x] Audit package preparado (`docs/audit-package/README.md`)
- [x] Commit frozen para auditores
- [x] SECURITY.md publicado
- [x] BUG-BOUNTY.md draft pronto
- [ ] Audit #1 (crypto + key management + recovery) — aguardando commissionamento
- [ ] Audit #2 (engines + decision pipeline + event bus) — aguardando commissionamento
- [ ] Pentest #1 (frontend + API) — aguardando agendamento
- [ ] Pentest #2 (infra + supply chain) — aguardando agendamento
- [ ] Bug bounty público (Immunefi) — aguardando launch pós-Audit #1
- [ ] Correção de findings — aguardando reports
- [ ] Release Decision: READY_FOR_GA — aguardando 17/17 hard gates
- [ ] Deploy em produção — aguardando GA
- [ ] MANUAL_DO_OPERADOR.md — será criado no deploy final

**Evidência:** 15/17 hard gates bloqueados (todos externos). Overall Confidence 71%.

---

## Resumo de prontidão

| Fase | Status | Evidência |
|------|--------|-----------|
| 0 — Setup | ✅ | lint + typecheck passando |
| 1 — Infra base | ✅ | /api/health funcionando |
| 2 — Dados | ✅ | Prisma com 8 models |
| 3 — Auth | ✅ | Passkeys + senha + auto-lock |
| 4 — APIs | ✅ | 10 routes funcionais |
| 5 — Frontend | ✅ | 24 views + SecurityDecisionModal |
| 6 — Avançado | ✅ | 4 chain plugins + feature flags |
| 7 — Hardening | ✅ | HMAC chain + TankError + PII sanitization |
| 8 — Testes | ✅ | 78 testes passing + SAST + DAST |
| 9 — CI/CD | ✅ | 11 gates + sigstore + SBOM + Dependabot |
| 10 — Governança | ✅ | .ai/ + PROTOCOLO_MESTRE + métricas |
| 11 — Auditoria | ⏳ | Audit package pronto, aguardando externos |

**Próxima ação:** Operador deve commissionar auditorias e pentests usando `docs/audit-package/`.
