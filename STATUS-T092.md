# STATUS-T092 — middleware-vercel-diagnosis (Sprint 60/F07)

Data: 2026-09-27. Tarefa: T092 (depende de T093-DONE). Sem código alterado.
Resultado: **DIAGNÓSTICO PARCIAL COM BLOQUEIO IDENTIFICADO** — H1 vs H2 NÃO separável
do lado de fora; evidência §3 da T087 ANULADA por erro metodológico (assumido abaixo);
janela "zero violações" da T086 CONFIRMADA como vacuidade; desbloqueio preciso p/ Operador.

## 1. Erro metodológico (owned, corrige STATUS-T087 §3)

Todos os curls Vercel da T087 (prod + preview, GET / e /api/health) retornaram 200 MAS o corpo
é a página de login SSO da Vercel — NÃO o app. Evidência crua (preview `/`, 2026-09-27):

- `LEN=341103`, `TITLE=Login - Vercel`
- keywords no corpo: vercel=True, sso=True, challenge=True, login=True, protection=True
- `data-dpl-id="dpl_9aMXn9476QB1BuyU15SwNTUE3wr2"` = infra de proteção, NÃO o build do app
  (preview real = dpl_4xtkHwsNpwgxtXzKGioXbKnhu6zp; prod real = dpl_4jdAkVwsZTqjTt9cgj26CE6kxdqp)
- POST `/api/csp-report` (preview E prod) → 401 com corpo
  `{"protection":{"password_enabled":false,"vercel_auth_enabled":true,...}}`
- GETs "200 sem headers do proxy" MEDIRAM O MURO, não o app. Conclusão "proxy não executa"
  da T087-§3 = INVÁLIDA. A policy "vercel.com/stripe/..." observada = policy da página de
  login da Vercel, não do repo (explica `git log -S "vercel.live"` vazio).

## 2. Fatos confirmados (novos)

- Vercel Authentication (SSO) ATIVA em Preview E em Production (`vercel_auth_enabled:true`
  nos dois). Ninguém fora do time SSO-Vercel carrega o app.
- `tankwallet.dev` NÃO resolve DNS desta rede (`O nome remoto não pôde ser resolvido`) —
  domínio custom aparentemente sem DNS/live; superfície pública = URLs vercel.app (muradas).
- `vercel logs <preview>` → `No logs found` (nada executa vindo de fora; consistente c/ muro).
- Convenção segue válida: Next 16.1.1 reconhece `src/proxy.ts` (`PX: proxy (?:src/)?proxy`);
  `src/proxy.ts` existe desde Sprint 2; dev local serve todos os headers (T083/T084/T086).

## 3. H1 vs H2 — status

- INFERÊNCIA (não prova): prod criado ~23:30 ≈ merge 8118004 (PR #63) → provavelmente CONTÉM
  código T084; preview alias `...-chore-sprint-60-csp-enforcing-...` → CONTÉM código T086.
  H1 "build anterior a T084" = improvável para ambos, mas comportamento de headers é
  INTESTÁVEL sem bypass → H1/H2 seguem ABERTAS.
- NOTA: T092 exigia "commit ativo via vercel ls/dashboard" — `vercel inspect` não expõe
  metadados git; fingerprint por rota (`/api/csp-report` existe?) é inconclusivo atrás do
  muro (401 da plataforma para qualquer POST). Identificação exata do commit fica p/ fase
  com bypass (ou dashboard do Operador).

## 4. Janela T086 "zero violações" — vacuidade CONFIRMADA (não só suspeita)

Com SSO wall em produção, nenhum browser externo conseguia sequer carregar o app para gerar
reports; POSTs em `/api/csp-report` recebem 401 da plataforma. "Zero hits" era o único
resultado possível. Evidência de promoção da T086 a partir de produção = NULA.
Restam válidas: E2E local flag-on 57/57 + unit tests + review. Promoção segue PAUSADA (R092).

## 5. Desbloqueio (Operador — sem segredos no chat)

- PEND-SSO-PROD: Vercel Authentication em Production é intencional? (Se误configuração,
  corrigir o escopo p/ previews e re-testar.) + status do DNS tankwallet.dev.
- PEND-BYPASS-CURLS: com header `x-vercel-protection-bypass` (token do dashboard, NÃO
  colar no chat), rodar e devolver APENAS presença/ausência redigida:
  `GET /` + `GET /terms` no preview T086 → `x-csp-nonce`? `Reporting-Endpoints`?
  `Content-Security-Policy-Report-Only`? (Preview tem CSP_ENFORCE=true → esperar enforcing.)
  Presente = H2 morta, controles vivos; ausente = H2 confirmada → correção de build.
- PEND-VERCEL-QUOTA segue (402, reset ~24h); se recursar, decisão de custo do Operador.

## 6. Verificação T092

- [x] Testes discriminatórios executados (páginas / e /terms, preview+prod) — resultado:
      muro SSO, não app (evidência crua acima).
- [x] Tentativa de commit ativo + build logs via CLI (indisponíveis sem dashboard/bypass).
- [x] STATUS-T092.md + DECISOES.md (D092). Sem código, sem segredo.
- [ ] Headers do middleware em página real — BLOQUEADO (pendências §5).

Arquivos: `STATUS-T092.md` (este), `DECISOES.md` (D092). Commit na branch do PR #65 (docs).
