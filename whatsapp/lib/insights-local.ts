import {
  crmOf,
  daysUntilBirthday,
  formatCurrency,
  horizonLabels,
  riskProfileLabels,
  stageMeta,
  suitabilityStatus,
} from "./crm"
import { allMessages, messagePreview } from "./data"
import type { InsightMap, InsightSection, SuggestedReply } from "./insights"
import { totalsOf } from "./portfolio"
import type { Chat, Message } from "./types"

/**
 * Heuristic analysis, computed in the browser. Used when no API key is
 * configured and under `?e2e=1`, where a live model would make assertions
 * non-deterministic. Everything here is a count over the transcript — no
 * randomness, so the same conversation always reads the same.
 *
 * It is deliberately narrower than the LLM path: `Message.time` is a bare
 * "HH:MM" with no date, so anything needing real elapsed time (decision
 * latency, month-of-cycle patterns) is left to the model.
 */
export function analyzeLocally(chat: Chat): InsightMap {
  const messages = allMessages(chat).filter(
    (m) => !m.deleted && m.type !== "system"
  )
  const theirs = messages.filter((m) => !m.fromMe)

  return {
    sampled: messages.length,
    sections: [
      communication(chat, messages, theirs),
      decision(chat, theirs),
      ips(chat),
      opportunity(chat, messages),
      actions(chat, messages),
    ],
    suggestions: suggestions(chat, messages),
  }
}

/* -------------------------------------------------------------- helpers -- */

function textOf(messages: Message[]): string {
  return messages.map((m) => messagePreview(m).toLowerCase()).join(" ")
}

function hourOf(time: string): number {
  return Number(time.slice(0, 2))
}

/** The 3-hour window holding most of a contact's messages. */
function busiestWindow(
  messages: Message[]
): { from: number; share: number } | null {
  if (!messages.length) return null
  const buckets = new Array(24).fill(0)
  for (const m of messages) {
    const h = hourOf(m.time)
    if (Number.isFinite(h)) buckets[h] += 1
  }
  let best = { from: 0, count: 0 }
  for (let h = 0; h < 24; h++) {
    const count = buckets[h] + buckets[(h + 1) % 24] + buckets[(h + 2) % 24]
    if (count > best.count) best = { from: h, count }
  }
  return best.count
    ? { from: best.from, share: best.count / messages.length }
    : null
}

function pad(hour: number): string {
  return `${String(hour % 24).padStart(2, "0")}h`
}

/* ------------------------------------------------------------- sections -- */

function communication(
  chat: Chat,
  messages: Message[],
  theirs: Message[]
): InsightSection {
  const items = []
  const window = busiestWindow(theirs)
  if (window) {
    items.push({
      label: "Mais ativa",
      value: `${pad(window.from)} – ${pad(window.from + 3)}`,
      detail: `${Math.round(window.share * 100)}% das mensagens dela`,
    })
  }

  const lengths = theirs
    .filter((m) => m.type === "text")
    .map((m) => messagePreview(m).length)
  if (lengths.length) {
    const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
    items.push({
      label: "Prefere",
      value: avg < 60 ? "mensagens curtas" : "mensagens longas",
      detail: `média de ${avg} caracteres`,
    })
  }

  const audio = theirs.filter((m) => m.type === "audio").length
  if (theirs.length) {
    items.push({
      label: "Canal",
      value: audio > theirs.length / 3 ? "áudio com frequência" : "texto",
      detail: audio ? `${audio} de ${theirs.length} são áudio` : undefined,
    })
  }

  const informal = /😀|😄|😂|kkk|rsrs|👍|🙏|❤️/.test(textOf(theirs))
  if (theirs.length) {
    items.push({
      label: "Tom",
      value: informal ? "informal, usa emoji" : "formal",
    })
  }

  return {
    id: "comunicacao",
    title: "Como falar com ela",
    action: "Use para escolher a hora e o formato da abordagem.",
    items,
  }
}

