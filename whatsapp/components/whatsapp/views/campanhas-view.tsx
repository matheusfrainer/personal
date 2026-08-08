"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  allTags,
  crmOf,
  formatCompact,
  relationshipMeta,
  renderTemplate,
  stageMeta,
} from "@/lib/crm"
import { nextId } from "@/lib/id"
import { totalsOf } from "@/lib/portfolio"
import { useStore } from "@/lib/store"
import type { Chat, Message, Relationship } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { CurrencyInput } from "../currency-input"
import { Icon } from "../icon"
import { CampaignIcon } from "../icons"

function nowTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())
}

/**
 * Segmented broadcast. Deliberately shows the full recipient list before
 * sending: this writes into real conversations, and a bad filter is only
 * obvious when you can see the names it produced.
 */
export function CampanhasView() {
  const { state, dispatch } = useStore()
  const [name, setName] = React.useState("")
  const [message, setMessage] = React.useState(
    "Oi {primeiro_nome}, tudo bem? Queria te falar de uma oportunidade que combina com o seu perfil."
  )
  const [tags, setTags] = React.useState<string[]>([])
  const [rel, setRel] = React.useState<Relationship | "todos">("todos")
  const [minNetWorth, setMinNetWorth] = React.useState<number | undefined>()

  const available = allTags(state.chats)
  const audience = state.campaignAudience

  const recipients: Chat[] = React.useMemo(
    () =>
      state.chats.filter((chat) => {
        if (chat.isGroup || chat.archived) return false
        // An explicit audience handed over from a bulk selection wins over the
        // filters — the user already picked those names by hand.
        if (audience) return audience.includes(chat.id)
        const crm = crmOf(chat)
        if (rel !== "todos" && crm.relationship !== rel) return false
        if (tags.length && !tags.every((t) => crm.tags.includes(t)))
          return false
        if (minNetWorth != null && totalsOf(chat).netWorth < minNetWorth) {
          return false
        }
        return true
      }),
    [state.chats, rel, tags, minNetWorth, audience]
  )

  function send() {
    for (const chat of recipients) {
      const text = renderTemplate(message, chat, totalsOf(chat).netWorth)
      dispatch({
        type: "SEND",
        chatId: chat.id,
        message: {
          type: "text",
          id: nextId(),
          fromMe: true,
          text,
          time: nowTime(),
          status: "sent",
        } as Message,
      })
      dispatch({
        type: "LOG_EVENT",
        chatId: chat.id,
        event: {
          type: "campaign",
          label: "Campanha enviada",
          detail: name || "Sem nome",
        },
      })
    }
    dispatch({
      type: "SAVE_CAMPAIGN",
      campaign: {
        id: nextId(),
        name: name || "Sem nome",
        message,
        recipients: recipients.map((c) => c.id),
        sentAt: Date.now(),
        createdAt: Date.now(),
      },
    })
    toast("Campanha enviada", {
      description: `${recipients.length} mensagem${recipients.length > 1 ? "s" : ""} entregue${recipients.length > 1 ? "s" : ""}.`,
    })
    setName("")
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      <section className="space-y-3">
        <h2 className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
          Nova campanha
        </h2>

        {audience ? (
          <div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2">
            <p className="flex-1 text-xs">
              Público definido por seleção: {audience.length} contato
              {audience.length > 1 ? "s" : ""}.
            </p>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => dispatch({ type: "SET_AUDIENCE", chatIds: null })}
            >
              Usar filtros
            </Button>
          </div>
        ) : null}

        <div className="space-y-1">
          <Label htmlFor="campanha-nome">Nome</Label>
          <Input
            id="campanha-nome"
            value={name}
            placeholder="CDB 118% do CDI"
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="campanha-vinculo">Vínculo</Label>
          <Select
            value={rel}
            onValueChange={(value) => setRel(value as Relationship | "todos")}
            disabled={Boolean(audience)}
          >
            <SelectTrigger id="campanha-vinculo" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os vínculos</SelectItem>
              {(["lead", "cliente", "inativo"] as const).map((value) => (
                <SelectItem key={value} value={value}>
                  {relationshipMeta[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {available.length ? (
          <div>
            <p className="text-[0.6875rem] text-muted-foreground">
              Tags (todas precisam bater)
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {available.map((tag) => {
                const active = tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-label={`Filtrar por tag: ${tag}`}
                    aria-pressed={active}
                    onClick={() =>
                      setTags(
                        active ? tags.filter((t) => t !== tag) : [...tags, tag]
                      )
                    }
                    className="outline-none"
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer",
                        !active && "hover:bg-muted"
                      )}
                    >
                      {tag}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <Label>Patrimônio mínimo</Label>
          <CurrencyInput
            aria-label="Patrimônio mínimo"
            value={minNetWorth}
            placeholder="Sem mínimo"
            onCommit={setMinNetWorth}
            className="w-44"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="campanha-mensagem">Mensagem</Label>
          <Textarea
            id="campanha-mensagem"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-28 resize-none text-xs"
          />
          <p className="text-[0.625rem] text-muted-foreground">
            Variáveis: {"{primeiro_nome}"}, {"{nome}"}, {"{patrimonio}"},{" "}
            {"{etapa}"}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
            Destinatários
          </h2>
          <span className="text-[0.6875rem] text-muted-foreground tabular-nums">
            {recipients.length}
          </span>
        </div>

        <div className="thin-scroll max-h-64 overflow-y-auto rounded-lg border border-border">
          {recipients.length ? (
            <ul className="divide-y divide-border">
              {recipients.map((chat) => (
                <li
                  key={chat.id}
                  className="flex items-baseline gap-2 px-3 py-1.5 text-xs"
                >
                  <span className="min-w-0 flex-1 truncate">{chat.name}</span>
                  <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                    {stageMeta[crmOf(chat).stage].label}
                  </span>
                  <span className="w-16 shrink-0 text-right text-[0.625rem] text-muted-foreground tabular-nums">
                    {formatCompact(totalsOf(chat).netWorth)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Nenhum contato bate com esses filtros.
            </p>
          )}
        </div>

        {recipients.length ? (
          <div className="rounded-lg border border-border p-3">
            <p className="text-[0.625rem] text-muted-foreground">
              Prévia para {recipients[0].name}
            </p>
            <p className="mt-1 text-xs/relaxed">
              {renderTemplate(
                message,
                recipients[0],
                totalsOf(recipients[0]).netWorth
              )}
            </p>
          </div>
        ) : null}

        <Button
          className="w-full"
          disabled={!recipients.length || !message.trim()}
          onClick={send}
        >
          <Icon icon={CampaignIcon} />
          Enviar para {recipients.length}
        </Button>

        {state.campaigns.length ? (
          <>
            <Separator />
            <div>
              <h2 className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                Enviadas
              </h2>
              <ul className="mt-2 space-y-1">
                {state.campaigns.slice(0, 5).map((campaign) => (
                  <li
                    key={campaign.id}
                    className="flex items-baseline gap-2 text-xs"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {campaign.name}
                    </span>
                    <span className="shrink-0 text-[0.625rem] text-muted-foreground tabular-nums">
                      {campaign.recipients.length} pessoas
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}
