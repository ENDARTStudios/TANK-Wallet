# ENGINEERING_RULES.md — Regras de Engenharia

> Fluxo obrigatório, restrições e regras de teste para toda implementação
> no Tank Wallet.
>
> Status: **Ativo a partir de Architecture Frozen 1.0**
> Mantenedor: Engineering Lead
> Complementa: `ENGINEERING-STANDARDS.md` (referência detalhada)

---

## Fluxo Obrigatório

Toda implementação segue **exatamente** esta ordem. Nunca alterar.

```
1. Ler contexto
2. Mapear dependências
3. Criar plano
4. Executar
5. Validar
6. Documentar
```

### 1. Ler contexto

Antes de escrever qualquer linha de código:

- Ler `.ai/` completo: `README.md` + 4 em `rules/` + 2 em `state/` + 2 em `decisions/` + 1 em `templates/`.
- Ler `worklog.md` para entender trabalho recente de outros agentes.
- Ler `reports/metrics.json` para conhecer KPIs atuais.
- Ler `reports/code-audit.md` para conhecer dívida técnica pendente.
- Ler os arquivos que serão alterados (não assumir que conhece).
- Ler os arquivos que dependem dos que serão alterados.

**Não pular esta etapa.** Tempo de leitura é tempo economizado em
rework.

### 2. Mapear dependências

Para cada arquivo que será alterado:

- Quem importa este arquivo? (`rg "from ['\"]@/path['\"]" src/`)
- Quem usa os símbolos exportados? (`rg "exportedSymbolName" src/`)
- Quais testes cobrem este arquivo?
- Quais hard gates dependem deste arquivo? (ver
  `scripts/metrics/hard-gates.ts`)
- Este arquivo está em área congelada? (ver `CORE_RULES.md` Regra 8)

Se a mudança afeta >3 arquivos fora do escopo direto, parar e
replanejar — possivelmente o escopo está grande demais.

### 3. Criar plano

Antes de executar, declarar explicitamente:

- Quais arquivos serão criados (caminhos completos).
- Quais arquivos serão alterados (caminhos completos).
- Quais arquivos serão deletados (caminhos completos — raro).
- Quais testes serão adicionados/atualizados.
- Quais dependências serão adicionadas (se houver — ver Restrições).
- Quais componentes congelados serão tocados (se houver — requer
  autorização).
- Quais hard gates serão afetados.
- Qual o impacto esperado em `reports/metrics.json`.

O plano deve ser apresentado ao usuário antes da execução, seguindo
`OUTPUT_RULES.md` §3.

### 4. Executar

Durante a execução:

- Seguir `ENGINEERING-STANDARDS.md` integralmente.
- Persistir scripts >10 linhas via `Write` em `scripts/` (regra 9 do
  system prompt).
- Não usar `console.log` em produção.
- Não usar `any` em código de produção.
- Não criar `TODO`/`FIXME`/`HACK` — abrir issue separada.
- Commits atômicos com Conventional Commits.
- Atualizar `worklog.md` ao final.

### 5. Validar

Após a execução:

- `bun run metrics` — confirmar que consistência mantida, scores não
  regrediram inesperadamente.
- `bun run audit:code` — confirmar que dívida técnica não aumentou.
- `bun run lint` — zero erros.
- `tsc --noEmit` — zero erros de tipo.
- Testes da área alterada: todos passando.
- Se área criptográfica: vetores oficiais passando.
- Diff review: escopo mínimo respeitado, sem mudanças colaterais.

Se qualquer validação falha: **não declarar tarefa como concluída**.
Continuar iterando até tudo verde.

### 6. Documentar

Ao final da execução:

- Atualizar `worklog.md` (append) com Task ID, passos executados,
  artefatos produzidos, stage summary.
- Atualizar `PROJECT_STATE.md` se o estado do projeto mudou (nova fase,
  novo módulo, nova decisão).
- Atualizar `DECISION_LOG.md` se uma decisão arquitetural foi tomada.
- Atualizar `CHANGELOG.md` (a criar) com a mudança.
- Atualizar TSDoc das funções públicas afetadas.
- Atualizar `KPI-FORMULAS.md` se pesos ou fórmulas mudaram (raro).
- Atualizar `ENGINEERING-STANDARDS.md` se um novo padrão foi
  estabelecido (raro).

---

## Restrições

### Não adicionar dependências sem necessidade

Antes de adicionar uma entrada em `package.json`:

