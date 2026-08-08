import {
  crmOf,
  daysUntilBirthday,
  isAutomationOn,
  localAutomations,
  renderTemplate,
  suitabilityStatus,
  triggerLabels,
} from "./crm"
import { allMessages, lastMessage, messagePreview } from "./data"
import { totalsOf } from "./portfolio"
import type { AutomationRule, Chat, PendingAction } from "./types"

/** Every rule that applies to a contact: the library plus its own. */
export function automationsFor(
  chat: Chat,
  globals: AutomationRule[]
): { rule: AutomationRule; on: boolean }[] {
  return [
    ...globals.map((rule) => ({ rule, on: isAutomationOn(chat, rule) })),
    ...localAutomations(chat).map((rule) => ({ rule, on: rule.enabled })),
  ]
}

function dayKey(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

/**
 * Days since the chat last saw activity. Seeded chats have no `updatedAt`
 * (their `time` is a free-form label), so they're treated as untouched rather
 * than as "active today" — that's the conservative reading for a reactivation
 * rule, which would otherwise never fire on the sample data.
 */
function daysIdle(chat: Chat, now: Date): number {
  if (!chat.updatedAt) return Number.POSITIVE_INFINITY
  return Math.floor((now.getTime() - chat.updatedAt) / 86_400_000)
}

function daysSince(iso: string, now: Date): number {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return Number.POSITIVE_INFINITY
  return Math.floor(
    (now.getTime() - new Date(y, m - 1, d).getTime()) / 86_400_000
  )
}

/** Whether a rule's trigger currently holds for a contact. */
function fires(rule: AutomationRule, chat: Chat, now: Date): string | null {
  const crm = crmOf(chat)
  const messages = allMessages(chat).filter(
    (m) => !m.deleted && m.type !== "system"
  )
  const last = lastMessage(chat)

  switch (rule.trigger) {
    case "aniversario": {
      if (!crm.profile.birthDate) return null
      return daysUntilBirthday(crm.profile.birthDate, now) === 0
        ? "Aniversário hoje"
        : null
    }
    case "nps": {
      const limit = rule.config.days ?? 180
      if (!crm.profile.npsDate) return "NPS nunca pesquisado"
      const days = daysSince(crm.profile.npsDate, now)
      return days >= limit ? `Último NPS há ${days} dias` : null
    }
    case "suitability": {
      const status = suitabilityStatus(crm.profile, now)
      if (!status) return null
      const limit = rule.config.days ?? 30
      if (status.daysLeft < 0) return "Suitability vencida"
      return status.daysLeft <= limit
        ? `Suitability vence em ${status.daysLeft} dias`
        : null
    }
    case "sem-resposta": {
      const limit = rule.config.days ?? 3
      if (!last?.fromMe) return null
      const idle = daysIdle(chat, now)
      return idle >= limit ? `Sua mensagem sem resposta há ${idle} dias` : null
    }
    case "sem-contato": {
      const limit = rule.config.days ?? 45
      const idle = daysIdle(chat, now)
      return Number.isFinite(idle) && idle >= limit
        ? `Sem contato há ${idle} dias`
        : null
    }
    case "palavra-chave": {
      const keyword = rule.config.keyword?.toLowerCase()
      if (!keyword) return null
      const recent = messages.slice(-6)
      return recent.some((m) =>
        messagePreview(m).toLowerCase().includes(keyword)
      )
        ? `Citou "${rule.config.keyword}"`
        : null
    }
    case "mudanca-etapa": {
      const today = dayKey(now)
      const changed = (chat.crmEvents ?? []).find((e) => e.type === "stage")
      if (!changed) return null
      const when = new Date(changed.at)
      if (dayKey(when) !== today) return null
      if (rule.config.stage && crm.stage !== rule.config.stage) return null
      return changed.label
    }
    case "nova-mensagem": {
      return last && !last.fromMe ? "Mensagem recebida sem resposta" : null
    }
  }
}

/**
 * Proposes the day's actions. Pure and deterministic given (state, now) —
 * nothing is sent from here; every result has to survive the morning review
 * in the Agenda first.
 */
export function evaluate(
  chats: Chat[],
  globals: AutomationRule[],
  now: Date,
  nextId: () => string
): PendingAction[] {
  const day = dayKey(now)
  const out: PendingAction[] = []

  for (const chat of chats) {
    if (chat.archived || chat.isGroup) continue
    const totals = totalsOf(chat)
    for (const { rule, on } of automationsFor(chat, globals)) {
      if (!on) continue
      const reason = fires(rule, chat, now)
      if (!reason) continue
      out.push({
        id: nextId(),
        chatId: chat.id,
        automationId: rule.id,
        reason: `${triggerLabels[rule.trigger]} · ${reason}`,
        message: renderTemplate(rule.message, chat, totals.netWorth),
        scheduledFor: rule.sendAt,
        status: "pending",
        createdAt: now.getTime(),
        day,
      })
    }
  }

  return out
}

/** Actions approved for a time that has already arrived. */
export function dueNow(actions: PendingAction[], now: Date): PendingAction[] {
  const clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  return actions.filter(
    (a) => a.status === "approved" && a.scheduledFor <= clock
  )
}
