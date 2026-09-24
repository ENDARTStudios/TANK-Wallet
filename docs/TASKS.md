# TASKS — Tarefas do Sprint e Próximas

> **Tipo:** Gestão · **Atualizado:** 2026-09-23 · **Fonte canônica:** [`../SPRINT.md`](../SPRINT.md) (sprint atual) · [ISSUES-BACKLOG.md](ISSUES-BACKLOG.md) (backlog)
> **Regra:** não implemente fora do que está no SPRINT.md. Este arquivo espelha o estado e enfileira o que vem a seguir.

## Sprint 59 (atual) — E2E Env Setup Playwright

**Objetivo:** corrigir root cause do env/test setup do Playwright no CI que causou falhas pré-existentes de E2E (security.spec.ts:20 e outros 8).

| ID | Tarefa | Prioridade | Status | Issue |
| --- | --- | --- | --- | --- |
| T061 | Documentar skip dos 9 testes E2E + STATUS-T061.md + DECISOES.md | Alta | ✅ Feito (2026-09-22) | — |
| T062 | Reabilitar 9 testes E2E pulados (remover `test.skip`); `next build` sem erro; `gh pr checks 48` 10/10 verde | Alta | 🔄 Em fila (diferida de Sprint 59) | a criar |

**Critérios T062:** testes 9 pulados reabilitados · `tsc:0` · `verify` 11/11 ✅ · `next build` sem erro.

## Sprint 58 (concluído) — MPC v2 + HSM Real

| ID | Tarefa | Status |
| --- | --- | --- |
| T058 | MPC v2: threshold signatures k-of-n via Shamir + Feldman VSS (DKG, signing, resharing, refresh — 4 testes) | ✅ APROVADO |
| T058b | HSM: `AwsKmsHsm` (KMS:Sign + GetPublicKey), `GcpKmsHsm`, `AzureKeyVaultHsm` (3 testes) | ✅ APROVADO |

## Próximas (candidatas, por prioridade)

| Tarefa | Origem | Prioridade |
| --- | --- | --- |
| Commissionar Audit #1 (crypto + key management + recovery) — pacote pronto em `docs/audit-package/` | Roadmap de release | Alta |
| Fechar findings Trail of Bits (engagement em `audit-config/trail-of-bits-engagement.md`) | v1.3.0 | Alta |
| Migrar banco para Postgres em produção multi-tenant (script `scripts/migrate-sqlite-to-postgres.ts` pronto) | PRD risco | Média |
| Launch bug bounty público (Immunefi) — draft pronto, pós-Audit #1 | `docs/security/bug-bounty-launch-guide.md` | Média |
| Submissão HSTS preload (janela 2027-02) | [HSTS-PRELOAD.md](HSTS-PRELOAD.md) | Média |
| PWA mobile polish (v1.3.0) | HANDOFF.md | Média |
| Pentest externo | Roadmap de release | Média |

## Definição de pronto (DoD) padrão

- [ ] Testes novos passando (unit/integração; E2E se fluxo crítico)
- [ ] `tsc --noEmit` sem erros
- [ ] `bun run verify` 11/11 ✅
- [ ] Docs relacionados atualizados no mesmo PR
- [ ] PR com `Closes #N` + gate verde

## Instruções de atualização

1. Ao iniciar/finalizar tarefa: atualize status aqui **e** no `../SPRINT.md` (canônico).
2. Tarefa concluída vira entrada no [CHANGELOG.md](CHANGELOG.md) sob o número do sprint.
3. Nova tarefa candidata: primeiro issue (ou ISSUES-BACKLOG), depois linha na seção "Próximas".
4. Diferimentos (como T062) ficam visíveis com motivo no `STATUS-*.md` correspondente e em `../DECISOES.md`.
