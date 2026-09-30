# Re-auditoria Jurídica — TANK Wallet (pós PR #95)

> ⚠️ **VERIFICAÇÃO LOCAL — 2026-09-30 (ZCode).** Base confirmada: `origin/main` == `acebd76` == merge do **PR #95** (MERGED 2026-09-30T13:06:56Z), contendo exatamente os 2 arquivos declarados (`LEGAL-AUDIT-2026-09-29.md` + `COMPLIANCE.md`). Verificações nesta base:
>
> | Alegação da re-auditoria | Verificação local |
> | --- | --- |
> | §2 — correção do aceite: existe registro em localStorage | ✅ CONFIRMADO — `src/components/wallet/onboarding/onboarding.tsx:120` grava `tank:termsAccepted` com `{at, version: '2026-08-30', terms, privacy}`; **server-side: 0 campos** de consentimento no schema → reclassificação aceita ("evidência insuficientemente robusta", não "inexistente") |
> | §3 — SEC-001 senha em claro permanece | ✅ `src/lib/auth/nextauth.ts:19` — `credentials.password !== user.password` |
> | §12 — secret previsível permanece | ✅ `src/lib/auth/nextauth.ts:6` — `?? "dev-secret-change-me"` |
> | §9 — schema sem `termsAcceptedAt`/`consent` | ✅ `prisma/schema.prisma` — 0 ocorrências |
> | §4/§13/§10 — SEC-002, CSP `unsafe-*`, SW cacheia `/api/*` | ✅ inalterados (árvore de runtime idêntica à `f2d4c0b`; o PR #95 foi somente documental) |
>
> Documento reproduzido verbatim. **Parecer: 🔴 NÃO APROVADO** — o próximo marco é a **correção verificável do runtime** (SEC-001, SEC-002, §25, §7), seguida de re-auditoria.

**Base efetivamente auditada:** `main` remoto após o merge do PR #95, commit de merge `acebd76ca7522aa74aed23aec5398782820529a3`, em 30/09/2026.

[TANK Wallet — repositório GitHub](https://github.com/ENDARTStudios/TANK-Wallet?utm_source=chatgpt.com)

## 1. Resultado executivo

O estado remoto mudou **somente documentalmente**. O PR #95 incorporou a auditoria jurídica e corrigiu o `COMPLIANCE.md`, mas **não alterou código de runtime**: o PR contém apenas 2 arquivos modificados. [PR #95 — auditoria jurídica](https://github.com/ENDARTStudios/TANK-Wallet/pull/95?utm_source=chatgpt.com)

Portanto:

> **A auditoria documental foi incorporada, mas os principais problemas técnicos e jurídicos continuam presentes na `main`.**

| Área                                     | Estado atual                                                |
| ---------------------------------------- | ----------------------------------------------------------- |
| Auditoria jurídica publicada             | 🟢 Confirmada                                               |
| `COMPLIANCE.md` corrigido                | 🟢 Confirmado                                               |
| Senha da autenticação de conta           | 🔴 **Ainda vulnerável**                                     |
| Criptografia de PII                      | 🔴 **Ainda incompatível com a alegação**                    |
| Secret padrão                            | 🔴 **Ainda presente**                                       |
| CSP                                      | 🔴 **Ainda contém `unsafe-inline`/`unsafe-eval`**           |
| Service Worker / Cache API               | 🔴 **Ainda cacheia `/api/*`**                               |
| Audit log client-side                    | 🔴 **Ainda apagável/modificável**                           |
| Profiling comportamental                 | 🔴 **Ainda não refletido na Privacy**                       |
| Fingerprinting                           | 🔴 **Ainda não refletido adequadamente**                    |
| Encarregado                              | 🔴 **Ainda não identificado**                               |
| Direitos do titular                      | 🔴 **Canal existe; implementação integral não demonstrada** |
| Transferências internacionais            | 🔴 **Informação insuficiente**                              |
| Termos de Uso                            | 🔴 **Insuficientes para o produto**                         |
| Perímetro regulatório de ativos virtuais | 🟠 **Ainda precisa ser formalizado**                        |
| Prontidão jurídica                       | 🔴 **Não concluída**                                        |

---

# 2. Correção importante em relação à auditoria anterior

Encontrei uma diferença relevante.

A auditoria anterior tratou o aceite como **não persistido**. O código atual mostra que existe, sim, um registro:

```ts
localStorage.setItem(
  'tank:termsAccepted',
  JSON.stringify({
    at: new Date().toISOString(),
    version: '2026-08-30',
    terms: '/terms',
    privacy: '/privacy'
  })
)
```

Isso ocorre em `onboarding.tsx`.

Portanto, o achado correto agora é:

> **O aceite é registrado localmente no dispositivo, mas não há evidência de registro server-side, banco de dados ou mecanismo de preservação probatória independente do cliente.**

O usuário pode apagar/modificar `localStorage`, reinstalar o navegador ou limpar os dados locais.

Assim, a afirmação dos Termos:

> "O aceite é obrigatório e registrado ... checkbox + timestamp"

é **parcialmente verdadeira tecnicamente**, mas a Política não deve apresentar esse mecanismo como se fosse um registro jurídico robusto e imutável.

Não classifico mais este ponto como "aceite inexistente"; classifico como **evidência de aceite insuficientemente robusta**.

---

# 3. SEC-001 — senha da autenticação continua em claro

Confirmado novamente.

`src/lib/auth/nextauth.ts` permanece com:

```ts
if (user.password && credentials.password !== user.password) return null;
```

e o schema continua:

```prisma
password String?
```

Não há `argon2`, `bcrypt` ou mecanismo equivalente nessa autenticação.

[nextauth.ts — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/lib/auth/nextauth.ts?utm_source=chatgpt.com)

### Classificação

**P0 — segurança crítica, caso essa autenticação seja utilizada em produção.**

Há uma nuance importante: o fluxo principal da wallet utiliza uma senha local para proteger o mnemonic, e essa camada usa PBKDF2 + AES-GCM. Portanto, não se deve confundir:

* **senha da conta/login NextAuth** → implementação problemática;
* **senha do cofre local da wallet** → mecanismo criptográfico diferente.

O problema permanece no primeiro.

---

# 4. SEC-002 — `encryptPII()` continua não sendo AES-256-GCM

Confirmado novamente.

`src/lib/crypto/pii.ts` continua implementando:

* XOR customizado;
* `Math.random()`;
* função hash/PRNG própria;
* nenhuma chamada AES-GCM.

[pii.ts — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/lib/crypto/pii.ts?utm_source=chatgpt.com)

Isso é particularmente importante porque o projeto possui **outros pontos que realmente utilizam AES-GCM**, inclusive o armazenamento do mnemonic.

Portanto, a conclusão juridicamente correta é:

> **O TANK Wallet possui implementação real de AES-256-GCM em determinados componentes, mas `encryptPII()` não utiliza AES-256-GCM.**

A Privacy Policy atualmente generaliza:

> "Criptografia em repouso (AES-256-GCM + PBKDF2 250k)"

sem delimitar quais dados efetivamente recebem essa proteção.

Isso continua sendo **informação materialmente imprecisa**.

---

# 5. PII do usuário não está demonstradamente criptografada no banco

O `User` continua:

```prisma
email       String @unique
password    String?
role        String
workspaceId String?
```

Não existe criptografia de coluna demonstrada para o e-mail.

[schema.prisma — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/prisma/schema.prisma?utm_source=chatgpt.com)

Assim, a redação da Privacy:

> "Dados de conta ... armazenados com criptografia"

é ampla demais para a implementação demonstrada.

Isso deve ser distinguido da criptografia do **vault local**.

---

# 6. RecoveryContact continua contendo PII sem proteção equivalente

O modelo continua armazenando:

```prisma
name
contact
type
verified
walletAddress
```

`contact` pode ser:

* e-mail;
* telefone;
* endereço de carteira.

Além disso, o componente client-side mantém contatos em `localStorage`.

Isso continua sem correspondência adequada na Privacy Policy.

---

# 7. Profiling comportamental — achado continua integralmente confirmado

O `BehaviorProfile` continua existindo no banco com:

```text
walletAddress
typicalHours
typicalChains
typicalAmounts
typicalDevices
typicalContracts
frequency
```

E o engine client-side continua criando:

```text
walletAddress
timestamp
chain
amountUsd
deviceFingerprint
contractAddress
actionType
```

Além disso, o sistema calcula um **score de anomalia de 0–100** e pode:

```text
allow
require_confirmation
activate_paranoid
block_temporarily
block
```

[Behavior Engine — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/lib/wallet-engines/behavior/index.ts?utm_source=chatgpt.com)

Isso é juridicamente relevante porque a própria ANPD reconhece o direito à revisão de decisões tomadas unicamente com base em tratamento automatizado que afetem os interesses do titular, inclusive decisões relacionadas à definição de perfil. ([Serviços e Informações do Brasil][1])

### Conclusão

A Privacy Policy continua **subdescrevendo materialmente o tratamento comportamental**.

---

# 8. Device fingerprinting continua sem transparência adequada

O código continua combinando:

* `userAgent`;
* idioma;
* resolução;
* profundidade de cor;
* timezone;
* `hardwareConcurrency`.

E transforma esses elementos em um identificador:

```text
dev-xxxxxxxx
```

Esse identificador participa do perfil comportamental.

A Privacy Policy não descreve adequadamente:

* existência do fingerprint;
* elementos utilizados;
* finalidade;
* duração;
* vínculo com a carteira;
* utilização no mecanismo antifraude;
* consequência para o usuário.

**Achado permanece P1.**

---

# 9. Consentimento: parcialmente corrigido, mas ainda inadequado como evidência

Agora temos evidência concreta de:

* checkbox;
* aceitação obrigatória;
* timestamp;
* versão;
* URLs dos documentos.

Porém, tudo fica em:

```text
localStorage
tank:termsAccepted
```

Não existe no `User`:

```text
termsAcceptedAt
termsVersion
privacyAcceptedAt
privacyVersion
```

Nem foi demonstrado um registro server-side.

### Resultado

**P1 — evidência de consentimento/aceite insuficientemente robusta.**

O texto jurídico deve ser alterado para não sugerir um mecanismo de prova mais forte do que o realmente existente.

---

# 10. Service Worker continua armazenando respostas de API

Confirmado.

`public/sw.js` continua fazendo:

```js
cache.put(req, res.clone())
```

para requisições `/api/`.

[Service Worker — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/public/sw.js?utm_source=chatgpt.com)

Isso é especialmente relevante para uma aplicação financeira/wallet.

A Privacy Policy continua dizendo apenas:

> "Usamos apenas cookies essenciais de sessão/autenticação."

Isso não descreve:

* Cache API;
* Service Worker;
* `localStorage`;
* armazenamento client-side;
* fingerprinting.

**Achado P1 permanece.**

---

# 11. Audit log continua apagável

O audit log client-side permanece em:

```text
localStorage
```

e continua existindo:

```ts
clearAuditLog()
```

[Audit Engine — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/lib/wallet-engines/audit/index.ts?utm_source=chatgpt.com)

O HMAC fornece **tamper evidence dentro da sessão**, mas não transforma `localStorage` em armazenamento imutável.

Qualquer código com acesso ao armazenamento pode:

* apagar;
* substituir;
* restaurar estado anterior;
* alterar entradas.

### Conclusão

A expressão "audit log imutável" não é adequada para esse componente.

O próprio `COMPLIANCE.md` agora reconhece essa distinção. Isso foi uma correção válida.

---

# 12. Secret previsível continua presente

Ainda existe:

```ts
process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me"
```

[nextauth.ts — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/lib/auth/nextauth.ts?utm_source=chatgpt.com)

Isso significa que a proteção depende da configuração correta do ambiente para não cair no valor conhecido.

**P0/P1 técnico**, dependendo do ambiente efetivamente exposto.

---

# 13. CSP continua com `unsafe-*`

O `next.config.ts` continua:

```text
script-src 'self' 'unsafe-inline' 'unsafe-eval';
```

[next.config.ts — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/next.config.ts?utm_source=chatgpt.com)

Existe infraestrutura de CSP mais avançada no projeto, mas a configuração estática principal continua contendo essas permissões.

Portanto, **não considero o achado encerrado**.

---

# 14. DPO / Encarregado continua não identificado

A Privacy Policy não identifica nominalmente um Encarregado.

A documentação atual do projeto inclusive corrigiu o `COMPLIANCE.md` para reconhecer essa ausência.

A ANPD informa que a identidade e as informações de contato do encarregado devem ser divulgadas publicamente quando aplicável; a Resolução CD/ANPD nº 18/2024 está vigente. ([Serviços e Informações do Brasil][2])

Se houver enquadramento como agente de pequeno porte com dispensa da indicação formal, isso **não elimina a necessidade de canal adequado de comunicação**; a própria regulamentação de pequeno porte trata diferentemente essas obrigações. ([Serviços e Informações do Brasil][3])

### Estado

**P1 — pendente de definição formal do enquadramento e da governança do Encarregado.**

---

# 15. Direitos dos titulares continuam sem implementação integral demonstrada

A Privacy afirma:

> acesso, correção, exclusão, portabilidade, oposição e revogação.

Mas o repositório não demonstra uma infraestrutura completa para:

* protocolo de solicitações;
* autenticação do solicitante;
* exportação integral;
* correção;
* eliminação;
* oposição;
* revogação;
* revisão de decisões automatizadas;
* registro do atendimento;
* evidência de cumprimento.

A ANPD confirma, entre outros, direitos de confirmação, acesso, correção, informações sobre compartilhamento e revisão de decisões automatizadas. ([Serviços e Informações do Brasil][1])

O prazo de 15 dias também não deve ser usado indistintamente para todos os direitos: a própria ANPD diferencia os prazos conforme o tipo de solicitação e regulamentação aplicável. ([Serviços e Informações do Brasil][1])

**P0/P1 jurídico-operacional.**

---

# 16. Transferência internacional continua insuficientemente documentada

A Privacy menciona:

* Vercel/Render;
* Postgres;
* Sentry;
* OTel.

Mas não apresenta, de forma suficiente:

* país/destino;
* finalidade por fornecedor;
* papel controlador/operador;
* categorias de dados;
* duração;
* mecanismo jurídico de transferência;
* salvaguardas.

A Resolução CD/ANPD nº 19/2024 disciplina justamente os mecanismos e a transparência aplicáveis às transferências internacionais. ([Serviços e Informações do Brasil][4])

**Achado permanece P1.**

---

# 17. Incidentes de segurança

A `SECURITY.md` é relativamente estruturada, mas isso não substitui um procedimento operacional LGPD.

A Resolução CD/ANPD nº 15/2024 está vigente e estabelece o regime de comunicação de incidentes. Para incidentes que possam acarretar risco ou dano relevante, a ANPD informa prazo de **3 dias úteis** para comunicação à ANPD e aos titulares, ressalvada legislação específica. ([Serviços e Informações do Brasil][5])

Isso é particularmente relevante para o TANK porque a própria ANPD inclui **dados financeiros** e **dados de autenticação** entre os critérios relevantes para caracterização de incidente com risco ou dano relevante. ([Serviços e Informações do Brasil][6])

A governança documental deve conectar:

```text
incidente técnico
      ↓
classificação LGPD
      ↓
avaliação de risco
      ↓
Encarregado / representante
      ↓
ANPD + titulares
      ↓
registro e evidências
```

---

# 18. Termos de Uso continuam insuficientes

Os Termos continuam com apenas 9 cláusulas.

Para o produto efetivamente descrito, permanecem lacunas sobre:

* funcionamento da wallet;
* redes blockchain;
* RPCs e terceiros;
* WalletConnect;
* swaps;
* bridges;
* gas/network fees;
* smart contracts;
* oráculos;
* indisponibilidade de blockchain;
* irreversibilidade;
* terceiros;
* suspensão/bloqueio;
* encerramento;
* propriedade dos dados;
* limitações de responsabilidade juridicamente admissíveis;
* notificações;
* legislação aplicável;
* tratamento de dados;
* decisões automatizadas;
* status regulatório.

A cláusula "como está" não elimina obrigações legais imperativas.

---

# 19. Perímetro regulatório de ativos virtuais

Este ponto ganhou importância com a atualização regulatória de setembro de 2026.

A Lei nº 14.478/2022 define PSAV como a pessoa jurídica que executa **em nome de terceiros** determinados serviços, incluindo troca, transferência e custódia/administração de ativos virtuais. ([Presidência da República][7])

A Resolução BCB nº 520/2025 disciplina as sociedades prestadoras de serviços de ativos virtuais, e a Resolução BCB nº 589/2026 alterou esse regime, com mudanças entrando em vigor em **1º/10/2026** e outras em **1º/1/2027**. ([Banco Central do Brasil][8])

O próprio BCB informou que, a partir de 1º/10/2026, transferências para/de carteiras autocustodiadas em valor igual ou superior ao equivalente a **US$ 10 mil** terão comunicação específica ao Coaf no contexto da regulamentação aplicável. ([Banco Central do Brasil][9])

### Para o TANK

O ponto jurídico central não é simplesmente "é uma wallet".

É determinar documentalmente:

> **O TANK apenas fornece software de autocustódia ao usuário ou executa, em nome de terceiros, alguma atividade que o enquadre como PSAV?**

A documentação atual ainda não fecha esse perímetro com precisão suficiente.

**Achado P1 regulatório.**

---

# 20. Propriedade intelectual

O `LICENSE` continua declarando:

> software proprietário, confidencial e todos os direitos reservados.

[LICENSE — GitHub](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/LICENSE?utm_source=chatgpt.com)

Porém, o repositório contém código de terceiros, inclusive GSAP, com licença própria.

[GSAP incorporado no repositório](https://github.com/ENDARTStudios/TANK-Wallet/tree/main/gsap-public?utm_source=chatgpt.com)

Portanto:

> A licença proprietária do projeto **não substitui as licenças dos componentes de terceiros**.

O `NOTICE` e o SBOM ajudam, mas é necessário manter uma matriz confiável de dependências/licenças.

**P1 jurídico/IP.**

---

# 21. Nova conclusão jurídica

A nova auditoria altera o diagnóstico **documental**, mas não o diagnóstico **operacional**.

### O que foi efetivamente resolvido

* Auditoria jurídica publicada.
* `COMPLIANCE.md` deixou de afirmar que o projeto já era LGPD compliant.
* Alegação falsa de PII protegida foi explicitamente marcada.
* Ausência de DPO foi reconhecida.
* PR #95 foi efetivamente mergeado na `main`.
* A existência do commit `31d9253` agora está confirmada no remoto.

### O que NÃO foi resolvido

Os problemas de runtime continuam.

Em especial:

1. **senha da autenticação de conta em claro;**
2. **`encryptPII()` não é AES-256-GCM;**
3. **secret padrão previsível;**
4. **CSP ainda contém `unsafe-*`;**
5. **Service Worker ainda cacheia APIs;**
6. **audit log ainda é client-side/apagável;**
7. **profiling comportamental não está adequadamente refletido na Privacy;**
8. **fingerprinting não está adequadamente informado;**
9. **PII de `RecoveryContact` permanece sem proteção equivalente;**
10. **direitos dos titulares não estão integralmente operacionalizados;**
11. **Encarregado não está formalmente identificado;**
12. **transferências internacionais não estão suficientemente documentadas;**
13. **Termos continuam subdimensionados;**
14. **perímetro PSAV permanece sem conclusão formal.**

---

## Parecer final

**Status jurídico atual da `main`: 🔴 NÃO APROVADO para declaração pública de "LGPD compliant", "fully compliant", "audited" ou equivalente.**

Isso não significa que o produto seja, por si só, declarado "ilegal". Significa algo mais preciso:

> **O repositório atualmente não fornece base técnica e documental suficiente para sustentar uma declaração positiva de conformidade jurídica integral.**

A auditoria jurídica agora está **formalmente registrada no próprio GitHub**, mas ela continua sendo, essencialmente, o registro dos problemas encontrados. O próximo marco jurídico relevante é a **correção verificável do runtime e a posterior reauditoria da `main`**, não uma nova edição meramente documental.

[1]: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares?utm_source=chatgpt.com "Direito dos Titulares"
[2]: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/copy_of_guia_da_atuacao_do_encarregado_anpd.pdf?utm_source=chatgpt.com "Da identidade e das informações de contato do encarregado"
[3]: https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022?utm_source=chatgpt.com "Resolução CD/ANPD nº 2, de 27 de janeiro de 2022"
[4]: https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024?utm_source=chatgpt.com "Resolução CD/ANPD nº 19, de 23 de agosto de 2024"
[5]: https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis?sck=direto&utm_source=chatgpt.com "Comunicação de Incidente de Segurança"
[6]: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/glossario-anpd?utm_source=chatgpt.com "Glossário ANPD"
[7]: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14478.htm?utm_source=chatgpt.com "L14478"
[8]: https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=589&tipo=Resolu%C3%A7%C3%A3o+BCB&utm_source=chatgpt.com "Exibe Normativo"
[9]: https://www.bcb.gov.br/detalhenoticia/21267/nota?utm_source=chatgpt.com "BC aprimora regras relativas à prestação de serviços de ativos virtuais"
