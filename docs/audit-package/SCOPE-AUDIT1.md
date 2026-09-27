# Escopo — Auditoria 1: Crypto, Key Management, Recovery

## Alvo

- `src/lib/mpc/**`: Shamir Secret Sharing, Feldman VSS (`src/lib/mpc/v2/**`), HSM providers (`src/lib/mpc/hsm.ts`: AWS KMS, GCP KMS, Azure Key Vault)
- BIP-39/32/44/SLIP-0010 (derivação e validação de mnemonic)
- AES-256-GCM vault + PBKDF2 250k iterações + `SecureBuffer` com zeroização
- Envelopes de chave e fluxo de recovery (seed phrase + senha)

## Fora de escopo

- Engines de decisão e pipeline (ver `SCOPE-AUDIT2.md`)
- Frontend e componentes UI
- Infraestrutura de deploy (Vercel) além do build

## Perguntas para a firma

1. Geração de entropia: CSPRNG em todos os caminhos? Algum `Math.random` alcançável?
2. Shamir/Feldman: implementação correta do compartilhamento e verificação? Vazamento por timing/side-channel?
3. HSM: chaves jamais em texto plano fora do HSM? Escopo de permissões mínimo (least-privilege)?
4. Vault local: PBKDF2 250k suficiente? Zeroização efetiva em todos os early-returns?
5. Recovery: seed phrase nunca logada, nunca em DB, nunca em telemetria?

## Entregáveis

Report com severidades (Critical/High/Medium/Low/Info) + retest após correções.
