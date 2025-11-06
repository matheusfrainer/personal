# Começar com Claude - Guia Completo

**URL:** https://docs.claude.com/pt/docs/get-started
**Data de extração:** 2025-11-06

---

## Visão Geral
Este guia ajuda desenvolvedores a fazer sua primeira chamada à API do Claude e construir um assistente simples de pesquisa web.

## Pré-requisitos
- Conta ativa no Console Anthropic
- Chave de API válida das configurações do Console

## Fazendo Sua Primeira Chamada à API

### Passo 1: Configure Sua Chave de API
Obtenha sua chave do Console Claude e configure-a como variável de ambiente:

```bash
export ANTHROPIC_API_KEY='sua-chave-api-aqui'
```

### Passo 2: Execute a Requisição Inicial
Use este comando cURL para criar um assistente básico de pesquisa web:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 1000,
    "messages": [
      {
        "role": "user",
        "content": "What should I search for to find the latest developments in renewable energy?"
      }
    ]
  }'
```

### Resposta Esperada
A API retorna JSON estruturado contendo:
- ID da mensagem e tipo
- Resposta de texto do assistente com recomendações de pesquisa
- Identificador do modelo (claude-sonnet-4-5)
- Métricas de uso de tokens (entrada: 21, saída: 305)

## Próximos Passos

**Explore estes recursos:**

1. **Trabalhando com Mensagens** - Aprenda padrões comuns da API e manipulação de mensagens
2. **Visão Geral de Recursos** - Descubra capacidades avançadas e ferramentas
3. **Client SDKs** - Acesse bibliotecas oficiais da Anthropic
4. **Claude Cookbook** - Notebooks Jupyter interativos com exemplos práticos

A página também referencia modelos disponíveis, informações de preços e documentação abrangente em vários idiomas.
