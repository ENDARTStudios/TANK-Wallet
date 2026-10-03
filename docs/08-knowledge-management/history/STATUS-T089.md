# STATUS-T089 — keyboard-fixme-reenable (Sprint 61/F08)

Data: 2026-09-27. Tarefa: T089-keyboard-fixme-reenable. Branch: chore/sprint-61-keyboard-fixme.
Resultado: **DONE** — fixme removido, causa raiz encontrada e corrigida, 9/9 + 12/12 verdes.

## 1. Causa raiz (bug de teste, NÃO flake aleatório, NÃO bug do app)

Reabilitação direta (`test.fixme` → `test`) falhou 9/9 determinístico:
`expect(textarea).toBeVisible()` — `element(s) not found`. Snapshot do error-context:
após o clique em "Importar com seed phrase", o DOM permanecia em `welcome` (sem textarea),
embora o `<textarea>` exista em `onboarding.tsx:315` (step `import`) e o handler seja
`onClick={() => setStep('import')}` (linha 187). Nenhum efeito reseta o step pós-mount.
Diagnóstico: **clique antes da hidratação React** — `goto(domcontentloaded)` + dev server
frio sob 3 projetos paralelos = evento despachado sem listener ligado, sem erro.
Confirma T075 (passa isolado/quente, falha em full-run frio) e explica por que CI
(workers:1 + retries:2) nunca foi o problema.

## 2. Correção (sem enfraquecer asserts; teste ficou MAIS forte)

`e2e/onboarding.spec.ts:25` — bloco `expect(...).toPass({timeout:30000})`:
clica e exige textarea visível (retry do clique-efeito até hidratar); depois
`textarea.focus()` + **`toBeFocused()` (assert novo)**. Diff: só este teste; config
playwright/CI intacta (já tinha workers:1 + retries:2).

## 3. Evidência (crua, local)

```
bunx playwright test e2e/onboarding.spec.ts -g keyboard --repeat-each=3
9 passed (1.1m)   # 3 projetos x 3 repeticoes consecutivas
bunx playwright test e2e/onboarding.spec.ts
12 passed (41.0s) # spec inteiro, sem regressao
```
CI (3º sinal) via PR dedicado; merge após REVIEW (D078).

## 4. Verificação T089

- [x] fixme removido; `grep test.fixme e2e/onboarding.spec.ts` → vazio.
- [x] 3 execuções consecutivas verdes por projeto (9/9) + spec 12/12.
- [x] Asserts não enfraquecidos (adicionado toBeFocused).
- [x] DECISOES.md (D089).

Arquivos: `e2e/onboarding.spec.ts` (1 teste), `STATUS-T089.md`, `DECISOES.md`.
