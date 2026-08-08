"use client"

import * as React from "react"

import {
  automations as seedAutomations,
  calls as seedCalls,
  chats as seedChats,
  communities as seedCommunities,
  insertByTime,
} from "./data"
import { nextId } from "./id"
import { loadState, saveState } from "./storage"
import { crmOf, localAutomations } from "./crm"
import { DEFAULT_MONTHLY_GOAL } from "./types"
import type {
  AutomationRule,
  CallEntry,
  Campaign,
  Chat,
  Community,
  CrmData,
  CrmEvent,
  Message,
  MessageStatus,
  PendingAction,
  View,
} from "./types"

/** Cached LLM analysis, keyed by chat id. */
export interface CachedInsight {
  /** hash of the transcript the analysis was built from */
  hash: string
  generatedAt: number
  /** `true` when produced by the local heuristics rather than the API */
  local: boolean
  data: unknown
}

interface State {
  chats: Chat[]
  /** call history — lives in the store so entries can be added and pruned */
  calls: CallEntry[]
  communities: Community[]
  /** the shared automation library; per-chat rules live on the chat */
  automations: AutomationRule[]
  /** automations waiting on the morning review */
  pending: PendingAction[]
  campaigns: Campaign[]
  /**
   * Monthly funding target in BRL, shown in Carteiras. `null` until hydration
   * — see `initialState` for why a plausible default is worse than none.
   */
  monthlyGoal: number | null
  insights: Record<string, CachedInsight>
  /** contacts the user blocked, by chat id */
  blocked: string[]
  selectedId: string | null
  view: View
  /** message being replied to, in the selected chat */
  replyToId: string | null
  /** message currently being edited */
  editingId: string | null
  /** ids selected in multi-select mode */
  selectedMessageIds: string[]
  showArchived: boolean
  /** user preferences from Settings; these change real behaviour */
  preferences: {
    notifications: boolean
    readReceipts: boolean
    /** whether the client panel column is showing */
    crmPanel: boolean
  }
  /**
   * A reply the AI tab handed to the composer. Transient — never persisted.
   * A fresh object per dispatch, so the composer can compare by identity and
   * apply the same suggestion twice.
   */
  composerSuggestion: { chatId: string; text: string } | null
  /**
   * Contacts handed from a bulk selection to the campaign composer. Transient
   * like the suggestion above — a stale audience surviving a reload would be
   * a nasty way to message the wrong people.
   */
  campaignAudience: string[] | null
  /** true once localStorage has been read (client-only) */
  hydrated: boolean
}

/** The slice of state written to localStorage. */
export interface PersistedState {
  chats: Chat[]
  calls: CallEntry[]
  communities: Community[]
  automations: AutomationRule[]
  pending: PendingAction[]
  campaigns: Campaign[]
  monthlyGoal: number
  insights: Record<string, CachedInsight>
  blocked: string[]
  preferences: State["preferences"]
}

export type Action =
  | { type: "HYDRATE"; state: PersistedState | null }
  | { type: "END_CALL"; entry: CallEntry }
  | { type: "SET_BLOCKED"; chatId: string; value: boolean }
  | {
      type: "SET_PREFERENCE"
      key: keyof State["preferences"]
      value: boolean
    }
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
  | {
      type: "STAR_MESSAGES"
      chatId: string
      messageIds: string[]
      /** explicit target; omit to toggle each message individually */
      value?: boolean
    }
  | { type: "PIN_MESSAGE"; chatId: string; messageId: string }
  | { type: "EDIT_MESSAGE"; chatId: string; messageId: string; text: string }
  | { type: "FORWARD"; messages: Message[]; toChatIds: string[]; time: string }
  | { type: "SET_REPLY"; messageId: string | null }
  | { type: "SET_EDITING"; messageId: string | null }
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
  | {
      type: "SET_CRM"
      chatId: string
      patch: Partial<CrmData>
      /** recorded in the contact's history when present */
      event?: Omit<CrmEvent, "id" | "at">
    }
  | { type: "LOG_EVENT"; chatId: string; event: Omit<CrmEvent, "id" | "at"> }
  | {
      type: "TOGGLE_AUTOMATION"
      chatId: string
      automationId: string
      value: boolean
    }
  | { type: "SAVE_AUTOMATION"; rule: AutomationRule }
  | { type: "DELETE_AUTOMATION"; ruleId: string; chatId?: string }
  /** promotes a contact-local rule into the shared library */
  | {
      type: "PUBLISH_AUTOMATION"
      chatId: string
      ruleId: string
      applyAll: boolean
    }
  | { type: "SET_PENDING"; actions: PendingAction[] }
  | {
      type: "REVIEW_ACTIONS"
      ids: string[]
      status: "approved" | "declined"
    }
  | { type: "EDIT_PENDING"; id: string; message: string }
  | { type: "MARK_SENT"; ids: string[] }
  | { type: "SAVE_CAMPAIGN"; campaign: Campaign }
  | { type: "SET_GOAL"; value: number }
  | { type: "SET_INSIGHT"; chatId: string; insight: CachedInsight }
  | { type: "SUGGEST_TEXT"; chatId: string; text: string }
  | { type: "SET_AUDIENCE"; chatIds: string[] | null }
  | { type: "RESET" }

