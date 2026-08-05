"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { avatarTints, initials } from "@/lib/data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { Icon } from "./icon"
import {
  BlockIcon,
  DeleteIcon,
  LockIcon,
  MoonIcon,
  NotificationIcon,
  QrCodeIcon,
  SunIcon,
} from "./icons"

function Row({
  icon,
  title,
  description,
  children,
}: {
  icon: typeof LockIcon
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon icon={icon} className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">{title}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function SettingsView() {
  const { dispatch } = useStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [notifications, setNotifications] = React.useState(true)
  const [readReceipts, setReadReceipts] = React.useState(true)

  const mounted = useHydrated()
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-14 items-center px-3">
        <h1 className="text-base font-semibold">Configurações</h1>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {/* Profile */}
        <div className="flex items-center gap-3 px-4 py-4">
          <Avatar className="size-14">
            <AvatarFallback
              className={cn("text-lg font-medium", avatarTints.neutral)}
            >
              {initials("Você")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Você</p>
            <p className="truncate text-xs text-muted-foreground">
              Disponível · +55 11 90000-0000
            </p>
          </div>
        </div>

        <Separator />

        <Row
          icon={isDark ? SunIcon : MoonIcon}
          title="Tema escuro"
          description="Alterna entre claro e escuro (atalho: tecla D)"
        >
          <Switch
            checked={isDark}
            onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
          />
        </Row>

        <Separator />

        <Row
          icon={NotificationIcon}
          title="Notificações"
          description="Mostrar avisos de novas mensagens"
        >
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </Row>

        <Row
          icon={LockIcon}
          title="Confirmações de leitura"
          description="Se desativado, você não envia nem recebe confirmações"
        >
          <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
        </Row>

        <Separator />

        <Row
          icon={QrCodeIcon}
          title="Aparelhos conectados"
          description="Conectar um novo aparelho com QR code"
        >
          <Button variant="outline" size="sm" asChild>
            <a href="/connect">Abrir</a>
          </Button>
        </Row>

        <Row icon={BlockIcon} title="Contatos bloqueados" description="Nenhum" />

        <Separator />

        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={() => {
              if (
                window.confirm(
                  "Isto apaga as conversas salvas neste navegador e restaura os dados de exemplo. Continuar?"
                )
              ) {
                dispatch({ type: "RESET" })
              }
            }}
          >
            <Icon icon={DeleteIcon} />
            Restaurar dados de exemplo
          </Button>
        </div>
      </div>
    </div>
  )
}
