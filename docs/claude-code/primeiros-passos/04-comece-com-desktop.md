# Comece com o aplicativo de desktop

> Instale Claude Code no desktop e inicie sua primeira sessão de codificação

O aplicativo de desktop oferece Claude Code com uma interface gráfica: revisão visual de diff, visualização ao vivo do aplicativo, monitoramento de PR do GitHub com mesclagem automática, sessões paralelas com isolamento de Git worktree, tarefas agendadas e a capacidade de executar tarefas remotamente. Nenhum terminal necessário.

Esta página orienta você na instalação do aplicativo e no início de sua primeira sessão. Se você já está configurado, consulte [Usar Claude Code Desktop](/pt/desktop) para a referência completa.

<Frame>
  <img src="https://mintcdn.com/claude-code/CNLUpFGiXoc9mhvD/images/desktop-code-tab-light.png?fit=max&auto=format&n=CNLUpFGiXoc9mhvD&q=85&s=9a36a7a27b9f4c6f2e1c83bdb34f69ce" className="block dark:hidden" alt="A interface do Claude Code Desktop mostrando a aba Code selecionada, com uma caixa de prompt, seletor de modo de permissão definido como Ask permissions, seletor de modelo, seletor de pasta e opção de ambiente local" width="2500" height="1376" data-path="images/desktop-code-tab-light.png" />

  <img src="https://mintcdn.com/claude-code/CNLUpFGiXoc9mhvD/images/desktop-code-tab-dark.png?fit=max&auto=format&n=CNLUpFGiXoc9mhvD&q=85&s=5463defe81c459fb9b1f91f6a958cfb8" className="hidden dark:block" alt="A interface do Claude Code Desktop no modo escuro mostrando a aba Code selecionada, com uma caixa de prompt, seletor de modo de permissão definido como Ask permissions, seletor de modelo, seletor de pasta e opção de ambiente local" width="2504" height="1374" data-path="images/desktop-code-tab-dark.png" />
</Frame>

O aplicativo de desktop tem três abas:

* **Chat**: Conversa geral sem acesso a arquivos, semelhante ao claude.ai.
* **Cowork**: Um agente autônomo em segundo plano que trabalha em tarefas em uma VM em nuvem com seu próprio ambiente. Pode funcionar independentemente enquanto você faz outro trabalho.
* **Code**: Um assistente de codificação interativo com acesso direto aos seus arquivos locais. Você revisa e aprova cada alteração em tempo real.

