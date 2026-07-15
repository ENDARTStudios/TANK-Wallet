# DECISION_LOG.md — Registro de Decisões Operacionais

> Toda decisão **operacional** relevante (não arquitetural) deve ser
> registrada aqui. Para decisões **arquiteturais**, ver
> `ARCHITECTURE_DECISIONS.md` (ADRs).
>
> **Imutável**: nunca editar uma decisão existente. Se uma decisão muda,
> criar nova entrada `D-XXX` com `Supersedes: D-YYY` e marcar `D-YYY`
> como `Superseded By: D-XXX`.
>
> Status: **Ativo**
> Mantenedor: Engineering Lead + Security Lead
> Alteração exige: PR com 2 approvals

---

## Formato Rígido (obrigatório)

Cada decisão segue exatamente este formato. Não omitir campos. Não
adicionar campos fora deste conjunto.

```markdown
## D-XXX — <Título curto>

Status:
Accepted | Rejected | Deprecated | Superseded

Date:
YYYY-MM-DD

Context:
<Por que esta decisão foi necessária. Estado anterior. Problema
que estava sendo resolvido.>

Decision:
<O que foi decidido. De forma objetiva e verificável.>

Alternatives:
- <Alternativa 1>: <por que foi descartada>
- <Alternativa 2>: <por que foi descartada>
- <Alternativa 3>: <por que foi descartada>

Consequences:
- <impacto positivo 1>
- <impacto positivo 2>
- <impacto negativo ou trade-off 1>
- <impacto negativo ou trade-off 2>

Architecture Impact:
<Nenhum | Quais componentes são afetados | Quais hard gates são
afetados | Quais métricas são afetadas>

Supersedes:
<Nenhum | D-YYY>

Superseded By:
<Nenhum | D-ZZZ>
```

---

## D-001 — Architecture Freeze 1.0

Status:
Accepted

Date:
2026-07-15

Context:
O Tank Wallet evoluiu por 10 fases sem controle formal de crescimento
arquitetural. Risco de complexidade descontrolada em produto de
segurança é inaceitável. Necessidade de distinguir estrutura
congelada (imutável) de implementação evolutiva.

Decision:
Declarar Architecture Freeze 1.0. Os 10 componentes arquiteturais
(Kernel, 16 engines, TSS, TSF, Governance Layer, Event Bus, Data Model,
ChainPlugin Interface, Architecture Contracts, Decision Engine) são
imutáveis durante a série 1.x. Nenhum novo componente estrutural pode
ser adicionado. Necessidades arquiteturais são registradas como
candidatas a Architecture Freeze 2.0.

Alternatives:
- Evolução arquitetural contínua (sem freeze): descartada porque
  crescimento descontrolado da complexidade é o maior risco em
  produtos de segurança.
- Freeze permanente (sem evoluir nunca): descartada porque o produto
  precisa evoluir; apenas a estrutura é congelada, não a implementação.

Consequences:
- Backlog passa a ser exclusivamente de engenharia.
- Mudanças estruturais exigem Architecture Freeze 2.0 (pós-1.x).
- Decisões arquiteturais futuras devem ser ADRs (ver
  ARCHITECTURE_DECISIONS.md).
- Maior previsibilidade e auditabilidade.

Architecture Impact:
Todos os 10 componentes congelados. Refletido em `ARCHITECTURE-FREEZE-
1.0-BASELINE.md`. Script `scripts/metrics/architecture.ts` valida
conformidade estrutural.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## D-002 — Security Evidence como 3ª dimensão de segurança

Status:
Accepted

Date:
2026-07-15

Context:
Modelo anterior tinha apenas Readiness (implementado?) e Assurance
(terceiros confirmaram?). Não distinguia "implementado" de "capaz de
provar automaticamente". Um engine pode estar implementado e auditado
mas produzir evidence não-estruturada, impossibilitando auditoria
automatizada.

Decision:
Adicionar Security Evidence como 3ª dimensão de segurança:
- **Readiness** → foi implementado?
- **Evidence** → consegue provar automaticamente, com registro
  estruturado, que o engine fez seu trabalho?
