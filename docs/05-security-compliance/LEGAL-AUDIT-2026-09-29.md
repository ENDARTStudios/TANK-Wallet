# Auditoria Jurídica — TANK Wallet

> ⚠️ **VERIFICAÇÃO LOCAL — 2026-09-29 (ZCode).** Base confirmada: `main` local == `f2d4c0b` (exatamente o commit auditado). Todas as alegações tecnicamente verificáveis foram conferidas no código e **CONFIRMADAS**:
>
> | Achado | Verificação local |
> | --- | --- |
> | SEC-001 — senha comparada em claro | ✅ `src/lib/auth/nextauth.ts:19` — `credentials.password !== user.password` (sem hash); schema `prisma/schema.prisma:28` — `password String?` |
> | SEC-002 — `encryptPII` ≠ AES-256-GCM | ✅ `src/lib/crypto/pii.ts` — XOR custom com IV de `Math.random()` + PRNG tipo djb2; nenhum uso de Web Crypto/AES-GCM |
> | §25 — fallback de segredo previsível | ✅ `src/lib/auth/nextauth.ts:6` — `NEXTAUTH_SECRET ?? "dev-secret-change-me"` |
> | §7 — aceite não persistido no schema | ✅ `prisma/schema.prisma` sem `termsAcceptedAt`/`privacyAcceptedAt`/`consent*` |
> | §12 — SW cacheia `/api/*` | ✅ `public/sw.js:20-21` — runtime cache para respostas GET de API |
> | §26 — audit log local + `clearAuditLog()` | ✅ `src/lib/wallet-engines/audit/index.ts` |
> | §6 — sem DPO/Encarregado público | ✅ `src/app/privacy/page.tsx` sem menção a encarregado/DPO |
> | §24 — CSP com `unsafe-inline`/`unsafe-eval` | ✅ `next.config.ts:5` — `script-src 'self' 'unsafe-inline' 'unsafe-eval'` |
>
> Documento reproduzido verbatim da auditoria de terceiros recebida em 29/09/2026. Correções de código são responsabilidade do time; textos jurídicos exigem assessoria. Alegação falsa equivalente no `COMPLIANCE.md` (PII "cifrada" + DPO "definido") foi corrigida no mesmo commit desta auditoria.

**Base auditada:** repositório público `ENDARTStudios/TANK-Wallet`, branch `main`, commit `f2d4c0b6f9834c1efa56cdc2fae3a3c7676a4aa3`, publicado em **27/09/2026**. ([Banco Central do Brasil][1])

