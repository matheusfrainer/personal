"use client"

import * as React from "react"

import { chats as seedChats } from "./data"
import { clearChats, loadChats, saveChats } from "./storage"
import type { Chat, Message, MessageStatus, View } from "./types"

interface State {
  chats: Chat[]
  selectedId: string | null
  view: View
  /** message being replied to, in the selected chat */
  replyToId: string | null
  /** ids selected in multi-select mode */
  selectedMessageIds: string[]
  showArchived: boolean
  /** true once localStorage has been read (client-only) */
  hydrated: boolean
}

export type Action =
  | { type: "HYDRATE"; chats: Chat[] | null }
  | { type: "SELECT_CHAT"; chatId: string | null }
  | { type: "SET_VIEW"; view: View }
  | { type: "SET_SHOW_ARCHIVED"; value: boolean }
  | { type: "SEND"; chatId: string; message: Message }
  | {
      type: "SET_STATUS"
      chatId: string
      messageId: string
      status: MessageStatus
    }
  | { type: "SET_TYPING"; chatId: string; typing: boolean }
  | { type: "REACT"; chatId: string; messageId: string; emoji: string }
  | { type: "DELETE_MESSAGES"; chatId: string; messageIds: string[] }
  | { type: "STAR_MESSAGES"; chatId: string; messageIds: string[] }
  | { type: "PIN_MESSAGE"; chatId: string; messageId: string }
  | { type: "EDIT_MESSAGE"; chatId: string; messageId: string; text: string }
  | { type: "FORWARD"; messages: Message[]; toChatIds: string[]; time: string }
  | { type: "SET_REPLY"; messageId: string | null }
  | { type: "TOGGLE_SELECT"; messageId: string }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_DRAFT"; chatId: string; draft?: string }
  | {
      type: "CHAT_FLAG"
      chatId: string
      flag: "pinned" | "muted" | "archived" | "favourite"
      value: boolean
    }
  | { type: "MARK_UNREAD"; chatId: string }
  | { type: "DELETE_CHAT"; chatId: string }
  | { type: "RESET" }

const initialState: State = {
  chats: seedChats,
  selectedId: null,
  view: "chats",
  replyToId: null,
  selectedMessageIds: [],
  showArchived: false,
  hydrated: false,
}

function updateChat(
  state: State,
  chatId: string,
  fn: (chat: Chat) => Chat
): State {
  return { ...state, chats: state.chats.map((c) => (c.id === chatId ? fn(c) : c)) }
}

function mapMessages(chat: Chat, fn: (m: Message) => Message): Chat {
  return {
    ...chat,
    conversation: chat.conversation.map((day) => ({
      ...day,
      messages: day.messages.map(fn),
    })),
  }
}

