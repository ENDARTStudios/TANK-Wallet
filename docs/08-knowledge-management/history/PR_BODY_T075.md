Closes T075 (parcial: sem merge até REVIEW, D078).

Restaura `test.fixme` no keyboard test de `e2e/onboarding.spec.ts` com evidência de 6 runs completos falhando de forma estável (3× variante poll + 3× variante fill) contra passes isolados — flake dependente de ambiente, não corrigível no teste.

Evidência: `STATUS-T075.md` (a anexar). Dívida rastreada em #49/T062.
