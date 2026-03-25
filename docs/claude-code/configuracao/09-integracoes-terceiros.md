# Visão geral da implantação empresarial

> Saiba como Claude Code pode se integrar com vários serviços de terceiros e infraestrutura para atender aos requisitos de implantação empresarial.

As organizações podem implantar Claude Code através da Anthropic diretamente ou através de um provedor de nuvem. Esta página ajuda você a escolher a configuração correta.

## Comparar opções de implantação

Para a maioria das organizações, Claude for Teams ou Claude for Enterprise oferece a melhor experiência. Os membros da equipe obtêm acesso tanto a Claude Code quanto a Claude na web com uma única assinatura, faturamento centralizado e nenhuma configuração de infraestrutura necessária.

**Claude for Teams** é de autoatendimento e inclui recursos de colaboração, ferramentas de administração e gerenciamento de faturamento. Melhor para equipes menores que precisam começar rapidamente.

**Claude for Enterprise** adiciona SSO e captura de domínio, permissões baseadas em funções, acesso à API de conformidade e configurações de política gerenciada para implantar configurações de Claude Code em toda a organização. Melhor para organizações maiores com requisitos de segurança e conformidade.

Saiba mais sobre [planos de equipe](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) e [planos empresariais](https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan).

Se sua organização tem requisitos de infraestrutura específicos, compare as opções abaixo:

