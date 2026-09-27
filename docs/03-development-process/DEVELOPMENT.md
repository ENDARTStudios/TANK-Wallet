# DEVELOPMENT — Rotina de Desenvolvimento

> **Tipo:** Operação · **Atualizado:** 2026-09-23 · Contrato completo: `../AGENTS.md` · Regras: [RULES.md](RULES.md)

## 1. Ciclo de trabalho (diário)

```
Issue → branch (feat/fix/issue-N) → GRAFT-FIRST (localizar) → teste failing
      → implementação → bun run verify → PR (Closes #N) → gate verde → review → merge
```

- **Nunca** implementar fora do `../SPRINT.md`.
- **Nunca** merge sem gate verde (7 checks de branch protection + 1 review).
- PR de feature atualiza docs no mesmo PR (R1).

## 2. Comandos essenciais

| Comando | Uso |
| --- | --- |
| `bun run dev` | Dev server porta 3000 (log em `dev.log`) |
| `bun run test` | Unit + integração (bun test em `src`) |
| `bun run test:coverage` | Cobertura (Codecov local) |
| `bun run test:e2e` | Playwright (`test:e2e:ui` para modo visual) |
| `bun run verify` | Gate local: lint, tsc, test, conformance, metrics, audit:code, SBOM, secrets, dep-scan, enforce, signature (11) |
| `bun run lint` | ESLint |
| `bun run db:generate` / `db:push` / `db:migrate` | Prisma |
| `bun run metrics` / `audit:code` / `bench` / `golden` | KPIs · dívida técnica · benchmarks · crypto vectors |
| `bunx @nanonets/graft ask/grep/callers` | Navegação GRAFT-FIRST |

## 3. Receitas por tipo de mudança

### Nova rota de API
1. Criar `src/app/api/<recurso>/route.ts` — zod + RBAC (401/403) + envelope de erro com traceId.
2. Rate limit coberto pelo `src/proxy.ts` (conferir limite p/ rota de escrita).
3. Testes: GET formato + POST efeito + 429 ([TESTING.md](TESTING.md) §3) + teste "acessa o que não é seu".
4. Atualizar [API.md](API.md) §2 no mesmo PR.

### Novo módulo de domínio
1. `src/lib/<modulo>/index.ts` como fachada + `__tests__/`.
2. Tipos próprios (zero `any`); exports `@stable` se contrato congelado.
3. Linha em [ARCHITECTURE.md](ARCHITECTURE.md) §3 + [ARCHITECTURE-MODULES.md](ARCHITECTURE-MODULES.md).

### Mudança de schema Prisma
1. Editar `prisma/schema.prisma` → `db:push` (dev) / `db:migrate`.
2. Se tabela tem tenant: `workspace_id` + RLS ([RLS.md](RLS.md)); atualizar `prisma/rls.sql` se Postgres.
3. Atualizar [ARCHITECTURE.md](ARCHITECTURE.md) §4 + UML.

### Componente de UI
1. Estados obrigatórios: skeleton → dado → erro com retry → vazio.
2. Motion + responsividade + a11y (R5; [DESIGN.md](DESIGN.md) §6-7).
3. E2E usa `getByRole`/`getByText`; screenshot/video no CI.

### Integração externa
1. Seguir checklist de [INTEGRATIONS.md](INTEGRATIONS.md) §2 (proxy, timeout, failover, cache, env).

## 4. Debugging

- **Logs:** dev server → `dev.log`; produção → `server.log` + logger estruturado (JSON com traceId).
- **Erro com traceId:** buscar no Sentry pela tag; correlacionar OTel.
- **Flaky E2E:** suspeitar primeiro de env/setup do runner (A4), não do fluxo.
- **Crypto:** `bun run golden` isola regressão de vectors.

## 5. Feature flags e tiers

- Flags por tier/feature: `src/lib/config/feature-flags.ts` (`FeatureFlagKey` + `isFeatureOn`).
- Catálogo de apps/módulos: [ARCHITECTURE-MODULES.md](ARCHITECTURE-MODULES.md). Recurso PRO atrás de flag, nunca espalhado em if.

## 6. i18n

- Chaves em `messages/{pt-BR,en-US,es-ES}.json` — 3 locales no mesmo PR.
- Nunca hardcodear string de UI; usar `loadMessages`/`getMessage` (`src/i18n/config.ts`).

## 7. Instruções de atualização

1. Nova receita recorrente (3+ vezes o mesmo padrão): documente em §3.
2. Mudança de ciclo de trabalho: alterar `../AGENTS.md` primeiro (canônico), depois espelhar aqui.
