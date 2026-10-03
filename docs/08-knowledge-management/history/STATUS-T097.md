# STATUS-T097 — mpc-bug-fix (Sprint 61/F08, exceção ao freeze)

Data: 2026-09-27. Tarefa: T097-mpc-bug-fix (depende T088 merged). Branch: chore/sprint-61-mpc-bug-fix.
Resultado: **DONE** — bug #66 corrigido, P4 reabilitada a 1000 runs, zero regressão.

## 1. Exceção ao freeze (D095/D097)

`src/lib/mpc/**` congelado desde T058/T080; D095 (Thinker) aprova exceção: correção de bug
real provado por propriedade (P4), mínima e localizada, não feature. 2 linhas no mesmo bloco.

## 2. Correção (`src/lib/mpc/v2/index.ts`)

Causa #66 em duas partes: (a) `sign()` produz `combined_sig_...` mas `verify()` só aceitava
prefixo `sig_`; (b) `verify()` amarrava em `this.publicKey` (estado da instância) em vez do
argumento — semanticamente errado (o teste existente "wrong_key deve falhar" só passava
por acidente do prefixo).
Diff:
- `combineSignatures`: sufixo passa a embutir `tag = publicKey.slice(0,8)` (mesmo
  comprimento, formato `combined_sig_<t>_` intacto).
- `verify`: aceita `sig_` OU `combined_sig_` + `signature.includes(publicKey.slice(0,8))`
  (argumento, não instância). Fragmento `mpc_pk_X` contém não-hex → colisão impossível
  (determinístico, sem flake).
Limitação honesta do stub (pré-existente, não introduzida): mensagem não é amarrada
criptograficamente no verify — documentada, fora do escopo T097.

## 3. Verificação (crua)

```
bun test src/lib/mpc/
17 pass, 0 fail (5 arquivos: properties P1-P4 + mcpv2 + hsm + hsm-aws + mpc)
P4 [T097 reabilitada]: round-trip sign->verify — PASS a 1000 runs
bunx tsc --noEmit → 0 erros
bunx eslint (index.ts + properties) → 0 warnings
```
Regressão: testes mcpv2 existentes (prefixo `combined_sig_`, rejeição wrong_key) passam —
a correção preserva o contrato, antes quebrado só no round-trip.

## 4. Verificação T097

- [x] Prefixos alinhados; P4 sem skip, 1000 runs.
- [x] P1/P2/P3 intactas (sem retoque).
- [x] DECISOES.md (exceção D095/D097). PR dedicado; merge após REVIEW (D078).
- [ ] Issue #66: fechar APÓS merge (comentário c/ PR+commit).

Arquivos: `src/lib/mpc/v2/index.ts` (2 linhas), `mpc-properties.test.ts` (unskip + 1000 runs),
`STATUS-T097.md`, `DECISOES.md`, `PENDENCIAS_OPERADOR.md` (itens 4/5 + QUOTA resolvida).
