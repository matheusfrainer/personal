"use client"

import * as React from "react"

import { avatarTints, initials } from "@/lib/data"
import { nextId } from "@/lib/id"
import { formatDuration } from "@/lib/media"
import { useStore } from "@/lib/store"
import type { AvatarTint, CallKind } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import { Icon } from "./icon"
import {
  CallEndIcon,
  MicIcon,
  MicOffIcon,
  SpeakerIcon,
  VideoIcon,
  VideoOffIcon,
} from "./icons"

export interface CallTarget {
  chatId: string
  name: string
  tint: AvatarTint
  kind: CallKind
}

const CallContext = React.createContext<{
  start: (target: CallTarget) => void
} | null>(null)

/** Human duration for the history row: "45 s" / "12 min". */
function historyDuration(seconds: number) {
  if (seconds < 60) return `${seconds} s`
  return `${Math.round(seconds / 60)} min`
}

function historyTime() {
  return `Hoje, ${new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())}`
}

/**
 * Simulated call experience: dialling → connected → hung up. There is no
 * media stack behind it, but the states, timer and history entry are real, so
 * the flow actually finishes instead of dead-ending on a decorative button.
 */
export function CallProvider({ children }: { children: React.ReactNode }) {
  const { dispatch } = useStore()
  const [target, setTarget] = React.useState<CallTarget | null>(null)
  const [connected, setConnected] = React.useState(false)
  const [seconds, setSeconds] = React.useState(0)
  const [muted, setMuted] = React.useState(false)
  const [cameraOff, setCameraOff] = React.useState(false)
  const [speaker, setSpeaker] = React.useState(true)

  const start = React.useCallback((next: CallTarget) => {
    setTarget(next)
    setConnected(false)
    setSeconds(0)
    setMuted(false)
    setCameraOff(next.kind === "voice")
    setSpeaker(true)
  }, [])

  // "Ringing" for a moment, then the other side picks up.
  React.useEffect(() => {
    if (!target || connected) return
    const id = window.setTimeout(() => setConnected(true), 2200)
    return () => window.clearTimeout(id)
  }, [target, connected])

  // Call timer.
  React.useEffect(() => {
    if (!connected) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [connected])

  const hangUp = React.useCallback(() => {
    if (!target) return
    // A call that never connected is recorded as unanswered, matching what the
    // history would show in the real app.
    dispatch({
      type: "END_CALL",
      entry: {
        id: nextId("call"),
        chatId: target.chatId,
        name: target.name,
        tint: target.tint,
        kind: target.kind,
        direction: connected ? "outgoing" : "missed",
        time: historyTime(),
        duration: connected ? historyDuration(seconds) : undefined,
      },
    })
    setTarget(null)
    setConnected(false)
    setSeconds(0)
  }, [connected, dispatch, seconds, target])

  // Escape hangs up. Marked handled so the app's global Escape doesn't also
  // close the conversation underneath.
  React.useEffect(() => {
    if (!target) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        hangUp()
      }
    }
    // Capture phase: Shell registers its window listener first (it is a child,
    // so its effect runs earlier), and would otherwise see defaultPrevented as
    // false and close the conversation behind the call.
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [target, hangUp])

  // Focus management. The overlay claims role="dialog" aria-modal, so it has to
  // actually hold focus: move it in on open, trap Tab inside, restore on close.
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const hangUpRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!target) return
    const previous = document.activeElement as HTMLElement | null
    hangUpRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !overlayRef.current) return
      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      previous?.focus?.()
    }
  }, [target])

  const value = React.useMemo(() => ({ start }), [start])

  return (
    <CallContext value={value}>
      {children}
      {target ? (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Chamada com ${target.name}`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-background/95 p-8 backdrop-blur-sm"
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Avatar className="size-28">
              <AvatarFallback
                className={cn("text-3xl font-medium", avatarTints[target.tint])}
              >
                {initials(target.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-heading text-xl">{target.name}</p>
              <p
                className="mt-1 font-mono text-sm text-muted-foreground"
                aria-live="polite"
              >
                {connected ? formatDuration(seconds) : "chamando…"}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {target.kind === "video" ? "Chamada de vídeo" : "Chamada de voz"}
                {" · simulada, sem conexão real"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="icon-lg"
              variant={muted ? "default" : "secondary"}
              className="size-12 rounded-full"
              aria-label={muted ? "Ativar microfone" : "Desativar microfone"}
              aria-pressed={muted}
              onClick={() => setMuted((m) => !m)}
            >
              <Icon icon={muted ? MicOffIcon : MicIcon} className="size-5" />
            </Button>

            {target.kind === "video" ? (
              <Button
                size="icon-lg"
                variant={cameraOff ? "default" : "secondary"}
                className="size-12 rounded-full"
                aria-label={cameraOff ? "Ligar câmera" : "Desligar câmera"}
                aria-pressed={cameraOff}
                onClick={() => setCameraOff((c) => !c)}
              >
                <Icon
                  icon={cameraOff ? VideoOffIcon : VideoIcon}
                  className="size-5"
                />
              </Button>
            ) : null}

            <Button
              size="icon-lg"
              variant={speaker ? "default" : "secondary"}
              className="size-12 rounded-full"
              aria-label="Viva-voz"
              aria-pressed={speaker}
              onClick={() => setSpeaker((s) => !s)}
            >
              <Icon icon={SpeakerIcon} className="size-5" />
            </Button>

            <Button
              size="icon-lg"
              variant="destructive"
              className="size-12 rounded-full bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90"
              ref={hangUpRef}
              aria-label="Encerrar chamada"
              onClick={hangUp}
            >
              <Icon icon={CallEndIcon} className="size-5" />
            </Button>
          </div>
        </div>
      ) : null}
    </CallContext>
  )
}

export function useCall() {
  const ctx = React.useContext(CallContext)
  if (!ctx) throw new Error("useCall must be used inside <CallProvider>")
  return ctx
}
