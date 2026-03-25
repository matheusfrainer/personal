# Guia de Início Rápido

> Bem-vindo ao Claude Code!

Este guia de início rápido o colocará usando assistência de codificação alimentada por IA em poucos minutos. Ao final, você entenderá como usar Claude Code para tarefas comuns de desenvolvimento.

## Antes de começar

Certifique-se de que você tem:

* Um terminal ou prompt de comando aberto
  * Se você nunca usou o terminal antes, confira o [guia de terminal](/pt/terminal-guide)
* Um projeto de código para trabalhar
* Uma [assinatura Claude](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=quickstart_prereq) (Pro, Max, Teams ou Enterprise), conta do [Claude Console](https://console.anthropic.com/), ou acesso através de um [provedor de nuvem suportado](/pt/third-party-integrations)

<Note>
  Este guia cobre o CLI do terminal. Claude Code também está disponível na [web](https://claude.ai/code), como um [aplicativo de desktop](/pt/desktop), em [VS Code](/pt/vs-code) e [IDEs JetBrains](/pt/jetbrains), no [Slack](/pt/slack), e em CI/CD com [GitHub Actions](/pt/github-actions) e [GitLab](/pt/gitlab-ci-cd). Veja [todas as interfaces](/pt/overview#use-claude-code-everywhere).
</Note>

## Passo 1: Instale Claude Code

To install Claude Code, use one of the following methods:

<Tabs>
  <Tab title="Native Install (Recommended)">
    **macOS, Linux, WSL:**

    ```bash
    curl -fsSL https://claude.ai/install.sh | bash
    ```

    **Windows PowerShell:**

    ```powershell
    irm https://claude.ai/install.ps1 | iex
    ```

    **Windows CMD:**

    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
    ```

    **Windows requires [Git for Windows](https://git-scm.com/downloads/win).** Install it first if you don't have it.

    <Info>
      Native installations automatically update in the background to keep you on the latest version.
    </Info>
  </Tab>

  <Tab title="Homebrew">
    ```bash
    brew install --cask claude-code
    ```

    <Info>
      Homebrew installations do not auto-update. Run `brew upgrade claude-code` periodically to get the latest features and security fixes.
    </Info>
  </Tab>

  <Tab title="WinGet">
    ```powershell
    winget install Anthropic.ClaudeCode
    ```

    <Info>
      WinGet installations do not auto-update. Run `winget upgrade Anthropic.ClaudeCode` periodically to get the latest features and security fixes.
    </Info>
  </Tab>
</Tabs>

## Passo 2: Faça login em sua conta

Claude Code requer uma conta para usar. Quando você inicia uma sessão interativa com o comando `claude`, você precisará fazer login:

```bash
claude
# Você será solicitado a fazer login no primeiro uso
```

```bash
/login
# Siga os prompts para fazer login com sua conta
```

Você pode fazer login usando qualquer um destes tipos de conta:

* [Claude Pro, Max, Teams ou Enterprise](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=quickstart_login) (recomendado)
* [Claude Console](https://console.anthropic.com/) (acesso à API com créditos pré-pagos). No primeiro login, um workspace "Claude Code" é criado automaticamente no Console para rastreamento centralizado de custos.
* [Amazon Bedrock, Google Vertex AI ou Microsoft Foundry](/pt/third-party-integrations) (provedores de nuvem empresariais)

Depois de fazer login, suas credenciais são armazenadas e você não precisará fazer login novamente. Para trocar de conta mais tarde, use o comando `/login`.

## Passo 3: Inicie sua primeira sessão

Abra seu terminal em qualquer diretório de projeto e inicie Claude Code:

```bash
cd /path/to/your/project
claude
```

Você verá a tela de boas-vindas do Claude Code com as informações da sua sessão, conversas recentes e atualizações mais recentes. Digite `/help` para comandos disponíveis ou `/resume` para continuar uma conversa anterior.

<Tip>
  Depois de fazer login (Passo 2), suas credenciais são armazenadas em seu sistema. Saiba mais em [Gerenciamento de Credenciais](/pt/authentication#credential-management).
</Tip>

## Passo 4: Faça sua primeira pergunta

Vamos começar entendendo sua base de código. Tente um destes comandos:

```text
what does this project do?
```

Claude analisará seus arquivos e fornecerá um resumo. Você também pode fazer perguntas mais específicas:

```text
what technologies does this project use?
```

```text
where is the main entry point?
```

```text
explain the folder structure
```

Você também pode perguntar ao Claude sobre suas próprias capacidades:

```text
what can Claude Code do?
```

```text
how do I create custom skills in Claude Code?
```

```text
can Claude Code work with Docker?
```

<Note>
  Claude Code lê seus arquivos de projeto conforme necessário. Você não precisa adicionar contexto manualmente.
</Note>

## Passo 5: Faça sua primeira alteração de código

Agora vamos fazer Claude Code fazer alguma codificação real. Tente uma tarefa simples:

```text
add a hello world function to the main file
```

Claude Code irá:

1. Encontrar o arquivo apropriado
2. Mostrar as alterações propostas
3. Pedir sua aprovação
4. Fazer a edição

<Note>
  Claude Code sempre pede permissão antes de modificar arquivos. Você pode aprovar alterações individuais ou ativar o modo "Aceitar tudo" para uma sessão.
</Note>

## Passo 6: Use Git com Claude Code

Claude Code torna as operações Git conversacionais:

```text
what files have I changed?
```

```text
commit my changes with a descriptive message
```

Você também pode solicitar operações Git mais complexas:

```text
create a new branch called feature/quickstart
```

```text
show me the last 5 commits
```

```text
help me resolve merge conflicts
```

## Passo 7: Corrija um bug ou adicione um recurso

Claude é proficiente em depuração e implementação de recursos.

Descreva o que você quer em linguagem natural:

```text
add input validation to the user registration form
```

Ou corrija problemas existentes:

```text
there's a bug where users can submit empty forms - fix it
```

Claude Code irá:

* Localizar o código relevante
* Entender o contexto
* Implementar uma solução
* Executar testes se disponíveis

## Passo 8: Teste outros fluxos de trabalho comuns

Existem várias maneiras de trabalhar com Claude:

**Refatore código**

```text
refactor the authentication module to use async/await instead of callbacks
```

**Escreva testes**

```text
write unit tests for the calculator functions
```

**Atualize documentação**

```text
update the README with installation instructions
```

**Revisão de código**

```text
review my changes and suggest improvements
```

<Tip>
  Fale com Claude como você falaria com um colega prestativo. Descreva o que você quer alcançar, e ele o ajudará a chegar lá.
</Tip>

## Comandos essenciais

Aqui estão os comandos mais importantes para uso diário:

| Comando             | O que faz                                          | Exemplo                             |
| ------------------- | -------------------------------------------------- | ----------------------------------- |
| `claude`            | Iniciar modo interativo                            | `claude`                            |
| `claude "task"`     | Executar uma tarefa única                          | `claude "fix the build error"`      |
| `claude -p "query"` | Executar consulta única, depois sair               | `claude -p "explain this function"` |
| `claude -c`         | Continuar conversa mais recente no diretório atual | `claude -c`                         |
| `claude -r`         | Retomar uma conversa anterior                      | `claude -r`                         |
| `claude commit`     | Criar um commit Git                                | `claude commit`                     |
| `/clear`            | Limpar histórico de conversa                       | `/clear`                            |
| `/help`             | Mostrar comandos disponíveis                       | `/help`                             |
| `exit` ou Ctrl+C    | Sair do Claude Code                                | `exit`                              |

Veja a [referência CLI](/pt/cli-reference) para uma lista completa de comandos.

## Dicas profissionais para iniciantes

Para mais, veja [melhores práticas](/pt/best-practices) e [fluxos de trabalho comuns](/pt/common-workflows).

<AccordionGroup>
  <Accordion title="Seja específico com seus pedidos">
    Em vez de: "fix the bug"

    Tente: "fix the login bug where users see a blank screen after entering wrong credentials"
  </Accordion>

  <Accordion title="Use instruções passo a passo">
    Divida tarefas complexas em etapas:

    ```text
    1. create a new database table for user profiles
    2. create an API endpoint to get and update user profiles
    3. build a webpage that allows users to see and edit their information
    ```
  </Accordion>

  <Accordion title="Deixe Claude explorar primeiro">
    Antes de fazer alterações, deixe Claude entender seu código:

    ```text
    analyze the database schema
    ```

    ```text
    build a dashboard showing products that are most frequently returned by our UK customers
    ```
  </Accordion>

  <Accordion title="Economize tempo com atalhos">
    * Pressione `?` para ver todos os atalhos de teclado disponíveis
    * Use Tab para conclusão de comando
    * Pressione ↑ para histórico de comando
    * Digite `/` para ver todos os comandos e skills
  </Accordion>
</AccordionGroup>

## Próximos passos

Agora que você aprendeu o básico, explore recursos mais avançados:

<CardGroup cols={2}>
  <Card title="Como Claude Code funciona" icon="microchip" href="/pt/how-claude-code-works">
    Entenda o loop agêntico, ferramentas integradas e como Claude Code interage com seu projeto
  </Card>

  <Card title="Melhores práticas" icon="star" href="/pt/best-practices">
    Obtenha melhores resultados com prompting eficaz e configuração de projeto
  </Card>

  <Card title="Fluxos de trabalho comuns" icon="graduation-cap" href="/pt/common-workflows">
    Guias passo a passo para tarefas comuns
  </Card>

  <Card title="Estenda Claude Code" icon="puzzle-piece" href="/pt/features-overview">
    Personalize com CLAUDE.md, skills, hooks, MCP e muito mais
  </Card>
</CardGroup>

## Obtendo ajuda

* **Em Claude Code**: Digite `/help` ou pergunte "how do I..."
* **Documentação**: Você está aqui! Navegue por outros guias
* **Comunidade**: Junte-se ao nosso [Discord](https://www.anthropic.com/discord) para dicas e suporte
