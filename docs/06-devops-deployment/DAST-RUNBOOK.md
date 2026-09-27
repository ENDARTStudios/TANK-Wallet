# DAST Runbook (T090)

## O que é

OWASP ZAP baseline (passivo + spider leve, SEM active scan agressivo) contra o app
rodando **localmente no mesmo host do scanner**. Workflow: `.github/workflows/dast.yml`
(semanal seg 06:00 UTC + manual). **Não é required check** — nunca bloqueia PRs.

## Por que só local

Produção e previews estão atrás de Vercel Authentication (muro SSO): o scan mediria a
página de login, não o app (lição T092). Scan de produção aguarda PEND-SSO/BYPASS +
janela aprovada pelo Operador. **Nunca escanear produção sem decisão explícita.**

## Rodar manual (CI)

```
gh workflow run dast.yml --ref <branch-ou-main>
gh run watch <run-id>
gh run download <run-id> -n zap-baseline-report -D zap-out-local
```

## Rodar local (requer docker; indisponível no Windows do Doer — usar CI)

```
bun run dev &
docker run --rm --network="host" \
  -v "$PWD/dast-config:/zap/wrk:ro" -v "$PWD/zap-out:/zap/out" \
  ghcr.io/zaproxy/zaproxy:stable zap.sh -cmd -autorun /zap/wrk/zap-baseline.yaml
```

No Windows sem docker, o equivalente é o disparo via CI acima.

## Interpretar

- **High > 0**: job falha; abrir issue `security` + corrigir antes de qualquer promoção.
- **Medium/Low**: triar em DECISOES.md (aceita com justificativa / mitiga / issue).
  Thresholds do plano: medium 5, low 20 (Sprint 25, mantidos).
- Contagens rápidas: ver step "Alert counts by risk" no run, ou
  `python3 -c` sobre `zap-out/zap-report.json`.

## Escalar finding

1. Confirmar que não é falso-positivo do spider (ZAP passivo gera FPs em SPAs).
2. Reproduzir localmente fora do ZAP (curl/devtools).
3. Confirmado → issue com label `security` + severidade; crítico bloqueia promoção F07.

## Artefatos

Relatório completo = artifact do run (30 dias). Baseline agregado commitado em
`reports/dast/baseline-summary.json` (contagens por risco, sem dados sensíveis).
