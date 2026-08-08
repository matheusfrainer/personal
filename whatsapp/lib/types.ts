export type MessageStatus = "pending" | "sent" | "delivered" | "read"

/** A single emoji reaction and who reacted with it. "Você" = current user. */
export interface Reaction {
  emoji: string
  by: string[]
}

interface MessageBase {
  id: string
  /** true when sent by the current user */
  fromMe: boolean
  /** sender name, used for incoming group messages */
  author?: string
  /** display time, e.g. "09:42" */
  time: string
  /** delivery status, only meaningful for outgoing messages */
  status?: MessageStatus
  /** id of the message this one replies to */
  replyToId?: string
  reactions?: Reaction[]
  starred?: boolean
  pinned?: boolean
  forwarded?: boolean
  edited?: boolean
  /** tombstone — renders as "Esta mensagem foi apagada" */
  deleted?: boolean
}

export interface TextMessage extends MessageBase {
  type: "text"
  text: string
}

export interface ImageMessage extends MessageBase {
  type: "image"
  /** data URI, kept inline so the app needs no network */
  url: string
  caption?: string
}

export interface VideoMessage extends MessageBase {
  type: "video"
  url: string
  /** seconds */
  duration: number
  caption?: string
}

export interface AudioMessage extends MessageBase {
  type: "audio"
  /** seconds */
  duration: number
  /** bar heights, 0..1 */
  waveform: number[]
  /** true for a recorded voice note (vs. a music file) */
  voice?: boolean
}

export interface DocumentMessage extends MessageBase {
  type: "document"
  filename: string
  /** human readable, e.g. "1,2 MB" */
  size: string
  pages?: number
  ext: string
}

export interface StickerMessage extends MessageBase {
  type: "sticker"
  emoji: string
}

export interface LocationMessage extends MessageBase {
  type: "location"
  label: string
  address: string
}

export interface ContactMessage extends MessageBase {
  type: "contact"
  contactName: string
  phone: string
}

/** Centered, non-bubble notice: "Você criou o grupo", "Fulano entrou"… */
export interface SystemMessage extends MessageBase {
  type: "system"
  text: string
}

export type Message =
  | TextMessage
  | ImageMessage
  | VideoMessage
  | AudioMessage
  | DocumentMessage
  | StickerMessage
  | LocationMessage
  | ContactMessage
  | SystemMessage

/** Messages sharing a date, rendered under a centered date marker. */
export interface DayGroup {
  /** "Hoje", "Ontem" or a date */
  label: string
  messages: Message[]
}

export type AvatarTint = "neutral" | "zinc" | "slate" | "stone" | "gray"

export interface Chat {
  id: string
  name: string
  tint: AvatarTint
  isGroup?: boolean
  /** header subtitle for 1:1 chats */
  presence?: string
  phone?: string
  about?: string
  /** group members, shown in the header and info panel */
  members?: string[]
  online?: boolean
  /** last-activity label shown in the chat list */
  time: string
  /**
   * Epoch ms of the last message, used to float active chats to the top.
   * Absent on seeded chats, whose `time` is a free-form label ("Ontem",
   * "12/07") and therefore useless as a sort key.
   */
  updatedAt?: number
  unread?: number
  pinned?: boolean
  muted?: boolean
  archived?: boolean
  favourite?: boolean
  typing?: boolean
  /** an unsent draft, previewed in the chat list */
  draft?: string
  conversation: DayGroup[]
  /** advisory CRM record shown in the client panel */
  crm?: CrmData
  /** audit log of things that never appear in the transcript */
  crmEvents?: CrmEvent[]
  /** automations that belong to this contact alone */
  automations?: AutomationRule[]
  /** opt-in/out of the global automation library, keyed by rule id */
  automationOverrides?: Record<string, boolean>
}

/**
 * Prospecting funnel. Deliberately separate from `Relationship`: a client can
 * be in a fresh funnel for assets still held elsewhere.
 */
export type PipelineStage =
  "novo" | "contato" | "reuniao" | "proposta" | "abertura"

export type Relationship = "lead" | "cliente" | "inativo" | "perdido"

/**
 * One holding. `underManagement` is the line between assets you already
 * custody and the ones that are still someone else's — that difference is
 * the whole point of the pipe number.
 */
export interface Position {
  id: string
  institution: string
  amount: number
  product?: string
  note?: string
  underManagement: boolean
}

export type RiskProfile = "conservador" | "moderado" | "arrojado"
export type Horizon = "curto" | "medio" | "longo"
export type Experience = "iniciante" | "intermediario" | "experiente"

