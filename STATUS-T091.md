# STATUS-T091 — k6-load-testing (Sprint 61/F08, local-first)

Data: 2026-09-27. Tarefa: T091-k6-load-testing. Branch: chore/sprint-61-k6-load.
Resultado: **DONE** — 4 scripts verdes, baseline registrado, teto documentado.

## 1. Scripts e resultados (crus, k6 v2.0.0-rc1, dev local)

- health (GET /api/health, 1VU/10s): **90/90 checks, p95 20.7ms**.
- risk (GET /api/risk c/ header member, 1VU/10s): **92/92, p95 18.4ms**.
- broadcast (POST corpo inválido — nunca transmite, 1VU/10s): **14/14 (400), p95 34.6ms**.
- rate-limit (rajada 10VU/10s): **3166/3166** (200/429 c/ Retry-After ≥1).
- Thresholds: p95<100 (= 4× baseline, margem dev-mode); checks>99% (rate-limit>90%).

## 2. Diagnóstico do caminho (erros iniciais explicados, não varridos)

- a) Unpaced 156rps → falhas: **429 do limiter**, não custo de checks. Issue #72 aberta
  por engano → corrigida por comentário e fechada (working-as-designed).
- b) Broadcast 30/90: 30×400 logados + 61×429 do proxy (não logados) — budget writes
  30/min/IP. Sem bug; sem transporte quebrado (hipótese keep-alive descartada por evidência).
- c) Baselines 10VU/60s (~5.4k reqs, 98% 429): **teto single-IP por desenho**
  (reads 120/min, writes 30/min hardcoded no proxy, T083). Breakdown: 1171×429 vs
  120×200, zero 503. Load além do budget = multi-IP ou janela c/ budget (nunca prod
  sem decisão). Shape 10VU/60s adiado p/ ambiente prod-like (pós PEND-SSO/BYPASS).

## 3. Decisões de segurança do harness

- Broadcast: só corpo inválido (400); corpo válido atingiria RPCs externos (documentado).
- Risk: só GET (POST queimaria quota de terceiros).
- Alvo sempre local; produção/previews proibidos (SSO + quota + ética).

## 4. Verificação T091

- [x] 4 scripts rodam local c/ thresholds (`bun run test:load`).
- [x] Baseline em `reports/load/baseline.json`; runbook `docs/LOAD-TESTING.md`.
- [x] DECISOES.md (D091). PR dedicado; merge após REVIEW (D078).

Arquivos: `scripts/k6/*.js` (4), `package.json` (test:load), `reports/load/baseline.json`,
`docs/LOAD-TESTING.md`, `STATUS-T091.md`, `DECISOES.md`.
Pergunta ao Thinker: budget reads 120/min/IP comporta monitores + uso real? (teto p/ decisão futura).
