# Load Testing Runbook (T091)

## Escopo

k6 contra **ambiente local próprio** (`bun run dev`, 1 processo dev-mode).
**PROIBIDO** contra produção/previews (muro SSO invalida medição + quota + ética).

## Scripts (`scripts/k6/`)

| Script | Alvo | Forma | Threshold |
|---|---|---|---|
| `health.js` | GET /api/health | 1VU/10s, sleep 0.2 | p95<100ms, failed<1% |
| `risk.js` | GET /api/risk (header member) | 1VU/10s, sleep 0.2 | p95<100ms, failed<1% |
| `broadcast.js` | POST /api/broadcast corpo **inválido** | 1VU/10s, sleep 0.7 | checks>99%, p95<100ms |
| `rate-limit.js` | GET /api/health rajada 10VU/10s | controle positivo | checks>90% (200/429 c/ Retry-After) |

Regra de threshold: p95 < 4× baseline medido (dev-mode tem variância; números em
`reports/load/baseline.json`).

## Por que pacing (importante)

O proxy impõe budget por chave (T083 + T098): anônimos por IP (reads 120/min, writes
30/min); autenticados por userId via JWT validado (CGNAT-safe); monitoria (`/api/health`)
em bucket próprio 600/min fora do budget de negócio. Shapes acima do budget tomam
**429 por desenho** (medido: 1171×429 vs 120×200 a 10VU). Isso NÃO é instabilidade —
é enforcement. Header-identity (x-user-id, usada pelo k6) NÃO alimenta o keying do proxy
(anti-spoofing) — baselines k6 medem o caminho anônimo/IP. Load além do budget exige
múltiplos IPs ou janela própria (nunca em produção sem decisão).

## Por que broadcast só com corpo inválido

Corpo válido alcançaria `broadcastTx` (RPCs externos, gasto real, risco de
broadcast). O script mede a pilha auth+zod+headers (400 esperado) e nunca
transmite. Não alterar sem revisão de segurança.

## Por que risk só GET

POST /api/risk chama agregador com provedores externos (GoPlus etc.) — queimaria
quota de terceiros. GET mede auth+rota sem efeitos externos.

## Rodar

```
bun run dev            # terminal 1 (esta branch)
bun run test:load      # terminal 2: smoke dos 4 scripts
k6 run -u 10 -d 60s scripts/k6/health.js   # baseline (dentro do budget? NÃO — ver teto)
```

`bun run test:load` = health + risk + broadcast + rate-limit em sequência.

## Cenário autenticado (T101, quita dívida D100)

```bash
K6_TOKENS=$(bun scripts/k6/gen-dev-tokens.ts) k6 run scripts/k6/authenticated.js
```

Tokens JWT dev (segredo local, via env — nunca commitados); steady 4 usuários 200s +
flooder user-0 com 429s próprios e `Retry-After` (isolamento uid: provado: 2544/2544,
p95 34ms). Header-identity (x-user-id) NÃO alimenta keying — só JWT de sessão.

## Baseline atual

`reports/load/baseline.json`: health p95 20.7ms · risk p95 18.4ms ·
broadcast p95 34.6ms (todos 100% checks). Load de produção: adiado até
PEND-SSO/BYPASS (muro SSO) + ambiente prod-like.
