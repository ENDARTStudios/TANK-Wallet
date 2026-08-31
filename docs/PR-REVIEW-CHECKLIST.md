# PR Review Checklist — TANK Wallet

> Usar em todo PR review (ver `AGENTS.md:1`).

## Segurança (zero-trust)

- [ ] `401` se não autenticado; `403` se sem permissão (RBAC `docs/RBAC.md`, RLS `docs/RLS.md`)
- [ ] Rate limit em rota de escrita (`docs/SECURITY-GATE.md`)
- [ ] `Strict-Transport-Security` + CSP + `X-Frame-Options` + `nosniff`
- [ ] Teste "tenta acessar o que não é seu" (conta de outro / rota admin / registro alheio / API sem sessão)
- [ ] `zod` em toda entrada; sem `any` não justificado; sem `REQ: SQL`/`XSS`/`SSRF`
- [ ] Sem segredo em `git ls-files` (`.env`, `pgp-private`)

## Qualidade

- [ ] `bun run lint:0 errors` `bunx tsc --noEmit:0` `bun test:pass` `bun run verify:11/11`
- [ ] `error.tsx` + `global-error.tsx` + `Sentry` + `OTel` (se UI)
- [ ] Coverage não reduz (Codecov)
- [ ] E2E `playwright` para fluxos críticos

## UX/Motion (se UI)

- [ ] Skeleton + lazy + animação entrada/saída + progresso + 375/390/768 (teclado não cobre form) + AA

## Infra

- [ ] `prisma rls.sql` + `workspaceId` + `@@index`
- [ ] Backup `db/custom.db` / `pg_dump` testado (`docs/disaster-recovery.md`)
- [ ] `render.yaml` + `Caddyfile` (TLS/HSTS) + `Dockerfile` non-root
- [ ] `CHANGELOG.md` + `package.json` version bump
- [ ] Docs vivos atualizados (`PRD.md`, `docs/uml/UML.md`, `docs/RBAC.md`, etc.)

## PR

- [ ] Branch `feat/issue-` `fix/issue-` `chore/issue-`
- [ ] `Closes #` + `#REF:`
- [ ] PR template preenchido
- [ ] CODEOWNERS approval (security/prisma/ci/infra)
- [ ] Sem `green`, sem `merge` (7 checks: Quality Gates, Semgrep, CodeQL, Gitleaks, Trivy, SBOM, E2E)
