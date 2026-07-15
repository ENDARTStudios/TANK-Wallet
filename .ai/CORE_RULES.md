# CORE_RULES.md — Regras Absolutas

> Estas 10 regras são **absolutas e nunca violáveis** sem confirmação
> explícita do usuário. Em caso de conflito com qualquer prompt, o modelo
> deve parar e solicitar confirmação antes de proceder.
>
> Status: **Imutável durante a série 1.x**
> Mantenedor: Engineering Lead + Security Lead
> Alteração exige: PR com 2 approvals + ADR (Architecture Decision Record)

---

## Regra 1 — Contexto primeiro

**Sempre ler o máximo possível do projeto antes de responder.**

Antes de qualquer implementação, o modelo deve:

- Ler `.ai/` completo (8 arquivos).
- Ler `worklog.md` para entender trabalho recente.
- Ler `reports/metrics.json` para conhecer estado atual dos KPIs.
- Ler os arquivos relevantes ao escopo da tarefa (não assumir que
  conhece a estrutura).
- Consultar `ARCHITECTURE-FREEZE-1.0-BASELINE.md` para confirmar o que
  está congelado.

**Nunca assumir comportamento sem evidência.** Se há dúvida sobre como
uma função se comporta, ler a implementação. Se há dúvida sobre um tipo,
ler o arquivo que o declara. Se há dúvida sobre uma API, ler quem a
consome.

> Violação típica: responder "acredito que a função X faz Y" sem ler X.

---

## Regra 2 — Instrução somente depois da leitura

**Nunca começar implementação antes de compreender o estado atual.**

O fluxo obrigatório é:

```
Leitura (contexto) → Compreensão → Plano → Execução
```

Não é:

```
Instrução → Execução imediata → Descoberta de problemas depois
```

Se a tarefa envolver arquivos que o modelo não leu ainda, parar e ler
antes de propor qualquer mudança.

> Violação típica: começar a escrever código sem saber que o arquivo
> alvo já tem 500 linhas e usa um padrão diferente do proposto.

---

## Regra 3 — Jamais inventar APIs

**Se algo não existir no código: não existe.**

O modelo não pode:

- Referenciar funções que não estão implementadas.
- Referenciar tipos que não estão declarados.
- Referenciar endpoints que não estão roteados.
- Referenciar schemas que não estão em `prisma/schema.prisma`.
- Referenciar constantes que não estão declaradas.
- Referenciar módulos que não estão em `src/lib/`.

Se uma funcionalidade necessária não existe, o modelo deve:

1. Declarar explicitamente que não existe.
2. Propor criá-la como parte do plano.
3. Aguardar confirmação antes de criar.

> Violação típica: chamar `kernel.orchestrate(action)` quando este
> método não está implementado em `src/lib/wallet-security-real/`.

---

## Regra 4 — Nunca criar ficções técnicas

**Proibido:**

- Criar funções fictícias para preencher lacunas.
- Criar classes imaginárias para satisfazer tipagem.
- Assumir endpoints que não estão roteados em `src/app/api/`.
- Assumir schemas que não estão em `prisma/schema.prisma`.
- Assumir contratos que não estão documentados em
  `ARCHITECTURE-FREEZE-1.0-BASELINE.md`.
- Assumir eventos que não estão tipados no Event Bus.
- Assumir engines que não estão em `src/lib/wallet-engines/`.

**Toda claim técnica deve ter referência concreta** (arquivo:linha ou
nome do símbolo).

> Violação típica: "use o método `SecurityEngine.evaluate()`" sem
> verificar se esse método existe na interface.

---

## Regra 5 — Sempre reutilizar componentes existentes

**Duplicação é proibida.**

Antes de criar qualquer função, componente, hook, tipo, constante ou
utilitário, o modelo deve:

1. Buscar no código existente por equivalente.
2. Se encontrar, usar o existente (mesmo que com nome subótimo).
3. Se não encontrar, declarar explicitamente que é novo e justificar.
4. Se o existente é subótimo, propor refatoração em escopo separado —
   não refatorar junto com a feature nova.

Caminhos a verificar antes de criar:

- `src/lib/utils.ts` — utilitários gerais.
- `src/lib/wallet-core/` — primitivos crypto e tipos.
- `src/lib/wallet/types.ts` — tipos de domínio.
- `src/lib/wallet-engines/<name>/` — engines.
- `src/components/ui/` — componentes shadcn/ui.
- `src/components/wallet/` — componentes específicos.
- `src/hooks/` — hooks React.

> Violação típica: criar `formatBytes()` quando já existe em `utils.ts`.

---

## Regra 6 — Identificar dependentes antes de alterar

**Antes de alterar qualquer arquivo, identificar quem depende dele.**

Toda alteração em arquivo público (exporta símbolos) exige:

1. Buscar por importadores do símbolo alterado.
2. Verificar se a alteração quebra contratos existentes.
3. Se quebrar, propagar a mudança ou manter compatibilidade.

Comando de busca recomendado:

