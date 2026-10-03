# TANK Wallet — Monorepo

> **Status: AUDIT_READY** — Plataforma autocustodial de segurança para ativos digitais.
>
> Architecture Freeze 1.0.0 · v1.2.1 · Deploy: Vercel (tankwallet.dev)

## 🗺️ Estrutura (monorepo)

```
apps/web/         → A aplicação Next.js (frontend + rotas /api + libs de domínio)
docs/             → Documentação viva em 8 pilares (comece por docs/README.md)
infra/            → Config de segurança/auditoria de borda (audit-config, dast-config)
.github/          → Workflows de CI/CD (10 gates) + CODEOWNERS + dependabot
```

**Raiz = apenas configuração global.** `node_modules`, `.next`, builds e bancos vivem exclusivamente dentro de `apps/web/`.

## 🚀 Quick start (3 minutos)

Pré-requisitos: [Bun](https://bun.sh) ≥ 1.3 · Node 20+ (opcional, para tooling)

```bash
cd apps/web
bun install --frozen-lockfile
cp .env.example .env             # preencher (NUNCA commitar)
bun run db:generate && bun run db:push
bun run dev                      # http://localhost:3000
```

**Atalhos da raiz** (delegam para apps/web): `bun run dev` · `test` · `lint` · `verify` (11 gates) · `build`.

Guia completo: [`docs/03-development-process/SETUP.md`](docs/03-development-process/SETUP.md) · Onboarding: [`docs/03-development-process/ONBOARDING.md`](docs/03-development-process/ONBOARDING.md).

## 🛡️ Bug Bounty

Pesquisa de segurança é bem-vinda: [`SECURITY.md`](SECURITY.md) · [`BUG-BOUNTY.md`](BUG-BOUNTY.md)

- **Report**: security@tankwallet.dev (PGP) ou Immunefi (launch pós-Audit #1)
- **Critical**: R$10,00 – R$50,00 · Hall of Fame em [`docs/05-security-compliance/security/hall-of-fame.md`](docs/05-security-compliance/security/hall-of-fame.md)

## 🧭 O que é

Hot wallet construída para **nunca assinar uma transação perigosa**. Nenhum token, contrato ou DApp é confiável por padrão — tudo passa por inspeção, simulação e classificação de risco antes de qualquer interação (`ZERO TRUST SECURITY`).

## 📋 Status

- Arquitetura congelada (1.0.0) · 16 security engines · MPC v2 + HSM · CI 10/10 gates
- **Auditoria jurídica 2026-09-29/30**: 🔴 não aprovado como LGPD-compliant; P0s de runtime corrigidos no PR #99 (ver `docs/05-security-compliance/LEGAL-*.md`)
- Release Decision: BLOCKED — auditorias externas + pentest pendentes

## 📚 Documentação

| Comece por | Conteúdo |
| --- | --- |
| [`docs/README.md`](docs/README.md) | Índice dos 8 pilares |
| [`docs/01-product-discovery/PRD.md`](docs/01-product-discovery/PRD.md) | Produto: visão, requisitos, tiers |
| [`docs/02-architecture-design/ARCHITECTURE.md`](docs/02-architecture-design/ARCHITECTURE.md) | Arquitetura técnica |
| [`docs/03-development-process/RULES.md`](docs/03-development-process/RULES.md) | Regras do repo + [`AGENTS.md`](AGENTS.md) (contrato de agentes) |
| [`docs/06-devops-deployment/`](docs/06-devops-deployment/) | Deploy (Vercel), pipelines |

## 📄 Licença

Copyright © 2026 END ART Studios — ver [`LICENSE`](LICENSE) e [`NOTICE`](NOTICE).
