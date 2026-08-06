"use client"

import { avatarTints, initials, lastMessage, messagePreview } from "@/lib/data"
import { useStore } from "@/lib/store"
import type { Chat } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

import { Icon } from "./icon"
import { ArchiveIcon, DeleteIcon, MuteIcon, PinIcon, StarIcon } from "./icons"
import { StatusTicks } from "./status-ticks"

function Preview({ chat }: { chat: Chat }) {
  if (chat.typing) return <span className="text-foreground/80">digitando…</span>

  if (chat.draft) {
    return (
      <>
        <span className="text-destructive">Rascunho:</span> {chat.draft}
      </>
    )
  }

  const last = lastMessage(chat)
  if (!last) return <span className="italic">Sem mensagens ainda</span>

  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      {last.fromMe && !last.deleted ? (
        <StatusTicks status={last.status} className="text-muted-foreground" />
      ) : chat.isGroup && last.author && last.type !== "system" ? (
        <span className="shrink-0 text-foreground/70">{last.author}:</span>
      ) : null}
      <span className={cn("truncate", last.deleted && "italic")}>
        {messagePreview(last)}
      </span>
    </span>
  )
}

export function ChatListItem({
  chat,
  selected,
  onSelect,
}: {
  chat: Chat
  selected: boolean
  onSelect: () => void
}) {
  const { dispatch } = useStore()
  const hasUnread = (chat.unread ?? 0) > 0

  function flag(
    name: "pinned" | "muted" | "archived" | "favourite",
    value: boolean
  ) {
    dispatch({ type: "CHAT_FLAG", chatId: chat.id, flag: name, value })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={onSelect}
          aria-current={selected}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors outline-none",
            "hover:bg-muted focus-visible:bg-muted",
            selected && "bg-muted"
          )}
        >
          <Avatar size="lg">
            <AvatarFallback
              className={cn("text-sm font-medium", avatarTints[chat.tint])}
            >
              {initials(chat.name)}
            </AvatarFallback>
          </Avatar>

          <span className="-my-0.5 min-w-0 flex-1 border-b border-border/60 pb-2.5">
            <span className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {chat.name}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[0.6875rem]",
                  hasUnread ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {chat.time}
              </span>
            </span>

            <span className="mt-0.5 flex items-center gap-1.5">
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                <Preview chat={chat} />
              </span>

              <span className="flex shrink-0 items-center gap-1">
                {chat.muted ? (
                  <Icon icon={MuteIcon} className="size-3.5 text-muted-foreground" />
                ) : null}
                {chat.pinned ? (
                  <Icon icon={PinIcon} className="size-3.5 text-muted-foreground" />
                ) : null}
                {hasUnread ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-primary-foreground">
                    {chat.unread}
                  </span>
                ) : null}
              </span>
            </span>
          </span>
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={() => dispatch({ type: "MARK_UNREAD", chatId: chat.id })}>
          Marcar como não lida
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => flag("pinned", !chat.pinned)}>
          <Icon icon={PinIcon} />
          {chat.pinned ? "Desafixar conversa" : "Fixar conversa"}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => flag("favourite", !chat.favourite)}>
          <Icon icon={StarIcon} />
          {chat.favourite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => flag("muted", !chat.muted)}>
          <Icon icon={MuteIcon} />
          {chat.muted ? "Reativar notificações" : "Silenciar"}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => flag("archived", !chat.archived)}>
          <Icon icon={ArchiveIcon} />
          {chat.archived ? "Desarquivar" : "Arquivar"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          onSelect={() => dispatch({ type: "DELETE_CHAT", chatId: chat.id })}
        >
          <Icon icon={DeleteIcon} />
          {chat.isGroup ? "Sair do grupo" : "Apagar conversa"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
