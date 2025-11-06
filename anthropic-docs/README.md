# Mapeamento Completo da Documentação Anthropic

> Repositório abrangente contendo mapeamento organizado de toda a documentação oficial da Anthropic

[![Status](https://img.shields.io/badge/status-complete-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.0-blue)]()
[![Last Updated](https://img.shields.io/badge/updated-2025--11--06-orange)]()

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Conteúdo Mapeado](#conteúdo-mapeado)
- [Como Usar](#como-usar)
- [Estatísticas](#estatísticas)
- [Recursos Principais](#recursos-principais)
- [Links Úteis](#links-úteis)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

Este projeto foi criado para fornecer um **mapeamento completo, organizado e facilmente navegável** de toda a documentação oficial da Anthropic, incluindo:

- ✅ **Claude Documentation** - Guias completos da API e desenvolvimento
- ✅ **Claude Code** - Documentação do CLI oficial
- ✅ **Engineering Blog** - Artigos técnicos e melhores práticas
- ✅ **Learning Resources** - Cursos e materiais educacionais
- ✅ **News & Updates** - Comunicados e release notes
- ✅ **API Reference** - Referência completa de endpoints

### Objetivos

1. **Centralização**: Reunir toda a documentação dispersa em um único local
2. **Organização**: Estruturar o conteúdo de forma lógica e acessível
3. **Preservação**: Manter snapshots da documentação para referência histórica
4. **Acessibilidade**: Facilitar pesquisa e navegação através de índices e metadados

---

## 📁 Estrutura do Repositório

```
anthropic-docs/
│
├── 📄 url-tree-complete.md      # Árvore completa de URLs (150+ URLs)
├── 📄 index.md                  # Índice navegável de todo conteúdo
├── 📄 metadata.json             # Metadados estruturados do projeto
├── 📄 README.md                 # Este arquivo
├── 📄 CLAUDE.md                 # Instruções para Claude AI
│
├── 📂 docs/                     # Documentação principal do Claude
│   ├── 01-introduction-to-claude.md
│   ├── 02-get-started.md
│   ├── 03-models-overview.md
│   ├── 04-prompt-engineering-best-practices.md
│   └── 05-prompt-caching.md
│
├── 📂 api/                      # Referência da API
│   └── 01-api-overview.md
│
├── 📂 code/                     # Documentação do Claude Code
│   └── 01-claude-code-overview.md
│
├── 📂 engineering/              # Artigos do Engineering Blog
│   ├── 01-building-effective-agents.md
│   ├── 02-code-execution-with-mcp.md
│   └── 03-agent-skills.md
│
├── 📂 learn/                    # Recursos de aprendizado
├── 📂 news/                     # Notícias e comunicados
└── 📂 resources/                # Recursos adicionais
```

---

## 📚 Conteúdo Mapeado

### 1. Claude Documentation (docs.claude.com)

#### Modelos e Capacidades
- **Claude Sonnet 4.5** - Modelo mais inteligente para agentes e codificação
- **Claude Haiku 4.5** - Modelo mais rápido com desempenho de fronteira
- **Claude Opus 4.1** - Especializado em raciocínio avançado

#### Recursos Principais
- Prompt Engineering Best Practices
- Prompt Caching (economia de até 90%)
- Extended Thinking
- Message Streaming
- Batch Processing
- Agent Skills
- Tool Use
- Vision e PDF Support

### 2. API Reference

#### Endpoints Documentados
- **Messages**: Criar e processar mensagens
- **Models**: Listar e consultar modelos
- **Message Batches**: Processamento em lote (50% desconto)
- **Files**: Gerenciamento de arquivos
- **Skills**: API de Agent Skills
- **Admin API**: Gerenciamento organizacional

### 3. Claude Code

#### Funcionalidades
- Desenvolvimento de features em linguagem natural
- Depuração inteligente
- Navegação de codebase
- Automação de tarefas
- Integração MCP
- Extensão VS Code (Beta)

### 4. Engineering Blog

#### Artigos Principais
- **Building Effective Agents** (2024-12-19)
- **Code Execution with MCP** (2025-11-04)
- **Agent Skills** (2025-10-16)
- Contextual Retrieval
- Multi-Agent Systems
- SWE-bench Results

### 5. Learning Resources

- **Anthropic Academy**: Cursos estruturados
- **Build with Claude**: 25+ áreas temáticas
- **Claude for Work**: Implementação empresarial
- **Claude for You**: Uso pessoal

---

## 🚀 Como Usar

### Navegação Rápida

1. **Para visão geral completa**: Leia [`index.md`](index.md)
2. **Para lista de URLs**: Consulte [`url-tree-complete.md`](url-tree-complete.md)
3. **Para metadados estruturados**: Veja [`metadata.json`](metadata.json)
4. **Para tópicos específicos**: Navegue pelos diretórios temáticos

### Busca de Conteúdo

```bash
# Buscar por termo específico
grep -r "prompt caching" anthropic-docs/

# Listar todos os arquivos markdown
find anthropic-docs/ -name "*.md"

# Ver estrutura de diretórios
tree anthropic-docs/
```

### Uso com Claude AI

Para instruções sobre como Claude deve usar esta documentação, consulte [`CLAUDE.md`](CLAUDE.md).

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **URLs Mapeadas** | 150+ |
| **Arquivos Criados** | 10 |
| **Categorias** | 6 principais |
| **Idiomas** | Português, Inglês |
| **SDKs Oficiais** | 7 linguagens |
| **Modelos Ativos** | 3 (Sonnet 4.5, Haiku 4.5, Opus 4.1) |

### Distribuição de Conteúdo

- **Claude Docs**: ~80 URLs (53%)
- **Claude Code**: ~20 URLs (13%)
- **Engineering Blog**: ~15 artigos (10%)
- **Learning Resources**: ~15 recursos (10%)
- **News**: ~15 notícias (10%)
- **External Resources**: ~10 links (7%)

---

## ⭐ Recursos Principais

### Arquivos Core

1. **url-tree-complete.md**
   - Mapeamento hierárquico completo
   - Descrições de cada URL
   - Tópicos e subtópicos
   - Resumos descritivos

2. **index.md**
   - Índice navegável organizado
   - Links para todos os documentos
   - Estrutura categorizada
   - Estatísticas do projeto

3. **metadata.json**
   - Dados estruturados em JSON
   - Metadados de modelos
   - Informações de SDKs
   - Links e recursos externos

### Documentos Extraídos

Cada documento extraído inclui:
- ✅ URL original
- ✅ Data de extração
- ✅ Conteúdo completo em markdown
- ✅ Exemplos de código
- ✅ Formatação preservada

---

## 🔗 Links Úteis

### Documentação Oficial
- [Claude Docs](https://docs.claude.com/pt/home)
- [Claude Code Docs](https://code.claude.com/docs/pt/overview)
- [Engineering Blog](https://www.anthropic.com/engineering)
- [Learn Hub](https://www.anthropic.com/learn)

### Ferramentas
- [Claude Console](https://console.anthropic.com) - Developer console
- [Claude.ai](https://claude.ai) - Interface web
- [Support Center](https://support.anthropic.com) - Suporte
- [Trust Center](https://trust.anthropic.com) - Compliance

### Repositórios GitHub
- [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)
- [Anthropic Quickstarts](https://github.com/anthropics/anthropic-quickstarts)
- [Claude Code](https://github.com/anthropics/claude-code)

### Comunidade
- [Discord](https://discord.gg/anthropic)
- [Status Page](https://status.anthropic.com)

---

## 🤝 Contribuindo

Este é um repositório de mapeamento e documentação. Para contribuir:

1. **Reporte URLs ausentes**: Abra uma issue com URLs não mapeadas
2. **Sugira melhorias**: Compartilhe ideias de organização
3. **Atualizações**: Reporte documentação desatualizada
4. **Correções**: Envie correções de erros ou links quebrados

---

## 📝 Notas Importantes

- ⚠️ Este é um snapshot da documentação em **2025-11-06**
- ⚠️ A documentação oficial está em constante evolução
- ⚠️ Alguns recursos estão em Beta e podem mudar
- ⚠️ URLs em português podem redirecionar para inglês
- ⚠️ Para informações mais atualizadas, consulte os sites oficiais

---

## 📧 Contato

### Anthropic
- **Press**: press@anthropic.com
- **Support**: support@anthropic.com

---

## 📜 Licença

Este projeto é uma agregação de documentação pública da Anthropic.
Todo o conteúdo original pertence à Anthropic.

Para termos de uso, consulte:
- [Anthropic Terms of Service](https://www.anthropic.com/legal/terms)
- [Privacy Policy](https://www.anthropic.com/legal/privacy)

---

## 🙏 Agradecimentos

- **Anthropic** por criar e manter documentação de alta qualidade
- Toda a comunidade de desenvolvedores Claude
- Contribuidores de código aberto dos SDKs e ferramentas

---

**Última Atualização**: 2025-11-06
**Versão**: 1.0
**Status**: Completo ✅