[Repositório TANK Wallet — GitHub](https://github.com/ENDARTStudios/TANK-Wallet?utm_source=chatgpt.com)

**Escopo:** aplicação, banco, autenticação, armazenamento local, observabilidade, documentação, Termos de Uso, Privacidade, segurança, cookies/tecnologias, direitos dos titulares, propriedade intelectual e enquadramento regulatório brasileiro.

**Natureza da auditoria:** análise documental e técnica do código efetivamente publicado. Não considero como comprovadas as afirmações do próprio projeto sobre segurança, criptografia, anonimização ou conformidade quando o código não as sustenta. O próprio repositório informa que **auditoria externa ainda não foi realizada e pentest está pendente**.

---

# 1. Resultado executivo

| Área                              | Resultado                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Termos de Uso                     | 🔴 **Incompletos**                                                              |
| Política de Privacidade           | 🔴 **Incompatível com o tratamento efetivamente documentado no código**         |
| LGPD — transparência              | 🔴 **Falhas materiais**                                                         |
| LGPD — direitos do titular        | 🔴 **Canal existe, implementação não está demonstrada**                         |
| Encarregado/DPO                   | 🔴 **Não identificado/publicado**                                               |
| Cookies                           | 🟡 **Declaração razoável, mas insuficiente para todo o tratamento tecnológico** |
| Segurança da informação           | 🔴 **Há vulnerabilidades técnicas objetivamente identificáveis**                |
| Incidentes de segurança           | 🟡 **Há política de segurança, mas falta política LGPD operacional específica** |
| Transferência internacional       | 🔴 **Não documentada adequadamente**                                            |
| Dados financeiros/comportamentais | 🔴 **Tratamento efetivo não está refletido na Privacy Policy**                  |
| Autenticação                      | 🔴 **Problema objetivo de armazenamento/comparação de senha**                   |
| Propriedade intelectual           | 🟡 **Licença proprietária existe, mas há problema com terceiros/dependências**  |
| Regulação de ativos virtuais      | 🟠 **Perímetro regulatório precisa ser formalmente definido**                   |
| Prontidão jurídica para produção  | 🔴 **Não recomendo considerar juridicamente concluído**                         |

---

# 2. Achado P0 — Política de Privacidade não descreve o tratamento real

Este é o principal problema jurídico documental.

A Política afirma que os dados coletados seriam essencialmente:

> e-mail, workspace, role e métricas de uso anonimizadas.

Mas o código contém tratamento muito mais amplo.

O modelo `BehaviorProfile` prevê:

* endereço da carteira;
* horários habituais;
* redes utilizadas;
* valores típicos;
* dispositivos/fingerprints;
* contratos utilizados;
* frequência de transações;
* quantidade de observações.

O próprio `Behavior Engine` declara que aprende:

* horários;
* dispositivos;
* países/IPs;
* redes;
* contratos;
* ticket médio;
* frequência.

E registra ações contendo:

* `walletAddress`;
* timestamp;
* chain;
* valor em USD;
* fingerprint do dispositivo;
* endereço do contrato;
* tipo da operação.

Isso não é descrito adequadamente na Política de Privacidade.

[Behavior Engine — código auditado](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/lib/wallet-engines/behavior/index.ts?utm_source=chatgpt.com)

Além disso, existe `PermissionAuditLog`, contendo:

* wallet address;
* token;
* token address;
* spender;
* amount;
* chain;
* timestamp.

E existe `RecoveryContact`, que admite:

* nome;
* endereço de carteira;
* e-mail;
* telefone;
* tipo de contato;
* status de verificação.

A própria documentação interna reconhece que `RecoveryContact.contact` pode ser PII e que atualmente está **sem cifragem**. ([Serviços e Informações do Brasil][2])

**Conclusão jurídica:** a Política de Privacidade está materialmente subdimensionada em relação ao tratamento efetivamente implementado.

A LGPD exige transparência sobre as operações de tratamento, finalidades e informações relevantes ao titular; o Marco Civil também exige informações claras sobre coleta, uso, armazenamento, tratamento e proteção dos dados. ([Presidência da República][3])

---

# 3. P0 — Perfil comportamental é tratamento de dados pessoais e não está adequadamente declarado

O sistema não apenas registra transações.

Ele **constrói um perfil comportamental**.

O código calcula:

```text
typicalHours
typicalChains
typicalAmountsUsd
typicalDevices
typicalContracts
frequencyPerDay
```

e produz um `score` de anomalia de **0 a 100**, podendo recomendar:

```text
allow
require_confirmation
activate_paranoid
block_temporarily
block
```

Portanto, há tratamento automatizado destinado a inferir padrões de comportamento financeiro/operacional do usuário.

Isso precisa aparecer de forma clara na Política de Privacidade, incluindo:

* quais dados alimentam o perfil;
* finalidade;
* período de retenção;
* lógica geral;
* consequências do perfil;
* possibilidade de bloqueio;
* compartilhamentos;
* direitos aplicáveis.

A LGPD também possui disciplina específica para decisões tomadas unicamente com base em tratamento automatizado que afetem os interesses do titular. O projeto deveria tratar expressamente essa questão em sua governança e política, em vez de limitar a descrição a "métricas anonimizadas".

---

# 4. P0 — Política afirma anonimização onde o código demonstra identificação

A Política utiliza a expressão:

> "Dados de uso anonimizado"

Mas o código trabalha diretamente com:

* `walletAddress`;
* fingerprint;
* IP/país na especificação do Behavior Engine;
* horários;
* contratos;
* valores;
* histórico de operações.

Um endereço de carteira não deve ser automaticamente tratado como "anônimo". A ANPD define dado pessoal como informação relacionada a pessoa natural identificada ou identificável. ([Serviços e Informações do Brasil][2])

**Conclusão:** a expressão "anonimizado" não está juridicamente sustentada pela implementação apresentada.

Se a intenção é anonimizar, é necessário demonstrar tecnicamente o processo de anonimização e sua eficácia. Caso contrário, o correto é tratar esses elementos como dados pessoais quando vinculáveis a uma pessoa.

---

# 5. P0 — Direitos do titular: canal declarado, implementação não demonstrada

A Política afirma:

> "Você pode solicitar acesso, correção, exclusão, portabilidade, oposição e revogação de consentimento via [endart.studios@gmail.com](mailto:endart.studios@gmail.com)."

O problema é que a existência de um e-mail **não comprova a implementação operacional dos direitos**.

A ANPD lista, entre outros, direitos de:

* confirmação da existência de tratamento;
* acesso;
* correção;
* revogação;
* informações sobre compartilhamento;
* eliminação em determinadas hipóteses. ([Serviços e Informações do Brasil][4])

No repositório não encontrei uma implementação completa e demonstrável de:

* exportação de todos os dados pessoais;
* confirmação de tratamento;
* correção;
* eliminação;
* portabilidade;
* tratamento de oposição;
* revogação;
* revisão de decisões automatizadas;
* rastreamento de solicitações;
* comprovação da resposta.

A documentação interna afirma que esses mecanismos existem ou são previstos, mas isso não é suficiente para classificá-los como implementados.

---

# 6. P0 — Não há encarregado/DPO identificado na Política

A Política identifica:

**END ART Studios — CNPJ 45.370.930/0001-75**

mas não identifica o **Encarregado pelo Tratamento de Dados Pessoais**.

A ANPD estabelece que a identidade e as informações de contato do encarregado devem ser divulgadas publicamente, de maneira clara e objetiva, quando aplicável. A Resolução CD/ANPD nº 18/2024 disciplina especificamente essa função. ([Serviços e Informações do Brasil][5])

Existe uma referência interna no `COMPLIANCE.md` dizendo:

> "DPO/contact: definido em `src/app/privacy/`"

Mas isso não corresponde ao conteúdo efetivo da página de privacidade: ela apresenta apenas e-mail geral e Telegram.

[Política de Privacidade — código publicado](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/app/privacy/page.tsx?utm_source=chatgpt.com)

### Resultado

**Não há DPO publicamente identificado no material jurídico atualmente publicado.**

Se a organização se enquadrar na hipótese de dispensa de indicação prevista para agentes de pequeno porte, ainda assim deve existir canal adequado de comunicação com o titular. A Resolução 18/2024 trata expressamente dessa possibilidade. ([Escola de Governo][6])

---

# 7. P0 — Aceite dos Termos não está demonstrado no modelo de dados

Os Termos dizem:

> "O aceite é obrigatório e registrado no momento do cadastro (checkbox + timestamp)."

A Política repete:

> "O aceite é registrado com timestamp e versão."

Porém, o modelo `User` publicado contém:

```text
id
email
password
role
tier
workspaceId
createdAt
```

Não há campos aparentes para:

* `termsAcceptedAt`;
* `termsVersion`;
* `privacyAcceptedAt`;
* `privacyVersion`;
* `consentRecord`;
* versão do documento;
* origem do aceite.

Portanto, **a afirmação jurídica de que o aceite é registrado com timestamp e versão não está demonstrada pelo schema publicado**.

Isso é particularmente relevante porque o projeto declara que o aceite constitui condição de cadastro e pretende utilizá-lo como evidência jurídica.

---

# 8. P0 — Senha armazenada de forma incompatível com a política declarada

Há um problema técnico objetivo.

O modelo possui:

```text
password String?
```

E a autenticação faz:

```text
if (user.password && credentials.password !== user.password)
```

Ou seja, a implementação publicada compara a senha recebida diretamente com o valor armazenado.

Não há hash de senha nessa rotina.

[Implementação de autenticação — nextauth.ts](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/lib/auth/nextauth.ts?utm_source=chatgpt.com)

Isso contradiz a narrativa de segurança apresentada na Política, que descreve criptografia e controles robustos.

Além do risco de segurança, isso afeta diretamente a conformidade com o dever de adoção de medidas técnicas e administrativas aptas a proteger dados pessoais. A LGPD impõe essa obrigação no art. 46.

**Classificação: P0 técnico-jurídico.**

---

# 9. P0 — A função chamada `encryptPII()` não implementa AES-256-GCM

Este é um achado especialmente grave.

O projeto declara:

> "PII em repouso cifrada — `encryptPII/decryptPII`."

Entretanto, `src/lib/crypto/pii.ts` implementa uma transformação XOR customizada, utilizando:

* `Math.random()` para o IV;
* função hash customizada;
* geração de bytes pseudoaleatória;
* XOR entre plaintext, chave e IV.

Não há AES-GCM nesse código.

[Implementação PII — pii.ts](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/src/lib/crypto/pii.ts?utm_source=chatgpt.com)

Portanto, a afirmação documental de que existe **"PII em repouso cifrada"** por esse mecanismo não corresponde tecnicamente ao que foi publicado.

Isso é relevante juridicamente porque a própria Política promete medidas de segurança específicas:

> AES-256-GCM + PBKDF2 250k.

A segurança real não corresponde integralmente à segurança declarada.

---

# 10. P1 — `RecoveryContact` contém PII sem cifragem

O próprio relatório interno de banco registra:

> "`RecoveryContact.contact` (PII email/phone) — nullable, sem cifra ainda"

Portanto, existe reconhecimento interno explícito da ausência de cifragem.

A Política, entretanto, apresenta de forma genérica:

> "Criptografia em repouso (AES-256-GCM + PBKDF2 250k)."

Essa redação transmite uma proteção geral que não corresponde a todos os campos pessoais armazenados.

**Correção jurídica necessária:** especificar quais categorias são protegidas, onde, por qual mecanismo e quais exceções existem.

---

# 11. P1 — Armazenamento local contém dados altamente relevantes

Há múltiplos mecanismos `localStorage`.

O código de comportamento armazena:

```text
walletAddress
timestamp
chain
amountUsd
deviceFingerprint
contractAddress
actionType
```

O mecanismo de auditoria também armazena localmente:

```text
walletAddress
description
chain
token
amount
counterparty
metadata
```

E contatos de recuperação são armazenados em:

```text
localStorage
tank:recovery-contacts:<walletAddress>
```

Isso precisa estar expressamente coberto pela Política de Privacidade e pelos documentos de segurança.

Não são "cookies", mas são **tecnologias de armazenamento e identificação no dispositivo**.

---

# 12. P1 — Service Worker armazena respostas de `/api/*`

O `public/sw.js` contém:

```text
if (req.url.includes("/api/")) {
    ...
    cache.put(req, res.clone())
}
```

Portanto, **respostas GET de APIs podem entrar no cache persistente do navegador**.

Isso é particularmente relevante para uma wallet.

A Política afirma:

> "Usamos apenas cookies essenciais de sessão/autenticação."

Isso não cobre o armazenamento via Service Worker/Cache API.

Não é tecnicamente correto reduzir o modelo de tecnologias de armazenamento utilizado pelo produto a "cookies essenciais".

**Achado jurídico:** a Política deve descrever também tecnologias de armazenamento local e sua finalidade, especialmente quando podem conter dados pessoais ou financeiros.

---

# 13. P1 — Observabilidade e Sentry não estão suficientemente descritos

O projeto possui:

* Sentry;
* OpenTelemetry;
* Prometheus;
* tracing;
* métricas;
* logs estruturados.

A inicialização do Sentry utiliza um DSN configurável e `tracesSampleRate`.

O OpenTelemetry também inicializa um exporter OTLP.

A Política menciona Sentry/OTel, mas não informa adequadamente:

* quais categorias de dados podem chegar a esses fornecedores;
* quais eventos;
* quais identificadores;
* países de tratamento;
* períodos de retenção;
* base legal;
* mecanismo de transferência internacional;
* papel de cada fornecedor;
* direitos aplicáveis ao compartilhamento.

Isso é especialmente relevante porque a ANPD regulamentou as transferências internacionais pela Resolução CD/ANPD nº 19/2024. Quando houver transferência internacional, o controlador deve disponibilizar informações específicas sobre finalidade, duração, país de destino, compartilhamento, responsabilidades e segurança. ([Serviços e Informações do Brasil][7])

---

# 14. P1 — Política de Cookies é insuficiente como política tecnológica

O texto:

> "Usamos apenas cookies essenciais de sessão/autenticação."

é aceitável **somente para os cookies propriamente ditos**, se isso corresponder ao ambiente efetivo.

A ANPD distingue:

* cookies necessários;
* cookies de funcionalidade;
* cookies analíticos;
* cookies de publicidade;
* cookies próprios;
* cookies de terceiros;
* cookies persistentes;
* cookies de sessão.

E recomenda transparência específica sobre seu uso. ([Serviços e Informações do Brasil][8])

No TANK Wallet, porém, existem também:

* `localStorage`;
* Cache API;
* Service Worker;
* device fingerprint;
* Sentry;
* OpenTelemetry.

Logo, o documento deveria ser denominado e estruturado como **"Cookies e Tecnologias de Armazenamento/Rastreamento"**, e não limitar-se à palavra cookies.

---

# 15. P1 — Device Fingerprinting não está adequadamente informado

O `getDeviceFingerprint()` combina:

* `navigator.userAgent`;
* idioma;
* resolução;
* profundidade de cor;
* timezone;
* hardware concurrency.

Depois produz um identificador.

Isso é claramente relevante para privacidade.

A Política atual não descreve:

* criação do fingerprint;
* componentes utilizados;
* finalidade;
* retenção;
* possibilidade de exclusão;
* vínculo com carteira;
* uso para tomada de decisão.

Isso é um **gap de transparência material**.

---

# 16. P1 — Retenção declarada não cobre todas as categorias efetivamente tratadas

A Política declara:

* dados de conta enquanto a conta existir;
* logs por 12 meses;
* backups por 30 dias.

Mas não define adequadamente retenção para:

* BehaviorProfile;
* BehaviorAnomaly;
* localStorage de observações;
* audit log local;
* recovery contacts;
* fingerprints;
* wallet addresses;
* dados de risco;
* registros de segurança;
* eventos Sentry;
* traces;
* métricas;
* Service Worker cache.

A LGPD exige observância do princípio da necessidade e tratamento compatível com as finalidades informadas. A ANPD também enfatiza minimização e transparência no tratamento de cookies. ([Serviços e Informações do Brasil][9])

---

# 17. P1 — Termos de Uso são excessivamente curtos para o produto efetivamente oferecido

Os Termos possuem somente nove seções:

1. Aceitação;
2. Natureza;
3. Elegibilidade;
4. Riscos;
5. Responsabilidades;
6. Propriedade intelectual;
7. Disponibilidade;
8. Alterações;
9. Foro.

Para uma wallet com:

* transações;
* swaps;
* DApps;
* broadcast;
* threat intelligence;
* recovery;
* passkeys;
* comportamento;
* serviços pagos;
* integrações externas;

isso é insuficiente.

Faltam, entre outros:

* definição detalhada do serviço;
* natureza das integrações de terceiros;
* serviços de terceiros;
* RPCs;
* blockchain/network dependency;
* irreversibilidade das transações;
* taxas de rede;
* taxas da plataforma, quando existentes;
* swaps;
* riscos de smart contracts;
* riscos de bridges;
* oráculos;
* disponibilidade de terceiros;
* suspensão/bloqueio;
* encerramento de conta;
* consequências do encerramento;
* propriedade de conteúdo;
* licença de uso da interface;
* limitações juridicamente válidas de responsabilidade;
* força maior;
* notificações;
* alterações contratuais;
* tratamento de disputas;
* legislação aplicável;
* relação de consumo, quando aplicável;
* sanções/embargos;
* jurisdições proibidas;
* conformidade AML/CFT, quando aplicável;
* status regulatório.

---

# 18. P1 — "Como está" não é suficiente para afastar responsabilidade legal

Os Termos afirmam:

> "O serviço é prestado 'como está', sem garantias de disponibilidade contínua."

Essa cláusula não elimina automaticamente responsabilidades legais.

O Marco Civil garante, entre outros, proteção à privacidade, informações claras e completas e aplicação das normas de defesa do consumidor nas relações de consumo realizadas na internet. ([Presidência da República][3])

Portanto, o texto precisa ser estruturado de forma compatível com normas imperativas brasileiras, e não como uma exclusão ampla de responsabilidade.

---

# 19. P1 — Foro de Osasco/SP é juridicamente sensível em contrato de adesão

Os Termos estabelecem:

> "Comarca de Osasco/SP — Brasil."

O Marco Civil estabelece proteção específica ao usuário e prevê nulidade de determinadas cláusulas que não ofereçam alternativa de foro brasileiro em contrato de adesão relativo a serviços prestados no Brasil. ([Presidência da República][3])

A escolha de Osasco não é automaticamente inválida, mas a cláusula deveria ser compatibilizada com:

* relação de consumo;
* domicílio do consumidor;
* competência territorial;
* contrato de adesão;
* normas imperativas.

Não recomendo manter simplesmente "Foro de Osasco" sem essa qualificação.

---

# 20. P1 — Regulação de ativos virtuais precisa de classificação formal

A Lei nº 14.478/2022 define como PSAV a pessoa jurídica que, em nome de terceiros, execute determinados serviços, incluindo:

* troca de ativos virtuais;
* transferência;
* custódia/administração;
* controle sobre ativos;
* determinados serviços financeiros.

A prestação de serviços abrangidos pela definição depende de autorização federal. ([Presidência da República][10])

O TANK Wallet se apresenta como **não custodial**, o que é juridicamente relevante.

Porém, o código/documentação também menciona:

* `broadcast`;
* `swap`;
* signing;
* indexer;
* WalletConnect;
* Lightning;
* Account Abstraction;
* MPC;
* social recovery.

Isso não permite concluir, apenas pelo código, que END ART seja uma PSAV. Mas também **não é suficiente juridicamente simplesmente declarar "non-custodial"**.

É necessário documentar o perímetro:

> **o que END ART executa em nome do usuário e o que permanece exclusivamente no dispositivo do usuário.**

Isso deve ser refletido nos Termos.

A regulamentação do Banco Central já está em vigor para PSAVs, e a Resolução BCB nº 589/2026 alterou a Resolução BCB nº 520. Há ainda mudanças com vigência a partir de **01/10/2026**. ([Banco Central do Brasil][11])

---

# 21. P1 — Autocustódia não elimina todos os deveres regulatórios

O Banco Central já trata expressamente de carteiras autocustodiadas e, a partir de outubro de 2026, haverá regras específicas envolvendo determinadas transferências para/de carteiras autocustodiadas em valores relevantes. ([Banco Central do Brasil][12])

Isso reforça a necessidade de definir juridicamente se:

**A)** TANK é exclusivamente software de autocustódia; ou

