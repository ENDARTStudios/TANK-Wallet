# Changelog
## [1.2.1] — 2026-08-30 — Hotfix
### Added
- **Sprint 41**: `.github/workflows/release.yml` remove duplicate env; `.github/workflows/restore-e2e.yml` folded scalar; `.gitleaks.toml` config + allowlist + private key rule
- **Sprint 42**: `scripts/verify/index.ts` 11/11 ✅ APPROVED (lint/typecheck/tests/conformance/metrics/audit:code/sbom/secrets-scan/dep-scan/enforce/signature-verify); `hasTool()` helper; `scripts/sbom.{sh,ps1}` fallback npx
- **Sprint 43**: `src/lib/observability/init.ts` initObservability real (dsn, env, release, sampleRate, otlpEndpoint) lazy + idempotente; `src/instrumentation.ts` wire; `traceid.getTraceId()` helper
- **Sprint 44**: `render.yaml` (Docker + healthcheck /api/health + 12 env + tankwallet.dev); 4 lint warnings em `observability/{sentry,tracing,metrics}.ts` + `scripts/backup-restore.ts` corrigidos
### Fixed
- 4 lint warnings → 0 (lint:0 errors 0 warnings)
- verify gate 11/11 ✅
- viem + @noble/curves compat (`@noble/curves@2.4.0`)

## [1.2.0] — 2026-08-30 — Sprints 28-40
### Added
- **Sprint 28**: `scripts/apply-rls.ts` applyRls/countRlsStatements (3 tests), `scripts/migrate-deploy.ts` migrateDeploy Postgres
- **Sprint 29**: `.github/workflows/lighthouse.yml` treosh/lighthouse-ci-action + `e2e/lighthouse-budget.spec.ts` (2 tests)
- **Sprint 30**: `src/lib/observability/sentry-real.ts` initSentry/captureException (4 tests), `traceid.ts` withTraceId/withTraceIdAsync (4 tests)
- **Sprint 31**: `src/lib/wallet-connect/provider.ts` createWCProvider/buildConnectionUri (4 tests), `session-store.ts` save/load/clear (4 tests)
- **Sprint 32**: `src/lib/webauthn/register.ts` generateChallenge/buildAttestationOptions/verifyAttestation (4 tests), `login.ts` buildAssertionOptions/verifyAssertion (3 tests)
- **Sprint 33**: `scripts/backup-cron.sh` SQLite/Postgres + openssl AES-256 + S3 stub + retention 30d; `.github/workflows/restore-e2e.yml` weekly Monday 06:00 UTC
- **Sprint 34**: `.github/workflows/cosign.yml` build GHCR + cosign keyless sign + verify; `sbom-cyclonedx.yml` CycloneDX 1.5 + artifact 90d
- **Sprint 35**: `audit-config/trail-of-bits-engagement.md` scope + deliverables + cronograma 4 weeks + SLA; `findings-tracker.md` status/SLA/PR
- **Sprint 36**: `src/i18n/config.ts` LOCALES + DEFAULT_LOCALE + loadMessages/getMessage (5 tests); `messages/{pt-BR,en-US,es-ES}.json` 14 chaves cada
- **Sprint 37**: `public/manifest.json` standalone + theme #10b981 + shortcuts; `public/sw.js` cache-first + offline fallback; `e2e/pwa.spec.ts` (2 tests)
- **Sprint 38**: `src/lib/billing/stripe.ts` createCheckoutSession/verifyWebhookSignature (4 tests); `src/app/api/billing/webhook/route.ts` POST
- **Sprint 39**: `src/lib/metrics/dashboard.ts` rps/errorRate/p95/activeUsers (4 tests); `src/app/api/dashboard/route.ts` GET; `src/app/api/metrics/prometheus/route.ts` Prometheus exposition
- **Sprint 40**: `docs/HANDOFF.md` arquitetura + onboarding + runbooks + contatos + links

