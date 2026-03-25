> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Criar subagentes personalizados

> Crie e use subagentes de IA especializados no Claude Code para fluxos de trabalho específicos de tarefas e gerenciamento de contexto aprimorado.

Subagentes são assistentes de IA especializados que lidam com tipos específicos de tarefas. Cada subagente é executado em sua própria janela de contexto com um prompt de sistema personalizado, acesso a ferramentas específicas e permissões independentes. Quando Claude encontra uma tarefa que corresponde à descrição de um subagente, ele delega para esse subagente, que funciona independentemente e retorna resultados.

<Note>
  Se você precisa de múltiplos agentes trabalhando em paralelo e se comunicando entre si, consulte [equipes de agentes](/pt/agent-teams) em vez disso. Subagentes funcionam dentro de uma única sessão; equipes de agentes coordenam entre sessões separadas.
</Note>

Subagentes ajudam você a:

* **Preservar contexto** mantendo exploração e implementação fora de sua conversa principal
* **Aplicar restrições** limitando quais ferramentas um subagente pode usar
* **Reutilizar configurações** entre projetos com subagentes no nível do usuário
* **Especializar comportamento** com prompts de sistema focados para domínios específicos
* **Controlar custos** roteando tarefas para modelos mais rápidos e baratos como Haiku

Claude usa a descrição de cada subagente para decidir quando delegar tarefas. Quando você cria um subagente, escreva uma descrição clara para que Claude saiba quando usá-lo.

