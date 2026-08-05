"use client"

import { avatarTints, initials } from "@/lib/data"
import { useStore } from "@/lib/store"
import type { View } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Icon } from "./icon"
import { ChatsIcon, CommunitiesIcon, PhoneIcon, SettingsIcon } from "./icons"
import { ThemeToggle } from "./theme-toggle"

const PRIMARY: { view: View; label: string; icon: typeof ChatsIcon }[] = [
  { view: "chats", label: "Conversas", icon: ChatsIcon },
  { view: "calls", label: "Chamadas", icon: PhoneIcon },
  { view: "communities", label: "Comunidades", icon: CommunitiesIcon },
]

/**
 * The narrow icon rail on the far left, mirroring WhatsApp Web's navigation.
 * Status and Canais are intentionally omitted from this clone.
 */
export function NavRail() {
  const { state, dispatch } = useStore()
  const unreadTotal = state.chats.reduce((n, c) => n + (c.unread ?? 0), 0)

  return (
    <nav
      aria-label="Navegação principal"
      className="flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-muted/40 py-3"
    >
      {PRIMARY.map((entry) => {
        const active = state.view === entry.view
        return (
          <Tooltip key={entry.view}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label={entry.label}
                aria-current={active ? "page" : undefined}
                onClick={() => dispatch({ type: "SET_VIEW", view: entry.view })}
                className={cn(
                  "relative rounded-full",
                  active && "bg-muted text-foreground"
                )}
              >
                <Icon
                  icon={entry.icon}
                  className="size-5"
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {entry.view === "chats" && unreadTotal > 0 ? (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-semibold text-primary-foreground">
                    {unreadTotal > 99 ? "99+" : unreadTotal}
                  </span>
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{entry.label}</TooltipContent>
          </Tooltip>
        )
      })}

      <div className="flex-1" />

      <ThemeToggle />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Configurações"
            aria-current={state.view === "settings" ? "page" : undefined}
            onClick={() => dispatch({ type: "SET_VIEW", view: "settings" })}
            className={cn(
              "rounded-full",
              state.view === "settings" && "bg-muted text-foreground"
            )}
          >
            <Icon icon={SettingsIcon} className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Configurações</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Perfil"
            onClick={() => dispatch({ type: "SET_VIEW", view: "settings" })}
            className="mt-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <Avatar size="sm">
              <AvatarFallback
                className={cn("text-[0.625rem]", avatarTints.neutral)}
              >
                {initials("Você")}
              </AvatarFallback>
            </Avatar>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Perfil</TooltipContent>
      </Tooltip>
    </nav>
  )
}
