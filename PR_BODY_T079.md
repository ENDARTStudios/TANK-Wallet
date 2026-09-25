Closes T079 (parcial: sem merge até REVIEW, D078).

Guard de `NEXTAUTH_URL` vazio/inválido com fallback ordenado (NEXTAUTH_URL válido → VERCEL_URL → https://tankwallet.dev). Corrige o prerender `/_not-found` no Vercel (`new URL('')` → `ERR_INVALID_URL`).

Evidência: `STATUS-T079.md` (a anexar). 6 testes do guard verdes; `tsc` 0; `eslint` 0; prerender 22/22 com `NEXTAUTH_URL=""`.
