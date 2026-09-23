# ERROR_HANDLING — Tratamento de Erros

> **Tipo:** Engenharia · **Atualizado:** 2026-09-23 · Detalhe de telemetria: [OBSERVABILITY.md](OBSERVABILITY.md)

## 1. Princípios

1. **Erro é dado de produto:** toda falha crítica tem 1 alerta, 1 traceId, 1 dono (R4 do PRD).
2. **Usuário nunca vê stack trace** — vê mensagem humana + ação de recuperação.
3. **Erro de segurança nunca é silencioso** — entra no log imutável e no Risk Center.

## 2. Arquitetura de erro por camada

| Camada | Mecanismo | Propósito |
| --- | --- | --- |
| React (rota) | `src/app/error.tsx` | Boundary humano com Retry (`reset`) sem recarregar página |
| React (global) | `src/app/global-error.tsx` | Última linha antes do crash total |
| 404 | `not-found` | Rotas inexistentes |
| API | Wrapper `withErrorHandling` | Log + máscara de segredo + envelope padronizado |
| Domínio | `TankError` (tipado) | 19+ casos que eram `throw new Error` genérico |
| Server | `sentryError(err, ctx)` → Sentry com scope/traceId | Diagnóstico centralizado |
| Transversal | OTel trace + `X-Request-Id` | Correlação user↔log↔trace |

## 3. Contrato de resposta de erro da API

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Slow down.",
    "traceId": "01J...",
    "retryAfter": 30
  }
}
```

- HTTP corretos: `400` validação (zod) · `401` sem sessão · `403` sem permissão (RBAC) · `404` · `429` rate limit (com `Retry-After`) · `500` inesperado (sem stack, sem internals).
- **Sempre** incluir `traceId` (o mesmo do header `X-Request-Id`).

## 4. Regras de log

- Estrutura JSON: `{ ts, level, svc, traceId, msg, userId?, workspaceId? }`.
- **Máscara obrigatória** (`redactSecrets`/`redactObject`): `DATABASE_URL`, `NEXTAUTH_SECRET`, tokens, DSN, emails → `***`.
- **Nunca logar:** chaves privadas, mnemonics, calldata completo (só hash), PII sem criptografar.

## 5. Padrões de recuperação

| Cenário | Padrão |
| --- | --- |
| RPC falha | Failover automático entre 3 RPCs por chain |
| API externa (GoPlus/RDAP) fora | Degradar com heurísticas locais + estado "desconhecido" (azul), nunca bloquear indevidamente |
| Ação assíncrona do usuário | Skeleton → progresso → erro com **Retry** explícito |
| Webhook (Stripe) | Verificar assinatura antes de processar; falha → 400 + log com traceId |
| Erro em engine de segurança | **Fail-closed**: sem verificação, sem operação (FR-SEC-01) |

## 6. Teste

- E2E de erro: provocar falha de API (500) e asserir boundary + Retry (playbook em [OBSERVABILITY.md](OBSERVABILITY.md) §5).
- QA hostil inclui: campo vazio, texto gigante, duplo clique, sessão expirada, duas abas ([QA_TESTING.md](QA_TESTING.md)).

## 7. Instruções de atualização

1. Novo tipo de erro de domínio → estenda `TankError`, nunca `throw new Error` genérico.
2. Nova rota de API → use o envelope §3 e o wrapper de erro; teste o caminho de falha.
3. Novo caso de recuperação → tabela §5 no mesmo PR.
