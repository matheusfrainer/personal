import type { Message } from "@/lib/data"
import { cn } from "@/lib/utils"

import { StatusTicks } from "./status-ticks"

interface MessageBubbleProps {
  message: Message
  /** first message of a consecutive run from the same author */
  showTail: boolean
  /** show the author label (group incoming messages only) */
  showAuthor: boolean
}

export function MessageBubble({
  message,
  showTail,
  showAuthor,
}: MessageBubbleProps) {
  const { fromMe } = message

  return (
    <div
      className={cn(
        "flex w-full",
        fromMe ? "justify-end" : "justify-start",
        showTail ? "mt-2 first:mt-0" : "mt-0.5"
      )}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-lg px-2 py-1 text-sm shadow-sm sm:max-w-[65%]",
          fromMe
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground",
          showTail && (fromMe ? "rounded-tr-none" : "rounded-tl-none"),
          showTail && (fromMe ? "bubble-tail-out" : "bubble-tail-in")
        )}
      >
        {showAuthor && message.author ? (
          <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
            {message.author}
          </p>
        ) : null}

        <div className="flex flex-wrap items-end justify-end gap-x-2">
          <p className="mr-auto leading-relaxed break-words whitespace-pre-wrap">
            {message.text}
          </p>
          <span
            className={cn(
              "flex translate-y-0.5 items-center gap-0.5 text-[0.625rem] whitespace-nowrap",
              fromMe ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {message.time}
            {fromMe ? (
              <StatusTicks
                status={message.status}
                className="text-primary-foreground/70"
              />
            ) : null}
          </span>
        </div>
      </div>
    </div>
  )
}
