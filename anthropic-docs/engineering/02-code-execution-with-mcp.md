# Execução de Código com MCP: Construindo Agentes de IA Mais Eficientes

**URL:** https://www.anthropic.com/engineering/code-execution-with-mcp
**Data de publicação:** 2025-11-04
**Data de extração:** 2025-11-06

---

## Visão Geral

Publicado em 4 de novembro de 2025, este artigo de engenharia da Anthropic explora como ambientes de execução de código podem melhorar a eficiência de agentes de IA ao trabalhar com o Model Context Protocol (MCP).

## O Problema: Consumo de Tokens

Duas ineficiências primárias surgem quando agentes se conectam a muitas ferramentas MCP:

### 1. Definições de Ferramentas Sobrecarregam o Contexto

"A maioria dos clientes MCP carrega todas as definições de ferramentas antecipadamente diretamente no contexto, expondo-as ao modelo usando uma sintaxe de chamada de ferramenta direta." Quando agentes se conectam a milhares de ferramentas, eles processam centenas de milhares de tokens antes de abordar requisições de usuários.

### 2. Resultados Intermediários Duplicam Dados

Quando agentes recuperam documentos e os passam entre ferramentas, dados fluem através do contexto do modelo múltiplas vezes. Uma transcrição de 2 horas poderia requerer processar 50.000 tokens extras, potencialmente excedendo limites de janela de contexto.

## A Solução: Execução de Código com MCP

Em vez de chamadas diretas de ferramentas, agentes podem escrever código para interagir com servidores MCP. Esta abordagem envolve:

### Descoberta de Ferramentas Baseada em Sistema de Arquivos

Ferramentas são organizadas em uma estrutura de árvore de arquivos:
```
servers/
├── google-drive/
│   ├── getDocument.ts
│   └── index.ts
├── salesforce/
│   ├── updateRecord.ts
│   └── index.ts
```

Agentes descobrem e carregam apenas definições necessárias explorando o sistema de arquivos, reduzindo uso de tokens de 150.000 para 2.000 tokens—uma economia de 98,7%.

### Exemplo de Implementação

Funções wrapper de ferramentas permitem escrita natural de código:

```typescript
// Ler transcrição e anexar ao lead
const transcript = (await gdrive.getDocument({
  documentId: 'abc123'
})).content;

await salesforce.updateRecord({
  objectType: 'SalesMeeting',
  recordId: '00Q5f000001abcXYZ',
  data: { Notes: transcript }
});
```

## Benefícios-Chave

### Divulgação Progressiva
Modelos navegam sistemas de arquivos eficientemente. Uma função `search_tools` permite que agentes encontrem definições relevantes com níveis de detalhe configuráveis, conservando contexto.

### Processamento Eficiente de Contexto
Agentes filtram grandes conjuntos de dados em código antes de retornar resultados. Uma planilha de 10.000 linhas pode ser filtrada para mostrar apenas pedidos pendentes, prevenindo janelas de contexto inchadas.

### Eficiência de Fluxo de Controle
Loops, condicionais e tratamento de erros ocorrem em código em vez de através de chamadas repetidas ao modelo, reduzindo latência e consumo de tokens.

### Preservação de Privacidade
Resultados intermediários permanecem no ambiente de execução. "O cliente MCP intercepta os dados e tokeniza PII antes de alcançar o modelo," prevenindo dados sensíveis de entrar no contexto do modelo enquanto preserva workflows.

### Persistência de Estado
Agentes salvam progresso em arquivos, permitindo retomada de trabalho. Implementações de código tornam-se "Skills" reutilizáveis para tarefas futuras.

## Considerações Importantes

Execução de código requer sandboxing seguro, limites de recursos e infraestrutura de monitoramento. "Os benefícios da execução de código—custos de token reduzidos, menor latência e composição melhorada de ferramentas—devem ser pesados contra esses custos de implementação."

## Conclusão

MCP fornece suporte de protocolo fundamental para conexões agente-ferramenta. Execução de código aplica padrões estabelecidos de engenharia de software ao design de agentes, permitindo interação eficiente com muitas ferramentas enquanto mantém custos de token mais baixos e tempos de resposta mais rápidos.
