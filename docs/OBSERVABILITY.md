# TANK Wallet — Error Reporting & Observabilidade

> Go-el: Sentry + OpenTelemetry + log retrieval + error boundary.
> Hoy: SDK instalado mas **não inicializado** (sem `instrumentation.ts`, sem DSN no `.env`). 

## 1. Diagnosticos

- `@sentry/nextjs@10.66` e `@opentelemetry/*` estão em `package.json`.
- `src/lib/observability/{sentry,tracing,logger,metrics}.ts` preenchidas; `initObservability()` **nunca é chamado** → tudo é no-op.
- Não existe `src/app/error.tsx`, `global-error.tsx` ou `not-found.tsx`.
- Absências de DS no `.env` → Sentry não envia.

## 2. Arquitetura de error

| Camada | Mecanismo | Propósito |
| --- | --- | --- |
| React (edge) | `error.tsx` + `global-error.tsx` (App Router) | Vibe de erro humano, sem estourar a app |
| React (edge) | `not-found.tsx` | Rotas inexistentes |
| API | `withErrorHandling` (wrapper de rota) | Log + máscara de segredo + resposta padronizada |
| Server | `sentryError(err, ctx)` | Envio estruturado (scope, metadata, service) |
| All | OTel tracer/metrics | Tracing + prometheus em `/api/metrics` |
| All | `logger.ts` | Log estruturado JSON (p/ stdout + export) |

## 3. Implementação (SPRINT-2)

```ts
// src/instrumentation.ts  (Next.js App Router)
import * as Sentry from "@sentry/nextjs";
import { initTracing } from "@/lib/observability/tracing";

Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, tracesSampleRate: 0.2 });
initTracing();
```

```tsx
// src/app/error.tsx
"use client";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset(): void }) {
  const message = process.env.NODE_ENV === "development" ? error.toString() : "Something went wrong.";
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <ErrorState message={message} onRetry={reset} />
  );
}
```

## 4. Regras de log

- Log estruturado JSON: `{ ts, level, svc, traceId, msg, userId?, workspaceId? }`.
- **Máscara de segredo**: `DATABASE_URL`, `NEXAUTH_SECRET`, tokens, DSN → `***`.
- Nunca logar chaves privadas, mnemonics, calldata completo (só hash).
- Rotas: sempre `traceId` (OTel) na resposta `X-Request-Id` para correlação.

## 5. Playbook de produção (prova)

- [ ] Falhar 1 ação crítica (falha de API/throws) → o Sentry recebe o instante com `traceId`.
- [ ] O `Retry` do `error.tsx` reseta sem recarregar a página.
- [ ] Log no dashboard mostra o usuário + workspace (não o segredo).
- [ ] `/api/health` indica observabilidade ativa.

## 6. Gate de deploy

- Build falha se `Sentry.init`/`OTel` não aparecem no scaffold (ver `scripts/verify/`).
- PR de feature obrigatório com `captureException` coberto.
