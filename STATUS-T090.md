# STATUS-T090 — dast-zap-baseline (Sprint 61/F08, local-first)

Data: 2026-09-27. Tarefa: T090-dast-zap-baseline. Branch: chore/sprint-61-dast-baseline (PR #71).
Resultado: **DONE** — workflow operacional, scan verde, triagem completa.

## 1. Harness (3 fixes até verde)

- v1: alvo produção no yaml (herdado Sprint 25) → re-alvejado p/ localhost (produção
  proibida: SSO/quota/ética); activeScan removido (só passive + spider leve).
- v2: run 36322303457 falhou — **"Unrecognised job type: passiveScan"** (AF atual exige
  `passiveScan-config` + `passiveScan-wait`; config Sprint-25 nunca funcionou — os 2 runs
  antigos falhos em main eram o mesmo bug, logs expirados).
- v3: runs falharam — **AccessDeniedException /zap/out** (usuário zap sem escrita) →
  `chmod 777 zap-out` no workflow.
- Run 36324303494: **SUCCESS**. App sobe no job (`bun run dev` + wait loop); ZAP
  `ghcr.io/zaproxy/zaproxy:stable` com `--network=host`.

## 2. Resultado e triagem (crua)

`ZAP alerts by risk: {'Medium': 4, 'Low': 2, 'Informational': 3}` — High 0, dentro dos
thresholds (5/20). Detalhe por alerta (zap-report.json, artifact 30d):
- Medium ×4 (CSP Wildcard, script unsafe-eval, script unsafe-inline, style unsafe-inline —
  todas da policy ESTÁTICA next.config.ts): **MITIGA EM CURSO** (T084 nonce report-only +
  T086 enforcing + T087 retomada; aperto da estática = follow-up da retomada).
- Low X-Powered-By (5 URLs): **ISSUE #74** (poweredByHeader false; fora do escopo deste PR).
- Low Timestamp Unix (chunks estáticos): **ACEITA** (FP: hashes de build, sem dado sensível).

## 3. Verificação T090

- [x] `gh workflow run dast.yml` manual → success (run 36324303494).
- [x] High=0; medium/low triadas (acima).
- [x] `docs/DAST-RUNBOOK.md` existe; baseline em `reports/dast/baseline-summary.json`.
- [x] Workflow NÃO-required (nunca bloqueia PRs). DECISOES.md (D090).

Arquivos: `.github/workflows/dast.yml` (novo), `dast-config/zap-baseline.yaml` (re-alvo +
AF válido), `docs/DAST-RUNBOOK.md`, `reports/dast/baseline-summary.json`, `STATUS-T090.md`,
`DECISOES.md`. Scan de produção adiado (PEND-SSO/BYPASS).
