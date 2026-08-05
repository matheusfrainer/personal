"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Icon } from "./icon"
import {
  AttachIcon,
  CameraIcon,
  ContactIcon,
  DocumentIcon,
  EmojiIcon,
  ImageIcon,
  MicIcon,
  SendIcon,
} from "./icons"

export function ChatComposer({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = React.useState("")
  const hasText = value.trim().length > 0

  function send() {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue("")
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex items-end gap-1.5 bg-background px-3 py-2.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Emoji">
            <Icon icon={EmojiIcon} className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Emoji</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Anexar">
            <Icon icon={AttachIcon} className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-44">
          <DropdownMenuItem>
            <Icon icon={DocumentIcon} />
            Documento
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon={ImageIcon} />
            Fotos e vídeos
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon={CameraIcon} />
            Câmera
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon={ContactIcon} />
            Contato
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Digite uma mensagem"
          aria-label="Digite uma mensagem"
          className="thin-scroll max-h-32 min-h-8 w-full resize-none rounded-lg border border-input bg-input/20 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={hasText ? "default" : "ghost"}
            aria-label={hasText ? "Enviar" : "Mensagem de voz"}
            onClick={send}
          >
            <Icon
              icon={hasText ? SendIcon : MicIcon}
              className="size-5"
              strokeWidth={hasText ? 2 : 1.8}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{hasText ? "Enviar" : "Mensagem de voz"}</TooltipContent>
      </Tooltip>
    </div>
  )
}
