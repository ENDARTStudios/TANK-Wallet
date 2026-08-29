# Pull Request

## Issue
Closes #
#REF:

## Descrição
<!-- O que foi feito e por quê -->

## Checklist (AGENTS.md)
- [ ] Branch `feat/issue-` `fix/issue-` `chore/issue-`
- [ ] `bunx tsc --noEmit` verde
- [ ] `bun run lint` verde
- [ ] `bun test` verde (inclui novos testes)
- [ ] `bun run audit:code` 0 findings
- [ ] Sem segredo em `git ls-files` (`gitleaks` verde)
- [ ] HSTS + CSP + rate `429` + bot `403` verificados (se aplicável)
- [ ] `error.tsx` + `global-error.tsx` + `Sentry` (se UI)
- [ ] Skeleton + lazy + animação entrada/saída + progresso + responsivo 375/390/768 (se UI)
- [ ] Docs vivos atualizados (`PRD.md`, `docs/uml/UML.md`, `docs/RBAC.md`, etc.)

## Evidências
<!-- `file:line` + screenshots / `curl -I` / `gitleaks` output -->

## Deploy Gate
- [ ] Sem `green`, sem `merge` — `ci.yml` (Quality Gates, Semgrep, CodeQL, Gitleaks, Trivy, SBOM, E2E) + `release.yml` cosign
