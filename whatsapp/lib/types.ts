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
  unread?: number
  pinned?: boolean
  muted?: boolean
  archived?: boolean
  favourite?: boolean
  typing?: boolean
  /** an unsent draft, previewed in the chat list */
  draft?: string
  conversation: DayGroup[]
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

/** Which primary area the nav rail is showing. */
export type View = "chats" | "calls" | "communities" | "settings"