| Recurso | Claude for Teams/Enterprise | Anthropic Console | Amazon Bedrock | Google Vertex AI | Microsoft Foundry |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Melhor para | Maioria das organizações (recomendado) | Desenvolvedores individuais | Implantações nativas da AWS | Implantações nativas do GCP | Implantações nativas do Azure |
| Faturamento | **Teams:** \$150/assento (Premium) com PAYG disponível / **Enterprise:** [Entre em contato com vendas](https://claude.com/contact-sales?utm_source=claude_code&utm_medium=docs&utm_content=third_party_enterprise) | PAYG | PAYG através da AWS | PAYG através do GCP | PAYG através do Azure |
| Regiões | [Países](https://www.anthropic.com/supported-countries) suportados | [Países](https://www.anthropic.com/supported-countries) suportados | Múltiplas [regiões](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html) da AWS | Múltiplas [regiões](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations) do GCP | Múltiplas [regiões](https://azure.microsoft.com/en-us/explore/global-infrastructure/products-by-region/) do Azure |
| Prompt caching | Ativado por padrão | Ativado por padrão | Ativado por padrão | Ativado por padrão | Ativado por padrão |
| Autenticação | Claude.ai SSO ou email | Chave de API | Chave de API ou credenciais da AWS | Credenciais do GCP | Chave de API ou Microsoft Entra ID |
| Rastreamento de custos | Painel de uso | Painel de uso | AWS Cost Explorer | Faturamento do GCP | Gerenciamento de custos do Azure |
| Inclui Claude na web | Sim | Não | Não | Não | Não |
| Recursos empresariais | Gerenciamento de equipe, SSO, monitoramento de uso | Nenhum | Políticas de IAM, CloudTrail | Funções de IAM, Cloud Audit Logs | Políticas de RBAC, Azure Monitor |

Selecione uma opção de implantação para visualizar as instruções de configuração:

* [Claude for Teams ou Enterprise](/pt/authentication#claude-for-teams-or-enterprise)
* [Anthropic Console](/pt/authentication#claude-console-authentication)
* [Amazon Bedrock](/pt/amazon-bedrock)
* [Google Vertex AI](/pt/google-vertex-ai)
* [Microsoft Foundry](/pt/microsoft-foundry)

## Configurar proxies e gateways

A maioria das organizações pode usar um provedor de nuvem diretamente sem configuração adicional. No entanto, você pode precisar configurar um proxy corporativo ou gateway LLM se sua organização tiver requisitos específicos de rede ou gerenciamento. Estas são configurações diferentes que podem ser usadas juntas:

* **Proxy corporativo**: Roteia o tráfego através de um proxy HTTP/HTTPS. Use isto se sua organização exigir que todo o tráfego de saída passe por um servidor proxy para monitoramento de segurança, conformidade ou aplicação de política de rede. Configure com as variáveis de ambiente `HTTPS_PROXY` ou `HTTP_PROXY`. Saiba mais em [Configuração de rede empresarial](/pt/network-config).
* **Gateway LLM**: Um serviço que fica entre Claude Code e o provedor de nuvem para lidar com autenticação e roteamento. Use isto se você precisar de rastreamento de uso centralizado entre equipes, limitação de taxa personalizada ou orçamentos, ou gerenciamento de autenticação centralizado. Configure com as variáveis de ambiente `ANTHROPIC_BASE_URL`, `ANTHROPIC_BEDROCK_BASE_URL`, ou `ANTHROPIC_VERTEX_BASE_URL`. Saiba mais em [Configuração de gateway LLM](/pt/llm-gateway).

Os exemplos a seguir mostram as variáveis de ambiente a definir no seu shell ou perfil de shell (`.bashrc`, `.zshrc`). Veja [Configurações](/pt/settings) para outros métodos de configuração.

### Amazon Bedrock

#### Proxy corporativo

Rotear o tráfego do Bedrock através do seu proxy corporativo definindo as seguintes [variáveis de ambiente](/pt/env-vars):

```bash
# Ativar Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Configurar proxy corporativo
export HTTPS_PROXY='https://proxy.example.com:8080'
```

#### Gateway LLM

Rotear o tráfego do Bedrock através do seu gateway LLM definindo as seguintes [variáveis de ambiente](/pt/env-vars):

```bash
# Ativar Bedrock
export CLAUDE_CODE_USE_BEDROCK=1

# Configurar gateway LLM
export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # Se o gateway lidar com autenticação da AWS
```

### Microsoft Foundry

#### Proxy corporativo

Rotear o tráfego do Foundry através do seu proxy corporativo definindo as seguintes [variáveis de ambiente](/pt/env-vars):

```bash
# Ativar Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE=your-resource
export ANTHROPIC_FOUNDRY_API_KEY=your-api-key  # Ou omitir para autenticação Entra ID

# Configurar proxy corporativo
export HTTPS_PROXY='https://proxy.example.com:8080'
```

#### Gateway LLM

Rotear o tráfego do Foundry através do seu gateway LLM definindo as seguintes [variáveis de ambiente](/pt/env-vars):

```bash
# Ativar Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1

# Configurar gateway LLM
export ANTHROPIC_FOUNDRY_BASE_URL='https://your-llm-gateway.com'
export CLAUDE_CODE_SKIP_FOUNDRY_AUTH=1  # Se o gateway lidar com autenticação do Azure
```

### Google Vertex AI

#### Proxy corporativo

Rotear o tráfego do Vertex AI através do seu proxy corporativo definindo as seguintes [variáveis de ambiente](/pt/env-vars):

```bash
# Ativar Vertex
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# Configurar proxy corporativo
export HTTPS_PROXY='https://proxy.example.com:8080'
```

#### Gateway LLM

Rotear o tráfego do Vertex AI através do seu gateway LLM definindo as seguintes [variáveis de ambiente](/pt/env-vars):

```bash
# Ativar Vertex
export CLAUDE_CODE_USE_VERTEX=1

# Configurar gateway LLM
export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1  # Se o gateway lidar com autenticação do GCP
```

> **Dica:** Use `/status` em Claude Code para verificar se a configuração do seu proxy e gateway foi aplicada corretamente.

## Melhores práticas para organizações

### Investir em documentação e memória

Recomendamos fortemente investir em documentação para que Claude Code compreenda sua base de código. As organizações podem implantar arquivos CLAUDE.md em múltiplos níveis:

* **Em toda a organização**: Implante em diretórios do sistema como `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) para padrões em toda a empresa
* **Nível de repositório**: Crie arquivos `CLAUDE.md` nas raízes dos repositórios contendo arquitetura do projeto, comandos de compilação e diretrizes de contribuição. Verifique-os no controle de origem para que todos os usuários se beneficiem

Saiba mais em [Memória e arquivos CLAUDE.md](/pt/memory).

### Simplificar a implantação

Se você tiver um ambiente de desenvolvimento personalizado, descobrimos que criar uma maneira "com um clique" de instalar Claude Code é fundamental para aumentar a adoção em toda uma organização.

### Começar com uso orientado

Incentive novos usuários a experimentar Claude Code para perguntas sobre a base de código, ou em correções de bugs menores ou solicitações de recursos. Peça a Claude Code para fazer um plano. Verifique as sugestões de Claude e forneça feedback se estiver fora do caminho. Com o tempo, conforme os usuários entendem melhor esse novo paradigma, eles serão mais eficazes em permitir que Claude Code funcione de forma mais autônoma.

### Fixar versões de modelo para provedores de nuvem

Se você implantar através de [Bedrock](/pt/amazon-bedrock), [Vertex AI](/pt/google-vertex-ai), ou [Foundry](/pt/microsoft-foundry), fixe versões de modelo específicas usando `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, e `ANTHROPIC_DEFAULT_HAIKU_MODEL`. Sem fixação, os aliases de Claude Code resolvem para a versão mais recente, o que pode quebrar usuários quando a Anthropic lança um novo modelo que ainda não está ativado em sua conta. Veja [Configuração de modelo](/pt/model-config#pin-models-for-third-party-deployments) para detalhes.

### Configurar políticas de segurança

As equipes de segurança podem configurar permissões gerenciadas para o que Claude Code é e não é permitido fazer, o que não pode ser substituído pela configuração local. [Saiba mais](/pt/security).

### Aproveitar MCP para integrações

MCP é uma ótima maneira de dar a Claude Code mais informações, como conectar a sistemas de gerenciamento de tickets ou logs de erro. Recomendamos que uma equipe central configure servidores MCP e verifique uma configuração `.mcp.json` na base de código para que todos os usuários se beneficiem. [Saiba mais](/pt/mcp).

Na Anthropic, confiamos em Claude Code para potencializar o desenvolvimento em todas as bases de código da Anthropic. Esperamos que você aproveite usar Claude Code tanto quanto nós.

## Próximas etapas

Depois de escolher uma opção de implantação e configurar o acesso para sua equipe:

1. **Implante em sua equipe**: Compartilhe instruções de instalação e peça aos membros da equipe para [instalar Claude Code](/pt/setup) e autenticar com suas credenciais.
2. **Configurar configuração compartilhada**: Crie um [arquivo CLAUDE.md](/pt/memory) em seus repositórios para ajudar Claude Code a compreender sua base de código e padrões de codificação.
3. **Configurar permissões**: Revise [configurações de segurança](/pt/security) para definir o que Claude Code pode e não pode fazer em seu ambiente.
