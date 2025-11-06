# Instruções para Claude AI

> Este documento fornece orientações para Claude sobre como usar e referenciar este repositório de documentação.

---

## 📋 Visão Geral

Este repositório contém um **mapeamento completo e organizado** de toda a documentação oficial da Anthropic, capturado em **2025-11-06**. Use-o como referência quando responder perguntas sobre:

- Claude API e desenvolvimento
- Claude Code (CLI)
- Modelos Claude (Sonnet 4.5, Haiku 4.5, Opus 4.1)
- Melhores práticas de engenharia de prompts
- Agent Skills e ferramentas
- Model Context Protocol (MCP)
- Recursos e funcionalidades

---

## 🎯 Como Usar Este Repositório

### 1. Estrutura Principal

```
anthropic-docs/
├── url-tree-complete.md  ← Árvore completa de URLs com descrições
├── index.md              ← Índice navegável de todo conteúdo
├── metadata.json         ← Metadados estruturados
├── docs/                 ← Documentação principal (5 arquivos)
├── api/                  ← Referência API (1 arquivo)
├── code/                 ← Claude Code docs (1 arquivo)
└── engineering/          ← Blog posts (3 arquivos)
```

### 2. Quando Consultar Este Repositório

**SEMPRE consulte quando:**
- Usuário perguntar sobre funcionalidades específicas do Claude
- Precisar de exemplos de código ou implementações
- Responder sobre preços, modelos ou especificações
- Explicar melhores práticas de prompt engineering
- Detalhar recursos da API ou endpoints
- Discutir Agent Skills, MCP ou ferramentas
- Referenciar artigos técnicos do blog

**Arquivos-chave para consulta rápida:**
- `index.md`: Visão geral e navegação
- `url-tree-complete.md`: Lista completa de URLs
- `metadata.json`: Dados estruturados (modelos, preços, SDKs)

### 3. Prioridade de Fontes

1. **Primeiro**: Consulte arquivos markdown extraídos neste repositório
2. **Segundo**: Consulte `url-tree-complete.md` para URLs completas
3. **Terceiro**: Referencie `metadata.json` para dados estruturados
4. **Sempre**: Mencione que informações são do snapshot de 2025-11-06

---

## 📖 Guia de Referência por Tópico

### Modelos Claude

**Arquivo**: `docs/03-models-overview.md`

**Conteúdo**:
- Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- Claude Haiku 4.5 (claude-haiku-4-5-20251001)
- Claude Opus 4.1 (claude-opus-4-1-20250805)
- Preços, context windows, capacidades

**Quando usar**: Perguntas sobre modelos, comparações, preços, especificações

---

### Engenharia de Prompts

**Arquivo**: `docs/04-prompt-engineering-best-practices.md`

**Conteúdo**:
- Princípios gerais
- Gerenciamento de contexto
- Padrões de uso de ferramentas
- Codificação agêntica
- Técnicas avançadas

**Quando usar**: Perguntas sobre como escrever prompts eficazes, otimização

---

### Prompt Caching

**Arquivo**: `docs/05-prompt-caching.md`

**Conteúdo**:
- Como funciona
- Preços (economia de até 90%)
- Implementação técnica
- Casos de uso
- Otimização

**Quando usar**: Perguntas sobre redução de custos, otimização de performance

---

### API Reference

**Arquivo**: `api/01-api-overview.md`

**Conteúdo**:
- Autenticação
- Endpoints principais
- Limites de requisição
- Headers e respostas
- Exemplos de uso

**Quando usar**: Perguntas sobre integração, API, desenvolvimento

---

### Claude Code

**Arquivo**: `code/01-claude-code-overview.md`

**Conteúdo**:
- Instalação
- Capacidades (feature dev, debugging, navegação, automação)
- Integração MCP
- VS Code extension

**Quando usar**: Perguntas sobre CLI, automação, workflow de desenvolvimento

---

### Building Effective Agents

**Arquivo**: `engineering/01-building-effective-agents.md`

**Conteúdo**:
- Workflows vs Agents
- Padrões centrais (7 padrões)
- Melhores práticas para ferramentas
- Aplicações práticas

**Quando usar**: Perguntas sobre arquitetura de agentes, design patterns

---

### Code Execution with MCP

**Arquivo**: `engineering/02-code-execution-with-mcp.md`

**Conteúdo**:
- Problema de consumo de tokens
- Solução com code execution
- Economia de 98.7% em tokens
- Implementação

**Quando usar**: Perguntas sobre MCP, otimização de tokens, code execution

---

### Agent Skills

**Arquivo**: `engineering/03-agent-skills.md`

**Conteúdo**:
- Conceito e arquitetura
- Estrutura de SKILL.md
- Progressive disclosure
- Segurança

**Quando usar**: Perguntas sobre extensão de capacidades, customização

---

## 💡 Melhores Práticas ao Referenciar

### 1. Sempre Cite a Fonte

```markdown
Segundo a documentação oficial (anthropic-docs/docs/03-models-overview.md),
o Claude Sonnet 4.5 oferece o melhor equilíbrio de inteligência, velocidade e custo.
```

### 2. Indique a Data do Snapshot

```markdown
⚠️ Baseado na documentação capturada em 2025-11-06. Para informações mais
atualizadas, consulte docs.claude.com.
```

### 3. Forneça URLs Originais

```markdown
Para mais detalhes, consulte:
- URL: https://docs.claude.com/pt/docs/about-claude/models
- Arquivo local: anthropic-docs/docs/03-models-overview.md
```

