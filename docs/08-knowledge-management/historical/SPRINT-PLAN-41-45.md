# Plano de Execução — Sprints 41-45 (Pendentes / Faltantes)

> **Status atual:** `main:9c16f8b` (v1.2.0, 40 sprints, gate verde)
> **Data:** 2026-08-30

## Gaps Reais Identificados (via análise de `main:9c16f8b`)

| Categoria | Gap | Severidade |
| --- | --- | --- |
| **CI/CD** | knip reporta 75 deps e workflows com YAML inválido (release.yml + restore-e2e.yml) | ALTO |
| **CI/CD** | `verify` tem `tests`/`conformance`/`sbom`/`secrets-scan`/`dependency-scan` como `⚠ skip` — gate não está completo | ALTO |
| **Segurança** | `.gitleaks.toml` ausente (gitleaks roda via CI com config implícito) | MÉDIO |
| **Conformidade** | Sem LICENSE explícita verificada no repo (apenas NOTICE/LICENCE) | BAIXO |
| **SRE** | `Procfile`/`render.yaml` para deploy target ausente | BAIXO |
| **Observability** | Sentry/OTel `initObservability` é no-op (Sprint 1 docs) — wire ainda não está completo | MÉDIO |
| **Verificação** | 4 lint warnings pré-existentes em `scripts/backup-restore.ts:37` e `observability/*` | BAIXO |

## Sprints 41-45 (5 sprints, gate final)

| Sprint | Tema | Issues | Resultado |
| --- | --- | --- | --- |
| **41** | CI YAML fixes + `.gitleaks.toml` | #89 #90 | `release.yml`/`restore-e2e.yml` válidos + gitleaks config |
| **42** | Verify gate completo (tests+conformance+sbom+secrets+deps) | #91 #92 | `verify:✅ APPROVED` em todos os 11 checks |
| **43** | Sentry/OTel wire completo (`initObservability` real) | #93 #94 | `src/instrumentation.ts` carrega Sentry com DSN + traceId propagation |
| **44** | Deploy target + LICENSE + lint clean | #95 #96 | `render.yaml` + `LICENSE` corrigido + lint 0 warnings |
| **45** | v1.2.1 patch + final verify | #97 #98 | patch + 11 checks ✅ + tag `v1.2.1` |

## Execução

Cada sprint segue: branch `feat/issue-` ou `chore/issue-` → implementação → `bun test` + `bunx tsc --noEmit` → commit + push → merge `main` + push.
