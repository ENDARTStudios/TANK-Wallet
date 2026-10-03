# STATUS-T087 — csp-enforce-activation (Sprint 60/F07)

Data: 2026-09-26/27 (America/Sao_Paulo). Tarefa: T087-csp-enforce-activation.
Resultado: **CONDICIONAL-DONE** — env vars setadas (Production + Preview), ativação
efetiva DIFERIDA para o próximo deploy de produção (redeploy via API bloqueado por
quota Hobby 402). NENHUM código alterado (zero-diff). Sem segredo tocado.

## 1. Pré-check local (criterio 1) — PASS

Servidor `bun run dev` local, mesma base do E2E T086:

- Flag OFF (default): `Content-Security-Policy-Report-Only` presente
  (`default-src 'self'; script-src 'self' 'nonce-+okh1igX8s0gFC6...`), E2E 57/57 (T086).
- Flag ON (`$env:CSP_ENFORCE="1"`): `Content-Security-Policy` presente
  (`default-src 'self'; script-src 'self' 'nonce-sAmClJ+Jdug60g0fVl3Kkw=='; ...`),
  `Content-Security-Policy-Report-Only` AUSENTE. Comportamento exato do варианante A.

## 2. Sessão Vercel (criterio 2) — PATH A disponível, depois BLOQUEADO por quota

- `vercel whoami` → `endartstudios` (EXIT 0).
- Diretório NÃO estava linkado → `vercel link --yes` → `✓ Linked end-art-studios/tank-wallet`
  (cria `.vercel/` local, git-ignored; repo continua limpo).
- `vercel env add CSP_ENFORCE production` (stdin `true`) → OK. Verificação:
  ```
  CSP_ENFORCE   Encrypted   Production   50s ago
  ```
- `vercel env add CSP_ENFORCE preview` → OK (canário: próximo preview serve enforcing antes da produção):
  ```
  CSP_ENFORCE   Encrypted   Preview      4s ago
  ```
- Redeploy do deployment de produção atual (`tank-wallet-76vt5y71l`, dpl_4jdAkVws...,
  `--target production`) → **FALHOU**:
  ```
  Error: Resource is limited - try again in 24 hours (more than 100, code: "api-deployments-free-per-day"). (402)
  ```
  → PEND-VERCEL-QUOTA: quota diária Hobby estourada; reset em ~24h.

## 3. ACHADO RELEVANTE — proxy (middleware) NÃO executa nos builds Vercel (pré-existente)

Evidência runtime (crua, `Invoke-WebRequest`):

- Produção (`tank-wallet-76vt5y71l`, 24m, Ready, target production) `GET /api/health` → 200
  com `x-csp-nonce` AUSENTE, `Reporting-Endpoints` AUSENTE, `X-RateLimit-*` AUSENTE,
  `Content-Security-Policy-Report-Only` AUSENTE.
- Preview (`tank-wallet-3twt40rj3`, 18m, alias `...-chore-sprint-60-csp-enforcing-...`,
  i.e. build DO branch T086 com proxy.ts+CSP) `GET /api/health` → 200, mesmos headers AUSENTES.
- Local dev serve todos esses headers (T083/T084/T086 provados por teste + E2E).
- Adicional: a `Content-Security-Policy` estática servida em produção
  (`default-src 'self' vercel.com *.vercel.com ... stripe ...`) DIVERGE textualmente da
  `next.config.ts@main` (`script-src 'self' 'unsafe-inline' 'unsafe-eval' ...`), e a string
  `vercel.live` NUNCA existiu no histórico de `next.config.ts`
  (`git log -S "vercel.live"` vazio). Compatível com build defasado OU injeção da plataforma — TBD.
- Convenção válida: Next 16.1.1 instalado (`^16.1.1`) reconhece `src/proxy.ts`
  (`node -e require(.../lib/constants.js)` → `PX: proxy (?:src/)?proxy`).
  `src/middleware.ts` e `middleware.ts` NÃO existem; `src/proxy.ts` existe desde Sprint 2 (ec67aaf).
- `bun run build` local FALHA por quirk Windows/standalone (`node:inspector` EINVAL no trace,
  sem relação com proxy) — build de referência é o do CI/Vercel (ubuntu), que passa.

