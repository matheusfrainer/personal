"use client"

import * as React from "react"
import { toast } from "sonner"

import { dueNow, evaluate } from "@/lib/automation-engine"
import { isSimulationDisabled } from "@/lib/e2e"
import { nextId } from "@/lib/id"
import { useStore } from "@/lib/store"
import type { Message } from "@/lib/types"

const TICK_MS = 60_000

function nowTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/**
 * Evaluates automation triggers and sends what the user already approved.
 *
 * Two deliberate limits. It proposes but never sends on its own — approval
 * happens in Agenda. And it only runs while the tab is open: there is no
 * server here, so an action approved for 15:00 goes out when the app is next
 * open, not at 15:00 sharp. The Agenda says so rather than implying a queue
 * that doesn't exist.
 */
export function useAutomationScheduler() {
  const { state, dispatch } = useStore()
  const stateRef = React.useRef(state)
  React.useEffect(() => {
    stateRef.current = state
  }, [state])

  React.useEffect(() => {
    if (!state.hydrated) return
    // `?e2e=1` keeps the queue empty so specs assert on what they seeded.
    if (isSimulationDisabled()) return

    function tick() {
      const current = stateRef.current
      const now = new Date()

      dispatch({
        type: "SET_PENDING",
        actions: evaluate(current.chats, current.automations, now, nextId),
      })

      const due = dueNow(current.pending, now)
      if (!due.length) return

      for (const action of due) {
        const message = {
          type: "text",
          id: nextId(),
          fromMe: true,
          text: action.message,
          time: nowTime(now),
          status: "sent",
        } as Message
        dispatch({ type: "SEND", chatId: action.chatId, message })
        dispatch({
          type: "LOG_EVENT",
          chatId: action.chatId,
          event: {
            type: "automation",
            label: "Automação enviada",
            detail: action.reason,
          },
        })
      }
      dispatch({ type: "MARK_SENT", ids: due.map((a) => a.id) })
      toast("Automações enviadas", {
        description: `${due.length} mensagem${due.length > 1 ? "s" : ""} aprovada${due.length > 1 ? "s" : ""} saiu agora.`,
      })
    }

    tick()
    const handle = window.setInterval(tick, TICK_MS)
    return () => window.clearInterval(handle)
  }, [dispatch, state.hydrated])
}
