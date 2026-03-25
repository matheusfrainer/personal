# Claude Code no Microsoft Foundry

> Saiba como configurar Claude Code através do Microsoft Foundry, incluindo configuração, instalação e resolução de problemas.

## Pré-requisitos

Antes de configurar Claude Code com Microsoft Foundry, certifique-se de que você tem:

* Uma assinatura do Azure com acesso ao Microsoft Foundry
* Permissões RBAC para criar recursos e implantações do Microsoft Foundry
* Azure CLI instalado e configurado (opcional - necessário apenas se você não tiver outro mecanismo para obter credenciais)

## Configuração

### 1. Provisionar recurso do Microsoft Foundry

Primeiro, crie um recurso Claude no Azure:

1. Navegue até o [portal do Microsoft Foundry](https://ai.azure.com/)
2. Crie um novo recurso, anotando o nome do seu recurso
3. Crie implantações para os modelos Claude:
   * Claude Opus
   * Claude Sonnet
   * Claude Haiku

### 2. Configurar credenciais do Azure

Claude Code suporta dois métodos de autenticação para Microsoft Foundry. Escolha o método que melhor se adequa aos seus requisitos de segurança.

**Opção A: Autenticação por chave de API**

1. Navegue até seu recurso no portal do Microsoft Foundry
2. Vá para a seção **Endpoints e chaves**
3. Copie a **Chave de API**
4. Defina a variável de ambiente:

```bash
export ANTHROPIC_FOUNDRY_API_KEY=your-azure-api-key
```

**Opção B: Autenticação do Microsoft Entra ID**

Quando `ANTHROPIC_FOUNDRY_API_KEY` não está definido, Claude Code usa automaticamente a [cadeia de credenciais padrão](https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/credential-chains#defaultazurecredential-overview) do Azure SDK.
Isso suporta uma variedade de métodos para autenticar cargas de trabalho locais e remotas.

Em ambientes locais, você pode usar comumente a Azure CLI:

```bash
az login
```

> **Nota:** Ao usar Microsoft Foundry, os comandos `/login` e `/logout` são desabilitados, pois a autenticação é tratada através de credenciais do Azure.

### 3. Configurar Claude Code

Defina as seguintes variáveis de ambiente para ativar Microsoft Foundry. Observe que os nomes de suas implantações são definidos como identificadores de modelo em Claude Code (pode ser opcional se usar nomes de implantação sugeridos).

```bash
# Ativar integração do Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1

# Nome do recurso do Azure (substitua {resource} pelo nome do seu recurso)
export ANTHROPIC_FOUNDRY_RESOURCE={resource}
# Ou forneça a URL base completa:
# export ANTHROPIC_FOUNDRY_BASE_URL=https://{resource}.services.ai.azure.com

# Defina modelos para os nomes de implantação do seu recurso
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-5'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5'
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-1'
```

Para mais detalhes sobre opções de configuração de modelo, consulte [Configuração de modelo](/pt/model-config).

## Configuração do Azure RBAC

As funções padrão `Azure AI User` e `Cognitive Services User` incluem todas as permissões necessárias para invocar modelos Claude.

Para permissões mais restritivas, crie uma função personalizada com o seguinte:

```json
{
  "permissions": [
    {
      "dataActions": [
        "Microsoft.CognitiveServices/accounts/providers/*"
      ]
    }
  ]
}
```

Para detalhes, consulte [documentação RBAC do Microsoft Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry).

## Resolução de problemas

Se você receber um erro "Failed to get token from azureADTokenProvider: ChainedTokenCredential authentication failed":

* Configure Entra ID no ambiente, ou defina `ANTHROPIC_FOUNDRY_API_KEY`.

## Recursos adicionais

* [Documentação do Microsoft Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/what-is-azure-ai-foundry)
* [Modelos do Microsoft Foundry](https://ai.azure.com/explore/models)
* [Preços do Microsoft Foundry](https://azure.microsoft.com/en-us/pricing/details/ai-foundry/)
