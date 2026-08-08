import Anthropic from "@anthropic-ai/sdk"

import { crmOf, formatCurrency, stageMeta } from "@/lib/crm"
import { allMessages, messagePreview } from "@/lib/data"
import type { InsightMap } from "@/lib/insights"
import { totalsOf } from "@/lib/portfolio"
import type { Chat } from "@/lib/types"

/**
 * Advisory analysis of one conversation.
 *
 * POST because it takes a transcript in the body and because POST handlers are
 * never cached — a stale reading of a conversation that moved on is worse than
 * no reading. The key stays server-side; the browser only ever sees the result.
 */

const MODEL = "claude-sonnet-5"

/**
 * The contract the panel renders. Passed as a raw JSON Schema rather than
 * through zodOutputFormat: zod isn't a dependency of this project and adding
 * one for a single schema isn't worth it.
 */
const SCHEMA = {
  type: "object",
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            enum: ["comunicacao", "decisao", "ips", "oportunidade", "acoes"],
          },
          title: { type: "string" },
          action: {
            type: "string",
            description: "Uma linha dizendo para que serve esta seção.",
          },
          summary: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
                detail: { type: "string" },
              },
              required: ["label", "value"],
              additionalProperties: false,
            },
          },
        },
        required: ["id", "title", "action", "items"],
        additionalProperties: false,
      },
    },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          rationale: { type: "string" },
        },
        required: ["text"],
        additionalProperties: false,
      },
    },
  },
  required: ["sections", "suggestions"],
  additionalProperties: false,
} as const

/**
 * Stable across every request, so it sits behind a cache breakpoint and the
 * per-chat transcript goes after it.
 */
const SYSTEM = `Você analisa conversas de WhatsApp entre um assessor de investimentos brasileiro e seus contatos, e devolve leituras acionáveis para o trabalho comercial dele.

Produza exatamente cinco seções, nesta ordem:

1. "comunicacao" — Como falar com esta pessoa. Janela de horário em que ela responde, ritmo, preferência por mensagens curtas ou longas, áudio versus texto, formalidade. Serve para escolher a hora e o formato da abordagem.
2. "decisao" — Como esta pessoa decide. Velocidade, objeções que ela repete, estabilidade emocional ao longo da conversa, sinais de quando aceita mais facilmente. Serve para escolher o momento de propor.
3. "ips" — Investment Policy Statement. Consolide o que ela pediu e o que vetou: objetivos, horizonte, necessidade de liquidez, restrições explícitas, e demandas implícitas (o que ela sinalizou sem pedir diretamente). Aponte divergências entre a tolerância a risco declarada e o comportamento observado. Serve para não ofertar contra o que ela já disse que quer.
4. "oportunidade" — Onde está a oportunidade. Patrimônio fora da custódia do assessor, produtos que ela cita, produtos que nunca apareceram, sinais de aporte, apetite demonstrado. Serve para decidir o que ofertar.
5. "acoes" — O que fazer agora. Pendências concretas: perguntas do assessor sem resposta, aniversário próximo, NPS vencido, suitability a vencer, tempo desde o último contato. Serve como lista de tarefas.

Regras:
- Escreva em português do Brasil, direto e sem jargão de consultoria.
- Baseie cada afirmação no que está no histórico ou no cadastro. Não invente fatos, números ou datas.
- Quando não houver evidência para uma leitura, diga isso em vez de especular.
- Cada seção precisa de um campo "action" com uma frase dizendo para que ela serve na prática.
- Em "suggestions", escreva até três mensagens prontas para enviar, na voz do assessor, coerentes com as restrições registradas no IPS.
- Valores em reais no formato brasileiro.`

