# ARCHITECTURE — Arquitetura Técnica

> **Tipo:** Engenharia · **Versão:** 1.2.1 · **Atualizado:** 2026-09-23 · **Dono:** Engineering Lead
> **Canônicos detalhados:** [`../ARCHITECTURE.md`](../ARCHITECTURE.md) (por fase) · [`../ARCHITECTURE-FREEZE-1.0-BASELINE.md`](../ARCHITECTURE-FREEZE-1.0-BASELINE.md) (freeze) · [ARCHITECTURE-MODULES.md](ARCHITECTURE-MODULES.md) (catálogo de módulos).

## 1. Princípios

1. **Zero trust:** nada é confiável por padrão; tudo passa por inspeção antes de assinar.
2. **Nada é permanente sem consentimento contínuo:** toda permissão é revogável e auditável.
3. **Segurança é o núcleo do produto**, não um recurso adicional.
4. **Server-side nunca guarda chave privada** do usuário (autocustodial).

## 2. Visão de camadas

```
[Browser Next.js 16 App Router]
   └─ UI React 19 (Tailwind 4 + Radix + Framer Motion/GSAP)
        ↓
[src/proxy.ts]  rate limit (429) + bot-guard (403) + headers
        ↓
[/api/* routes]  zod validation + RBAC (401/403) + workspace filter
        ↓
[Prisma 6]  → SQLite (dev) / Postgres (prod, RLS via prisma/rls.sql)
        ↓
[wallet-* libs]  engines, kernel, sovereignty, scanner, core, evm...

Cross-cutting:
   [instrumentation.ts] → Sentry + OTel (traceId em X-Request-Id)
   [/api/metrics/prometheus] → Grafana
   [billing/stripe] · [i18n pt-BR/en-US/es-ES] · [PWA manifest+sw.js]
```

## 3. Módulos de domínio (`src/lib/`)

| Módulo | Responsabilidade |
| --- | --- |
| `wallet-core/` | BIP-39/32/44, SLIP-0010, vault AES-256-GCM (PBKDF2 250k) |
| `wallet-evm/` | RPC com failover (publicnode/1rpc/llamarpc), signer EIP-1559, EIP-712/191 |
| `wallet-engines/` + `wallet-kernel/` | 16 security engines + SecurityDecisionPipeline |
| `wallet-sovereignty/` | Approvals ERC-20/NFT, sessões, lockdown L1-L4 |
| `wallet-scanner/` | Bytecode scanner, calldata analyzer, DApp Shield, simulação |
| `wallet-security-real/` | GoPlus token/address security |
| `threat-intel/` + `risk-service/` + `ai-risk/` | Agregação multi-fonte + scoring |
| `signing/` `broadcast/` `indexer/` | PSBT/Solana/EIP-712 · eth_sendRawTransaction · Alchemy/Helius/Blockstream |
| `vault/` `mpc/` `social-recovery/` | k-of-n, Timelock, Shamir, HSM, recuperação |
| `account-abstraction/` | ERC-4337 v0.7 (packUserOp, paymaster) |
| `lightning/` `wallet-connect/` `eip6963/` | BOLT-11, swaps · WC v2 · descoberta injetada |
| `auth/` | next-auth Credentials + OAuth Google/Apple + TOTP + WebAuthn |
| `observability/` `metrics/` | Sentry, OTel, logger estruturado, prom-client |
| `behavior-ai/` `watchtower/` `notifications/` `sync/` | Anomalia (lockdown ≥80), monitoramento, push, sync cifrado |
| `billing/` | Stripe checkout + webhook |
| `crypto/` | Shamir SSS, threshold SSA, PII encrypt, redact |

## 4. Dados (Prisma)

Modelos: `Workspace`, `User`, `ThreatToken`, `ThreatSite`, `ThreatAddress`, `ThreatExploit`, `PermissionAuditLog` (HMAC chain), `BehaviorProfile`, `BehaviorAnomaly`, `RecoveryContact`.

- Dev: SQLite (`DATABASE_URL=file:...`). Prod: Postgres 16 (docker-compose) com 6 policies `FORCE RLS` (`prisma/rls.sql`).
- Toda consulta com tenant usa `workspaceId` + `filterByWorkspace` (`src/lib/db/rls.ts`).

## 5. Superfície de API (`src/app/api/`)

`auth` · `billing` · `broadcast` · `dashboard` · `goplus` · `health` · `metrics` · `notifications` · `risk` · `threats` · `whois`

Contratos e convenções: ver [API.md](API.md).

## 6. Esteira de entrega

- **Runtime:** Bun (install, test, scripts). **CI:** 9 workflows (ci, cosign, dast, fuzzing, lighthouse, release, restore-e2e, sbom-cyclonedx, slither).
- **Gate de deploy:** ESLint · `tsc --noEmit` · `bun test` · `audit:code` · Semgrep · CodeQL · Gitleaks · Trivy · SBOM (ver [SECURITY-GATE.md](SECURITY-GATE.md)).
- **Release:** imagem Docker multi-stage non-root → GHCR → cosign keyless (OIDC + Ed25519) + SBOM CycloneDX assinado.
- **Deploy:** Render (`render.yaml`, healthcheck `/api/health`, domínio tankwallet.dev) atrás de Caddy (TLS + HSTS).

## 7. Instruções de atualização

1. Novo módulo em `src/lib/`: adicione linha na tabela §3 + entrada em [ARCHITECTURE-MODULES.md](ARCHITECTURE-MODULES.md) + ADR se for decisão estrutural.
2. Novo modelo Prisma: atualize §4, [RLS.md](RLS.md) e o diagrama em [uml/UML.md](uml/UML.md).
3. Nova rota `/api`: atualize §5 e [API.md](API.md) no mesmo PR.
4. Mudança de esteira (workflow novo/removido): atualize §6 e [SECURITY_REVIEW.md](SECURITY_REVIEW.md).
