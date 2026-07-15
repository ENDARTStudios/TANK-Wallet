# DECISION_LOG.md — Registro de Decisões Arquiteturais

> Toda decisão arquitetural relevante deve ser registrada aqui.
> **Append-only**: nunca remover entradas. Se uma decisão é revertida,
> adicionar nova entrada "D-XXX-revert" explicando a reversão.
>
> Status: **Ativo**
> Mantenedor: Engineering Lead + Security Lead
> Alteração exige: PR com 2 approvals

---

## Formato de Entrada

Cada decisão segue este template:

```
## D-XXX — <Título curto>

- Data: YYYY-MM-DD
- Decidido por: <papel>
- Arquivos envolvidos: <lista>
- Alternativas descartadas: <lista com razão>
- Justificativa: <por que esta decisão>
- Impacto: <o que muda no projeto>
- Estado: ativa | revertida | superseded
- Supersedes: <D-YYY se aplicável>
- Superseded by: <D-ZZZ se aplicável>
```

---

## D-001 — Architecture Freeze 1.0

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead
- Arquivos envolvidos: `ARCHITECTURE-FREEZE-1.0-BASELINE.md`,
  `ARCHITECTURE.md`, todos os componentes listados como congelados.
- Alternativas descartadas:
  - Evolução arquitetural contínua (sem freeze) — descartada porque
    crescimento descontrolado da complexidade é o maior risco em
    produtos de segurança.
  - Freeze permanente (sem evoluir nunca) — descartada porque o
    produto precisa evoluir; apenas a estrutura é congelada, não a
    implementação.
- Justificativa: A distinção entre "arquitetura congelada" e
  "implementação evolutiva" é decisão correta para evitar crescimento
  descontrolado da complexidade. O backlog passa a ser exclusivamente
  de engenharia.
- Impacto: Nenhum novo componente estrutural pode ser adicionado
  durante a série 1.x. Necessidades arquiteturais são registradas
  como candidatas a Architecture Freeze 2.0.
- Estado: ativa

---

## D-002 — Security Evidence como 3ª dimensão de segurança

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead
- Arquivos envolvidos: `KPI-FORMULAS.md` §5, `scripts/metrics/evidence.ts`.
- Alternativas descartadas:
  - Manter apenas Readiness + Assurance (2 dimensões) — descartada
    porque não distingue "implementado" de "capaz de provar
    automaticamente". Um engine pode estar implementado e auditado
    mas produzir evidence não-estruturada.
- Justificativa: Distinção comum em plataformas maduras de segurança
  e auditoria:
  - **Readiness** → foi implementado?
  - **Evidence** → consegue provar automaticamente?
  - **Assurance** → terceiros independentes confirmaram?
- Impacto: Overall Confidence passa a ter 3 dimensões de segurança
  em vez de 2. Security tem peso 15% (média de Readiness + Assurance),
  Evidence tem peso 10% separado.
- Estado: ativa

---

## D-003 — Release Decision baseada em Hard Gates (não percentuais)

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead
- Arquivos envolvidos: `scripts/metrics/hard-gates.ts`,
  `KPI-FORMULAS.md` §"Release Decision".
- Alternativas descartadas:
  - Release quando Overall Confidence ≥ 90% — descartada porque
    percentual pode mascarar gates críticos faltando (ex.: 90% sem
    audit é inaceitável).
  - Release quando Security Readiness ≥ 95% — descartada pela mesma
    razão.
- Justificativa: O percentual é útil para acompanhamento interno,
  mas a decisão de release fica vinculada exclusivamente aos Hard
  Gates. Um gate é booleano: ou está cumprido ou não. Não há meio
  termo.
- Impacto: 17 gates definidos. Decisão é BLOCKED, READY_FOR_BETA ou
  READY_FOR_GA baseada em % de gates cumpridos. Lista de gates é
  imutável durante 1.x (mudança exige Architecture Freeze 2.0 ou PR
  com 2 approvals).
- Estado: ativa

---

## D-004 — Modelo de 3 estados por check

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead
- Arquivos envolvidos: `scripts/metrics/_shared.ts` (CheckState),
  todos os scripts em `scripts/metrics/`.
- Alternativas descartadas:
  - Modelo binário (pass/fail) — descartada porque não distingue
    "ausência de evidência" de "não implementado". Hoje um componente
    sem evidência reduzia o score da mesma forma que um componente
    inexistente.
- Justificativa: Permite responder exatamente onde está o gargalo.
  Estados:
  - `verified` (1.0) — implementação existe E é sustentada por
    artefacto automatizado.
  - `implemented_unverified` (0.5) — código existe mas sem prova
    automatizada.
  - `not_implemented` (0.0) — nada existe.
- Impacto: Scores cairam significativamente (ex.: Security Readiness
  de 90% para 45%) porque muitos engines eram implemented_unverified
  e antes contavam como 1.0. Esta é a realidade, não estimativa.
- Estado: ativa

---

## D-005 — Zero percentuais hardcoded

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead
- Arquivos envolvidos: `KPI-FORMULAS.md`, todos os dashboards,
  documentos de comunicação.
