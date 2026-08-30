# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 34 — COSIGN image signing + SBOM CycloneDX

**Objetivo:** release.yml com cosign keyless + SBOM assinado.

**Issues mãe:** novas #75, #76

### Tarefas

#### T1 — COSIGN workflow (ALTO)
- **Arquivos:** `.github/workflows/cosign.yml` (novo)
- **Ações:**
  - Workflow: build image, cosign keyless sign, attach SBOM
- **Critério:** workflow versionado

#### T2 — SBOM CycloneDX step (MÉDIO)
- **Arquivos:** `.github/workflows/sbom-cyclonedx.yml` (novo)
- **Ações:**
  - Workflow: gerar SBOM CycloneDX, attach ao GHCR release
- **Critério:** workflow versionado

### Definição de pronto (DoD)
- [ ] 2 workflows
- [ ] `tsc:0`
