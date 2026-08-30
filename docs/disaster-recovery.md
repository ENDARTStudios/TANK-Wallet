# Disaster Recovery Plan
> Status: Active | Maintainer: Engineering Lead

## Scenarios: Server loss (4h/1h), DB loss (2h/1h), Cloud compromise (8h/24h), DDoS (1h/n/a), Code loss (24h/0), Key loss (4h/0)

## Backup: SQLite hourly, Git mirror, Keys via Shamir SSS, Config sealed-secrets

## DR Drills: Monthly DB restore, Quarterly full, Annual multi-failure

## Sprint 22 — DR Drill Checklist (S22)

### Backup
- [ ] `bun run backup:create` gera `db/backup-{timestamp}.db`
- [ ] `pg_dump $DATABASE_URL > db/pg-{date}.sql` para Postgres prod
- [ ] Upload para bucket S3/GCS com retenção 30 dias
- [ ] Cifrar backup com `BACKUP_ENCRYPTION_KEY` (AES-256-GCM)

### Restore (testado em CI, Sprint 22)
- [ ] `bun test scripts/__tests__/backup-restore.test.ts` passa (2 tests)
- [ ] Restore SQLite em `db/_target.db` e valida tamanho + conteúdo
- [ ] Restore Postgres em `db/pg-restore-test` e valida com `bun prisma studio` ou query direta
- [ ] RPO ≤ 1h, RTO ≤ 4h

### Cenários
- [ ] DB loss: restore último backup hourly, re-apply migrations
- [ ] Key loss: combinar Shamir shares (Sprint 16) k-of-n
- [ ] Cloud compromise: rotacionar `NEXTAUTH_SECRET`, `SENTRY_AUTH_TOKEN`, `VAPID_*`; invalidar JWTs
- [ ] DDoS: rate limit + bot block ativos (Sprint 3); failover edge Caddy
- [ ] Code loss: `git clone` + restore backup config; deploy via `release.yml` cosign

### Drill mensal (script)
```bash
# 1. Backup
bun run backup:create
pg_dump $DATABASE_URL > db/pg-$(date +%F).sql

# 2. Restore (test bench)
bun test scripts/__tests__/backup-restore.test.ts

# 3. Validação
psql $TEST_DATABASE_URL < db/pg-$(date +%F).sql
bunx prisma studio &
```

### Responsáveis
- DB: `@ENDARTStudios` (DBA)
- Keys: Shamir custodians (3-of-5 mínimo)
- Comunicação: `incidents@tankwallet.dev` (alias) + PGP `pgp-key.asc`