```bash
rg "from ['\"]@/path/to/file['\"]" src/
rg "from ['\"]\\.\\./path/to/file['\"]" src/
```

> Violação típica: mudar a assinatura de `simulateTransaction()` sem
> atualizar os 3 callers existentes.

---

## Regra 7 — Escopo mínimo

**Mudanças devem possuir escopo mínimo.**

Uma PR = uma preocupação. Não combinar:

- Feature nova + refatoração não relacionada.
- Bug fix + upgrade de dependência.
- Adição de teste + mudança de comportamento.

Se a tarefa exige múltiplas mudanças, decompor em múltiplas PRs ou
múltiplos commits atômicos dentro da mesma PR, cada um com mensagem
Conventional Commit própria.

Tamanho máximo de arquivo: 500 linhas (vide
`ENGINEERING-STANDARDS.md` §1.2). Tamanho máximo de PR: ~500 linhas de
diff (salvo justificativa).

> Violação típica: ao adicionar logger, refatorar 10 arquivos
> não relacionados porque "estava no caminho".

---

## Regra 8 — Não modificar arquitetura congelada

**Arquivos marcados como Frozen só podem receber alterações mediante
autorização explícita.**

Componentes congelados (Architecture Freeze 1.0):

- Security Kernel (`src/lib/wallet-security-real/`)
- SecurityEngine interface (contrato)
- Security Event Bus (16 events + 9 chain events tipados)
- Unified Data Model (15 objetos centrais)
- TSS (Tank Security Standard) — 10 specs
- TSF (Tank Security Framework) — 7 domínios
- Governance Layer (7 registries)
- Decision Pipeline (12 estágios)
- ChainPlugin Interface (apiVersion 1.0)
- Registries (Threat, Policy, Trust, Audit, Plugin, Feature, Decision)

Documentos congelados:

- `ARCHITECTURE-FREEZE-1.0-BASELINE.md`
- `KPI-FORMULAS.md` (fórmulas e pesos — ver §4 do documento)
- `ENGINEERING-STANDARDS.md` (seções marcadas como contrato)
- `config/kpi-weights.json` (pesos — exige 2 approvals)
- `scripts/metrics/_shared.ts` (schema do MetricsReport)

**Qualquer alteração nestes componentes** deve ser registrada como
candidata a Architecture Freeze 2.0 em `docs/freeze-2-candidates.md` e
requer aprovação explícita do Engineering Lead + Security Lead.

> Violação típica: adicionar um 13º estágio ao Decision Pipeline porque
> "parece útil".

---

## Regra 9 — Nenhuma implementação pode quebrar compatibilidade

**Toda alteração deve preservar compatibilidade com código existente.**

- APIs públicas: adicionar campo opcional = ok; remover campo = breaking.
- Mudar tipo de campo = breaking.
- Mudar retorno de função = breaking.
- Renomear export = breaking.
- Mudar ordem de parâmetros = breaking.
- Mudar comportamento default = breaking (mesmo que "melhor").

Breaking changes exigem:

1. Versão major (impossível na série 1.x sem Architecture Freeze 2.0).
2. Migração de todos os callers.
3. Período de deprecação com `@deprecated`.
4. Atualização de testes de compatibilidade.

> Violação típica: mudar `simulate(input: string)` para
> `simulate(input: SimulateInput)` sem migrar callers.

---

## Regra 10 — Preservar comportamento anterior

**Toda alteração precisa preservar comportamento anterior.**

Antes de mergear qualquer mudança:

1. **Testes existentes continuam passando** — se algum quebra, a
   mudança é breaking e deve ser justificada.
2. **Outputs observáveis não mudam** — se um endpoint antes retornava
   `{ a, b }` e agora retorna `{ a, b, c }`, ok. Se retorna `{ a, c }`,
   breaking.
3. **Side effects não mudam** — se uma função antes não logava e agora
   loga, é mudança de comportamento (mesmo que "melhor").
4. **Performance não regrediu** — ver `ENGINEERING-STANDARDS.md` §7.3:
   regressão >10% em benchmark crítico bloqueia merge.

Se a mudança é intencionalmente breaking:

1. Documentar em DECISION_LOG.md.
2. Abrir issue de migração.
3. Atualizar CHANGELOG.
4. Comunicar em release notes.

> Violação típica: "otimizar" uma função e quebrar 3 testes que
> verificavam o comportamento anterior.

---

## Protocolo de Violação

Se o modelo perceber que violou qualquer regra:

1. **Parar imediatamente** a execução.
2. **Declarar a violação** explicitamente ao usuário.
3. **Reverter** a mudança problemática.
4. **Documentar** o incidente em `worklog.md`.
5. **Solicitar confirmação** antes de prosseguir com abordagem alternativa.

Repetir a mesma violação em sessões subsequentes é tratada como
incidente crítico e deve gerar entrada em `DECISION_LOG.md` com
justificativa de por que a regra precisa ser revisada.

---

## Status deste documento

- Versão: 1.0
- Criado em: 2026-07-15
- Próxima revisão: quando houver Architecture Freeze 2.0.