- **Assurance** → terceiros independentes confirmaram?

Implementado em `scripts/metrics/evidence.ts` com 7 engines ponderadas
(Threat Intel 18%, Simulation 18%, Behavior 15%, Network 10%, Decision
18%, Audit 15%, Recovery 6%).

Alternatives:
- Manter 2 dimensões (Readiness + Assurance): descartada porque não
  distingue capacidade de prova automatizada.
- Combinar Evidence dentro de Readiness: descartada porque mistura
  conceitos distintos e impede auditoria isolada da capacidade de
  produção de evidence.

Consequences:
- Overall Confidence passa a ter 3 dimensões de segurança em vez de 2.
- Security tem peso 15% (média Readiness + Assurance), Evidence tem
  peso 10% separado.
- Pesos somam exatamente 1.00.
- Auditor pode avaliar capacidade de prova independentemente de
  implementação e de auditoria externa.

Architecture Impact:
Adicionado `scripts/metrics/evidence.ts`. Atualizado
`scripts/metrics/confidence.ts` para incluir Evidence×10%.
Atualizado `KPI-FORMULAS.md` §5.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## D-003 — Release Decision baseada em Hard Gates (não percentuais)

Status:
Accepted

Date:
2026-07-15

Context:
Percentuais podem mascarar gates críticos faltando. Overall Confidence
de 90% sem auditoria externa é inaceitável, mas o percentual não
sinaliza isso claramente. Necessidade de decisão binária, não
percentual.

Decision:
Release decision baseada em 17 Hard Gates booleanos. Decisão é:
- `BLOCKED` se >30% dos gates falhando.
- `READY_FOR_BETA` se ≥70% dos gates cumpridos.
- `READY_FOR_GA` se 100% dos gates cumpridos.

Lista de gates em `scripts/metrics/hard-gates.ts`. Gates cobrem:
vulnerabilidades críticas/altas, cobertura, vetores criptográficos,
SBOM, build reproduzível, assinatura, SAST, DAST, Dependabot, Trivy,
Gitleaks, SECURITY.md, 2 auditorias, 2 pentests, bug bounty, IR runbook.

Alternatives:
- Release quando Overall Confidence ≥ 90%: descartada porque
  percentual pode mascarar gates críticos faltando.
- Release quando Security Readiness ≥ 95%: descartada pela mesma razão.
- Comitê manual de release: descartada porque não é reproduzível nem
  auditável.

Consequences:
- Decisão de release é determinística e reproduzível.
- Lista de gates bloqueando é visível em cada `metrics.json`.
- Mudança na lista de gates exige PR com 2 approvals.
- Percentual continua útil para acompanhamento interno, mas não para
  decisão de release.

Architecture Impact:
Adicionado `scripts/metrics/hard-gates.ts`. Atualizado
`scripts/metrics/index.ts` para incluir `releaseDecision` no report.
Adicionado regra de consistência #6 (se GA, gates blocking = 0).

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## D-004 — Modelo de 3 estados por check

Status:
Accepted

Date:
2026-07-15

Context:
Modelo binário (pass/fail) não distinguia "ausência de evidência" de
"não implementado". Componente sem evidência reduzia o score da mesma
forma que componente inexistente. Impedia identificar onde exatamente
estava o gargalo.

Decision:
Adotar modelo de 3 estados por check:
- `verified` (score 1.0): implementação existe E é sustentada por
  artefacto automatizado (teste passando, arquivo commitado, CI verde,
  audit completo).
- `implemented_unverified` (score 0.5): código existe mas sem prova
  automatizada.
- `not_implemented` (score 0.0): nada existe.

Implementado em `scripts/metrics/_shared.ts` via tipo `CheckState` e
função `stateToScore()`.

Alternatives:
- Modelo binário (pass/fail): descartada porque não distingue ausência
  de evidência de não implementado.
- Modelo de 5 estados (com "partial" e "deprecated"): descartada por
  adicionar complexidade sem benefício claro nesta fase.