**B)** TANK presta serviços de ativos virtuais em nome de terceiros.

Essa distinção deve ser documental e operacional, não apenas comercial.

---

# 22. P1 — Política de incidentes não está adequada à LGPD

Existe uma boa `SECURITY.md`, com:

* canal de segurança;
* PGP;
* SLA de resposta;
* processo de triagem;
* safe harbor;
* bug bounty;
* medidas técnicas.

Isso é positivo do ponto de vista de segurança operacional.

Porém, ela não substitui o procedimento específico de **incidente envolvendo dados pessoais**.

A Resolução CD/ANPD nº 15/2024 regulamenta comunicação de incidentes. A orientação oficial considera o prazo de **3 dias úteis** para comunicação à ANPD e aos titulares quando aplicável. ([Serviços e Informações do Brasil][13])

A documentação jurídica deveria estabelecer:

1. classificação do incidente;
2. identificação de dados pessoais afetados;
3. avaliação de risco/dano relevante;
4. acionamento do encarregado;
5. comunicação à ANPD;
6. comunicação aos titulares;
7. conteúdo mínimo;
8. registro do incidente;
9. preservação de evidências;
10. relacionamento com operadores.

---

# 23. P1 — Segurança declarada é superior à segurança comprovada

O README afirma:

* AES-256-GCM;
* PBKDF2;
* SecureBuffer;
* Shamir;
* WebAuthn;
* HMAC;
* CSP;
* PII sanitization;
* 16 engines.

