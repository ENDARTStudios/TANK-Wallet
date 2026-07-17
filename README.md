# TANK Wallet

> **Status: AUDIT_READY** — Plataforma autocustodial de segurança para ativos digitais.
>
> Architecture Freeze 1.0.0 | Governance 1.3 | Overall Confidence: 71%

## 🛡️ Bug Bounty

We welcome security research on Tank Wallet. See [`BUG-BOUNTY.md`](BUG-BOUNTY.md) for scope, rules, and rewards.

- **Platform**: Immunefi (launch pending — see [launch guide](docs/security/bug-bounty-launch-guide.md))
- **Critical**: $1,000 – $5,000
- **Report**: security@tankwallet.dev (PGP) or via Immunefi when live

## O que é

Tank Wallet é uma plataforma de segurança preventiva para ativos digitais. Diferente das carteiras convencionais (projetadas para executar transações), a Tank Wallet é projetada para **evitar** que o usuário assine uma transação perigosa.

## Status atual

```
✅ Architecture Freeze 1.0.0 — congelada
✅ SecurityDecisionPipeline — funcional com 13 testes
✅ 16 Security Engines — 7 com integration tests verified
✅ Crypto vectors — 9 vector sets, 26 testes passing
✅ HMAC chain — tamper-evident audit log, 7 testes
✅ CI/CD — 11 gates + SAST + DAST + sigstore + SBOM
✅ Observability — logger, tracing, metrics, Sentry
✅ IR/DR runbooks — publicados
✅ SECURITY.md + BUG-BOUNTY.md — prontos
⏳ Auditorias externas — pacote preparado, aguardando commissionamento
⏳ Pentests — não executados
⏳ Bug bounty público — draft pronto, launch pós-Audit #1

Overall Confidence: 65% | Release Decision: BLOCKED (15 hard gates externos)
```

## Quick start

```bash
bun install --frozen-lockfile
bun run db:generate
bun run dev
```

## Comandos

```bash
bun run dev        # Next.js dev server (porta 3000)
bun run verify     # Gate único (11 gates)
bun run metrics    # KPIs + assinatura + histórico
bun run audit:code # Dívida técnica
bun run enforce    # Governance as code
bun run bench      # Performance benchmarks
bun run golden     # Golden test vectors
```

## Para auditores

Ver `docs/audit-package/README.md` para o pacote completo de auditoria:
- Commit frozen: `fdae6e35b22b`
- Escopo Audit #1: crypto + key management + recovery
- Escopo Audit #2: engines + decision pipeline + event bus
- Documentação de referência
- Instruções de reprodução

## Documentação

- `ARCHITECTURE-FREEZE-1.0-BASELINE.md` — arquitetura congelada
- `ENGINEERING-STANDARDS.md` — padrões de implementação (17 seções)
- `KPI-FORMULAS.md` — fórmulas reproduzíveis de métricas
- `PRODUCTION-CRITERIA.md` — 83 critérios de produção
- `SECURITY.md` — política de segurança
- `.ai/` — governança permanente (16 documentos)
- `worklog.md` — log multi-agente

## Licença

Copyright © 2026 END ART
