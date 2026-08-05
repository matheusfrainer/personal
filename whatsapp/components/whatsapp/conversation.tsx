"use client"

import * as React from "react"

import { allMessages, avatarTints, findMessage, initials, messagePreview } from "@/lib/data"
import { useStore } from "@/lib/store"
import type { Chat, Message } from "@/lib/types"
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
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ChatComposer } from "./chat-composer"
import { ContactPanel } from "./contact-panel"
import { ConversationSearch } from "./conversation-search"
import { ForwardDialog } from "./forward-dialog"
import { Icon } from "./icon"
import {
  BackIcon,
  CloseIcon,
  DeleteIcon,
  ForwardIcon,
  LockIcon,
  MoreIcon,
  MuteIcon,
  PhoneIcon,
  PinIcon,
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

/** Renders the scrollable transcript; lives inside the scroller provider. */
function Transcript({
  chat,
  unreadAtOpen,
  onForwardRequest,
}: {
  chat: Chat
  unreadAtOpen: number
  onForwardRequest: (messages: Message[]) => void
}) {
  const { state, dispatch } = useStore()
  const { scrollToMessage } = useMessageScroller()

  const flat = React.useMemo(() => allMessages(chat), [chat])
  // The message that should carry the "unread" divider above it.
  const firstUnreadId =
    unreadAtOpen > 0 && flat.length >= unreadAtOpen
      ? flat[flat.length - unreadAtOpen].id
      : null

  const selectionMode = state.selectedMessageIds.length > 0

  return (
    <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-0 px-2 py-4">
      <Marker variant="separator" className="mb-3">
        <MarkerContent className="mx-auto max-w-md rounded-md bg-muted/80 px-3 py-1.5 text-center text-[0.6875rem] shadow-sm">
          <MarkerIcon className="mr-1 inline-block align-[-2px]">
            <Icon icon={LockIcon} className="size-3" />
          </MarkerIcon>
          As mensagens são protegidas com criptografia de ponta a ponta.
        </MarkerContent>
      </Marker>

      {chat.conversation.map((day) => {
        let prev: Message | undefined
        return (
          <React.Fragment key={day.label}>
            <Marker variant="separator" className="my-3">
              <MarkerContent className="rounded-md bg-muted px-3 py-1 text-[0.6875rem] font-medium shadow-sm">
                {day.label}
              </MarkerContent>
            </Marker>

            {day.messages.map((message) => {
              const sameAuthor =
                prev?.fromMe === message.fromMe && prev?.author === message.author
              const showTail = !prev || !sameAuthor || message.type === "system"
              const showAuthor = Boolean(
                showTail && chat.isGroup && !message.fromMe && message.author
              )
              prev = message

              if (message.type === "system" && !message.deleted) {
                return (
                  <Marker key={message.id} variant="separator" className="my-2">
                    <MarkerContent className="rounded-md bg-muted/80 px-2.5 py-1 text-[0.6875rem] shadow-sm">
                      {message.text}
                    </MarkerContent>
                  </Marker>
                )
              }

              return (
                <React.Fragment key={message.id}>
                  {firstUnreadId === message.id ? (
                    <Marker variant="separator" className="my-3">
                      <MarkerContent className="rounded-md bg-muted px-3 py-1 text-[0.625rem] font-semibold tracking-wide uppercase shadow-sm">
                        Mensagens não lidas
                      </MarkerContent>
                    </Marker>
                  ) : null}

                  <MessageScrollerItem messageId={message.id} scrollAnchor>
                    <MessageBubble
                      message={message}
                      showTail={showTail}
                      showAuthor={showAuthor}
                      replyTo={
                        message.replyToId
                          ? findMessage(chat, message.replyToId)
                          : undefined
                      }
                      isGroup={Boolean(chat.isGroup)}
                      selectionMode={selectionMode}
                      selected={state.selectedMessageIds.includes(message.id)}
                      onToggleSelect={() =>
                        dispatch({ type: "TOGGLE_SELECT", messageId: message.id })
                      }
                      onReply={() =>
                        dispatch({ type: "SET_REPLY", messageId: message.id })
                      }
                      onReact={(emoji) =>
                        dispatch({
                          type: "REACT",
                          chatId: chat.id,
                          messageId: message.id,
                          emoji,
                        })
                      }
                      onDelete={() =>
                        dispatch({
                          type: "DELETE_MESSAGES",
                          chatId: chat.id,
                          messageIds: [message.id],
                        })
                      }
                      onStar={() =>
                        dispatch({
                          type: "STAR_MESSAGES",
                          chatId: chat.id,
                          messageIds: [message.id],
                        })
                      }
                      onPin={() =>
                        dispatch({
                          type: "PIN_MESSAGE",
                          chatId: chat.id,
                          messageId: message.id,
                        })
                      }
                      onForward={() => onForwardRequest([message])}
                      onJumpToReply={(id) => scrollToMessage(id, { align: "center" })}
                    />
                  </MessageScrollerItem>
                </React.Fragment>
              )
            })}
          </React.Fragment>
        )
      })}

      {chat.typing ? (
        <div className="mt-2 flex justify-start px-2">
          <div className="flex items-center gap-1 rounded-lg rounded-tl-none border border-border bg-background px-3 py-2 shadow-sm">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        </div>
      ) : null}
    </MessageScrollerContent>
  )
}

export function Conversation({ chat }: { chat: Chat }) {
  const { state, dispatch } = useStore()
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [forwarding, setForwarding] = React.useState<Message[] | null>(null)

  // Snapshot the unread count when the chat opens — selecting it clears the
  // badge, but the divider should stay put while you read.
  const [unreadAtOpen, setUnreadAtOpen] = React.useState(chat.unread ?? 0)
  const [openedId, setOpenedId] = React.useState(chat.id)
  if (openedId !== chat.id) {
    // Derive state from a prop change — React's sanctioned in-render update,
    // which stays correct under StrictMode's double invocation.
    setOpenedId(chat.id)
    setUnreadAtOpen(chat.unread ?? 0)
  }

  const pinned = React.useMemo(
    () => allMessages(chat).find((m) => m.pinned && !m.deleted),
    [chat]
  )
  const selectedIds = state.selectedMessageIds
  const selectionMode = selectedIds.length > 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header — swaps to a selection action bar while selecting. */}
      {selectionMode ? (
        <header className="flex h-14 items-center gap-2 border-b border-border bg-background px-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cancelar seleção"
            onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
          >
            <Icon icon={CloseIcon} />
          </Button>
          <span className="flex-1 text-sm font-medium">
            {selectedIds.length} selecionada{selectedIds.length > 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Encaminhar"
            onClick={() =>
              setForwarding(
                allMessages(chat).filter((m) => selectedIds.includes(m.id))
              )
            }
          >
            <Icon icon={ForwardIcon} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Favoritar"
            onClick={() =>
              dispatch({
                type: "STAR_MESSAGES",
                chatId: chat.id,
                messageIds: selectedIds,
              })
            }
          >
            <Icon icon={StarIcon} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Apagar"
            onClick={() =>
              dispatch({
                type: "DELETE_MESSAGES",
                chatId: chat.id,
                messageIds: selectedIds,
              })
            }
          >
            <Icon icon={DeleteIcon} />
          </Button>
        </header>
      ) : (
        <header className="flex h-14 items-center gap-2 border-b border-border bg-background px-2 sm:px-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Voltar"
            onClick={() => dispatch({ type: "SELECT_CHAT", chatId: null })}
          >
            <Icon icon={BackIcon} className="size-5" />
          </Button>

          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left outline-none hover:bg-muted focus-visible:bg-muted"
          >
            <Avatar>
              <AvatarFallback
                className={cn("text-xs font-medium", avatarTints[chat.tint])}
              >
                {initials(chat.name)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="flex items-center gap-1">
                <span className="truncate text-sm font-medium">{chat.name}</span>
                {chat.muted ? (
                  <Icon icon={MuteIcon} className="size-3 text-muted-foreground" />
                ) : null}
              </span>
              <span
                className={cn(
                  "block truncate text-xs",
                  chat.typing ? "text-foreground/80" : "text-muted-foreground"
                )}
              >
                {presenceLabel(chat)}
              </span>
            </span>
          </button>

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
                  aria-label="Pesquisar na conversa"
                  onClick={() => setSearchOpen(true)}
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
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onSelect={() => setPanelOpen(true)}>
                  Dados do contato
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSearchOpen(true)}>
                  <Icon icon={SearchIcon} />
                  Pesquisar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    dispatch({
                      type: "CHAT_FLAG",
                      chatId: chat.id,
                      flag: "muted",
                      value: !chat.muted,
                    })
                  }
                >
                  <Icon icon={MuteIcon} />
                  {chat.muted ? "Reativar notificações" : "Silenciar"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    dispatch({
                      type: "CHAT_FLAG",
                      chatId: chat.id,
                      flag: "archived",
                      value: true,
                    })
                  }
                >
                  <Icon icon={ForwardIcon} />
                  Arquivar conversa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() =>
                    dispatch({ type: "DELETE_CHAT", chatId: chat.id })
                  }
                >
                  <Icon icon={DeleteIcon} />
                  Apagar conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}

      {/* Pinned message banner */}
      {pinned ? (
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-1.5">
          <Icon icon={PinIcon} className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {messagePreview(pinned)}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Desafixar"
            onClick={() =>
              dispatch({
                type: "PIN_MESSAGE",
                chatId: chat.id,
                messageId: pinned.id,
              })
            }
          >
            <Icon icon={CloseIcon} />
          </Button>
        </div>
      ) : null}

      {/* Transcript */}
      <div className="chat-wallpaper min-h-0 flex-1">
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller>
            <MessageScrollerViewport className="thin-scroll">
              <Transcript
                chat={chat}
                unreadAtOpen={unreadAtOpen}
                onForwardRequest={setForwarding}
              />
            </MessageScrollerViewport>
            <MessageScrollerButton direction="end" />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      <ChatComposer chat={chat} />

      <ContactPanel chat={chat} open={panelOpen} onOpenChange={setPanelOpen} />
      <ConversationSearch
        chat={chat}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
      <ForwardDialog
        messages={forwarding}
        onOpenChange={(open) => !open && setForwarding(null)}
      />
    </div>
  )
}
