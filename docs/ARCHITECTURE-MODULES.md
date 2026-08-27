# TANK Wallet — Arquitetura Modular + Feature Flags

> Alinhado a `ARCHITECTURE.md`, `src/lib/wallet-*` e `feature-flags.ts`.

## 1. Princípio

Divisão em **módulos verticais (features)** com fronteira clara: cada módulo tem `lib` (lógica pura), `api` (se precisar de rota) e `ui` (componentes). Comunicação entre módulos só por contrato/interface — nunca import protegido.

## 2. Catálogo de apps / módulos

| Módulo | Caminho (lib) | UI (componentes) | API | Estado |
| --- | --- | --- | --- | --- |
| Kernels cripto | `wallet-core` | `onboarding/` | — | Ativo |
| EVM RPC + signer | `wallet-evm` | `send`, `receive` | — | Ativo |
| Threat Intel | `wallet-threat-intel`(16 engines) | `risk-center`, `scanner` | `/api/threats/*`, `/api/goplus/*`, `/api/whois` | Ativo |
| Scanner/DApp Shield | `wallet-scanner` | `scanner`, `dapps-view` | `/api/whois` | Ativo |
| Soberania | `wallet-sovereignty` | `sovereignty/`, `lockdown` | — | Ativo |
| Engine guard | `wallet-guardian`/`eng-012-wallet-guardian` | `dashboard` | — | Ativo |
| Simulação | `wallet-simulation`/`eng-003` | `send` | — | Ativo |
| Recuperação | (prisma `RecoveryContact`) | `settings` | `/api/recovery`(futuro) | Planejado |
| Admin (RBAC) | `wallet-admin`(futuro) | `admin/`(futuro) | `/api/admin/*`(futuro) | Planejado |
| Observabilidade | `observability/` | — | `/api/metrics`, `/api/health` | Ativo (não ligada) |

## 3. Estrutura de referência (target)

```
src/
  features/
    threat-intel/        # lib + hooks + components + __tests__
    sovereignty/
    scanner/
    send/
    ...
  lib/
    wallet-*/            # núcleo imutável (hoje)
    config/feature-flags.ts
    observability/
  app/api/ ...           # rotas finas por feature
```

> Nota: hoje as features vivem em `src/lib/wallet-*` + `src/components/wallet/*`. A migração para `src/features/*` é **refator proposta** (risco MÉDIO, ganho de manutenibilidade) — veja ISSUES backlog (refator modular).

## 4. Feature flags — design

Duas ortogonais (implementar em `feature-flags.ts`):

### 4.1 By tier (recursos comercial) — **já existente**
`PLAN_DEFINITIONS[tier].features` → `filterEnginesByPlan()`. Mantece.

### 4.2 By feature (rolo para release) — **a seguir**
```ts
type FeatureFlagKey =
  | "owl_behavior"      // engine IA (Phase 8)
  | "launch_recovery"   // social recovery (Phase 7)
  | "seed_admin"        // painel RBAC
  | "seed_bot_mode";    // modo WAF/bot
```

```ts
export interface FeatureFlags { [k: FeatureFlagKey]: boolean }
// Fonte de verdade: env > banco (override) > default
export function isFeatureOn(flag: FeatureFlagKey, ctx: PlanCtx): boolean { ... }
```

Regras de engenharia:
1. Flag roda **off** (default) em desenvolvimento; é lida de env em produção.
2. Lançamento shadow: todo módulo novo entra com `flag=false` + `monitor` antes de `active`.
3. Descontinuar só após 2 sprints sem uso; remover com PR de limpeza (ver AGENTS — skill Limpeza).

## 5. Regras de fronteira (contratos)

- UI consome o estado via `wallet-context.tsx` (context) — nada monta de fora.
- API por feature: agregada em `module/router.ts` → handler.
- Fronteira: proibido `import` de órgão de uma feature dentro do código de outra (validar em `scripts/verify/`).
- Teste: cada feature tem `__tests__` + E2E essencial (ver `docs/TESTING.md`).

## Pré-condições de segurança

- Toda nova feature com escrita → carrega `workspaceId` (RLS).
- Toda nova rota `/api` → rate-limit + validação (ver `docs/SECURITY-GATE.md`).
