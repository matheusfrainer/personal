# Claude Code no Google Vertex AI

> Saiba como configurar Claude Code através do Google Vertex AI, incluindo configuração, configuração de IAM e resolução de problemas.

## Pré-requisitos

Antes de configurar Claude Code com Vertex AI, certifique-se de que você tem:

* Uma conta do Google Cloud Platform (GCP) com faturamento ativado
* Um projeto GCP com a API Vertex AI ativada
* Acesso aos modelos Claude desejados (por exemplo, Claude Sonnet 4.6)
* Google Cloud SDK (`gcloud`) instalado e configurado
* Cota alocada na região GCP desejada

> **Nota:** Se você está implantando Claude Code para vários usuários, [fixe suas versões de modelo](#5-fixar-versões-de-modelo) para evitar problemas quando Anthropic lançar novos modelos.

## Configuração de Região

Claude Code pode ser usado com endpoints [globais](https://cloud.google.com/blog/products/ai-machine-learning/global-endpoint-for-claude-models-generally-available-on-vertex-ai) e regionais do Vertex AI.

> **Nota:** Vertex AI pode não suportar os modelos padrão do Claude Code em todas as [regiões](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations#genai-partner-models) ou em [endpoints globais](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-partner-models#supported_models). Você pode precisar mudar para uma região suportada, usar um endpoint regional ou especificar um modelo suportado.

## Configuração

### 1. Ativar a API Vertex AI

Ative a API Vertex AI no seu projeto GCP:

```bash
# Defina seu ID de projeto
gcloud config set project YOUR-PROJECT-ID

# Ativar a API Vertex AI
gcloud services enable aiplatform.googleapis.com
```

### 2. Solicitar acesso ao modelo

Solicite acesso aos modelos Claude no Vertex AI:

1. Navegue até o [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)
2. Procure por modelos "Claude"
3. Solicite acesso aos modelos Claude desejados (por exemplo, Claude Sonnet 4.6)
4. Aguarde a aprovação (pode levar 24-48 horas)

### 3. Configurar credenciais GCP

Claude Code usa autenticação padrão do Google Cloud.

Para mais informações, consulte a [documentação de autenticação do Google Cloud](https://cloud.google.com/docs/authentication).

> **Nota:** Ao autenticar, Claude Code usará automaticamente o ID do projeto da variável de ambiente `ANTHROPIC_VERTEX_PROJECT_ID`. Para substituir isso, defina uma destas variáveis de ambiente: `GCLOUD_PROJECT`, `GOOGLE_CLOUD_PROJECT` ou `GOOGLE_APPLICATION_CREDENTIALS`.

### 4. Configurar Claude Code

Defina as seguintes variáveis de ambiente:

```bash
# Ativar integração Vertex AI
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=global
export ANTHROPIC_VERTEX_PROJECT_ID=YOUR-PROJECT-ID

# Opcional: Desativar prompt caching se necessário
export DISABLE_PROMPT_CACHING=1

# Quando CLOUD_ML_REGION=global, substituir região para modelos não suportados
export VERTEX_REGION_CLAUDE_3_5_HAIKU=us-east5

# Opcional: Substituir regiões para outros modelos específicos
export VERTEX_REGION_CLAUDE_3_5_SONNET=us-east5
export VERTEX_REGION_CLAUDE_3_7_SONNET=us-east5
export VERTEX_REGION_CLAUDE_4_0_OPUS=europe-west1
export VERTEX_REGION_CLAUDE_4_0_SONNET=us-east5
export VERTEX_REGION_CLAUDE_4_1_OPUS=europe-west1
```

[Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) é automaticamente suportado quando você especifica a flag efêmera `cache_control`. Para desativá-lo, defina `DISABLE_PROMPT_CACHING=1`. Para limites de taxa aumentados, entre em contato com o suporte do Google Cloud. Ao usar Vertex AI, os comandos `/login` e `/logout` são desativados, pois a autenticação é tratada através das credenciais do Google Cloud.

### 5. Fixar versões de modelo

> **Aviso:** Fixe versões de modelo específicas para cada implantação. Se você usar aliases de modelo (`sonnet`, `opus`, `haiku`) sem fixar, Claude Code pode tentar usar uma versão de modelo mais recente que não está ativada no seu projeto Vertex AI, quebrando usuários existentes quando Anthropic lançar atualizações.

Defina estas variáveis de ambiente para IDs de modelo Vertex AI específicos:

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5@20251001'
```

Para IDs de modelo atuais e legados, consulte [Visão geral de modelos](https://platform.claude.com/docs/en/about-claude/models/overview). Consulte [Configuração de modelo](/pt/model-config#pin-models-for-third-party-deployments) para a lista completa de variáveis de ambiente.

Claude Code usa estes modelos padrão quando nenhuma variável de fixação está definida:

| Tipo de modelo        | Valor padrão                |
| :-------------------- | :-------------------------- |
| Modelo primário       | `claude-sonnet-4-6`         |
| Modelo pequeno/rápido | `claude-haiku-4-5@20251001` |

Para personalizar modelos ainda mais:

```bash
export ANTHROPIC_MODEL='claude-opus-4-6'
export ANTHROPIC_SMALL_FAST_MODEL='claude-haiku-4-5@20251001'
```

## Configuração de IAM

Atribua as permissões de IAM necessárias:

A função `roles/aiplatform.user` inclui as permissões necessárias:

* `aiplatform.endpoints.predict` - Necessário para invocação de modelo e contagem de tokens

Para permissões mais restritivas, crie uma função personalizada com apenas as permissões acima.

Para detalhes, consulte a [documentação de IAM do Vertex](https://cloud.google.com/vertex-ai/docs/general/access-control).

> **Nota:** Crie um projeto GCP dedicado para Claude Code para simplificar o rastreamento de custos e controle de acesso.

## Janela de contexto de 1M de tokens

Claude Opus 4.6, Sonnet 4.6, Sonnet 4.5 e Sonnet 4 suportam a [janela de contexto de 1M de tokens](https://platform.claude.com/docs/en/build-with-claude/context-windows#1m-token-context-window) no Vertex AI. Claude Code ativa automaticamente a janela de contexto estendida quando você seleciona uma variante de modelo 1M.

Para ativar a janela de contexto de 1M para seu modelo fixado, acrescente `[1m]` ao ID do modelo. Consulte [Fixar modelos para implantações de terceiros](/pt/model-config#pin-models-for-third-party-deployments) para detalhes.

## Resolução de problemas

Se você encontrar problemas de cota:

* Verifique cotas atuais ou solicite aumento de cota através do [Cloud Console](https://cloud.google.com/docs/quotas/view-manage)

Se você encontrar erros "modelo não encontrado" 404:

* Confirme que o modelo está Ativado no [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)
* Verifique se você tem acesso à região especificada
* Se estiver usando `CLOUD_ML_REGION=global`, verifique se seus modelos suportam endpoints globais no [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) em "Recursos suportados". Para modelos que não suportam endpoints globais, faça um dos seguintes:
  * Especifique um modelo suportado via `ANTHROPIC_MODEL` ou `ANTHROPIC_SMALL_FAST_MODEL`, ou
  * Defina um endpoint regional usando variáveis de ambiente `VERTEX_REGION_<MODEL_NAME>`

Se você encontrar erros 429:

* Para endpoints regionais, certifique-se de que o modelo primário e o modelo pequeno/rápido são suportados em sua região selecionada
* Considere mudar para `CLOUD_ML_REGION=global` para melhor disponibilidade

## Recursos adicionais

* [Documentação do Vertex AI](https://cloud.google.com/vertex-ai/docs)
* [Preços do Vertex AI](https://cloud.google.com/vertex-ai/pricing)
* [Cotas e limites do Vertex AI](https://cloud.google.com/vertex-ai/docs/quotas)
