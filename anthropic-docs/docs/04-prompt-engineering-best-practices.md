# Melhores Práticas de Engenharia de Prompts para Claude 4.x

**URL:** https://docs.claude.com/pt/docs/build-with-claude/prompt-engineering
**Data de extração:** 2025-11-06

---

## Visão Geral
Este guia fornece técnicas para aproveitar os modelos Claude 4.x (especificamente Sonnet 4.5 e Haiku 4.5) efetivamente através de design estratégico de prompt e padrões de instrução.

## Princípios Gerais

### Seja Explícito com Instruções
Os modelos Claude 4.x respondem melhor a instruções claras e diretas. Em vez de assumir compreensão implícita, especifique saídas desejadas com precisão.

**Exemplo de contraste:**
- Menos eficaz: "Crie um painel de análise"
- Mais eficaz: "Crie um painel de análise. Inclua o maior número possível de recursos e interações relevantes. Vá além do básico para criar uma implementação completa."

### Adicione Contexto e Raciocínio
Explicar *por que* um comportamento importa ajuda Claude a entender seus objetivos mais profundamente. "Sua resposta será lida em voz alta por um mecanismo de text-to-speech, então nunca use reticências" fornece raciocínio que Claude pode generalizar além da instrução específica.

### Seja Cuidadoso com Exemplos
Claude 4.x presta muita atenção aos exemplos. Certifique-se de que eles se alinhem com os comportamentos desejados e minimize a demonstração de padrões indesejados.

### Raciocínio de Longo Horizonte e Rastreamento de Estado
Esses modelos se destacam em tarefas de raciocínio estendido com forte gerenciamento de estado. Eles mantêm orientação através de problemas complexos de múltiplas etapas focando no progresso incremental.

## Gerenciamento de Janela de Contexto

### Recursos de Consciência de Contexto
Os modelos Claude 4.5 podem rastrear a capacidade restante da janela de contexto ("orçamento de tokens") durante conversas, permitindo alocação mais inteligente de recursos.

**Adição de prompt recomendada:**
```
Sua janela de contexto será automaticamente compactada conforme se aproxima do limite,
permitindo que você continue trabalhando indefinidamente de onde parou. Portanto,
não pare tarefas cedo devido a preocupações com orçamento de tokens.
```

### Fluxos de Trabalho de Contexto Multi-Janela

1. **Use prompts diferentes para janelas iniciais**: Configure frameworks (testes, scripts de configuração) na primeira janela, depois itere através de listas de tarefas em janelas subsequentes.

2. **Estruture formatos de teste**: Crie testes em formatos estruturados (JSON) antes da implementação, permitindo melhor capacidade de iteração a longo prazo.

3. **Construa ferramentas de qualidade de vida**: Encoraje Claude a criar scripts de configuração que inicializem servidores, executem suítes de teste e executem linters para reduzir trabalho repetido.

4. **Estratégias de gerenciamento de estado**:
   - Use formatos estruturados (JSON) para dados discretos
   - Use texto fluido para notas de progresso
   - Aproveite git para rastreamento de mudanças e checkpoints
   - Enfatize progresso incremental e focado

### Estilo de Comunicação
Claude 4.5 adota um padrão de comunicação mais conciso e natural em comparação com modelos anteriores:
- Relatórios mais diretos e baseados em fatos
- Conversacional e menos mecânico
- Menos verboso; pula resumos desnecessários a menos que solicitado

## Orientação Específica

### Equilíbrio de Verbosidade
Se você quer visibilidade no raciocínio de Claude após o uso de ferramentas, solicite resumos breves: "Após completar uma tarefa que envolve uso de ferramentas, forneça um resumo rápido do trabalho que você fez."

### Padrões de Uso de Ferramentas
Claude 4.5 segue instruções explícitas sobre uso de ferramentas. Ser prescritivo importa:

- **Menos eficaz**: "Pode sugerir algumas mudanças para melhorar esta função?"
- **Mais eficaz**: "Mude esta função para melhorar seu desempenho."

Para encorajar implementação proativa por padrão:
```
Por padrão, implemente mudanças em vez de apenas sugeri-las.
Se a intenção não estiver clara, infira a ação mais útil provável e prossiga,
usando ferramentas para descobrir detalhes faltantes em vez de adivinhar.
```

Alternativamente, para comportamento conservador:
```
Não pule para implementação a menos que claramente instruído. Padrão para fornecer
informações, pesquisa e recomendações em vez de tomar ação.
```

### Controle de Formato de Resposta

1. **Enquadre positivamente**: Em vez de "Não use markdown," tente "Respostas devem ser compostas de parágrafos de prosa fluida."

