# PROMPTING_RULES.md — Regras de Prompting

> Como o modelo deve processar prompts neste projeto. Estas regras
> garantem que o contexto seja maximizado, a ambiguidade seja
> eliminada e o raciocínio seja aplicado com profundidade máxima em
> tarefas complexas.
>
> Status: **Ativo a partir de Architecture Frozen 1.0**
> Mantenedor: Engineering Lead

---

## Context Window

**Sempre aproveitar o máximo possível da janela de contexto.**

### Não resumir quando pode ser integral

Se um documento pode ser lido integralmente e ainda cabe na janela,
ler integralmente. Resumos perdem detalhes que podem ser críticos.

**Exceção**: documentos muito longos (>10k tokens) podem ser lidos em
partes, mas todas as partes devem ser lidas — não basta ler o início.

### Documentos a ler integralmente antes de qualquer tarefa

- `.ai/README.md`
- `.ai/CORE_RULES.md`
- `.ai/ENGINEERING_RULES.md`
- `.ai/OUTPUT_RULES.md`
- `.ai/PROJECT_STATE.md`
- `.ai/DECISION_LOG.md`
- `.ai/TASK_TEMPLATE.md`
- `worklog.md`
- `reports/metrics.json`
- `reports/code-audit.md`

### Documentos a ler conforme escopo da tarefa

- `ARCHITECTURE-FREEZE-1.0-BASELINE.md` — se a tarefa toca arquitetura.
- `ENGINEERING-STANDARDS.md` — se a tarefa envolve código.
- `KPI-FORMULAS.md` — se a tarefa toca métricas ou pesos.
- `ARCHITECTURE.md` — se a tarefa envolve história ou motivação.
- `prisma/schema.prisma` — se a tarefa toca dados.
- `tsconfig.json` — se a tarefa toca TypeScript.
- `package.json` — se a tarefa toca dependências.
- `src/lib/wallet-engines/<engine>/index.ts` — se a tarefa toca o engine.
- `scripts/metrics/hard-gates.ts` — se a tarefa pode afetar gates.

---

## Contexto vem antes da instrução

### Fluxo obrigatório

```
Contexto
   ↓
Restrições
   ↓
Objetivo
```

Nunca inverter. Nunca pular etapas.

### O que isso significa na prática

Quando o usuário envia um prompt, o modelo deve:

1. **Primeiro**: identificar qual contexto é necessário para atender.
2. **Segundo**: ler esse contexto (arquivos, worklog, metrics).
3. **Terceiro**: identificar restrições aplicáveis (CORE_RULES,
   ENGINEERING_RULES, áreas congeladas).
4. **Quarto**: formular o objetivo em termos do estado atual.
5. **Quinto**: propor plano.
6. **Sexto**: executar.

**Não**: ler o prompt e imediatamente começar a escrever código.

### Exemplo

**Prompt do usuário**: "Adicionar logger estruturado."

**Fluxo correto**:

1. Ler `.ai/` completo.
2. Ler `worklog.md` — ver que Task ID 1 identificou logger como
   pendência.
3. Ler `reports/metrics.json` — confirmar que Operational Readiness
   está em 5% por falta de logger.
4. Ler `ENGINEERING-STANDARDS.md` §6 (Política de Logging) — regras
   detalhadas.
5. Ler `reports/code-audit.md` — ver quantos `console.*` precisam ser
   substituídos.
6. Identificar restrições: não pode usar `console.*`, deve ser Pino,
   JSON estruturado, sem PII.
7. Formular objetivo: criar `src/lib/observability/logger.ts` seguindo
   §6, substituir N ocorrências de `console.*` identificadas em
   code-audit.
8. Propor plano com arquivos afetados.
9. Executar.

**Fluxo errado**: ler "Adicionar logger" e imediatamente `Write` um
arquivo `logger.ts` sem verificar padrões existentes.

---

## Ambiguidade

### Quando existe mais de uma interpretação possível

**Parar. Explicar. Pedir confirmação.**

Nunca escolher arbitrariamente.

### Sinais de ambiguidade

- O prompt usa termo que tem múltiplos significados no projeto
  (ex.: "engine" pode ser security engine ou chain plugin).
- O prompt não especifica escopo (ex.: "adicionar validação" — onde?
  quando? qual input?).
- O prompt pode ser implementado de duas formas com trade-offs
  diferentes (ex.: adicionar campo opcional vs criar novo tipo).
- O prompt conflita com regra existente (ver CORE_RULES.md).
- O prompt assume comportamento que não está implementado (ver
  CORE_RULES.md Regra 3).

### Protocolo de esclarecimento

1. **Parar** a execução imediatamente.
2. **Declarar** a ambiguidade explicitamente: "Existem N interpretações
   possíveis para esta solicitação."
3. **Listar** cada interpretação com consequências.
4. **Sugerir** a interpretação mais provável (com justificativa).
5. **Pedir confirmação** antes de prosseguir.

### Exemplo

**Prompt**: "Adicionar validação ao engine."

**Resposta correta**:

