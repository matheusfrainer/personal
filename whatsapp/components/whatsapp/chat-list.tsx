"use client"

import * as React from "react"

import { allMessages, messagePreview } from "@/lib/data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ChatListItem } from "./chat-list-item"
import { Icon } from "./icon"
import {
  ArchiveIcon,
  BackIcon,
  MoreIcon,
  NewChatIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
} from "./icons"
import { NewChatDialog } from "./new-chat-dialog"

type Filter = "all" | "unread" | "favourites" | "groups"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "unread", label: "Não lidas" },
  { id: "favourites", label: "Favoritas" },
  { id: "groups", label: "Grupos" },
]

/**
 * Placeholder rows that mirror ChatListItem's box model exactly — same
 * padding, same avatar size, same two text lines at 20px and 16px — so the
 * list doesn't shift by a pixel when the real rows replace them. The bars sit
 * inside fixed-height lines rather than setting the height themselves, which
 * keeps them visually thin without changing the geometry.
 */
function ChatListSkeleton() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex w-full items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="-my-0.5 min-w-0 flex-1 pb-2.5">
            <div className="flex h-5 items-center">
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="mt-0.5 flex h-4 items-center">
              <Skeleton className="h-2.5 w-48" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChatList() {
  const { state, dispatch } = useStore()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [newChatOpen, setNewChatOpen] = React.useState(false)

  const archivedCount = state.chats.filter((c) => c.archived).length
  const showArchived = state.showArchived

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return (
      state.chats
        .filter((chat) => {
          if (Boolean(chat.archived) !== showArchived) return false
          if (filter === "unread" && !(chat.unread ?? 0)) return false
          if (filter === "favourites" && !chat.favourite) return false
          if (filter === "groups" && !chat.isGroup) return false
          if (!q) return true
          if (chat.name.toLowerCase().includes(q)) return true
          // Search the whole transcript, not just the last message.
          return allMessages(chat).some((m) =>
            messagePreview(m).toLowerCase().includes(q)
          )
        })
        // Pinned first, then most recent activity. Seeded chats have no
        // `updatedAt`, so they keep the authored order until they see traffic.
        .sort(
          (a, b) =>
            Number(!!b.pinned) - Number(!!a.pinned) ||
            (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
        )
    )
  }, [state.chats, query, filter, showArchived])

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-14 items-center justify-between gap-1 px-3">
        {showArchived ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Voltar"
              onClick={() =>
                dispatch({ type: "SET_SHOW_ARCHIVED", value: false })
              }
            >
              <Icon icon={BackIcon} className="size-5" />
            </Button>
            <h1 className="flex-1 text-base font-semibold">Arquivadas</h1>
          </>
        ) : (
          <>
            <h1 className="text-base font-semibold">Conversas</h1>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Nova conversa"
                    onClick={() => setNewChatOpen(true)}
                  >
                    <Icon icon={NewChatIcon} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Nova conversa</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menu">
                    <Icon icon={MoreIcon} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Menu</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => setNewChatOpen(true)}>
                    <Icon icon={NewChatIcon} />
                    Nova conversa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      dispatch({ type: "SET_SHOW_ARCHIVED", value: true })
                    }
                  >
                    <Icon icon={ArchiveIcon} />
                    Arquivadas
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilter("favourites")}>
                    <Icon icon={StarIcon} />
                    Favoritas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() =>
                      dispatch({ type: "SET_VIEW", view: "settings" })
                    }
                  >
                    <Icon icon={SettingsIcon} />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </header>

      <div className="px-3 pb-2">
        <div className="relative">
          <Icon
            icon={SearchIcon}
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar ou começar nova conversa"
            aria-label="Pesquisar conversas"
            className="h-8 pr-3 pl-8 text-xs"
          />
        </div>
      </div>

      {!showArchived ? (
        <div className="flex items-center gap-1.5 px-3 pb-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      {!showArchived && archivedCount > 0 ? (
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SHOW_ARCHIVED", value: true })}
          className="flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon icon={ArchiveIcon} className="size-4" />
          </span>
          <span className="flex flex-1 items-center border-b border-border/60 pb-2">
            <span className="flex-1 text-sm font-medium">Arquivadas</span>
            <span className="text-[0.6875rem] text-muted-foreground">
              {archivedCount}
            </span>
          </span>
        </button>
      ) : null}

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {/* The page is prerendered from the seed, then the store swaps in
            whatever localStorage holds. Painting the seed list first makes the
            rows visibly reorder and badges pop when hydration lands, so hold a
            skeleton until the real state is in. */}
        {!state.hydrated ? (
          <ChatListSkeleton />
        ) : visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-muted-foreground">
            Nenhuma conversa encontrada.
          </p>
        ) : (
          visible.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              selected={chat.id === state.selectedId}
              onSelect={() =>
                dispatch({ type: "SELECT_CHAT", chatId: chat.id })
              }
            />
          ))
        )}
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
    </div>
  )
}