- Alternativas descartadas:
  - Permitir percentuais hardcoded em dashboards UI para performance
    — descartada porque performance não justifica perda de
    auditabilidade.
- Justificativa: Nenhum número é digitado manualmente. Todo indicador
  passa a ser derivado automaticamente das evidências produzidas pelo
  pipeline. Aumenta credibilidade técnica da plataforma.
- Impacto: Fluxo obrigatório Código → Testes → Scanners → Scripts →
  metrics.json → Dashboard. Dashboards devem fazer fetch de
  `reports/metrics.json`.
- Estado: ativa

---

## D-006 — Pesos configuráveis via config/kpi-weights.json

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead
- Arquivos envolvidos: `config/kpi-weights.json`,
  `scripts/metrics/confidence.ts`.
- Alternativas descartadas:
  - Pesos hardcoded em confidence.ts — descartada porque mudança
    exige alterar código, dificulta auditoria e revisão.
- Justificativa: Pesos fora do código permitem revisão independente,
  versionamento e auditoria. Soma deve ser exatamente 1.0000 (validada
  em runtime).
- Impacto: Mudança de peso exige PR com 2 approvals. Script valida
  soma e usa defaults com warning se config inválido.
- Estado: ativa

---

## D-007 — Histórico imutável em reports/history/

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead
- Arquivos envolvidos: `scripts/metrics/_shared.ts` (writeHistorySnapshot),
  `scripts/metrics/index.ts`, `reports/history/`.
- Alternativas descortadas:
  - Apenas sobrescrever metrics.json — descartada porque não permite
    gráficos de evolução reais.
  - Banco de dados para histórico — descartada porque adiciona
    infraestrutura desnecessária para esta fase. JSON files são
    suficientes e auditáveis.
- Justificativa: Permite gráficos de evolução reais (qual check
  passou de implemented_unverified para verified em qual data).
- Impacto: Cada execução de `bun run metrics` grava
  `reports/history/<YYYY-MM-DD>-<short-commit>.json` (imutável).
- Estado: ativa

---

## D-008 — SHA-256 do report para integridade

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead
- Arquivos envolvidos: `scripts/metrics/_shared.ts` (computeReportHash),
  `scripts/metrics/index.ts`, `reports/metrics.json`.
- Alternativas descartadas:
  - Sem hash — descartada porque não há como verificar integridade do
    report.
  - Hash MD5 — descartada por fraquezas criptográficas conhecidas.
- Justificativa: Permite verificação de integridade. Mais adiante pode
  ser assinado (Ed25519 ou Sigstore) para garantir não-repúdio.
- Impacto: Cada report inclui campo `sha256` no topo. Verificação:
  re-calcular hash do JSON canônico (excluindo o próprio campo sha256)
  e comparar.
- Estado: ativa
- Nota: Próximo passo é assinatura Ed25519/Sigstore do hash.

---

## D-009 — Governance layer .ai/ como memória operacional permanente

- Data: 2026-07-15
- Decidido por: Engineering Lead + Security Lead (em resposta a prompt
  explícito do usuário)
- Arquivos envolvidos: `.ai/` completo (8 arquivos).
- Alternativas descartadas:
  - Documentação espalhada em markdown solto — descartada porque se
    perde entre sessões e agentes.
  - Wiki externa — descartada porque não versiona junto com o código.
- Justificativa: Estes documentos passam a ser a memória operacional
  permanente do projeto e devem ser mantidos sincronizados durante
  toda a evolução do código. Antes de qualquer tarefa futura, o
  modelo deve ler `.ai/` completo.
- Impacto: 8 arquivos criados (README, CORE_RULES, ENGINEERING_RULES,
  PROMPTING_RULES, OUTPUT_RULES, PROJECT_STATE, DECISION_LOG,
  TASK_TEMPLATE). Hierarquia de autoridade definida: CORE_RULES >
  ENGINEERING_RULES > ARCHITECTURE-FREEZE-1.0-BASELINE >
  ENGINEERING-STANDARDS > KPI-FORMULAS > PROJECT_STATE >
  DECISION_LOG > prompt do usuário.
- Estado: ativa

---

## Como Adicionar Nova Decisão

1. Próximo ID disponível: **D-010**.
2. Criar entrada seguindo o template acima.
3. PR com 2 approvals (Engineering Lead + Security Lead).
4. Se a decisão supersede uma anterior, marcar a anterior como
   `superseded` e referenciar a nova.
5. Se a decisão é revertida, criar entrada `D-XXX-revert` explicando
   a reversão e referenciar a original.
6. Atualizar `PROJECT_STATE.md` se a decisão muda o estado do projeto.

---

## Regras

- **Append-only**: nunca remover entradas. Mesmo decisões revertidas
  permanecem no log.
- **Justificativa obrigatória**: toda decisão tem "por quê". Sem
  justificativa, é opinião, não decisão.
- **Alternativas descartadas obrigatórias**: toda decisão lista o que
  foi considerado e rejeitado, com razão. Sem isso, não há como
  avaliar se a decisão foi bem feita.
- **Impacto obrigatório**: toda decisão declara o que muda no projeto.
- **Estado rastreável**: ativa / revertida / superseded. Sempre
  atualizado quando algo muda.