/**
 * What a first-time visitor gets. Deliberately *not* part of `initialState`:
 * the page is prerendered on the server, which cannot read localStorage, so
 * any domain data in the initial state paints before the truth arrives and
 * then visibly rewrites itself. Keeping the initial state empty means the
 * prerender has nothing localStorage can contradict, and no component has to
 * remember to guard on `hydrated` to avoid leaking the seed.
 */
export const seedState: PersistedState = {
  chats: seedChats,
  calls: seedCalls,
  communities: seedCommunities,
  automations: seedAutomations,
  pending: [],
  campaigns: [],
  monthlyGoal: DEFAULT_MONTHLY_GOAL,
  insights: {},
  blocked: [],
  preferences: { notifications: true, readReceipts: true, crmPanel: true },
}

/**
 * Empty by construction, not by omission. Anything here is rendered by the
 * server, which cannot read localStorage — so a plausible-looking value paints
 * first and rewrites itself once the truth lands. The rule is that a
 * pre-hydration value may only ever cause *less* to render: `null` and `false`
 * can be filled in, a number or a `true` can only be contradicted.
 */
const initialState: State = {
  chats: [],
  calls: [],
  communities: [],
  automations: [],
  pending: [],
  campaigns: [],
  monthlyGoal: null,
  insights: {},
  blocked: [],
  selectedId: null,
  view: "chats",
  replyToId: null,
  editingId: null,
  selectedMessageIds: [],
  showArchived: false,
  preferences: { notifications: false, readReceipts: false, crmPanel: false },
  composerSuggestion: null,
  campaignAudience: null,
  hydrated: false,
}

function updateChat(
  state: State,
  chatId: string,
  fn: (chat: Chat) => Chat
): State {
  return {
    ...state,
    chats: state.chats.map((c) => (c.id === chatId ? fn(c) : c)),
  }
}

/**
 * Appends to the contact's audit log. Newest first, capped — this is a
 * relationship history, not a full event store, and it rides in localStorage.
 */
