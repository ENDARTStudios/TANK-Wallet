# PRODUCTION_DEPLOY — Deploy de Produção

> **Tipo:** Operação · **Atualizado:** 2026-09-23 · Checklist completo: [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) · Preflight: `scripts/deploy-preflight.sh`

## 1. Pipeline de release (automatizado)

```
merge na main (gate verde)
  → .github/workflows/cosign.yml   build imagem Docker (multi-stage, non-root) → GHCR
  → cosign keyless sign (OIDC) + Ed25519 artifact signing
  → .github/workflows/sbom-cyclonedx.yml   SBOM CycloneDX 1.5 assinado (retention 90d)
  → .github/workflows/release.yml   tag + release + artefatos
  → Render (render.yaml)   deploy da imagem com healthcheck /api/health
  → Caddy (edge)   TLS :443 + HSTS + redirect :80, tankwallet.dev
```

## 2. Pré-condições (bloqueiam o release)

- [ ] `bun run verify` 11/11 ✅ e `deploy-preflight.sh` verde (tsc/lint/test/audit/verify/secrets/tag).
- [ ] Bateria de QA de release ([QA_TESTING.md](QA_TESTING.md) §5) executada.
- [ ] **Zero segredo versionado** (Gitleaks verde) e **zero crítico aberto** no findings-tracker.
- [ ] CHANGELOG atualizado + entrada `### Security` se aplicável.
- [ ] Backup restaurável verificado na semana (restore-e2e verde).
- [ ] Release Decision: hard gates externos avaliados (auditoria/pentest conforme escopo da release).

## 3. Variáveis de produção

12 env vars no Render (ver `render.yaml`): `DATABASE_URL` (Postgres), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME`, `BOT_MODE=block`, `API_RATE_LIMIT_PER_MIN`, `WALLETCONNECT_PROJECT_ID`, chaves de integração (Alchemy/Stripe/...). **Nunca** valor real fora do cofre do Render.

## 4. Passo a passo do deploy

1. Confirmar pré-condições (§2) e tag alvo (`vX.Y.Z` — mesma do `package.json`).
2. Disparar release (workflow `release.yml`) — artifacts assinados são gerados.
3. Render faz o deploy com healthcheck automático em `/api/health`; aguardar healthy.
4. Pós-deploy imediato (§5).
5. Anunciar conforme [CONTENT.md](CONTENT.md) §5 (template de release announcement).

## 5. Verificação pós-deploy (5 minutos)

- [ ] `https://tankwallet.dev` responde 200 com HSTS preload header.
- [ ] `/api/health` → 200, observability ativa.
- [ ] Sentry recebendo eventos (forçar 1 erro canário em staging-first se aplicável).
- [ ] Prometheus/Grafana coletando (`/api/metrics/prometheus`).
- [ ] Smoke manual: onboarding carrega, scanner responde (GoPlus/RDAP ok).
- [ ] Rate limit ativo (429 ao estourar em teste controlado).

## 6. Rollback

1. Render: redeploy da **imagem assinada anterior** no GHCR (verificar `cosign verify` antes).
2. Banco: migración para trás **só** com checkpoint e backup provado — preferir forward-fix quando possível.
3. DNS/edge: Caddy mantém TLS; rollback não mexe em DNS salvo desastre regional.
4. Post-rollback: incidente registrado ([incident-response.md](incident-response.md)) + post-mortem em `../worklog.md`.

## 7. Janelas e congelamentos

- Deploy preferencial em horário comercial (monitoração acordada).
- Congelamento durante audit externa ativa (coordenar com `audit-config/`).
- HSTS preload submission: janela dedicada 2027-02 ([HSTS-PRELOAD.md](HSTS-PRELOAD.md)) — sem mudança de domínio/TLS nesse período.

## 8. Instruções de atualização

1. Novo env de produção: §3 + `render.yaml` + `.env.example` no mesmo PR.
2. Mudança no pipeline de release: §1 + workflows no mesmo PR + entrada no changelog.
3. Incidente de deploy: atualizar runbook de rollback com a lição aprendida.
