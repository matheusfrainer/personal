"use client"

import { avatarTints, initials } from "@/lib/data"
import { useStore } from "@/lib/store"
import type { CallEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useCall } from "./call-overlay"
import { Icon } from "./icon"
import {
  CallIncomingIcon,
  CallMissedIcon,
  CallOutgoingIcon,
  PhoneIcon,
  VideoIcon,
} from "./icons"

function directionIcon(direction: CallEntry["direction"]) {
  if (direction === "incoming") return CallIncomingIcon
  if (direction === "outgoing") return CallOutgoingIcon
  return CallMissedIcon
}

function directionLabel(entry: CallEntry) {
  if (entry.direction === "missed") return "Perdida"
  return entry.direction === "incoming" ? "Recebida" : "Realizada"
}

/** Call history list — the "Chamadas" area of the nav rail. */
export function CallsView() {
  const { state, dispatch } = useStore()
  const { start } = useCall()

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-14 items-center px-3">
        <h1 className="text-base font-semibold">Chamadas</h1>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {state.calls.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-muted-foreground">
            Nenhuma chamada no histórico.
          </p>
        ) : null}
        {state.calls.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted"
          >
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "SET_VIEW", view: "chats" })
                dispatch({ type: "SELECT_CHAT", chatId: entry.chatId })
              }}
              className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"
            >
              <Avatar size="lg">
                <AvatarFallback
                  className={cn("text-sm font-medium", avatarTints[entry.tint])}
                >
                  {initials(entry.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 border-b border-border/60 pb-2.5">
                <span
                  className={cn(
                    "block truncate text-sm font-medium",
                    entry.direction === "missed" && "text-destructive"
                  )}
                >
                  {entry.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon
                    icon={directionIcon(entry.direction)}
                    className="size-3.5 shrink-0"
                  />
                  <span className="truncate">
                    {directionLabel(entry)} · {entry.time}
                    {entry.duration ? ` · ${entry.duration}` : ""}
                  </span>
                </span>
              </span>
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    entry.kind === "video" ? "Chamar em vídeo" : "Chamar por voz"
                  }
                  onClick={() =>
                    start({
                      chatId: entry.chatId,
                      name: entry.name,
                      tint: entry.tint,
                      kind: entry.kind,
                    })
                  }
                >
                  <Icon icon={entry.kind === "video" ? VideoIcon : PhoneIcon} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {entry.kind === "video" ? "Chamada de vídeo" : "Chamada de voz"}
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )
}
