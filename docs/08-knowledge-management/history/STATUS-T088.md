# STATUS-T088 — property-based-crypto (Sprint 61/F08)

Data: 2026-09-27. Tarefa: T088-property-based-crypto. Branch: chore/sprint-61-property-based-crypto.
Resultado: **DONE** — 3 propriedades verdes a 1000 runs + 1 quarentena com bug real (#66).

## 1. Escopo honesto (adaptação registrada)

A tarefa pressupunha SSS real (split/combine, Feldman VSS, threshold reconstruction).
O código real (`src/lib/mpc/v2/index.ts`, stub T058) NÃO tem: função combine/reconstruct,
módulo Feldman, nem keypair real (constante do polinômio = 0n; publicKey aleatória sem
relação com shares). Fabricar arquivos shamir/feldman property para módulos inexistentes
seria teatro. Em vez disso: **1 arquivo, propriedades do contrato VERDADEIRO**:
`src/lib/mpc/v2/__tests__/mpc-properties.test.ts` (fast-check 4.10.2, devDep; bun.lock +
package-lock.json sincronizados).

## 2. Propriedades (test-first, contrato verdadeiro)

- P1 shares estruturais: t∈[2,8], n∈[t,t+6]∩[..12] → count===n, únicos,
  `share_<i>_<64hex>` com índice 1..n, publicKey `mpc_pk_`. 1000 runs PASS.
- P2 gate de threshold: k∈[0,12]∩[..n] → sign rejeita SSE k<t; com k≥t retorna
  `combined_sig_<t>_`. 1000 runs PASS.
- P3 determinismo: mesmo subset+msg → mesmo sig; combineSignatures direto determinístico
  + formato. 1000 runs PASS (msg arbitrária 0–64 bytes).
- P4 round-trip sign→verify: **FALHA** (prova TDD abaixo) → QUARENTENA `it.skip` com
  reason issue #66 (bug real, correção de 1 linha requer exceção ao freeze MPC/T058 —
  decisão do Thinker, fora deste PR).

## 3. Prova TDD da falha P4 (antes da quarentena)

```
(fail) mpc v2 properties (T088) > P4: round-trip sign->verify [5.69ms]
error: expect(received).toBe(expected) — Expected: true, Received: false
3 pass, 1 fail, 22178 expect() calls
```
Causa (#66): `sign()` retorna `combined_sig_...`, `verify()` exige prefixo `sig_`
(index.ts:71-98). Sempre false, primeiro run. Issue #66 (bug,security,testing) criada
com detalhe + comentário; propriedade skipada SÓ com reason (skipped != seguro).

## 4. Verificação final (crua)

```
bun test src/lib/mpc/v2/__tests__/mpc-properties.test.ts
3 pass, 1 skip, 0 fail, 22358 expect() calls
bunx tsc --noEmit → 0 erros
bunx eslint <arquivo> → 0 warnings
```

## 5. Verificação T088

- [x] Propriedades do contrato verdadeiro, 1000 runs sem falha (P1–P3).
- [x] Falha de propriedade = bug real (#66), não teste fraco; código NÃO tocado (freeze).
- [x] fast-check devDep pinada (^4.10.2), lockfiles sync.
- [x] DECISOES.md (D088). PR dedicado; merge após REVIEW (D078).

Arquivos: `src/lib/mpc/v2/__tests__/mpc-properties.test.ts` (novo),
`package.json` + `bun.lock` + `package-lock.json` (fast-check), `STATUS-T088.md`, `DECISOES.md`.
