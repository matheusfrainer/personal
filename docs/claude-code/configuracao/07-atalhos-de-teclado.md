# Personalizar atalhos de teclado

> Personalize atalhos de teclado no Claude Code com um arquivo de configuração de keybindings.

> **Nota:** Os atalhos de teclado personalizáveis requerem Claude Code v2.1.18 ou posterior. Verifique sua versão com `claude --version`.

Claude Code suporta atalhos de teclado personalizáveis. Execute `/keybindings` para criar ou abrir seu arquivo de configuração em `~/.claude/keybindings.json`.

## Arquivo de configuração

O arquivo de configuração de keybindings é um objeto com um array `bindings`. Cada bloco especifica um contexto e um mapa de sequências de teclas para ações.

> **Nota:** As alterações no arquivo de keybindings são detectadas automaticamente e aplicadas sem reiniciar Claude Code.

| Campo      | Descrição                                                |
| :--------- | :------------------------------------------------------- |
| `$schema`  | URL opcional do JSON Schema para autocompletar do editor |
| `$docs`    | URL opcional de documentação                             |
| `bindings` | Array de blocos de vinculação por contexto               |

Este exemplo vincula `Ctrl+E` para abrir um editor externo no contexto de chat e desvincula `Ctrl+U`:

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/pt/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null
      }
    }
  ]
}
```

## Contextos

Cada bloco de vinculação especifica um **contexto** onde as vinculações se aplicam:

| Contexto          | Descrição                                                 |
| :---------------- | :-------------------------------------------------------- |
| `Global`          | Aplica-se em qualquer lugar do aplicativo                 |
| `Chat`            | Área principal de entrada de chat                         |
| `Autocomplete`    | Menu de autocompletar está aberto                         |
| `Settings`        | Menu de configurações (dismiss apenas com escape)         |
| `Confirmation`    | Diálogos de permissão e confirmação                       |
| `Tabs`            | Componentes de navegação de abas                          |
| `Help`            | Menu de ajuda está visível                                |
| `Transcript`      | Visualizador de transcrição                               |
| `HistorySearch`   | Modo de busca de histórico (Ctrl+R)                       |
| `Task`            | Tarefa em segundo plano está em execução                  |
| `ThemePicker`     | Diálogo do seletor de tema                                |
| `Attachments`     | Navegação da barra de imagem/anexo                        |
| `Footer`          | Navegação do indicador de rodapé (tarefas, equipes, diff) |
| `MessageSelector` | Seleção de mensagem do diálogo de retrocesso e resumo     |
| `DiffDialog`      | Navegação do visualizador de diff                         |
| `ModelPicker`     | Nível de esforço do seletor de modelo                     |
| `Select`          | Componentes genéricos de seleção/lista                    |
| `Plugin`          | Diálogo de plugin (procurar, descobrir, gerenciar)        |

## Ações disponíveis

As ações seguem um formato `namespace:action`, como `chat:submit` para enviar uma mensagem ou `app:toggleTodos` para mostrar a lista de tarefas. Cada contexto tem ações específicas disponíveis.

### Ações do aplicativo

Ações disponíveis no contexto `Global`:

| Ação                   | Padrão | Descrição                                 |
| :--------------------- | :----- | :---------------------------------------- |
| `app:interrupt`        | Ctrl+C | Cancelar operação atual                   |
| `app:exit`             | Ctrl+D | Sair do Claude Code                       |
| `app:toggleTodos`      | Ctrl+T | Alternar visibilidade da lista de tarefas |
| `app:toggleTranscript` | Ctrl+O | Alternar transcrição detalhada            |

### Ações de histórico

Ações para navegar no histórico de comandos:

| Ação               | Padrão | Descrição                  |
| :----------------- | :----- | :------------------------- |
| `history:search`   | Ctrl+R | Abrir busca de histórico   |
| `history:previous` | Up     | Item de histórico anterior |
| `history:next`     | Down   | Próximo item de histórico  |

### Ações de chat

Ações disponíveis no contexto `Chat`:

| Ação                  | Padrão                    | Descrição                     |
| :-------------------- | :------------------------ | :---------------------------- |
| `chat:cancel`         | Escape                    | Cancelar entrada atual        |
| `chat:cycleMode`      | Shift+Tab\*               | Ciclar modos de permissão     |
| `chat:modelPicker`    | Cmd+P / Meta+P            | Abrir seletor de modelo       |
| `chat:thinkingToggle` | Cmd+T / Meta+T            | Alternar pensamento estendido |
| `chat:submit`         | Enter                     | Enviar mensagem               |
| `chat:undo`           | Ctrl+\_                   | Desfazer última ação          |
| `chat:externalEditor` | Ctrl+G                    | Abrir em editor externo       |
| `chat:stash`          | Ctrl+S                    | Guardar prompt atual          |
| `chat:imagePaste`     | Ctrl+V (Alt+V no Windows) | Colar imagem                  |

\*No Windows sem modo VT (Node \<24.2.0/\<22.17.0, Bun \<1.2.23), o padrão é Meta+M.

### Ações de autocompletar

Ações disponíveis no contexto `Autocomplete`:

| Ação                    | Padrão | Descrição         |
| :---------------------- | :----- | :---------------- |
| `autocomplete:accept`   | Tab    | Aceitar sugestão  |
| `autocomplete:dismiss`  | Escape | Descartar menu    |
| `autocomplete:previous` | Up     | Sugestão anterior |
| `autocomplete:next`     | Down   | Próxima sugestão  |

### Ações de confirmação

Ações disponíveis no contexto `Confirmation`:

| Ação                        | Padrão         | Descrição                        |
| :-------------------------- | :------------- | :------------------------------- |
| `confirm:yes`               | Y, Enter       | Confirmar ação                   |
| `confirm:no`                | N, Escape      | Recusar ação                     |
| `confirm:previous`          | Up             | Opção anterior                   |
| `confirm:next`              | Down           | Próxima opção                    |
| `confirm:nextField`         | Tab            | Próximo campo                    |
| `confirm:previousField`     | (desvinculado) | Campo anterior                   |
| `confirm:cycleMode`         | Shift+Tab      | Ciclar modos de permissão        |
| `confirm:toggleExplanation` | Ctrl+E         | Alternar explicação de permissão |

### Ações de permissão

Ações disponíveis no contexto `Confirmation` para diálogos de permissão:

| Ação                     | Padrão | Descrição                                      |
| :----------------------- | :----- | :--------------------------------------------- |
| `permission:toggleDebug` | Ctrl+D | Alternar informações de depuração de permissão |

### Ações de transcrição

Ações disponíveis no contexto `Transcript`:

| Ação                       | Padrão         | Descrição                           |
| :------------------------- | :------------- | :---------------------------------- |
| `transcript:toggleShowAll` | Ctrl+E         | Alternar mostrar todo o conteúdo    |
| `transcript:exit`          | Ctrl+C, Escape | Sair da visualização de transcrição |

### Ações de busca de histórico

Ações disponíveis no contexto `HistorySearch`:

| Ação                    | Padrão      | Descrição                    |
| :---------------------- | :---------- | :--------------------------- |
| `historySearch:next`    | Ctrl+R      | Próxima correspondência      |
| `historySearch:accept`  | Escape, Tab | Aceitar seleção              |
| `historySearch:cancel`  | Ctrl+C      | Cancelar busca               |
| `historySearch:execute` | Enter       | Executar comando selecionado |

### Ações de tarefa

Ações disponíveis no contexto `Task`:

| Ação              | Padrão | Descrição                             |
| :---------------- | :----- | :------------------------------------ |
| `task:background` | Ctrl+B | Colocar tarefa atual em segundo plano |

### Ações de tema

Ações disponíveis no contexto `ThemePicker`:

| Ação                             | Padrão | Descrição                    |
| :------------------------------- | :----- | :--------------------------- |
| `theme:toggleSyntaxHighlighting` | Ctrl+T | Alternar destaque de sintaxe |

### Ações de ajuda

Ações disponíveis no contexto `Help`:

| Ação           | Padrão | Descrição            |
| :------------- | :----- | :------------------- |
| `help:dismiss` | Escape | Fechar menu de ajuda |

### Ações de abas

Ações disponíveis no contexto `Tabs`:

| Ação            | Padrão          | Descrição    |
| :-------------- | :-------------- | :----------- |
| `tabs:next`     | Tab, Right      | Próxima aba  |
| `tabs:previous` | Shift+Tab, Left | Aba anterior |

### Ações de anexos

Ações disponíveis no contexto `Attachments`:

| Ação                   | Padrão            | Descrição                 |
| :--------------------- | :---------------- | :------------------------ |
| `attachments:next`     | Right             | Próximo anexo             |
| `attachments:previous` | Left              | Anexo anterior            |
| `attachments:remove`   | Backspace, Delete | Remover anexo selecionado |
| `attachments:exit`     | Down, Escape      | Sair da barra de anexos   |

### Ações de rodapé

Ações disponíveis no contexto `Footer`:

| Ação                    | Padrão | Descrição                        |
| :---------------------- | :----- | :------------------------------- |
| `footer:next`           | Right  | Próximo item do rodapé           |
| `footer:previous`       | Left   | Item anterior do rodapé          |
| `footer:openSelected`   | Enter  | Abrir item do rodapé selecionado |
| `footer:clearSelection` | Escape | Limpar seleção do rodapé         |

### Ações do seletor de mensagem

Ações disponíveis no contexto `MessageSelector`:

| Ação                     | Padrão                                    | Descrição                 |
| :----------------------- | :---------------------------------------- | :------------------------ |
| `messageSelector:up`     | Up, K, Ctrl+P                             | Mover para cima na lista  |
| `messageSelector:down`   | Down, J, Ctrl+N                           | Mover para baixo na lista |
| `messageSelector:top`    | Ctrl+Up, Shift+Up, Meta+Up, Shift+K       | Pular para o topo         |
| `messageSelector:bottom` | Ctrl+Down, Shift+Down, Meta+Down, Shift+J | Pular para o final        |
| `messageSelector:select` | Enter                                     | Selecionar mensagem       |

### Ações de diff

Ações disponíveis no contexto `DiffDialog`:

| Ação                  | Padrão                   | Descrição                      |
| :-------------------- | :----------------------- | :----------------------------- |
| `diff:dismiss`        | Escape                   | Fechar visualizador de diff    |
| `diff:previousSource` | Left                     | Fonte de diff anterior         |
| `diff:nextSource`     | Right                    | Próxima fonte de diff          |
| `diff:previousFile`   | Up                       | Arquivo anterior no diff       |
| `diff:nextFile`       | Down                     | Próximo arquivo no diff        |
| `diff:viewDetails`    | Enter                    | Visualizar detalhes do diff    |
| `diff:back`           | (específico do contexto) | Voltar no visualizador de diff |

### Ações do seletor de modelo

Ações disponíveis no contexto `ModelPicker`:

| Ação                         | Padrão | Descrição                 |
| :--------------------------- | :----- | :------------------------ |
| `modelPicker:decreaseEffort` | Left   | Diminuir nível de esforço |
| `modelPicker:increaseEffort` | Right  | Aumentar nível de esforço |

### Ações de seleção

Ações disponíveis no contexto `Select`:

| Ação              | Padrão          | Descrição        |
| :---------------- | :-------------- | :--------------- |
| `select:next`     | Down, J, Ctrl+N | Próxima opção    |
| `select:previous` | Up, K, Ctrl+P   | Opção anterior   |
| `select:accept`   | Enter           | Aceitar seleção  |
| `select:cancel`   | Escape          | Cancelar seleção |

### Ações de plugin

Ações disponíveis no contexto `Plugin`:

| Ação             | Padrão | Descrição                     |
| :--------------- | :----- | :---------------------------- |
| `plugin:toggle`  | Space  | Alternar seleção de plugin    |
| `plugin:install` | I      | Instalar plugins selecionados |

### Ações de configurações

Ações disponíveis no contexto `Settings`:

| Ação              | Padrão | Descrição                                                |
| :---------------- | :----- | :------------------------------------------------------- |
| `settings:search` | /      | Entrar no modo de busca                                  |
| `settings:retry`  | R      | Tentar novamente carregar dados de uso (em caso de erro) |

## Sintaxe de sequência de teclas

### Modificadores

Use teclas modificadoras com o separador `+`:

* `ctrl` ou `control` - Tecla Control
* `alt`, `opt`, ou `option` - Tecla Alt/Option
* `shift` - Tecla Shift
* `meta`, `cmd`, ou `command` - Tecla Meta/Command

Por exemplo:

```text
ctrl+k          Tecla única com modificador
shift+tab       Shift + Tab
meta+p          Command/Meta + P
ctrl+shift+c    Múltiplos modificadores
```

### Letras maiúsculas

Uma letra maiúscula isolada implica Shift. Por exemplo, `K` é equivalente a `shift+k`. Isso é útil para vinculações no estilo vim, onde as teclas maiúsculas e minúsculas têm significados diferentes.

Letras maiúsculas com modificadores (por exemplo, `ctrl+K`) são tratadas como estilísticas e **não** implicam Shift — `ctrl+K` é o mesmo que `ctrl+k`.

### Acordes

Acordes são sequências de sequências de teclas separadas por espaços:

```text
ctrl+k ctrl+s   Pressione Ctrl+K, solte, depois Ctrl+S
```

### Teclas especiais

* `escape` ou `esc` - Tecla Escape
* `enter` ou `return` - Tecla Enter
* `tab` - Tecla Tab
* `space` - Barra de espaço
* `up`, `down`, `left`, `right` - Teclas de seta
* `backspace`, `delete` - Teclas de exclusão

## Desvinculação de atalhos padrão

Defina uma ação como `null` para desvinculá-la de um atalho padrão:

```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+s": null
      }
    }
  ]
}
```

## Atalhos reservados

Estes atalhos não podem ser revinculados:

| Atalho | Motivo                              |
| :----- | :---------------------------------- |
| Ctrl+C | Interrupção/cancelamento codificado |
| Ctrl+D | Saída codificada                    |

## Conflitos de terminal

Alguns atalhos podem entrar em conflito com multiplexadores de terminal:

| Atalho | Conflito                                        |
| :----- | :---------------------------------------------- |
| Ctrl+B | Prefixo tmux (pressione duas vezes para enviar) |
| Ctrl+A | Prefixo GNU screen                              |
| Ctrl+Z | Suspensão de processo Unix (SIGTSTP)            |

## Interação com modo vim

Quando o modo vim está ativado (`/vim`), keybindings e modo vim operam independentemente:

* **Modo vim** manipula entrada no nível de entrada de texto (movimento do cursor, modos, motions)
* **Keybindings** manipulam ações no nível de componente (alternar tarefas, enviar, etc.)
* A tecla Escape no modo vim muda INSERT para NORMAL; ela não dispara `chat:cancel`
* A maioria dos atalhos Ctrl+key passam pelo modo vim para o sistema de keybindings
* No modo NORMAL do vim, `?` mostra o menu de ajuda (comportamento vim)

## Validação

Claude Code valida seus keybindings e mostra avisos para:

* Erros de análise (JSON inválido ou estrutura)
* Nomes de contexto inválidos
* Conflitos de atalho reservado
* Conflitos de multiplexador de terminal
* Vinculações duplicadas no mesmo contexto

Execute `/doctor` para ver quaisquer avisos de keybindings.
