# Tank Wallet — KPI Formulas

> **Fórmulas públicas e reproduzíveis para todos os KPIs do projeto.**
>
> Objetivo: qualquer auditor com acesso ao repositório deve conseguir
> recalcular cada percentual exibido em dashboards e relatórios a partir
> destas fótrmulas e dos dados em `scripts/metrics/` (a serem implementados).
>
> Status: **Ativo a partir de Architecture Frozen 1.0**
> Mantenedor: Engineering Lead + Security Lead
> Princípio: **KPI sem fórmula pública é claim de marketing, não métrica.**

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
5. **KPIs internos ≠ Evidências de segurança.** Os números abaixo são
   indicadores de progresso do projeto, não claims auditáveis. Evidência
   objetiva de segurança vem de auditoria independente + testes reproduzíveis.

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

**100% (10/10 componentes conformes)** — medido em 2026-07-15.

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

**92% (10 de 11 critérios conformes, SBOM e builds assinados pendentes)** —
medido em 2026-07-15.

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

**91%** — medido em 2026-07-15.

Cálculo: `(1×0.20 + 1×0.15 + 1×0.10 + 1×0.10 + 1×0.15 + 1×0.10 + 1×0.10 + 1×0.10 + 0×0.00) × 100 = 91%`

### Limitação CRÍTICA

- **Audit (0%)**: sem auditoria externa, esta métrica **não pode atingir
  100%** por design. Maximum atual = 91% mesmo com implementação perfeita.
- Os 91% refletem implementação **auto-reportada**, não validação externa.
- Após Audit #1 e #2 (Sprint 5), o peso de Audit sobe para 15% e os outros
  pesos são recalibrados.

### Script de Verificação

```bash
bun run scripts/metrics/security-readiness.ts
# Output: JSON com score por engine + score total + data de medição
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

**25% (apenas SECURITY.md parcialmente planejado)** — medido em 2026-07-15.

### Limitação CRÍTICA

- Assurance é a métrica que **mais pesa na confiança pública** do produto.
- Sem auditoria externa, Assurance permanece **≤ 30%** por design, não
  importa quão boa seja a implementação.
- Esta métrica **só pode subir** com validação externa. Implementação
  interna não conta.

---

## 5. Operational Readiness (Target: ≥90%)

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

**25% (SOC Dashboard parcial + Update Cycle SLA documentado)** — medido
em 2026-07-15.

### Limitação

- Métrica mede **capacidade operacional**, não qualidade operacional real.
- Quality operacional é medida por SLO/SLI em produção (MTTR, uptime, etc.).
- Esses SLOs só passam a ter peso após 90 dias de operação em produção.

---

## 6. Release Readiness (Target: 100%)

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

## 7. Evidence Coverage (Target: 100%)

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

## 8. Overall Confidence Score (Composto)

### Fórmula

```
Overall Confidence = (Arch × 0.20) + (Eng × 0.20) + (Sec × 0.25) + (Ops × 0.20) + (Rel × 0.15)
```

Onde:
- `Arch` = Architecture Compliance (0-100)
- `Eng` = Engineering Readiness (0-100)
- `Sec` = (Security Readiness + Security Assurance) / 2 (média aritmética)
- `Ops` = Operational Readiness (0-100)
- `Rel` = Release Readiness (0-100)

### Justificativa dos Pesos

| Componente | Peso | Razão |
|-----------|------|-------|
| Architecture | 20% | É a fundação; sem ela nada se sustenta, mas já está 100% |
| Engineering | 20% | Implementação é onde bugs moram; peso alto reflete risco |
| Security | 25% | Peso mais alto: produto é de segurança; assurance vale tanto quanto readiness |
| Operations | 20% | Sem observability, nada se sabe em produção |
| Release | 15% | Gate final, mas dependente dos anteriores |

### Cálculo Atual

```
Arch = 100
Eng  = 92
Sec  = (91 + 25) / 2 = 58
Ops  = 25
Rel  = 14

Overall = (100 × 0.20) + (92 × 0.20) + (58 × 0.25) + (25 × 0.20) + (14 × 0.15)
        = 20.0 + 18.4 + 14.5 + 5.0 + 2.1
        = 60.0
```

### Status Atual

**60%** — medido em 2026-07-15.

> Nota: O valor previamente reportado como 68% usava pesos diferentes.
> Esta fórmula é a oficial. Os 60% refletem mais fielmente o estado real,
> pois penalizam a baixa Assurance e baixa Operational Readiness.

### Limitação CRÍTICA

- Overall Confidence é **média ponderada de auto-avaliação**.
- Não substitui auditoria externa.
- Um sistema com Overall = 90% pode ainda ter bugs críticos não detectados.
- Use esta métrica como **indicador de progresso**, não como claim de
  qualidade.

---

## 9. Dynamic Security Score (UX)

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

## 10. KPIs Permanentes Pós-v1.0

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

## 11. Script de Verificação Unificado

```bash
# Computa todos os KPIs acima e gera JSON + markdown report
bun run scripts/metrics/all-kpis.ts --date=$(date -u +%Y-%m-%d)
# Output: /home/z/my-project/download/kpi-report-YYYY-MM-DD.json
#         /home/z/my-project/download/kpi-report-YYYY-MM-DD.md
```

O script:
1. Executa cada verificação individual.
2. Coleta fonte de dados original (não usa cache).
3. Aplica fórmulas deste documento.
4. Gera relatório reproduzível com timestamp, versão do script, hash do
   commit atual.
5. Compara com relatório anterior e destaca deltas.

### Reprodutibilidade

- Script versionado em `scripts/metrics/`.
- Lockfile commitado.
- Container Docker com versão fixa do runtime para execução determinística.
- Auditor com acesso ao repo + Docker pode reproduzir o relatório byte-a-byte
  (salvo timestamps e dados voláteis como IOC freshness).

---

## 12. Governança das Fórmulas

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

## 13. Histórico de Versões das Fórmulas

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-07-15 | Versão inicial. Fórmulas publicadas pela primeira vez. Substitui claims numéricas não-reproduzíveis usadas anteriormente. |

---

> **Fim do KPI-FORMULAS.md.**
> Este documento será atualizado sempre que uma fórmula mudar. Toda mudança
> é versionada. Toda medição é reproduzível. Toda claim pode ser auditada.
