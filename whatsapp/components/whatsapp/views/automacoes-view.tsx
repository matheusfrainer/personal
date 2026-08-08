"use client"

import * as React from "react"
import { toast } from "sonner"

import { isAutomationOn, triggerLabels } from "@/lib/crm"
import { nextId } from "@/lib/id"
import { useStore } from "@/lib/store"
import type { AutomationRule } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AutomationDialog } from "../automation-dialog"
import { Icon } from "../icon"
import {
  AutomationIcon,
  CampaignIcon,
  DeleteIcon,
  DuplicateIcon,
  EditIcon,
  MoreIcon,
  PlusIcon,
} from "../icons"
import { CampanhasView } from "./campanhas-view"
import { WorkspaceShell } from "./workspace-shell"

function RuleRow({ rule }: { rule: AutomationRule }) {
  const { state, dispatch } = useStore()
  const [open, setOpen] = React.useState(false)

  const book = state.chats.filter((c) => !c.isGroup && !c.archived)
  const on = book.filter((c) => isAutomationOn(c, rule)).length

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Icon
        icon={AutomationIcon}
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm">{rule.name}</p>
        <p className="text-xs text-muted-foreground">{rule.description}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{triggerLabels[rule.trigger]}</Badge>
          <span className="text-[0.625rem] text-muted-foreground tabular-nums">
            envia {rule.sendAt}
          </span>
          <span className="text-[0.625rem] text-muted-foreground tabular-nums">
            · ligada em {on}/{book.length}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="xs"
        onClick={() => {
          for (const chat of book) {
            dispatch({
              type: "TOGGLE_AUTOMATION",
              chatId: chat.id,
              automationId: rule.id,
              value: on < book.length,
            })
          }
          toast(
            on < book.length
              ? "Aplicada a todos os contatos"
              : "Desligada em todos os contatos"
          )
        }}
      >
        {on < book.length ? "Aplicar a todos" : "Desligar em todos"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Opções de ${rule.name}`}
          >
            <Icon icon={MoreIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Icon icon={EditIcon} />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              dispatch({
                type: "SAVE_AUTOMATION",
                rule: {
                  ...rule,
                  id: nextId(),
                  name: `${rule.name} (cópia)`,
                  enabled: false,
                },
              })
            }
          >
            <Icon icon={DuplicateIcon} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() =>
              dispatch({ type: "DELETE_AUTOMATION", ruleId: rule.id })
            }
          >
            <Icon icon={DeleteIcon} />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AutomationDialog
        rule={rule}
        open={open}
        onOpenChange={setOpen}
        onSave={(next) => dispatch({ type: "SAVE_AUTOMATION", rule: next })}
      />
    </li>
  )
}

function Library() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = React.useState(false)

  // Rules that live on a single contact, so they're findable from here too.
  const locals = state.chats.flatMap((chat) =>
    (chat.automations ?? []).map((rule) => ({ chat, rule }))
  )

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3">
        <p className="flex-1 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
          Biblioteca geral · {state.automations.length}
        </p>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Icon icon={PlusIcon} />
          Nova automação
        </Button>
      </div>

      <Separator />

      {state.automations.length ? (
        <ul className="divide-y divide-border">
          {state.automations.map((rule) => (
            <RuleRow key={rule.id} rule={rule} />
          ))}
        </ul>
      ) : (
        <Empty className="px-6 py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={AutomationIcon} />
            </EmptyMedia>
            <EmptyTitle>Biblioteca vazia</EmptyTitle>
            <EmptyDescription>
              Regras criadas aqui ficam disponíveis na aba Automações de todas
              as pessoas, com um interruptor por contato.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {locals.length ? (
        <>
          <Separator />
          <div className="px-4 py-3">
            <p className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
              Só de uma pessoa
            </p>
            <ul className="mt-2 space-y-1.5">
              {locals.map(({ chat, rule }) => (
                <li key={rule.id} className="flex items-center gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate">
                    {rule.name}
                    <span className="text-muted-foreground">
                      {" "}
                      · {chat.name}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      dispatch({
                        type: "PUBLISH_AUTOMATION",
                        chatId: chat.id,
                        ruleId: rule.id,
                        applyAll: false,
                      })
                      toast("Automação promovida à biblioteca")
                    }}
                  >
                    Tornar geral
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      <AutomationDialog
        rule={null}
        open={open}
        onOpenChange={setOpen}
        onSave={(rule) => dispatch({ type: "SAVE_AUTOMATION", rule })}
      />
    </div>
  )
}

export function AutomacoesView() {
  const { state } = useStore()

  return (
    <WorkspaceShell
      title="Automações"
      description={`${state.automations.length} na biblioteca · ${state.campaigns.length} campanhas`}
    >
      <Tabs defaultValue="regras" className="h-full gap-0">
        <div className="border-b border-border px-4 py-2">
          <TabsList>
            <TabsTrigger value="regras">
              <Icon icon={AutomationIcon} />
              Regras
            </TabsTrigger>
            <TabsTrigger value="campanhas">
              <Icon icon={CampaignIcon} />
              Campanhas
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="regras">
          <Library />
        </TabsContent>
        <TabsContent value="campanhas">
          <CampanhasView />
        </TabsContent>
      </Tabs>
    </WorkspaceShell>
  )
}
