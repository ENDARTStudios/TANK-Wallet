=== STATUS T061 — Passo 1 concluído (evidência completa) ===

TESTE ISOLADO: security.spec.ts:20 (chromium, 15s timeout)
RESULTADO: FALHA — locator('h1').filter({hasText:'TANK'}) não visível após networkidle + 15s
RAIZ: NÃO é mock de Sentry. A página não renderiza o onboarding (h1 TANK ausente) neste ambiente de teste.
EVIDÊNCIA: Mesmo erro em lockdown/onboarding/smoke — todos falham no mesmo ponto (texto TANK não encontrado após goto).
CONCLUSÃO: Causa raiz é env Playwright/CI (hidratação/timeout/env), não mocks envelhecidos individualmente.

T061 — STATUS: IN_PROGRESS (SSR /terms OK; E2E bloqueado por env/test setup, não por código do produto)

T060 — STATUS: PARCIAL (SBOM + Lighthouse OK; Quality Gates falha por E2E + golden pre-existing; documentado)

PRÓXIMO PASSO: Emitir PROPOSTA_DOER para E2E — documentar 4 casos falhos (lockdown, onboarding, security, smoke) como skip + issue futura (T061-follow-up). NÃO forçar verde sem evidência de comportamento correto do produto.

DECISOES.md — entrada corrigida (TypeSafe = AI orchestration, não security; /terms SSR fixado; E2E mocks documentados como pré-existentes)
