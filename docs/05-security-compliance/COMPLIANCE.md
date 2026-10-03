# COMPLIANCE — Conformidade Legal e Regulatória

> **Tipo:** Governança · **Atualizado:** 2026-09-30 · Dono: ENDARTStudios · Jurisdição primária: Brasil (LGPD) · Secundária: EU (GDPR).
> **Status:** 🔴 **NÃO APROVADO** como "LGPD compliant" — ver [LEGAL-AUDIT-2026-09-29.md](LEGAL-AUDIT-2026-09-29.md) (27 achados, 8/8 alegações técnicas confirmadas) e re-auditoria pós-PR #95: [LEGAL-REAUDIT-2026-09-30.md](LEGAL-REAUDIT-2026-09-30.md) (runtime inalterado; próximo marco = correção verificável de SEC-001/SEC-002/§25/§7 + re-auditoria).

## 1. Privacidade de dados

### Princípios aplicados
- **Minimização:** o servidor nunca guarda chave privada, mnemonic ou calldata completo (só hash) — ver [PRD.md](PRD.md) não-objetivos.
- **Purpose limitation:** dados de telemetria servem segurança do usuário, não publicidade.
- **Zero third-party trackers:** budget third-party = 0 ([PERFORMANCE.md](PERFORMANCE.md)); analytics é first-party.

### Implementação técnica
| Requisito | Implementação |
| --- | --- |
| "PII em repouso cifrada" | ✅ **CORRIGIDO (SEC-002, issue #98):** `src/lib/crypto/pii.ts` agora usa **AES-256-GCM** real (`pii:v2:`, IV CSPRNG, auth tag); decrypt do formato legado mantido p/ migração. Antes era XOR custom com IV de `Math.random()` |
| Máscara em logs | `src/lib/observability/redact.ts` (tokens/emails/private keys) |
| Segregação por tenant | RLS Postgres + `filterByWorkspace` ([RLS.md](RLS.md)) |
| Log de acesso imutável | `PermissionAuditLog` (DB, HMAC chain) — ⚠️ o audit log client-side em localStorage (`wallet-engines/audit/`) é apenas tamper-evident (LEG-019) |
| Páginas legais | `src/app/privacy/` e `src/app/terms/` |
| Hash de senha | ✅ **CORRIGIDO (SEC-001, issue #98):** `src/lib/auth/password.ts` (scrypt OWASP) + upgrade transparente de legados no login (`nextauth.ts`). Antes comparava texto puro |
| Segredo de sessão | ✅ **CORRIGIDO (§25, issue #98):** fail-fast em produção sem `NEXTAUTH_SECRET` (recusa placeholder); fallback só em dev |
| Aceite legal | ✅ **CORRIGIDO (§7/§9, issue #98):** `User` persiste `termsAcceptedAt/Version` + `privacyAcceptedAt/Version`; rota `POST /api/auth/consent` grava server-side (além do localStorage client-side existente) |

### Direitos do titular (LGPD art. 18 / GDPR art. 15-22)
- Acesso/portabilidade: dados da conta e logs de permissão exportáveis — ⚠️ **declarado mas não implementado (LEG-007)**.
- Exclusão: exclusão de conta remove PII; retenção mínima de logs de segurança pelo prazo legal, anonimizada.
- DPO/contact: ⚠️ **NÃO identificado publicamente** em `src/app/privacy/` (confirmado na auditoria, LEG-006) — nomeação e publicação do Encarregado pendentes.

## 2. Criptoatividades (aviso)

O TANK Wallet é **autocustodial**: o usuário é o único detentor das chaves. Nada aqui é aconselhamento financeiro. A interface e o conteúdo ([CONTENT.md](CONTENT.md)) devem deixar claro que perda de senha/mnemonic = perda de fundos, sem recuperação custodial.

## 3. Exportação e uso de criptografia

Uso de criptografia de uso geral (AES, ECC, Ed25519) em produto de consumo — sem restrição de exportação aplicável conhecida, mas **confirmar com advogado antes de distribuir em novas jurisdições**. Incluir aviso no `NOTICE` quando aplicável.

## 4. Licenças e propriedade

- Licença do projeto: ver `../LICENSE` (Copyright © 2026 END ART Studios) e `../NOTICE`.
- Dependências: SBOM CycloneDX gerado e assinado a cada release (`.github/workflows/sbom-cyclonedx.yml`); Trivy verifica licenças/vulnerabilidades.
- **Proibido** adicionar dependência copyleft sem ADR aprovando o impacto de licença.

## 5. Auditorias e certificações

| Item | Estado |
| --- | --- |
| Audit package externo | Pronto (`docs/05-security-compliance/audit-package/`) — Audit #1 a commissionar |
| Engagement Trail of Bits | `audit-config/trail-of-bits-engagement.md` |
| Findings tracker | `audit-config/findings-tracker.md` (status/SLA/PR) |
| Pentest | Pendente |
| SOC2/ISO | Não iniciado — avaliar quando entrar Enterprise em volume |

## 6. Divulgação de vulnerabilidades

Política em `../SECURITY.md`; bug bounty em `../BUG-BOUNTY.md` (report: security@tankwallet.dev com PGP). Hall of fame em `security/hall-of-fame.md`.

## 7. Instruções de atualização

1. Nova jurisdição de atuação → revisar §1/§3 com assessoria jurídica.
2. Novo tipo de dado pessoal coletado → atualizar privacy page + tabela §1 (implementação) + LGPD base documental.
3. Mudança de licença/dependência copyleft → ADR + atualização de §4.
