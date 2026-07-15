# OUTPUT_RULES.md — Regras de Output

> Toda resposta técnica neste projeto deve seguir o formato de 7 seções
> abaixo. Sem exceções quando a tarefa envolver arquitetura, código ou
> decisão técnica.
>
> Status: **Ativo a partir de Architecture Frozen 1.0**
> Mantenedor: Engineering Lead

---

## Formato Obrigatório (7 seções)

Toda resposta técnica deve conter, nesta ordem:

### 1. Resumo da análise

Uma frase (ou no máximo duas) que responde: **o que foi feito?** ou
**o que será feito?**

Exemplos:

- "Implementado logger estruturado em `src/lib/observability/logger.ts`
  seguindo ENGINEERING-STANDARDS.md §6. Operational Readiness subiu
  de 5% para 20%."
- "Identificada ambiguidade na solicitação — três interpretações
  possíveis. Solicitando confirmação antes de prosseguir."

### 2. Arquivos afetados

Lista de arquivos que serão criados, alterados ou deletados.

Formato:

```
Criados:
- src/lib/observability/logger.ts
- src/lib/observability/tracing.ts

Alterados:
- src/app/layout.tsx (inicializar logger no boot)
- src/lib/wallet-engines/audit/index.ts (substituir console.* por logger)

Deletados:
- (nenhum)
```

Para cada arquivo alterado, indicar **por que** está sendo alterado.

### 3. Plano

Sequência numerada de passos que serão executados.

```
1. Criar `src/lib/observability/logger.ts` com Pino, sanitização de
   PII, níveis trace/debug/info/warn/error/critical.
2. Substituir 7 ocorrências de `console.*` identificadas em
   reports/code-audit.md.
3. Inicializar logger em `src/app/layout.tsx` (client) e
   `src/app/api/route.ts` (server).
4. Executar `bun run metrics` para confirmar que Operational
   Readiness subiu.
5. Executar `bun run audit:code` para confirmar que dívida técnica
   caiu.
6. Append em worklog.md.
```

### 4. Implementação

O código propriamente dito (se a tarefa envolver código).

Para tarefas arquiteturais ou de decisão, esta seção contém a
descrição da solução escolhida com justificativa.

Se a implementação é longa, dividir em subseções por arquivo.

### 5. Validação

Resultados da execução dos comandos de validação.

```
$ bun run lint
✓ 0 errors

$ tsc --noEmit
✓ 0 errors

$ bun run metrics
✓ all consistency checks passed
✓ Operational Readiness: 5% → 20%
✓ Engineering Readiness: 21% → 23%

$ bun run audit:code
✓ 49 → 42 findings (7 console.* removidos)
```

### 6. Riscos

Identificar o que pode dar errado com a mudança.

Exemplos:

- "Logger Pino adiciona ~30KB ao bundle client. Aceitável dentro do
  orçamento de 250KB (ENGINEERING-STANDARDS.md §7.2)."
- "Sanitização de PII pode remover acidentalmente campos legítimos se
  o schema de sanitização estiver incompleto. Adicionar testes de
  propriedade para verificar."
- "Se Pino não inicializar (CDN indisponível), app deve continuar
  funcionando — implementar fallback silencioso."

### 7. Próximos passos

O que o usuário deve fazer depois, ou o que o modelo sugere atacar em
seguida.

Exemplos:

- "Sugiro executar `bun run metrics` e revisar o novo estado dos
  KPIs."
- "Próximo item do backlog: criar `src/lib/observability/tracing.ts`
  com OpenTelemetry. Operational Readiness subirá para ~30%."
- "Antes de prosseguir para Sprint 5 (auditorias), recomendo resolver
  os 7 🟡 do Security Readiness — adicionar integration tests por
  engine."

---

## Quando Aplicar

### Aplicar sempre (sem exceção)

- Tarefa que altera código.
- Tarefa que altera arquitetura.
- Tarefa que altera configuração.
- Tarefa que altera dependências.
- Tarefa que altera documentação técnica.
- Resposta a pergunta técnica complexa.
- Proposta de solução para problema.
- Análise de risco.

### Pode abreviar

- Resposta a pergunta factual simples ("quantos engines existem?").
- Confirmação de execução de comando simples.
- Continuação de conversa trivial.

Mesmo abreviando, manter pelo menos as seções 1 (Resumo) e 7
(Próximos passos).

### Jamais abreviar

- **Tarefa que envolve arquitetura** — todas as 7 seções obrigatórias.
- **Tarefa que toca área congelada** — seção 6 (Riscos) especialmente
  detalhada.
- **Tarefa que altera crypto** — seção 5 (Validação) deve incluir
  execução de vetores oficiais.
- **Tarefa que altera KPI weights** — seção 3 (Plano) deve incluir
  PR com 2 approvals.

> Jamais responder apenas com código quando a tarefa envolver
> arquitetura.

---

## Exemplo Completo

**Solicitação**: "Substituir console.log por logger estruturado."

**Resposta correta**:

---

### 1. Resumo da análise

Substituir 7 ocorrências de `console.*` em código de produção por
logger estruturado Pino, criando `src/lib/observability/logger.ts`.
Operational Readiness deve subir de 5% para ~20%.

### 2. Arquivos afetados

```
Criados:
- src/lib/observability/logger.ts

Alterados:
- src/components/wallet/wallet-context.tsx (1 console.log)
- src/lib/wallet-evm/index.ts (3 console.*)
- src/lib/wallet-engines/network/index.ts (2 console.error)
- src/lib/wallet-engines/threat-intel/index.ts (1 console.warn)

Dependências adicionadas:
- pino (já estava em allowlist de ENGINEERING-STANDARDS.md §8.3)
```

### 3. Plano

1. Ler ENGINEERING-STANDARDS.md §6 (Política de Logging).
2. Ler reports/code-audit.md para confirmar lista completa de
   ocorrências.
3. Criar `src/lib/observability/logger.ts` com Pino, sanitização de
   PII, níveis trace→critical, fallback silencioso.
4. Substituir cada `console.*` por chamada apropriada ao logger.
5. Executar `bun run lint && tsc --noEmit`.
6. Executar `bun run metrics` — confirmar Operational Readiness subiu.
7. Executar `bun run audit:code` — confirmar dívida técnica caiu.
8. Append em worklog.md.

### 4. Implementação

[... código do logger.ts e diffs dos arquivos alterados ...]

### 5. Validação

```
$ bun run lint
✓ 0 errors

$ tsc --noEmit
✓ 0 errors

$ bun run metrics
✓ Operational Readiness: 5% → 20%
✓ Engineering Readiness: 21% → 24%
✓ all consistency checks passed

$ bun run audit:code
✓ 49 → 42 findings (-7 console.*)
```

### 6. Riscos

- Pino adiciona ~30KB ao bundle client. Aceitável.
- Sanitização pode acidentalmente remover campos legítimos — testes
  de propriedade em `logger.test.ts` verificam.
- Se Pino falhar ao inicializar, fallback silencioso garante que app
  continua funcionando (apenas logs são perdidos).

### 7. Próximos passos

- Revisar o novo `reports/metrics.json`.
- Próximo item: criar `src/lib/observability/tracing.ts` com OTel.
- Após logger + tracing + metrics endpoint, Operational Readiness
  deve atingir ~50%.

---

## Status deste documento

- Versão: 1.0
- Criado em: 2026-07-15
- Próxima revisão: quando houver mudança em formato de resposta.
