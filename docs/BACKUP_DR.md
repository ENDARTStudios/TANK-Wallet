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
| Comprometimento de segredo | Rotação completa (`docs/SECRETS.md`) + audit de acessos |
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
