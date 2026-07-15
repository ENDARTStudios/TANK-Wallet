# .ai/ — Project Governance Layer

> Esta pasta contém as **regras permanentes** do projeto Tank Wallet.
> Estes documentos são a **fonte oficial de verdade** para governança,
> engenharia, prompting e output.
>
> Status: **Ativo a partir de Architecture Frozen 1.0**
> Mantenedor: Engineering Lead + Security Lead

---

## Propósito

O Tank Wallet evoluiu de uma hot wallet Web3 para uma **plataforma
autocustodial de segurança para ativos digitais**. A arquitetura está
congelada (Architecture Freeze 1.0) e o backlog passou a ser
exclusivamente de engenharia.

Esta pasta existe para garantir que:

1. **Toda implementação futura** respeite as regras estabelecidas.
2. **Toda decisão arquitetural relevante** seja registrada e auditável.
3. **Toda tarefa** siga o mesmo fluxo: contexto → restrições → objetivo →
   plano → execução → validação → documentação.
4. **Nenhum conhecimento** seja perdido entre sessões, agentes ou
   colaboradores.
5. **Nenhuma regra estrutural** seja violada sem confirmação explícita.

---

## Hierarquia de Autoridade

Em caso de conflito entre fontes, a precedência é:

1. **`.ai/CORE_RULES.md`** — regras absolutas, nunca violáveis sem
   confirmação explícita do usuário.
2. **`.ai/ENGINEERING_RULES.md`** — fluxo e restrições de engenharia.
3. **`ARCHITECTURE-FREEZE-1.0-BASELINE.md`** — arquitetura congelada.
4. **`ENGINEERING-STANDARDS.md`** — padrões de implementação.
5. **`KPI-FORMULAS.md`** — fórmulas e regras de medição.
6. **`.ai/PROJECT_STATE.md`** — memória do estado atual.
7. **`.ai/DECISION_LOG.md`** — histórico de decisões.
8. **Prompt do usuário** — instrução específica da sessão.

> Se um prompt do usuário conflitar com qualquer regra estrutural acima
> (itens 1-5), o modelo **deve parar e solicitar confirmação explícita**
> antes de proceder. Não deve escolher arbitrariamente.

---

## Arquivos desta pasta

| Arquivo | Função |
|---------|--------|
| `README.md` | Este documento — propósito, hierarquia, protocolo. |
| `CORE_RULES.md` | 10 regras absolutas nunca violáveis sem confirmação. |
| `ENGINEERING_RULES.md` | Fluxo obrigatório de engenharia + restrições + regras de teste. |
| `PROMPTING_RULES.md` | Como o modelo deve processar prompts: contexto antes de instrução. |
| `OUTPUT_RULES.md` | Formato obrigatório de respostas técnicas (7 seções). |
| `PROJECT_STATE.md` | Memória do projeto — arquitetura, módulos, fase, roadmap. Append-only. |
| `DECISION_LOG.md` | Registro de decisões arquiteturais relevantes. Append-only. |
| `TASK_TEMPLATE.md` | Template padrão para toda tarefa futura. |

---

## Comportamento Permanente

Antes de executar **qualquer** tarefa neste projeto, o modelo deve:

1. **Ler a pasta `.ai/`** completa — todos os 8 arquivos.
2. **Ler `worklog.md`** para entender o trabalho recente de outros agentes.
3. **Ler `reports/metrics.json`** para conhecer o estado atual dos KPIs.
4. **Consultar `DECISION_LOG.md`** antes de propor qualquer mudança
   arquitetural.
5. **Atualizar `PROJECT_STATE.md`** quando o estado do projeto mudar
   (nova fase, novo módulo, nova decisão).
6. **Respeitar `ENGINEERING_RULES.md`** em toda implementação.
7. **Seguir `OUTPUT_RULES.md`** em toda resposta técnica.
8. **Só então executar** a solicitação do usuário.

Estes documentos são a **memória operacional permanente** do projeto.
Devem ser mantidos sincronizados durante toda a evolução do código.

---

## Quando Atualizar

| Evento | Arquivo a atualizar |
|--------|---------------------|
| Nova decisão arquitetural | `DECISION_LOG.md` (append) |
| Mudança de fase (Sprint 4 → Sprint 5) | `PROJECT_STATE.md` (atualizar fase atual) |
| Novo módulo implementado | `PROJECT_STATE.md` (atualizar lista de módulos) |
| Novo componente congelado | `PROJECT_STATE.md` (atualizar módulos congelados) |
| Mudança em regra de engenharia | `ENGINEERING_RULES.md` (via PR com 2 approvals) |
| Mudança em regra core | `CORE_RULES.md` (via PR com 2 approvals) |
| Tarefa concluída | `worklog.md` (append) + `PROJECT_STATE.md` se mudou estado |

**Regra append-only**: `PROJECT_STATE.md` e `DECISION_LOG.md` nunca
apagam histórico. Somente acrescentam ou atualizam a seção "atual".

---

## Status deste documento

- Versão: 1.0
- Criado em: 2026-07-15
- Próxima revisão: quando houver mudança em qualquer regra core ou
  arquitetural.
