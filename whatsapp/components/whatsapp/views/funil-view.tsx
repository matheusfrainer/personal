"use client"

import * as React from "react"

import {
  allTags,
  crmOf,
  formatCompact,
  formatCurrency,
  relationshipMeta,
  relationshipOrder,
  stageMeta,
  stageOrder,
  suitabilityStatus,
} from "@/lib/crm"
import { avatarTints, initials } from "@/lib/data"
import { totalsOf } from "@/lib/portfolio"
import { useStore } from "@/lib/store"
import type { Chat, PipelineStage, Relationship } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Icon } from "../icon"
import {
  CampaignIcon,
  ClientsIcon,
  MoreIcon,
  PipelineIcon,
  SearchIcon,
  TagIcon,
} from "../icons"
import { WorkspaceShell } from "./workspace-shell"

/** Contacts that are actually part of the book — groups and archives aren't. */
function book(chats: Chat[]): Chat[] {
  return chats.filter((c) => !c.isGroup && !c.archived)
}

function KanbanCard({ chat }: { chat: Chat }) {
  const { dispatch } = useStore()
  const crm = crmOf(chat)
  const totals = totalsOf(chat)

  function moveTo(stage: PipelineStage) {
    dispatch({
      type: "SET_CRM",
      chatId: chat.id,
      patch: { stage },
      event: { type: "stage", label: `Etapa: ${stageMeta[stage].label}` },
    })
  }

  return (
    <article
      // Native HTML5 drag as a shortcut; the menu below is the accessible
      // path and the one every keyboard user gets.
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", chat.id)}
      className="rounded-lg border border-border bg-background p-2.5"
    >
      <div className="flex items-start gap-2">
        <Avatar size="sm">
          <AvatarFallback
            className={cn("text-[0.625rem]", avatarTints[chat.tint])}
          >
            {initials(chat.name)}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "SET_VIEW", view: "chats" })
            dispatch({ type: "SELECT_CHAT", chatId: chat.id })
          }}
          className="min-w-0 flex-1 text-left outline-none focus-visible:underline"
        >
          <span className="block truncate text-xs font-medium">
            {chat.name}
          </span>
          <span className="block truncate text-[0.625rem] text-muted-foreground tabular-nums">
            {totals.netWorth > 0
              ? formatCompact(totals.netWorth)
              : "sem carteira"}
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Mover ${chat.name}`}
            >
              <Icon icon={MoreIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Mover para</DropdownMenuLabel>
            {stageOrder.map((stage) => (
              <DropdownMenuItem
                key={stage}
                disabled={stage === crm.stage}
                onSelect={() => moveTo(stage)}
              >
                {stageMeta[stage].label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                dispatch({
                  type: "SET_CRM",
                  chatId: chat.id,
                  patch: {
                    relationship: "cliente",
                    clientSince:
                      crm.clientSince ?? new Date().toISOString().slice(0, 10),
                  },
                  event: { type: "stage", label: "Virou cliente" },
                })
              }
            >
              Marcar como cliente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {totals.pipe > 0 ? (
        <p className="mt-1.5 text-[0.625rem] text-muted-foreground tabular-nums">
          {formatCompact(totals.pipe)} fora da casa
        </p>
      ) : null}
    </article>
  )
}

function Kanban({ chats }: { chats: Chat[] }) {
  const { dispatch } = useStore()
  const leads = chats.filter((c) => crmOf(c).relationship === "lead")

  return (
    <div className="flex h-full gap-3 overflow-x-auto p-4">
      {stageOrder.map((stage) => {
        const column = leads.filter((c) => crmOf(c).stage === stage)
        const pipe = column.reduce((n, c) => n + totalsOf(c).pipe, 0)
        return (
          <section
            key={stage}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const chatId = e.dataTransfer.getData("text/plain")
              if (!chatId) return
              dispatch({
                type: "SET_CRM",
                chatId,
                patch: { stage },
                event: {
                  type: "stage",
                  label: `Etapa: ${stageMeta[stage].label}`,
                },
              })
            }}
            className="flex w-60 shrink-0 flex-col rounded-lg bg-muted/40"
          >
            <header className="flex items-baseline gap-2 px-3 py-2.5">
              <h2 className="text-xs font-medium">{stageMeta[stage].label}</h2>
              <span className="text-[0.625rem] text-muted-foreground tabular-nums">
                {column.length}
              </span>
              <span className="flex-1" />
              {pipe > 0 ? (
                <span className="text-[0.625rem] text-muted-foreground tabular-nums">
                  {formatCompact(pipe)}
                </span>
              ) : null}
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
              {column.map((chat) => (
                <KanbanCard key={chat.id} chat={chat} />
              ))}
              {column.length === 0 ? (
                <p className="px-1 py-2 text-[0.625rem] text-muted-foreground">
                  Vazio
                </p>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}

type SortKey = "name" | "netWorth" | "pipe" | "stage"

/**
 * Acts on the current selection. Every action writes a CrmEvent per contact,
 * so a bulk change is as auditable in each history as a manual one.
 */
function BulkBar({
  picked,
  chats,
  onDone,
}: {
  picked: string[]
  chats: Chat[]
  onDone: () => void
}) {
  const { state, dispatch } = useStore()
  const tags = allTags(state.chats)

  function applyTag(tag: string) {
    for (const id of picked) {
      const chat = chats.find((c) => c.id === id)
      if (!chat) continue
      const crm = crmOf(chat)
      if (crm.tags.includes(tag)) continue
      dispatch({
        type: "SET_CRM",
        chatId: id,
        patch: { tags: [...crm.tags, tag] },
        event: { type: "profile", label: `Tag aplicada em lote · ${tag}` },
      })
    }
    toast(`Tag "${tag}" aplicada a ${picked.length} contatos`)
    onDone()
  }

  function moveStage(stage: PipelineStage) {
    for (const id of picked) {
      dispatch({
        type: "SET_CRM",
        chatId: id,
        patch: { stage },
        event: { type: "stage", label: `Etapa: ${stageMeta[stage].label}` },
      })
    }
    toast(`${picked.length} contatos movidos para ${stageMeta[stage].label}`)
    onDone()
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <span className="text-xs font-medium tabular-nums">
        {picked.length} selecionado{picked.length > 1 ? "s" : ""}
      </span>

      {/* These fire commands instead of holding a value, so they are menus.
          The filters above are Selects for the opposite reason. */}
      {tags.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Icon icon={TagIcon} />
              Aplicar tag
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {tags.map((tag) => (
              <DropdownMenuItem key={tag} onSelect={() => applyTag(tag)}>
                {tag}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Icon icon={PipelineIcon} />
            Mover etapa
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {stageOrder.map((stage) => (
            <DropdownMenuItem key={stage} onSelect={() => moveStage(stage)}>
              {stageMeta[stage].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => {
          dispatch({ type: "SET_AUDIENCE", chatIds: picked })
          dispatch({ type: "SET_VIEW", view: "automacoes" })
          onDone()
        }}
      >
        <Icon icon={CampaignIcon} />
        Criar campanha
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs"
        onClick={onDone}
      >
        Limpar
      </Button>
    </div>
  )
}

function ClientTable({ chats }: { chats: Chat[] }) {
  const { dispatch } = useStore()
  const now = React.useMemo(() => new Date(), [])
  const [query, setQuery] = React.useState("")
  const [rel, setRel] = React.useState<Relationship | "todos">("todos")
  const [expiring, setExpiring] = React.useState(false)
  const [sort, setSort] = React.useState<SortKey>("netWorth")
  const [picked, setPicked] = React.useState<string[]>([])

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return chats
      .filter((chat) => {
        const crm = crmOf(chat)
        if (rel !== "todos" && crm.relationship !== rel) return false
        if (expiring) {
          const s = suitabilityStatus(crm.profile, now)
          if (!s || s.daysLeft > 30) return false
        }
        if (!q) return true
        return (
          chat.name.toLowerCase().includes(q) ||
          crm.tags.some((t) => t.toLowerCase().includes(q)) ||
          (crm.company ?? "").toLowerCase().includes(q)
        )
      })
      .map((chat) => ({ chat, totals: totalsOf(chat), crm: crmOf(chat) }))
      .sort((a, b) => {
        if (sort === "name")
          return a.chat.name.localeCompare(b.chat.name, "pt-BR")
        if (sort === "stage")
          return stageMeta[a.crm.stage].step - stageMeta[b.crm.stage].step
        if (sort === "pipe") return b.totals.pipe - a.totals.pipe
        return b.totals.netWorth - a.totals.netWorth
      })
  }, [chats, query, rel, expiring, sort, now])

  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Icon
            icon={SearchIcon}
            className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, empresa ou tag"
            aria-label="Buscar clientes"
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Select, not a dropdown menu: these pick a value, so they need
            combobox semantics and its keyboard model, not a menu's. */}
        <Select
          value={rel}
          onValueChange={(value) => setRel(value as Relationship | "todos")}
        >
          <SelectTrigger size="sm" aria-label="Filtrar por vínculo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os vínculos</SelectItem>
            {relationshipOrder.map((value) => (
              <SelectItem key={value} value={value}>
                {relationshipMeta[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger size="sm" aria-label="Ordenar por">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="netWorth">Patrimônio</SelectItem>
            <SelectItem value="pipe">Pipe</SelectItem>
            <SelectItem value="stage">Etapa</SelectItem>
            <SelectItem value="name">Nome</SelectItem>
          </SelectContent>
        </Select>

        <Label className="flex items-center gap-1.5 text-xs font-normal">
          <Checkbox
            checked={expiring}
            onCheckedChange={(v) => setExpiring(v === true)}
          />
          Suitability vencendo
        </Label>

        <span className="text-[0.6875rem] text-muted-foreground tabular-nums">
          {rows.length} de {chats.length}
        </span>
      </div>

      {picked.length ? (
        <BulkBar picked={picked} chats={chats} onDone={() => setPicked([])} />
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-9">
                <Checkbox
                  aria-label="Selecionar todos os visíveis"
                  checked={
                    rows.length > 0 && picked.length === rows.length
                      ? true
                      : picked.length > 0
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(value) =>
                    setPicked(value === true ? rows.map((r) => r.chat.id) : [])
                  }
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Vínculo</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="text-right">Patrimônio</TableHead>
              <TableHead className="text-right">Pipe</TableHead>
              <TableHead>Suitability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ chat, totals, crm }) => {
              const s = suitabilityStatus(crm.profile, now)
              const checked = picked.includes(chat.id)
              return (
                <TableRow
                  key={chat.id}
                  data-state={checked ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`Selecionar ${chat.name}`}
                      checked={checked}
                      onCheckedChange={(value) =>
                        setPicked((current) =>
                          value === true
                            ? [...current, chat.id]
                            : current.filter((id) => id !== chat.id)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: "SET_VIEW", view: "chats" })
                        dispatch({ type: "SELECT_CHAT", chatId: chat.id })
                      }}
                      className="outline-none hover:underline focus-visible:underline"
                    >
                      {chat.name}
                    </button>
                    {crm.company ? (
                      <span className="block text-[0.625rem] text-muted-foreground">
                        {crm.company}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {relationshipMeta[crm.relationship].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {stageMeta[crm.stage].label}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {totals.netWorth > 0
                      ? formatCurrency(totals.netWorth)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {totals.pipe > 0 ? formatCurrency(totals.pipe) : "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      s && s.daysLeft <= 30
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {s
                      ? s.daysLeft < 0
                        ? "vencida"
                        : `${s.daysLeft} dias`
                      : "—"}
                  </TableCell>
                </TableRow>
              )
            })}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-muted-foreground"
                >
                  Nenhum contato com esses filtros.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function FunilView() {
  const { state } = useStore()
  const chats = book(state.chats)
  const pipe = chats.reduce((n, c) => n + totalsOf(c).pipe, 0)

  return (
    <WorkspaceShell
      title="Funil"
      description={`${formatCurrency(pipe)} em pipe · ${chats.length} contatos`}
    >
      <Tabs defaultValue="kanban" className="h-full gap-0">
        <div className="border-b border-border px-4 py-2">
          <TabsList>
            <TabsTrigger value="kanban">
              <Icon icon={PipelineIcon} />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="clientes">
              <Icon icon={ClientsIcon} />
              Clientes
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="kanban" className="min-h-0">
          <Kanban chats={chats} />
        </TabsContent>
        <TabsContent value="clientes" className="min-h-0">
          <ClientTable chats={chats} />
        </TabsContent>
      </Tabs>
    </WorkspaceShell>
  )
}