Mas o próprio README informa:

* auditorias externas pendentes;
* pentests não executados;
* bug bounty público ainda pendente.

[SECURITY.md — política publicada](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/SECURITY.md?utm_source=chatgpt.com)

Portanto, juridicamente, publicidade e documentação deveriam evitar transformar **mecanismos projetados/implementados** em afirmações absolutas de segurança.

Exemplo particularmente sensível:

> "A hot wallet mais segura do mercado."

Essa afirmação aparece nos metadados da aplicação.

Não há auditoria externa que sustente comparativamente essa afirmação.

Para reduzir risco jurídico, a comunicação deveria utilizar afirmações objetivamente verificáveis.

---

# 24. P1 — CSP contém `unsafe-inline` e `unsafe-eval`

O `next.config.ts` publica:

```text
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```

Embora isso seja uma questão primordialmente técnica, ela interfere na declaração de segurança.

A Política e SECURITY.md devem distinguir:

* controles implementados;
* controles testados;
* controles auditados externamente.

---

# 25. P1 — Fallback de segredo do NextAuth

O código contém:

```text
NEXTAUTH_SECRET ?? "dev-secret-change-me"
```

Se o segredo não estiver configurado, existe um segredo previsível de fallback.

Mesmo que a intenção seja somente desenvolvimento, isso é inadequado em código de produção.

