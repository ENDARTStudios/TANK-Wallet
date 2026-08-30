# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 41 — CI YAML fixes + .gitleaks.toml

**Objetivo:** corrigir workflows com YAML inválido e configurar gitleaks.

**Issues mãe:** novas #89, #90

### Tarefas

#### T1 — release.yml fix (ALTO)
- **Arquivos:** `.github/workflows/release.yml` (atualizar)
- **Ações:**
  - Remover `Map keys must be unique` em line 97
- **Critério:** `bunx knip` não retorna erro YAML

#### T2 — restore-e2e.yml fix + gitleaks (MÉDIO)
- **Arquivos:** `.github/workflows/restore-e2e.yml` (atualizar), `.gitleaks.toml` (novo)
- **Ações:**
  - Remover `Nested mappings are not allowed` em line 29
  - `.gitleaks.toml` config base
- **Critério:** `bunx knip` limpo; gitleaks detecta

### Definição de pronto (DoD)
- [ ] 3 arquivos
- [ ] `tsc:0`