Chat e Cowork são cobertos nos [artigos de suporte do Claude Desktop](https://support.claude.com/en/collections/16163169-claude-desktop). Esta página se concentra na aba **Code**.

<Note>
  Claude Code requer uma [assinatura Pro, Max, Teams ou Enterprise](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=desktop_quickstart_pricing).
</Note>

## Instalar

<Steps>
  <Step title="Baixe o aplicativo">
    Baixe Claude para sua plataforma.

    <CardGroup cols={2}>
      <Card title="macOS" icon="apple" href="https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code&utm_medium=docs">
        Build universal para Intel e Apple Silicon
      </Card>

      <Card title="Windows" icon="windows" href="https://claude.ai/api/desktop/win32/x64/exe/latest/redirect?utm_source=claude_code&utm_medium=docs">
        Para processadores x64
      </Card>
    </CardGroup>

    Para Windows ARM64, [baixe aqui](https://claude.ai/api/desktop/win32/arm64/exe/latest/redirect?utm_source=claude_code&utm_medium=docs).

    Linux não é suportado no momento.
  </Step>

  <Step title="Faça login">
    Inicie Claude na sua pasta Applications (macOS) ou menu Iniciar (Windows). Faça login com sua conta Anthropic.
  </Step>

  <Step title="Abra a aba Code">
    Clique na aba **Code** no topo do centro. Se clicar em Code solicitar que você faça upgrade, você precisa [se inscrever em um plano pago](https://claude.com/pricing?utm_source=claude_code&utm_medium=docs&utm_content=desktop_quickstart_upgrade) primeiro. Se solicitar que você faça login online, conclua o login e reinicie o aplicativo. Se você vir um erro 403, consulte [solução de problemas de autenticação](/pt/desktop#403-or-authentication-errors-in-the-code-tab).
  </Step>
</Steps>

O aplicativo de desktop inclui Claude Code. Você não precisa instalar Node.js ou a CLI separadamente. Para usar `claude` do terminal, instale a CLI separadamente. Consulte [Comece com a CLI](/pt/quickstart).

## Inicie sua primeira sessão

Com a aba Code aberta, escolha um projeto e dê a Claude algo para fazer.

<Steps>
  <Step title="Escolha um ambiente e pasta">
    Selecione **Local** para executar Claude em sua máquina usando seus arquivos diretamente. Clique em **Select folder** e escolha seu diretório de projeto.

    <Tip>
      Comece com um pequeno projeto que você conhece bem. É a forma mais rápida de ver o que Claude Code pode fazer. No Windows, [Git](https://git-scm.com/downloads/win) deve estar instalado para que as sessões locais funcionem. A maioria dos Macs inclui Git por padrão.
    </Tip>

    Você também pode selecionar:

    * **Remote**: Execute sessões na infraestrutura em nuvem da Anthropic que continuam mesmo se você fechar o aplicativo. As sessões remotas usam a mesma infraestrutura que [Claude Code na web](/pt/claude-code-on-the-web).
    * **SSH**: Conecte-se a uma máquina remota via SSH (seus próprios servidores, VMs em nuvem ou dev containers). Claude Code deve estar instalado na máquina remota.
  </Step>

  <Step title="Escolha um modelo">
    Selecione um modelo no dropdown ao lado do botão enviar. Consulte [modelos](/pt/model-config#available-models) para uma comparação de Opus, Sonnet e Haiku. Você não pode alterar o modelo após a sessão iniciar.
  </Step>

  <Step title="Diga a Claude o que fazer">
    Digite o que você quer que Claude faça:

    * `Find a TODO comment and fix it`
    * `Add tests for the main function`
    * `Create a CLAUDE.md with instructions for this codebase`

    Uma [sessão](/pt/desktop#work-in-parallel-with-sessions) é uma conversa com Claude sobre seu código. Cada sessão rastreia seu próprio contexto e alterações, para que você possa trabalhar em várias tarefas sem que elas interfiram uma com a outra.
  </Step>

  <Step title="Revise e aceite as alterações">
    Por padrão, a aba Code inicia no [modo Ask permissions](/pt/desktop#choose-a-permission-mode), onde Claude propõe alterações e aguarda sua aprovação antes de aplicá-las. Você verá:

    1. Uma [visualização de diff](/pt/desktop#review-changes-with-diff-view) mostrando exatamente o que mudará em cada arquivo
    2. Botões Accept/Reject para aprovar ou recusar cada alteração
    3. Atualizações em tempo real conforme Claude trabalha em sua solicitação

    Se você recusar uma alteração, Claude perguntará como você gostaria de proceder de forma diferente. Seus arquivos não são modificados até que você aceite.
  </Step>
</Steps>

## E agora?

Você fez sua primeira edição. Para a referência completa sobre tudo que o Desktop pode fazer, consulte [Usar Claude Code Desktop](/pt/desktop). Aqui estão algumas coisas para tentar a seguir.

**Interrompa e direcione.** Você pode interromper Claude a qualquer momento. Se estiver seguindo o caminho errado, clique no botão parar ou digite sua correção e pressione **Enter**. Claude para o que está fazendo e se ajusta com base em sua entrada. Você não precisa esperar que termine ou começar novamente.

**Dê a Claude mais contexto.** Digite `@filename` na caixa de prompt para puxar um arquivo específico para a conversa, anexe imagens e PDFs usando o botão de anexo, ou arraste e solte arquivos diretamente no prompt. Quanto mais contexto Claude tiver, melhores serão os resultados. Consulte [Adicionar arquivos e contexto](/pt/desktop#add-files-and-context-to-prompts).

**Use skills para tarefas repetíveis.** Digite `/` ou clique em **+** → **Slash commands** para procurar [comandos integrados](/pt/commands), [skills personalizadas](/pt/skills) e skills de plugin. Skills são prompts reutilizáveis que você pode invocar sempre que precisar, como listas de verificação de revisão de código ou etapas de implantação.

**Revise as alterações antes de fazer commit.** Depois que Claude edita arquivos, um indicador `+12 -1` aparece. Clique nele para abrir a [visualização de diff](/pt/desktop#review-changes-with-diff-view), revise as modificações arquivo por arquivo e comente em linhas específicas. Claude lê seus comentários e revisa. Clique em **Review code** para que Claude avalie os diffs e deixe sugestões inline.

**Ajuste quanto controle você tem.** Seu [modo de permissão](/pt/desktop#choose-a-permission-mode) controla o equilíbrio. Ask permissions (padrão) requer aprovação antes de cada edição. Auto accept edits aceita automaticamente edições de arquivo para iteração mais rápida. Plan mode permite que Claude mapeie uma abordagem sem tocar em nenhum arquivo, o que é útil antes de uma grande refatoração.

**Adicione plugins para mais capacidades.** Clique no botão **+** ao lado da caixa de prompt e selecione **Plugins** para procurar e instalar [plugins](/pt/desktop#install-plugins) que adicionam skills, agentes, MCP servers e muito mais.

**Visualize seu aplicativo.** Clique no dropdown **Preview** para executar seu servidor de desenvolvimento diretamente no desktop. Claude pode visualizar o aplicativo em execução, testar endpoints, inspecionar logs e iterar sobre o que vê. Consulte [Visualize seu aplicativo](/pt/desktop#preview-your-app).

**Rastreie sua solicitação de pull.** Depois de abrir um PR, Claude Code monitora os resultados de verificação de CI e pode corrigir automaticamente falhas ou mesclar o PR assim que todas as verificações passarem. Consulte [Monitore o status da solicitação de pull](/pt/desktop#monitor-pull-request-status).

**Coloque Claude em um cronograma.** Configure [tarefas agendadas](/pt/desktop#schedule-recurring-tasks) para executar Claude automaticamente em uma base recorrente: uma revisão de código diária todas as manhãs, uma auditoria de dependência semanal ou um briefing que extrai de suas ferramentas conectadas.

**Escale quando estiver pronto.** Abra [sessões paralelas](/pt/desktop#work-in-parallel-with-sessions) na barra lateral para trabalhar em várias tarefas ao mesmo tempo, cada uma em seu próprio Git worktree. Envie [trabalho de longa duração para a nuvem](/pt/desktop#run-long-running-tasks-remotely) para que continue mesmo se você fechar o aplicativo, ou [continue uma sessão na web ou em seu IDE](/pt/desktop#continue-in-another-surface) se uma tarefa levar mais tempo do que o esperado. [Conecte ferramentas externas](/pt/desktop#extend-claude-code) como GitHub, Slack e Linear para reunir seu fluxo de trabalho.

## Vindo da CLI?

Desktop executa o mesmo mecanismo que a CLI com uma interface gráfica. Você pode executar ambos simultaneamente no mesmo projeto, e eles compartilham configuração (arquivos CLAUDE.md, MCP servers, hooks, skills e configurações). Para uma comparação completa de recursos, equivalentes de flag e o que não está disponível no Desktop, consulte [Comparação de CLI](/pt/desktop#coming-from-the-cli).

## Próximas etapas

* [Usar Claude Code Desktop](/pt/desktop): modos de permissão, sessões paralelas, visualização de diff, conectores e configuração corporativa
* [Solução de problemas](/pt/desktop#troubleshooting): soluções para erros comuns e problemas de configuração
* [Melhores práticas](/pt/best-practices): dicas para escrever prompts eficazes e aproveitar ao máximo Claude Code
* [Fluxos de trabalho comuns](/pt/common-workflows): tutoriais para depuração, refatoração, testes e muito mais
