# TASK_TEMPLATE.md — Template Padrão de Tarefa

> Toda tarefa futura neste projeto deve seguir este template. Sem
> exceções. O modelo deve preencher cada seção explicitamente antes
> de declarar a tarefa como concluída.
>
> Status: **Ativo a partir de Architecture Frozen 1.0**
> Mantenedor: Engineering Lead

---

## Template

Copie e preencha o bloco abaixo para cada tarefa:

```markdown
# Task <ID> — <Título curto>

## Objetivo

<Uma frase descrevendo o que deve ser alcançado.>

## Contexto

<Estado atual relevante. O que existe hoje. Por que esta tarefa é
necessária agora. Referenciar worklog.md, PROJECT_STATE.md,
reports/metrics.json, reports/code-audit.md quando aplicável.>

## Arquivos envolvidos

Criados:
- <caminho completo>

Alterados:
- <caminho completo> — <por que>

Deletados:
- <caminho completo, se houver>

Dependências adicionadas:
- <nome@versão, se houver — ver ENGINEERING-STANDARDS.md §8>

## Dependências

<Quais módulos/enges/components esta tarefa depende. Quem depende dos
arquivos que serão alterados. Resultado de `rg "from ['\"]@/path['\"]" src/`
para arquivos públicos alterados.>

## Plano

1. <passo 1>
2. <passo 2>
3. <passo 3>
...

## Implementação

<Se tarefa envolver código: descrever a implementação em detalhe.
Se tarefa envolver arquitetura: descrever a solução escolhida com
justificativa e alternativas consideradas.>

## Validação

<Comandos executados e seus resultados. Mínimo:>

- `bun run lint` — <resultado>
- `tsc --noEmit` — <resultado>
- `bun run metrics` — <resultado, especialmente mudanças em scores>
- `bun run audit:code` — <resultado, se dívida técnica mudou>
- Testes da área alterada — <resultado>
- <validações adicionais conforme ENGINEERING-STANDARDS.md §4>

## Resultado

<O que foi efetivamente entregue. Lista de artefatos produzidos com
caminhos completos. Mudanças observáveis em reports/metrics.json.>

## Pendências

<Itens que ficaram para depois. Próximos passos sugeridos. Issues
abertas como follow-up. Verificar OUTPUT_RULES.md §7 (Próximos passos).>
```

---

## Regras de Preenchimento

### Objetivo

- Uma frase, no máximo duas.
- Deve ser mensurável: "subir Operational Readiness para 20%" não
  "melhorar operações".
- Deve ter escopo claro: "criar logger estruturado em
  src/lib/observability/logger.ts" não "adicionar observabilidade".

### Contexto

- Mínimo 3 parágrafos ou referência a documentos lidos.
- Deve incluir: estado atual (KPIs relevantes), por que agora, o que
  já existe relacionado.
- Se a tarefa vem de um item em `reports/code-audit.md` ou um gate
  falhando em `reports/metrics.json`, referenciar explicitamente.

### Arquivos envolvidos

- Caminhos completos, não relativos.
- Para cada arquivo alterado, justificar em uma linha.
- Se arquivo é congelado (ver CORE_RULES.md Regra 8), marcar com
  `[FROZEN]` e incluir justificativa de autorização.

### Dependências

- Listar quem importa os arquivos alterados.
- Para arquivos públicos, executar `rg "from ['\"]@/path['\"]" src/`
  e listar callers.
- Identificar se mudança quebra callers existentes (se sim, ver
  CORE_RULES.md Regra 9).

### Plano

- Sequência numerada.
- Cada passo é uma ação concreta (não "pensar sobre X").
- Inclui passos de validação no fim.
- Inclui passo de atualização de worklog e estado do projeto.

### Implementação

- Se código: descrever a implementação. Pode incluir diffs.
- Se arquitetura: descrever a solução, alternativas consideradas,
  trade-offs.
- Se documentação: descrever o que mudou e por quê.

### Validação

- Resultados de comandos executados, não esperados.
- Se comando falha, declarar explicitamente e o que foi feito para
  corrigir.
- Se métrica regrediu inesperadamente, investigar e justificar antes
  de declarar tarefa concluída.

### Resultado

- Lista de artefatos produzidos (caminhos completos).
- Mudanças em `reports/metrics.json` (antes → depois).
- Mudanças em `reports/code-audit.md` (antes → depois).
- Atualizações em `worklog.md` e `PROJECT_STATE.md` (se aplicável).

