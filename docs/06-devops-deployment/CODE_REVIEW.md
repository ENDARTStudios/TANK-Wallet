# CODE_REVIEW — Review de Pull Requests

> **Tipo:** Qualidade · **Atualizado:** 2026-09-23 · Checklist operacional: [PR-REVIEW-CHECKLIST.md](PR-REVIEW-CHECKLIST.md) · Proteção de branch: 7 checks + 1 review

## 1. Regras de entrada

1. Todo PR referencia issue: `Closes #N` (+ `#REF:` nominal se aplicável).
2. Branch: `feat|fix|chore/issue-N-descricao`.
3. Gate verde **antes** do review humano (reviewer não é linter).
4. 1 aprovação mínima (CODEOWNERS cobra paths críticos — crypto, auth, infra).
5. PR de feature atualiza docs relacionados no mesmo PR.

## 2. Dimensões do review (em ordem de peso)

| # | Dimensão | Pergunta-chave | Doc de referência |
| --- | --- | --- | --- |
| 1 | **Segurança** | Passou no checklist zero-trust? | [SECURITY_REVIEW.md](SECURITY_REVIEW.md) |
| 2 | **Corretude** | Teste novo falha sem o change? Cobre o caso de borda? | [TESTING.md](TESTING.md) |
| 3 | **Arquitetura** | Respeita módulos/fachadas? Escopo mínimo? | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 4 | **Qualidade** | Sem `any`, sem console, sem código morto? | [STYLE_GUIDE.md](STYLE_GUIDE.md) |
| 5 | **Performance** | Query com LIMIT? Bundle cresceu? Over-render? | [PERFORMANCE.md](PERFORMANCE.md) |
| 6 | **UX/Motion/A11y** | Skeleton/progresso/responsivo/foco visível? | [DESIGN.md](DESIGN.md) · [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| 7 | **Docs** | Changelog/docs atualizados? | [CHANGELOG.md](CHANGELOG.md) |

## 3. Tamanho e escopo

- PR ideal: 1 tarefa do sprint (T0NN) = 1 PR; > ~400 linhas de diff precisa justificativa.
- Tarefa que toca > 5 arquivos deveria ter sido quebrada ([TASK_BREAKING_DOWN.md](TASK_BREAKING_DOWN.md) §3).
- Reviewer pode pedir split em vez de reviewar monólito.

## 4. O que o reviewer rejeita sem cerimônia

- Segredo no diff (regra zero) · teste removido/weakened sem explicação · `any` novo sem justificativa · mock em código de produção · scope creep fora do SPRINT.md · doc desatualizado · comentário "TODO fix depois" sem issue.

## 5. Linguagem e tom do review

- Comentário no código: fato + referência ("sem LIMIT — R9 do RULES.md"), não opinião solta.
- Blocking vs non-blocking explícitos: `blocking:` / `nit:`.
- Autor responde todos os threads antes do merge (conversa se resolve no PR, não no chat perdido).

## 6. Pós-merge

1. `release.yml` assina a imagem (cosign + SBOM) — conferir artifact verde.
2. Entrada no changelog canônico + [TASKS.md](TASKS.md) atualizado.
3. Issue fecha automaticamente pelo `Closes #N`.

## 7. Instruções de atualização

1. Nova regra de review consensual → §2/§4 + [PR-REVIEW-CHECKLIST.md](PR-REVIEW-CHECKLIST.md) no mesmo PR.
2. Mudança de proteção de branch (checks exigidos) → atualizar §1 e refletir no GitHub settings.


> **Fundido de:** docs/06-devops-deployment/CODE_REVIEW.md

# PR Review Checklist — TANK Wallet

> Usar em todo PR review (ver `AGENTS.md:1`).

## Segurança (zero-trust)

- [ ] `401` se não autenticado; `403` se sem permissão (RBAC `docs/05-security-compliance/RBAC.md`, RLS `docs/05-security-compliance/RLS.md`)
- [ ] Rate limit em rota de escrita (`docs/05-security-compliance/SECURITY-GATE.md`)
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
- [ ] Backup `db/custom.db` / `pg_dump` testado (`docs/06-devops-deployment/BACKUP_DR.md`)
- [ ] `render.yaml` + `Caddyfile` (TLS/HSTS) + `Dockerfile` non-root
- [ ] `CHANGELOG.md` + `package.json` version bump
- [ ] Docs vivos atualizados (`PRD.md`, `docs/02-architecture-design/UML.md`, `docs/05-security-compliance/RBAC.md`, etc.)

## PR

- [ ] Branch `feat/issue-` `fix/issue-` `chore/issue-`
- [ ] `Closes #` + `#REF:`
- [ ] PR template preenchido
- [ ] CODEOWNERS approval (security/prisma/ci/infra)
- [ ] Sem `green`, sem `merge` (7 checks: Quality Gates, Semgrep, CodeQL, Gitleaks, Trivy, SBOM, E2E)
