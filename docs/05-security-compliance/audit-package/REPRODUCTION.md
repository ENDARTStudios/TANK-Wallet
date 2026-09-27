# Runbook de Reprodução Local (para auditores)

## Pré-requisitos

- Node.js 20+, Bun 1.3+, Git, OpenSSL.

## Passos

```bash
git clone https://github.com/ENDARTStudios/TANK-Wallet.git
cd TANK-Wallet
git checkout 2977f209eeb49b44485670205daae74009a29a16
cp .env.example .env
bun install --frozen-lockfile
bunx prisma generate
```

## Verificação

```bash
bun test src --path-ignore-patterns e2e/**
bunx tsc --noEmit
bun run lint
bun run verify
```

## Banco local

SQLite em `db/custom.db` (ver `DATABASE_URL` em `.env`). Seed se aplicável: `bunx prisma db seed` (quando existir).

## Docker (quando disponível)

Ver `docker-compose.yml` na raiz para Postgres local + serviços auxiliares.

## Observações para auditores

- Telemetria/desenvolvimento usa `.env` local — nunca commitar valores reais.
- CSP está em modo report-only (`Content-Security-Policy-Report-Only`); enforcing é T086.
- Flags de IA (`JEV_ENABLED`, `INTENT_ROUTING_ENABLED`) default off; testes injetam flag por parâmetro.