O projeto já documenta `NEXTAUTH_SECRET` como obrigatório, portanto existe uma inconsistência entre a governança declarada e o comportamento do código.

---

# 26. P1 — Audit Log não é realmente "imutável"

O código afirma:

> "Immutable (append-only)"

mas armazena o log em `localStorage`.

Também existe:

```text
clearAuditLog()
```

e qualquer script com acesso ao contexto da aplicação pode potencialmente modificar o armazenamento local.

O HMAC usa uma chave de sessão armazenada apenas em memória.

Isso significa que o mecanismo é **tamper-evident em determinadas condições**, não um registro juridicamente ou tecnicamente imutável.

A documentação deve usar linguagem mais precisa.

---

# 27. Propriedade intelectual — licença proprietária está presente

O `LICENSE` estabelece:

* Copyright © 2026 END ART Studios;
* All Rights Reserved;
* software proprietário;
* proibição de cópia;
* modificação;
* distribuição;
* sublicenciamento;
* publicação;
* engenharia reversa;
* uso sem autorização.

[LICENSE — TANK Wallet](https://github.com/ENDARTStudios/TANK-Wallet/blob/main/LICENSE?utm_source=chatgpt.com)

Isso é juridicamente coerente como declaração de titularidade do código próprio.

**Entretanto, existe um problema de terceiros.**

---

# 28. P1 — Conteúdo de terceiros dentro de repositório proprietário

O repositório contém uma cópia de GSAP em `gsap-public`.

O próprio código declara:

> GreenSock — Standard License.

Ou seja, esse material não se torna automaticamente propriedade exclusiva de END ART Studios apenas porque está dentro do repositório.

[GSAP incluído no repositório](https://github.com/ENDARTStudios/TANK-Wallet/tree/main/gsap-public?utm_source=chatgpt.com)

A cláusula do `LICENSE`:

> "No part of this software may be copied..."

não pode ser interpretada como concessão ou retirada de direitos que pertencem a terceiros.

### Necessário

O produto precisa manter:

* identificação das dependências;
* licença correspondente;
* avisos obrigatórios;
* termos de terceiros;
* compatibilidade da licença proprietária com cada componente redistribuído.

O `NOTICE` atual só trata da titularidade da END ART e não funciona como um inventário de licenças de terceiros.

---

# 29. P1 — Direitos autorais sobre dados externos

O TANK utiliza dados de:

* GoPlus;
* WHOIS/RDAP;
* RPCs;
* indexadores;
* threat intelligence;
* possíveis fontes de contratos/DApps.

A documentação jurídica precisa separar:

**a)** código próprio;

**b)** dados públicos;