Consequences:
- Scores cairam significativamente (ex.: Security Readiness de 90%
  para 45%) porque muitos engines eram `implemented_unverified`.
- Esta é a realidade, não estimativa.
- Identificação clara de onde está o gargalo (X verificados, Y
  implemented_unverified, Z not_implemented).
- Dashboard pode mostrar coluna "State Summary" com ✅🟡❌.

Architecture Impact:
Atualizado `scripts/metrics/_shared.ts` (CheckState, Evidence,
computeScore). Atualizado todos os 8 scripts em `scripts/metrics/`.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## D-005 — Zero percentuais hardcoded

Status:
Accepted

Date:
2026-07-15

Context:
Dashboards e documentos continham percentuais digitados manualmente
("91%", "92%", "68%"). Quando implementação mudava, percentuais
ficavam desatualizados. Impedia auditoria e gerava inconsistência
entre o que o dashboard dizia e o que o código entregava.

Decision:
Nenhum percentual pode aparecer hardcoded em dashboard, documentação
ou comunicação. Todos os números devem ser derivados de
`reports/metrics.json`, gerado por `bun run metrics`.

Fluxo obrigatório: Código → Testes → Scanners → Scripts em
scripts/metrics/ → reports/metrics.json → Dashboard.

Alternatives:
- Permitir percentuais hardcoded em UI para performance: descartada
  porque performance não justifica perda de auditabilidade.
- Cache manual atualizado diariamente: descartada porque introduz
  possibilidade de erro humano.

