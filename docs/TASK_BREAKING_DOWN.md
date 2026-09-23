# TASK_BREAKING_DOWN — Como Quebrar Trabalho em Tarefas

> **Tipo:** Gestão · **Atualizado:** 2026-09-23 · Aplica-se a: sprints em `../SPRINT.md` · issues em [ISSUES-BACKLOG.md](ISSUES-BACKLOG.md)
> **Regra-mãe (AGENTS.md §2):** toda tarefa nasce de uma issue e morre num PR com `Closes #N`.

## 1. Hierarquia

```
Épico (fase do ROADMAP)
  └─ Issue (GitHub ou ISSUES-BACKLOG.md) — o "por quê/o quê"
       └─ Tarefa T0NN (SPRINT.md) — o "como", executável em 1 sessão
            └─ PR — a entrega, com testes e docs
```

## 2. Seleção: maior impacto × menor complexidade

Ao planejar o sprint, priorize o quadrante **alto impacto + baixa complexidade** primeiro (ex.: remover `.env` do git foi "maior impacto, menor complexidade" — venceu SPRINT-1). Impacto = reduz risco de perda de fundos, desbloqueia release gate, ou serve conversão PRO. Complexidade = arquivos tocados × dependências × incerteza.

## 3. Formato de tarefa (template obrigatório do SPRINT.md)

```markdown
#### T0NN — Nome curto (ALTA|MÉDIA|BAIXA)
- **Arquivos:** `caminho/arquivo.ts` (novo|editado), ...
- **Ações:** verbo + objeto por linha (o que exatamente fazer)
- **Critério:** comando verificável ("bun test X" N pass | "gh pr checks" verde)
```

**Regras do formato**

1. Tarefa sem **critério verificável por comando** não entra no sprint ("funciona" não é critério).
2. Tarefa que toca > 5 arquivos provavelmente são duas tarefas.
3. Liste **arquivos antes de começar** (AGENTS.md: "antes de editar, liste arquivos + dependências").
4. Teste entra como parte da tarefa (failing → implementação → verde), nunca como "depois".

## 4. Exemplo real (Sprint 58)

```markdown
#### T1 — MPC v2 (ALTO)
- **Arquivos:** src/lib/mpc/v2/index.ts (novo), src/lib/mpc/v2/__tests__/mcpv2.test.ts (novo)
- **Ações:** threshold signatures k-of-n via Shamir + Feldman VSS; 4 testes (DKG, signing, resharing, refresh)
- **Critério:** bun test mpc/v2 → 4 pass
```

## 5. Definition of Ready (tarefa pode entrar no sprint)

- [ ] Issue existe e está linkada.
- [ ] Escopo cabe em 1 sessão de trabalho.
- [ ] Arquivos afetados identificados (grafo consultado — GRAFT-FIRST).
- [ ] Critério de fechamento é comando verificável.
- [ ] Testes necessários definidos.
- [ ] Sem dependência de tarefa não iniciada (ou dependência explícita, como T062 → T061).

## 6. Definition of Done (DoD padrão)

- [ ] Critério do sprint atingido (comando verde).
- [ ] `tsc --noEmit` limpo · `bun run verify` 11/11 ✅.
- [ ] Docs relacionados atualizados no mesmo PR.
- [ ] PR mergeado com gate verde + review.
- [ ] Entrada no [CHANGELOG.md](CHANGELOG.md) + status em [TASKS.md](TASKS.md).

## 7. Diferimento (caso T062)

Quando uma tarefa não fecha no sprint: **não silencie**. Registre (1) motivo no `STATUS-T*.md`, (2) decisão em `../DECISOES.md`, (3) novo sprint-alvo em [TASKS.md](TASKS.md). Dívida visível é gerenciável; dívida invisível é bug futuro.

## 8. Instruções de atualização

1. Este template é o contrato do `../SPRINT.md` — mudanças aqui valem para o próximo sprint.
2. Novo tipo de critério (ex.: métrica de bench) → adicione exemplo em §3.
