# Claude Code no Amazon Bedrock

> Saiba como configurar Claude Code através do Amazon Bedrock, incluindo configuração, configuração de IAM e resolução de problemas.

## Pré-requisitos

Antes de configurar Claude Code com Bedrock, certifique-se de que você tem:

* Uma conta AWS com acesso ao Bedrock habilitado
* Acesso aos modelos Claude desejados (por exemplo, Claude Sonnet 4.6) no Bedrock
* AWS CLI instalado e configurado (opcional - necessário apenas se você não tiver outro mecanismo para obter credenciais)
* Permissões IAM apropriadas

> **Nota:** Se você está implantando Claude Code para vários usuários, [fixe suas versões de modelo](#4-fixar-versões-de-modelo) para evitar problemas quando a Anthropic lançar novos modelos.

## Configuração

### 1. Enviar detalhes do caso de uso

Os usuários pela primeira vez dos modelos Anthropic são obrigados a enviar detalhes do caso de uso antes de invocar um modelo. Isso é feito uma vez por conta.

1. Certifique-se de que você tem as permissões IAM corretas (veja mais sobre isso abaixo)
2. Navegue até o [console do Amazon Bedrock](https://console.aws.amazon.com/bedrock/)
3. Selecione **Chat/Text playground**
4. Escolha qualquer modelo Anthropic e você será solicitado a preencher o formulário de caso de uso

### 2. Configurar credenciais AWS

Claude Code usa a cadeia de credenciais padrão do AWS SDK. Configure suas credenciais usando um destes métodos:

**Opção A: Configuração da AWS CLI**

```bash
aws configure
```

**Opção B: Variáveis de ambiente (chave de acesso)**

```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token
```

**Opção C: Variáveis de ambiente (perfil SSO)**

```bash
aws sso login --profile=<your-profile-name>

export AWS_PROFILE=your-profile-name
```

**Opção D: Credenciais do AWS Management Console**

```bash
aws login
```

[Saiba mais](https://docs.aws.amazon.com/signin/latest/userguide/command-line-sign-in.html) sobre `aws login`.

**Opção E: Chaves de API do Bedrock**

```bash
export AWS_BEARER_TOKEN_BEDROCK=your-bedrock-api-key
```

As chaves de API do Bedrock fornecem um método de autenticação mais simples sem precisar de credenciais AWS completas. [Saiba mais sobre chaves de API do Bedrock](https://aws.amazon.com/blogs/machine-learning/accelerate-ai-development-with-amazon-bedrock-api-keys/).

#### Configuração avançada de credenciais

Claude Code suporta atualização automática de credenciais para AWS SSO e provedores de identidade corporativa. Adicione estas configurações ao seu arquivo de configurações do Claude Code (veja [Configurações](/pt/settings) para localizações de arquivo).

Quando Claude Code detecta que suas credenciais AWS expiraram (localmente com base em seu timestamp ou quando Bedrock retorna um erro de credencial), ele executará automaticamente seus comandos `awsAuthRefresh` e/ou `awsCredentialExport` configurados para obter novas credenciais antes de tentar novamente a solicitação.

##### Exemplo de configuração

```json
{
  "awsAuthRefresh": "aws sso login --profile myprofile",
  "env": {
    "AWS_PROFILE": "myprofile"
  }
}
```

##### Configurações explicadas

**`awsAuthRefresh`**: Use isso para comandos que modificam o diretório `.aws`, como atualizar credenciais, cache SSO ou arquivos de configuração. A saída do comando é exibida ao usuário, mas entrada interativa não é suportada. Isso funciona bem para fluxos SSO baseados em navegador onde a CLI exibe uma URL ou código e você completa a autenticação no navegador.

**`awsCredentialExport`**: Use apenas se você não puder modificar `.aws` e deve retornar credenciais diretamente. A saída é capturada silenciosamente e não é mostrada ao usuário. O comando deve gerar JSON neste formato:

```json
{
  "Credentials": {
    "AccessKeyId": "value",
    "SecretAccessKey": "value",
    "SessionToken": "value"
  }
}
```

### 3. Configurar Claude Code

Defina as seguintes variáveis de ambiente para habilitar Bedrock:

```bash
# Habilitar integração Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1  # ou sua região preferida

# Opcional: Substituir a região para o modelo pequeno/rápido (Haiku)
export ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION=us-west-2
```

Ao habilitar Bedrock para Claude Code, tenha em mente o seguinte:

* `AWS_REGION` é uma variável de ambiente obrigatória. Claude Code não lê do arquivo de configuração `.aws` para esta configuração.
* Ao usar Bedrock, os comandos `/login` e `/logout` são desabilitados, pois a autenticação é tratada através de credenciais AWS.
* Você pode usar arquivos de configurações para variáveis de ambiente como `AWS_PROFILE` que você não quer vazar para outros processos. Veja [Configurações](/pt/settings) para mais informações.

### 4. Fixar versões de modelo

> **Aviso:** Fixe versões de modelo específicas para cada implantação. Se você usar aliases de modelo (`sonnet`, `opus`, `haiku`) sem fixar, Claude Code pode tentar usar uma versão de modelo mais recente que não está disponível em sua conta Bedrock, quebrando usuários existentes quando a Anthropic lançar atualizações.

Defina estas variáveis de ambiente para IDs de modelo Bedrock específicos:

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```

Estas variáveis usam IDs de perfil de inferência entre regiões (com o prefixo `us.`). Se você usar um prefixo de região diferente ou perfis de inferência de aplicação, ajuste de acordo. Para IDs de modelo atuais e legados, veja [Visão geral de modelos](https://platform.claude.com/docs/en/about-claude/models/overview). Veja [Configuração de modelo](/pt/model-config#pin-models-for-third-party-deployments) para a lista completa de variáveis de ambiente.

Claude Code usa estes modelos padrão quando nenhuma variável de fixação está definida:

| Tipo de modelo        | Valor padrão                                  |
| :-------------------- | :-------------------------------------------- |
| Modelo primário       | `global.anthropic.claude-sonnet-4-6`          |
| Modelo pequeno/rápido | `us.anthropic.claude-haiku-4-5-20251001-v1:0` |

Para personalizar modelos ainda mais, use um destes métodos:

```bash
# Usando ID de perfil de inferência
export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-6'
export ANTHROPIC_SMALL_FAST_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'

# Usando ARN de perfil de inferência de aplicação
export ANTHROPIC_MODEL='arn:aws:bedrock:us-east-2:your-account-id:application-inference-profile/your-model-id'

# Opcional: Desabilitar cache de prompt se necessário
export DISABLE_PROMPT_CACHING=1
```

> **Nota:** [Cache de prompt](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) pode não estar disponível em todas as regiões.

#### Mapear cada versão de modelo para um perfil de inferência

As variáveis de ambiente `ANTHROPIC_DEFAULT_*_MODEL` configuram um perfil de inferência por família de modelo. Se sua organização precisa expor várias versões da mesma família no seletor `/model`, cada uma roteada para seu próprio ARN de perfil de inferência de aplicação, use a configuração `modelOverrides` em seu [arquivo de configurações](/pt/settings#settings-files) em vez disso.

Este exemplo mapeia três versões de Opus para ARNs distintos para que os usuários possam alternar entre elas sem contornar os perfis de inferência de sua organização:

```json
{
  "modelOverrides": {
    "claude-opus-4-6": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-46-prod",
    "claude-opus-4-5-20251101": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-45-prod",
    "claude-opus-4-1-20250805": "arn:aws:bedrock:us-east-2:123456789012:application-inference-profile/opus-41-prod"
  }
}
```

Quando um usuário seleciona uma dessas versões em `/model`, Claude Code chama Bedrock com o ARN mapeado. Versões sem uma substituição voltam para o ID de modelo Bedrock integrado ou qualquer perfil de inferência correspondente descoberto na inicialização. Veja [Substituir IDs de modelo por versão](/pt/model-config#override-model-ids-per-version) para detalhes sobre como as substituições interagem com `availableModels` e outras configurações de modelo.

## Configuração de IAM

Crie uma política de IAM com as permissões necessárias para Claude Code:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowModelAndInferenceProfileAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListInferenceProfiles"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:inference-profile/*",
        "arn:aws:bedrock:*:*:application-inference-profile/*",
        "arn:aws:bedrock:*:*:foundation-model/*"
      ]
    },
    {
      "Sid": "AllowMarketplaceSubscription",
      "Effect": "Allow",
      "Action": [
        "aws-marketplace:ViewSubscriptions",
        "aws-marketplace:Subscribe"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:CalledViaLast": "bedrock.amazonaws.com"
        }
      }
    }
  ]
}
```

Para permissões mais restritivas, você pode limitar o Resource para ARNs de perfil de inferência específicos.

Para detalhes, veja [documentação de IAM do Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html).

> **Nota:** Crie uma conta AWS dedicada para Claude Code para simplificar o rastreamento de custos e controle de acesso.

## AWS Guardrails

[Amazon Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html) permitem que você implemente filtragem de conteúdo para Claude Code. Crie um Guardrail no [console do Amazon Bedrock](https://console.aws.amazon.com/bedrock/), publique uma versão, então adicione os cabeçalhos do Guardrail ao seu [arquivo de configurações](/pt/settings). Habilite inferência entre regiões em seu Guardrail se você estiver usando perfis de inferência entre regiões.

Exemplo de configuração:

```json
{
  "env": {
    "ANTHROPIC_CUSTOM_HEADERS": "X-Amzn-Bedrock-GuardrailIdentifier: your-guardrail-id\nX-Amzn-Bedrock-GuardrailVersion: 1"
  }
}
```

## Resolução de problemas

Se você encontrar problemas de região:

* Verifique disponibilidade de modelo: `aws bedrock list-inference-profiles --region your-region`
* Mude para uma região suportada: `export AWS_REGION=us-east-1`
* Considere usar perfis de inferência para acesso entre regiões

Se você receber um erro "on-demand throughput isn't supported":

* Especifique o modelo como um ID de [perfil de inferência](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)

Claude Code usa a [API Invoke](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModelWithResponseStream.html) do Bedrock e não suporta a API Converse.

## Recursos adicionais

* [Documentação do Bedrock](https://docs.aws.amazon.com/bedrock/)
* [Preços do Bedrock](https://aws.amazon.com/bedrock/pricing/)
* [Perfis de inferência do Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
* [Claude Code no Amazon Bedrock: Guia de Configuração Rápida](https://community.aws/content/2tXkZKrZzlrlu0KfH8gST5Dkppq/claude-code-on-amazon-bedrock-quick-setup-guide)
* [Implementação de Monitoramento do Claude Code (Bedrock)](https://github.com/aws-solutions-library-samples/guidance-for-claude-code-with-amazon-bedrock/blob/main/assets/docs/MONITORING.md)