/** What an advisor is expected to collect in a suitability interview. */
export interface InvestorProfile {
  /** ISO date — drives the birthday automation */
  birthDate?: string
  profession?: string
  riskProfile?: RiskProfile
  /** ISO date of the last suitability form; expires after 24 months */
  suitabilityDate?: string
  horizon?: Horizon
  monthlyContribution?: number
  objectives: string[]
  /** the core of the IPS: what the investor refuses to hold */
  restrictions: string[]
  liquidityNeed?: string
  experience?: Experience
  dependents?: number
  /** ISO date of the last NPS survey */
  npsDate?: string
  npsScore?: number
}

export interface MeetingNote {
  id: string
  /** ISO date */
  date: string
  title: string
  summary: string
  actionItems: string[]
}

export type CrmEventType =
  "stage" | "position" | "automation" | "meeting" | "campaign" | "profile"

export interface CrmEvent {
  id: string
  /** epoch ms */
  at: number
  type: CrmEventType
  label: string
  detail?: string
}

export interface CrmData {
  stage: PipelineStage
  relationship: Relationship
  /** ISO date the contact became a client */
  clientSince?: string
  tags: string[]
  /** who owns the relationship internally */
  owner?: string
  email?: string
  company?: string
  positions: Position[]
  /** declared total, for investors who won't disclose every holding */
  declaredNetWorth?: number
  profile: InvestorProfile
  /** free-form observations that don't fit a field */
  notes?: string
  meetings: MeetingNote[]
}

export type AutomationTrigger =
  | "sem-resposta"
  | "palavra-chave"
  | "nova-mensagem"
  | "mudanca-etapa"
  | "aniversario"
  | "nps"
  | "suitability"
  | "sem-contato"

export interface AutomationConfig {
  days?: number
  keyword?: string
  stage?: PipelineStage
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  config: AutomationConfig
  /** template supporting {primeiro_nome}, {patrimonio} and {etapa} */
  message: string
  /** "HH:MM" — when an approved action goes out */
  sendAt: string
  scope: "global" | "local"
  /** set when scope is "local" */
  chatId?: string
  /** for global rules this is the default applied to contacts with no override */
  enabled: boolean
  /** display label of the last run, e.g. "Ontem, 14:02" */
  lastRun?: string
}

export type ActionStatus = "pending" | "approved" | "declined" | "sent"

/**
 * A queued automation waiting on the morning review. The engine only ever
 * proposes; nothing reaches a contact without passing through here.
 */
export interface PendingAction {
  id: string
  chatId: string
  automationId: string
  /** why it fired, e.g. "Aniversário hoje" */
  reason: string
  /** already rendered from the rule's template */
  message: string
  /** "HH:MM" */
  scheduledFor: string
  status: ActionStatus
  createdAt: number
  /** YYYY-MM-DD, so a rule fires at most once per contact per day */
  day: string
}

export interface Campaign {
  id: string
  name: string
  message: string
  /** chat ids the campaign was sent to */
  recipients: string[]
  sentAt?: number
  createdAt: number
}

/**
 * Call or meeting transcript. Not yet produced anywhere — the shape lands now
 * so the upcoming transcription feature doesn't force another storage
 * migration, and it mirrors MeetingNote's summary/actionItems on purpose.
 */
export interface MeetingTranscript {
  id: string
  chatId: string
  /** ISO date */
  date: string
  kind: "video" | "voz" | "presencial"
  durationMin: number
  text: string
  summary?: string
  actionItems?: string[]
}

export type CallKind = "voice" | "video"
export type CallDirection = "incoming" | "outgoing" | "missed"

export interface CallEntry {
  id: string
  chatId: string
  name: string
  tint: AvatarTint
  kind: CallKind
  direction: CallDirection
  time: string
  /** e.g. "12 min" — absent for missed calls */
  duration?: string
}

export interface Community {
  id: string
  name: string
  tint: AvatarTint
  description: string
  members: number
  /** ids of chats that belong to this community */
  groupIds: string[]
  announcements: { id: string; author: string; text: string; time: string }[]
}

/** Areas that keep the list + conversation + client panel layout. */
export type ConversationView = "chats" | "calls" | "communities" | "settings"

/** Areas that take over the full width — a kanban or a table needs it. */
export type WorkspaceView = "funil" | "carteiras" | "agenda" | "automacoes"

/** Which primary area the nav rail is showing. */
export type View = ConversationView | WorkspaceView

/**
 * Monthly funding target in BRL for a store with nothing persisted. Lives here
 * rather than in the store because `storage.ts` needs it too, and importing a
 * value from the store into storage would close a cycle.
 */
export const DEFAULT_MONTHLY_GOAL = 500_000

export const WORKSPACE_VIEWS: WorkspaceView[] = [
  "funil",
  "carteiras",
  "agenda",
  "automacoes",
]

export function isWorkspaceView(view: View): view is WorkspaceView {
  return (WORKSPACE_VIEWS as View[]).includes(view)
}
