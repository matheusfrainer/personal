# Plataformas e integrações

> Escolha onde executar Claude Code e o que conectar a ele. Compare a CLI, Desktop, VS Code, JetBrains, web e integrações como Chrome, Slack e CI/CD.

Claude Code executa o mesmo mecanismo subjacente em todos os lugares, mas cada superfície é ajustada para uma forma diferente de trabalhar. Esta página ajuda você a escolher a plataforma certa para seu fluxo de trabalho e conectar as ferramentas que você já usa.

## Onde executar Claude Code

Escolha uma plataforma com base em como você gosta de trabalhar e onde seu projeto está localizado.

| Plataforma | Melhor para | O que você obtém |
| :--- | :--- | :--- |
| [CLI](/pt/quickstart) | Fluxos de trabalho de terminal, scripts, servidores remotos | Conjunto completo de recursos, [Agent SDK](/pt/headless), provedores de terceiros |
| [Desktop](/pt/desktop) | Revisão visual, sessões paralelas, configuração gerenciada | Visualizador de diff, visualização de aplicativo, [computer use](/pt/desktop#let-claude-use-your-computer) e [Dispatch](/pt/desktop#sessions-from-dispatch) em Pro e Max |
| [VS Code](/pt/vs-code) | Trabalhar dentro do VS Code sem mudar para um terminal | Diffs inline, terminal integrado, contexto de arquivo |
| [JetBrains](/pt/jetbrains) | Trabalhar dentro do IntelliJ, PyCharm, WebStorm ou outros IDEs JetBrains | Visualizador de diff, compartilhamento de seleção, sessão de terminal |
| [Web](/pt/claude-code-on-the-web) | Tarefas de longa duração que não precisam de muito direcionamento, ou trabalho que deve continuar quando você estiver offline | Nuvem gerenciada pela Anthropic, continua após você se desconectar |

A CLI é a superfície mais completa para trabalho nativo de terminal: scripts, provedores de terceiros e o Agent SDK são apenas CLI. Desktop e as extensões IDE trocam alguns recursos apenas CLI por revisão visual e integração mais estreita do editor. A web é executada na nuvem da Anthropic, portanto as tarefas continuam após você se desconectar.

Você pode misturar superfícies no mesmo projeto. Configuração, memória do projeto e servidores MCP são compartilhados entre as superfícies locais.

## Conecte suas ferramentas

Integrações permitem que Claude trabalhe com serviços fora de sua base de código.

| Integração | O que faz | Use para |
| :--- | :--- | :--- |
| [Chrome](/pt/chrome) | Controla seu navegador com suas sessões conectadas | Testar aplicativos web, preencher formulários, automatizar sites sem uma API |
| [GitHub Actions](/pt/github-actions) | Executa Claude em seu pipeline CI | Revisões automatizadas de PR, triagem de problemas, manutenção agendada |
| [GitLab CI/CD](/pt/gitlab-ci-cd) | O mesmo que GitHub Actions para GitLab | Automação orientada por CI no GitLab |
| [Code Review](/pt/code-review) | Revisa cada PR automaticamente | Capturando bugs antes da revisão humana |
| [Slack](/pt/slack) | Responde a menções `@Claude` em seus canais | Transformando relatórios de bugs em pull requests do chat da equipe |

Para integrações não listadas aqui, [servidores MCP](/pt/mcp) e [conectores](/pt/desktop#connect-external-tools) permitem que você conecte quase qualquer coisa: Linear, Notion, Google Drive ou suas próprias APIs internas.

## Trabalhe quando você estiver longe de seu terminal

Claude Code oferece várias maneiras de trabalhar quando você não está em seu terminal. Elas diferem no que aciona o trabalho, onde Claude executa e quanto você precisa configurar.

| | Gatilho | Claude executa em | Configuração | Melhor para |
| :--- | :--- | :--- | :--- | :--- |
| [Dispatch](/pt/desktop#sessions-from-dispatch) | Envie uma tarefa do aplicativo móvel Claude | Sua máquina (Desktop) | [Parear o aplicativo móvel com Desktop](https://support.claude.com/en/articles/13947068) | Delegar trabalho enquanto estiver fora, configuração mínima |
| [Remote Control](/pt/remote-control) | Dirija uma sessão em execução de [claude.ai/code](https://claude.ai/code) ou do aplicativo móvel Claude | Sua máquina (CLI ou VS Code) | Execute `claude remote-control` | Direcionar trabalho em andamento de outro dispositivo |
| [Channels](/pt/channels) | Eventos push de um aplicativo de chat como Telegram ou Discord, ou seu próprio servidor | Sua máquina (CLI) | [Instale um plugin de canal](/pt/channels#quickstart) ou [construa o seu próprio](/pt/channels-reference) | Reagir a eventos externos como falhas de CI ou mensagens de chat |
| [Slack](/pt/slack) | Mencione `@Claude` em um canal da equipe | Nuvem da Anthropic | [Instale o aplicativo Slack](/pt/slack#setting-up-claude-code-in-slack) com [Claude Code na web](/pt/claude-code-on-the-web) habilitado | PRs e revisões do chat da equipe |
| [Scheduled tasks](/pt/scheduled-tasks) | Defina um cronograma | [CLI](/pt/scheduled-tasks), [Desktop](/pt/desktop#schedule-recurring-tasks), ou [nuvem](/pt/web-scheduled-tasks) | Escolha uma frequência | Automação recorrente como revisões diárias |

Se você não tem certeza por onde começar, [instale a CLI](/pt/quickstart) e execute-a em um diretório de projeto. Se você preferir não usar um terminal, [Desktop](/pt/desktop-quickstart) oferece o mesmo mecanismo com uma interface gráfica.

## Recursos relacionados

### Plataformas

* [CLI quickstart](/pt/quickstart): instale e execute seu primeiro comando no terminal
* [Desktop](/pt/desktop): revisão visual de diff, sessões paralelas, computer use e Dispatch
* [VS Code](/pt/vs-code): a extensão Claude Code dentro de seu editor
* [JetBrains](/pt/jetbrains): a extensão para IntelliJ, PyCharm e outros IDEs JetBrains
* [Claude Code na web](/pt/claude-code-on-the-web): sessões em nuvem que continuam sendo executadas quando você se desconecta

### Integrações

* [Chrome](/pt/chrome): automatize tarefas do navegador com suas sessões conectadas
* [GitHub Actions](/pt/github-actions): execute Claude em seu pipeline CI
* [GitLab CI/CD](/pt/gitlab-ci-cd): o mesmo para GitLab
* [Code Review](/pt/code-review): revisão automática em cada pull request
* [Slack](/pt/slack): envie tarefas do chat da equipe, obtenha PRs de volta

### Acesso remoto

* [Dispatch](/pt/desktop#sessions-from-dispatch): envie uma mensagem com uma tarefa do seu telefone e ela pode gerar uma sessão Desktop
* [Remote Control](/pt/remote-control): dirija uma sessão em execução do seu telefone ou navegador
* [Channels](/pt/channels): envie eventos de aplicativos de chat ou seus próprios servidores para uma sessão
* [Scheduled tasks](/pt/scheduled-tasks): execute prompts em um cronograma recorrente
