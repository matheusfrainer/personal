# Documentação de Cache de Prompts

**URL:** https://docs.claude.com/pt/docs/build-with-claude/prompt-caching
**Data de extração:** 2025-11-06

---

## Visão Geral

Cache de prompts é um recurso que otimiza o uso da API permitindo reutilização de prefixos em cache em prompts. Como a documentação afirma, "reduz significativamente o tempo de processamento e custos para prompts repetitivos ou com elementos consistentes."

## Como Funciona

O sistema opera através de três passos-chave:

1. Verifica se um prefixo de prompt até um checkpoint de cache especificado existe em consultas recentes
2. Usa a versão em cache se encontrada, reduzindo tempo de processamento e custos
3. Caso contrário, processa o prompt completo e armazena o prefixo em cache quando a resposta começa

Esta abordagem se mostra especialmente valiosa para prompts contendo numerosos exemplos, grandes quantidades de contexto, tarefas repetitivas com instruções consistentes, ou conversas multi-turno estendidas.

## Modelos Suportados

Cache de prompts está atualmente disponível em:
- Claude Opus 4.1 e 4
- Claude Sonnet 4.5, 4 e 3.7
- Claude Haiku 4.5, 3.5 e 3
- Claude Opus 3 (descontinuado)

## Estrutura de Preços

O preço introduz um sistema de custo de token em camadas:

| Categoria | Multiplicador de Custo |
|----------|------------------------|
| Escritas de cache (5m) | 1.25x entrada base |
| Escritas de cache (1h) | 2x entrada base |
| Leituras de cache | 0.1x entrada base |
| Tokens de entrada regulares | 1x base |

Por exemplo, preços do Claude Sonnet 4.5 por milhão de tokens:
- Entrada base: $3
- Escritas de cache 5m: $3.75
- Leituras de cache: $0.30

## Requisitos de Implementação

### Limites Mínimos de Tokens

Cache deve atender comprimentos mínimos:
- 1024 tokens: Opus 4.1, modelos Sonnet, Opus 3
- 4096 tokens: Haiku 4.5
- 2048 tokens: Haiku 3.5 e 3

Prompts mais curtos processam sem cache mesmo se marcados com `cache_control`.

### Estrutura Básica

Coloque conteúdo estático (instruções do sistema, definições de ferramentas, contexto, exemplos) no início do prompt. Marque o fim da seção cacheável usando o parâmetro `cache_control` com tipo `"ephemeral"`.

```json
{
  "system": [
    {
      "type": "text",
      "text": "Instruções estáticas aqui",
      "cache_control": {"type": "ephemeral"}
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "Entrada variável do usuário"
    }
  ]
}
```

## Parâmetros de Controle de Cache

### Cache de 5 Minutos (Padrão)

```json
"cache_control": {"type": "ephemeral"}
```

Automaticamente atualizado sem custo adicional quando acessado dentro da janela.

### Cache Estendido de 1 Hora

```json
"cache_control": {
  "type": "ephemeral",
  "ttl": "1h"
}
```

Use para prompts acessados com menos frequência do que a cada 5 minutos mas mais do que de hora em hora.

## Estratégia de Múltiplos Checkpoints

Você pode definir até 4 checkpoints de cache para:
- Cachear diferentes seções atualizadas em frequências variadas
- Manter controle sobre conteúdo especificamente cacheado
- Garantir cache para prefixos excedendo 20 blocos
- Proteger conteúdo editável além da janela de lookback de 20 blocos

### Verificação Automática de Prefixo

O sistema implementa verificação sequencial retroativa do seu checkpoint explícito, verificando até 20 blocos precedentes. Isso significa:

- A maioria dos casos precisa apenas de um marcador de checkpoint final
- Múltiplos checkpoints permitem cache independente de seções frequentemente atualizadas
- O sistema identifica automaticamente o prefixo correspondente mais longo

## O Que Pode Ser Cacheado

Conteúdo cacheável inclui:
- Definições de ferramentas no array `tools`
- Blocos de prompt do sistema
- Conteúdo de texto em `messages.content`
- Imagens e documentos em mensagens do usuário
- Uso de ferramentas e resultados em turnos do assistente

**Limitação notável**: "Blocos de pensamento não podem ser armazenados em cache diretamente com `cache_control`," embora sejam cacheados automaticamente quando aparecem em turnos anteriores do assistente.

## Invalidação de Cache

Modificações invalidam cache naquele nível e todos os níveis subsequentes. Mudanças que acionam invalidação:

| Mudança | Impacto |
|---------|---------|
| Definições de ferramentas | Invalidação completa de cache |
| Alternância de busca web | Perda de cache de sistema e mensagem |
| Adições/remoções de imagens | Perda de cache de mensagem |
| Mudanças de escolha de ferramenta | Perda de cache de mensagem apenas |
| Configurações de pensamento estendido | Perda de cache de mensagem |

## Monitoramento de Desempenho

Rastreie eficácia de cache usando campos de resposta:

- `cache_creation_input_tokens`: Novos tokens escritos em cache
- `cache_read_input_tokens`: Tokens em cache recuperados
- `input_tokens`: Tokens de entrada não cacheados

## Casos de Uso Práticos

### Agentes Conversacionais
Reduza latência e despesas para conversas estendidas com instruções longas ou documentos carregados.

### Processamento de Documentos Grandes
Incorpore materiais longos completos e imagens sem aumentar latência de resposta.

### Conjuntos de Instruções Detalhados
Inclua 20+ exemplos diversos de respostas de alta qualidade, melhorando significativamente o desempenho sobre abordagens típicas de 1-2 exemplos.

### Uso de Ferramentas Agênticas
Melhore desempenho através de múltiplas chamadas de ferramentas e mudanças de código iterativas, onde cada passo tipicamente requer novas chamadas de API.

## Considerações de Pensamento Estendido

Blocos de pensamento são cacheados automaticamente com outro conteúdo ao processar requisições subsequentes. Importante, "quando blocos de pensamento são lidos do cache, eles contam como tokens de entrada" nas métricas de uso. Quando conteúdo de usuário não-resultado-de-ferramenta é adicionado, todos os blocos de pensamento previamente cacheados são removidos do contexto.

## Privacidade de Dados

- Chaves de cache usam hashing criptográfico de prompts até o checkpoint
- Caches são isolados entre organizações—organizações diferentes nunca compartilham caches
- Apenas prompts idênticos acessam entradas específicas em cache
- Seguro para dados sensíveis quando excluindo conteúdo altamente variável

## Melhores Práticas de Otimização

- Posicione conteúdo cacheável no início do prompt
- Use checkpoints estratégicos separando seções atualizadas diferentemente
- Estabeleça endpoints seguindo conteúdo editável para maximizar taxas de acerto
- Analise regularmente taxas de acerto e ajuste estratégia adequadamente
- Exclua elementos altamente variáveis (entrada arbitrária do usuário) do cache

## Solução de Problemas Comuns

Garanta posicionamento consistente de checkpoint através de chamadas, verifique que chamadas ocorrem dentro da janela de cache, mantenha `tool_choice` e uso de imagem consistentes, valide requisitos mínimos de tokens, e adicione checkpoints explícitos para prompts excedendo 20 blocos para garantir cache além daquele limite.
