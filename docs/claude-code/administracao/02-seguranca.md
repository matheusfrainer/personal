# Segurança

> Aprenda sobre as proteções de segurança do Claude Code e as melhores práticas para uso seguro.

## Como abordamos a segurança

### Fundação de segurança

A segurança do seu código é fundamental. Claude Code é construído com segurança em seu núcleo, desenvolvido de acordo com o programa de segurança abrangente da Anthropic. Saiba mais e acesse recursos (relatório SOC 2 Type 2, certificado ISO 27001, etc.) no [Anthropic Trust Center](https://trust.anthropic.com).

### Arquitetura baseada em permissões

Claude Code usa permissões somente leitura rigorosas por padrão. Quando ações adicionais são necessárias (editar arquivos, executar testes, executar comandos), Claude Code solicita permissão explícita. Os usuários controlam se devem aprovar ações uma única vez ou permitir automaticamente.

Projetamos Claude Code para ser transparente e seguro. Por exemplo, exigimos aprovação para comandos bash antes de executá-los, dando a você controle direto. Esta abordagem permite que usuários e organizações configurem permissões diretamente.

Para configuração detalhada de permissões, consulte [Permissions](/pt/permissions).

### Proteções integradas

Para mitigar riscos em sistemas agentic:

* **Ferramenta bash em sandbox**: [Sandbox](/pt/sandboxing) comandos bash com isolamento de sistema de arquivos e rede, reduzindo prompts de permissão enquanto mantém a segurança. Ative com `/sandbox` para definir limites onde Claude Code pode trabalhar autonomamente
* **Restrição de acesso de escrita**: Claude Code pode escrever apenas na pasta onde foi iniciado e suas subpastas—não pode modificar arquivos em diretórios pai sem permissão explícita. Embora Claude Code possa ler arquivos fora do diretório de trabalho (útil para acessar bibliotecas do sistema e dependências), operações de escrita são estritamente confinadas ao escopo do projeto, criando um limite de segurança claro
* **Mitigação de fadiga de prompt**: Suporte para lista de permissões de comandos seguros frequentemente usados por usuário, por base de código ou por organização
* **Modo Accept Edits**: Aceitar em lote múltiplas edições enquanto mantém prompts de permissão para comandos com efeitos colaterais

### Responsabilidade do usuário

Claude Code tem apenas as permissões que você concede. Você é responsável por revisar código e comandos propostos quanto à segurança antes da aprovação.

## Proteja-se contra injeção de prompt

Injeção de prompt é uma técnica onde um atacante tenta substituir ou manipular as instruções de um assistente de IA inserindo texto malicioso. Claude Code inclui várias proteções contra esses ataques:

### Proteções principais

* **Sistema de permissões**: Operações sensíveis requerem aprovação explícita
* **Análise com reconhecimento de contexto**: Detecta instruções potencialmente prejudiciais analisando a solicitação completa
* **Sanitização de entrada**: Previne injeção de comando processando entradas do usuário
* **Lista de bloqueio de comandos**: Bloqueia comandos arriscados que buscam conteúdo arbitrário da web como `curl` e `wget` por padrão. Quando explicitamente permitido, esteja ciente das [limitações do padrão de permissão](/pt/permissions#tool-specific-permission-rules)

### Proteções de privacidade

Implementamos várias proteções para proteger seus dados, incluindo:

* Períodos de retenção limitados para informações sensíveis (consulte o [Privacy Center](https://privacy.anthropic.com/en/articles/10023548-how-long-do-you-store-my-data) para saber mais)
* Acesso restrito aos dados de sessão do usuário
* Controle do usuário sobre preferências de treinamento de dados. Usuários consumidores podem alterar suas [configurações de privacidade](https://claude.ai/settings/privacy) a qualquer momento.

Para detalhes completos, consulte nossos [Termos de Serviço Comerciais](https://www.anthropic.com/legal/commercial-terms) (para usuários de Team, Enterprise e API) ou [Termos de Consumidor](https://www.anthropic.com/legal/consumer-terms) (para usuários de Free, Pro e Max) e [Política de Privacidade](https://www.anthropic.com/legal/privacy).

### Proteções adicionais

* **Aprovação de solicitação de rede**: Ferramentas que fazem solicitações de rede requerem aprovação do usuário por padrão
* **Janelas de contexto isoladas**: Web fetch usa uma janela de contexto separada para evitar injetar prompts potencialmente maliciosos
* **Verificação de confiança**: Primeiras execuções de base de código e novos MCP servers requerem verificação de confiança
  * Nota: A verificação de confiança é desabilitada ao executar de forma não interativa com a flag `-p`
* **Detecção de injeção de comando**: Comandos bash suspeitos requerem aprovação manual mesmo se previamente permitidos
* **Correspondência fail-closed**: Comandos não correspondidos padrão para exigir aprovação manual
* **Descrições em linguagem natural**: Comandos bash complexos incluem explicações para compreensão do usuário
* **Armazenamento seguro de credenciais**: Chaves de API e tokens são criptografados. Consulte [Credential Management](/pt/authentication#credential-management)

> **Risco de segurança do WebDAV no Windows**: Ao executar Claude Code no Windows, recomendamos contra ativar WebDAV ou permitir que Claude Code acesse caminhos como `\\*` que podem conter subdiretórios WebDAV. [WebDAV foi descontinuado pela Microsoft](https://learn.microsoft.com/en-us/windows/whats-new/deprecated-features#:~:text=The%20Webclient%20\(WebDAV\)%20service%20is%20deprecated) devido a riscos de segurança. Ativar WebDAV pode permitir que Claude Code dispare solicitações de rede para hosts remotos, contornando o sistema de permissões.

**Melhores práticas para trabalhar com conteúdo não confiável**:

1. Revise comandos sugeridos antes da aprovação
2. Evite canalizar conteúdo não confiável diretamente para Claude
3. Verifique alterações propostas em arquivos críticos
4. Use máquinas virtuais (VMs) para executar scripts e fazer chamadas de ferramentas, especialmente ao interagir com serviços web externos
5. Relate comportamento suspeito com `/bug`

> Embora essas proteções reduzam significativamente o risco, nenhum sistema é completamente imune a todos os ataques. Sempre mantenha boas práticas de segurança ao trabalhar com qualquer ferramenta de IA.

## Segurança do MCP

Claude Code permite que os usuários configurem servidores Model Context Protocol (MCP). A lista de MCP servers permitidos é configurada no seu código-fonte, como parte das configurações do Claude Code que os engenheiros verificam no controle de versão.

Encorajamos escrever seus próprios MCP servers ou usar MCP servers de provedores em que você confia. Você é capaz de configurar permissões do Claude Code para MCP servers. Anthropic não gerencia ou audita nenhum MCP server.

## Segurança do IDE

Consulte [VS Code security and privacy](/pt/vs-code#security-and-privacy) para mais informações sobre como executar Claude Code em um IDE.

## Segurança de execução em nuvem

Ao usar [Claude Code on the web](/pt/claude-code-on-the-web), controles de segurança adicionais estão em vigor:

* **Máquinas virtuais isoladas**: Cada sessão em nuvem é executada em uma VM isolada gerenciada pela Anthropic
* **Controles de acesso à rede**: O acesso à rede é limitado por padrão e pode ser configurado para ser desabilitado ou permitir apenas domínios específicos
* **Proteção de credenciais**: A autenticação é tratada através de um proxy seguro que usa uma credencial com escopo dentro do sandbox, que é então traduzida para seu token de autenticação GitHub real
* **Restrições de branch**: Operações de git push são restritas ao branch de trabalho atual
* **Registro de auditoria**: Todas as operações em ambientes em nuvem são registradas para fins de conformidade e auditoria
* **Limpeza automática**: Ambientes em nuvem são automaticamente encerrados após a conclusão da sessão

Para mais detalhes sobre execução em nuvem, consulte [Claude Code on the web](/pt/claude-code-on-the-web).

[Remote Control](/pt/remote-control) as sessões funcionam de forma diferente: a interface web se conecta a um processo Claude Code em execução em sua máquina local. Toda execução de código e acesso a arquivos permanece local, e os mesmos dados que fluem durante qualquer sessão local do Claude Code viajam através da API Anthropic sobre TLS. Nenhuma VM em nuvem ou sandboxing está envolvido. A conexão usa múltiplas credenciais de curta duração e escopo estreito, cada uma limitada a um propósito específico e expirando independentemente, para limitar o raio de explosão de qualquer credencial comprometida.

## Melhores práticas de segurança

### Trabalhando com código sensível

* Revise todas as alterações sugeridas antes da aprovação
* Use configurações de permissão específicas do projeto para repositórios sensíveis
* Considere usar [devcontainers](/pt/devcontainer) para isolamento adicional
* Audite regularmente suas configurações de permissão com `/permissions`

### Segurança da equipe

* Use [managed settings](/pt/settings#settings-files) para impor padrões organizacionais
* Compartilhe configurações de permissão aprovadas através do controle de versão
* Treine membros da equipe sobre melhores práticas de segurança
* Monitore o uso do Claude Code através de [métricas OpenTelemetry](/pt/monitoring-usage)
* Audite ou bloqueie alterações de configurações durante sessões com [`ConfigChange` hooks](/pt/hooks#configchange)

### Relatando problemas de segurança

Se você descobrir uma vulnerabilidade de segurança no Claude Code:

1. Não a divulgue publicamente
2. Relate-a através do nosso [programa HackerOne](https://hackerone.com/anthropic-vdp/reports/new?type=team&report_type=vulnerability)
3. Inclua etapas detalhadas de reprodução
4. Permita tempo para que abordemos o problema antes da divulgação pública

## Recursos relacionados

* [Sandboxing](/pt/sandboxing) - Isolamento de sistema de arquivos e rede para comandos bash
* [Permissions](/pt/permissions) - Configure permissões e controles de acesso
* [Monitoring usage](/pt/monitoring-usage) - Rastreie e audite a atividade do Claude Code
* [Development containers](/pt/devcontainer) - Ambientes seguros e isolados
* [Anthropic Trust Center](https://trust.anthropic.com) - Certificações de segurança e conformidade
