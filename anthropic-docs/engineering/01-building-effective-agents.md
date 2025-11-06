# Construindo Agentes de IA Eficazes

**URL:** https://www.anthropic.com/engineering/building-effective-agents
**Data de publicação:** 2024-12-19
**Data de extração:** 2025-11-06

---

## Visão Geral

A pesquisa da Anthropic revela que implementações bem-sucedidas de agentes LLM dependem de padrões simples e combináveis em vez de frameworks complexos. A organização trabalhou extensivamente com equipes em várias indústrias para identificar melhores práticas.

## Distinções-Chave

O documento estabelece uma importante distinção arquitetônica:

- **Workflows**: "sistemas onde LLMs e ferramentas são orquestrados através de caminhos de código predefinidos"
- **Agents**: "sistemas onde LLMs direcionam dinamicamente seus próprios processos e uso de ferramentas"

## Quando Construir Agentes

A orientação enfatiza pragmatismo: otimize chamadas únicas de LLM primeiro. Sistemas agênticos trocam latência e custo por melhor desempenho—use-os apenas quando abordagens mais simples falharem.

## Padrões Centrais

### 1. O LLM Aumentado (Fundação)

O bloco de construção básico combina um LLM com capacidades de recuperação, ferramentas e memória. Dois aspectos-chave de implementação:
- Adapte capacidades a casos de uso específicos
- Forneça interfaces claras e bem documentadas

O Model Context Protocol oferece uma abordagem para integrar ferramentas de terceiros.

### 2. Encadeamento de Prompts (Workflow)

Decompõe tarefas em passos sequenciais onde cada chamada de LLM processa saídas anteriores. Útil para geração de copy de marketing seguida de tradução, ou esboços de documentos antes de rascunho completo.

### 3. Roteamento (Workflow)

Classifica entradas e as direciona para tarefas especializadas. Lida com consultas de serviço ao cliente diferentemente com base no tipo, ou roteia perguntas simples para modelos menores e complexas para modelos capazes.

### 4. Paralelização (Workflow)

Duas variações:
- **Secionamento**: Subtarefas independentes executam simultaneamente
- **Votação**: Mesma tarefa executada múltiplas vezes para saídas diversas

Exemplos incluem implementação de guardrails e revisões de vulnerabilidades de código.

### 5. Orquestrador-Trabalhadores (Workflow)

Um LLM central dinamicamente quebra tarefas complexas e delega a trabalhadores, depois sintetiza resultados. Ideal para cenários de subtarefas imprevisíveis como mudanças de código através de múltiplos arquivos.

### 6. Avaliador-Otimizador (Workflow)

Um LLM gera respostas enquanto outro fornece feedback iterativo. Eficaz para tradução literária e busca complexa requerendo múltiplos ciclos de refinamento.

### 7. Agentes (Sistemas Autônomos)

Agentes verdadeiros operam independentemente com supervisão humana em checkpoints. Eles continuamente incorporam feedback ambiental para avaliar progresso e adaptar.

## Orientação sobre Frameworks

O documento recomenda começar com chamadas diretas de API LLM: "muitos padrões podem ser implementados em poucas linhas de código." Embora frameworks como LangGraph simplifiquem o desenvolvimento, eles podem obscurecer lógica subjacente e encorajar complexidade desnecessária.

## Melhores Práticas para Ferramentas

Design de ferramentas merece tanta atenção quanto prompts gerais. Recomendações-chave:

- Dê aos modelos tokens suficientes para deliberar antes de se comprometer com saída
- Mantenha formatos alinhados com texto natural da internet
- Elimine overhead de formatação (sem contagem de linha complexa)
- Inclua exemplo de uso e casos extremos em definições de ferramentas
- Teste extensivamente usando o workbench da Anthropic
- Aplique princípios "poka-yoke" para reduzir erros

O agente SWE-bench requereu mais otimização de ferramentas do que refinamento de prompt, incluindo mudança para caminhos absolutos de arquivos para prevenir erros.

## Princípios Centrais de Implementação

1. **Simplicidade**: Projete agentes enxutos e focados
2. **Transparência**: Mostre explicitamente passos de planejamento
3. **Documentação**: Documente e teste completamente interfaces agente-computador

## Aplicações Práticas

### Suporte ao Cliente

Agentes combinam interfaces de chat com integração de ferramentas para acessar dados de clientes, histórico de pedidos, bases de conhecimento e executar ações como reembolsos. Empresas adotaram preços baseados em uso para resoluções bem-sucedidas.

### Tarefas de Codificação

Soluções de código são verificáveis através de testes automatizados, permitindo que agentes iterem. O benchmark SWE-bench Verified demonstra agentes resolvendo problemas reais do GitHub apenas a partir de descrições de pull request.

## Medição e Iteração

Sucesso requer medir desempenho contra métricas claras, depois iterar implementações. Adicione complexidade apenas quando ela demonstravelmente melhora resultados. A abordagem enfatiza construir o "sistema certo para suas necessidades," não o mais sofisticado.
