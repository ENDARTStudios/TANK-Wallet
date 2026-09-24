# ITERATION — Processo de Iteração

> **Tipo:** Gestão · **Atualizado:** 2026-09-23 · Execução: `../SPRINT.md` · Backlog: [ISSUES-BACKLOG.md](ISSUES-BACKLOG.md) · Quebra de tarefas: [TASK_BREAKING_DOWN.md](TASK_BREAKING_DOWN.md)

## 1. O loop

```
Planejar (impacto × complexidade) → SPRINT.md
  → Executar (Issue → PR → gate) por tarefa T0NN
    → Verificar (critério + verify 11/11)
      → Registrar (CHANGELOG + TASKS + worklog)
        → Medir (bun run metrics) → Retro → próximo sprint
```

## 2. Planejamento do sprint

1. **Entrada:** fases do [ROADMAP.md](ROADMAP.md) + issues do backlog + findings de auditoria/monitoring.
2. **Seleção:** maior impacto × menor complexidade primeiro (desbloqueios de release gate vencem features novas).
3. **Quebra:** tarefas no formato de [TASK_BREAKING_DOWN.md](TASK_BREAKING_DOWN.md) (arquivos, ações, critério verificável).
4. **Escrita:** SPRINT.md é o contrato — **não se implementa fora dele** (R3).
5. Cap de WIP: terminar é melhor que começar; tarefa não fecha → diferimento documentado (§7 de TASK_BREAKING_DOWN, caso T062).

## 3. Ritmo observado (padrão histórico)

- Sprints curtos e temáticos (ex.: Sprint 33 backup, Sprint 38 Stripe, Sprint 58 MPC v2) — 1 tema dominante por sprint facilita review.
- Hotfix de segurança entra **fora de sprint**, com prioridade máxima (regra zero acima de tudo).
- Sprints 1-40 geraram v1.1.0→v1.2.0; consistência > velocidade.

## 4. Verificação de fechamento (DoD)

- [ ] Critério do sprint atingido (comando verde).
- [ ] `tsc:0` · `bun run verify` 11/11 ✅.
- [ ] Docs vivos atualizados (PRD/ARCHITECTURE/RBAC/RLS conforme tocado).
- [ ] CHANGELOG + TASKS.md + worklog registrados.
- [ ] Métricas do sprint coletadas (`bun run metrics`).

## 5. Retrospectiva (por sprint ou agrupada)

Três perguntas, registradas no `../worklog.md`:

1. **O que travou?** (env/setup, dependência externa, escopo mal quebrado)
2. **O que acelerou?** (grafo GRAFT-FIRST, teste-first, failover de integração)
3. **O que mudamos no processo?** → vira regra em [RULES.md](RULES.md) ou aprendizado em [MEMORY.md](MEMORY.md) (nunca fica só na conversa).

## 6. Melhoria contínua técnica (paralela aos sprints)

- **Limpeza periódica** (R11): plano por risco/impacto em [CLEANUP-PLAN.md](CLEANUP-PLAN.md) — código morto, dependência abandonada, TODO antigo.
- **Dívida técnica medida:** `bun run audit:code`; tendência não pode subir sprint a sprint.
- **Governança como código:** `bun run enforce` nos gates.
- **Cobertura:** alvo 80% `src/lib`; degradação bloqueia PR.

## 7. Sinais de que a iteração está doente (agir)

- Sprint termina com > 30% de tarefas diferidas duas vezes seguidas → escopo mal quebrado.
- E2E flaky "resolvido" com skip repetido (além do caso T062 documentado) → dívida de env/setup.
- Changelog de sprint só tem `### Changed` sem teste novo → cobertura caindo.
- `audit:code` subindo 3 sprints seguidos → sprint de limpeza obrigatório.

## 8. Instruções de atualização

1. Mudança no formato de sprint: atualizar [TASK_BREAKING_DOWN.md](TASK_BREAKING_DOWN.md) (contrato) antes do próximo sprint.
2. Sinal novo de "iteração doente" com evidência: adicione a §7.
3. Retro que muda regra: PR editando [RULES.md](RULES.md)/`../AGENTS.md` — processo também é código versionado.