**c)** bases de terceiros;

**d)** marcas e nomes comerciais;

**e)** APIs licenciadas;

**f)** conteúdo retornado por terceiros.

Não é juridicamente adequado afirmar genericamente que todo conteúdo exibido pelo produto pertence à END ART.

---

# 30. LGPD — base legal não está definida por finalidade

A Política descreve finalidades, mas não apresenta uma matriz:

| Tratamento         | Finalidade          | Base legal       |
| ------------------ | ------------------- | ---------------- |
| E-mail             | Conta               | não especificada |
| Autenticação       | Segurança           | não especificada |
| Wallet address     | Segurança           | não especificada |
| Device fingerprint | prevenção de fraude | não especificada |
| Behavior profile   | segurança           | não especificada |
| Audit log          | segurança           | não especificada |
| Recovery contact   | recuperação         | não especificada |
| Sentry             | observabilidade     | não especificada |
| OTel               | observabilidade     | não especificada |
| Comunicação        | suporte             | não especificada |

Essa matriz é necessária para demonstrar coerência entre tratamento, finalidade e hipótese legal.

---

# 31. Consentimento está sendo usado de forma excessivamente ampla

Termos e Política afirmam que o usuário precisa aceitar ambos obrigatoriamente.

Isso não significa que todo tratamento de dados passe a ter como base legal o consentimento.

A base legal precisa ser definida **por finalidade**.

Por exemplo, segurança, cumprimento de obrigação legal e execução de contrato podem ter fundamentos distintos.

Além disso, quando consentimento for realmente utilizado, a ANPD ressalta a necessidade de possibilidade de revogação por procedimento gratuito e facilitado. ([Serviços e Informações do Brasil][14])

---

# 32. P2 — Ausência de mecanismo público de gestão de consentimento

Não identifiquei mecanismo equivalente a:

* visualizar consentimentos;
* retirar consentimento;
* alterar preferências;
* visualizar versão do documento aceito;
* consultar data/hora;
* consultar finalidade.

A simples existência de checkbox de cadastro não resolve todo o ciclo de consentimento.

---

# 33. P2 — Política não diferencia controlador, operador e terceiros

Ela diz:

> "Compartilhamos apenas com processadores necessários."

Mas não identifica adequadamente:

* quem é controlador;
* quem é operador;
* quais terceiros atuam como operadores;
* quais podem ser controladores independentes;
* responsabilidades;
* finalidade de cada compartilhamento.

Isso é especialmente relevante para Sentry, infraestrutura, RPCs, serviços de threat intelligence e serviços de pagamento.

---

# 34. P2 — Retenção de registros do Marco Civil

O Marco Civil estabelece, para determinados provedores de aplicações constituídos como pessoa jurídica e que atuem profissionalmente com fins econômicos, guarda dos registros de acesso a aplicações por **seis meses**, sob sigilo e em ambiente controlado. ([Presidência da República][3])

A Política atual afirma retenções próprias, mas não estabelece claramente:

* quais registros são mantidos em cumprimento ao Marco Civil;
* quais são dados pessoais;
* quais são apagados;
* quais são preservados por obrigação legal;
* como ocorre a segregação entre registros legais e dados de produto.

Isso precisa ser harmonizado.

---

# 35. P2 — Política não explica adequadamente o encerramento da conta

A Política diz:

