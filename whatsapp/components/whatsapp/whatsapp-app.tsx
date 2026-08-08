"use client"

import * as React from "react"

import { StoreProvider, useStore } from "@/lib/store"
import { isWorkspaceView, type View } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useAutomationScheduler } from "@/hooks/use-automation-scheduler"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import { CallProvider } from "./call-overlay"
import { CallsView } from "./calls-view"
import { ChatList } from "./chat-list"
import { CommunitiesView } from "./communities-view"
import { Conversation } from "./conversation"
import { CrmPanel, useWideLayout } from "./crm-panel"
import { EmptyConversation } from "./empty-conversation"
import { SettingsView } from "./settings-view"
import { NavRail } from "./nav-rail"
import { AgendaView } from "./views/agenda-view"
import { AutomacoesView } from "./views/automacoes-view"
import { CarteirasView } from "./views/carteiras-view"
import { FunilView } from "./views/funil-view"

/** Keeps the tab title in sync with the unread count, like WhatsApp Web. */
function useUnreadTitle() {
  const { state } = useStore()
  const total = state.chats.reduce((n, c) => n + (c.unread ?? 0), 0)

  React.useEffect(() => {
    document.title = total > 0 ? `(${total}) WhatsApp` : "WhatsApp"
  }, [total])
}

function Shell() {
  const { state, dispatch } = useStore()
  const selectedChat =
    state.chats.find((c) => c.id === state.selectedId) ?? null

  useUnreadTitle()
  useAutomationScheduler()

  // Global shortcuts. Ignored while typing so they never eat input.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      if (typing) return

      // Radix dismissable layers consume Escape and preventDefault it. By the
      // time this window listener runs the overlay is already unmounted, so
      // checking the DOM is useless — defaultPrevented is the reliable signal.
      // Without it, closing a sheet/dialog/menu would also close the chat.
      if (e.defaultPrevented) return

      if (e.key === "Escape") {
        if (state.selectedMessageIds.length) {
          dispatch({ type: "CLEAR_SELECTION" })
        } else if (isWorkspaceView(state.view)) {
          // In a workspace there is no conversation to close, so Escape is
          // the way back to the chats instead of a no-op.
          dispatch({ type: "SET_VIEW", view: "chats" })
        } else if (state.selectedId) {
          dispatch({ type: "SELECT_CHAT", chatId: null })
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dispatch, state.selectedId, state.selectedMessageIds.length, state.view])

  // A record rather than a ternary chain: adding a view to the union without
  // a screen is now a type error instead of silently rendering Settings.
  const SCREENS: Record<View, React.ReactNode> = {
    chats: <ChatList />,
    calls: <CallsView />,
    communities: <CommunitiesView />,
    settings: <SettingsView />,
    funil: <FunilView />,
    carteiras: <CarteirasView />,
    agenda: <AgendaView />,
    automacoes: <AutomacoesView />,
  }

  const workspace = isWorkspaceView(state.view)
  // On mobile the conversation replaces the list entirely.
  const conversationOpen =
    Boolean(selectedChat) && state.view === "chats" && !workspace
  const wide = useWideLayout()

  if (workspace) {
    return (
      <div className="flex h-svh w-full overflow-hidden bg-muted/30 text-foreground">
        <NavRail />
        <main className="h-full min-w-0 flex-1">{SCREENS[state.view]}</main>
      </div>
    )
  }

  return (
    <div className="flex h-svh w-full overflow-hidden bg-muted/30 text-foreground">
      <div className={cn(conversationOpen ? "hidden md:flex" : "flex")}>
        <NavRail />
      </div>

      <aside
        className={cn(
          "h-full w-full shrink-0 border-r border-border md:w-[30%] md:max-w-[420px] md:min-w-[320px]",
          conversationOpen ? "hidden md:block" : "block"
        )}
      >
        {SCREENS[state.view]}
      </aside>

      <main
        className={cn(
          "h-full min-w-0 flex-1",
          conversationOpen ? "block" : "hidden md:block"
        )}
      >
        {conversationOpen && selectedChat ? (
          <Conversation chat={selectedChat} />
        ) : (
          <EmptyConversation />
        )}
      </main>

      {/* Client panel — a docked column from xl up, so it sits beside the
          conversation instead of covering it. Narrower viewports get the same
          content as a sheet, opened from the conversation header; the two are
          mutually exclusive so the panel is never in the DOM twice. */}
      {wide &&
      conversationOpen &&
      state.preferences.crmPanel &&
      selectedChat ? (
        <aside
          aria-label="Painel do cliente"
          className="h-full w-[30%] max-w-[440px] min-w-[320px] shrink-0 border-l border-border"
        >
          <CrmPanel chat={selectedChat} />
        </aside>
      ) : null}
    </div>
  )
}

export function WhatsappApp() {
  return (
    <StoreProvider>
      <TooltipProvider delayDuration={200}>
        <CallProvider>
          <Shell />
          <Toaster position="top-right" />
        </CallProvider>
      </TooltipProvider>
    </StoreProvider>
  )
}