1. Não existe alternativa interna? Verificar `src/lib/utils.ts`,
   `src/lib/wallet-core/`, viem, @noble/*.
2. Não existe alternativa em dependência já presente? Verificar
   `package.json`.
3. A dependência é necessária ou é "conveniente"? Conveniência não
   justifica dependência.
4. A dependência passa nos critérios de `ENGINEERING-STANDARDS.md` §8.2?
5. Abrir issue `deps: propose <name>@<version>` com a justificativa.

Dependências pré-aprovadas (mas cada versão ainda passa por verificação):

- Crypto: `@noble/*`, `@scure/*`, `bitcoinjs-lib`, `ed25519-hd-key`
- Ethereum: `viem`
- React framework: `next`, `react`, `react-dom`
- UI: `@radix-ui/*`, `lucide-react`, `tailwindcss`
- State/data: `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`
- DB: `prisma`, `@prisma/client`
- Utils: `clsx`, `tailwind-merge`, `date-fns`, `uuid`

### Não renomear arquivos sem necessidade

Renomear arquivo quebra imports. Antes de renomear:

1. O nome atual é realmente inadequado? Ou é apenas "feio"?
2. Quem importa? Quantos arquivos precisam ser atualizados?
3. Vale o risco de quebrar referências?

Se renomear:

- Atualizar todos os imports em uma única operação.
- Verificar que `rg "old-name"` retorna 0 após renomear.
- Atualizar documentação que referencia o nome antigo.

### Não mover módulos sem necessidade

Mover um diretório inteiro é mais arriscado que renomear arquivo.
Antes de mover:

1. A nova localização é estruturalmente superior ou apenas "mais
   organizada"?
2. Quem depende do path atual?
3. Há imports dinâmicos que podem quebrar silenciosamente?
4. Há referências em configuração (tsconfig paths, next.config, etc.)?

Se mover:

- Atualizar `tsconfig.json#paths` se aplicável.
- Atualizar todos os imports absolutos e relativos.
- Atualizar documentação.
- Atualizar `PROJECT_STATE.md` em "módulos existentes".

### Não criar abstrações prematuras

Antes de criar uma interface, classe base, factory ou pattern:

1. Há 3+ implementações concretas que precisam da abstração? Se não,
   espere.
2. A abstração existe em algum lugar? Verificar antes de criar.
3. A abstração é genérica o suficiente para não virar baggage futuro?
4. A abstração está em conformidade com `ENGINEERING-STANDARDS.md` §2?

> Regra de três: só abstrair quando há 3 implementações concretas
> duplicando lógica. Abstrair com 1 ou 2 é prematuro.

### Não refatorar fora do escopo

Se a tarefa é "adicionar logger", não refatorar engines no caminho.
Se a tarefa é "corrigir bug em policy engine", não renomear funções
em key-management.

Refatoração é tarefa separada, com PR próprio, justificativa própria,
testes próprios. Ver `ENGINEERING-STANDARDS.md` §10.3 (Definition of
Done para refatoração).

---

## Testes

Toda alteração deve indicar explicitamente:

### Testes necessários

- Quais testes unit precisam ser adicionados?
- Quais testes de propriedade aplicam-se à função alterada?
- Quais testes de fuzz aplicam-se (se input externo)?
- Quais testes de regressão reproduzem bugs corrigidos?
- Quais testes de integração tocam a área alterada?
- Quais testes E2E cobrem o fluxo de usuário afetado?
- Quais testes de conformance (chain plugins) são relevantes?
- Quais vetores criptográficos precisam ser adicionados/atualizados (se
  área de crypto)?

### Build necessário

- `bun run build` passa?
- Build de produção tem mesmo hash de build anterior? (se sim, mudança
  é não-observável — confirmar intenção)
- Bundle size não aumentou >5KB gzipped (ver `ENGINEERING-STANDARDS.md`
  §7.2)?
- TypeScript compila sem erros?

### Validações

- `bun run lint` — 0 erros.
- `tsc --noEmit` — 0 erros.
- `bun run metrics` — sem inconsistências, scores não regrediram
  inesperadamente.
- `bun run audit:code` — dívida técnica não aumentou.
- Se área de crypto: vetores oficiais passing.
- Se área de plugin: conformance suite passing.
- Se área de UX: Lighthouse CI sem regressão crítica.
- Se PR toca path crítico: benchmark sem regressão >10%.

---

## Regras Adicionais

### Scripts persistentes

Qualquer script >10 linhas deve ser persistido em `scripts/` via
`Write` antes de executar. Não usar `python -c`, `bash -c`, ou heredoc
inline. Ver regra 9 do system prompt.

### Persistência de worklog

Ao final de cada tarefa (Task ID), append em `worklog.md` seguindo o
template:

```markdown
---
Task ID: <id>
Agent: <agent name>
Task: <descrição>

Work Log:
- <passo 1>
- <passo 2>

Stage Summary:
- <resultados>
- <artefatos produzidos>
```

### Atualização de estado

Se a tarefa muda o estado do projeto (nova fase, novo módulo, decisão
arquitetural), atualizar `PROJECT_STATE.md` e/ou `DECISION_LOG.md` em
acréscimo (append-only).

### Commits

- Conventional Commits estrito (ver `ENGINEERING-STANDARDS.md` §3.4).
- Commits assinados (GPG ou sigstore) em `main`.
- Um commit = uma preocupação.
- Mensagem de commit no imperative mood: "Add logger" não "Added logger".

---

## Status deste documento

- Versão: 1.0
- Criado em: 2026-07-15
- Próxima revisão: quando `ENGINEERING-STANDARDS.md` mudar.
