"use client"

import * as React from "react"

import { allMessages, messagePreview } from "@/lib/data"
import type { Chat } from "@/lib/types"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

/** In-conversation message search, driven by the Command primitive. */
export function ConversationSearch({
  chat,
  open,
  onOpenChange,
}: {
  chat: Chat
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const results = React.useMemo(
    () =>
      allMessages(chat)
        .filter((m) => !m.deleted && m.type !== "system")
        .map((m) => ({ id: m.id, time: m.time, text: messagePreview(m), fromMe: m.fromMe })),
    [chat]
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Pesquisar em ${chat.name}`}
      description="Busque mensagens desta conversa"
    >
      <CommandInput placeholder={`Pesquisar em ${chat.name}…`} />
      <CommandList>
        <CommandEmpty>Nenhuma mensagem encontrada.</CommandEmpty>
        <CommandGroup heading="Mensagens">
          {results.map((r) => (
            <CommandItem
              key={r.id}
              value={`${r.id} ${r.text} ${r.time}`}
              onSelect={() => {
                onOpenChange(false)
                document
                  .querySelector(`[data-slot="message-scroller-item"][data-message-id="${r.id}"]`)
                  ?.scrollIntoView({ block: "center", behavior: "smooth" })
              }}
            >
              <span className="min-w-0 flex-1 truncate">{r.text}</span>
              <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                {r.fromMe ? "Você" : chat.name.split(" ")[0]} · {r.time}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
