# Tank Wallet — Worklog Compartilhado

> Log append-only de trabalho multi-agente. Cada agente (main ou subagent)
> deve ler este arquivo antes de iniciar qualquer tarefa e appendar seu
> próprio registro ao concluir.

---

Task ID: 0
Agent: main (Super Z)
Task: Receber avaliação do usuário sobre Architecture Frozen 1.0 e produzir
documentos normativos para a fase de engenharia (sem adicionar componentes
arquiteturais novos).

Work Log:
- Lido `/home/z/my-project/ARCHITECTURE-FREEZE-1.0-BASELINE.md` para confirmar
  estado congelado e governança de 3 estados.
- Lido `/home/z/my-project/ARCHITECTURE.md` para histórico da Phase 1 + 2.
- Lido `/home/z/my-project/package.json` para confirmar stack (Next.js 16,
  viem, @noble/*, @scure/*, bitcoinjs-lib, Prisma).
- Iniciado `worklog.md` compartilhado (este arquivo).
- Escrito `/home/z/my-project/ENGINEERING-STANDARDS.md` (17 seções):
  - Convenções de código (TS strict, sem `any`, sem `console.log`).
  - Definição de APIs (zod validation, erros tipados, versionamento).
  - Versionamento SemVer + Conventional Commits + versionamento por artefato.
  - Critérios de testes (10 camadas: unit, property, fuzz, snapshot,
    integration, E2E, regression, conformance, compatibility, memory, chaos).
  - Tratamento de erros (TankError base, fail-safe modes).
  - Política de logging (JSON estruturado, níveis, PII redlines).
  - Requisitos de performance (orçamento congelado, benchmarks, sem regressão
    >10%).
  - Política de dependências (allowlist, critérios de aceitação, SBOM,
    Renovate, audit contínuo).
  - Checklist obrigatório de PR (8 categorias, ~50 itens).
  - Definition of Done (feature, bug fix, refactor, release).
  - Scanners contínuos (Semgrep, CodeQL, Trivy, Gitleaks, Dependabot).
  - Criptografia — vetores oficiais obrigatórios (BIP-39, BIP-32, SLIP-10,
    secp256k1, Ed25519, AES-GCM, HKDF, PBKDF2, HMAC, SHA-256, Shamir SLIP-39,
    EIP-1559, EIP-712, EIP-191).
  - RPC reais (matriz por chain, quorum, circuit breaker, próprio nó).
  - Observabilidade stack (Pino + Prometheus + OTel + Sentry + Uptime).
  - Auditorias independentes (plano Sprint 5: 2 audits + 2 pentests + bug
    bounty + SECURITY.md).
  - Governança do documento (2 approvals, ADR para breaking, exceções com
    prazo).
- Escrito `/home/z/my-project/KPI-FORMULAS.md` (13 seções):
  - Architecture Compliance = componentes conformes / total (100% atual).
  - Engineering Readiness = soma ponderada de 11 critérios (92% atual).
  - Security Readiness = soma ponderada de 9 engines (91% atual, Audit
    bloqueado em 0% até Sprint 5).
  - Security Assurance = soma ponderada de 7 itens de validação externa
    (25% atual, max 30% sem auditoria).
  - Operational Readiness = soma ponderada de 10 itens operacionais
    (25% atual).
  - Release Readiness = soma ponderada de 11 itens (14% atual).
  - Evidence Coverage = decisões com evidência / total (92% atual).
  - Overall Confidence = média ponderada: Arch 20%, Eng 20%, Sec 25%,
    Ops 20%, Rel 15% (60% atual — recalibrado de 68% anterior).
  - Dynamic Security Score (UX) = 100 - risco ponderado em 7 componentes,
    mapeado para Posture (NORMAL/ELEVATED/FORTIFIED/LOCKDOWN).
  - KPIs permanentes pós-v1.0 (Decision Accuracy, FPR, FNR, MTTD, MTTR,
    RPC Availability, etc.).
  - Script de verificação unificado (`scripts/metrics/all-kpis.ts`).
  - Limitação fundamental: KPIs são indicadores, não provas.

Stage Summary:
- Arquitetura permanece congelada em Architecture Frozen 1.0. Nenhum
  componente novo foi adicionado (em conformidade com a Governance Rule
  do baseline).
- Naming "Architecture Frozen 1.0" já era a oficial; alinhada com a
  recomendação do usuário.
- KPIs que antes eram claims numéricas agora têm fórmula pública, peso
  declarado, fonte de dados e script de verificação reproduzível.
- Overall Confidence recalibrado de 68% para 60% (fórmula pública aplicada).
- Próximos passos definidos para Sprint 4 (CI/CD, SBOM, SAST/DAST, signing)
  e Sprint 5 (auditorias, pentest, bug bounty, SECURITY.md).
- Documentos produzidos:
  - `/home/z/my-project/ENGINEERING-STANDARDS.md` (normativo, ~25KB)
  - `/home/z/my-project/KPI-FORMULAS.md` (fórmulas públicas, ~20KB)
  - `/home/z/my-project/worklog.md` (este log compartilhado)

---