## [1.1.1] — 2026-08-30 — Hotfix
### Added
- `src/lib/observability/redact.ts`: `redactSecrets`/`redactObject` para mascarar tokens/emails/private keys em logs
- `e2e/smoke.spec.ts`: smoke tests (home, /api/health, sitemap, robots, HSTS)
- `scripts/deploy-preflight.sh`: tsc/lint/test/audit/verify/secrets/tag check
- `dast-config/zap-baseline.yaml`: OWASP ZAP baseline scan
- `docs/RELEASE-CHECKLIST.md`: checklist final v1.1.0
- `docs/HSTS-PRELOAD.md`: checklist submissão 2027-02
- `docs/audit/AUDIT-CLOSURE.md`: APPROVED v1.1.0
- `knip.json`: config dead code
- `public/og.png`: placeholder 1200x630
- `src/lib/crypto/pii.ts`: encryptPII/decryptPII
- `src/lib/crypto/shamir.ts`: Shamir SSS GF(256)
- `src/lib/crypto/threshold-ssa.ts`: Threshold signatures
- `src/lib/mpc/hsm.ts`: HsmProvider
- `src/lib/account-abstraction/v0.7.ts`: packUserOp EntryPoint v0.7
- `src/lib/notifications/prod.ts`: sendWebPush
- `src/lib/sync/crypted.ts`: encryptSync keystream
- `src/lib/watchtower/index.ts`: watchTransaction
- `src/lib/risk-service/aggregator.ts`: Blowfish/Tenderly/ChainPatrol
- `src/lib/ai-risk/index.ts`: scoreRisk features
- `src/lib/lightning/lnd.ts`: openChannel/closeChannel
- `src/lib/auth/oauth.ts`: Google/Apple providers
- `src/lib/auth/totp.ts`: RFC 6238 base32
- `src/lib/threat-intel/aggregator.ts`: aggregator multi-source
- `src/lib/broadcast/index.ts`: eth_sendRawTransaction
- `src/lib/indexer/index.ts`: Alchemy/Helius/Blockstream
- `src/lib/signing/{psbt,solana,eip712}.ts`: PSBT/Solana/EIP-712
- `src/lib/vault/evolution.ts`: k-of-n Timelock
- `src/lib/lightning/index.ts`: BOLT-11 + submarineSwap
- `src/lib/account-abstraction/index.ts`: UserOperation
- `src/lib/mpc/index.ts`: MPC + passkey
- `src/lib/social-recovery/index.ts`: k-of-n recovery
- `src/lib/behavior-ai/index.ts`: anomaly detection
- `src/lib/notifications/index.ts`: subscribePush
- `src/lib/sync/index.ts`: syncPortfolio
- `src/features/threat-intel/index.ts`: primeiro módulo migrado
- `prisma/rls.sql`: 6 policies FORCE RLS
- `prisma/schema.postgres.prisma`: provider postgresql
- `scripts/backup-restore.ts`: backup/restore helpers
- `scripts/migrate-sqlite-to-postgres.ts`: migration
- `src/lib/db/rls.ts`: withWorkspaceFilter/assertSameWorkspace
- `src/lib/config/feature-flags.ts`: FeatureFlagKey + isFeatureOn

