import type { Chat } from "./types"

/**
 * The shape both the local heuristics and the LLM produce. Blocks are ordered
 * the way the panel renders them, and every one carries an `action` line —
 * a reading that doesn't tell you what to do with it is trivia.
 */
export interface InsightBlock {
  /** short label, e.g. "Mais ativa" */
  label: string
  /** the reading itself */
  value: string
  /** optional supporting detail */
  detail?: string
}

export interface InsightSection {
  id: "comunicacao" | "decisao" | "ips" | "oportunidade" | "acoes"
  title: string
  /** what this section is for, in one line */
  action: string
  items: InsightBlock[]
  /** free-form paragraph, when the section reads better as prose */
  summary?: string
}

export interface SuggestedReply {
  text: string
  /** why this reply, so it isn't a black box */
  rationale?: string
}

export interface InsightMap {
  sections: InsightSection[]
  suggestions: SuggestedReply[]
  /** how many meaningful messages the analysis saw */
  sampled: number
}

/**
 * Cheap, stable fingerprint of what an analysis was built from. Changing the
 * transcript or the CRM record invalidates the cached result; nothing else
 * does, so switching chats and coming back doesn't spend a request.
 */
export function fingerprint(chat: Chat): string {
  const parts = [
    chat.id,
    String(chat.conversation.reduce((n, d) => n + d.messages.length, 0)),
    chat.updatedAt ? String(chat.updatedAt) : "",
    JSON.stringify(chat.crm ?? {}),
  ].join("|")
  let hash = 0
  for (let i = 0; i < parts.length; i++) {
    hash = (hash * 31 + parts.charCodeAt(i)) | 0
  }
  return hash.toString(36)
}
