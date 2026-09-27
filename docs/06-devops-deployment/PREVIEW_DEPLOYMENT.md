# PREVIEW_DEPLOYMENT — Deploys de Preview

> **Tipo:** Operação · **Atualizado:** 2026-09-23 · Produção: [PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md)

## 1. O que é "preview" aqui

Ambiente de validação **próximo de produção** antes de promover: build standalone real, healthcheck, smoke E2E e budgets Lighthouse — rodando em máquina local/CI, nunca com segredos de produção.

## 2. Preview local (build standalone — igual ao container de prod)

```bash
bun run build     # next build + copia static/public para .next/standalone
bun run start     # NODE_ENV=production bun .next/standalone/server.js (log em server.log)
# healthcheck:
curl http://localhost:3000/api/health
```

Este é o mesmo artefato do Dockerfile (multi-stage, non-root) — se funciona aqui, o comportamento de container é o mesmo.

## 3. Preview em container (compose)

```bash
docker compose up -d          # Postgres 16 p/ cenário prod-like
# build da imagem:
docker build -t tank-wallet:preview .
docker run --rm -p 3000:3000 --env-file .env tank-wallet:preview
```

Caddy local (dev/compat): `:80→443` com TLS e `:81` para compat de desenvolvimento (`Caddyfile`).

## 4. Validação obrigatória no preview (pré-promoção)

- [ ] `/api/health` retorna 200 com observability ativa.
- [ ] `bun run test:e2e` verde no ambiente (chromium + mobile-375 + tablet-768).
- [ ] Smoke: home, sitemap, robots, HSTS (`e2e/smoke.spec.ts`).
- [ ] Lighthouse dentro do budget (`.lighthouserc.json`, 4 categorias ≥ 0.9).
- [ ] Headers de segurança presentes (HSTS/CSP/X-Frame/nosniff).
- [ ] DAST baseline (ZAP) sem achado novo crítico.
- [ ] Preflight de deploy: `scripts/deploy-preflight.sh` (tsc/lint/test/audit/verify/secrets/tag).

## 5. Preview de PR (CI)

- Workflows de CI rodam a bateria completa por PR: lint, tsc, bun test, Semgrep, CodeQL, Gitleaks, Trivy, SBOM, E2E, Lighthouse.
- Branch protection exige tudo verde + 1 review antes do merge — o merge **é** a promoção a candidato de release.
- Artefatos de diagnóstico (screenshots/vídeos de E2E, relatório Lighthouse) ficam anexados ao run.

## 6. Segredos de preview

- **Nunca** `.env` de produção em preview — usar valores de sandbox (Stripe test keys, DSN de staging do Sentry).
- Interações externas em sandbox: GoPlus/RDAP podem apontar para produção (read-only), mas billing **sempre** teste.

## 7. Instruções de atualização

1. Novo passo de validação pré-release: adicione em §4 e no `deploy-preflight.sh`/release checklist no mesmo PR.
2. Mudança de porta/domínio de preview: sincronizar `Caddyfile`, `playwright.config.ts` (baseURL) e §2-§3.