> "Dados de conta enquanto a conta existir."

Mas não explica:

* o que acontece ao apagar a conta;
* quais dados são eliminados;
* quais permanecem;
* por qual fundamento;
* por quanto tempo;
* quais backups ainda conterão dados;
* quando os backups expiram;
* o que acontece com audit logs;
* o que acontece com dados de segurança.

O Marco Civil prevê exclusão definitiva dos dados pessoais fornecidos ao término da relação, ressalvadas hipóteses de guarda obrigatória. ([Presidência da República][3])

---

# 36. P2 — Recovery Contacts são particularmente sensíveis para transparência

O sistema permite armazenar contatos de recuperação de terceiros.

Isso cria uma questão jurídica adicional:

**o titular do contato pode não ser o próprio usuário da TANK Wallet.**

Exemplo:

```text
Nome: João
Contato: joao@email.com
Tipo: email
```

A Política deveria explicar:

* que o usuário pode fornecer dados de terceiros;
* finalidade;
* responsabilidade do usuário pela legitimidade do fornecimento;
* retenção;
* direitos do terceiro;
* mecanismo de atendimento de solicitações.

---

# 37. P2 — Termos não disciplinam suficientemente dados de terceiros

Além de Recovery Contacts, o produto trabalha com:

* endereços de contrapartes;
* spender addresses;
* contratos;
* DApps;
* dados on-chain.

Os Termos deveriam deixar claro que determinadas informações podem representar terceiros e que a aplicação pode processá-las para fins de segurança, sem presumir que toda informação inserida pelo usuário seja exclusivamente dele.

---

# 38. P2 — Política não apresenta versão formal

Ela apresenta:

> "30 de agosto de 2026"

mas não apresenta uma estrutura robusta de:

* versão;
* vigência;
* versão anterior;
* changelog jurídico;
* documento efetivamente aceito;
* hash/identificador do documento.

Como o próprio sistema afirma registrar "versão" do aceite, isso deveria ser operacionalizado.

---

# 39. Situação regulatória atual — 29/09/2026

Há um ponto temporal importante.

A Resolução BCB nº 520/2025 disciplina a constituição e funcionamento das sociedades prestadoras de serviços de ativos virtuais. ([Banco Central do Brasil][11])

A Resolução BCB nº 589, de **23/09/2026**, alterou a Resolução 520. ([Banco Central do Brasil][15])

O próprio Banco Central informou que determinadas mudanças de PLDFT relativas a carteiras autocustodiadas entram em vigor em **01/10/2026**. ([Banco Central do Brasil][12])

Portanto, o TANK Wallet está sendo analisado em um momento regulatório imediatamente anterior a mudanças relevantes.

**O documento jurídico precisa declarar expressamente o enquadramento regulatório adotado pela END ART.**

---

# 40. O que está efetivamente bom

Há controles que estão documentados e são relevantes:

### Segurança

* CSP;
* HSTS;
* `X-Frame-Options`;
* `X-Content-Type-Options`;
* `Referrer-Policy`;
* `Permissions-Policy`;
* rate limiting;
* Sentry;
* OpenTelemetry;
* política de disclosure;
* PGP para vulnerabilidades;
* RBAC;
* arquitetura de segregação por workspace;
* testes automatizados;
* SBOM;
* CI/CD;
* dependabot.

A existência desses mecanismos é verificável no repositório.

### Jurídico

Também existem:

* Termos de Uso;
* Política de Privacidade;
* identificação empresarial;
* CNPJ;
* e-mail;
* canal de segurança;
* licença proprietária;
* aviso de copyright;
* jurisdição;
* declaração de autocustódia.

O problema não é ausência completa de estrutura jurídica. O problema é **desalinhamento entre documentação jurídica e implementação real**.

---

# 41. Matriz final de achados

| ID      | Achado                                                              | Severidade |
| ------- | ------------------------------------------------------------------- | ---------: |
| LEG-001 | Privacy Policy não descreve Behavior Engine                         |     **P0** |
| LEG-002 | Privacy Policy não descreve wallet/address/transaction profiling    |     **P0** |
| LEG-003 | Device fingerprint não informado                                    |     **P0** |
| LEG-004 | Automated risk scoring/blocking não tratado juridicamente           |     **P0** |
| LEG-005 | Aceite declarado, mas persistência não evidenciada no schema        |     **P0** |
| LEG-006 | DPO/Encarregado não identificado                                    |     **P0** |
| LEG-007 | Direitos do titular declarados sem implementação demonstrada        |     **P0** |
| SEC-001 | Senha comparada diretamente com valor armazenado                    |     **P0** |
| SEC-002 | `encryptPII()` não implementa AES-256-GCM                           |     **P0** |
| SEC-003 | RecoveryContact PII sem cifragem                                    |     **P1** |
| SEC-004 | Service Worker cacheia `/api/*`                                     |     **P1** |
| LEG-008 | Transferências internacionais não detalhadas                        |     **P1** |
| LEG-009 | Sentry/OTel insuficientemente descritos                             |     **P1** |
| LEG-010 | Retenção incompleta                                                 |     **P1** |
| LEG-011 | Termos insuficientes para funcionalidades atuais                    |     **P1** |
| LEG-012 | Perímetro PSAV/BCB não formalmente definido                         |     **P1** |
| IP-001  | Licença proprietária não resolve licenças de terceiros              |     **P1** |
| IP-002  | GSAP redistribuído sob licença própria de terceiro                  |     **P1** |
| LEG-013 | Incidentes LGPD não operacionalizados                               |     **P1** |
| LEG-014 | Encerramento/exclusão de conta insuficientemente definido           |     **P2** |
| LEG-015 | Recovery contacts de terceiros não tratados                         |     **P2** |
| LEG-016 | Política de cookies não cobre tecnologias de armazenamento          |     **P2** |
| LEG-017 | Bases legais não mapeadas por finalidade                            |     **P2** |
| LEG-018 | Versionamento jurídico insuficiente                                 |     **P2** |
| LEG-019 | Audit log chamado de "imutável" apesar de localStorage              |     **P2** |
| LEG-020 | Termos "as is" precisam ser compatibilizados com normas imperativas |     **P2** |

