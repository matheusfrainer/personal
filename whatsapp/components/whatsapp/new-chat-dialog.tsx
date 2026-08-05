"use client"

import { avatarTints, initials } from "@/lib/data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

/** Quick chat switcher, WhatsApp's "nova conversa" panel. */
export function NewChatDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { state, dispatch } = useStore()
  const contacts = state.chats.filter((c) => !c.isGroup)
  const groups = state.chats.filter((c) => c.isGroup)

  function pick(id: string) {
    dispatch({ type: "SET_SHOW_ARCHIVED", value: false })
    dispatch({ type: "SELECT_CHAT", chatId: id })
    onOpenChange(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nova conversa"
      description="Escolha um contato ou grupo"
    >
      <CommandInput placeholder="Pesquisar contato ou grupo…" />
      <CommandList>
        <CommandEmpty>Nenhum contato ou grupo encontrado.</CommandEmpty>
        <CommandGroup heading="Contatos">
          {contacts.map((chat) => (
            <CommandItem
              key={chat.id}
              value={`${chat.id} ${chat.name}`}
              onSelect={() => pick(chat.id)}
            >
              <Avatar size="sm">
                <AvatarFallback
                  className={cn("text-[0.625rem]", avatarTints[chat.tint])}
                >
                  {initials(chat.name)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{chat.name}</span>
              {chat.about ? (
                <span className="truncate text-[0.625rem] text-muted-foreground">
                  {chat.about}
                </span>
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Grupos">
          {groups.map((chat) => (
            <CommandItem
              key={chat.id}
              value={`${chat.id} ${chat.name}`}
              onSelect={() => pick(chat.id)}
            >
              <Avatar size="sm">
                <AvatarFallback
                  className={cn("text-[0.625rem]", avatarTints[chat.tint])}
                >
                  {initials(chat.name)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{chat.name}</span>
              <span className="text-[0.625rem] text-muted-foreground">
                {chat.members?.length ?? 0} membros
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