const OBJECTIONS: { label: string; words: string[] }[] = [
  { label: "preço/taxa", words: ["taxa", "caro", "custo", "desconto"] },
  { label: "risco", words: ["risco", "arriscado", "medo", "perder"] },
  { label: "prazo", words: ["prazo", "liquidez", "resgate", "travado"] },
  {
    label: "tempo",
    words: ["depois", "mais pra frente", "sem tempo", "corrido"],
  },
]

const POSITIVE = [
  "obrigad",
  "perfeito",
  "ótimo",
  "otimo",
  "show",
  "combinado",
  "boa",
  "adorei",
  "🙏",
  "👍",
  "❤️",
]
const NEGATIVE = [
  "problema",
  "erro",
  "atraso",
  "cancelar",
  "caro",
  "infelizmente",
  "não deu",
  "nao deu",
  "receio",
  "😕",
  "😞",
]

function decision(chat: Chat, theirs: Message[]): InsightSection {
  const text = textOf(theirs)
  const items = []

  const found = OBJECTIONS.filter((o) => o.words.some((w) => text.includes(w)))
  items.push({
    label: "Objeções",
    value: found.length
      ? found.map((o) => o.label).join(", ")
      : "nenhuma registrada",
  })

  // Sentiment split across the first and second half of the transcript — a
  // stable contact reads the same on both sides.
  const half = Math.ceil(theirs.length / 2) || 1
  const score = (list: Message[]) => {
    const t = textOf(list)
    return (
      POSITIVE.filter((w) => t.includes(w)).length -
      NEGATIVE.filter((w) => t.includes(w)).length
    )
  }
  const early = score(theirs.slice(0, half))
  const late = score(theirs.slice(half))
  const swing = Math.abs(late - early)
  items.push({
    label: "Humor",
    value:
      swing >= 2
        ? late > early
          ? "melhorando ao longo da conversa"
          : "piorando ao longo da conversa"
        : late + early > 0
          ? "estável, positivo"
          : late + early < 0
            ? "estável, requer atenção"
            : "estável, neutro",
  })

  items.push({
    label: "Etapa atual",
    value: stageMeta[crmOf(chat).stage].label,
  })

  return {
    id: "decisao",
    title: "Como ela decide",
    action: "Use para escolher o momento de propor.",
    items,
    summary:
      "Ritmo de decisão e padrão mensal exigem histórico com data — a análise " +
      "completa fica disponível com a IA conectada.",
  }
}

const PRODUCTS = [
  "cdb",
  "lci",
  "lca",
  "tesouro",
  "fundo",
  "ação",
  "acoes",
  "ações",
  "previdência",
  "previdencia",
  "coe",
  "debênture",
  "debenture",
  "fii",
  "cripto",
  "dólar",
  "dolar",
]

function ips(chat: Chat): InsightSection {
  const crm = crmOf(chat)
  const p = crm.profile
  const items = []

  if (p.objectives.length) {
    items.push({ label: "Objetivos", value: p.objectives.join(", ") })
  }
  if (p.riskProfile) {
    items.push({ label: "Perfil", value: riskProfileLabels[p.riskProfile] })
  }
  if (p.horizon) {
    items.push({ label: "Horizonte", value: horizonLabels[p.horizon] })
  }
  if (p.liquidityNeed) {
    items.push({ label: "Liquidez", value: p.liquidityNeed })
  }
  if (p.restrictions.length) {
    items.push({ label: "Não quer", value: p.restrictions.join(", ") })
  }

  // Declared tolerance vs. what the conversation shows: a conservative
  // profile talking about equities is worth flagging before it becomes a
  // suitability problem.
  const text = textOf(allMessages(chat).filter((m) => !m.fromMe))
  const risky = ["ação", "ações", "acoes", "cripto", "alavanc"].some((w) =>
    text.includes(w)
  )
  const divergence =
    p.riskProfile === "conservador" && risky
      ? "Perfil conservador, mas demonstra interesse em renda variável — revisar suitability antes de ofertar."
      : undefined

  return {
    id: "ips",
    title: "IPS · política de investimento",
    action: "Use para não ofertar contra o que ela já disse que quer.",
    items: items.length
      ? items
      : [{ label: "Sem dados", value: "preencha o perfil na aba Perfil" }],
    summary: divergence,
  }
}