---

# 42. Conclusão jurídica

**O TANK Wallet possui uma estrutura jurídica inicial, mas a documentação publicada atualmente não representa fielmente o produto implementado.**

Os problemas mais relevantes não são meramente redacionais.

Existem **inconsistências objetivamente verificáveis entre código, documentação de compliance e documentos jurídicos**, principalmente:

1. **perfil comportamental e financeiro não refletido na Privacy Policy;**
2. **device fingerprint não declarado;**
3. **wallet addresses e dados de transações não adequadamente descritos;**
4. **decisões automatizadas de risco não tratadas;**
5. **DPO/encarregado não identificado;**
6. **direitos do titular sem implementação operacional demonstrada;**
7. **aceite de Termos/Privacidade declarado, mas não demonstrado no modelo de persistência;**
8. **senha armazenada/comparada de forma inadequada;**
9. **mecanismo denominado `encryptPII` não corresponde à criptografia AES-256-GCM declarada;**
10. **RecoveryContact contém PII sem cifragem;**
11. **transferências internacionais não documentadas conforme o regime atual da ANPD;**
12. **licença proprietária não resolve automaticamente as licenças de componentes de terceiros;**
13. **perímetro regulatório de PSAV precisa ser formalmente determinado antes da exploração comercial das funções financeiras.**

### Status da auditoria

**Juridicamente: NÃO APROVADO para ser tratado como "LGPD compliant" ou "juridicamente auditado" na versão atualmente publicada.**

Isso não significa que o produto seja ilegal. Significa que **não há base documental e técnica suficiente, no estado atual do repositório, para sustentar uma declaração de conformidade jurídica integral**.

A correção prioritária deve ser feita no sentido de **alinhar o produto real → inventário de dados → bases legais → Privacy Policy → direitos do titular → contratos com operadores → segurança → Termos de Uso → enquadramento regulatório**, eliminando as contradições atualmente existentes.

[1]: https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=589&tipo=Resolu%C3%A7%C3%A3o+BCB "Banco Central do Brasil"
[2]: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados?utm_source=chatgpt.com "Titular de Dados"
[3]: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm?utm_source=chatgpt.com "L12965"
[4]: https://www.gov.br/anpd/pt-br/canais_atendimento/cidadao-titular-de-dados/denuncia-peticao-de-titular-referente-lgpd?utm_source=chatgpt.com "Denúncia / Petição de Titular referente à LGPD"
[5]: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/copy_of_guia_da_atuacao_do_encarregado_anpd.pdf?utm_source=chatgpt.com "Da identidade e das informações de contato do encarregado"
[6]: https://www.egov.df.gov.br/wp-content/uploads/2025/07/Resolucao-CD-ANPD-no-18-de-16-de-julho-de-2024-1.pdf?utm_source=chatgpt.com "RESOLUÇÃO CD/ANPD Nº 18, DE 16 DE JULHO DE 2024 - RESOLUÇÃO CD/ANPD Nº 18, DE 16 DE JULHO DE 2024 - DOU - Imprensa Nacional"
[7]: https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024?utm_source=chatgpt.com "Resolução CD/ANPD nº 19, de 23 de agosto de 2024"
[8]: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais?trk=article-ssr-frontend-pulse_little-text-block&utm_source=chatgpt.com "Guia orientativo Cookies e proteção de dados pessoais"
[9]: https://www.gov.br/anpd/pt-br/assuntos/noticias-periodo-eleitoral/anpd-lanca-guia-orientativo-201ccookies-e-protecao-de-dados-pessoais201d?exec=ABproduct&irpid=irpid&utm_source=chatgpt.com "ANPD lança guia orientativo “Cookies e Proteção de Dados Pessoais”"
[10]: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14478.htm?utm_source=chatgpt.com "L14478"
[11]: https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=520&tipo=resolu%C3%A7%C3%A3o+bcb&utm_source=chatgpt.com "Exibe Normativo"
[12]: https://www.bcb.gov.br/detalhenoticia/21267/nota?utm_source=chatgpt.com "BC aprimora regras relativas à prestação de serviços de ativos virtuais"
[13]: https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi/guia_resposta_incidentes.pdf/%40%40download/file?utm_source=chatgpt.com "Guia de Resposta a Incidentes de"
[14]: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/processo-guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/%40%40display-file/file?utm_source=chatgpt.com "PRESIDÊNCIA DA REPÚBLICA"
[15]: https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=589&tipo=Resolu%C3%A7%C3%A3o+BCB&utm_source=chatgpt.com "Resolução BCB nº 589"
