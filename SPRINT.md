# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 54 — Production Readiness + Release Signing

**Objetivo:** pipeline de release seguro e reproduzível com SBOM e assinatura.

**Issues mãe:** novas #114, #115

### Tarefas

#### T1 — Release Signing (ALTO)
- **Arquivos:** `.github/workflows/release.yml`, `Dockerfile`
- **Ações:**
  - Validar `release.yml` cosign keyless + Ed25519 + SBOM assinado
- **Critério:** `release.yml` verde em `main`

#### T2 — SBOM Verification (MÉDIO)
- **Arquivos:** `reports/sbom.cyclonedx.json`, `scripts/verify/check-signatures.ts`
- **Ações:**
  - Verificar SBOM assinado em `reports/`
- **Critério:** `bun run verify` 11/11 ✅

### Definição de pronto (DoD)

- [ ] `release.yml` validado
- [ ] `verify` 11/11
- [ ] `tsc:0`
