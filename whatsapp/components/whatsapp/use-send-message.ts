"use client"

import * as React from "react"
import { toast } from "sonner"

import { isSimulationDisabled } from "@/lib/e2e"
import { nextId } from "@/lib/id"
import { useStore } from "@/lib/store"
import type { Chat, Message } from "@/lib/types"

const REPLIES = [
  "Perfeito! 👍",
  "Boa, combinado então.",
  "Kkkk verdade 😄",
  "Vou verificar e já te falo.",
  "Show, obrigado! 🙏",
  "Entendi, faz total sentido.",
  "Fechou 🤝",
]

export function nowTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())
}

/**
 * Pending simulation timers live at module scope on purpose. The composer is
 * keyed by chat, so tying them to its lifetime cancelled every pending reply
 * the moment you switched conversations — which also made the cross-chat
 * notification unreachable. The store outlives every component here, so
 * dispatching later is safe.
 */
const pendingTimers = new Set<number>()

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    pendingTimers.forEach((t) => window.clearTimeout(t))
    pendingTimers.clear()
  })
}

export function useSendMessage(chat: Chat) {
  const { state, dispatch } = useStore()

  // Both of these are read at fire time, not at send time: while the reply is
  // pending the user may navigate to another chat *or* turn notifications off.
  const selectedIdRef = React.useRef(state.selectedId)
  const notifyRef = React.useRef(state.preferences.notifications)
  React.useEffect(() => {
    selectedIdRef.current = state.selectedId
    notifyRef.current = state.preferences.notifications
  }, [state.selectedId, state.preferences.notifications])

  const later = React.useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      pendingTimers.delete(id)
      fn()
    }, ms)
    pendingTimers.add(id)
  }, [])

  return React.useCallback(
    (payload: Partial<Message> & Pick<Message, "type">) => {
      const chatId = chat.id
      const id = nextId()

      const message = {
        ...payload,
        id,
        fromMe: true,
        time: nowTime(),
        status: "sent",
        replyToId: state.replyToId ?? undefined,
      } as Message

      dispatch({ type: "SEND", chatId, message })

      later(
        () =>
          dispatch({
            type: "SET_STATUS",
            chatId,
            messageId: id,
            status: "delivered",
          }),
        700
      )
      later(
        () =>
          dispatch({ type: "SET_STATUS", chatId, messageId: id, status: "read" }),
        1500
      )
      // The simulated reply is what makes the app feel alive, but its timers
      // and random text make end-to-end tests flaky. `?e2e=1` turns it off so
      // assertions only ever see what the user actually did.
      if (isSimulationDisabled()) return

      later(() => dispatch({ type: "SET_TYPING", chatId, typing: true }), 1200)
      later(() => {
        const author = chat.isGroup
          ? chat.members?.find((m) => m !== "Você" && !m.startsWith("+"))
          : undefined
        const reply: Message = {
          type: "text",
          id: nextId(),
          fromMe: false,
          author,
          text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
          time: nowTime(),
        }
        dispatch({ type: "SET_TYPING", chatId, typing: false })
        dispatch({ type: "SEND", chatId, message: reply })
        // Notify only for chats the user isn't currently looking at, and only
        // when notifications are enabled in Settings.
        if (notifyRef.current && chatId !== selectedIdRef.current) {
          toast(chat.name, { description: reply.text })
        }
      }, 2600)
    },
    [chat.id, chat.isGroup, chat.members, chat.name, dispatch, later, state.replyToId]
  )
}
