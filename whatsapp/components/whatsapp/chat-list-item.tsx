import {
  avatarTints,
  initials,
  lastMessage,
  type Chat,
} from "@/lib/data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Icon } from "./icon"
import { MuteIcon, PinIcon } from "./icons"
import { StatusTicks } from "./status-ticks"

interface ChatListItemProps {
  chat: Chat
  selected: boolean
  onSelect: () => void
}

function Preview({ chat }: { chat: Chat }) {
  if (chat.typing) {
    return <span className="text-foreground/80">digitando…</span>
  }

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
      {last.fromMe ? (
        <StatusTicks
          status={last.status}
          className="text-muted-foreground"
        />
      ) : chat.isGroup && last.author ? (
        <span className="shrink-0 text-foreground/70">{last.author}:</span>
      ) : null}
      <span className="truncate">{last.text}</span>
    </span>
  )
}

export function ChatListItem({ chat, selected, onSelect }: ChatListItemProps) {
  const hasUnread = (chat.unread ?? 0) > 0

  return (
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
        <AvatarFallback className={cn("text-sm font-medium", avatarTints[chat.tint])}>
          {initials(chat.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 border-b border-border/60 pb-2.5 -my-0.5">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {chat.name}
          </span>
          <span
            className={cn(
              "shrink-0 text-[0.6875rem]",
              hasUnread
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            )}
          >
            {chat.time}
          </span>
        </div>

        <div className="mt-0.5 flex items-center gap-1.5">
          <div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            <Preview chat={chat} />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {chat.muted ? (
              <Icon
                icon={MuteIcon}
                className="size-3.5 text-muted-foreground"
              />
            ) : null}
            {chat.pinned ? (
              <Icon icon={PinIcon} className="size-3.5 text-muted-foreground" />
            ) : null}
            {hasUnread ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-primary-foreground">
                {chat.unread}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  )
}
