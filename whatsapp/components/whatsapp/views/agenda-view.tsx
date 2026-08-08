"use client"

import * as React from "react"
import { toast } from "sonner"

import { evaluate } from "@/lib/automation-engine"
import {
  crmOf,
  daysUntilBirthday,
  formatDate,
  suitabilityStatus,
} from "@/lib/crm"
import { avatarTints, initials } from "@/lib/data"
import { nextId } from "@/lib/id"
import { useStore } from "@/lib/store"
import type { PendingAction } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { Icon } from "../icon"
import {
  AgendaIcon,
  ApproveIcon,
  BirthdayIcon,
  CloseIcon,
  EditIcon,
  SuitabilityIcon,
} from "../icons"
import { WorkspaceShell } from "./workspace-shell"

function ActionCard({ action }: { action: PendingAction }) {
  const { state, dispatch } = useStore()
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(action.message)
  const chat = state.chats.find((c) => c.id === action.chatId)
  if (!chat) return null

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex items-start gap-2.5">
        <Avatar size="sm">
          <AvatarFallback
            className={cn("text-[0.625rem]", avatarTints[chat.tint])}
          >
            {initials(chat.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-medium">
            <span className="truncate">{chat.name}</span>
            <Badge variant="secondary">{action.scheduledFor}</Badge>
          </p>
          <p className="truncate text-[0.625rem] text-muted-foreground">
            {action.reason}
          </p>
        </div>
        {action.status === "pending" ? (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Editar mensagem para ${chat.name}`}
              onClick={() => setEditing((v) => !v)}
            >
              <Icon icon={EditIcon} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Recusar automação de ${chat.name}`}
              onClick={() =>
                dispatch({
                  type: "REVIEW_ACTIONS",
                  ids: [action.id],
                  status: "declined",
                })
              }
            >
              <Icon icon={CloseIcon} />
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() =>
                dispatch({
                  type: "REVIEW_ACTIONS",
                  ids: [action.id],
                  status: "approved",
                })
              }
            >
              Aprovar
            </Button>
          </>
        ) : (
          <Badge variant={action.status === "sent" ? "secondary" : "outline"}>
            {action.status === "approved"
              ? "aguardando horário"
              : action.status === "sent"
                ? "enviada"
                : "recusada"}
          </Badge>
        )}
      </div>

      {editing ? (
        <div className="mt-2">
          <Textarea
            value={draft}
            aria-label="Mensagem da automação"
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-16 resize-none text-xs"
          />
          <Button
            size="xs"
            className="mt-1.5"
            onClick={() => {
              dispatch({ type: "EDIT_PENDING", id: action.id, message: draft })
              setEditing(false)
            }}
          >
            Salvar mensagem
          </Button>
        </div>
      ) : (
        <p className="mt-2 rounded-md bg-muted/60 px-2.5 py-2 text-xs/relaxed">
          {action.message}
        </p>
      )}
    </li>
  )
}

/** Dates worth knowing today, independent of any automation rule. */
function Upcoming() {
  const { state } = useStore()
  const now = React.useMemo(() => new Date(), [])

  const rows = state.chats
    .filter((c) => !c.isGroup && !c.archived)
    .flatMap((chat) => {
      const crm = crmOf(chat)
      const out: { icon: typeof BirthdayIcon; label: string; when: string }[] =
        []
      if (crm.profile.birthDate) {
        const days = daysUntilBirthday(crm.profile.birthDate, now)
        if (Number.isFinite(days) && days <= 30) {
          out.push({
            icon: BirthdayIcon,
            label: `Aniversário de ${chat.name}`,
            when: days === 0 ? "hoje" : `em ${days} dias`,
          })
        }
      }
      const s = suitabilityStatus(crm.profile, now)
      if (s && s.daysLeft <= 60) {
        out.push({
          icon: SuitabilityIcon,
          label: `Suitability de ${chat.name}`,
          when:
            s.daysLeft < 0
              ? `vencida em ${formatDate(s.expiresAt)}`
              : `vence em ${s.daysLeft} dias`,
        })
      }
      return out
    })

  if (!rows.length) return null

  return (
    <section className="px-4 py-4">
      <h2 className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
        Próximos 30 dias
      </h2>
      <ul className="mt-2.5 space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2.5 text-xs">
            <Icon icon={row.icon} className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{row.label}</span>
            <span className="shrink-0 text-muted-foreground">{row.when}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AgendaView() {
  const { state, dispatch } = useStore()

  const pending = state.pending.filter((p) => p.status === "pending")
  const approved = state.pending.filter((p) => p.status === "approved")
  const done = state.pending.filter(
    (p) => p.status === "sent" || p.status === "declined"
  )

  function refresh() {
    const actions = evaluate(state.chats, state.automations, new Date(), nextId)
    dispatch({ type: "SET_PENDING", actions })
    toast(
      actions.length === 0
        ? "Nenhum gatilho ativo agora"
        : actions.length === 1
          ? "1 ação encontrada"
          : `${actions.length} ações encontradas`
    )
  }

  return (
    <WorkspaceShell
      title="Agenda"
      description="Aprove de uma vez o que sai ao longo do dia"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            Reavaliar
          </Button>
          <Button
            size="sm"
            disabled={!pending.length}
            onClick={() =>
              dispatch({
                type: "REVIEW_ACTIONS",
                ids: pending.map((p) => p.id),
                status: "approved",
              })
            }
          >
            <Icon icon={ApproveIcon} />
            Aprovar tudo ({pending.length})
          </Button>
        </div>
      }
    >
      {pending.length ? (
        <section className="px-4 py-4">
          <h2 className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
            Para aprovar
          </h2>
          <ul className="mt-2.5 space-y-2">
            {pending.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </ul>
        </section>
      ) : (
        <Empty className="px-6 py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={AgendaIcon} />
            </EmptyMedia>
            <EmptyTitle>Nada para aprovar</EmptyTitle>
            <EmptyDescription>
              Quando uma automação disparar, ela aparece aqui antes de sair.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {approved.length ? (
        <>
          <Separator />
          <section className="px-4 py-4">
            <h2 className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
              Aprovadas · aguardando horário
            </h2>
            <ul className="mt-2.5 space-y-2">
              {approved.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <Separator />
      <Upcoming />

      {done.length ? (
        <>
          <Separator />
          <section className="px-4 py-4">
            <h2 className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
              Resolvidas hoje
            </h2>
            <ul className="mt-2.5 space-y-2">
              {done.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {/* Stated plainly: there is no server here, so an approved action can't
          fire while the app is closed. */}
      <p className="px-4 pb-6 text-[0.625rem]/relaxed text-muted-foreground">
        As aprovadas saem no horário configurado enquanto o WhatsApp estiver
        aberto. Com a aba fechada, elas aguardam e disparam na próxima vez que
        você abrir.
      </p>
    </WorkspaceShell>
  )
}
