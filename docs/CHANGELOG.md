# CHANGELOG — Histórico de Versões

> **Tipo:** Governança · **Atualizado:** 2026-09-23 · **Canônico completo:** [`../CHANGELOG.md`](../CHANGELOG.md) (raiz).
> Este arquivo define o **formato** e mantém o **resumo navegable** em `docs/`.

## Formato (obrigatório)

Baseado em Keep a Changelog, adaptado ao ritmo de sprints do projeto:

```markdown
## [VERSÃO] — AAAA-MM-DD — (Hotfix | Minor | Major)
### Added      # novas capacidades (por sprint: **Sprint N**: ...)
### Changed    # mudanças em comportamento/refs de arquivo
### Fixed      # correções (com causa quando conhecida)
### Security   # mudanças relevantes de segurança
### Removed    # remoções
```

**Regras de escrita**

1. Uma linha por entrega, prefixada pelo sprint quando aplicável (`**Sprint 42**: ...`).
2. Cite arquivos/rotas concretas (`scripts/verify/index.ts`, `/api/health`) — o changelog é índice de rastreio, não marketing.
3. Versão vem de `package.json` (atual: **1.2.1**).
4. Entrada `[Unreleased]` acumula trabalho pós-tag e é renomeada no release.

## Resumo das versões

| Versão | Data | Tipo | Resumo |
| --- | --- | --- | --- |
| 1.2.1 | 2026-08-30 | Hotfix | verify 11/11 ✅ · initObservability real · render.yaml · gitleaks config · lint 0/0 · compat viem/@noble |
| 1.2.0 | 2026-08-30 | Minor | Sprints 28-40: RLS apply/migrate · Lighthouse CI · Sentry/traceid reais · WalletConnect provider · WebAuthn · backup cron + restore E2E · cosign + SBOM · Trail of Bits engagement · i18n 3 locales · PWA · Stripe billing · métricas dashboard · HANDOFF |
| 1.1.1 | 2026-08-30 | Hotfix | redact de segredos · smoke E2E · deploy-preflight · ZAP baseline · release checklist · HSTS preload plan · audit closure v1.1.0 · knip · 30+ libs de crypto/MPC/AA/lightning/auth |
| 1.1.0 | 2026-08-30 | Minor | Sprints 1-22: hygiene (.env/PGP fora) · HSTS/CSP · error boundaries · Playwright 3 devices · RBAC/RLS/feature flags · Postgres 16 · next-auth · broadcast/indexer/signing · vault evolution · Lightning · ERC-4337 · MPC · social recovery · behavioral AI · push/sync/watchtower · OAuth/TOTP · DR · 160+ tests |
| 1.0.0-beta | 2026-07 | Beta | SecurityDecisionPipeline · 16 engines · HMAC chain · feature flags · SECURITY/BUG-BOUNTY · Dockerfile · CI/release/DAST · crypto vectors · audit package |

## Trabalho pós-1.2.1 (não lançado)

- Sprint 57-58: MPC v2 (k-of-n, Feldman VSS) + HSM AWS/GCP/Azure (T058 ✅).
- Sprint 59: documentação do skip de 9 E2E (T061 ✅); T062 E2E env setup diferida.

## Instruções de atualização

1. Todo PR mergeado adiciona linha na seção `[Unreleased]` do **canônico** (`../CHANGELOG.md`) — não aqui.
2. No release: mover `[Unreleased]` para nova versão, replicar resumo na tabela acima, atualizar `package.json`.
3. Hotfix de segurança entra em `### Security` com referência ao advisory/issue.
