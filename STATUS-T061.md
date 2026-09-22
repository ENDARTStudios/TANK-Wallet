=== STATUS T061 — Passo 2: HIPÓTESE 2 (baseURL explícito) ===
Data: 2026-09-14
HIPÓTESE 2: Base URL do Playwright pode ser localhost/::1 que falha no CI; forçar 127.0.0.1:3000 pode resolver ECONNREFUSED.
AÇÕES: Atualizar e2e/playwright.config ou specs para usar baseURL=http://127.0.0.1:3000; rodar isolamento security.spec.ts:20.
CRITÉRIO: Se falhar com log, PROPOSTA_DOER admissível (H1 + H2 = 2 hipóteses distintas falhas).