## [1.1.0] — 2026-08-30 — Sprints 1-22
### Added
- **Sprint 1-2 (hygiene + E2E)**: `.env` fora do git, PGP privada removida, HSTS, `error.tsx`+`global-error.tsx`, `instrumentation.ts` Sentry/OTel, Playwright E2E (chromium/mobile-375/tablet-768), Codecov gate, rate-limit 120/30, strict TypeScript
- **Sprint 3-4 (WAF/RBAC/RLS/SEO)**: WAF/Bot `BOT_MODE`, RBAC `Workspace`/`User`+`requirePermission` 401/403, RLS `workspaceId`+`filterByWorkspace`, feature flags tier, SEO robots/sitemap/canonical/OG/JSON-LD
- **Sprint 5 (auditoria)**: `docs/audit/{SECURITY,PERFORMANCE,DB,SEO}-AUDIT.md` + `QA-REPORT.md`
- **Sprints 6-8 (Postgres/AA/MPC)**: `docker-compose.yml` Postgres 16, `prisma/rls.sql` 6 policies FORCE RLS, `next-auth` CredentialsProvider+JWT, WalletConnect v2, EIP-6963 announce/request, Risk Service aggregator (GoPlus/ChainPatrol/ScamSniffer)
- **Sprints 9-10 (Broadcast/Signing)**: `eth_sendRawTransaction` failover Alchemy→Infura, Indexer (Alchemy/Helius/Blockstream), PSBT/Solana VersionedTx/EIP-712, Vault Evolution k-of-n/Timelock/SpendingLimit
- **Sprints 11-12 (Lightning/AA/MPC/Social)**: Lightning BOLT-11+submarineSwap, ERC-4337 `UserOperation`+paymaster, MPC 2-of-2+passkey, Social Recovery k-of-n, Behavioral AI lockdown
- **Sprints 13-14 (Notifications/Helius/VAPID)**: `subscribePush`/`sendPush`/`getSyncStatus`, Helius API real, VAPID keys, Notifications route
- **Sprints 15 (LND+Bundler)**: LND `openChannel/closeChannel/listChannels`, Bundler `sendUserOperation`/`estimateUserOpGas`/`sponsorWithPaymaster`
- **Sprints 16-17 (Crypto/MPC HSM)**: Shamir SSS GF(256) Lagrange `splitSecret`/`combineShares`, Threshold SSA, HsmProvider Local/Remote, ERC-4337 v0.7 `packUserOp`/`unpackUserOp`/`getUserOpHash`
- **Sprints 18-19 (Push/Sync/Risk/AI)**: Web Push prod, Sync crypted keystream, Watchtower `watchTransaction`, Blowfish/Tenderly/ChainPatrol risk, AI Risk scoring
- **Sprints 20-22 (Audit/Auth/DR)**: `audit-config/audit-external.json`, `.lighthouserc.json` budgets, `.github/CODEOWNERS` paths críticos, Google/Apple OAuth, TOTP RFC 6238, Postgres migration script, backup-restore + DR drill checklist
- 160+ tests, 11 docs vivos, 22 sprints
### Changed
- `next.config.ts:18` HSTS, `ignoreBuildErrors:false`, `reactStrictMode:true`
- `eslint.config.mjs` ignora `gsap-public/**`, `public/**`, `prisma/db/**`
- `package.json:1.1.0` `tank-wallet` + `@playwright/test ^1.48`
- `.env.example` 18 vars (DB, auth, observability, security, WalletConnect, RPCs, VAPID, OAuth, Risk)
- `Caddyfile` `:443 tls` + HSTS + `:80→443` + `:81` compat dev
- `branch protection main` 7 checks (Quality Gates, Semgrep, CodeQL, Gitleaks, Trivy, SBOM, E2E) + 1 review
- `gh 2.65.0` instalado + `gho_***` token + labels (18) + PR/issue templates
### Security
- `.env` fora do git (`git rm --cached` + `!.env.example`)
- PGP privada removida
- HSTS `max-age=63072000; includeSubDomains; preload`
- CSP `default-src 'self'`, X-Frame DENY, nosniff, Referrer, Permissions-Policy
- Rate-limit `429` + Bot-guard `403` em `/api/*` via `src/proxy.ts`
- E2E Playwright + Codecov + Gitleaks + CodeQL + Semgrep + Trivy
- `.github/CODEOWNERS` review paths segurança

## [Unreleased] — Sprint 4+2 (2026-07-16)
### Added
- SecurityDecisionPipeline with 7 tests
- SecurityDecisionModal + EngineResultCard + EvidenceBadge (UI)
- Feature flags (Free/PRO/Enterprise tiers)
- HMAC chain tamper-evident audit log (10 tests)
- 36 @stable tags on public exports
- SECURITY.md + BUG-BOUNTY.md
- Dockerfile (multi-stage, non-root, determinístico)
- .github/workflows/{ci,release,dast}.yml + dependabot.yml
- 9 crypto vector sets + 26 tests
- 7 integration tests por engine (32 tests)
- Ed25519 artifact signing in release.yml
- Audit package (docs/audit-package/)
### Changed
- 19 throw new Error → TankError typed
- 11 any → proper types
- Removed console.* override in key-management
- tsconfig: types ["node", "bun-types"], exclude examples/debug
- FROZEN-IDS expanded (THR-0001 a 0016 individual)
- security.ts: engines promoted to verified via integration tests
### Removed
- Redundant console.* override in key-management
