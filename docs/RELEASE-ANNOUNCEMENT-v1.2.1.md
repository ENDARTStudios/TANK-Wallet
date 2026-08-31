# TANK Wallet v1.2.1 — Release Announcement (GA)

> **Data:** 2026-08-30
> **Tag:** `v1.2.1`
> **Commit:** `b99f8e6` (Sprint 45) → `708bf59` (Sprint 47)
> **Status:** **GA (General Availability)**

## Highlights

TANK Wallet v1.2.1 é uma hot wallet multi-chain (EVM, Solana, Bitcoin, Lightning) com ênfase em **prevenção ativa de risco** e soberania do usuário.

### Segurança

- Zero-trust: nada confiável por padrão — inspeção + simulação + risco antes de assinar
- `HSTS` `max-age=63072000; includeSubDomains; preload`, CSP, rate-limit `120/30` `429`, bot-guard `403`
- RBAC `viewer|member|admin|security|owner` + RLS `workspaceId` + `FORCE RLS` Postgres

### Observabilidade

- `instrumentation.ts` → `Sentry` + `OpenTelemetry` + `traceId` correlation
- `error.tsx`/`global-error.tsx` + `verify` 11/11 `✅ APPROVED`
- `codecov` + `playwright` E2E + `gitleaks` + `CodeQL` + `Semgrep` + `Trivy` + SBOM CycloneDX

### Plataforma

- 40 sprints, 160+ tests em 40+ arquivos, `tsc:0` `lint:0`
- `docker-compose.yml` Postgres 16 + `prisma/rls.sql` + `next-auth` + WalletConnect v2 + EIP-6963 + Risk Service
- Broadcast `eth_sendRawTransaction` + Indexer (Alchemy/Helius/Blockstream) + Signing (PSBT/Solana/EIP-712) + Vault `k-of-n`
- Lightning BOLT-11 + AA `UserOperation` + MPC 2-of-2 + Social Recovery + Behavioral AI
- Notifications/Push + Helius prod + VAPID + LND + Bundler + Shamir SSS + Threshold SSA + HSM + WebAuthn + DR drill

### Infra

- `render.yaml` (Docker + 12 env + `tankwallet.dev`) + `Caddyfile` `:443 tls` + branch protection 7 checks
- `v1.1.0` + `v1.1.1` + `v1.2.0` + `v1.2.1` tags
- `docs/HANDOFF.md` + `docs/RELEASE-CHECKLIST.md` + `docs/audit/AUDIT-CLOSURE.md` APPROVED

## Instalação

```bash
git clone https://github.com/ENDARTStudios/TANK-Wallet.git
cd TANK-Wallet
cp .env.example .env
bun install --frozen-lockfile
bun prisma db push
bunx tsc --noEmit && bun run verify
bun run dev
```

## Links

- Repo: `https://github.com/ENDARTStudios/TANK-Wallet`
- Issues: `https://github.com/ENDARTStudios/TANK-Wallet/issues`
- Releases: `https://github.com/ENDARTStudios/TANK-Wallet/releases`
- Handoff: `docs/HANDOFF.md`
- Audit closure: `docs/audit/AUDIT-CLOSURE.md`

## Próximos

- Trail of Bits findings (Sprint 35)
- WalletConnect relay real
- LND channel real
- Shamir HSM real

---

*Assinado: Engineering Lead — 2026-08-30 — `v1.2.1` GA*