Consequences:
- Dashboards devem fazer fetch de `reports/metrics.json`.
- Documentos referenciam fórmulas, não valores fixos.
- Comunicação cita valores com data de medição (ex.: "Overall
  Confidence era 28% em 2026-07-15, commit 8eebfbeff2e8").
- Tela de "métricas desatualizadas" aparece se `generatedAt` > 24h.

Architecture Impact:
Atualizado `KPI-FORMULAS.md` com regra absoluta no topo. Atualizado
`ARCHITECTURE-FREEZE-1.0-BASELINE.md` com seção "KPIs — Fonte Única
de Verdade".

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## D-006 — Pesos configuráveis via config/kpi-weights.json

Status:
Accepted

Date:
2026-07-15

Context:
Pesos hardcoded em `confidence.ts` dificultavam auditoria e revisão.
Mudança de peso exigia alterar código, sem versionamento claro do
"por quê".

Decision:
Pesos lidos de `config/kpi-weights.json`. Soma de `weights` deve ser
exatamente 1.0000. Soma de `securitySubWeights` deve ser exatamente
1.0000. Script valida em runtime e usa defaults com warning se config
inválido.

Alternatives:
- Pesos hardcoded em confidence.ts: descartada porque dificulta
  auditoria.
- Pesos em database: descartada porque adiciona infraestrutura
  desnecessária.
- Pesos em variáveis de ambiente: descartada porque não versiona
  junto com o código.

Consequences:
- Pesos fora do código, em JSON versionado com o repo.
- Mudança de peso exige PR com 2 approvals (Engineering Lead +
  Security Lead).
- Auditor pode revisar histórico de mudanças de peso via `git log
  config/kpi-weights.json`.

Architecture Impact:
Criado `config/kpi-weights.json`. Atualizado `scripts/metrics/confidence.ts`
com `loadWeights()`. Atualizado `scripts/metrics/index.ts` para usar
config carregada.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## D-007 — Histórico imutável em reports/history/

Status:
Accepted

Date:
2026-07-15

Context:
Apenas sobrescrever `reports/metrics.json` impedia gráficos de evolução
reais. Não era possível responder "quando o check X passou de
implemented_unverified para verified?".

Decision:
Cada execução de `bun run metrics` grava também
`reports/history/<YYYY-MM-DD>-<commit-short>.json` (imutável, não
sobrescrito). Contém o mesmo conteúdo do `metrics.json` da execução.

Alternatives:
- Apenas sobrescrever metrics.json: descartada porque não permite
  evolução histórica.
- Banco de dados para histórico: descartada porque adiciona
  infraestrutura desnecessária para esta fase.
- Append em arquivo único: descartada porque dificulta navegação e
  comparação entre snapshots.

Consequences:
- Um arquivo JSON por execução, nomeado por data+commit.
- Permite gráficos de evolução (Overall Confidence ao longo do tempo,
  transições de estado por check).
- Diretório `reports/history/` cresce indefinidamente — limpeza
  periódica opcional após v1.0.

Architecture Impact:
Adicionado `writeHistorySnapshot()` em `scripts/metrics/_shared.ts`.
Atualizado `scripts/metrics/index.ts` para chamar após gerar
metrics.json.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## D-008 — SHA-256 do report para integridade

Status:
Accepted

Date:
2026-07-15

Context:
Sem hash, não há como verificar integridade do `metrics.json`. Se
alguém editar o JSON manualmente, dashboard consumiria dados
corrompidos.

Decision:
Cada `metrics.json` inclui campo `sha256` no topo, computado sobre o
JSON canônico (excluindo o próprio campo `sha256`). Verificação:
re-calcular hash e comparar.

Alternatives:
- Sem hash: descartada porque não há verificação de integridade.
- Hash MD5: descartada por fraquezas criptográficas conhecidas.
- Assinatura Ed25519 imediatamente: descartada por enquanto porque
  exige infraestrutura de chaves que ainda não existe. Será
  adicionada depois.

Consequences:
- Verificação de integridade imediata.
- Próximo passo: assinatura Ed25519 ou Sigstore do hash para
  não-repúdio.
- Auditor pode verificar que `metrics.json` não foi alterado desde
  a geração.

Architecture Impact:
Adicionado `computeReportHash()` em `scripts/metrics/_shared.ts` usando
`node:crypto`. Atualizado `scripts/metrics/index.ts` para incluir
`sha256` no report.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## D-009 — Governance layer .ai/ como memória operacional

Status:
Accepted

Date:
2026-07-15

Context:
Documentação era espalhada em markdown solto, perdida entre sessões e
agentes. Sem hierarquia clara de autoridade, decisões estruturais
podiam ser violadas por prompts do usuário sem confirmação.

Decision:
Criar camada permanente de governança em `.ai/` com 8 arquivos
normativos. Hierarquia de autoridade: CORE_RULES > ENGINEERING_RULES
> ARCHITECTURE-FREEZE-1.0-BASELINE > ENGINEERING-STANDARDS >
KPI-FORMULAS > PROJECT_STATE > DECISION_LOG > prompt do usuário. Se
prompt do usuário violar regra estrutural, modelo deve parar e pedir
confirmação.

Alternatives:
- Documentação espalhada em markdown solto: descartada porque se perde
  entre sessões e agentes.
- Wiki externa: descartada porque não versiona junto com o código.
- Apenas README.md gigante: descartada porque mistura regras com
  estado e decisões, dificultando manutenção.

Consequences:
- Memória operacional permanente entre sessões.
- Hierarquia clara resolve conflitos entre regras e prompts.
- Antes de qualquer tarefa, modelo deve ler `.ai/` completo.
- Decisões estruturais ficam protegidas contra violação acidental.

Architecture Impact:
Criada estrutura `.ai/` com 8 arquivos. Esta decisão D-009 marca a
criação inicial; D-010 registra a refatoração estrutural subsequente.

Supersedes:
Nenhum

Superseded By:
D-010

---

## D-010 — Refatoração estrutural da governança .ai/

Status:
Accepted

Date:
2026-07-15

Context:
Estrutura inicial plana em `.ai/` misturava documentos normativos
(mudam raramente) com documentos de estado (mudam frequentemente) e
histórico (append-only). Risco de editar documentos normativos
durante desenvolvimento diário. PROJECT_STATE.md duplicava métricas
que já existiam em `reports/metrics.json`, criando inconsistência.
DECISION_LOG.md tinha formato flexível demais, dificultando auditoria.

Decision:
Reestruturar `.ai/` em subdiretórios:
- `rules/` — documentos normativos (CORE_RULES, ENGINEERING_RULES,
  OUTPUT_RULES, PROMPTING_RULES).
- `state/` — PROJECT_STATE.md + metrics.snapshot.json (cópia do
  último metrics.json).
- `decisions/` — DECISION_LOG.md (formato rígido imutável) +
  ARCHITECTURE_DECISIONS.md (ADRs).
- `templates/` — TASK_TEMPLATE.md.

PROJECT_STATE.md dividido em AUTO-GENERATED (derivado de
metrics.json, não editar) + MANUAL (fase, módulos, roadmap, riscos).

DECISION_LOG.md migrado para formato rígido imutável (Status, Date,
Context, Decision, Alternatives, Consequences, Architecture Impact,
Supersedes, Superseded By).

ARCHITECTURE_DECISIONS.md criado com ADR-001 a ADR-010 para cada
componente arquitetural congelado.

README.md atualizado com `GOVERNANCE_VERSION: 1.1`,
`Architecture Freeze: 1.0`, `Last Review: 2026-07-15`.

worklog.md passa a usar IDs estruturados `WL-YYYY-MM-DD-NNN`.

Alternatives:
- Manter estrutura plana: descartada porque mistura tipos de documento
  e facilita edição acidental de documentos normativos.
- Separar apenas state/ do resto: descartada porque decisions e
  templates também têm ciclos de mudança distintos.
- Subdiretórios por sprint: descartada porque não reflete natureza
  dos documentos.

Consequences:
- Documentos normativos isolados em `rules/`, mais protegidos contra
  edição acidental.
- PROJECT_STATE.md não duplica métricas — aponta para
  `reports/metrics.json` como fonte única de verdade.
- DECISION_LOG.md em formato rígido facilita auditoria automática.
- ADRs separados de decisões operacionais segue padrão da indústria.
- GOVERNANCE_VERSION permite rastrear evolução da própria governança.
- IDs estruturados no worklog facilitam referência cruzada.

Architecture Impact:
- Movidos 4 arquivos para `rules/`.
- Movido TASK_TEMPLATE.md para `templates/`.
- Reescrito PROJECT_STATE.md em `state/` com split AUTO/MANUAL.
- Criado `state/metrics.snapshot.json`.
- Reescrito DECISION_LOG.md em `decisions/` com formato rígido.
- Criado `decisions/ARCHITECTURE_DECISIONS.md` com 10 ADRs.
- Atualizado README.md com GOVERNANCE_VERSION.
- Atualizadas referências internas em `rules/` para novos paths.
- worklog.md passa a usar IDs `WL-YYYY-MM-DD-NNN`.

Supersedes:
D-009

Superseded By:
Nenhum

---

## Como Adicionar Nova Decisão

1. Próximo ID disponível: **D-011**.
2. Para decisões **arquiteturais**: usar ADR em
   `ARCHITECTURE_DECISIONS.md` (próximo ID: ADR-011).
3. Para decisões **operacionais**: usar D-XXX aqui.
4. Copiar o formato rígido acima. Não omitir campos.
5. PR com 2 approvals (Engineering Lead + Security Lead).
6. Se supersede decisão anterior: preencher `Supersedes: D-YYY` E
   atualizar entrada `D-YYY` com `Superseded By: D-XXX`.
7. Nunca editar entrada existente (salvo para adicionar
   `Superseded By`).

---

## Regras

- **Imutável**: nunca editar decisão existente (salvo
  `Superseded By`). Mesmo decisões revertidas permanecem no log.
- **Formato rígido**: todos os 9 campos obrigatórios.
- **Justificativa obrigatória**: Context e Decision são obrigatórios
  e devem ser específicos.
- **Alternativas obrigatórias**: toda decisão lista o que foi
  considerado e rejeitado, com razão.
- **Consequences obrigatórias**: impactos positivos e negativos.
- **Architecture Impact obrigatório**: nem que seja "Nenhum".