Impacto (pré-existente, NÃO causado por T087): rate-limit (T083), bot-guard, CSP nonce
report-only (T084) e contadores (T086) validados apenas LOCAL/CI; em produção Vercel o
`src/proxy.ts` aparenta não executar. → Nova tarefa de investigação **T092-proxy-vercel**
(build logs: linha Middleware/Proxy?; repro mínimo; `middleware.ts` vs `proxy.ts`;
requisitos de runtime/export no Next 16.1.1; suporte Vercel). Segurança efetiva em
produção HOJE = apenas a policy estática de `next.config.ts`.

## 4. Estado de ativação + risco residual

- `CSP_ENFORCE=true` está setada em Production e Preview. Efeito: **somente no próximo
  deploy bem-sucedido** (env de middleware/Edge é incorporada no build).
- Risco: o próximo deploy de produção (auto, no próximo merge em main após reset da quota)
  ATIVARÁ enforcing automaticamente (se o proxy executar no build Vercel). Mitigação:
  (a) Preview com flag ON serve de canário antes — curl no próximo preview;
  (b) E2E local com flag ON passou 57/57; (c) rollback instantâneo = `vercel env rm` + redeploy.
- Risco do rollback: ele TAMBÉM consome quota de deploy (402!). Se a quota estiver estourada
  no momento do incidente, rollback via redeploy fica indisponível por horas. Aceito e registrado.

## 5. Monitoramento (pós próximo deploy produção)

1. `curl -sI https://tankwallet.dev/ | grep -i content-security-policy` → esperar enforcing com nonce.
2. `GET /api/csp-report/stats` baseline (24h) vs baseline report-only T084.
3. Janela 24–48h: qualquer quebra funcional → rollback (env rm + redeploy) + issue.
4. Sessão Vercel local permanece linkada (`.vercel/`, ignorado pelo git).

## 6. Pendências

- PEND-VERCEL-QUOTA (operador informado; reset ~24h; nenhum deploy via API até lá).
- T092-proxy-vercel (investigação dedicada, proposta para Sprint 61/F08).
- Sem REVIEW ainda (D078) — PR de docs desta tarefa aguarda revisão antes de merge.

Arquivos tocados: `STATUS-T087.md` (este), `DECISOES.md` (D081). Zero diff de código.

## 7. CORREÇÃO a linha T086 ("mudança zero por construção")

Leitura direta de `src/lib/security/csp.ts:45-70`: `buildEnforcingPolicy = buildReportOnlyPolicy
+ report-to`, e a report-only é nonce-only (`script-src 'self' 'nonce-...'` — SEM
`'unsafe-inline'`). Portanto a afirmação em DECISOES ("enforcing preserva unsafe-inline,
mudança zero") está IMPRECISA: com duas policies enforcing servidas (estática next.config
com unsafe-inline + middleware nonce-only), browsers aplicam a interseção — inline scripts
sem nonce seriam BLOQUEADOS sob enforcing. O E2E local com flag ON passou 57/57 mesmo assim
(evidência empírica de compatibilidade em dev), mas o risco de produção é NÃO-ZERO —
o que reforça o canário (Preview ON) + monitoramento 24–48h + rollback deste plano.
Correção registrada em D081.

## 8. ADENDO T093-csp-flag-safe-state (R092) — 2026-09-27

REVIEW R092 REJECTED o fechamento da T087 (não o trabalho): flag armada em Production com
gatilho num merge futuro qualquer = bomba-relógio. Correção aplicada via CLI:

- `vercel env rm CSP_ENFORCE production --yes` → `Removed Environment Variable`.
- Verificação (`vercel env ls | Select-String CSP_ENFORCE`, valores redigidos):
  ```
  CSP_ENFORCE   Encrypted   Preview   21m ago
  ```
  Production: AUSENTE ✓. Preview: true (canário isolado) ✓.
- `vercel ls`: nenhum deploy novo no intervalo (mais recente = 34m, pré-existente).
  Nenhum comportamento de produção mudou nem pode mudar sem deploy supervisionado.
- Regra permanente (D093): flag de segurança em Production só é alterada no mesmo ato em
  que começa o monitoramento supervisionado. Ativação real → T087 retomada (após T092 + T093).
