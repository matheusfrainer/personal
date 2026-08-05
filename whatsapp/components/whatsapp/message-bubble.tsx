"use client"

import { messagePreview } from "@/lib/data"
import { useStore } from "@/lib/store"
import type { Message as MessageType } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/bubble"
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"

import { AudioMessage } from "./audio-message"
import { Icon } from "./icon"
import { BlockIcon, ForwardIcon, StarIcon } from "./icons"
import {
  ContactBubbleMessage,
  DocumentBubbleMessage,
  ImageBubbleMessage,
  LocationBubbleMessage,
  VideoBubbleMessage,
} from "./media-message"
import { MessageActions } from "./message-actions"
import { RichText } from "./rich-text"
import { StatusTicks } from "./status-ticks"

interface MessageBubbleProps {
  message: MessageType
  /** first message of a consecutive run from the same author */
  showTail: boolean
  /** show the author label (incoming group messages only) */
  showAuthor: boolean
  /** the message this one replies to, already resolved */
  replyTo?: MessageType
  isGroup: boolean
  selectionMode: boolean
  selected: boolean
  onToggleSelect: () => void
  onReply: () => void
  onReact: (emoji: string) => void
  onDelete: () => void
  onStar: () => void
  onPin: () => void
  onForward: () => void
  onEdit: () => void
  onJumpToReply: (id: string) => void
}

/** Media types render edge-to-edge, so the bubble drops its padding. */
function isFlush(message: MessageType) {
  return (
    !message.deleted && (message.type === "image" || message.type === "video")
  )
}

function Body({ message }: { message: MessageType }) {
  if (message.deleted) {
    return (
      <span className="flex items-center gap-1.5 italic opacity-70">
        <Icon icon={BlockIcon} className="size-3.5" />
        Esta mensagem foi apagada
      </span>
    )
  }

  switch (message.type) {
    case "text":
      return (
        <span className="leading-relaxed break-words whitespace-pre-wrap">
          <RichText>{message.text}</RichText>
        </span>
      )
    case "image":
      return <ImageBubbleMessage message={message} />
    case "video":
      return <VideoBubbleMessage message={message} />
    case "audio":
      return <AudioMessage message={message} outgoing={message.fromMe} />
    case "document":
      return <DocumentBubbleMessage message={message} />
    case "location":
      return <LocationBubbleMessage message={message} />
    case "contact":
      return <ContactBubbleMessage message={message} />
    case "sticker":
      return <span className="text-5xl leading-none">{message.emoji}</span>
    case "system":
      return <span>{message.text}</span>
  }
}

export function MessageBubble({
  message,
  showTail,
  showAuthor,
  replyTo,
  isGroup,
  selectionMode,
  selected,
  onToggleSelect,
  onReply,
  onReact,
  onDelete,
  onStar,
  onPin,
  onForward,
  onEdit,
  onJumpToReply,
}: MessageBubbleProps) {
  const { state } = useStore()
  const readReceipts = state.preferences.readReceipts
  const { fromMe } = message
  const align = fromMe ? "end" : "start"
  const sticker = message.type === "sticker" && !message.deleted
  const flush = isFlush(message)

  return (
    <Message
      align={align}
      data-selected={selected || undefined}
      className={cn(
        "scroll-mt-20 px-2 transition-colors",
        showTail ? "mt-2 first:mt-0" : "mt-0.5",
        // BubbleReactions overhangs the bubble's bottom edge, so reserve room
        // or the next message collides with the pill.
        message.reactions?.length && "mb-3.5",
        // Selection highlight spans the full row, like the real app.
        selected && "-mx-2 bg-foreground/5 px-4",
        selectionMode && "cursor-pointer"
      )}
      onClick={selectionMode ? onToggleSelect : undefined}
    >
      <MessageContent className="min-w-0">
        {showAuthor && message.author ? (
          <MessageHeader className="text-foreground/70">
            {message.author}
          </MessageHeader>
        ) : null}

        <Bubble
          variant={sticker ? "ghost" : fromMe ? "tinted" : "outline"}
          align={align}
          className="group/bubble-row max-w-full"
        >
          <BubbleContent
            className={cn(
              "relative text-sm",
              flush && "p-1",
              showTail &&
                !sticker &&
                (fromMe
                  ? "rounded-tr-none bubble-tail-out"
                  : "rounded-tl-none bubble-tail-in")
            )}
          >
            {message.forwarded && !message.deleted ? (
              <span className="mb-0.5 flex items-center gap-1 text-[0.6875rem] italic opacity-60">
                <Icon icon={ForwardIcon} className="size-3" />
                Encaminhada
              </span>
            ) : null}

            {replyTo ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onJumpToReply(replyTo.id)
                }}
                className={cn(
                  "mb-1 flex w-full min-w-0 flex-col gap-0.5 rounded-sm border-l-2 px-2 py-1 text-left",
                  "border-foreground/40 bg-foreground/5 hover:bg-foreground/10"
                )}
              >
                <span className="truncate text-[0.6875rem] font-semibold opacity-80">
                  {replyTo.fromMe ? "Você" : (replyTo.author ?? "Contato")}
                </span>
                <span className="truncate text-[0.6875rem] opacity-70">
                  {messagePreview(replyTo)}
                </span>
              </button>
            ) : null}

            <div className={cn(flush ? "" : "flex flex-wrap items-end justify-end gap-x-2")}>
              <div className={cn("min-w-0", flush ? "" : "mr-auto")}>
                <Body message={message} />
              </div>

              {/* Timestamp sits inside the bubble, as in WhatsApp. */}
              <span
                className={cn(
                  "flex shrink-0 items-center gap-0.5 text-[0.625rem] whitespace-nowrap opacity-60",
                  flush &&
                    "absolute right-2.5 bottom-2.5 rounded bg-background/80 px-1 py-0.5 opacity-100",
                  !flush && "translate-y-0.5"
                )}
              >
                {message.starred ? (
                  <Icon icon={StarIcon} className="size-3" />
                ) : null}
                {message.edited ? <span className="italic">editada</span> : null}
                {message.time}
                {fromMe ? (
                  <StatusTicks
                    // With read receipts off, delivery still shows but the
                    // blue "read" tick never does — same as the real app.
                    status={
                      !readReceipts && message.status === "read"
                        ? "delivered"
                        : message.status
                    }
                  />
                ) : null}
              </span>
            </div>
          </BubbleContent>

          {message.reactions?.length ? (
            <BubbleReactions
              align={align}
              className="cursor-default select-none"
            >
              {message.reactions.map((r) => (
                <span key={r.emoji} className="flex items-center gap-0.5">
                  <span>{r.emoji}</span>
                  {r.by.length > 1 ? (
                    <span className="text-[0.625rem] text-muted-foreground">
                      {r.by.length}
                    </span>
                  ) : null}
                </span>
              ))}
            </BubbleReactions>
          ) : null}
        </Bubble>
      </MessageContent>

      {!selectionMode && !message.deleted ? (
        <MessageActions
          message={message}
          isGroup={isGroup}
          onReply={onReply}
          onReact={onReact}
          onDelete={onDelete}
          onStar={onStar}
          onPin={onPin}
          onForward={onForward}
          onSelect={onToggleSelect}
          onEdit={onEdit}
        />
      ) : null}
    </Message>
  )
}
