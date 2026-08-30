# Release Checklist — v1.1.0

> **Versão:** v1.1.0
> **Data:** 2026-08-30
> **Owner:** Engineering Lead
> **Tag:** `v1.1.0`

## Pré-release (1 semana antes)

- [ ] Tag `v1.1.0` criada e pushada (`git push origin v1.1.0`)
- [ ] CHANGELOG.md atualizado (Sprint 23)
- [ ] AUDIT-CLOSURE.md APPROVED (Sprint 23)
- [ ] `bunx tsc --noEmit:0`
- [ ] `bun run lint:0 errors`
- [ ] `bun run verify:✅ APPROVED`
- [ ] `bun run audit:code:0 findings`
- [ ] `git ls-files .env:0`
- [ ] Branch protection 7 checks verde
- [ ] `release.yml` cosign keyless + SBOM assinado

## Deploy

- [ ] Staging deploy via `release.yml`
- [ ] Health check `/api/health` verde
- [ ] DAST `dast.yml` weekly verde
- [ ] Observability: Sentry + OTel + `/api/metrics` ativos
- [ ] Rate-limit `429` + Bot `403` em `/api/*`

## RTO/RPO

- [ ] RTO ≤ 4h (DB restore)
- [ ] RPO ≤ 1h (backup hourly)
- [ ] DR drill documentado (Sprint 22 `docs/disaster-recovery.md`)

## Pós-release (24h)

- [ ] Métricas: error rate < 0.1%
- [ ] Latência p95 < 500ms
- [ ] Zero secret leaked em `git log --all --full-history`
- [ ] Zero `console.log` em `src/`
- [ ] Badge Codecov + Lighthouse atualizados
- [ ] HSTS preload não bloqueado (após 2027-02)

## Security

- [ ] `gitleaks` verde em CI
- [ ] `Trivy` SBOM sem `critical`
- [ ] `CodeQL` sem findings
- [ ] `Semgrep` sem findings `ERROR`
- [ ] `OWASP ZAP` baseline: high=0, medium<5

## Compliance

- [ ] `docs/SECRETS.md` atualizado
- [ ] `docs/RBAC.md` alinhado com `Role` enum
- [ ] `docs/RLS.md` alinhado com `workspaceId`
- [ ] `docs/PRIVACY.md` (futuro Sprint 26+)

## Responsáveis

- Engineering Lead: deploy approval
- Security: audit + secrets
- DevOps: infra + observability
- Legal (futuro): compliance

## Rollback

```bash
git tag v1.1.1-rollback  # tag
git push origin v1.1.1-rollback
# Reverter para v1.0.0 se crítico
git checkout v1.0.0
git push origin main --force-with-lease
```

## Referências

- `docs/audit/AUDIT-CLOSURE.md`
- `docs/SECURITY-GATE.md`
- `docs/disaster-recovery.md`
- `docs/HSTS-PRELOAD.md`
- `release.yml`
- `dast.yml`
