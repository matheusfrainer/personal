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

import { Separator } from "@/components/ui/separator"

import { Icon } from "./icon"
import {
  AgendaIcon,
  AutomationIcon,
  ChatsIcon,
  CommunitiesIcon,
  PhoneIcon,
  PipelineIcon,
  SettingsIcon,
  WalletIcon,
} from "./icons"
import { ThemeToggle } from "./theme-toggle"

type Entry = { view: View; label: string; icon: typeof ChatsIcon }

const PRIMARY: Entry[] = [
  { view: "chats", label: "Conversas", icon: ChatsIcon },
  { view: "calls", label: "Chamadas", icon: PhoneIcon },
  { view: "communities", label: "Comunidades", icon: CommunitiesIcon },
]

/**
 * The advisory side of the app. Four entries rather than one per screen: the
 * rail is 56px wide, and ten icons would read as a toolbar. Each of these
 * opens a full-width workspace that tabs into its own sub-screens.
 */
const WORKSPACES: Entry[] = [
  { view: "funil", label: "Funil", icon: PipelineIcon },
  { view: "carteiras", label: "Carteiras", icon: WalletIcon },
  { view: "agenda", label: "Agenda", icon: AgendaIcon },
  { view: "automacoes", label: "Automações", icon: AutomationIcon },
]

/**
 * The narrow icon rail on the far left, mirroring WhatsApp Web's navigation.
 * Status and Canais are intentionally omitted from this clone.
 */
export function NavRail() {
  const { state, dispatch } = useStore()
  // No `hydrated` guard needed: before hydration the store holds no chats and
  // no pending actions, so both counts are 0 and neither badge renders.
  const unreadTotal = state.chats.reduce((n, c) => n + (c.unread ?? 0), 0)
  const toReview = state.pending.filter((p) => p.status === "pending").length

  function railButton(entry: Entry, badge?: number) {
    const active = state.view === entry.view
    return (
      <Tooltip key={entry.view}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={
              badge ? `${entry.label}, ${badge} pendentes` : entry.label
            }
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
            {badge ? (
              <span
                aria-hidden="true"
                className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-semibold text-primary-foreground"
              >
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{entry.label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-muted/40 py-3"
    >
      {PRIMARY.map((entry) =>
        railButton(entry, entry.view === "chats" ? unreadTotal : undefined)
      )}

      <Separator className="my-1 w-6" />

      {/* Advisory workspaces. Scrolls on short viewports so the footer
          controls stay reachable rather than being pushed off-screen. */}
      <div className="thin-scroll flex min-h-0 flex-col items-center gap-1 overflow-y-auto">
        {WORKSPACES.map((entry) =>
          railButton(entry, entry.view === "agenda" ? toReview : undefined)
        )}
      </div>

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
