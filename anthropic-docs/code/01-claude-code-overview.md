# Visão Geral do Claude Code

**URL:** https://code.claude.com/docs/pt/overview
**Data de extração:** 2025-11-06

---

## Começando Rapidamente

Claude Code pode ser instalado em menos de 30 segundos através de múltiplos métodos:

- **macOS/Linux**: `curl -fsSL https://claude.ai/install.sh | bash`
- **Homebrew**: `brew install --cask claude-code`
- **Windows**: `irm https://claude.ai/install.ps1 | iex`
- **NPM**: `npm install -g @anthropic-ai/claude-code` (requer Node.js 18+)

Uma vez instalado, navegue até seu projeto e execute `claude` para começar.

## Capacidades Principais

Claude Code oferece quatro funções primárias:

1. **Desenvolvimento de Recursos** - Transforma descrições em inglês simples em código funcional com planejamento e verificação
2. **Depuração** - Analisa bases de código para identificar e resolver problemas a partir de mensagens de erro
3. **Navegação de Codebase** - Responde perguntas sobre estrutura de projeto e integra fontes de dados externas via MCP
4. **Automação de Tarefas** - Lida com correções de lint, conflitos de merge, notas de lançamento e workflows de CI/CD

## Por Que Desenvolvedores Escolhem Claude Code

A plataforma enfatiza várias vantagens:

- **Integração Nativa ao Terminal** - Funciona dentro de ambientes de desenvolvimento existentes em vez de requerer janelas de chat separadas
- **Ação Direta** - Edita arquivos, executa comandos e cria commits sem intervenção manual
- **Filosofia Unix** - Suporta piping e scripting para workflows combináveis
- **Pronto para Empresa** - Fornece acesso à API, opções de hospedagem em nuvem (AWS/GCP) e padrões de segurança integrados

## Recursos Adicionais

Uma extensão VS Code (Beta) oferece uma alternativa gráfica ao uso do terminal, enquanto a integração MCP permite conexões com Google Drive, Figma, Slack e outras ferramentas de desenvolvedor.
