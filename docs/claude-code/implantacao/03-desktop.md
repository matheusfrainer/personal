> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Use Claude Code Desktop

> Aproveite ao máximo o Claude Code Desktop: computer use, Dispatch sessions do seu telefone, sessões paralelas com isolamento Git, revisão visual de diff, visualizações de aplicativos, monitoramento de PR, conectores e configuração corporativa.

A aba Code dentro do aplicativo Claude Desktop permite que você use Claude Code através de uma interface gráfica em vez do terminal.

O Desktop adiciona essas capacidades à experiência padrão do Claude Code:

* [Revisão visual de diff](#review-changes-with-diff-view) com comentários inline
* [Visualização ao vivo do aplicativo](#preview-your-app) com servidores de desenvolvimento
* [Computer use](#let-claude-use-your-computer) para abrir aplicativos e controlar sua tela no macOS
* [Monitoramento de GitHub PR](#monitor-pull-request-status) com correção automática e mesclagem automática
* [Sessões paralelas](#work-in-parallel-with-sessions) com isolamento automático de Git worktree
* [Dispatch](#sessions-from-dispatch) integration: envie uma tarefa do seu telefone, obtenha uma sessão aqui
* [Tarefas agendadas](#schedule-recurring-tasks) que executam Claude em um cronograma recorrente
* [Conectores](#connect-external-tools) para GitHub, Slack, Linear e muito mais
* Ambientes locais, [SSH](#ssh-sessions) e [nuvem](#run-long-running-tasks-remotely)

<Tip>
  Novo no Desktop? Comece com [Primeiros passos](/pt/desktop-quickstart) para instalar o aplicativo e fazer sua primeira edição.
</Tip>

Esta página cobre [trabalhar com código](#work-with-code), [computer use](#let-claude-use-your-computer), [gerenciar sessões](#manage-sessions), [estender Claude Code](#extend-claude-code), [tarefas agendadas](#schedule-recurring-tasks) e [configuração](#environment-configuration). Também inclui uma [comparação CLI](#coming-from-the-cli) e [solução de problemas](#troubleshooting).

## Iniciar uma sessão

Antes de enviar sua primeira mensagem, configure quatro coisas na área de prompt:

* **Ambiente**: escolha onde Claude é executado. Selecione **Local** para sua máquina, **Remote** para sessões em nuvem hospedadas pela Anthropic, ou uma [**conexão SSH**](#ssh-sessions) para uma máquina remota que você gerencia. Veja [configuração de ambiente](#environment-configuration).
* **Pasta do projeto**: selecione a pasta ou repositório em que Claude trabalha. Para sessões remotas, você pode adicionar [múltiplos repositórios](#run-long-running-tasks-remotely).
* **Modelo**: escolha um [modelo](/pt/model-config#available-models) no menu suspenso ao lado do botão enviar. O modelo é bloqueado assim que a sessão começa.
* **Modo de permissão**: escolha quanto de autonomia Claude tem no [seletor de modo](#choose-a-permission-mode). Você pode alterar isso durante a sessão.

Digite sua tarefa e pressione **Enter** para começar. Cada sessão rastreia seu próprio contexto e alterações independentemente.

## Trabalhar com código

Dê a Claude o contexto certo, controle quanto ele faz por conta própria e revise o que ele alterou.

### Use a caixa de prompt

Digite o que você quer que Claude faça e pressione **Enter** para enviar. Claude lê seus arquivos de projeto, faz alterações e executa comandos com base no seu [modo de permissão](#choose-a-permission-mode). Você pode interromper Claude a qualquer momento: clique no botão parar ou digite sua correção e pressione **Enter**. Claude para o que está fazendo e se ajusta com base em sua entrada.

O botão **+** ao lado da caixa de prompt oferece acesso a anexos de arquivo, [skills](#use-skills), [conectores](#connect-external-tools) e [plugins](#install-plugins).

### Adicionar arquivos e contexto aos prompts

A caixa de prompt suporta duas maneiras de trazer contexto externo:

* **@mention de arquivos**: digite `@` seguido de um nome de arquivo para adicionar um arquivo ao contexto da conversa. Claude pode então ler e referenciar esse arquivo.
* **Anexar arquivos**: anexe imagens, PDFs e outros arquivos ao seu prompt usando o botão de anexo, ou arraste e solte arquivos diretamente no prompt. Isso é útil para compartilhar capturas de tela de bugs, mockups de design ou documentos de referência.

### Escolher um modo de permissão

Os modos de permissão controlam quanto de autonomia Claude tem durante uma sessão: se ele pergunta antes de editar arquivos, executar comandos ou ambos. Você pode alternar modos a qualquer momento usando o seletor de modo ao lado do botão enviar. Comece com Pedir permissões para ver exatamente o que Claude faz, depois mude para Auto aceitar edições ou Plan mode conforme você fica confortável.

| Modo                     | Chave de configuração | Comportamento                                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pedir permissões**     | `default`             | Claude pergunta antes de editar arquivos ou executar comandos. Você vê um diff e pode aceitar ou rejeitar cada alteração. Recomendado para novos usuários.                                                                                                                                                                                          |
| **Auto aceitar edições** | `acceptEdits`         | Claude aceita automaticamente edições de arquivo, mas ainda pergunta antes de executar comandos de terminal. Use isso quando você confia em alterações de arquivo e quer iteração mais rápida.                                                                                                                                                      |
| **Plan mode**            | `plan`                | Claude analisa seu código e cria um plano sem modificar arquivos ou executar comandos. Bom para tarefas complexas onde você quer revisar a abordagem primeiro.                                                                                                                                                                                      |
| **Auto**                 | `auto`                | Claude executa todas as ações com verificações de segurança em segundo plano que verificam o alinhamento com sua solicitação. Reduz prompts de permissão mantendo supervisão. Atualmente uma visualização de pesquisa. Disponível em planos Team (Enterprise em breve). Requer Claude Sonnet 4.6 ou Opus 4.6. Ative em Configurações → Claude Code. |
| **Bypass permissions**   | `bypassPermissions`   | Claude é executado sem nenhum prompt de permissão, equivalente a `--dangerously-skip-permissions` no CLI. Ative em Configurações → Claude Code em "Permitir modo bypass permissions". Use apenas em containers ou VMs sandboxed. Administradores corporativos podem desabilitar essa opção.                                                         |

O modo de permissão `dontAsk` está disponível apenas no [CLI](/pt/permission-modes#allow-only-pre-approved-tools-with-dontask-mode).

<Tip title="Melhor prática">
  Comece tarefas complexas em Plan mode para que Claude mapeie uma abordagem antes de fazer alterações. Depois de aprovar o plano, mude para Auto aceitar edições ou Pedir permissões para executá-lo. Veja [explorar primeiro, depois planejar, depois codificar](/pt/best-practices#explore-first-then-plan-then-code) para mais sobre esse fluxo de trabalho.
</Tip>

Sessões remotas suportam Auto aceitar edições e Plan mode. Pedir permissões não está disponível porque sessões remotas aceitam automaticamente edições de arquivo por padrão, e Bypass permissions não está disponível porque o ambiente remoto já é sandboxed.

Administradores corporativos podem restringir quais modos de permissão estão disponíveis. Veja [configuração corporativa](#enterprise-configuration) para detalhes.

### Visualizar seu aplicativo

Claude pode iniciar um servidor de desenvolvimento e abrir um navegador incorporado para verificar suas alterações. Isso funciona para aplicativos web frontend e também para servidores backend: Claude pode testar endpoints de API, visualizar logs do servidor e iterar em problemas que encontra. Na maioria dos casos, Claude inicia o servidor automaticamente após editar arquivos de projeto. Você também pode pedir a Claude para visualizar a qualquer momento. Por padrão, Claude [verifica automaticamente](#auto-verify-changes) alterações após cada edição.

No painel de visualização, você pode:

* Interagir com seu aplicativo em execução diretamente no navegador incorporado
* Assistir Claude verificar suas próprias alterações automaticamente: ele tira capturas de tela, inspeciona o DOM, clica em elementos, preenche formulários e corrige problemas que encontra
* Iniciar ou parar servidores no menu suspenso **Preview** na barra de ferramentas da sessão
* Persistir cookies e armazenamento local entre reinicializações do servidor selecionando **Persist sessions** no menu suspenso, para que você não tenha que fazer login novamente durante o desenvolvimento
* Editar a configuração do servidor ou parar todos os servidores de uma vez

Claude cria a configuração inicial do servidor com base em seu projeto. Se seu aplicativo usa um comando dev personalizado, edite `.claude/launch.json` para corresponder à sua configuração. Veja [Configurar servidores de visualização](#configure-preview-servers) para a referência completa.

Para limpar dados de sessão salvos, alterne **Persist preview sessions** desligado em Configurações → Claude Code. Para desabilitar a visualização completamente, alterne **Preview** desligado em Configurações → Claude Code.

### Revisar alterações com visualização de diff

Depois que Claude faz alterações em seu código, a visualização de diff permite que você revise modificações arquivo por arquivo antes de criar um pull request.

Quando Claude altera arquivos, um indicador de estatísticas de diff aparece mostrando o número de linhas adicionadas e removidas, como `+12 -1`. Clique neste indicador para abrir o visualizador de diff, que exibe uma lista de arquivos à esquerda e as alterações para cada arquivo à direita.

Para comentar em linhas específicas, clique em qualquer linha no diff para abrir uma caixa de comentário. Digite seu feedback e pressione **Enter** para adicionar o comentário. Depois de adicionar comentários a várias linhas, envie todos os comentários de uma vez:

* **macOS**: pressione **Cmd+Enter**
* **Windows**: pressione **Ctrl+Enter**

Claude lê seus comentários e faz as alterações solicitadas, que aparecem como um novo diff que você pode revisar.

### Revisar seu código

Na visualização de diff, clique em **Review code** na barra de ferramentas superior direita para pedir a Claude para avaliar as alterações antes de você fazer commit. Claude examina os diffs atuais e deixa comentários diretamente na visualização de diff. Você pode responder a qualquer comentário ou pedir a Claude para revisar.

A revisão se concentra em problemas de alto sinal: erros de compilação, erros de lógica definidos, vulnerabilidades de segurança e bugs óbvios. Não sinaliza estilo, formatação, problemas pré-existentes ou qualquer coisa que um linter capturaria.

### Monitorar status de pull request

Depois de abrir um pull request, uma barra de status de CI aparece na sessão. Claude Code usa o GitHub CLI para pesquisar resultados de verificação e exibir falhas.

* **Auto-fix**: quando ativado, Claude tenta automaticamente corrigir verificações de CI falhando lendo a saída de falha e iterando.
* **Auto-merge**: quando ativado, Claude mescla o PR assim que todas as verificações passam. O método de mesclagem é squash. Auto-merge deve ser [ativado nas configurações do seu repositório GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-auto-merge-for-pull-requests-in-your-repository) para isso funcionar.

Use os toggles **Auto-fix** e **Auto-merge** na barra de status de CI para ativar qualquer opção. Claude Code também envia uma notificação de desktop quando CI termina.

<Note>
  O monitoramento de PR requer que o [GitHub CLI (`gh`)](https://cli.github.com/) esteja instalado e autenticado em sua máquina. Se `gh` não estiver instalado, Desktop o solicita a instalar na primeira vez que você tentar criar um PR.
</Note>

## Deixar Claude usar seu computador

Computer use permite que Claude abra seus aplicativos, controle sua tela e trabalhe diretamente em sua máquina da forma como você faria. Peça a Claude para testar um aplicativo nativo no simulador iOS, interagir com uma ferramenta de desktop que não tem CLI ou automatizar algo que só funciona através de uma GUI.

<Note>
  Computer use é uma visualização de pesquisa no macOS que requer um plano Pro ou Max. Não está disponível em planos Team ou Enterprise. O aplicativo Claude Desktop deve estar em execução.
</Note>

Computer use está desativado por padrão. [Ative-o em Configurações](#enable-computer-use) e conceda as permissões macOS necessárias antes que Claude possa controlar sua tela.

<Warning>
  Diferentemente da [ferramenta Bash sandboxed](/pt/sandboxing), computer use é executado em seu desktop real com acesso a tudo que você aprova. Claude verifica cada ação e sinaliza possível injeção de prompt do conteúdo na tela, mas o limite de confiança é diferente. Veja o [guia de segurança de computer use](https://support.claude.com/en/articles/14128542) para melhores práticas.
</Warning>

### Quando computer use se aplica

Claude tem várias maneiras de interagir com um aplicativo ou serviço, e computer use é a mais ampla e lenta. Ele tenta a ferramenta mais precisa primeiro:

* Se você tem um [connector](#connect-external-tools) para um serviço, Claude usa o connector.
* Se a tarefa é um comando shell, Claude usa Bash.
* Se a tarefa é trabalho de navegador e você tem [Claude no Chrome](/pt/chrome) configurado, Claude usa isso.
* Se nenhum desses se aplica, Claude usa computer use.

Os [níveis de acesso por aplicativo](#app-permissions) reforçam isso: navegadores são limitados a apenas visualização, e terminais e IDEs a apenas clique, direcionando Claude para a ferramenta dedicada mesmo quando computer use está ativo. O controle de tela é reservado para coisas que nada mais pode alcançar, como aplicativos nativos, painéis de controle de hardware, o simulador iOS ou ferramentas proprietárias sem uma API.

### Ativar computer use

Computer use está desativado por padrão. Se você pedir a Claude para fazer algo que precisa disso enquanto está desativado, Claude diz que poderia fazer a tarefa se você ativar computer use em Configurações. Para ativar, abra **Configurações > Aplicativo Desktop > Geral** e alterne **Computer use** ligado. Antes do toggle entrar em efeito, você precisa conceder duas permissões do sistema macOS:

* **Acessibilidade**: permite que Claude clique, digite e role
* **Gravação de Tela**: permite que Claude veja o que está em sua tela

A página de Configurações mostra o status atual de cada permissão. Se alguma for negada, clique no badge para abrir o painel de Configurações do Sistema relevante.

### Permissões de aplicativo

A primeira vez que Claude precisa usar um aplicativo, um prompt aparece em sua sessão. Clique em **Permitir para esta sessão** ou **Negar**. As aprovações duram para a sessão atual, ou 30 minutos em [sessões geradas por Dispatch](#sessions-from-dispatch).

O prompt também mostra que nível de controle Claude obtém para esse aplicativo. Esses níveis são fixos por categoria de aplicativo e não podem ser alterados:

| Nível               | O que Claude pode fazer                                    | Se aplica a                            |
| :------------------ | :--------------------------------------------------------- | :------------------------------------- |
| Apenas visualização | Ver o aplicativo em capturas de tela                       | Navegadores, plataformas de negociação |
| Apenas clique       | Clicar e rolar, mas não digitar ou usar atalhos de teclado | Terminais, IDEs                        |
| Controle total      | Clicar, digitar, arrastar e usar atalhos de teclado        | Tudo mais                              |

Aplicativos com alcance amplo como Terminal, Finder e Configurações do Sistema mostram um aviso extra no prompt para que você saiba o que aprovar concede.

Você pode configurar duas configurações em **Configurações > Aplicativo Desktop > Geral**:

* **Aplicativos negados**: adicione aplicativos aqui para rejeitá-los sem solicitar. Claude ainda pode afetar um aplicativo negado indiretamente através de ações em um aplicativo permitido, mas não pode interagir com o aplicativo negado diretamente.
* **Mostrar aplicativos quando Claude termina**: enquanto Claude está trabalhando, suas outras janelas são ocultadas para que ele interaja apenas com o aplicativo aprovado. Quando Claude termina, as janelas ocultas são restauradas a menos que você desative essa configuração.

## Gerenciar sessões

Cada sessão é uma conversa independente com seu próprio contexto e alterações. Você pode executar múltiplas sessões em paralelo, enviar trabalho para a nuvem ou deixar Dispatch iniciar sessões para você do seu telefone.

### Trabalhar em paralelo com sessões

Clique em **+ New session** na barra lateral para trabalhar em múltiplas tarefas em paralelo. Para repositórios Git, cada sessão obtém sua própria cópia isolada do seu projeto usando [Git worktrees](/pt/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees), para que alterações em uma sessão não afetem outras sessões até que você as faça commit.

Worktrees são armazenadas em `<project-root>/.claude/worktrees/` por padrão. Você pode alterar isso para um diretório personalizado em Configurações → Claude Code em "Worktree location". Você também pode definir um prefixo de branch que é adicionado a cada nome de branch worktree, o que é útil para manter branches criadas por Claude organizadas. Para remover um worktree quando terminar, passe o mouse sobre a sessão na barra lateral e clique no ícone de arquivo.

<Note>
  O isolamento de sessão requer [Git](https://git-scm.com/downloads). A maioria dos Macs inclui Git por padrão. Execute `git --version` no Terminal para verificar. No Windows, Git é necessário para a aba Code funcionar: [baixe Git para Windows](https://git-scm.com/downloads/win), instale-o e reinicie o aplicativo. Se você encontrar erros de Git, tente uma sessão Cowork para ajudar a solucionar problemas de sua configuração.
</Note>

Use o ícone de filtro no topo da barra lateral para filtrar sessões por status (Ativo, Arquivado) e ambiente (Local, Nuvem). Para renomear uma sessão ou verificar o uso de contexto, clique no título da sessão na barra de ferramentas no topo da sessão ativa. Quando o contexto se enche, Claude automaticamente resume a conversa e continua trabalhando. Você também pode digitar `/compact` para disparar a sumarização mais cedo e liberar espaço de contexto. Veja [a janela de contexto](/pt/how-claude-code-works#the-context-window) para detalhes sobre como a compactação funciona.

### Executar tarefas de longa duração remotamente

Para grandes refatorações, suites de teste, migrações ou outras tarefas de longa duração, selecione **Remote** em vez de **Local** ao iniciar uma sessão. Sessões remotas são executadas na infraestrutura em nuvem da Anthropic e continuam mesmo se você fechar o aplicativo ou desligar seu computador. Verifique a qualquer momento para ver o progresso ou direcionar Claude em uma direção diferente. Você também pode monitorar sessões remotas de [claude.ai/code](https://claude.ai/code) ou do aplicativo Claude iOS.

Sessões remotas também suportam múltiplos repositórios. Depois de selecionar um ambiente em nuvem, clique no botão **+** ao lado do pill de repo para adicionar repositórios adicionais à sessão. Cada repo obtém seu próprio seletor de branch. Isso é útil para tarefas que abrangem múltiplas bases de código, como atualizar uma biblioteca compartilhada e seus consumidores.

Veja [Claude Code na web](/pt/claude-code-on-the-web) para mais sobre como sessões remotas funcionam.

### Continuar em outra superfície

O menu **Continue in**, acessível do ícone VS Code no canto inferior direito da barra de ferramentas da sessão, permite que você mova sua sessão para outra superfície:

* **Claude Code na Web**: envia sua sessão local para continuar executando remotamente. Desktop envia seu branch, gera um resumo da conversa e cria uma nova sessão remota com o contexto completo. Você pode então escolher arquivar a sessão local ou mantê-la. Isso requer uma árvore de trabalho limpa e não está disponível para sessões SSH.
* **Seu IDE**: abre seu projeto em um IDE suportado no diretório de trabalho atual.

### Sessões do Dispatch

[Dispatch](https://support.claude.com/en/articles/13947068) é uma conversa persistente com Claude que vive na aba [Cowork](https://claude.com/product/cowork#dispatch-and-computer-use). Você envia uma mensagem ao Dispatch com uma tarefa, e ele decide como lidar com ela.

Uma tarefa pode acabar como uma sessão de Code de duas maneiras: você pede uma diretamente, como "abra uma sessão Claude Code e corrija o bug de login", ou Dispatch decide que a tarefa é trabalho de desenvolvimento e gera uma por conta própria. Tarefas que normalmente são roteadas para Code incluem corrigir bugs, atualizar dependências, executar testes ou abrir pull requests. Pesquisa, edição de documentos e trabalho em planilhas ficam em Cowork.

De qualquer forma, a sessão de Code aparece na barra lateral da aba Code com um badge **Dispatch**. Você recebe uma notificação push em seu telefone quando termina ou precisa de sua aprovação.

Se você tem [computer use](#let-claude-use-your-computer) ativado, sessões de Code geradas por Dispatch também podem usá-lo. As aprovações de aplicativo nessas sessões expiram após 30 minutos e solicitam novamente, em vez de durarem a sessão completa como sessões de Code regulares.

Para configuração, emparelhamento e configurações de Dispatch, veja o [artigo de ajuda do Dispatch](https://support.claude.com/en/articles/13947068). Dispatch requer um plano Pro ou Max e não está disponível em planos Team ou Enterprise.

Dispatch é uma de várias maneiras de trabalhar com Claude quando você está longe de seu terminal. Veja [Plataformas e integrações](/pt/platforms#work-when-you-are-away-from-your-terminal) para compará-lo com Remote Control, Channels, Slack e tarefas agendadas.

## Estender Claude Code

Conecte serviços externos, adicione fluxos de trabalho reutilizáveis, customize o comportamento de Claude e configure servidores de visualização.

### Conectar ferramentas externas

Para sessões locais e [SSH](#ssh-sessions), clique no botão **+** ao lado da caixa de prompt e selecione **Connectors** para adicionar integrações como Google Calendar, Slack, GitHub, Linear, Notion e muito mais. Você pode adicionar conectores antes ou durante uma sessão. O botão **+** não está disponível em sessões remotas, mas [tarefas agendadas](/pt/web-scheduled-tasks) configuram conectores no momento da criação da tarefa.

Para gerenciar ou desconectar conectores, vá para Configurações → Connectors no aplicativo desktop, ou selecione **Manage connectors** no menu Connectors na caixa de prompt.

Uma vez conectado, Claude pode ler seu calendário, enviar mensagens, criar problemas e interagir com suas ferramentas diretamente. Você pode perguntar a Claude quais conectores estão configurados em sua sessão.

Conectores são [MCP servers](/pt/mcp) com um fluxo de configuração gráfica. Use-os para integração rápida com serviços suportados. Para integrações não listadas em Connectors, adicione MCP servers manualmente via [arquivos de configuração](/pt/mcp#installing-mcp-servers). Você também pode [criar conectores personalizados](https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp).

### Use skills

[Skills](/pt/skills) estendem o que Claude pode fazer. Claude as carrega automaticamente quando relevante, ou você pode invocar uma diretamente: digite `/` na caixa de prompt ou clique no botão **+** e selecione **Slash commands** para navegar pelo que está disponível. Isso inclui [comandos integrados](/pt/commands), suas [skills personalizadas](/pt/skills#create-custom-skills), skills de projeto de sua base de código e skills de qualquer [plugins instalados](/pt/plugins). Selecione uma e ela aparece destacada no campo de entrada. Digite sua tarefa depois dela e envie como usual.

### Instalar plugins

[Plugins](/pt/plugins) são pacotes reutilizáveis que adicionam skills, agents, hooks, MCP servers e configurações LSP ao Claude Code. Você pode instalar plugins do aplicativo desktop sem usar o terminal.

Para sessões locais e [SSH](#ssh-sessions), clique no botão **+** ao lado da caixa de prompt e selecione **Plugins** para ver seus plugins instalados e seus comandos. Para adicionar um plugin, selecione **Add plugin** no submenu para abrir o navegador de plugins, que mostra plugins disponíveis de seus [marketplaces](/pt/plugin-marketplaces) configurados incluindo o marketplace oficial da Anthropic. Selecione **Manage plugins** para ativar, desativar ou desinstalar plugins.

Plugins podem ser escopo para sua conta de usuário, um projeto específico ou apenas local. Plugins não estão disponíveis para sessões remotas. Para a referência completa de plugins incluindo criar seus próprios plugins, veja [plugins](/pt/plugins).

### Configurar servidores de visualização

Claude detecta automaticamente sua configuração de servidor de desenvolvimento e armazena a configuração em `.claude/launch.json` na raiz da pasta que você selecionou ao iniciar a sessão. Preview usa essa pasta como seu diretório de trabalho, então se você selecionou uma pasta pai, subpastas com seus próprios servidores de desenvolvimento não serão detectadas automaticamente. Para trabalhar com o servidor de uma subpasta, inicie uma sessão nessa pasta diretamente ou adicione uma configuração manualmente.

Para personalizar como seu servidor inicia, por exemplo para usar `yarn dev` em vez de `npm run dev` ou para alterar a porta, edite o arquivo manualmente ou clique em **Edit configuration** no menu Preview para abri-lo em seu editor de código. O arquivo suporta JSON com comentários.

```json  theme={null}
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "my-app",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3000
    }
  ]
}
```

Você pode definir múltiplas configurações para executar diferentes servidores do mesmo projeto, como um frontend e uma API. Veja os [exemplos](#examples) abaixo.

#### Auto-verify changes

Quando `autoVerify` está ativado, Claude verifica automaticamente alterações de código após editar arquivos. Ele tira capturas de tela, verifica erros e confirma que as alterações funcionam antes de completar sua resposta.

Auto-verify está ativado por padrão. Desative-o por projeto adicionando `"autoVerify": false` a `.claude/launch.json`, ou alterne-o no menu **Preview**.

```json  theme={null}
{
  "version": "0.0.1",
  "autoVerify": false,
  "configurations": [...]
}
```

Quando desativado, ferramentas de visualização ainda estão disponíveis e você pode pedir a Claude para verificar a qualquer momento. Auto-verify torna isso automático após cada edição.

#### Configuration fields

Cada entrada no array `configurations` aceita os seguintes campos:

| Campo               | Tipo      | Descrição                                                                                                                                                                                                                                     |
| ------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | string    | Um identificador único para este servidor                                                                                                                                                                                                     |
| `runtimeExecutable` | string    | O comando a executar, como `npm`, `yarn` ou `node`                                                                                                                                                                                            |
| `runtimeArgs`       | string\[] | Argumentos passados para `runtimeExecutable`, como `["run", "dev"]`                                                                                                                                                                           |
| `port`              | number    | A porta em que seu servidor escuta. Padrão é 3000                                                                                                                                                                                             |
| `cwd`               | string    | Diretório de trabalho relativo à raiz do seu projeto. Padrão é a raiz do projeto. Use `${workspaceFolder}` para referenciar a raiz do projeto explicitamente                                                                                  |
| `env`               | object    | Variáveis de ambiente adicionais como pares chave-valor, como `{ "NODE_ENV": "development" }`. Não coloque segredos aqui já que este arquivo é commitado em seu repo. Segredos definidos em seu perfil de shell são herdados automaticamente. |
| `autoPort`          | boolean   | Como lidar com conflitos de porta. Veja abaixo                                                                                                                                                                                                |
| `program`           | string    | Um script a executar com `node`. Veja [quando usar `program` vs `runtimeExecutable`](#when-to-use-program-vs-runtimeexecutable)                                                                                                               |
| `args`              | string\[] | Argumentos passados para `program`. Usado apenas quando `program` está definido                                                                                                                                                               |

##### When to use `program` vs `runtimeExecutable`

Use `runtimeExecutable` com `runtimeArgs` para iniciar um servidor de desenvolvimento através de um gerenciador de pacotes. Por exemplo, `"runtimeExecutable": "npm"` com `"runtimeArgs": ["run", "dev"]` executa `npm run dev`.

Use `program` quando você tem um script independente que quer executar com `node` diretamente. Por exemplo, `"program": "server.js"` executa `node server.js`. Passe flags adicionais com `args`.

#### Port conflicts

O campo `autoPort` controla o que acontece quando sua porta preferida já está em uso:

* **`true`**: Claude encontra e usa uma porta livre automaticamente. Adequado para a maioria dos servidores de desenvolvimento.
* **`false`**: Claude falha com um erro. Use isso quando seu servidor deve usar uma porta específica, como para callbacks OAuth ou allowlists CORS.
* **Não definido (padrão)**: Claude pergunta se o servidor precisa dessa porta exata, depois salva sua resposta.

Quando Claude escolhe uma porta diferente, ele passa a porta atribuída ao seu servidor via a variável de ambiente `PORT`.

#### Examples

Essas configurações mostram setups comuns para diferentes tipos de projeto:

<Tabs>
  <Tab title="Next.js">
    Esta configuração executa um aplicativo Next.js usando Yarn na porta 3000:

    ```json  theme={null}
    {
      "version": "0.0.1",
      "configurations": [
        {
          "name": "web",
          "runtimeExecutable": "yarn",
          "runtimeArgs": ["dev"],
          "port": 3000
        }
      ]
    }
    ```
  </Tab>

  <Tab title="Multiple servers">
    Para um monorepo com um servidor frontend e API, defina múltiplas configurações. O frontend usa `autoPort: true` para que escolha uma porta livre se 3000 estiver ocupada, enquanto o servidor API requer a porta 8080 exatamente:

    ```json  theme={null}
    {
      "version": "0.0.1",
      "configurations": [
        {
          "name": "frontend",
          "runtimeExecutable": "npm",
          "runtimeArgs": ["run", "dev"],
          "cwd": "apps/web",
          "port": 3000,
          "autoPort": true
        },
        {
          "name": "api",
          "runtimeExecutable": "npm",
          "runtimeArgs": ["run", "start"],
          "cwd": "server",
          "port": 8080,
          "env": { "NODE_ENV": "development" },
          "autoPort": false
        }
      ]
    }
    ```
  </Tab>

  <Tab title="Node.js script">
    Para executar um script Node.js diretamente em vez de usar um comando do gerenciador de pacotes, use o campo `program`:

    ```json  theme={null}
    {
      "version": "0.0.1",
      "configurations": [
        {
          "name": "server",
          "program": "server.js",
          "args": ["--verbose"],
          "port": 4000
        }
      ]
    }
    ```
  </Tab>
</Tabs>

## Agendar tarefas recorrentes

Por padrão, tarefas agendadas iniciam uma nova sessão automaticamente em um horário e frequência que você escolhe. Use-as para trabalho recorrente como revisões de código diárias, verificações de atualização de dependência ou briefings matinais que puxam de seu calendário e caixa de entrada.

### Comparar opções de agendamento

Claude Code offers three ways to schedule recurring work:

|                            | [Cloud](/en/web-scheduled-tasks) | [Desktop](/en/desktop#schedule-recurring-tasks) | [`/loop`](/en/scheduled-tasks) |
| :------------------------- | :------------------------------- | :---------------------------------------------- | :----------------------------- |
| Runs on                    | Anthropic cloud                  | Your machine                                    | Your machine                   |
| Requires machine on        | No                               | Yes                                             | Yes                            |
| Requires open session      | No                               | No                                              | Yes                            |
| Persistent across restarts | Yes                              | Yes                                             | No (session-scoped)            |
| Access to local files      | No (fresh clone)                 | Yes                                             | Yes                            |
| MCP servers                | Connectors configured per task   | [Config files](/en/mcp) and connectors          | Inherits from session          |
| Permission prompts         | No (runs autonomously)           | Configurable per task                           | Inherits from session          |
| Customizable schedule      | Via `/schedule` in the CLI       | Yes                                             | Yes                            |
| Minimum interval           | 1 hour                           | 1 minute                                        | 1 minute                       |

<Tip>
  Use **cloud tasks** for work that should run reliably without your machine. Use **Desktop tasks** when you need access to local files and tools. Use **`/loop`** for quick polling during a session.
</Tip>

A página Schedule suporta dois tipos de tarefas:

* **Tarefas locais**: são executadas em sua máquina. Elas têm acesso direto aos seus arquivos e ferramentas locais, mas o aplicativo desktop deve estar aberto e seu computador acordado para que elas sejam executadas.
* **Tarefas remotas**: são executadas na infraestrutura em nuvem gerenciada pela Anthropic. Elas continuam em execução mesmo quando seu computador está desligado, mas funcionam contra um clone fresco de seu repositório em vez de seu checkout local.

Ambos os tipos aparecem na mesma grade de tarefas. Clique em **New task** para escolher qual tipo criar. O resto desta seção cobre tarefas locais; para tarefas remotas, veja [Tarefas agendadas em nuvem](/pt/web-scheduled-tasks).

Veja [Como tarefas agendadas são executadas](#how-scheduled-tasks-run) para detalhes sobre execuções perdidas e comportamento de recuperação para tarefas locais.

<Note>
  Por padrão, tarefas agendadas locais são executadas contra qualquer estado em que seu diretório de trabalho esteja, incluindo alterações não commitadas. Ative o toggle worktree na entrada de prompt para dar a cada execução seu próprio Git worktree isolado, da mesma forma que [sessões paralelas](#work-in-parallel-with-sessions) funcionam.
</Note>

Para criar uma tarefa agendada local, clique em **Schedule** na barra lateral, clique em **New task** e escolha **New local task**. Configure esses campos:

| Campo       | Descrição                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name        | Identificador para a tarefa. Convertido para kebab-case minúsculo e usado como nome de pasta no disco. Deve ser único entre suas tarefas.                                                                                                                    |
| Description | Resumo curto mostrado na lista de tarefas.                                                                                                                                                                                                                   |
| Prompt      | As instruções enviadas a Claude quando a tarefa é executada. Escreva isso da mesma forma que você escreveria qualquer mensagem na caixa de prompt. A entrada de prompt também inclui controles para modelo, modo de permissão, pasta de trabalho e worktree. |
| Frequency   | Com que frequência a tarefa é executada. Veja [opções de frequência](#frequency-options) abaixo.                                                                                                                                                             |

Você também pode criar uma tarefa descrevendo o que você quer em qualquer sessão. Por exemplo, "configure uma revisão de código diária que é executada todo dia de manhã às 9am."

### Frequency options

* **Manual**: sem cronograma, apenas é executada quando você clica em **Run now**. Útil para salvar um prompt que você dispara sob demanda
* **Hourly**: é executada a cada hora. Cada tarefa obtém um deslocamento fixo de até 10 minutos do topo da hora para escalonar tráfego de API
* **Daily**: mostra um seletor de hora, padrão é 9:00 AM hora local
* **Weekdays**: igual a Daily mas pula sábado e domingo
* **Weekly**: mostra um seletor de hora e um seletor de dia

Para intervalos que o seletor não oferece (a cada 15 minutos, primeiro de cada mês, etc.), peça a Claude em qualquer sessão Desktop para definir o cronograma. Use linguagem simples; por exemplo, "agende uma tarefa para executar todos os testes a cada 6 horas."

### How scheduled tasks run

Tarefas agendadas locais são executadas em sua máquina. Desktop verifica o cronograma a cada minuto enquanto o aplicativo está aberto e inicia uma sessão fresca quando uma tarefa é devida, independente de qualquer sessão manual que você tenha aberta. Cada tarefa obtém um atraso fixo de até 10 minutos após o horário agendado para escalonar tráfego de API. O atraso é determinístico: a mesma tarefa sempre inicia no mesmo deslocamento.

Quando uma tarefa dispara, você recebe uma notificação de desktop e uma nova sessão aparece em uma seção **Scheduled** na barra lateral. Abra-a para ver o que Claude fez, revise alterações ou responda a prompts de permissão. A sessão funciona como qualquer outra: Claude pode editar arquivos, executar comandos, criar commits e abrir pull requests.

Tarefas apenas são executadas enquanto o aplicativo desktop está em execução e seu computador está acordado. Se seu computador dorme durante um horário agendado, a execução é pulada. Para evitar sono ocioso, ative **Keep computer awake** em Configurações em **Desktop app → General**. Fechar a tampa do laptop ainda o coloca em sono. Para tarefas que precisam ser executadas mesmo quando seu computador está desligado, use uma [tarefa remota](/pt/web-scheduled-tasks) em vez disso.

### Missed runs

Quando o aplicativo inicia ou seu computador acorda, Desktop verifica se cada tarefa perdeu alguma execução nos últimos sete dias. Se perdeu, Desktop inicia exatamente uma execução de recuperação para o horário mais recentemente perdido e descarta qualquer coisa mais antiga. Uma tarefa diária que perdeu seis dias é executada uma vez ao acordar. Desktop mostra uma notificação quando uma execução de recuperação inicia.

Tenha isso em mente ao escrever prompts. Uma tarefa agendada para 9am pode ser executada às 11pm se seu computador dormiu o dia todo. Se o horário importa, adicione guardrails ao próprio prompt, por exemplo: "Apenas revise os commits de hoje. Se for depois das 5pm, pule a revisão e apenas poste um resumo do que foi perdido."

### Permissions for scheduled tasks

Cada tarefa tem seu próprio modo de permissão, que você define ao criar ou editar a tarefa. Regras de permissão de `~/.claude/settings.json` também se aplicam a sessões de tarefas agendadas. Se uma tarefa é executada em modo Ask e precisa executar uma ferramenta para a qual não tem permissão, a execução trava até que você a aprove. A sessão fica aberta na barra lateral para que você possa responder depois.

Para evitar travamentos, clique em **Run now** depois de criar uma tarefa, observe prompts de permissão e selecione "sempre permitir" para cada um. Execuções futuras dessa tarefa auto-aprovam as mesmas ferramentas sem solicitar. Você pode revisar e revogar essas aprovações na página de detalhes da tarefa.

### Manage scheduled tasks

Clique em uma tarefa na lista **Schedule** para abrir sua página de detalhes. Daqui você pode:

* **Run now**: inicie a tarefa imediatamente sem esperar pelo próximo horário agendado
* **Toggle repeats**: pause ou retome execuções agendadas sem deletar a tarefa
* **Edit**: altere o prompt, frequência, pasta ou outras configurações
* **Review history**: veja cada execução passada, incluindo aquelas que foram puladas porque seu computador estava dormindo
* **Review allowed permissions**: veja e revogue aprovações de ferramentas salvas para esta tarefa no painel **Always allowed**
* **Delete**: remova a tarefa e arquive todas as sessões que ela criou

Você também pode gerenciar tarefas pedindo a Claude em qualquer sessão Desktop. Por exemplo, "pause minha tarefa dependency-audit", "delete a tarefa standup-prep" ou "mostre minhas tarefas agendadas."

Para editar o prompt de uma tarefa no disco, abra `~/.claude/scheduled-tasks/<task-name>/SKILL.md` (ou em [`CLAUDE_CONFIG_DIR`](/pt/env-vars) se definido). O arquivo usa frontmatter YAML para `name` e `description`, com o prompt como o corpo. Alterações entram em efeito na próxima execução. Cronograma, pasta, modelo e estado ativado não estão neste arquivo: altere-os através do formulário Edit ou peça a Claude.

## Configuração de ambiente

O ambiente que você escolhe ao [iniciar uma sessão](#start-a-session) determina onde Claude é executado e como você se conecta:

* **Local**: é executado em sua máquina com acesso direto aos seus arquivos
* **Remote**: é executado na infraestrutura em nuvem da Anthropic. Sessões continuam mesmo se você fechar o aplicativo.
* **SSH**: é executado em uma máquina remota à qual você se conecta via SSH, como seus próprios servidores, VMs em nuvem ou dev containers

### Local sessions

Sessões locais herdam variáveis de ambiente de seu shell. Se você precisa de variáveis adicionais, defina-as em seu perfil de shell, como `~/.zshrc` ou `~/.bashrc`, e reinicie o aplicativo desktop. Veja [variáveis de ambiente](/pt/env-vars) para a lista completa de variáveis suportadas.

[Extended thinking](/pt/common-workflows#use-extended-thinking-thinking-mode) está ativado por padrão, o que melhora o desempenho em tarefas de raciocínio complexo mas usa tokens adicionais. Para desabilitar o thinking completamente, defina `MAX_THINKING_TOKENS=0` em seu perfil de shell. Em Opus, `MAX_THINKING_TOKENS` é ignorado exceto para `0` porque raciocínio adaptativo controla a profundidade do thinking.

### Remote sessions

Sessões remotas continuam em segundo plano mesmo se você fechar o aplicativo. O uso conta para seus [limites do plano de assinatura](/pt/costs) sem cobranças de computação separadas.

Você pode criar ambientes em nuvem personalizados com diferentes níveis de acesso de rede e variáveis de ambiente. Selecione o menu suspenso de ambiente ao iniciar uma sessão remota e escolha **Add environment**. Veja [ambientes em nuvem](/pt/claude-code-on-the-web#cloud-environment) para detalhes sobre configuração de acesso de rede e variáveis de ambiente.

### SSH sessions

Sessões SSH permitem que você execute Claude Code em uma máquina remota enquanto usa o aplicativo desktop como sua interface. Isso é útil para trabalhar com bases de código que vivem em VMs em nuvem, dev containers ou servidores com hardware ou dependências específicas.

Para adicionar uma conexão SSH, clique no menu suspenso de ambiente antes de iniciar uma sessão e selecione **+ Add SSH connection**. O diálogo solicita:

* **Name**: um rótulo amigável para esta conexão
* **SSH Host**: `user@hostname` ou um host definido em `~/.ssh/config`
* **SSH Port**: padrão é 22 se deixado vazio, ou usa a porta de seu SSH config
* **Identity File**: caminho para sua chave privada, como `~/.ssh/id_rsa`. Deixe vazio para usar a chave padrão ou seu SSH config.

Uma vez adicionada, a conexão aparece no menu suspenso de ambiente. Selecione-a para iniciar uma sessão naquela máquina. Claude é executado na máquina remota com acesso aos seus arquivos e ferramentas.

Claude Code deve estar instalado na máquina remota. Uma vez conectado, sessões SSH suportam modos de permissão, conectores, plugins e MCP servers.

## Configuração corporativa

Organizações em planos Teams ou Enterprise podem gerenciar o comportamento do aplicativo desktop através de controles do console de administração, arquivos de configurações gerenciadas e políticas de gerenciamento de dispositivos.

### Admin console controls

Essas configurações são configuradas através do [console de configurações de administração](https://claude.ai/admin-settings/claude-code):

* **Code no desktop**: controle se usuários em sua organização podem acessar Claude Code no aplicativo desktop
* **Code na web**: ative ou desative [sessões web](/pt/claude-code-on-the-web) para sua organização
* **Remote Control**: ative ou desative [Remote Control](/pt/remote-control) para sua organização
* **Desabilitar modo Bypass permissions**: impeça usuários em sua organização de ativar o modo bypass permissions

### Managed settings

Configurações gerenciadas sobrescrevem configurações de projeto e usuário e se aplicam quando Desktop gera sessões CLI. Você pode definir essas chaves no arquivo de [configurações gerenciadas](/pt/settings#settings-precedence) de sua organização ou enviá-las remotamente através do console de administração.

| Chave                                      | Descrição                                                                                                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permissions.disableBypassPermissionsMode` | defina como `"disable"` para impedir usuários de ativar o modo Bypass permissions.                                                                                                            |
| `disableAutoMode`                          | defina como `"disable"` para impedir usuários de ativar o modo [Auto](/pt/permission-modes#eliminate-prompts-with-auto-mode). Remove Auto do seletor de modo. Também aceito em `permissions`. |
| `autoMode`                                 | customize o que o classificador de modo auto confia e bloqueia em sua organização. Veja [Configurar o classificador de modo auto](/pt/permissions#configure-the-auto-mode-classifier).        |

`permissions.disableBypassPermissionsMode` e `disableAutoMode` também funcionam em configurações de usuário e projeto, mas colocá-los em configurações gerenciadas impede que usuários os sobrescrevam. `autoMode` é lido de configurações de usuário, `.claude/settings.local.json` e configurações gerenciadas, mas não de `.claude/settings.json` verificado: um repo clonado não pode injetar suas próprias regras de classificador. Para a lista completa de configurações apenas gerenciadas incluindo `allowManagedPermissionRulesOnly` e `allowManagedHooksOnly`, veja [configurações apenas gerenciadas](/pt/permissions#managed-only-settings).

Configurações gerenciadas remotas enviadas através do console de administração atualmente se aplicam apenas a sessões CLI e IDE. Para restrições específicas do Desktop, use os controles do console de administração acima.

### Device management policies

Equipes de TI podem gerenciar o aplicativo desktop através de MDM em macOS ou group policy no Windows. As políticas disponíveis incluem ativar ou desativar o recurso Claude Code, controlar atualizações automáticas e definir uma URL de implantação personalizada.

* **macOS**: configure via domínio de preferência `com.anthropic.Claude` usando ferramentas como Jamf ou Kandji
* **Windows**: configure via registro em `SOFTWARE\Policies\Claude`

### Authentication and SSO

Organizações corporativas podem exigir SSO para todos os usuários. Veja [autenticação](/pt/authentication) para detalhes de nível de plano e [Configurando SSO](https://support.claude.com/en/articles/13132885-setting-up-single-sign-on-sso) para configuração SAML e OIDC.

### Data handling

Claude Code processa seu código localmente em sessões locais ou na infraestrutura em nuvem da Anthropic em sessões remotas. Conversas e contexto de código são enviados para a API da Anthropic para processamento. Veja [manipulação de dados](/pt/data-usage) para detalhes sobre retenção de dados, privacidade e conformidade.

### Deployment

Desktop pode ser distribuído através de ferramentas de implantação corporativa:

* **macOS**: distribua via MDM como Jamf ou Kandji usando o instalador `.dmg`
* **Windows**: implante via pacote MSIX ou instalador `.exe`. Veja [Deploy Claude Desktop for Windows](https://support.claude.com/en/articles/12622703-deploy-claude-desktop-for-windows) para opções de implantação corporativa incluindo instalação silenciosa

Para configuração de rede como configurações de proxy, allowlisting de firewall e gateways LLM, veja [configuração de rede](/pt/network-config).

Para a referência completa de configuração corporativa, veja o [guia de configuração corporativa](https://support.claude.com/en/articles/12622667-enterprise-configuration).

## Vindo do CLI?

Se você já usa o CLI do Claude Code, Desktop executa o mesmo mecanismo subjacente com uma interface gráfica. Você pode executar ambos simultaneamente na mesma máquina, até mesmo no mesmo projeto. Cada um mantém histórico de sessão separado, mas compartilham configuração e memória de projeto via arquivos CLAUDE.md.

Para mover uma sessão CLI para Desktop, execute `/desktop` no terminal. Claude salva sua sessão e a abre no aplicativo desktop, depois sai do CLI. Este comando está disponível apenas em macOS e Windows.

<Tip>
  Quando usar Desktop vs CLI: use Desktop quando você quer revisão visual de diff, anexos de arquivo ou gerenciamento de sessão em uma barra lateral. Use o CLI quando você precisa de scripting, automação, provedores de terceiros ou prefere um fluxo de trabalho de terminal.
</Tip>

### CLI flag equivalents

Esta tabela mostra o equivalente do aplicativo desktop para flags CLI comuns. Flags não listadas não têm equivalente desktop porque são projetadas para scripting ou automação.

| CLI                                        | Equivalente desktop                                                                                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--model sonnet`                           | menu suspenso de modelo ao lado do botão enviar, antes de iniciar uma sessão                                                                                          |
| `--resume`, `--continue`                   | clique em uma sessão na barra lateral                                                                                                                                 |
| `--permission-mode`                        | seletor de modo ao lado do botão enviar                                                                                                                               |
| `--dangerously-skip-permissions`           | Modo Bypass permissions. Ative em Configurações → Claude Code → "Permitir modo bypass permissions". Administradores corporativos podem desabilitar essa configuração. |
| `--add-dir`                                | adicione múltiplos repos com o botão **+** em sessões remotas                                                                                                         |
| `--allowedTools`, `--disallowedTools`      | não disponível em Desktop                                                                                                                                             |
| `--verbose`                                | não disponível. Verifique logs do sistema: Console.app em macOS, Event Viewer → Windows Logs → Application em Windows                                                 |
| `--print`, `--output-format`               | não disponível. Desktop é apenas interativo.                                                                                                                          |
| Variável de ambiente `ANTHROPIC_MODEL`     | menu suspenso de modelo ao lado do botão enviar                                                                                                                       |
| Variável de ambiente `MAX_THINKING_TOKENS` | defina em perfil de shell; se aplica a sessões locais. Veja [configuração de ambiente](#environment-configuration).                                                   |

### Shared configuration

Desktop e CLI leem os mesmos arquivos de configuração, então sua configuração é transferida:

* Arquivos **[CLAUDE.md](/pt/memory)** em seu projeto são usados por ambos
* **[MCP servers](/pt/mcp)** configurados em `~/.claude.json` ou `.mcp.json` funcionam em ambos
* **[Hooks](/pt/hooks)** e **[skills](/pt/skills)** definidos em configurações se aplicam a ambos
* **[Configurações](/pt/settings)** em `~/.claude.json` e `~/.claude/settings.json` são compartilhadas. Regras de permissão, ferramentas permitidas e outras configurações em `settings.json` se aplicam a sessões Desktop.
* **Modelos**: Sonnet, Opus e Haiku estão disponíveis em ambos. Em Desktop, selecione o modelo no menu suspenso ao lado do botão enviar antes de iniciar uma sessão. Você não pode alterar o modelo durante uma sessão ativa.

<Note>
  **MCP servers: aplicativo de chat desktop vs Claude Code**: MCP servers configurados para o aplicativo de chat Claude Desktop em `claude_desktop_config.json` são separados do Claude Code e não aparecerão na aba Code. Para usar MCP servers em Claude Code, configure-os em `~/.claude.json` ou no arquivo `.mcp.json` do seu projeto. Veja [configuração MCP](/pt/mcp#installing-mcp-servers) para detalhes.
</Note>

### Feature comparison

Esta tabela compara capacidades principais entre CLI e Desktop. Para uma lista completa de flags CLI, veja a [referência CLI](/pt/cli-reference).

| Recurso                                                 | CLI                                                       | Desktop                                                                                            |
| ------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Modos de permissão                                      | Todos os modos incluindo `dontAsk`                        | Pedir permissões, Auto aceitar edições, Plan mode, Auto e Bypass permissions via Configurações     |
| `--dangerously-skip-permissions`                        | Flag CLI                                                  | Modo Bypass permissions. Ative em Configurações → Claude Code → "Permitir modo bypass permissions" |
| [Provedores de terceiros](/pt/third-party-integrations) | Bedrock, Vertex, Foundry                                  | Não disponível. Desktop se conecta diretamente à API da Anthropic.                                 |
| [MCP servers](/pt/mcp)                                  | Configure em arquivos de configuração                     | UI de Connectors para sessões locais e SSH, ou arquivos de configuração                            |
| [Plugins](/pt/plugins)                                  | Comando `/plugin`                                         | UI do gerenciador de plugins                                                                       |
| @mention de arquivos                                    | Baseado em texto                                          | Com autocompletar                                                                                  |
| Anexos de arquivo                                       | Não disponível                                            | Imagens, PDFs                                                                                      |
| Isolamento de sessão                                    | Flag [`--worktree`](/pt/cli-reference)                    | Worktrees automáticos                                                                              |
| Múltiplas sessões                                       | Terminais separados                                       | Abas na barra lateral                                                                              |
| Tarefas recorrentes                                     | Cron jobs, pipelines CI                                   | [Tarefas agendadas](#schedule-recurring-tasks)                                                     |
| Computer use                                            | Não disponível                                            | [Controle de aplicativo e tela](#let-claude-use-your-computer) no macOS                            |
| Integração Dispatch                                     | Não disponível                                            | [Sessões Dispatch](#sessions-from-dispatch) na barra lateral                                       |
| Scripting e automação                                   | [`--print`](/pt/cli-reference), [Agent SDK](/pt/headless) | Não disponível                                                                                     |

### What's not available in Desktop

Os seguintes recursos estão disponíveis apenas no CLI ou extensão VS Code:

* **Provedores de terceiros**: Desktop se conecta diretamente à API da Anthropic. Use o [CLI](/pt/quickstart) com Bedrock, Vertex ou Foundry em vez disso.
* **Linux**: o aplicativo desktop está disponível apenas em macOS e Windows.
* **Sugestões de código inline**: Desktop não fornece sugestões no estilo autocompletar. Funciona através de prompts conversacionais e alterações de código explícitas.
* **Equipes de agentes**: orquestração multi-agente está disponível via [CLI](/pt/agent-teams) e [Agent SDK](/pt/headless), não em Desktop.

## Solução de problemas

### Verificar sua versão

Para ver qual versão do aplicativo desktop você está executando:

* **macOS**: clique em **Claude** na barra de menu, depois **About Claude**
* **Windows**: clique em **Help**, depois **About**

Clique no número da versão para copiá-lo para sua área de transferência.

### Erros 403 ou autenticação na aba Code

Se você vê `Error 403: Forbidden` ou outras falhas de autenticação ao usar a aba Code:

1. Saia e entre novamente no menu do aplicativo. Esta é a correção mais comum.
2. Verifique se você tem uma assinatura paga ativa: Pro, Max, Teams ou Enterprise.
3. Se o CLI funciona mas Desktop não, saia completamente do aplicativo desktop, não apenas feche a janela, depois reabra e entre novamente.
4. Verifique sua conexão de internet e configurações de proxy.

### Tela em branco ou travada ao iniciar

Se o aplicativo abre mas mostra uma tela em branco ou não responsiva:

1. Reinicie o aplicativo.
2. Verifique se há atualizações pendentes. O aplicativo se atualiza automaticamente ao iniciar.
3. No Windows, verifique o Event Viewer para logs de crash em **Windows Logs → Application**.

### "Failed to load session"

Se você vê `Failed to load session`, a pasta selecionada pode não existir mais, um repositório Git pode exigir Git LFS que não está instalado, ou permissões de arquivo podem impedir acesso. Tente selecionar uma pasta diferente ou reinicie o aplicativo.

### Sessão não encontrando ferramentas instaladas

Se Claude não consegue encontrar ferramentas como `npm`, `node` ou outros comandos CLI, verifique se as ferramentas funcionam em seu terminal regular, verifique se seu perfil de shell configura adequadamente PATH e reinicie o aplicativo desktop para recarregar variáveis de ambiente.

### Erros de Git e Git LFS

No Windows, Git é necessário para a aba Code iniciar sessões locais. Se você vê "Git is required," instale [Git para Windows](https://git-scm.com/downloads/win) e reinicie o aplicativo.

Se você vê "Git LFS is required by this repository but is not installed," instale Git LFS de [git-lfs.com](https://git-lfs.com/), execute `git lfs install` e reinicie o aplicativo.

### MCP servers não funcionando no Windows

Se toggles de MCP server não respondem ou servidores falham em conectar no Windows, verifique se o servidor está adequadamente configurado em suas configurações, reinicie o aplicativo, verifique se o processo do servidor está em execução no Task Manager e revise logs do servidor para erros de conexão.

### Aplicativo não quer sair

* **macOS**: pressione Cmd+Q. Se o aplicativo não responder, use Force Quit com Cmd+Option+Esc, selecione Claude e clique Force Quit.
* **Windows**: use Task Manager com Ctrl+Shift+Esc para encerrar o processo Claude.

### Problemas específicos do Windows

* **PATH não atualizado após instalação**: abra uma nova janela de terminal. PATH é atualizado apenas para novas sessões de terminal.
* **Erro de instalação concorrente**: se você vê um erro sobre outra instalação em progresso mas não há uma, tente executar o instalador como Administrador.
* **ARM64**: dispositivos Windows ARM64 são totalmente suportados.

### Aba Cowork indisponível em Macs Intel

A aba Cowork requer Apple Silicon (M1 ou posterior) em macOS. No Windows, Cowork está disponível em todo hardware suportado. As abas Chat e Code funcionam normalmente em Macs Intel.

### "Branch doesn't exist yet" ao abrir em CLI

Sessões remotas podem criar branches que não existem em sua máquina local. Clique no nome do branch na barra de ferramentas da sessão para copiá-lo, depois busque-o localmente:

```bash  theme={null}
git fetch origin <branch-name>
git checkout <branch-name>
```

### Ainda preso?

* Pesquise ou registre um bug em [GitHub Issues](https://github.com/anthropics/claude-code/issues)
* Visite o [centro de suporte Claude](https://support.claude.com/)

Ao registrar um bug, inclua a versão do seu aplicativo desktop, seu sistema operacional, a mensagem de erro exata e logs relevantes. Em macOS, verifique Console.app. No Windows, verifique Event Viewer → Windows Logs → Application.
