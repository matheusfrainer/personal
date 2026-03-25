# Retenção zero de dados

> Saiba mais sobre Retenção Zero de Dados (ZDR) para Claude Code no Claude for Enterprise, incluindo escopo, recursos desabilitados e como solicitar ativação.

Retenção Zero de Dados (ZDR) está disponível para Claude Code quando usado através do Claude for Enterprise. Quando ZDR está ativado, prompts e respostas do modelo geradas durante sessões do Claude Code são processadas em tempo real e não são armazenadas pela Anthropic após a resposta ser retornada, exceto quando necessário para cumprir a lei ou combater uso indevido.

ZDR no Claude for Enterprise oferece aos clientes empresariais a capacidade de usar Claude Code com retenção zero de dados e acesso a recursos administrativos:

* Controles de custo por usuário
* Dashboard de [Analytics](/pt/analytics)
* [Configurações gerenciadas pelo servidor](/pt/server-managed-settings)
* Logs de auditoria

ZDR para Claude Code no Claude for Enterprise se aplica apenas à plataforma direta da Anthropic. Para implantações do Claude no AWS Bedrock, Google Vertex AI ou Microsoft Foundry, consulte as políticas de retenção de dados dessas plataformas.

## Escopo do ZDR

ZDR cobre inferência do Claude Code no Claude for Enterprise.

> **Aviso:** ZDR é ativado por organização. Cada nova organização requer que ZDR seja ativado separadamente pela sua equipe de conta da Anthropic. ZDR não se aplica automaticamente a novas organizações criadas sob a mesma conta. Entre em contato com sua equipe de conta para ativar ZDR para qualquer nova organização.

### O que ZDR cobre

ZDR cobre chamadas de inferência do modelo feitas através do Claude Code no Claude for Enterprise. Quando você usa Claude Code em seu terminal, os prompts que você envia e as respostas que Claude gera não são retidas pela Anthropic. Isso se aplica independentemente de qual modelo Claude é usado.

### O que ZDR não cobre

ZDR não se estende aos seguintes itens, mesmo para organizações com ZDR ativado. Esses recursos seguem [políticas padrão de retenção de dados](/pt/data-usage#data-retention):

| Recurso | Detalhes |
| --- | --- |
| Chat no claude.ai | Conversas de chat através da interface web do Claude for Enterprise não são cobertas por ZDR. |
| Cowork | Sessões de Cowork não são cobertas por ZDR. |
| Claude Code Analytics | Não armazena prompts ou respostas do modelo, mas coleta metadados de produtividade como emails de conta e estatísticas de uso. Métricas de contribuição não estão disponíveis para organizações ZDR; o [dashboard de analytics](/pt/analytics) mostra apenas métricas de uso. |
| Gerenciamento de usuários e assentos | Dados administrativos como emails de conta e atribuições de assentos são retidos sob políticas padrão. |
| Integrações de terceiros | Dados processados por ferramentas de terceiros, MCP servers ou outras integrações externas não são cobertos por ZDR. Revise as práticas de tratamento de dados desses serviços independentemente. |

## Recursos desabilitados sob ZDR

Quando ZDR está ativado para uma organização do Claude Code no Claude for Enterprise, certos recursos que requerem armazenamento de prompts ou conclusões são automaticamente desabilitados no nível do backend:

| Recurso | Motivo |
| --- | --- |
| [Claude Code na Web](/pt/claude-code-on-the-web) | Requer armazenamento no servidor do histórico de conversas. |
| [Sessões remotas](/pt/desktop#remote-sessions) do aplicativo Desktop | Requer dados de sessão persistentes que incluem prompts e conclusões. |
| Envio de feedback (`/feedback`) | Enviar feedback envia dados de conversas para a Anthropic. |

Esses recursos são bloqueados no backend independentemente da exibição no lado do cliente. Se você vir um recurso desabilitado no terminal do Claude Code durante a inicialização, tentar usá-lo retorna um erro indicando que as políticas da organização não permitem essa ação.

Recursos futuros também podem ser desabilitados se exigirem armazenamento de prompts ou conclusões.

## Retenção de dados para violações de política

Mesmo com ZDR ativado, a Anthropic pode reter dados quando exigido por lei ou para resolver violações da Política de Uso. Se uma sessão for sinalizada para uma violação de política, a Anthropic pode reter as entradas e saídas associadas por até 2 anos, consistente com a política ZDR padrão da Anthropic.

## Solicitar ZDR

Para solicitar ZDR para Claude Code no Claude for Enterprise, entre em contato com sua equipe de conta da Anthropic. Sua equipe de conta enviará a solicitação internamente, e a Anthropic revisará e ativará ZDR em sua organização após confirmar a elegibilidade. Todas as ações de ativação são registradas em log de auditoria.

Se você está usando ZDR para Claude Code através de chaves de API pay-as-you-go, você pode fazer a transição para Claude for Enterprise para ganhar acesso a recursos administrativos enquanto mantém ZDR para Claude Code. Entre em contato com sua equipe de conta para coordenar a migração.
