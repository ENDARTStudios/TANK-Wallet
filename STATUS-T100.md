# STATUS-T100 — manual-do-operador (F10-operacao, critério de pronto)

Data: 2026-09-27. Tarefa: T100-manual-do-operador. Branch: chore/sprint-62-manual-operador.
Resultado: **DONE** — `MANUAL_DO_OPERADOR.md` (raiz) com operação real e verificada.

## 1. Conteúdo (9 seções)

Run local · verificações (`tsc`, eslint, `bun test`, `verify`, E2E) · deploy Vercel ·
3 flags (CSP_ENFORCE, JEV_ENABLED, INTENT_ROUTING_ENABLED) com ativação supervisionada
+ rollback 1 comando (regra D093) · leitura de headers · baterias (k6/ZAP/property) ·
3 incidentes (CSP quebrando, abuso/429, deploy falhando) · 4 pendências (sem segredos) ·
ponteiros (audit-package, DAST/LOAD runbooks, DECISOES, issues).

## 2. Verificação de consistência (nenhum comando inventado)

- Flags: nomes + semântica `"1"/"true"` conferidos em `csp.ts:9`, `typesafe-jev.ts:59`,
  `classifier.ts:57` (default off).
- `bun run verify`, `bun run test:load`, `gh workflow run dast.yml`, `vercel env add/rm/ls`,
  `vercel ls` — todos usados/existentes no ciclo.
- **Correção aplicada antes do commit**: rascunho citava `GET /api/csp-report/stats` —
  endpoint NÃO existe (só POST; contadores em memória anti-PII). Trocado por texto
  honesto (sinal = console + headers; gap de volume declarado). Lição D100 em ação.
  (Nota: STATUS-T087 §5 contém a mesma referência — registro histórico, não reescrito;
  o manual é o documento vivo corrigido.)

## 3. Verificação T100

- [x] 12 blocos de comando; cobertura run/deploy/flags+rollback/incidentes/pendências.
- [x] Sem segredos (placeholders).
- [x] PR dedicado docs-only; merge após REVIEW (D078).

Arquivos: `MANUAL_DO_OPERADOR.md` (novo), `STATUS-T100.md`.
