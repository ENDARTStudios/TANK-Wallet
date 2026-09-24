# ONBOARDING — Onboarding de Novos Devs/Agentes

> **Tipo:** Operação · **Atualizado:** 2026-09-23 · Tempo esperado: **10 minutos** até o dev server rodar.
> Complemento: [HANDOFF.md](HANDOFF.md) (handoff completo v1.2.0) · [SETUP.md](SETUP.md) (instalação detalhada).

## 1. Ordem de leitura obrigatória (15 min)

1. [`../AGENTS.md`](../AGENTS.md) — contrato de trabalho (fluxo Issue → PR → gate; GRAFT-FIRST).
2. [RULES.md](RULES.md) — as 12 regras do repo em formato rápido.
3. [PRD.md](PRD.md) — o que o produto é (e o que **não** é).
4. [ARCHITECTURE.md](ARCHITECTURE.md) — camadas e módulos.
5. `../SPRINT.md` — o que está em execução agora.

## 2. Setup rápido

```bash
git clone https://github.com/ENDARTStudios/TANK-Wallet.git
cd TANK-Wallet
bun install --frozen-lockfile
cp .env.example .env        # preencher (NUNCA commitar o .env)
bun run db:generate         # Prisma client
bun run dev                 # http://localhost:3000
```

Pré-requisitos: Bun, Node 20+, Docker (opcional — Postgres via `docker-compose.yml`). Detalhes e troubleshooting: [SETUP.md](SETUP.md).

## 3. Mapa do repositório (o que vive onde)

| Caminho | Conteúdo |
| --- | --- |
| `src/app/` | App Router: páginas + `/api/*` + `error.tsx`/`global-error.tsx` |
| `src/lib/wallet-*/` | Domínio: core, evm, engines, kernel, sovereignty, scanner... |
| `src/lib/{auth,billing,observability,metrics}/` | Infra de app |
| `src/components/wallet/` | UI: onboarding, sovereignty, scanner, views |
| `src/proxy.ts` | Rate limit + bot-guard + headers |
| `prisma/` | Schema SQLite + `schema.postgres.prisma` + `rls.sql` |
| `e2e/` | Playwright (6 specs) |
| `scripts/` | verify, metrics, audit:code, enforce, bench, golden, backup |
| `.github/workflows/` | 9 workflows de CI |
| `docs/` | Esta base documental |

## 4. Comandos do dia a dia

```bash
bun run dev          # dev server (porta 3000, log em dev.log)
bun run verify       # gate único local (11 checks)
bun run test         # unit + integração (bun test)
bun run test:e2e     # Playwright
bun run metrics      # KPIs + assinatura + histórico
bun run golden       # crypto golden vectors
```

## 5. Primeira tarefa (ritual)

1. Pegue uma issue do sprint atual (ou do [ISSUES-BACKLOG.md](ISSUES-BACKLOG.md)).
2. Rode `npx @nanonets/graft ask "..."` para localizar o código (GRAFT-FIRST).
3. Branch `feat/issue-N-descricao` → teste failing → implementação → `bun run verify`.
4. PR com `Closes #N`; gate verde; docs atualizados; 1 review (branch protection).

## 6. O que NÃO fazer

- ❌ Commitar `.env`, chaves, DSN, tokens (regra zero).
- ❌ Implementar fora do `SPRINT.md`.
- ❌ Subir PR sem teste ou reduzindo cobertura.
- ❌ Mixar idioma: código em inglês, prosa em pt-BR.
- ❌ Adicionar biblioteca de animação/UI nova quando uma existente cobre.

## 7. Canais e referências de segurança

- Vulnerabilidade: `security@tankwallet.dev` (PGP) — ver `../SECURITY.md` e `../BUG-BOUNTY.md`.
- Incidente de produção: [incident-response.md](incident-response.md).
- Dúvida sobre permissões: [RBAC.md](RBAC.md) · [RLS.md](RLS.md).
