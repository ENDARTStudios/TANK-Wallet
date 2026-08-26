# TANK Wallet — Security (Gate de Deploy + WAF + Bot + Rate + TLS/HSTS)

> Alinhado a `ci.yml`, `release.yml`, `next.config.ts`, `Caddyfile`.
> Abordagem: zero-trust — nada é confiável por padrão.

## 1. Gate de deploy (auditoria de segurança)

Gate obrigatório em todo PR → sem verde, não merge. Já configurado no CI:

| Ferramenta | O que casa | Bloqueia PR? |
| --- | --- | --- |
| ESLint | Lint | Sim |
| `tsc --noEmit` | Tipagem | Sim |
| `bun test` | Unit + integración | Sim |
| `npm run audit:code` / `verify` | Regras internas | Sim |
| Semgrep | SAST (CWE, inyeção, auth, misconfig) | Sim |
| CodeQL | Análise profunda de fluxo | Sim |
| Gitleaks | Segredos (`.env`, API keys, tokens) | Sim |
| Trivy | Dependências vulneráveis (SBOM) | Sim |
| Cosign | Assinatura de imagem (OIDC keyless + Ed25519) | Em release |
| CycloneDX | SBOM assinado | Em release |

**Global:** este "gate" é a defesa de deploy. Novos fatores de SAST (ex: Strix `dast.yml`, Playwright security) entram aqui.

## 2. WAF + Bot-Defense + Rate Limiting (a implementar)

> Estado hoje: **não há** WAF, anti-bot nem rate limit nem no Caddy, na middleware nem nas rotas `/api/*`.

### 2.1 Defense em camadas

| Camada | Técnica |
| --- | --- |
| Edge (Caddy) | Header de sessão, bloquar `X-Forwarded-*` de cliente, limit de rate |
| App (middleware Next) | Rate limit (token bucket) por IP+rota; Header de sessão; esconder stack |
| API | Código HTTP estrito (4xx/5xx sem stack), input validation (zod) |
| Bot | Modo `monitor` (log) → `block` (rejeitar) |

### 2.2 Rate limiting (design)

```ts
// src/lib/security/rate-limit.ts (token bucket, in-memory ou Redis)
export async function rateLimit(req, { limit = 120, windowMs = 60_000 }) {
  const key = rateLimitKey(req);          // IP + rota canônica
  const { remaining, retryAfter } = bucket(key, limit, windowMs);
  if (remaining <= 0) return next(new HttpError(429, { retryAfter }));
  req.headers["X-RateLimit-Remaining"] = String(remaining);
}
```
- Padrão: `120 req/min` (configurável por `API_RATE_LIMIT_PER_MIN`).
- Rotas de escrita: limite mais baixo (ex. `30/min`).
- Resposta `429` com `Retry-After` + `X-RateLimit-*`.

### 2.3 Bot-Defense (modo WAF)

- `BOT_MODE=monitor`: loga sinais de bot (headless, UA suspeita, tắc sem `Sec-Fetch`) sem rejeitar.
- `BOT_MODE=block`: rejeita `403` do sinal identificado.
- Base: fingerprint de sessão + challenge de ownership (provável bot).

### 2.4 Caddy (edge) — referida

```caddy
:443 {
  tls internal
  encode gzip
  reverse_proxy localhost:3000 {
    header_down -Server
    header_down Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
  }
  # rate limit na edge (Caddy: módulo `reverse_proxy` + limit de taxa)
  @limit { rate_limit 120 1m }
  handle @limit { abort }
}
```

> Alternativa de edge: usar CDN/WAF (ex.: Cloudflare) com WAF + rate limit gerenciados; Caddy local também emite `HSTS` + `encode`.

## 3. TLS/SSL + HSTS (Full/Strict)

### problema hoje
- `Caddyfile` é só `:81` (HTTP puro, sem TLS e sem HSTS).
- `next.config.ts` não emite `Strict-Transport-Security`.

### Correção
1. **TLS na edge (Caddy):** `tls` com certificado (Let's Encrypt ou self-signed em staging). `http → https` 301.
2. **HSTS:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (1 ano).
3. **next.config.ts:** também emití o header na app (defesa em profundidade):

```ts
{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
{ key: "X-Content-Type-Options", value: "nosniff" },        // já existe
{ key: "X-Frame-Options", value: "DENY" },                 // já existe
{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // já existe
{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }, // já existe
```

4. **Preload:** submeter o domínio à HSTS preload list (após operação estável).
5. **Verificação:** `curl -sI https://...` contém header HSTS + TLS 1.2/1.3 sem ciphers fracas.

## 4. Critical & remediation (checklist de imediato)

| # | Critério | Ação | Sprint |
| --- | --- | --- | --- |
| 1 | `.env` versionado | `git rm --cached` + rotação | SPRINT-1 |
| 2 | Chave PGP privada no repo | rodar + rotação | SPRINT-1 |
| 3 | Sem HSTS | Caddy + next.config | SPRINT-1 |
| 4 | Sem rate limit em `/api` | `rate-limit.ts` + middleware | SPRINT-4 |
| 5 | Sem WAF/bot | Caddy + `BOT_MODE` | SPRINT-4 |
| 6 | `reactStrictMode: false` | Habilitar (reveja side-effects) | SPRINT-4 |
| 7 | `typescript.ignoreBuildErrors: true` | Desabilitar + ajustar build | SPRINT-4 |
