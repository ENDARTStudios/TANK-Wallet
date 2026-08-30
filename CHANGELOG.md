# Changelog
## [1.1.0] — 2026-08-30 — Sprints 1-14
### Added
- PRD, UML, RBAC, RLS, SECRETS, ARCHITECTURE-MODULES, OBSERVABILITY, TESTING, SECURITY-GATE
- AGENTS.md (Issue→PR→gate + Motion + skills)
- Sprints 1-4: hygiene (HSTS/proxy/observability), E2E Playwright + Codecov + rate-limit + strict
- Sprint 3: WAF/Bot (BOT_MODE), RBAC (Workspace/User + requirePermission), RLS (workspaceId), feature flags
- Sprint 4: SEO (robots/sitemap/canonical/OG/JSON-LD), modular src/features, cleanup plan
- Sprint 5: auditoria completa (security/performance/db/SEO/QA) docs/audit/*.md
- Sprints 6-8: Postgres RLS (docker-compose + rls.sql), next-auth, WalletConnect v2 + EIP-6963 + Risk Service
- Sprints 9-10: Broadcast (eth_sendRawTransaction) + Indexer (Alchemy/Helius/Blockstream) + Signing (PSBT/Solana/EIP-712) + Vault (k-of-n)
- Sprints 11-12: Lightning (BOLT-11) + AA (UserOperation) + MPC (2-of-2) + Social Recovery + Behavioral AI
- Sprints 13-14: Notifications/Push + Sync + Helius prod + VAPID
- 68+ tests (rate-limit, bot-guard, rbac, rls, feature-flags, wallet-connect, eip6963, threat-intel, broadcast, indexer, signing, vault, lightning, aa, mpc, social, behavior, notifications, sync, vapid)
- HSTS, CSP, rate 429, bot 403, proxy, instrumentation, error.tsx
### Changed
- next.config.ts: HSTS, typescript.ignoreBuildErrors:false, reactStrictMode:true
- eslint.config.mjs: ignore gsap-public/public/prisma/db
- package.json: tank-wallet 1.1.0, @playwright/test
- .env.example: 12 vars (DATABASE_URL, NEXTAUTH_SECRET, SENTRY, OTel, WALLETCONNECT, ALCHEMY/INFURA/HELIUS/VAPID)
- Caddyfile: :443 tls + HSTS + :80→443 + :81 compat
### Security
- .env fora do git, PGP privada removida, branch protection main (7 checks, 1 review)

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
