# Escopo — Auditoria 2: Engines, Pipeline, Event Bus, TypeSafe

## Alvo

- `src/lib/risk/**`: thresholds compartilhadas (`THREAT_INTEL_THRESHOLDS`), agregação
- `src/lib/ai-risk/**`: piloto Jev (`typesafe-jev.ts`: Noul+Score, fail-open skipped, cliente injetável)
- `src/lib/intent/**`: roteamento de intent (Choice+Noul, flag `INTENT_ROUTING_ENABLED`, metadados-only)
- `src/lib/security/rate-limit.ts`: buckets por usuário/operação + teto IP global
- `src/lib/security/csp.ts` + `src/proxy.ts`: nonce CSP report-only, endpoint `/api/csp-report`
- Pipeline de decisão (12 estágios) e event bus entre engines

## Fora de escopo

- Criptografia e HSM (ver `SCOPE-AUDIT1.md`)
- Contratos Solidity (repositório não contém `.sol`)

## Perguntas para a firma

1. Fail-open `skipped` pode virar decisão insegura em algum caminho? (Contrato: advisory nunca decide.)
2. Rate limit por userId é burlável por spoofing de contexto? Teto global IP cobre?
3. CSP report-only → enforcing: violações coletadas sustentam a promoção?
4. `dapp_url` enviado à TypeSafe: minimização suficiente (só metadados)?
5. Thresholds compartilhados: algum drift entre agregador e Jev?

## Entregáveis

Report com severidades + retest após correções.
