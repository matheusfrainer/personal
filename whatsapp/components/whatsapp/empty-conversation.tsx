import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { Icon } from "./icon"
import { ChatsIcon, LockIcon } from "./icons"

export function EmptyConversation() {
  return (
    <div className="chat-wallpaper flex h-full items-center justify-center border-b-4 border-primary/40 px-6">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-20 rounded-full bg-background shadow-sm">
            <Icon
              icon={ChatsIcon}
              className="size-9 text-muted-foreground"
              strokeWidth={1.4}
            />
          </EmptyMedia>
          <EmptyTitle className="text-2xl font-light tracking-tight">
            WhatsApp Web
          </EmptyTitle>
          <EmptyDescription>
            Selecione uma conversa à esquerda para começar a enviar mensagens.
            Tudo aqui é construído com componentes do shadcn/ui — estilo Mira,
            tema Neutro e fonte Geist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon icon={LockIcon} className="size-3.5" />
            Suas mensagens são protegidas com criptografia de ponta a ponta
          </p>
        </EmptyContent>
      </Empty>
    </div>
  )
}
