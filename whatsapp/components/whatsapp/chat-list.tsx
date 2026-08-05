"use client"

import * as React from "react"

import { lastMessage, type Chat } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  CommunitiesIcon,
  NewChatIcon,
  MoreIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  StatusIcon,
} from "./icons"
import { ThemeToggle } from "./theme-toggle"

type Filter = "all" | "unread" | "favourites" | "groups"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "unread", label: "Não lidas" },
  { id: "favourites", label: "Favoritas" },
  { id: "groups", label: "Grupos" },
]

interface ChatListProps {
  chats: Chat[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ChatList({ chats, selectedId, onSelect }: ChatListProps) {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return chats
      .filter((chat) => {
        if (filter === "unread" && !(chat.unread ?? 0)) return false
        if (filter === "favourites" && !chat.favourite) return false
        if (filter === "groups" && !chat.isGroup) return false
        if (!q) return true
        return (
          chat.name.toLowerCase().includes(q) ||
          (lastMessage(chat)?.text.toLowerCase().includes(q) ?? false)
        )
      })
      .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  }, [chats, query, filter])

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between gap-1 px-3">
        <h1 className="flex items-center gap-2 text-base font-semibold">
          <Icon icon={CommunitiesIcon} className="size-5" strokeWidth={2} />
          WhatsApp
        </h1>
        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Nova conversa">
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Menu</DropdownMenuLabel>
              <DropdownMenuItem>
                <Icon icon={CommunitiesIcon} />
                Novo grupo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={StatusIcon} />
                Status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={StarIcon} />
                Mensagens favoritas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon icon={SettingsIcon} />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                Desconectar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Icon
            icon={SearchIcon}
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar ou começar nova conversa"
            aria-label="Pesquisar conversas"
            className="h-8 w-full rounded-md border border-input bg-input/20 pr-3 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
          />
        </div>
      </div>

      {/* Filter chips */}
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

      {/* Archived */}
      <button
        type="button"
        className="flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon icon={ArchiveIcon} className="size-4" />
        </span>
        <span className="flex-1 border-b border-border/60 pb-2 text-sm font-medium">
          Arquivadas
        </span>
      </button>

      {/* Conversation list */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-muted-foreground">
            Nenhuma conversa encontrada.
          </p>
        ) : (
          visible.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              selected={chat.id === selectedId}
              onSelect={() => onSelect(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
