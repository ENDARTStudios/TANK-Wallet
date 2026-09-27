# SETUP — Instalação do Ambiente

> **Tipo:** Operação · **Atualizado:** 2026-09-23 · Onboarding rápido: [ONBOARDING.md](ONBOARDING.md)
> Plataforma de referência: Windows (Git Bash) + Linux CI.

## 1. Pré-requisitos

| Ferramenta | Versão | Verificação |
| --- | --- | --- |
| **Bun** | ≥ 1.3 | `bun --version` |
| **Node.js** | ≥ 20 | `node --version` |
| **Git** | ≥ 2.40 | `git --version` |
| **Docker** (opcional — Postgres) | ≥ 24 | `docker --version` |
| **Playwright browsers** (E2E) | — | `bunx playwright install` |

## 2. Passo a passo

```bash
# 1. Clonar
git clone https://github.com/ENDARTStudios/TANK-Wallet.git
cd TANK-Wallet

# 2. Dependências (lockfile congelado — nunca install solto)
bun install --frozen-lockfile

# 3. Ambiente
cp .env.example .env
#    → preencher no mínimo: DATABASE_URL, NEXTAUTH_SECRET (openssl rand -hex 32), NEXTAUTH_URL
#    → NUNCA commitar o .env (regra zero)

# 4. Prisma
bun run db:generate    # gera o client
bun run db:push        # aplica o schema no SQLite de dev

# 5. Grafo de navegação (GRAFT-FIRST — obrigatório)
bunx @nanonets/graft build

# 6. Rodar
bun run dev            # http://localhost:3000 (log em dev.log)
```

## 3. Verificar que está tudo certo

```bash
bun test               # suíte unit/integração — verde
bun run verify         # gate local 11/11 ✅
bun run test:e2e       # Playwright (precisa de browsers instalados)
```

## 4. Postgres local (opcional — cenário prod-like)

```bash
docker compose up -d           # Postgres 16
# DATABASE_URL="postgresql://USER:PASS@localhost:5432/tank_wallet?schema=public"
bun run db:generate && bun run db:push
# RLS: scripts/apply-rls.ts aplica as 6 policies FORCE (prisma/rls.sql)
```

## 5. Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `bun install` falha no Windows | Link simbólico/antivírus | Rodar no Git Bash; garantir permissão de dev |
| Prisma `P1003` (db não existe) | `db:push` não rodado | `bun run db:generate && bun run db:push` |
| E2E falha no CI mas não local | Env/test setup do runner (aprendizado A4) | Ver lição T061/T062; não "corrigir" o teste antes de checar o env |
| Porta 3000 ocupada | Dev server anterior | `bun run dev` fixo na 3000; matar processo ou usar outro terminal |
| Crypto vectors falham após upgrade | Compat de libs noble/viem | Lockfile congelado + `bun run golden` (A3) |
| RPC instável local | Rate limit do público | Failover é automático; conferir rede/VPN |

## 6. Segurança do ambiente local

- `.env` **nunca** no git (`.gitignore` cobre; gitleaks pega se escapar).
- Não colar DSN de produção no `.env` local — usar valores de dev.
- `graft/` é regenerável e git-ignored — cada dev/agent gera o seu.

## 7. Instruções de atualização

1. Novo pré-requisito ou passo obrigatório: atualize aqui e no workflow de CI no mesmo PR.
2. Novo erro recorrente de setup: adicione à tabela §5 quando ocorrer 2+ vezes.
3. Mudança de comando (scripts do `package.json`): sincronizar §2/§3 e [DEVELOPMENT.md](DEVELOPMENT.md).
