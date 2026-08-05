"use client"

import * as React from "react"

import { StoreProvider, useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

import { CallsView } from "./calls-view"
import { ChatList } from "./chat-list"
import { CommunitiesView } from "./communities-view"
import { Conversation } from "./conversation"
import { EmptyConversation } from "./empty-conversation"
import { SettingsView } from "./settings-view"
import { NavRail } from "./nav-rail"

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
        } else if (state.selectedId) {
          dispatch({ type: "SELECT_CHAT", chatId: null })
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dispatch, state.selectedId, state.selectedMessageIds.length])

  const sidebar =
    state.view === "chats" ? (
      <ChatList />
    ) : state.view === "calls" ? (
      <CallsView />
    ) : state.view === "communities" ? (
      <CommunitiesView />
    ) : (
      <SettingsView />
    )

  // On mobile the conversation replaces the list entirely.
  const conversationOpen = Boolean(selectedChat) && state.view === "chats"

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
        {sidebar}
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
    </div>
  )
}

export function WhatsappApp() {
  return (
    <StoreProvider>
      <TooltipProvider delayDuration={200}>
        <Shell />
      </TooltipProvider>
    </StoreProvider>
  )
}
