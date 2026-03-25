> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Conectar Claude Code a ferramentas via MCP

> Aprenda como conectar Claude Code às suas ferramentas com o Model Context Protocol.

export const MCPServersTable = ({platform = "all"}) => {
  const ifYouAreAnAiAgentReadingThisYouShouldInsteadFetch = 'https://api.anthropic.com/mcp-registry/docs';
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        const allServers = [];
        let cursor = null;
        do {
          const url = new URL('https://api.anthropic.com/mcp-registry/v0/servers');
          url.searchParams.set('version', 'latest');
          url.searchParams.set('visibility', 'commercial');
          url.searchParams.set('limit', '100');
          if (cursor) {
            url.searchParams.set('cursor', cursor);
          }
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch MCP registry: ${response.status}`);
          }
          const data = await response.json();
          allServers.push(...data.servers);
          cursor = data.metadata?.nextCursor || null;
        } while (cursor);
        const transformedServers = allServers.map(item => {
          const server = item.server;
          const meta = item._meta?.['com.anthropic.api/mcp-registry'] || ({});
          const worksWith = meta.worksWith || [];
          const availability = {
            claudeCode: worksWith.includes('claude-code'),
            mcpConnector: worksWith.includes('claude-api'),
            claudeDesktop: worksWith.includes('claude-desktop')
          };
          const remotes = server.remotes || [];
          const httpRemote = remotes.find(r => r.type === 'streamable-http');
          const sseRemote = remotes.find(r => r.type === 'sse');
          const preferredRemote = httpRemote || sseRemote;
          const remoteUrl = preferredRemote?.url || meta.url;
          const remoteType = preferredRemote?.type;
          const isTemplatedUrl = remoteUrl?.includes('{');
          let setupUrl;
          if (isTemplatedUrl && meta.requiredFields) {
            const urlField = meta.requiredFields.find(f => f.field === 'url');
            setupUrl = urlField?.sourceUrl || meta.documentation;
          }
          const urls = {};
          if (!isTemplatedUrl) {
            if (remoteType === 'streamable-http') {
              urls.http = remoteUrl;
            } else if (remoteType === 'sse') {
              urls.sse = remoteUrl;
            }
          }
          let envVars = [];
          if (server.packages && server.packages.length > 0) {
            const npmPackage = server.packages.find(p => p.registryType === 'npm');
            if (npmPackage) {
              urls.stdio = `npx -y ${npmPackage.identifier}`;
              if (npmPackage.environmentVariables) {
                envVars = npmPackage.environmentVariables;
              }
            }
          }
          return {
            name: meta.displayName || server.title || server.name,
            description: meta.oneLiner || server.description,
            documentation: meta.documentation,
            urls: urls,
            envVars: envVars,
            availability: availability,
            customCommands: meta.claudeCodeCopyText ? {
              claudeCode: meta.claudeCodeCopyText
            } : undefined,
            setupUrl: setupUrl
          };
        });
        setServers(transformedServers);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching MCP registry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, []);
  const generateClaudeCodeCommand = server => {
    if (server.customCommands && server.customCommands.claudeCode) {
      return server.customCommands.claudeCode;
    }
    const serverSlug = server.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (server.urls.http) {
      return `claude mcp add ${serverSlug} --transport http ${server.urls.http}`;
    }
    if (server.urls.sse) {
      return `claude mcp add ${serverSlug} --transport sse ${server.urls.sse}`;
    }
    if (server.urls.stdio) {
      const envFlags = server.envVars && server.envVars.length > 0 ? server.envVars.map(v => `--env ${v.name}=YOUR_${v.name}`).join(' ') : '';
      const baseCommand = `claude mcp add ${serverSlug} --transport stdio`;
      return envFlags ? `${baseCommand} ${envFlags} -- ${server.urls.stdio}` : `${baseCommand} -- ${server.urls.stdio}`;
    }
    return null;
  };
  if (loading) {
    return <div>Loading MCP servers...</div>;
  }
  if (error) {
    return <div>Error loading MCP servers: {error}</div>;
  }
  const filteredServers = servers.filter(server => {
    if (platform === "claudeCode") {
      return server.availability.claudeCode;
    } else if (platform === "mcpConnector") {
      return server.availability.mcpConnector;
    } else if (platform === "claudeDesktop") {
      return server.availability.claudeDesktop;
    } else if (platform === "all") {
      return true;
    } else {
      throw new Error(`Unknown platform: ${platform}`);
    }
  });
  return <>
      <style jsx>{`
        .cards-container {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .server-card {
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 6px;
          padding: 1rem;
        }
        .command-row {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .command-row code {
          font-size: 0.75rem;
          overflow-x: auto;
        }
      `}</style>

      <div className="cards-container">
        {filteredServers.map(server => {
    const claudeCodeCommand = generateClaudeCodeCommand(server);
    const mcpUrl = server.urls.http || server.urls.sse;
    const commandToShow = platform === "claudeCode" ? claudeCodeCommand : mcpUrl;
    return <div key={server.name} className="server-card">
              <div>
                {server.documentation ? <a href={server.documentation}>
                    <strong>{server.name}</strong>
                  </a> : <strong>{server.name}</strong>}
              </div>

              <p style={{
      margin: '0.5rem 0',
      fontSize: '0.9rem'
    }}>
                {server.description}
              </p>

              {server.setupUrl && <p style={{
      margin: '0.25rem 0',
      fontSize: '0.8rem',
      fontStyle: 'italic',
      opacity: 0.7
    }}>
                  Requires user-specific URL.{' '}
                  <a href={server.setupUrl} style={{
      textDecoration: 'underline'
    }}>
                    Get your URL here
                  </a>.
                </p>}

              {commandToShow && !server.setupUrl && <>
                <p style={{
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: 500,
      minWidth: 'fit-content',
      marginTop: '0.5rem',
      marginBottom: 0
    }}>
                  {platform === "claudeCode" ? "Command" : "URL"}
                </p>
                <div className="command-row">
                  <code>
                    {commandToShow}
                  </code>
                </div>
              </>}
            </div>;
  })}
      </div>
    </>;
};

Claude Code pode se conectar a centenas de ferramentas e fontes de dados externas através do [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction), um padrão de código aberto para integrações de IA com ferramentas. Os servidores MCP dão ao Claude Code acesso às suas ferramentas, bancos de dados e APIs.

## O que você pode fazer com MCP

Com servidores MCP conectados, você pode pedir ao Claude Code para:

* **Implementar recursos de rastreadores de problemas**: "Adicione o recurso descrito no problema JIRA ENG-4521 e crie um PR no GitHub."
* **Analisar dados de monitoramento**: "Verifique Sentry e Statsig para verificar o uso do recurso descrito em ENG-4521."
* **Consultar bancos de dados**: "Encontre emails de 10 usuários aleatórios que usaram o recurso ENG-4521, com base no nosso banco de dados PostgreSQL."
* **Integrar designs**: "Atualize nosso modelo de email padrão com base nos novos designs do Figma que foram postados no Slack"
* **Automatizar fluxos de trabalho**: "Crie rascunhos do Gmail convidando esses 10 usuários para uma sessão de feedback sobre o novo recurso."

## Servidores MCP populares

Aqui estão alguns servidores MCP comumente usados que você pode conectar ao Claude Code:

<Warning>
  Use servidores MCP de terceiros por sua conta e risco - Anthropic não verificou
  a correção ou segurança de todos esses servidores.
  Certifique-se de confiar nos servidores MCP que está instalando.
  Tenha especial cuidado ao usar servidores MCP que possam buscar conteúdo não confiável,
  pois estes podem expô-lo ao risco de injeção de prompt.
</Warning>

<MCPServersTable platform="claudeCode" />

<Note>
  **Precisa de uma integração específica?** [Encontre centenas de servidores MCP no GitHub](https://github.com/modelcontextprotocol/servers), ou crie o seu próprio usando o [MCP SDK](https://modelcontextprotocol.io/quickstart/server).
</Note>

## Instalando servidores MCP

Os servidores MCP podem ser configurados de três maneiras diferentes dependendo de suas necessidades:

### Opção 1: Adicionar um servidor HTTP remoto

Servidores HTTP são a opção recomendada para conectar a servidores MCP remotos. Este é o transporte mais amplamente suportado para serviços baseados em nuvem.

```bash  theme={null}
# Sintaxe básica
claude mcp add --transport http <name> <url>

# Exemplo real: Conectar ao Notion
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Exemplo com token Bearer
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

### Opção 2: Adicionar um servidor SSE remoto

<Warning>
  O transporte SSE (Server-Sent Events) está descontinuado. Use servidores HTTP em vez disso, quando disponível.
</Warning>

```bash  theme={null}
# Sintaxe básica
claude mcp add --transport sse <name> <url>

# Exemplo real: Conectar ao Asana
claude mcp add --transport sse asana https://mcp.asana.com/sse

# Exemplo com cabeçalho de autenticação
claude mcp add --transport sse private-api https://api.company.com/sse \
  --header "X-API-Key: your-key-here"
```

### Opção 3: Adicionar um servidor stdio local

Servidores Stdio são executados como processos locais em sua máquina. Eles são ideais para ferramentas que precisam de acesso direto ao sistema ou scripts personalizados.

```bash  theme={null}
# Sintaxe básica
claude mcp add [options] <name> -- <command> [args...]

# Exemplo real: Adicionar servidor Airtable
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server
```

<Note>
  **Importante: Ordenação de opções**

  Todas as opções (`--transport`, `--env`, `--scope`, `--header`) devem vir **antes** do nome do servidor. O `--` (travessão duplo) então separa o nome do servidor do comando e argumentos que são passados para o servidor MCP.

  Por exemplo:

  * `claude mcp add --transport stdio myserver -- npx server` → executa `npx server`
  * `claude mcp add --transport stdio --env KEY=value myserver -- python server.py --port 8080` → executa `python server.py --port 8080` com `KEY=value` no ambiente

  Isso evita conflitos entre as flags do Claude e as flags do servidor.
</Note>

### Gerenciando seus servidores

Uma vez configurados, você pode gerenciar seus servidores MCP com estes comandos:

```bash  theme={null}
# Listar todos os servidores configurados
claude mcp list

# Obter detalhes para um servidor específico
claude mcp get github

# Remover um servidor
claude mcp remove github

# (dentro do Claude Code) Verificar status do servidor
/mcp
```

### Atualizações dinâmicas de ferramentas

Claude Code suporta notificações MCP `list_changed`, permitindo que servidores MCP atualizem dinamicamente suas ferramentas, prompts e recursos disponíveis sem exigir que você se desconecte e reconecte. Quando um servidor MCP envia uma notificação `list_changed`, Claude Code atualiza automaticamente as capacidades disponíveis desse servidor.

<Tip>
  Dicas:

  * Use a flag `--scope` para especificar onde a configuração é armazenada:
    * `local` (padrão): Disponível apenas para você no projeto atual (era chamado de `project` em versões mais antigas)
    * `project`: Compartilhado com todos no projeto via arquivo `.mcp.json`
    * `user`: Disponível para você em todos os projetos (era chamado de `global` em versões mais antigas)
  * Defina variáveis de ambiente com flags `--env` (por exemplo, `--env KEY=value`)
  * Configure o tempo limite de inicialização do servidor MCP usando a variável de ambiente MCP\_TIMEOUT (por exemplo, `MCP_TIMEOUT=10000 claude` define um tempo limite de 10 segundos)
  * Claude Code exibirá um aviso quando a saída da ferramenta MCP exceder 10.000 tokens. Para aumentar este limite, defina a variável de ambiente `MAX_MCP_OUTPUT_TOKENS` (por exemplo, `MAX_MCP_OUTPUT_TOKENS=50000`)
  * Use `/mcp` para autenticar com servidores remotos que exigem autenticação OAuth 2.0
</Tip>

<Warning>
  **Usuários do Windows**: No Windows nativo (não WSL), servidores MCP locais que usam `npx` exigem o wrapper `cmd /c` para garantir a execução adequada.

  ```bash  theme={null}
  # Isso cria command="cmd" que o Windows pode executar
  claude mcp add --transport stdio my-server -- cmd /c npx -y @some/package
  ```

  Sem o wrapper `cmd /c`, você encontrará erros "Connection closed" porque o Windows não pode executar `npx` diretamente. (Veja a nota acima para uma explicação do parâmetro `--`.)
</Warning>

### Servidores MCP fornecidos por plugins

[Plugins](/pt/plugins) podem agrupar servidores MCP, fornecendo automaticamente ferramentas e integrações quando o plugin está habilitado. Os servidores MCP de plugins funcionam de forma idêntica aos servidores configurados pelo usuário.

**Como funcionam os servidores MCP de plugins**:

* Plugins definem servidores MCP em `.mcp.json` na raiz do plugin ou inline em `plugin.json`
* Quando um plugin está habilitado, seus servidores MCP iniciam automaticamente
* As ferramentas MCP do plugin aparecem junto com as ferramentas MCP configuradas manualmente
* Os servidores de plugins são gerenciados através da instalação de plugins (não comandos `/mcp`)

**Exemplo de configuração MCP de plugin**:

Em `.mcp.json` na raiz do plugin:

```json  theme={null}
{
  "database-tools": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
    "env": {
      "DB_URL": "${DB_URL}"
    }
  }
}
```

Ou inline em `plugin.json`:

```json  theme={null}
{
  "name": "my-plugin",
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```

**Recursos de MCP de plugin**:

* **Ciclo de vida automático**: Na inicialização da sessão, os servidores para plugins habilitados se conectam automaticamente. Se você habilitar ou desabilitar um plugin durante uma sessão, execute `/reload-plugins` para conectar ou desconectar seus servidores MCP
* **Variáveis de ambiente**: Use `${CLAUDE_PLUGIN_ROOT}` para caminhos relativos ao plugin
* **Acesso a variáveis de ambiente do usuário**: Acesso às mesmas variáveis de ambiente que servidores configurados manualmente
* **Múltiplos tipos de transporte**: Suporte para transportes stdio, SSE e HTTP (o suporte de transporte pode variar por servidor)

**Visualizando servidores MCP de plugins**:

```bash  theme={null}
# Dentro do Claude Code, veja todos os servidores MCP incluindo os de plugins
/mcp
```

Os servidores de plugins aparecem na lista com indicadores mostrando que vêm de plugins.

**Benefícios dos servidores MCP de plugins**:

* **Distribuição agrupada**: Ferramentas e servidores empacotados juntos
* **Configuração automática**: Nenhuma configuração MCP manual necessária
* **Consistência da equipe**: Todos obtêm as mesmas ferramentas quando o plugin está instalado

Veja a [referência de componentes de plugins](/pt/plugins-reference#mcp-servers) para detalhes sobre como agrupar servidores MCP com plugins.

## Escopos de instalação de MCP

Os servidores MCP podem ser configurados em três níveis de escopo diferentes, cada um servindo propósitos distintos para gerenciar a acessibilidade do servidor e o compartilhamento. Compreender esses escopos ajuda você a determinar a melhor forma de configurar servidores para suas necessidades específicas.

### Escopo local

Servidores com escopo local representam o nível de configuração padrão e são armazenados em `~/.claude.json` sob o caminho do seu projeto. Esses servidores permanecem privados para você e são acessíveis apenas ao trabalhar dentro do diretório do projeto atual. Este escopo é ideal para servidores de desenvolvimento pessoal, configurações experimentais ou servidores contendo credenciais sensíveis que não devem ser compartilhadas.

<Note>
  O termo "escopo local" para servidores MCP difere das configurações locais gerais. Os servidores MCP com escopo local são armazenados em `~/.claude.json` (seu diretório inicial), enquanto as configurações locais gerais usam `.claude/settings.local.json` (no diretório do projeto). Veja [Configurações](/pt/settings#settings-files) para detalhes sobre localizações de arquivos de configuração.
</Note>

```bash  theme={null}
# Adicionar um servidor com escopo local (padrão)
claude mcp add --transport http stripe https://mcp.stripe.com

# Especificar explicitamente escopo local
claude mcp add --transport http stripe --scope local https://mcp.stripe.com
```

### Escopo de projeto

Servidores com escopo de projeto permitem colaboração em equipe armazenando configurações em um arquivo `.mcp.json` no diretório raiz do seu projeto. Este arquivo é projetado para ser verificado no controle de versão, garantindo que todos os membros da equipe tenham acesso às mesmas ferramentas e serviços MCP. Quando você adiciona um servidor com escopo de projeto, Claude Code cria ou atualiza automaticamente este arquivo com a estrutura de configuração apropriada.

```bash  theme={null}
# Adicionar um servidor com escopo de projeto
claude mcp add --transport http paypal --scope project https://mcp.paypal.com/mcp
```

O arquivo `.mcp.json` resultante segue um formato padronizado:

```json  theme={null}
{
  "mcpServers": {
    "shared-server": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
```

Por razões de segurança, Claude Code solicita aprovação antes de usar servidores com escopo de projeto de arquivos `.mcp.json`. Se você precisar redefinir essas escolhas de aprovação, use o comando `claude mcp reset-project-choices`.

### Escopo de usuário

Servidores com escopo de usuário são armazenados em `~/.claude.json` e fornecem acessibilidade entre projetos, tornando-os disponíveis em todos os projetos em sua máquina enquanto permanecem privados para sua conta de usuário. Este escopo funciona bem para servidores de utilitários pessoais, ferramentas de desenvolvimento ou serviços que você usa frequentemente em diferentes projetos.

```bash  theme={null}
# Adicionar um servidor de usuário
claude mcp add --transport http hubspot --scope user https://mcp.hubspot.com/anthropic
```

### Escolhendo o escopo correto

Selecione seu escopo com base em:

* **Escopo local**: Servidores pessoais, configurações experimentais ou credenciais sensíveis específicas de um projeto
* **Escopo de projeto**: Servidores compartilhados em equipe, ferramentas específicas do projeto ou serviços necessários para colaboração
* **Escopo de usuário**: Utilitários pessoais necessários em múltiplos projetos, ferramentas de desenvolvimento ou serviços frequentemente usados

<Note>
  **Onde os servidores MCP são armazenados?**

  * **Escopo de usuário e local**: `~/.claude.json` (no campo `mcpServers` ou sob caminhos de projeto)
  * **Escopo de projeto**: `.mcp.json` na raiz do seu projeto (verificado no controle de versão)
  * **Gerenciado**: `managed-mcp.json` em diretórios do sistema (veja [Configuração MCP gerenciada](#managed-mcp-configuration))
</Note>

### Hierarquia de escopo e precedência

As configurações de servidor MCP seguem uma hierarquia de precedência clara. Quando servidores com o mesmo nome existem em múltiplos escopos, o sistema resolve conflitos priorizando servidores com escopo local primeiro, seguidos por servidores com escopo de projeto e, finalmente, servidores com escopo de usuário. Este design garante que configurações pessoais possam substituir as compartilhadas quando necessário.

### Expansão de variáveis de ambiente em `.mcp.json`

Claude Code suporta expansão de variáveis de ambiente em arquivos `.mcp.json`, permitindo que equipes compartilhem configurações mantendo flexibilidade para caminhos específicos da máquina e valores sensíveis como chaves de API.

**Sintaxe suportada:**

* `${VAR}` - Expande para o valor da variável de ambiente `VAR`
* `${VAR:-default}` - Expande para `VAR` se definida, caso contrário usa `default`

**Locais de expansão:**
As variáveis de ambiente podem ser expandidas em:

* `command` - O caminho do executável do servidor
* `args` - Argumentos de linha de comando
* `env` - Variáveis de ambiente passadas para o servidor
* `url` - Para tipos de servidor HTTP
* `headers` - Para autenticação de servidor HTTP

**Exemplo com expansão de variável:**

```json  theme={null}
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

Se uma variável de ambiente necessária não estiver definida e não tiver um valor padrão, Claude Code falhará ao analisar a configuração.

## Exemplos práticos

{/* ### Exemplo: Automatizar testes de navegador com Playwright

  ```bash
  claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest
  ```

  Então escreva e execute testes de navegador:

  ```text
  Teste se o fluxo de login funciona com test@example.com
  ```
  ```text
  Tire uma captura de tela da página de checkout em mobile
  ```
  ```text
  Verifique se o recurso de pesquisa retorna resultados
  ``` */}

### Exemplo: Monitorar erros com Sentry

```bash  theme={null}
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

Autentique com sua conta Sentry:

```text  theme={null}
/mcp
```

Então depure problemas de produção:

```text  theme={null}
Quais são os erros mais comuns nas últimas 24 horas?
```

```text  theme={null}
Mostre-me o rastreamento de pilha para o erro ID abc123
```

```text  theme={null}
Qual implantação introduziu esses novos erros?
```

### Exemplo: Conectar ao GitHub para revisões de código

```bash  theme={null}
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

Autentique se necessário selecionando "Authenticate" para GitHub:

```text  theme={null}
/mcp
```

Então trabalhe com GitHub:

```text  theme={null}
Revise o PR #456 e sugira melhorias
```

```text  theme={null}
Crie um novo problema para o bug que acabamos de encontrar
```

```text  theme={null}
Mostre-me todos os PRs abertos atribuídos a mim
```

### Exemplo: Consultar seu banco de dados PostgreSQL

```bash  theme={null}
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

Então consulte seu banco de dados naturalmente:

```text  theme={null}
Qual é nossa receita total este mês?
```

```text  theme={null}
Mostre-me o esquema para a tabela de pedidos
```

```text  theme={null}
Encontre clientes que não fizeram uma compra em 90 dias
```

## Autenticar com servidores MCP remotos

Muitos servidores MCP baseados em nuvem exigem autenticação. Claude Code suporta OAuth 2.0 para conexões seguras.

<Steps>
  <Step title="Adicione o servidor que requer autenticação">
    Por exemplo:

    ```bash  theme={null}
    claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
    ```
  </Step>

  <Step title="Use o comando /mcp dentro do Claude Code">
    No Claude Code, use o comando:

    ```text  theme={null}
    /mcp
    ```

    Então siga os passos no seu navegador para fazer login.
  </Step>
</Steps>

<Tip>
  Dicas:

  * Os tokens de autenticação são armazenados com segurança e atualizados automaticamente
  * Use "Clear authentication" no menu `/mcp` para revogar acesso
  * Se seu navegador não abrir automaticamente, copie a URL fornecida e abra-a manualmente
  * Se o redirecionamento do navegador falhar com um erro de conexão após autenticar, cole a URL de callback completa da barra de endereços do seu navegador no prompt de URL que aparece no Claude Code
  * A autenticação OAuth funciona com servidores HTTP
</Tip>

### Usar uma porta de callback OAuth fixa

Alguns servidores MCP exigem um URI de redirecionamento específico registrado antecipadamente. Por padrão, Claude Code escolhe uma porta aleatória disponível para o callback OAuth. Use `--callback-port` para fixar a porta para que corresponda a um URI de redirecionamento pré-registrado do formulário `http://localhost:PORT/callback`.

Você pode usar `--callback-port` sozinho (com registro dinâmico de cliente) ou junto com `--client-id` (com credenciais pré-configuradas).

```bash  theme={null}
# Porta de callback fixa com registro dinâmico de cliente
claude mcp add --transport http \
  --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

### Usar credenciais OAuth pré-configuradas

Alguns servidores MCP não suportam configuração automática de OAuth. Se você vir um erro como "Incompatible auth server: does not support dynamic client registration," o servidor requer credenciais pré-configuradas. Registre um aplicativo OAuth através do portal do desenvolvedor do servidor primeiro, depois forneça as credenciais ao adicionar o servidor.

<Steps>
  <Step title="Registre um aplicativo OAuth com o servidor">
    Crie um aplicativo através do portal do desenvolvedor do servidor e anote seu ID do cliente e segredo do cliente.

    Muitos servidores também exigem um URI de redirecionamento. Se assim for, escolha uma porta e registre um URI de redirecionamento no formato `http://localhost:PORT/callback`. Use essa mesma porta com `--callback-port` na próxima etapa.
  </Step>

  <Step title="Adicione o servidor com suas credenciais">
    Escolha um dos seguintes métodos. A porta usada para `--callback-port` pode ser qualquer porta disponível. Ela apenas precisa corresponder ao URI de redirecionamento que você registrou na etapa anterior.

    <Tabs>
      <Tab title="claude mcp add">
        Use `--client-id` para passar o ID do cliente do seu aplicativo. A flag `--client-secret` solicita o segredo com entrada mascarada:

        ```bash  theme={null}
        claude mcp add --transport http \
          --client-id your-client-id --client-secret --callback-port 8080 \
          my-server https://mcp.example.com/mcp
        ```
      </Tab>

      <Tab title="claude mcp add-json">
        Inclua o objeto `oauth` na configuração JSON e passe `--client-secret` como uma flag separada:

        ```bash  theme={null}
        claude mcp add-json my-server \
          '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' \
          --client-secret
        ```
      </Tab>

      <Tab title="claude mcp add-json (apenas porta de callback)">
        Use `--callback-port` sem um ID de cliente para fixar a porta enquanto usa registro dinâmico de cliente:

        ```bash  theme={null}
        claude mcp add-json my-server \
          '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"callbackPort":8080}}'
        ```
      </Tab>

      <Tab title="CI / variável de ambiente">
        Defina o segredo via variável de ambiente para pular o prompt interativo:

        ```bash  theme={null}
        MCP_CLIENT_SECRET=your-secret claude mcp add --transport http \
          --client-id your-client-id --client-secret --callback-port 8080 \
          my-server https://mcp.example.com/mcp
        ```
      </Tab>
    </Tabs>
  </Step>

  <Step title="Autentique no Claude Code">
    Execute `/mcp` no Claude Code e siga o fluxo de login do navegador.
  </Step>
</Steps>

<Tip>
  Dicas:

  * O segredo do cliente é armazenado com segurança no seu chaveiro do sistema (macOS) ou em um arquivo de credenciais, não na sua configuração
  * Se o servidor usar um cliente OAuth público sem segredo, use apenas `--client-id` sem `--client-secret`
  * `--callback-port` pode ser usado com ou sem `--client-id`
  * Essas flags se aplicam apenas aos transportes HTTP e SSE. Elas não têm efeito em servidores stdio
  * Use `claude mcp get <name>` para verificar se as credenciais OAuth estão configuradas para um servidor
</Tip>

### Substituir descoberta de metadados OAuth

Se seu servidor MCP retornar erros no endpoint de metadados OAuth padrão (`/.well-known/oauth-authorization-server`) mas expuser um endpoint OIDC funcionando, você pode dizer ao Claude Code para buscar metadados OAuth diretamente de uma URL que você especificar, contornando a cadeia de descoberta padrão.

Defina `authServerMetadataUrl` no objeto `oauth` da configuração do seu servidor em `.mcp.json`:

```json  theme={null}
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "oauth": {
        "authServerMetadataUrl": "https://auth.example.com/.well-known/openid-configuration"
      }
    }
  }
}
```

A URL deve usar `https://`. Esta opção requer Claude Code v2.1.64 ou posterior.

## Adicionar servidores MCP de configuração JSON

Se você tiver uma configuração JSON para um servidor MCP, você pode adicioná-la diretamente:

<Steps>
  <Step title="Adicione um servidor MCP de JSON">
    ```bash  theme={null}
    # Sintaxe básica
    claude mcp add-json <name> '<json>'

    # Exemplo: Adicionar um servidor HTTP com configuração JSON
    claude mcp add-json weather-api '{"type":"http","url":"https://api.weather.com/mcp","headers":{"Authorization":"Bearer token"}}'

    # Exemplo: Adicionar um servidor stdio com configuração JSON
    claude mcp add-json local-weather '{"type":"stdio","command":"/path/to/weather-cli","args":["--api-key","abc123"],"env":{"CACHE_DIR":"/tmp"}}'

    # Exemplo: Adicionar um servidor HTTP com credenciais OAuth pré-configuradas
    claude mcp add-json my-server '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' --client-secret
    ```
  </Step>

  <Step title="Verifique se o servidor foi adicionado">
    ```bash  theme={null}
    claude mcp get weather-api
    ```
  </Step>
</Steps>

<Tip>
  Dicas:

  * Certifique-se de que o JSON está adequadamente escapado no seu shell
  * O JSON deve estar em conformidade com o esquema de configuração do servidor MCP
  * Você pode usar `--scope user` para adicionar o servidor à sua configuração de usuário em vez da específica do projeto
</Tip>

## Importar servidores MCP do Claude Desktop

Se você já configurou servidores MCP no Claude Desktop, você pode importá-los:

<Steps>
  <Step title="Importe servidores do Claude Desktop">
    ```bash  theme={null}
    # Sintaxe básica 
    claude mcp add-from-claude-desktop 
    ```
  </Step>

  <Step title="Selecione quais servidores importar">
    Após executar o comando, você verá um diálogo interativo que permite selecionar quais servidores você deseja importar.
  </Step>

  <Step title="Verifique se os servidores foram importados">
    ```bash  theme={null}
    claude mcp list 
    ```
  </Step>
</Steps>

<Tip>
  Dicas:

  * Este recurso funciona apenas em macOS e Windows Subsystem for Linux (WSL)
  * Ele lê o arquivo de configuração do Claude Desktop de sua localização padrão nessas plataformas
  * Use a flag `--scope user` para adicionar servidores à sua configuração de usuário
  * Os servidores importados terão os mesmos nomes que no Claude Desktop
  * Se servidores com os mesmos nomes já existirem, eles receberão um sufixo numérico (por exemplo, `server_1`)
</Tip>

## Usar servidores MCP do Claude.ai

Se você fez login no Claude Code com uma conta [Claude.ai](https://claude.ai), os servidores MCP que você adicionou no Claude.ai estão automaticamente disponíveis no Claude Code:

<Steps>
  <Step title="Configure servidores MCP no Claude.ai">
    Adicione servidores em [claude.ai/settings/connectors](https://claude.ai/settings/connectors). Em planos Team e Enterprise, apenas administradores podem adicionar servidores.
  </Step>

  <Step title="Autentique o servidor MCP">
    Complete quaisquer etapas de autenticação necessárias no Claude.ai.
  </Step>

  <Step title="Visualize e gerencie servidores no Claude Code">
    No Claude Code, use o comando:

    ```text  theme={null}
    /mcp
    ```

    Os servidores do Claude.ai aparecem na lista com indicadores mostrando que vêm do Claude.ai.
  </Step>
</Steps>

Para desabilitar servidores MCP do claude.ai no Claude Code, defina a variável de ambiente `ENABLE_CLAUDEAI_MCP_SERVERS` como `false`:

```bash  theme={null}
ENABLE_CLAUDEAI_MCP_SERVERS=false claude
```

## Usar Claude Code como um servidor MCP

Você pode usar Claude Code em si como um servidor MCP que outros aplicativos podem se conectar:

```bash  theme={null}
# Inicie Claude como um servidor MCP stdio
claude mcp serve
```

Você pode usar isso no Claude Desktop adicionando esta configuração ao claude\_desktop\_config.json:

```json  theme={null}
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```

<Warning>
  **Configurando o caminho do executável**: O campo `command` deve referenciar o executável do Claude Code. Se o comando `claude` não estiver no PATH do seu sistema, você precisará especificar o caminho completo para o executável.

  Para encontrar o caminho completo:

  ```bash  theme={null}
  which claude
  ```

  Então use o caminho completo na sua configuração:

  ```json  theme={null}
  {
    "mcpServers": {
      "claude-code": {
        "type": "stdio",
        "command": "/full/path/to/claude",
        "args": ["mcp", "serve"],
        "env": {}
      }
    }
  }
  ```

  Sem o caminho correto do executável, você encontrará erros como `spawn claude ENOENT`.
</Warning>

<Tip>
  Dicas:

  * O servidor fornece acesso às ferramentas do Claude como View, Edit, LS, etc.
  * No Claude Desktop, tente pedir ao Claude para ler arquivos em um diretório, fazer edições e muito mais.
  * Observe que este servidor MCP está apenas expondo as ferramentas do Claude Code ao seu cliente MCP, então seu próprio cliente é responsável por implementar confirmação do usuário para chamadas de ferramentas individuais.
</Tip>

## Limites de saída MCP e avisos

Quando as ferramentas MCP produzem grandes saídas, Claude Code ajuda a gerenciar o uso de tokens para evitar sobrecarregar seu contexto de conversa:

* **Limite de aviso de saída**: Claude Code exibe um aviso quando qualquer saída de ferramenta MCP excede 10.000 tokens
* **Limite configurável**: Você pode ajustar o máximo de tokens de saída MCP permitidos usando a variável de ambiente `MAX_MCP_OUTPUT_TOKENS`
* **Limite padrão**: O máximo padrão é 25.000 tokens

Para aumentar o limite para ferramentas que produzem grandes saídas:

```bash  theme={null}
# Defina um limite mais alto para saídas de ferramentas MCP
export MAX_MCP_OUTPUT_TOKENS=50000
claude
```

Isso é particularmente útil ao trabalhar com servidores MCP que:

* Consultam grandes conjuntos de dados ou bancos de dados
* Geram relatórios ou documentação detalhados
* Processam arquivos de log extensos ou informações de depuração

<Warning>
  Se você encontrar frequentemente avisos de saída com servidores MCP específicos, considere aumentar o limite ou configurar o servidor para paginar ou filtrar suas respostas.
</Warning>

## Responder a solicitações de elicitação MCP

Os servidores MCP podem solicitar entrada estruturada de você durante uma tarefa usando elicitação. Quando um servidor precisa de informações que não consegue obter por conta própria, Claude Code exibe um diálogo interativo e passa sua resposta de volta para o servidor. Nenhuma configuração é necessária do seu lado: diálogos de elicitação aparecem automaticamente quando um servidor os solicita.

Os servidores podem solicitar entrada de duas maneiras:

* **Modo de formulário**: Claude Code mostra um diálogo com campos de formulário definidos pelo servidor (por exemplo, um prompt de nome de usuário e senha). Preencha os campos e envie.
* **Modo de URL**: Claude Code abre uma URL do navegador para autenticação ou aprovação. Complete o fluxo no navegador, depois confirme no CLI.

Para responder automaticamente a solicitações de elicitação sem mostrar um diálogo, use o [hook `Elicitation`](/pt/hooks#Elicitation).

Se você está construindo um servidor MCP que usa elicitação, veja a [especificação de elicitação MCP](https://modelcontextprotocol.io/docs/learn/client-concepts#elicitation) para detalhes de protocolo e exemplos de esquema.

## Usar recursos MCP

Os servidores MCP podem expor recursos que você pode referenciar usando menções @, semelhante a como você referencia arquivos.

### Referenciar recursos MCP

<Steps>
  <Step title="Liste recursos disponíveis">
    Digite `@` no seu prompt para ver recursos disponíveis de todos os servidores MCP conectados. Os recursos aparecem junto com arquivos no menu de preenchimento automático.
  </Step>

  <Step title="Referencie um recurso específico">
    Use o formato `@server:protocol://resource/path` para referenciar um recurso:

    ```text  theme={null}
    Você pode analisar @github:issue://123 e sugerir uma correção?
    ```

    ```text  theme={null}
    Por favor, revise a documentação da API em @docs:file://api/authentication
    ```
  </Step>

  <Step title="Múltiplas referências de recursos">
    Você pode referenciar múltiplos recursos em um único prompt:

    ```text  theme={null}
    Compare @postgres:schema://users com @docs:file://database/user-model
    ```
  </Step>
</Steps>

<Tip>
  Dicas:

  * Os recursos são automaticamente buscados e incluídos como anexos quando referenciados
  * Os caminhos dos recursos são pesquisáveis por correspondência aproximada no preenchimento automático de menção @
  * Claude Code fornece automaticamente ferramentas para listar e ler recursos MCP quando os servidores os suportam
  * Os recursos podem conter qualquer tipo de conteúdo que o servidor MCP fornece (texto, JSON, dados estruturados, etc.)
</Tip>

## Escalar com MCP Tool Search

Quando você tem muitos servidores MCP configurados, as definições de ferramentas podem consumir uma porção significativa de sua janela de contexto. MCP Tool Search resolve isso carregando ferramentas sob demanda em vez de pré-carregar todas elas.

### Como funciona

Claude Code ativa automaticamente Tool Search quando suas descrições de ferramentas MCP consumiriam mais de 10% da janela de contexto. Você pode [ajustar este limite](#configure-tool-search) ou desabilitar a pesquisa de ferramentas completamente. Quando acionado:

1. As ferramentas MCP são adiadas em vez de carregadas no contexto antecipadamente
2. Claude usa uma ferramenta de pesquisa para descobrir ferramentas MCP relevantes quando necessário
3. Apenas as ferramentas que Claude realmente precisa são carregadas no contexto
4. As ferramentas MCP continuam funcionando exatamente como antes da sua perspectiva

### Para autores de servidores MCP

Se você está construindo um servidor MCP, o campo de instruções do servidor se torna mais útil com Tool Search habilitado. As instruções do servidor ajudam Claude a entender quando pesquisar suas ferramentas, semelhante a como [skills](/pt/skills) funcionam.

Adicione instruções de servidor claras e descritivas que expliquem:

* Que categoria de tarefas suas ferramentas lidam
* Quando Claude deve pesquisar suas ferramentas
* Capacidades principais do seu servidor

### Configurar pesquisa de ferramentas

A pesquisa de ferramentas é ativada por padrão: as ferramentas MCP são adiadas e descobertas sob demanda. Quando `ANTHROPIC_BASE_URL` aponta para um host que não é de primeira parte, a pesquisa de ferramentas é desabilitada por padrão porque a maioria dos proxies não encaminha blocos `tool_reference`. Defina `ENABLE_TOOL_SEARCH` explicitamente se seu proxy fizer. Este recurso requer modelos que suportam blocos `tool_reference`: Sonnet 4 e posterior, ou Opus 4 e posterior. Os modelos Haiku não suportam pesquisa de ferramentas.

Controle o comportamento da pesquisa de ferramentas com a variável de ambiente `ENABLE_TOOL_SEARCH`:

| Valor          | Comportamento                                                                                         |
| :------------- | :---------------------------------------------------------------------------------------------------- |
| (não definido) | Habilitado por padrão. Desabilitado quando `ANTHROPIC_BASE_URL` é um host que não é de primeira parte |
| `true`         | Sempre habilitado, incluindo para `ANTHROPIC_BASE_URL` que não é de primeira parte                    |
| `auto`         | Ativa quando ferramentas MCP excedem 10% do contexto                                                  |
| `auto:<N>`     | Ativa em limite personalizado, onde `<N>` é uma porcentagem (por exemplo, `auto:5` para 5%)           |
| `false`        | Desabilitado, todas as ferramentas MCP carregadas antecipadamente                                     |

```bash  theme={null}
# Use um limite personalizado de 5%
ENABLE_TOOL_SEARCH=auto:5 claude

# Desabilite a pesquisa de ferramentas completamente
ENABLE_TOOL_SEARCH=false claude
```

Ou defina o valor no seu [campo `env` de settings.json](/pt/settings#available-settings).

Você também pode desabilitar a ferramenta MCPSearch especificamente usando a configuração `disallowedTools`:

```json  theme={null}
{
  "permissions": {
    "deny": ["MCPSearch"]
  }
}
```

## Usar prompts MCP como comandos

Os servidores MCP podem expor prompts que se tornam disponíveis como comandos no Claude Code.

### Executar prompts MCP

<Steps>
  <Step title="Descubra prompts disponíveis">
    Digite `/` para ver todos os comandos disponíveis, incluindo aqueles de servidores MCP. Os prompts MCP aparecem com o formato `/mcp__servername__promptname`.
  </Step>

  <Step title="Execute um prompt sem argumentos">
    ```text  theme={null}
    /mcp__github__list_prs
    ```
  </Step>

  <Step title="Execute um prompt com argumentos">
    Muitos prompts aceitam argumentos. Passe-os separados por espaço após o comando:

    ```text  theme={null}
    /mcp__github__pr_review 456
    ```

    ```text  theme={null}
    /mcp__jira__create_issue "Bug no fluxo de login" high
    ```
  </Step>
</Steps>

<Tip>
  Dicas:

  * Os prompts MCP são descobertos dinamicamente de servidores conectados
  * Os argumentos são analisados com base nos parâmetros definidos do prompt
  * Os resultados do prompt são injetados diretamente na conversa
  * Os nomes do servidor e do prompt são normalizados (espaços se tornam sublinhados)
</Tip>

## Configuração MCP gerenciada

Para organizações que precisam de controle centralizado sobre servidores MCP, Claude Code suporta duas opções de configuração:

1. **Controle exclusivo com `managed-mcp.json`**: Implante um conjunto fixo de servidores MCP que os usuários não podem modificar ou estender
2. **Controle baseado em política com listas de permissão/bloqueio**: Permita que os usuários adicionem seus próprios servidores, mas restrinja quais são permitidos

Essas opções permitem que administradores de TI:

* **Controle quais servidores MCP os funcionários podem acessar**: Implante um conjunto padronizado de servidores MCP aprovados em toda a organização
* **Evite servidores MCP não autorizados**: Restrinja os usuários de adicionar servidores MCP não aprovados
* **Desabilite MCP completamente**: Remova a funcionalidade MCP completamente se necessário

### Opção 1: Controle exclusivo com managed-mcp.json

Quando você implanta um arquivo `managed-mcp.json`, ele assume **controle exclusivo** sobre todos os servidores MCP. Os usuários não podem adicionar, modificar ou usar nenhum servidor MCP além daqueles definidos neste arquivo. Esta é a abordagem mais simples para organizações que desejam controle completo.

Os administradores do sistema implantam o arquivo de configuração em um diretório em todo o sistema:

* macOS: `/Library/Application Support/ClaudeCode/managed-mcp.json`
* Linux e WSL: `/etc/claude-code/managed-mcp.json`
* Windows: `C:\Program Files\ClaudeCode\managed-mcp.json`

<Note>
  Estes são caminhos em todo o sistema (não diretórios de home do usuário como `~/Library/...`) que exigem privilégios de administrador. Eles são projetados para serem implantados por administradores de TI.
</Note>

O arquivo `managed-mcp.json` usa o mesmo formato que um arquivo `.mcp.json` padrão:

```json  theme={null}
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "company-internal": {
      "type": "stdio",
      "command": "/usr/local/bin/company-mcp-server",
      "args": ["--config", "/etc/company/mcp-config.json"],
      "env": {
        "COMPANY_API_URL": "https://internal.company.com"
      }
    }
  }
}
```

### Opção 2: Controle baseado em política com listas de permissão e bloqueio

Em vez de assumir controle exclusivo, os administradores podem permitir que os usuários configurem seus próprios servidores MCP enquanto aplicam restrições sobre quais servidores são permitidos. Esta abordagem usa `allowedMcpServers` e `deniedMcpServers` no [arquivo de configurações gerenciadas](/pt/settings#settings-files).

<Note>
  **Escolhendo entre opções**: Use a Opção 1 (`managed-mcp.json`) quando você deseja implantar um conjunto fixo de servidores sem personalização do usuário. Use a Opção 2 (listas de permissão/bloqueio) quando você deseja permitir que os usuários adicionem seus próprios servidores dentro de restrições de política.
</Note>

#### Opções de restrição

Cada entrada na lista de permissão ou bloqueio pode restringir servidores de três maneiras:

1. **Por nome do servidor** (`serverName`): Corresponde ao nome configurado do servidor
2. **Por comando** (`serverCommand`): Corresponde ao comando exato e argumentos usados para iniciar servidores stdio
3. **Por padrão de URL** (`serverUrl`): Corresponde a URLs de servidor remoto com suporte a caracteres curinga

**Importante**: Cada entrada deve ter exatamente um de `serverName`, `serverCommand` ou `serverUrl`.

#### Exemplo de configuração

```json  theme={null}
{
  "allowedMcpServers": [
    // Permitir por nome do servidor
    { "serverName": "github" },
    { "serverName": "sentry" },

    // Permitir por comando exato (para servidores stdio)
    { "serverCommand": ["npx", "-y", "@modelcontextprotocol/server-filesystem"] },
    { "serverCommand": ["python", "/usr/local/bin/approved-server.py"] },

    // Permitir por padrão de URL (para servidores remotos)
    { "serverUrl": "https://mcp.company.com/*" },
    { "serverUrl": "https://*.internal.corp/*" }
  ],
  "deniedMcpServers": [
    // Bloquear por nome do servidor
    { "serverName": "dangerous-server" },

    // Bloquear por comando exato (para servidores stdio)
    { "serverCommand": ["npx", "-y", "unapproved-package"] },

    // Bloquear por padrão de URL (para servidores remotos)
    { "serverUrl": "https://*.untrusted.com/*" }
  ]
}
```

#### Como funcionam as restrições baseadas em comando

**Correspondência exata**:

* Os arrays de comando devem corresponder **exatamente** - tanto o comando quanto todos os argumentos na ordem correta
* Exemplo: `["npx", "-y", "server"]` NÃO corresponderá a `["npx", "server"]` ou `["npx", "-y", "server", "--flag"]`

**Comportamento do servidor stdio**:

* Quando a lista de permissão contém **qualquer** entrada `serverCommand`, servidores stdio **devem** corresponder a um desses comandos
* Os servidores stdio não podem passar apenas pelo nome quando restrições de comando estão presentes
* Isso garante que os administradores possam aplicar quais comandos são permitidos executar

**Comportamento do servidor não-stdio**:

* Servidores remotos (HTTP, SSE, WebSocket) usam correspondência baseada em URL quando entradas `serverUrl` existem na lista de permissão
* Se nenhuma entrada de URL existir, servidores remotos voltam para correspondência baseada em nome
* As restrições de comando não se aplicam a servidores remotos

#### Como funcionam as restrições baseadas em URL

Os padrões de URL suportam caracteres curinga usando `*` para corresponder a qualquer sequência de caracteres. Isso é útil para permitir domínios inteiros ou subdomínios.

**Exemplos de caracteres curinga**:

* `https://mcp.company.com/*` - Permitir todos os caminhos em um domínio específico
* `https://*.example.com/*` - Permitir qualquer subdomínio de example.com
* `http://localhost:*/*` - Permitir qualquer porta em localhost

**Comportamento do servidor remoto**:

* Quando a lista de permissão contém **qualquer** entrada `serverUrl`, servidores remotos **devem** corresponder a um desses padrões de URL
* Os servidores remotos não podem passar apenas pelo nome quando restrições de URL estão presentes
* Isso garante que os administradores possam aplicar quais endpoints remotos são permitidos

<Accordion title="Exemplo: Lista de permissão apenas de URL">
  ```json  theme={null}
  {
    "allowedMcpServers": [
      { "serverUrl": "https://mcp.company.com/*" },
      { "serverUrl": "https://*.internal.corp/*" }
    ]
  }
  ```

  **Resultado**:

  * Servidor HTTP em `https://mcp.company.com/api`: ✅ Permitido (corresponde ao padrão de URL)
  * Servidor HTTP em `https://api.internal.corp/mcp`: ✅ Permitido (corresponde ao subdomínio curinga)
  * Servidor HTTP em `https://external.com/mcp`: ❌ Bloqueado (não corresponde a nenhum padrão de URL)
  * Servidor stdio com qualquer comando: ❌ Bloqueado (nenhuma entrada de nome ou comando para corresponder)
</Accordion>

<Accordion title="Exemplo: Lista de permissão apenas de comando">
  ```json  theme={null}
  {
    "allowedMcpServers": [
      { "serverCommand": ["npx", "-y", "approved-package"] }
    ]
  }
  ```

  **Resultado**:

  * Servidor stdio com `["npx", "-y", "approved-package"]`: ✅ Permitido (corresponde ao comando)
  * Servidor stdio com `["node", "server.js"]`: ❌ Bloqueado (não corresponde ao comando)
  * Servidor HTTP nomeado "my-api": ❌ Bloqueado (nenhuma entrada de nome para corresponder)
</Accordion>

<Accordion title="Exemplo: Lista de permissão mista de nome e comando">
  ```json  theme={null}
  {
    "allowedMcpServers": [
      { "serverName": "github" },
      { "serverCommand": ["npx", "-y", "approved-package"] }
    ]
  }
  ```

  **Resultado**:

  * Servidor stdio nomeado "local-tool" com `["npx", "-y", "approved-package"]`: ✅ Permitido (corresponde ao comando)
  * Servidor stdio nomeado "local-tool" com `["node", "server.js"]`: ❌ Bloqueado (entradas de comando existem mas não correspondem)
  * Servidor stdio nomeado "github" com `["node", "server.js"]`: ❌ Bloqueado (servidores stdio devem corresponder aos comandos quando entradas de comando existem)
  * Servidor HTTP nomeado "github": ✅ Permitido (corresponde ao nome)
  * Servidor HTTP nomeado "other-api": ❌ Bloqueado (nome não corresponde)
</Accordion>

<Accordion title="Exemplo: Lista de permissão apenas de nome">
  ```json  theme={null}
  {
    "allowedMcpServers": [
      { "serverName": "github" },
      { "serverName": "internal-tool" }
    ]
  }
  ```

  **Resultado**:

  * Servidor stdio nomeado "github" com qualquer comando: ✅ Permitido (nenhuma restrição de comando)
  * Servidor stdio nomeado "internal-tool" com qualquer comando: ✅ Permitido (nenhuma restrição de comando)
  * Servidor HTTP nomeado "github": ✅ Permitido (corresponde ao nome)
  * Qualquer servidor nomeado "other": ❌ Bloqueado (nome não corresponde)
</Accordion>

#### Comportamento da lista de permissão (`allowedMcpServers`)

* `undefined` (padrão): Sem restrições - os usuários podem configurar qualquer servidor MCP
* Array vazio `[]`: Bloqueio completo - os usuários não podem configurar nenhum servidor MCP
* Lista de entradas: Os usuários podem configurar apenas servidores que correspondem por nome, comando ou padrão de URL

#### Comportamento da lista de bloqueio (`deniedMcpServers`)

* `undefined` (padrão): Nenhum servidor é bloqueado
* Array vazio `[]`: Nenhum servidor é bloqueado
* Lista de entradas: Servidores especificados são explicitamente bloqueados em todos os escopos

#### Notas importantes

* **Opção 1 e Opção 2 podem ser combinadas**: Se `managed-mcp.json` existir, ele tem controle exclusivo e os usuários não podem adicionar servidores. As listas de permissão/bloqueio ainda se aplicam aos servidores gerenciados em si.
* **A lista de bloqueio tem precedência absoluta**: Se um servidor corresponder a uma entrada de lista de bloqueio (por nome, comando ou URL), será bloqueado mesmo que esteja na lista de permissão
* As restrições baseadas em nome, comando e URL funcionam juntas: um servidor passa se corresponder **a qualquer** entrada de nome, entrada de comando ou padrão de URL (a menos que bloqueado pela lista de bloqueio)

<Note>
  **Ao usar `managed-mcp.json`**: Os usuários não podem adicionar servidores MCP através de `claude mcp add` ou arquivos de configuração. As configurações `allowedMcpServers` e `deniedMcpServers` ainda se aplicam para filtrar quais servidores gerenciados são realmente carregados.
</Note>
