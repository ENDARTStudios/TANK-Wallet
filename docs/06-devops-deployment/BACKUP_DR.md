# BACKUP_DR — Backup e Recuperação de Desastres

> **Tipo:** Operação · **Atualizado:** 2026-09-23 · Runbooks detalhados: [disaster-recovery.md](disaster-recovery.md) · [incident-response.md](incident-response.md)
> Premissa de produto: chaves ficam com o usuário — o DR aqui cobre **dados de plataforma** (threat intel, contas, logs de permissão), nunca custódia.

## 1. O que é protegido

| Dado | Onde | Crítico? |
| --- | --- | --- |
| Threat intel (tokens/sites/endereços/exploits) | SQLite dev / Postgres prod | Sim — base de detecção |
| `PermissionAuditLog` (HMAC chain) | Banco | Sim — trilha imutável de soberania |
| Contas/RBAC (`User`, `Workspace`) | Banco | Sim |
| `BehaviorProfile`/`BehaviorAnomaly` | Banco | Médio (reconstrói com uso) |
| Vault do usuário | localStorage do dispositivo | **Fora de escopo** — backup é do usuário (seed/Shamir PRO) |

## 2. Mecanismo de backup (implementado)

- **Script:** `scripts/backup-cron.sh` — dump SQLite/Postgres → cifra **openssl AES-256** → upload S3 (stub configurável) → retenção **30 dias**.
- **Helpers programáticos:** `scripts/backup-restore.ts` (backup/restore testáveis).
- **Prova de restauração:** `.github/workflows/restore-e2e.yml` roda **toda segunda 06:00 UTC** — backup que não restaura não é backup.

## 3. Objetivos

| Objetivo | Meta |
| --- | --- |
| RPO (perda máxima de dados) | ≤ 24h (backup diário) |
| RTO (tempo de retorno) | ≤ 4h para serviço degradado; ≤ 24h para completo |
| Retenção | 30 dias |
| Prova de restore | Semanal automática + drill manual por release minor |

## 4. Procedimento de restore (resumo)

1. Último artefato cifrado no S3 → download.
2. Decifração AES-256 (chave no cofre de segredos — nunca no repo).
3. Restore no banco (`scripts/backup-restore.ts`) em ambiente de staging primeiro.
4. Verificar: contagem de models, integridade do HMAC chain (`PermissionAuditLog`), RLS ativo.
5. Promover para produção apenas com checkpoint manual registrado.

## 5. Cenários de desastre e resposta

| Cenário | Resposta |
| --- | --- |
| Perda do banco prod | §4 + cutover DNS; comunicar incidente ([incident-response.md](incident-response.md)) |
| Corrupção de deploy | Rollback de imagem assinada anterior ([PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md)) |
| Comprometimento de segredo | Rotação completa (`docs/05-security-compliance/SECRETS.md`) + audit de acessos |
| Falha de região Render | Rebuild via `render.yaml` + restore; domínio tankwallet.dev |

## 6. Drill (checklist por release minor)

- [ ] Restore semanal automatizado passou (verificar workflow run).
- [ ] Restore manual executado em staging com dados reais.
- [ ] HMAC chain verificado pós-restore.
- [ ] Tempo de restore medido < RTO.
- [ ] Contatos e acessos do runbook válidos.

## 7. Instruções de atualização

1. Novo model crítico no Prisma → adicione à tabela §1 e garanta cobertura do dump.
2. Mudança de provedor (S3 → outro) → atualize §2 e o script no mesmo PR.
3. Incidente real → post-mortem em `../worklog.md` + aprendizado em [MEMORY.md](MEMORY.md) + ajuste de RPO/RTO se necessário.


> **Fundido de:** docs/06-devops-deployment/BACKUP_DR.md

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
