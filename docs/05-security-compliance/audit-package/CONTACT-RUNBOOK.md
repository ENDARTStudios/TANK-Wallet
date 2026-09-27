# Runbook de Contato (para o Operador)

## Passo a passo

1. Escolha 2–3 firms em `FIRMS-CANDIDATES.md` (recomendação: Trail of Bits + Spearbit/Halborn).
2. Copie `ENGAGEMENT-TEMPLATE.md`, preencha `[PREENCHER]` (escopo 1 ou 2, datas, preço).
3. E-mail curto em inglês (template abaixo) + pacote zip do repo no commit de `COMMIT-FROZEN.md`.
4. Critério de escolha: **fit técnico > preço > prazo**. Peça CVs dos pesquisadores + metodologia + referências de wallet/MPC.
5. Assine NDA → kickoff → acompanhe via canal dedicado → receba draft → corrija → solicite retest.

## Template de e-mail

```
Subject: Security audit inquiry — TANK Wallet (self-custodial crypto wallet, MPC v2 + HSM)

Hi [Firm] team,

We're END ART Studios, building TANK Wallet (Next.js 16, TypeScript, MPC
threshold signatures, HSM-backed keys). We're seeking a [3–6]-week audit
covering [crypto/key management/recovery | decision engines/pipeline]
per the attached scope, on frozen commit 2977f20.

Please share: availability, team CVs, methodology, fixed-fee quote
including one retest, and 2 wallet/MPC references.

Thanks,
[Name] — END ART Studios
```

## O que a firma vai pedir

- Acesso de leitura ao repo + threat model (`ARCHITECTURE.md`, `docs/05-security-compliance/SECURITY-GATE.md`)
- Contato técnico com SLA 24h
- Timeline e janela de retest
- NDA assinado antes do kickoff