function opportunity(chat: Chat, messages: Message[]): InsightSection {
  const crm = crmOf(chat)
  const totals = totalsOf(chat)
  const items = []

  items.push({
    label: "Sob sua gestão",
    value: formatCurrency(totals.auc),
  })
  items.push({
    label: "Fora da casa",
    value: formatCurrency(totals.pipe),
    detail: totals.netWorth
      ? `${Math.round((totals.pipe / totals.netWorth) * 100)}% do patrimônio`
      : undefined,
  })

  const outside = crm.positions.filter((p) => !p.underManagement)
  if (outside.length) {
    items.push({
      label: "Onde está",
      value: [...new Set(outside.map((p) => p.institution))].join(", "),
    })
  }

  const text = textOf(messages)
  const mentioned = PRODUCTS.filter((p) => text.includes(p))
  if (mentioned.length) {
    items.push({ label: "Já citou", value: [...new Set(mentioned)].join(", ") })
  }

  return {
    id: "oportunidade",
    title: "Onde está a oportunidade",
    action: "Use para decidir o que ofertar na próxima conversa.",
    items,
  }
}

function actions(chat: Chat, messages: Message[]): InsightSection {
  const crm = crmOf(chat)
  const now = new Date()
  const items = []

  const last = messages[messages.length - 1]
  if (last && !last.fromMe) {
    items.push({
      label: "Pendência",
      value: "A última mensagem é dela e ainda não foi respondida",
    })
  }

  // A question of yours with nothing after it is the most common silent drop.
  const unanswered = messages.filter(
    (m, i) =>
      m.fromMe &&
      messagePreview(m).includes("?") &&
      !messages.slice(i + 1).some((n) => !n.fromMe)
  ).length
  if (unanswered) {
    items.push({
      label: "Sem resposta",
      value: `${unanswered} pergunta${unanswered > 1 ? "s" : ""} sua sem retorno`,
    })
  }

  if (crm.profile.birthDate) {
    const days = daysUntilBirthday(crm.profile.birthDate, now)
    if (Number.isFinite(days) && days <= 30) {
      items.push({
        label: "Aniversário",
        value: days === 0 ? "é hoje" : `em ${days} dia${days > 1 ? "s" : ""}`,
      })
    }
  }

  const suitability = suitabilityStatus(crm.profile, now)
  if (suitability && suitability.daysLeft <= 60) {
    items.push({
      label: "Suitability",
      value:
        suitability.daysLeft < 0
          ? "vencida"
          : `vence em ${suitability.daysLeft} dias`,
    })
  }

  if (!crm.profile.npsDate) {
    items.push({ label: "NPS", value: "nunca pesquisado" })
  }

  return {
    id: "acoes",
    title: "O que fazer agora",
    action: "Cada item vira uma ação na Agenda.",
    items: items.length
      ? items
      : [{ label: "Tudo em dia", value: "nenhuma pendência detectada" }],
  }
}

function suggestions(chat: Chat, messages: Message[]): SuggestedReply[] {
  const first = chat.name.split(" ")[0]
  const crm = crmOf(chat)
  const totals = totalsOf(chat)
  const last = messages[messages.length - 1]
  const out: SuggestedReply[] = []

  if (last && !last.fromMe) {
    out.push({
      text: `Recebi sua mensagem, ${first}. Já verifico e te retorno ainda hoje.`,
      rationale: "Ela está esperando resposta",
    })
  }
  if (totals.pipe > 0) {
    out.push({
      text: `${first}, montei uma comparação entre o que você tem hoje e o que consigo entregar aqui. Posso te mostrar essa semana?`,
      rationale: `${formatCurrency(totals.pipe)} fora da casa`,
    })
  }
  if (crm.profile.restrictions.length) {
    out.push({
      text: `${first}, respeitando o que combinamos de evitar ${crm.profile.restrictions[0].toLowerCase()}, separei duas alternativas que se encaixam no seu perfil.`,
      rationale: "Ancora na restrição declarada",
    })
  }
  out.push({
    text: `Oi ${first}, tudo bem? Passando pra saber se você teve tempo de olhar o que enviei.`,
  })

  return out.slice(0, 3)
}
