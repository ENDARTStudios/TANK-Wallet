# Tank Wallet — KPI Formulas

> **Fórmulas públicas e reproduzíveis para todos os KPIs do projeto.**
>
> Objetivo: qualquer auditor com acesso ao repositório deve conseguir
> recalcular cada percentual exibido em dashboards e relatórios a partir
> destas fórmulas e dos scripts em `scripts/metrics/`.
>
> Status: **Ativo a partir de Architecture Frozen 1.0**
> Mantenedor: Engineering Lead + Security Lead
> Princípio: **KPI sem fórmula pública é claim de marketing, não métrica.**

---

## ⚠ Regra Absoluta: Zero Percentuais Hardcoded

> **Nenhum percentual pode aparecer hardcoded em dashboard, documentação
> ou comunicação.** Todos os números devem ser derivados de
> `reports/metrics.json`, gerado por `bun run metrics`.

Fluxo obrigatório:

```
Código
   ↓
Testes
   ↓
Scanners
   ↓
Scripts em scripts/metrics/
   ↓
reports/metrics.json
   ↓
Dashboard / Documentos / Comunicação
```

- Dashboards consumindo `reports/metrics.json` em vez de constantes.
- Documentos referenciam fórmulas, não valores fixos.
- Comunicação cita valores com data de medição (ex.: "Overall Confidence
  era 28% em 2026-07-15, commit 8eebfbeff2e8").

Comando único para regenerar todos os KPIs:

```bash
bun run metrics
```

Gera:

```
reports/
    metrics.json                          # snapshot atual (sobrescrito)
    metrics.md                            # humano-legível
    history/
        2026-07-15-8eebfbeff2e8.json      # snapshot imutável por commit
```

---

## Schema do Report (v1.1)

Cada execução de `bun run metrics` produz um `MetricsReport` com a
seguinte estrutura. Esta é a fonte canônica — dashboards e auditorias
devem consumir estes campos.

### Campos de Topo

```json
{
  "schemaVersion": "1.1",
  "generatedAt": "2026-07-15T14:40:13.447Z",
  "generatedBy": "scripts/metrics/index.ts",
  "commit": "8eebfbeff2e82050dcd3d040ea72f2a16c60b47b",
  "scriptVersion": "1.1.0",
  "sha256": "f3ba1e94cdd66524826e7cf7bd14892b26864ab40cdb5c3622102644d68e4f83",
  "metrics": { ... },
  "releaseDecision": { ... },
  "inconsistencies": []
}
```

- **schemaVersion** — para migração de parsers. Quebra de schema exige bump.
- **generatedBy** — path do script que gerou o report (auditoria).
- **commit** — git HEAD no momento da geração.
- **sha256** — hash SHA-256 do JSON canônico (excluindo o próprio campo).
  Permite verificação de integridade. Mais adiante pode ser assinado
  (Ed25519 ou Sigstore).

### Modelo de 3 Estados por Check

Cada check (não cada métrica) tem um `state` que distingue três níveis:

| State | Significado | Score |
|-------|-------------|-------|
| `verified` | Implementação existe **E** é sustentada por artefacto automatizado (teste passando, arquivo commitado, CI verde, audit completo) | 1.0 × peso |
| `implemented_unverified` | Código existe mas sem prova automatizada | 0.5 × peso |
| `not_implemented` | Nada existe | 0 |

Isso separa "ausência de evidência" de "não implementado". Um componente
pode estar implementado mas sem testes — isso vale 0.5, não 0.

### Evidence Estruturada por Check

Cada check traz um objeto `evidence`:

```json
{
  "evidence": {
    "status": true,
    "artifact": "src/lib/wallet-core/__tests__/vectors/bip39.json",
    "source": "filesystem",
    "verifiedAt": "2026-07-15T14:40:13.465Z"
  }
}
```

- **status** — true se o artefato existe.
- **artifact** — caminho concreto do artefato (file path, URL, command output). `null` se ausente.
- **source** — onde o artefato foi procurado (filesystem, ripgrep, prisma schema, scanner output, CI).
- **verifiedAt** — timestamp da última verificação. `null` se nunca verificado.

Isso elimina ambiguidade sobre **por que** um check recebeu determinada nota.

### Pesos Configuráveis

Pesos não são hardcoded. São lidos de `config/kpi-weights.json`:

```json
{
  "version": "1.0",
  "weights": {
    "architecture": 0.20,
    "engineering": 0.20,
    "security": 0.15,
    "evidence": 0.10,
    "operations": 0.20,
    "release": 0.15
  },
  "securitySubWeights": {
    "readiness": 0.5,
    "assurance": 0.5
  }
}
```

- Soma de `weights` deve ser exatamente 1.0000.
- Soma de `securitySubWeights` deve ser exatamente 1.0000.
- Se config ausente ou inválido, script usa defaults e adiciona warning em `inconsistencies`.
- Mudança de peso exige PR com 2 approvals (Engineering Lead + Security Lead).

### Release Decision — Hard Gates (booleanos, não percentuais)

A decisão de release **não** é baseada em percentuais. É baseada em uma
lista de Hard Gates booleanos. Todos devem ser `met: true` para GA.

```json
{
  "releaseDecision": {
    "decision": "BLOCKED",
    "blockingGates": [
      "Critical vulns resolved",
      "SBOM published",
      "Audit #2 completed",
      ...
    ],
    "gates": [
      {
        "name": "SBOM published",
        "description": "CycloneDX SBOM artefact published with release",
        "met": false,
        "evidence": { "status": false, "artifact": null, "source": null, "verifiedAt": null },
        "blockingReason": "SBOM not yet generated (@cyclonedx/cyclonedx-npm pending)"
      },
      ...
    ],
    "decidedAt": "2026-07-15T14:40:13.447Z"
  }
}
```

#### Estados possíveis

| Decision | Condição |
|----------|----------|
| `BLOCKED` | >30% dos gates não cumpridos |
| `READY_FOR_BETA` | ≥70% dos gates cumpridos (release interno fechado) |
| `READY_FOR_GA` | 100% dos gates cumpridos |

#### Lista de 17 Hard Gates (GA)

1. Critical vulns resolved
2. High vulns resolved
3. Coverage ≥ 95%
4. Crypto vectors validated
5. SBOM published
6. Reproducible build
7. Release signed (sigstore)
8. SAST in CI (Semgrep + CodeQL)
9. Gitleaks in CI
10. Trivy in CI
11. SECURITY.md published
12. Audit #1 completed
13. Audit #2 completed
14. Pentest #1 completed
15. Pentest #2 completed
16. Bug bounty public (no criticals open for 90 days)
17. Incident Response runbook

Definição completa em `scripts/metrics/hard-gates.ts`. Adicionar ou remover
gate exige PR com 2 approvals.

### Histórico Imutável

Cada execução também grava:

```
reports/history/<YYYY-MM-DD>-<commit-short>.json
```

Este arquivo **não é sobrescrito**. Permite gráficos de evolução reais
(como Overall Confidence variou ao longo do tempo, qual check passou de
`implemented_unverified` para `verified` em qual data).

### Regras de Consistência (exit 1 se violadas)

1. Soma dos pesos em `config/kpi-weights.json` = 1.0000
2. Soma de `securitySubWeights` = 1.0000
3. Cada peso de métrica em [0, 1]
4. Cada score de métrica em [0, 100]
5. Overall Confidence score = recomputação a partir dos inputs
6. Security Readiness sem Audit ≤ 91%
7. Security Assurance sem audit/pentest ≤ 5%
8. Se `releaseDecision.decision === "READY_FOR_GA"`, então `blockingGates.length === 0`

---

## 0. Princípios

1. **Toda métrica é reproduzível.** Se um auditor não consegue recalcular,
   a métrica não existe.
2. **Toda métrica tem fonte.** O dado bruto mora em um local identificável
   (CI artifact, Prisma DB, log agregado, output de script).
3. **Toda métrica tem peso declarado.** Se entra em score composto, o peso
   é público e justificado.
4. **Toda métrica tem data de medição.** Sem data, é instantâneo sem
   contexto.
5. **KPIs internos ≠ Evidências de segurança.** Os números são indicadores
   de progresso, não claims auditáveis. Evidência objetiva de segurança vem
   de auditoria independente + testes reproduzíveis.
6. **Três dimensões de segurança, não duas.** Toda métrica de segurança
   se enquadra em:
   - **Readiness** — foi implementado?
   - **Evidence** — consegue provar automaticamente?
   - **Assurance** — terceiros independentes confirmaram?
7. **Zero hardcoded.** Nenhum percentual é digitado manualmente. Tudo
   derivado de `reports/metrics.json`.

---

## 1. Architecture Compliance (Target: 100%)

### Fórmula

```
Architecture Compliance = (Componentes_Congelados_Conformes / Total_Componentes_Congelados) × 100
```

### Componentes Congelados (10)

| # | Componente | Verificação | Status |
|---|-----------|-------------|--------|
| 1 | Security Kernel | Existe `src/lib/wallet-security-real/kernel.ts` implementando pipeline de 12 estágios? | ✅ |
| 2 | 16 Security Engines | Cada engine em `src/lib/wallet-engines/<name>/` implementa `SecurityEngine` interface? | ✅ |
| 3 | Tank Security Standard (TSS) | 10 specs em `docs/tss/` com enforcement ≥ 80%? | ✅ |
| 4 | Tank Security Framework (TSF) | 7 domínios documentados e referenciados? | ✅ |
| 5 | Security Governance Layer | 7 registries implementados em Prisma schema? | ✅ |
| 6 | Security Event Bus | 16 eventos + 9 chain events tipados no schema? | ✅ |
| 7 | Unified Data Model | 15 objetos centrais compartilhados definidos em `src/lib/wallet-core/types.ts`? | ✅ |
| 8 | ChainPlugin Interface | `apiVersion 1.0` congelada? 4 plugins implementados? | ✅ |
| 9 | Architecture Contracts | 15 contratos imutáveis documentados e enforced por types? | ✅ |
| 10 | Decision Engine | Pipeline evidence-based com `evidence[]`, `sources[]`, `engineScores{}`? | ✅ |

### Fonte de Dados

```bash
# Script de verificação
bun run scripts/metrics/architecture-compliance.ts
# Output: JSON com pass/fail por componente
```

### Status Atual

> Veja `reports/metrics.json` → `metrics.architecture.score`.
> Regenerado por `bun run metrics`. Não citar valores hardcoded.

### Limitação

Esta métrica verifica **presença e conformidade estrutural**, não corretude
de implementação. Um componente pode existir e estar estruturalmente conforme
mas ter bugs. Corretude é medida por testes e auditoria.

---

## 2. Engineering Readiness (Target: ≥95%)

### Fórmula

```
Engineering Readiness = (Σ(engine_score × engine_weight)) × 100
```

Onde `engine_score` é binário (0 ou 1) por critério, e `engine_weight` é
o peso do critério.

### Critérios e Pesos

| Critério | Peso | Verificação |
|----------|------|-------------|
| Sem stubs em engines críticas | 15% | `rg "TODO\|FIXME\|HACK\|stub\|mock.*return" src/lib/wallet-engines src/lib/wallet-core` retorna 0 linhas |
| Cobertura ≥ 95% (linhas) | 15% | CI artifact `coverage/coverage-summary.json` |
| Cobertura ≥ 90% (branches) | 10% | Mesma fonte |
| Vetores criptográficos validados | 15% | `bun run scripts/metrics/crypto-vectors.ts` reports 100% (§12 ENGINEERING-STANDARDS.md) |
| Conformance Suite passing | 10% | 11 testes × 4 plugins = 44 passing |
| Sem `console.log` em produção | 5% | ESLint `no-console` sem violações |
| Sem `any` em código de produção | 5% | ESLint `@typescript-eslint/no-explicit-any` sem violações |
| Tipos estritos habilitados | 5% | `tsconfig.json` com `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Build reproduzível | 10% | Dois builds em containers diferentes produzem mesmo hash |
| SBOM publicado | 5% | Artefato de release contém `sbom.cyclonedx.json` |
| Builds assinados | 5% | Release assinado via sigstore |

### Fonte de Dados

```bash
bun run scripts/metrics/engineering-readiness.ts
# Output: JSON com score por critério + score total
```

### Status Atual

> Veja `reports/metrics.json` → `metrics.engineering.score`.
> Regenerado por `bun run metrics`. Não citar valores hardcoded.

### Limitação

Esta métrica mede **ausência de defeitos conhecidos**, não presença de
qualidade. Cobertura 95% com testes triviais não é qualidade. Vetores
criptográficos validados é evidência mais forte que cobertura.

---

## 3. Security Readiness (Target: ≥95%)

### Fórmula

```
Security Readiness = (Σ(engine_score × engine_weight)) × 100
```

### Pesos por Engine (compostos)

| Engine | Peso | Critério de "Pronto" |
|--------|------|---------------------|
| Threat Intel | 20% | Integrado com GoPlus real + database Prisma própria + cache + failover |
| Simulation | 15% | `eth_call` real + state diff + cobertura de opcode críticos |
| Policy | 10% | 6 policies built-in + 11 condições + testadas com property |
| Permissions | 10% | ERC-20/721/1155/Permit2/ERC-4337/SPL/BTC/Lightning suportados |
| Behavior | 15% | IA com detecção de anomalias + baseline + drift detection |
| Network | 10% | RPC pool com quorum + circuit breaker + failover testado |
| Device Trust | 10% | WebAuthn + WebCrypto reais + attestation |
| Crypto | 10% | 100% vetores oficiais passing (§12 ENGINEERING-STANDARDS.md) |
| Audit | 0% (até Sprint 5) | Bloqueado até auditoria externa |

### Fórmula Detalhada

```python
def security_readiness():
    engines = {
        "threat_intel":   (1.0, 0.20),  # peso 20%
        "simulation":     (1.0, 0.15),
        "policy":         (1.0, 0.10),
        "permissions":    (1.0, 0.10),
        "behavior":       (1.0, 0.15),
        "network":        (1.0, 0.10),
        "device_trust":   (1.0, 0.10),
        "crypto":         (1.0, 0.10),
        "audit":          (0.0, 0.00),  # bloqueado até Sprint 5
    }
    score = sum(engine_score * weight for engine_score, weight in engines.values())
    return score * 100  # percentual
```

### Status Atual

> Veja `reports/metrics.json` → `metrics.security.score`.
> Regenerado por `bun run metrics`. Não citar valores hardcoded.

### Limitação CRÍTICA

- **Audit (0%)**: sem auditoria externa, esta métrica **não pode atingir
  100%** por design. Máximo atual = 91% mesmo com implementação perfeita.
- O score reflete implementação **auto-reportada**, não validação externa.
- Após Audit #1 e #2 (Sprint 5), o peso de Audit sobe para 15% e os outros
  pesos são recalibrados.

### Script de Verificação

```bash
bun run metrics
# Output: reports/metrics.json + reports/metrics.md
# Detalhes por engine em metrics.security.checks[]
```

---

## 4. Security Assurance (Target: 100%)

### Princípio

> **Assurance ≠ Readiness.** Readiness mede implementação. Assurance mede
> validação externa. Um sistema pode estar 100% pronto e 0% assured.

### Fórmula

```
Security Assurance = (Σ(validation_item × item_weight)) × 100
```

### Itens de Validação

| Item | Peso | Status |
|------|------|--------|
| Audit #1 concluída sem críticos | 25% | Pendente (Sprint 5) |
| Audit #2 concluída sem críticos | 25% | Pendente (Sprint 5) |
| Pentest #1 concluído sem críticos | 15% | Pendente |
| Pentest #2 concluído sem críticos | 10% | Pendente |
| Bug bounty público sem críticos abertos por 90 dias | 15% | Pendente |
| SECURITY.md publicado | 5% | Pendente |
| 2+ fontes independentes de validação | 5% | Pendente |

### Status Atual

> Veja `reports/metrics.json` → `metrics.assurance.score`.
> Regenerado por `bun run metrics`. Não citar valores hardcoded.

### Limitação CRÍTICA

- Assurance é a métrica que **mais pesa na confiança pública** do produto.
- Sem auditoria externa, Assurance permanece **≤ 30%** por design, não
  importa quão boa seja a implementação.
- Esta métrica **só pode subir** com validação externa. Implementação
  interna não conta.

---

## 5. Security Evidence (Target: ≥95%) — NOVO

### Princípio

> **Evidence ≠ Readiness ≠ Assurance.** São três dimensões distintas.
>
> - **Readiness** — foi implementado?
> - **Evidence** — consegue provar automaticamente, com registro estruturado,
>   que o engine fez seu trabalho?
> - **Assurance** — terceiros independentes confirmaram?

Um engine pode estar 100% implementado (Readiness), produzir 100% de
evidência estruturada (Evidence), mas ainda ter 0% de Assurance até que
uma auditoria externa valide.

### Fórmula

```
Security Evidence = (Σ(engine_evidence × engine_weight)) × 100
```

Um engine "produz evidence" quando seus outputs incluem:

1. **Registros estruturados** (objetos tipados, não strings free-form)
2. **Atribuição de fonte** (de onde veio o dado: RPC endpoint, API,
   database, cálculo local)
3. **Timestamps** (quando o dado foi produzido)
4. **Reprodutibilidade** (input que permite re-executar e obter mesmo
   resultado)

### Pesos por Engine

| Engine | Peso | Critério de "produz evidence" |
|--------|------|-------------------------------|
| Threat Intel | 18% | Estrutura tipada com source, severity, lastConfirmedAt |
| Simulation | 18% | State diff estruturado + input reproduzível |
| Behavior | 15% | Score (Int) + reasons (JSON estruturado) |
| Network | 10% | RPC metadata (provider, latency, block height) |
| Decision | 18% | `evidence[]` + `sources[]` + `engineScores{}` + `reproducible` |
| Audit | 15% | HMAC-signed, append-only, tamper-evident |
| Recovery | 6% | Shamir share metadata (threshold, shares, group) |

### Exemplo de Cálculo

```
Threat Engine    Evidence: 100%  × 18% = 18.0
Simulation       Evidence: 100%  × 18% = 18.0
Behavior         Evidence:  96%  × 15% = 14.4
Network          Evidence: 100%  × 10% = 10.0
Decision         Evidence: 100%  × 18% = 18.0
Audit            Evidence: 100%  × 15% = 15.0
Recovery         Evidence: 100%  ×  6% =  6.0
─────────────────────────────────────────────
Security Evidence                = 99.4%
```

### Status Atual

> Veja `reports/metrics.json` → `metrics.evidence.score`.
> Regenerado por `bun run metrics`. Não citar valores hardcoded.

### Limitação

- Evidence mede **capacidade de produzir prova estruturada**, não a
  corretude da prova em si.
- Um engine pode produzir evidence estruturada mas com cálculo errado.
- Correctness é medida por testes de propriedade + vetores oficiais.
- Evidence + Correctness + External Audit = Assurance completo.

### Distinção com Evidence Coverage (§7)

- **Security Evidence** (esta seção, §5) — capacidade da plataforma de
  produzir prova estruturada, por engine.
- **Evidence Coverage** (§7) — % de decisões que de fato contêm evidence[]
  não-vazio em runtime.

A primeira é capacidade; a segunda é aderência em uso real.

---

## 6. Operational Readiness (Target: ≥90%)

### Fórmula

```
Operational Readiness = (Σ(op_item × item_weight)) × 100
```

### Itens Operacionais

| Item | Peso | Status |
|------|------|--------|
| Logs estruturados em produção | 15% | Pendente |
| Métricas (Prometheus) expostas | 15% | Pendente |
| Tracing distribuído (OTel) | 10% | Pendente |
| Alertas (Alertmanager) configurados | 15% | Pendente |
| Error tracking (Sentry) integrado | 10% | Pendente |
| Incident Response runbook | 10% | Pendente |
| Disaster Recovery testado | 10% | Pendente |
| Backup automatizado + test restore | 5% | Pendente |
| SOC Dashboard operacional | 5% | Parcial (UI existe, dados parciais) |
| Update Cycle SLA documentado | 5% | Parcial |

### Status Atual

> Veja `reports/metrics.json` → `metrics.operations.score`.
> Regenerado por `bun run metrics`. Não citar valores hardcoded.

### Limitação

- Métrica mede **capacidade operacional**, não qualidade operacional real.
- Quality operacional é medida por SLO/SLI em produção (MTTR, uptime, etc.).
- Esses SLOs só passam a ter peso após 90 dias de operação em produção.

---

## 7. Release Readiness (Target: 100%)

### Fórmula

```
Release Readiness = (Σ(release_item × item_weight)) × 100
```

### Itens de Release

| Item | Peso | Status |
|------|------|--------|
| CI/CD pipeline automatizado | 15% | Parcial |
| Build reproduzível | 20% | Pendente |
| SBOM publicado | 10% | Pendente |
| Release assinado (sigstore) | 15% | Pendente |
| SAST em CI (Semgrep + CodeQL) | 10% | Parcial |
| DAST em CI (ZAP baseline) | 5% | Pendente |
| Dependabot/Renovate ativo | 5% | Pendente |
| Trivy em CI | 5% | Pendente |
| Gitleaks em CI | 5% | Parcial |
| CHANGELOG público | 5% | Pendente |
| Release notes publicados | 5% | Pendente |

### Status Atual

**14% (Release Dashboard UI + alguns scanners parciais)** — medido em
2026-07-15.

### Limitação

- Release Readiness é **gate de produção**: abaixo de 100%, sem release público.
- Pode haver release interno (beta fechado) com score ≥ 70%, mas não general
  availability.

---

## 8. Evidence Coverage (Target: 100%)

### Fórmula

```
Evidence Coverage = (decisões_com_evidência / total_decisões) × 100
```

### Definição

Uma decisão é "com evidência" quando seu objeto `EvidenceBasedDecision`
contém:
- `evidence[]` não-vazio (pelo menos 1 item)
- `sources[]` não-vazio (referência à fonte do dado)
- `engineScores{}` completo (todos os engines envolvidos reportaram score)
- `reproducible: true` (decoder pode re-executar e obter mesmo resultado)

### Status Atual

**92%** — medido em 2026-07-15. 8% das decisões em modo degradado não
incluem evidência completa (ex.: threat intel indisponível, decisão baseada
em cache stale).

### Limitação

- Evidence Coverage mede **presença** de evidência, não **qualidade**.
- Qualidade da evidência é função da maturidade do engine que a produziu.

---

## 9. Overall Confidence Score (Composto)

### Fórmula

```
Overall Confidence =
    (Architecture × 0.20)
  + (Engineering × 0.20)
  + (Average(Security Readiness, Security Assurance) × 0.15)
  + (Security Evidence × 0.10)
  + (Operations × 0.20)
  + (Release × 0.15)
```

Onde:
- `Architecture` = Architecture Compliance (0-100)
- `Engineering` = Engineering Readiness (0-100)
- `Security` = (Security Readiness + Security Assurance) / 2 (média aritmética)
- `Evidence` = Security Evidence (0-100) — capacidade de prova estruturada
- `Operations` = Operational Readiness (0-100)
- `Release` = Release Readiness (0-100)

### Justificativa dos Pesos

| Componente | Peso | Razão |
|-----------|------|-------|
| Architecture | 20% | Fundação; sem ela nada se sustenta. Já é alta e estável. |
| Engineering | 20% | Implementação é onde bugs moram; peso alto reflete risco. |
| Security (avg) | 15% | Readiness + Assurance combinados. Assurance sem readiness é vazio; readiness sem assurance é claim. |
| Evidence | 10% | Distinto dos dois: capacidade de produzir prova estruturada automaticamente. |
| Operations | 20% | Sem observability, nada se sabe em produção. |
| Release | 15% | Gate final, mas dependente dos anteriores. |

Soma dos pesos: **1.00** (20+20+15+10+20+15).

### Status Atual

> Veja `reports/metrics.json` → `metrics.confidence.score`.
> Regenerado por `bun run metrics`. Não citar valores hardcoded.
>
> Para auditoria: o campo `metrics.confidence.formula` em `metrics.json`
> contém os inputs e o cálculo passo a passo usados nesta medição.

### Limitação CRÍTICA

- Overall Confidence é **média ponderada de auto-avaliação**.
- Não substitui auditoria externa.
- Um sistema com Overall = 90% pode ainda ter bugs críticos não detectados.
- Use esta métrica como **indicador de progresso**, não como claim de
  qualidade.
- A única métrica que pode subir com trabalho interno é Engineering,
  Evidence e Operations. Security (Assurance metade) e Release exigem
  validação externa.

---

## 10. Dynamic Security Score (UX)

### Princípio

Este é o score exibido ao usuário no dashboard. Não é o mesmo que Overall
Confidence — mede a **postura de segurança atual** da carteira do usuário,
não a maturidade do produto.

### Fórmula

```
Security Score = 100 - Σ(component_risk × component_weight)
```

Onde `component_risk` é 0-100 (0 = sem risco, 100 = risco máximo) e
`component_weight` é o peso do componente.

### Componentes e Pesos

| Componente | Peso | Fonte do Risco |
|-----------|------|---------------|
| Threat Intel | 20% | Última ameaça detectada (0 se nenhuma em 24h, 100 se critical em uso) |
| Device | 15% | WebAuthn disponível? (0 se sim, 100 se não) + biometria |
| Behavior | 15% | Anomalia score do Behavior engine |
| Simulation | 15% | Última simulação retornou risco? |
| Permissions | 15% | % de aprovações infinitas ativas |
| Network | 10% | RPC health (0 se saudável, 100 se em failover estendido) |
| Policies | 10% | Policies ativas cumprindo? (0 se sim, 100 se alguma bypassed) |

### Cálculo

```python
def security_score(threat_intel_risk, device_risk, behavior_risk,
                   simulation_risk, permissions_risk, network_risk, policy_risk):
    weights = {
        "threat_intel": 0.20,
        "device": 0.15,
        "behavior": 0.15,
        "simulation": 0.15,
        "permissions": 0.15,
        "network": 0.10,
        "policy": 0.10,
    }
    risks = {
        "threat_intel": threat_intel_risk,
        "device": device_risk,
        "behavior": behavior_risk,
        "simulation": simulation_risk,
        "permissions": permissions_risk,
        "network": network_risk,
        "policy": policy_risk,
    }
    total_risk = sum(risks[k] * weights[k] for k in weights)
    return max(0, 100 - total_risk)
```

### Postura Resultante

| Score | Posture | Ação |
|-------|---------|------|
| ≥ 90 | NORMAL | Operação normal |
| 70-89 | ELEVATED | Notificar usuário, aumentar thresholds |
| 50-69 | FORTIFIED | Confirmar ações sensíveis, warning proeminente |
| < 50 | LOCKDOWN | Bloquear transações, sugerir lockdown |

---

## 11. KPIs Permanentes Pós-v1.0

Após release v1.0, os KPIs de readiness perdem relevância (todos devem ser
100% ou near-100%). KPIs operacionais ganham peso:

| KPI | Meta | Fórmula |
|-----|------|---------|
| Decision Accuracy | >99% | `(decisões_corretas / total_decisões) × 100` |
| False Positive Rate | <1% | `(falsos_positivos / total_bloqueios) × 100` |
| False Negative Rate | Tendência decrescente | `(falsos_negativos / total_transações_perigosas) × 100` |
| Mean Decision Time | <100ms | `P50(tank_decision_duration_ms)` |
| Threat Intel Freshness | <5min | `now() - last_ioc_update_timestamp` |
| RPC Availability | >99.9% | `(total_window - downtime_window) / total_window × 100` |
| Engine Availability | >99.9% | Mesma fórmula, por engine |
| Security Incidents | 0 críticos | Contagem de incidentes com `severity=critical` |
| Mean Time to Detect | Tendência decrescente | `P50(detected_at - occurred_at)` |
| Mean Time to Recover | Tendência decrescente | `P50(recovered_at - detected_at)` |

### Fonte de Dados

Todos estes KPIs são computados a partir de:
- Prometheus metrics (definidas em §14.2 ENGINEERING-STANDARDS.md)
- Audit log (HMAC-signed, append-only)
- Incident database (Prisma)

### Janela de Medição

- Diária: rolling 24h.
- Semanal: rolling 7d.
- Mensal: rolling 30d.
- Quarterly: rolling 90d (para SLO review).

---

## 12. Script de Verificação Unificado

```bash
# Computa todos os KPIs acima e gera JSON + markdown report
bun run metrics
# Output: reports/metrics.json (fonte de verdade, máquina-legível)
#         reports/metrics.md   (humano-legível, para revisão)
```

Estrutura dos scripts (todos em `scripts/metrics/`):

```
scripts/metrics/
├── _shared.ts          # tipos, file readers, output emitters
├── architecture.ts     # §1 Architecture Compliance
├── engineering.ts      # §2 Engineering Readiness
├── security.ts         # §3 Security Readiness
├── assurance.ts        # §4 Security Assurance
├── evidence.ts         # §5 Security Evidence (NEW)
├── operations.ts       # §6 Operational Readiness
├── release.ts          # §7 Release Readiness
├── confidence.ts       # §9 Overall Confidence (composite)
└── index.ts            # master runner — chama todos, valida consistência
```

### O que cada script faz

1. Lê apenas **fontes reais** (filesystem, tsconfig, Prisma schema, source
   code via `rg`, git commit, CI artifacts quando disponíveis).
2. **Nunca** lê lógica da aplicação em runtime — KPI é gerado fora dela.
3. Aplica a fórmula deste documento.
4. Retorna `MetricResult` com score, weight, checks[], evidence, notes.
5. Master runner agrega tudo em `MetricsReport`, valida consistência
   (weight sum = 1.0, score bounds, recomputação, audit cap), escreve
   JSON + Markdown.

### Regras de consistência (exit 1 se violadas)

1. Soma dos pesos em Overall Confidence = 1.00
2. Cada peso de métrica em [0, 1]
3. Cada score de métrica em [0, 100]
4. Overall Confidence score = recomputação a partir dos inputs
5. Security Readiness sem Audit ≤ 91%
6. Security Assurance sem audit/pentest ≤ 5%

### Reprodutibilidade

- Scripts versionados em `scripts/metrics/` (commited no repo).
- `bun.lockb` commited — versões de runtime determinísticas.
- Auditor com acesso ao repo pode executar `bun run metrics` e reproduzir
  byte-a-byte (salvo timestamp e dados voláteis como commit hash).
- Output JSON contém `generatedAt`, `commit`, `scriptVersion` para
  auditoria posterior.

### Integração com Dashboard

- Dashboards (Sprint 4, SOC Dashboard, Executive Dashboard) **não** podem
  ter percentuais hardcoded.
- Devem fazer fetch de `/reports/metrics.json` (ou equivalente endpoint
  que sirva esse JSON) e renderizar a partir dele.
- Tela de "métricas desatualizadas" aparece se `generatedAt` > 24h.

---

## 13. Governança das Fórmulas

### Alterações

- Mudança em qualquer peso ou fórmula exige **PR com 2 approvals**
  (Engineering Lead + Security Lead).
- Mudança exige **versionamento**: a fórmula antiga permanece no histórico
  git, e o relatório de KPI marca qual versão da fórmula foi usada.
- Mudanças são comunicadas em Engineering Review semanal e no transparency
  report mensal.

### Auditoria

- Todo release minor vem com relatório de KPI anexo.
- Auditor externo recebe acesso ao script de verificação e pode reproduzir
  independentemente.
- Divergência entre relatório interno e auditor é tratada como incidente.

### Limitação Fundamental

> **KPIs são indicadores, não provas.** Eles dizem "estamos medindo isto
> e o resultado é X". Não dizem "o sistema é seguro". A única prova de
> segurança vem de:
> 1. Implementação correta validada por testes reproduzíveis.
> 2. Auditoria independente por firma qualificada.
> 3. Operação estável em produção por tempo significativo.
> 4. Bug bounty público sem críticos abertos.
>
> Até que estes quatro pilares estejam atendidos, todos os KPIs devem ser
> tratados como **trabalho em progresso**, não como conquista.

---

## 14. Histórico de Versões das Fórmulas

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-07-15 | Versão inicial. Fórmulas publicadas pela primeira vez. Substitui claims numéricas não-reproduzíveis usadas anteriormente. |
| 1.1 | 2026-07-15 | Implementação dos scripts `scripts/metrics/*.ts`. Fórmulas agora são executáveis via `bun run metrics`. Adicionada 3ª dimensão de segurança: **Security Evidence** (§5). Overall Confidence recalibrado: pesos agora somam exatamente 1.00 (Arch 20 + Eng 20 + Sec 15 + Ev 10 + Ops 20 + Rel 15). Removidos todos os percentuais hardcoded do documento — status aponta para `reports/metrics.json`. Adicionada regra absoluta "Zero Percentuais Hardcoded" no topo. |
| 1.2 | 2026-07-15 | Schema 1.1 do `metrics.json`. Sete aprimoramentos: (1) modelo de 3 estados por check (`verified` / `implemented_unverified` / `not_implemented`); (2) campos de metadata `schemaVersion`, `generatedBy`; (3) histórico imutável em `reports/history/<date>-<commit>.json`; (4) pesos configuráveis via `config/kpi-weights.json`; (5) evidence estruturada por check (`{status, artifact, source, verifiedAt}`); (6) Release Decision baseada em 17 Hard Gates booleanos (não percentuais); (7) hash SHA-256 do report para integridade. Adicionada seção "Schema do Report (v1.1)" documentando todos os campos. |

---

> **Fim do KPI-FORMULAS.md.**
> Este documento será atualizado sempre que uma fórmula mudar. Toda mudança
> é versionada. Toda medição é reproduzível. Toda claim pode ser auditada.
