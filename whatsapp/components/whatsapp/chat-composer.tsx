"use client"

import * as React from "react"

import { findMessage, messagePreview } from "@/lib/data"
import { placeholderPhoto, waveform } from "@/lib/media"
import { useStore } from "@/lib/store"
import type { Chat } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { EmojiPicker } from "./emoji-picker"
import { Icon } from "./icon"
import {
  AttachIcon,
  CameraIcon,
  CloseIcon,
  ContactIcon,
  DeleteIcon,
  DocumentIcon,
  EmojiIcon,
  ImageIcon,
  LocationIcon,
  MicIcon,
  SendIcon,
} from "./icons"
import { useSendMessage } from "./use-send-message"

export function ChatComposer({ chat }: { chat: Chat }) {
  const { state, dispatch } = useStore()
  const send = useSendMessage(chat)
  // Seeded from the chat's draft. The parent mounts this with key={chat.id},
  // so switching conversations gives a fresh box instead of carrying text over
  // and stamping it as the next chat's draft.
  const [value, setValue] = React.useState(chat.draft ?? "")
  const [emojiOpen, setEmojiOpen] = React.useState(false)
  const [recording, setRecording] = React.useState(false)
  const [seconds, setSeconds] = React.useState(0)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const replyTo = state.replyToId ? findMessage(chat, state.replyToId) : undefined
  const editing = state.editingId ? findMessage(chat, state.editingId) : undefined

  // Load the message text when an edit starts (in-render derived state, so no
  // setState-in-effect).
  const [editingId, setEditingId] = React.useState(state.editingId)
  if (editingId !== state.editingId) {
    setEditingId(state.editingId)
    if (editing && editing.type === "text") setValue(editing.text)
    if (!state.editingId) setValue("")
  }
  const hasText = value.trim().length > 0

  // Focus the box when a reply starts, like the real app.
  React.useEffect(() => {
    if (replyTo) inputRef.current?.focus()
  }, [replyTo])

  // Recording timer.
  React.useEffect(() => {
    if (!recording) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [recording])

  // Persist the draft so it shows in the chat list, as WhatsApp does.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      if (!state.editingId && (chat.draft ?? "") !== value) {
        dispatch({ type: "SET_DRAFT", chatId: chat.id, draft: value })
      }
    }, 400)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, chat.id, state.editingId])

  function sendText() {
    const text = value.trim()
    if (!text) return
    if (editing) {
      dispatch({
        type: "EDIT_MESSAGE",
        chatId: chat.id,
        messageId: editing.id,
        text,
      })
    } else {
      send({ type: "text", text })
    }
    setValue("")
  }

  function cancelEdit() {
    dispatch({ type: "SET_EDITING", messageId: null })
    setValue("")
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendText()
    }
    if (e.key === "Escape") {
      if (editing) cancelEdit()
      else if (replyTo) dispatch({ type: "SET_REPLY", messageId: null })
    }
  }

  function stopRecording(sendIt: boolean) {
    setRecording(false)
    const duration = Math.max(1, seconds)
    setSeconds(0)
    if (sendIt) {
      send({
        type: "audio",
        duration,
        waveform: waveform(duration * 7),
        voice: true,
      })
    }
  }

  return (
    <div className="border-t border-border bg-background">
      {/* Editing banner */}
      {editing ? (
        <div className="flex items-center gap-2 px-3 pt-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-md border-l-2 border-foreground/40 bg-muted/60 px-2.5 py-1.5">
            <span className="text-[0.6875rem] font-semibold">
              Editando mensagem
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {messagePreview(editing)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancelar edição"
            onClick={cancelEdit}
          >
            <Icon icon={CloseIcon} />
          </Button>
        </div>
      ) : null}

      {/* Reply preview */}
      {replyTo && !editing ? (
        <div className="flex items-center gap-2 px-3 pt-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-md border-l-2 border-foreground/40 bg-muted/60 px-2.5 py-1.5">
            <span className="text-[0.6875rem] font-semibold">
              {replyTo.fromMe ? "Você" : (replyTo.author ?? chat.name)}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {messagePreview(replyTo)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancelar resposta"
            onClick={() => dispatch({ type: "SET_REPLY", messageId: null })}
          >
            <Icon icon={CloseIcon} />
          </Button>
        </div>
      ) : null}

      {recording ? (
        <div className="flex items-center gap-3 px-3 py-3">
          <span className="size-2.5 animate-pulse rounded-full bg-destructive" />
          <span className="font-mono text-sm">
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
          </span>
          <span className="flex-1 text-xs text-muted-foreground">
            Gravando mensagem de voz…
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cancelar gravação"
            onClick={() => stopRecording(false)}
          >
            <Icon icon={DeleteIcon} />
          </Button>
          <Button size="icon" aria-label="Enviar gravação" onClick={() => stopRecording(true)}>
            <Icon icon={SendIcon} />
          </Button>
        </div>
      ) : (
        <div className="flex items-end gap-1.5 px-3 py-2.5">
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Emoji">
                <Icon icon={EmojiIcon} className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-auto p-2">
              <EmojiPicker
                onPick={(emoji) => {
                  setValue((v) => v + emoji)
                  inputRef.current?.focus()
                }}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Anexar">
                <Icon icon={AttachIcon} className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-48">
              <DropdownMenuItem
                onSelect={() =>
                  send({
                    type: "document",
                    filename: "documento.pdf",
                    size: "820 KB",
                    ext: "PDF",
                    pages: 12,
                  })
                }
              >
                <Icon icon={DocumentIcon} />
                Documento
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  send({
                    type: "image",
                    url: placeholderPhoto(Math.floor(Math.random() * 999)),
                  })
                }
              >
                <Icon icon={ImageIcon} />
                Fotos e vídeos
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  send({
                    type: "image",
                    url: placeholderPhoto(Math.floor(Math.random() * 999)),
                    caption: "Foto tirada agora",
                  })
                }
              >
                <Icon icon={CameraIcon} />
                Câmera
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  send({
                    type: "location",
                    label: "Localização atual",
                    address: "São Paulo - SP",
                  })
                }
              >
                <Icon icon={LocationIcon} />
                Localização
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  send({
                    type: "contact",
                    contactName: "Ana Beatriz",
                    phone: "+55 11 98123-4567",
                  })
                }
              >
                <Icon icon={ContactIcon} />
                Contato
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Digite uma mensagem"
            aria-label="Digite uma mensagem"
            className={cn(
              "thin-scroll max-h-32 min-h-8 flex-1 resize-none py-1.5 text-sm"
            )}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={hasText ? "default" : "ghost"}
                aria-label={hasText ? "Enviar" : "Mensagem de voz"}
                onClick={() => (hasText ? sendText() : setRecording(true))}
              >
                <Icon
                  icon={hasText ? SendIcon : MicIcon}
                  className="size-5"
                  strokeWidth={hasText ? 2 : 1.8}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasText ? "Enviar" : "Mensagem de voz"}
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