/** Append to today's day-group, creating it when the last group is older. */
function appendMessage(chat: Chat, message: Message): Chat {
  const conversation = [...chat.conversation]
  const last = conversation[conversation.length - 1]
  if (last && last.label === "Hoje") {
    conversation[conversation.length - 1] = {
      ...last,
      messages: [...last.messages, message],
    }
  } else {
    conversation.push({ label: "Hoje", messages: [message] })
  }
  return { ...chat, conversation, time: message.time, draft: undefined }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        chats: action.chats ?? state.chats,
        hydrated: true,
      }

    case "SELECT_CHAT":
      return {
        ...state,
        selectedId: action.chatId,
        replyToId: null,
        selectedMessageIds: [],
        chats: action.chatId
          ? state.chats.map((c) =>
              c.id === action.chatId ? { ...c, unread: 0 } : c
            )
          : state.chats,
      }

    case "SET_VIEW":
      return { ...state, view: action.view }

    case "SET_SHOW_ARCHIVED":
      return { ...state, showArchived: action.value }

    case "SEND":
      return {
        ...updateChat(state, action.chatId, (c) =>
          appendMessage(c, action.message)
        ),
        replyToId: null,
      }

    case "SET_STATUS":
      return updateChat(state, action.chatId, (c) =>
        mapMessages(c, (m) =>
          m.id === action.messageId ? { ...m, status: action.status } : m
        )
      )

    case "SET_TYPING":
      return updateChat(state, action.chatId, (c) => ({
        ...c,
        typing: action.typing,
      }))

    case "REACT":
      return updateChat(state, action.chatId, (c) =>
        mapMessages(c, (m) => {
          if (m.id !== action.messageId) return m
          const reactions = [...(m.reactions ?? [])]
          const me = "Você"
          // A user holds at most one reaction: drop any previous one first.
          const cleaned = reactions
            .map((r) => ({ ...r, by: r.by.filter((n) => n !== me) }))
            .filter((r) => r.by.length > 0)
          const existing = reactions.find((r) => r.emoji === action.emoji)
          const hadMine = existing?.by.includes(me)
          if (hadMine) {
            return { ...m, reactions: cleaned.length ? cleaned : undefined }
          }
          const target = cleaned.find((r) => r.emoji === action.emoji)
          if (target) {
            target.by = [...target.by, me]
            return { ...m, reactions: cleaned }
          }
          return { ...m, reactions: [...cleaned, { emoji: action.emoji, by: [me] }] }
        })
      )

    case "DELETE_MESSAGES":
      return {
        ...updateChat(state, action.chatId, (c) =>
          mapMessages(c, (m) =>
            action.messageIds.includes(m.id)
              ? { ...m, deleted: true, reactions: undefined }
              : m
          )
        ),
        selectedMessageIds: [],
      }

    case "STAR_MESSAGES":
      return {
        ...updateChat(state, action.chatId, (c) =>
          mapMessages(c, (m) =>
            action.messageIds.includes(m.id) ? { ...m, starred: !m.starred } : m
          )
        ),
        selectedMessageIds: [],
      }

    case "PIN_MESSAGE":
      return updateChat(state, action.chatId, (c) =>
        mapMessages(c, (m) =>
          m.id === action.messageId
            ? { ...m, pinned: !m.pinned }
            : m.pinned
              ? { ...m, pinned: false } // only one pinned message at a time
              : m
        )
      )

    case "EDIT_MESSAGE":
      return updateChat(state, action.chatId, (c) =>
        mapMessages(c, (m) =>
          m.id === action.messageId && m.type === "text"
            ? { ...m, text: action.text, edited: true }
            : m
        )
      )

    case "FORWARD": {
      let next = state
      for (const chatId of action.toChatIds) {
        for (const [i, message] of action.messages.entries()) {
          const copy: Message = {
            ...message,
            id: `${message.id}-fwd-${chatId}-${i}`,
            fromMe: true,
            author: undefined,
            time: action.time,
            status: "sent",
            forwarded: true,
            reactions: undefined,
            replyToId: undefined,
            starred: false,
            pinned: false,
          }
          next = updateChat(next, chatId, (c) => appendMessage(c, copy))
        }
      }
      return { ...next, selectedMessageIds: [] }
    }

    case "SET_REPLY":
      return { ...state, replyToId: action.messageId }

    case "TOGGLE_SELECT": {
      const has = state.selectedMessageIds.includes(action.messageId)
      return {
        ...state,
        selectedMessageIds: has
          ? state.selectedMessageIds.filter((id) => id !== action.messageId)
          : [...state.selectedMessageIds, action.messageId],
      }
    }

    case "CLEAR_SELECTION":
      return { ...state, selectedMessageIds: [] }

    case "SET_DRAFT":
      return updateChat(state, action.chatId, (c) => ({
        ...c,
        draft: action.draft || undefined,
      }))

    case "CHAT_FLAG":
      return updateChat(state, action.chatId, (c) => ({
        ...c,
        [action.flag]: action.value,
      }))

    case "MARK_UNREAD":
      return {
        ...updateChat(state, action.chatId, (c) => ({
          ...c,
          unread: Math.max(1, c.unread ?? 0),
        })),
        selectedId: state.selectedId === action.chatId ? null : state.selectedId,
      }

    case "DELETE_CHAT":
      return {
        ...state,
        chats: state.chats.filter((c) => c.id !== action.chatId),
        selectedId: state.selectedId === action.chatId ? null : state.selectedId,
      }

    case "RESET":
      clearChats()
      return { ...initialState, chats: seedChats, hydrated: true }

    default:
      return state
  }
}

const StoreContext = React.createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  // Hydrate from localStorage after mount so SSR output stays deterministic.
  React.useEffect(() => {
    dispatch({ type: "HYDRATE", chats: loadChats() })
  }, [])

  // Persist whenever the domain data changes (never before hydrating, or we'd
  // overwrite stored chats with the seed).
  React.useEffect(() => {
    if (!state.hydrated) return
    saveChats(state.chats)
  }, [state.chats, state.hydrated])

  const value = React.useMemo(() => ({ state, dispatch }), [state])

  return <StoreContext value={value}>{children}</StoreContext>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>")
  return ctx
}

/** The currently open chat, or null. */
export function useSelectedChat() {
  const { state } = useStore()
  return state.chats.find((c) => c.id === state.selectedId) ?? null
}
