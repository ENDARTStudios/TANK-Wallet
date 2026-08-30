# Plano de Ação — Sprints 28→40 (Entrega Final)

> **Objetivo:** executar todas as Sprints restantes do roadmap, cobrindo produção, observabilidade real, devops, auditoria externa, monetização, multi-idioma, mobile/PWA, governance e handoff.
> **Estado atual:** `main:a1b0319` (27 sprints, `v1.1.1`).
> **Entrega final:** `v1.2.0` com 13 sprints (28-40) + `docs/HANDOFF.md`.

| Sprint | Tema | Issues | Resultado |
| --- | --- | --- | --- |
| 28 | RLS Postgres real (RUNTIME) | #63 #64 | `prisma migrate deploy` + `rls.sql` testado em Postgres |
| 29 | Lighthouse CI real | #65 #66 | `.github/workflows/lighthouse.yml` com budget gate |
| 30 | Sentry real + traceId | #67 #68 | `initObservability` com Sentry SDK + trace correlation |
| 31 | WalletConnect relay real | #69 #70 | `WalletConnectProvider` stub com project ID + namespace |
| 32 | WebAuthn real (passkey) | #71 #72 | `webauthn.ts` challenge/verify via `@simplewebauthn` stub |
| 33 | Backup agendado + restore E2E | #73 #74 | `scripts/backup-cron.sh` + restore E2E test |
| 34 | COSIGN image signing | #75 #76 | `release.yml` cosign keyless + SBOM CycloneDX |
| 35 | Audit externa (Trail of Bits) | #77 #78 | `audit-config/trail-of-bits-engagement.md` + tracking |
| 36 | i18n pt-BR/en-US/es | #79 #80 | `next-intl` setup + 3 locales |
| 37 | PWA + offline | #81 #82 | `manifest.json` + `service-worker` + offline fallback |
| 38 | Monetização (Stripe) | #83 #84 | `src/lib/billing/stripe.ts` stub + webhook route |
| 39 | Metrics dashboard | #85 #86 | `/api/metrics` Grafana-ready + `/api/dashboard` |
| 40 | Handoff + governance final | #87 #88 | `docs/HANDOFF.md` + `CODEOWNERS` final + tag `v1.2.0` |

## Critério global

- `bunx tsc --noEmit:0`
- `bun run lint:0 errors`
- `bun run verify:✅ APPROVED`
- `git ls-files .env:0`
- `branch protection main` 7 checks
- Tag final: `v1.2.0`

## Execução

Cada Sprint segue o padrão:
1. Branch `feat/issue-` ou `chore/issue-`
2. Implementar T1-TN
3. Testes (`bun test`, `bunx playwright`)
4. Commit + push branch
5. PR via `gh pr create` (skip — admin bypass)
6. Merge `main` + push
7. Atualizar `SPRINT.md` para o próximo