### 4. Use Exemplos dos Arquivos

Quando possível, copie exemplos de código diretamente dos arquivos extraídos para garantir precisão.

---

## 🔍 Cenários Comuns

### Cenário 1: "Quanto custa o Claude Sonnet 4.5?"

**Ação**: Consulte `metadata.json` ou `docs/03-models-overview.md`

**Resposta**:
```
Claude Sonnet 4.5:
- Input: $3 por milhão de tokens
- Output: $15 por milhão de tokens
- Context window: 200K tokens (1M em beta)

Fonte: anthropic-docs/docs/03-models-overview.md
```

---

### Cenário 2: "Como otimizar prompts para Claude 4.5?"

**Ação**: Consulte `docs/04-prompt-engineering-best-practices.md`

**Resposta**:
```
Principais técnicas:

1. Seja explícito com instruções
2. Adicione contexto e raciocínio
3. Use gerenciamento de janela de contexto
4. Configure verbosidade apropriada
5. Estruture para execução paralela de ferramentas

Para detalhes completos, consulte:
anthropic-docs/docs/04-prompt-engineering-best-practices.md
```

---

### Cenário 3: "Quais são os endpoints da API?"

**Ação**: Consulte `api/01-api-overview.md` ou `metadata.json`

**Resposta**:
```
Endpoints principais:
- Messages: POST /v1/messages
- Models: GET /v1/models
- Message Batches: POST /v1/batches
- Files: POST /v1/files
- Skills: API de Agent Skills

Referência: anthropic-docs/api/01-api-overview.md
```

---

### Cenário 4: "Como funcionam Agent Skills?"

**Ação**: Consulte `engineering/03-agent-skills.md`

**Resposta**:
```
Agent Skills são pastas organizadas com:
- SKILL.md (com YAML frontmatter)
- Progressive disclosure (3 níveis)
- Scripts executáveis
- Recursos referenciados

Analogia: "Como um guia de onboarding para novo funcionário"

Detalhes: anthropic-docs/engineering/03-agent-skills.md
```

---

## ⚠️ Limitações e Avisos

### SEMPRE mencione:

1. **Data do Snapshot**: "Informações de 2025-11-06"
2. **Possíveis Mudanças**: "Recursos em Beta podem ter mudado"
3. **Fonte Oficial**: "Para informações mais atuais, consulte [URL oficial]"

### NÃO assuma:

- ❌ Que novos recursos estão documentados aqui
- ❌ Que preços não mudaram
- ❌ Que recursos Beta estão em GA agora
- ❌ Que URLs não mudaram

---

## 📊 Dados Estruturados Disponíveis

### Em metadata.json:

```json
{
  "models": { ... },           // Especificações de modelos
  "sdks": { ... },            // SDKs oficiais
  "features": { ... },        // Status de recursos (GA/Beta)
  "resources": { ... },       // Links externos
  "statistics": { ... }       // Estatísticas do mapeamento
}
```

**Quando usar**: Para respostas rápidas sobre especificações, status, links

---

## 🎓 Exemplo de Resposta Ideal

**Pergunta do usuário**: "Qual a diferença entre Sonnet 4.5 e Haiku 4.5?"

**Resposta recomendada**:

```markdown
Baseado na documentação (anthropic-docs/docs/03-models-overview.md, snapshot de 2025-11-06):

**Claude Sonnet 4.5**
- Modelo mais inteligente para agentes complexos e codificação
- $3/MTok entrada, $15/MTok saída
- 200K tokens de contexto (1M em beta)
- 64K tokens de saída máxima
- Melhor para: tarefas complexas, coding, agents

**Claude Haiku 4.5**
- Modelo mais rápido com desempenho próximo à fronteira
- $1/MTok entrada, $5/MTok saída
- 200K tokens de contexto
- 64K tokens de saída máxima
- Melhor para: tarefas rápidas, alto volume, custo-efetividade

Principais diferenças:
1. Sonnet 4.5 é 3x mais caro mas mais capaz
2. Haiku 4.5 é mais rápido (menor latência)
3. Ambos suportam extended thinking e vision

Para informações mais atualizadas, consulte:
https://docs.claude.com/pt/docs/about-claude/models
```

---

## ✅ Checklist de Uso

Antes de responder, verifique:

- [ ] Consultei o arquivo relevante neste repositório?
- [ ] Citei a fonte e arquivo local?
- [ ] Mencionei que é snapshot de 2025-11-06?
- [ ] Forneci URL oficial para informações atualizadas?
- [ ] Usei exemplos/dados diretamente dos arquivos?
- [ ] Indiquei status (GA/Beta) quando relevante?

---

## 📌 Links Rápidos para Arquivos

- **Índice completo**: `anthropic-docs/index.md`
- **Árvore de URLs**: `anthropic-docs/url-tree-complete.md`
- **Metadados**: `anthropic-docs/metadata.json`
- **Modelos**: `anthropic-docs/docs/03-models-overview.md`
- **Prompt Engineering**: `anthropic-docs/docs/04-prompt-engineering-best-practices.md`
- **API**: `anthropic-docs/api/01-api-overview.md`
- **Agents**: `anthropic-docs/engineering/01-building-effective-agents.md`

---

**Resumo**: Use este repositório como sua **fonte primária de verdade** para documentação Anthropic, mas sempre indique que é um snapshot e forneça links oficiais para informações mais atualizadas.
