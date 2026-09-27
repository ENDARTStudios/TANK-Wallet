# Tank Wallet — Architecture Freeze 1.0

**Data do congelamento:** 14 de Julho de 2026
**Estado:** PERMANENT — núcleo da plataforma
**Próxima revisão:** Architecture Freeze 2.0 (apenas quando contrato arquitetural precisar mudar)

---

## Estado da Arquitetura (Núcleo Permanente)

| Componente | Versão | Status |
|------------|--------|--------|
| Security Kernel | 1.0.0 | FROZEN |
| Security Governance Layer | 1.0.0 | FROZEN |
| Tank Security Standard (TSS) | 1.0 | FROZEN (10 specs, 80% enforced) |
| Tank Security Framework (TSF) | 1.0 | FROZEN (7 domínios) |
| 16 Security Engines | Individual SemVer | FROZEN interfaces |
| Blockchain Plugin System | 1.0.0 | FROZEN interface |
| Security Event Bus | 1.0.0 | FROZEN (16 event types) |
| Unified Data Model | 1.0.0 | FROZEN (15 objetos centrais) |
| Decision Engine | 1.0.0 | FROZEN (evidence-based) |
| Architecture Freeze 1.0 | 1.0.0 | ACTIVE |

---

## Contratos Congelados (NÃO MUDAR)

Os seguintes contratos estão congelados definitivamente. Mudanças requerem Architecture Freeze 2.0:

1. `SecurityEngine` interface (initialize/evaluate/explain/health/manifest/shutdown)
2. Event Bus contracts (16 typed events)
3. Unified Data Model (SecurityContext, SecurityResult, SecurityDecision, etc.)
4. DecisionResult schema (decision, confidence, score, evidence[], engineResults[])
5. Threat schema (THR-XXXX, ATT&CK/CWE/CVE mapping, IOCs, coverage)
6. Policy schema (id, condition, action, priority, enabled)
7. Trust schema (entityType, identifier, score, level, sources)
8. Audit schema (HMAC-signed, tamper-evident chain)
9. Plugin manifest (capabilities, requires, family, implemented)
10. Capability manifest (id, version, capabilities[], requires[], maturity, failSafe)
11. 4-Layer separation (UI → Kernel → Engines → Plugins)
12. Single Decision Flow (12-step pipeline, no alternative paths)
13. 5 Security Levels (L0 Normal → L4 Fortress)
14. Fail-Safe Modes (11 engines with declared failure behavior)
15. Performance Budget (10 measurable targets)

---

## O que PODE Evoluir (Dentro da Arquitetura Existente)

### Threat Intelligence
- Novas ameaças no Threat Registry (THR-XXXX)
- Novos IOCs
- Novos CVEs
- Novas heurísticas de detecção
- Novos feeds (TRM Labs, Elliptic, Blockaid, SlowMist, OpenPhish, VirusTotal, AbuseIPDB)

### Plugins
- Novas redes: Cardano, Cosmos, Near, Starknet, zkSync, Linea, Hyperliquid, Monad, Berachain
- Apenas implementando a interface `ChainPlugin`

### Policies
- Novas regras no Policy Registry
- Sem alterar o Kernel

### AI Models
- O AI Security Engine pode trocar de modelo sem alterar nenhuma interface

---

## O que NÃO Deve Mudar

Mudanças nos contratos congelados são reservadas para Architecture Freeze 2.0.

---

## Estrutura Recomendada do Repositório (Monorepo)

```
apps/
  wallet/

packages/
  security-kernel/
  governance/
  engines/
    key-management/
    network/
    simulation/
    threat-intel/
    behavior/
    policy/
    permission/
    notification/
    audit/
    recovery/
    device-trust/
    ai-security/
    signature/
    guardian/
  plugins/
    ethereum/
    bitcoin/
    solana/
    lightning/
    sui/
    aptos/
  registries/
    policies/
    threats/
    trust/
    plugins/
    features/
  shared/
    models/
    events/
    crypto/
    types/
```

---

## Prioridade de Execução Pós-Freeze

1. Implementar completamente os 16 engines
2. Substituir todos os mocks por integrações reais
3. Atingir a cobertura de testes definida para cada engine (≥95% Production, ≥70% Beta)
4. Executar fuzz testing dos componentes criptográficos e parsers
5. Realizar auditorias externas independentes (mín. 2)
6. Implantar pipeline de builds reproduzíveis, SBOM e assinatura de releases
7. Executar programa de bug bounty antes do lançamento público

---

## Engine Maturity Snapshot (no momento do freeze)

| Engine | Versão | Maturidade | Fail-Safe |
|--------|--------|-----------|-----------|
| Key Management | 2.0.0 | Production | Bloquear carteira |
| Network | 1.5.0 | Production | Modo degradado |
| Audit | 1.2.0 | Production | Bloquear ações críticas |
| Governance | 1.0.0 | Production | Último snapshot válido |
| Simulation | 2.0.0 | Beta | Bloquear transações |
| Threat Intel | 2.3.1 | Beta | Permitir com aviso |
| Behavior | 1.8.0 | Beta | Modo padrão |
| Policy | 1.4.2 | Beta | Deny-all |
| Permission | 1.3.0 | Beta | Tratar como críticas |
| Notification | 1.1.0 | Beta | Silenciar |
| Plugin | 1.0.0 | Beta | Desabilitar chain |
| Device Trust | 1.0.0 | Beta | Reduzir confiança |
| Signature | 1.0.0 | Beta | Bloquear assinatura |
| Guardian | 1.0.0 | Beta | Alertar |
| Recovery | 1.0.0 | Alpha | Bloquear recuperação |
| AI Security | 0.9.0 | Alpha | Permitir com aviso |

---

## v1.0 Completion Criteria

| Critério | Status |
|----------|--------|
| Interfaces congeladas | ✓ DONE |
| Registries versionados | ✓ DONE |
| TSS/TSF cobertura documentada | ✓ DONE |
| Conformance tests | PLANNED |
| 2 auditorias independentes | PLANNED |
| Pentest aprovado | PLANNED |
| Builds reproduzíveis | PLANNED |
| Cadeia de dependências validada | IN PROGRESS |
| Política de divulgação de vulns | PLANNED |
| Bug bounty | PLANNED |

**Progresso: 30% (3/10)**

---

## Princípio Final

O maior ganho de segurança daqui em diante virá da **qualidade da implementação**, da **validação criptográfica**, dos **testes automatizados** e das **auditorias independentes** — e não da criação de novos componentes estruturais.

A Tank Wallet é uma plataforma de segurança para ativos digitais, não uma carteira com recursos de segurança. Essa distinção orienta todas as decisões técnicas e de produto daqui em diante.
