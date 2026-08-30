# Trail of Bits — Security Engagement (v1.1.1)

> **Versão auditada:** v1.1.1
> **Data kickoff:** 2026-09-01
> **Duração:** 4 semanas
> **Budget:** USD 25,000 (fixo, Escrow via Endless)
> **Status:** PROPOSAL ACCEPTED — kickoff pendente

## Scope (in-scope)

- `src/lib/security/`, `src/lib/auth/`, `src/lib/crypto/`, `src/lib/risk-service/`, `src/lib/ai-risk/`
- `src/proxy.ts`, `src/middleware.ts` (se existir)
- `src/instrumentation.ts`, `src/app/error.tsx`, `src/app/global-error.tsx`
- `prisma/schema.prisma`, `prisma/rls.sql`
- `Caddyfile`, `next.config.ts`
- `.github/workflows/`
- `docker-compose.yml`

## Out-of-scope

- Mobile clients (iOS/Android) — não aplicável
- Backend third-party (Alchemy, Infura, Helius) — apenas integração
- Smart contracts on-chain — escopo futuro (Sprint 36+)

## Deliverables

1. **Report técnico** com findings (CRITICAL/HIGH/MEDIUM/LOW)
2. **Executive summary** (1 página, board-level)
3. **Reproduction steps** por finding
4. **Remediation recommendations**
5. **Re-test attestation** após fixes
6. **Weekly status report** (4x)

## Cronograma

| Semana | Marco |
| --- | --- |
| 1 | Kickoff + recon (Threat Model) |
| 2 | Deep dive (auth, rls, rate-limit) |
| 3 | Exploitation + draft report |
| 4 | Final report + re-test |

## Comunicação

- Slack: `tank-wallet-security` (privado)
- Email: `security@endart.studios` + PGP `docs/security/pgp-key.asc`
- Conf-call semanal: terça 14:00 UTC

## SLA de Resposta

- CRITICAL: 24h fix + patch release
- HIGH: 7d fix
- MEDIUM: 30d fix
- LOW: 90d fix

## Responsáveis

- Trail of Bits: lead auditor + 1 review
- TANK: Engineering Lead (sponsor) + Security Champion

## Status

- [ ] Contrato assinado
- [ ] NDA mútuo
- [ ] Read-only access ao repo + staging
- [ ] Threat model draft
- [ ] Findings report entregue
- [ ] Re-test attestation