function buildPrompt(chat: Chat): string {
  const crm = crmOf(chat)
  const totals = totalsOf(chat)
  const messages = allMessages(chat).filter(
    (m) => !m.deleted && m.type !== "system"
  )

  const transcript = messages
    .map(
      (m) =>
        `[${m.time}] ${m.fromMe ? "Assessor" : chat.name}: ${messagePreview(m)}`
    )
    .join("\n")

  const positions = crm.positions
    .map(
      (p) =>
        `- ${p.institution}: ${formatCurrency(p.amount)}${p.product ? ` (${p.product})` : ""} — ${p.underManagement ? "sob gestão do assessor" : "fora da casa"}${p.note ? `. ${p.note}` : ""}`
    )
    .join("\n")

  const profile = crm.profile

  return `## Contato
Nome: ${chat.name}
Etapa do funil: ${stageMeta[crm.stage].label}
Vínculo: ${crm.relationship}${crm.clientSince ? ` (cliente desde ${crm.clientSince})` : ""}
Tags: ${crm.tags.join(", ") || "nenhuma"}
Empresa: ${crm.company ?? "não informada"}

## Carteira
Patrimônio total: ${formatCurrency(totals.netWorth)}
Sob gestão do assessor: ${formatCurrency(totals.auc)}
Fora da casa: ${formatCurrency(totals.pipe)}
${positions || "Nenhuma posição cadastrada."}

## Perfil do investidor
Nascimento: ${profile.birthDate ?? "não informado"}
Profissão: ${profile.profession ?? "não informada"}
Perfil de risco: ${profile.riskProfile ?? "não definido"}
Suitability: ${profile.suitabilityDate ?? "não preenchida"}
Horizonte: ${profile.horizon ?? "não definido"}
Aporte mensal: ${profile.monthlyContribution ? formatCurrency(profile.monthlyContribution) : "não informado"}
Objetivos: ${profile.objectives.join(", ") || "nenhum registrado"}
Restrições: ${profile.restrictions.join(", ") || "nenhuma registrada"}
Liquidez: ${profile.liquidityNeed ?? "não informada"}
Experiência: ${profile.experience ?? "não informada"}
NPS: ${profile.npsScore != null ? `${profile.npsScore}/10 em ${profile.npsDate}` : "nunca pesquisado"}

## Observações do assessor
${crm.notes ?? "nenhuma"}

## Reuniões
${crm.meetings.map((m) => `- ${m.date} · ${m.title}: ${m.summary}`).join("\n") || "nenhuma registrada"}

## Conversa (${messages.length} mensagens)
Hoje é ${new Date().toISOString().slice(0, 10)}.

${transcript || "Sem mensagens."}`
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { ok: false, reason: "ANTHROPIC_API_KEY não configurada" },
      { status: 501 }
    )
  }

  let chat: Chat
  try {
    const body = (await request.json()) as { chat?: Chat }
    if (!body.chat?.id) throw new Error("chat ausente")
    chat = body.chat
  } catch {
    return Response.json(
      { ok: false, reason: "Corpo inválido" },
      { status: 400 }
    )
  }

  const client = new Anthropic()

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      // No temperature/top_p/top_k: a non-default value is a 400 on Sonnet 5.
      // Adaptive thinking is the default when `thinking` is omitted, which is
      // what we want for an analysis task.
      system: [
        {
          type: "text",
          text: SYSTEM,
          // The instructions never change; only the transcript below does.
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: buildPrompt(chat) }],
    })

    if (response.stop_reason === "refusal") {
      return Response.json(
        { ok: false, reason: "Análise recusada pelo modelo" },
        { status: 422 }
      )
    }

    const text = response.content.find((b) => b.type === "text")
    if (!text || text.type !== "text") {
      return Response.json(
        { ok: false, reason: "Resposta vazia" },
        { status: 502 }
      )
    }

    const parsed = JSON.parse(text.text) as Omit<InsightMap, "sampled">
    const data: InsightMap = {
      ...parsed,
      sampled: allMessages(chat).filter(
        (m) => !m.deleted && m.type !== "system"
      ).length,
    }
    return Response.json({ ok: true, data })
  } catch (error) {
    const reason =
      error instanceof Anthropic.APIError
        ? `Erro da API (${error.status})`
        : "Falha ao analisar"
    return Response.json({ ok: false, reason }, { status: 502 })
  }
}