### Pendências

- Itens não resolvidos.
- Próximos passos sugeridos.
- Issues abertas como follow-up.
- Se algum gate que era verde ficou vermelho (raro), declarar.

---

## Exemplo de Uso

```markdown
# Task 4 — Criar logger estruturado em src/lib/observability/

## Objetivo

Substituir 7 ocorrências de `console.*` em código de produção por
logger estruturado Pino, criando `src/lib/observability/logger.ts`.
Operational Readiness deve subir de 5% para ~20%.

## Contexto

Reports/code-audit.md identifica 7 findings de "Logging (console.* in
production)" como high severity. Reports/metrics.json mostra
Operational Readiness em 5% (0✅ 2🟡 8❌), com check "Structured logger
exists" como not_implemented. ENGINEERING-STANDARDS.md §6 define
regras detalhadas para logging: JSON estruturado, níveis
trace→critical, sem PII, sanitização obrigatória.

A tarefa é prioridade porque sem logger estruturado, não há
observabilidade em produção, bloqueando Operational Readiness e
vários Hard Gates.

## Arquivos envolvidos

Criados:
- src/lib/observability/logger.ts
- src/lib/observability/__tests__/logger.test.ts

Alterados:
- src/components/wallet/wallet-context.tsx — substituir 1 console.log
- src/lib/wallet-evm/index.ts — substituir 3 console.*
- src/lib/wallet-engines/network/index.ts — substituir 2 console.error
- src/lib/wallet-engines/threat-intel/index.ts — substituir 1 console.warn

Dependências adicionadas:
- pino@9.x (já em allowlist de ENGINEERING-STANDARDS.md §8.3)

## Dependências

Os 4 arquivos alterados são importados por:
- wallet-context.tsx: importado por src/app/page.tsx e 12 componentes.
- wallet-evm/index.ts: importado por 6 arquivos em wallet-engines/.
- network/index.ts: importado por 3 arquivos.
- threat-intel/index.ts: importado por 4 arquivos.

Mudança é compatível: logger tem mesma API básica (info/warn/error),
apenas adiciona traceId e sanitização.

## Plano

1. Ler ENGINEERING-STANDARDS.md §6 (Política de Logging) completo.
2. Ler reports/code-audit.md para confirmar lista de ocorrências.
3. Adicionar pino ao package.json.
4. Criar src/lib/observability/logger.ts com:
   - Pino como backend.
   - Níveis trace/debug/info/warn/error/critical.
   - Sanitização de PII (mnemonic, chaves, IPs, tokens).
   - Fallback silencioso se Pino falhar.
5. Criar src/lib/observability/__tests__/logger.test.ts com testes
   de propriedade (sanitização nunca vazia PII).
6. Substituir cada console.* por chamada apropriada.
7. Executar bun run lint && tsc --noEmit.
8. Executar bun run metrics.
9. Executar bun run audit:code.
10. Append em worklog.md com Task ID 4.

## Implementação

[... detalhes da implementação ...]

## Validação

- `bun run lint` — ✓ 0 errors
- `tsc --noEmit` — ✓ 0 errors
- `bun run metrics` — ✓ Operational Readiness: 5% → 20%
- `bun run metrics` — ✓ Engineering Readiness: 21% → 23%
- `bun run audit:code` — ✓ 49 → 42 findings (-7 console.*)
- Testes de logger.test.ts — ✓ 8/8 passing

## Resultado

Artefatos produzidos:
- src/lib/observability/logger.ts
- src/lib/observability/__tests__/logger.test.ts

Mudanças em reports/metrics.json:
- Operational Readiness: 5% → 20%
- Engineering Readiness: 21% → 23%

Mudanças em reports/code-audit.md:
- 49 → 42 findings
- Categoria "Logging (console.* in production)": 7 → 0

Atualizações:
- worklog.md (append Task ID 4)
- PROJECT_STATE.md (fase atual: "logger estruturado criado")

## Pendências

- Próximo: criar src/lib/observability/tracing.ts com OpenTelemetry.
  Operational Readiness deve subir para ~30%.
- Após tracing: expor /api/metrics endpoint com prom-client.
  Operational Readiness deve subir para ~50%.
- Sanitização de PII pode precisar de revisão após testes em
  produção com payloads reais.
```

---

## Status deste documento

- Versão: 1.0
- Criado em: 2026-07-15
- Próxima revisão: quando houver mudança em formato de tarefa.
