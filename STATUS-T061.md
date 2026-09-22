=== STATUS T061 — Passo 2: HIPÓTESES TESTADAS (30min timebox) ===
Data: 2026-09-14

HIPÓTESE 1 (testada agora): webServer/env/baseURL — page.goto com networkidle pode ser agressivo para app pesado (compile 10-11s observado no CI). Teste: alterar para waitUntil: 'load' + timeout 20s.
RESULTADO: A testar — commit 93af8a7 já usou networkidle + 15s. Próximo: load + 20s.

HIPÓTESE 2 (preparada): Dependência de CI — `bun install --frozen-lockfile` pode não instalar `playwright` browsers; CI já faz `bunx playwright install --with-deps` (verificado no workflow). Se falhar, seria erro de setup de CI, não código.

HIPÓTESE 3 (preparada): Base URL / proxy — o WebServer usa `next dev -p 3000`; se a URL base for diferente no CI (localhost vs 127.0.0.1 vs ::1), pode causar ECONNREFUSED (observado no log: "connect ECONNREFUSED ::1:4318"). Teste: forçar `page.goto("http://127.0.0.1:3000/")` explicitamente.

DECISÃO: Executar HIPÓTESE 1 agora (alterar waitUntil + timeout); se falhar, HIPÓTESE 3; se ainda falhar, emitir PROPOSTA_DOER com critérios de aceitação documentados (lista exata dos testes, causa raiz env, risco de regressão, issue futura Sprint 59).

EVIDÊNCIA DE NÃO-MOCK: Os 4 testes falham no mesmo ponto (h1 TANK não visível), não em assertions específicas. Isso indica problema de renderização da página, não mock desatualizado.
