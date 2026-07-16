# Audit Package — Tank Wallet

> Pacote de auditoria para firms externas. Contém escopo, commit
> congelado, instruções de acesso, e referências de documentação.
>
> Status: **Prepared**
> Data: 2026-07-16
> Commit frozen: fdae6e35b22b

---

## Overview

Este pacote foi preparado para duas auditorias independentes:

1. **Audit #1 — Crypto + Key Management + Recovery**
   - Escopo: primitivos criptográficos, derivação de chaves, vault
     AES-256-GCM, Shamir Secret Sharing, SecureBuffer zeroização.
   - Foco: correção de implementação contra vetores oficiais.

2. **Audit #2 — Engines + Decision Pipeline + Event Bus**
   - Escopo: 16 security engines, SecurityDecisionPipeline, Event Bus,
     Policy engine, Permission engine, Audit HMAC chain.
   - Foco: lógica de decisão, fail-safe modes, tamper-evidence.

---

## Commit Frozen

```
Commit: fdae6e35b22b
SHA-256: 3d8639a6ca1e1ecb...
Date: 2026-07-15T23:59:38Z
Branch: main
```

Este commit é o ponto de partida para ambas as auditorias. Qualquer
mudança após este commit NÃO está no escopo da auditoria.

### Verificação de integridade

```bash
git clone https://github.com/ENDART/tank-wallet
cd tank-wallet
git checkout fdae6e35b22b
git log -1 --format='%H %s'
# Deve mostrar: fdae6e35b22b... [commit message]
```

---

## Documentação de referência

Auditors devem ler os seguintes documentos antes de iniciar:

### Arquitetura
- `ARCHITECTURE-FREEZE-1.0-BASELINE.md` — baseline congelada
- `ARCHITECTURE-FREEZE-CHANGELOG.md` — versionamento
- `.ai/decisions/ARCHITECTURE_DECISIONS.md` — 10 ADRs

### Engenharia
- `ENGINEERING-STANDARDS.md` — 17 seções de padrões
- `KPI-FORMULAS.md` — fórmulas e schema de métricas
- `PRODUCTION-CRITERIA.md` — 83 critérios de produção

### Governança
- `.ai/rules/CORE_RULES.md` — 10 regras absolutas
- `.ai/rules/CHANGE-CONTROL.md` — o que pode mudar na 1.x
- `.ai/rules/FROZEN-IDS.md` — IDs imutáveis
- `.ai/rules/ERROR-CATALOG.md` — ~70 códigos TANK-XXXX
- `.ai/rules/API-STABILITY-POLICY.md` — tags @stable/@experimental

### Segurança
- `SECURITY.md` — política de disclosure
- `BUG-BOUNTY.md` — programa de recompensas
- `NON-GOALS.md` — escopo explícito do que NÃO fazer

### Estado atual
- `reports/metrics.json` — KPIs atuais (Overall Confidence 65%)
- `reports/code-audit.md` — dívida técnica (0 findings)
- `reports/benchmarks.md` — performance baselines

---

## Estrutura do repositório

