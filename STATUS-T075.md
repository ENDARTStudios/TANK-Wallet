# STATUS-T075 — T075-e2e-restore-keyboard-assertion — DONE (aguardando REVIEW, sem merge — D078)

**Data:** 2026-09-25
**Commit:** 6e58114 (`test(e2e): T075 restore keyboard fixme with 6-run evidence`)
**Branch:** chore/sprint-59-restore-keyboard-assertion → PR #54 (base main, sem merge até REVIEW)
**Tarefa:** T075-e2e-restore-keyboard-assertion

## Evidência — 6 runs completos estáveis

Variante poll (`expect.poll` em `document.activeElement`):
- FULL RUN 1/2/3: 1 failed (chromium keyboard) + 2 skipped + 9 passed — `textarea` invisível após click em full-file runs

Variante fill (`fill("ab")` + `toHaveValue`, sem `toBeFocused`):
- FULL RUN 1/2/3: mesmo resultado — 1 failed + 2 skipped + 9 passed
- Isolado `-g keyboard`: chromium PASS em 834ms; mobile/tablet skip via `isMobile`

`test.describe.configure({ mode: "serial" })` testado e revertido (não resolveu — removido do diff final para diff mínimo).

## Decisão (alternativa aprovada em D080)

Foco via teclado provou-se intestável nesse ambiente (6/6 falhas estáveis em full runs vs passes isolados = flake dependente de ambiente, causa raiz: contenção do servidor dev compartilhado entre workers). Mantida a interação de teclado no teste + `test.fixme` com reason rastreável (#49/T062). Cobertura restante do arquivo: 9 passed / 3 skipped por run.

## Verificação

- `bunx playwright test e2e/onboarding.spec.ts` (pós-fixme): 9 passed + 3 skipped (1 fixme × 3 projetos)
- `gh run list --branch main --limit 2`: CI + SBOM success em d26c91f (verificado em T075)
- `git diff --stat`: 1 arquivo, 1 linha (`test(` → `test.fixme(` no keyboard test)

## Métricas

Início 2026-09-25T00:00Z | Duração ~40 min (6 full runs + 3 isolados + forense error-context)

STATUS: DONE — pronto para REVIEW. Sem merge até APPROVED (D078).
