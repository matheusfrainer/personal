"use client"

import * as React from "react"

import {
  avatarTints,
  initials,
  type Chat,
  type Message,
} from "@/lib/data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ChatComposer } from "./chat-composer"
import { Icon } from "./icon"
import {
  BackIcon,
  CheckDoubleIcon,
  DeleteIcon,
  MoreIcon,
  PhoneIcon,
  SearchIcon,
  StarIcon,
  VideoIcon,
} from "./icons"
import { MessageBubble } from "./message-bubble"

function presenceLabel(chat: Chat) {
  if (chat.typing) return "digitando…"
  if (chat.isGroup) return chat.members?.join(", ")
  if (chat.online) return "online"
  return chat.presence
}

interface ConversationProps {
  chat: Chat
  onBack: () => void
  onSend: (text: string) => void
}

export function Conversation({ chat, onBack, onSend }: ConversationProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const messageCount = React.useMemo(
    () => chat.conversation.reduce((n, d) => n + d.messages.length, 0),
    [chat.conversation]
  )

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [chat.id, messageCount, chat.typing])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex h-14 items-center gap-2 border-b border-border bg-background px-2 sm:px-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Voltar"
          onClick={onBack}
        >
          <Icon icon={BackIcon} className="size-5" />
        </Button>

        <Avatar>
          <AvatarFallback className={cn("text-xs font-medium", avatarTints[chat.tint])}>
            {initials(chat.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">{chat.name}</p>
          <p
            className={cn(
              "truncate text-xs",
              chat.typing ? "text-foreground/80" : "text-muted-foreground"
            )}
          >
            {presenceLabel(chat)}
          </p>
        </div>

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Chamada de vídeo">
                <Icon icon={VideoIcon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chamada de vídeo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Chamada de voz">
                <Icon icon={PhoneIcon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chamada de voz</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                aria-label="Pesquisar"
              >
                <Icon icon={SearchIcon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pesquisar</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu da conversa">
                <Icon icon={MoreIcon} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Dados do contato</DropdownMenuItem>
              <DropdownMenuItem>Selecionar mensagens</DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={StarIcon} />
                Mensagens favoritas
              </DropdownMenuItem>
              <DropdownMenuItem>Silenciar notificações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Icon icon={DeleteIcon} />
                Apagar conversa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-wallpaper thin-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col px-4 py-4">
          <p className="mx-auto mb-4 flex max-w-md items-center gap-1.5 rounded-md bg-muted/80 px-3 py-1.5 text-center text-[0.6875rem] text-muted-foreground shadow-sm backdrop-blur">
            <Icon icon={CheckDoubleIcon} className="size-3.5 shrink-0" />
            As mensagens são protegidas com criptografia de ponta a ponta.
            Ninguém fora desta conversa pode lê-las.
          </p>

          {chat.conversation.map((day) => {
            let prev: Message | undefined
            return (
              <div key={day.label} className="flex flex-col">
                <div className="sticky top-2 z-10 my-2 flex justify-center">
                  <span className="rounded-md bg-muted px-3 py-1 text-[0.6875rem] font-medium text-muted-foreground shadow-sm">
                    {day.label}
                  </span>
                </div>
                {day.messages.map((message) => {
                  const sameAuthor =
                    prev?.fromMe === message.fromMe &&
                    prev?.author === message.author
                  const showTail = !prev || !sameAuthor
                  const showAuthor = Boolean(
                    showTail && chat.isGroup && !message.fromMe && message.author
                  )
                  prev = message
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      showTail={showTail}
                      showAuthor={showAuthor}
                    />
                  )
                })}
              </div>
            )
          })}

          {chat.typing ? (
            <div className="mt-2 flex justify-start">
              <div className="flex items-center gap-1 rounded-lg rounded-tl-none bg-background px-3 py-2 shadow-sm">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <ChatComposer onSend={onSend} />
    </div>
  )
}
