# SECURITY_REVIEW — Review de Segurança

> **Tipo:** Segurança · **Atualizado:** 2026-09-23 · Políticas: `../SECURITY.md` · `../BUG-BOUNTY.md` · Gates: [SECURITY-GATE.md](SECURITY-GATE.md)

## 1. Postura

**Zero trust** — o produto É segurança; review de segurança aqui não é fase final, é o critério de existência do PR. Fail-closed: sem verificação, sem operação (FR-SEC-01).

## 2. Checklist obrigatório antes do merge (todo PR que toca lógica)

- [ ] **Autenticação/autorização:** `401` sem sessão; `403` sem permissão (RBAC).
- [ ] **Permissões/RBAC:** matriz respeitada ([RBAC.md](RBAC.md)) — viewer nunca assina.
- [ ] **Rotas:** nova `/api` tem zod + rate limit + envelope de erro.
- [ ] **Banco:** tenant via `workspace_id` + RLS/`filterByWorkspace` ([RLS.md](RLS.md)); query com `LIMIT`.
- [ ] **Inputs:** validação zod em toda borda (API, forms, env).
- [ ] **Segredos:** nenhum hardcoded/commitado; `.env` fora do git.
- [ ] **Upload/webhooks:** tamanho/tipo validado; webhook verifica assinatura (Stripe).
- [ ] **Injeção:** SQLi (Prisma parametrizado confirmado), XSS (JSON), SSRF (URLs de integração).
- [ ] **Criptografia:** lib auditável (noble/scure) ou vectors golden para implementação própria.
- [ ] **Sessão:** header de sessão + HSTS + CSP presentes.
- [ ] **IA/agent security:** prompt do assistente não vaza dados sensíveis.
- [ ] **Race condition:** operações concorrentes (revogação + lockdown simultâneos) testadas.
- [ ] **Config perigosa:** `next.config.ts` sem flag relaxada (`ignoreBuildErrors: false`).
- [ ] **Dependências:** Trivy/SBOM verde.
- [ ] **Teste "acessa o que não é seu":** conta alheia / rota admin / registro de outro / API sem sessão.

## 3. Gates automatizados (bloqueiam PR/release)

| Ferramenta | O que pega |
| --- | --- |
| Semgrep (SAST) | CWE, injeção, auth, misconfig |
| CodeQL | Análise profunda de fluxo |
| Gitleaks | Segredos no diff (`.gitleaks.toml` com allowlist) |
| Trivy + SBOM | Dependências vulneráveis |
| OWASP ZAP (`dast.yml`) | DAST baseline |
| Fuzzing (`fuzzing.yml`) | Robustez de entrada |
| Slither (`slither.yml`) | Análise de contratos |
| `bun run verify` | 11 checks internos (inclui secrets-scan) |
| Playwright `security.spec.ts` | Fluxos de segurança na UI |

## 4. Cadência de review

| Atividade | Frequência |
| --- | --- |
| Checklist §2 no PR | Todo PR de lógica |
| DAST completo (não só baseline) | Pré-release minor |
| Audit externa (Trail of Bits) | Engagement ativo (`audit-config/`) |
| Pentest externo | Antes de release major (pendente) |
| Bug bounty | Contínuo pós-lançamento (Immunefi) |
| DR/IR drill | Por release minor ([BACKUP_DR.md](BACKUP_DR.md)) |

## 5. Achados: classificação e SLA

| Severidade | Exemplo | SLA de correção |
| --- | --- | --- |
| Crítico | Chave/mnemonic vazando; bypass de RBAC | Imediato; hotfix |
| Alto | SSRF; rate limit ausente em rota de escrita | < 7 dias |
| Médio | Header faltando; info leak em log | < 30 dias |
| Baixo | UX de segurança confusa | Backlog |

Todo achado entra em `audit-config/findings-tracker.md` (status/SLA/PR). Achado externo: `security@tankwallet.dev` (PGP) → Hall of Fame.

## 6. Divulgação

- Coordenada: 90 dias ou patch disponível (o que vier primeiro) para achados externos.
- Público: advisory no changelog (`### Security`) + anúncio em `docs/security/`.

## 7. Instruções de atualização

1. Novo vetor de ataque aprendido (post-mortem, advisory de ecossistema): adicione ao checklist §2.
2. Novo gate no CI: linha na tabela §3 aqui + em [SECURITY-GATE.md](SECURITY-GATE.md).
3. Achado tratado: feche no findings-tracker com PR de referência.