function withEvent(chat: Chat, event: Omit<CrmEvent, "id" | "at">): Chat {
  const entry: CrmEvent = { ...event, id: nextId(), at: Date.now() }
  return { ...chat, crmEvents: [entry, ...(chat.crmEvents ?? [])].slice(0, 50) }
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

/**
 * Append to today's day-group, creating it when the last group is older. The
 * message lands at its chronological slot rather than at the end: the seed
 * carries fixed clock times, so a message sent earlier in the day than the
 * last seeded one would otherwise show up out of order.
 */
function appendMessage(chat: Chat, message: Message): Chat {
  const conversation = [...chat.conversation]
  const last = conversation[conversation.length - 1]
  if (last && last.label === "Hoje") {
    conversation[conversation.length - 1] = {
      ...last,
      messages: insertByTime(last.messages, message),
    }
  } else {
    conversation.push({ label: "Hoje", messages: [message] })
  }
  // Read the label back off the group — the new message is not necessarily
  // the latest one, so `message.time` would be the wrong list preview.
  const day = conversation[conversation.length - 1]
  const latest = day.messages[day.messages.length - 1]
  return {
    ...chat,
    conversation,
    time: latest.time,
    updatedAt: Date.now(),
    draft: undefined,
  }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        ...(action.state ?? {}),
        hydrated: true,
      }

    case "END_CALL":
      return { ...state, calls: [action.entry, ...state.calls] }

    case "SET_BLOCKED":
      return {
        ...state,
        blocked: action.value
          ? [...new Set([...state.blocked, action.chatId])]
          : state.blocked.filter((id) => id !== action.chatId),
      }

    case "SET_PREFERENCE":
      return {
        ...state,
        preferences: { ...state.preferences, [action.key]: action.value },
      }

    case "SELECT_CHAT":
      return {
        ...state,
        selectedId: action.chatId,
        replyToId: null,
        editingId: null,
        selectedMessageIds: [],
        composerSuggestion: null,
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
          return {
            ...m,
            reactions: [...cleaned, { emoji: action.emoji, by: [me] }],
          }
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
            action.messageIds.includes(m.id)
              ? { ...m, starred: action.value ?? !m.starred }
              : m
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
      return updateChat({ ...state, editingId: null }, action.chatId, (c) =>
        mapMessages(c, (m) =>
          m.id === action.messageId && m.type === "text"
            ? { ...m, text: action.text, edited: true }
            : m
        )
      )

    case "FORWARD": {
      let next = state
      for (const chatId of action.toChatIds) {
        for (const message of action.messages) {
          const copy: Message = {
            ...message,
            // Never derive from the source id — forwarding the same message
            // twice to the same chat would collide.
            id: nextId("fwd"),
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
      return { ...state, replyToId: action.messageId, editingId: null }

    case "SET_EDITING":
      return { ...state, editingId: action.messageId, replyToId: null }

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
        selectedId:
          state.selectedId === action.chatId ? null : state.selectedId,
      }

    case "DELETE_CHAT":
      return {
        ...state,
        chats: state.chats.filter((c) => c.id !== action.chatId),
        // Drop references that would otherwise dangle: a call row pointing at
        // a deleted chat silently does nothing when clicked.
        calls: state.calls.filter((c) => c.chatId !== action.chatId),
        communities: state.communities.map((com) => ({
          ...com,
          groupIds: com.groupIds.filter((id) => id !== action.chatId),
        })),
        blocked: state.blocked.filter((id) => id !== action.chatId),
        selectedId:
          state.selectedId === action.chatId ? null : state.selectedId,
      }

    case "SET_CRM":
      return updateChat(state, action.chatId, (c) => {
        const next = { ...c, crm: { ...crmOf(c), ...action.patch } }
        return action.event ? withEvent(next, action.event) : next
      })

    case "LOG_EVENT":
      return updateChat(state, action.chatId, (c) => withEvent(c, action.event))

    case "TOGGLE_AUTOMATION":
      // Overrides, not a mutation of the rule: a global rule is shared, so
      // toggling it for one contact must not change it for everyone else.
      return updateChat(state, action.chatId, (c) => ({
        ...c,
        automations: localAutomations(c).map((rule) =>
          rule.id === action.automationId
            ? { ...rule, enabled: action.value }
            : rule
        ),
        automationOverrides: {
          ...c.automationOverrides,
          [action.automationId]: action.value,
        },
      }))

    case "SAVE_AUTOMATION": {
      const { rule } = action
      if (rule.scope === "global") {
        const exists = state.automations.some((r) => r.id === rule.id)
        return {
          ...state,
          automations: exists
            ? state.automations.map((r) => (r.id === rule.id ? rule : r))
            : [...state.automations, rule],
        }
      }
      if (!rule.chatId) return state
      return updateChat(state, rule.chatId, (c) => {
        const local = localAutomations(c)
        const exists = local.some((r) => r.id === rule.id)
        return {
          ...c,
          automations: exists
            ? local.map((r) => (r.id === rule.id ? rule : r))
            : [...local, rule],
        }
      })
    }

    case "DELETE_AUTOMATION": {
      if (action.chatId) {
        return updateChat(state, action.chatId, (c) => ({
          ...c,
          automations: localAutomations(c).filter(
            (r) => r.id !== action.ruleId
          ),
        }))
      }
      // Dropping a global rule also clears every contact's override for it,
      // so a re-created rule with the same id doesn't inherit stale opt-outs.
      return {
        ...state,
        automations: state.automations.filter((r) => r.id !== action.ruleId),
        chats: state.chats.map((c) => {
          if (!c.automationOverrides?.[action.ruleId]) return c
          const overrides = { ...c.automationOverrides }
          delete overrides[action.ruleId]
          return { ...c, automationOverrides: overrides }
        }),
        pending: state.pending.filter((p) => p.automationId !== action.ruleId),
      }
    }

    case "PUBLISH_AUTOMATION": {
      const chat = state.chats.find((c) => c.id === action.chatId)
      const rule =
        chat && localAutomations(chat).find((r) => r.id === action.ruleId)
      if (!rule) return state
      const promoted: AutomationRule = {
        ...rule,
        scope: "global",
        chatId: undefined,
        enabled: action.applyAll,
      }
      return {
        ...state,
        automations: [...state.automations, promoted],
        chats: state.chats.map((c) => {
          if (c.id !== action.chatId) {
            // Everyone else inherits the rule's default; only the origin gets
            // an explicit opt-in so publishing never silently disables it.
            return c
          }
          return {
            ...c,
            automations: localAutomations(c).filter(
              (r) => r.id !== action.ruleId
            ),
            automationOverrides: {
              ...c.automationOverrides,
              [promoted.id]: true,
            },
          }
        }),
      }
    }

    case "SET_PENDING": {
      // Keep anything already reviewed today; the engine only proposes.
      const reviewed = new Set(
        state.pending
          .filter((p) => p.status !== "pending")
          .map((p) => `${p.chatId}:${p.automationId}:${p.day}`)
      )
      const fresh = action.actions.filter(
        (p) => !reviewed.has(`${p.chatId}:${p.automationId}:${p.day}`)
      )
      const kept = state.pending.filter((p) => p.status !== "pending")
      return { ...state, pending: [...kept, ...fresh] }
    }

    case "REVIEW_ACTIONS":
      return {
        ...state,
        pending: state.pending.map((p) =>
          action.ids.includes(p.id) ? { ...p, status: action.status } : p
        ),
      }

    case "EDIT_PENDING":
      return {
        ...state,
        pending: state.pending.map((p) =>
          p.id === action.id ? { ...p, message: action.message } : p
        ),
      }

    case "MARK_SENT":
      return {
        ...state,
        pending: state.pending.map((p) =>
          action.ids.includes(p.id) ? { ...p, status: "sent" } : p
        ),
      }

    case "SAVE_CAMPAIGN":
      return { ...state, campaigns: [action.campaign, ...state.campaigns] }

    case "SET_GOAL":
      return { ...state, monthlyGoal: action.value }

    case "SET_INSIGHT":
      return {
        ...state,
        insights: { ...state.insights, [action.chatId]: action.insight },
      }

    case "SUGGEST_TEXT":
      return {
        ...state,
        composerSuggestion: { chatId: action.chatId, text: action.text },
      }

    case "SET_AUDIENCE":
      return { ...state, campaignAudience: action.chatIds }

    // Pure: storage is cleared by the caller, since React may run a reducer
    // more than once for the same action.
    case "RESET":
      return { ...initialState, ...seedState, hydrated: true }

    default:
      return state
  }
}

const StoreContext = React.createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

/**
 * Layout effects run before the browser paints; plain effects run after. The
 * hydrate dispatch has to be the former, or React commits the empty state,
 * paints it, and only then swaps in the real data — one extra frame of visible
 * churn. `useLayoutEffect` doesn't exist on the server, hence the switch.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  // First visit has nothing stored, so it falls back to the seed here rather
  // than in the initial state — see `seedState`.
  useIsomorphicLayoutEffect(() => {
    dispatch({ type: "HYDRATE", state: loadState() ?? seedState })
  }, [])

  // Persist whenever the domain data changes (never before hydrating, or we'd
  // overwrite stored data with the seed).
  const persistable = React.useMemo(
    () => ({
      chats: state.chats,
      calls: state.calls,
      communities: state.communities,
      automations: state.automations,
      pending: state.pending,
      campaigns: state.campaigns,
      // Only reachable after hydration, where the goal is always a number; the
      // fallback exists to satisfy the type, not to introduce a guess.
      monthlyGoal: state.monthlyGoal ?? DEFAULT_MONTHLY_GOAL,
      insights: state.insights,
      blocked: state.blocked,
      preferences: state.preferences,
    }),
    [
      state.chats,
      state.calls,
      state.communities,
      state.automations,
      state.pending,
      state.campaigns,
      state.monthlyGoal,
      state.insights,
      state.blocked,
      state.preferences,
    ]
  )

  const latest = React.useRef(persistable)
  React.useEffect(() => {
    latest.current = persistable
  }, [persistable])

  // Debounced: SET_DRAFT replaces the chat on every keystroke, so an immediate
  // write would serialise every conversation as the user types.
  React.useEffect(() => {
    if (!state.hydrated) return
    const handle = window.setTimeout(() => saveState(persistable), 300)
    return () => window.clearTimeout(handle)
  }, [persistable, state.hydrated])

  // ...but flush before the page goes away, so debouncing never costs data on
  // a reload or tab close that lands inside the window.
  React.useEffect(() => {
    if (!state.hydrated) return
    const flush = () => saveState(latest.current)
    window.addEventListener("pagehide", flush)
    return () => window.removeEventListener("pagehide", flush)
  }, [state.hydrated])

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
