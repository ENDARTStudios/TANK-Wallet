# STATUS-T076 — T076-vercel-recheck-pos-rate-limit — DONE (read-only, sem push)

**Data:** 2026-09-25
**Tarefa:** T076-vercel-recheck-pos-rate-limit (read-only por D080)

## Evidência crua

**Deployments (d26c91f):**
- Production `d26c91f` criado 2026-09-24T22:09:03Z → status `failure`
- Erro: `Deployment has failed — npx vercel inspect dpl_BP9boKec9fB6X3wLKF9hFMKiV97P --logs`

**Build log (via `vercel whoami` → sessão pré-existente `endartstudios`, read-only, sem token criado):**
- `install`: `bun install` OK (880 packages)
- `build`: `bun run build` → `next build` compila OK (36.5s) → falha em `Collecting page data` para `/_not-found`:
- `TypeError: Invalid URL, input: ''` em módulo SSR avaliado no prerender

**Causa raiz (código, não config):**
- `src/app/layout.tsx:19-22`: `const baseUrl = process.env.NEXTAUTH_URL ?? "https://tankwallet.dev"` + `metadataBase: new URL(baseUrl)`
- `??` não captura string vazia; com `NEXTAUTH_URL=""` no projeto Vercel → `new URL("")` → `ERR_INVALID_URL`
- Local passa porque `.env` local tem `NEXTAUTH_URL` não-vazio
- Não é rate limit, não é packageManager, não é Node, não é env var ausente no sentido de faltante — é valor vazio não tratado

## Correção proposta (NÃO aplicada — T076 é read-only)

```ts
const baseUrl = process.env.NEXTAUTH_URL?.trim() ? process.env.NEXTAUTH_URL : "https://tankwallet.dev";
```

Em tarefa de correção dedicada (novo branch/PR, com teste de `resolveBaseUrl` se extraído). Nenhum segredo envolvido.

## Métricas

Forense read-only, 0 pushes, 0 arquivos alterados por esta tarefa.

STATUS: DONE — aguardando tarefa de correção.
