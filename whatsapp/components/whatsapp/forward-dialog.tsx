"use client"

import * as React from "react"

import { avatarTints, initials } from "@/lib/data"
import { useStore } from "@/lib/store"
import type { Message } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { Icon } from "./icon"
import { CheckIcon, ForwardIcon } from "./icons"
import { nowTime } from "./use-send-message"

export function ForwardDialog({
  messages,
  onOpenChange,
}: {
  messages: Message[] | null
  onOpenChange: (open: boolean) => void
}) {
  const { state, dispatch } = useStore()
  const [query, setQuery] = React.useState("")
  const [picked, setPicked] = React.useState<string[]>([])

  const open = Boolean(messages?.length)

  // Reset the picker each time the dialog opens, via React's in-render
  // derived-state update rather than an effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (open) {
      setQuery("")
      setPicked([])
    }
  }

  const visible = state.chats.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  function confirm() {
    if (!messages?.length || !picked.length) return
    dispatch({
      type: "FORWARD",
      messages,
      toChatIds: picked,
      time: nowTime(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encaminhar mensagem</DialogTitle>
          <DialogDescription>
            {messages?.length ?? 0} mensagem
            {(messages?.length ?? 0) > 1 ? "s" : ""} selecionada
            {(messages?.length ?? 0) > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar conversa…"
          aria-label="Pesquisar conversa"
        />

        <div className="thin-scroll -mx-1 max-h-72 overflow-y-auto px-1">
          {visible.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Nenhuma conversa encontrada.
            </p>
          ) : (
            visible.map((chat) => {
              const isPicked = picked.includes(chat.id)
              return (
                <button
                  key={chat.id}
                  type="button"
                  aria-pressed={isPicked}
                  onClick={() =>
                    setPicked((p) =>
                      isPicked ? p.filter((id) => id !== chat.id) : [...p, chat.id]
                    )
                  }
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                    isPicked ? "bg-muted" : "hover:bg-muted/60"
                  )}
                >
                  <Avatar size="sm">
                    <AvatarFallback
                      className={cn("text-[0.625rem]", avatarTints[chat.tint])}
                    >
                      {initials(chat.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {chat.name}
                  </span>
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border",
                      isPicked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}
                  >
                    {isPicked ? <Icon icon={CheckIcon} className="size-3" /> : null}
                  </span>
                </button>
              )
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!picked.length} onClick={confirm}>
            <Icon icon={ForwardIcon} />
            Encaminhar{picked.length ? ` (${picked.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
