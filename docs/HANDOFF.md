# TANK Wallet — Handoff (v1.2.0)

> **Versão:** v1.2.0
> **Data:** 2026-08-30
> **Owner:** Engineering Lead
> **Repositório:** `https://github.com/ENDARTStudios/TANK-Wallet`
> **Tag:** `v1.2.0`
> **Próxima:** v1.3.0 (Trail of Bits findings + mobile PWA)

## TL;DR

TANK Wallet é uma hot wallet multi-chain (EVM, Solana, Bitcoin, Lightning) com ênfase em **prevenção ativa de risco**. v1.2.0 consolida **40 sprints** de hardening, observabilidade, RLS, MPC, OAuth, 2FA, backup/DR, audit externa, i18n, PWA, Stripe e métricas Grafana.

## Arquitetura (1 página)

```
[Browser Next.js 16] → [proxy.ts] → [/api/* routes] → [Prisma] → [SQLite dev / Postgres prod]
   ├─ [instrumentation.ts] → [Sentry + OTel]
   ├─ [/api/dashboard + /api/metrics/prometheus] → [Grafana]
   ├─ [wallet-connect + eip6963] → [DApp browser]
   ├─ [webauthn + OAuth Google/Apple + 2FA TOTP]
   ├─ [risk-service] (Blowfish/Tenderly/ChainPatrol) + [ai-risk]
   ├─ [broadcast] (eth_sendRawTransaction) + [indexer] (Alchemy/Helius/Blockstream)
   ├─ [signing] (PSBT/Solana/EIP-712) + [vault] (k-of-n/Timelock/Spending)
   ├─ [lightning] (BOLT-11/submarineSwap) + [aa] (ERC-4337 v0.7) + [mpc] (2-of-2/passkey)
   ├─ [social-recovery] (k-of-n) + [behavior-ai] (lockdown≥80)
   ├─ [notifications/sync/watchtower/risk-service/ai-risk]
   ├─ [i18n pt-BR/en-US/es] + [PWA manifest + sw.js]
   ├─ [billing/stripe] (checkout + webhook)
   └─ [crypto] (Shamir/Threshold SSA/PII/Redact)
```

## Onboarding (10 min)

```bash
# 1. Clonar
git clone https://github.com/ENDARTStudios/TANK-Wallet.git
cd TANK-Wallet

# 2. Setup
cp .env.example .env
bun install --frozen-lockfile
bun run db:generate
bun prisma db push
echo "DATABASE_URL=file:./db/custom.db" >> .env

# 3. Validar
bunx tsc --noEmit
bun run lint
bun run verify
bun test

# 4. Dev
bun run dev
# → http://localhost:3000

# 5. Deploy
bun run build
bun run start
# → atrás de Caddy (veja Caddyfile)
```

## Runbooks (docs/)

| Cenário | Doc |
| --- | --- |
| Auth/RBAC | `docs/RBAC.md` |
| RLS Postgres | `docs/RLS.md` + `prisma/rls.sql` |
| Secrets | `docs/SECRETS.md` + `.env.example` |
| WAF/Bot | `docs/SECURITY-GATE.md` + `src/proxy.ts` |
| Audit closure | `docs/audit/AUDIT-CLOSURE.md` |
| DR | `docs/disaster-recovery.md` |
| Backup | `scripts/backup-cron.sh` |
| HSTS preload | `docs/HSTS-PRELOAD.md` |
| Release | `docs/RELEASE-CHECKLIST.md` |
| Trail of Bits | `audit-config/trail-of-bits-engagement.md` |

## Contatos

| Papel | Contato |
| --- | --- |
| Engineering Lead | endart.studios@gmail.com |
| Security Champion | security@endart.studios (PGP `docs/security/pgp-key.asc`) |
| Incidents | incidents@tankwallet.dev (alias) |
| Bug Bounty | https://immunefi.com |

## Sprint 1-40 (resumo)

- **1-4:** hygiene (HSTS, error boundary, observability), E2E Playwright, WAF, SEO
- **5:** auditoria completa (security/perf/db/SEO/QA)
- **6-8:** Postgres + RLS + next-auth + WalletConnect + EIP-6963 + Risk Service
- **9-10:** Broadcast (eth_sendRawTransaction) + Indexer + Signing + Vault
- **11-12:** Lightning + AA + MPC + Social Recovery + Behavior AI
- **13-14:** Notifications + Helius + VAPID + Push
- **15-22:** LND + Bundler + Shamir + Threshold SSA + HSM + WebAuthn + DR + PII + Knip + og.png
- **23-25:** Release v1.1.0 + audit closure + DAST + Release checklist
- **26-27:** Smoke + deploy preflight + v1.1.1 + redact
- **28-40:** Sprints 28-40: RLS runtime, Lighthouse CI, Sentry, WalletConnect, WebAuthn, Backup, COSIGN, ToB, i18n, PWA, Stripe, Metrics, handoff v1.2.0

## Métricas de Sucesso

- 200+ tests em 40+ arquivos
- `tsc:0` `lint:0` `verify:✅ APPROVED`
- 40 sprints merged
- 3 tags: `v1.1.0` `v1.1.1` `v1.2.0`
- 14 docs vivos + 5 audit reports + 8 workflows

## Próximos Passos (Sprint 41+)

- [ ] Trail of Bits findings (Sprint 35)
- [ ] WalletConnect relay real (substituir stub)
- [ ] LND channel real (substituir stub)
- [ ] Bundler real (substituir stub)
- [ ] Mobile PWA polish
- [ ] ERC-4337 Account Abstraction com EntryPoint v0.7
- [ ] MPC HSM real
- [ ] Lighthouse CI gate enforced

## Links

- Repo: https://github.com/ENDARTStudios/TANK-Wallet
- Issues: https://github.com/ENDARTStudios/TANK-Wallet/issues
- Releases: https://github.com/ENDARTStudios/TANK-Wallet/releases
- Branch protection: 7 checks (`Quality Gates`, `Semgrep`, `CodeQL`, `Gitleaks`, `Trivy`, `SBOM`, `E2E Playwright`)
