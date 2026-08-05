"use client"

import * as React from "react"

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

let counter = 0
export function nextId() {
  counter += 1
  return `local-${counter}-${Math.random().toString(36).slice(2, 7)}`
}

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

  React.useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((t) => window.clearTimeout(t))
      pending.length = 0
    }
  }, [])

  const later = React.useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
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
      }, 2600)
    },
    [chat.id, chat.isGroup, chat.members, dispatch, later, state.replyToId]
  )
}