```
src/
├── lib/
│   ├── wallet-core/              ← Audit #1: BIP-39/32/44, SLIP-10, AES-256-GCM
│   │   ├── index.ts              ← Derivação de chaves
│   │   ├── storage.ts            ← Vault AES-256-GCM
│   │   ├── errors.ts             ← TankError + TANK-XXXX codes
│   │   └── __tests__/
│   │       ├── vectors/          ← 9 vector sets (BIP-32, BIP-39, etc.)
│   │       └── vectors.test.ts   ← 26 testes passing
│   │
│   ├── wallet-engines/           ← Audit #2: 12 engines
│   │   ├── key-management/       ← Audit #1: SecureBuffer, zeroização
│   │   ├── recovery/             ← Audit #1: Shamir SSS sobre GF(256)
│   │   ├── threat-intel/         ← Audit #2: GoPlus integration
│   │   ├── simulation/           ← Audit #2: eth_call + state diff
│   │   ├── policy/               ← Audit #2: 6 policies + 11 condições
│   │   ├── permission/           ← Audit #2: ERC-20/721/1155/Permit2
│   │   ├── behavior/             ← Audit #2: anomaly detection
│   │   ├── network/              ← Audit #2: RPC pool + failover
│   │   ├── audit/                ← Audit #2: HMAC chain tamper-evidence
│   │   │   ├── index.ts
│   │   │   ├── hmac-chain.ts     ← HMAC-SHA256 chain
│   │   │   └── __tests__/
│   │   │       └── hmac-chain.test.ts  ← 10 testes passing
│   │   ├── ai-security/          ← Audit #2: prompt injection detection
│   │   ├── plugin/               ← Audit #2: ChainPlugin interface
│   │   └── notification/
│   │
│   ├── wallet-kernel/            ← Audit #2: Security Kernel
│   │   ├── architecture-freeze.ts     ← Interfaces congeladas
│   │   ├── security-decision-pipeline.ts  ← Pipeline orquestrador
│   │   └── __tests__/
│   │       └── pipeline.test.ts  ← 7 testes passing
│   │
│   ├── wallet-evm/               ← Audit #1: EIP-1559 signing
│   ├── wallet-sovereignty/       ← Audit #2: Lockdown, permissions
│   ├── wallet-scanner/           ← Audit #2: Contract scanner
│   ├── wallet-plugins/           ← Audit #2: 4 chain plugins
│   │   ├── ethereum/
│   │   ├── bitcoin/
│   │   ├── solana/
│   │   ├── lightning/
│   │   └── conformance.ts        ← 11 testes × 4 plugins
│   │
│   ├── observability/            ← Audit #2: Logger, tracing, metrics
│   │   ├── logger.ts
│   │   ├── tracing.ts
│   │   ├── metrics.ts
│   │   └── sentry.ts
│   │
│   └── config/
│       └── feature-flags.ts      ← Audit #2: Free/PRO tier segmentation
│
├── components/wallet/security/   ← Audit #2: UI de segurança
│   ├── security-decision-modal.tsx
│   ├── engine-result-card.tsx
│   └── evidence-badge.tsx
│
└── app/api/                      ← Audit #2: API routes
    ├── goplus/                   ← GoPlus proxy
    ├── threats/                  ← Threat Intel DB
    ├── metrics/                  ← Prometheus endpoint
    └── whois/                    ← WHOIS lookup
```

---

## Como reproduzir

### Ambiente

```bash
# Requisitos
bun --version  # 1.3.14
node --version  # 20+

# Clone e checkout
git clone https://github.com/ENDART/tank-wallet
cd tank-wallet
git checkout fdae6e35b22b

# Instalar deps
bun install --frozen-lockfile

# Gerar Prisma client
bun run db:generate

# Rodar todos os gates
bun run verify

# Rodar testes criptográficos
bun test src/lib/wallet-core/__tests__/vectors.test.ts

# Rodar testes do pipeline
bun test src/lib/wallet-kernel/__tests__/pipeline.test.ts

# Rodar testes do HMAC chain
bun test src/lib/wallet-engines/audit/__tests__/hmac-chain.test.ts

# Ver KPIs atuais
bun run metrics
cat reports/metrics.json | jq '.metrics'
```

### Variáveis de ambiente necessárias

```bash
DATABASE_URL=file:./db/custom.db
# Opcionais (não bloqueiam auditoria):
# NEXT_PUBLIC_SENTRY_DSN=...
# OTEL_EXPORTER_OTLP_ENDPOINT=...
```

---

## Deliverables esperados dos auditores

1. **Audit Report** em PDF com:
   - Executive summary
   - Methodology
   - Findings classificados (Critical / High / Medium / Low / Informational)
   - Recommendations
   - Conclusion

2. **Re-test** após correção de findings (se houver).

3. **Certificate** de conclusão (para `SECURITY-CLAIMS.md` promoção para `Audited`).

---

## Contato

- **Engineering Lead**: engineering@tankwallet.dev
- **Security Lead**: security@tankwallet.dev
- **PGP**: ver `SECURITY.md`

---

## Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-07-16 | Versão inicial. Commit fdae6e35b22b congelado. |
