# Autenticação

> Faça login no Claude Code e configure a autenticação para indivíduos, equipes e organizações.

Claude Code suporta múltiplos métodos de autenticação dependendo da sua configuração. Usuários individuais podem fazer login com uma conta Claude.ai, enquanto equipes podem usar Claude for Teams ou Enterprise, o Claude Console, ou um provedor de nuvem como Amazon Bedrock, Google Vertex AI ou Microsoft Foundry.

## Faça login no Claude Code

Após [instalar Claude Code](/pt/setup#install-claude-code), execute `claude` no seu terminal. No primeiro lançamento, Claude Code abre uma janela do navegador para você fazer login.

Se o navegador não abrir automaticamente, pressione `c` para copiar a URL de login para sua área de transferência, depois cole-a no seu navegador.

Você pode se autenticar com qualquer um destes tipos de conta:

* **Assinatura Claude Pro ou Max**: faça login com sua conta Claude.ai. Assine em [claude.com/pricing](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=authentication_pro_max).
* **Claude for Teams ou Enterprise**: faça login com a conta Claude.ai que seu administrador de equipe o convidou.
* **Claude Console**: faça login com suas credenciais do Console. Seu administrador deve ter [o convidado](#claude-console-authentication) primeiro.
* **Provedores de nuvem**: se sua organização usa [Amazon Bedrock](/pt/amazon-bedrock), [Google Vertex AI](/pt/google-vertex-ai) ou [Microsoft Foundry](/pt/microsoft-foundry), defina as variáveis de ambiente necessárias antes de executar `claude`. Nenhum login do navegador é necessário.

Para fazer logout e se autenticar novamente, digite `/logout` no prompt do Claude Code.

Se você está tendo problemas para fazer login, consulte [solução de problemas de autenticação](/pt/troubleshooting#authentication-issues).

## Configure a autenticação da equipe

Para equipes e organizações, você pode configurar o acesso ao Claude Code de uma destas formas:

* [Claude for Teams ou Enterprise](#claude-for-teams-or-enterprise), recomendado para a maioria das equipes
* [Claude Console](#claude-console-authentication)
* [Amazon Bedrock](/pt/amazon-bedrock)
* [Google Vertex AI](/pt/google-vertex-ai)
* [Microsoft Foundry](/pt/microsoft-foundry)

### Claude for Teams ou Enterprise

[Claude for Teams](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=authentication_teams#team-&-enterprise) e [Claude for Enterprise](https://anthropic.com/contact-sales?utm_source=claude_code&utm_medium=docs&utm_content=authentication_enterprise) fornecem a melhor experiência para organizações usando Claude Code. Os membros da equipe obtêm acesso tanto ao Claude Code quanto ao Claude na web com faturamento centralizado e gerenciamento de equipe.

* **Claude for Teams**: plano de autoatendimento com recursos de colaboração, ferramentas de administração e gerenciamento de faturamento. Melhor para equipes menores.
* **Claude for Enterprise**: adiciona SSO, captura de domínio, permissões baseadas em funções, API de conformidade e configurações de política gerenciada para configurações de Claude Code em toda a organização. Melhor para organizações maiores com requisitos de segurança e conformidade.

#### Passos

1. **Assine**: Assine [Claude for Teams](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=authentication_teams_step#team-&-enterprise) ou entre em contato com vendas para [Claude for Enterprise](https://anthropic.com/contact-sales?utm_source=claude_code&utm_medium=docs&utm_content=authentication_enterprise_step).

2. **Convide membros da equipe**: Convide membros da equipe do painel de administração.

3. **Instale e faça login**: Os membros da equipe instalam Claude Code e fazem login com suas contas Claude.ai.

### Autenticação do Claude Console

Para organizações que preferem faturamento baseado em API, você pode configurar o acesso através do Claude Console.

#### Passos

1. **Crie ou use uma conta do Console**: Use sua conta Claude Console existente ou crie uma nova.

2. **Adicione usuários**: Você pode adicionar usuários através de qualquer um dos métodos:
   * Convide usuários em massa de dentro do Console: Settings -> Members -> Invite
   * [Configure SSO](https://support.claude.com/en/articles/13132885-setting-up-single-sign-on-sso)

3. **Atribua funções**: Ao convidar usuários, atribua uma das seguintes:
   * **Função Claude Code**: usuários podem apenas criar chaves de API do Claude Code
   * **Função Developer**: usuários podem criar qualquer tipo de chave de API

4. **Usuários completam a configuração**: Cada usuário convidado precisa:
   * Aceitar o convite do Console
   * [Verificar requisitos do sistema](/pt/setup#system-requirements)
   * [Instalar Claude Code](/pt/setup#install-claude-code)
   * Fazer login com credenciais da conta do Console

### Autenticação do provedor de nuvem

Para equipes usando Amazon Bedrock, Google Vertex AI ou Microsoft Foundry:

#### Passos

1. **Siga a configuração do provedor**: Siga a [documentação do Bedrock](/pt/amazon-bedrock), [documentação do Vertex](/pt/google-vertex-ai) ou [documentação do Microsoft Foundry](/pt/microsoft-foundry).

2. **Distribua a configuração**: Distribua as variáveis de ambiente e instruções para gerar credenciais de nuvem para seus usuários. Leia mais sobre como [gerenciar a configuração aqui](/pt/settings).

3. **Instale Claude Code**: Os usuários podem [instalar Claude Code](/pt/setup#install-claude-code).

## Gerenciamento de credenciais

Claude Code gerencia com segurança suas credenciais de autenticação:

* **Local de armazenamento**: no macOS, as credenciais são armazenadas no Keychain do macOS criptografado.
* **Tipos de autenticação suportados**: credenciais Claude.ai, credenciais da API Claude, Azure Auth, Bedrock Auth e Vertex Auth.
* **Scripts de credenciais personalizados**: a configuração [`apiKeyHelper`](/pt/settings#available-settings) pode ser configurada para executar um script de shell que retorna uma chave de API.
* **Intervalos de atualização**: por padrão, `apiKeyHelper` é chamado após 5 minutos ou em resposta HTTP 401. Defina a variável de ambiente `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` para intervalos de atualização personalizados.
