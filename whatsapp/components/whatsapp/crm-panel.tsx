"use client"

import * as React from "react"

import { crmOf, relationshipMeta, stageMeta } from "@/lib/crm"
import { avatarTints, initials } from "@/lib/data"
import { useStore } from "@/lib/store"
import type { Chat } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AiTab } from "./ai-tab"
import { AutomationsTab } from "./automations-tab"
import { Icon } from "./icon"
import {
  AiIcon,
  AutomationIcon,
  CloseIcon,
  OwnerIcon,
  WalletIcon,
} from "./icons"
import { PortfolioTab } from "./portfolio-tab"
import { ProfileTab } from "./profile-tab"

/**
 * True where there is room for the client panel as a third column. Below it
 * the panel can only be a sheet, so this decides which of the two mounts.
 * Matches Tailwind's `xl`.
 */
export function useWideLayout() {
  return useMediaQuery("(min-width: 80rem)")
}

/**
 * The panel has no Save button — edits commit on click, on blur, or after a
 * short debounce. That's invisible on its own, so this says so out loud once
 * something has actually been written.
 */
function SavedHint({ chat }: { chat: Chat }) {
  const [saved, setSaved] = React.useState(false)
  const signature = JSON.stringify(chat.crm ?? {})
  const [seen, setSeen] = React.useState(signature)

  // Adjusting state during render, not in an effect: React re-runs the render
  // before painting, where an effect would paint the stale value first and
  // cascade a second render on top of it.
  if (seen !== signature) {
    setSeen(signature)
    setSaved(true)
  }

  // `seen` in the deps rearms the timer on every edit; without it the hint
  // would fade two seconds after the first change, not the last.
  React.useEffect(() => {
    if (!saved) return
    const handle = window.setTimeout(() => setSaved(false), 2000)
    return () => window.clearTimeout(handle)
  }, [saved, seen])

  return (
    <span
      aria-live="polite"
      className={cn(
        "text-[0.625rem] text-muted-foreground transition-opacity",
        saved ? "opacity-100" : "opacity-0"
      )}
    >
      salvo
    </span>
  )
}

/** The tabbed body, shared by the docked column and the mobile sheet. */
function PanelTabs({ chat }: { chat: Chat }) {
  return (
    <Tabs
      // Keyed by chat so switching conversations resets to the first tab
      // instead of leaving you on a tab about the previous contact.
      key={chat.id}
      defaultValue="perfil"
      className="min-h-0 flex-1 gap-0"
    >
      <div className="px-3 pt-2 pb-2">
        <TabsList className="w-full">
          <TabsTrigger value="perfil">
            <Icon icon={OwnerIcon} />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="carteira">
            <Icon icon={WalletIcon} />
            Carteira
          </TabsTrigger>
          <TabsTrigger value="automacoes">
            <Icon icon={AutomationIcon} />
            Autom.
          </TabsTrigger>
          <TabsTrigger value="ia">
            <Icon icon={AiIcon} />
            IA
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        <TabsContent value="perfil">
          <ProfileTab chat={chat} />
        </TabsContent>
        <TabsContent value="carteira">
          <PortfolioTab chat={chat} />
        </TabsContent>
        <TabsContent value="automacoes">
          <AutomationsTab chat={chat} />
        </TabsContent>
        <TabsContent value="ia">
          <AiTab chat={chat} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function PanelIdentity({ chat }: { chat: Chat }) {
  const crm = crmOf(chat)
  const isClient = crm.relationship === "cliente"
  const label = isClient
    ? relationshipMeta.cliente.label
    : stageMeta[crm.stage].label
  const tone = isClient
    ? relationshipMeta.cliente.tone
    : stageMeta[crm.stage].tone

  return (
    <>
      <Avatar className="size-8">
        <AvatarFallback
          className={cn("text-[0.625rem] font-medium", avatarTints[chat.tint])}
        >
          {initials(chat.name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-medium">{chat.name}</span>
        <span className={cn("block truncate text-[0.625rem]", tone)}>
          {label}
        </span>
      </span>
    </>
  )
}

/**
 * Docked client panel — a real third column, not an overlay, so the CRM stays
 * readable next to the conversation instead of covering it.
 */
export function CrmPanel({ chat }: { chat: Chat }) {
  const { dispatch } = useStore()

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-14 items-center gap-2 border-b border-border px-3">
        <PanelIdentity chat={chat} />
        <SavedHint chat={chat} />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Fechar painel do cliente"
          onClick={() =>
            dispatch({ type: "SET_PREFERENCE", key: "crmPanel", value: false })
          }
        >
          <Icon icon={CloseIcon} />
        </Button>
      </header>

      <PanelTabs chat={chat} />
    </div>
  )
}

/** Same panel as a drawer, for viewports too narrow for a third column. */
export function CrmPanelSheet({
  chat,
  open,
  onOpenChange,
}: {
  chat: Chat
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="flex-row items-center gap-2 border-b border-border p-3 pr-12">
          <PanelIdentity chat={chat} />
          <SheetTitle className="sr-only">Painel do cliente</SheetTitle>
          <SheetDescription className="sr-only">
            Perfil, carteira, automações e IA de {chat.name}
          </SheetDescription>
        </SheetHeader>

        <PanelTabs chat={chat} />
      </SheetContent>
    </Sheet>
  )
}
