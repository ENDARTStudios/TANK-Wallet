# TESTING — Estratégia de Testes (Unit / Integração / E2E)

> **Tipo:** Qualidade · **Atualizado:** 2026-09-23 · Runners: **bun test** (unit/integração) + **Playwright** (E2E) · Cobertura: **Codecov**

## 1. Pirâmide

| Camada | Escopo | Runner | Frequência | Onde |
| --- | --- | --- | --- | --- |
| Unit | Lógica pura (engines, parsing, scores, crypto) | `bun test` | Todo commit/PR | `src/lib/**/__tests__/*.test.ts` |
| Integração | Rotas `/api` + Prisma | `bun test` | Todo PR | rotas com banco de teste |
| Golden vectors | Vetores cripto conhecidos | `bun run golden` | PR de crypto + upgrade de lib | `scripts/golden-vectors/` |
| E2E | Fluxo crítico na UI | Playwright | PR críticos + CI | `e2e/*.spec.ts` |

## 2. Unit

- Suíte atual: 160+ testes em `src/lib/` (engines, kernel, observability, webauthn, wallet-connect, billing, metrics, i18n, crypto...).
- Regra: teste falha → correção → passa (TDD para bugs — R4).
- Mocks apenas em teste — **nunca** em produção (CI detecta mock em prod).

## 3. Integração (por rota `/api`)

- Cada rota tem: `GET` (formato), `POST` (efeito) e **`429`** (rate limit).
- Banco: SQLite efêmero por worker (`DATABASE_URL=file:./db/test.db`).
- RBAC: 1 teste por (rota × papel) — `member` assina, `viewer` 403, sem sessão 401.
- Webhook Stripe: assinatura inválida → 400 (teste obrigatório).

## 4. E2E (Playwright)

Specs existentes (`e2e/`):

| Spec | Fluxo |
| --- | --- |
| `onboarding.spec.ts` | Criar carteira → senha → protegida |
| `lockdown.spec.ts` | Lockdown L1-L4 + estado na sidebar/header |
| `security.spec.ts` | Fluxos de segurança (scan, DApp Shield) |
| `smoke.spec.ts` | Home, `/api/health`, sitemap, robots, HSTS |
| `lighthouse-budget.spec.ts` | Budgets de performance |
| `pwa.spec.ts` | Manifest + service worker |

- Devices: `chromium` · `mobile-375` · `tablet-768` (sem overflow horizontal).
- Seletores por papel/texto (`getByRole`), skeleton asserado (`[data-skeleton]`).
- Screenshot + vídeo no CI para análise de regressão.
- **Estado atual (T061/T062):** 9 testes com `test.skip` documentado por root cause de env/setup no CI — reabilitação é a tarefa T062.

## 5. Cobertura & Gate (Codecov)

- `bun run test:coverage` → relatório no PR.
- Gate de PR: diferença de cobertura **≥ 0%** (nunca reduzir o agregado); alvo **80% lines em `src/lib`**.
- Aba "Changed files" do Codecov é parte do review.

## 6. QA hostil (flagra bugs)

- Campo vazio / texto gigante / upload errado / duplo clique / sessão expirada.
- Duas abas, falha de API (500), requisições duplicadas (idempotência).
- SQL Injection, XSS (JSON), path traversal em upload.
- **Regra:** todo bug achado vira teste reprodutível (bun/Playwright) antes da correção.

## 7. Regras gerais

1. Rota nova exige: unit + integração + (se fluxo crítico) E2E.
2. PR de crypto roda `bun run golden` (9 vector sets).
3. Teste flaky: ou conserta o root cause (ver A4 — quase sempre env/setup), ou `test.skip` **documentado** com issue aberta.
4. Nunca weaken asserção para ficar verde — regressão silenciosa é pior que vermelho.
