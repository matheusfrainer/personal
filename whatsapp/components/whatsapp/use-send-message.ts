"use client"

import * as React from "react"
import { toast } from "sonner"

import { isSimulationDisabled } from "@/lib/e2e"
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

import { nextId } from "@/lib/id"

export { nextId }

export function nowTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())
}

/**
 * Sends a message and simulates the other side: delivery receipts tick over,
 * then the contact "types" and answers. Timers are cleared on unmount so a
 * reply never lands after the component is gone.
 */
export function useSendMessage(chat: Chat) {
  const { state, dispatch } = useStore()
  const timers = React.useRef<number[]>([])
  const notify = state.preferences.notifications

  // Read the open chat at fire time, not at send time — the user may have
  // navigated away while the simulated reply was pending.
  const selectedIdRef = React.useRef(state.selectedId)
  React.useEffect(() => {
    selectedIdRef.current = state.selectedId
  }, [state.selectedId])

  React.useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((t) => window.clearTimeout(t))
      pending.length = 0
    }
  }, [])

  const later = React.useCallback((fn: () => void, ms: number) => {
    // Drop the handle once it fires, so a long session doesn't accumulate
    // dead ids. Spliced in place: the unmount cleanup captured this array.
    const id = window.setTimeout(() => {
      const at = timers.current.indexOf(id)
      if (at !== -1) timers.current.splice(at, 1)
      fn()
    }, ms)
    timers.current.push(id)
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
        if (notify && chatId !== selectedIdRef.current) {
          toast(chat.name, { description: reply.text })
        }
      }, 2600)
    },
    [chat.id, chat.isGroup, chat.members, chat.name, dispatch, later, notify, state.replyToId]
  )
}
