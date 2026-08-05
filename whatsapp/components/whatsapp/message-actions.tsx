"use client"

import * as React from "react"
import { toast } from "sonner"

import type { Message } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Icon } from "./icon"
import {
  ChevronDownIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  EmojiIcon,
  ForwardIcon,
  PinIcon,
  ReplyIcon,
  SelectIcon,
  StarIcon,
} from "./icons"

/** The reaction shortcuts WhatsApp offers before "more". */
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

interface MessageActionsProps {
  message: Message
  onReply: () => void
  onReact: (emoji: string) => void
  onDelete: () => void
  onStar: () => void
  onPin: () => void
  onForward: () => void
  onSelect: () => void
  onEdit: () => void
}

export function MessageActions({
  message,
  onReply,
  onReact,
  onDelete,
  onStar,
  onPin,
  onForward,
  onSelect,
  onEdit,
}: MessageActionsProps) {
  const [reactOpen, setReactOpen] = React.useState(false)

  function copy() {
    if (message.type !== "text") return
    // writeText rejects in insecure contexts and when permission is denied;
    // swallowing it would surface as an unhandled rejection with no feedback.
    navigator.clipboard
      ?.writeText(message.text)
      .then(() => toast("Mensagem copiada"))
      .catch(() => toast("Não foi possível copiar a mensagem"))
  }

  return (
    <div className="flex -translate-y-1 items-start gap-0.5 self-start opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100">
      <Popover open={reactOpen} onOpenChange={setReactOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Reagir"
            className="rounded-full bg-background/80 shadow-sm"
          >
            <Icon icon={EmojiIcon} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1" align="center">
          <div className="flex items-center gap-0.5">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onReact(emoji)
                  setReactOpen(false)
                }}
                className="rounded-full p-1 text-lg leading-none transition-transform hover:scale-125 hover:bg-muted"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Opções da mensagem"
            className="rounded-full bg-background/80 shadow-sm"
          >
            <Icon icon={ChevronDownIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={onReply}>
            <Icon icon={ReplyIcon} />
            Responder
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onForward}>
            <Icon icon={ForwardIcon} />
            Encaminhar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onStar}>
            <Icon icon={StarIcon} />
            {message.starred ? "Desfavoritar" : "Favoritar"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onPin}>
            <Icon icon={PinIcon} />
            {message.pinned ? "Desafixar" : "Fixar"}
          </DropdownMenuItem>
          {message.fromMe && message.type === "text" ? (
            <DropdownMenuItem onSelect={onEdit}>
              <Icon icon={EditIcon} />
              Editar
            </DropdownMenuItem>
          ) : null}
          {message.type === "text" ? (
            <DropdownMenuItem onSelect={copy}>
              <Icon icon={CopyIcon} />
              Copiar
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={onSelect}>
            <Icon icon={SelectIcon} />
            Selecionar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Icon icon={DeleteIcon} />
            Apagar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