> Esta solicitação é ambígua. Identifiquei 3 interpretações:
>
> 1. Adicionar validação de input (zod) às funções públicas de um
>    engine específico — qual engine?
> 2. Adicionar validação de output (zod) aos retornos de um engine —
>    qual engine?
> 3. Adicionar validação de consistência interna ao Security Kernel
>    (validar que engines reportam scores no formato esperado).
>
> Antes de prosseguir, confirme qual interpretação devo seguir, ou
> forneça mais contexto.

**Resposta errada**: escolher interpretação 1 e implementar para o
engine "policy" sem confirmar.

---

## Engenharia

### Sempre usar raciocínio máximo disponível para tarefas complexas

Tarefas complexas no Tank Wallet incluem:

- Implementação de primitivos criptográficos (mesmo usando libs
  auditadas).
- Mudanças em engines de segurança.
- Mudanças no Security Kernel.
- Mudanças em chain plugins.
- Mudanças no pipeline de decisão.
- Mudanças em schemas do Prisma.
- Mudanças em `scripts/metrics/`.
- Refatoração de módulos com >5 dependências.
- Resolução de bugs críticos (perda de fundos, leak de chave, etc.).

Para estas tarefas:

1. **Planejar antes de gerar código** — não começar a escrever antes
   de ter o plano completo.
2. **Considerar múltiplas abordagens** — listar 2-3 alternativas,
   comparar trade-offs, escolher com justificativa.
3. **Identificar riscos** antes de executar — o que pode dar errado?
4. **Validar incrementalmente** — não escrever 500 linhas e testar no
   fim; escrever 50, testar, escrever mais 50, testar.
5. **Documentar decisões** — se uma abordagem foi escolhida sobre
   outra, registrar em DECISION_LOG.md.

### Planejamento obrigatório

Antes de qualquer implementação que envolva:

- >100 linhas de código novo.
- >3 arquivos alterados.
- Mudança em área congelada (requer autorização adicional).
- Mudança em primitivo criptográfico.
- Mudança em API pública.

O modelo deve apresentar plano explícito seguindo `OUTPUT_RULES.md` §3
antes de executar.

### Raciocínio step-by-step

Para problemas complexos, documentar o raciocínio:

1. **Estado atual**: o que existe hoje.
2. **Estado desejado**: o que queremos atingir.
3. **Opções**: A, B, C — com prós e contras.
4. **Decisão**: qual opção e por quê.
5. **Plano de execução**: passos concretos.
6. **Validação**: como confirmar que deu certo.
7. **Riscos**: o que pode dar errado e mitigação.

---

## Nunca assumir

### Proibido inferir sem evidência

**Nunca inferir:**

- **Requisitos** — se não está no prompt, no ARCHITECTURE.md, ou em
  issue rastreada, não existe. Não inventar.
- **Arquitetura** — se não está em ARCHITECTURE-FREEZE-1.0-BASELINE.md
  ou no código, não existe. Não presumir.
- **Intenção** — se o usuário disse X, fazer X. Não fazer X+Y porque
  "provavelmente também quer Y".
- **Comportamento** — se não está em teste ou em documentação, não
  assumir. Verificar no código.

### Protocolo quando não se sabe

1. **Declarar** "não sei" explicitamente.
2. **Buscar** evidência no código/documentação.
3. **Se não encontrar**: perguntar ao usuário.
4. **Se o usuário não souber**: propor duas abordagens e pedir
  confirmação.

### Exemplo

**Cenário**: o usuário pede para adicionar uma função ao Security
Kernel.

**Fluxo correto**:

1. Ler `src/lib/wallet-security-real/index.ts` para entender a
   estrutura atual.
2. Identificar que o Kernel é componente congelado.
3. Declarar: "Esta mudança toca área congelada (Security Kernel).
   Antes de proceder, confirmo que você tem autorização explícita
   para alterar o Kernel, ou esta mudança deve ser registrada como
   candidata a Architecture Freeze 2.0?"
4. Aguardar confirmação.

**Fluxo errado**: implementar a função sem verificar se é permitido
alterar o Kernel.

---

## Maximização de Contexto entre Sessões

### Continuidade

Como o projeto evolui entre sessões, o modelo deve:

1. **Sempre ler `worklog.md`** no início de cada sessão para
   entender o que foi feito anteriormente.
2. **Sempre ler `PROJECT_STATE.md`** para conhecer o estado atual.
3. **Sempre ler `DECISION_LOG.md`** para conhecer decisões
   anteriores relevantes.
4. **Sempre ler `reports/metrics.json`** para conhecer KPIs atuais.

### Atualização

Ao final de cada sessão (ou Task ID), atualizar:

- `worklog.md` (append).
- `PROJECT_STATE.md` se estado mudou.
- `DECISION_LOG.md` se decisão foi tomada.
- `reports/metrics.json` executando `bun run metrics` se código mudou.

### Não perder conhecimento

Se o modelo aprendeu algo durante a sessão que não está documentado
(ex.: descobriu que uma função tem comportamento não-óbvio), registrar
em `PROJECT_STATE.md` ou em comentário no código.

---

## Status deste documento

- Versão: 1.0
- Criado em: 2026-07-15
- Próxima revisão: quando houver mudança em regras de prompting.
