"use client"

import * as React from "react"

import { avatarTints, initials } from "@/lib/data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { Icon } from "./icon"
import { CommunitiesIcon, NotificationIcon } from "./icons"

/** Communities: an announcement board plus the groups that belong to it. */
export function CommunitiesView() {
  const { state, dispatch } = useStore()
  const [openId, setOpenId] = React.useState<string | null>(null)

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-14 items-center px-3">
        <h1 className="text-base font-semibold">Comunidades</h1>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pb-4">
        {state.communities.map((community) => {
          const open = openId === community.id
          const groups = state.chats.filter((c) =>
            community.groupIds.includes(c.id)
          )

          return (
            <section key={community.id}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`community-panel-${community.id}`}
                onClick={() => setOpenId(open ? null : community.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    avatarTints[community.tint]
                  )}
                >
                  <Icon icon={CommunitiesIcon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {community.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {community.members} participantes · {groups.length} grupos
                  </span>
                </span>
              </button>

              {open ? (
                <div id={`community-panel-${community.id}`} className="pb-2">
                  <p className="px-3 pb-2 text-xs text-muted-foreground">
                    {community.description}
                  </p>

                  {/* Announcement board */}
                  <div className="mx-3 mb-3 rounded-md border border-border bg-muted/40 p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
                      <Icon icon={NotificationIcon} className="size-3.5" />
                      Avisos da comunidade
                    </p>
                    <ul className="flex flex-col gap-2">
                      {community.announcements.map((a) => (
                        <li key={a.id} className="text-xs">
                          <span className="font-medium">{a.author}</span>
                          <span className="ml-1.5 text-[0.625rem] text-muted-foreground">
                            {a.time}
                          </span>
                          <p className="mt-0.5 text-muted-foreground">{a.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="px-3 pb-1 text-[0.6875rem] font-medium text-muted-foreground">
                    Grupos
                  </p>
                  {groups.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => {
                        dispatch({ type: "SET_VIEW", view: "chats" })
                        dispatch({ type: "SELECT_CHAT", chatId: chat.id })
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <Avatar>
                        <AvatarFallback
                          className={cn("text-xs", avatarTints[chat.tint])}
                        >
                          {initials(chat.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {chat.name}
                      </span>
                      {chat.unread ? (
                        <Badge className="h-4 min-w-4 px-1">{chat.unread}</Badge>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}

              <Separator />
            </section>
          )
        })}
      </div>
    </div>
  )
}