2. **Use indicadores estilo XML**: "Escreva seções de prosa em tags `<flowing_prose>`."

3. **Corresponda estilo de prompt à saída desejada**: A formatação em seu prompt influencia a formatação da resposta.

4. **Orientação detalhada de markdown** (para markdown mínimo):
```
Ao escrever relatórios, documentos ou explicações técnicas, use prosa clara
e fluida com parágrafos completos. Reserve markdown para código inline,
blocos de código e cabeçalhos simples. Evite excesso de negrito, itálico, listas
e marcadores a menos que sejam itens verdadeiramente discretos ou explicitamente solicitados.
```

### Pesquisa e Coleta de Informações

Para tarefas de pesquisa complexas:
```
Pesquise sistematicamente. À medida que você coleta dados, desenvolva hipóteses
concorrentes e rastreie níveis de confiança em notas de progresso. Atualize uma
árvore de hipóteses ou arquivo de pesquisa regularmente. Divida a tarefa sistematicamente.
```

Esta abordagem estruturada permite que Claude sintetize informações através de grandes conjuntos de informações enquanto autocritica suas descobertas.

### Orquestração de Subagentes
Claude 4.5 demonstra capacidades nativas aprimoradas para delegar a subagentes especializados. Esses modelos reconhecem oportunidades de delegação sem instrução explícita. Para uso conservador de subagentes:
```
Apenas delegue a subagentes quando a tarefa claramente se beneficia de
um agente separado com uma nova janela de contexto.
```

### Auto-Identificação do Modelo
Para aplicações que requerem que Claude se identifique:
```
O assistente é Claude, criado pela Anthropic.
O modelo atual é Claude Sonnet 4.5.
```

Para especificação de string da API:
```
Padrão para Claude Sonnet 4.5 a menos que solicitado de outra forma.
A string exata do modelo é claude-sonnet-4-5-20250929.
```

### Pensamento Estendido e Reflexão
Após receber resultados de ferramentas, Claude se beneficia de reflexão guiada:
```
Após receber resultados de ferramentas, reflita cuidadosamente sobre sua qualidade
e determine os próximos passos ideais antes de prosseguir. Use seu pensamento
para planejar e iterar com base nesta nova informação.
```

### Criação de Documentos e UI
Claude 4.5 se destaca em criar apresentações profissionais, animações e documentos visuais. Encoraje criatividade:
```
Crie uma apresentação profissional sobre [tópico]. Inclua elementos de design
cuidadosos, hierarquia visual e animações envolventes onde apropriado.
```

Para geração excepcional de UI:
```
Não se contenha. Dê tudo de si. Crie uma demonstração impressionante
mostrando capacidades de desenvolvimento web.
```

Especifique direção estética: "Use uma paleta azul escuro e ciano, tipografia sans-serif moderna, layouts baseados em cartões com sombras sutis e micro-interações cuidadosas."

### Execução de Ferramentas em Paralelo
Claude 4.x executa agressivamente chamadas de ferramentas em paralelo. Para máxima eficiência:
```
Se você pretende chamar múltiplas ferramentas e não há dependências,
faça todas as chamadas de ferramentas independentes em paralelo. Priorize execução
simultânea sempre que possível.
```

Para execução sequencial:
```
Execute operações sequencialmente com breves pausas entre cada etapa
para garantir estabilidade.
```

### Melhores Práticas de Codificação Agêntica

**Minimize arquivos temporários**: "Se você criar arquivos temporários para iteração, limpe-os no final."

**Evite foco excessivo em passar testes**: "Implemente soluções de alta qualidade e propósito geral usando ferramentas padrão. Não codifique valores fixos ou crie workarounds. Implemente algoritmos corretos, não apenas lógica que passa testes."

**Minimize alucinações**: "Nunca especule sobre código que você não abriu. Se o usuário referencia um arquivo, você DEVE lê-lo antes de responder. Investigue arquivos relevantes ANTES de responder perguntas sobre a base de código."

## Considerações de Migração

Ao adotar Claude 4.5:

1. **Seja específico sobre comportamento desejado**: Descreva exatamente que saída você quer ver.

2. **Use modificadores de qualidade**: Enquadre instruções para encorajar maior qualidade e detalhe. "Inclua o maior número possível de recursos e interações relevantes. Vá além do básico."

3. **Solicite recursos explicitamente**: Animações e elementos interativos devem ser solicitados quando necessário.

---

Este guia enfatiza que os modelos Claude 4.x respondem melhor a prompts explícitos, contextuais e bem estruturados que fornecem raciocínio claro para comportamentos desejados.
