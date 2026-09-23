# COMPLIANCE — Conformidade Legal e Regulatória

> **Tipo:** Governança · **Atualizado:** 2026-09-23 · Dono: ENDARTStudios · Jurisdição primária: Brasil (LGPD) · Secundária: EU (GDPR).

## 1. Privacidade de dados

### Princípios aplicados
- **Minimização:** o servidor nunca guarda chave privada, mnemonic ou calldata completo (só hash) — ver [PRD.md](PRD.md) não-objetivos.
- **Purpose limitation:** dados de telemetria servem segurança do usuário, não publicidade.
- **Zero third-party trackers:** budget third-party = 0 ([PERFORMANCE.md](PERFORMANCE.md)); analytics é first-party.

### Implementação técnica
| Requisito | Implementação |
| --- | --- |
| PII em repouso cifrada | `src/lib/crypto/pii.ts` (encryptPII/decryptPII) |
| Máscara em logs | `src/lib/observability/redact.ts` (tokens/emails/private keys) |
| Segregação por tenant | RLS Postgres + `filterByWorkspace` ([RLS.md](RLS.md)) |
| Log de acesso imutável | `PermissionAuditLog` com HMAC chain |
| Páginas legais | `src/app/privacy/` e `src/app/terms/` |

### Direitos do titular (LGPD art. 18 / GDPR art. 15-22)
- Acesso/portabilidade: dados da conta e logs de permissão exportáveis.
- Exclusão: exclusão de conta remove PII; retenção mínima de logs de segurança pelo prazo legal, anonimizada.
- DPO/contact: definido em `src/app/privacy/` ( manter atualizado).

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
| Audit package externo | Pronto (`docs/audit-package/`) — Audit #1 a commissionar |
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
