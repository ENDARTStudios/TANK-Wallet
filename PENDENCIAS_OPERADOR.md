# PENDENCIAS_OPERADOR.md

> Fila de ações manuais do Operador — bloqueios que não podem ser
> automatizados. Formatado conforme Seção 7 do `PROTOCOLO_MESTRE.md`.
>
> Mantenedor: Doer (adiciona itens)
> Resolve: Operador (responde "feito o item Nº X")

---

### [1] Ativar GitHub Security Advisories
Por quê: Permite que pesquisadores reportem vulnerabilidades diretamente pelo GitHub, de forma privada e rastreada.
Onde: GitHub → aba "Security" do repositório → "Advisories"
Passo a passo:
1. Acesse o repositório no GitHub
2. Clique na aba "Security"
3. No menu lateral, clique em "Advisories"
4. Clique em "Enable security advisories" (ou "Ativar avisos de segurança")
5. Confirme a ativação
Como saber que deu certo: A página de Advisories mostra "Enabled" e permite criar novos advisories
Depois de feito: responda "feito o item Nº 1"

### [2] Guardar chave privada PGP com segurança
Por quê: A chave privada PGP é usada para descriptografar reports de vulnerabilidade enviados por pesquisadores. Se perdida, reports ficam inacessíveis.
Onde: Computador pessoal do Operador (NUNCA no repositório)
Passo a passo:
1. A chave privada foi gerada pelo Doer e está disponível temporariamente neste ambiente
2. Exporte a chave privada: `gpg --export-secret-keys "Tank Wallet Security" > tank-wallet-sec-private.key`
3. Guarde o arquivo `tank-wallet-sec-private.key` em local seguro (pen drive criptografado, gerenciador de senhas, ou 1Password/Bitwarden)
4. Delete o arquivo do computador após guardar: `shred -u tank-wallet-sec-private.key`
5. A chave pública já está commitada em `docs/security/pgp-key.asc` — não é sensível
Como saber que deu certo: Você consegue importar a chave privada em outro computador com `gpg --import tank-wallet-sec-private.key` e ela mostra "Tank Wallet Security"
Depois de feito: responda "feito o item Nº 2"

### [3] Criar conta e lançar bug bounty no Immunefi
Por quê: O bug bounty público permite que pesquisadores encontrem vulnerabilidades por recompensa. É a principal camada de validação externa gratuita.
Onde: https://immunefi.com/
Passo a passo: ver `docs/security/bug-bounty-launch-guide.md` (guia completo)
Como saber que deu certo: O programa aparece em https://immunefi.com/bounty/tankwallet
Depois de feito: responda "feito o item Nº 3"

---

<!-- Novas pendências são adicionadas acima deste comentário:
### [Nº] Título curto
Por quê: <1 frase, sem jargão>
Onde: <nome exato do site/app, com link>
Passo a passo:
1. ...
Como saber que deu certo: <o que aparece na tela>
Depois de feito: responda "feito o item Nº X"
-->
