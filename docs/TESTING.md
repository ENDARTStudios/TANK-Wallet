# TANK Wallet — Estratégia de Testes (Unit / Integração / E2E)

> Runner: **bun test** (já usado), **Playwright** (E2E) a implementar. Cobertura: **Codecov**.

## 1. Pirâmide

| Camada | Escopo | Runner | Frequência | Exemplo |
| --- | --- | --- | --- | --- |
| Unit | Lógica pura (engines, parsing, scores) | `bun test` | Todo commit/PR | `wallet-engines/__tests__/*.test.ts` |
| Integração | API rotas + Prisma (SQLite) | `bun test` | Todo PR | Rota `route.ts` com banco em memória |
| E2E | Fluxo crítico na UI | Playwright | PR críticos + CI | Onboarding → Senha → Lockdown |

## 2. Unit (já existe)

- 10 arquivos `*.test.ts` em `src/lib/wallet-engines/__tests__` e `wallet-kernel/__tests__`.
- Vectors golden em `scripts/golden-vectors/transaction-flow.ts` (comando `npm run golden`).

## 3. Integração (a implementar)

- Cada rota `/api/*` tem teste: `GET` (formato), `POST` (efeito) e **429** (rate limit).
- Banco: `db/test.db` (SQLite efêmero) por worker; env de teste com `DATABASE_URL=file:./db/test.db`.
- RBAC: 1 teste por (rota × papel) — `member` assinando, `viewer` negado, etc.

## 4. E2E (Playwright)

```ts
// e2e/onboarding.spec.ts
import { test, expect } from "@playwright/test";

test("cria carteira e executa lockdown", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /criar wallet/i }).click();
  // fluxo: mnemonic → senha → protegida
  await expect(page.getByText("LOCKDOWN ATIVO")).toBeVisible();
  // a cada seção exibe skeleton antes do dado
  await expect(page.locator("[data-skeleton]").first()).toBeVisible();
});
```

- Fluxos críticos: onboarding, senha, scan, lockdown, RBAC + rate limit.
- Gravar screenshot + vídeo no CI para não quebrar em regressão.

## 5. Cobertura & Gate (Codecov)

- `npm run test:coverage` → `bun test src --coverage`.
- Gate de PR: diferença de cobertura ≥ 0% (nunca reduzir o agregado); alvo 80% de lines em `src/lib`.
- Codecov: relatório no PR; aba "Changed files" obrigatória.

## 6. QA hostil (flaga bugs)

(Do skill "Tente quebrar a funcionalidade" — ver `AGENTS.md`)
- Campo vazio / texto gigante / upload errado / duplo clique / sessão expirada.
- Duas abas, falha de API (500), requisições duplicadas (idempotência).
- SQL Injection, XSS (JSON), upload com `<path>`.
- **Regra:** todo bug achado vira um teste reprodutível (bun/Playwright).

## 7. Regras

- Sempre: **teste que falha → correção → passa** (TDD para bugs).
- Mocks apenas em testes — nunca em produção (CI detecta mock em prod).
- Rota nova exige: unit + integração + (se crítico) E2E.
