import { Icon } from "./icon"
import { CheckDoubleIcon, CommunitiesIcon } from "./icons"

export function EmptyConversation() {
  return (
    <div className="chat-wallpaper flex h-full flex-col items-center justify-center gap-4 border-b-4 border-primary/40 px-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-background shadow-sm">
        <Icon
          icon={CommunitiesIcon}
          className="size-11 text-muted-foreground"
          strokeWidth={1.4}
        />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-light tracking-tight">WhatsApp Web</h2>
        <p className="text-sm text-muted-foreground">
          Selecione uma conversa à esquerda para começar a enviar mensagens.
          Tudo aqui é construído com componentes do shadcn/ui — estilo Mira,
          tema Neutro e fonte Geist.
        </p>
      </div>
      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon icon={CheckDoubleIcon} className="size-3.5" />
        Suas mensagens são protegidas com criptografia de ponta a ponta
      </p>
    </div>
  )
}
