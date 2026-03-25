# Configuração avançada

> Requisitos do sistema, instalação específica da plataforma, gerenciamento de versão e desinstalação do Claude Code.

Esta página cobre requisitos do sistema, detalhes de instalação específicos da plataforma, atualizações e desinstalação. Para um guia passo a passo de sua primeira sessão, consulte o [guia de início rápido](/pt/quickstart). Se você nunca usou um terminal antes, consulte o [guia de terminal](/pt/terminal-guide).

## Requisitos do sistema

Claude Code é executado nas seguintes plataformas e configurações:

* **Sistema operacional**:
  * macOS 13.0+
  * Windows 10 1809+ ou Windows Server 2019+
  * Ubuntu 20.04+
  * Debian 10+
  * Alpine Linux 3.19+
* **Hardware**: 4 GB+ de RAM
* **Rede**: conexão com a internet obrigatória. Consulte [configuração de rede](/pt/network-config#network-access-requirements).
* **Shell**: Bash, Zsh, PowerShell ou CMD. No Windows, [Git for Windows](https://git-scm.com/downloads/win) é obrigatório.
* **Localização**: [países suportados pela Anthropic](https://www.anthropic.com/supported-countries)

### Dependências adicionais

* **ripgrep**: geralmente incluído com Claude Code. Se a busca falhar, consulte [solução de problemas de busca](/pt/troubleshooting#search-and-discovery-issues).

## Instalar Claude Code

<Tip>
  Prefere uma interface gráfica? O [aplicativo de desktop](/pt/desktop-quickstart) permite que você use Claude Code sem o terminal. Baixe-o para [macOS](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect?utm_source=claude_code&utm_medium=docs) ou [Windows](https://claude.ai/api/desktop/win32/x64/exe/latest/redirect?utm_source=claude_code&utm_medium=docs).

  Novo no terminal? Consulte o [guia de terminal](/pt/terminal-guide) para instruções passo a passo.
</Tip>

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

Após a conclusão da instalação, abra um terminal no projeto em que deseja trabalhar e inicie Claude Code:

```bash
claude
```

Se você encontrar algum problema durante a instalação, consulte o [guia de solução de problemas](/pt/troubleshooting).

### Configurar no Windows

Claude Code no Windows requer [Git for Windows](https://git-scm.com/downloads/win) ou WSL. Você pode iniciar `claude` a partir do PowerShell, CMD ou Git Bash. Claude Code usa Git Bash internamente para executar comandos. Você não precisa executar o PowerShell como Administrador.

**Opção 1: Windows nativo com Git Bash**

Instale [Git for Windows](https://git-scm.com/downloads/win) e execute o comando de instalação a partir do PowerShell ou CMD.

Se Claude Code não conseguir encontrar sua instalação do Git Bash, defina o caminho em seu [arquivo settings.json](/pt/settings):

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

**Opção 2: WSL**

Tanto WSL 1 quanto WSL 2 são suportados. WSL 2 suporta [sandboxing](/pt/sandboxing) para segurança aprimorada. WSL 1 não suporta sandboxing.

### Alpine Linux e distribuições baseadas em musl

O instalador nativo no Alpine e outras distribuições baseadas em musl/uClibc requer `libgcc`, `libstdc++` e `ripgrep`. Instale-os usando o gerenciador de pacotes da sua distribuição e defina `USE_BUILTIN_RIPGREP=0`.

Este exemplo instala os pacotes necessários no Alpine:

```bash
apk add libgcc libstdc++ ripgrep
```

Em seguida, defina `USE_BUILTIN_RIPGREP` como `0` em seu arquivo [`settings.json`](/pt/settings#available-settings):

```json
{
  "env": {
    "USE_BUILTIN_RIPGREP": "0"
  }
}
```

## Verificar sua instalação

Após a instalação, confirme que Claude Code está funcionando:

```bash
claude --version
```

Para uma verificação mais detalhada de sua instalação e configuração, execute [`claude doctor`](/pt/troubleshooting#get-more-help):

```bash
claude doctor
```

## Autenticar

Claude Code requer uma conta Pro, Max, Teams, Enterprise ou Console. O plano gratuito do Claude.ai não inclui acesso ao Claude Code. Você também pode usar Claude Code com um provedor de API de terceiros como [Amazon Bedrock](/pt/amazon-bedrock), [Google Vertex AI](/pt/google-vertex-ai) ou [Microsoft Foundry](/pt/microsoft-foundry).

Após a instalação, faça login executando `claude` e seguindo os prompts do navegador. Consulte [Autenticação](/pt/authentication) para todos os tipos de conta e opções de configuração de equipe.

## Atualizar Claude Code

As instalações nativas são atualizadas automaticamente em segundo plano. Você pode [configurar o canal de lançamento](#configure-release-channel) para controlar se recebe atualizações imediatamente ou em um cronograma estável com atraso, ou [desabilitar atualizações automáticas](#disable-auto-updates) completamente. As instalações do Homebrew e WinGet requerem atualizações manuais.

### Atualizações automáticas

Claude Code verifica atualizações na inicialização e periodicamente durante a execução. As atualizações são baixadas e instaladas em segundo plano, depois entram em vigor na próxima vez que você inicia Claude Code.

<Note>
  As instalações do Homebrew e WinGet não são atualizadas automaticamente. Use `brew upgrade claude-code` ou `winget upgrade Anthropic.ClaudeCode` para atualizar manualmente.

  **Problema conhecido:** Claude Code pode notificá-lo sobre atualizações antes que a nova versão esteja disponível nesses gerenciadores de pacotes. Se uma atualização falhar, aguarde e tente novamente mais tarde.

  O Homebrew mantém versões antigas no disco após atualizações. Execute `brew cleanup claude-code` periodicamente para recuperar espaço em disco.
</Note>

### Configurar canal de lançamento

Controle qual canal de lançamento Claude Code segue para atualizações automáticas e `claude update` com a configuração `autoUpdatesChannel`:

* `"latest"`, o padrão: receba novos recursos assim que forem lançados
* `"stable"`: use uma versão que normalmente tem cerca de uma semana de idade, pulando lançamentos com regressões importantes

Configure isso via `/config` → **Canal de atualização automática**, ou adicione-o ao seu [arquivo settings.json](/pt/settings):

```json
{
  "autoUpdatesChannel": "stable"
}
```

Para implantações empresariais, você pode impor um canal de lançamento consistente em toda a sua organização usando [configurações gerenciadas](/pt/permissions#managed-settings).

### Desabilitar atualizações automáticas

Defina `DISABLE_AUTOUPDATER` como `"1"` na chave `env` do seu arquivo [`settings.json`](/pt/settings#available-settings):

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  }
}
```

### Atualizar manualmente

Para aplicar uma atualização imediatamente sem aguardar a próxima verificação em segundo plano, execute:

```bash
claude update
```

## Opções avançadas de instalação

Essas opções são para fixação de versão, migração do npm e verificação da integridade do binário.

### Instalar uma versão específica

O instalador nativo aceita um número de versão específico ou um canal de lançamento (`latest` ou `stable`). O canal que você escolhe no momento da instalação se torna seu padrão para atualizações automáticas. Consulte [configurar canal de lançamento](#configure-release-channel) para mais informações.

Para instalar a versão mais recente (padrão):

<Tabs>
  <Tab title="macOS, Linux, WSL">
    ```bash
    curl -fsSL https://claude.ai/install.sh | bash
    ```
  </Tab>

  <Tab title="Windows PowerShell">
    ```powershell
    irm https://claude.ai/install.ps1 | iex
    ```
  </Tab>

  <Tab title="Windows CMD">
    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
    ```
  </Tab>
</Tabs>

Para instalar a versão estável:

<Tabs>
  <Tab title="macOS, Linux, WSL">
    ```bash
    curl -fsSL https://claude.ai/install.sh | bash -s stable
    ```
  </Tab>

  <Tab title="Windows PowerShell">
    ```powershell
    & ([scriptblock]::Create((irm https://claude.ai/install.ps1))) stable
    ```
  </Tab>

  <Tab title="Windows CMD">
    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd stable && del install.cmd
    ```
  </Tab>
</Tabs>

Para instalar um número de versão específico:

<Tabs>
  <Tab title="macOS, Linux, WSL">
    ```bash
    curl -fsSL https://claude.ai/install.sh | bash -s 1.0.58
    ```
  </Tab>

  <Tab title="Windows PowerShell">
    ```powershell
    & ([scriptblock]::Create((irm https://claude.ai/install.ps1))) 1.0.58
    ```
  </Tab>

  <Tab title="Windows CMD">
    ```batch
    curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd 1.0.58 && del install.cmd
    ```
  </Tab>
</Tabs>

### Instalação npm descontinuada

A instalação npm está descontinuada. O instalador nativo é mais rápido, não requer dependências e é atualizado automaticamente em segundo plano. Use o método de [instalação nativa](#install-claude-code) quando possível.

#### Migrar do npm para nativo

Se você instalou anteriormente Claude Code com npm, mude para o instalador nativo:

```bash
# Instalar o binário nativo
curl -fsSL https://claude.ai/install.sh | bash

# Remover a instalação antiga do npm
npm uninstall -g @anthropic-ai/claude-code
```

Você também pode executar `claude install` a partir de uma instalação npm existente para instalar o binário nativo junto com ela e depois remover a versão npm.

#### Instalar com npm

Se você precisar da instalação npm por motivos de compatibilidade, você deve ter [Node.js 18+](https://nodejs.org/en/download) instalado. Instale o pacote globalmente:

```bash
npm install -g @anthropic-ai/claude-code
```

<Warning>
  NÃO use `sudo npm install -g` pois isso pode levar a problemas de permissão e riscos de segurança. Se você encontrar erros de permissão, consulte [solução de problemas de erros de permissão](/pt/troubleshooting#permission-errors-during-installation).
</Warning>

### Integridade binária e assinatura de código

Você pode verificar a integridade dos binários do Claude Code usando checksums SHA256 e assinaturas de código.

* Os checksums SHA256 para todas as plataformas são publicados nos manifestos de lançamento em `https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases/{VERSION}/manifest.json`. Substitua `{VERSION}` por um número de versão como `2.0.30`.
* Os binários assinados são distribuídos para as seguintes plataformas:
  * **macOS**: assinado por "Anthropic PBC" e autenticado pela Apple
  * **Windows**: assinado por "Anthropic, PBC"

## Desinstalar Claude Code

Para remover Claude Code, siga as instruções para seu método de instalação.

### Instalação nativa

Remova o binário Claude Code e os arquivos de versão:

<Tabs>
  <Tab title="macOS, Linux, WSL">
    ```bash
    rm -f ~/.local/bin/claude
    rm -rf ~/.local/share/claude
    ```
  </Tab>

  <Tab title="Windows PowerShell">
    ```powershell
    Remove-Item -Path "$env:USERPROFILE\.local\bin\claude.exe" -Force
    Remove-Item -Path "$env:USERPROFILE\.local\share\claude" -Recurse -Force
    ```
  </Tab>
</Tabs>

### Instalação do Homebrew

Remova o cask do Homebrew:

```bash
brew uninstall --cask claude-code
```

### Instalação do WinGet

Remova o pacote WinGet:

```powershell
winget uninstall Anthropic.ClaudeCode
```

### npm

Remova o pacote npm global:

```bash
npm uninstall -g @anthropic-ai/claude-code
```

### Remover arquivos de configuração

<Warning>
  Remover arquivos de configuração excluirá todas as suas configurações, ferramentas permitidas, configurações do MCP server e histórico de sessão.
</Warning>

Para remover as configurações e dados em cache do Claude Code:

<Tabs>
  <Tab title="macOS, Linux, WSL">
    ```bash
    # Remover configurações de usuário e estado
    rm -rf ~/.claude
    rm ~/.claude.json

    # Remover configurações específicas do projeto (execute a partir do diretório do seu projeto)
    rm -rf .claude
    rm -f .mcp.json
    ```
  </Tab>

  <Tab title="Windows PowerShell">
    ```powershell
    # Remover configurações de usuário e estado
    Remove-Item -Path "$env:USERPROFILE\.claude" -Recurse -Force
    Remove-Item -Path "$env:USERPROFILE\.claude.json" -Force

    # Remover configurações específicas do projeto (execute a partir do diretório do seu projeto)
    Remove-Item -Path ".claude" -Recurse -Force
    Remove-Item -Path ".mcp.json" -Force
    ```
  </Tab>
</Tabs>
