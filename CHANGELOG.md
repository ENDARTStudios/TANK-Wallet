# Changelog
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
