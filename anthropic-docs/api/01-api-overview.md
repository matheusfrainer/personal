# Visão Geral da API Claude

**URL:** https://docs.claude.com/en/api/overview
**Data de extração:** 2025-11-06

---

## Acessando a API

A API Claude está disponível através do Console web da Anthropic. Desenvolvedores podem usar o recurso Workbench para testar a API diretamente no navegador e então gerar chaves de API nas Configurações da Conta. Múltiplos workspaces permitem segmentar chaves de API e controlar custos por caso de uso específico.

## Autenticação

Todas as requisições à API Claude requerem um header `x-api-key` contendo sua chave de API. Ao usar Client SDKs, a chave é configurada durante a inicialização do cliente, e o SDK automaticamente a inclui com cada requisição. Integrações diretas com a API devem incluir manualmente este header.

## Tipos de Conteúdo

A API exclusivamente manipula JSON. Corpos de requisição devem ser submetidos como JSON, e respostas são retornadas em formato JSON. O header `content-type: application/json` é obrigatório para requisições. Implementações com SDK tratam isso automaticamente.

## Limites de Tamanho de Requisição

A API impõe tamanhos máximos de requisição:
- **Endpoints padrão** (Messages, Token Counting): 32 MB
- **Batch API**: 256 MB
- **Files API**: 500 MB

Requisições excedendo esses limites retornam um erro 413 `request_too_large`.

## Headers de Resposta

Toda resposta da API inclui:
- `request-id`: Um identificador global único para a requisição
- `anthropic-organization-id`: O ID da organização vinculado à sua chave de API

## Começando

Exemplo de requisição usando curl:

```bash
curl https://api.anthropic.com/v1/messages \
     --header "x-api-key: $ANTHROPIC_API_KEY" \
     --header "anthropic-version: 2023-06-01" \
     --header "content-type: application/json" \
     --data '{
       "model": "claude-sonnet-4-5",
       "max_tokens": 1024,
       "messages": [
         {
           "role": "user",
           "content": "Hello, world"
         }
       ]
     }'
```

Client SDKs para Python e TypeScript estão disponíveis para simplificar a integração.
