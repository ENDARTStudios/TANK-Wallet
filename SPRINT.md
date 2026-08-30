# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 38 — Monetização Stripe (stub + webhook)

**Objetivo:** billing stub + webhook route.

**Issues mãe:** novas #83, #84

### Tarefas

#### T1 — Stripe client (ALTO)
- **Arquivos:** `src/lib/billing/stripe.ts` (novo), `src/lib/billing/__tests__/stripe.test.ts` (novo)
- **Ações:**
  - `stripe.ts`: `createCheckoutSession`, `verifyWebhookSignature` (HMAC-SHA256)
- **Critério:** `bun test stripe` 3 pass

#### T2 — Webhook route (MÉDIO)
- **Arquivos:** `src/app/api/billing/webhook/route.ts` (novo)
- **Ações:**
  - `POST /api/billing/webhook` com verify sig
- **Critério:** `tsc:0`

### Definição de pronto (DoD)
- [ ] 3 arquivos + 3 pass
- [ ] `tsc:0`