Claude Code inclui vários subagentes integrados como **Explore**, **Plan** e **general-purpose**. Você também pode criar subagentes personalizados para lidar com tarefas específicas. Esta página cobre os [subagentes integrados](#built-in-subagents), [como criar o seu próprio](#quickstart-create-your-first-subagent), [opções de configuração completas](#configure-subagents), [padrões para trabalhar com subagentes](#work-with-subagents) e [subagentes de exemplo](#example-subagents).

## Subagentes integrados

Claude Code inclui subagentes integrados que Claude usa automaticamente quando apropriado. Cada um herda as permissões da conversa pai com restrições de ferramentas adicionais.

<Tabs>
  <Tab title="Explore">
    Um agente rápido e somente leitura otimizado para pesquisar e analisar bases de código.

    * **Model**: Haiku (rápido, baixa latência)
    * **Tools**: Ferramentas somente leitura (acesso negado a ferramentas Write e Edit)
    * **Purpose**: Descoberta de arquivos, pesquisa de código, exploração de base de código

    Claude delega para Explore quando precisa pesquisar ou entender uma base de código sem fazer alterações. Isso mantém os resultados da exploração fora do contexto da sua conversa principal.

    Ao invocar Explore, Claude especifica um nível de minuciosidade: **quick** para buscas direcionadas, **medium** para exploração equilibrada, ou **very thorough** para análise abrangente.
  </Tab>

  <Tab title="Plan">
    Um agente de pesquisa usado durante [plan mode](/pt/common-workflows#use-plan-mode-for-safe-code-analysis) para reunir contexto antes de apresentar um plano.

    * **Model**: Herda da conversa principal
    * **Tools**: Ferramentas somente leitura (acesso negado a ferramentas Write e Edit)
    * **Purpose**: Pesquisa de base de código para planejamento

    Quando você está em plan mode e Claude precisa entender sua base de código, ele delega a pesquisa para o subagente Plan. Isso evita aninhamento infinito (subagentes não podem gerar outros subagentes) enquanto ainda reúne o contexto necessário.
  </Tab>

  <Tab title="General-purpose">
    Um agente capaz para tarefas complexas e multi-etapas que requerem exploração e ação.

    * **Model**: Herda da conversa principal
    * **Tools**: Todas as ferramentas
    * **Purpose**: Pesquisa complexa, operações multi-etapas, modificações de código

    Claude delega para general-purpose quando a tarefa requer exploração e modificação, raciocínio complexo para interpretar resultados, ou múltiplas etapas dependentes.
  </Tab>

  <Tab title="Other">
    Claude Code inclui agentes auxiliares adicionais para tarefas específicas. Estes são normalmente invocados automaticamente, então você não precisa usá-los diretamente.

    | Agent             | Model  | When Claude uses it                                                   |
    | :---------------- | :----- | :-------------------------------------------------------------------- |
    | Bash              | Herda  | Executando comandos de terminal em um contexto separado               |
    | statusline-setup  | Sonnet | Quando você executa `/statusline` para configurar sua linha de status |
    | Claude Code Guide | Haiku  | Quando você faz perguntas sobre recursos do Claude Code               |
  </Tab>
</Tabs>

Além desses subagentes integrados, você pode criar os seus próprios com prompts personalizados, restrições de ferramentas, modos de permissão, hooks e skills. As seções a seguir mostram como começar e personalizar subagentes.

## Quickstart: criar seu primeiro subagente

Subagentes são definidos em arquivos Markdown com frontmatter YAML. Você pode [criá-los manualmente](#write-subagent-files) ou usar o comando `/agents`.

Este passo a passo o guia através da criação de um subagente no nível do usuário com o comando `/agents`. O subagente revisa código e sugere melhorias para a base de código.

<Steps>
  <Step title="Abrir a interface de subagentes">
    No Claude Code, execute:

    ```text  theme={null}
    /agents
    ```
  </Step>

  <Step title="Escolher um local">
    Selecione **Create new agent**, depois escolha **Personal**. Isso salva o subagente em `~/.claude/agents/` para que esteja disponível em todos os seus projetos.
  </Step>

  <Step title="Gerar com Claude">
    Selecione **Generate with Claude**. Quando solicitado, descreva o subagente:

    ```text  theme={null}
    A code improvement agent that scans files and suggests improvements
    for readability, performance, and best practices. It should explain
    each issue, show the current code, and provide an improved version.
    ```

    Claude gera o identificador, descrição e prompt de sistema para você.
  </Step>

  <Step title="Selecionar ferramentas">
    Para um revisor somente leitura, desselecione tudo exceto **Read-only tools**. Se você manter todas as ferramentas selecionadas, o subagente herda todas as ferramentas disponíveis para a conversa principal.
  </Step>

  <Step title="Selecionar modelo">
    Escolha qual modelo o subagente usa. Para este agente de exemplo, selecione **Sonnet**, que equilibra capacidade e velocidade para analisar padrões de código.
  </Step>

  <Step title="Escolher uma cor">
    Escolha uma cor de fundo para o subagente. Isso ajuda você a identificar qual subagente está sendo executado na interface do usuário.
  </Step>

  <Step title="Configurar memória">
    Selecione **User scope** para dar ao subagente um [diretório de memória persistente](#enable-persistent-memory) em `~/.claude/agent-memory/`. O subagente usa isso para acumular insights entre conversas, como padrões de base de código e problemas recorrentes. Selecione **None** se você não quiser que o subagente persista aprendizados.
  </Step>

  <Step title="Salvar e testar">
    Revise o resumo de configuração. Pressione `s` ou `Enter` para salvar, ou pressione `e` para salvar e editar o arquivo em seu editor. O subagente está disponível imediatamente. Teste-o:

    ```text  theme={null}
    Use the code-improver agent to suggest improvements in this project
    ```

    Claude delega para seu novo subagente, que verifica a base de código e retorna sugestões de melhoria.
  </Step>
</Steps>

Agora você tem um subagente que pode usar em qualquer projeto em sua máquina para analisar bases de código e sugerir melhorias.

Você também pode criar subagentes manualmente como arquivos Markdown, defini-los via flags CLI, ou distribuí-los através de plugins. As seções a seguir cobrem todas as opções de configuração.

## Configurar subagentes

### Usar o comando /agents

O comando `/agents` fornece uma interface interativa para gerenciar subagentes. Execute `/agents` para:

* Visualizar todos os subagentes disponíveis (integrados, usuário, projeto e plugin)
* Criar novos subagentes com configuração guiada ou geração por Claude
* Editar configuração de subagente existente e acesso a ferramentas
* Deletar subagentes personalizados
* Ver quais subagentes estão ativos quando duplicatas existem

Esta é a forma recomendada de criar e gerenciar subagentes. Para criação manual ou automação, você também pode adicionar arquivos de subagente diretamente.

Para listar todos os subagentes configurados da linha de comando sem iniciar uma sessão interativa, execute `claude agents`. Isso mostra agentes agrupados por fonte e indica quais são substituídos por definições de prioridade mais alta.

### Escolher o escopo do subagente

Subagentes são arquivos Markdown com frontmatter YAML. Armazene-os em locais diferentes dependendo do escopo. Quando múltiplos subagentes compartilham o mesmo nome, o local de prioridade mais alta vence.

| Location                      | Scope                         | Priority       | How to create                        |
| :---------------------------- | :---------------------------- | :------------- | :----------------------------------- |
| `--agents` CLI flag           | Sessão atual                  | 1 (mais alta)  | Passar JSON ao iniciar Claude Code   |
| `.claude/agents/`             | Projeto atual                 | 2              | Interativo ou manual                 |
| `~/.claude/agents/`           | Todos os seus projetos        | 3              | Interativo ou manual                 |
| Diretório `agents/` do Plugin | Onde o plugin está habilitado | 4 (mais baixa) | Instalado com [plugins](/pt/plugins) |

**Subagentes de projeto** (`.claude/agents/`) são ideais para subagentes específicos de uma base de código. Verifique-os no controle de versão para que sua equipe possa usá-los e melhorá-los colaborativamente.

**Subagentes de usuário** (`~/.claude/agents/`) são subagentes pessoais disponíveis em todos os seus projetos.

**Subagentes definidos por CLI** são passados como JSON ao iniciar Claude Code. Eles existem apenas para essa sessão e não são salvos em disco, tornando-os úteis para testes rápidos ou scripts de automação. Você pode definir múltiplos subagentes em uma única chamada `--agents`:

```bash  theme={null}
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
```

O flag `--agents` aceita JSON com os mesmos campos de [frontmatter](#supported-frontmatter-fields) que subagentes baseados em arquivo: `description`, `prompt`, `tools`, `disallowedTools`, `model`, `permissionMode`, `mcpServers`, `hooks`, `maxTurns`, `skills`, `memory`, `effort`, `background` e `isolation`. Use `prompt` para o prompt de sistema, equivalente ao corpo markdown em subagentes baseados em arquivo.

**Subagentes de plugin** vêm de [plugins](/pt/plugins) que você instalou. Eles aparecem em `/agents` junto com seus subagentes personalizados. Veja a [referência de componentes de plugin](/pt/plugins-reference#agents) para detalhes sobre como criar subagentes de plugin.

<Note>
  Por razões de segurança, subagentes de plugin não suportam os campos de frontmatter `hooks`, `mcpServers` ou `permissionMode`. Estes campos são ignorados ao carregar agentes de um plugin. Se você precisar deles, copie o arquivo do agente para `.claude/agents/` ou `~/.claude/agents/`. Você também pode adicionar regras a [`permissions.allow`](/pt/settings#permission-settings) em `settings.json` ou `settings.local.json`, mas estas regras se aplicam a toda a sessão, não apenas ao subagente do plugin.
</Note>

### Escrever arquivos de subagente

Arquivos de subagente usam frontmatter YAML para configuração, seguido pelo prompt de sistema em Markdown:

<Note>
  Subagentes são carregados no início da sessão. Se você criar um subagente adicionando manualmente um arquivo, reinicie sua sessão ou use `/agents` para carregá-lo imediatamente.
</Note>

```markdown  theme={null}
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

O frontmatter define os metadados e configuração do subagente. O corpo se torna o prompt de sistema que guia o comportamento do subagente. Subagentes recebem apenas este prompt de sistema (mais detalhes básicos de ambiente como diretório de trabalho), não o prompt de sistema completo do Claude Code.

#### Campos de frontmatter suportados

Os seguintes campos podem ser usados no frontmatter YAML. Apenas `name` e `description` são obrigatórios.

| Field             | Required | Description                                                                                                                                                                                                                                                                                                  |
| :---------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | Yes      | Identificador único usando letras minúsculas e hífens                                                                                                                                                                                                                                                        |
| `description`     | Yes      | Quando Claude deve delegar para este subagente                                                                                                                                                                                                                                                               |
| `tools`           | No       | [Ferramentas](#available-tools) que o subagente pode usar. Herda todas as ferramentas se omitido                                                                                                                                                                                                             |
| `disallowedTools` | No       | Ferramentas a negar, removidas da lista herdada ou especificada                                                                                                                                                                                                                                              |
| `model`           | No       | [Modelo](#choose-a-model) a usar: `sonnet`, `opus`, `haiku`, um ID de modelo completo (por exemplo, `claude-opus-4-6`), ou `inherit`. Padrão: `inherit`                                                                                                                                                      |
| `permissionMode`  | No       | [Modo de permissão](#permission-modes): `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, ou `plan`                                                                                                                                                                                                  |
| `maxTurns`        | No       | Número máximo de turnos de agente antes do subagente parar                                                                                                                                                                                                                                                   |
| `skills`          | No       | [Skills](/pt/skills) a carregar no contexto do subagente na inicialização. O conteúdo completo da skill é injetado, não apenas disponibilizado para invocação. Subagentes não herdam skills da conversa pai                                                                                                  |
| `mcpServers`      | No       | [MCP servers](/pt/mcp) disponíveis para este subagente. Cada entrada é um nome de servidor referenciando um servidor já configurado (por exemplo, `"slack"`) ou uma definição inline com o nome do servidor como chave e uma [configuração completa de MCP server](/pt/mcp#configure-mcp-servers) como valor |
| `hooks`           | No       | [Lifecycle hooks](#define-hooks-for-subagents) com escopo para este subagente                                                                                                                                                                                                                                |
| `memory`          | No       | [Escopo de memória persistente](#enable-persistent-memory): `user`, `project`, ou `local`. Habilita aprendizado entre sessões                                                                                                                                                                                |
| `background`      | No       | Defina como `true` para sempre executar este subagente como uma [tarefa em background](#run-subagents-in-foreground-or-background). Padrão: `false`                                                                                                                                                          |
| `isolation`       | No       | Defina como `worktree` para executar o subagente em um [git worktree](/pt/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees) temporário, dando-lhe uma cópia isolada do repositório. O worktree é automaticamente limpo se o subagente não fizer alterações                              |

### Escolher um modelo

O campo `model` controla qual [modelo de IA](/pt/model-config) o subagente usa:

* **Alias de modelo**: Use um dos aliases disponíveis: `sonnet`, `opus`, ou `haiku`
* **ID de modelo completo**: Use um ID de modelo completo como `claude-opus-4-6` ou `claude-sonnet-4-6`. Aceita os mesmos valores que o flag `--model`
* **inherit**: Use o mesmo modelo que a conversa principal
* **Omitido**: Se não especificado, padrão é `inherit` (usa o mesmo modelo que a conversa principal)

### Controlar capacidades do subagente

Você pode controlar o que subagentes podem fazer através de acesso a ferramentas, modos de permissão e regras condicionais.

#### Ferramentas disponíveis

Subagentes podem usar qualquer uma das [ferramentas internas](/pt/tools-reference) do Claude Code. Por padrão, subagentes herdam todas as ferramentas da conversa principal, incluindo ferramentas MCP.

Para restringir ferramentas, use o campo `tools` (lista de permissões) ou campo `disallowedTools` (lista de negação). Este exemplo usa `tools` para permitir exclusivamente Read, Grep, Glob e Bash. O subagente não pode editar arquivos, escrever arquivos ou usar qualquer ferramenta MCP:

```yaml  theme={null}
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
---
```

Este exemplo usa `disallowedTools` para herdar todas as ferramentas da conversa principal exceto Write e Edit. O subagente mantém Bash, ferramentas MCP e tudo mais:

```yaml  theme={null}
---
name: no-writes
description: Inherits every tool except file writes
disallowedTools: Write, Edit
---
```

Se ambos forem definidos, `disallowedTools` é aplicado primeiro, depois `tools` é resolvido contra o pool restante. Uma ferramenta listada em ambos é removida.

#### Restringir quais subagentes podem ser gerados

Quando um agente é executado como thread principal com `claude --agent`, ele pode gerar subagentes usando a ferramenta Agent. Para restringir quais tipos de subagente ele pode gerar, use a sintaxe `Agent(agent_type)` no campo `tools`.

<Note>Na versão 2.1.63, a ferramenta Task foi renomeada para Agent. Referências existentes de `Task(...)` em configurações e definições de agente ainda funcionam como aliases.</Note>

```yaml  theme={null}
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

Esta é uma lista de permissões: apenas os subagentes `worker` e `researcher` podem ser gerados. Se o agente tentar gerar qualquer outro tipo, a solicitação falha e o agente vê apenas os tipos permitidos em seu prompt. Para bloquear agentes específicos enquanto permite todos os outros, use [`permissions.deny`](#disable-specific-subagents) em vez disso.

Para permitir gerar qualquer subagente sem restrições, use `Agent` sem parênteses:

```yaml  theme={null}
tools: Agent, Read, Bash
```

Se `Agent` for omitido da lista `tools` inteiramente, o agente não pode gerar nenhum subagente. Esta restrição se aplica apenas a agentes executados como thread principal com `claude --agent`. Subagentes não podem gerar outros subagentes, então `Agent(agent_type)` não tem efeito em definições de subagente.

#### Escopo de MCP servers para um subagente

Use o campo `mcpServers` para dar a um subagente acesso a [MCP](/pt/mcp) servers que não estão disponíveis na conversa principal. Servidores inline definidos aqui são conectados quando o subagente inicia e desconectados quando termina. Referências de string compartilham a conexão da sessão pai.

Cada entrada na lista é uma definição de servidor inline ou uma string referenciando um MCP server já configurado em sua sessão:

```yaml  theme={null}
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # Inline definition: scoped to this subagent only
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # Reference by name: reuses an already-configured server
  - github
---

Use the Playwright tools to navigate, screenshot, and interact with pages.
```

Definições inline usam o mesmo schema que entradas de servidor `.mcp.json` (`stdio`, `http`, `sse`, `ws`), com chave pelo nome do servidor.

Para manter um MCP server fora da conversa principal inteiramente e evitar que suas descrições de ferramentas consumam contexto lá, defina-o inline aqui em vez de em `.mcp.json`. O subagente obtém as ferramentas; a conversa pai não.

#### Modos de permissão

O campo `permissionMode` controla como o subagente lida com prompts de permissão. Subagentes herdam o contexto de permissão da conversa principal e podem sobrescrever o modo, exceto quando o modo pai tem precedência conforme descrito abaixo.

| Mode                | Behavior                                                                                |
| :------------------ | :-------------------------------------------------------------------------------------- |
| `default`           | Verificação de permissão padrão com prompts                                             |
| `acceptEdits`       | Auto-aceitar edições de arquivo                                                         |
| `dontAsk`           | Auto-negar prompts de permissão (ferramentas explicitamente permitidas ainda funcionam) |
| `bypassPermissions` | Pular prompts de permissão                                                              |
| `plan`              | Plan mode (exploração somente leitura)                                                  |

<Warning>
  Use `bypassPermissions` com cuidado. Ele pula prompts de permissão, permitindo que o subagente execute operações sem aprovação. Escritas em diretórios `.git`, `.claude`, `.vscode` e `.idea` ainda solicitam confirmação, exceto para `.claude/commands`, `.claude/agents` e `.claude/skills`. Veja [modos de permissão](/pt/permission-modes#skip-all-checks-with-bypasspermissions-mode) para detalhes.
</Warning>

Se o pai usar `bypassPermissions`, isso tem precedência e não pode ser sobrescrito. Se o pai usar [auto mode](/pt/permission-modes#eliminate-prompts-with-auto-mode), o subagente herda auto mode e qualquer `permissionMode` em seu frontmatter é ignorado: o classificador avalia as chamadas de ferramentas do subagente com as mesmas regras de bloqueio e permissão que a sessão pai.

#### Pré-carregar skills em subagentes

Use o campo `skills` para injetar conteúdo de skill no contexto de um subagente na inicialização. Isso dá ao subagente conhecimento de domínio sem exigir que ele descubra e carregue skills durante a execução.

```yaml  theme={null}
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

O conteúdo completo de cada skill é injetado no contexto do subagente, não apenas disponibilizado para invocação. Subagentes não herdam skills da conversa pai; você deve listá-las explicitamente.

<Note>
  Isto é o inverso de [executar uma skill em um subagente](/pt/skills#run-skills-in-a-subagent). Com `skills` em um subagente, o subagente controla o prompt de sistema e carrega conteúdo de skill. Com `context: fork` em uma skill, o conteúdo de skill é injetado no agente que você especificar. Ambos usam o mesmo sistema subjacente.
</Note>

#### Habilitar memória persistente

O campo `memory` dá ao subagente um diretório persistente que sobrevive entre conversas. O subagente usa este diretório para construir conhecimento ao longo do tempo, como padrões de base de código, insights de debugging e decisões arquiteturais.

```yaml  theme={null}
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

Escolha um escopo baseado em quão amplamente a memória deve se aplicar:

| Scope     | Location                                      | Use when                                                                                              |
| :-------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `user`    | `~/.claude/agent-memory/<name-of-agent>/`     | o subagente deve lembrar aprendizados entre todos os projetos                                         |
| `project` | `.claude/agent-memory/<name-of-agent>/`       | o conhecimento do subagente é específico do projeto e compartilhável via controle de versão           |
| `local`   | `.claude/agent-memory-local/<name-of-agent>/` | o conhecimento do subagente é específico do projeto mas não deve ser verificado no controle de versão |

Quando memória está habilitada:

* O prompt de sistema do subagente inclui instruções para ler e escrever no diretório de memória.
* O prompt de sistema do subagente também inclui as primeiras 200 linhas de `MEMORY.md` no diretório de memória, com instruções para curar `MEMORY.md` se exceder 200 linhas.
* Ferramentas Read, Write e Edit são automaticamente habilitadas para que o subagente possa gerenciar seus arquivos de memória.

##### Dicas de memória persistente

* `project` é o escopo padrão recomendado. Ele torna o conhecimento do subagente compartilhável via controle de versão. Use `user` quando o conhecimento do subagente é amplamente aplicável entre projetos, ou `local` quando o conhecimento não deve ser verificado no controle de versão.
* Peça ao subagente para consultar sua memória antes de começar o trabalho: "Review this PR, and check your memory for patterns you've seen before."
* Peça ao subagente para atualizar sua memória após completar uma tarefa: "Now that you're done, save what you learned to your memory." Ao longo do tempo, isso constrói uma base de conhecimento que torna o subagente mais eficaz.
* Inclua instruções de memória diretamente no arquivo markdown do subagente para que ele mantenha proativamente sua própria base de conhecimento:

  ```markdown  theme={null}
  Update your agent memory as you discover codepaths, patterns, library
  locations, and key architectural decisions. This builds up institutional
  knowledge across conversations. Write concise notes about what you found
  and where.
  ```

#### Regras condicionais com hooks

Para controle mais dinâmico sobre uso de ferramentas, use hooks `PreToolUse` para validar operações antes de serem executadas. Isso é útil quando você precisa permitir algumas operações de uma ferramenta enquanto bloqueia outras.

Este exemplo cria um subagente que apenas permite consultas de banco de dados somente leitura. O hook `PreToolUse` executa o script especificado em `command` antes de cada comando Bash ser executado:

```yaml  theme={null}
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

Claude Code [passa entrada de hook como JSON](/pt/hooks#pretooluse-input) via stdin para comandos de hook. O script de validação lê este JSON, extrai o comando Bash e [sai com código 2](/pt/hooks#exit-code-2-behavior-per-event) para bloquear operações de escrita:

```bash  theme={null}
#!/bin/bash
# ./scripts/validate-readonly-query.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block SQL write operations (case-insensitive)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' > /dev/null; then
  echo "Blocked: Only SELECT queries are allowed" >&2
  exit 2
fi

exit 0
```

Veja [Hook input](/pt/hooks#pretooluse-input) para o schema de entrada completo e [exit codes](/pt/hooks#exit-code-output) para como códigos de saída afetam o comportamento.

#### Desabilitar subagentes específicos

Você pode impedir que Claude use subagentes específicos adicionando-os ao array `deny` em suas [configurações](/pt/settings#permission-settings). Use o formato `Agent(subagent-name)` onde `subagent-name` corresponde ao campo name do subagente.

```json  theme={null}
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

Isso funciona para subagentes integrados e personalizados. Você também pode usar o flag CLI `--disallowedTools`:

```bash  theme={null}
claude --disallowedTools "Agent(Explore)"
```

Veja [documentação de Permissões](/pt/permissions#tool-specific-permission-rules) para mais detalhes sobre regras de permissão.

### Definir hooks para subagentes

Subagentes podem definir [hooks](/pt/hooks) que são executados durante o ciclo de vida do subagente. Existem duas formas de configurar hooks:

1. **No frontmatter do subagente**: Defina hooks que são executados apenas enquanto esse subagente específico está ativo
2. **Em `settings.json`**: Defina hooks que são executados na sessão principal quando subagentes iniciam ou param

#### Hooks no frontmatter do subagente

Defina hooks diretamente no arquivo markdown do subagente. Estes hooks são executados apenas enquanto esse subagente específico está ativo e são limpos quando termina.

Todos os [eventos de hook](/pt/hooks#hook-events) são suportados. Os eventos mais comuns para subagentes são:

| Event         | Matcher input      | When it fires                                                                    |
| :------------ | :----------------- | :------------------------------------------------------------------------------- |
| `PreToolUse`  | Nome da ferramenta | Antes do subagente usar uma ferramenta                                           |
| `PostToolUse` | Nome da ferramenta | Depois do subagente usar uma ferramenta                                          |
| `Stop`        | (nenhum)           | Quando o subagente termina (convertido para `SubagentStop` em tempo de execução) |

Este exemplo valida comandos Bash com o hook `PreToolUse` e executa um linter após edições de arquivo com `PostToolUse`:

```yaml  theme={null}
---
name: code-reviewer
description: Review code changes with automatic linting
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh $TOOL_INPUT"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

Hooks `Stop` no frontmatter são automaticamente convertidos para eventos `SubagentStop`.

#### Hooks no nível do projeto para eventos de subagente

Configure hooks em `settings.json` que respondem a eventos de ciclo de vida de subagente na sessão principal.

| Event           | Matcher input          | When it fires                         |
| :-------------- | :--------------------- | :------------------------------------ |
| `SubagentStart` | Nome do tipo de agente | Quando um subagente começa a execução |
| `SubagentStop`  | Nome do tipo de agente | Quando um subagente completa          |

Ambos os eventos suportam matchers para direcionar tipos de agente específicos por nome. Este exemplo executa um script de configuração apenas quando o subagente `db-agent` inicia, e um script de limpeza quando qualquer subagente para:

```json  theme={null}
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

Veja [Hooks](/pt/hooks) para o formato de configuração de hook completo.

## Trabalhar com subagentes

### Entender delegação automática

Claude delega automaticamente tarefas baseado na descrição da tarefa em sua solicitação, no campo `description` em configurações de subagente e no contexto atual. Para encorajar delegação proativa, inclua frases como "use proactively" no campo description do seu subagente.

### Invocar subagentes explicitamente

Quando delegação automática não é suficiente, você pode solicitar um subagente você mesmo. Três padrões escalam de uma sugestão única para um padrão padrão em toda a sessão:

* **Linguagem natural**: nomeie o subagente em seu prompt; Claude decide se deve delegar
* **@-mention**: garante que o subagente seja executado para uma tarefa
* **Em toda a sessão**: toda a sessão usa o prompt de sistema, restrições de ferramentas e modelo do subagente via flag `--agent` ou configuração `agent`

Para linguagem natural, não há sintaxe especial. Nomeie o subagente e Claude normalmente delega:

```text  theme={null}
Use the test-runner subagent to fix failing tests
Have the code-reviewer subagent look at my recent changes
```

**@-mention o subagente.** Digite `@` e escolha o subagente do typeahead, da mesma forma que você @-menciona arquivos. Isso garante que esse subagente específico seja executado em vez de deixar a escolha para Claude:

```text  theme={null}
@"code-reviewer (agent)" look at the auth changes
```

Sua mensagem completa ainda vai para Claude, que escreve o prompt de tarefa do subagente baseado no que você pediu. O @-mention controla qual subagente Claude invoca, não qual prompt ele recebe.

Subagentes fornecidos por um [plugin](/pt/plugins) habilitado aparecem no typeahead como `<plugin-name>:<agent-name>`. Você também pode digitar a menção manualmente sem usar o picker: `@agent-<name>` para subagentes locais, ou `@agent-<plugin-name>:<agent-name>` para subagentes de plugin.

**Execute toda a sessão como um subagente.** Passe [`--agent <name>`](/pt/cli-reference) para iniciar uma sessão onde a thread principal em si assume o prompt de sistema, restrições de ferramentas e modelo do subagente:

```bash  theme={null}
claude --agent code-reviewer
```

O prompt de sistema do subagente substitui completamente o prompt de sistema padrão do Claude Code, da mesma forma que [`--system-prompt`](/pt/cli-reference) faz. Arquivos `CLAUDE.md` e memória de projeto ainda carregam através do fluxo de mensagem normal. O nome do agente aparece como `@<name>` no cabeçalho de inicialização para que você possa confirmar que está ativo.

Isso funciona com subagentes integrados e personalizados, e a escolha persiste quando você retoma a sessão.

Para um subagente fornecido por plugin, passe o nome com escopo: `claude --agent <plugin-name>:<agent-name>`.

Para torná-lo o padrão para cada sessão em um projeto, defina `agent` em `.claude/settings.json`:

```json  theme={null}
{
  "agent": "code-reviewer"
}
```

O flag CLI sobrescreve a configuração se ambos estiverem presentes.

### Executar subagentes em foreground ou background

Subagentes podem ser executados em foreground (bloqueante) ou background (concorrente):

* **Subagentes em foreground** bloqueiam a conversa principal até completar. Prompts de permissão e perguntas de esclarecimento (como [`AskUserQuestion`](/pt/tools-reference)) são passados para você.
* **Subagentes em background** são executados concorrentemente enquanto você continua trabalhando. Antes de iniciar, Claude Code solicita quaisquer permissões de ferramentas que o subagente precisará, garantindo que ele tenha as aprovações necessárias antecipadamente. Uma vez em execução, o subagente herda essas permissões e auto-nega qualquer coisa não pré-aprovada. Se um subagente em background precisa fazer perguntas de esclarecimento, essa chamada de ferramenta falha mas o subagente continua.

Se um subagente em background falha devido a permissões ausentes, você pode iniciar um novo subagente em foreground com a mesma tarefa para tentar novamente com prompts interativos.

Claude decide se deve executar subagentes em foreground ou background baseado na tarefa. Você também pode:

* Pedir a Claude para "run this in the background"
* Pressionar **Ctrl+B** para colocar uma tarefa em background

Para desabilitar toda a funcionalidade de tarefa em background, defina a variável de ambiente `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` para `1`. Veja [Variáveis de ambiente](/pt/env-vars).

### Padrões comuns

#### Isolar operações de alto volume

Um dos usos mais eficazes para subagentes é isolar operações que produzem grandes quantidades de saída. Executar testes, buscar documentação ou processar arquivos de log podem consumir contexto significativo. Ao delegar esses para um subagente, a saída verbosa fica no contexto do subagente enquanto apenas o resumo relevante retorna para sua conversa principal.

```text  theme={null}
Use a subagent to run the test suite and report only the failing tests with their error messages
```

#### Executar pesquisa em paralelo

Para investigações independentes, gere múltiplos subagentes para trabalhar simultaneamente:

```text  theme={null}
Research the authentication, database, and API modules in parallel using separate subagents
```

Cada subagente explora sua área independentemente, então Claude sintetiza os achados. Isso funciona melhor quando os caminhos de pesquisa não dependem um do outro.

<Warning>
  Quando subagentes completam, seus resultados retornam para sua conversa principal. Executar muitos subagentes que cada um retorna resultados detalhados pode consumir contexto significativo.
</Warning>

Para tarefas que precisam de paralelismo sustentado ou excedem sua janela de contexto, [equipes de agentes](/pt/agent-teams) dão a cada worker seu próprio contexto independente.

#### Encadear subagentes

Para fluxos de trabalho multi-etapas, peça a Claude para usar subagentes em sequência. Cada subagente completa sua tarefa e retorna resultados para Claude, que então passa contexto relevante para o próximo subagente.

```text  theme={null}
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

### Escolher entre subagentes e conversa principal

Use a **conversa principal** quando:

* A tarefa precisa de frequente ida e volta ou refinamento iterativo
* Múltiplas fases compartilham contexto significativo (planejamento → implementação → testes)
* Você está fazendo uma mudança rápida e direcionada
* Latência importa. Subagentes começam do zero e podem precisar de tempo para reunir contexto

Use **subagentes** quando:

* A tarefa produz saída verbosa que você não precisa em seu contexto principal
* Você quer aplicar restrições de ferramentas específicas ou permissões
* O trabalho é auto-contido e pode retornar um resumo

Considere [Skills](/pt/skills) em vez disso quando você quer prompts reutilizáveis ou fluxos de trabalho que são executados no contexto da conversa principal em vez de contexto de subagente isolado.

Para uma pergunta rápida sobre algo já em sua conversa, use [`/btw`](/pt/interactive-mode#side-questions-with-btw) em vez de um subagente. Ele vê seu contexto completo mas não tem acesso a ferramentas, e a resposta é descartada em vez de adicionada ao histórico.

<Note>
  Subagentes não podem gerar outros subagentes. Se seu fluxo de trabalho requer delegação aninhada, use [Skills](/pt/skills) ou [encadeie subagentes](#chain-subagents) da conversa principal.
</Note>

### Gerenciar contexto de subagente

#### Retomar subagentes

Cada invocação de subagente cria uma nova instância com contexto fresco. Para continuar o trabalho de um subagente existente em vez de começar do zero, peça a Claude para retomá-lo.

Subagentes retomados retêm seu histórico de conversa completo, incluindo todas as chamadas de ferramentas anteriores, resultados e raciocínio. O subagente continua exatamente de onde parou em vez de começar do zero.

Quando um subagente completa, Claude recebe seu ID de agente. Claude usa a ferramenta `SendMessage` com o ID do agente como campo `to` para retomá-lo. Para retomar um subagente, peça a Claude para continuar o trabalho anterior:

```text  theme={null}
Use the code-reviewer subagent to review the authentication module
[Agent completes]

Continue that code review and now analyze the authorization logic
[Claude resumes the subagent with full context from previous conversation]
```

Se um subagente parado recebe um `SendMessage`, ele auto-retoma em background sem exigir uma nova invocação de `Agent`.

Você também pode pedir a Claude pelo ID do agente se quiser referenciá-lo explicitamente, ou encontrar IDs nos arquivos de transcrição em `~/.claude/projects/{project}/{sessionId}/subagents/`. Cada transcrição é armazenada como `agent-{agentId}.jsonl`.

Transcrições de subagente persistem independentemente da conversa principal:

* **Compactação da conversa principal**: Quando a conversa principal se compacta, transcrições de subagente não são afetadas. Elas são armazenadas em arquivos separados.
* **Persistência de sessão**: Transcrições de subagente persistem dentro de sua sessão. Você pode [retomar um subagente](#resume-subagents) após reiniciar Claude Code retomando a mesma sessão.
* **Limpeza automática**: Transcrições são limpas baseado na configuração `cleanupPeriodDays` (padrão: 30 dias).

#### Auto-compactação

Subagentes suportam compactação automática usando a mesma lógica que a conversa principal. Por padrão, auto-compactação é acionada em aproximadamente 95% de capacidade. Para acionar compactação mais cedo, defina `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` para uma porcentagem mais baixa (por exemplo, `50`). Veja [variáveis de ambiente](/pt/env-vars) para detalhes.

Eventos de compactação são registrados em arquivos de transcrição de subagente:

```json  theme={null}
{
  "type": "system",
  "subtype": "compact_boundary",
  "compactMetadata": {
    "trigger": "auto",
    "preTokens": 167189
  }
}
```

O valor `preTokens` mostra quantos tokens foram usados antes da compactação ocorrer.

## Subagentes de exemplo

Estes exemplos demonstram padrões eficazes para construir subagentes. Use-os como pontos de partida, ou gere uma versão personalizada com Claude.

<Tip>
  **Melhores práticas:**

  * **Projete subagentes focados:** cada subagente deve se destacar em uma tarefa específica
  * **Escreva descrições detalhadas:** Claude usa a descrição para decidir quando delegar
  * **Limite acesso a ferramentas:** conceda apenas permissões necessárias para segurança e foco
  * **Verifique no controle de versão:** compartilhe subagentes de projeto com sua equipe
</Tip>

### Revisor de código

Um subagente somente leitura que revisa código sem modificá-lo. Este exemplo mostra como projetar um subagente focado com acesso limitado a ferramentas (sem Edit ou Write) e um prompt detalhado que especifica exatamente o que procurar e como formatar a saída.

```markdown  theme={null}
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### Debugger

Um subagente que pode analisar e corrigir problemas. Diferentemente do revisor de código, este inclui Edit porque corrigir bugs requer modificar código. O prompt fornece um fluxo de trabalho claro de diagnóstico para verificação.

```markdown  theme={null}
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not the symptoms.
```

### Cientista de dados

Um subagente específico de domínio para trabalho de análise de dados. Este exemplo mostra como criar subagentes para fluxos de trabalho especializados fora de tarefas de codificação típicas. Ele explicitamente define `model: sonnet` para análise mais capaz.

```markdown  theme={null}
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights. Use proactively for data analysis tasks and queries.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

### Validador de consulta de banco de dados

Um subagente que permite acesso Bash mas valida comandos para permitir apenas consultas SQL somente leitura. Este exemplo mostra como usar hooks `PreToolUse` para validação condicional quando você precisa de controle mais fino do que o campo `tools` fornece.

```markdown  theme={null}
---
name: db-reader
description: Execute read-only database queries. Use when analyzing data or generating reports.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a database analyst with read-only access. Execute SELECT queries to answer questions about the data.

When asked to analyze data:
1. Identify which tables contain the relevant data
2. Write efficient SELECT queries with appropriate filters
3. Present results clearly with context

You cannot modify data. If asked to INSERT, UPDATE, DELETE, or modify schema, explain that you only have read access.
```

Claude Code [passa entrada de hook como JSON](/pt/hooks#pretooluse-input) via stdin para comandos de hook. O script de validação lê este JSON, extrai o comando sendo executado e o verifica contra uma lista de operações de escrita SQL. Se uma operação de escrita é detectada, o script [sai com código 2](/pt/hooks#exit-code-2-behavior-per-event) para bloquear execução e retorna uma mensagem de erro para Claude via stderr.

Crie o script de validação em qualquer lugar em seu projeto. O caminho deve corresponder ao campo `command` em sua configuração de hook:

```bash  theme={null}
#!/bin/bash
# Blocks SQL write operations, allows SELECT queries

# Read JSON input from stdin
INPUT=$(cat)

# Extract the command field from tool_input using jq
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block write operations (case-insensitive)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed. Use SELECT queries only." >&2
  exit 2
fi

exit 0
```

Torne o script executável:

```bash  theme={null}
chmod +x ./scripts/validate-readonly-query.sh
```

O hook recebe JSON via stdin com o comando Bash em `tool_input.command`. Código de saída 2 bloqueia a operação e alimenta a mensagem de erro de volta para Claude. Veja [Hooks](/pt/hooks#exit-code-output) para detalhes sobre códigos de saída e [Hook input](/pt/hooks#pretooluse-input) para o schema de entrada completo.

## Próximos passos

Agora que você entende subagentes, explore estes recursos relacionados:

* [Distribuir subagentes com plugins](/pt/plugins) para compartilhar subagentes entre equipes ou projetos
* [Executar Claude Code programaticamente](/pt/headless) com o Agent SDK para CI/CD e automação
* [Usar MCP servers](/pt/mcp) para dar aos subagentes acesso a ferramentas e dados externos
