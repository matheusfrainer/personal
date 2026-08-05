"use client"

import * as React from "react"

import { allMessages, avatarTints, initials } from "@/lib/data"
import { useStore } from "@/lib/store"
import type { Chat } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"

import { Icon } from "./icon"
import {
  BlockIcon,
  ChevronDownIcon,
  DeleteIcon,
  DocumentIcon,
  ImageIcon,
  LockIcon,
  MembersIcon,
  MuteIcon,
  ReportIcon,
  StarIcon,
} from "./icons"

/** Right-hand drawer with contact/group details, like WhatsApp's info panel. */
export function ContactPanel({
  chat,
  open,
  onOpenChange,
}: {
  chat: Chat
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { dispatch } = useStore()

  const { media, docs, starred } = React.useMemo(() => {
    const all = allMessages(chat).filter((m) => !m.deleted)
    return {
      media: all.filter((m) => m.type === "image" || m.type === "video"),
      docs: all.filter((m) => m.type === "document"),
      starred: all.filter((m) => m.starred),
    }
  }, [chat])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="items-center gap-2 border-b border-border pb-5 text-center">
          <Avatar className="size-20">
            <AvatarFallback
              className={cn("text-2xl font-medium", avatarTints[chat.tint])}
            >
              {initials(chat.name)}
            </AvatarFallback>
          </Avatar>
          <SheetTitle className="text-base">{chat.name}</SheetTitle>
          <SheetDescription>
            {chat.isGroup
              ? `Grupo · ${chat.members?.length ?? 0} participantes`
              : (chat.phone ?? "Contato")}
          </SheetDescription>
        </SheetHeader>

        <div className="thin-scroll flex-1 overflow-y-auto">
          {chat.about ? (
            <section className="px-5 py-4">
              <p className="text-[0.6875rem] font-medium text-muted-foreground">
                Recado
              </p>
              <p className="mt-1 text-sm">{chat.about}</p>
            </section>
          ) : null}

          <Separator />

          {/* Media / docs / starred counters */}
          <section className="px-2 py-2">
            <Item size="sm">
              <ItemMedia>
                <Icon icon={ImageIcon} className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Mídia, links e docs</ItemTitle>
              </ItemContent>
              <span className="text-xs text-muted-foreground">
                {media.length}
              </span>
            </Item>
            <Item size="sm">
              <ItemMedia>
                <Icon icon={DocumentIcon} className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Documentos</ItemTitle>
              </ItemContent>
              <span className="text-xs text-muted-foreground">{docs.length}</span>
            </Item>
            <Item size="sm">
              <ItemMedia>
                <Icon icon={StarIcon} className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Mensagens favoritas</ItemTitle>
              </ItemContent>
              <span className="text-xs text-muted-foreground">
                {starred.length}
              </span>
            </Item>
          </section>

          {media.length ? (
            <section className="px-5 pb-4">
              <div className="grid grid-cols-3 gap-1.5">
                {media.slice(0, 6).map((m) =>
                  m.type === "image" || m.type === "video" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={m.id}
                      src={m.url}
                      alt=""
                      className="aspect-square w-full rounded-md object-cover"
                    />
                  ) : null
                )}
              </div>
            </section>
          ) : null}

          <Separator />

          {/* Notification toggle */}
          <section className="flex items-center gap-3 px-5 py-3">
            <Icon icon={MuteIcon} className="size-4 text-muted-foreground" />
            <span className="flex-1 text-sm">Silenciar notificações</span>
            <Switch
              checked={Boolean(chat.muted)}
              onCheckedChange={(value) =>
                dispatch({
                  type: "CHAT_FLAG",
                  chatId: chat.id,
                  flag: "muted",
                  value,
                })
              }
            />
          </section>

          <Separator />

          {/* Group members */}
          {chat.isGroup && chat.members?.length ? (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-muted">
                <Icon icon={MembersIcon} className="size-4 text-muted-foreground" />
                <span className="flex-1 text-sm">
                  {chat.members.length} participantes
                </span>
                <Icon
                  icon={ChevronDownIcon}
                  className="size-4 text-muted-foreground transition-transform data-[state=open]:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="pb-2">
                  {chat.members.map((member) => (
                    <li
                      key={member}
                      className="flex items-center gap-3 px-5 py-2"
                    >
                      <Avatar size="sm">
                        <AvatarFallback
                          className={cn("text-[0.625rem]", avatarTints.neutral)}
                        >
                          {initials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate text-sm">{member}</span>
                      {member === "Você" ? (
                        <span className="text-[0.625rem] text-muted-foreground">
                          você
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ) : null}

          <Separator />

          <section className="flex items-start gap-3 px-5 py-4">
            <Icon icon={LockIcon} className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm">Criptografia</p>
              <p className="text-xs text-muted-foreground">
                As mensagens são protegidas com criptografia de ponta a ponta.
              </p>
            </div>
          </section>

          <Separator />

          <section className="flex flex-col gap-1 p-2">
            <Button variant="ghost" className="justify-start text-destructive">
              <Icon icon={BlockIcon} />
              Bloquear {chat.isGroup ? "grupo" : chat.name.split(" ")[0]}
            </Button>
            <Button variant="ghost" className="justify-start text-destructive">
              <Icon icon={ReportIcon} />
              Denunciar
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-destructive"
              onClick={() => {
                onOpenChange(false)
                dispatch({ type: "DELETE_CHAT", chatId: chat.id })
              }}
            >
              <Icon icon={DeleteIcon} />
              Apagar conversa
            </Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
